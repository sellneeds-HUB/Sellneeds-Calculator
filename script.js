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

  // A comparação admite só ruído de ponto flutuante, não uma margem menor.
  function meetsTarget(margin, target) {
    return margin >= target || Math.abs(margin - target) <= Number.EPSILON * 4 * Math.max(1, Math.abs(margin), Math.abs(target));
  }
  function resultTone(margin, targetPercent) {
    if (finite(targetPercent) && targetPercent >= 0 && targetPercent <= 100) return meetsTarget(margin, targetPercent / 100) ? 'good' : margin < C.marginColors.low - EPS ? 'bad' : 'warn';
    return margin < C.marginColors.low - EPS ? 'bad' : margin <= C.marginColors.high + EPS ? 'warn' : 'good';
  }
  function priceSegments(market, data, ctx) {
    const points = new Set([0]);
    if (market === 'mercadoLivre') {
      if (!data.manualMode) {
        const m = C.mercadoLivre;
        m.priceBands.forEach(b => points.add(b.min));
        points.add(m.mandatoryFreeShippingFrom);
        points.add(m.cheapShippingCap.below);
        // Também divide o trecho em que o frete deixa de ser 50% do preço.
        if (m.cheapShippingCap.rate > 0) ctx.row.slice(1).forEach(v => points.add(v / m.cheapShippingCap.rate));
      }
    } else C[market].bands.forEach(b => points.add(b.min));
    const sorted = [...points].sort((a, b) => a - b);
    return sorted.map((low, i) => {
      const high = sorted[i + 1] ?? Infinity;
      const probe = finite(high) ? (low + high) / 2 : low + 1;
      return { low, high, rules: charges(market, probe, data, ctx) };
    });
  }
  // Maior margem por faixa. No último intervalo, informa o limite teórico
  // quando o preço cresce: custos fixos impedem atingir esse limite exato.
  function maximumMargin(market, data) {
    const ctx = context(market, data);
    if (ctx.error) return { ok: false, error: ctx.error };
    let maximum = -Infinity, isLimit = false;
    for (const { low, high, rules: r } of priceSegments(market, data, ctx)) {
      const rate = 1 - r.commission - r.shippingRate - r.affiliate;
      const fixedCosts = data.cost + r.fixed + r.shippingFixed;
      if (!finite(high)) {
        if (rate > maximum) { maximum = rate; isLimit = fixedCosts > 0; }
      } else {
        const lastCent = (Math.ceil(high * 100 - EPS) - 1) / 100;
        if (lastCent < Math.max(low, 0.01)) continue;
        const value = rate - fixedCosts / lastCent;
        if (value > maximum) { maximum = value; isLimit = false; }
      }
    }
    return { ok: finite(maximum), margin: finite(maximum) ? maximum : null, isLimit };
  }
  // Resolve cada faixa separadamente; a margem pode cair ao mudar de faixa.
  // O cálculo real valida o preço arredondado para cima ao centavo.
  function minimumPrice(market, data, targetPercent) {
    if (!['mercadoLivre', 'shopee', 'tiktok'].includes(market)) return { ok: false, error: 'Marketplace inválido.' };
    if (!finite(targetPercent) || targetPercent < 0 || targetPercent > 100) return { ok: false, error: 'Informe uma meta de 0% a 100%.' };
    const ctx = context(market, data);
    if (ctx.error) return { ok: false, error: ctx.error };
    const target = targetPercent / 100;
    let best = null;
    for (const { low, high, rules: r } of priceSegments(market, data, ctx)) {
      const denominator = 1 - r.commission - r.shippingRate - r.affiliate - target;
      if (denominator <= 0) continue;
      const raw = (data.cost + r.fixed + r.shippingFixed) / denominator;
      let cents = Math.max(1, Math.ceil(Math.max(low, raw) * 100 - EPS));
      for (let step = 0; step < 3; step++, cents++) {
        const candidate = cents / 100;
        if (candidate < low || candidate >= high || candidate > C.maxInput) break;
        const quote = calculate(market, { ...data, price: candidate });
        if (quote.ok && meetsTarget(quote.margin, target)) {
          if (!best || candidate < best.price) best = { ok: true, price: candidate, quote };
          break;
        }
      }
    }
    if (best) return best;
    const ceiling = maximumMargin(market, data);
    return { ok: false, error: 'Meta inviável com essas taxas', maxMargin: ceiling.margin, maxIsLimit: ceiling.isLimit, inputLimit: C.maxInput };
  }

  // Persiste só metas válidas; apagar a meta também fica salvo.
  function readTargetStorage(getStorage = () => root.localStorage) {
    const fallback = String(C.defaults.target ?? '').replace('.', ',');
    try {
      const value = getStorage().getItem(C.storage.target);
      if (value === null) return { value: fallback, available: true };
      const number = parseNumber(value);
      return { value: value === '' || (finite(number) && number >= 0 && number <= 100) ? value : fallback, available: true };
    } catch (_) { return { value: fallback, available: false }; }
  }
  function saveTargetStorage(value, getStorage = () => root.localStorage) {
    const number = parseNumber(value);
    if (number !== null && (!finite(number) || number < 0 || number > 100)) return false;
    try { getStorage().setItem(C.storage.target, number === null ? '' : String(number)); return true; } catch (_) { return false; }
  }

  const api = { parseNumber, weights, calculate, minimumPrice, maximumMargin, resultTone, meetsTarget, readTargetStorage, saveTargetStorage, validateConfig };
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
  let market = 'mercadoLivre', fastShipping = C.defaults.fastShipping;
  let latest = null, ideal = null, animation = 0, announcement = 0;
  let displayedProfit = 0, displayedMargin = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fields = ['price', 'cost', 'target', 'weight', 'affiliate', 'manualShipping'];
  const cashFields = ['price', 'cost', 'manualShipping'];
  fields.forEach(id => { $(id).value = cashFields.includes(id) ? decimal(C.defaults[id]) : String(C.defaults[id] ?? '').replace('.', ','); });
  const savedTarget = readTargetStorage();
  let storageAvailable = savedTarget.available;
  $('target').value = savedTarget.value;
  $('manual-mode').checked = C.defaults.manualMode;
  $('fast-shipping').value = String(fastShipping);
  function readData() {
    return { ...Object.fromEntries(fields.map(id => [id, parseNumber($(id).value)])), fastShipping, manualMode: $('manual-mode').checked };
  }
  function validateFields(data) {
    const errors = [];
    fields.forEach(id => { $(id + '-error').textContent = ''; $(id).setAttribute('aria-invalid', 'false'); });
    const active = ['price', 'cost', 'target'];
    if (market === 'tiktok') active.push('affiliate');
    if (market === 'mercadoLivre') active.push(data.manualMode ? 'manualShipping' : 'weight');
    const names = { price: 'Preço', cost: 'Custo', target: 'Meta', weight: 'Peso', affiliate: 'Afiliado', manualShipping: 'Frete manual' };
    active.forEach(id => {
      const n = data[id], optional = id === 'target' || id === 'price';
      const allowZero = !['price', 'weight'].includes(id);
      const maximum = ['affiliate', 'target'].includes(id) ? 100 : C.maxInput;
      let message = '';
      if (n === null && !optional) message = 'Preencha ' + names[id].toLowerCase() + '.';
      else if (n !== null && !finite(n)) message = names[id] + ': número inválido.';
      else if (n !== null && (n < 0 || (!allowZero && n === 0))) message = names[id] + (allowZero ? ': use zero ou positivo.' : ': use valor positivo.');
      else if (n !== null && n > maximum) message = names[id] + (maximum === 100 ? ': máximo de 100%.' : ': acima do limite.');
      $(id + '-error').textContent = message;
      $(id).setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message) errors.push(message);
    });
    return errors;
  }
  function visibility(data) {
    const ml = market === 'mercadoLivre';
    $('weight-section').hidden = !ml;
    $('affiliate-section').hidden = market !== 'tiktok';
    $('manual-button').hidden = !ml;
    $('manual-button').dataset.active = String(data.manualMode);
    $('manual-button').setAttribute('aria-label', data.manualMode ? 'Frete manual ativo: ' + money(data.manualShipping || 0) + '. Configurar' : 'Configurar frete manual');
    $('manual-section').hidden = !data.manualMode;
    // Sem preço, a escolha permanece disponível para o cálculo da meta.
    const below = data.price === null || (finite(data.price) && data.price >= 0 && data.price < C.mercadoLivre.mandatoryFreeShippingFrom);
    $('fast-section').hidden = !ml || !below;
    $('fast-shipping').disabled = data.manualMode;
  }
  function showNumber(id, text) {
    $(id).textContent = text;
    $(id).style.setProperty('--digits', Math.max(text.length, 4));
  }
  function animateNumbers(profit, margin) {
    cancelAnimationFrame(animation);
    const fromProfit = displayedProfit, fromMargin = displayedMargin, start = performance.now();
    function frame(now) {
      const t = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (now - start) / 180));
      const ease = 1 - (1 - t) ** 3;
      displayedProfit = fromProfit + (profit - fromProfit) * ease;
      displayedMargin = fromMargin + (margin - fromMargin) * ease;
      showNumber('profit', money(displayedProfit)); showNumber('margin', percent(displayedMargin));
      if (t < 1) animation = requestAnimationFrame(frame);
    }
    animation = requestAnimationFrame(frame);
  }
  function renderBreakdown(result, tone) {
    const rows = [
      ['Custo', result?.cost, '--cost'],
      ['Comissão' + (result ? ' · ' + decimal(result.rules.commission * 100, 0) + '%' : ''), result?.commission, '--commission'],
      ['Taxa fixa', result?.fixed, '--fixed'],
      ['Frete', result?.shipping, '--shipping'],
      ['Afiliado' + (market === 'tiktok' && result ? ' · ' + decimal(result.rules.affiliate * 100, 1) + '%' : ''), result?.affiliate, '--affiliate'],
      ['Lucro', result?.profit, tone === 'bad' ? '--bad' : tone === 'warn' ? '--warn' : '--good']
    ];
    $('breakdown-list').replaceChildren(); $('composition').replaceChildren();
    const base = result ? Math.max(result.price, result.total) : 1;
    rows.forEach(([label, amount, color]) => {
      const row = document.createElement('div'); row.className = 'breakdown-row';
      const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = 'var(' + color + ')';
      const title = document.createElement('span'); title.className = 'breakdown-label'; title.textContent = label;
      const value = document.createElement('span'); value.className = 'amount'; value.textContent = finite(amount) ? money(amount) : '—';
      const share = document.createElement('span'); share.className = 'share'; share.textContent = result ? decimal(amount / result.price * 100, 1) + '%' : '—';
      row.append(swatch, title, value, share); $('breakdown-list').append(row);
      if (amount > 0) { const part = document.createElement('span'); part.style.width = amount / base * 100 + '%'; part.style.background = 'var(' + color + ')'; $('composition').append(part); }
    });
    $('detail-market').textContent = C[market].name;
    $('result-price').textContent = result ? money(result.price) : '—';
    $('total-cost').textContent = result ? money(result.total) : '—';
    $('loss-note').hidden = !result || result.profit >= 0;
    $('loss-note').textContent = result?.profit < 0 ? 'Déficit: ' + money(-result.profit) + '. Barra = custos; % = venda.' : '';
    $('rate-note').textContent = result ? (market === 'mercadoLivre' ? result.rules.bandLabel + (result.rules.manual ? '' : ' · ' + decimal(result.weights.charged, 3) + ' kg') : 'Faixa: ' + result.rules.bandLabel) : '';
    $('composition').setAttribute('aria-label', result ? 'Composição do preço. Custo total ' + money(result.total) + '; lucro ' + money(result.profit) + '. Valores no botão Detalhes.' : 'Preencha os campos para ver a composição.');
  }
  function idealBandNote(data, quote) {
    const r = quote.rules;
    const previous = finite(data.price) && data.price > 0 ? calculate(market, data) : null;
    if (previous?.ok && previous.rules.bandLabel !== r.bandLabel) {
      if (market === 'shopee') return 'No preço ideal, a taxa fixa muda para ' + money(r.fixed) + '.';
      if (market === 'tiktok') return 'Preço ideal: comissão ' + percent(r.commission) + ', fixa ' + money(r.fixed) + ', frete ' + money(quote.shipping) + '.';
      return 'Preço ideal: ' + r.bandLabel + ', frete ' + money(quote.shipping) + '.';
    }
    return market === 'mercadoLivre' ? 'Frete no preço ideal: ' + money(quote.shipping) + '.' : 'Preço ideal: comissão ' + percent(r.commission) + ', fixa ' + money(r.fixed) + '.';
  }
  function renderIdeal(data, hasErrors) {
    ideal = null;
    showNumber('ideal-price', '—'); $('ideal-profit').textContent = '';
    $('ideal-status').hidden = true; $('ideal-note').hidden = true;
    if (data.target === null) return;
    ideal = minimumPrice(market, data, data.target);
    if (ideal.ok) {
      showNumber('ideal-price', money(ideal.price));
      $('ideal-profit').textContent = 'Lucro ' + money(ideal.quote.profit);
      $('ideal-note').hidden = false; $('ideal-note').textContent = idealBandNote(data, ideal.quote);
    } else if (!hasErrors) {
      $('ideal-status').hidden = false;
      $('ideal-status').textContent = finite(ideal.maxMargin) ? 'Meta inviável · Máx. ' + (ideal.maxIsLimit ? 'teórica ' : '') + percent(ideal.maxMargin) : 'Revise os campos para calcular a meta.';
      $('ideal-status').setAttribute('aria-label', finite(ideal.maxMargin) ? 'Meta inviável com essas taxas. Margem máxima ' + (ideal.maxIsLimit ? 'teórica, não atingível com custos fixos: ' : 'possível: ') + percent(ideal.maxMargin) : ideal.error);
    }
    if (!storageAvailable && ideal?.ok) { $('ideal-status').hidden = false; $('ideal-status').textContent = 'Meta salva só nesta sessão.'; $('ideal-status').removeAttribute('aria-label'); }
  }
  function update() {
    const data = readData(), errors = validateFields(data);
    visibility(data);
    const result = calculate(market, data);
    latest = result.ok ? result : null;
    const tone = result.ok ? resultTone(result.margin, data.target) : 'empty';
    $('result-card').dataset.tone = tone;
    let notice = errors[0] || '';
    if (market === 'mercadoLivre' && !data.manualMode && result.weights?.charged > C.mercadoLivre.shippingTable.at(-1)[0]) notice = 'Peso acima de ' + decimal(C.mercadoLivre.shippingTable.at(-1)[0], 0) + ' kg: use frete manual ⚙.';
    if (result.ok) {
      animateNumbers(result.profit, result.margin);
      const hasTarget = finite(data.target) && data.target >= 0 && data.target <= 100;
      $('result-status').textContent = hasTarget ? tone === 'good' ? 'Meta atingida' : 'Abaixo da meta' : result.profit < 0 ? 'Prejuízo' : tone === 'good' ? 'Margem saudável' : tone === 'warn' ? 'Atenção' : 'Margem baixa';
      if (!notice && result.rules.capped) notice = 'Frete limitado a ' + decimal(C.mercadoLivre.cheapShippingCap.rate * 100, 0) + '% do preço.';
      else if (!notice && market === 'mercadoLivre' && data.manualMode) notice = 'Frete manual: ' + money(result.shipping) + '.';
    } else {
      cancelAnimationFrame(animation); displayedProfit = 0; displayedMargin = 0;
      showNumber('profit', '—'); showNumber('margin', '—');
      $('result-status').textContent = data.price === null ? 'Informe o preço' : 'Revise os campos';
    }
    $('form-notice').textContent = notice; $('form-notice').hidden = !notice;
    $('form-notice').classList.toggle('error', !!errors.length || (!result.ok && data.price !== null));
    renderBreakdown(latest, tone); renderIdeal(data, !!errors.length || !!notice && !result.ok);
    clearTimeout(announcement);
    announcement = setTimeout(() => { $('live-summary').textContent = latest ? C[market].name + ': lucro ' + money(latest.profit) + ', margem ' + percent(latest.margin) + '.' : ideal?.ok ? 'Preço ideal: ' + money(ideal.price) + '.' : result.error; }, 400);
  }
  function switchMarket(next) {
    market = next;
    document.querySelectorAll('[role="tab"]').forEach(tab => {
      const selected = tab.dataset.market === market;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    $('calculator').dataset.market = market;
    $('calculator').setAttribute('aria-labelledby', 'tab-' + market);
    $('calculator').classList.remove('tab-enter'); void $('calculator').offsetWidth; $('calculator').classList.add('tab-enter');
    update();
  }
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchMarket(tab.dataset.market));
    tab.addEventListener('keydown', e => {
      const next = e.key === 'ArrowRight' ? (index + 1) % tabs.length : e.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) { e.preventDefault(); tabs[next].focus(); switchMarket(tabs[next].dataset.market); }
    });
    const img = tab.querySelector('img'), asset = C.logos[tab.dataset.market];
    img.src = asset.src; img.width = asset.width; img.height = asset.height;
  });
  fields.forEach(id => {
    $(id).addEventListener('input', () => {
      if (id === 'target') {
        const value = parseNumber($('target').value);
        if (value === null || (finite(value) && value >= 0 && value <= 100)) storageAvailable = saveTargetStorage($('target').value);
      }
      update();
    });
    $(id).addEventListener('blur', () => {
      const value = parseNumber($(id).value);
      if (cashFields.includes(id) && finite(value) && value >= 0 && value <= C.maxInput) { $(id).value = decimal(value); update(); }
    });
  });
  $('calculator-form').addEventListener('submit', e => e.preventDefault());
  $('fast-shipping').addEventListener('change', () => { fastShipping = $('fast-shipping').value === 'true'; update(); });
  $('manual-mode').addEventListener('change', update);
  // <dialog> mantém o foco no painel, fecha com Esc e devolve o foco ao botão.
  $('details-button').addEventListener('click', () => $('details-dialog').showModal());
  $('manual-button').addEventListener('click', () => $('manual-dialog').showModal());
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(button.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  // Sem botão extra: acompanha o tema claro/escuro do dispositivo.
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    document.documentElement.dataset.theme = systemTheme.matches ? 'dark' : 'light';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  }
  applyTheme(); systemTheme.addEventListener('change', applyTheme);
  update();
})(typeof window !== 'undefined' ? window : globalThis);
