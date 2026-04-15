import { useState, useEffect, useRef } from "react";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAdQ5bcdZyFyQsn5-amZ0M7qkEx-w21rJI",
  authDomain: "autostore-830b4.firebaseapp.com",
  projectId: "autostore-830b4",
  storageBucket: "autostore-830b4.firebasestorage.app",
  messagingSenderId: "369837251334",
  appId: "1:369837251334:web:4fe82db7fea45ed0689c87",
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
  Chat: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
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
      await firebaseFirestore.setDoc(userRef, {
        name: cred.user.displayName || "Usuário Google",
        email: cred.user.email,
        photo: cred.user.photoURL || null,
        type: "buyer",
        sellerVerified: false,
        active: true,
        createdAt: new Date().toISOString(),
      });
      onLogin({ uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName, photo: cred.user.photoURL, type: "buyer" });
    } else {
      onLogin({ uid: cred.user.uid, email: cred.user.email, ...snap.data() });
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
        { name: form.name, email: form.email, type: form.type, sellerVerified: false, active: true, createdAt: new Date().toISOString() });
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
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ user, setScreen, cartCount }) {
  const isSeller = user?.type === "seller";
  const firstName = user?.name?.split(" ")[0] || "Usuário";

  const categories = [
    { icon: "🔧", label: "Motor" },
    { icon: "🛞", label: "Freios" },
    { icon: "💡", label: "Elétrica" },
    { icon: "❄️", label: "Arrefec." },
    { icon: "⛽", label: "Combustível" },
    { icon: "🔩", label: "Suspensão" },
  ];

  return (
    <div className="screen" style={{paddingBottom:90}}>
      {/* HERO */}
      <div className="hero">
        <img className="hero-img"
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=840&q=80&auto=format&fit=crop"
          alt="AutoStore" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"var(--accent)",animation:"pulseDot 2s ease-in-out infinite"}} />
            <span style={{fontSize:11,color:"rgba(255,255,255,.6)",letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:500}}>Marketplace Automotivo</span>
          </div>
          <div style={{fontSize:26,fontWeight:800,color:"#fff",lineHeight:1.15,marginBottom:8}}>
            Peças e acessórios<br/>automotivos<br/>
            <span style={{color:"var(--primary3)"}}>de qualidade</span>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.55)",marginBottom:16}}>
            Olá, {firstName} 👋 Encontre o que seu carro precisa.
          </div>
          <button className="btn btn-primary" style={{width:"auto",padding:"11px 22px",fontSize:14}}
            onClick={() => setScreen("search")}>
            Explorar Produtos →
          </button>
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{padding:"18px 18px 4px"}}>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
          {categories.map((cat, i) => (
            <button key={i} onClick={() => setScreen("marketplace")}
              style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,
                padding:"12px 14px",cursor:"pointer",transition:"all .2s",minWidth:72,color:"var(--text)"}}>
              <span style={{fontSize:20}}>{cat.icon}</span>
              <span style={{fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* QUICK SEARCH BANNER */}
      <div style={{padding:"14px 18px"}}>
        <button onClick={() => setScreen("search")}
          style={{width:"100%",background:"linear-gradient(135deg,var(--primary),var(--primary2))",
            border:"none",borderRadius:14,padding:"18px 20px",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"space-between",transition:"filter .2s"}}
          onMouseOver={e=>e.currentTarget.style.filter="brightness(1.1)"}
          onMouseOut={e=>e.currentTarget.style.filter=""}>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:3}}>Buscar pela placa</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>Encontre a peça certa para seu veículo</div>
          </div>
          <div style={{fontSize:28,color:"rgba(255,255,255,.9)"}}>→</div>
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{padding:"4px 18px 0"}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>Acesso Rápido</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <button className="super-card anim-fade-up delay-1" onClick={() => setScreen("marketplace")}>
            <div className="super-icon">🛒</div>
            <div className="super-title">Marketplace</div>
            <div className="super-sub">Comprar peças</div>
          </button>
          <button className="super-card anim-fade-up delay-2" onClick={() => setScreen("orders")}>
            <div className="super-icon">📦</div>
            <div className="super-title">Meus Pedidos</div>
            <div className="super-sub">Acompanhar</div>
          </button>
          {isSeller && (
            <button className="super-card anim-fade-up delay-3" onClick={() => setScreen("sell")}>
              <div className="super-icon">💰</div>
              <div className="super-title">Anunciar</div>
              <div className="super-sub">Vender pelo OEM</div>
            </button>
          )}
          <button className="super-card anim-fade-up delay-4" onClick={() => setScreen("support")}>
            <div className="super-icon">💬</div>
            <div className="super-title">Suporte</div>
            <div className="super-sub">Central de ajuda</div>
          </button>
        </div>
      </div>

      {/* FEATURED STORES */}
      <div style={{padding:"20px 18px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:700,color:"var(--text)"}}>Lojas em Destaque</div>
          <button onClick={() => setScreen("marketplace")}
            style={{fontSize:12,color:"var(--primary3)",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>
            Ver todas →
          </button>
        </div>
        {[
          {name:"AutoPeças Central",tag:"Peças OEM certificadas",img:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=70&auto=format&fit=crop"},
          {name:"Freios & Suspensão",tag:"Especialista em freios",img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70&auto=format&fit=crop"},
        ].map((store, i) => (
          <button key={i} onClick={() => setScreen("marketplace")}
            style={{width:"100%",background:"var(--card)",border:"1px solid var(--border)",
              borderRadius:14,overflow:"hidden",marginBottom:10,cursor:"pointer",
              display:"flex",alignItems:"stretch",transition:"border-color .2s",textAlign:"left"}}
            onMouseOver={e=>e.currentTarget.style.borderColor="var(--primary)"}
            onMouseOut={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <img src={store.img} alt={store.name}
              style={{width:100,height:80,objectFit:"cover",flexShrink:0}} />
            <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",justifyContent:"space-between",flex:1}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:3}}>{store.name}</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>{store.tag}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:11,background:"rgba(59,130,246,.12)",color:"var(--primary3)",
                  padding:"3px 10px",borderRadius:99,fontWeight:600}}>Ver Loja</span>
                <span style={{color:"var(--muted)",fontSize:16}}>›</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}


// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ user, setScreen, cartCount }) {
  const isSeller = user?.type === "seller";
  const firstName = user?.name?.split(" ")[0] || "Usuário";
  const [activeCat, setActiveCat] = useState(0);

  const categories = [
    { icon: "🔩", label: "Suspensão" },
    { icon: "🔊", label: "Som Automotivo" },
    { icon: "🪑", label: "Interior" },
    { icon: "🛞", label: "Roda e Pneu" },
    { icon: "🔧", label: "Motor" },
    { icon: "💡", label: "Elétrica" },
  ];

  const stores = [
    { name: "Auto Center Turbo", tag: "Freios e Suspensão", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop" },
    { name: "Oficina do Som", tag: "Som Automotivo", img: "https://images.unsplash.com/photo-1600669989861-40a4db65a88a?w=400&q=80&auto=format&fit=crop" },
    { name: "Prime Auto Parts", tag: "Peças OEM Originais", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80&auto=format&fit=crop" },
    { name: "CRS Suspensão", tag: "Amortecedores", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80&auto=format&fit=crop" },
  ];

  const popularProducts = [
    { name: "Disco de Freio", price: "R$ 189,90", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70&auto=format&fit=crop" },
    { name: "Kit Embreagem", price: "R$ 399,90", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=70&auto=format&fit=crop" },
    { name: "Amortecedor", price: "R$ 299,90", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&q=70&auto=format&fit=crop" },
    { name: "Filtro de Óleo", price: "R$ 49,90", img: "https://images.unsplash.com/photo-1600669989861-40a4db65a88a?w=300&q=70&auto=format&fit=crop" },
  ];

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
            onClick={() => setScreen("marketplace")}>
            Explorar Produtos
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

      {/* ── QUICK SEARCH BANNER ── */}
      <button className="quick-banner" onClick={() => setScreen("search")}>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:3}}>🔍 Buscar pela placa</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>Encontre a peça certa para seu carro</div>
        </div>
        <div style={{fontSize:24,color:"rgba(255,255,255,.9)",fontWeight:900}}>→</div>
      </button>

      {/* ── LOJAS EM DESTAQUE ── */}
      <div className="section-hdr">
        <span className="section-hdr-title">Lojas em Destaque</span>
        <button className="section-hdr-link" onClick={() => setScreen("marketplace")}>Ver todas →</button>
      </div>

      <div className="stores-grid">
        {stores.map((store, i) => (
          <div key={i} className={`store-card anim-fade-up delay-${i+1}`}
            onClick={() => setScreen("marketplace")}>
            <img src={store.img} alt={store.name} className="store-card-img" />
            <div className="store-card-body">
              <div className="store-card-name">{store.name}</div>
              <div className="store-card-btn">
                <button className="btn btn-primary btn-sm"
                  style={{padding:"6px 14px",fontSize:12,borderRadius:8}}>
                  Ver Loja
                </button>
                <span style={{color:"var(--muted)",fontSize:18}}>›</span>
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
        {popularProducts.map((prod, i) => (
          <div key={i} className={`product-mini anim-fade-up delay-${i+1}`}
            onClick={() => setScreen("marketplace")}>
            <img src={prod.img} alt={prod.name} className="product-mini-img" />
            <div className="product-mini-body">
              <div className="product-mini-name">{prod.name}</div>
              <div className="product-mini-price">{prod.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── AÇÕES RÁPIDAS (só vendedor) ── */}
      {isSeller && (
        <>
          <div className="section-hdr">
            <span className="section-hdr-title">Ações Rápidas</span>
          </div>
          <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:10}}>
            <button className="dash-action-btn primary" onClick={() => setScreen("sell")}>
              <span style={{fontSize:20}}>📦</span>
              <span style={{fontWeight:700,color:"#fff",fontSize:14}}>+ Novo Produto</span>
            </button>
            <button className="dash-action-btn" onClick={() => setScreen("sell")}>
              <span style={{fontSize:20}}>🏪</span>
              <span style={{fontWeight:600,color:"var(--text)",fontSize:14}}>Ver Minha Loja</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── SELL DASHBOARD ────────────────────────────────────────────────────────────
function SellDashboard({ user, setScreen }) {
  const firstName = user?.name?.split(" ")[0] || "Usuário";

  const metrics = [
    { icon: "💰", label: "Vendas Hoje", value: "R$ 1.250", sub: "+12% hoje", subColor: "var(--accent)", bg: "rgba(34,197,94,.12)" },
    { icon: "📦", label: "Pedidos Hoje", value: "18", sub: "8 pendentes", subColor: "var(--warning)", bg: "rgba(245,158,11,.12)" },
    { icon: "📈", label: "Crescimento", value: "+12,5%", sub: "↑ esta semana", subColor: "var(--accent)", bg: "rgba(34,197,94,.12)" },
    { icon: "%", label: "Conversão", value: "5,4%", sub: "↑ +0.8%", subColor: "var(--accent)", bg: "rgba(59,130,246,.12)" },
  ];

  const recentOrders = [
    { id: "#1024", client: "João Silva", status: "pending", value: "R$ 320,00" },
    { id: "#1023", client: "Ana Souza", status: "shipped", value: "R$ 150,00" },
    { id: "#1022", client: "Marco Lima", status: "delivered", value: "R$ 210,00" },
  ];

  const statusLabel = { pending: "Pendente", shipped: "Enviado", delivered: "Concluído", cancelled: "Cancelado" };
  const statusColor = {
    pending: { bg: "rgba(245,158,11,.15)", color: "#FCD34D" },
    shipped: { bg: "rgba(59,130,246,.15)", color: "#93C5FD" },
    delivered: { bg: "rgba(34,197,94,.15)", color: "#4ADE80" },
    cancelled: { bg: "rgba(239,68,68,.15)", color: "#FCA5A5" },
  };

  // Mini chart SVG
  const chartPoints = [20, 45, 35, 60, 80, 65, 90, 75, 95];
  const w = 300, h = 80, pad = 10;
  const maxV = Math.max(...chartPoints);
  const pts = chartPoints.map((v, i) => {
    const x = pad + (i / (chartPoints.length - 1)) * (w - 2 * pad);
    const y = h - pad - (v / maxV) * (h - 2 * pad);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`;

  return (
    <div className="screen" style={{paddingBottom:80}}>
      {/* Header */}
      <div style={{padding:"20px 16px 0"}}>
        <div style={{fontSize:24,fontWeight:800,color:"var(--text)",marginBottom:4}}>Visão Geral</div>
        <div style={{fontSize:14,color:"var(--muted)",marginBottom:20}}>
          Bem-vindo de volta, <span style={{color:"var(--primary3)",fontWeight:700}}>{firstName}</span>!
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px 16px"}}>
        {metrics.map((m, i) => (
          <div key={i} className={`dash-metric anim-fade-up delay-${i+1}`}>
            <div className="dash-metric-icon" style={{background:m.bg}}>
              <span style={{fontSize:16}}>{m.icon}</span>
            </div>
            <div className="dash-metric-label">{m.label}</div>
            <div className="dash-metric-value" style={{fontSize:20}}>{m.value}</div>
            <div className="dash-metric-sub" style={{color:m.subColor}}>
              <span>{m.sub}</span>
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
              return <circle key={i} cx={x} cy={y} r="3.5" fill="#3B82F6" stroke="#0F172A" strokeWidth="2"/>;
            })}
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
            {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d,i) => (
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
            return (
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",
                padding:"14px",borderBottom: i < recentOrders.length-1 ? "1px solid var(--border)" : "none",
                alignItems:"center"}}>
                <span style={{fontWeight:700,color:"var(--text)",fontSize:14}}>{order.id}</span>
                <span style={{fontSize:14,color:"var(--text2)"}}>{order.client}</span>
                <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:99,
                  background:sc.bg,color:sc.color,display:"inline-block",width:"fit-content"}}>
                  {statusLabel[order.status]}
                </span>
                <span style={{fontSize:13,fontWeight:700,color:"var(--text)",textAlign:"right"}}>{order.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{padding:"16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:12}}>Ações Rápidas</div>
        <button className="dash-action-btn primary" onClick={() => setScreen("sell")}>
          <span style={{fontSize:20}}>📦</span>
          <span style={{fontWeight:700,color:"#fff",fontSize:14}}>+ Novo Produto</span>
        </button>
        <button className="dash-action-btn" onClick={() => setScreen("marketplace")}>
          <span style={{fontSize:20}}>🏪</span>
          <span style={{fontWeight:600,color:"var(--text)",fontSize:14}}>Ver Minha Loja</span>
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

      <div className="cart-summary">
        <div className="cart-row"><span style={{ color: "var(--muted)" }}>Subtotal</span><span>{fmt(total)}</span></div>
        <div className="cart-row"><span style={{ color: "var(--muted)" }}>Frete</span><span style={{ color: "var(--muted)" }}>A combinar</span></div>
        <div className="divider" style={{ margin: "10px 0" }} />
        <div className="cart-row">
          <span style={{ fontWeight: 600 }}>Total</span>
          <span className="cart-total">{fmt(total)}</span>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={onCheckout} disabled={loading}>
          {loading ? "Redirecionando para pagamento..." : <><Icons.Cart /> Pagar com Mercado Pago</>}
        </button>
      </div>
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersScreen({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null); // pedido sendo avaliado
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show, toastEl] = useToast();

  const submitReview = async () => {
    if (!rating) return show("Selecione uma nota");
    setSubmitting(true);
    try {
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
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
    <div className="screen screen-inner">
      {toastEl}
      {reviewing && (
        <div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={() => setReviewing(null)}>
          <div style={{background:"var(--dark)",borderRadius:"20px 20px 0 0",padding:"28px 24px",width:"100%",maxWidth:480}} onClick={e => e.stopPropagation()}>
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
            <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, color: "var(--accent)" }}>{fmt(order.total)}</span>
          </div>
          {order.status === "delivered" && !order.reviewed && (
            <button className="btn btn-secondary" style={{marginTop:10,fontSize:13}} onClick={() => setReviewing(order)}>
              ⭐ Avaliar compra
            </button>
          )}
          {order.reviewed && (
            <div style={{marginTop:10,fontSize:12,color:"var(--success)"}}>✅ Avaliação enviada</div>
          )}
        </div>
      ))}
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
function SellFormScreen({ user }) {
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
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
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
function ProfileScreen({ user, onLogout, onUpdateUser }) {
  const [myParts, setMyParts] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photo, setPhoto] = useState(user?.photo || null);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const isSeller = user?.type === "seller";
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
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      });
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
    setSavingProfile(true);
    try {
      await initFirebase();
      await firebaseFirestore.setDoc(
        firebaseFirestore.doc(firebaseFirestore.instance, "users", user.uid),
        { name, bio },
        { merge: true }
      );
      onUpdateUser?.({ ...user, name, bio });
      show("Perfil salvo! ✅", "success");
    } catch { show("Erro ao salvar perfil"); }
    finally { setSavingProfile(false); }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
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

      <button className="btn btn-danger" onClick={logout}><Icons.Logout /> Sair da conta</button>
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
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let unsubscribe;
    const load = async () => {
      await initFirebase();
      const ref = firebaseDatabase.dbRef(firebaseDatabase.instance, "chat/global");
      unsubscribe = firebaseDatabase.onValue(ref, (snapshot) => {
        const list = [];
        snapshot.forEach(child => list.push({ id: child.key, ...child.val() }));
        setMessages(list);
        setTimeout(() => {
          if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }, 50);
      });
    };
    load();
    return () => unsubscribe?.();
  }, []);

  const sendMessage = async () => {
    if (!msg.trim()) return;
    await initFirebase();
    const ref = firebaseDatabase.dbRef(firebaseDatabase.instance, "chat/global");
    await firebaseDatabase.push(ref, { user: user?.email || "Anônimo", text: msg.trim(), time: Date.now() });
    setMsg("");
    inputRef.current?.focus();
  };

  return (
    <div className="screen" style={{padding:"20px 18px 90px"}}>
      <div className="page-title">Suporte AutoStore</div>
      <div className="page-sub">Canal de atendimento em tempo real</div>
      <div ref={chatBoxRef} className="chat-box">
        {messages.length === 0 && (
          <div style={{textAlign:"center",color:"var(--muted)",fontSize:13,margin:"auto"}}>
            Nenhuma mensagem ainda. Diga olá! 👋
          </div>
        )}
        {messages.map((m) => {
          const isMine = m.user === user?.email;
          const time = new Date(m.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:isMine?"flex-end":"flex-start"}}>
              <div className={`chat-msg ${isMine ? "chat-msg-mine" : "chat-msg-other"}`}>
                {!isMine && <div className="chat-msg-user">{m.user}</div>}
                {m.text}
                <div className="chat-msg-time">{time}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-input-row">
        <input ref={inputRef} className="input" placeholder="Digite sua mensagem..." value={msg}
          onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
        <button className="chat-send-btn" onClick={sendMessage}>➤</button>
      </div>
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
  }, []);

  // Firebase auth listener
  useEffect(() => {
    initFirebase().then(async () => {
      // Verificar se voltou de um redirect do Google
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
  const clearCart = () => setCart([]);

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
        price: Number(i.price),
        quantity: Number(i.quantity),
      }));
      const res = await fetch(`${API}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items, total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao criar pagamento");
      // Salva carrinho para limpar após retorno do MP
      sessionStorage.setItem("pendingOrderId", data.data.orderId);
      // Redireciona para o Checkout Pro do Mercado Pago
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

  if (!user) return <AuthScreen onLogin={u => { setUser(u); setScreen("home"); }} />;

  const isSeller = user?.type === "seller";
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const navItems = [
    { key: "home", label: "Início", icon: <Icons.Home /> },
    { key: "search", label: "Buscar", icon: <Icons.Search /> },
    { key: "marketplace", label: "Loja", icon: <Icons.Shop /> },
    { key: "orders", label: "Pedidos", icon: <Icons.Orders /> },
    ...(isSeller ? [{ key: "sell", label: "Vender", icon: <Icons.Sell /> }, { key: "profile", label: "Perfil", icon: <Icons.User /> }] : [{ key: "profile", label: "Perfil", icon: <Icons.User /> }]),
  ];

  // Se há peça selecionada, mostra detalhe
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
        onAddToCart={(item) => { addToCart(item); }}
      />
    </div>
  );

  return (
    <div className="app">
      {toastEl}
      <div className="topbar">
        <div className="topbar-logo" style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,background:"var(--primary)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:16,fontWeight:800}}>A</span>
          </div>
          <span style={{fontSize:18,fontWeight:800,color:"var(--text)",letterSpacing:.5}}>AutoStore</span>
        </div>
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
      {screen === "sell" && isSeller && <SellScreen user={user} setScreen={setScreen} />}
      {screen === "support" && <SupportScreen user={user} />}
      {screen === "profile" && <ProfileScreen user={user} onLogout={() => setUser(null)} onUpdateUser={setUser} />}
      {screen === "payment_success" && <PaymentSuccessScreen setScreen={setScreen} clearCart={clearCart} />}
      {screen === "payment_failure" && <PaymentFailureScreen setScreen={setScreen} />}
      {screen === "payment_pending" && <PaymentPendingScreen setScreen={setScreen} />}

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
