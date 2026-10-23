# Código completo · Sellneeds

Versão com layout de tela única: blocos "Cálculo por preço" e "Cálculo por margem" e logos nos botões dos marketplaces.

Copie cada bloco inteiro para o arquivo indicado. Mantenha os quatro arquivos, `logo-sellneeds.png` e as três logos dos marketplaces (`logo-mercado-livre.webp`, `logo-shopee.webp`, `logo-tiktok.webp`) juntos. As imagens não estão neste documento.

## index.html

```html
<!doctype html>
<html lang="pt-BR" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content">
  <meta name="theme-color" content="#f6f7f9">
  <meta name="description" content="Calcule margem de contribuição e preço de venda no Mercado Livre, Shopee e TikTok Shop. Uma ferramenta Sellneeds.">
  <title>Calculadora de Margem · Sellneeds</title>
  <link rel="icon" type="image/png" href="./logo-sellneeds.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./style.css">
  <script src="./config.js" defer></script>
  <script src="./script.js" defer></script>
</head>
<body>
  <div class="app">
    <header class="topbar">
      <a class="brand" href="./index.html" aria-label="Sellneeds, início">
        <img src="./logo-sellneeds.png" width="40" height="40" alt="Logo Sellneeds">
        <h1>Calculadora de Margem</h1>
      </a>
      <nav class="market-tabs" role="tablist" aria-label="Escolha o marketplace">
        <button class="market-tab" type="button" role="tab" id="tab-mercadoLivre" data-market="mercadoLivre" aria-label="Mercado Livre" aria-selected="true" aria-controls="blocks"><img src="./logo-mercado-livre.webp" width="160" height="160" alt="Mercado Livre" onerror="this.parentNode.classList.add('logo-failed')"><span class="logo-fallback" aria-hidden="true">Mercado Livre</span></button>
        <button class="market-tab" type="button" role="tab" id="tab-shopee" data-market="shopee" aria-label="Shopee" aria-selected="false" aria-controls="blocks" tabindex="-1"><img src="./logo-shopee.webp" width="160" height="160" alt="Shopee" onerror="this.parentNode.classList.add('logo-failed')"><span class="logo-fallback" aria-hidden="true">Shopee</span></button>
        <button class="market-tab" type="button" role="tab" id="tab-tiktok" data-market="tiktok" aria-label="TikTok Shop" aria-selected="false" aria-controls="blocks" tabindex="-1"><img src="./logo-tiktok.webp" width="160" height="160" alt="TikTok Shop" onerror="this.parentNode.classList.add('logo-failed')"><span class="logo-fallback" aria-hidden="true">TikTok Shop</span></button>
      </nav>
      <div class="top-actions">
        <button id="info-button" class="icon-button" type="button" aria-label="Informações e avisos" aria-haspopup="dialog" aria-controls="info-dialog"><span aria-hidden="true">i</span></button>
        <button id="theme-toggle" class="icon-button" type="button" aria-label="Ativar modo escuro" aria-pressed="false"><span id="theme-icon" aria-hidden="true">☾</span></button>
      </div>
    </header>
    <div class="view-switch segmented" role="group" aria-label="Tipo de cálculo">
      <button type="button" data-view="preco" aria-controls="preco" aria-pressed="true">Por preço</button>
      <button type="button" data-view="margem" aria-controls="margem" aria-pressed="false">Por margem</button>
    </div>
    <div id="fatal-error" class="notice danger" role="alert" hidden></div>
    <main id="blocks" class="blocks" data-market="mercadoLivre" role="tabpanel" aria-labelledby="tab-mercadoLivre"></main>
  </div>
  <dialog id="info-dialog" class="info-dialog" aria-labelledby="info-title">
    <div class="info-head"><h2 id="info-title">Informações</h2><button id="info-close" class="icon-button" type="button" aria-label="Fechar informações"><span aria-hidden="true">×</span></button></div>
    <div id="info-content" class="info-content" tabindex="-1" autofocus></div>
  </dialog>
  <div id="live-summary" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  <noscript><p class="notice danger">Ative o JavaScript do navegador para usar a calculadora.</p></noscript>
</body>
</html>
```

