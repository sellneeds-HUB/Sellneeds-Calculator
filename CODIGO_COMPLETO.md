# Código completo · Sellneeds

Interface de 23/10/2026. Copie cada bloco para o arquivo com o nome indicado. Os logos ficam em `img/`, conforme o LEIA-ME.

## index.html

```html
<!doctype html>
<html lang="pt-BR" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f4f6f3">
  <title>Margem · Sellneeds</title>
  <link rel="icon" type="image/png" href="logo-sellneeds.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script src="config.js" defer></script>
  <script src="script.js" defer></script>
</head>
<body>
  <div class="app-shell" id="app-shell">
    <header class="app-header">
      <img class="brand-logo" src="logo-sellneeds.png" width="250" height="250" alt="Sellneeds">
      <h1>Calculadora de margem</h1>
    </header>
    <nav class="market-tabs" role="tablist" aria-label="Marketplace">
      <button class="market-tab" type="button" role="tab" id="tab-mercadoLivre" data-market="mercadoLivre" aria-label="Mercado Livre" aria-selected="true" aria-controls="calculator">
        <img src="img/mercadolivre.webp" alt="Mercado Livre" width="160" height="160" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><span class="logo-fallback" hidden>Mercado Livre</span>
      </button>
      <button class="market-tab" type="button" role="tab" id="tab-shopee" data-market="shopee" aria-label="Shopee" aria-selected="false" aria-controls="calculator" tabindex="-1">
        <img src="img/shopee.webp" alt="Shopee" width="160" height="160" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><span class="logo-fallback" hidden>Shopee</span>
      </button>
      <button class="market-tab" type="button" role="tab" id="tab-tiktok" data-market="tiktok" aria-label="TikTok Shop" aria-selected="false" aria-controls="calculator" tabindex="-1">
        <img src="img/tiktok.webp" alt="TikTok Shop" width="160" height="160" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><span class="logo-fallback" hidden>TikTok Shop</span>
      </button>
    </nav>
    <p id="fatal-error" class="notice error" role="alert" hidden></p>
    <main class="calculator" id="calculator" data-market="mercadoLivre" role="tabpanel" aria-labelledby="tab-mercadoLivre">
      <form id="calculator-form" class="panel form-panel" novalidate>
        <div class="panel-heading">
          <h2>Preço e custos</h2>
          <button type="button" id="manual-button" class="icon-button" aria-label="Configurar frete manual" aria-haspopup="dialog" aria-controls="manual-dialog" title="Frete manual"><span aria-hidden="true">⚙</span></button>
        </div>
        <div class="fields-grid">
          <div class="field"><label for="price">Preço</label><div class="input-wrap"><span>R$</span><input id="price" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" aria-describedby="price-error"></div><small id="price-error" class="sr-only"></small></div>
          <div class="field"><label for="cost">Custo</label><div class="input-wrap"><span>R$</span><input id="cost" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" aria-describedby="cost-error"></div><small id="cost-error" class="sr-only"></small></div>
          <div class="field" id="weight-section"><label for="weight">Peso</label><div class="input-wrap"><input id="weight" type="text" inputmode="decimal" autocomplete="off" aria-describedby="weight-error"><span>kg</span></div><small id="weight-error" class="sr-only"></small></div>
          <div class="field" id="fast-section"><label for="fast-shipping">Frete rápido</label><select id="fast-shipping" aria-label="Oferecer frete grátis rápido"><option value="false">Não</option><option value="true">Sim</option></select></div>
          <div class="field" id="affiliate-section" hidden><label for="affiliate">Afiliado</label><div class="input-wrap"><input id="affiliate" type="text" inputmode="decimal" autocomplete="off" aria-describedby="affiliate-error"><span>%</span></div><small id="affiliate-error" class="sr-only"></small></div>
        </div>
        <p id="form-notice" class="notice" role="status" hidden></p>
      </form>
      <section class="panel result-panel" id="result-card" data-tone="good" aria-label="Resultado">
        <div class="panel-heading"><h2>Resultado</h2><span id="result-status" class="status"></span></div>
        <div class="result-values">
          <div class="metric"><span class="metric-label">Lucro</span><strong id="profit" class="big-value">—</strong></div>
          <div class="metric margin-metric"><span class="metric-label">Margem de contribuição</span><strong id="margin" class="big-value">—</strong></div>
        </div>
        <div class="goal-grid">
          <div class="field"><label for="target">Meta de margem (%)</label><div class="input-wrap"><input id="target" type="text" inputmode="decimal" autocomplete="off" placeholder="Sem meta" aria-describedby="target-error"><span>%</span></div><small id="target-error" class="sr-only"></small></div>
          <div class="ideal"><span class="metric-label" id="ideal-title">Preço para a meta</span><strong id="ideal-price">—</strong><span id="ideal-profit" class="ideal-profit"></span></div>
        </div>
        <p id="ideal-status" class="notice" role="status" hidden></p>
        <div class="breakdown-trigger"><div id="composition" class="composition" role="img" aria-label="Composição do preço; valores em Detalhes"></div><button id="details-button" type="button" class="text-button" aria-haspopup="dialog" aria-controls="details-dialog">Detalhes <span aria-hidden="true">↗</span></button></div>
      </section>
    </main>
    <div id="live-summary" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  </div>
  <dialog id="details-dialog" class="modal" aria-labelledby="details-title">
    <div class="dialog-heading"><h2 id="details-title">Detalhes</h2><button type="button" class="icon-button" data-close="details-dialog" aria-label="Fechar detalhes">×</button></div>
    <div class="detail-summary"><strong id="detail-market"></strong><span>Venda <b id="result-price">—</b></span></div>
    <div id="breakdown-list" class="breakdown-list"></div>
    <div class="detail-total"><span>Custo total</span><strong id="total-cost">—</strong></div>
    <p id="rate-note" class="notice"></p>
    <p id="ideal-note" class="notice" hidden></p>
    <p id="loss-note" class="notice error" hidden></p>
  </dialog>
  <dialog id="manual-dialog" class="modal manual-modal" aria-labelledby="manual-title">
    <div class="dialog-heading"><h2 id="manual-title">Frete manual</h2><button type="button" class="icon-button" data-close="manual-dialog" aria-label="Fechar frete manual">×</button></div>
    <label class="check-label" for="manual-mode"><input id="manual-mode" type="checkbox">Usar frete manual</label>
    <div id="manual-section" class="field" hidden><label for="manualShipping">Valor</label><div class="input-wrap"><span>R$</span><input id="manualShipping" type="text" inputmode="decimal" autocomplete="off" aria-describedby="manualShipping-error"></div><small id="manualShipping-error" class="field-error"></small></div>
  </dialog>
  <noscript><p class="noscript">Ative o JavaScript para usar a calculadora.</p></noscript>
</body>
</html>
```

