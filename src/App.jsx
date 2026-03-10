import { useState, useEffect } from "react";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAdQ5bcdZyFyQsn5-amZ0M7qkEx-w21rJI",
  authDomain: "autostore-830b4.firebaseapp.com",
  projectId: "autostore-830b4",
  storageBucket: "autostore-830b4.firebasestorage.app",
  messagingSenderId: "369837251334",
  appId: "1:369837251334:web:4fe82db7fea45ed0689c87",
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

let firebaseAuth, firebaseFirestore;

async function initFirebase() {
  if (firebaseAuth) return;
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } =
    await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  const { getFirestore, doc, getDoc, setDoc } =
    await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
  const app = initializeApp(FIREBASE_CONFIG);
  firebaseAuth = { instance: getAuth(app), onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
  firebaseFirestore = { instance: getFirestore(app), doc, getDoc, setDoc };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --black:#080a0f;--dark:#0e1118;--card:#161b26;--card2:#1c2235;
    --border:#252d42;--border2:#2e3a55;
    --accent:#f5a623;--accent2:#e8400c;--accent3:#3b82f6;
    --text:#edf0f7;--muted:#6b7a9a;--muted2:#8892aa;
    --success:#22c55e;--danger:#ef4444;--warning:#f59e0b;
    --radius:14px;--radius-sm:8px;
  }
  html,body,#root{min-height:100vh;background:var(--black);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px}
  .app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;background:var(--dark);position:relative}
  .screen{flex:1;padding:20px 18px 90px;overflow-y:auto}

  /* TOPBAR */
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 12px;background:var(--dark);position:sticky;top:0;z-index:10;border-bottom:1px solid var(--border)}
  .topbar-logo{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:2px;color:var(--accent)}
  .topbar-right{display:flex;align-items:center;gap:10px}
  .cart-btn{position:relative;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:6px 10px;cursor:pointer;display:flex;align-items:center;gap:5px;color:var(--text);font-size:13px;font-family:'DM Sans',sans-serif}
  .cart-badge{position:absolute;top:-6px;right:-6px;background:var(--accent2);color:#fff;font-size:10px;font-weight:700;border-radius:99px;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;padding:0 4px}

  /* BOTTOM NAV */
  .bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:var(--card);border-top:1px solid var(--border);display:flex;z-index:20}
  .nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0 8px;cursor:pointer;border:none;background:none;color:var(--muted);font-size:11px;font-family:'DM Sans',sans-serif;gap:4px;transition:color .2s}
  .nav-item.active{color:var(--accent)}
  .nav-item svg{width:20px;height:20px}

  /* TYPOGRAPHY */
  .page-title{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:1.5px;margin-bottom:2px}
  .page-sub{font-size:13px;color:var(--muted);margin-bottom:22px}

  /* INPUTS */
  .input-wrap{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
  .label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.7px}
  .input{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;color:var(--text);font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:border .2s;width:100%}
  .input:focus{border-color:var(--accent)}
  .input::placeholder{color:var(--muted)}
  select.input{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7a9a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
  .input-plate{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:7px;text-align:center;text-transform:uppercase;padding:18px}

  /* BUTTONS */
  .btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:13px 20px;border-radius:var(--radius-sm);border:none;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;cursor:pointer;transition:opacity .2s,transform .1s;width:100%}
  .btn:active{transform:scale(.98)}
  .btn:disabled{opacity:.35;cursor:not-allowed}
  .btn-primary{background:var(--accent);color:#000}
  .btn-secondary{background:var(--card2);color:var(--text);border:1px solid var(--border2)}
  .btn-danger{background:var(--danger);color:#fff}
  .btn-success{background:var(--success);color:#000}
  .btn-ghost{background:transparent;color:var(--accent);border:1px solid var(--accent)}
  .btn-blue{background:var(--accent3);color:#fff}
  .btn-sm{padding:8px 14px;font-size:13px;width:auto;border-radius:6px}
  .btn-row{display:flex;gap:10px}

  /* CARDS */
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
  .card-title{font-weight:600;font-size:16px;margin-bottom:3px}
  .card-sub{font-size:13px;color:var(--muted)}

  /* BADGE */
  .badge{display:inline-block;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px}
  .badge-new{background:#22c55e18;color:var(--success)}
  .badge-used{background:#f59e0b18;color:var(--warning)}
  .badge-seller{background:#3b82f618;color:#60a5fa}
  .badge-pending{background:#f59e0b18;color:var(--warning)}
  .badge-confirmed{background:#22c55e18;color:var(--success)}
  .badge-cancelled{background:#ef444418;color:var(--danger)}
  .badge-shipped{background:#3b82f618;color:#60a5fa}
  .badge-delivered{background:#22c55e18;color:var(--success)}

  /* VEHICLE BANNER */
  .vehicle-banner{background:linear-gradient(135deg,#131929,#0c1020);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px;position:relative;overflow:hidden}
  .vehicle-banner::before{content:'';position:absolute;top:-40px;right:-40px;width:140px;height:140px;background:radial-gradient(circle,#f5a62320 0%,transparent 70%);border-radius:50%}
  .veh-plate{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:6px;color:var(--accent);margin-bottom:4px}
  .veh-name{font-size:20px;font-weight:600;margin-bottom:6px}
  .veh-specs{display:flex;gap:10px;flex-wrap:wrap}
  .veh-spec{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:3px}

  /* PART CARD */
  .part-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:border-color .2s,transform .1s}
  .part-card:hover{border-color:var(--accent);transform:translateY(-1px)}
  .part-icon{width:58px;height:58px;border-radius:var(--radius-sm);background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
  .part-info{flex:1;min-width:0}
  .part-name{font-weight:600;font-size:14px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .part-oem{font-size:11px;color:var(--muted);font-family:monospace;margin-bottom:6px}
  .part-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .part-price-col{text-align:right;flex-shrink:0}
  .part-price{font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--accent);line-height:1}
  .part-warranty{font-size:11px;color:var(--muted);margin-top:2px}
  .part-stock{font-size:11px;color:var(--muted);margin-top:2px}

  /* DETAIL SCREEN */
  .detail-images{background:var(--card2);border-radius:var(--radius);height:200px;display:flex;align-items:center;justify-content:center;font-size:64px;margin-bottom:20px;border:1px solid var(--border)}
  .detail-title{font-size:22px;font-weight:700;margin-bottom:4px}
  .detail-oem{font-family:monospace;font-size:13px;color:var(--muted);margin-bottom:12px}
  .detail-price{font-family:'Bebas Neue',sans-serif;font-size:42px;color:var(--accent);line-height:1;margin-bottom:4px}
  .detail-price-sub{font-size:13px;color:var(--muted);margin-bottom:20px}
  .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
  .detail-stat{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px}
  .detail-stat-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
  .detail-stat-value{font-size:15px;font-weight:600}
  .detail-section{margin-bottom:20px}
  .detail-section-title{font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px}
  .qty-ctrl{display:flex;align-items:center;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;width:fit-content}
  .qty-btn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--card2);border:none;color:var(--text);font-size:18px;cursor:pointer;transition:background .2s}
  .qty-btn:hover{background:var(--border)}
  .qty-val{width:48px;text-align:center;font-size:16px;font-weight:600;background:transparent;border:none;color:var(--text)}
  .seller-box{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;display:flex;align-items:center;gap:12px}
  .seller-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:16px;flex-shrink:0}

  /* CART */
  .cart-empty{text-align:center;padding:60px 20px;color:var(--muted)}
  .cart-item{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:center}
  .cart-item-info{flex:1;min-width:0}
  .cart-item-name{font-weight:600;font-size:14px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cart-item-sub{font-size:12px;color:var(--muted)}
  .cart-item-price{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--accent)}
  .cart-remove{background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px;flex-shrink:0;padding:4px}
  .cart-summary{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-top:16px}
  .cart-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px}
  .cart-total{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--accent)}

  /* ORDERS */
  .order-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
  .order-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .order-id{font-family:monospace;font-size:12px;color:var(--muted)}
  .order-date{font-size:12px;color:var(--muted)}
  .order-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}
  .order-item:last-child{border-bottom:none}
  .order-total-row{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}

  /* HOME */
  .home-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:22px}
  .home-tile{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px 14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:border-color .2s,transform .15s;text-align:center}
  .home-tile:hover{border-color:var(--accent);transform:translateY(-2px)}
  .tile-icon{font-size:28px}
  .tile-label{font-weight:600;font-size:13px}
  .tile-sub{font-size:11px;color:var(--muted)}

  /* AUTH */
  .auth-screen{min-height:100vh;background:var(--black);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px}
  .auth-logo{font-family:'Bebas Neue',sans-serif;font-size:56px;letter-spacing:4px;color:var(--accent);margin-bottom:2px}
  .auth-tag{font-size:13px;color:var(--muted);margin-bottom:36px;text-align:center}
  .auth-box{background:var(--dark);border:1px solid var(--border);border-radius:16px;padding:30px 26px;width:100%;max-width:400px}
  .auth-tabs{display:flex;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--border);margin-bottom:26px}
  .auth-tab{flex:1;padding:11px;text-align:center;cursor:pointer;font-weight:500;font-size:14px;border:none;background:transparent;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all .2s}
  .auth-tab.active{background:var(--accent);color:#000;font-weight:700}

  /* FILTER BAR */
  .filter-bar{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;margin-bottom:18px;scrollbar-width:none}
  .filter-bar::-webkit-scrollbar{display:none}
  .chip{flex-shrink:0;padding:7px 15px;border-radius:99px;border:1px solid var(--border);background:var(--card);color:var(--muted);font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s}
  .chip.active{border-color:var(--accent);background:#f5a62315;color:var(--accent)}

  /* MISC */
  .divider{height:1px;background:var(--border);margin:18px 0}
  .empty{text-align:center;padding:60px 20px;color:var(--muted)}
  .empty-icon{font-size:48px;margin-bottom:12px}
  .empty-title{font-size:16px;color:var(--text);font-weight:600;margin-bottom:6px}
  .empty-sub{font-size:13px}
  .spinner{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite;margin:50px auto}
  @keyframes spin{to{transform:rotate(360deg)}}
  .toast{position:fixed;bottom:92px;left:50%;transform:translateX(-50%);background:var(--card2);border:1px solid var(--border2);padding:11px 20px;border-radius:99px;font-size:14px;font-weight:500;z-index:200;animation:fadeUp .25s ease;white-space:nowrap;max-width:90vw}
  .toast.success{border-color:var(--success);color:var(--success)}
  .toast.error{border-color:var(--danger);color:var(--danger)}
  @keyframes fadeUp{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
  .back-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif;padding:0;margin-bottom:18px}
  .back-btn:hover{color:var(--text)}
  .result-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .result-count{font-size:13px;color:var(--muted)}
  .toggle-link{text-align:center;font-size:13px;color:var(--muted);margin-top:12px;cursor:pointer}
  .toggle-link span{color:var(--accent);font-weight:500}
  .profile-avatar{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#000;margin-bottom:10px}
  .profile-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:22px}
  .stat-box{background:var(--card);padding:14px;text-align:center}
  .stat-num{font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--accent)}
  .stat-lbl{font-size:11px;color:var(--muted)}
  .seller-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .span2{grid-column:span 2}
  .search-hero{background:linear-gradient(135deg,#131929,#0c1020);border:1px solid var(--border);border-radius:var(--radius);padding:22px;margin-bottom:22px;text-align:center}
  .hero-title{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:var(--accent);margin-bottom:4px}
  .hero-sub{font-size:13px;color:var(--muted);margin-bottom:18px}
  textarea.input{resize:none}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = n => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type}`}>{msg}</div>;
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type = "error") => setToast({ msg, type });
  const el = toast ? <Toast {...toast} onDone={() => setToast(null)} /> : null;
  return [show, el];
}

const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Shop: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Cart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  Orders: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Sell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", type: "buyer" });
  const [loading, setLoading] = useState(false);
  const [show, toastEl] = useToast();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const login = async () => {
    if (!form.email || !form.password) return show("Preencha email e senha");
    setLoading(true);
    try {
      await initFirebase();
      const cred = await firebaseAuth.signInWithEmailAndPassword(firebaseAuth.instance, form.email, form.password);
      const snap = await firebaseFirestore.getDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", cred.user.uid));
      onLogin({ uid: cred.user.uid, email: cred.user.email, ...snap.data() });
    } catch (e) {
      show(e.code === "auth/invalid-credential" ? "Email ou senha incorretos" : "Erro ao entrar");
    } finally { setLoading(false); }
  };

  const register = async () => {
    if (!form.name || !form.email || !form.password) return show("Preencha todos os campos");
    if (form.password.length < 6) return show("Senha: mínimo 6 caracteres");
    setLoading(true);
    try {
      await initFirebase();
      const cred = await firebaseAuth.createUserWithEmailAndPassword(firebaseAuth.instance, form.email, form.password);
      await firebaseFirestore.setDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", cred.user.uid),
        { name: form.name, email: form.email, type: form.type, sellerVerified: false, active: true, createdAt: new Date().toISOString() });
      show("Conta criada! Faça login.", "success");
      setTab("login");
    } catch (e) {
      show(e.code === "auth/email-already-in-use" ? "Email já cadastrado" : "Erro ao cadastrar");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen">
      {toastEl}
      <div className="auth-logo">AUTOSTORE</div>
      <div className="auth-tag">Marketplace de autopeças com catálogo OEM</div>
      <div className="auth-box">
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Entrar</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Cadastrar</button>
        </div>
        {tab === "login" ? (
          <>
            <div className="input-wrap"><label className="label">Email</label><input className="input" type="email" placeholder="seu@email.com" value={form.email} onChange={set("email")} /></div>
            <div className="input-wrap"><label className="label">Senha</label><input className="input" type="password" placeholder="••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && login()} /></div>
            <button className="btn btn-primary" onClick={login} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          </>
        ) : (
          <>
            <div className="input-wrap"><label className="label">Nome</label><input className="input" placeholder="Seu nome completo" value={form.name} onChange={set("name")} /></div>
            <div className="input-wrap"><label className="label">Email</label><input className="input" type="email" placeholder="seu@email.com" value={form.email} onChange={set("email")} /></div>
            <div className="input-wrap"><label className="label">Senha</label><input className="input" type="password" placeholder="mín. 6 caracteres" value={form.password} onChange={set("password")} /></div>
            <div className="input-wrap"><label className="label">Tipo de conta</label>
              <select className="input" value={form.type} onChange={set("type")}>
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={register} disabled={loading}>{loading ? "Criando conta..." : "Criar conta"}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ user, setScreen, cartCount }) {
  const isSeller = user?.type === "seller";
  return (
    <div className="screen">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>Olá, {user?.name?.split(" ")[0]} 👋</div>
        <div className="page-title">O que você precisa?</div>
      </div>
      <div className="home-grid">
        <div className="home-tile" onClick={() => setScreen("search")}>
          <div className="tile-icon">🔍</div>
          <div className="tile-label">Buscar por Placa</div>
          <div className="tile-sub">Peças para seu veículo</div>
        </div>
        <div className="home-tile" onClick={() => setScreen("marketplace")}>
          <div className="tile-icon">🛒</div>
          <div className="tile-label">Marketplace</div>
          <div className="tile-sub">Todas as peças</div>
        </div>
        <div className="home-tile" onClick={() => setScreen("orders")}>
          <div className="tile-icon">📦</div>
          <div className="tile-label">Meus Pedidos</div>
          <div className="tile-sub">Histórico de compras</div>
        </div>
        {isSeller ? (
          <div className="home-tile" onClick={() => setScreen("sell")}>
            <div className="tile-icon">💰</div>
            <div className="tile-label">Anunciar Peça</div>
            <div className="tile-sub">Vender pelo OEM</div>
          </div>
        ) : (
          <div className="home-tile" onClick={() => setScreen("profile")}>
            <div className="tile-icon">👤</div>
            <div className="tile-label">Meu Perfil</div>
            <div className="tile-sub">Conta e configurações</div>
          </div>
        )}
      </div>
      <div className="card" style={{ background: "linear-gradient(135deg,#131929,#0c1020)", borderColor: "#f5a62325" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 30 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Catálogo OEM Integrado</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Número OEM garante compatibilidade 100%. Sem erro na compra, sem devolução.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────
function SearchScreen({ onVehicleFound }) {
  const [mode, setMode] = useState("plate");
  const [plate, setPlate] = useState("");
  const [manual, setManual] = useState({ brand: "", model: "", engineDisplacement: "", fuelType: "" });
  const [loading, setLoading] = useState(false);
  const [show, toastEl] = useToast();
  const set = k => e => setManual(f => ({ ...f, [k]: e.target.value }));

  const search = async (body) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/search/parts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!data.success) return show("Nenhuma peça encontrada para este veículo");
      const parts = Array.isArray(data.data) ? data.data : (data.data?.data || []);
      onVehicleFound({ plate: body.plate, vehicle: data.vehicle || { brand: body.brand, model: body.model, engineDisplacement: body.engineDisplacement, fuelType: body.fuelType }, parts });
    } catch { show("Erro ao conectar com o servidor. Backend está rodando?"); }
    finally { setLoading(false); }
  };

  const byPlate = () => {
    const clean = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length < 7) return show("Placa inválida. Ex: ABC1D23");
    search({ plate: clean });
  };

  const byManual = () => {
    if (!manual.brand || !manual.model || !manual.engineDisplacement || !manual.fuelType) return show("Preencha todos os campos");
    search({ ...manual, brand: manual.brand.toLowerCase(), model: manual.model.toLowerCase() });
  };

  return (
    <div className="screen">
      {toastEl}
      <div className="page-title">Buscar Peças</div>
      <div className="page-sub">Encontre peças compatíveis com seu veículo</div>
      <div className="search-hero">
        <div className="hero-title">🔍 BUSCA POR PLACA</div>
        <div className="hero-sub">Digite a placa para identificar o veículo</div>
        <input className="input input-plate" placeholder="ABC1D23" value={plate} maxLength={8}
          onChange={e => setPlate(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && byPlate()} />
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={byPlate} disabled={loading}>
          {loading ? "Buscando..." : "Buscar por Placa"}
        </button>
      </div>
      <div className="toggle-link" onClick={() => setMode(m => m === "plate" ? "manual" : "plate")}>
        {mode === "plate" ? <>Busca manual? <span>Clique aqui</span></> : <>Usar placa? <span>Clique aqui</span></>}
      </div>
      {mode === "manual" && (
        <div style={{ marginTop: 18 }}>
          <div className="divider" />
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Busca por dados do veículo</div>
          <div className="input-wrap"><label className="label">Marca</label><input className="input" placeholder="ex: volkswagen" value={manual.brand} onChange={set("brand")} /></div>
          <div className="input-wrap"><label className="label">Modelo</label><input className="input" placeholder="ex: gol" value={manual.model} onChange={set("model")} /></div>
          <div className="input-wrap"><label className="label">Motor</label><input className="input" placeholder="ex: 1.0" value={manual.engineDisplacement} onChange={set("engineDisplacement")} /></div>
          <div className="input-wrap"><label className="label">Combustível</label>
            <select className="input" value={manual.fuelType} onChange={set("fuelType")}>
              <option value="">Selecione</option>
              <option value="flex">Flex</option>
              <option value="gasolina">Gasolina</option>
              <option value="diesel">Diesel</option>
              <option value="elétrico">Elétrico</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={byManual} disabled={loading}>{loading ? "Buscando..." : "Buscar Peças"}</button>
        </div>
      )}
    </div>
  );
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────
function ResultsScreen({ vehicleData, onBack, onSelectPart }) {
  const [filter, setFilter] = useState("all");
  const { plate, vehicle, parts } = vehicleData;
  const filtered = parts.filter(p => filter === "all" || p.condition === filter);

  return (
    <div className="screen">
      <button className="back-btn" onClick={onBack}><Icons.Back /> Voltar</button>
      <div className="vehicle-banner">
        {plate && <div className="veh-plate">{plate}</div>}
        <div className="veh-name">{vehicle?.brand} {vehicle?.model}</div>
        <div className="veh-specs">
          {(vehicle?.engine || vehicle?.engineDisplacement) && <span className="veh-spec">⚙️ {vehicle.engine || vehicle.engineDisplacement}</span>}
          {vehicle?.fuelType && <span className="veh-spec">⛽ {vehicle.fuelType}</span>}
          {vehicle?.year && <span className="veh-spec">📅 {vehicle.year}</span>}
        </div>
      </div>
      <div className="result-header">
        <div className="page-title" style={{ fontSize: 22, margin: 0 }}>Peças Compatíveis</div>
        <div className="result-count">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</div>
      </div>
      <div className="filter-bar">
        {[{ k: "all", l: "Todas" }, { k: "new", l: "Novas" }, { k: "used", l: "Usadas" }].map(f => (
          <button key={f.k} className={`chip ${filter === f.k ? "active" : ""}`} onClick={() => setFilter(f.k)}>{f.l}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🔧</div><div className="empty-title">Nenhuma peça encontrada</div><div className="empty-sub">Tente outro filtro</div></div>
      ) : filtered.map((item, i) => (
        <div key={item.id || i} className="part-card" onClick={() => onSelectPart(item)}>
          <div className="part-icon">🔧</div>
          <div className="part-info">
            <div className="part-name">{item.part?.name || item.name || "Peça Automotiva"}</div>
            <div className="part-oem">OEM: {item.part?.oemNumber || item.oemNumber || "—"}</div>
            <div className="part-meta">
              <span className={`badge ${item.condition === "used" ? "badge-used" : "badge-new"}`}>{item.condition === "used" ? "Usada" : "Nova"}</span>
              {item.part?.brand && <span className="badge badge-seller">{item.part.brand}</span>}
            </div>
          </div>
          <div className="part-price-col">
            <div className="part-price">{fmt(item.price)}</div>
            {item.warrantyMonths > 0 && <div className="part-warranty">{item.warrantyMonths}m garantia</div>}
            <div className="part-stock">Estoque: {item.stock || 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
function MarketplaceScreen({ onSelectPart }) {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`${API}/marketplaceParts`).then(r => r.json()).then(d => setParts(d.data || [])).catch(() => []).finally(() => setLoading(false));
  }, []);

  const filtered = parts.filter(p => filter === "all" || p.condition === filter);

  return (
    <div className="screen">
      <div className="page-title">Marketplace</div>
      <div className="page-sub">Autopeças no catálogo OEM</div>
      <div className="filter-bar">
        {[{ k: "all", l: "Todos" }, { k: "new", l: "Novos" }, { k: "used", l: "Usados" }].map(f => (
          <button key={f.k} className={`chip ${filter === f.k ? "active" : ""}`} onClick={() => setFilter(f.k)}>{f.l}</button>
        ))}
      </div>
      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🛒</div><div className="empty-title">Nenhuma peça disponível</div></div>
      ) : filtered.map((item, i) => (
        <div key={item.id || i} className="part-card" onClick={() => onSelectPart(item)}>
          <div className="part-icon">🔧</div>
          <div className="part-info">
            <div className="part-name">{item.part?.name || item.name || "Peça Automotiva"}</div>
            <div className="part-oem">OEM: {item.part?.oemNumber || item.oemNumber || "—"}</div>
            <div className="part-meta">
              <span className={`badge ${item.condition === "used" ? "badge-used" : "badge-new"}`}>{item.condition === "used" ? "Usada" : "Nova"}</span>
              {item.part?.brand && <span className="badge badge-seller">{item.part.brand}</span>}
            </div>
          </div>
          <div className="part-price-col">
            <div className="part-price">{fmt(item.price)}</div>
            {item.warrantyMonths > 0 && <div className="part-warranty">{item.warrantyMonths}m garantia</div>}
            <div className="part-stock">Estoque: {item.stock || 0}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PART DETAIL ──────────────────────────────────────────────────────────────
function PartDetailScreen({ part, onBack, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show, toastEl] = useToast();

  useEffect(() => {
    if (!part?.id) return;
    fetch(`${API}/marketplaceParts/${part.id}`).then(r => r.json()).then(d => setDetail(d.data || part)).catch(() => setDetail(part));
  }, [part?.id]);

  const data = detail || part;
  const maxQty = data?.stock || 99;

  const addToCart = () => {
    if (qty > maxQty) return show(`Estoque disponível: ${maxQty}`);
    onAddToCart({ ...data, quantity: qty });
    show("Adicionado ao carrinho! 🛒", "success");
  };

  return (
    <div className="screen">
      {toastEl}
      <button className="back-btn" onClick={onBack}><Icons.Back /> Voltar</button>

      <div className="detail-images">🔧</div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span className={`badge ${data?.condition === "used" ? "badge-used" : "badge-new"}`}>
            {data?.condition === "used" ? "Usada" : "Nova"}
          </span>
          {data?.part?.brandName && <span className="badge badge-seller">{data.part.brandName}</span>}
          {data?.part?.categoryName && <span className="badge" style={{ background: "var(--card2)", color: "var(--muted2)" }}>{data.part.categoryName}</span>}
        </div>
        <div className="detail-title">{data?.part?.name || data?.name || "Peça Automotiva"}</div>
        <div className="detail-oem">OEM: {data?.part?.oemNumber || data?.oemNumber || "—"}</div>
        <div className="detail-price">{fmt(data?.price)}</div>
        <div className="detail-price-sub">
          {data?.warrantyMonths > 0 ? `✅ ${data.warrantyMonths} meses de garantia` : "Sem garantia informada"}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-stat">
          <div className="detail-stat-label">Estoque</div>
          <div className="detail-stat-value" style={{ color: (data?.stock || 0) > 0 ? "var(--success)" : "var(--danger)" }}>
            {data?.stock || 0} un.
          </div>
        </div>
        <div className="detail-stat">
          <div className="detail-stat-label">Condição</div>
          <div className="detail-stat-value">{data?.condition === "used" ? "Usada" : "Nova"}</div>
        </div>
        {data?.part?.weightKg > 0 && (
          <div className="detail-stat">
            <div className="detail-stat-label">Peso</div>
            <div className="detail-stat-value">{data.part.weightKg} kg</div>
          </div>
        )}
        {data?.warrantyMonths > 0 && (
          <div className="detail-stat">
            <div className="detail-stat-label">Garantia</div>
            <div className="detail-stat-value">{data.warrantyMonths} meses</div>
          </div>
        )}
      </div>

      {(data?.part?.description || data?.description) && (
        <div className="detail-section">
          <div className="detail-section-title">Descrição</div>
          <div style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.6 }}>
            {data.part?.description || data.description}
          </div>
        </div>
      )}

      {data?.seller && (
        <div className="detail-section">
          <div className="detail-section-title">Vendedor</div>
          <div className="seller-box">
            <div className="seller-avatar">{(data.seller.name || "V")[0].toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{data.seller.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {data.seller.sellerVerified ? "✅ Vendedor verificado" : "⏳ Verificação pendente"}
              </div>
            </div>
          </div>
        </div>
      )}

      {(data?.stock || 0) > 0 ? (
        <div>
          <div className="detail-section-title" style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".7px", marginBottom: 10 }}>Quantidade</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(maxQty, q + 1))}>+</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Total: <strong style={{ color: "var(--accent)" }}>{fmt(data?.price * qty)}</strong></div>
          </div>
          <button className="btn btn-primary" onClick={addToCart}>
            <Icons.Cart /> Adicionar ao Carrinho
          </button>
        </div>
      ) : (
        <div style={{ background: "#ef444415", border: "1px solid #ef444430", borderRadius: "var(--radius-sm)", padding: 14, textAlign: "center", color: "var(--danger)", fontWeight: 600 }}>
          ⚠️ Peça sem estoque no momento
        </div>
      )}
    </div>
  );
}

// ─── CART ─────────────────────────────────────────────────────────────────────
function CartScreen({ cart, onUpdateQty, onRemove, onCheckout, loading }) {
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) return (
    <div className="screen">
      <div className="page-title">Carrinho</div>
      <div className="empty" style={{ paddingTop: 80 }}>
        <div className="empty-icon">🛒</div>
        <div className="empty-title">Carrinho vazio</div>
        <div className="empty-sub">Adicione peças para continuar</div>
      </div>
    </div>
  );

  return (
    <div className="screen">
      <div className="page-title">Carrinho</div>
      <div className="page-sub">{totalItems} {totalItems === 1 ? "item" : "itens"}</div>

      {cart.map((item, i) => (
        <div key={item.id || i} className="cart-item">
          <div className="part-icon" style={{ width: 48, height: 48, fontSize: 20 }}>🔧</div>
          <div className="cart-item-info">
            <div className="cart-item-name">{item.part?.name || item.name || "Peça"}</div>
            <div className="cart-item-sub">OEM: {item.part?.oemNumber || item.oemNumber || "—"}</div>
            <div style={{ marginTop: 6 }}>
              <div className="qty-ctrl" style={{ transform: "scale(.9)", transformOrigin: "left" }}>
                <button className="qty-btn" style={{ width: 32, height: 32 }} onClick={() => onUpdateQty(item.id, item.quantity - 1)}>−</button>
                <span className="qty-val" style={{ width: 36, fontSize: 14 }}>{item.quantity}</span>
                <button className="qty-btn" style={{ width: 32, height: 32 }} onClick={() => onUpdateQty(item.id, item.quantity + 1)}>+</button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div className="cart-item-price">{fmt(item.price * item.quantity)}</div>
            <button className="cart-remove" onClick={() => onRemove(item.id)}><Icons.X /></button>
          </div>
        </div>
      ))}

      <div className="cart-summary">
        <div className="cart-row"><span style={{ color: "var(--muted)" }}>Subtotal</span><span>{fmt(total)}</span></div>
        <div className="cart-row"><span style={{ color: "var(--muted)" }}>Frete</span><span style={{ color: "var(--muted)" }}>A combinar</span></div>
        <div className="divider" style={{ margin: "10px 0" }} />
        <div className="cart-row">
          <span style={{ fontWeight: 600 }}>Total</span>
          <span className="cart-total">{fmt(total)}</span>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={onCheckout} disabled={loading}>
          {loading ? "Processando..." : <><Icons.Check /> Finalizar Pedido</>}
        </button>
      </div>
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersScreen({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusLabel = { pending: "Pendente", confirmed: "Confirmado", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado" };
  const statusBadge = { pending: "badge-pending", confirmed: "badge-confirmed", shipped: "badge-shipped", delivered: "badge-delivered", cancelled: "badge-cancelled" };

  useEffect(() => {
    const load = async () => {
      try {
        await initFirebase();
        const token = await firebaseAuth.instance.currentUser?.getIdToken();
        const res = await fetch(`${API}/orders/my`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setOrders(data.data || []);
      } catch { setOrders([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="screen">
      <div className="page-title">Meus Pedidos</div>
      <div className="page-sub">Histórico de compras</div>
      {loading ? <div className="spinner" /> : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <div className="empty-title">Nenhum pedido ainda</div>
          <div className="empty-sub">Seus pedidos aparecerão aqui</div>
        </div>
      ) : orders.map((order, i) => (
        <div key={order.id || i} className="order-card">
          <div className="order-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Pedido #{(order.id || "").slice(-8).toUpperCase()}</div>
              <div className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("pt-BR") : "—"}</div>
            </div>
            <span className={`badge ${statusBadge[order.status] || "badge-pending"}`}>{statusLabel[order.status] || order.status}</span>
          </div>
          {(order.items || []).map((item, j) => (
            <div key={j} className="order-item">
              <span>{item.name || "Peça"} × {item.quantity}</span>
              <span style={{ color: "var(--muted)" }}>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="order-total-row">
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "var(--accent)" }}>{fmt(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SELL ─────────────────────────────────────────────────────────────────────
function SellScreen({ user }) {
  const [step, setStep] = useState(1);
  const [oem, setOem] = useState("");
  const [masterPart, setMasterPart] = useState(null);
  const [form, setForm] = useState({ price: "", stock: "", condition: "new", warrantyMonths: "0", description: "" });
  const [loading, setLoading] = useState(false);
  const [show, toastEl] = useToast();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const searchOEM = async () => {
    if (!oem.trim()) return show("Digite o número OEM");
    setLoading(true);
    try {
      const res = await fetch(`${API}/parts?oem=${encodeURIComponent(oem)}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.data || []);
      const found = arr.find(p => p.oemNumber?.toLowerCase() === oem.toLowerCase());
      if (found) { setMasterPart(found); setStep(2); }
      else show("OEM não encontrado no catálogo.");
    } catch { show("Erro ao buscar catálogo"); }
    finally { setLoading(false); }
  };

  const submit = async () => {
    if (!form.price || !form.stock) return show("Preencha preço e estoque");
    setLoading(true);
    try {
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
      const res = await fetch(`${API}/marketplaceParts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oemNumber: masterPart.oemNumber, name: masterPart.name, brandId: masterPart.brandId, categoryId: masterPart.categoryId, description: form.description || masterPart.description || "", sellerId: user.uid, price: form.price, stock: form.stock, condition: form.condition, warrantyMonths: form.warrantyMonths }),
      });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao anunciar");
      show("Peça anunciada com sucesso! 🎉", "success");
      setStep(1); setOem(""); setMasterPart(null);
      setForm({ price: "", stock: "", condition: "new", warrantyMonths: "0", description: "" });
    } catch { show("Erro ao anunciar peça"); }
    finally { setLoading(false); }
  };

  return (
    <div className="screen">
      {toastEl}
      <div className="page-title">Anunciar Peça</div>
      <div className="page-sub">Venda pelo catálogo OEM — sem duplicidade</div>
      {step === 1 ? (
        <>
          <div className="card" style={{ borderColor: "#f5a62325", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
              🔖 Busque pelo número OEM da peça. Isso garante que compradores encontram a peça correta para seu veículo.
            </div>
          </div>
          <div className="input-wrap"><label className="label">Número OEM</label><input className="input" placeholder="ex: 06A-115-561-B" value={oem} onChange={e => setOem(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && searchOEM()} /></div>
          <button className="btn btn-primary" onClick={searchOEM} disabled={loading}>{loading ? "Buscando..." : "🔍 Buscar no Catálogo OEM"}</button>
        </>
      ) : (
        <>
          <div className="card" style={{ borderColor: "#22c55e30", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ fontSize: 24 }}>✅</div>
              <div>
                <div style={{ fontWeight: 600 }}>{masterPart?.name}</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--muted)" }}>OEM: {masterPart?.oemNumber}</div>
                {masterPart?.description && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{masterPart.description}</div>}
              </div>
            </div>
          </div>
          <div className="seller-form-grid">
            <div className="input-wrap"><label className="label">Preço (R$)</label><input className="input" type="number" placeholder="150.00" value={form.price} onChange={set("price")} /></div>
            <div className="input-wrap"><label className="label">Qtd. em estoque</label><input className="input" type="number" placeholder="1" value={form.stock} onChange={set("stock")} /></div>
            <div className="input-wrap"><label className="label">Condição</label><select className="input" value={form.condition} onChange={set("condition")}><option value="new">Nova</option><option value="used">Usada</option></select></div>
            <div className="input-wrap"><label className="label">Garantia (meses)</label><input className="input" type="number" placeholder="0" value={form.warrantyMonths} onChange={set("warrantyMonths")} /></div>
            <div className="input-wrap span2"><label className="label">Observações</label><textarea className="input" placeholder="Estado, origem, detalhes..." rows={3} value={form.description} onChange={set("description")} /></div>
          </div>
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>Voltar</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? "Anunciando..." : "📦 Anunciar"}</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfileScreen({ user, onLogout }) {
  const [myParts, setMyParts] = useState([]);
  const isSeller = user?.type === "seller";
  const initials = (user?.name || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    if (!isSeller) return;
    fetch(`${API}/marketplaceParts?sellerId=${user.uid}`).then(r => r.json()).then(d => setMyParts(d.data || [])).catch(() => {});
  }, []);

  const logout = async () => {
    await initFirebase();
    await firebaseAuth.signOut(firebaseAuth.instance);
    onLogout();
  };

  return (
    <div className="screen">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, marginBottom: 26 }}>
        <div className="profile-avatar">{initials}</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>{user?.email}</div>
        <span className={`badge ${isSeller ? "badge-seller" : "badge-new"}`}>{isSeller ? "Vendedor" : "Comprador"}</span>
      </div>

      {isSeller && (
        <div className="profile-stats">
          <div className="stat-box"><div className="stat-num">{myParts.length}</div><div className="stat-lbl">Anúncios</div></div>
          <div className="stat-box"><div className="stat-num">{myParts.reduce((s, p) => s + (p.stock || 0), 0)}</div><div className="stat-lbl">Em estoque</div></div>
          <div className="stat-box"><div className="stat-num">{myParts.filter(p => p.condition === "new").length}</div><div className="stat-lbl">Novas</div></div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>Dados da conta</div>
        {[["Email", user?.email], ["Tipo", isSeller ? "Vendedor" : "Comprador"], isSeller ? ["Verificação", user?.sellerVerified ? "✅ Verificado" : "⏳ Pendente"] : null].filter(Boolean).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: "var(--muted)" }}>{k}</span>
            <span>{v}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-danger" onClick={logout}><Icons.Logout /> Sair da conta</button>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [vehicleData, setVehicleData] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [show, toastEl] = useToast();

  // Inject styles
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Firebase auth listener
  useEffect(() => {
    initFirebase().then(() => {
      firebaseAuth.onAuthStateChanged(firebaseAuth.instance, async fbUser => {
        if (fbUser) {
          const snap = await firebaseFirestore.getDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", fbUser.uid));
          setUser({ uid: fbUser.uid, email: fbUser.email, ...snap.data() });
        } else setUser(null);
        setAuthLoading(false);
      });
    });
  }, []);

  // Cart operations
  const addToCart = (item) => {
    setCart(c => {
      const existing = c.find(i => i.id === item.id);
      if (existing) return c.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...c, item];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return setCart(c => c.filter(i => i.id !== id));
    setCart(c => c.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));

  const checkout = async () => {
    if (cart.length === 0) return;
    setCartLoading(true);
    try {
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
      const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const items = cart.map(i => ({
        marketplacePartId: i.id,
        name: i.part?.name || i.name || "Peça",
        oemNumber: i.part?.oemNumber || i.oemNumber,
        sellerId: i.sellerId,
        price: i.price,
        quantity: i.quantity,
      }));
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items, total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCart([]);
      show("Pedido realizado com sucesso! 🎉", "success");
      setScreen("orders");
    } catch (e) {
      show(e.message || "Erro ao finalizar pedido");
    } finally { setCartLoading(false); }
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{styles}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 44, color: "var(--accent)", letterSpacing: 3 }}>AUTOSTORE</div>
        <div className="spinner" />
      </div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={u => { setUser(u); setScreen("home"); }} />;

  const isSeller = user?.type === "seller";
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const navItems = [
    { key: "home", label: "Início", icon: <Icons.Home /> },
    { key: "search", label: "Buscar", icon: <Icons.Search /> },
    { key: "marketplace", label: "Loja", icon: <Icons.Shop /> },
    { key: "orders", label: "Pedidos", icon: <Icons.Orders /> },
    ...(isSeller ? [{ key: "sell", label: "Vender", icon: <Icons.Sell /> }] : [{ key: "profile", label: "Perfil", icon: <Icons.User /> }]),
  ];

  // Se há peça selecionada, mostra detalhe
  if (selectedPart) return (
    <div className="app">
      {toastEl}
      <div className="topbar">
        <div className="topbar-logo">AUTOSTORE</div>
        <button className="cart-btn" onClick={() => { setSelectedPart(null); setScreen("cart"); }}>
          <Icons.Cart />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>
      <PartDetailScreen
        part={selectedPart}
        onBack={() => setSelectedPart(null)}
        onAddToCart={(item) => { addToCart(item); }}
      />
    </div>
  );

  return (
    <div className="app">
      {toastEl}
      <div className="topbar">
        <div className="topbar-logo">AUTOSTORE</div>
        <div className="topbar-right">
          <button className="cart-btn" onClick={() => setScreen("cart")}>
            <Icons.Cart />
            Carrinho
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {screen === "home" && <HomeScreen user={user} setScreen={setScreen} cartCount={cartCount} />}
      {screen === "search" && <SearchScreen onVehicleFound={d => { setVehicleData(d); setScreen("results"); }} />}
      {screen === "results" && vehicleData && <ResultsScreen vehicleData={vehicleData} onBack={() => setScreen("search")} onSelectPart={setSelectedPart} />}
      {screen === "marketplace" && <MarketplaceScreen onSelectPart={setSelectedPart} />}
      {screen === "cart" && <CartScreen cart={cart} onUpdateQty={updateQty} onRemove={removeFromCart} onCheckout={checkout} loading={cartLoading} />}
      {screen === "orders" && <OrdersScreen user={user} />}
      {screen === "sell" && isSeller && <SellScreen user={user} />}
      {screen === "profile" && <ProfileScreen user={user} onLogout={() => setUser(null)} />}

      <nav className="bottom-nav">
        {navItems.map(item => (
          <button key={item.key} className={`nav-item ${(screen === item.key || (screen === "results" && item.key === "search") || (screen === "cart" && item.key === "marketplace")) ? "active" : ""}`}
            onClick={() => setScreen(item.key)}>
            {item.icon}{item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
