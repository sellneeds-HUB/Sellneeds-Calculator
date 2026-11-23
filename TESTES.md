# Testes da calculadora Sellneeds

## 0. Custo médio por SKU (23/11/2026)

Novo botão de barras no topo abre a tela sobreposta **Custo médio** (`medio.js`). Taxas, faixas e frete não mudaram.

- **`node testes.js`: APROVADO, 396 verificações** (as 371 anteriores + 25 novas). Contas da planilha `Custo Médio.xlsx`: Mop 9.577 a R$ 19,17 + 3.000 a R$ 18,50 = **R$ 19,01**; Balança vidro = **R$ 16,61**; sem estoque vale o custo da compra. Alertas: bico dosador 1,80 → 3,00 (+67%) e compra de 78.000 taças. Histórico: registro salvo não muda o SKU, desfazer volta à compra anterior, aplicar um registro depois, excluir só o que não está aplicado, histórico salvo ao reabrir. Importação: acha SKUs alterados que a planilha muda ou não traz, "Manter custo médio" e "Usar planilha". CSV do histórico e backup (exportar e restaurar). Confirmar troca só o custo do SKU escolhido.
- **Navegador do app (Chrome, servidor local, SKUs de teste):** bloco por preço ligado ao SKU de teste → custo médio pelo botão do topo → R$ 19,17 vira **R$ 19,01** no painel, na lista e no bloco, com "Custo anterior R$ 19,17 → R$ 19,01 (−0,8%)" e o histórico com "Desfazer". "Salvar registro" com alerta de +67% deixou o custo do SKU em R$ 1,80. Atalho "Custo médio" na linha do painel de custos abre com o SKU escolhido. Importar planilha com outro custo para o SKU alterado mostrou a escolha, e "Manter custo médio" manteve R$ 19,01. Nenhum erro no console. Os dados de teste foram apagados do navegador.
- **Layout:** 360×640 (claro), 844×390 (claro) e 800×600 (escuro): cabeçalho com o botão novo cabe sem rolagem; a tela do custo médio rola por dentro nas telas baixas.

**Não verificado nesta rodada:** download real do backup e do CSV do histórico (só a geração do conteúdo foi testada), restaurar backup pelo seletor de arquivos, botões "Usar planilha" e "Cancelar" no navegador (a lógica está nos testes), Firefox/Safari, aparelhos reais e os scripts Playwright (não instalado).

---

## Aba Fiscal (13/11/2026)

Nova aba **Fiscal**, com a conta da planilha `tabela de calculadora.xlsx` (ICMS, PIS e COFINS e créditos) sobre as taxas e o frete da calculadora. As taxas dos marketplaces não mudaram.

- **`node testes.js`: APROVADO, 371 verificações** (as 351 anteriores + 20 novas). A conta fiscal reproduz a planilha linha a linha com a tarifa de 11,5% e frete de R$ 7,35: sobra de R$ 3,58 (10,85%) com DIFAL e R$ 6,51 (19,75%) sem DIFAL. Também foram conferidos: Mercado Livre com 12% e frete pelo peso, Shopee (crédito só sobre a comissão, taxa fixa cheia), TikTok (afiliado sem crédito, créditos do frete), ICMS inválido, validações herdadas do cálculo normal e cor de prejuízo.
- **Navegador do app (Chrome, servidor local):** aba Fiscal com preço R$ 32,99, custo R$ 15,96 e peso 1,5 kg mostra R$ 3,43 e margem 10,40%; trocar para 9,1% recalcula na hora; nenhum erro no console.
- **Layout:** 320×568, 360×640, 390×844, 412×915, 844×390, 768×1024, 1366×768 e 1920×1080; três marketplaces; preços R$ 100, R$ 32,99 e R$ 8; abas de preço/margem e Fiscal: **sem rolagem, sem bloco cortado e sem texto com reticências**. Conferido a olho em 360×640 (claro e escuro), 844×390 e 1366×768 (escuro).
- **Mudança de arranjo:** as abas agora aparecem sempre, o que ocupa uma linha. Por isso o tablet em pé (768×1024) passou a mostrar um bloco por vez (Por preço | Por margem | Fiscal) em vez dos dois empilhados. A letra das telas em pé ficou cerca de 3% menor.