## style.css

```css
/* SELLNEEDS · Identidade editável; os cálculos ficam em script.js/config.js. */
:root {
  --font-body: 'DM Sans', Arial, sans-serif;
  --font-display: 'Manrope', Arial, sans-serif;
  --bg: #f4f6f3; --surface: #ffffff; --surface-soft: #f3f6f2;
  --text: #1c2922; --muted: #627064; --line: #dce4da;
  --brand: #226a49; --brand-soft: #eaf4ec;
  --good: #226a49; --good-soft: #eaf4ec;
  --bad: #bb3843; --bad-soft: #fff0f0;
  --warn: #946900; --warn-soft: #fff7db;
  --ml: #b19500; --shopee: #ee4d2d; --tiktok: #245e60;
  --cost: #8d9c91; --commission: #b5c6b8; --fixed: #dbb862;
  --shipping: #aea3d7; --affiliate: #e7a18d;
  --logo-bg: #ffffff; --radius: clamp(.8rem, 1.4vw, 1.5rem);
  --shadow: 0 .3rem 2rem #213c240a;
  --gap: clamp(.65rem, 2dvh, 1.5rem);
  --pad: clamp(.85rem, 2.6dvh, 2rem);
  --label-size: clamp(.75rem, 1vw, .9rem);
  --small-size: clamp(.7rem, .9vw, .85rem);
  --control-height: clamp(2.5rem, 6dvh, 3.5rem);
}
:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #141c17; --surface: #1d2820; --surface-soft: #26342a;
  --text: #edf4ee; --muted: #b4c1b7; --line: #3d4c40;
  --brand: #96d4aa; --brand-soft: #284131;
  --good: #96d4aa; --good-soft: #284131;
  --bad: #ffacb3; --bad-soft: #43272b;
  --warn: #efce79; --warn-soft: #41391f;
  --ml: #e7c755; --tiktok: #8ad6d0; --shadow: 0 .3rem 2rem #00000020;
}
* { box-sizing: border-box; min-inline-size: 0; }
html, body { margin: 0; inline-size: 100%; height: 100vh; height: 100dvh; overflow: hidden; }
body { color: var(--text); background: var(--bg); font-family: var(--font-body); }
button, input, select { font: inherit; color: inherit; }
button { cursor: pointer; }
button:disabled, select:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, input:focus-visible, select:focus-visible { outline: .15rem solid var(--brand); outline-offset: .15rem; }
[hidden] { display: none !important; }
h1, h2, p { margin: 0; }
h1 { font: 800 clamp(1rem, 2vw, 1.7rem)/1.2 var(--font-display); letter-spacing: -.04em; }
h2 { font: 700 clamp(.85rem, 1.2vw, 1.1rem)/1.25 var(--font-display); }
.app-shell {
  inline-size: 100%; max-inline-size: 76rem; margin-inline: auto;
  height: 100vh; height: 100dvh;
  padding: max(clamp(.75rem, 3dvh, 2.5rem), env(safe-area-inset-top)) max(clamp(.75rem, 3vw, 2rem), env(safe-area-inset-right)) max(clamp(.75rem, 3dvh, 2.5rem), env(safe-area-inset-bottom)) max(clamp(.75rem, 3vw, 2rem), env(safe-area-inset-left));
  display: grid; grid-template-rows: auto auto minmax(0, 1fr); gap: var(--gap);
}
.app-header { display: flex; align-items: center; justify-content: center; gap: .6rem; }
.brand-logo { inline-size: clamp(2rem, 5dvh, 3rem); block-size: auto; aspect-ratio: 1; object-fit: contain; border-radius: .5rem; background: var(--logo-bg); }
.market-tabs { display: flex; align-items: center; justify-content: center; gap: clamp(1rem, 3vw, 2.5rem); }
.market-tab {
  --accent: var(--brand); padding: .2rem; border: .12rem solid transparent; border-radius: clamp(.8rem, 1.5vw, 1.2rem);
  background: var(--logo-bg); opacity: .48; min-block-size: 2.5rem; min-inline-size: 2.5rem;
  display: grid; place-items: center; transition: opacity .16s, box-shadow .16s, border-color .16s;
}
.market-tab[data-market='mercadoLivre'] { --accent: var(--ml); }
.market-tab[data-market='shopee'] { --accent: var(--shopee); }
.market-tab[data-market='tiktok'] { --accent: var(--tiktok); }
.market-tab[aria-selected='true'] { opacity: 1; border-color: var(--accent); box-shadow: 0 0 0 .2rem color-mix(in srgb, var(--accent) 18%, transparent); }
.market-tab:hover { opacity: 1; }
.market-tab img { display: block; inline-size: clamp(2.7rem, 8dvh, 5rem); block-size: clamp(2.7rem, 8dvh, 5rem); object-fit: contain; border-radius: .6rem; }
.logo-fallback { display: grid; place-items: center; inline-size: clamp(2.7rem, 8dvh, 5rem); min-block-size: clamp(2.7rem, 8dvh, 5rem); font-size: .65rem; font-weight: 700; color: #17231c; text-align: center; }
.calculator { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: var(--gap); min-block-size: 0; max-block-size: 40rem; align-self: center; block-size: 100%; }
.panel { border: 1px solid var(--line); border-radius: var(--radius); padding: var(--pad); background: var(--surface); box-shadow: var(--shadow); min-block-size: 0; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: .5rem; min-block-size: 2.5rem; }
.form-panel { display: flex; flex-direction: column; gap: clamp(.5rem, 3dvh, 2rem); margin: 0; }
.icon-button { min-inline-size: 2.5rem; min-block-size: 2.5rem; display: grid; place-items: center; border: 1px solid var(--line); border-radius: .65rem; background: var(--surface-soft); font-size: 1.3rem; line-height: 1; padding: .25rem; }
#manual-button[data-active='true'] { color: var(--brand); border-color: var(--brand); background: var(--brand-soft); }
.fields-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(.65rem, 2.5dvh, 1.6rem) clamp(.65rem, 1.5vw, 1.5rem); }
.field label { display: block; font-size: var(--label-size); font-weight: 500; margin-bottom: .3rem; line-height: 1.2; }
.input-wrap { display: flex; align-items: center; gap: .4rem; padding-inline: clamp(.55rem, 1vw, .9rem); border: 1px solid var(--line); border-radius: .6rem; background: var(--surface-soft); min-block-size: var(--control-height); }
.input-wrap span { font-size: var(--small-size); color: var(--muted); }
.input-wrap:focus-within { border-color: var(--brand); }
.input-wrap:has([aria-invalid='true']) { border-color: var(--bad); }
input[type='text'] { inline-size: 100%; min-block-size: var(--control-height); padding: .1rem 0; border: 0; background: transparent; outline: 0; font-size: clamp(1rem, 1.7vw, 1.5rem); font-weight: 600; font-variant-numeric: tabular-nums; }
input::placeholder { color: var(--muted); font-weight: 400; }
select { inline-size: 100%; min-block-size: var(--control-height); font-size: 1rem; border: 1px solid var(--line); border-radius: .6rem; background: var(--surface-soft); padding: .35rem .55rem; }
.notice { font-size: var(--small-size); line-height: 1.35; color: var(--muted); overflow-wrap: anywhere; }
.error, .field-error { color: var(--bad); }
.field-error { font-size: var(--small-size); }
#form-notice { margin-top: auto; }
.result-panel { --tone: var(--good); --tone-soft: var(--good-soft); display: flex; flex-direction: column; justify-content: space-between; gap: clamp(.6rem, 2.4dvh, 1.7rem); background: linear-gradient(135deg, var(--surface) 30%, var(--tone-soft)); }
.result-panel[data-tone='bad'] { --tone: var(--bad); --tone-soft: var(--bad-soft); }
.result-panel[data-tone='warn'] { --tone: var(--warn); --tone-soft: var(--warn-soft); }
.result-panel[data-tone='empty'] { --tone: var(--muted); --tone-soft: var(--surface-soft); }
.status { font-size: var(--small-size); color: var(--tone); font-weight: 600; text-align: end; }
.result-values { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: .7rem; }
.metric, .ideal { container-type: inline-size; }
.metric-label { display: block; color: var(--muted); font-size: var(--label-size); line-height: 1.2; margin-bottom: .3rem; }
.big-value { color: var(--tone); display: block; font: 800 min(clamp(1.8rem, 6dvh, 4rem), calc(170cqw / var(--digits, 8)))/1.1 var(--font-display); letter-spacing: -.045em; white-space: nowrap; font-variant-numeric: tabular-nums; }
.margin-metric { text-align: right; }
.margin-metric .metric-label { font-size: var(--small-size); }
.goal-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(.65rem, 1.5vw, 1.5rem); border-top: 1px solid var(--line); padding-top: clamp(.65rem, 2.5dvh, 1.8rem); }
.ideal { display: flex; flex-direction: column; justify-content: center; }
#ideal-price { font: 800 min(clamp(1.3rem, 3.6dvh, 2.2rem), calc(170cqw / var(--digits, 8)))/1.15 var(--font-display); letter-spacing: -.03em; white-space: nowrap; }
.ideal-profit { font-size: var(--small-size); color: var(--muted); margin-top: .2rem; }
.breakdown-trigger { display: flex; gap: .8rem; align-items: center; }
.composition { display: flex; flex: 1; block-size: clamp(.3rem, .8dvh, .5rem); background: var(--line); border-radius: 1rem; overflow: hidden; }
.composition span { block-size: 100%; transition: width .18s; }
.text-button { min-block-size: 2.5rem; padding: .35rem .65rem; border: 1px solid var(--line); border-radius: .6rem; background: var(--surface); font-size: var(--small-size); font-weight: 600; white-space: nowrap; }
.modal { inline-size: min(34rem, calc(100% - 2rem)); max-block-size: calc(100dvh - 2rem); margin: auto; padding: clamp(.8rem, 2dvh, 1.5rem); border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); color: var(--text); overflow: hidden; box-shadow: 0 1rem 5rem #0003; }
.modal::backdrop { background: #111b18a6; backdrop-filter: blur(.2rem); }
.modal[open] { display: flex; flex-direction: column; gap: clamp(.4rem, 1.5dvh, 1rem); }
.dialog-heading, .detail-summary, .detail-total { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.detail-summary, .detail-total { font-size: clamp(.75rem, 1.4vw, .95rem); }
.breakdown-list { display: grid; gap: clamp(.35rem, 1dvh, .7rem); }
.breakdown-row { display: grid; grid-template-columns: .45rem minmax(0, 1fr) auto minmax(3.6rem, auto); gap: .4rem; align-items: center; font-size: clamp(.75rem, 1.3vw, .95rem); }
.swatch { inline-size: .4rem; block-size: .4rem; border-radius: .1rem; }
.amount { font-weight: 600; font-variant-numeric: tabular-nums; }
.share { color: var(--muted); text-align: right; font-size: var(--small-size); }
.detail-total { border-top: 1px solid var(--line); padding-top: .5rem; }
.check-label { display: flex; align-items: center; min-block-size: 2.5rem; gap: .5rem; font-size: 1rem; cursor: pointer; }
.check-label input { inline-size: 1.25rem; block-size: 1.25rem; accent-color: var(--brand); }
.manual-modal { max-inline-size: 26rem; }
.sr-only { position: absolute; inline-size: 1px; block-size: 1px; margin: -1px; padding: 0; border: 0; clip-path: inset(50%); overflow: hidden; white-space: nowrap; }
.noscript { position: fixed; inset: auto 1rem 1rem; background: var(--surface); padding: 1rem; }
.tab-enter { animation: enter .16s ease-out; }
@keyframes enter { from { opacity: .7; transform: translateY(.2rem); } to { opacity: 1; transform: translateY(0); } }
/* Celular e tablet em pé: dois blocos empilhados. */
@media (max-width: 56.25rem) and (orientation: portrait) {
  :root { --gap: clamp(.5rem, 1.3dvh, 1rem); --pad: clamp(.75rem, 2dvh, 1.3rem); }
  .app-shell { max-inline-size: 44rem; }
  .calculator { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); max-block-size: none; }
  .form-panel { gap: .55rem; }
  .fields-grid { gap: .65rem .7rem; }
  .result-panel { gap: .7rem; }
  .big-value { font-size: min(clamp(1.9rem, 5dvh, 3.5rem), calc(170cqw / var(--digits, 8))); }
}
/* Telas baixas: altura mínima de toque preservada, blocos lado a lado. */
@media (max-height: 35rem) and (orientation: landscape) {
  :root { --gap: .6rem; --pad: .75rem; --control-height: 2.5rem; }
  .app-shell { grid-template-columns: auto 1fr; grid-template-rows: auto minmax(0, 1fr); padding-block: max(.5rem, env(safe-area-inset-top)) max(.5rem, env(safe-area-inset-bottom)); }
  .app-header { justify-content: flex-start; }
  .market-tabs { justify-content: flex-end; gap: .75rem; }
  .market-tab img, .logo-fallback { inline-size: 2.5rem; block-size: 2.5rem; min-block-size: 2.5rem; }
  .calculator { grid-column: 1 / -1; max-block-size: none; }
  .form-panel { gap: .55rem; }
  .fields-grid { gap: .65rem; }
  .result-panel { gap: .4rem; }
  .result-panel .panel-heading { min-block-size: 1.3rem; }
  .goal-grid { padding-top: .6rem; }
  .big-value { font-size: min(2rem, calc(170cqw / var(--digits, 8))); }
  .modal[open] { gap: .4rem; }
  .breakdown-list { gap: .3rem; }
}
@media (max-width: 25rem) and (orientation: portrait) {
  .app-shell { padding-inline: max(.6rem, env(safe-area-inset-left)) max(.6rem, env(safe-area-inset-right)); padding-block: max(.6rem, env(safe-area-inset-top)) max(.6rem, env(safe-area-inset-bottom)); }
  .result-panel { gap: .5rem; }
  .panel-heading { min-block-size: 2.5rem; }
  .result-panel .panel-heading { min-block-size: 1.4rem; }
  .goal-grid { padding-top: .65rem; }
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
    storage: { target: 'sellneeds-margin-target', theme: 'sellneeds-theme' },
    logos: {
      mercadoLivre: { src: 'img/mercadolivre.webp', width: 160, height: 160 },
      shopee: { src: 'img/shopee.webp', width: 160, height: 160 },
      tiktok: { src: 'img/tiktok.webp', width: 160, height: 160 }
    },
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