## style.css

```css
/* Identidade visual: altere cores e fontes nestas variáveis. */
:root {
  --font-body: 'DM Sans', Arial, sans-serif;
  --font-display: 'Manrope', Arial, sans-serif;
  --brand: #216a4a;
  --brand-soft: #e9f3ec;
  --brand-ink: #185436;
  --bg: #f6f7f9;
  --surface: #ffffff;
  --surface-soft: #f7f8fa;
  --text: #19231e;
  --muted: #69736e;
  --line: #e3e8e4;
  --input-bg: #ffffff;
  --logo-bg: #ffffff;
  --tab-bg: #ffffff;
  --ml: #ffe600;
  --ml-border: #ad9024;
  --shopee: #ee4d2d;
  --tiktok: #fe2c55;
  --tiktok-glow: #25f4ee;
  --bad: #b9363f;
  --bad-soft: #fff0f0;
  --warn: #846000;
  --warn-soft: #fff7db;
  --good: #216a4a;
  --good-soft: #eaf4ed;
  --cost: #88968b;
  --commission: #b7c2b8;
  --fixed: #e4bf68;
  --shipping: #b8b0dd;
  --affiliate: #e8a696;
  --radius: 1.1rem;
  --shadow: 0 5px 24px rgba(23, 44, 30, .035);
}
:root[data-theme='dark'] {
  color-scheme: dark;
  --brand: #88cf9e; --brand-soft: #21352a; --brand-ink: #b7e8c5;
  --bg: #121714; --surface: #1b221e; --surface-soft: #222b25;
  --text: #edf4ee; --muted: #a6b4aa; --line: #344138; --input-bg: #17201a;
  --good: #91d7a6; --good-soft: #20392a; --bad: #ffabb0; --bad-soft: #402729;
  --warn: #efd187; --warn-soft: #3a3421; --ml-border: #ffe600;
  --tab-bg: #f1f5f2;
  --shadow: 0 5px 24px rgba(0,0,0,.1);
}

/* Tamanho fluido: tudo usa rem, que acompanha a altura e a largura da tela. */
html { font-size: clamp(11px, min(1.85vh, 3.6vw), 20px); height: 100%; }
html.single { font-size: clamp(11px, min(2.3vh, 3.7vw), 16px); }
* { box-sizing: border-box; }
body { margin: 0; height: 100%; height: 100dvh; overflow: hidden; overscroll-behavior: none; color: var(--text); background: var(--bg); font-family: var(--font-body); font-size: .9rem; line-height: 1.35; transition: background .2s, color .2s; }
button, input { font: inherit; }
button { cursor: pointer; color: inherit; }
button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid var(--brand); outline-offset: 2px; }
button:disabled { opacity: .45; cursor: not-allowed; }
[hidden] { display: none !important; }
h1, h2, h3, p, ul { margin: 0; }

.app {
  height: 100%; width: 100%; max-width: 72rem; margin: 0 auto;
  display: flex; flex-direction: column; gap: .6rem;
  padding: max(env(safe-area-inset-top), .6rem) max(env(safe-area-inset-right), .9rem) max(env(safe-area-inset-bottom), .6rem) max(env(safe-area-inset-left), .9rem);
}

/* Cabeçalho: marca e botões em cima, logos dos marketplaces logo abaixo. */
.topbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'brand actions' 'tabs tabs'; align-items: center; gap: .55rem .8rem; flex-shrink: 0; }
.brand { grid-area: brand; display: flex; align-items: center; gap: .55rem; min-width: 0; color: var(--text); text-decoration: none; }
.brand img { width: 2.1rem; height: 2.1rem; object-fit: contain; border-radius: .55rem; background: var(--logo-bg); flex-shrink: 0; }
.brand h1 { font: 800 1.1rem/1.1 var(--font-display); letter-spacing: -.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-actions { grid-area: actions; display: flex; gap: .45rem; }
.icon-button { position: relative; width: 2.2rem; height: 2.2rem; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); font-size: 1.15rem; line-height: 1; display: grid; place-items: center; padding: 0; }
#info-button span { font: 800 1rem var(--font-display); }
#info-button[data-alert]::after { content: ''; position: absolute; top: .05rem; right: .05rem; width: .5rem; height: .5rem; border-radius: 50%; background: var(--warn); box-shadow: 0 0 0 2px var(--bg); }

.market-tabs { grid-area: tabs; display: grid; grid-template-columns: repeat(3, 1fr); gap: .55rem; }
.market-tab {
  --accent: var(--ml-border); --glow: rgba(255, 230, 0, .55);
  height: 3rem; padding: .3rem; display: flex; align-items: center; justify-content: center; overflow: hidden;
  border: 2px solid var(--line); border-radius: .9rem; background: var(--tab-bg);
  opacity: .5; filter: saturate(.55); transition: opacity .2s, filter .2s, border-color .2s, box-shadow .2s, transform .2s;
}
.market-tab[data-market='shopee'] { --accent: var(--shopee); --glow: rgba(238, 77, 45, .4); }
.market-tab[data-market='tiktok'] { --accent: var(--tiktok); --glow: rgba(37, 244, 238, .5); }
.market-tab:hover { opacity: .8; filter: none; }
.market-tab[aria-selected='true'] { opacity: 1; filter: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--glow) 55%, transparent), 0 4px 18px var(--glow); }
.market-tab img { display: block; height: 100%; width: auto; max-width: 100%; aspect-ratio: 1; object-fit: contain; border-radius: .55rem; }
.logo-fallback { display: none; color: #19231e; font: 800 .85rem/1.1 var(--font-display); text-align: center; }
.logo-failed img { display: none; }
.logo-failed .logo-fallback { display: block; }

/* Seletor "Por preço | Por margem": só aparece quando os dois blocos não cabem. */
.segmented { display: flex; padding: .18rem; border: 1px solid var(--line); border-radius: .6rem; background: var(--surface-soft); gap: .15rem; }
.segmented button { flex: 1; border: 0; padding: 0 .5rem; border-radius: .42rem; background: transparent; font-size: .8rem; font-weight: 600; color: var(--muted); }
.segmented [aria-pressed='true'] { background: var(--text); color: var(--surface); }
.view-switch { display: none; flex-shrink: 0; height: 2.3rem; }
.single .view-switch { display: flex; }
.single .block:not(.is-current) { display: none; }

/* Área dos blocos: encolhe até o espaço restante, sem rolagem. */
.blocks { flex: 0 1 auto; min-height: 0; display: grid; gap: .6rem; overflow: hidden; }
.typing .blocks { overflow-y: auto; overscroll-behavior: contain; }
.block { display: flex; flex-direction: column; gap: .5rem; padding: .7rem .9rem .8rem; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); box-shadow: var(--shadow); }
.block-title { font: 800 .98rem/1.2 var(--font-display); letter-spacing: -.02em; }
.block-body { flex: 1; display: grid; gap: .6rem; align-content: center; }

.inputs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem .7rem; align-content: start; }
.blocks:not([data-market='mercadoLivre']) .ml-only, .blocks:not([data-market='tiktok']) .tiktok-only { display: none; }
.field { min-width: 0; }
.field-head { display: flex; align-items: center; justify-content: space-between; gap: .3rem; height: 1.35rem; }
.field label, .field .label { font-size: .76rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chip { flex-shrink: 0; font-size: .66rem; font-weight: 600; line-height: 1; padding: .22rem .45rem; border-radius: 99px; border: 1px solid var(--line); background: var(--surface-soft); color: var(--muted); }
.chip[aria-pressed='true'] { background: var(--brand); border-color: var(--brand); color: var(--surface); }
.input-wrap { position: relative; display: flex; align-items: center; gap: .4rem; height: 2.55rem; padding: 0 .65rem; border: 1px solid var(--line); border-radius: .6rem; background: var(--input-bg); transition: border-color .2s, box-shadow .2s; }
.input-wrap:focus-within { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-soft); }
.input-wrap:has([aria-invalid='true']) { border-color: var(--bad); }
.input-wrap > span { color: var(--muted); font-size: .76rem; }
input[type='text'] { width: 100%; min-width: 0; background: transparent; color: var(--text); border: 0; outline: 0; padding: 0; font-weight: 600; font-size: max(1.02rem, 16px); font-variant-numeric: tabular-nums; }
input[type='text']:focus-visible { outline: none; }
/* Erro de campo: fica sobre a borda inferior, sem empurrar o layout. */
.field-error { position: absolute; right: .45rem; bottom: -.5rem; max-width: calc(100% - .9rem); padding: .05rem .3rem; border-radius: .3rem; background: var(--surface); color: var(--bad); font-size: .64rem; font-weight: 600; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none; }
.field-error:empty { display: none; }
.field .segmented { height: 2.55rem; }

/* Resultado e gráfico "Para onde vai o dinheiro". */
.result { --tone: var(--good); --tone-soft: var(--good-soft); display: grid; gap: .45rem; align-content: start; padding: .55rem .75rem .65rem; border-radius: .85rem; border: 1px solid color-mix(in srgb, var(--tone) 22%, var(--line)); background: linear-gradient(140deg, var(--surface), var(--tone-soft)); }
.result[data-tone='bad'] { --tone: var(--bad); --tone-soft: var(--bad-soft); }
.result[data-tone='warn'] { --tone: var(--warn); --tone-soft: var(--warn-soft); }
.result[data-tone='empty'] { --tone: var(--muted); --tone-soft: var(--surface-soft); }
.headline { display: flex; align-items: baseline; justify-content: space-between; gap: .6rem; min-width: 0; }
.headline-label { color: var(--muted); font-size: .78rem; font-weight: 600; }
.headline-value { color: var(--tone); font: 800 1.85rem/1.1 var(--font-display); letter-spacing: -.04em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.money h3 { font: 700 .72rem var(--font-display); color: var(--muted); letter-spacing: .01em; }
.composition { display: flex; gap: 2px; height: .5rem; margin: .35rem 0 .4rem; border-radius: .5rem; overflow: hidden; background: var(--surface-soft); }
.composition span { min-width: 1px; height: 100%; transition: width .25s; }
.legend { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .1rem .75rem; }
.legend li { position: relative; container-type: inline-size; display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: .3rem; font-size: .74rem; line-height: 1.5; }
.legend .swatch { width: .48rem; height: .48rem; border-radius: 2px; }
.legend .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.legend .short { display: none; }
.legend .amount { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.legend .share { min-width: 2.25rem; text-align: right; color: var(--muted); font-size: .68rem; font-variant-numeric: tabular-nums; }
.legend .profit-row { grid-column: 1 / -1; border-top: 1px solid var(--line); margin-top: .15rem; padding-top: .15rem; font-weight: 700; }
.legend .profit-row .amount { color: var(--tone); }
/* Itens estreitos usam o nome curto; o nome completo continua disponível para leitores de tela. */
@container (max-width: 15.5rem) { .legend .long { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); } .legend .short { display: inline; } }
.result-msg { color: var(--muted); font-size: .76rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: .2rem 0; }

/* Painel de informações sobreposto: não ocupa espaço na tela. */
.info-dialog { width: min(34rem, calc(100vw - 2rem)); max-height: 80dvh; padding: 0; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); color: var(--text); box-shadow: 0 20px 60px rgba(0,0,0,.25); font-size: max(.85rem, 13px); }
.info-dialog::backdrop { background: rgba(10, 20, 14, .45); }
.info-head { position: sticky; top: 0; display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .8rem 1rem; background: var(--surface); border-bottom: 1px solid var(--line); }
.info-head h2 { font: 800 1.05rem var(--font-display); }
.info-content { padding: .4rem 1rem 1rem; outline: none; }
.info-content h3 { font: 800 .9rem var(--font-display); margin: .8rem 0 .3rem; }
.info-content p { margin: 0 0 .45rem; line-height: 1.5; }
.info-content .muted { color: var(--muted); }

.notice { font-size: .8rem; padding: .7rem .9rem; border-radius: .6rem; color: var(--warn); background: var(--warn-soft); }
.notice.danger { color: var(--bad); background: var(--bad-soft); }
.tab-enter { animation: reveal .22s ease both; }
@keyframes reveal { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.sr-only { position: absolute; top: 0; left: 0; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Computador, notebook e tablet deitado: entradas à esquerda, resultado e gráfico à direita. */
@media (min-width: 700px) and (min-aspect-ratio: 1/1), (min-width: 1000px) {
  html { font-size: clamp(11px, min(2.45vh, 2.4vw), 22px); }
  .block-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr); gap: 1.1rem; align-items: center; }
  .headline { flex-direction: column; align-items: flex-start; gap: .1rem; }
  .headline-value { font-size: 2.15rem; }
  .block { padding: .8rem 1.1rem .9rem; }
}
/* Telas largas: cabeçalho em uma linha só. */
@media (min-width: 900px) {
  .topbar { grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: 'brand tabs actions'; }
  .market-tabs { width: min(100%, 27rem); justify-self: center; }
}
/* Telas altas: legenda em uma coluna, como no gráfico de referência. */
@media (min-width: 1000px) and (min-height: 900px) {
  .legend { grid-template-columns: 1fr; }
  .legend li { font-size: .78rem; }
}
/* Celular deitado e telas baixas: blocos lado a lado. */
@media (orientation: landscape) and (max-height: 600px) {
  html { font-size: clamp(10px, min(3.3vh, 1.9vw), 16px); }
  .app { gap: .45rem; }
  .topbar { grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: 'brand tabs actions'; }
  .market-tabs { width: min(100%, 22rem); justify-self: center; }
  .market-tab { height: 2.5rem; }
  .blocks { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 1fr; }
  .block-body { grid-template-columns: 1fr; gap: .5rem; align-content: center; }
  .headline { flex-direction: row; align-items: baseline; }
  .headline-value { font-size: 1.7rem; }
  .legend { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
```