**Não verificado nesta rodada:** aparelhos reais, teclado do celular na aba Fiscal, Firefox/Safari, os scripts Playwright (não instalado; `teste-funcional.js` ainda espera o seletor antigo de dois botões) e a validade fiscal das alíquotas, que vieram da planilha.

---

## Shopee nova taxa por item e custos somente leitura (03/11/2026)

Mudanças: taxa por item da Shopee pela nova tabela (abaixo de R$ 9 = 50% do preço; R$ 9 a R$ 79,99 = R$ 4,50; demais faixas iguais) e custos por SKU sem Supabase e sem login — só importar planilha, pesquisar e usar.

- **`node testes.js`: APROVADO, 351 verificações.** Novas: taxa por item nos limites R$ 8; 8,99; 9; 79,99; 80; 99,99; 100; 199,99; lucro na Shopee com R$ 8 (custo 1: comissão R$ 1,60 + taxa R$ 4,00) e com R$ 50 (custo 20: lucro R$ 15,50); o verificador independente do preço por margem foi atualizado para a nova tabela e as 96 comparações continuam batendo. Os testes de nuvem simulada saíram; entraram os da lista no aparelho (importar substitui a lista inteira, lista continua salva ao reabrir, login antigo da nuvem apagado, armazenamento bloqueado não quebra, sem função de alterar custo).
- **Navegador do app (Chrome, servidor local):** importar uma planilha de teste (3 SKUs válidos, 1 ignorado) → lista mostra SKU e custo sem campo editável; botões só "×" e "Importar planilha"; pesquisa "acqua 002" → tocar na linha → custo R$ 42,50 no bloco e painel fechado; pesquisa sem resultado mostra "Nenhum SKU encontrado."; login antigo salvo no navegador foi apagado; nenhum erro no console.
- **Layout:** 360×640, 375×812, 390×844, 844×390 e 1366×768, claro e escuro, Shopee com preço R$ 8 e SKU longo escolhido: sem rolagem e sem bloco cortado. O botão com um SKU de 18 letras (ACQUABIOS-002PRETO) aparece com reticências em 375 e 390 px de largura — comportamento que já existia (o botão tem largura máxima), não mudou nesta rodada.

**Não verificado nesta rodada:** importar pelo seletor de arquivos real (o arquivo foi entregue ao campo pelo código), planilha real de 974 SKUs nesta versão, Firefox/Safari e aparelhos reais. Os scripts Playwright não foram rodados (Playwright não instalado).

---

## Custos por SKU (30/10/2026)

Rodada da nova função de custos por SKU (`custos.js`). Taxas, faixas e frete não mudaram; `config.js` só ganhou `cloud`.

- **`node testes.js`: APROVADO, 357 verificações** (as 323 anteriores + 34 novas): leitura da planilha (vírgula decimal, colunas em qualquer ordem, SKU repetido, linhas inválidas), planilha baixada lida de volta, pesquisa sem acento/hífen e por palavras separadas, armazenamento no aparelho e **nuvem simulada** (login certo e errado, login salvo ao reabrir, leitura de mais de 1.000 SKUs em páginas, renovação do token vencido ou recusado, criar/alterar pelo SKU, Sair apaga o login).
- **Planilha real** `atributos-produtos (16).csv`: 974 SKUs lidos, 0 linhas ignoradas, nenhum SKU repetido (253 com custo 0).
- **Navegador do app (Chrome), com os 974 SKUs carregados no modo "só neste aparelho":** botão SKU → pesquisa "acqua 002" → alterar ACQUABIOS-002PRETO para 42,50 → Usar: custo salvo, bloco recalculado (margem 29,35%). Alterar no painel da lupa atualiza o bloco que usa o SKU; digitar o custo à mão desfaz a ligação; SKU inexistente oferece "Novo SKU"; modo consulta sem botões "Usar"; nenhum erro no console.
- **Layout:** 8 tamanhos (320×568 até 1920×1080) × claro e escuro, sem e com um SKU longo escolhido nos dois blocos: **32/32 sem rolagem, sem bloco cortado e sem texto com reticências**; o painel de custos cabe na tela em todos. Medido no navegador do app (mesma lógica de `teste-visual.js`), porque o Playwright não está instalado neste computador.

