import { useState, useEffect, useRef } from "react";
import AgentChat from "./components/AgentChat";
import AdminModeracaoScreen from "./AdminModeracaoScreen";

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

let firebaseAuth, firebaseFirestore, firebaseStorage, firebaseDatabase;

async function initFirebase() {
  if (firebaseAuth) return;
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } =
    await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  const { getFirestore, doc, getDoc, setDoc, updateDoc } =
    await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
  const { getStorage, ref: storageRef, uploadBytes, getDownloadURL } =
    await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js");
  const { getDatabase, ref: dbRef, push, onValue } =
    await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
  const app = initializeApp(FIREBASE_CONFIG);
  const googleProvider = new GoogleAuthProvider();
  firebaseAuth = { instance: getAuth(app), onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, signInWithRedirect, getRedirectResult, googleProvider };
  firebaseFirestore = { instance: getFirestore(app), doc, getDoc, setDoc, updateDoc };
  firebaseStorage = { instance: getStorage(app), storageRef, uploadBytes, getDownloadURL };
  firebaseDatabase = { instance: getDatabase(app), dbRef, push, onValue };
}

/**
 * Retorna o ID token do usuário logado.
 * Lança erro explícito se não houver sessão — evita enviar "Bearer undefined" ao backend.
 */
async function getAuthToken() {
  await initFirebase();
  const token = await firebaseAuth.instance.currentUser?.getIdToken();
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");
  return token;
}

window.__autostoreGetToken = getAuthToken;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0A0F1E;--bg2:#0F172A;--card:#111827;--card2:#1E293B;--card3:#263348;
    --border:#1E2D45;--border2:#2D3F55;
    --primary:#3B82F6;--primary2:#2563EB;--primary3:#60A5FA;--primary4:#1D4ED8;
    --accent:#22C55E;--accent2:#16A34A;
    --text:#F1F5F9;--text2:#CBD5E1;--muted:#64748B;--muted2:#475569;
    --danger:#EF4444;--warning:#F59E0B;--success:#22C55E;
    --radius:16px;--radius-sm:10px;--radius-xs:6px;
  }
  html,body,#root{min-height:100vh;background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;font-size:15px;-webkit-font-smoothing:antialiased}
  .app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;background:var(--bg2);position:relative}
  .screen{flex:1;overflow-y:auto;scrollbar-width:none}
  .screen::-webkit-scrollbar{display:none}
  .screen-inner{padding:20px 18px 100px}

  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulseDot{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.5);opacity:1}}
  @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

  .anim-fade-in{animation:fadeIn .4s ease both}
  .anim-fade-up{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) both}
  .anim-slide-up{animation:slideUp .5s cubic-bezier(.16,1,.3,1) both}
  .delay-1{animation-delay:.07s}.delay-2{animation-delay:.14s}.delay-3{animation-delay:.21s}
  .delay-4{animation-delay:.28s}.delay-5{animation-delay:.35s}.delay-6{animation-delay:.42s}

  .shimmer{background:linear-gradient(90deg,var(--card) 25%,var(--card2) 50%,var(--card) 75%);background-size:400px 100%;animation:shimmer 1.5s infinite;border-radius:var(--radius-sm)}

  /* ── SPINNER ── */
  .spinner{width:36px;height:36px;border:3px solid var(--border2);border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite;margin:24px auto}

  /* ── TOAST ── */
  .toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600;white-space:nowrap;animation:fadeUp .3s ease;max-width:320px;text-align:center}
  .toast.error{background:#EF4444;color:#fff}
  .toast.success{background:#22C55E;color:#fff}
  .toast.warning{background:#F59E0B;color:#000}

  /* ── EMPTY STATE ── */
  .empty{text-align:center;padding:60px 20px}
  .empty-icon{font-size:52px;margin-bottom:16px;opacity:.5}
  .empty-title{font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px}
  .empty-sub{font-size:14px;color:var(--muted)}

  /* ── TOPBAR ── */
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--bg2);position:sticky;top:0;z-index:100;border-bottom:1px solid var(--border)}
  .topbar-logo{display:flex;align-items:center;gap:9px;cursor:pointer}
  .topbar-logo-icon{width:32px;height:32px;background:var(--primary);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .topbar-logo-text{font-size:18px;font-weight:800;color:var(--text);letter-spacing:.3px}
  .topbar-right{display:flex;align-items:center;gap:8px}
  .cart-btn{position:relative;background:var(--card);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:8px 14px;cursor:pointer;display:flex;align-items:center;gap:6px;color:var(--text);font-size:13px;font-weight:500;transition:all .2s}
  .cart-btn:hover{border-color:var(--primary);background:var(--card2)}
  .cart-badge{position:absolute;top:-7px;right:-7px;background:var(--primary);color:#fff;font-size:10px;font-weight:700;border-radius:99px;min-width:19px;height:19px;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid var(--bg2)}

  /* ── BOTTOM NAV ── */
  .bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:var(--card);border-top:1px solid var(--border);display:flex;z-index:200;padding-bottom:env(safe-area-inset-bottom,8px)}
  .nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0 6px;cursor:pointer;border:none;background:none;color:var(--muted);font-size:10px;font-family:'Inter',sans-serif;font-weight:500;gap:4px;transition:color .2s;position:relative}
  .nav-item.active{color:var(--primary)}
  .nav-item svg{width:21px;height:21px}
  .nav-dot{position:absolute;top:8px;right:calc(50% - 14px);width:6px;height:6px;background:var(--accent);border-radius:50%;border:2px solid var(--card)}

  /* ── HERO ── */
  .hero{position:relative;height:280px;overflow:hidden}
  .hero-img{width:100%;height:100%;object-fit:cover;display:block}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,15,30,.15) 0%,rgba(10,15,30,.6) 50%,rgba(10,15,30,.96) 100%)}
  .hero-content{position:absolute;bottom:0;left:0;right:0;padding:24px 20px 28px}
  .hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);border-radius:99px;padding:4px 12px;margin-bottom:12px}
  .hero-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulseDot 2s ease-in-out infinite}
  .hero-badge-text{font-size:11px;color:var(--primary3);font-weight:600;letter-spacing:.5px;text-transform:uppercase}
  .hero-title{font-size:28px;font-weight:800;color:#fff;line-height:1.15;margin-bottom:8px}
  .hero-title span{color:var(--primary3)}
  .hero-sub{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:18px;line-height:1.5}

  /* ── CATEGORY PILLS ── */
  .cat-scroll{display:flex;gap:0;overflow-x:auto;padding:0;scrollbar-width:none;background:var(--card);border-bottom:1px solid var(--border)}
  .cat-scroll::-webkit-scrollbar{display:none}
  .cat-pill{flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 18px;cursor:pointer;border:none;background:none;color:var(--muted);font-size:11px;font-weight:600;transition:all .2s;border-bottom:2px solid transparent;white-space:nowrap;position:relative}
  .cat-pill.active{color:var(--primary);border-bottom-color:var(--primary);background:rgba(59,130,246,.06)}
  .cat-pill:hover:not(.active){color:var(--text2);background:rgba(255,255,255,.04)}
  .cat-pill-icon{font-size:20px;line-height:1}

  /* ── STORE CARDS ── */
  .stores-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px 16px}
  .store-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;cursor:pointer;transition:all .2s}
  .store-card:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:0 8px 32px rgba(59,130,246,.15)}
  .store-card-img{width:100%;height:120px;object-fit:cover;display:block;background:var(--card2)}
  .store-card-body{padding:12px}
  .store-card-name{font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px}
  .store-card-btn{display:flex;align-items:center;justify-content:space-between}

  /* ── PRODUCT STRIP ── */
  .products-scroll{display:flex;gap:12px;overflow-x:auto;padding:0 16px 16px;scrollbar-width:none}
  .products-scroll::-webkit-scrollbar{display:none}
  .product-mini{flex-shrink:0;width:140px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;cursor:pointer;transition:all .2s}
  .product-mini:hover{border-color:var(--primary);transform:translateY(-2px)}
  .product-mini-img{width:100%;height:100px;object-fit:cover;background:var(--card2)}
  .product-mini-body{padding:10px}
  .product-mini-name{font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .product-mini-price{font-size:14px;font-weight:800;color:var(--accent)}

  /* ── SECTION HEADER ── */
  .section-hdr{display:flex;justify-content:space-between;align-items:center;padding:20px 16px 12px}
  .section-hdr-title{font-size:17px;font-weight:700;color:var(--text)}
  .section-hdr-link{font-size:12px;color:var(--primary3);font-weight:600;background:none;border:none;cursor:pointer}

  /* ── QUICK ACTIONS ── */
  .quick-banner{margin:12px 16px;background:linear-gradient(135deg,var(--primary),var(--primary4));border-radius:var(--radius);padding:18px 20px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:filter .2s;border:none;width:calc(100% - 32px)}
  .quick-banner:hover{filter:brightness(1.1)}

  /* ── BUTTONS ── */
  .btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;border-radius:var(--radius-sm);border:none;font-family:'Inter',sans-serif;font-weight:700;font-size:14px;letter-spacing:.2px;cursor:pointer;transition:all .2s;width:100%}
  .btn:active{transform:scale(.97)}
  .btn:disabled{opacity:.4;cursor:not-allowed}
  .btn-primary{background:var(--primary);color:#fff}
  .btn-primary:hover:not(:disabled){background:var(--primary2)}
  .btn-accent{background:var(--accent);color:#fff}
  .btn-accent:hover:not(:disabled){background:var(--accent2)}
  .btn-secondary{background:var(--card2);color:var(--text);border:1px solid var(--border2)}
  .btn-secondary:hover:not(:disabled){border-color:var(--primary);color:var(--primary)}
  .btn-danger{background:var(--danger);color:#fff}
  .btn-ghost{background:transparent;color:var(--primary3);border:1px solid rgba(59,130,246,.3)}
  .btn-ghost:hover{background:rgba(59,130,246,.08)}
  .btn-sm{padding:7px 14px;font-size:12px;width:auto;border-radius:var(--radius-xs)}
  .btn-row{display:flex;gap:10px}

  /* ── CARDS ── */
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
  .card-title{font-weight:700;font-size:16px;margin-bottom:4px;color:var(--text)}
  .card-sub{font-size:13px;color:var(--muted)}

  /* ── SUPER GRID ── */
  .super-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 16px}
  .super-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px 16px;display:flex;flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer;transition:all .2s;color:var(--text);position:relative;overflow:hidden;border:none;text-align:left;border:1px solid var(--border)}
  .super-card:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,130,246,.12)}
  .super-icon{font-size:24px}
  .super-title{font-weight:700;font-size:14px;color:var(--text)}
  .super-sub{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px}

  /* ── BADGES ── */
  .badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
  .badge-new{background:rgba(34,197,94,.15);color:#4ADE80;border:1px solid rgba(34,197,94,.2)}
  .badge-used{background:rgba(245,158,11,.15);color:#FCD34D;border:1px solid rgba(245,158,11,.2)}
  .badge-seller{background:rgba(59,130,246,.15);color:var(--primary3);border:1px solid rgba(59,130,246,.2)}
  .badge-pending{background:rgba(245,158,11,.15);color:#FCD34D;border:1px solid rgba(245,158,11,.2)}
  .badge-confirmed{background:rgba(34,197,94,.15);color:#4ADE80;border:1px solid rgba(34,197,94,.2)}
  .badge-cancelled{background:rgba(239,68,68,.15);color:#FCA5A5;border:1px solid rgba(239,68,68,.2)}
  .badge-shipped{background:rgba(59,130,246,.15);color:var(--primary3);border:1px solid rgba(59,130,246,.2)}
  .badge-delivered{background:rgba(34,197,94,.15);color:#4ADE80;border:1px solid rgba(34,197,94,.2)}

  /* ── INPUTS ── */
  .input-wrap{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}
  .input{background:var(--card);border:1px solid var(--border2);border-radius:var(--radius-sm);padding:13px 14px;color:var(--text);font-size:15px;font-family:'Inter',sans-serif;outline:none;transition:border .2s,box-shadow .2s;width:100%}
  .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(59,130,246,.12)}
  .input::placeholder{color:var(--muted)}
  select.input{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
  .input-plate{font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;text-transform:uppercase;padding:18px}

  /* ── VEHICLE BANNER ── */
  .vehicle-banner{background:linear-gradient(135deg,var(--card),var(--card2));border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px;position:relative;overflow:hidden}
  .vehicle-banner::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%);border-radius:50%}
  .veh-plate{font-size:26px;font-weight:800;letter-spacing:6px;color:var(--primary3);margin-bottom:4px}
  .veh-name{font-size:18px;font-weight:700;margin-bottom:8px;color:var(--text)}
  .veh-specs{display:flex;gap:10px;flex-wrap:wrap}
  .veh-spec{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:4px;background:var(--card2);padding:4px 10px;border-radius:99px;border:1px solid var(--border)}

  /* ── PART CARD ── */
  .part-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:all .2s}
  .part-card:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:0 6px 20px rgba(59,130,246,.1)}
  .part-icon{width:60px;height:60px;border-radius:var(--radius-sm);background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;border:1px solid var(--border)}
  .part-info{flex:1;min-width:0}
  .part-name{font-weight:700;font-size:15px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)}
  .part-oem{font-size:11px;color:var(--muted);font-family:monospace;margin-bottom:6px}
  .part-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .part-price-col{text-align:right;flex-shrink:0}
  .part-price{font-size:22px;font-weight:800;color:var(--accent);line-height:1}
  .part-warranty{font-size:11px;color:var(--muted);margin-top:2px}
  .part-stock{font-size:11px;color:var(--muted);margin-top:2px}

  /* ── DETAIL ── */
  .detail-images{background:var(--card2);border-radius:var(--radius);height:220px;display:flex;align-items:center;justify-content:center;font-size:64px;margin-bottom:20px;border:1px solid var(--border);overflow:hidden}
  .detail-images img{width:100%;height:100%;object-fit:cover}
  .detail-thumbs{display:flex;gap:8px;margin-bottom:20px;overflow-x:auto;scrollbar-width:none}
  .detail-thumb{width:60px;height:60px;border-radius:8px;object-fit:cover;border:2px solid transparent;cursor:pointer;flex-shrink:0;transition:border-color .2s}
  .detail-thumb.active{border-color:var(--primary)}
  .detail-title{font-size:24px;font-weight:800;margin-bottom:4px;color:var(--text)}
  .detail-oem{font-family:monospace;font-size:13px;color:var(--muted);margin-bottom:12px}
  .detail-price{font-size:42px;font-weight:800;color:var(--accent);line-height:1;margin-bottom:4px}
  .detail-price-sub{font-size:13px;color:var(--muted);margin-bottom:20px}
  .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
  .detail-stat{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px}
  .detail-stat-label{font-size:10px;color:var(--primary3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px;font-weight:600}
  .detail-stat-value{font-size:15px;font-weight:700;color:var(--text)}
  .detail-section{margin-bottom:20px}
  .detail-section-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
  .qty-ctrl{display:flex;align-items:center;border:1px solid var(--border2);border-radius:var(--radius-sm);overflow:hidden;width:fit-content}
  .qty-btn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--card2);border:none;color:var(--text);font-size:18px;cursor:pointer;transition:all .2s}
  .qty-btn:hover{background:var(--primary);color:#fff}
  .qty-val{width:48px;text-align:center;font-size:16px;font-weight:700;background:transparent;border:none;color:var(--text)}
  .seller-box{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;display:flex;align-items:center;gap:12px}
  .seller-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary2));display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:16px;flex-shrink:0}

  /* ── CART ── */
  .cart-item{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:center}
  .cart-item-info{flex:1;min-width:0}
  .cart-item-name{font-weight:700;font-size:15px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text)}
  .cart-item-sub{font-size:12px;color:var(--muted)}
  .cart-item-price{font-size:20px;font-weight:800;color:var(--accent)}
  .cart-remove{background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px;flex-shrink:0;padding:4px;transition:color .2s}
  .cart-remove:hover{color:var(--danger)}
  .cart-summary{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-top:16px}
  .cart-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px;color:var(--text2)}
  .cart-total{font-size:28px;font-weight:800;color:var(--accent)}

  /* ── ORDERS ── */
  .stars{display:flex;gap:2px}
  .star{font-size:22px;cursor:pointer;transition:transform .1s;line-height:1}
  .star:hover{transform:scale(1.2)}
  .star-sm{font-size:14px}
  .review-card{background:var(--card2);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;border:1px solid var(--border)}
  .review-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .review-avatar{width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .review-name{font-size:13px;font-weight:600;color:var(--text)}
  .review-comment{font-size:13px;color:var(--muted);line-height:1.5}
  .rating-avg{font-size:20px;font-weight:800;color:var(--accent)}
  .rating-count{font-size:12px;color:var(--muted)}
  .order-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px;transition:border-color .2s}
  .order-card:hover{border-color:var(--border2)}
  .order-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .order-date{font-size:12px;color:var(--muted)}
  .order-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2)}
  .order-item:last-child{border-bottom:none}
  .order-total-row{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}

  /* ── DASHBOARD ── */
  .dash-metric{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;position:relative;overflow:hidden}
  .dash-metric-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px}
  .dash-metric-label{font-size:12px;color:var(--muted);font-weight:500;margin-bottom:4px}
  .dash-metric-value{font-size:26px;font-weight:800;color:var(--text)}
  .dash-metric-sub{font-size:11px;margin-top:4px;display:flex;align-items:center;gap:4px}
  .dash-chart{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:14px}
  .dash-chart-title{font-size:15px;font-weight:700;color:var(--text);margin-bottom:16px}
  .dash-table{width:100%;border-collapse:collapse}
  .dash-table th{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:8px 0;border-bottom:1px solid var(--border);text-align:left}
  .dash-table td{padding:14px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text2)}
  .dash-table td:first-child{font-weight:700;color:var(--text)}
  .dash-table tr:last-child td{border-bottom:none}
  .dash-action-btn{display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px 16px;cursor:pointer;transition:all .2s;margin-bottom:10px;width:100%}
  .dash-action-btn:hover{border-color:var(--primary);background:rgba(59,130,246,.06)}
  .dash-action-btn.primary{background:var(--primary);border-color:var(--primary)}
  .dash-action-btn.primary:hover{background:var(--primary2)}

  /* ── AUTH ── */
  .auth-screen{min-height:100vh;background:var(--bg);display:flex;flex-direction:column;overflow:hidden}
  @media(min-width:640px){
    .auth-hero{position:fixed!important;inset:0;height:100vh!important;z-index:0}
    .auth-hero img{width:100%;height:100%;object-fit:cover}
    .auth-hero-overlay{background:linear-gradient(to right,rgba(10,15,30,.97) 38%,rgba(10,15,30,.5) 100%)!important}
    .auth-hero-logo{display:none!important}
    .auth-body{position:relative;z-index:1;width:420px;min-height:100vh;background:transparent!important;border-radius:0!important;margin-top:0!important;display:flex;flex-direction:column;justify-content:center;padding:40px!important}
    .auth-body::before{content:'';position:absolute;inset:0;background:rgba(17,24,39,.9);backdrop-filter:blur(10px);z-index:-1}
    .auth-desktop-logo{display:flex!important}
  }
  .auth-desktop-logo{display:none;flex-direction:column;margin-bottom:36px}
  .auth-hero{position:relative;height:260px;overflow:hidden;flex-shrink:0}
  .auth-hero img{width:100%;height:100%;object-fit:cover;display:block}
  .auth-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,15,30,.1),rgba(10,15,30,.95))}
  .auth-hero-logo{position:absolute;bottom:0;left:0;right:0;padding:24px;text-align:center}
  .auth-body{background:var(--bg2);flex:1;padding:28px 24px 40px;border-radius:20px 20px 0 0;margin-top:-20px;position:relative}
  .auth-box{width:100%;max-width:380px;margin:0 auto}
  .auth-tabs{display:flex;background:var(--card);border-radius:var(--radius-sm);padding:4px;margin-bottom:24px;gap:4px}
  .auth-tab{flex:1;padding:10px;text-align:center;cursor:pointer;font-weight:600;font-size:14px;border:none;background:transparent;color:var(--muted);font-family:'Inter',sans-serif;transition:all .2s;border-radius:8px}
  .auth-tab.active{background:var(--primary);color:#fff}
  .btn-google{width:100%;padding:13px;border-radius:var(--radius-sm);border:1px solid var(--border2);background:var(--card);color:var(--text);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:14px;transition:all .2s;font-family:'Inter',sans-serif}
  .btn-google:hover{border-color:var(--primary);background:var(--card2)}
  .auth-divider{display:flex;align-items:center;gap:10px;margin-bottom:14px;color:var(--muted);font-size:12px}
  .auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--border2)}

  /* ── FILTER / CHIPS ── */
  .filter-bar{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;margin-bottom:12px;scrollbar-width:none}
  .filter-bar::-webkit-scrollbar{display:none}
  .chip{flex-shrink:0;padding:7px 16px;border-radius:99px;border:1px solid var(--border2);background:var(--card);color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
  .chip.active{border-color:var(--primary);background:rgba(59,130,246,.1);color:var(--primary3)}
  .chip:hover:not(.active){border-color:var(--border2);color:var(--text)}

  /* ── SEARCH HERO ── */
  .search-hero{background:linear-gradient(135deg,var(--card),var(--card2));border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:20px;position:relative;overflow:hidden}
  .search-hero::before{content:'';position:absolute;top:-50px;right:-50px;width:160px;height:160px;background:radial-gradient(circle,rgba(59,130,246,.08) 0%,transparent 70%);border-radius:50%}
  .hero-title-sm{font-size:20px;font-weight:800;color:var(--text);margin-bottom:4px}
  .hero-sub-sm{font-size:13px;color:var(--muted);margin-bottom:18px}

  /* ── CHAT ── */
  .chat-box{height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:12px;background:var(--card);display:flex;flex-direction:column;gap:8px}
  .chat-msg{padding:9px 13px;border-radius:12px;max-width:85%;font-size:14px;line-height:1.4}
  .chat-msg-mine{background:var(--primary);color:#fff;align-self:flex-end;border-bottom-right-radius:3px}
  .chat-msg-other{background:var(--card2);color:var(--text);align-self:flex-start;border-bottom-left-radius:3px;border:1px solid var(--border)}
  .chat-msg-time{font-size:10px;opacity:.55;margin-top:3px;text-align:right}
  .chat-input-row{display:flex;gap:8px}
  .chat-input-row .input{flex:1}
  .chat-send-btn{padding:13px 16px;background:var(--primary);color:#fff;border:none;border-radius:var(--radius-sm);font-weight:700;cursor:pointer;font-size:18px;flex-shrink:0;transition:all .2s}
  .chat-send-btn:hover{background:var(--primary2)}

  /* ── PROFILE ── */
  .profile-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary2));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff}

  /* ── PAGE ── */
  .page-title{font-size:24px;font-weight:800;color:var(--text);margin-bottom:4px}
  .page-sub{font-size:14px;color:var(--muted);margin-bottom:20px}
  .divider{height:1px;background:var(--border);margin:14px 0}

  /* ── SELL FORM ── */
  .photo-upload-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
  .photo-slot{aspect-ratio:1;border-radius:var(--radius-sm);background:var(--card2);border:1px dashed var(--border2);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;position:relative;transition:border-color .2s}
  .photo-slot:hover{border-color:var(--primary)}
  .photo-slot img{width:100%;height:100%;object-fit:cover}
  .photo-add-icon{font-size:24px;opacity:.5}
  .remove-photo{position:absolute;top:4px;right:4px;background:rgba(0,0,0,.6);border:none;color:#fff;border-radius:50%;width:20px;height:20px;font-size:14px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .seller-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
  .seller-form-grid .span2{grid-column:1/-1}
  .filter-label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}
  .toggle-link{font-size:13px;color:var(--muted);cursor:pointer;margin-top:8px;text-align:center}
  .toggle-link span{color:var(--primary3);font-weight:600;text-decoration:underline}
  .back-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;padding:0;margin-bottom:18px;font-family:'Inter',sans-serif}
  .back-btn:hover{color:var(--text)}
  .result-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
  .result-count{font-size:13px;color:var(--muted);background:var(--card2);padding:4px 12px;border-radius:99px;border:1px solid var(--border)}
  .filter-section{margin-bottom:12px}
  .avatar-edit-btn{position:absolute;bottom:0;right:0;width:24px;height:24px;background:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid var(--bg2)}
  .profile-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
  .stat-box{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;text-align:center}
  .stat-num{font-size:22px;font-weight:800;color:var(--text)}
  .stat-lbl{font-size:11px;color:var(--muted);margin-top:2px}
  .seller-rating{display:flex;align-items:center;gap:6px}
  .chat-msg-user{font-size:11px;color:var(--primary3);font-weight:600;margin-bottom:2px}

  /* ── PREMIUM GATE ── */
  .premium-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:flex;align-items:flex-end;justify-content:center}
  .premium-sheet{background:var(--card);border-radius:20px 20px 0 0;padding:28px 22px 44px;width:100%;max-width:480px;animation:slideUp .35s cubic-bezier(.16,1,.3,1)}
  .premium-icon-wrap{width:64px;height:64px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px}
  .premium-title{font-size:22px;font-weight:800;text-align:center;margin-bottom:6px}
  .premium-sub{font-size:14px;color:var(--muted);text-align:center;margin-bottom:20px;line-height:1.5}
  .premium-feature-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)}
  .premium-feature-row:last-of-type{border-bottom:none;padding-bottom:0}
  .premium-feature-icon{font-size:18px;width:26px;text-align:center}
  .premium-feature-text{font-size:14px;color:var(--text2);line-height:1.4}
  .plan-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:12px;position:relative;overflow:hidden}
  .plan-card.featured{border-color:#f59e0b;background:linear-gradient(135deg,rgba(245,158,11,.07),var(--card))}
  .plan-badge-top{position:absolute;top:0;right:0;background:#f59e0b;color:#000;font-size:10px;font-weight:700;padding:4px 14px;border-radius:0 var(--radius) 0 var(--radius-sm);letter-spacing:.5px;text-transform:uppercase}
  .plan-name{font-size:20px;font-weight:800;margin-bottom:4px}
  .plan-price{font-size:36px;font-weight:800;color:var(--accent);line-height:1;margin-bottom:2px}
  .plan-price-sub{font-size:12px;color:var(--muted);margin-bottom:16px}
  .plan-feature{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--text2);margin-bottom:9px;line-height:1.4}
  .plan-check{color:var(--accent);font-size:14px;flex-shrink:0;margin-top:1px}
  .plan-lock{color:var(--muted);font-size:14px;flex-shrink:0;margin-top:1px}
  .store-hub-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;cursor:pointer;transition:all .2s;margin-bottom:10px}
  .store-hub-card:hover{border-color:var(--primary);transform:translateY(-2px);box-shadow:0 6px 24px rgba(59,130,246,.1)}
  .store-hub-banner{width:100%;height:88px;object-fit:cover;background:var(--card2)}
  .store-hub-body{padding:12px 14px 14px}
  .store-hub-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .store-hub-avatar{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--primary),var(--primary4));display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#fff;flex-shrink:0;border:2px solid var(--border)}
  .store-hub-name{font-size:15px;font-weight:700;color:var(--text)}
  .store-hub-spec{font-size:12px;color:var(--muted)}
  .store-hub-stats{display:flex;gap:14px;font-size:12px;color:var(--muted)}
  .store-hub-premium{display:inline-flex;align-items:center;gap:4px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.28);color:#f59e0b;font-size:10px;font-weight:700;padding:2px 9px;border-radius:99px;letter-spacing:.5px}
  .minha-loja-banner{width:100%;height:155px;object-fit:cover;background:linear-gradient(135deg,var(--primary4),var(--primary2));border-radius:var(--radius) var(--radius) 0 0;display:flex;align-items:center;justify-content:center;font-size:56px}
  .minha-loja-header{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:14px}
  .minha-loja-info{padding:14px 16px}
  .minha-loja-name{font-size:22px;font-weight:800;margin-bottom:2px}
  .minha-loja-spec{font-size:13px;color:var(--muted);margin-bottom:10px}
  .minha-loja-stat-row{display:flex;gap:8px}
  .minha-loja-stat{flex:1;background:var(--card2);border-radius:var(--radius-sm);padding:10px;text-align:center}
  .minha-loja-stat-num{font-size:20px;font-weight:800}
  .minha-loja-stat-lbl{font-size:11px;color:var(--muted);margin-top:2px}
  .fav-btn{background:none;border:none;font-size:22px;cursor:pointer;padding:4px;transition:transform .15s;line-height:1}
  .fav-btn:active{transform:scale(1.3)}
  .upgrade-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#f59e0b;font-size:11px;font-weight:600;padding:4px 12px;border-radius:99px;cursor:pointer;transition:all .2s}
  .upgrade-chip:hover{background:rgba(245,158,11,.2)}
  .tab-bar{display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:16px;overflow-x:auto;scrollbar-width:none}
  .tab-bar::-webkit-scrollbar{display:none}
  .tab-btn{flex-shrink:0;padding:10px 16px;font-size:13px;font-weight:600;color:var(--muted);border:none;border-bottom:2px solid transparent;background:none;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s;white-space:nowrap}
  .tab-btn.active{color:var(--primary3);border-bottom-color:var(--primary)}
  .alert-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .alert-card-icon{font-size:20px;flex-shrink:0}
  .alert-card-name{font-size:14px;font-weight:600;color:var(--text)}
  .alert-card-price{font-size:13px;color:var(--muted)}
