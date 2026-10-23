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