**Não verificado nesta rodada:** Supabase real (a nuvem foi testada só com respostas simuladas; o projeto ainda não foi criado), gerenciador de senhas salvando o login, importar planilha pelo seletor de arquivos (a leitura foi testada pelo código, não pelo botão), Firefox/Safari e aparelhos reais. Os scripts Playwright de `referencias/ferramentas-teste/` não foram rodados.

---

Rodada anterior, executada em 23/10/2026, na versão com o novo layout de tela única (blocos **Cálculo por preço** e **Cálculo por margem**, logos nos botões dos marketplaces). As regras de cálculo, taxas, tabela de frete e `config.js` não foram alteradas.

## 1. Cálculos (`node testes.js`)

**APROVADO: 323 verificações**, incluindo 96 comparações do preço por margem com um verificador independente que percorre centavo por centavo. Antes da mudança de layout, a mesma bateria tinha 319 verificações, todas aprovadas.

| Caso | Frete | Lucro | Margem | Resultado |
| --- | ---: | ---: | ---: | --- |
| ML 1 — preço 40, custo 20 | R$ 6,85 | R$ 8,35 | 20,88% | Aprovado |
| ML 2 — preço 60, custo 30, rápido Sim | R$ 12,95 | R$ 9,85 | 16,42% | Aprovado |
| ML 2 — preço 60, custo 30, rápido Não | R$ 8,15 | R$ 14,65 | 24,42% | Aprovado |
| ML 3 — preço 100, custo 50 | R$ 16,15 | R$ 21,85 | 21,85% | Aprovado |
| ML 4 — preço 10, custo 3 | R$ 5,00 | R$ 0,80 | 8,00% | Aprovado |
| ML 5 — preço 12, custo 3 | R$ 5,65 | R$ 1,91 | 15,92% | Aprovado |
| Shopee — preço 100, custo 40 | R$ 0,00 | R$ 26,00 | 26,00% | Aprovado |
| TikTok — preço 30, custo 10, afiliado 5% | R$ 1,80 | R$ 9,70 | 32,33% | Aprovado |

Novas verificações do bloco 2: Mercado Livre, custo R$ 50, peso 0,4 kg, frete rápido Não, meta 20% → **R$ 93,90**. Usando esse preço no bloco 1, a margem fica em **20,00%**; com R$ 93,89 fica abaixo de 20%.

```text
ML exemplo 1: frete 6.85 | lucro 8.35 | margem 20.88%
ML exemplo 2 SIM: frete 12.95 | lucro 9.85 | margem 16.42%
ML exemplo 2 NÃO: frete 8.15 | lucro 14.65 | margem 24.42%
ML exemplo 3: frete 16.15 | lucro 21.85 | margem 21.85%
ML exemplo 4: frete 5.00 | lucro 0.80 | margem 8.00%
ML exemplo 5: frete 5.65 | lucro 1.91 | margem 15.92%
Shopee: frete 0.00 | lucro 26.00 | margem 26.00%
TikTok: frete 1.80 | lucro 9.70 | margem 32.33%
Bloco 2: preço 93.90 | bloco 1 nesse preço: margem 20.00%

APROVADO: 323 verificações, incluindo 96 comparações de preço mínimo com busca independente centavo por centavo.
```

## 2. Layout no navegador (`referencias/ferramentas-teste/teste-visual.js`)

