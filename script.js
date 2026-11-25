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
      m.bands.forEach(b => { if (!ratio(b.commission) || !nonnegative(b.fixed) || !ratio(b.fixedRate || 0)) throw Error('Comissão ou taxa fixa inválida.'); });
    });
    C.tiktok.bands.forEach(b => { if (!ratio(b.shippingRate) || !nonnegative(b.shippingFixed)) throw Error('Frete TikTok inválido.'); });
    const f = C.fiscal;
    if (!Array.isArray(f.icmsOptions) || !f.icmsOptions.length || f.icmsOptions.some(o => !ratio(o.rate)) || [f.pisCofins, f.costIcmsCredit, f.costPisCofinsCredit, f.feePisCofinsCredit, f.shippingIcmsCredit, f.shippingPisCofinsCredit].some(n => !ratio(n))) throw Error('Revise as alíquotas de fiscal no config.js.');
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
      if (data.manualMode) return { commission: m.commission, fixed: 0, fixedRate: 0, shippingRate: 0, shippingFixed: data.manualShipping, affiliate: 0, manual: true, bandLabel: 'Frete manual', capped: false };
      const fast = price < m.mandatoryFreeShippingFrom && data.fastShipping;
      const index = fast ? m.fastShippingColumn : m.priceBands.findIndex(b => inBand(price, b));
      const tableShipping = ctx.row[index + 1];
      const capped = price < m.cheapShippingCap.below && tableShipping > price * m.cheapShippingCap.rate + EPS;
      return { commission: m.commission, fixed: 0, fixedRate: 0, shippingRate: capped ? m.cheapShippingCap.rate : 0, shippingFixed: capped ? 0 : tableShipping, affiliate: 0, manual: false, capped, tableShipping, bandLabel: fast ? 'Frete grátis rápido · ' + m.priceBands[index].label : m.priceBands[index].label };
    }
    const b = C[market].bands.find(item => inBand(price, item));
    return { commission: b.commission, fixed: b.fixed, fixedRate: b.fixedRate || 0, shippingRate: b.shippingRate || 0, shippingFixed: b.shippingFixed || 0, affiliate: market === 'tiktok' ? data.affiliate / 100 : 0, bandLabel: money(b.min) + (b.max === null ? ' ou mais' : ' a ' + money(b.max - 0.01)) };
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
    const fixed = data.price * r.fixedRate + r.fixed;
    const total = data.cost + commission + fixed + shipping + affiliate;
    const profit = data.price - total;
    const margin = profit / data.price;
    const tone = margin < C.marginColors.low - EPS ? 'bad' : margin <= C.marginColors.high + EPS ? 'warn' : 'good';
    return { ok: true, price: data.price, cost: data.cost, commission, fixed, shipping, affiliate, total, profit, margin, tone, rules: r, weights: ctx.weights };
  }

  // Aba Fiscal: parte do cálculo normal e aplica impostos da venda e créditos, como na planilha da Sellneeds.
  // O crédito sobre a tarifa vale só para a comissão; taxa fixa e afiliado entram sem crédito.
  function fiscal(market, data) {
    const F = C.fiscal;
    if (!finite(data.icms) || data.icms < 0 || data.icms > 1) return { ok: false, error: 'Escolha o ICMS interno.' };
    const base = calculate(market, data);
    if (!base.ok) return base;
    const icms = base.price * data.icms;
    const pisCofins = (base.price - icms) * F.pisCofins;
    const netRevenue = base.price - icms - pisCofins;
    const costIcmsCredit = base.cost * F.costIcmsCredit;
    const costPisCofinsCredit = base.cost * F.costPisCofinsCredit;
    const netCost = base.cost - costIcmsCredit - costPisCofinsCredit;
    const feeCredit = base.commission * F.feePisCofinsCredit;
    const shippingIcmsCredit = base.shipping * F.shippingIcmsCredit;
    const shippingPisCofinsCredit = base.shipping * F.shippingPisCofinsCredit;
    const platform = base.commission - feeCredit + base.fixed + base.affiliate + base.shipping - shippingIcmsCredit - shippingPisCofinsCredit;
    const profit = netRevenue - netCost - platform;
    const margin = profit / base.price;
    const tone = margin < C.marginColors.low - EPS ? 'bad' : margin <= C.marginColors.high + EPS ? 'warn' : 'good';
    return { ...base, icmsRate: data.icms, icms, pisCofins, netRevenue, costIcmsCredit, costPisCofinsCredit, netCost, feeCredit, shippingIcmsCredit, shippingPisCofinsCredit, platform, profit, margin, tone };
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
      const availableRate = 1 - r.commission - r.fixedRate - r.shippingRate - r.affiliate - target;
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

  const api = { parseNumber, weights, calculate, fiscal, minimumPrice, validateConfig };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SellneedsCalculator = api;
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  const html = document.documentElement;
  try { validateConfig(); } catch (e) {
    $('fatal-error').hidden = false;
    $('fatal-error').textContent = 'Configuração inválida: ' + e.message;
    $('blocks').hidden = true;
    return;
  }

  const ML = C.mercadoLivre;
  const maxWeight = ML.shippingTable.at(-1)[0];
  const rate = n => new Intl.NumberFormat(C.locale, { maximumFractionDigits: 2 }).format(n * 100) + '%';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cashFields = ['price', 'cost', 'manualShipping'];
  let market = 'mercadoLivre';

  // Os blocos usam o mesmo componente; muda só o campo principal e o resultado.
  // O bloco fiscal tem ainda o ICMS interno e troca o gráfico pelo demonstrativo.
  const KINDS = {
    price: { title: 'Cálculo por preço', main: 'price', mainLabel: 'Preço de venda', unit: 'R$', costLabel: 'Custo do produto', resultLabel: 'Margem de contribuição' },
    margin: { title: 'Cálculo por margem', main: 'target', mainLabel: 'Margem alvo', unit: '%', costLabel: 'Custo do produto', resultLabel: 'Preço de venda necessário' },
    fiscal: { title: 'Cálculo fiscal', main: 'price', mainLabel: 'Preço de venda', unit: 'R$', costLabel: 'Preço de custo', resultLabel: 'Sobra na mão' }
  };

  function inputHtml(p, key, unit, hidden) {
    const before = unit === 'R$' ? '<span>R$</span>' : '';
    const after = unit === 'R$' ? '' : '<span>' + unit + '</span>';
    return '<div class="input-wrap" data-input="' + key + '"' + (hidden ? ' hidden' : '') + '>' + before +
      '<input id="' + p + '-' + key + '" type="text" inputmode="decimal" autocomplete="off" aria-describedby="' + p + '-' + key + '-error">' + after +
      '<small id="' + p + '-' + key + '-error" class="field-error"></small></div>';
  }
  function fieldHtml(p, key, label, unit, extraClass = '', chip = '') {
    return '<div class="field ' + extraClass + '"><div class="field-head"><label for="' + p + '-' + key + '">' + label + '</label>' + chip + '</div>' + inputHtml(p, key, unit) + '</div>';
  }

  function createBlock(p, kind) {
    const t = KINDS[kind];
    const section = document.createElement('section');
    section.className = 'block';
    section.id = p;
    section.dataset.kind = kind;
    section.setAttribute('aria-labelledby', p + '-title');
    section.innerHTML =
      '<h2 id="' + p + '-title" class="block-title">' + t.title + '</h2>' +
      '<div class="block-body"><form class="inputs" novalidate>' +
        fieldHtml(p, t.main, t.mainLabel, t.unit) +
        fieldHtml(p, 'cost', t.costLabel, 'R$', '', '<button id="' + p + '-sku" class="chip sku-chip" type="button" aria-pressed="false" aria-haspopup="dialog">SKU</button>') +
        (kind === 'fiscal' ? '<div class="field"><div class="field-head"><span id="' + p + '-icms-label" class="label">ICMS interno</span><span id="' + p + '-icms-note" class="field-note"></span></div>' +
          '<div class="segmented" role="group" aria-labelledby="' + p + '-icms-label">' + C.fiscal.icmsOptions.map((o, i) => '<button type="button" data-icms="' + i + '" aria-pressed="false">' + rate(o.rate) + '</button>').join('') + '</div></div>' : '') +
        '<div class="field ml-only"><div class="field-head"><label id="' + p + '-ship-label" for="' + p + '-weight">Peso</label>' +
          '<button id="' + p + '-manual" class="chip" type="button" aria-pressed="false">Frete manual</button></div>' +
          inputHtml(p, 'weight', 'kg') + inputHtml(p, 'manualShipping', 'R$', true) + '</div>' +
        '<div id="' + p + '-fast-field" class="field ml-only"><div class="field-head"><span id="' + p + '-fast-label" class="label">Frete grátis rápido</span></div>' +
          '<div class="segmented" role="group" aria-labelledby="' + p + '-fast-label"><button id="' + p + '-fast-no" type="button" aria-pressed="true">Não</button><button id="' + p + '-fast-yes" type="button" aria-pressed="false">Sim</button></div></div>' +
        fieldHtml(p, 'affiliate', 'Comissão de afiliado', '%', 'tiktok-only') +
      '</form>' +
      '<div id="' + p + '-result" class="result" data-tone="empty">' +
        '<div class="headline"><span id="' + p + '-label" class="headline-label">' + t.resultLabel + '</span><strong id="' + p + '-value" class="headline-value">—</strong></div>' +
        (kind === 'fiscal'
          ? '<div class="money"><div id="' + p + '-list" class="statement"></div><p id="' + p + '-msg" class="result-msg" hidden></p></div>'
          : '<div class="money"><h3>Para onde vai o dinheiro</h3><div id="' + p + '-bar" class="composition" aria-hidden="true"></div>' +
            '<ul id="' + p + '-list" class="legend" aria-label="Para onde vai o dinheiro"></ul><p id="' + p + '-msg" class="result-msg" hidden></p></div>') +
      '</div></div>';
    $('blocks').append(section);

    const el = id => $(p + '-' + id);
    const keys = [t.main, 'cost', 'weight', 'manualShipping', 'affiliate'];
    const state = { fast: C.defaults.fastShipping, manual: C.defaults.manualMode, icms: 0, sku: null, shown: 0, frame: 0, quote: null, notes: [] };
    keys.forEach(k => { el(k).value = cashFields.includes(k) ? decimal(C.defaults[k]) : String(C.defaults[k]).replace('.', ','); });

    function read() {
      const data = Object.fromEntries(keys.map(k => [k, parseNumber(el(k).value)]));
      return { ...data, fastShipping: state.fast, manualMode: state.manual };
    }
    function fieldError(k, message) {
      el(k + '-error').textContent = message;
      el(k).setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    // Mensagens curtas: aparecem sobre a borda do campo, sem empurrar o layout.
    function validate(data) {
      keys.forEach(k => fieldError(k, ''));
      const required = [t.main, 'cost'];
      if (market === 'tiktok') required.push('affiliate');
      if (market === 'mercadoLivre') required.push(state.manual ? 'manualShipping' : 'weight');
      let invalid = false;
      required.forEach(k => {
        const n = data[k];
        const allowZero = k !== 'price' && k !== 'weight';
        const limit = k === 'affiliate' || k === 'target' ? 100 : k === 'weight' ? maxWeight : C.maxInput;
        let message = '';
        if (n === null) message = 'Obrigatório';
        else if (!finite(n)) message = 'Inválido';
        else if (n < 0 || (!allowZero && n === 0)) message = allowZero ? 'Use 0 ou mais' : 'Maior que 0';
        else if (n > limit) message = limit === 100 ? 'Máx. 100%' : k === 'weight' ? 'Máx. ' + decimal(maxWeight, 0) + ' kg' : 'Muito alto';
        fieldError(k, message);
        if (message) invalid = true;
      });
      return invalid;
    }
    function setFast(value) {
      state.fast = value;
      el('fast-no').setAttribute('aria-pressed', String(!value));
      el('fast-yes').setAttribute('aria-pressed', String(value));
    }
    // ICMS interno da aba Fiscal: índice da opção em C.fiscal.icmsOptions.
    function setIcms(index) {
      state.icms = index;
      section.querySelectorAll('[data-icms]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.icms === index)));
      if (el('icms-note')) el('icms-note').textContent = C.fiscal.icmsOptions[index].label;
    }
    // O botão do custo mostra o SKU escolhido; digitar outro custo desfaz a ligação.
    // Com SKU, o rótulo encurta para "Custo" e o SKU ganha espaço no celular.
    function setSku(sku, name) {
      state.sku = sku;
      section.querySelector('label[for="' + p + '-cost"]').textContent = sku ? 'Custo' : t.costLabel;
      el('sku').textContent = sku || 'SKU';
      el('sku').title = sku ? 'Custo do SKU ' + sku + (name ? ' (' + name + ')' : '') + ' · trocar' : 'Buscar o custo pelo SKU ou nome';
      el('sku').setAttribute('aria-label', el('sku').title);
      el('sku').setAttribute('aria-pressed', String(!!sku));
    }
    function visibility(data) {
      section.querySelector('[data-input="weight"]').hidden = state.manual;
      section.querySelector('[data-input="manualShipping"]').hidden = !state.manual;
      el('ship-label').textContent = state.manual ? 'Frete' : 'Peso';
      el('ship-label').htmlFor = p + '-' + (state.manual ? 'manualShipping' : 'weight');
      el('manual').setAttribute('aria-pressed', String(state.manual));
      // Por preço: só abaixo do frete obrigatório. Por margem: sempre, pois o preço é a resposta.
      el('fast-field').hidden = kind !== 'margin' && !(finite(data.price) && data.price < ML.mandatoryFreeShippingFrom);
      el('fast-no').disabled = el('fast-yes').disabled = state.manual;
    }
    function animate(to, format) {
      cancelAnimationFrame(state.frame);
      const from = state.shown, start = performance.now();
      const frame = now => {
        const k = reducedMotion.matches ? 1 : Math.min(1, (now - start) / 240);
        state.shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
        el('value').textContent = format(state.shown);
        if (k < 1) state.frame = requestAnimationFrame(frame);
      };
      state.frame = requestAnimationFrame(frame);
    }
    function chart(r) {
      const rows = [
        ['Custo do produto', 'Custo', r.cost, '--cost', true],
        ['Comissão ' + rate(r.rules.commission), 'Comissão', r.commission, '--commission'],
        ['Taxa fixa', 'Taxa fixa', r.fixed, '--fixed'],
        ['Frete', 'Frete', r.shipping, '--shipping'],
        ['Afiliado ' + rate(r.rules.affiliate), 'Afiliado', r.affiliate, '--affiliate'],
        ['Lucro de contribuição', 'Lucro de contribuição', r.profit, r.tone === 'good' ? '--good' : r.tone === 'warn' ? '--warn' : '--bad', true]
      ];
      const list = el('list'), bar = el('bar');
      list.replaceChildren(); bar.replaceChildren();
      // Em prejuízo, a barra representa o total dos custos; percentuais sempre sobre o preço.
      const base = Math.max(r.price, r.total);
      rows.forEach(([label, short, amount, color, always], i) => {
        if (amount > 0) {
          const part = document.createElement('span');
          part.style.width = amount / base * 100 + '%'; part.style.background = 'var(' + color + ')';
          bar.append(part);
        }
        if (!always && Math.abs(amount) < 0.005) return;
        const li = document.createElement('li'); li.className = i === 5 ? 'profit-row' : '';
        const swatch = document.createElement('span'); swatch.className = 'swatch'; swatch.style.background = 'var(' + color + ')';
        const name = document.createElement('span'); name.className = 'name';
        const long = document.createElement('span'); long.className = 'long'; long.textContent = label;
        const brief = document.createElement('span'); brief.className = 'short'; brief.textContent = short; brief.setAttribute('aria-hidden', 'true');
        name.append(long, brief);
        const value = document.createElement('span'); value.className = 'amount'; value.textContent = money(amount);
        const share = document.createElement('span'); share.className = 'share'; share.textContent = decimal(amount / r.price * 100, 1) + '%';
        li.append(swatch, name, value, share); list.append(li);
      });
    }
    // Demonstrativo da aba Fiscal, na ordem da planilha: venda, custo, plataforma e resultado.
    // Linhas zeradas (taxa fixa, afiliado, frete) são ocultadas.
    function statement(r) {
      const F = C.fiscal;
      const groups = [
        ['Venda', [
          ['Preço de venda', r.price],
          ['ICMS ' + rate(r.icmsRate), -r.icms],
          ['PIS/COFINS ' + rate(F.pisCofins), -r.pisCofins],
          ['Receita líquida', r.netRevenue, 'sub']
        ]],
        ['Custo do produto', [
          ['Preço de custo', -r.cost],
          ['Crédito ICMS ' + rate(F.costIcmsCredit), r.costIcmsCredit],
          ['Crédito PIS/COFINS', r.costPisCofinsCredit],
          ['Custo líquido', -r.netCost, 'sub']
        ]],
        ['Plataforma', [
          ['Tarifa ' + rate(r.rules.commission), -r.commission],
          ['Crédito PIS/COFINS', r.feeCredit],
          ['Taxa fixa', -r.fixed, 'zero'],
          ['Afiliado ' + rate(r.rules.affiliate), -r.affiliate, 'zero'],
          ['Frete', -r.shipping, 'zero'],
          ['Créd. ICMS frete', r.shippingIcmsCredit, 'zero'],
          ['Créd. PIS/COFINS frete', r.shippingPisCofinsCredit, 'zero'],
          ['Custo plataforma', -r.platform, 'sub']
        ]]
      ];
      const make = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
      el('list').replaceChildren(...groups.map(([title, rows]) => {
        const group = make('section', 'st-group');
        const list = make('ul');
        rows.forEach(([name, amount, type]) => {
          if (type === 'zero' && Math.abs(amount) < 0.005) return;
          const li = make('li', type === 'sub' ? 'st-sub' : '');
          li.append(make('span', 'name', name), make('span', 'amount', money(amount)));
          list.append(li);
        });
        group.append(make('h3', '', title), list);
        return group;
      }));
    }
    function shortMessage(data, invalid) {
      if (market === 'mercadoLivre' && !state.manual && finite(data.weight) && data.weight > maxWeight + EPS) return 'Peso acima de ' + decimal(maxWeight, 0) + ' kg: use Frete manual.';
      if (invalid) return 'Revise o campo destacado.';
      return kind === 'margin' ? 'Meta inviável com esses custos e taxas.' : 'Não foi possível calcular.';
    }
    function notesFor(data, r) {
      const notes = [];
      if (market === 'mercadoLivre') {
        if (r.rules.manual) notes.push('Frete manual: o valor informado substitui a tabela e o limite para itens baratos.');
        else notes.push('Faixa ' + r.rules.bandLabel + ' · faixa de peso até ' + decimal(context(market, data).row[0], 1) + ' kg (somente o peso informado).');
        if (r.rules.capped) notes.push('Frete limitado a ' + decimal(ML.cheapShippingCap.rate * 100, 0) + '% do preço: tabela ' + money(r.rules.tableShipping) + ' → aplicado ' + money(r.shipping) + '.');
        if (r.price >= ML.mandatoryFreeShippingFrom) notes.push('Frete grátis obrigatório a partir de ' + money(ML.mandatoryFreeShippingFrom) + '.');
      } else notes.push('Faixa vigente: ' + r.rules.bandLabel + '. Taxas sobre o preço de venda' + (r.rules.fixedRate ? '; taxa por item de ' + rate(r.rules.fixedRate) + ' do preço.' : '.'));
      if (kind === 'fiscal') {
        const F = C.fiscal;
        notes.push('ICMS interno de ' + rate(r.icmsRate) + ' (' + C.fiscal.icmsOptions[state.icms].label + ') sobre o preço; PIS e COFINS de ' + rate(F.pisCofins) + ' sobre o preço menos o ICMS.');
        notes.push('Créditos: ICMS ' + rate(F.costIcmsCredit) + ' e PIS e COFINS ' + rate(F.costPisCofinsCredit) + ' sobre o preço de custo; PIS e COFINS ' + rate(F.feePisCofinsCredit) + ' sobre a tarifa (comissão); ICMS ' + rate(F.shippingIcmsCredit) + ' e PIS e COFINS ' + rate(F.shippingPisCofinsCredit) + ' sobre o frete. Taxa fixa e afiliado entram sem crédito.');
        if (r.profit < -EPS) notes.push('Prejuízo de ' + money(-r.profit) + ' por venda.');
        return notes;
      }
      if (r.profit < -EPS) notes.push('Os custos excedem a venda em ' + money(-r.profit) + '. A barra representa o total dos custos; os percentuais usam o preço de venda.');
      if (kind === 'margin') {
        notes.push('Menor preço, em centavos, que atinge ' + decimal(data.target) + '% (margem obtida: ' + percent(r.margin) + '). Ao aumentar o preço, recalcule: uma nova faixa de taxas pode reduzir a margem.');
        if (market === 'mercadoLivre' && !state.manual) notes.push('Abaixo de ' + money(ML.mandatoryFreeShippingFrom) + ', considera frete grátis rápido: ' + (state.fast ? 'Sim' : 'Não') + '. Acima, usa as faixas obrigatórias.');
      }
      return notes;
    }

    function update() {
      const data = read();
      const invalid = validate(data);
      visibility(data);
      let quote = null;
      if (kind === 'margin') { if (!invalid) { const m = minimumPrice(market, data, data.target); if (m.ok) quote = m.quote; } }
      else { const r = kind === 'fiscal' ? fiscal(market, { ...data, icms: C.fiscal.icmsOptions[state.icms].rate }) : calculate(market, data); if (r.ok) quote = r; }
      state.quote = quote;
      el('result').dataset.tone = quote ? quote.tone : 'empty';
      el('msg').hidden = !!quote;
      if (kind === 'fiscal') el('label').textContent = t.resultLabel + (quote ? ' · margem ' + percent(quote.margin) : '');
      if (quote) {
        if (kind === 'price') animate(quote.margin, percent); else animate(kind === 'fiscal' ? quote.profit : quote.price, money);
        if (kind === 'fiscal') statement(quote); else chart(quote);
        state.notes = notesFor(data, quote);
      } else {
        cancelAnimationFrame(state.frame); state.shown = 0;
        el('value').textContent = '—';
        el('msg').textContent = shortMessage(data, invalid);
        el('list').replaceChildren(); if (el('bar')) el('bar').replaceChildren();
        state.notes = [];
      }
    }

    keys.forEach(k => {
      el(k).addEventListener('input', refresh);
      el(k).addEventListener('blur', () => {
        const n = parseNumber(el(k).value);
        if (cashFields.includes(k) && finite(n) && n >= 0 && n <= C.maxInput) { el(k).value = decimal(n); refresh(); }
      });
    });
    section.querySelector('form').addEventListener('submit', e => e.preventDefault());
    el('fast-no').addEventListener('click', () => { setFast(false); refresh(); });
    el('fast-yes').addEventListener('click', () => { setFast(true); refresh(); });
    el('manual').addEventListener('click', () => {
      state.manual = !state.manual;
      refresh(); fit();
      el(state.manual ? 'manualShipping' : 'weight').focus();
    });
    el('sku').addEventListener('click', () => {
      if (!root.SellneedsCustos || !root.SellneedsCustos.open) return;
      root.SellneedsCustos.open({ pick: (sku, cost, name) => { el('cost').value = decimal(cost); setSku(sku, name); refresh(); } });
    });
    el('cost').addEventListener('input', () => setSku(null));
    document.addEventListener('sellneeds:custo', e => {
      if (state.sku !== e.detail.sku) return;
      el('cost').value = decimal(e.detail.cost);
      refresh();
    });
    section.querySelectorAll('[data-icms]').forEach(b => b.addEventListener('click', () => { setIcms(+b.dataset.icms); refresh(); }));
    setFast(state.fast);
    setIcms(state.icms);
    setSku(null);
    return { id: p, kind, title: t.title, section, update, state };
  }

  const blocks = [createBlock('preco', 'price'), createBlock('margem', 'margin'), createBlock('fiscal', 'fiscal')];
  // A aba Fiscal mostra só o bloco fiscal; as outras, só os blocos de preço e margem.
  const shown = () => blocks.filter(b => (b.kind === 'fiscal') === html.classList.contains('fiscal'));

  function renderInfo() {
    const content = $('info-content');
    content.replaceChildren();
    const add = (tag, text, cls) => { const n = document.createElement(tag); n.textContent = text; if (cls) n.className = cls; content.append(n); return n; };
    shown().forEach(b => {
      add('h3', b.title + ' · ' + C[market].name);
      if (!b.state.notes.length) add('p', 'Complete os campos para ver as faixas aplicadas.', 'muted');
      b.state.notes.forEach(n => add('p', n));
    });
    add('h3', 'Sobre o cálculo');
    add('p', 'Margem de contribuição não é lucro líquido. A simulação considera somente os custos e taxas exibidos. Impostos, anúncios, embalagem e despesas operacionais não estão incluídos.');
    add('p', 'Mercado Livre: o frete usa somente o peso informado. Frete grátis rápido é opcional abaixo de ' + money(ML.mandatoryFreeShippingFrom) + '. Abaixo de ' + money(ML.cheapShippingCap.below) + ', o frete fica limitado a ' + decimal(ML.cheapShippingCap.rate * 100, 0) + '% do preço. O frete manual substitui a tabela.');
    add('p', 'Shopee: abaixo de ' + money(C.shopee.bands[1].min) + ', a taxa por item é ' + rate(C.shopee.bands[0].fixedRate || 0) + ' do preço; R$ 200,00 foi incluído na última faixa. TikTok: frete percentual e afiliado incidem sobre o preço de venda.');
    add('p', 'Aba Fiscal: usa as mesmas taxas e o mesmo frete e desconta ICMS e PIS e COFINS da venda, somando os créditos sobre o custo, a tarifa e o frete. As alíquotas vêm da planilha da Sellneeds e não substituem a apuração do contador.');
    add('p', 'As taxas seguem os valores informados pela Sellneeds, sem consulta automática aos marketplaces. Os cálculos usam precisão completa; o preço por margem é arredondado para cima ao centavo.', 'muted');
    add('p', 'Regras: ' + C.version + '.', 'muted');
  }

  let announcement = 0;
  function refresh() {
    blocks.forEach(b => b.update());
    $('info-button').toggleAttribute('data-alert', shown().some(b => b.state.quote && (b.state.quote.rules.capped || b.state.quote.profit < -EPS)));
    if ($('info-dialog').open) renderInfo();
    clearTimeout(announcement);
    announcement = setTimeout(() => {
      const [a, b, f] = blocks.map(x => x.state.quote);
      $('live-summary').textContent = C[market].name + ': ' + (html.classList.contains('fiscal')
        ? (f ? 'sobra na mão ' + money(f.profit) + ', margem fiscal ' + percent(f.margin) : 'cálculo fiscal indisponível')
        : (a ? 'margem ' + percent(a.margin) : 'margem indisponível') + '; ' + (b ? 'preço necessário ' + money(b.price) : 'preço indisponível')) + '.';
    }, 500);
  }

  // Tela única: se os dois blocos não couberem, mostra um por vez com o seletor.
  // Pontos de corte: retrato com altura < 740 px, ou qualquer tela com altura < 341 px.
  const singleQuery = window.matchMedia('(orientation: portrait) and (max-height: 739px), (max-height: 340px)');
  function fit() {
    if (html.classList.contains('typing')) return;
    // Na aba Fiscal há um bloco só: mantém o arranjo que os outros dois já tinham.
    if (html.classList.contains('fiscal')) { if (singleQuery.matches) html.classList.add('single'); return; }
    html.classList.toggle('single', singleQuery.matches);
    if (html.classList.contains('single')) return;
    const area = $('blocks');
    const overflow = area.scrollHeight > area.clientHeight + 1 || area.scrollWidth > area.clientWidth + 1 || blocks.some(b => b.section.scrollHeight > b.section.clientHeight + 1);
    html.classList.toggle('single', overflow);
  }
  // Abas: "Preço e margem" (os dois blocos juntos), "Por preço" e "Por margem" (um por vez) e "Fiscal".
  let view = 'preco';
  function setView(id) {
    if (id !== 'ambos') view = id;
    else if (view === 'fiscal') view = 'preco';
    html.classList.toggle('fiscal', view === 'fiscal');
    blocks.forEach(b => b.section.classList.toggle('is-current', b.id === view));
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view || (button.dataset.view === 'ambos' && view !== 'fiscal'))));
    refresh(); fit();
  }
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  setView('preco');
  let fitFrame = 0;
  const scheduleFit = () => { cancelAnimationFrame(fitFrame); fitFrame = requestAnimationFrame(fit); };
  window.addEventListener('resize', scheduleFit);
  if (document.fonts) document.fonts.ready.then(scheduleFit);

  // Teclado do celular: enquanto um campo estiver em foco, só a área dos blocos pode rolar.
  const touch = window.matchMedia('(pointer: coarse)');
  $('blocks').addEventListener('focusin', e => {
    if (!touch.matches || e.target.tagName !== 'INPUT') return;
    html.classList.add('typing');
  });
  $('blocks').addEventListener('focusout', () => {
    setTimeout(() => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT' && $('blocks').contains(document.activeElement)) return;
      html.classList.remove('typing');
      $('blocks').scrollTop = 0;
      scheduleFit();
    }, 120);
  });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => {
    const active = document.activeElement;
    if (html.classList.contains('typing') && active && active.tagName === 'INPUT') active.scrollIntoView({ block: 'nearest' });
  });

  function switchMarket(next) {
    market = next;
    document.querySelectorAll('[data-market][role="tab"]').forEach(button => {
      const active = button.dataset.market === market;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
    });
    $('blocks').dataset.market = market;
    $('blocks').setAttribute('aria-labelledby', 'tab-' + market);
    $('blocks').classList.remove('tab-enter');
    void $('blocks').offsetWidth;
    $('blocks').classList.add('tab-enter');
    refresh(); fit();
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
    // Imagem que falhou antes deste script: mostra o nome em texto.
    const img = tab.querySelector('img');
    if (img.complete && !img.naturalWidth) tab.classList.add('logo-failed');
  });

  $('info-button').addEventListener('click', () => { renderInfo(); $('info-dialog').showModal(); });
  $('info-close').addEventListener('click', () => $('info-dialog').close());
  $('info-dialog').addEventListener('click', e => { if (e.target === $('info-dialog')) $('info-dialog').close(); });

  function setTheme(theme) {
    html.dataset.theme = theme;
    $('theme-icon').textContent = theme === 'dark' ? '☀' : '☾';
    $('theme-toggle').setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    $('theme-toggle').setAttribute('aria-pressed', String(theme === 'dark'));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(html).getPropertyValue('--bg').trim();
    try { localStorage.setItem('sellneeds-theme', theme); } catch (_) { /* Continua funcionando com armazenamento bloqueado. */ }
  }
  let theme;
  try { theme = localStorage.getItem('sellneeds-theme'); } catch (_) { /* Sem persistência no navegador. */ }
  setTheme(theme === 'dark' || theme === 'light' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  $('theme-toggle').addEventListener('click', () => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark'));

  refresh();
  fit();
})(typeof window !== 'undefined' ? window : globalThis);
