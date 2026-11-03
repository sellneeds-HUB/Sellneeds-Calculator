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
ok(!('save' in lista)&&!('login' in lista),'Lista somente leitura: sem salvar custo avulso e sem login');
console.log('Custos por SKU: planilha, pesquisa e lista do aparelho conferidas.');
console.log('\nAPROVADO: '+checks+' verificações, incluindo '+scenarios+' comparações de preço mínimo com busca independente centavo por centavo.');
