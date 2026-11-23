/* SELLNEEDS · Custo médio por SKU: calcula o novo custo de uma compra, guarda o histórico e, ao confirmar, troca o custo do SKU. Tudo fica só no navegador. */
(function (root) {
  'use strict';
  const C = root.SELLNEEDS_CONFIG || (typeof require === 'function' ? require('./config.js') : null);
  const calc = root.SellneedsCalculator || (typeof require === 'function' ? require('./script.js') : null);
  const round2 = n => Math.round(n * 100) / 100;
  const finite = n => typeof n === 'number' && Number.isFinite(n);
  const valid = (n, min = 0) => finite(n) && n >= min && n <= C.maxInput;
  const ALERT = 0.3; // Compra 30% acima ou abaixo do custo atual pede conferência.

  // Novo custo médio = (estoque × custo atual + compra × custo da compra) ÷ (estoque + compra), em centavos.
  // Sem estoque, o custo atual não pesa e pode ficar vazio.
  function averageCost({ stock, prevCost, qty, unitCost }) {
    const errors = {};
    if (!valid(stock)) errors.stock = 'Informe o estoque (0 ou mais).';
    if (!valid(qty) || qty === 0) errors.qty = 'Informe a quantidade comprada.';
    if (!valid(unitCost)) errors.unitCost = 'Informe o custo da compra.';
    const usesPrev = valid(stock) && stock > 0;
    if (usesPrev && !valid(prevCost)) errors.prevCost = 'Informe o custo atual.';
    if (Object.keys(errors).length) return { ok: false, errors };
    const prev = usesPrev ? prevCost : (valid(prevCost) ? prevCost : null);
    const totalQty = stock + qty;
    const totalValue = (usesPrev ? stock * prevCost : 0) + qty * unitCost;
    const avg = round2(totalValue / totalQty);
    const change = prev ? avg / prev - 1 : null;
    const warnings = [];
    if (prev && Math.abs(unitCost / prev - 1) > ALERT) {
      warnings.push('O custo da compra está ' + Math.round(Math.abs(unitCost / prev - 1) * 100) + '% ' + (unitCost > prev ? 'acima' : 'abaixo') + ' do custo atual. Confira antes de confirmar.');
    }
    if (stock > 0 && qty > stock * 20 && qty >= 1000) warnings.push('A compra é mais de 20 vezes o estoque atual. Confira a quantidade.');
    return { ok: true, avg, prev, change, totalQty, totalValue: round2(totalValue), warnings };
  }

  // SKUs cujo custo foi trocado pelo custo médio e que a planilha nova mudaria (ou não traz).
  function findConflicts(applied, items) {
    const bySku = new Map(items.map(i => [i.sku, i.cost]));
    return Object.entries(applied || {})
      .filter(([sku, a]) => !bySku.has(sku) || Math.abs(bySku.get(sku) - a.cost) > 0.004)
      .map(([sku, a]) => ({ sku, medio: a.cost, planilha: bySku.has(sku) ? bySku.get(sku) : null }));
  }
  // Mantém o custo médio desses SKUs na lista nova.
  function keepApplied(items, conflicts) {
    const keep = new Map(conflicts.map(c => [c.sku, c.medio]));
    const list = items.map(i => keep.has(i.sku) ? { sku: i.sku, cost: keep.get(i.sku) } : i);
    conflicts.filter(c => c.planilha === null).forEach(c => list.push({ sku: c.sku, cost: c.medio }));
    return list;
  }

  // Histórico de compras: "aplicado" trocou o custo do SKU, "registro" só foi salvo, "desfeito" voltou ao custo anterior.
  // applied guarda, por SKU, o custo que o custo médio gravou (usado ao importar a planilha de novo).
  function createHistory(storage) {
    const KEY = 'sellneeds-custo-medio';
    let data = { history: [], applied: {} };
    const persist = () => { try { storage.setItem(KEY, JSON.stringify(data)); return true; } catch (_) { return false; } };
    try { const saved = JSON.parse(storage.getItem(KEY)); if (saved && Array.isArray(saved.history)) data = { history: saved.history, applied: saved.applied || {} }; } catch (_) { /* Sem armazenamento: histórico só na memória. */ }
    return {
      list: sku => data.history.filter(e => !sku || e.sku === sku).slice().reverse(),
      get: id => data.history.find(e => e.id === id),
      applied: () => ({ ...data.applied }),
      add(entry) {
        const e = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: new Date().toISOString(), ...entry };
        data.history.push(e);
        if (e.status === 'aplicado') data.applied[e.sku] = { cost: e.avg, id: e.id };
        return { entry: e, saved: persist() };
      },
      // Aplica um registro salvo: o SKU passa a usar o custo médio dele.
      apply(id) {
        const e = this.get(id);
        if (!e || e.status === 'aplicado') return null;
        e.status = 'aplicado'; e.appliedAt = new Date().toISOString();
        data.applied[e.sku] = { cost: e.avg, id: e.id };
        persist();
        return e;
      },
      // Desfaz a última compra aplicada do SKU: devolve o custo anterior e reativa a compra anterior, se houver.
      undo(id) {
        const e = this.get(id);
        if (!e || !data.applied[e.sku] || data.applied[e.sku].id !== id) return null;
        e.status = 'desfeito';
        const before = data.history.filter(x => x.sku === e.sku && x.status === 'aplicado' && x.id !== id && Math.abs(x.avg - e.prevCost) < 0.005).pop();
        if (before) data.applied[e.sku] = { cost: before.avg, id: before.id }; else delete data.applied[e.sku];
        persist();
        return e;
      },
      remove(id) {
        const i = data.history.findIndex(e => e.id === id);
        if (i < 0 || data.history[i].status === 'aplicado') return false;
        data.history.splice(i, 1);
        persist();
        return true;
      },
      // A planilha nova venceu: esses SKUs deixam de contar como alterados pelo custo médio.
      forget(skus) { skus.forEach(s => delete data.applied[s]); persist(); },
      restore(next) { data = { history: next.history || [], applied: next.applied || {} }; return persist(); },
      data: () => JSON.parse(JSON.stringify(data))
    };
  }

  const csvMoney = n => n === null || n === undefined ? '' : String(round2(n)).replace('.', ',');
  const STATUS = { aplicado: 'Aplicado no SKU', registro: 'Só registro', desfeito: 'Desfeito' };
  function historyCsv(entries) {
    const head = 'Data;SKU;Estoque;Custo anterior;Quantidade comprada;Custo da compra;Custo médio;Situação';
    return '﻿' + [head, ...entries.map(e => [new Date(e.date).toLocaleString('pt-BR'), e.sku, e.stock, csvMoney(e.prevCost), e.qty, csvMoney(e.unitCost), csvMoney(e.avg), STATUS[e.status] || e.status].join(';'))].join('\r\n');
  }

  // Backup para levar a outro aparelho: lista de custos, histórico e SKUs alterados.
  function makeBackup(items, data) {
    return JSON.stringify({ tipo: 'sellneeds-custos', versao: 1, exportadoEm: new Date().toISOString(), custos: Object.fromEntries(items.map(i => [i.sku, i.cost])), historico: data.history, aplicados: data.applied }, null, 1);
  }
  function parseBackup(text) {
    let b;
    try { b = JSON.parse(String(text).replace(/^﻿/, '')); } catch (_) { throw Error('Arquivo de backup inválido.'); }
    if (!b || b.tipo !== 'sellneeds-custos' || typeof b.custos !== 'object') throw Error('Este arquivo não é um backup de custos da Sellneeds.');
    const items = Object.entries(b.custos).filter(([sku, cost]) => sku && valid(cost)).map(([sku, cost]) => ({ sku, cost: round2(cost) }));
    return { items, history: Array.isArray(b.historico) ? b.historico : [], applied: b.aplicados && typeof b.aplicados === 'object' ? b.aplicados : {} };
  }

  const api = { averageCost, findConflicts, keepApplied, createHistory, historyCsv, makeBackup, parseBackup };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SellneedsMedio = api;
  if (typeof document === 'undefined' || !document.getElementById('medio-dialog')) return;

  // ---------- Tela sobreposta ----------
  const $ = id => document.getElementById(id);
  const dialog = $('medio-dialog');
  const money = n => new Intl.NumberFormat(C.locale, { style: 'currency', currency: C.currency }).format(n);
  const qtyText = n => new Intl.NumberFormat(C.locale, { maximumFractionDigits: 2 }).format(n);
  const decimal = n => new Intl.NumberFormat(C.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + new Intl.NumberFormat(C.locale, { maximumFractionDigits: 1 }).format(Math.abs(n * 100)) + '%';
  let storage = null;
  try { storage = root.localStorage; } catch (_) { /* Sem armazenamento. */ }
  const history = createHistory(storage);
  const Custos = () => root.SellneedsCustos;
  const FIELDS = ['stock', 'prevCost', 'qty', 'unitCost'];
  let sku = null, last = null;

  function node(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function status(text, tone) { $('medio-status').textContent = text || ''; $('medio-status').dataset.tone = tone || ''; }
  const costOf = s => { const i = Custos() && Custos().items().find(x => x.sku === s); return i ? i.cost : null; };

  function setSku(next) {
    sku = next;
    $('medio-pick').hidden = !!sku;
    $('medio-picked').hidden = !sku;
    if (sku) {
      $('medio-sku').textContent = sku;
      const cost = costOf(sku);
      $('medio-sku-cost').textContent = cost === null ? 'sem custo' : 'custo atual ' + money(cost);
      $('medio-prevCost').value = cost === null ? '' : decimal(cost);
    } else {
      $('medio-query').value = '';
    }
    renderResults();
    renderHistory();
    update();
  }

  function renderResults() {
    const list = $('medio-results');
    const items = Custos() ? Custos().items() : [];
    if (sku) { list.replaceChildren(); return; }
    // A busca usa a mesma lista de custos por SKU da lupa (a planilha importada neste aparelho).
    if (!items.length) {
      const li = node('li', 'medio-empty', 'A busca usa a planilha de custos por SKU, que ainda não foi importada neste navegador. ');
      const b = node('button', 'chip primary', 'Importar planilha de custos');
      b.type = 'button';
      b.addEventListener('click', () => { dialog.close(); Custos().importFile(); });
      li.append(b);
      list.replaceChildren(li);
      return;
    }
    const q = $('medio-query').value.trim();
    const found = Custos().search(items, q, 6);
    if (!q) { list.replaceChildren(node('li', 'medio-empty', 'Digite parte do SKU para escolher o produto.')); return; }
    if (!found.total) { list.replaceChildren(node('li', 'medio-empty', 'Nenhum SKU encontrado.')); return; }
    list.replaceChildren(...found.items.map(item => {
      const li = node('li', 'sku-row');
      const b = node('button', 'sku-pick');
      b.type = 'button';
      b.append(node('span', 'sku-code', item.sku), node('span', 'sku-cost', money(item.cost)), node('span', 'sku-action', 'Escolher'));
      b.addEventListener('click', () => { setSku(item.sku); $('medio-stock').focus(); });
      li.append(b);
      return li;
    }));
  }

  function read() { return Object.fromEntries(FIELDS.map(k => [k, calc.parseNumber($('medio-' + k).value)])); }
  function fieldError(k, message) {
    $('medio-' + k).setAttribute('aria-invalid', String(!!message));
    $('medio-' + k + '-error').textContent = message || '';
  }

  // Mostra o resultado enquanto digita; erros só aparecem nos campos já preenchidos.
  function update(showAll) {
    const data = read();
    const r = averageCost(data);
    FIELDS.forEach(k => fieldError(k, !r.ok && r.errors[k] && (showAll || $('medio-' + k).value.trim()) ? r.errors[k] : ''));
    last = r.ok && sku ? { ...data, ...r } : null;
    const box = $('medio-result');
    $('medio-save').disabled = $('medio-confirm').disabled = !last;
    if (!r.ok || !sku) {
      box.dataset.tone = 'empty';
      $('medio-value').textContent = '—';
      $('medio-compare').textContent = sku ? 'Preencha estoque, quantidade e custo da compra.' : 'Escolha o SKU para começar.';
      $('medio-total').textContent = '';
      $('medio-warn').hidden = true;
      return r;
    }
    box.dataset.tone = r.warnings.length ? 'warn' : 'good';
    $('medio-value').textContent = money(r.avg);
    $('medio-compare').textContent = r.prev === null ? 'Sem custo anterior: o custo médio é o da compra.' : 'Custo anterior ' + money(r.prev) + ' → ' + money(r.avg) + ' (' + signed(r.change) + ')';
    $('medio-total').textContent = 'Estoque total ' + qtyText(r.totalQty) + ' un · valor ' + money(r.totalValue);
    $('medio-warn').hidden = !r.warnings.length;
    $('medio-warn').textContent = r.warnings.join(' ');
    return r;
  }

  function clearPurchase() {
    ['stock', 'qty', 'unitCost'].forEach(k => { $('medio-' + k).value = ''; });
    const cost = costOf(sku);
    $('medio-prevCost').value = cost === null ? '' : decimal(cost);
    $('medio-sku-cost').textContent = cost === null ? 'sem custo' : 'custo atual ' + money(cost);
    update();
  }

  function setCost(s, cost) {
    const saved = Custos().setCost(s, cost);
    return saved ? '' : ' O navegador bloqueou o armazenamento: exporte o backup antes de fechar.';
  }

  function save(apply) {
    const r = update(true);
    if (!r.ok || !sku) { status('Confira os campos destacados.', 'error'); return; }
    if (apply && r.warnings.length && !confirm(r.warnings.join('\n') + '\n\nConfirmar o novo custo de ' + money(r.avg) + ' para ' + sku + '?')) return;
    const entry = { sku, stock: last.stock, prevCost: r.prev, qty: last.qty, unitCost: last.unitCost, avg: r.avg, status: apply ? 'aplicado' : 'registro' };
    const added = history.add(entry);
    let extra = added.saved ? '' : ' O navegador bloqueou o armazenamento: o histórico vale só enquanto a página estiver aberta.';
    if (apply) {
      extra += setCost(sku, r.avg);
      status('Custo de ' + sku + ' alterado: ' + (r.prev === null ? '' : money(r.prev) + ' → ') + money(r.avg) + '. Os cálculos com esse SKU já usam o custo novo.' + extra, extra ? 'error' : 'good');
    } else {
      status('Registro salvo no histórico. O custo de ' + sku + ' não mudou (' + (costOf(sku) === null ? 'sem custo' : money(costOf(sku))) + ').' + extra, extra ? 'error' : '');
    }
    clearPurchase();
    renderHistory();
  }

  function entryRow(e) {
    const li = node('li', 'medio-entry');
    li.dataset.status = e.status;
    const when = new Date(e.date);
    const head = node('div', 'medio-entry-head');
    head.append(node('span', 'sku-code', e.sku), node('span', 'medio-badge', STATUS[e.status] || e.status));
    const detail = node('p', 'medio-entry-detail',
      when.toLocaleDateString('pt-BR') + ' · estoque ' + qtyText(e.stock) + ' + compra ' + qtyText(e.qty) + ' × ' + money(e.unitCost));
    const costs = node('p', 'medio-entry-costs', (e.prevCost === null || e.prevCost === undefined ? 'sem custo anterior' : 'anterior ' + money(e.prevCost)) + ' → médio ' + money(e.avg));
    li.append(head, detail, costs);
    const actions = node('div', 'medio-entry-actions');
    const applied = history.applied()[e.sku];
    if (e.status === 'registro') {
      const a = node('button', 'chip', 'Aplicar no SKU');
      a.type = 'button';
      a.addEventListener('click', () => {
        const now = costOf(e.sku);
        if (now !== null && e.prevCost !== null && Math.abs(now - e.prevCost) > 0.004 && !confirm('O custo de ' + e.sku + ' mudou desde esse registro (era ' + money(e.prevCost) + ', agora é ' + money(now) + ').\n\nAplicar ' + money(e.avg) + ' mesmo assim?')) return;
        history.apply(e.id);
        const extra = setCost(e.sku, e.avg);
        status('Custo de ' + e.sku + ' alterado: ' + (now === null ? '' : money(now) + ' → ') + money(e.avg) + '.' + extra, extra ? 'error' : 'good');
        if (sku === e.sku) clearPurchase();
        renderHistory();
      });
      const d = node('button', 'chip', 'Excluir');
      d.type = 'button';
      d.addEventListener('click', () => { if (confirm('Excluir este registro do histórico?')) { history.remove(e.id); renderHistory(); } });
      actions.append(a, d);
    } else if (e.status === 'aplicado' && applied && applied.id === e.id) {
      const u = node('button', 'chip', 'Desfazer');
      u.type = 'button';
      u.addEventListener('click', () => {
        const back = e.prevCost === null || e.prevCost === undefined ? null : e.prevCost;
        if (back === null) { status('Essa compra não tinha custo anterior para voltar. Corrija com uma nova compra.', 'error'); return; }
        if (!confirm('Voltar o custo de ' + e.sku + ' de ' + money(e.avg) + ' para ' + money(back) + '?')) return;
        history.undo(e.id);
        const extra = setCost(e.sku, back);
        status('Compra desfeita: ' + e.sku + ' voltou para ' + money(back) + '.' + extra, extra ? 'error' : '');
        if (sku === e.sku) clearPurchase();
        renderHistory();
      });
      actions.append(u);
    }
    if (actions.children.length) li.append(actions);
    return li;
  }

  function renderHistory() {
    const entries = history.list(sku);
    $('medio-history-title').textContent = sku ? 'Histórico de ' + sku : 'Últimas compras';
    $('medio-export').disabled = !history.list().length;
    const list = $('medio-history');
    if (!entries.length) { list.replaceChildren(node('li', 'medio-empty', sku ? 'Nenhuma compra registrada para esse SKU.' : 'Nenhuma compra registrada ainda.')); return; }
    list.replaceChildren(...entries.slice(0, sku ? 100 : 20).map(entryRow));
  }

  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = node('a');
    a.href = url; a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const today = () => new Date().toISOString().slice(0, 10);

  function open(options = {}) {
    if (!dialog.open) dialog.showModal();
    status('');
    setSku(options.sku || null);
    if (options.sku) clearPurchase();
    (options.sku ? $('medio-stock') : $('medio-query')).focus();
  }
  api.open = open;
  api.history = history;
  api.download = download;
  api.today = today;

  FIELDS.forEach(k => $('medio-' + k).addEventListener('input', () => { status(''); update(); }));
  $('medio-form').addEventListener('submit', e => { e.preventDefault(); save(true); });
  $('medio-query').addEventListener('input', renderResults);
  $('medio-change').addEventListener('click', () => { setSku(null); $('medio-query').focus(); });
  $('medio-save').addEventListener('click', () => save(false));
  $('medio-confirm').addEventListener('click', () => save(true));
  $('medio-export').addEventListener('click', () => download('sellneeds-custo-medio-' + today() + '.csv', historyCsv(history.list().reverse()), 'text/csv;charset=utf-8'));
  $('medio-button').addEventListener('click', () => open());
  $('medio-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  // Planilha nova ou backup: atualiza o custo mostrado do SKU escolhido.
  document.addEventListener('sellneeds:lista', () => { if (dialog.open) { if (sku) clearPurchase(); renderResults(); renderHistory(); } });
})(typeof window !== 'undefined' ? window : globalThis);
