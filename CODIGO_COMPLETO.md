# Código completo · Sellneeds

Versão revisada: Mercado Livre somente por peso informado.

Copie cada bloco inteiro para o arquivo indicado. Mantenha os quatro arquivos e `logo-sellneeds.png` juntos. A imagem está incluída no ZIP.

## index.html

```html
<!doctype html>
<html lang="pt-BR" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#f6f7f9">
  <meta name="description" content="Calcule lucro, margem de contribuição e preço mínimo no Mercado Livre, Shopee e TikTok Shop. Uma ferramenta Sellneeds.">
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
  <a class="skip-link" href="#calculator">Ir para a calculadora</a>
  <header class="site-header wrap">
    <a class="brand" href="./index.html" aria-label="Sellneeds, início">
      <img src="./logo-sellneeds.png" width="64" height="64" alt="Logo Sellneeds">
      <span><strong>Sellneeds<span class="brand-dot">.</span></strong><small>INTELIGÊNCIA PARA VENDER</small></span>
    </a>
    <div class="header-actions"><span class="private-note"><i></i> Cálculo no seu navegador</span><button id="theme-toggle" class="icon-button" type="button" aria-label="Ativar modo escuro" aria-pressed="false"><span id="theme-icon" aria-hidden="true">☾</span></button></div>
  </header>
  <main class="wrap">
    <section class="hero">
      <div><p class="eyebrow"><span></span> CALCULADORA DE MARGEM DE CONTRIBUIÇÃO</p><h1>Venda com clareza.<br>Cresça com <em>margem.</em></h1><p class="hero-copy">Descubra quanto sobra em cada venda e encontre o preço que faz sentido para o seu negócio.</p></div>
      <div class="hero-aside"><span class="outline-icon" aria-hidden="true">↗</span><p>Menos suposição.<br><strong>Mais resultado.</strong></p></div>
    </section>
    <nav class="market-tabs" role="tablist" aria-label="Escolha o marketplace">
      <button class="market-tab" type="button" role="tab" id="tab-mercadoLivre" data-market="mercadoLivre" aria-selected="true" aria-controls="calculator"><span class="market-symbol ml" aria-hidden="true">ML</span><span>Mercado Livre<small>Frete por peso e preço</small></span><span class="tab-arrow" aria-hidden="true">↗</span></button>
      <button class="market-tab" type="button" role="tab" id="tab-shopee" data-market="shopee" aria-selected="false" aria-controls="calculator" tabindex="-1"><span class="market-symbol shopee" aria-hidden="true">S</span><span>Shopee<small>Comissão por faixa</small></span><span class="tab-arrow" aria-hidden="true">↗</span></button>
      <button class="market-tab" type="button" role="tab" id="tab-tiktok" data-market="tiktok" aria-selected="false" aria-controls="calculator" tabindex="-1"><span class="market-symbol tiktok" aria-hidden="true">♪</span><span>TikTok Shop<small>Inclui afiliados</small></span><span class="tab-arrow" aria-hidden="true">↗</span></button>
    </nav>
    <p class="demo-note">Simulação de exemplo preenchida. Edite os valores para calcular o seu produto.</p>
    <div id="fatal-error" class="notice danger" role="alert" hidden></div>
    <section id="calculator" class="calculator" data-market="mercadoLivre" role="tabpanel" aria-labelledby="tab-mercadoLivre" tabindex="0">
      <div class="input-column">
        <form id="calculator-form" novalidate>
          <article class="card form-card">
            <div class="section-title"><span class="step">01</span><div><h2>Dados da venda</h2><p>Comece pelo preço e pelo custo unitário.</p></div><span class="live-badge"><i></i> AO VIVO</span></div>
            <div class="field-grid">
              <div class="field"><label for="price">Preço de venda</label><div class="input-wrap"><span>R$</span><input id="price" name="price" type="text" inputmode="decimal" autocomplete="off" aria-describedby="price-error"></div><small id="price-error" class="field-error"></small></div>
              <div class="field"><label for="cost">Custo do produto</label><div class="input-wrap"><span>R$</span><input id="cost" name="cost" type="text" inputmode="decimal" autocomplete="off" aria-describedby="cost-error"></div><small id="cost-error" class="field-error"></small></div>
            </div>
            <div id="affiliate-section" class="revealed" hidden><div class="field"><label for="affiliate">Comissão de afiliado</label><div class="input-wrap"><input id="affiliate" type="text" inputmode="decimal" autocomplete="off" aria-describedby="affiliate-hint affiliate-error"><span>%</span></div><small id="affiliate-hint">Aplicada sobre o preço de venda. Use zero sem afiliado.</small><small id="affiliate-error" class="field-error"></small></div></div>
            <div id="ml-section" class="revealed">
              <div class="divider"></div>
              <div class="section-title compact"><span class="step">02</span><div><h2>Peso & frete</h2><p>Informe o peso para encontrar a faixa de frete.</p></div></div>
              <div class="field weight-field"><label for="weight">Peso do pacote</label><div class="input-wrap"><input id="weight" type="text" inputmode="decimal" autocomplete="off" aria-describedby="weight-note weight-error"><span>kg</span></div><small id="weight-error" class="field-error"></small></div>
              <p id="weight-note" class="helper-note"></p>
              <div id="fast-section" class="option-row revealed" hidden><div><strong>Oferecer frete grátis rápido?</strong><small id="fast-help"></small></div><div class="segmented" role="group" aria-label="Frete grátis rápido"><button id="fast-no" type="button" aria-pressed="true">Não</button><button id="fast-yes" type="button" aria-pressed="false">Sim</button></div></div>
              <p id="mandatory-note" class="helper-note"></p>
              <label class="checkbox-row" for="manual-mode"><input id="manual-mode" type="checkbox"><span>Informar frete manualmente<small>Substitui o frete automático e o limite para itens baratos.</small></span></label>
              <div id="manual-section" class="field revealed" hidden><label for="manualShipping">Frete por unidade</label><div class="input-wrap"><span>R$</span><input id="manualShipping" type="text" inputmode="decimal" autocomplete="off" aria-describedby="manualShipping-error"></div><small id="manualShipping-error" class="field-error"></small></div>
              <p id="shipping-notice" class="notice" hidden></p>
            </div>
          </article>
          <article class="card goal-card"><div class="section-title compact"><span class="target-icon" aria-hidden="true">◎</span><div><h2>Qual é a sua meta?</h2><p>Encontre o menor preço para a margem desejada.</p></div></div><div class="field"><label for="target">Margem desejada <span class="optional">opcional</span></label><div class="input-wrap"><input id="target" type="text" inputmode="decimal" autocomplete="off" placeholder="Ex.: 20" aria-describedby="target-error"><span>%</span></div><small id="target-error" class="field-error"></small></div><p id="goal-policy" class="helper-note"></p></article>
        </form>
      </div>
      <aside class="result-column" aria-label="Resultado da simulação">
        <article id="result-card" class="card result-card" data-tone="good">
          <div class="result-top"><span class="eyebrow">SEU RESULTADO POR VENDA</span><span id="result-status" class="status-pill">Margem saudável</span></div>
          <div class="profit-label">Lucro de contribuição</div><div id="profit" class="profit">—</div>
          <div class="margin-row"><div><span id="margin">—</span><small>de margem</small></div><p id="result-message">Preencha os dados para começar.</p></div>
          <p id="result-error" class="notice danger" hidden></p>
          <div class="mini-stats"><div><span>Preço de venda</span><strong id="result-price">—</strong></div><div><span>Custo total da venda</span><strong id="total-cost">—</strong></div></div>
          <button id="copy-button" class="copy-button" type="button" disabled><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg><span>Copiar resultado</span></button>
          <p id="copy-status" class="copy-status" role="status"></p>
        </article>
        <article class="card breakdown-card"><div class="breakdown-heading"><h2>Para onde vai o dinheiro</h2><span id="breakdown-base">POR VENDA</span></div><div id="composition" class="composition" aria-hidden="true"></div><p id="loss-note" class="helper-note" hidden></p><div id="breakdown-list" class="breakdown-list"></div><p id="rate-note" class="rate-note"></p></article>
        <article class="card minimum-card"><div class="minimum-heading"><span class="target-icon" aria-hidden="true">↗</span><span>PREÇO MÍNIMO PARA A META</span></div><strong id="minimum-price">—</strong><p id="minimum-description">Informe uma margem desejada.</p><p id="minimum-warning" class="helper-note" hidden></p></article>
      </aside>
    </section>
    <div class="scope-note"><span aria-hidden="true">ⓘ</span><p><strong>Margem de contribuição não é lucro líquido.</strong> A simulação considera somente os custos e taxas exibidos. Impostos, anúncios, embalagem e despesas operacionais não estão incluídos.</p></div>
    <details class="rules-details"><summary>Sobre as regras desta calculadora</summary><p id="config-version"></p><p>As taxas seguem os valores informados pela Sellneeds. Não há consulta automática aos marketplaces. Confira as condições da sua conta antes de definir o preço.</p><p>Shopee: R$ 200,00 foi incluído na última faixa. TikTok: frete percentual e afiliado incidem sobre o preço de venda. O preço mínimo considera as mudanças de faixa; preços maiores podem ter margem menor ao cruzar um limite.</p><p>Valores monetários são exibidos com duas casas. Os cálculos usam a precisão completa antes da exibição, e o preço mínimo é arredondado para cima ao centavo.</p></details>
  </main>
  <footer class="wrap site-footer"><span>Sellneeds<span class="brand-dot">.</span> <small>Ferramentas para crescer.</small></span><small>Feito para decidir melhor, venda após venda.</small></footer>
  <div id="live-summary" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  <noscript><p class="notice danger wrap">Ative o JavaScript do navegador para usar a calculadora.</p></noscript>
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
  --ml: #ffe66a;
  --ml-ink: #453c00;
  --ml-border: #ad9024;
  --shopee: #ee4d2d;
  --shopee-soft: #fff0e9;
  --tiktok: #192b33;
  --tiktok-soft: #e7f1ef;
  --tiktok-ink: #122e2b;
  --logo-bg: #ffffff;
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
  --radius: 20px;
  --shadow: 0 5px 24px rgba(23, 44, 30, .035);
}
:root[data-theme='dark'] {
  color-scheme: dark;
  --brand: #88cf9e; --brand-soft: #21352a; --brand-ink: #b7e8c5;
  --bg: #121714; --surface: #1b221e; --surface-soft: #222b25;
  --text: #edf4ee; --muted: #a6b4aa; --line: #344138; --input-bg: #17201a;
  --good: #91d7a6; --good-soft: #20392a; --bad: #ffabb0; --bad-soft: #402729;
  --warn: #efd187; --warn-soft: #3a3421; --tiktok: #e6f3f1;
  --shadow: 0 5px 24px rgba(0,0,0,.1);
}
* { box-sizing: border-box; }
body { margin: 0; color: var(--text); background: var(--bg); font-family: var(--font-body); font-size: 14px; line-height: 1.5; transition: background .2s, color .2s; }
button, input { font: inherit; }
button, summary { cursor: pointer; }
button { color: inherit; }
button:focus-visible, input:focus-visible, summary:focus-visible, a:focus-visible, [tabindex='0']:focus-visible { outline: 3px solid var(--brand); outline-offset: 4px; }
button:disabled { opacity: .5; cursor: not-allowed; }
[hidden] { display: none !important; }
.wrap { width: min(1152px, calc(100% - 48px)); margin: 0 auto; }
.site-header { display: flex; justify-content: space-between; align-items: center; padding: 22px 0; border-bottom: 1px solid var(--line); }
.brand { display: flex; align-items: center; gap: 12px; color: var(--text); text-decoration: none; }
.brand img { width: 56px; height: 56px; object-fit: contain; border-radius: 12px; background: var(--logo-bg); }
.brand strong { display: block; font: 800 23px var(--font-display); letter-spacing: -1px; }
.brand small { display: block; font-size: 8px; font-weight: 700; letter-spacing: 1.5px; margin-top: 4px; }
.brand-dot { color: var(--brand); }
.header-actions { display: flex; gap: 22px; align-items: center; }
.private-note { color: var(--muted); font-size: 11px; display: flex; align-items: center; gap: 7px; }
i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--brand); }
.icon-button { width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); font-size: 24px; display: grid; place-items: center; }
.hero { padding: 42px 0 32px; display: flex; justify-content: space-between; align-items: center; gap: 30px; }
.eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 1.25px; margin: 0 0 14px; display: flex; align-items: center; gap: 8px; }
.hero .eyebrow { color: var(--muted); }
.hero .eyebrow span { width: 16px; height: 2px; background: var(--brand); }
h1 { font: 800 clamp(32px, 4vw, 49px)/1.15 var(--font-display); letter-spacing: -2px; margin: 0; }
h1 em { color: var(--brand); font-style: normal; }
.hero-copy { color: var(--muted); max-width: 490px; margin: 17px 0 0; font-size: 14px; }
.hero-aside { display: flex; align-items: center; gap: 16px; color: var(--muted); font-size: 14px; padding-right: 24px; }
.hero-aside strong { color: var(--text); font-weight: 500; }
.outline-icon { color: var(--brand); border: 1px solid var(--line); width: 62px; height: 62px; border-radius: 20px; display: grid; place-items: center; font-size: 38px; transform: rotate(-7deg); background: var(--surface); }
.market-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.market-tab { display: flex; gap: 13px; align-items: center; padding: 16px 19px; border: 1px solid var(--line); border-radius: 15px; background: var(--surface); text-align: left; transition: border-color .2s, transform .2s, box-shadow .2s; font-weight: 700; font-size: 15px; }
.market-tab:hover { transform: translateY(-2px); }
.market-tab[aria-selected='true'] { border-color: var(--text); box-shadow: inset 0 0 0 1px var(--text); }
.market-tab[data-market='mercadoLivre'][aria-selected='true'] { border-color: var(--ml-border); box-shadow: inset 0 0 0 1px var(--ml-border); }
.market-tab[data-market='shopee'][aria-selected='true'] { border-color: var(--shopee); box-shadow: inset 0 0 0 1px var(--shopee); }
.market-tab small { display: block; color: var(--muted); font-size: 10px; font-weight: 400; margin-top: 3px; }
.market-symbol { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px; flex-shrink: 0; font-family: var(--font-display); }
.market-symbol.ml { background: var(--ml); color: var(--ml-ink); font-size: 13px; }
.market-symbol.shopee { background: var(--shopee-soft); color: var(--shopee); font-size: 22px; }
.market-symbol.tiktok { background: var(--tiktok-soft); color: var(--tiktok-ink); font-size: 25px; }
.tab-arrow { margin-left: auto; font-size: 21px; opacity: 0; }
[aria-selected='true'] .tab-arrow { opacity: 1; }
.demo-note { color: var(--muted); font-size: 11px; margin: 13px 0 22px; }
.calculator { display: grid; grid-template-columns: 1.06fr 1fr; gap: 24px; align-items: start; }
.card { border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); background: var(--surface); }
.form-card, .goal-card { padding: 26px; }
.section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 23px; }
h2 { margin: 0; font: 800 15px var(--font-display); letter-spacing: -.25px; }
.section-title p { color: var(--muted); font-size: 11px; margin: 5px 0 0; }
.step { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 9px; background: var(--surface-soft); border: 1px solid var(--line); font-size: 10px; color: var(--muted); flex-shrink: 0; }
.live-badge { margin-left: auto; font-size: 8px; letter-spacing: 1px; white-space: nowrap; color: var(--brand); display: flex; align-items: center; gap: 5px; }
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { min-width: 0; }
.field label { display: block; font-size: 11px; font-weight: 600; margin-bottom: 8px; }
.input-wrap { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 10px; height: 48px; background: var(--input-bg); padding: 0 13px; gap: 8px; transition: border-color .2s, box-shadow .2s; }
.input-wrap:focus-within { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-soft); }
.input-wrap span { color: var(--muted); font-size: 12px; }
input[type='text'] { width: 100%; min-width: 0; background: transparent; color: var(--text); border: 0; outline: 0; font-weight: 600; font-size: 17px; padding: 5px 0; font-variant-numeric: tabular-nums; }
input[type='text']:focus-visible { outline: none; }
.input-wrap:has([aria-invalid='true']) { border-color: var(--bad); }
.field small { display: block; color: var(--muted); font-size: 10px; margin-top: 6px; }
.field .field-error { color: var(--bad); }
.field-error:empty { display: none; }
.divider { height: 1px; background: var(--line); margin: 26px 0; }


.weight-field { margin-top: 18px; }




.helper-note { color: var(--muted); font-size: 10px; margin: 10px 0 0; line-height: 1.6; }
.option-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 0; border-top: 1px solid var(--line); margin-top: 18px; }
.option-row strong { font-size: 11px; }
.option-row small { font-size: 10px; color: var(--muted); display: block; margin-top: 3px; }
.segmented { display: flex; padding: 3px; border: 1px solid var(--line); border-radius: 9px; background: var(--surface-soft); }
.segmented button { border: 0; padding: 7px 13px; border-radius: 6px; background: transparent; font-size: 11px; }
.segmented [aria-pressed='true'] { background: var(--text); color: var(--surface); }
.checkbox-row { display: flex; gap: 9px; align-items: start; margin-top: 18px; font-size: 11px; cursor: pointer; }
.checkbox-row input { margin: 3px 0 0; width: 15px; height: 15px; accent-color: var(--brand); }
.checkbox-row small { display: block; color: var(--muted); font-size: 10px; margin-top: 3px; }
#manual-section, #affiliate-section { margin-top: 18px; }
.notice { font-size: 11px; padding: 12px 14px; border-radius: 10px; color: var(--warn); background: var(--warn-soft); }
.notice.danger { color: var(--bad); background: var(--bad-soft); }
.goal-card { margin-top: 18px; }
.goal-card .input-wrap { max-width: 180px; }
.target-icon { font-size: 27px; color: var(--brand); line-height: 1; }
.optional { font-weight: 400; color: var(--muted); margin-left: 6px; }
.result-column { display: flex; flex-direction: column; gap: 18px; }
.result-card { padding: 27px; border-color: color-mix(in srgb, var(--tone) 25%, var(--line)); background: linear-gradient(140deg, var(--surface), var(--tone-soft)); --tone: var(--good); --tone-soft: var(--good-soft); }
.result-card[data-tone='bad'] { --tone: var(--bad); --tone-soft: var(--bad-soft); }
.result-card[data-tone='warn'] { --tone: var(--warn); --tone-soft: var(--warn-soft); }
.result-card[data-tone='empty'] { --tone: var(--muted); --tone-soft: var(--surface-soft); }
.result-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.result-top .eyebrow { margin: 0; font-size: 8px; color: var(--muted); letter-spacing: 1px; }
.status-pill { color: var(--tone); border: 1px solid color-mix(in srgb, var(--tone) 20%, transparent); background: var(--tone-soft); font-size: 9px; padding: 5px 9px; border-radius: 20px; white-space: nowrap; }
.profit-label { color: var(--muted); font-size: 12px; margin-top: 30px; }
.profit { font: 800 clamp(32px, 4.6vw, 54px)/1.2 var(--font-display); letter-spacing: -2px; color: var(--tone); margin: 9px 0 15px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.margin-row { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.margin-row > div { flex-shrink: 0; }
#margin { color: var(--tone); font: 800 22px var(--font-display); }
.margin-row small { display: block; color: var(--muted); font-size: 10px; margin-top: 3px; }
.margin-row p { font-size: 11px; max-width: 215px; margin: 0; color: var(--muted); }
.mini-stats { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--line); margin-top: 24px; padding-top: 18px; gap: 15px; }
.mini-stats span { display: block; color: var(--muted); font-size: 10px; }
.mini-stats strong { font-size: 14px; display: block; margin-top: 4px; }
.copy-button { width: 100%; margin-top: 23px; display: flex; align-items: center; justify-content: center; gap: 9px; border: 1px solid var(--line); background: var(--surface); padding: 12px 15px; border-radius: 10px; font-weight: 600; font-size: 11px; }
.copy-button:hover { border-color: var(--brand); }
.copy-status { font-size: 10px; margin: 7px 0 0; color: var(--muted); }
.copy-status:empty { display: none; }
.breakdown-card { padding: 25px 27px; }
.breakdown-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.breakdown-heading h2 { font-size: 13px; }
.breakdown-heading > span { color: var(--muted); font-size: 8px; letter-spacing: 1px; }
.composition { display: flex; gap: 3px; height: 10px; border-radius: 10px; overflow: hidden; margin: 22px 0; background: var(--surface-soft); }
.composition span { min-width: 1px; height: 100%; transition: width .25s; }
.breakdown-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; font-size: 11px; }
.breakdown-row .swatch { width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0; }
.breakdown-row .amount { margin-left: auto; font-weight: 600; }
.breakdown-row .share { width: 52px; text-align: right; font-size: 10px; color: var(--muted); }
.breakdown-row.profit-row { border-top: 1px solid var(--line); margin-top: 7px; padding-top: 13px; font-weight: 700; }
.rate-note { color: var(--muted); font-size: 10px; background: var(--surface-soft); padding: 10px 12px; border-radius: 8px; margin: 15px 0 0; }
.minimum-card { padding: 22px 27px; background: var(--brand-soft); border-color: transparent; }
.minimum-heading { display: flex; gap: 10px; align-items: center; font-size: 9px; font-weight: 700; letter-spacing: .8px; color: var(--brand-ink); }
.minimum-heading .target-icon { font-size: 24px; }
#minimum-price { display: block; font: 800 30px var(--font-display); letter-spacing: -1px; margin-top: 10px; color: var(--brand-ink); }
#minimum-description { font-size: 11px; margin: 6px 0 0; color: var(--brand-ink); }
.scope-note { display: flex; align-items: start; gap: 10px; color: var(--muted); margin-top: 28px; font-size: 11px; }
.scope-note p { margin: 0; }
.scope-note strong { color: var(--text); font-weight: 500; }
.rules-details { font-size: 11px; color: var(--muted); margin: 20px 0 32px; }
.rules-details summary { width: fit-content; }
.rules-details p { max-width: 880px; }
.site-footer { border-top: 1px solid var(--line); padding: 24px 0 32px; display: flex; justify-content: space-between; gap: 15px; align-items: center; font-family: var(--font-display); font-weight: 800; }
.site-footer small { color: var(--muted); font-weight: 400; font-family: var(--font-body); font-size: 10px; }
.site-footer span small { margin-left: 12px; }
.revealed { animation: reveal .22s ease both; }
/* Navegadores modernos também suavizam a saída do controle de frete. */
#fast-section { opacity: 1; transition: opacity .18s ease, display .18s allow-discrete; }
#fast-section[hidden] { opacity: 0; }
@starting-style { #fast-section { opacity: 0; } }
.tab-enter { animation: reveal .22s ease both; }
@keyframes reveal { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.sr-only, .skip-link:not(:focus) { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.skip-link:focus { display: block; padding: 12px; background: var(--surface); color: var(--brand); }
@media (min-width: 1050px) { .result-column { position: sticky; top: 18px; } }
@media (max-width: 850px) { .hero-aside { display: none; } .calculator { gap: 16px; } .form-card, .goal-card, .result-card, .breakdown-card, .minimum-card { padding: 22px; } .market-tab { padding: 14px; } .tab-arrow { display: none; } .result-top { align-items: start; flex-direction: column; }   .live-badge { display: none; } }
@media (max-width: 680px) {
  .wrap { width: calc(100% - 32px); } .site-header { padding: 17px 0; } .brand img { width: 46px; height: 46px; } .brand strong { font-size: 20px; } .brand small { font-size: 7px; } .private-note { display: none; }
  .hero { padding: 29px 0 24px; } h1 { font-size: 36px; letter-spacing: -1.5px; } .hero .eyebrow { font-size: 8px; letter-spacing: .8px; } .hero-copy { font-size: 12px; max-width: 350px; }
  .market-tabs { gap: 8px; } .market-tab { flex-direction: column; gap: 8px; text-align: center; padding: 13px 4px; font-size: 10px; border-radius: 13px; } .market-tab small { display: none; } .market-symbol { width: 32px; height: 32px; border-radius: 9px; } .market-symbol.ml { font-size: 11px; }
  .demo-note { font-size: 10px; margin-bottom: 17px; } .calculator { grid-template-columns: 1fr; } .form-card, .goal-card { padding: 21px; } .result-top { flex-direction: row; align-items: center; } .result-column { gap: 14px; } .profit { font-size: 48px; } .profit-label { margin-top: 25px; } .field-grid { gap: 13px; }
  .goal-card { margin-top: 14px; } .site-footer { align-items: start; flex-direction: column; gap: 8px; } .scope-note { margin-top: 24px; }  .rules-details { margin-bottom: 25px; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; } }
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

