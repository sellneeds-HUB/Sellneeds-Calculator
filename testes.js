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
 if(market==='shopee')return p*(p<80?.8:.86)-(p<80?4:p<100?16:p<200?20:26)-d.cost;
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
console.log('\nAPROVADO: '+checks+' verificações, incluindo '+scenarios+' comparações de preço mínimo com busca independente centavo por centavo.');
