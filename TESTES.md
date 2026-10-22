# Testes da calculadora Sellneeds

Executados em 22/10/2026. Versão revisada: Mercado Livre utiliza somente o peso informado, sem campos de dimensões nem cálculo de cubagem.

## Exemplos solicitados

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

## Cobertura

319 verificações aprovadas, incluindo 96 comparações do preço mínimo com um verificador independente que percorre centavo por centavo. Também foram testados todos os limites de peso do ML, os limites das faixas de preço, teto com frete rápido, frete manual sem teto, peso acima da tabela, dimensões ignoradas no frete e no preço mínimo, entradas inválidas, metas inviáveis e configuração editável.

Nesta revisão, foi conferida no navegador a remoção dos campos de dimensões e o recálculo para 1 kg: frete R$ 16,85, lucro R$ 21,15 e preço mínimo R$ 94,78 (venda R$ 100, custo R$ 50, meta 20%).

Conferência visual e funcional da versão inicial no navegador: abas, modo escuro, validação de negativo, teto de frete, peso acima de 20 kg, frete manual e retorno visual de cópia. Conferência de layout em janelas internas de 390 e 320 px, sem rolagem horizontal observada. Não substitui uma conferência em aparelho físico.

Não houve publicação em uma conta GitHub nesta entrega; compatibilidade preparada por arquivos estáticos e caminhos relativos.

## Saída dos testes

```text
ML exemplo 1: frete 6.85 | lucro 8.35 | margem 20.88%
ML exemplo 2 SIM: frete 12.95 | lucro 9.85 | margem 16.42%
ML exemplo 2 NÃO: frete 8.15 | lucro 14.65 | margem 24.42%
ML exemplo 3: frete 16.15 | lucro 21.85 | margem 21.85%
ML exemplo 4: frete 5.00 | lucro 0.80 | margem 8.00%
ML exemplo 5: frete 5.65 | lucro 1.91 | margem 15.92%
Shopee: frete 0.00 | lucro 26.00 | margem 26.00%
TikTok: frete 1.80 | lucro 9.70 | margem 32.33%

APROVADO: 319 verificações, incluindo 96 comparações de preço mínimo com busca independente centavo por centavo.
```