`

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

// ─── PREMIUM GATE ─────────────────────────────────────────────────────────────
function PremiumGate({ title, desc, features, onClose, onUpgrade }) {
  return (
    <div className="premium-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="premium-sheet">
        <div className="premium-icon-wrap">⭐</div>
        <div className="premium-title">{title || "Recurso Premium"}</div>
        <div className="premium-sub">{desc || "Faça upgrade para acessar este recurso."}</div>
        {features && (
          <div style={{marginBottom:20}}>
            {features.map((f, i) => (
              <div key={i} className="premium-feature-row">
                <div className="premium-feature-icon">{f.icon}</div>
                <div className="premium-feature-text">{f.text}</div>
              </div>
            ))}
          </div>
        )}
        <button className="btn btn-primary" style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",marginBottom:10}} onClick={onUpgrade}>
          ⭐ Ver Planos Premium
        </button>
        <button className="btn btn-secondary" onClick={onClose}>Agora não</button>
      </div>
    </div>
  );
}

// ─── STARS ────────────────────────────────────────────────────────────────────
function Stars({ value, onChange, size = "md" }) {
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? value ?? 0;
  return (
    <div className="stars">
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={size === "sm" ? "star star-sm" : "star"}
          style={{ color: n <= active ? "#f5a623" : "var(--border)" }}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(null)}
        >★</span>
      ))}
    </div>
  );
}

const Icons = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Shop: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Cart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  Orders: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Sell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Logout: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Chat: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Store: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  Star: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Crown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20M5 20V10l7-6 7 6v10"/></svg>,
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", type: "buyer" });
  const [loading, setLoading] = useState(false);
  const [show, toastEl] = useToast();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleGoogleUser = async (cred) => {
    const userRef = firebaseFirestore.doc(firebaseFirestore.instance, "users", cred.user.uid);
    const snap = await firebaseFirestore.getDoc(userRef);
    if (!snap.exists()) {
      const newUser = {
        name: cred.user.displayName || "Usuário Google",
        email: cred.user.email,
        photo: cred.user.photoURL || null,
        type: "buyer",
        sellerVerified: false,
        active: true,
        createdAt: new Date().toISOString(),
      };
      await firebaseFirestore.setDoc(userRef, newUser);
      onLogin({ uid: cred.user.uid, ...newUser });
    } else {
      // Sempre lê do Firestore — respeita type: "admin" e qualquer outra alteração
      const userData = { uid: cred.user.uid, email: cred.user.email, ...snap.data() };
      onLogin(userData);
    }
  };

  const loginWithGoogle = async () => {
    // Browser interno do Instagram/WhatsApp não suporta login Google
    // Orienta o usuário a abrir no Chrome/Safari
    const isInAppBrowser = /Instagram|FBAN|FBAV|Twitter|Line|Snapchat|FB_IAB/i.test(navigator.userAgent);
    if (isInAppBrowser) {
      show("Abra no Chrome ou Safari para entrar com Google 🌐", "warning");
      return;
    }
    setLoading(true);
    try {
      await initFirebase();
      const cred = await firebaseAuth.signInWithPopup(firebaseAuth.instance, firebaseAuth.googleProvider);
      await handleGoogleUser(cred);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") show("Erro ao entrar com Google");
    } finally { setLoading(false); }
  };

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
        { name: form.name, email: form.email, type: form.type, plan: "free", sellerVerified: false, active: true, createdAt: new Date().toISOString() });
      show("Conta criada! Faça login.", "success");
      setTab("login");
    } catch (e) {
      show(e.code === "auth/email-already-in-use" ? "Email já cadastrado" : "Erro ao cadastrar");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-screen" style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      {toastEl}
      {/* Hero com imagem real - login.html style */}
      <div className="auth-hero">
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=840&q=75&auto=format&fit=crop" alt="AutoStore" />
        <div className="auth-hero-overlay" />
        <div className="auth-hero-logo">
          <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
            <div style={{width:44,height:44,background:"var(--primary)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontSize:24,fontWeight:800}}>A</span>
            </div>
            <span style={{fontSize:38,fontWeight:800,color:"#fff",letterSpacing:1}}>AutoStore</span>
          </div>
          <div className="auth-logo-sub">Marketplace Automotivo</div>
        </div>
      </div>
      <div className="auth-body">
      <div className="auth-box">
        {/* Logo visível apenas no desktop */}
        <div className="auth-desktop-logo">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:44,height:44,background:"var(--primary)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:24,fontWeight:800}}>A</span>
          </div>
          <span style={{fontSize:38,fontWeight:800,color:"var(--text)",letterSpacing:1}}>AutoStore</span>
        </div>
          <div className="auth-desktop-logo-sub">Marketplace Automotivo</div>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Entrar</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Cadastrar</button>
        </div>
        {/Instagram|FBAN|FBAV|Twitter|Line|Snapchat|FB_IAB/i.test(navigator.userAgent) ? (
          <div style={{background:"#d9770620",border:"1px solid #d97706",borderRadius:"var(--radius-sm)",padding:"12px 14px",marginBottom:16,fontSize:13,color:"#fbbf24",textAlign:"center",lineHeight:1.5}}>
            🌐 Para entrar com Google, abra este link no <strong>Chrome</strong> ou <strong>Safari</strong>
          </div>
        ) : (
          <button className="btn-google" onClick={loginWithGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-2.9-11.9-7.1l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6l6.2 5.2C40.7 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
            {loading ? "Aguarde..." : "Continuar com Google"}
          </button>
        )}
        <div className="auth-divider">ou</div>
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
            <div className="input-wrap">
              <label className="label">Tipo de conta</label>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                {[{v:"buyer",icon:"🛒",label:"Comprador"},{v:"seller",icon:"🏪",label:"Vendedor"}].map(o => (
                  <button key={o.v} onClick={() => setForm(f=>({...f,type:o.v}))}
                    style={{flex:1,padding:"12px 8px",borderRadius:"var(--radius-sm)",border:`2px solid ${form.type===o.v?"var(--primary)":"var(--border2)"}`,background:form.type===o.v?"rgba(59,130,246,.1)":"var(--card)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .2s"}}>
                    <span style={{fontSize:22}}>{o.icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:form.type===o.v?"var(--primary3)":"var(--muted)"}}>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={register} disabled={loading}>{loading ? "Criando conta..." : "Criar conta"}</button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ user, setScreen, cartCount, setSelectedStore, setSelectedPart, userCoords }) {
  const isSeller = user?.type === "seller";
  const firstName = user?.name?.split(" ")[0] || "Usuário";
  const [activeCat, setActiveCat] = useState(0);
  const [featuredStores, setFeaturedStores] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const categories = [
    { icon: "🔧", label: "Motor" },
    { icon: "⚙️", label: "Câmbio" },
    { icon: "🔩", label: "Suspensão" },
    { icon: "🛑", label: "Freios" },
    { icon: "💡", label: "Elétrica" },
    { icon: "🎁", label: "Acessórios" },
  ];

  // Busca lojas e produtos reais da API
  useEffect(() => {
    fetch(`${API}/marketplaceParts?limit=40`)
      .then(r => r.json())
      .then(d => {
        const parts = d.data || [];

        // ── Lojas em destaque (até 4, premium+próximas primeiro) ────────────
        const storeMap = {};
        parts.forEach(p => {
          const sid = p.sellerId || p.seller?.uid;
          const sname = p.seller?.name || "Loja";
          if (sid && !storeMap[sid]) {
            storeMap[sid] = {
              id: sid,
              name: sname,
              photo: p.seller?.photo || null,
              plan: p.seller?.plan || "free",
              specialty: p.seller?.specialty || "Peças Automotivas",
              rating: p.seller?.ratingAvg || 0,
              ratingCount: p.seller?.ratingCount || 0,
              coords: p.seller?.coords || null,
              partsCount: 0,
            };
          }
          if (sid) storeMap[sid].partsCount++;
        });
        const storeList = Object.values(storeMap);
        storeList.sort((a, b) => {
          const aPremium = a.plan === "premium" ? 1 : 0;
          const bPremium = b.plan === "premium" ? 1 : 0;
          if (aPremium !== bPremium) return bPremium - aPremium;
          if (userCoords) {
            const distA = haversineKm(userCoords, a.coords);
            const distB = haversineKm(userCoords, b.coords);
            if (distA !== distB) return distA - distB;
          }
          return b.rating - a.rating || b.ratingCount - a.ratingCount;
        });
        setFeaturedStores(storeList.slice(0, 4));
        setLoadingStores(false);

        // ── Produtos populares (até 6, os mais recentes) ────────────────────
        setPopularProducts(parts.slice(0, 6));
        setLoadingProducts(false);
      })
      .catch(() => { setLoadingStores(false); setLoadingProducts(false); });
  }, []);

  const fmt = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="screen" style={{paddingBottom:80}}>

      {/* ── HERO ── */}
      <div className="hero">
        <img className="hero-img"
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=85&auto=format&fit=crop"
          alt="AutoStore" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            <span className="hero-badge-text">Marketplace Automotivo</span>
          </div>
          <div className="hero-title">
            Peças e acessórios<br/>automotivos<br/>
            <span>de qualidade</span>
          </div>
          <div className="hero-sub">
            Encontre tudo o que seu carro precisa<br/>em lojas confiáveis.
          </div>
          <button className="btn btn-primary anim-slide-up"
            style={{width:"auto",padding:"12px 24px",fontSize:14,borderRadius:10}}
            onClick={() => setScreen("lojas")}>
            Explorar Lojas
          </button>
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="cat-scroll">
        {categories.map((cat, i) => (
          <button key={i}
            className={`cat-pill ${activeCat === i ? "active" : ""}`}
            onClick={() => { setActiveCat(i); setScreen("marketplace"); }}>
            <span className="cat-pill-icon">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── QUICK ACTIONS ROW ── */}
      <div style={{display:"flex",gap:10,padding:"12px 16px 0"}}>
        <button className="quick-banner" style={{flex:1,margin:0,width:"auto"}} onClick={() => setScreen("search")}>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:2}}>🔍 Buscar pela placa</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>Peça certa para seu carro</div>
          </div>
          <div style={{fontSize:20,color:"rgba(255,255,255,.9)"}}>→</div>
        </button>
        <button className="quick-banner" style={{flex:1,margin:0,width:"auto",background:"linear-gradient(135deg,#0f6e56,#1d9e75)"}} onClick={() => setScreen("lojas")}>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:2}}>🏪 Central de Lojas</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>Todas as lojas</div>
          </div>
          <div style={{fontSize:20,color:"rgba(255,255,255,.9)"}}>→</div>
        </button>
      </div>

      {/* ── LOJAS EM DESTAQUE ── */}
      <div className="section-hdr">
        <span className="section-hdr-title">Lojas em Destaque</span>
        <button className="section-hdr-link" onClick={() => setScreen("lojas")}>Ver todas →</button>
      </div>

      <div className="stores-grid">
        {loadingStores ? (
          [1,2,3,4].map(i => (
            <div key={i} className="store-card" style={{pointerEvents:"none"}}>
              <div className="shimmer store-card-img" />
              <div className="store-card-body">
                <div className="shimmer" style={{height:13,width:"70%",marginBottom:10}} />
                <div className="shimmer" style={{height:28,width:"80%",borderRadius:8}} />
              </div>
            </div>
          ))
        ) : featuredStores.length === 0 ? (
          <div style={{gridColumn:"1/-1",padding:"20px 0",textAlign:"center",color:"var(--muted)",fontSize:13}}>
            Nenhuma loja disponível ainda
          </div>
        ) : featuredStores.map((store, i) => (
          <div key={store.id} className={`store-card anim-fade-up delay-${i+1}`}
            onClick={() => { setSelectedStore && setSelectedStore(store); setScreen("store_profile"); }}>
            {store.photo
              ? <img src={store.photo} alt={store.name} className="store-card-img" />
              : <div className="store-card-img" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1e3a5f,#0f172a)",fontSize:36}}>🏪</div>
            }
            <div className="store-card-body">
              <div className="store-card-name">{store.name}</div>
              <div className="store-card-btn">
                <button className="btn btn-primary btn-sm"
                  style={{padding:"6px 14px",fontSize:12,borderRadius:8}}>
                  Ver Loja
                </button>
                {store.plan === "premium" && <span style={{fontSize:11,color:"#f59e0b",fontWeight:700}}>⭐</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PRODUTOS POPULARES ── */}
      <div className="section-hdr">
        <span className="section-hdr-title">Produtos Populares</span>
        <button className="section-hdr-link" onClick={() => setScreen("marketplace")}>Ver mais →</button>
      </div>

      <div className="products-scroll">
        {loadingProducts ? (
          [1,2,3].map(i => (
            <div key={i} className="product-mini" style={{pointerEvents:"none"}}>
              <div className="shimmer product-mini-img" />
              <div className="product-mini-body">
                <div className="shimmer" style={{height:12,width:"80%",marginBottom:6}} />
                <div className="shimmer" style={{height:14,width:"50%"}} />
              </div>
            </div>
          ))
        ) : popularProducts.length === 0 ? (
          <div style={{padding:"20px 16px",color:"var(--muted)",fontSize:13}}>
            Nenhum produto disponível ainda
          </div>
        ) : popularProducts.map((prod, i) => {
          const img = prod.part?.images?.[0] || prod.images?.[0] || null;
          const name = prod.part?.name || prod.name || "Peça Automotiva";
          return (
            <div key={prod.id || i} className={`product-mini anim-fade-up delay-${i+1}`}
              onClick={() => { setSelectedPart && setSelectedPart(prod); }}>
              {img
                ? <img src={img} alt={name} className="product-mini-img" />
                : <div className="product-mini-img" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"var(--card2)",fontSize:28}}>🔧</div>
              }
              <div className="product-mini-body">
                <div className="product-mini-name">{name}</div>
                <div className="product-mini-price">{fmt(prod.price)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── AÇÕES RÁPIDAS (só vendedor) ── */}
      {isSeller && (
        <>
          <div className="section-hdr">
            <span className="section-hdr-title">Ações Rápidas</span>
          </div>
          <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:10}}>
            <button className="dash-action-btn primary" onClick={() => setScreen("sell_form")}>
              <span style={{fontSize:20}}>📦</span>
              <span style={{fontWeight:700,color:"#fff",fontSize:14}}>+ Novo Produto</span>
            </button>
            <button className="dash-action-btn" onClick={() => setScreen("minha_loja")}>
              <span style={{fontSize:20}}>🏪</span>
              <span style={{fontWeight:600,color:"var(--text)",fontSize:14}}>Ver Minha Loja</span>
            </button>
          </div>
        </>
      )}

      {/* ── ACESSO ADMIN (só isAdmin ou type=admin) ── */}
      {(user?.isAdmin || user?.type === "admin") && (
        <div style={{padding:"0 16px 20px"}}>
          <button className="dash-action-btn"
            style={{borderColor:"rgba(239,68,68,.4)",background:"rgba(239,68,68,.06)"}}
            onClick={() => setScreen("admin_moderacao")}>
            <span style={{fontSize:20}}>🛡️</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontWeight:700,color:"var(--text)",fontSize:14}}>Painel Admin</div>
              <div style={{fontSize:11,color:"var(--muted)"}}>Moderar anúncios pendentes</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SELL DASHBOARD ────────────────────────────────────────────────────────────
function SellDashboard({ user, setScreen }) {
  const firstName = user?.name?.split(" ")[0] || "Usuário";
  const [orders, setOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // ── Fallback: busca pedidos usando a instância Firestore já inicializada ──
    // Funciona enquanto o backend não tem GET /orders/seller deployado.
    // Usa firebaseFirestore (já inicializado pelo initFirebase) com o token
    // do usuário logado — as rules do Firestore permitem isso.
    const loadFromFirestore = async () => {
      try {
        // Importa só as funções de query (a instância db já existe via initFirebase)
        const { collection, getDocs, query, where, orderBy, limit } =
          await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const db = firebaseFirestore.instance;  // instância autenticada com o usuário logado

        // 1ª tentativa: pedidos onde sellerIds contém o uid (pedidos novos com o fix)
        let myOrders = [];
        try {
          const q = query(
            collection(db, "orders"),
            where("sellerIds", "array-contains", user.uid),
            orderBy("createdAt", "desc"),
            limit(100)
          );
          const snap = await getDocs(q);
          myOrders = snap.docs.map(doc => {
            const d = doc.data();
            const myItems = (d.items || []).filter(i => i.sellerId === user.uid);
            const myTotal = myItems.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0);
            return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.() ?? null, myItems, myTotal, buyerName: d.buyerName || "Comprador" };
          });
        } catch (e) {
          console.warn("sellerIds query failed:", e.message);
        }

        // 2ª tentativa: pedidos onde buyerId é do usuário (caso seja comprador-vendedor)
        // e pedidos sem sellerIds (pedidos antigos) — filtra client-side por items.sellerId
        if (myOrders.length === 0) {
          try {
            // Busca os pedidos mais recentes sem filtro (permitido pelas rules se o usuário
            // for dono: buyerId == auth.uid). Para pedidos de outros compradores onde o vendedor
            // é o usuário logado, o backend é necessário.
            const q2 = query(
              collection(db, "orders"),
              where("buyerId", "==", user.uid),
              orderBy("createdAt", "desc"),
              limit(100)
            );
            const snap2 = await getDocs(q2);
            // Inclui também pedidos onde o usuário é vendedor nos items
            const asSeller = snap2.docs
              .filter(doc => doc.data().items?.some(i => i.sellerId === user.uid))
              .map(doc => {
                const d = doc.data();
                const myItems = (d.items || []).filter(i => i.sellerId === user.uid);
                const myTotal = myItems.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0);
                return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.() ?? null, myItems, myTotal, buyerName: d.buyerName || "Comprador" };
              });
            if (asSeller.length > 0) myOrders = asSeller;
          } catch (e2) {
            console.warn("buyerId fallback failed:", e2.message);
          }
        }

        if (!cancelled) setOrders(myOrders);
      } catch (err) {
        console.warn("Firestore fallback error:", err.message);
        if (!cancelled) setOrders([]);
      }
    };

    const load = async () => {
      try {
        await initFirebase();

        // Peças — rota pública do backend
        fetch(`${API}/marketplaceParts?sellerId=${user.uid}`)
          .then(r => r.ok ? r.json() : { data: [] })
          .then(d => { if (!cancelled) setParts(d.data || []); })
          .catch(() => {});

        // Pedidos — Firestore direto (regras já permitem sellerIds e buyerId)
        // O backend será usado automaticamente quando a rota /orders/seller existir
        await loadFromFirestore();

      } catch (e) {
        await loadFromFirestore();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Cálculos reais ──────────────────────────────────────────────────────────
  const now = new Date();
  const todayStr = now.toDateString();

  const todayOrders = orders.filter(o => {
    const d = o.createdAt ? new Date(o.createdAt) : null;
    return d && d.toDateString() === todayStr;
  });
  const todaySales = todayOrders.reduce((s, o) => s + (o.myTotal || 0), 0);
  const pendingCount = orders.filter(o => o.status === "pending" || o.status === "awaiting_payment").length;

  // Vendas dos últimos 7 dias agrupadas por dia
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const salesByDay = last7.map(day => {
    const dayStr = day.toDateString();
    return orders
      .filter(o => o.createdAt && new Date(o.createdAt).toDateString() === dayStr)
      .reduce((s, o) => s + (o.myTotal || 0), 0);
  });

  // Crescimento: compara esta semana com semana anterior
  const thisWeekSales = salesByDay.reduce((s, v) => s + v, 0);
  const prevWeekOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    const daysAgo = (now - d) / (1000 * 60 * 60 * 24);
    return daysAgo >= 7 && daysAgo < 14;
  });
  const prevWeekSales = prevWeekOrders.reduce((s, o) => s + (o.myTotal || 0), 0);
  const growth = prevWeekSales > 0 ? ((thisWeekSales - prevWeekSales) / prevWeekSales) * 100 : 0;

  // Conversão: pedidos com status delivered / total de pedidos
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const convRate = orders.length > 0 ? (deliveredCount / orders.length) * 100 : 0;

  const metrics = [
    {
      icon: "💰", label: "Vendas Hoje",
      value: fmt(todaySales),
      sub: todayOrders.length > 0 ? `${todayOrders.length} pedido${todayOrders.length > 1 ? "s" : ""}` : "Nenhum hoje",
      subColor: todayOrders.length > 0 ? "var(--accent)" : "var(--muted)",
      bg: "rgba(34,197,94,.12)",
    },
    {
      icon: "📦", label: "Pedidos Hoje",
      value: String(todayOrders.length),
      sub: pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? "s" : ""}` : "Todos ok",
      subColor: pendingCount > 0 ? "var(--warning)" : "var(--accent)",
      bg: "rgba(245,158,11,.12)",
    },
    {
      icon: "📈", label: "Esta Semana",
      value: fmt(thisWeekSales),
      sub: growth !== 0 ? `${growth >= 0 ? "↑" : "↓"} ${Math.abs(growth).toFixed(1)}% vs anterior` : "Sem histórico",
      subColor: growth >= 0 ? "var(--accent)" : "var(--danger)",
      bg: "rgba(34,197,94,.12)",
    },
    {
      icon: "%", label: "Conversão",
      value: `${convRate.toFixed(1)}%`,
      sub: `${deliveredCount} entregue${deliveredCount !== 1 ? "s" : ""} / ${orders.length} total`,
      subColor: "var(--primary3)",
      bg: "rgba(59,130,246,.12)",
    },
  ];

  const recentOrders = orders.slice(0, 5);

  const statusLabel = { pending: "Pendente", awaiting_payment: "Aguardando", confirmed: "Confirmado", shipped: "Enviado", delivered: "Concluído", cancelled: "Cancelado" };
  const statusColor = {
    pending:          { bg: "rgba(245,158,11,.15)", color: "#FCD34D" },
    awaiting_payment: { bg: "rgba(100,116,139,.15)", color: "#94A3B8" },
    confirmed:        { bg: "rgba(59,130,246,.15)",  color: "#93C5FD" },
    shipped:          { bg: "rgba(59,130,246,.15)",  color: "#93C5FD" },
    delivered:        { bg: "rgba(34,197,94,.15)",   color: "#4ADE80" },
    cancelled:        { bg: "rgba(239,68,68,.15)",   color: "#FCA5A5" },
  };

  // Chart SVG com dados reais
  const chartPoints = salesByDay;
  const w = 300, h = 80, pad = 10;
  const maxV = Math.max(...chartPoints, 1);
  const pts = chartPoints.map((v, i) => {
    const x = pad + (i / (chartPoints.length - 1)) * (w - 2 * pad);
    const y = h - pad - (v / maxV) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`;
  const dayLabels = last7.map(d => ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()]);

  return (
    <div className="screen" style={{paddingBottom:80}}>
      {/* Header */}
      <div style={{padding:"20px 16px 0"}}>
        <div style={{fontSize:24,fontWeight:800,color:"var(--text)",marginBottom:4}}>Visão Geral</div>
        <div style={{fontSize:14,color:"var(--muted)",marginBottom:20}}>
          Bem-vindo de volta, <span style={{color:"var(--primary3)",fontWeight:700}}>{firstName}</span>!
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : (
        <>
          {/* Metric Cards */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px 16px"}}>
            {metrics.map((m, i) => (
              <div key={i} className={`dash-metric anim-fade-up delay-${i+1}`}>
                <div className="dash-metric-icon" style={{background:m.bg}}>
                  <span style={{fontSize:16}}>{m.icon}</span>
                </div>
                <div className="dash-metric-label">{m.label}</div>
                <div className="dash-metric-value" style={{fontSize:18}}>{m.value}</div>
                <div className="dash-metric-sub" style={{color:m.subColor}}>
                  <span style={{fontSize:11}}>{m.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{padding:"0 16px 16px"}}>
            <div className="dash-chart">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div className="dash-chart-title">Vendas da Semana</div>
                <span style={{fontSize:11,background:"var(--card2)",border:"1px solid var(--border)",
                  padding:"4px 10px",borderRadius:99,color:"var(--muted)",fontWeight:500}}>Últimos 7 dias</span>
              </div>
              {thisWeekSales === 0 ? (
                <div style={{textAlign:"center",padding:"20px 0",color:"var(--muted)",fontSize:13}}>
                  📊 Nenhuma venda nos últimos 7 dias
                </div>
              ) : (
                <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{overflow:"visible"}}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity=".35"/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity=".02"/>
                    </linearGradient>
                  </defs>
                  <polygon points={areaPoints} fill="url(#chartGrad)"/>
                  <polyline points={pts} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
                  {chartPoints.map((v, i) => {
                    const x = pad + (i / (chartPoints.length - 1)) * (w - 2 * pad);
                    const y = h - pad - (v / maxV) * (h - 2 * pad);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="4" fill="#3B82F6" stroke="#0F172A" strokeWidth="2"/>
                        {v > 0 && <text x={x} y={y - 8} textAnchor="middle" fontSize="8" fill="#64748B">
                          {fmt(v).replace("R$","").trim()}
                        </text>}
                      </g>
                    );
                  })}
                </svg>
              )}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                {dayLabels.map((d, i) => (
                  <span key={i} style={{fontSize:10,color:"var(--muted)",fontWeight:500}}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{padding:"0 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:700,color:"var(--text)"}}>Últimos Pedidos</div>
              <button onClick={() => setScreen("orders")}
                style={{fontSize:12,color:"var(--primary3)",background:"var(--card2)",
                  border:"1px solid var(--border)",padding:"5px 12px",borderRadius:99,
                  cursor:"pointer",fontWeight:600}}>
                Ver Todos →
              </button>
            </div>
            {recentOrders.length === 0 ? (
              <div className="empty" style={{padding:"30px 0"}}>
                <div className="empty-icon">📦</div>
                <div className="empty-title">Nenhum pedido ainda</div>
                <div className="empty-sub">Seus pedidos aparecerão aqui</div>
              </div>
            ) : (
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"var(--radius)"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",
                  padding:"10px 14px",borderBottom:"1px solid var(--border)"}}>
                  {["Pedido","Cliente","Status","Valor"].map(h => (
                    <span key={h} style={{fontSize:11,color:"var(--muted)",fontWeight:600,
                      textTransform:"uppercase",letterSpacing:".5px"}}>{h}</span>
                  ))}
                </div>
                {recentOrders.map((order, i) => {
                  const sc = statusColor[order.status] || statusColor.pending;
                  const shortId = `#${order.id.slice(-5).toUpperCase()}`;
                  return (
                    <div key={order.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",
                      padding:"14px",borderBottom: i < recentOrders.length-1 ? "1px solid var(--border)" : "none",
                      alignItems:"center"}}>
                      <span style={{fontWeight:700,color:"var(--text)",fontSize:13}}>{shortId}</span>
                      <span style={{fontSize:13,color:"var(--text2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {order.buyerName || "Comprador"}
                      </span>
                      <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:99,
                        background:sc.bg,color:sc.color,display:"inline-block",width:"fit-content"}}>
                        {statusLabel[order.status] || order.status}
                      </span>
                      <span style={{fontSize:13,fontWeight:700,color:"var(--text)",textAlign:"right"}}>
                        {fmt(order.myTotal || order.total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Inventory summary */}
          <div style={{padding:"16px"}}>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:10}}>Estoque</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[
                { label:"Anúncios", value: parts.length, icon:"📋" },
                { label:"Em estoque", value: parts.reduce((s,p)=>s+(p.stock||0),0), icon:"📦" },
                { label:"Sem estoque", value: parts.filter(p=>(p.stock||0)===0).length, icon:"⚠️" },
              ].map((s, i) => (
                <div key={i} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
                  <div style={{fontSize:22,fontWeight:800,color:"var(--text)"}}>{s.value}</div>
                  <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div style={{padding:"0 16px 16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:12}}>Ações Rápidas</div>
        <button className="dash-action-btn primary" onClick={() => setScreen("sell_form")}>
          <span style={{fontSize:20}}>📦</span>
          <span style={{fontWeight:700,color:"#fff",fontSize:14}}>+ Novo Produto (OEM)</span>
        </button>
        <button className="dash-action-btn" onClick={() => setScreen("chassi")}
          style={{borderColor:"rgba(59,130,246,.4)",background:"rgba(59,130,246,.06)"}}>
          <span style={{fontSize:20}}>🔩</span>
          <div style={{textAlign:"left"}}>
            <div style={{fontWeight:700,color:"var(--text)",fontSize:14}}>Desmanche por Chassi</div>
            <div style={{fontSize:11,color:"var(--muted)"}}>Publica lote inteiro de um veículo</div>
          </div>
        </button>
        <button className="dash-action-btn" onClick={() => setScreen("minha_loja")}>
          <span style={{fontSize:20}}>🏪</span>
          <span style={{fontWeight:600,color:"var(--text)",fontSize:14}}>Ver Minha Loja</span>
        </button>
        <button className="dash-action-btn" onClick={() => setScreen("plans")}>
          <span style={{fontSize:20}}>⭐</span>
          <span style={{fontWeight:600,color:"var(--text)",fontSize:14}}>Planos e Assinatura</span>
        </button>
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
    <div className="screen screen-inner">
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
  const [catFilter, setCatFilter] = useState("all");
  const { plate, vehicle, parts } = vehicleData;

  // Extrai categorias únicas das peças retornadas
  const categories = ["all", ...new Set(parts.map(p => p.part?.categoryName).filter(Boolean))];

  const filtered = parts.filter(p => {
    const condOk = filter === "all" || p.condition === filter;
    const catOk = catFilter === "all" || p.part?.categoryName === catFilter;
    return condOk && catOk;
  });

  return (
    <div className="screen screen-inner">
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
      <div className="filter-section">
        <div className="filter-label">Condição</div>
        <div className="filter-bar">
          {[{ k: "all", l: "Todas" }, { k: "new", l: "Novas" }, { k: "used", l: "Usadas" }].map(f => (
            <button key={f.k} className={`chip ${filter === f.k ? "active" : ""}`} onClick={() => setFilter(f.k)}>{f.l}</button>
          ))}
        </div>
      </div>
      {categories.length > 1 && (
        <div className="filter-section">
          <div className="filter-label">Categoria</div>
          <div className="filter-bar">
            {categories.map(c => (
              <button key={c} className={`chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>
                {c === "all" ? "Todas" : c}
              </button>
            ))}
          </div>
        </div>
      )}
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
  const [catFilter, setCatFilter] = useState("all");

  useEffect(() => {
    fetch(`${API}/marketplaceParts`).then(r => r.json()).then(d => setParts(d.data || [])).catch(() => []).finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(parts.map(p => p.part?.categoryName).filter(Boolean))];

  const filtered = parts.filter(p => {
    const condOk = filter === "all" || p.condition === filter;
    const catOk = catFilter === "all" || p.part?.categoryName === catFilter;
    return condOk && catOk;
  });

  return (
    <div className="screen screen-inner">
      <div className="page-title">Marketplace</div>
      <div className="page-sub">Autopeças no catálogo OEM</div>
      <div className="filter-section">
        <div className="filter-label">Condição</div>
        <div className="filter-bar">
          {[{ k: "all", l: "Todos" }, { k: "new", l: "Novos" }, { k: "used", l: "Usados" }].map(f => (
            <button key={f.k} className={`chip ${filter === f.k ? "active" : ""}`} onClick={() => setFilter(f.k)}>{f.l}</button>
          ))}
        </div>
      </div>
      {categories.length > 1 && (
        <div className="filter-section">
          <div className="filter-label">Categoria</div>
          <div className="filter-bar">
            {categories.map(c => (
              <button key={c} className={`chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>
                {c === "all" ? "Todas" : c}
              </button>
            ))}
          </div>
        </div>
      )}
      {loading ? (
        <div>
          {[1,2,3].map(i => (
            <div key={i} className="part-card" style={{pointerEvents:"none"}}>
              <div className="shimmer" style={{width:58,height:58,flexShrink:0}} />
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                <div className="shimmer" style={{height:14,width:"70%"}} />
                <div className="shimmer" style={{height:11,width:"45%"}} />
                <div className="shimmer" style={{height:20,width:"30%"}} />
              </div>
              <div className="shimmer" style={{width:60,height:24,alignSelf:"flex-start"}} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🛒</div><div className="empty-title">Nenhuma peça disponível</div></div>
      ) : filtered.map((item, i) => (
        <div key={item.id || i} className={`part-card anim-fade-up`} style={{animationDelay:`${i*0.06}s`}} onClick={() => onSelectPart(item)}>
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
  const imgs = data?.images?.length ? data.images : (data?.part?.images?.length ? data.part.images : []);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const sellerId = data?.sellerId || data?.seller?.uid;
    if (!sellerId) return;
    fetch(`${API}/reviews/seller/${sellerId}`)
      .then(r => r.json())
      .then(d => setReviews(d.data || []))
      .catch(() => {});
  }, [data?.sellerId]);

  const addToCart = () => {
    if (qty > maxQty) return show(`Estoque disponível: ${maxQty}`);
    onAddToCart({ ...data, quantity: qty });
    show("Adicionado ao carrinho! 🛒", "success");
  };

  return (
    <div className="screen screen-inner">
      {toastEl}
      <button className="back-btn" onClick={onBack}><Icons.Back /> Voltar</button>

      {imgs.length > 0 ? (
        <>
          <div className="detail-images">
            <img src={imgs[activeImg]} alt="" />
          </div>
          {imgs.length > 1 && (
            <div className="detail-thumbs">
              {imgs.map((img, i) => (
                <img key={i} src={img} className={"detail-thumb" + (activeImg === i ? " active" : "")} onClick={() => setActiveImg(i)} alt="" />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="detail-images">🔧</div>
      )}

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
            {data.seller.photo
              ? <img src={data.seller.photo} alt="" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover"}} />
              : <div className="seller-avatar">{(data.seller.name || "V")[0].toUpperCase()}</div>
            }
            <div style={{flex:1}}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{data.seller.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {data.seller.sellerVerified ? "✅ Vendedor verificado" : "⏳ Verificação pendente"}
              </div>
              {data.seller.ratingAvg > 0 && (
                <div className="seller-rating" style={{marginTop:4}}>
                  <Stars value={Math.round(data.seller.ratingAvg)} size="sm" />
                  <span className="rating-avg" style={{fontSize:14}}>{data.seller.ratingAvg.toFixed(1)}</span>
                  <span className="rating-count">({data.seller.ratingCount} avaliações)</span>
                </div>
              )}
            </div>
          </div>
          {reviews.length > 0 && (
            <div style={{marginTop:14}}>
              <div style={{fontSize:12,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:10}}>Avaliações</div>
              {reviews.slice(0,3).map((r, i) => (
                <div key={i} className="review-card">
                  <div className="review-header">
                    {r.buyerPhoto
                      ? <img src={r.buyerPhoto} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}} />
                      : <div className="review-avatar">{(r.buyerName||"U")[0]}</div>
                    }
                    <div>
                      <div className="review-name">{r.buyerName}</div>
                      <Stars value={r.rating} size="sm" />
                    </div>
                  </div>
                  {r.comment && <div className="review-comment">{r.comment}</div>}
                </div>
              ))}
            </div>
          )}
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
  const [addr, setAddr] = useState({ street: "", city: "", state: "", zipCode: "" });
  const addrFilled = addr.street && addr.city && addr.state && addr.zipCode;

  if (cart.length === 0) return (
    <div className="screen screen-inner">
      <div className="page-title">Carrinho</div>
      <div className="empty" style={{ paddingTop: 80 }}>
        <div className="empty-icon">🛒</div>
        <div className="empty-title">Carrinho vazio</div>
        <div className="empty-sub">Adicione peças para continuar</div>
      </div>
    </div>
  );

  return (
    <div className="screen screen-inner">
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

      {/* ── Endereço de entrega ── */}
      <div style={{ margin: "20px 0 8px", fontWeight: 600, fontSize: 15 }}>📦 Endereço de entrega</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          className="input"
          placeholder="Rua e número"
          value={addr.street}
          onChange={e => setAddr(a => ({ ...a, street: e.target.value }))}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
          <input
            className="input"
            placeholder="Cidade"
            value={addr.city}
            onChange={e => setAddr(a => ({ ...a, city: e.target.value }))}
          />
          <input
            className="input"
            placeholder="UF"
            maxLength={2}
            value={addr.state}
            onChange={e => setAddr(a => ({ ...a, state: e.target.value.toUpperCase() }))}
          />
        </div>
        <input
          className="input"
          placeholder="CEP (somente números)"
          maxLength={8}
          value={addr.zipCode}
          onChange={e => setAddr(a => ({ ...a, zipCode: e.target.value.replace(/\D/g, "") }))}
        />
      </div>

      <div className="cart-summary">
        <div className="cart-row"><span style={{ color: "var(--muted)" }}>Subtotal</span><span>{fmt(total)}</span></div>
        <div className="cart-row"><span style={{ color: "var(--muted)" }}>Frete</span><span style={{ color: "var(--muted)" }}>A combinar</span></div>
        <div className="divider" style={{ margin: "10px 0" }} />
        <div className="cart-row">
          <span style={{ fontWeight: 600 }}>Total</span>
          <span className="cart-total">{fmt(total)}</span>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 14, opacity: addrFilled ? 1 : 0.5 }}
          onClick={() => addrFilled && onCheckout(addr)}
          disabled={loading || !addrFilled}
          title={!addrFilled ? "Preencha o endereço de entrega" : ""}
        >
          {loading ? "Redirecionando para pagamento..." : <><Icons.Cart /> Pagar com Mercado Pago</>}
        </button>
        {!addrFilled && (
          <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            Preencha o endereço de entrega para continuar
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersScreen({ user }) {
  const isSeller = user?.type === "seller";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [detailOrder, setDetailOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // orderId em processamento
  const [show, toastEl] = useToast();

  // ── Cancelar pedido ──
  const handleCancel = async (order) => {
    if (!window.confirm("Cancelar este pedido?")) return;
    setActionLoading(order.id);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API}/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao cancelar pedido", "error");
      show("Pedido cancelado com sucesso", "success");
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o));
    } catch { show("Erro ao cancelar pedido", "error"); }
    finally { setActionLoading(null); }
  };

  // ── Tentar pagamento novamente ──
  const handleRetryPayment = async (order) => {
    setActionLoading(order.id);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API}/payment/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao processar pagamento", "error");
      if (data.data?.checkoutUrl) {
        window.open(data.data.checkoutUrl, "_blank");
      } else {
        show("Pedido enviado para pagamento!", "success");
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "pending" } : o));
      }
    } catch { show("Erro ao tentar pagamento", "error"); }
    finally { setActionLoading(null); }
  };

  const submitReview = async () => {
    if (!rating) return show("Selecione uma nota");
    setSubmitting(true);
    try {
      const token = await getAuthToken();
      const sellerId = reviewing.items?.[0]?.sellerId || reviewing.sellerId;
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sellerId, orderId: reviewing.id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao enviar avaliação");
      show("Avaliação enviada! ⭐", "success");
      setOrders(prev => prev.map(o => o.id === reviewing.id ? { ...o, reviewed: true } : o));
      setReviewing(null); setRating(0); setComment("");
    } catch { show("Erro ao enviar avaliação"); }
    finally { setSubmitting(false); }
  };

  const statusLabel = {
    pending:         "Pendente",
    awaiting_payment:"Aguard. Pagamento",
    confirmed:       "Confirmado",
    shipped:         "Enviado",
    delivered:       "Entregue",
    cancelled:       "Cancelado",
    payment_failed:  "Pagamento Falhou",
    refunded:        "Reembolsado",
  };
  const statusBadge = {
    pending:         "badge-pending",
    awaiting_payment:"badge-pending",
    confirmed:       "badge-confirmed",
    shipped:         "badge-shipped",
    delivered:       "badge-delivered",
    cancelled:       "badge-cancelled",
    payment_failed:  "badge-cancelled",
    refunded:        "badge-pending",
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getAuthToken();
        // Vendedor carrega suas vendas; comprador carrega suas compras
        const endpoint = isSeller ? `${API}/orders/seller` : `${API}/orders/my`;
        const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setOrders(data.data || []);
      } catch { setOrders([]); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="screen screen-inner">
      {toastEl}
      {reviewing && (
        <div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={() => setReviewing(null)}>
          <div style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"28px 24px",width:"100%",maxWidth:480}} onClick={e => e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:18,marginBottom:4}}>Avaliar compra</div>
            <div style={{fontSize:13,color:"var(--muted)",marginBottom:20}}>Pedido #{(reviewing.id||"").slice(-8).toUpperCase()}</div>
            <div style={{marginBottom:16}}>
              <div className="label" style={{marginBottom:8}}>Sua nota</div>
              <Stars value={rating} onChange={setRating} />
            </div>
            <div className="input-wrap">
              <label className="label">Comentário (opcional)</label>
              <textarea className="input" rows={3} placeholder="Como foi sua experiência?" value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <div className="btn-row" style={{marginTop:16}}>
              <button className="btn btn-secondary" onClick={() => setReviewing(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={submitReview} disabled={submitting || !rating}>{submitting ? "Enviando..." : "Enviar avaliação"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="page-title">{isSeller ? "Minhas Vendas" : "Meus Pedidos"}</div>
      <div className="page-sub">{isSeller ? "Pedidos com seus itens" : "Histórico de compras"}</div>
      {loading ? <div className="spinner" /> : orders.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <div className="empty-title">{isSeller ? "Nenhuma venda ainda" : "Nenhum pedido ainda"}</div>
          <div className="empty-sub">{isSeller ? "Seus pedidos de clientes aparecerão aqui" : "Seus pedidos aparecerão aqui"}</div>
        </div>
      ) : orders.map((order, i) => (
        <div key={order.id || i} className="order-card">
          {/* ── Cabeçalho ── */}
          <div className="order-header">
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Pedido #{(order.id || "").slice(-8).toUpperCase()}</div>
              <div className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("pt-BR") : "—"}</div>
              {isSeller && order.buyerName && (
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>👤 {order.buyerName}</div>
              )}
            </div>
            <span className={`badge ${statusBadge[order.status] || "badge-pending"}`}>{statusLabel[order.status] || order.status}</span>
          </div>

          {/* ── Itens ── */}
          {(isSeller ? (order.myItems || order.items || []) : (order.items || [])).map((item, j) => (
            <div key={j} className="order-item">
              <span>{item.name || "Peça"} × {item.quantity}</span>
              <span style={{ color: "var(--muted)" }}>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}

          {/* ── Total ── */}
          <div className="order-total-row">
            <span style={{ fontWeight: 600 }}>Total{isSeller ? " da venda" : ""}</span>
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, color: "var(--accent)" }}>
              {fmt(isSeller ? (order.myTotal ?? order.total) : order.total)}
            </span>
          </div>

          {/* ── Ações do comprador ── */}
          {!isSeller && (() => {
            const s = order.status;
            const busy = actionLoading === order.id;
            return (
              <div style={{marginTop:12,display:"flex",flexWrap:"wrap",gap:8}}>
                {/* Ver detalhes — sempre disponível */}
                <button
                  className="btn btn-secondary"
                  style={{fontSize:12,padding:"7px 13px",flex:"1 1 auto"}}
                  onClick={() => setDetailOrder(order)}
                >
                  📋 Ver detalhes
                </button>

                {/* Rastrear entrega — shipped ou delivered */}
                {(s === "shipped" || s === "delivered") && order.trackingCode && (
                  <button
                    className="btn btn-secondary"
                    style={{fontSize:12,padding:"7px 13px",flex:"1 1 auto"}}
                    onClick={() => window.open(`https://rastreamento.correios.com.br/app/index.php?objetos=${order.trackingCode}`, "_blank")}
                  >
                    🚚 Rastrear entrega
                  </button>
                )}

                {/* Tentar pagamento novamente — awaiting_payment ou payment_failed */}
                {(s === "awaiting_payment" || s === "payment_failed") && (
                  <button
                    className="btn btn-primary"
                    style={{fontSize:12,padding:"7px 13px",flex:"1 1 auto",opacity:busy?.5:1}}
                    disabled={busy}
                    onClick={() => handleRetryPayment(order)}
                  >
                    {busy ? "⏳ Processando..." : "💳 Pagar agora"}
                  </button>
                )}

                {/* Cancelar — apenas se pagamento pendente ou aguardando */}
                {(s === "awaiting_payment" || s === "pending") && (
                  <button
                    className="btn"
                    style={{fontSize:12,padding:"7px 13px",background:"transparent",border:"1px solid var(--danger)",color:"var(--danger)",borderRadius:"var(--radius-sm)",flex:"1 1 auto",opacity:busy?.5:1}}
                    disabled={busy}
                    onClick={() => handleCancel(order)}
                  >
                    {busy ? "⏳..." : "✕ Cancelar pedido"}
                  </button>
                )}

                {/* Avaliar compra — entregue e ainda não avaliado */}
                {s === "delivered" && !order.reviewed && (
                  <button className="btn btn-secondary" style={{fontSize:12,padding:"7px 13px",flex:"1 1 auto"}} onClick={() => setReviewing(order)}>
                    ⭐ Avaliar compra
                  </button>
                )}
                {s === "delivered" && order.reviewed && (
                  <div style={{fontSize:12,color:"var(--success)",fontWeight:600,padding:"7px 4px"}}>✅ Avaliação enviada</div>
                )}
              </div>
            );
          })()}
        </div>
      ))}

      {/* ── Modal detalhe do pedido ── */}
      {detailOrder && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={() => setDetailOrder(null)}>
          <div style={{background:"var(--bg2)",borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:480,maxHeight:"calc(85vh - 60px)",overflowY:"auto",paddingBottom:"calc(40px + env(safe-area-inset-bottom, 0px))"}} onClick={e => e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:17}}>Detalhes do Pedido</div>
              <button onClick={() => setDetailOrder(null)} style={{background:"var(--card2)",border:"none",borderRadius:8,color:"var(--text)",padding:"4px 10px",cursor:"pointer",fontSize:16}}>✕</button>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:"var(--muted)",fontSize:13}}>Nº do pedido</span>
              <span style={{fontWeight:600,fontSize:13}}>#{(detailOrder.id||"").slice(-8).toUpperCase()}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:"var(--muted)",fontSize:13}}>Data</span>
              <span style={{fontSize:13}}>{detailOrder.createdAt ? new Date(detailOrder.createdAt).toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"}) : "—"}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:"var(--muted)",fontSize:13}}>Status</span>
              <span className={`badge ${statusBadge[detailOrder.status] || "badge-pending"}`} style={{fontSize:11}}>{statusLabel[detailOrder.status] || detailOrder.status}</span>
            </div>
            {detailOrder.trackingCode && (
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{color:"var(--muted)",fontSize:13}}>Rastreio</span>
                <span style={{fontFamily:"monospace",fontSize:12,color:"var(--primary3)"}}>{detailOrder.trackingCode}</span>
              </div>
            )}
            {detailOrder.address && (
              <div style={{background:"var(--card)",borderRadius:10,padding:"10px 12px",marginTop:10,marginBottom:6}}>
                <div style={{fontSize:11,color:"var(--muted)",fontWeight:700,marginBottom:4}}>ENDEREÇO DE ENTREGA</div>
                <div style={{fontSize:13}}>{typeof detailOrder.address === "string" ? detailOrder.address : `${detailOrder.address.street||""}, ${detailOrder.address.city||""} - ${detailOrder.address.state||""}`}</div>
              </div>
            )}
            <div style={{marginTop:14}}>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:700,marginBottom:8}}>ITENS DO PEDIDO</div>
              {(detailOrder.items||[]).map((item,j) => (
                <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
                  <span style={{flex:1}}>{item.name||"Peça"} <span style={{color:"var(--muted)"}}>×{item.quantity}</span></span>
                  <span style={{fontWeight:600}}>{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontWeight:700,fontSize:15}}>
                <span>Total</span>
                <span style={{color:"var(--accent)"}}>{fmt(detailOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── SELL ─────────────────────────────────────────────────────────────────────
function SellScreen({ user, setScreen }) {
  const isSeller = user?.type === "seller";
  if (!isSeller) return null;
  return <SellDashboard user={user} setScreen={setScreen} />;
}

// ─── SELL ─────────────────────────────────────────────────────────────────────
function SellFormScreen({ user, setScreen }) {
  const [step, setStep] = useState(1);
  const [oem, setOem] = useState("");
  const [masterPart, setMasterPart] = useState(null);
  const [form, setForm] = useState({ price: "", stock: "", condition: "new", warrantyMonths: "0", description: "" });
  const [photos, setPhotos] = useState([]); // [{file, preview}]
  const [loading, setLoading] = useState(false);
  const [show, toastEl] = useToast();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const fileInputRef = useRef();

  const addPhoto = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - photos.length;
    const toAdd = files.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos(p => [...p, ...toAdd]);
    e.target.value = "";
  };

  const removePhoto = (idx) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
  };

  const [suggestions, setSuggestions] = useState([]);

  const searchOEM = async () => {
    if (!oem.trim()) return show("Digite o número OEM ou nome da peça");
    setLoading(true);
    setSuggestions([]);
    try {
      // Tenta busca por OEM exato primeiro
      const res = await fetch(`${API}/parts?oem=${encodeURIComponent(oem)}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.data || []);
      
      // Busca exata por OEM
      const exactOEM = arr.find(p => p.oemNumber?.toLowerCase() === oem.toLowerCase());
      if (exactOEM) { setMasterPart(exactOEM); setStep(2); return; }

      // Busca parcial por OEM ou nome
      const partial = arr.filter(p =>
        p.oemNumber?.toLowerCase().includes(oem.toLowerCase()) ||
        p.name?.toLowerCase().includes(oem.toLowerCase())
      );

      if (partial.length === 1) { setMasterPart(partial[0]); setStep(2); }
      else if (partial.length > 1) { setSuggestions(partial); }
      else show("Nenhuma peça encontrada. Tente outro termo.");
    } catch { show("Erro ao buscar catálogo"); }
    finally { setLoading(false); }
  };

  const submit = async () => {
    if (!form.price || !form.stock) return show("Preencha preço e estoque");
    setLoading(true);
    try {
      const token = await getAuthToken();
      // Usa FormData para enviar fotos junto com os dados
      const fd = new FormData();
      fd.append("oemNumber", masterPart.oemNumber);
      fd.append("name", masterPart.name);
      fd.append("brandId", masterPart.brandId || "");
      fd.append("categoryId", masterPart.categoryId || "");
      fd.append("description", form.description || masterPart.description || "");
      fd.append("sellerId", user.uid);
      fd.append("price", form.price);
      fd.append("stock", form.stock);
      fd.append("condition", form.condition);
      fd.append("warrantyMonths", form.warrantyMonths);
      photos.forEach(p => fd.append("images", p.file));

      const res = await fetch(`${API}/marketplaceParts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // sem Content-Type — FormData define sozinho
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao anunciar");
      show("Peça anunciada com sucesso! 🎉", "success");
      setStep(1); setOem(""); setMasterPart(null); setPhotos([]);
      setForm({ price: "", stock: "", condition: "new", warrantyMonths: "0", description: "" });
      setTimeout(() => setScreen?.("sell"), 1800);
    } catch { show("Erro ao anunciar peça"); }
    finally { setLoading(false); }
  };

  return (
    <div className="screen screen-inner">
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
          <div className="input-wrap">
            <label className="label">Número OEM ou nome da peça</label>
            <input className="input" placeholder="ex: NGK-BKR5EIX ou Vela de Ignição" value={oem} onChange={e => { setOem(e.target.value.toUpperCase()); setSuggestions([]); }} onKeyDown={e => e.key === "Enter" && searchOEM()} />
          </div>
          <button className="btn btn-primary" onClick={searchOEM} disabled={loading}>{loading ? "Buscando..." : "🔍 Buscar no Catálogo OEM"}</button>
          {suggestions.length > 0 && (
            <div style={{marginTop:12}}>
              <div className="filter-label" style={{marginBottom:8}}>Selecione a peça:</div>
              {suggestions.map((p, i) => (
                <div key={i} className="part-card" style={{marginBottom:8,cursor:"pointer"}} onClick={() => { setMasterPart(p); setStep(2); setSuggestions([]); }}>
                  <div className="part-icon">🔧</div>
                  <div className="part-info">
                    <div className="part-name">{p.name}</div>
                    <div className="part-oem">OEM: {p.oemNumber}</div>
                    {p.description && <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>{p.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div className="input-wrap">
            <label className="label">Fotos da peça <span style={{color:"var(--muted)",fontWeight:400}}>({photos.length}/4)</span></label>
            <div className="photo-upload-grid">
              {photos.map((p, i) => (
                <div key={i} className="photo-slot">
                  <img src={p.preview} alt="" />
                  <button className="remove-photo" onClick={() => removePhoto(i)}>×</button>
                </div>
              ))}
              {photos.length < 4 && (
                <div className="photo-slot" onClick={() => fileInputRef.current?.click()}>
                  <span className="photo-add-icon">📷</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={addPhoto} />
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
function ProfileScreen({ user, onLogout, onUpdateUser, setScreen, requirePremium }) {
  const [myParts, setMyParts] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photo, setPhoto] = useState(user?.photo || null);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const isSeller = user?.type === "seller";
  const isPremium = user?.plan === "premium";
  const initials = (user?.name || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const photoInputRef = useRef();
  const [show, toastEl] = useToast();

  // Clock - profile.js style
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("pt-BR"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Geolocation - profile.js style
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        localStorage.setItem("user_coords", JSON.stringify(coords));
      }, () => {}, { maximumAge: 30 * 60 * 1000, timeout: 8000 });
    }
  }, []);

  // Load profile from Firestore
  useEffect(() => {
    const load = async () => {
      await initFirebase();
      const snap = await firebaseFirestore.getDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name || "");
        setBio(d.bio || "");
        if (d.photo) setPhoto(d.photo);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isSeller) return;
    fetch(`${API}/marketplaceParts?sellerId=${user.uid}`).then(r => r.json()).then(d => setMyParts(d.data || [])).catch(() => {});
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) return show("Nome não pode estar vazio");
    setSavingProfile(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API}/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao salvar");
      onUpdateUser?.({ ...user, name: name.trim(), bio: bio.trim() });
      show("Perfil salvo! ✅", "success");
    } catch (e) {
      show(e.message || "Erro ao salvar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const token = await getAuthToken();
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`${API}/users/photo`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPhoto(data.data.photo);
      onUpdateUser?.({ ...user, photo: data.data.photo });
      show("Foto atualizada! 🎉", "success");
    } catch {
      try {
        const sRef = firebaseStorage.storageRef(firebaseStorage.instance, `profiles/${user.uid}`);
        await firebaseStorage.uploadBytes(sRef, file);
        const url = await firebaseStorage.getDownloadURL(sRef);
        setPhoto(url);
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", user.uid), { photo: url });
        onUpdateUser?.({ ...user, photo: url });
        show("Foto atualizada! 🎉", "success");
      } catch { show("Erro ao atualizar foto"); }
    } finally { setPhotoLoading(false); e.target.value = ""; }
  };

  const logout = async () => {
    await initFirebase();
    await firebaseAuth.signOut(firebaseAuth.instance);
    onLogout();
  };

  return (
    <div className="screen" style={{padding:"20px 18px 90px"}}>
      {toastEl}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, marginBottom: 22 }}>
        <div style={{position:"relative",cursor:"pointer",marginBottom:12}} onClick={() => photoInputRef.current?.click()}>
          {photo
            ? <img src={photo} alt="" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover"}} />
            : <div className="profile-avatar">{initials}</div>
          }
          <div className="avatar-edit-btn">{photoLoading ? "⏳" : "📷"}</div>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={uploadPhoto} />
        <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>{user?.email}</div>
        <span className={`badge ${isSeller ? "badge-seller" : "badge-new"}`}>{isSeller ? "Vendedor" : "Comprador"}</span>
        {isPremium
          ? <span style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:5,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:99,letterSpacing:.5}}>⭐ PREMIUM</span>
          : <button className="upgrade-chip" style={{marginTop:6}} onClick={() => setScreen("plans")}>⭐ Upgrade para Premium</button>
        }
      </div>

      {isSeller && (
        <div className="profile-stats">
          <div className="stat-box"><div className="stat-num">{myParts.length}</div><div className="stat-lbl">Anúncios</div></div>
          <div className="stat-box"><div className="stat-num">{myParts.reduce((s, p) => s + (p.stock || 0), 0)}</div><div className="stat-lbl">Em estoque</div></div>
          <div className="stat-box"><div className="stat-num">{myParts.filter(p => p.condition === "new").length}</div><div className="stat-lbl">Novas</div></div>
        </div>
      )}

      {/* Editar perfil - profile.html style */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 14 }}>Editar Perfil</div>
        <div className="input-wrap"><label className="label">Nome</label><input className="input" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="input-wrap"><label className="label">Bio</label><textarea className="input" style={{resize:"none"}} rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Fale um pouco sobre você..." /></div>
        <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? "Salvando..." : "Salvar Perfil"}</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>Dados da conta</div>
        {[["Email", user?.email], ["Tipo", isSeller ? "Vendedor" : "Comprador"], isSeller ? ["Verificação", user?.sellerVerified ? "✅ Verificado" : "⏳ Pendente"] : null].filter(Boolean).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
            <span style={{ color: "var(--muted)" }}>{k}</span><span>{v}</span>
          </div>
        ))}
        {time && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}><span style={{ color: "var(--muted)" }}>Hora local</span><span>{time}</span></div>}
        {location && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><span style={{ color: "var(--muted)" }}>Localização</span><span style={{fontFamily:"monospace",fontSize:11}}>{location}</span></div>}
      </div>

      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <button onClick={logout} style={{display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"1px solid rgba(239,68,68,.3)",borderRadius:8,padding:"6px 14px",fontSize:12,color:"var(--danger)",cursor:"pointer",fontWeight:500}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair da conta
        </button>
      </div>

      <div style={{height:8}} />
      <button className="dash-action-btn" onClick={() => setScreen("plans")} style={{marginBottom:0}}>
        <span style={{fontSize:20}}>⭐</span>
        <div style={{textAlign:"left"}}>
          <div style={{fontWeight:700,fontSize:14}}>{isPremium ? "Gerenciar Assinatura" : "Ver Planos Premium"}</div>
          <div style={{fontSize:12,color:"var(--muted)"}}>{isPremium ? "Você é Premium ✅" : "Desbloqueie recursos exclusivos"}</div>
        </div>
      </button>
      <button className="dash-action-btn" onClick={() => setScreen("support")} style={{marginTop:8}}>
        <span style={{fontSize:20}}>💬</span>
        <div style={{textAlign:"left"}}>
          <div style={{fontWeight:700,fontSize:14}}>Suporte</div>
          <div style={{fontSize:12,color:"var(--muted)"}}>Chat em tempo real</div>
        </div>
      </button>
    </div>
  );
}

// ─── PAYMENT RESULT SCREENS ──────────────────────────────────────────────────
function PaymentSuccessScreen({ setScreen, clearCart }) {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId") || sessionStorage.getItem("pendingOrderId");

  useEffect(() => {
    clearCart();
    sessionStorage.removeItem("pendingOrderId");
    // Limpa os params da URL sem recarregar
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <div className="page-title anim-fade-up" style={{ color: "var(--success)", marginBottom: 8 }}>Pagamento Aprovado!</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}>Seu pedido foi confirmado com sucesso.</div>
      {orderId && <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--muted)", background: "var(--card)", padding: "6px 14px", borderRadius: 99, marginBottom: 24 }}>Pedido #{orderId.slice(-8).toUpperCase()}</div>}
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 32, maxWidth: 280, lineHeight: 1.6 }}>
        O vendedor foi notificado e entrará em contato em breve.
      </div>
      <button className="btn btn-primary" style={{ maxWidth: 240 }} onClick={() => setScreen("orders")}>
        Ver Meus Pedidos
      </button>
      <button className="btn btn-secondary" style={{ maxWidth: 240, marginTop: 10 }} onClick={() => setScreen("home")}>
        Voltar ao Início
      </button>
    </div>
  );
}

function PaymentFailureScreen({ setScreen }) {
  useEffect(() => {
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>😕</div>
      <div className="page-title anim-fade-up" style={{ color: "var(--danger)", marginBottom: 8 }}>Pagamento Recusado</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32, maxWidth: 280, lineHeight: 1.6 }}>
        Não foi possível processar seu pagamento. Verifique os dados e tente novamente.
      </div>
      <button className="btn btn-primary" style={{ maxWidth: 240 }} onClick={() => setScreen("cart")}>
        Tentar Novamente
      </button>
      <button className="btn btn-secondary" style={{ maxWidth: 240, marginTop: 10 }} onClick={() => setScreen("home")}>
        Voltar ao Início
      </button>
    </div>
  );
}

function PaymentPendingScreen({ setScreen }) {
  useEffect(() => {
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>⏳</div>
      <div className="page-title anim-fade-up" style={{ color: "var(--warning)", marginBottom: 8 }}>Pagamento Pendente</div>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32, maxWidth: 280, lineHeight: 1.6 }}>
        Seu pagamento está sendo processado. Pode levar alguns minutos para ser confirmado.
      </div>
      <button className="btn btn-primary" style={{ maxWidth: 240 }} onClick={() => setScreen("orders")}>
        Ver Meus Pedidos
      </button>
      <button className="btn btn-secondary" style={{ maxWidth: 240, marginTop: 10 }} onClick={() => setScreen("home")}>
        Voltar ao Início
      </button>
    </div>
  );
}

// ─── SUPPORT (chat real Firebase - support.html + chat.js) ──────────────────
function SupportScreen({ user }) {
  const profile =
    user?.type === "dismantler" ? "dismantler" :
    user?.type === "seller"     ? "seller"     : "buyer";

  const profileColor = { buyer: "#2563eb", seller: "#16a34a", dismantler: "#9333ea" }[profile];
  const profileLabel = { buyer: "Assistente de Compras 🔍", seller: "Assistente de Vendas 🏪", dismantler: "Assistente de Desmanche 🔧" }[profile];
  const greeting = {
    buyer:      "Olá! Sou seu assistente de autopeças 👋\n\nPosso ajudar você a encontrar a peça certa pelo catálogo OEM.\n\nInforme a **placa do veículo** e me diga qual peça precisa!",
    seller:     "Olá, vendedor! Sou seu assistente de publicação 👋\n\nPosso validar códigos OEM e garantir que seus anúncios estejam corretos.\n\nMe informe o **código OEM** da peça!",
    dismantler: "Olá! Sou seu assistente de desmanche 👋\n\nPosso identificar seu veículo e gerar o catálogo completo de peças.\n\nInforme o **chassi (VIN)** do veículo!",
  }[profile];

  const [messages, setMessages] = useState([{ role: "assistant", text: greeting, id: "init" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function renderMsg(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2,-2)}</strong>;
      return p.split("\n").map((line,j,arr) => (
        <span key={`${i}-${j}`}>{line}{j < arr.length-1 && <br/>}</span>
      ));
    });
  }

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", text, id: Date.now() }];
    setMessages(updated);
    setLoading(true);
    try {
      const token = await getAuthToken();
      const history = updated.slice(1, -1).map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
      const res = await fetch(`${API}/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Erro");
      setMessages(prev => [...prev, { role: "assistant", text: data.data.reply, id: Date.now() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Desculpe, ocorreu um erro. Tente novamente.", id: Date.now(), error: true }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="screen" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 60px)",maxHeight:"calc(100vh - 60px)",overflow:"hidden"}}>
      {/* Header */}
      <div style={{background:profileColor,padding:"14px 18px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{flex:1}}>
          <div style={{color:"#fff",fontWeight:700,fontSize:15}}>{profileLabel}</div>
          <div style={{color:"rgba(255,255,255,.7)",fontSize:12}}>AutoStore · Online agora 🟢</div>
        </div>
      </div>

      {/* Mensagens */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 8px",display:"flex",flexDirection:"column",gap:10,background:"var(--bg2)"}}>
        {messages.map(msg => (
          <div key={msg.id} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
            <div style={{
              maxWidth:"82%",padding:"10px 13px",
              borderRadius: msg.role==="user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role==="user" ? profileColor : msg.error ? "rgba(239,68,68,.15)" : "var(--card)",
              color: msg.role==="user" ? "#fff" : msg.error ? "var(--danger)" : "var(--text)",
              fontSize:13.5,lineHeight:1.55,boxShadow:"0 1px 4px rgba(0,0,0,.15)",whiteSpace:"pre-wrap",wordBreak:"break-word",
            }}>
              {renderMsg(msg.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{padding:"10px 14px",borderRadius:"16px 16px 16px 4px",background:"var(--card)",display:"flex",gap:5,alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}>
              {[0,1,2].map(i => (
                <span key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--muted)",display:"inline-block",animation:`bounce 1.2s ease-in-out ${i*.2}s infinite`}} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{padding:"12px 14px",paddingBottom:"calc(12px + env(safe-area-inset-bottom, 0px))",borderTop:"1px solid var(--border)",display:"flex",gap:8,background:"var(--bg2)",flexShrink:0}}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Digite sua mensagem..."
          disabled={loading}
          style={{flex:1,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:10,padding:"10px 14px",fontSize:14,color:"var(--text)",outline:"none"}}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{background:loading||!input.trim()?"var(--card2)":profileColor,border:"none",borderRadius:10,width:44,height:44,cursor:loading||!input.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .15s"}}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={loading||!input.trim()?"#64748B":"#fff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ─── CENTRAL DE LOJAS ─────────────────────────────────────────────────────────
// Helper: Haversine distance in km between two lat/lng points
function haversineKm(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

// ─── CENTRAL DE LOJAS ─────────────────────────────────────────────────────────
function CentralLojasScreen({ setScreen, setSelectedStore, user, userCoords }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fav_stores") || "[]"); } catch { return []; }
  });

  // ── Filtros avançados ──
  const [filterSpec, setFilterSpec]           = useState("Todas");
  const [filterPlan, setFilterPlan]           = useState("all");       // all | premium | free
  const [filterMinRating, setFilterMinRating] = useState(0);           // 0-5
  const [filterSortBy, setFilterSortBy]       = useState("relevance"); // relevance | rating | parts | distance

  const specialties = ["Todas","Motor","Câmbio","Suspensão","Freios","Elétrica","Acessórios","Carroceria"];

  const activeFiltersCount = [
    filterSpec !== "Todas",
    filterPlan !== "all",
    filterMinRating > 0,
    filterSortBy !== "relevance",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterSpec("Todas"); setFilterPlan("all");
    setFilterMinRating(0); setFilterSortBy("relevance");
  };

  useEffect(() => {
    fetch(`${API}/marketplaceParts?limit=100`)
      .then(r => r.json())
      .then(d => {
        const parts = d.data || [];
        const storeMap = {};
        parts.forEach(p => {
          const sid = p.sellerId || p.seller?.uid;
          if (!sid) return;
          if (!storeMap[sid]) {
            storeMap[sid] = {
              id: sid,
              name: p.seller?.name || "Loja",
              photo: p.seller?.photo || null,
              plan: p.seller?.plan || "free",
              rating: p.seller?.ratingAvg || 0,
              ratingCount: p.seller?.ratingCount || 0,
              specialty: p.seller?.specialty || "Peças Automotivas",
              partsCount: 0,
              coords: p.seller?.coords || null,
            };
          }
          storeMap[sid].partsCount++;
        });

        const list = Object.values(storeMap);

        // Ordenação: premium próximo → premium longe → free próximo → free longe
        list.sort((a, b) => {
          const aPremium = a.plan === "premium" ? 1 : 0;
          const bPremium = b.plan === "premium" ? 1 : 0;
          if (aPremium !== bPremium) return bPremium - aPremium;
          if (userCoords) {
            const distA = haversineKm(userCoords, a.coords);
            const distB = haversineKm(userCoords, b.coords);
            if (distA !== distB) return distA - distB;
          }
          return b.rating - a.rating || b.ratingCount - a.ratingCount;
        });

        setStores(list);
      })
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, [userCoords]);

  const toggleFav = (id) => {
    const next = favorites.includes(id) ? favorites.filter(f=>f!==id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("fav_stores", JSON.stringify(next));
  };

  // ── Filtragem e ordenação ──
  let filtered = stores.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchSpec   = filterSpec === "Todas" || s.specialty?.includes(filterSpec);
    const matchPlan   = filterPlan === "all"   || s.plan === filterPlan;
    const matchRating = s.rating >= filterMinRating;
    return matchSearch && matchSpec && matchPlan && matchRating;
  });

  if (filterSortBy === "rating")    filtered = [...filtered].sort((a,b) => b.rating - a.rating);
  else if (filterSortBy === "parts") filtered = [...filtered].sort((a,b) => b.partsCount - a.partsCount);
  else if (filterSortBy === "distance" && userCoords) {
    filtered = [...filtered].sort((a,b) => haversineKm(userCoords, a.coords) - haversineKm(userCoords, b.coords));
  }

  return (
    <div className="screen screen-inner">
      <div className="page-title">Central de Lojas</div>
      <div className="page-sub" style={{marginBottom:14}}>Encontre a loja certa para seu veículo</div>

      {/* ── Barra de busca + botão filtros ── */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{position:"relative",flex:1}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none"}}>🔍</span>
          <input className="input" style={{paddingLeft:38}} placeholder="Buscar loja..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          style={{flexShrink:0,padding:"0 14px",background:activeFiltersCount>0?"var(--primary)":"var(--card2)",border:"1px solid var(--border2)",borderRadius:"var(--radius-sm)",color:"var(--text)",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,position:"relative"}}
        >
          🎛️ Filtros
          {activeFiltersCount > 0 && (
            <span style={{background:"#fff",color:"var(--primary)",borderRadius:"50%",width:18,height:18,fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{activeFiltersCount}</span>
          )}
        </button>
      </div>

      {/* ── Painel de filtros avançado ── */}
      {showFilters && (
        <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:"var(--radius)",padding:"16px",marginBottom:14,animation:"fadeUp .25s ease"}}>

          {/* Especialidade */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".7px",marginBottom:8}}>Especialidade</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {specialties.map(s => (
                <button key={s} onClick={() => setFilterSpec(s)}
                  style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid",
                    borderColor: filterSpec===s ? "var(--primary)" : "var(--border2)",
                    background:  filterSpec===s ? "var(--primary)" : "transparent",
                    color:       filterSpec===s ? "#fff" : "var(--text2)"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Plano */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".7px",marginBottom:8}}>Tipo de loja</div>
            <div style={{display:"flex",gap:6}}>
              {[["all","Todas"],["premium","⭐ Premium"],["free","Gratuitas"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterPlan(v)}
                  style={{padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid",
                    borderColor: filterPlan===v ? "var(--primary)" : "var(--border2)",
                    background:  filterPlan===v ? "var(--primary)" : "transparent",
                    color:       filterPlan===v ? "#fff" : "var(--text2)"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Avaliação mínima */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".7px",marginBottom:8}}>Avaliação mínima</div>
            <div style={{display:"flex",gap:6}}>
              {[[0,"Qualquer"],[3,"3★ ou mais"],[4,"4★ ou mais"],[5,"5★"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterMinRating(v)}
                  style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid",
                    borderColor: filterMinRating===v ? "var(--warning)" : "var(--border2)",
                    background:  filterMinRating===v ? "var(--warning)" : "transparent",
                    color:       filterMinRating===v ? "#000" : "var(--text2)"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenação */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".7px",marginBottom:8}}>Ordenar por</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {[["relevance","Relevância"],["rating","Melhor avaliado"],["parts","Mais peças"],["distance","Mais próximo"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilterSortBy(v)}
                  style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid",
                    borderColor: filterSortBy===v ? "var(--accent)" : "var(--border2)",
                    background:  filterSortBy===v ? "var(--accent)" : "transparent",
                    color:       filterSortBy===v ? "#fff" : "var(--text2)"}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Rodapé do painel */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid var(--border)"}}>
            <button onClick={clearFilters} style={{background:"transparent",border:"none",color:"var(--danger)",fontSize:13,fontWeight:600,cursor:"pointer"}}>
              🗑️ Limpar filtros
            </button>
            <button onClick={() => setShowFilters(false)} style={{background:"var(--primary)",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,padding:"7px 18px",cursor:"pointer"}}>
              Ver {filtered.length} loja{filtered.length!==1?"s":""}
            </button>
          </div>
        </div>
      )}

      {/* ── Chips de especialidade rápidos (quando filtros fechados) ── */}
      {!showFilters && (
        <div className="filter-bar" style={{marginBottom:12}}>
          {specialties.map(s => (
            <button key={s} className={`chip ${filterSpec===s?"active":""}`} onClick={() => setFilterSpec(s)}>{s}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div>{[1,2,3].map(i => (
          <div key={i} className="store-hub-card" style={{pointerEvents:"none",marginBottom:10}}>
            <div className="shimmer" style={{width:"100%",height:88}} />
            <div className="store-hub-body">
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                <div className="shimmer" style={{width:40,height:40,borderRadius:10}} />
                <div style={{flex:1}}><div className="shimmer" style={{height:14,width:"60%",marginBottom:6}} /><div className="shimmer" style={{height:11,width:"40%"}} /></div>
              </div>
              <div className="shimmer" style={{height:32,borderRadius:8}} />
            </div>
          </div>
        ))}</div>
      ) : filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🏪</div><div className="empty-title">Nenhuma loja encontrada</div></div>
      ) : filtered.map((store, i) => (
        <div key={store.id} className={`store-hub-card anim-fade-up delay-${Math.min(i+1,6)}`}>
          <div className="store-hub-banner" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1e3a5f,#0f172a)",fontSize:32}}>
            {store.photo ? <img src={store.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="" /> : "🏪"}
          </div>
          <div className="store-hub-body">
            <div className="store-hub-header">
              <div className="store-hub-avatar">{(store.name||"L")[0].toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div className="store-hub-name" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{store.name}</div>
                  {store.plan==="premium" && <span className="store-hub-premium">⭐ Premium</span>}
                </div>
                <div className="store-hub-spec">{store.specialty}</div>
              </div>
              <button className="fav-btn" onClick={e=>{e.stopPropagation();toggleFav(store.id)}} title="Favoritar loja">
                {favorites.includes(store.id) ? "❤️" : "🤍"}
              </button>
            </div>
            <div className="store-hub-stats">
              {store.ratingCount > 0 && (
                <span style={{display:"flex",alignItems:"center",gap:3}}>
                  <Stars value={Math.round(store.rating)} size="sm" />
                  <span style={{fontWeight:700,fontSize:12}}>{store.rating.toFixed(1)}</span>
                  <span style={{color:"var(--muted)",fontSize:11}}>({store.ratingCount})</span>
                </span>
              )}
              <span>📦 {store.partsCount} {store.partsCount===1?"peça":"peças"}</span>
            </div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={() => { setSelectedStore(store); setScreen("store_profile"); }}>
                Ver Loja
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedStore(store); setScreen("marketplace"); }}>
                Ver Peças
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── STORE PROFILE (buyer view) ───────────────────────────────────────────────
function StoreProfileScreen({ store, onBack, onSelectPart, user }) {
  const [parts, setParts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const isPremiumSeller = store?.plan === "premium";

  useEffect(() => {
    if (!store?.id) return;
    Promise.all([
      fetch(`${API}/marketplaceParts?sellerId=${store.id}`).then(r => r.json()),
      fetch(`${API}/reviews/seller/${store.id}`).then(r => r.json()),
    ]).then(([partsRes, reviewsRes]) => {
      setParts(partsRes.data || []);
      setReviews(reviewsRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [store?.id]);

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const avgRating = store?.rating || (reviews.length > 0 ? reviews.reduce((s,r)=>s+r.rating,0)/reviews.length : 0);
  const ratingCount = store?.ratingCount || reviews.length;

  return (
    <div className="screen store-profile-wrap">
      <div style={{position:"sticky",top:0,zIndex:100,background:"var(--bg2)",padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
        <button className="back-btn" onClick={onBack} style={{margin:0}}>
          <Icons.Back /> Lojas
        </button>
      </div>

      <div style={{height:160,background:"linear-gradient(135deg,#1e3a5f,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,overflow:"hidden"}}>
        {store?.photo ? <img src={store.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="" /> : "🏪"}
      </div>

      <div style={{padding:"0 18px 80px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginTop:14,marginBottom:8}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,marginBottom:2}}>{store?.name}</div>
            <div style={{fontSize:13,color:"var(--muted)"}}>{store?.specialty || "Peças Automotivas"}</div>
          </div>
          {isPremiumSeller && <span className="store-hub-premium" style={{marginTop:4}}>⭐ Premium</span>}
        </div>

        {ratingCount > 0 && (
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"12px 14px",background:"var(--card2)",borderRadius:"var(--radius-sm)"}}>
            <div style={{fontSize:30,fontWeight:800,color:"var(--accent)",lineHeight:1}}>{avgRating.toFixed(1)}</div>
            <div>
              <Stars value={Math.round(avgRating)} size="md" />
              <div style={{fontSize:12,color:"var(--muted)",marginTop:3}}>{ratingCount} {ratingCount===1?"avaliação":"avaliações"}</div>
            </div>
          </div>
        )}

        {isPremiumSeller && (
          <a href={`https://wa.me/?text=Olá, vi sua loja no AutoStore!`} target="_blank" rel="noreferrer"
            style={{display:"flex",alignItems:"center",gap:8,background:"#25d366",color:"#fff",padding:"10px 14px",borderRadius:"var(--radius-sm)",textDecoration:"none",fontWeight:700,fontSize:13,marginBottom:14}}>
            <span style={{fontSize:18}}>💬</span> Contato via WhatsApp
          </a>
        )}

        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10,marginTop:4}}>
          Peças disponíveis ({parts.length})
        </div>
        {loading ? <div className="spinner" /> : parts.length === 0 ? (
          <div className="empty"><div className="empty-icon">📦</div><div className="empty-title">Sem peças no momento</div></div>
        ) : parts.map((item, i) => (
          <div key={item.id} className={`part-card anim-fade-up delay-${Math.min(i+1,6)}`} onClick={() => onSelectPart(item)}>
            <div className="part-icon">
              {item.images?.[0] ? <img src={item.images[0]} alt="" style={{width:60,height:60,objectFit:"cover",borderRadius:"var(--radius-sm)"}} /> : "🔧"}
            </div>
            <div className="part-info">
              <div className="part-name">{item.part?.name || item.name}</div>
              <div className="part-oem">OEM: {item.part?.oemNumber || item.oemNumber}</div>
              <div className="part-meta">
                <span className={`badge badge-${item.condition==="new"?"new":"used"}`}>{item.condition==="new"?"Nova":"Usada"}</span>
                {item.warrantyMonths > 0 && <span style={{fontSize:11,color:"var(--muted)"}}>🛡️ {item.warrantyMonths}m</span>}
              </div>
            </div>
            <div className="part-price-col">
              <div className="part-price">{fmt(item.price)}</div>
              <div className="part-stock">{item.stock} un</div>
            </div>
          </div>
        ))}

        {reviews.length > 0 && (
          <div style={{marginTop:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>
              Avaliações dos compradores
            </div>
            {visibleReviews.map((r, i) => (
              <div key={r.id || i} className="review-card">
                <div className="review-header">
                  {r.buyerPhoto
                    ? <img src={r.buyerPhoto} alt="" style={{width:32,height:32,borderRadius:"50%",objectFit:"cover"}} />
                    : <div className="review-avatar">{(r.buyerName||"U")[0]}</div>
                  }
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div className="review-name">{r.buyerName}</div>
                      {r.createdAt && <div style={{fontSize:11,color:"var(--muted)"}}>{new Date(r.createdAt).toLocaleDateString("pt-BR")}</div>}
                    </div>
                    <Stars value={r.rating} size="sm" />
                  </div>
                </div>
                {r.comment && <div className="review-comment">{r.comment}</div>}
              </div>
            ))}
            {reviews.length > 3 && (
              <button className="btn btn-secondary btn-sm" style={{width:"100%",marginTop:8}} onClick={() => setShowAllReviews(v=>!v)}>
                {showAllReviews ? "Ver menos" : `Ver todas as ${reviews.length} avaliações`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function MinhaLojaScreen({ user, setScreen, onUpdateUser }) {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState(user?.name || "");
  const [specialty, setSpecialty] = useState(user?.specialty || "");
  const [storePhoto, setStorePhoto] = useState(user?.photo || null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [editingPart, setEditingPart] = useState(null); // part being edited
  const [editForm, setEditForm] = useState({});
  const [savingPart, setSavingPart] = useState(false);
  const [show, toastEl] = useToast();
  const photoInputRef = useRef();
  const isPremium = user?.plan === "premium" || user?.isPremium === true;
  const rating = user?.ratingAvg || 0;
  const ratingCount = user?.ratingCount || 0;

  const loadParts = () => {
    setLoading(true);
    fetch(`${API}/marketplaceParts?sellerId=${user?.uid}`)
      .then(r => r.json())
      .then(d => setParts(d.data || []))
      .catch(() => [])
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadParts(); }, []);

  // ── Salvar nome + especialidade ─────────────────────────────────────────────
  const saveStore = async () => {
    setSaving(true);
    try {
      const token = await getAuthToken();
      let coords;
      try { const c = localStorage.getItem("user_coords"); if (c) coords = JSON.parse(c); } catch {}
      const res = await fetch(`${API}/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: storeName, specialty, ...(coords ? { coords } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao salvar");
      onUpdateUser?.({ ...user, name: storeName, specialty });
      show("Loja atualizada! ✅", "success");
      setEditing(false);
    } catch (e) { show(e.message || "Erro ao salvar", "error"); }
    finally { setSaving(false); }
  };

  // ── Upload foto da loja via API ──────────────────────────────────────────────
  const uploadStorePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const token = await getAuthToken();
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch(`${API}/users/photo`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        const url = data.data.photo;
        setStorePhoto(url);
        onUpdateUser?.({ ...user, photo: url });
        show("Foto atualizada! ✅", "success");
      } else { show("Erro ao enviar foto", "error"); }
    } catch { show("Erro ao enviar foto", "error"); }
    finally { setPhotoUploading(false); }
  };

  // ── Editar peça (preço, estoque, status ativo) ───────────────────────────────
  const startEditPart = (item) => {
    setEditingPart(item.id);
    setEditForm({ price: item.price, stock: item.stock, active: item.active !== false });
  };

  const savePart = async () => {
    if (!editingPart) return;
    setSavingPart(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API}/marketplaceParts/${editingPart}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price: Number(editForm.price), stock: Number(editForm.stock), active: editForm.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao salvar");
      setParts(prev => prev.map(p => p.id === editingPart
        ? { ...p, price: Number(editForm.price), stock: Number(editForm.stock), active: editForm.active }
        : p
      ));
      show("Peça atualizada! ✅", "success");
      setEditingPart(null);
    } catch (e) { show(e.message || "Erro ao salvar peça", "error"); }
    finally { setSavingPart(false); }
  };

  const deletePart = async (partId) => {
    if (!window.confirm("Remover este anúncio?")) return;
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API}/marketplaceParts/${partId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: false }),
      });
      if (!res.ok) throw new Error("Erro ao remover");
      setParts(prev => prev.filter(p => p.id !== partId));
      show("Anúncio removido", "success");
    } catch (e) { show(e.message || "Erro ao remover", "error"); }
  };

  const shareLink = () => {
    const url = `${window.location.origin}?store=${user?.uid}`;
    if (navigator.share) {
      navigator.share({ title: storeName, text: "Confira minha loja no AutoStore!", url });
    } else {
      navigator.clipboard?.writeText(url);
      show("Link copiado! 📋", "success");
    }
  };

  const totalStock = parts.reduce((s, p) => s + (p.stock || 0), 0);
  const avgPrice = parts.length > 0 ? parts.reduce((s, p) => s + Number(p.price || 0), 0) / parts.length : 0;

  return (
    <div className="screen screen-inner">
      {toastEl}
      <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={uploadStorePhoto} />

      {/* ── BANNER + FOTO ── */}
      <div className="minha-loja-header">
        <div className="minha-loja-banner" style={{position:"relative",cursor:"pointer"}}
          onClick={() => photoInputRef.current?.click()}>
          {storePhoto
            ? <img src={storePhoto} alt="Foto da loja" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"var(--radius) var(--radius) 0 0"}} />
            : <span style={{fontSize:56}}>🏪</span>
          }
          <div style={{position:"absolute",bottom:8,right:10,background:"rgba(0,0,0,.55)",borderRadius:20,padding:"4px 10px",fontSize:11,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
            {photoUploading ? "⏳ Enviando..." : "📷 Alterar foto"}
          </div>
        </div>
        <div className="minha-loja-info">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div>
              <div className="minha-loja-name">{storeName || "Minha Loja"}</div>
              <div className="minha-loja-spec">{specialty || "Peças Automotivas"}</div>
            </div>
            {isPremium ? <span className="store-hub-premium">⭐ Premium</span> : (
              <button className="upgrade-chip" onClick={() => setScreen("plans")}>⭐ Upgrade</button>
            )}
          </div>
          {ratingCount > 0 && (
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <Stars value={Math.round(rating)} size="sm" />
              <span style={{fontWeight:700}}>{rating.toFixed(1)}</span>
              <span style={{color:"var(--muted)",fontSize:13}}>({ratingCount})</span>
            </div>
          )}
          <div className="minha-loja-stat-row">
            <div className="minha-loja-stat"><div className="minha-loja-stat-num">{parts.length}</div><div className="minha-loja-stat-lbl">Anúncios</div></div>
            <div className="minha-loja-stat"><div className="minha-loja-stat-num">{totalStock}</div><div className="minha-loja-stat-lbl">Em estoque</div></div>
            <div className="minha-loja-stat"><div className="minha-loja-stat-num">{fmt(avgPrice).replace("R$","").trim()}</div><div className="minha-loja-stat-lbl">Preço médio</div></div>
          </div>
        </div>
      </div>

      {/* ── BOTÕES DE AÇÃO ── */}
      <div className="btn-row" style={{marginBottom:14}}>
        <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={shareLink}>🔗 Compartilhar</button>
        <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={() => setEditing(!editing)}>{editing?"Cancelar":"✏️ Editar loja"}</button>
        <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={() => setScreen("sell_form")}>➕ Anunciar</button>
      </div>

      {/* ── FORMULÁRIO DE EDIÇÃO DA LOJA ── */}
      {editing && (
        <div className="card" style={{marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:12}}>Editar Loja</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"10px 12px",background:"var(--card2)",borderRadius:"var(--radius-sm)",cursor:"pointer"}}
            onClick={() => photoInputRef.current?.click()}>
            {storePhoto
              ? <img src={storePhoto} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover"}} alt="" />
              : <div style={{width:48,height:48,borderRadius:"50%",background:"var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏪</div>
            }
            <div>
              <div style={{fontWeight:600,fontSize:13}}>{photoUploading ? "Enviando..." : "Alterar foto da loja"}</div>
              <div style={{fontSize:11,color:"var(--muted)"}}>JPG ou PNG, até 5MB</div>
            </div>
            <span style={{marginLeft:"auto",fontSize:18,color:"var(--muted)"}}>›</span>
          </div>
          <div className="input-wrap"><label className="label">Nome da loja</label><input className="input" value={storeName} onChange={e=>setStoreName(e.target.value)} /></div>
          <div className="input-wrap"><label className="label">Especialidade</label>
            <select className="input" value={specialty} onChange={e=>setSpecialty(e.target.value)}>
              <option value="">Selecione</option>
              {["Motor","Suspensão","Freios","Elétrica","Câmbio","Carroceria","Acessórios","Multimarcas"].map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={saveStore} disabled={saving}>{saving?"Salvando...":"Salvar alterações"}</button>
        </div>
      )}

      {/* ── BANNER PREMIUM ── */}
      {!isPremium && (
        <div className="card" style={{borderColor:"rgba(245,158,11,.3)",background:"rgba(245,158,11,.06)",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:24}}>⭐</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,marginBottom:2}}>Upgrade para Premium</div>
              <div style={{fontSize:13,color:"var(--muted)"}}>Anúncios ilimitados, destaque no marketplace e widget WhatsApp</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",marginTop:12}} onClick={() => setScreen("plans")}>
            Ver Planos
          </button>
        </div>
      )}

      {/* ── PRECIFICAÇÃO PENDENTE (peças do desmanche) ── */}
      {(() => {
        const pending = parts.filter(p => p.pendingPrice && Number(p.price || 0) === 0);
        if (!pending.length) return null;
        return (
          <div style={{background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.35)",
            borderRadius:"var(--radius)",padding:"14px 16px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:18}}>⚠️</span>
              <div style={{fontWeight:700,fontSize:14,color:"#f59e0b"}}>
                {pending.length} peça{pending.length>1?"s":""} aguardando precificação
              </div>
            </div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.5}}>
              Peças do desmanche publicadas sem preço não aparecem para compradores. Defina o valor abaixo.
            </div>
            {pending.slice(0,3).map(p => (
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:13,flex:1,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {p.name}
                </span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="R$ preço"
                  style={{width:110,padding:"6px 10px",fontSize:13}}
                  onBlur={async e => {
                    const val = Number(e.target.value);
                    if (!val) return;
                    try {
                      await initFirebase();
                      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                      await updateDoc(doc(firebaseFirestore.instance, "marketplaceParts", p.id), {
                        price: val, pendingPrice: false,
                      });
                      setParts(prev => prev.map(x => x.id === p.id ? {...x, price: val, pendingPrice: false} : x));
                    } catch {}
                  }}
                />
              </div>
            ))}
            {pending.length > 3 && (
              <div style={{fontSize:12,color:"var(--muted)"}}>
                + {pending.length - 3} peças — role para baixo para precificar todas
              </div>
            )}
          </div>
        );
      })()}

      {/* ── LISTA DE PEÇAS ── */}
      <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:10}}>
        Minhas peças anunciadas
      </div>
      {loading ? <div className="spinner" /> : parts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📦</div>
          <div className="empty-title">Nenhuma peça anunciada</div>
          <div className="empty-sub">Clique em "Anunciar" para cadastrar sua primeira peça</div>
        </div>
      ) : parts.map((item, i) => (
        <div key={item.id} style={{marginBottom:10}}>
          <div className={`part-card anim-fade-up delay-${Math.min(i+1,6)}`}
            style={{cursor:"default",borderBottomLeftRadius: editingPart===item.id ? 0 : undefined, borderBottomRightRadius: editingPart===item.id ? 0 : undefined}}>
            <div className="part-icon">
              {item.images?.[0] ? <img src={item.images[0]} alt="" style={{width:60,height:60,objectFit:"cover",borderRadius:"var(--radius-sm)"}} /> : "🔧"}
            </div>
            <div className="part-info">
              <div className="part-name">{item.part?.name || item.name}</div>
              <div className="part-oem">OEM: {item.part?.oemNumber || item.oemNumber}</div>
              <div className="part-meta">
                <span className={`badge badge-${item.condition==="new"?"new":"used"}`}>{item.condition==="new"?"Nova":"Usada"}</span>
                <span style={{fontSize:11,color:"var(--muted)"}}>{item.stock} un</span>
                {item.moderationStatus === "pending" && <span style={{fontSize:10,background:"rgba(245,158,11,.15)",color:"#f59e0b",padding:"2px 6px",borderRadius:99}}>⏳ Em análise</span>}
                {item.active === false && <span style={{fontSize:10,background:"rgba(239,68,68,.12)",color:"#ef4444",padding:"2px 6px",borderRadius:99}}>❌ Inativo</span>}
                {item.pendingPrice && Number(item.price||0)===0 && <span style={{fontSize:10,background:"rgba(245,158,11,.15)",color:"#f59e0b",padding:"2px 6px",borderRadius:99}}>💰 Sem preço</span>}
              </div>
            </div>
            <div className="part-price-col">
              <div className="part-price">{fmt(item.price)}</div>
              <div style={{display:"flex",gap:4,marginTop:4}}>
                <button style={{fontSize:11,padding:"3px 8px",borderRadius:6,border:"1px solid var(--border)",background:"var(--card2)",cursor:"pointer",color:"var(--text)"}}
                  onClick={() => editingPart === item.id ? setEditingPart(null) : startEditPart(item)}>
                  {editingPart === item.id ? "✕" : "✏️"}
                </button>
                <button style={{fontSize:11,padding:"3px 8px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.08)",cursor:"pointer",color:"#ef4444"}}
                  onClick={() => deletePart(item.id)}>🗑️</button>
              </div>
            </div>
          </div>
          {/* ── EDIÇÃO INLINE DA PEÇA ── */}
          {editingPart === item.id && (
            <div style={{background:"var(--card2)",border:"1px solid var(--border)",borderTop:"none",borderRadius:"0 0 var(--radius) var(--radius)",padding:"12px 14px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:"1 1 80px"}}>
                <label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:4}}>Preço (R$)</label>
                <input className="input" style={{padding:"6px 10px",fontSize:13}} type="number" value={editForm.price} onChange={e=>setEditForm(f=>({...f,price:e.target.value}))} />
              </div>
              <div style={{flex:"1 1 70px"}}>
                <label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:4}}>Estoque</label>
                <input className="input" style={{padding:"6px 10px",fontSize:13}} type="number" value={editForm.stock} onChange={e=>setEditForm(f=>({...f,stock:e.target.value}))} />
              </div>
              <div style={{flex:"1 1 90px"}}>
                <label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:4}}>Status</label>
                <select className="input" style={{padding:"6px 10px",fontSize:13}} value={editForm.active ? "active" : "inactive"} onChange={e=>setEditForm(f=>({...f,active:e.target.value==="active"}))}>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <button className="btn btn-primary btn-sm" style={{height:36,alignSelf:"flex-end"}} onClick={savePart} disabled={savingPart}>
                {savingPart ? "..." : "Salvar"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── PLANS ────────────────────────────────────────────────────────────────────
function PlansScreen({ user, setScreen, onUpdateUser }) {
  const isSeller = user?.type === "seller";
  const isPremium = user?.plan === "premium";
  const [show, toastEl] = useToast();

  const buyerFree = ["Busca por placa ilimitada","Acesso ao marketplace","Carrinho e checkout","Histórico de pedidos","Avaliação de vendedores"];
  const buyerPremium = ["Tudo do plano Free","Alertas de preço e disponibilidade","Lojas favoritas","Ofertas exclusivas para Premium","Suporte prioritário","Histórico detalhado de compras"];
  const sellerFree = ["Até 20 peças ativas","Dashboard básico","Perfil de loja","Receber pedidos","Avaliações dos compradores"];
  const sellerPremium = ["Peças ilimitadas","Analytics avançado (visitas, conversão)","Destaque no topo do marketplace","Widget de WhatsApp no perfil","URL personalizada compartilhável","Badge de vendedor Premium","Suporte prioritário"];

  const freeFeatures = isSeller ? sellerFree : buyerFree;
  const premiumFeatures = isSeller ? sellerPremium : buyerPremium;

  const handleUpgrade = async () => {
    show("Redirecionando para pagamento... 🚀", "success");
    // Em produção: integrar com Mercado Pago Subscriptions
    setTimeout(async () => {
      try {
        const token = await getAuthToken();
        await fetch(`${API}/users/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ plan: "premium" }),
        });
        onUpdateUser?.({ ...user, plan: "premium" });
        show("Plano Premium ativado! ⭐", "success");
      } catch { show("Erro ao processar. Tente novamente."); }
    }, 1500);
  };

  return (
    <div className="screen screen-inner">
      {toastEl}
      <div className="page-title">Planos e Assinatura</div>
      <div className="page-sub">Escolha o melhor plano para você</div>

      {isPremium && (
        <div className="card" style={{borderColor:"rgba(245,158,11,.4)",background:"rgba(245,158,11,.07)",marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:6}}>⭐</div>
          <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>Você já é Premium!</div>
          <div style={{fontSize:13,color:"var(--muted)"}}>Aproveite todos os recursos exclusivos.</div>
        </div>
      )}

      <div className="plan-card" style={{marginBottom:12}}>
        <div className="plan-name">🆓 Plano Free</div>
        <div className="plan-price">R$ 0</div>
        <div className="plan-price-sub">sem mensalidade</div>
        {freeFeatures.map((f, i) => (
          <div key={i} className="plan-feature"><span className="plan-check">✓</span>{f}</div>
        ))}
        {!isPremium && <div style={{marginTop:14,padding:"10px 14px",background:"var(--card2)",borderRadius:"var(--radius-sm)",fontSize:13,color:"var(--muted)",textAlign:"center"}}>✅ Seu plano atual</div>}
      </div>

      <div className="plan-card featured" style={{marginBottom:20}}>
        <div className="plan-badge-top">Recomendado</div>
        <div className="plan-name" style={{color:"#f59e0b"}}>⭐ Plano Premium</div>
        <div className="plan-price">{isSeller ? "R$ 49" : "R$ 9"}</div>
        <div className="plan-price-sub">por mês · cancele quando quiser</div>
        {premiumFeatures.map((f, i) => (
          <div key={i} className="plan-feature"><span className="plan-check">✓</span>{f}</div>
        ))}
        {!isPremium ? (
          <button className="btn" style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",marginTop:16}} onClick={handleUpgrade}>
            ⭐ Assinar Premium
          </button>
        ) : (
          <div style={{marginTop:14,padding:"10px 14px",background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",borderRadius:"var(--radius-sm)",fontSize:13,color:"#f59e0b",textAlign:"center"}}>✅ Seu plano atual</div>
        )}
      </div>

      <div className="card" style={{textAlign:"center"}}>
        <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.7}}>
          💳 Pagamento seguro via Mercado Pago<br/>
          🔄 Cancele a qualquer momento<br/>
          🔒 Sem fidelidade nem multa
        </div>
      </div>
    </div>
  );
}

// ─── CHASSI / DESMANCHE ───────────────────────────────────────────────────────
function ChassiDesmancheScreen({ user, setScreen }) {
  const [step, setStep] = useState(1); // 1=input VIN, 2=catálogo, 3=preços, 4=sucesso
  const [vin, setVin] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState({}); // { subId: true }
  const [prices, setPrices] = useState({});      // { subId_oemRef: valor }
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState(null);
  const [show, toastEl] = useToast();

  const lookupVin = async () => {
    const clean = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    if (clean.length !== 17) return show("Chassi deve ter 17 caracteres alfanuméricos");
    setLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API}/chassi/${clean}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao consultar chassi");

      const veh = data.data || data;
      setVehicle(veh);

      // Busca catálogo de subcoleções
      const catRes = await fetch(`${API}/chassi/${clean}/catalog`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);

      let cat = [];
      if (catRes?.ok) {
        const catData = await catRes.json();
        cat = catData.data || [];
      }

      // Se não tiver endpoint catalog, usa estrutura padrão do backend
      if (!cat.length) {
        cat = [
          { id: "motor_cambio",      label: "Motor e Câmbio",       icon: "⚙️",  totalParts: 24 },
          { id: "suspensao_direcao", label: "Suspensão e Direção",   icon: "🔩",  totalParts: 20 },
          { id: "freios",            label: "Freios",                icon: "🛞",  totalParts: 12 },
          { id: "eletrica",          label: "Elétrica",              icon: "⚡",  totalParts: 18 },
          { id: "carroceria",        label: "Carroceria",            icon: "🚗",  totalParts: 22 },
          { id: "interiores",        label: "Interiores",            icon: "🪑",  totalParts: 15 },
          { id: "rodas_pneus",       label: "Rodas e Pneus",         icon: "⭕",  totalParts: 8  },
          { id: "ar_cond",           label: "Ar-Condicionado",       icon: "❄️",  totalParts: 6  },
        ];
      }
      setCatalog(cat);
      setStep(2);
    } catch (e) {
      show(e.message || "Erro ao consultar chassi");
    } finally {
      setLoading(false);
    }
  };

  const toggleSub = (id) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const selectedIds = Object.keys(selected).filter(k => selected[k]);

  const publish = async () => {
    if (!selectedIds.length) return show("Selecione ao menos uma categoria");
    setPublishing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API}/chassi/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vin: vehicle.vin || vehicle.chassis || vin.toUpperCase(),
          vehicleData: vehicle,
          selectedSubcollections: selectedIds,
          prices,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao publicar");
      setResult(data.data || data);
      setStep(4);
    } catch (e) {
      show(e.message || "Erro ao publicar lote");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="screen screen-inner">
      {toastEl}

      {/* Step 1 — Consulta VIN */}
      {step === 1 && (
        <>
          <div className="page-title">Desmanche por Chassi</div>
          <div className="page-sub">Publique todas as peças do veículo de uma vez</div>

          <div className="card" style={{borderColor:"rgba(59,130,246,.25)",background:"rgba(59,130,246,.05)",marginBottom:20}}>
            <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.7}}>
              🔍 Informe o chassi (VIN) de 17 dígitos do veículo.<br/>
              Identificamos o veículo e geramos o catálogo completo de peças para você selecionar o que tem disponível.
            </div>
          </div>

          <div className="input-wrap">
            <label className="label">Chassi (VIN) — 17 caracteres</label>
            <input
              className="input"
              style={{fontSize:18,fontWeight:700,letterSpacing:3,textTransform:"uppercase"}}
              placeholder="9BWZZZ377VT004251"
              maxLength={17}
              value={vin}
              onChange={e => setVin(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,""))}
              onKeyDown={e => e.key === "Enter" && lookupVin()}
            />
            <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>
              Encontre no parabrisa, porta do motorista ou documento do veículo
            </div>
          </div>

          <button className="btn btn-primary" onClick={lookupVin} disabled={loading || vin.length < 17}>
            {loading ? "Consultando..." : "🔍 Consultar Chassi"}
          </button>
        </>
      )}

      {/* Step 2 — Catálogo de subcoleções */}
      {step === 2 && vehicle && (
        <>
          <button className="back-btn" onClick={() => setStep(1)}>
            <Icons.Back /> Voltar
          </button>

          {/* Banner do veículo */}
          <div className="vehicle-banner" style={{marginBottom:16}}>
            <div className="veh-plate">{vehicle.vin || vehicle.chassis}</div>
            <div className="veh-name">{vehicle.brand} {vehicle.model} {vehicle.year}</div>
            <div className="veh-specs">
              {vehicle.engine && <span className="veh-spec">⚙️ {vehicle.engine}</span>}
              {vehicle.fuel   && <span className="veh-spec">⛽ {vehicle.fuel}</span>}
              {vehicle.color  && <span className="veh-spec">🎨 {vehicle.color}</span>}
              {vehicle.source === "local_decode" && (
                <span className="veh-spec" style={{color:"var(--warning)"}}>⚠️ Dados estimados</span>
              )}
            </div>
          </div>

          <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>Selecione as categorias disponíveis</div>
          <div style={{fontSize:13,color:"var(--muted)",marginBottom:14}}>
            Marque os sistemas que o veículo possui para publicar em lote
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            {catalog.map((sub) => {
              const isOn = selected[sub.id];
              return (
                <button
                  key={sub.id}
                  onClick={() => toggleSub(sub.id)}
                  style={{
                    background: isOn ? "rgba(59,130,246,.12)" : "var(--card)",
                    border: `2px solid ${isOn ? "var(--primary)" : "var(--border)"}`,
                    borderRadius: "var(--radius)",
                    padding: "14px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all .2s",
                  }}
                >
                  <div style={{fontSize:24,marginBottom:6}}>{sub.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:2}}>{sub.label}</div>
                  <div style={{fontSize:11,color:"var(--muted)"}}>{sub.totalParts} peças</div>
                  {isOn && (
                    <div style={{marginTop:6,fontSize:10,fontWeight:700,color:"var(--primary3)",
                      background:"rgba(59,130,246,.1)",padding:"2px 8px",borderRadius:99,display:"inline-block"}}>
                      ✓ Selecionado
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedIds.length > 0 && (
            <div style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",
              padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:"var(--muted)"}}>
                {selectedIds.length} categoria{selectedIds.length > 1 ? "s" : ""} selecionada{selectedIds.length > 1 ? "s" : ""}
              </span>
              <span style={{fontSize:13,fontWeight:700,color:"var(--primary3)"}}>
                {catalog.filter(s => selected[s.id]).reduce((t, s) => t + s.totalParts, 0)} peças
              </span>
            </div>
          )}

          <div className="btn-row">
            <button className="btn btn-secondary" onClick={() => {
              const all = {};
              catalog.forEach(s => { all[s.id] = true; });
              setSelected(all);
            }}>Selecionar tudo</button>
            <button
              className="btn btn-primary"
              disabled={!selectedIds.length}
              onClick={() => setStep(3)}
            >
              Definir preços →
            </button>
          </div>
        </>
      )}

      {/* Step 3 — Preços por categoria */}
      {step === 3 && (
        <>
          <button className="back-btn" onClick={() => setStep(2)}>
            <Icons.Back /> Categorias
          </button>
          <div className="page-title" style={{marginBottom:4}}>Precificação</div>
          <div style={{fontSize:13,color:"var(--muted)",marginBottom:16,lineHeight:1.6}}>
            Defina um preço médio por categoria. Você pode ajustar individualmente depois em Minha Loja.
            Deixe em zero para publicar e precificar depois.
          </div>

          {catalog.filter(s => selected[s.id]).map(sub => (
            <div key={sub.id} className="card" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <span style={{fontSize:22}}>{sub.icon}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{sub.label}</div>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{sub.totalParts} peças</div>
                </div>
              </div>
              <div className="input-wrap" style={{marginBottom:0}}>
                <label className="label">Preço médio (R$) — deixe 0 para definir depois</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0,00"
                  value={prices[`${sub.id}_default`] || ""}
                  onChange={e => {
                    const val = e.target.value;
                    // Aplica o preço para todas as peças da subcoleção
                    const newPrices = { ...prices };
                    sub.parts?.forEach(p => { newPrices[`${sub.id}_${p.oemRef}`] = val; });
                    newPrices[`${sub.id}_default`] = val;
                    setPrices(newPrices);
                  }}
                />
              </div>
            </div>
          ))}

          <div className="card" style={{borderColor:"rgba(245,158,11,.3)",background:"rgba(245,158,11,.06)",marginBottom:16}}>
            <div style={{fontSize:13,color:"var(--muted)",lineHeight:1.6}}>
              ⚠️ Peças com preço zero ficarão marcadas como "precificação pendente" e não aparecerão para compradores até você definir o valor em Minha Loja.
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={publish}
            disabled={publishing}
            style={{marginBottom:10}}
          >
            {publishing ? "Publicando lote..." : `🚀 Publicar ${selectedIds.length} categorias`}
          </button>
          <button className="btn btn-secondary" onClick={() => setStep(2)}>
            Voltar
          </button>
        </>
      )}

      {/* Step 4 — Sucesso */}
      {step === 4 && result && (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",paddingTop:40}}>
          <div style={{fontSize:72,marginBottom:16}}>🎉</div>
          <div className="page-title" style={{color:"var(--success)",marginBottom:8}}>Lote publicado!</div>
          <div style={{fontSize:14,color:"var(--muted)",marginBottom:8}}>
            {result.created || 0} peças cadastradas com sucesso
          </div>
          {result.errors?.length > 0 && (
            <div style={{fontSize:12,color:"var(--warning)",marginBottom:16}}>
              {result.errors.length} erro{result.errors.length > 1 ? "s" : ""} ao cadastrar algumas peças
            </div>
          )}
          <div style={{fontSize:13,color:"var(--muted)",maxWidth:280,lineHeight:1.6,marginBottom:32}}>
            Acesse Minha Loja para definir preços das peças pendentes e gerenciar seu estoque.
          </div>
          <button className="btn btn-primary" style={{maxWidth:240}} onClick={() => setScreen("minha_loja")}>
            Ver Minha Loja
          </button>
          <button className="btn btn-secondary" style={{maxWidth:240,marginTop:10}} onClick={() => {
            setStep(1); setVin(""); setVehicle(null); setSelected({}); setPrices({}); setResult(null);
          }}>
            Cadastrar outro veículo
          </button>
        </div>
      )}
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
  const [selectedStore, setSelectedStore] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(() => {
    try { const s = localStorage.getItem("user_coords"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [premiumGate, setPremiumGate] = useState(null); // { title, desc, features }
  const [show, toastEl] = useToast();

  // Inject styles
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Geolocalização silenciosa — salva no localStorage para uso na ordenação de lojas
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserCoords(coords);
      localStorage.setItem("user_coords", JSON.stringify(coords));
    }, () => {}, { maximumAge: 30 * 60 * 1000, timeout: 8000 });
  }, []);

  // Detectar retorno do Mercado Pago pela URL
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path.includes("/pagamento/sucesso") || params.get("collection_status") === "approved") {
      setScreen("payment_success");
    } else if (path.includes("/pagamento/falha") || params.get("collection_status") === "rejected") {
      setScreen("payment_failure");
    } else if (path.includes("/pagamento/pendente") || params.get("collection_status") === "pending") {
      setScreen("payment_pending");
    }
    // Detectar deep link de loja
    if (params.get("store")) {
      setSelectedStore({ id: params.get("store") });
      setScreen("store_profile");
    }
  }, []);

  // Firebase auth listener
  useEffect(() => {
    initFirebase().then(async () => {
      try {
        const result = await firebaseAuth.getRedirectResult(firebaseAuth.instance);
        if (result?.user) {
          const userRef = firebaseFirestore.doc(firebaseFirestore.instance, "users", result.user.uid);
          const snap = await firebaseFirestore.getDoc(userRef);
          if (!snap.exists()) {
            await firebaseFirestore.setDoc(userRef, {
              name: result.user.displayName || "Usuário Google",
              email: result.user.email,
              photo: result.user.photoURL || null,
              type: "buyer",
              plan: "free",
              sellerVerified: false,
              active: true,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch (_) {}

      firebaseAuth.onAuthStateChanged(firebaseAuth.instance, async fbUser => {
        if (fbUser) {
          const snap = await firebaseFirestore.getDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", fbUser.uid));
          const userData = { uid: fbUser.uid, email: fbUser.email, ...snap.data() };
          setUser(userData);
          const isAdmin = userData.type === "admin" || userData.isAdmin;
          if (isAdmin) {
            // Tenta garantir que o custom claim esteja setado (bootstrap automático)
            try {
              const token = await fbUser.getIdToken();
              const tokenResult = await fbUser.getIdTokenResult();
              if (!tokenResult.claims.isAdmin) {
                // Claim ainda não setado — chama bootstrap
                await fetch(`${API}/admin/bootstrap-claim`, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                });
                // Força refresh do token para pegar o novo claim
                await fbUser.getIdToken(true);
              }
            } catch (_) {}
            setScreen("admin_moderacao");
          }
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
  const clearCart = () => setCart([]);

  // Premium gate helper
  const requirePremium = (config, action) => {
    if (user?.plan === "premium") { action(); return; }
    setPremiumGate(config);
  };

  const checkout = async (shippingAddress) => {
    if (cart.length === 0) return;
    setCartLoading(true);
    try {
      const token = await getAuthToken();
      const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const items = cart.map(i => ({
        marketplacePartId: i.id,
        name: i.part?.name || i.name || "Peça",
        oemNumber: i.part?.oemNumber || i.oemNumber,
        sellerId: i.sellerId,
        price: Number(i.price),
        quantity: Number(i.quantity),
      }));
      const res = await fetch(`${API}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items, total, shippingAddress: shippingAddress || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao criar pagamento");
      sessionStorage.setItem("pendingOrderId", data.data.orderId);
      window.location.href = data.data.initPoint;
    } catch (e) {
      show(e.message || "Erro ao ir para pagamento");
    } finally { setCartLoading(false); }
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{styles}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:16 }}>
          <div style={{ width:40,height:40,background:"var(--primary)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{ color:"#fff",fontSize:22,fontWeight:800 }}>A</span>
          </div>
          <span style={{ fontSize:28,fontWeight:800,color:"#fff",letterSpacing:1 }}>AutoStore</span>
        </div>
        <div className="spinner" />
      </div>
    </div>
  );

  if (!user) return <AuthScreen onLogin={u => { setUser(u); setScreen(u.type === "admin" || u.isAdmin ? "admin_moderacao" : "home"); }} />;

  const isSeller = user?.type === "seller";
  const isPremium = user?.plan === "premium";
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Tela de detalhe de peça (sobrepõe tudo, sem nav) ──
  if (selectedPart) return (
    <div className="app">
      {toastEl}
      <div className="topbar">
        <div className="topbar-logo" style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,background:"var(--primary)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:16,fontWeight:800}}>A</span>
          </div>
          <span style={{fontSize:18,fontWeight:800,color:"var(--text)",letterSpacing:.5}}>AutoStore</span>
        </div>
        <button className="cart-btn" onClick={() => { setSelectedPart(null); setScreen("cart"); }}>
          <Icons.Cart />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>
      <PartDetailScreen
        part={selectedPart}
        onBack={() => setSelectedPart(null)}
        onAddToCart={(item) => { addToCart(item); show("Adicionado ao carrinho! 🛒", "success"); }}
      />
    </div>
  );

  // ── Tela de perfil de loja (sobrepõe tudo, sem nav) ──
  if (screen === "store_profile" && selectedStore) return (
    <div className="app">
      {toastEl}
      <StoreProfileScreen
        store={selectedStore}
        onBack={() => { setSelectedStore(null); setScreen("lojas"); }}
        onSelectPart={p => { setSelectedPart(p); }}
        user={user}
      />
    </div>
  );

  // ── Navegação principal ──
  const navItems = isSeller
    ? [
        { key: "home",       label: "Início",   icon: <Icons.Home /> },
        { key: "sell",       label: "Dashboard", icon: <Icons.Sell /> },
        { key: "minha_loja", label: "Minha Loja", icon: <Icons.Store /> },
        { key: "orders",     label: "Pedidos",   icon: <Icons.Orders /> },
        { key: "profile",    label: "Perfil",    icon: <Icons.User /> },
      ]
    : [
        { key: "home",       label: "Início",   icon: <Icons.Home /> },
        { key: "search",     label: "Buscar",   icon: <Icons.Search /> },
        { key: "lojas",      label: "Lojas",    icon: <Icons.Store /> },
        { key: "orders",     label: "Pedidos",  icon: <Icons.Orders /> },
        { key: "profile",    label: "Perfil",   icon: <Icons.User /> },
      ];

  const activeNavKey = () => {
    if (screen === "results") return "search";
    if (screen === "cart" || screen === "marketplace") return "lojas";
    if (screen === "sell_form" || screen === "chassi") return "sell";
    if (screen === "plans") return "profile";
    return screen;
  };

  return (
    <div className="app">
      {toastEl}

      {/* Premium Gate Modal */}
      {premiumGate && (
        <PremiumGate
          {...premiumGate}
          onClose={() => setPremiumGate(null)}
          onUpgrade={() => { setPremiumGate(null); setScreen("plans"); }}
        />
      )}

      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-logo" style={{display:"flex",alignItems:"center",gap:8}} onClick={() => setScreen("home")}>
          <div style={{width:30,height:30,background:"var(--primary)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:16,fontWeight:800}}>A</span>
          </div>
          <span style={{fontSize:18,fontWeight:800,color:"var(--text)",letterSpacing:.5}}>AutoStore</span>
          {isPremium && <span style={{fontSize:10,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",padding:"2px 7px",borderRadius:99,fontWeight:700,letterSpacing:.5}}>PREMIUM</span>}
        </div>
        <div className="topbar-right">
          {!isSeller && (
            <button className="cart-btn" onClick={() => setScreen("cart")} title="Carrinho">
              <Icons.Cart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
        </div>
      </div>

      {/* Screens */}
      {screen === "home" && <HomeScreen user={user} setScreen={setScreen} cartCount={cartCount} setSelectedStore={s => { setSelectedStore(s); setScreen("store_profile"); }} setSelectedPart={setSelectedPart} userCoords={userCoords} />}
      {screen === "search" && <SearchScreen onVehicleFound={d => { setVehicleData(d); setScreen("results"); }} />}
      {screen === "results" && vehicleData && <ResultsScreen vehicleData={vehicleData} onBack={() => setScreen("search")} onSelectPart={setSelectedPart} />}
      {screen === "marketplace" && <MarketplaceScreen onSelectPart={setSelectedPart} />}
      {screen === "lojas" && <CentralLojasScreen setScreen={setScreen} setSelectedStore={setSelectedStore} user={user} userCoords={userCoords} />}
      {screen === "cart" && <CartScreen cart={cart} onUpdateQty={updateQty} onRemove={removeFromCart} onCheckout={checkout} loading={cartLoading} />}
      {screen === "orders" && <OrdersScreen user={user} />}
      {screen === "sell" && isSeller && <SellScreen user={user} setScreen={setScreen} />}
      {screen === "sell_form" && isSeller && <SellFormScreen user={user} setScreen={setScreen} />}
      {screen === "chassi" && isSeller && <ChassiDesmancheScreen user={user} setScreen={setScreen} />}
      {screen === "minha_loja" && isSeller && <MinhaLojaScreen user={user} setScreen={setScreen} onUpdateUser={u => setUser(u)} />}
      {screen === "plans" && <PlansScreen user={user} setScreen={setScreen} onUpdateUser={u => setUser(u)} />}
      {screen === "support" && <SupportScreen user={user} />}
      {screen === "profile" && (
        <ProfileScreen
          user={user}
          onLogout={() => setUser(null)}
          onUpdateUser={setUser}
          setScreen={setScreen}
          requirePremium={requirePremium}
        />
      )}
      {screen === "payment_success" && <PaymentSuccessScreen setScreen={setScreen} clearCart={clearCart} />}
      {screen === "payment_failure" && <PaymentFailureScreen setScreen={setScreen} />}
      {screen === "payment_pending" && <PaymentPendingScreen setScreen={setScreen} />}
      {screen === "admin_moderacao" && (user?.isAdmin || user?.type === "admin") && (
        <AdminModeracaoScreen user={user} onBack={() => setScreen("home")} />
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${activeNavKey() === item.key ? "active" : ""}`}
            onClick={() => setScreen(item.key)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* ── Assistente IA flutuante ── */}
      <AgentChat user={user} />
    </div>
  );
}