Navegador automatizado: Playwright 1.48 controlando o **Google Chrome 155** instalado no computador. O Chromium que o Playwright baixa não abriu neste Windows (erro "configuração lado a lado incorreta"), por isso foi usado o Chrome, que usa o mesmo motor.

Tamanhos: 320×568, 360×640, 390×844, 412×915, 844×390, 768×1024, 1366×768 e 1920×1080. Em cada um, modos claro e escuro e nove situações: Mercado Livre, Shopee, TikTok (afiliado 5%), ML com frete manual nos dois blocos, ML com frete rápido Sim nos dois blocos (preço R$ 60), campos com erro, peso de 25 kg, meta inviável (95%) e painel "i" aberto. Onde aparece o seletor, os dois blocos foram medidos e fotografados separadamente.

Em cada caso foi medido se `scrollHeight`/`scrollWidth` do documento passam de `innerHeight`/`innerWidth`, se a área dos blocos transborda e se algum bloco tem conteúdo cortado, além de textos com reticências.

**Resultado: 176/176 casos sem rolagem vertical, sem rolagem horizontal e sem bloco cortado; nenhum texto com reticências; nenhum erro de JavaScript.**

| Tamanho | Arranjo obtido |
| --- | --- |
| 320×568 e 360×640 | Seletor "Por preço / Por margem", um bloco por vez |
| 390×844 e 412×915 | Dois blocos empilhados e compactos, campos em 2 colunas, legenda em 2 colunas |
| 768×1024 | Dois blocos empilhados, arranjo do celular com letras maiores |
| 844×390 | Blocos lado a lado, cabeçalho em uma linha |
| 1366×768 e 1920×1080 | Blocos empilhados, entradas à esquerda e resultado com gráfico à direita |

As capturas ficam em `referencias/testes-visuais/` (pasta local, fora do Git). Foram conferidas a olho: legibilidade das logos nos dois temas, aba ativa com borda e brilho, nomes curtos na legenda estreita, erros sobre a borda dos campos e aviso de 20 kg em uma linha. Problemas encontrados e corrigidos durante a rodada: logos ampliadas e cortadas nos botões, nomes cortados na legenda ("Comissã…"), espaço vazio excessivo no desktop e no tablet, cabeçalho mudando de posição ao trocar de marketplace e um pixel de rolagem causado pelo texto para leitores de tela.

## 3. Funcionamento no navegador (`referencias/ferramentas-teste/teste-funcional.js`)

**20/20 verificações aprovadas:** bloco 2 mostra R$ 93,90 e o bloco 1 com R$ 93,90 mostra 20,00%; sem ids duplicados; rótulos ligados aos campos; frete rápido no bloco 1 só abaixo de R$ 79 e sempre no bloco 2; frete manual troca peso por frete em R$ em cada bloco independentemente; botão de tema; troca de aba pelas setas do teclado; Shopee sem campos complementares; afiliado do TikTok nos dois blocos; painel "i" abre e fecha com Esc; logo com falha de carregamento mostra o nome em texto.

Teclado do celular **simulado**: com toque emulado em 390×844, o campo de peso do bloco 2 recebeu foco e a altura da tela foi reduzida para 470 px. Só a área dos blocos passou a rolar, o campo ficou visível e o documento não rolou. Ao tirar o foco e voltar a 844 px, tudo voltou a caber sem rolagem.

## 4. O que não foi verificado

- Teclado real de celular (Android e iPhone). A simulação reduz a altura da janela, como o Android faz; no iPhone o teclado se comporta de outro jeito e precisa ser conferido em aparelho.
- Áreas seguras reais (entalhe, barra de gestos). O código usa `env(safe-area-inset-*)`, mas não houve teste em aparelho.
- Firefox e Safari. Os testes usaram somente o Chrome.
- Aparelhos com fonte do sistema ampliada. O seletor aparece automaticamente se os blocos não couberem, mas isso não foi testado em aparelho.
- Publicação no GitHub Pages. Não houve envio nem push nesta rodada.
