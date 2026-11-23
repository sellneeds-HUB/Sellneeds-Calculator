/* SELLNEEDS · Custos por SKU: importação da planilha, pesquisa e backup, sem bibliotecas. Os custos ficam só no navegador.
 * O custo de um SKU só muda importando a planilha (ou um backup) ou confirmando um custo médio (medio.js). */
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
    const persist = () => { try { storage.setItem(KEY, JSON.stringify(Object.fromEntries(memory.map(i => [i.sku, i.cost])))); return true; } catch (_) { return false; } };
    try { storage.removeItem('sellneeds-sessao'); } catch (_) { /* Login antigo da nuvem, não é mais usado. */ }
    return {
      load() {
        try { const data = JSON.parse(storage.getItem(KEY)); if (data) memory = Object.entries(data).map(([sku, cost]) => ({ sku, cost })); } catch (_) { /* Sem armazenamento: usa a lista da memória. */ }
        return memory;
      },
      // Retorna false quando o navegador bloqueia o armazenamento: a lista vale só enquanto a página estiver aberta.
      replace(list) {
        memory = list.slice();
        return persist();
      },
      // Usado só ao confirmar um custo médio: troca o custo de um SKU e mantém o resto da lista.
      update(sku, cost) {
        const i = memory.findIndex(x => x.sku === sku);
        if (i < 0) memory.push({ sku, cost }); else memory[i] = { sku, cost };
        return persist();
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
  let items = store.load(), pick = null, message = null, pending = null;

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

  const Medio = () => root.SellneedsMedio;
  // Consulta: SKU, custo e atalho para o custo médio. No modo escolha, a linha inteira é um botão que usa o custo.
  function row(item) {
    const li = node('li', 'sku-row');
    const content = [node('span', 'sku-code', item.sku), node('span', 'sku-cost', money(item.cost))];
    if (!pick) {
      li.append(...content);
      if (Medio() && Medio().open) {
        const m = node('button', 'chip sku-medio', 'Custo médio');
        m.type = 'button';
        m.setAttribute('aria-label', 'Custo médio de ' + item.sku);
        m.addEventListener('click', () => { dialog.close(); Medio().open({ sku: item.sku }); });
        li.classList.add('has-medio');
        li.append(m);
      }
      return li;
    }
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
    pending = null;
    $('sku-conflict').hidden = true;
    $('sku-title').textContent = pick ? 'Escolher custo pelo SKU' : 'Custos por SKU';
    dialog.showModal();
    $('sku-query').value = '';
    message = null;
    render();
    $('sku-query').focus();
  }
  api.open = open;
  api.items = () => items;
  api.search = search;
  // Confirmação do custo médio: grava o custo novo do SKU e atualiza os blocos que usam esse SKU.
  api.setCost = (sku, cost) => {
    const saved = store.update(sku, round2(cost));
    items = store.load();
    document.dispatchEvent(new CustomEvent('sellneeds:custo', { detail: { sku, cost: round2(cost) } }));
    return saved;
  };

  // Troca a lista inteira (planilha ou backup) e avisa os blocos e o custo médio.
  function finish(list, text, skipped) {
    const saved = store.replace(list);
    items = list;
    items.forEach(i => document.dispatchEvent(new CustomEvent('sellneeds:custo', { detail: { sku: i.sku, cost: i.cost } })));
    document.dispatchEvent(new CustomEvent('sellneeds:lista'));
    message = null;
    render();
    status(text + (skipped ? ' · ' + skipped + ' linhas ignoradas (sem SKU ou custo inválido)' : '') + (saved ? '.' : '. O navegador bloqueou o armazenamento: importe de novo ao reabrir.'), !saved);
  }

  // Planilha nova x custos alterados pelo custo médio: pergunta na própria tela antes de trocar.
  function askConflicts(parsed, conflicts) {
    pending = { parsed, conflicts };
    const shown = conflicts.slice(0, 5).map(c => c.sku + ': médio ' + money(c.medio) + ' · planilha ' + (c.planilha === null ? 'sem o SKU' : money(c.planilha)));
    $('sku-conflict-text').textContent = conflicts.length + (conflicts.length === 1 ? ' SKU teve' : ' SKUs tiveram') + ' o custo alterado pelo custo médio e a planilha traz outro valor. Qual custo usar?';
    $('sku-conflict-list').replaceChildren(...shown.map(t => node('li', '', t)), ...(conflicts.length > 5 ? [node('li', '', 'e mais ' + (conflicts.length - 5) + '…')] : []));
    $('sku-conflict').hidden = false;
    $('sku-conflict-keep').focus();
  }
  function resolve(choice) {
    const p = pending;
    pending = null;
    $('sku-conflict').hidden = true;
    if (!p || choice === 'cancel') { status('Importação cancelada. Nada mudou.'); return; }
    const skus = p.conflicts.map(c => c.sku);
    const n = skus.length + (skus.length === 1 ? ' SKU ' : ' SKUs ');
    if (choice === 'keep') finish(Medio().keepApplied(p.parsed.items, p.conflicts), p.parsed.items.length + ' SKUs importados · ' + n + 'com o custo médio mantido', p.parsed.skipped);
    else { Medio().history.forget(skus); finish(p.parsed.items, p.parsed.items.length + ' SKUs importados · ' + n + 'com o custo da planilha', p.parsed.skipped); }
  }
  $('sku-conflict-keep').addEventListener('click', () => resolve('keep'));
  $('sku-conflict-sheet').addEventListener('click', () => resolve('sheet'));
  $('sku-conflict-cancel').addEventListener('click', () => resolve('cancel'));

  $('sku-query').addEventListener('input', () => { message = null; render(); });
  $('sku-import').addEventListener('click', () => $('sku-file').click());
  $('sku-file').addEventListener('change', async () => {
    const file = $('sku-file').files[0];
    $('sku-file').value = '';
    if (!file) return;
    try {
      const text = await file.text();
      // Backup exportado por este site: restaura lista, histórico e custos alterados.
      if (/\.json$/i.test(file.name) || /^\ufeff?\s*\{/.test(text)) {
        const b = Medio().parseBackup(text);
        if (!b.items.length) throw Error('O backup não tem nenhum custo.');
        if (!confirm('Restaurar o backup com ' + b.items.length + ' SKUs e ' + b.history.length + ' compras no histórico? A lista e o histórico deste aparelho serão substituídos.')) return;
        Medio().history.restore(b);
        finish(b.items, 'Backup restaurado: ' + b.items.length + ' SKUs e ' + b.history.length + ' compras');
        return;
      }
      const parsed = parseCsv(text);
      if (!parsed.items.length) throw Error('Nenhuma linha válida na planilha.');
      if (items.length && !confirm('Importar ' + parsed.items.length + ' SKUs? A lista atual (' + items.length + ' SKUs) será substituída pela da planilha.')) return;
      const conflicts = Medio() ? Medio().findConflicts(Medio().history.applied(), parsed.items) : [];
      if (conflicts.length) { askConflicts(parsed, conflicts); return; }
      finish(parsed.items, parsed.items.length + ' SKUs importados', parsed.skipped);
    } catch (e) { status(e.message, true); }
  });
  $('sku-export').addEventListener('click', () => {
    if (!items.length) { status('Nenhum custo para exportar.', true); return; }
    Medio().download('sellneeds-custos-backup-' + Medio().today() + '.json', Medio().makeBackup(items, Medio().history.data()), 'application/json');
    status('Backup baixado. No outro aparelho, use Importar e escolha esse arquivo.');
  });
  $('sku-button').addEventListener('click', () => open());
  $('sku-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})(typeof window !== 'undefined' ? window : globalThis);
