# Testes · Sellneeds · 23/10/2026

O arquivo `testes.js` foi mantido byte a byte nesta alteração de interface.

## Resultados anteriores, sem alteração

| Exemplo | Frete | Lucro | Margem |
|---|---:|---:|---:|
| ML 1: preço 40, custo 20, peso 0,25 kg | R$ 6,85 | R$ 8,35 | 20,875% |
| ML 2: preço 60, custo 30, 0,3 kg, rápido SIM | R$ 12,95 | R$ 9,85 | 16,4167% |
| ML 2: preço 60, custo 30, 0,3 kg, rápido NÃO | R$ 8,15 | R$ 14,65 | 24,4167% |
| ML 3: preço 100, custo 50, peso 0,4 kg | R$ 16,15 | R$ 21,85 | 21,85% |
| ML 4: preço 10, custo 3, peso 0,3 kg | R$ 5,00 | R$ 0,80 | 8% |
| ML 5: preço 12, custo 3, peso 0,3 kg | R$ 5,65 | R$ 1,91 | 15,9167% |
| Shopee: preço 100, custo 40 | R$ 0,00 | R$ 26,00 | 26% |
| TikTok: preço 30, custo 10, afiliado 5% | R$ 1,80 | R$ 9,70 | 32,3333% |

A versão atual usa somente o peso informado, conforme o ajuste anterior. As dimensões dos exemplos originais não mudam estes resultados.

## Preço para a meta

| Cenário | Preço ideal | Lucro exibido | Margem real |
|---|---:|---:|---:|
| ML: custo 20, peso 0,25 kg, rápido NÃO, meta 20% | R$ 39,49 | R$ 7,90 | 20,0081% |
| Shopee: custo 40, meta 26% | R$ 93,34 | R$ 24,27 | 26,0043% |
| TikTok: custo 10, afiliado 5%, meta 20% | R$ 23,73 | R$ 4,75 | 20,0029% |

As funções de cálculo de venda, peso, preço ideal e margem máxima foram comparadas com a versão anterior e permaneceram idênticas. As tabelas, percentuais, limites e valores padrão também foram comparados e são iguais. A mudança de cor abaixo da meta é uma mudança de apresentação.

Execução de `node testes.js`: **319 verificações aprovadas**, incluindo 96 comparações do preço mínimo com busca independente centavo por centavo. Os testes existentes abrangem as fronteiras de preço e peso, o limite de 50%, frete rápido, frete manual, valores inválidos e metas inviáveis.

## Interface

| Área útil | Mercado Livre | Shopee | TikTok |
|---|---|---|---|
| 360 × 640 | Sem rolagem | Sem rolagem | Sem rolagem |
| 390 × 844 | Sem rolagem | Sem rolagem | Sem rolagem |
| 412 × 915 | Sem rolagem | Sem rolagem | Sem rolagem |
| 844 × 390 | Sem rolagem | Sem rolagem | Sem rolagem |
| 768 × 1024 | Sem rolagem | Sem rolagem | Sem rolagem |
| 1366 × 768 | Sem rolagem | Sem rolagem | Sem rolagem |
| 1920 × 1080 | Sem rolagem | Sem rolagem | Sem rolagem |

Conferência em navegador Chromium, usando frames com as dimensões exatas acima, zoom 100%, sem teclado virtual. Medidos os limites dos elementos, a largura e a altura de rolagem; nenhum controle ou resultado verificado ficou fora da área útil. Não é teste em aparelhos físicos.

Também verificados: meta inviável e aviso de limite de frete simultâneos; alvos de toque de pelo menos 40 px; painel de detalhes sem rolagem em 360×640 e 844×390; frete manual de R$ 8 aplicado sem limite de 50%; preço ideal com preço de venda vazio; cores verde/amarelo/vermelho; opção de frete rápido oculta a partir de R$ 79.

Limite: áreas menores, teclado aberto e zoom de acessibilidade podem reduzir o espaço disponível além das condições testadas. Consulte o LEIA-ME.