## script.js

```javascript
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

  // Os dois blocos usam o mesmo componente; muda só o campo principal e o resultado.
  const KINDS = {
    price: { title: 'Cálculo por preço', main: 'price', mainLabel: 'Preço de venda', unit: 'R$', resultLabel: 'Margem de contribuição' },
    margin: { title: 'Cálculo por margem', main: 'target', mainLabel: 'Margem alvo', unit: '%', resultLabel: 'Preço de venda necessário' }
  };

  function inputHtml(p, key, unit, hidden) {
    const before = unit === 'R$' ? '<span>R$</span>' : '';
    const after = unit === 'R$' ? '' : '<span>' + unit + '</span>';
    return '<div class="input-wrap" data-input="' + key + '"' + (hidden ? ' hidden' : '') + '>' + before +
      '<input id="' + p + '-' + key + '" type="text" inputmode="decimal" autocomplete="off" aria-describedby="' + p + '-' + key + '-error">' + after +
      '<small id="' + p + '-' + key + '-error" class="field-error"></small></div>';
  }
  function fieldHtml(p, key, label, unit, extraClass = '') {
    return '<div class="field ' + extraClass + '"><div class="field-head"><label for="' + p + '-' + key + '">' + label + '</label></div>' + inputHtml(p, key, unit) + '</div>';
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
        fieldHtml(p, 'cost', 'Custo do produto', 'R$') +
        '<div class="field ml-only"><div class="field-head"><label id="' + p + '-ship-label" for="' + p + '-weight">Peso</label>' +
          '<button id="' + p + '-manual" class="chip" type="button" aria-pressed="false">Frete manual</button></div>' +
          inputHtml(p, 'weight', 'kg') + inputHtml(p, 'manualShipping', 'R$', true) + '</div>' +
        '<div id="' + p + '-fast-field" class="field ml-only"><div class="field-head"><span id="' + p + '-fast-label" class="label">Frete grátis rápido</span></div>' +
          '<div class="segmented" role="group" aria-labelledby="' + p + '-fast-label"><button id="' + p + '-fast-no" type="button" aria-pressed="true">Não</button><button id="' + p + '-fast-yes" type="button" aria-pressed="false">Sim</button></div></div>' +
        fieldHtml(p, 'affiliate', 'Comissão de afiliado', '%', 'tiktok-only') +
      '</form>' +
      '<div id="' + p + '-result" class="result" data-tone="empty">' +
        '<div class="headline"><span class="headline-label">' + t.resultLabel + '</span><strong id="' + p + '-value" class="headline-value">—</strong></div>' +
        '<div class="money"><h3>Para onde vai o dinheiro</h3><div id="' + p + '-bar" class="composition" aria-hidden="true"></div>' +
          '<ul id="' + p + '-list" class="legend" aria-label="Para onde vai o dinheiro"></ul><p id="' + p + '-msg" class="result-msg" hidden></p></div>' +
      '</div></div>';
    $('blocks').append(section);

    const el = id => $(p + '-' + id);
    const keys = [t.main, 'cost', 'weight', 'manualShipping', 'affiliate'];
    const state = { fast: C.defaults.fastShipping, manual: C.defaults.manualMode, shown: 0, frame: 0, quote: null, notes: [] };
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
    function visibility(data) {
      section.querySelector('[data-input="weight"]').hidden = state.manual;
      section.querySelector('[data-input="manualShipping"]').hidden = !state.manual;
      el('ship-label').textContent = state.manual ? 'Frete' : 'Peso';
      el('ship-label').htmlFor = p + '-' + (state.manual ? 'manualShipping' : 'weight');
      el('manual').setAttribute('aria-pressed', String(state.manual));
      // Por preço: só abaixo do frete obrigatório. Por margem: sempre, pois o preço é a resposta.
      el('fast-field').hidden = kind === 'price' && !(finite(data.price) && data.price < ML.mandatoryFreeShippingFrom);
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
      } else notes.push('Faixa vigente: ' + r.rules.bandLabel + '. Taxas sobre o preço de venda.');
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
      if (kind === 'price') { const r = calculate(market, data); if (r.ok) quote = r; }
      else if (!invalid) { const m = minimumPrice(market, data, data.target); if (m.ok) quote = m.quote; }
      state.quote = quote;
      el('result').dataset.tone = quote ? quote.tone : 'empty';
      el('msg').hidden = !!quote;
      if (quote) {
        if (kind === 'price') animate(quote.margin, percent); else animate(quote.price, money);
        chart(quote);
        state.notes = notesFor(data, quote);
      } else {
        cancelAnimationFrame(state.frame); state.shown = 0;
        el('value').textContent = '—';
        el('msg').textContent = shortMessage(data, invalid);
        el('list').replaceChildren(); el('bar').replaceChildren();
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
    setFast(state.fast);
    return { id: p, title: t.title, section, update, state };
  }

  const blocks = [createBlock('preco', 'price'), createBlock('margem', 'margin')];

  function renderInfo() {
    const content = $('info-content');
    content.replaceChildren();
    const add = (tag, text, cls) => { const n = document.createElement(tag); n.textContent = text; if (cls) n.className = cls; content.append(n); return n; };
    blocks.forEach(b => {
      add('h3', b.title + ' · ' + C[market].name);
      if (!b.state.notes.length) add('p', 'Complete os campos para ver as faixas aplicadas.', 'muted');
      b.state.notes.forEach(n => add('p', n));
    });
    add('h3', 'Sobre o cálculo');
    add('p', 'Margem de contribuição não é lucro líquido. A simulação considera somente os custos e taxas exibidos. Impostos, anúncios, embalagem e despesas operacionais não estão incluídos.');
    add('p', 'Mercado Livre: o frete usa somente o peso informado. Frete grátis rápido é opcional abaixo de ' + money(ML.mandatoryFreeShippingFrom) + '. Abaixo de ' + money(ML.cheapShippingCap.below) + ', o frete fica limitado a ' + decimal(ML.cheapShippingCap.rate * 100, 0) + '% do preço. O frete manual substitui a tabela.');
    add('p', 'Shopee: R$ 200,00 foi incluído na última faixa. TikTok: frete percentual e afiliado incidem sobre o preço de venda.');
    add('p', 'As taxas seguem os valores informados pela Sellneeds, sem consulta automática aos marketplaces. Os cálculos usam precisão completa; o preço por margem é arredondado para cima ao centavo.', 'muted');
    add('p', 'Regras: ' + C.version + '.', 'muted');
  }

  let announcement = 0;
  function refresh() {
    blocks.forEach(b => b.update());
    $('info-button').toggleAttribute('data-alert', blocks.some(b => b.state.quote && (b.state.quote.rules.capped || b.state.quote.profit < -EPS)));
    if ($('info-dialog').open) renderInfo();
    clearTimeout(announcement);
    announcement = setTimeout(() => {
      const [a, b] = blocks.map(x => x.state.quote);
      $('live-summary').textContent = C[market].name + ': ' + (a ? 'margem ' + percent(a.margin) : 'margem indisponível') + '; ' + (b ? 'preço necessário ' + money(b.price) : 'preço indisponível') + '.';
    }, 500);
  }

  // Tela única: se os dois blocos não couberem, mostra um por vez com o seletor.
  // Pontos de corte: retrato com altura < 740 px, ou qualquer tela com altura < 341 px.
  const singleQuery = window.matchMedia('(orientation: portrait) and (max-height: 739px), (max-height: 340px)');
  function fit() {
    if (html.classList.contains('typing')) return;
    html.classList.toggle('single', singleQuery.matches);
    if (html.classList.contains('single')) return;
    const area = $('blocks');
    const overflow = area.scrollHeight > area.clientHeight + 1 || area.scrollWidth > area.clientWidth + 1 || blocks.some(b => b.section.scrollHeight > b.section.clientHeight + 1);
    html.classList.toggle('single', overflow);
  }
  function setView(id) {
    blocks.forEach(b => b.section.classList.toggle('is-current', b.id === id));
    document.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === id)));
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
```

