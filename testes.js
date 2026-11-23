/* Testes independentes. Opcional: node testes.js (não é necessário para o site). */
'use strict';
const assert = require('node:assert/strict');
const C = require('./config.js');
const { calculate, minimumPrice, parseNumber, weights, validateConfig } = require('./script.js');
let checks = 0;
function equal(a,b,msg) { assert.ok(Math.abs(a-b) < 1e-7, `${msg}: obtido ${a}, esperado ${b}`); checks++; }
function ok(condition,msg) { assert.ok(condition,msg); checks++; }
validateConfig();
const base = { ...C.defaults, weight:0.3 };
const examples = [
 ['ML exemplo 1', 'mercadoLivre', {price:40,cost:20,weight:0.25}, 6.85, 8.35],
 ['ML exemplo 2 SIM', 'mercadoLivre', {price:60,cost:30,fastShipping:true}, 12.95,9.85],
 ['ML exemplo 2 NÃO', 'mercadoLivre', {price:60,cost:30},8.15,14.65],
 ['ML exemplo 3', 'mercadoLivre', {price:100,cost:50,weight:0.4},16.15,21.85],
 ['ML exemplo 4', 'mercadoLivre', {price:10,cost:3},5,0.8],
 ['ML exemplo 5', 'mercadoLivre', {price:12,cost:3},5.65,1.91],
 ['Shopee', 'shopee', {price:100,cost:40},0,26],
 ['TikTok', 'tiktok', {price:30,cost:10,affiliate:5},1.8,9.7]
];
examples.forEach(([name,market,values,shipping,profit])=>{
 const data = {...base,...values}; const r=calculate(market,data);
 ok(r.ok,name); equal(r.shipping,shipping,name+' frete'); equal(r.profit,profit,name+' lucro'); equal(r.margin,profit/data.price,name+' margem');
 console.log(name+': frete '+r.shipping.toFixed(2)+' | lucro '+r.profit.toFixed(2)+' | margem '+(r.margin*100).toFixed(2)+'%');
});
// Todos os limites de preço e de peso; protege <= no teto da linha.
const prices = [18.99,19,48.99,49,78.99,79,99.99,100,119.99,120,149.99,150,199.99,200];
C.mercadoLivre.shippingTable.forEach((row,i)=>{
 const at = {...base,price:100,cost:0,weight:row[0]};
 equal(calculate('mercadoLivre',at).shipping,row[5],'Peso exato '+row[0]);
 if(i<C.mercadoLivre.shippingTable.length-1) equal(calculate('mercadoLivre',{...at,weight:row[0]+0.0001}).shipping,C.mercadoLivre.shippingTable[i+1][5],'Próxima linha');
});
prices.forEach(price=>{
 const index = price<19?1:price<49?2:price<79?3:price<100?4:price<120?5:price<150?6:price<200?7:8;
 const expected=C.mercadoLivre.shippingTable[0][index];
 equal(calculate('mercadoLivre',{...base,price,cost:0}).shipping,expected,'Faixa '+price);
});
equal(calculate('mercadoLivre',{...base,price:10,cost:3,fastShipping:true}).shipping,5,'Teto com rápido');
ok(!calculate('mercadoLivre',{...base,price:12,cost:3}).rules.capped,'Teto não deve anunciar redução inexistente');
equal(calculate('mercadoLivre',{...base,price:10,cost:3,manualMode:true,manualShipping:8}).shipping,8,'Manual ignora teto');
ok(!calculate('mercadoLivre',{...base,weight:20.01}).ok,'Acima de 20 bloqueia');
ok(calculate('mercadoLivre',{...base,weight:30,manualMode:true,manualShipping:70}).ok,'Manual permite >20kg');
ok(calculate('mercadoLivre',{...base,weight:null,manualMode:true,manualShipping:0}).ok,'Manual sem peso');
equal(weights({...base,length:60,width:40,height:30,weight:1}).charged,1,'Dimensões não alteram peso usado');
equal(calculate('mercadoLivre',{...base,length:100,width:100,height:100,weight:1}).shipping,16.85,'Dimensões não alteram frete');
equal(minimumPrice('mercadoLivre',{...base,length:100,width:100,height:100,weight:1},20).price,minimumPrice('mercadoLivre',{...base,weight:1},20).price,'Dimensões não alteram preço mínimo');
[null,0,-1,NaN,Infinity].forEach(weight=>ok(!calculate('mercadoLivre',{...base,weight}).ok,'Peso inválido '+weight));
[null,0,-10,NaN,Infinity].forEach(price=>ok(!calculate('shopee',{...base,price}).ok,'Preço inválido '+price));
[null,-1,NaN].forEach(cost=>ok(!calculate('tiktok',{...base,cost}).ok,'Custo inválido'));
[null,-1,101,NaN].forEach(affiliate=>ok(!calculate('tiktok',{...base,affiliate}).ok,'Afiliado inválido'));
for(const s of ['12,50','12.50']) equal(parseNumber(s),12.5,'Decimal');
for(const s of ['R$ 1.234,56','1,234.56']) equal(parseNumber(s),1234.56,'Agrupamento');
equal(parseNumber('0,375'),0.375,'Peso decimal');
ok(parseNumber('')===null,'Vazio não vira zero');
for(const s of ['abc','1..2','1,2,3']) ok(Number.isNaN(parseNumber(s)),'Entrada malformada');
equal(calculate('shopee',{...base,price:200}).fixed,26,'Shopee 200');
// Shopee, taxa por item (03/11/2026): abaixo de R$ 9 = 50% do preço; R$ 9 a R$ 79,99 = R$ 4,50.
[[8.99,4.495],[8,4],[9,4.5],[79.99,4.5],[80,16],[99.99,16],[100,20],[199.99,20]].forEach(([price,fixed])=>equal(calculate('shopee',{...base,price}).fixed,fixed,'Shopee taxa por item '+price));
equal(calculate('shopee',{...base,price:8,cost:1}).profit,8-1.6-4-1,'Shopee R$ 8: comissão 20% + 50% do preço');
equal(calculate('shopee',{...base,price:50,cost:20}).profit,50-10-4.5-20,'Shopee R$ 50: taxa de R$ 4,50');
console.log('Shopee R$ 8, custo 1: taxa '+calculate('shopee',{...base,price:8,cost:1}).fixed.toFixed(2)+' | R$ 50, custo 20: lucro '+calculate('shopee',{...base,price:50,cost:20}).profit.toFixed(2));
equal(calculate('tiktok',{...base,price:50}).shipping,6,'TikTok 50');
equal(calculate('tiktok',{...base,price:49.99}).shipping,2.9994,'TikTok abaixo de 50');
// Verificador independente: procura centavo por centavo até a primeira solução.
function oracleProfit(market,p,d) {
 if(market==='mercadoLivre') {
  let shipping=d.manualShipping;
  if(!d.manualMode) {
   const charged=d.weight;
   const row=C.mercadoLivre.shippingTable.find(r=>r[0]>=charged);
   if(!row)return NaN;
   const col=p<79&&d.fastShipping?4:p<19?1:p<49?2:p<79?3:p<100?4:p<120?5:p<150?6:p<200?7:8;
   shipping=row[col]; if(p<19)shipping=Math.min(shipping,p*.5);
  }
  return p*.88-shipping-d.cost;
 }
 if(market==='shopee')return p*(p<80?.8:.86)-(p<9?p*.5:p<80?4.5:p<100?16:p<200?20:26)-d.cost;
 return p*(1-(p<50?.1:.06)-(p<50?.06:0)-d.affiliate/100)-(p<50?4:12)-d.cost;
}
let scenarios=0;
for(const market of ['mercadoLivre','shopee','tiktok']) {
 for(const cost of [0,3,20,40,80,120]) {
  for(const target of [0,10,20,35]) {
   for(const fast of (market==='mercadoLivre'?[false,true]:[false])) {
    const data={...base,cost,affiliate:12,fastShipping:fast};
    const result=minimumPrice(market,data,target);
    let expected=null;
    for(let cents=1;cents<=100000;cents++) {
     const p=cents/100;
     if(oracleProfit(market,p,data)/p+1e-9>=target/100){expected=p;break;}
    }
    ok(result.ok,'Mínimo existe'); equal(result.price,expected,'Mínimo global '+market+'/'+cost+'/'+target+'/'+fast); scenarios++;
   }
  }
 }
}
for(const target of [0,20,80]) {
 const d={...base,cost:50,manualMode:true,manualShipping:12,weight:30};
 const r=minimumPrice('mercadoLivre',d,target);
 equal(r.price,Math.ceil((50+12)/(.88-target/100)*100-1e-9)/100,'Mínimo manual');
}
ok(!minimumPrice('tiktok',{...base,affiliate:100},0).ok,'Meta impossível');
ok(!minimumPrice('mercadoLivre',base,100).ok,'Meta de 100% impossível com comissão');
ok(!minimumPrice('mercadoLivre',{...base,weight:30},20).ok,'Mínimo bloqueado acima do peso');
// Configuração realmente altera cálculo e cores, sem alterar a lógica.
const oldThresholds=C.marginColors;
C.marginColors={low:.26,high:.30};
ok(calculate('shopee',{...base,price:100,cost:40}).tone==='warn','Limite inferior inclusivo');
C.marginColors={low:.10,high:.26};
ok(calculate('shopee',{...base,price:100,cost:40}).tone==='warn','Limite superior inclusivo');
C.marginColors=oldThresholds;
// Bloco 2 "Cálculo por margem" e ida e volta com o bloco 1 "Cálculo por preço".
const bloco2={...C.defaults,cost:50,weight:0.4,fastShipping:false,manualMode:false};
const porMargem=minimumPrice('mercadoLivre',bloco2,20);
ok(porMargem.ok,'Bloco 2: meta de 20% viável');
equal(porMargem.price,93.90,'Bloco 2: ML, custo 50, 0,4 kg, rápido Não, meta 20%');
const porPreco=calculate('mercadoLivre',{...bloco2,price:porMargem.price});
ok((porPreco.margin*100).toFixed(2)==='20.00','Bloco 1 com R$ 93,90: margem 20,00% (obtido '+(porPreco.margin*100).toFixed(4)+'%)');
ok(calculate('mercadoLivre',{...bloco2,price:93.89}).margin<0.20,'Bloco 1 com R$ 93,89 fica abaixo de 20%');
console.log('Bloco 2: preço '+porMargem.price.toFixed(2)+' | bloco 1 nesse preço: margem '+(porPreco.margin*100).toFixed(2)+'%');
// Aba Fiscal: reproduz a planilha "tabela de calculadora.xlsx" (ML, preço 32,99, custo 15,96, frete 7,35).
// A planilha usa tarifa de 11,5%; a calculadora usa a comissão do config. O teste troca a comissão só para comparar.
const { fiscal } = require('./script.js');
const planilhaFiscal={...C.defaults,price:32.99,cost:15.96,manualMode:true,manualShipping:7.35};
const comissaoML=C.mercadoLivre.commission; C.mercadoLivre.commission=0.115;
const comDifal=fiscal('mercadoLivre',{...planilhaFiscal,icms:0.189}), semDifal=fiscal('mercadoLivre',{...planilhaFiscal,icms:0.091});
C.mercadoLivre.commission=comissaoML;
ok(comDifal.ok&&semDifal.ok,'Fiscal: planilha calculada');
equal(comDifal.icms,6.23511,'Fiscal: ICMS 18,9%'); equal(comDifal.pisCofins,2.474827325,'Fiscal: PIS e COFINS sobre preço menos ICMS');
equal(comDifal.netRevenue,24.280062675,'Fiscal: receita líquida'); equal(comDifal.netCost,11.61094751885669,'Fiscal: custo líquido');
equal(comDifal.feeCredit,0.350931125,'Fiscal: crédito sobre a tarifa'); equal(comDifal.platform,9.0880869412557779,'Fiscal: custo da plataforma');
equal(comDifal.profit,3.5810282148875352,'Fiscal: sobra com DIFAL'); equal(comDifal.margin,0.1085489001178398,'Fiscal: margem com DIFAL');
equal(semDifal.netRevenue,27.214028325,'Fiscal: receita líquida sem DIFAL');
equal(semDifal.profit,6.5149938648875327,'Fiscal: sobra sem DIFAL'); equal(semDifal.margin,0.19748390011783973,'Fiscal: margem sem DIFAL');
// Com as regras da calculadora: ML 12% e frete pelo peso; Shopee com taxa fixa sem crédito; TikTok com afiliado.
const fiscalML=fiscal('mercadoLivre',{...C.defaults,price:32.99,cost:15.96,weight:1.5,icms:0.189});
equal(fiscalML.shipping,7.35,'Fiscal ML: frete pelo peso'); equal(fiscalML.profit,comDifal.profit-32.99*0.005*(1-0.0925),'Fiscal ML: 12% reduz a sobra só pela comissão líquida de crédito');
const fiscalShopee=fiscal('shopee',{...C.defaults,price:50,cost:20,icms:0.091});
equal(fiscalShopee.platform,10-10*0.0925+4.5,'Fiscal Shopee: crédito só sobre a comissão, taxa fixa cheia');
equal(fiscalShopee.profit,(50-4.55-(50-4.55)*0.0925)-(20-3.6-20*C.fiscal.costPisCofinsCredit)-(10-0.925+4.5),'Fiscal Shopee: sobra');
const fiscalTikTok=fiscal('tiktok',{...C.defaults,price:30,cost:10,affiliate:5,icms:0.189});
equal(fiscalTikTok.platform,3-3*0.0925+4+1.5+1.8-1.8*C.fiscal.shippingIcmsCredit-1.8*C.fiscal.shippingPisCofinsCredit,'Fiscal TikTok: afiliado sem crédito e créditos do frete');
ok(!fiscal('shopee',{...C.defaults,icms:null}).ok&&!fiscal('shopee',{...C.defaults,icms:1.5}).ok,'Fiscal: ICMS inválido');
ok(!fiscal('mercadoLivre',{...C.defaults,weight:30,icms:0.189}).ok&&!fiscal('shopee',{...C.defaults,price:0,icms:0.189}).ok,'Fiscal: herda as validações do cálculo normal');
ok(fiscal('shopee',{...C.defaults,price:100,cost:90,icms:0.189}).tone==='bad','Fiscal: prejuízo em vermelho');
console.log('Fiscal (planilha): com DIFAL sobra '+comDifal.profit.toFixed(2)+' ('+(comDifal.margin*100).toFixed(2)+'%) | sem DIFAL sobra '+semDifal.profit.toFixed(2)+' ('+(semDifal.margin*100).toFixed(2)+'%)');
// Custos por SKU: leitura da planilha, pesquisa e armazenamento no navegador (somente leitura).
const { parseCsv, search, normalizeSku, createStore } = require('./custos.js');
const planilha=parseCsv('﻿CUSTO;SKU\r\n44;RM-001GG\r\n44;RM-001G\r\n48,5;FLASH-001\r\n17;CAFÉ-001\r\n;SEM-CUSTO\r\nabc;Y\r\n0;SKU DFQ-007\r\n12;RM-001G\r\n');
ok(planilha.items.length===5&&planilha.skipped===2,'Planilha: 5 SKUs válidos e 2 linhas ignoradas');
equal(planilha.items.find(i=>i.sku==='FLASH-001').cost,48.5,'Planilha: vírgula decimal');
equal(planilha.items.find(i=>i.sku==='RM-001G').cost,12,'Planilha: SKU repetido usa a última linha');
equal(parseCsv('SKU;Custo do produto\nA-1;1.234,56').items[0].cost,1234.56,'Planilha: colunas em outra ordem');
assert.throws(()=>parseCsv('PRODUTO;VALOR\nA;1'),/CUSTO e SKU/); checks++;
ok(normalizeSku('café-001')==='CAFE001','SKU sem acento, hífen e minúsculas');
ok(search(planilha.items,'rm 001').total===2,'Pesquisa "rm 001" encontra RM-001GG e RM-001G');
ok(search(planilha.items,'cafe').items[0].sku==='CAFÉ-001','Pesquisa ignora acento');
ok(search([{sku:'ACQUABIOS-002PRETO',cost:1},{sku:'ACQUABIOS-001',cost:1}],'acqua 002').total===1,'Pesquisa por palavras separadas');
ok(search(planilha.items,'001').items[0].sku==='CAFÉ-001'&&search(planilha.items,'FLASH').total===1,'Pesquisa por trecho');
ok(search(planilha.items,'',2).items.length===2&&search(planilha.items,'',2).total===5,'Pesquisa vazia respeita limite');
function fakeStorage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),m};}
const storage=fakeStorage(); storage.setItem('sellneeds-sessao','{"access":"antigo"}');
const lista=createStore(storage);
ok(storage.getItem('sellneeds-sessao')===null,'Login antigo da nuvem é apagado do navegador');
ok(lista.load().length===0,'Sem planilha: lista vazia');
ok(lista.replace(planilha.items)&&createStore(storage).load().length===5,'Planilha importada continua salva ao reabrir');
lista.replace([{sku:'NOVO-1',cost:3}]);
ok(createStore(storage).load().length===1&&createStore(storage).load()[0].cost===3,'Importar outra planilha substitui a lista inteira');
const bloqueado=createStore({getItem(){throw Error('bloqueado');},setItem(){throw Error('bloqueado');},removeItem(){throw Error('bloqueado');}});
ok(!bloqueado.replace(planilha.items)&&bloqueado.load().length===5,'Armazenamento bloqueado: lista vale enquanto a página estiver aberta');
ok(createStore(null).load().length===0,'Sem armazenamento: não quebra');
ok(!('save' in lista)&&!('login' in lista),'Lista sem cadastro avulso e sem login');
const lista2=createStore(fakeStorage()); lista2.replace([{sku:'A',cost:1},{sku:'B',cost:2}]);
ok(lista2.update('A',1.5)&&lista2.load().length===2&&lista2.load().find(i=>i.sku==='A').cost===1.5,'Custo médio confirmado troca só o SKU escolhido');
console.log('Custos por SKU: planilha, pesquisa e lista do aparelho conferidas.');
// Custo médio: casos tirados da planilha "Custo Médio.xlsx".
const { averageCost, findConflicts, keepApplied, createHistory, historyCsv, makeBackup, parseBackup } = require('./medio.js');
const mop=averageCost({stock:9577,prevCost:19.17,qty:3000,unitCost:18.5});
ok(mop.ok,'Custo médio: Mop calcula'); equal(mop.avg,19.01,'Custo médio: Mop 9.577 a 19,17 + 3.000 a 18,50 = 19,01'); equal(mop.totalQty,12577,'Custo médio: estoque total');
equal(mop.prev,19.17,'Custo médio: guarda o custo anterior'); ok(Math.abs(mop.change-(19.01/19.17-1))<1e-9&&!mop.warnings.length,'Custo médio: variação e sem alerta');
equal(averageCost({stock:33917,prevCost:16.52,qty:11500,unitCost:16.87}).avg,16.61,'Custo médio: Balança vidro = 16,61');
equal(averageCost({stock:0,prevCost:null,qty:1000,unitCost:4.6}).avg,4.6,'Custo médio: sem estoque usa o custo da compra');
equal(averageCost({stock:0,prevCost:8,qty:3000,unitCost:7.18}).avg,7.18,'Custo médio: sem estoque o custo atual não pesa');
ok(averageCost({stock:11747,prevCost:1.8,qty:7200,unitCost:3}).warnings.length===1,'Custo médio: alerta quando a compra foge mais de 30% (bico dosador 1,80 → 3,00)');
ok(averageCost({stock:1949,prevCost:20.05,qty:78000,unitCost:20.82}).warnings.some(w=>/20 vezes/.test(w)),'Custo médio: alerta de quantidade fora do padrão (78.000 taças)');
const { purchaseCost } = require('./medio.js');
equal(purchaseCost({price:10,times:2,ipi:0.1}).unitCost,22,'Compra: R$ 10 × 2 (meia nota) com IPI 10% sobre o total = R$ 22,00');
equal(purchaseCost({price:10}).unitCost,10,'Compra: nota cheia sem IPI = preço da nota');
equal(purchaseCost({price:9,times:3,ipi:0}).unitCost,27,'Compra: um terço de nota = preço × 3');
const nota=averageCost({stock:100,prevCost:20,qty:100,price:10,times:2,ipi:0.1});
equal(nota.unitCost,22,'Custo médio: usa o custo da compra com vezes e IPI'); equal(nota.avg,21,'Custo médio: 100 a R$ 20 + 100 a R$ 22 = R$ 21,00');
const notaBad=purchaseCost({price:10,times:0,ipi:1.5});
ok(!notaBad.ok&&notaBad.errors.times&&notaBad.errors.ipi&&!purchaseCost({price:null}).ok,'Compra: valida preço, vezes e IPI');
const bad=averageCost({stock:-1,prevCost:null,qty:0,unitCost:NaN});
ok(!bad.ok&&bad.errors.stock&&bad.errors.qty&&bad.errors.unitCost,'Custo médio: valida estoque, quantidade e custo');
ok(!averageCost({stock:10,prevCost:null,qty:5,unitCost:2}).ok,'Custo médio: com estoque exige o custo atual');
const hs=fakeStorage(); const hist=createHistory(hs);
const r1=hist.add({sku:'MOP',stock:9577,prevCost:19.17,qty:3000,unitCost:18.5,avg:19.01,status:'aplicado'}).entry;
const r2=hist.add({sku:'MOP',stock:12000,prevCost:19.01,qty:1000,unitCost:20,avg:19.09,status:'aplicado'}).entry;
const r3=hist.add({sku:'MOP',stock:1,prevCost:19.09,qty:1,unitCost:1,avg:10.05,status:'registro'}).entry;
ok(hist.applied().MOP.id===r2.id&&hist.list('MOP')[0].id===r3.id,'Histórico: registro salvo não muda o custo aplicado; lista mais recente primeiro');
ok(createHistory(hs).list().length===3,'Histórico continua salvo ao reabrir');
ok(hist.undo(r1.id)===null,'Histórico: só desfaz a última compra aplicada');
hist.undo(r2.id); ok(hist.get(r2.id).status==='desfeito'&&hist.applied().MOP.id===r1.id,'Histórico: desfazer volta para a compra anterior');
hist.apply(r3.id); ok(hist.applied().MOP.cost===10.05&&hist.get(r3.id).status==='aplicado','Histórico: aplicar um registro salvo depois');
ok(!hist.remove(r3.id)&&hist.remove(r2.id)&&hist.list().length===2,'Histórico: só exclui o que não está aplicado');
const conf=findConflicts({MOP:{cost:19.01},GRADE:{cost:7.45},CESTO:{cost:8.88}},[{sku:'MOP',cost:18},{sku:'CESTO',cost:8.88}]);
ok(conf.length===2&&conf.find(c=>c.sku==='GRADE').planilha===null&&conf.find(c=>c.sku==='MOP').planilha===18,'Importar: acha SKUs alterados pelo custo médio que a planilha muda ou não traz');
const kept=keepApplied([{sku:'MOP',cost:18},{sku:'CESTO',cost:8.88}],conf);
ok(kept.length===3&&kept.find(i=>i.sku==='MOP').cost===19.01&&kept.find(i=>i.sku==='GRADE').cost===7.45,'Importar: "Manter custo médio" preserva os custos alterados');
hist.forget(['MOP']); ok(!hist.applied().MOP,'Importar: "Usar planilha" esquece o custo médio do SKU');
const csv=historyCsv(hist.list()); ok(csv.split('\r\n').length===3&&csv.includes(';19,01;'),'Histórico em CSV para o Excel (vírgula decimal)');
const bk=parseBackup(makeBackup([{sku:'MOP',cost:19.01},{sku:'X',cost:2}],hist.data()));
ok(bk.items.length===2&&bk.history.length===2,'Backup: exporta e restaura custos e histórico');
assert.throws(()=>parseBackup('{"a":1}'),/backup/); checks++;
console.log('Custo médio: Mop 19,17 → '+mop.avg.toFixed(2)+' · histórico, desfazer, importação e backup conferidos.');
console.log('\nAPROVADO: '+checks+' verificações, incluindo '+scenarios+' comparações de preço mínimo com busca independente centavo por centavo.');
