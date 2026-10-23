# Calculadora de margem · Sellneeds

Interface atualizada em 23/10/2026. Site estático, sem instalação, backend ou compilação.

## O que mudou

- Tela com dois blocos: “Preço e custos” e “Resultado”. Em retrato ficam empilhados; em computador e celular deitado ficam lado a lado.
- Abas com os três logos enviados, destaque da aba ativa e nome em texto se a imagem falhar.
- Lucro e margem grandes. Meta compartilhada entre abas, salva no navegador quando permitido, e preço para atingir a meta mesmo sem preço de venda preenchido.
- Com meta: verde ao atingir; abaixo dela, vermelho se a margem ficar abaixo de `marginColors.low` e amarelo nos demais casos. Sem meta: vermelho abaixo de 10%, amarelo de 10% a 20% e verde acima de 20%.
- Barra fina com composição; “Detalhes” abre os valores em um painel sobreposto. Fecha no ×, com Esc ou ao tocar fora.
- Engrenagem em “Preço e custos” abre o frete manual. Ao ativar, o valor substitui o frete automático como antes.
- Removidos botão de copiar, rodapé, subtítulos e textos decorativos. O modo claro/escuro acompanha o dispositivo.

## Decisão sobre as dimensões

Foi preservada a alteração anterior solicitada: no Mercado Livre, o cálculo usa SOMENTE O PESO INFORMADO. Comprimento, largura, altura e cubagem não foram reintroduzidos. Assim, o novo layout tem Preço | Custo e Peso | Frete rápido. Restaurar cubagem alteraria a regra atual e exigiria uma mudança de cálculo, que você pediu para evitar.

Isso descreve a regra deste simulador. Não é uma afirmação sobre todas as modalidades de envio do Mercado Livre.

## Arquivos para publicar

Coloque na mesma pasta:

- `index.html`
- `style.css`
- `script.js`
- `config.js`
- `logo-sellneeds.png`
- `img/mercadolivre.webp`
- `img/shopee.webp`
- `img/tiktok.webp`

O ZIP já contém essa organização. Os documentos e `testes.js` são opcionais para a publicação. Não envie o ZIP fechado para tentar publicar o site: extraia o conteúdo primeiro.

`CODIGO_COMPLETO.md` reúne o código integral dos quatro arquivos em blocos separados, pronto para copiar. Se o download individual acrescentar “(1)” ao nome de algum arquivo, retire esse sufixo antes de publicar. No ZIP os nomes já estão corretos.

## Logos: quais arquivos usar

| Imagem enviada | Caminho no site |
|---|---|
| mercado-livre-orbita(1).webp | img/mercadolivre.webp |
| shopee-orbita(1).webp | img/shopee.webp |
| tiktok-orbita.webp | img/tiktok.webp |

As três imagens originais são WebP, 160 × 160 pixels. Mantive a extensão e os bytes originais; não foram convertidas para PNG. Os caminhos são relativos, para funcionar também em um endereço de projeto do GitHub Pages.

Para futuras substituições, prefira imagens quadradas de 256 × 256 pixels ou maiores, com pouca margem interna. As imagens de 160 × 160 enviadas funcionam no tamanho utilizado. Não renomeie `.webp` para `.png` sem converter a imagem de verdade.

## Atualizar o site que já existe no GitHub Pages

1. Baixe e extraia `sellneeds-calculadora.zip`.
2. Abra o repositório da calculadora no GitHub, na aba **Code**. Use a pasta que já contém o `index.html` publicado.
3. Clique em **Add file → Upload files**.
4. Arraste os quatro arquivos do site, `logo-sellneeds.png` e a pasta **img inteira**. Não arraste a pasta externa “sellneeds-calculadora”: o `index.html` precisa ficar na pasta publicada.
5. Confira se os arquivos aparecem como `index.html`, `style.css`, `script.js`, `config.js` e `img/mercadolivre.webp`, `img/shopee.webp`, `img/tiktok.webp`.
6. Escreva uma mensagem como “Atualiza layout e logos da calculadora” e salve com **Commit changes**. Se o repositório exigir pull request, conclua a aprovação e o merge para a branch publicada.
7. Confira **Settings → Pages**. Para este site estático, use **Deploy from a branch**, a branch publicada (normalmente `main`) e a pasta correta (`/(root)` quando o `index.html` está na raiz; `/docs` se você já publica dessa pasta).
8. Aguarde a execução de publicação na aba **Actions**. Depois abra o endereço mostrado em **Settings → Pages**.
9. Se aparecer a versão antiga, atualize a página com Ctrl+F5 no computador ou feche e reabra a aba no celular.

Não é necessário desativar o site ou criar outro repositório para atualizar.

## Publicar do zero

1. No GitHub, crie um novo repositório com **New repository**. Exemplo de nome: `calculadora-sellneeds`.
2. Para GitHub Free, use um repositório público e inicialize com README.
3. Envie os arquivos e a pasta `img` conforme os passos acima.
4. Em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, `main`, `/(root)` e **Save**.
5. Espere a publicação terminar e abra o endereço exibido pelo GitHub.

Referências oficiais consultadas em 23/10/2026:

- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Personalizar

- **Cores e fontes:** edite as variáveis no `:root` de `style.css`. O bloco `:root[data-theme='dark']` define as cores do modo escuro.
- **Limites de cor:** `marginColors.low` e `marginColors.high`, no `config.js`. No código, 10% é `0.10`. Com meta preenchida, atingir a meta tem prioridade sobre esses limites.
- **Logos:** caminhos e dimensões em `config.js → logos`; os atributos iniciais também ficam no HTML. Ao trocar nomes ou extensão, atualize ambos.
- **Taxas e tabela:** continuam centralizadas em `config.js`; não foram alteradas nesta atualização. Só os caminhos dos logos e as dimensões do novo logo TikTok mudaram nesse arquivo.
- **Divisor de cubagem:** não existe nesta versão, pois a regra atual usa somente peso informado.

## Testes e limites

O arquivo original `testes.js` foi mantido sem mudanças. Execute `node testes.js` se desejar repetir os 319 testes. Node não é necessário para usar ou publicar o site. Veja `TESTES.md` para os resultados.

A interface foi medida em viewports de 360×640, 390×844, 412×915, 844×390, 768×1024, 1366×768 e 1920×1080, nas três abas. Não houve rolagem nem controles fora da área útil nos estados verificados. Campos e botões têm pelo menos 40 px de altura e inputs usam fonte de pelo menos 16 px. Também foram conferidos os painéis de detalhes em 360×640 e 844×390, sem rolagem interna.

Essas medidas representam a área útil da página, com zoom de 100% e sem teclado virtual. “Qualquer dispositivo” não é uma garantia física: zoom alto, fontes de acessibilidade muito ampliadas, teclado aberto ou áreas úteis menores que as testadas podem impedir que tudo caiba simultaneamente. O CSS bloqueia a rolagem conforme solicitado; nesses casos extremos parte do conteúdo pode ficar fora da área visível. Não escondi informação para passar os sete tamanhos testados.

As taxas são as fornecidas pela Sellneeds e não são atualizadas automaticamente. O resultado continua sendo a margem de contribuição definida nas fórmulas existentes; impostos, Ads, embalagem e outras despesas não foram acrescentados.