## config.js

```javascript
/* SELLNEEDS · CONFIGURAÇÃO
 * Edite apenas este arquivo para atualizar regras.
 * Use ponto decimal no código: 12% = 0.12; R$ 6,85 = 6.85.
 * Faixas: início incluso, final exclusivo. null no final = sem limite.
 * Valores fornecidos pela Sellneeds, sem atualização automática.
 */
(function (root) {
  'use strict';
  const config = {
    version: '22/10/2026 · regras Sellneeds · ML somente peso informado',
    currency: 'BRL',
    locale: 'pt-BR',
    marginColors: { low: 0.10, high: 0.20 }, // Vermelho <10%; amarelo 10–20%; verde >20%.
    maxInput: 1000000000, // Protege a precisão numérica dos campos.
    defaults: {
      price: 100, cost: 50,
      weight: 0.4, affiliate: 0, target: 20, manualShipping: 0,
      fastShipping: false, manualMode: false
    },
    mercadoLivre: {
      name: 'Mercado Livre',
      commission: 0.12,
      mandatoryFreeShippingFrom: 79,
      cheapShippingCap: { below: 19, rate: 0.50 },
      // Índice começa em zero: 3 aponta para P4. Sem duplicar a tabela.
      fastShippingColumn: 3,
      priceBands: [
        { min: 0, max: 19, label: 'P1' },
        { min: 19, max: 49, label: 'P2' },
        { min: 49, max: 79, label: 'P3' },
        { min: 79, max: 100, label: 'P4' },
        { min: 100, max: 120, label: 'P5' },
        { min: 120, max: 150, label: 'P6' },
        { min: 150, max: 200, label: 'P7' },
        { min: 200, max: null, label: 'P8' }
      ],
      // Peso máximo em kg | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8
      shippingTable: [
        [0.3, 5.65, 6.85, 8.15, 12.95, 14.95, 16.95, 19.05, 21.65],
        [0.5, 5.95, 6.95, 8.25, 13.85, 16.15, 18.15, 20.45, 23.25],
        [1,   6.05, 7.15, 8.45, 14.45, 16.85, 19.05, 21.35, 24.45],
        [1.5, 6.15, 7.35, 8.65, 14.75, 17.15, 19.45, 21.75, 25.45],
        [2,   6.25, 7.45, 8.75, 15.05, 17.65, 19.85, 22.25, 25.55],
        [3,   6.35, 8.65, 9.15, 16.45, 19.15, 21.65, 24.35, 27.05],
        [4,   6.45, 8.75, 9.75, 17.85, 20.75, 23.35, 26.35, 29.25],
        [5,   6.55, 8.85, 10.25,19.75, 22.85, 26.05, 29.25, 32.45],
        [6,   6.65, 8.95, 10.35,25.95, 29.15, 33.35, 36.45, 40.85],
        [7,   6.75, 9.05, 10.45,27.55, 31.65, 36.75, 40.85, 45.25],
        [8,   6.85, 9.25, 10.55,29.45, 34.35, 39.25, 44.15, 49.35],
        [9,   6.95, 9.35, 10.65,30.25, 35.25, 40.35, 45.35, 50.75],
        [10,  7.05, 9.45, 10.85,38.25, 45.05, 51.95, 58.75, 65.85],
        [11,  7.05, 9.65, 11.05,41.65, 48.55, 55.45, 62.35, 69.35],
        [13,  7.15,10.05, 11.45,42.55, 49.75, 56.85, 63.85, 70.95],
        [15,  7.25,10.25, 11.65,45.55, 52.95, 60.55, 68.15, 75.65],
        [17,  7.35,10.45, 11.85,48.95, 56.55, 64.05, 71.35, 79.35],
        [20,  7.45,10.65, 12.05,55.15, 64.35, 73.55, 82.75, 91.95]
      ]
    },
    shopee: {
      name: 'Shopee',
      bands: [
        { min: 0, max: 80, commission: 0.20, fixed: 4 },
        { min: 80, max: 100, commission: 0.14, fixed: 16 },
        { min: 100, max: 200, commission: 0.14, fixed: 20 },
        { min: 200, max: null, commission: 0.14, fixed: 26 }
      ]
    },
    tiktok: {
      name: 'TikTok Shop',
      bands: [
        { min: 0, max: 50, commission: 0.10, fixed: 4, shippingRate: 0.06, shippingFixed: 0 },
        { min: 50, max: null, commission: 0.06, fixed: 6, shippingRate: 0, shippingFixed: 6 }
      ]
    }
  };
  root.SELLNEEDS_CONFIG = config;
  // Permite executar os testes com Node, sem instalar bibliotecas.
  if (typeof module !== 'undefined' && module.exports) module.exports = config;
})(typeof window !== 'undefined' ? window : globalThis);
```
