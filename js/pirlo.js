const MENU = {
  "Clássicas": [
    { id:'margherita', name:'Margherita', desc:'Molho de tomate, mussarela, manjericão e azeite.', price:42.90 },
    { id:'quatroqueijos', name:'Quatro Queijos', desc:'Mussarela, parmesão, gorgonzola e catupiry.', price:49.90 },
    { id:'brocolis', name:'Brocolis com Bacon', desc:'Brocolis, bacon e mussarela', price:45.00 },
  ],
  "Especiais": [
    { id:'Pizza Do Rei', name:'Pizza do Rei', desc:'Tomate, mussarela, azeitona, cebola caramelizada, orégano e todas as coisas.', price:100000.00 },
    { id:'calabresa', name:'Calabresa', desc:'Calabresa, cebola, azeitona e molho apimentado.', price:46.90 },
    { id:'Perereca', name:'Perereca', desc:'Perereca, cebola, azeitona e molho apimentado.', price:56.90 },
  ],
  "Doces": [
    { id:'Brigadeiro', name:'Brogadeiro', desc:'chocolate, brigadeiro e granulado', price:45.00 },
    { id:'BrigadeiroMorango', name:'Brigadeiro com morango', desc:'chocolate, brigadeiro, morangos e ninho', price:45.00 },
  ],
  "Bebidas": [
    { id:'cocacola', name:'Coca-Cola 2L', desc:'Refrigerante de 2 litros.', price:12.00 },
    { id:'cocacolalata', name:'Coca-Cola Lata', desc:'Refrigerante de 350ml', price:6.00 },
    { id:'fanta', name:'Fanta Laranja', desc:'Refrigerante de 2 litros.', price:12.00 },
  ],
};
const TABLES = ['Mesa 01','Mesa 02','Mesa 03','Mesa 04', 'Mesa 05', 'Mesa 06', 'Mesa 07'];

const state = {
  view: 'cliente',
  currentTable: 'Mesa 01',
  cart: {},
  orderSeq: 1,
  orders: [],        
  openTabs: {},
  cashier: { revenue: 0, transactions: [] },
};

function fmt(v){
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}
function findItem(id){
  for (const cat in MENU){ const f = MENU[cat].find(i=>i.id===id); if (f) return f; }
}
function cartCount(){
  return Object.values(state.cart).reduce((a,b)=>a+b,0);
}
function cartTotal(){
  return Object.entries(state.cart).reduce((sum,[id,qty])=> sum + findItem(id).price*qty, 0);
}
function preparingCount(){ return state.orders.filter(o=>o.status==='preparing').length; }
function readyCount(){ return state.orders.filter(o=>o.status==='ready').length; }
function openTabCount(){ return Object.keys(state.openTabs).length; }

const TAB_DEFS = [
  { id:'cliente', label:'Cliente' },
  { id:'cardapio', label:'Cardápio', badge: ()=> cartCount() || null },
  { id:'cozinha', label:'Cozinha', badge: ()=> preparingCount() || null },
  { id:'garcom', label:'Garçom', badge: ()=> readyCount() || null },
  { id:'caixa', label:'Caixa', badge: ()=> openTabCount() || null },
];

function renderTabs(){
  const el = document.getElementById('tabs');
  el.innerHTML = TAB_DEFS.map(t => {
    const badge = t.badge ? t.badge() : null;
    return `<button class="tab-btn ${state.view===t.id?'active':''}" data-view="${t.id}">
      ${t.label}${badge ? `<span class="tab-badge">${badge}</span>` : ''}
    </button>`;
  }).join('');
  el.querySelectorAll('.tab-btn').forEach(b=>{
    b.addEventListener('click', ()=>{ state.view = b.dataset.view; renderAll(); });
  });
}

function sideShell(kicker, title, desc, facts){
  return `<div class="side">
    <div class="kicker">PIZZARIA</div>
    <h1>${title}</h1>
    <p>${desc}</p>
    <ul class="facts">${facts.map(f=>`<li><span class="dot"></span>${f}</li>`).join('')}</ul>
  </div>`;
}

