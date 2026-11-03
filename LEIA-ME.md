# Calculadora de Margem de Contribuição · Sellneeds

Site estático completo, em HTML, CSS e JavaScript puro. Não precisa instalar nada para usar. Logo enviada pela Sellneeds, base visual em preto e branco com verde nos destaques, fontes Manrope e DM Sans, modos claro e escuro. Tela única, sem rolagem, com dois blocos: **Cálculo por preço** (informa o preço e mostra a margem) e **Cálculo por margem** (informa a margem alvo e mostra o preço de venda necessário).

## 1. Abrir no computador

1. Baixe `sellneeds-calculadora.zip`.
2. Clique com o botão direito e escolha **Extrair tudo**.
3. Entre na pasta extraída e abra `index.html` com Chrome, Edge, Firefox ou Safari atualizado.
4. Escolha o marketplace tocando na logo (Mercado Livre, Shopee ou TikTok Shop). A simulação já vem preenchida como exemplo.
5. No bloco **Cálculo por preço**, digite preço e custo para ver a margem de contribuição e o gráfico "Para onde vai o dinheiro".
6. No bloco **Cálculo por margem**, digite a margem alvo e o custo para ver o menor preço que atinge a meta. Cada bloco tem os próprios campos.
7. No Mercado Livre, o botão **Frete manual** troca o peso por um valor de frete em R$. O ícone **i** no topo abre as faixas aplicadas e os avisos secundários.
8. Para puxar o custo de um produto, toque em **SKU** ao lado de "Custo do produto", pesquise e toque em **Usar**. A lupa no topo abre a mesma lista só para consultar. Os custos vêm da planilha importada e não podem ser alterados na tela. Veja a seção 9.

Mantenha `index.html`, `style.css`, `script.js`, `custos.js`, `config.js`, `logo-sellneeds.png` e as três logos dos marketplaces juntos. O site funciona sem internet após o download; sem conexão, usa uma fonte do sistema no lugar das Google Fonts. A opção de tema é salva no navegador. Os valores digitados na calculadora não são salvos; só a lista de custos por SKU importada é guardada, no navegador de cada aparelho.

## 2. Arquivos

| Arquivo | Função |
| --- | --- |
| index.html | Estrutura, campos, cartões e logo |
| style.css | Cores, fontes, responsividade e animações |
| config.js | Todas as taxas, faixas, tabela de frete e limites |
| script.js | Cálculos, preço por margem e funcionamento da tela (componente dos dois blocos) |
| custos.js | Custos por SKU: importar a planilha, pesquisar e usar o custo (somente leitura) |
| logo-sellneeds.png | Cópia da logo original enviada |
| logo-mercado-livre.webp, logo-shopee.webp, logo-tiktok.webp | Logos dos botões dos marketplaces (160×160 px, 2 a 4 KB cada) |
| testes.js | Verificação opcional dos cálculos; não é necessário para o site |
| TESTES.md | Resultados dos testes executados |
| CODIGO_COMPLETO.md | Código integral dos cinco arquivos, separado em blocos para copiar |
| referencias/ | Esboço do layout e scripts opcionais de teste no navegador. Não fazem parte do site |

## 3. Publicar no GitHub Pages, do zero

