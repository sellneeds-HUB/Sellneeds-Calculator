/* SELLNEEDS · Custos por SKU: pesquisa, edição, importação da planilha e nuvem (Supabase) sem bibliotecas. */
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

  // Mesmo formato da planilha original; o BOM faz o Excel ler os acentos corretamente.
  const toCsv = items => '﻿CUSTO;SKU\r\n' + items.map(i => i.cost.toFixed(2).replace('.', ',') + ';' + i.sku + '\r\n').join('');

  // Cada palavra pesquisada precisa aparecer no SKU ("acqua 002" acha ACQUABIOS-002); quem começa com a primeira vem antes.
  function search(items, query, limit = 50) {
    const words = String(query ?? '').split(/\s+/).map(normalizeSku).filter(Boolean);
    const q = words[0] || '';
    const found = items.map(i => ({ item: i, key: normalizeSku(i.sku) })).filter(x => words.every(w => x.key.includes(w)));
    found.sort((a, b) => (b.key.startsWith(q) - a.key.startsWith(q)) || a.item.sku.localeCompare(b.item.sku, 'pt-BR', { numeric: true }));
    return { total: found.length, items: found.slice(0, limit).map(x => x.item) };
  }

  const readJson = (storage, key) => { try { return JSON.parse(storage.getItem(key)); } catch (_) { return null; } };
  function writeJson(storage, key, value) {
    try { if (value === null) storage.removeItem(key); else storage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }

  // Sem nuvem configurada: os custos ficam só neste navegador.
  function localStore(storage) {
    const KEY = 'sellneeds-custos';
    return {
      mode: 'local',
      needsLogin: () => false,
      email: () => null,
      async load() { return Object.entries(readJson(storage, KEY) || {}).map(([sku, cost]) => ({ sku, cost })); },
      async save(list) {
        const data = readJson(storage, KEY) || {};
        list.forEach(i => { data[i.sku] = i.cost; });
        if (!writeJson(storage, KEY, data)) throw Error('Este navegador bloqueou o armazenamento. Não foi possível salvar.');
      },
      async logout() {}
    };
  }

  // Supabase pela API REST. A sessão fica salva no navegador e é renovada sozinha.
  function cloudStore(cfg, storage, http) {
    const KEY = 'sellneeds-sessao', base = cfg.url.replace(/\/+$/, ''), table = cfg.table || 'custos';
    let session = readJson(storage, KEY);
    const headers = token => ({ apikey: cfg.key, 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) });
    async function call(url, options) {
      try { return await http(url, options); } catch (_) { throw Error('Sem conexão com a nuvem. Confira a internet e tente de novo.'); }
    }
    function keep(json) {
      session = { access: json.access_token, refresh: json.refresh_token, expires: json.expires_at || Math.floor(Date.now() / 1000) + (json.expires_in || 3600), email: (json.user && json.user.email) || (session && session.email) };
      writeJson(storage, KEY, session);
    }
    function forget() { session = null; writeJson(storage, KEY, null); }
    const loginError = message => Object.assign(Error(message), { login: true });
    async function token(force) {
      if (!session) throw loginError('Entre para ver os custos.');
      if (force || session.expires - 60 < Date.now() / 1000) {
        const res = await call(base + '/auth/v1/token?grant_type=refresh_token', { method: 'POST', headers: headers(), body: JSON.stringify({ refresh_token: session.refresh }) });
        if (!res.ok) { forget(); throw loginError('Sua sessão expirou. Entre novamente.'); }
        keep(await res.json());
      }
      return session.access;
    }
    async function rest(path, options = {}, retried = false) {
      const res = await call(base + '/rest/v1/' + path, { ...options, headers: { ...headers(await token(retried)), ...options.headers } });
      if (res.status === 401 && !retried) return rest(path, options, true);
      if (res.status === 401 || res.status === 403) throw Error('Este login não tem permissão para os custos. Confira o e-mail autorizado no Supabase.');
      if (!res.ok) throw Error('A nuvem recusou o pedido (erro ' + res.status + ').');
      return res;
    }
    return {
      mode: 'cloud',
      needsLogin: () => !session,
      email: () => session && session.email,
      async login(email, password) {
        const res = await call(base + '/auth/v1/token?grant_type=password', { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) });
        if (!res.ok) throw Error(res.status === 400 ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar (erro ' + res.status + ').');
        keep(await res.json());
      },
      async logout() {
        const access = session && session.access;
        forget();
        if (access) await call(base + '/auth/v1/logout', { method: 'POST', headers: headers(access) }).catch(() => {});
      },
      // Lê em páginas: o Supabase limita a quantidade de linhas por resposta.
      async load() {
        const items = [];
        for (;;) {
          const rows = await (await rest(table + '?select=sku,custo&order=sku.asc&limit=1000&offset=' + items.length)).json();
          rows.forEach(r => items.push({ sku: r.sku, cost: Number(r.custo) }));
          if (!rows.length) return items;
        }
      },
      // Cria ou atualiza pelo SKU (upsert), em lotes.
      async save(list) {
        const now = new Date().toISOString();
        for (let i = 0; i < list.length; i += 500) {
          const body = list.slice(i, i + 500).map(x => ({ sku: x.sku, custo: x.cost, atualizado_em: now }));
          await rest(table + '?on_conflict=sku', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(body) });
        }
      }
    };
  }

  const createStore = (cloud, storage, http) => cloud && cloud.url && cloud.key ? cloudStore(cloud, storage, http) : localStore(storage);

  const api = { normalizeSku, parseCsv, toCsv, search, createStore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SellneedsCustos = api;
  if (typeof document === 'undefined' || !document.getElementById('sku-dialog')) return;

  const $ = id => document.getElementById(id);
  const dialog = $('sku-dialog');
  const decimal = n => new Intl.NumberFormat(C.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const money = n => new Intl.NumberFormat(C.locale, { style: 'currency', currency: C.currency }).format(n);
  let storage = null;
  try { storage = root.localStorage; } catch (_) { /* Sem armazenamento: só funciona enquanto a página estiver aberta. */ }
  const store = createStore(C.cloud, storage, (...args) => fetch(...args));
  const LIMIT = 50;
  const pending = new Map();
  let items = [], pick = null, message = null;

  function status(text, error) {
    message = text;
    $('sku-status').textContent = text || summary();
    $('sku-status').dataset.tone = error ? 'error' : '';
  }
  function summary() {
    const where = store.mode === 'cloud' ? ' na nuvem · ' + (store.email() || 'conectado') : ' salvos só neste aparelho';
    return items.length ? items.length.toLocaleString(C.locale) + ' SKUs' + where : 'Nenhum custo cadastrado. Toque em Importar planilha (colunas CUSTO e SKU).';
  }
  function node(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function failed(e) {
    if (e.login) { showLogin(e.message); return; }
    status(e.message, true);
  }

  // Salva ao sair do campo ou com Enter. Retorna o custo salvo, ou null se não salvou.
  async function commit(item, input) {
    if (pending.has(item.sku)) await pending.get(item.sku);
    const cost = calc.parseNumber(input.value);
    if (!validCost(cost)) { input.setAttribute('aria-invalid', 'true'); status('Custo inválido para ' + item.sku + '.', true); return null; }
    input.setAttribute('aria-invalid', 'false');
    const value = round2(cost);
    input.value = decimal(value);
    if (item.cost === value) return value;
    status('Salvando ' + item.sku + '…');
    const job = store.save([{ sku: item.sku, cost: value }]);
    pending.set(item.sku, job.catch(() => {}));
    try { await job; } catch (e) { failed(e); return null; } finally { pending.delete(item.sku); }
    const isNew = item.cost === null;
    item.cost = value;
    if (isNew) items.push(item);
    document.dispatchEvent(new CustomEvent('sellneeds:custo', { detail: { sku: item.sku, cost: value } }));
    status(item.sku + ' salvo: ' + money(value) + '.');
    if (isNew) render();
    return value;
  }

  function row(item) {
    const li = node('li', 'sku-row' + (item.cost === null ? ' is-new' : ''));
    const code = node('span', 'sku-code', item.sku);
    if (item.cost === null) code.prepend(node('small', '', 'Novo SKU'));
    const wrap = node('div', 'input-wrap sku-cost');
    const input = document.createElement('input');
    Object.assign(input, { type: 'text', inputMode: 'decimal', autocomplete: 'off', value: item.cost === null ? '' : decimal(item.cost) });
    input.setAttribute('aria-label', 'Custo de ' + item.sku);
    if (item.cost === 0) input.placeholder = '0,00';
    wrap.append(node('span', '', 'R$'), input);
    input.addEventListener('change', () => commit(item, input));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    li.append(code, wrap);
    if (pick || item.cost === null) {
      const action = node('button', 'sku-action', pick ? 'Usar' : 'Salvar');
      action.type = 'button';
      action.setAttribute('aria-label', (pick ? 'Usar custo de ' : 'Salvar custo de ') + item.sku);
      action.addEventListener('click', async () => {
        const value = await commit(item, input);
        if (value === null || !pick) return;
        pick(item.sku, value);
        dialog.close();
      });
      li.append(action);
    }
    return li;
  }

  function render() {
    const query = $('sku-query').value.trim();
    const result = search(items, query, LIMIT);
    const list = $('sku-list');
    list.replaceChildren(...result.items.map(row));
    // Nenhum SKU parecido: oferece cadastrar o que foi digitado.
    if (query && !result.total) list.append(row({ sku: query.toUpperCase(), cost: null }));
    if (!message) status(null);
    const more = $('sku-more');
    more.hidden = result.total <= LIMIT;
    more.textContent = 'Mostrando ' + LIMIT + ' de ' + result.total.toLocaleString(C.locale) + '. Digite mais do SKU para filtrar.';
  }

  async function reload() {
    if (!items.length) status('Carregando custos…');
    try {
      items = await store.load();
      message = null;
      render();
    } catch (e) { failed(e); }
  }

  function showLogin(text) {
    $('sku-login').hidden = false;
    $('sku-main').hidden = true;
    $('sku-login-error').textContent = text && !/^Entre para/.test(text) ? text : '';
    $('sku-email').focus();
  }
  function showMain() {
    $('sku-login').hidden = true;
    $('sku-main').hidden = false;
    $('sku-logout').hidden = store.mode !== 'cloud';
    $('sku-query').value = '';
    message = null;
    render();
    $('sku-query').focus();
    reload();
  }

  function open(options = {}) {
    pick = options.pick || null;
    $('sku-title').textContent = pick ? 'Escolher custo pelo SKU' : 'Custos por SKU';
    dialog.showModal();
    if (store.needsLogin()) showLogin(); else showMain();
  }
  api.open = open;

  $('sku-login').addEventListener('submit', async e => {
    e.preventDefault();
    const button = $('sku-login').querySelector('button[type="submit"]');
    button.disabled = true;
    $('sku-login-error').textContent = '';
    try { await store.login($('sku-email').value.trim(), $('sku-password').value); $('sku-password').value = ''; showMain(); }
    catch (err) { $('sku-login-error').textContent = err.message; }
    finally { button.disabled = false; }
  });
  $('sku-query').addEventListener('input', () => { message = null; render(); });
  $('sku-import').addEventListener('click', () => $('sku-file').click());
  $('sku-file').addEventListener('change', async () => {
    const file = $('sku-file').files[0];
    $('sku-file').value = '';
    if (!file) return;
    try {
      const parsed = parseCsv(await file.text());
      if (!parsed.items.length) throw Error('Nenhuma linha válida na planilha.');
      if (items.length && !confirm('Importar ' + parsed.items.length + ' SKUs? Os custos dos SKUs que já existem serão substituídos pelos da planilha.')) return;
      status('Enviando ' + parsed.items.length + ' SKUs…');
      await store.save(parsed.items);
      await reload();
      status(parsed.items.length + ' SKUs importados' + (parsed.skipped ? ' · ' + parsed.skipped + ' linhas ignoradas (sem SKU ou custo inválido)' : '') + '.');
    } catch (e) { failed(e); }
  });
  $('sku-export').addEventListener('click', () => {
    if (!items.length) { status('Não há custos para baixar.', true); return; }
    const sorted = [...items].sort((a, b) => a.sku.localeCompare(b.sku, 'pt-BR', { numeric: true }));
    const link = node('a');
    link.href = URL.createObjectURL(new Blob([toCsv(sorted)], { type: 'text/csv;charset=utf-8' }));
    link.download = 'custos-sellneeds.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  $('sku-logout').addEventListener('click', async () => { await store.logout(); items = []; showLogin(); });
  $('sku-button').addEventListener('click', () => open());
  $('sku-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
})(typeof window !== 'undefined' ? window : globalThis);
