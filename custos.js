/* SELLNEEDS · Custos por SKU: importação da planilha e pesquisa, sem bibliotecas. Os custos ficam só no navegador. */
(function (root) {
  'use strict';
  const C = root.SELLNEEDS_CONFIG || (typeof require === 'function' ? require('./config.js') : null);
  const calc = root.SellneedsCalculator || (typeof require === 'function' ? require('./script.js') : null);
  const round2 = n => Math.round(n * 100) / 100;
  const validCost = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= C.maxInput;

  // Para comparar: sem acento, maiúsculo e só letras e números. "rm 001g" encontra "RM-001G".
  const normalizeSku = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Planilha exportada do Excel: colunas CUSTO e SKU, em qualquer ordem, separadas por ; (ou tab/vírgula).
  function parseCsv(text) {
    const lines = String(text ?? '').replace(/^﻿/, '').split(/\r\n|\n|\r/).filter(line => line.trim());
    if (!lines.length) throw Error('A planilha está vazia.');
    const sep = [';', '\t', ','].find(s => lines[0].includes(s));
    const cells = line => line.split(sep).map(c => c.trim().replace(/^"(.*)"$/, '$1').trim());
    const head = sep ? cells(lines[0]).map(normalizeSku) : [];
    const costCol = head.findIndex(h => h.startsWith('CUSTO')), skuCol = head.indexOf('SKU');
    if (costCol < 0 || skuCol < 0) throw Error('A planilha precisa das colunas CUSTO e SKU.');
    const bySku = new Map();
    let skipped = 0;
    lines.slice(1).forEach(line => {
      const row = cells(line);
      const sku = row[skuCol] || '', cost = calc.parseNumber(row[costCol]);
      if (!sku || !validCost(cost)) { skipped++; return; }
      bySku.set(sku, { sku, cost: round2(cost) });
    });
    return { items: [...bySku.values()], skipped };
  }

  // Cada palavra pesquisada precisa aparecer no SKU ("acqua 002" acha ACQUABIOS-002); quem começa com a primeira vem antes.
  function search(items, query, limit = 50) {
    const words = String(query ?? '').split(/\s+/).map(normalizeSku).filter(Boolean);
    const q = words[0] || '';
    const found = items.map(i => ({ item: i, key: normalizeSku(i.sku) })).filter(x => words.every(w => x.key.includes(w)));
    found.sort((a, b) => (b.key.startsWith(q) - a.key.startsWith(q)) || a.item.sku.localeCompare(b.item.sku, 'pt-BR', { numeric: true }));
    return { total: found.length, items: found.slice(0, limit).map(x => x.item) };
  }

  // A lista fica só neste navegador. Importar uma planilha substitui a lista inteira.
  function createStore(storage) {
    const KEY = 'sellneeds-custos';
    let memory = [];
    try { storage.removeItem('sellneeds-sessao'); } catch (_) { /* Login antigo da nuvem, não é mais usado. */ }
    return {
      load() {
        try { const data = JSON.parse(storage.getItem(KEY)); if (data) memory = Object.entries(data).map(([sku, cost]) => ({ sku, cost })); } catch (_) { /* Sem armazenamento: usa a lista da memória. */ }
        return memory;
      },
      // Retorna false quando o navegador bloqueia o armazenamento: a lista vale só enquanto a página estiver aberta.
      replace(list) {
        memory = list.slice();
        try { storage.setItem(KEY, JSON.stringify(Object.fromEntries(list.map(i => [i.sku, i.cost])))); return true; } catch (_) { return false; }
      }
    };
  }

  const api = { normalizeSku, parseCsv, search, createStore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SellneedsCustos = api;
  if (typeof document === 'undefined' || !document.getElementById('sku-dialog')) return;

  const $ = id => document.getElementById(id);
  const dialog = $('sku-dialog');
  const money = n => new Intl.NumberFormat(C.locale, { style: 'currency', currency: C.currency }).format(n);
  let storage = null;
  try { storage = root.localStorage; } catch (_) { /* Sem armazenamento: só funciona enquanto a página estiver aberta. */ }
  const store = createStore(storage);
  const LIMIT = 50;
  let items = store.load(), pick = null, message = null;

  function status(text, error) {
    message = text;
    $('sku-status').textContent = text || summary();
    $('sku-status').dataset.tone = error ? 'error' : '';
  }
  function summary() {
    return items.length ? items.length.toLocaleString(C.locale) + ' SKUs importados neste aparelho.' : 'Nenhum custo importado. Toque em Importar planilha (colunas CUSTO e SKU).';
  }
  function node(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  // Somente leitura: no modo escolha, a linha inteira é um botão que usa o custo.
  function row(item) {
    const li = node('li', 'sku-row');
    const content = [node('span', 'sku-code', item.sku), node('span', 'sku-cost', money(item.cost))];
    if (!pick) { li.append(...content); return li; }
    const button = node('button', 'sku-pick');
    button.type = 'button';
    button.setAttribute('aria-label', 'Usar custo de ' + item.sku + ': ' + money(item.cost));
    button.append(...content, node('span', 'sku-action', 'Usar'));
    button.addEventListener('click', () => { pick(item.sku, item.cost); dialog.close(); });
    li.append(button);
    return li;
  }

  function render() {
    const result = search(items, $('sku-query').value.trim(), LIMIT);
    $('sku-list').replaceChildren(...result.items.map(row));
    if (!message) status(items.length && !result.total ? 'Nenhum SKU encontrado.' : null);
    const more = $('sku-more');
    more.hidden = result.total <= LIMIT;
    more.textContent = 'Mostrando ' + LIMIT + ' de ' + result.total.toLocaleString(C.locale) + '. Digite mais do SKU para filtrar.';
  }

  function open(options = {}) {
    pick = options.pick || null;
    $('sku-title').textContent = pick ? 'Escolher custo pelo SKU' : 'Custos por SKU';
    dialog.showModal();
    $('sku-query').value = '';
    message = null;
    render();
    $('sku-query').focus();
  }
  api.open = open;

  $('sku-query').addEventListener('input', () => { message = null; render(); });
  $('sku-import').addEventListener('click', () => $('sku-file').click());
  $('sku-file').addEventListener('change', async () => {
    const file = $('sku-file').files[0];
    $('sku-file').value = '';
    if (!file) return;
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.items.length) throw Error('Nenhuma linha válida na planilha.');
      if (items.length && !confirm('Importar ' + parsed.items.length + ' SKUs? A lista atual (' + items.length + ' SKUs) será substituída pela da planilha.')) return;
      const saved = store.replace(parsed.items);
      items = parsed.items;
      // Blocos que já usam um SKU recebem o custo novo.
      items.forEach(i => document.dispatchEvent(new CustomEvent('sellneeds:custo', { detail: { sku: i.sku, cost: i.cost } })));
      message = null;
      render();
      status(parsed.items.length + ' SKUs importados' + (parsed.skipped ? ' · ' + parsed.skipped + ' linhas ignoradas (sem SKU ou custo inválido)' : '') + (saved ? '.' : '. O navegador bloqueou o armazenamento: importe de novo ao reabrir.'), !saved);
    } catch (e) { status(e.message, true); }
  });
  $('sku-button').addEventListener('click', () => open());
  $('sku-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})(typeof window !== 'undefined' ? window : globalThis);