1. Entre em [github.com](https://github.com). Crie sua conta, se necessário, e confirme seu e-mail.
2. No botão **+**, escolha **New repository**.
3. Digite `sellneeds-calculadora` em **Repository name**.
4. Marque **Public** para usar GitHub Pages no plano gratuito. Ative a criação de um README e clique em **Create repository**.
5. Na aba **Code**, escolha **Add file → Upload files**.
6. Na pasta que você extraiu, selecione os nove arquivos essenciais: `index.html`, `style.css`, `script.js`, `custos.js`, `config.js`, `logo-sellneeds.png`, `logo-mercado-livre.webp`, `logo-shopee.webp` e `logo-tiktok.webp`. Arraste-os para o GitHub. Envie os arquivos extraídos; não envie o ZIP como se fosse o site.
7. Escreva uma mensagem, como “Adicionar calculadora Sellneeds”, e confirme o envio com **Commit changes**. Se a interface abrir uma proposta de alteração em outra branch, conclua o pull request e o merge para `main`.
8. Confira que `index.html` aparece diretamente na lista principal de arquivos, sem uma pasta extra envolvendo o site.
9. Abra **Settings → Pages**.
10. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
11. Em **Branch**, escolha **main**; na pasta, escolha **/(root)**. Clique em **Save**.
12. Aguarde a publicação e volte a **Settings → Pages**. Abra o endereço exibido pelo GitHub em **Visit site**. O formato normalmente será `https://SEU-USUARIO.github.io/sellneeds-calculadora/` — substitua pelo endereço real informado pelo GitHub.
13. Abra esse endereço no celular e faça uma simulação de conferência.

O site ainda não foi publicado por esta entrega. Não é necessário contratar backend, banco de dados ou servidor.

### Atualizar um site que já está publicado (novo layout)

1. No repositório do GitHub, abra a aba **Code** e escolha **Add file → Upload files**.
2. Arraste os arquivos novos: `index.html`, `style.css`, `script.js`, `custos.js` e `config.js`. Com o mesmo nome, eles **substituem** os antigos. `custos.js` é novo e precisa ir junto: sem ele, a pesquisa por SKU não abre.
3. Arraste também as três logos novas, que ainda não existem no repositório: `logo-mercado-livre.webp`, `logo-shopee.webp` e `logo-tiktok.webp`. Sem elas, os botões mostram o nome do marketplace em texto.
4. Confirme com **Commit changes** na branch `main`.
5. Aguarde um ou dois minutos e abra o site com Ctrl+F5 (no celular, feche e reabra a aba) para não ver a versão antiga em cache.

Os nomes dos arquivos precisam ser exatamente esses, em minúsculas. Os arquivos de `referencias/` não precisam ser enviados.

**Se aparecer 404:** confira se `index.html` está na raiz, se a branch é `main` e se a pasta selecionada é `/(root)`. Na aba **Actions**, veja se o processo de Pages terminou. Após alterar arquivos, a atualização é publicada novamente; use Ctrl+F5 se o navegador continuar mostrando a versão anterior.

**Fontes oficiais consultadas em 22/10/2026:**
- [Enviar arquivos para o repositório](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
- [Configurar a origem de publicação do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 4. Alterar taxas e tabela de frete

Abra `config.js` no Bloco de Notas ou em um editor de código. No GitHub, também é possível abrir esse arquivo e clicar no lápis para editar. Salve e confirme a alteração para republicar.

Use **ponto decimal no código**. Uma comissão de 12% é `0.12`; R$ 6,85 é `6.85`. Não escreva `12%`, `R$` nem vírgula decimal dentro dos números de configuração.

| O que mudar | Local em config.js |
| --- | --- |
| Comissão Mercado Livre | `mercadoLivre.commission` |
| Início do frete obrigatório | `mercadoLivre.mandatoryFreeShippingFrom` |
| Limite de preço do teto, atualmente 19 | `mercadoLivre.cheapShippingCap.below` |
| Teto de 50% | `mercadoLivre.cheapShippingCap.rate` |
| Faixas de preço do ML | `mercadoLivre.priceBands` |
| Valores de frete por peso/preço | `mercadoLivre.shippingTable` |
| Coluna usada no frete rápido | `mercadoLivre.fastShippingColumn` — `3` significa P4 |
| Comissão e taxa por item Shopee | `shopee.bands` — `fixed` em R$; `fixedRate` em percentual do preço (abaixo de R$ 9 = `0.50`) |
| Comissão, taxa fixa e frete TikTok | `tiktok.bands` |
| Limites das cores | `marginColors.low` e `marginColors.high` |
| Valores iniciais dos campos | `defaults` |
| Descrição/data das regras | `version` |

Cada linha da matriz é `[pesoMáximo, P1, P2, P3, P4, P5, P6, P7, P8]`. Os pesos precisam estar em ordem crescente. A tabela de frete rápido reutiliza P4, sem valores duplicados.

Em todas as faixas, `min` é incluso e `max` é exclusivo. Por exemplo, `min: 80, max: 100` cobre de R$ 80,00 até R$ 99,99. O último `max: null` significa sem limite superior. Mantenha as faixas contínuas, sem lacunas. O peso máximo aceito é o da última linha da tabela, sem limite duplicado na lógica.

Se a plataforma mudar as faixas, atualize os limites e a matriz correspondente. Alterar somente a data da versão não atualiza taxas. O site mostra uma mensagem de configuração inválida quando identifica uma tabela inconsistente.

## 5. Alterar cores, fonte e logo

As cores e fontes estão no início de `style.css`, dentro de `:root`:

- `--brand`, `--brand-soft`, `--brand-ink`: verde principal e suas variações.
- `--bg`, `--surface`, `--text`, `--muted`, `--line`: fundo, cartões e textos.
- `--good`, `--warn`, `--bad`: cores de margem; o limite percentual fica em `config.js`.
- `--ml`, `--ml-border`, `--shopee`, `--tiktok`, `--tiktok-glow`: borda e brilho da aba ativa de cada marketplace.
- `--font-body` e `--font-display`: fontes.
- `:root[data-theme='dark']`: cores específicas do modo escuro.

Se escolher outra Google Font, ajuste também o endereço da fonte no `<head>` de `index.html`. Para trocar a logo, substitua `logo-sellneeds.png` por uma imagem com o mesmo nome. A logo enviada foi preservada, sem recriação.

**Logos dos marketplaces:** para trocar, substitua `logo-mercado-livre.webp`, `logo-shopee.webp` ou `logo-tiktok.webp` por outra imagem quadrada com o mesmo nome e formato. Para usar outro formato (por exemplo PNG), ajuste também o nome do arquivo em `index.html`. Use cerca de 160×160 px e poucos KB; a imagem é exibida com `object-fit: contain`, sem distorcer, sobre um fundo claro arredondado legível nos dois temas. A aba ativa recebe borda e brilho na cor do marketplace (variáveis `--ml`, `--ml-border`, `--shopee`, `--tiktok` e `--tiktok-glow`).


## 6. Como funciona

**Lucro de contribuição:** preço de venda menos custo do produto, comissão, taxa fixa, frete e afiliado aplicáveis. **Margem:** lucro dividido pelo preço de venda, multiplicado por 100.

**Mercado Livre:** usa exclusivamente o peso do pacote informado, conforme ajuste solicitado pela Sellneeds. Os campos de dimensões e o cálculo de cubagem foram removidos. Seleciona a primeira linha que comporta o peso, inclusive o limite exato. Escolhe a coluna de preço, considerando frete rápido abaixo de R$ 79,00. Aplica o teto para preço estritamente menor que R$ 19,00, se ele reduzir o frete. O frete manual substitui tudo isso e permite simular pacotes acima do limite da tabela.

**Tela única:** tudo cabe na tela, sem rolagem, usando tamanhos fluidos. Pontos de corte: computador, notebook e tablet deitado (largura ≥ 700 px e tela mais larga que alta, ou largura ≥ 1000 px) mostram os dois blocos empilhados, com entradas à esquerda e resultado à direita; com largura ≥ 900 px o cabeçalho fica em uma linha. Celular em pé e tablet em pé mostram os blocos empilhados e compactos. Tela deitada com altura ≤ 600 px mostra os blocos lado a lado. Tela em pé com altura < 740 px (ex.: 360×640) ou qualquer tela com altura < 341 px mostra o seletor **Por preço | Por margem**, com um bloco por vez; o mesmo seletor aparece automaticamente se, em algum aparelho, os dois blocos não couberem. Com o teclado do celular aberto, só a área dos blocos pode rolar, para o campo em foco não ficar escondido.

**Preço por margem (bloco 2):** resolve todas as faixas e os trechos do teto de frete, arredonda para cima ao centavo e confere o resultado. Retorna o menor preço válido. Não usa uma busca global que pressuponha margem sempre crescente. Na Shopee, por exemplo, subir de R$ 79,99 para R$ 80,00 pode reduzir a margem. Recalcule quando alterar o preço.

**Composição ("Para onde vai o dinheiro"):** linhas com valor zero são ocultadas, exceto custo e lucro. Em vendas positivas, a barra divide o preço entre custos e lucro. Em prejuízo, a barra representa o total dos custos, e o déficit é mostrado à parte. Os percentuais das linhas sempre usam o preço de venda como base.

## 7. Suposições e limites

- Esta versão é uma simulação somente por peso informado, a pedido da Sellneeds. Isso não confirma que dimensões nunca afetam a cobrança real: a orientação oficial do Mercado Livre menciona peso volumétrico quando supera o físico. Consulte o peso tarifado ou informe o frete manual para reproduzir uma cobrança específica. [Orientação oficial](https://vendedores.mercadolivre.com.br/aprender/nota/como-o-peso-do-seu-pacote-influencia-no-custo-de-envio).

- As taxas são exatamente as fornecidas no pedido, não uma validação das regras atuais das plataformas. Não existe atualização automática. Confirme a tabela e as condições da conta quando elas mudarem.
- Shopee (tabela de 03/11/2026): taxa por item de 50% do preço abaixo de R$ 9,00; R$ 4,50 de R$ 9,00 a R$ 79,99; R$ 16,00 de R$ 80,00 a R$ 99,99; R$ 20,00 de R$ 100,00 a R$ 199,99; R$ 26,00 a partir de R$ 200,00. A comissão continua 20% abaixo de R$ 80,00 e 14% a partir daí, inclusive abaixo de R$ 9,00 (a tabela enviada só trazia a taxa por item). Como o texto dizia “acima de R$ 200” e a faixa anterior terminava em R$ 199,99, R$ 200,00 foi incluído na última faixa.
- TikTok: afiliado e frete percentual incidem sobre o preço de venda. O percentual de afiliado é informado na tela; o padrão é zero.
- No bloco **Cálculo por preço**, o seletor de frete grátis rápido só aparece com preço abaixo de R$ 79,00. No bloco **Cálculo por margem**, ele aparece sempre, porque o preço ainda é desconhecido; abaixo de R$ 79,00 a meta usa essa escolha. No modo manual, a meta mantém o mesmo frete informado em todos os preços.
- Os cálculos usam precisão completa; as saídas monetárias são arredondadas na exibição. Campos monetários são formatados em duas casas ao sair do campo. O preço por margem sempre usa centavos. Pode haver diferenças de centavos em relação a plataformas que arredondam cada parcela de outra forma.
- Aceita vírgula ou ponto decimal; para valores com milhar, use `1.234,56` ou `1,234.56`. Um único separador é interpretado como decimal.
- O peso precisa ser positivo no frete automático. Frete e custo podem ser zero. A meta e o afiliado aceitam de 0% a 100%, com "—" e uma frase curta quando a meta não é viável. Erros de campo aparecem com borda vermelha e uma mensagem curta sobre a borda, sem mover o layout. O limite numérico de entrada é R$ 1 bilhão, editável em `maxInput`.
- Não inclui impostos, Ads, embalagem, descontos, devoluções, subsídios não informados nem despesas operacionais. Portanto, não representa lucro líquido.
- GitHub Pages publica uma página acessível na internet. Código, taxas e logo ficam públicos. Os custos por SKU **não** fazem parte do site: a planilha é lida no próprio aparelho e não é enviada para nenhum servidor. Não coloque a planilha de custos no repositório.
- Recurso externo: só Google Fonts (fontes). Não há login, banco de dados, analytics nem integração com contas dos marketplaces.

## 8. Testes e manutenção

Veja `TESTES.md`. Os scripts opcionais de teste no navegador ficam em `referencias/ferramentas-teste/` e usam Playwright, instalado fora do site; o site continua sem dependências. Para executar os testes novamente, se já tiver Node.js instalado, abra um terminal na pasta e rode `node testes.js`. Node não é necessário para abrir ou publicar o site.

Depois de mudar taxas, exemplos antigos podem falhar intencionalmente, pois verificam as regras originais. Atualize os resultados esperados de acordo com as novas regras e confira simulações na plataforma.

Uma melhoria futura possível é incluir impostos, anúncios e embalagem como custos opcionais por venda.

## 9. Custos por SKU

**Uso no dia a dia**
- **Importar planilha:** toque na lupa no topo (ou em **SKU**) e em **Importar planilha**. Use o CSV do Excel com as colunas `CUSTO` e `SKU` (separadas por `;`, vírgula decimal, em qualquer ordem). Linhas sem SKU ou com custo inválido são ignoradas e contadas. Importar outra planilha **substitui a lista inteira**: para mudar um custo, corrija no Excel e importe de novo.
- **Puxar o custo:** no campo "Custo do produto", toque em **SKU**, digite parte do código (maiúsculas, acentos, hífens e espaços não importam; "acqua 002" encontra ACQUABIOS-002PRETO) e toque na linha ou em **Usar**. O botão passa a mostrar o SKU e o rótulo encurta para "Custo". Digitar outro custo à mão desfaz a ligação.
- **Consultar:** a lupa no topo abre a mesma lista só para ver o custo de cada SKU.
- Os custos **não podem ser alterados na tela**; a única forma de mudar é importar a planilha corrigida. Se um bloco estiver usando um SKU, o cálculo atualiza ao importar a planilha nova.
- A lista mostra até 50 resultados por vez; digite mais do SKU para filtrar.

**Onde os custos ficam**
- A planilha é lida no próprio aparelho e a lista fica guardada no navegador dele. Não há login, nuvem nem servidor: nada é enviado pela internet.
- Cada aparelho (ou navegador) precisa importar a planilha uma vez. Limpar os dados do navegador apaga a lista; basta importar de novo.
- Em janela anônima ou com armazenamento bloqueado, a lista vale só enquanto a página estiver aberta.