function renderCliente(){
  return `
  <div class="layout">
    ${sideShell('PIZZARIA','pizza','Seja bem-vindo. Escaneie o código QR abaixo para acessar o cardápio digital da sua mesa e pedir com tranquilidade.', [
      'Sem instalar nenhum aplicativo',
      'Peça direto da sua mesa',
      'Acompanhe o preparo em tempo real'
    ])}
    <div class="content">
      <div class="content-head">
        <div>
          <h2>Bem-vindo à nossa pizzaria!</h2>
          <div class="sub">Escaneie o código para acessar o cardápio da sua mesa</div>
        </div>
      </div>
      <div class="qr-card">
        <div class="sub" style="margin-bottom:14px;">${state.currentTable}</div>
        <div class="qr-box">${qrSvg()}</div>
        <div style="font-weight:600; font-size:14px; margin-bottom:4px;">Escaneie o código</div>
        <div class="sub" style="max-width:280px; margin:0 auto;">Abra a câmera do seu celular, aponte o código e acesse o cardápio da sua mesa.</div>
        <div class="table-select">
          <span class="sub" style="font-size:12px;">Mudar mesa:</span>
          <select id="table-picker">
            ${TABLES.map(t=>`<option value="${t}" ${t===state.currentTable?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div style="margin-top:16px;">
          <button class="btn btn-primary" id="go-menu" style="width:100%;">Acessar cardápio</button>
        </div>
      </div>
      <div class="how-it-works">
        <div style="font-weight:600; font-size:13px;">Como funciona</div>
        <ol>
          <li>Escaneie o QR code para abrir o cardápio da sua mesa.</li>
          <li>Selecione os itens e envie seu pedido direto para a cozinha.</li>
          <li>Acompanhe o preparo e o garçom traz até você.</li>
        </ol>
      </div>
    </div>
  </div>`;
}
function qrSvg(){
  return `<svg width="96" height="96" viewBox="0 0 29 29" xmlns="http://www.w3.org/2000/svg" fill="#2b1810">
  <rect width="29" height="29" fill="none"/>
  ${[[0,0],[1,0],[2,0],[3,0],[4,0],[6,0],[8,0],[9,0],[10,0],[11,0],[12,0],
     [0,1],[4,1],[6,1],[8,1],[12,1],
     [0,2],[2,2],[3,2],[4,2],[6,2],[8,2],[10,2],[11,2],[12,2],
     [0,3],[2,3],[3,3],[4,3],[8,3],[10,3],[12,3],
     [0,4],[4,4],[6,4],[9,4],[12,4],
     [0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[7,5],[9,5],[11,5],
     [6,6],[8,6],[9,6],[10,6],[11,6],
     [0,7],[1,7],[3,7],[5,7],[6,7],[8,7],[10,7],[12,7],
     [1,8],[3,8],[5,8],[9,8],[12,8]
    ].map(([x,y])=>`<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')}
  </svg>`;
}

function renderCardapio(){
  const cats = Object.entries(MENU).map(([cat, items])=>{
    const rows = items.map(it=>{
      const qty = state.cart[it.id] || 0;
      return `<div class="item-row">
        <div class="item-info">
          <div class="name">${it.name}</div>
          <div class="desc">${it.desc}</div>
          <div class="price">${fmt(it.price)}</div>
        </div>
        ${qty>0 ? `
        <div class="stepper">
          <button data-dec="${it.id}">−</button>
          <span class="qty">${qty}</span>
          <button data-inc="${it.id}">+</button>
        </div>` : `<button class="add-btn" data-inc="${it.id}">+</button>`}
      </div>`;
    }).join('');
    return `<div class="cat-title">${cat} <span class="cat-count">· ${items.length} opções</span></div>${rows}`;
  }).join('');

  const count = cartCount();
  return `
  <div class="layout">
    ${sideShell('PIZZARIA','menu','Envie seu pedido direto para a cozinha, sem esperar pelo garçom.', [
      `Pedindo para: ${state.currentTable}`,
      'Pronto para enviar',
      'Toque em "+" para adicionar itens'
    ])}
    <div class="content">
      <div class="content-head">
        <div>
          <h2>Cardápio — ${state.currentTable}</h2>
          <div class="sub">Escolha seus itens e envie o pedido quando quiser</div>
        </div>
        <button class="btn btn-ghost btn-sm" id="back-to-client">Trocar de mesa</button>
      </div>
      ${cats}
      <div class="cart-bar">
        <div class="info">
          <div class="label">${count} ${count===1?'item':'itens'} no carrinho</div>
          <div class="value">${fmt(cartTotal())}</div>
        </div>
        <button class="btn btn-primary" id="send-order" ${count===0?'disabled':''}>Enviar pedido</button>
      </div>
    </div>
  </div>`;
}

function timeAgo(ts){
  const mins = Math.max(0, Math.round((Date.now()-ts)/60000));
  return mins===0 ? 'agora mesmo' : `há ${mins} min`;
}

function renderCozinha(){
  const active = state.orders.filter(o=>o.status==='preparing').sort((a,b)=>a.createdAt-b.createdAt);
  const body = active.length ? active.map(o=>`
    <div class="ticket">
      <div class="ticket-head">
        <div>
          <span class="mesa">${o.mesa}</span> ·
          <span class="status-pill status-preparing">Em preparo</span>
        </div>
        <div class="time">${timeAgo(o.createdAt)}</div>
      </div>
      <ul class="ticket-items">
        ${o.items.map(it=>`<li><span><span class="qty-tag">${it.qty}×</span>${it.name}</span></li>`).join('')}
      </ul>
      <div class="ticket-foot">
        <div class="ticket-total">${fmt(o.total)}</div>
        <button class="btn btn-primary btn-sm" data-ready="${o.id}">Marcar como pronto</button>
      </div>
    </div>
  `).join('') : emptyState('👨‍🍳','Nenhum pedido na fila','Assim que um pedido for enviado do cardápio, ele aparece aqui.');

  return `
  <div class="layout">
    ${sideShell('PIZZARIA','fila','Gerencie os pedidos enviados pelo cardápio digital.', [
      `${active.length} pedido${active.length===1?'':'s'} em preparo`,
      'Pronto para enviar → Garçom',
      'Atualizado em tempo real'
    ])}
    <div class="content">
      <div class="content-head">
        <div>
          <h2>Fila da cozinha</h2>
          <div class="sub">Pedidos enviados, aguardando preparo</div>
        </div>
      </div>
      ${body}
    </div>
  </div>`;
}

function renderGarcom(){
  const ready = state.orders.filter(o=>o.status==='ready').sort((a,b)=>a.createdAt-b.createdAt);
  const body = ready.length ? ready.map(o=>`
    <div class="ticket">
      <div class="ticket-head">
        <div>
          <span class="mesa">${o.mesa}</span> ·
          <span class="status-pill status-ready">Pronto</span>
        </div>
        <div class="time">${timeAgo(o.createdAt)}</div>
      </div>
      <ul class="ticket-items">
        ${o.items.map(it=>`<li><span><span class="qty-tag">${it.qty}×</span>${it.name}</span></li>`).join('')}
      </ul>
      <div class="ticket-foot">
        <div class="ticket-total">${fmt(o.total)}</div>
        <button class="btn btn-primary btn-sm" data-deliver="${o.id}">Confirmar entrega</button>
      </div>
    </div>
  `).join('') : emptyState('🛎️','Nada pronto no momento','Pedidos finalizados pela cozinha aparecem aqui para entrega.');

  return `
  <div class="layout">
    ${sideShell('PIZZARIA','pronto','Pedidos concluídos pelo chef e prontos para retirada.', [
      `${ready.length} pedido${ready.length===1?'':'s'} pronto${ready.length===1?'':'s'}`,
      'Confirme a entrega na mesa',
      'Isso abre a conta no caixa'
    ])}
    <div class="content">
      <div class="content-head">
        <div>
          <h2>Pedidos prontos</h2>
          <div class="sub">Confirme a entrega para fechar o ciclo do pedido</div>
        </div>
      </div>
      ${body}
    </div>
  </div>`;
}

function renderCaixa(){
  const tabs = Object.entries(state.openTabs);
  const mesasBody = tabs.length ? tabs.map(([mesa, t])=>`
    <div class="mesa-row">
      <div>
        <div class="mesa-name">${mesa}</div>
        <div class="mesa-meta">${t.orderCount} pedido${t.orderCount===1?'':'s'} · aberta ${timeAgo(t.since)}</div>
      </div>
      <div style="display:flex; align-items:center;">
        <span class="mesa-total">${fmt(t.total)}</span>
        <button class="btn btn-ghost btn-sm" data-close="${mesa}">Fechar mesa</button>
      </div>
    </div>
  `).join('') : emptyState('🧾','Nenhuma mesa em aberto','Quando o garçom confirmar uma entrega, a conta da mesa aparece aqui.');

  const txns = state.cashier.transactions.slice().reverse().slice(0,8);
  const txnsBody = txns.length ? txns.map(t=>`
    <div class="txn-row">
      <div>
        <div class="txn-name">${t.mesa}</div>
        <div class="txn-meta">Pagamento · ${new Date(t.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      <div class="txn-amt">${fmt(t.total)}</div>
    </div>
  `).join('') : `<div class="empty-state" style="padding:24px 10px;"><span class="emoji">💳</span><div class="sub">Nenhuma transação ainda hoje.</div></div>`;

  return `
  <div class="layout">
    ${sideShell('PIZZARIA','caixa','Controle rápido de pedidos, mesas e transações.', [
      `Faturamento hoje: ${fmt(state.cashier.revenue)}`,
      `${tabs.length} mesa${tabs.length===1?'':'s'} em aberto`,
      `${preparingCount()+readyCount()} pedido${(preparingCount()+readyCount())===1?'':'s'} em andamento`
    ])}
    <div class="content">
      <div class="content-head">
        <div>
          <h2>Caixa · Vendas</h2>
          <div class="sub">Visão geral do movimento de hoje</div>
        </div>
      </div>
      <div class="kpis">
        <div class="kpi">
          <div class="label">Faturamento</div>
          <div class="value">${fmt(state.cashier.revenue)}</div>
        </div>
        <div class="kpi">
          <div class="label">Pedidos em andamento</div>
          <div class="value">${preparingCount()+readyCount()}</div>
        </div>
        <div class="kpi">
          <div class="label">Mesas abertas</div>
          <div class="value">${tabs.length}</div>
        </div>
      </div>
      <div class="two-col">
        <div>
          <h3 class="block-title">Mesas em aberto</h3>
          ${mesasBody}
        </div>
        <div>
          <h3 class="block-title">Transações recentes</h3>
          ${txnsBody}
        </div>
      </div>
    </div>
  </div>`;
}

function emptyState(emoji, title, sub){
  return `<div class="empty-state"><span class="emoji">${emoji}</span><div class="title">${title}</div><div class="sub">${sub}</div></div>`;
}

function renderAll(){
  renderTabs();
  const view = document.getElementById('view');
  let html = '';
  if (state.view==='cliente') html = renderCliente();
  else if (state.view==='cardapio') html = renderCardapio();
  else if (state.view==='cozinha') html = renderCozinha();
  else if (state.view==='garcom') html = renderGarcom();
  else if (state.view==='caixa') html = renderCaixa();
  view.innerHTML = html;
  bindViewEvents();
}

function bindViewEvents(){
  const $ = sel => document.querySelectorAll(sel);

  const picker = document.getElementById('table-picker');
  if (picker) picker.addEventListener('change', e=>{ state.currentTable = e.target.value; });

  const goMenu = document.getElementById('go-menu');
  if (goMenu) goMenu.addEventListener('click', ()=>{ state.view='cardapio'; renderAll(); });

  const backBtn = document.getElementById('back-to-client');
  if (backBtn) backBtn.addEventListener('click', ()=>{ state.view='cliente'; renderAll(); });

  $('[data-inc]').forEach(b=>b.addEventListener('click', ()=>{
    const id = b.dataset.inc;
    state.cart[id] = (state.cart[id]||0) + 1;
    renderAll();
  }));
  $('[data-dec]').forEach(b=>b.addEventListener('click', ()=>{
    const id = b.dataset.dec;
    state.cart[id] = Math.max(0, (state.cart[id]||0) - 1);
    if (state.cart[id]===0) delete state.cart[id];
    renderAll();
  }));

  const sendOrder = document.getElementById('send-order');
  if (sendOrder) sendOrder.addEventListener('click', ()=>{
    if (cartCount()===0) return;
    const items = Object.entries(state.cart).map(([id,qty])=>{
      const it = findItem(id);
      return { name: it.name, price: it.price, qty };
    });
    const total = items.reduce((s,i)=>s+i.price*i.qty,0);
    state.orders.push({
      id: state.orderSeq++,
      mesa: state.currentTable,
      items, total,
      status:'preparing',
      createdAt: Date.now(),
    });
    state.cart = {};
    state.view = 'cozinha';
    renderAll();
  });

  $('[data-ready]').forEach(b=>b.addEventListener('click', ()=>{
    const id = Number(b.dataset.ready);
    const o = state.orders.find(o=>o.id===id);
    if (o) o.status = 'ready';
    renderAll();
  }));

  $('[data-deliver]').forEach(b=>b.addEventListener('click', ()=>{
    const id = Number(b.dataset.deliver);
    const o = state.orders.find(o=>o.id===id);
    if (!o) return;
    o.status = 'delivered';
    const tab = state.openTabs[o.mesa] || { total:0, itemCount:0, orderCount:0, since: Date.now() };
    tab.total += o.total;
    tab.itemCount += o.items.reduce((s,i)=>s+i.qty,0);
    tab.orderCount += 1;
    state.openTabs[o.mesa] = tab;
    state.orders = state.orders.filter(x=>x.id!==id);
    renderAll();
  }));

  $('[data-close]').forEach(b=>b.addEventListener('click', ()=>{
    const mesa = b.dataset.close;
    const tab = state.openTabs[mesa];
    if (!tab) return;
    state.cashier.revenue += tab.total;
    state.cashier.transactions.push({ mesa, total: tab.total, at: Date.now() });
    delete state.openTabs[mesa];
    renderAll();
  }));
}

renderAll();
