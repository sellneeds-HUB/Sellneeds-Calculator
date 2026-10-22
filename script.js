/* SELLNEEDS · Cálculo independente da tela + interface, sem dependências. */
(function (root) {
  'use strict';
  const C = root.SELLNEEDS_CONFIG || (typeof require === 'function' ? require('./config.js') : null);
  const EPS = 1e-9;
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const upper = band => band.max === null ? Infinity : band.max;
  const inBand = (p, b) => p >= b.min && p < upper(b);
  const money = n => new Intl.NumberFormat(C.locale, { style: 'currency', currency: C.currency }).format(Math.abs(n) < 0.0000001 ? 0 : n);
  const decimal = (n, digits = 2) => new Intl.NumberFormat(C.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  const percent = n => decimal(n * 100) + '%';

  // Um único separador é decimal; com os dois, o último é o decimal.
  // Exemplos aceitos: 12,50 | 12.50 | 1.234,56 | 1,234.56.
  function parseNumber(value) {
    if (finite(value)) return value;
    let s = String(value ?? '').trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
    if (!s) return null;
    if (s.includes('.') && s.includes(',')) {
      const brazilian = s.lastIndexOf(',') > s.lastIndexOf('.');
      const pattern = brazilian ? /^-?\d{1,3}(\.\d{3})+,\d+$/ : /^-?\d{1,3}(,\d{3})+\.\d+$/;
      if (!pattern.test(s)) return NaN;
      s = brazilian ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else {
      s = s.replace(',', '.');
    }
    if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return NaN;
    const n = Number(s);
    return finite(n) ? n : NaN;
  }

  function validateConfig() {
    if (!C) throw Error('Não foi possível carregar config.js. Confira se o arquivo está na mesma pasta.');
    const ratio = n => finite(n) && n >= 0 && n <= 1;
    const positive = n => finite(n) && n > 0;
    const nonnegative = n => finite(n) && n >= 0;
    if (!ratio(C.marginColors.low) || !ratio(C.marginColors.high) || C.marginColors.low > C.marginColors.high) throw Error('Revise marginColors no config.js.');
    if (!positive(C.maxInput)) throw Error('maxInput deve ser positivo.');
    const ml = C.mercadoLivre;
    if (!ratio(ml.commission) || !positive(ml.mandatoryFreeShippingFrom) || !positive(ml.cheapShippingCap.below) || !ratio(ml.cheapShippingCap.rate)) throw Error('Revise comissão e limites do Mercado Livre no config.js.');
    function checkBands(bands) {
      if (!Array.isArray(bands) || !bands.length || bands[0].min !== 0) throw Error('As faixas devem começar em zero.');
      bands.forEach((b, i) => {
        if (!nonnegative(b.min) || !(upper(b) > b.min) || (i < bands.length - 1 && b.max !== bands[i + 1].min) || (i === bands.length - 1 && b.max !== null)) throw Error('As faixas devem ser contínuas e terminar com max: null.');
      });
    }
    checkBands(ml.priceBands);
    [C.shopee, C.tiktok].forEach(m => {
      checkBands(m.bands);
      m.bands.forEach(b => { if (!ratio(b.commission) || !nonnegative(b.fixed)) throw Error('Comissão ou taxa fixa inválida.'); });
    });
    C.tiktok.bands.forEach(b => { if (!ratio(b.shippingRate) || !nonnegative(b.shippingFixed)) throw Error('Frete TikTok inválido.'); });
    if (!Number.isInteger(ml.fastShippingColumn) || ml.fastShippingColumn < 0 || ml.fastShippingColumn >= ml.priceBands.length) throw Error('Coluna de frete rápido inválida.');
    if (!ml.shippingTable.length) throw Error('A tabela de frete está vazia.');
    ml.shippingTable.forEach((row, i) => {
      if (row.length !== ml.priceBands.length + 1 || !positive(row[0]) || row.slice(1).some(n => !nonnegative(n)) || (i && row[0] <= ml.shippingTable[i - 1][0])) throw Error('Revise os pesos e colunas da matriz de frete.');
    });
  }

  function weights(data) {
    // A pedido da Sellneeds, o frete desta simulação usa apenas o peso informado.
    if (!finite(data.weight) || data.weight <= 0 || data.weight > C.maxInput) return { ok: false };
    return { ok: true, charged: data.weight };
  }

  function context(market, data) {
    if (!finite(data.cost) || data.cost < 0 || data.cost > C.maxInput) return { error: 'Informe um custo válido, maior ou igual a zero.' };
    if (market === 'tiktok' && (!finite(data.affiliate) || data.affiliate < 0 || data.affiliate > 100)) return { error: 'Informe uma comissão de afiliado entre 0% e 100%.' };
    if (market !== 'mercadoLivre') return {};
    const w = weights(data);
    if (data.manualMode) {
      if (!finite(data.manualShipping) || data.manualShipping < 0 || data.manualShipping > C.maxInput) return { error: 'Informe um frete manual válido, maior ou igual a zero.' };
      return { weights: w };
    }
    if (!w.ok) return { error: 'Informe um peso do pacote maior que zero.', weights: w };
    const row = C.mercadoLivre.shippingTable.find(r => w.charged <= r[0] + EPS);
    if (!row) return { error: 'Peso informado acima de ' + decimal(C.mercadoLivre.shippingTable.at(-1)[0], 0) + ' kg. Ative “Informar frete manualmente” para continuar.', weights: w };
    return { weights: w, row };
  }

  // Representa cada trecho como custo = percentual × preço + valor fixo.
  function charges(market, price, data, ctx) {
    if (market === 'mercadoLivre') {
      const m = C.mercadoLivre;
      if (data.manualMode) return { commission: m.commission, fixed: 0, shippingRate: 0, shippingFixed: data.manualShipping, affiliate: 0, manual: true, bandLabel: 'Frete manual', capped: false };
      const fast = price < m.mandatoryFreeShippingFrom && data.fastShipping;
      const index = fast ? m.fastShippingColumn : m.priceBands.findIndex(b => inBand(price, b));
      const tableShipping = ctx.row[index + 1];
      const capped = price < m.cheapShippingCap.below && tableShipping > price * m.cheapShippingCap.rate + EPS;
      return { commission: m.commission, fixed: 0, shippingRate: capped ? m.cheapShippingCap.rate : 0, shippingFixed: capped ? 0 : tableShipping, affiliate: 0, manual: false, capped, tableShipping, bandLabel: fast ? 'Frete grátis rápido · ' + m.priceBands[index].label : m.priceBands[index].label };
    }
    const b = C[market].bands.find(item => inBand(price, item));
    return { commission: b.commission, fixed: b.fixed, shippingRate: b.shippingRate || 0, shippingFixed: b.shippingFixed || 0, affiliate: market === 'tiktok' ? data.affiliate / 100 : 0, bandLabel: money(b.min) + (b.max === null ? ' ou mais' : ' a ' + money(b.max - 0.01)) };
  }

  function calculate(market, data) {
    if (!['mercadoLivre', 'shopee', 'tiktok'].includes(market)) return { ok: false, error: 'Marketplace inválido.' };
    const ctx = context(market, data);
    if (ctx.error) return { ok: false, error: ctx.error, weights: ctx.weights };
    if (!finite(data.price) || data.price <= 0 || data.price > C.maxInput) return { ok: false, error: 'Informe um preço de venda maior que zero.', weights: ctx.weights };
    const r = charges(market, data.price, data, ctx);
    const commission = data.price * r.commission;
    const shipping = data.price * r.shippingRate + r.shippingFixed;
    const affiliate = data.price * r.affiliate;
    const total = data.cost + commission + r.fixed + shipping + affiliate;
    const profit = data.price - total;
    const margin = profit / data.price;
    const tone = margin < C.marginColors.low - EPS ? 'bad' : margin <= C.marginColors.high + EPS ? 'warn' : 'good';
    return { ok: true, price: data.price, cost: data.cost, commission, fixed: r.fixed, shipping, affiliate, total, profit, margin, tone, rules: r, weights: ctx.weights };
  }

  // Não usa busca binária global: a margem pode cair ao mudar a faixa.
  // Particiona em todos os limites de preço e nos pontos do teto de frete.
  // Resolve cada trecho, arredonda para cima ao centavo e confirma no cálculo real.
  function minimumPrice(market, data, targetPercent) {
    if (!finite(targetPercent) || targetPercent < 0 || targetPercent > 100) return { ok: false, error: 'Informe uma meta de 0% a 100%.' };
    const ctx = context(market, data);
    if (ctx.error) return { ok: false, error: ctx.error };
    const target = targetPercent / 100;
    const points = new Set([0]);
    if (market === 'mercadoLivre') {
      if (!data.manualMode) {
        const m = C.mercadoLivre;
        m.priceBands.forEach(b => points.add(b.min));
        points.add(m.mandatoryFreeShippingFrom);
        points.add(m.cheapShippingCap.below);
        if (m.cheapShippingCap.rate > 0) ctx.row.slice(1).forEach(v => points.add(v / m.cheapShippingCap.rate));
      }
    } else C[market].bands.forEach(b => points.add(b.min));
    const sorted = [...points].sort((a, b) => a - b);
    let best = null;
    for (let i = 0; i < sorted.length; i++) {
      const low = sorted[i], high = sorted[i + 1] ?? Infinity;
      const probe = finite(high) ? (low + high) / 2 : low + 1;
      const r = charges(market, probe, data, ctx);
      const availableRate = 1 - r.commission - r.shippingRate - r.affiliate - target;
      const fixedCosts = data.cost + r.fixed + r.shippingFixed;
      if (availableRate < -EPS || (Math.abs(availableRate) <= EPS && fixedCosts > EPS)) continue;
      const raw = availableRate > EPS ? fixedCosts / availableRate : 0;
      let cents = Math.max(1, Math.ceil(Math.max(low, raw) * 100 - EPS));
      let candidate = cents / 100;
      // Um passo adicional trata exclusivamente arredondamento de ponto flutuante.
      for (let adjustment = 0; adjustment < 2; adjustment++, candidate = ++cents / 100) {
        if (candidate < low || candidate >= high || candidate > C.maxInput) break;
        const quote = calculate(market, { ...data, price: candidate });
        if (quote.ok && quote.margin + EPS >= target) {
          if (!best || candidate < best.price) best = { ok: true, price: candidate, quote };
          break;
        }
      }
    }
    return best || { ok: false, error: 'Meta inviável com esses custos e taxas dentro do limite de ' + money(C.maxInput) + '.' };
  }

  const api = { parseNumber, weights, calculate, minimumPrice, validateConfig };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SellneedsCalculator = api;
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  try { validateConfig(); } catch (e) {
    $('fatal-error').hidden = false;
    $('fatal-error').textContent = 'Configuração inválida: ' + e.message;
    $('calculator').hidden = true;
    return;
  }

  let market = 'mercadoLivre';
  let fastShipping = C.defaults.fastShipping;
  let latest = null;
  let minimum = null;
  let animation = 0;
  let announcement = 0;
  let displayProfit = 0;
  let displayMargin = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fields = ['price', 'cost', 'weight', 'affiliate', 'target', 'manualShipping'];
  const cashFields = ['price', 'cost', 'manualShipping'];
  fields.forEach(id => { $(id).value = cashFields.includes(id) ? decimal(C.defaults[id]) : String(C.defaults[id]).replace('.', ','); });
  $('manual-mode').checked = C.defaults.manualMode;
  $('config-version').textContent = 'Configuração: ' + C.version + '.';

  function readData() {
    const data = Object.fromEntries(fields.map(id => [id, parseNumber($(id).value)]));
    return { ...data, fastShipping, manualMode: $('manual-mode').checked };
  }
  function fieldError(id, message) {
    $(id + '-error').textContent = message;
    $(id).setAttribute('aria-invalid', message ? 'true' : 'false');
  }
  function validateFields(data) {
    fields.forEach(id => fieldError(id, ''));
    const required = ['price', 'cost'];
    if (market === 'tiktok') required.push('affiliate');
    if (market === 'mercadoLivre') required.push(...(data.manualMode ? ['manualShipping'] : ['weight']));
    required.forEach(id => {
      const n = data[id];
      const allowZero = ['cost', 'affiliate', 'manualShipping'].includes(id);
      let message = '';
      if (n === null) message = 'Preencha este campo.';
      else if (!finite(n)) message = 'Digite um número válido.';
      else if (n < 0 || (!allowZero && n === 0)) message = allowZero ? 'Use zero ou um valor positivo.' : 'Use um valor maior que zero.';
      else if (n > (id === 'affiliate' ? 100 : C.maxInput)) message = id === 'affiliate' ? 'O máximo é 100%.' : 'Valor acima do limite de entrada.';
      fieldError(id, message);
    });
    if (data.target !== null && (!finite(data.target) || data.target < 0 || data.target > 100)) fieldError('target', 'Use uma margem entre 0% e 100%.');
  }
  function setFast(value) {
    fastShipping = value;
    $('fast-no').setAttribute('aria-pressed', String(!value));
    $('fast-yes').setAttribute('aria-pressed', String(value));
  }
  function visibility(data) {
    const ml = market === 'mercadoLivre';
    $('ml-section').hidden = !ml;
    $('affiliate-section').hidden = market !== 'tiktok';
    $('manual-section').hidden = !data.manualMode;
    const below = finite(data.price) && data.price >= 0 && data.price < C.mercadoLivre.mandatoryFreeShippingFrom;
    $('fast-section').hidden = !below;
    $('fast-yes').disabled = data.manualMode;
    $('fast-no').disabled = data.manualMode;
    $('fast-help').textContent = data.manualMode ? 'O frete manual está ativo.' : 'Opcional abaixo de ' + money(C.mercadoLivre.mandatoryFreeShippingFrom) + '.';
    $('mandatory-note').hidden = below || !finite(data.price);
    $('mandatory-note').textContent = 'Frete grátis obrigatório a partir de ' + money(C.mercadoLivre.mandatoryFreeShippingFrom) + (data.manualMode ? '. Valor manual aplicado.' : '. Faixa automática aplicada.');
    $('goal-policy').textContent = !ml ? 'A meta considera a comissão e os custos de cada faixa de preço.' : data.manualMode ? 'O preço mínimo usa o mesmo frete manual em todas as faixas.' : 'Abaixo de ' + money(C.mercadoLivre.mandatoryFreeShippingFrom) + ', a meta considera frete grátis rápido: ' + (fastShipping ? 'Sim' : 'Não') + '. Acima desse valor, usa as faixas obrigatórias.';
  }
  function showWeights(data) {
    if (market !== 'mercadoLivre') return;
    $('weight-note').textContent = data.manualMode
      ? 'O frete manual substitui a tabela. O peso é opcional neste modo.'
      : 'Nesta simulação, o frete considera somente o peso informado.';
  }
  function animateNumbers(profit, margin) {
    cancelAnimationFrame(animation);
    const startProfit = displayProfit, startMargin = displayMargin;
    const start = performance.now();
    function frame(now) {
      const t = reducedMotion.matches ? 1 : Math.min(1, (now - start) / 240);
      const ease = 1 - Math.pow(1 - t, 3);
      displayProfit = startProfit + (profit - startProfit) * ease;
      displayMargin = startMargin + (margin - startMargin) * ease;
      $('profit').textContent = money(displayProfit);
      $('margin').textContent = percent(displayMargin);
      if (t < 1) animation = requestAnimationFrame(frame);
    }
    animation = requestAnimationFrame(frame);
  }
  function details(result) {
    const rows = [
      ['Custo do produto', result.cost, '--cost'],
      ['Comissão · ' + percent(result.rules.commission), result.commission, '--commission'],
      ['Taxa fixa', result.fixed, '--fixed'],
      ['Frete', result.shipping, '--shipping'],
      ['Afiliado' + (market === 'tiktok' ? ' · ' + percent(result.rules.affiliate) : ''), result.affiliate, '--affiliate'],
      ['Lucro de contribuição', result.profit, result.tone === 'good' ? '--good' : result.tone === 'warn' ? '--warn' : '--bad']
    ];
    const list = $('breakdown-list'), bar = $('composition');
    list.replaceChildren(); bar.replaceChildren();
    const base = Math.max(result.price, result.total);
    rows.forEach(([label, amount, color], i) => {
      const row = document.createElement('div'); row.className = 'breakdown-row' + (i === 5 ? ' profit-row' : '');
      const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = 'var(' + color + ')';
      const name = document.createElement('span'); name.textContent = label;
      const val = document.createElement('span'); val.className = 'amount'; val.textContent = money(amount);
      const share = document.createElement('span'); share.className = 'share'; share.textContent = decimal(amount / result.price * 100, 1) + '%';
      row.append(swatch, name, val, share); list.append(row);
      if (amount > 0) { const part = document.createElement('span'); part.style.width = amount / base * 100 + '%'; part.style.background = 'var(' + color + ')'; bar.append(part); }
    });
    $('loss-note').hidden = result.profit >= 0;
    $('loss-note').textContent = 'Os custos excedem a venda em ' + money(-result.profit) + '. A barra representa o total dos custos; os percentuais abaixo usam o preço de venda.';
    $('breakdown-base').textContent = result.profit < 0 ? 'TOTAL DOS CUSTOS' : 'PREÇO DE VENDA';
    $('rate-note').textContent = market === 'mercadoLivre' ? result.rules.bandLabel + ' · ' + (result.rules.manual ? 'O valor informado substitui a tabela.' : 'Faixa de peso até ' + decimal(context(market, readData()).row[0], 1) + ' kg.') : 'Faixa vigente: ' + result.rules.bandLabel + '. Taxas sobre o preço de venda.';
  }
  function renderMinimum(data) {
    minimum = null;
    $('minimum-price').textContent = '—';
    $('minimum-warning').hidden = true;
    if (data.target === null) { $('minimum-description').textContent = 'Informe uma margem desejada para descobrir o preço mínimo.'; return; }
    minimum = minimumPrice(market, data, data.target);
    if (!minimum.ok) { $('minimum-description').textContent = minimum.error; return; }
    $('minimum-price').textContent = money(minimum.price);
    $('minimum-description').textContent = 'Para uma meta de ' + decimal(data.target) + '% · margem calculada: ' + percent(minimum.quote.margin) + '.';
    $('minimum-warning').hidden = false;
    $('minimum-warning').textContent = 'Primeiro preço viável, em centavos. Ao aumentar o preço, recalcule: uma nova faixa de taxas pode reduzir a margem.';
  }
  function update() {
    const data = readData();
    validateFields(data); visibility(data); showWeights(data);
    const result = calculate(market, data);
    latest = result.ok ? result : null;
    $('copy-button').disabled = !result.ok;
    $('copy-status').textContent = '';
    $('result-card').dataset.tone = result.ok ? result.tone : 'empty';
    $('result-error').hidden = result.ok;
    $('shipping-notice').hidden = true;
    if (result.ok) {
      animateNumbers(result.profit, result.margin);
      $('result-price').textContent = money(result.price);
      $('total-cost').textContent = money(result.total);
      $('result-status').textContent = result.profit < -EPS ? 'Prejuízo' : result.tone === 'bad' ? 'Margem baixa' : result.tone === 'warn' ? 'Atenção à margem' : 'Margem saudável';
      $('result-message').textContent = result.profit < -EPS ? 'Esta venda não cobre os custos informados. Reveja o preço e as despesas.' : 'A cada ' + money(100) + ' vendidos, sobram ' + money(result.margin * 100) + ' antes das demais despesas.';
      if (result.rules.capped) { $('shipping-notice').hidden = false; $('shipping-notice').className = 'notice'; $('shipping-notice').textContent = 'Frete limitado a ' + decimal(C.mercadoLivre.cheapShippingCap.rate * 100, 0) + '% do preço do produto. Tabela: ' + money(result.rules.tableShipping) + ' → aplicado: ' + money(result.shipping) + '.'; }
      details(result);
    } else {
      cancelAnimationFrame(animation); displayProfit = 0; displayMargin = 0;
      ['profit', 'margin', 'result-price', 'total-cost'].forEach(id => { $(id).textContent = '—'; });
      $('result-status').textContent = 'Complete os dados';
      $('result-message').textContent = 'O resultado aparece assim que os campos necessários estiverem válidos.';
      $('result-error').textContent = result.error;
      $('breakdown-list').replaceChildren(); $('composition').replaceChildren();
      $('rate-note').textContent = 'Preencha os campos para ver o detalhamento.'; $('loss-note').hidden = true;
      if (market === 'mercadoLivre' && result.weights?.ok && !data.manualMode && result.weights.charged > C.mercadoLivre.shippingTable.at(-1)[0] + EPS) {
        $('shipping-notice').hidden = false; $('shipping-notice').className = 'notice danger'; $('shipping-notice').textContent = result.error;
      }
    }
    renderMinimum(data);
    clearTimeout(announcement);
    announcement = setTimeout(() => { $('live-summary').textContent = result.ok ? C[market].name + ': lucro ' + money(result.profit) + ', margem ' + percent(result.margin) + '.' : result.error; }, 500);
  }

  function switchMarket(next) {
    market = next;
    document.querySelectorAll('[data-market][role="tab"]').forEach(button => {
      const active = button.dataset.market === market;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
    });
    $('calculator').dataset.market = market;
    $('calculator').setAttribute('aria-labelledby', 'tab-' + market);
    $('calculator').classList.remove('tab-enter');
    void $('calculator').offsetWidth;
    $('calculator').classList.add('tab-enter');
    update();
  }
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchMarket(tab.dataset.market));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); tabs[next].focus(); switchMarket(tabs[next].dataset.market); }
    });
  });
  fields.forEach(id => {
    $(id).addEventListener('input', update);
    $(id).addEventListener('blur', () => {
      const n = parseNumber($(id).value);
      if (cashFields.includes(id) && finite(n) && n >= 0 && n <= C.maxInput) { $(id).value = decimal(n); update(); }
    });
  });
  $('calculator-form').addEventListener('submit', e => e.preventDefault());
  $('fast-no').addEventListener('click', () => { setFast(false); update(); });
  $('fast-yes').addEventListener('click', () => { setFast(true); update(); });
  $('manual-mode').addEventListener('change', update);
  setFast(fastShipping);

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $('theme-icon').textContent = theme === 'dark' ? '☀' : '☾';
    $('theme-toggle').setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    $('theme-toggle').setAttribute('aria-pressed', String(theme === 'dark'));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    try { localStorage.setItem('sellneeds-theme', theme); } catch (_) { /* Continua funcionando com armazenamento bloqueado. */ }
  }
  let theme;
  try { theme = localStorage.getItem('sellneeds-theme'); } catch (_) { /* Sem persistência no navegador. */ }
  setTheme(theme === 'dark' || theme === 'light' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  $('theme-toggle').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  $('copy-button').addEventListener('click', async () => {
    if (!latest) return;
    const r = latest, data = readData();
    const lines = [
      'Sellneeds · ' + C[market].name,
      'Preço de venda: ' + money(r.price), 'Custo do produto: ' + money(r.cost),
      'Comissão: ' + money(r.commission) + ' (' + percent(r.rules.commission) + ')',
      'Taxa fixa: ' + money(r.fixed), 'Frete: ' + money(r.shipping),
      'Afiliado: ' + money(r.affiliate) + ' (' + percent(r.rules.affiliate) + ')',
      'Custo total: ' + money(r.total), 'Lucro de contribuição: ' + money(r.profit), 'Margem: ' + percent(r.margin)
    ];
    if (market === 'mercadoLivre') {
      lines.push('Frete: ' + (data.manualMode ? 'manual' : r.rules.bandLabel));
      if (r.weights?.ok) lines.push('Peso informado: ' + decimal(r.weights.charged, 3) + ' kg');
      if (r.rules.capped) lines.push('Frete limitado a ' + percent(C.mercadoLivre.cheapShippingCap.rate) + ' do preço.');
    }
    if (minimum?.ok) lines.push('Preço mínimo para ' + decimal(data.target) + '%: ' + money(minimum.price) + '. Recalcule se alterar o preço.');
    lines.push('Não inclui impostos, anúncios, embalagem ou despesas operacionais.', 'Regras: ' + C.version);
    const text = lines.join('\n');
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw Error('Usar alternativa local');
      await navigator.clipboard.writeText(text);
      $('copy-status').textContent = 'Resultado copiado! Pronto para colar.';
    } catch (_) {
      // Alternativa para abertura local e navegadores sem Clipboard API.
      const area = document.createElement('textarea'); area.value = text; area.setAttribute('aria-label', 'Resultado para copiar');
      area.style.position = 'fixed'; area.style.top = '0'; area.style.left = '0'; area.style.opacity = '0';
      document.body.append(area); area.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { /* Mostra alternativa selecionável. */ }
      area.remove(); $('copy-button').focus();
      if (copied) $('copy-status').textContent = 'Resultado copiado! Pronto para colar.';
      else { window.prompt('Copie o resultado abaixo:', text); $('copy-status').textContent = 'Use a janela aberta para copiar o resultado.'; }
    }
  });
  update();
})(typeof window !== 'undefined' ? window : globalThis);
