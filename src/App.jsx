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
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --black:#0a0a0a;--dark:#111111;--card:#1a1a1a;--card2:#212121;
    --border:#2a2a2a;--border2:#333333;
    --orange:#FF6B00;--orange2:#e55e00;--orange3:#ff8c33;
    --white:#F5F5F5;--white2:#cccccc;
    --text:#F5F5F5;--muted:#888888;--muted2:#aaaaaa;
    --success:#22c55e;--danger:#ef4444;--warning:#f59e0b;
    --radius:12px;--radius-sm:7px;
  }
  html,body,#root{min-height:100vh;background:var(--black);color:var(--text);font-family:'Barlow',sans-serif;font-size:15px}
  .app{display:flex;flex-direction:column;min-height:100vh;max-width:480px;margin:0 auto;background:var(--dark);position:relative}
  .screen{flex:1;overflow-y:auto}
  .screen-inner{padding:20px 18px 90px}

  /* ── KEYFRAMES ── */
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes heroZoom{from{transform:scale(1.08)}to{transform:scale(1)}}
  @keyframes pulseDot{0%,100%{transform:scale(1);box-shadow:0 0 0 0 #FF6B0066}50%{transform:scale(1.3);box-shadow:0 0 0 6px #FF6B0000}}
  @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 #FF6B0040}50%{box-shadow:0 0 18px 4px #FF6B0040}}

  .anim-fade-in{animation:fadeIn .5s ease both}
  .anim-fade-up{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) both}
  .delay-1{animation-delay:.08s}.delay-2{animation-delay:.16s}.delay-3{animation-delay:.24s}
  .delay-4{animation-delay:.32s}.delay-5{animation-delay:.40s}.delay-6{animation-delay:.48s}

  /* ── SHIMMER SKELETON ── */
  .shimmer{background:linear-gradient(90deg,var(--card) 25%,var(--card2) 50%,var(--card) 75%);background-size:400px 100%;animation:shimmer 1.4s infinite;border-radius:var(--radius-sm)}

  /* ── TOPBAR ── */
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 18px 12px;background:var(--dark);position:sticky;top:0;z-index:10;border-bottom:1px solid var(--border)}
  .topbar-logo{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:800;letter-spacing:3px;color:var(--orange);text-transform:uppercase}
  .topbar-right{display:flex;align-items:center;gap:10px}
  .cart-btn{position:relative;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 12px;cursor:pointer;display:flex;align-items:center;gap:5px;color:var(--text);font-size:13px;font-family:'Barlow',sans-serif;transition:border-color .2s,background .2s}
  .cart-btn:hover{border-color:var(--orange);background:var(--card2)}
  .cart-badge{position:absolute;top:-6px;right:-6px;background:var(--orange);color:#000;font-size:10px;font-weight:700;border-radius:99px;min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;padding:0 4px}

  /* ── BOTTOM NAV ── */
  .bottom-nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:var(--card);border-top:1px solid var(--border);display:flex;z-index:20}
  .nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 0 8px;cursor:pointer;border:none;background:none;color:var(--muted);font-size:11px;font-family:'Barlow',sans-serif;gap:4px;transition:color .2s}
  .nav-item.active{color:var(--orange)}
  .nav-item svg{width:20px;height:20px}

  /* ── HERO ── */
  .hero{position:relative;height:240px;overflow:hidden}
  .hero-img{width:100%;height:100%;object-fit:cover;display:block;animation:heroZoom 8s ease-out forwards}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,10,10,.25) 0%,rgba(10,10,10,.88) 100%)}
  .hero-content{position:absolute;bottom:0;left:0;right:0;padding:22px 20px 26px}
  .brand-mark{display:flex;align-items:center;gap:9px;margin-bottom:5px}
  .brand-dot{width:9px;height:9px;border-radius:50%;background:var(--orange);animation:pulseDot 2.2s ease-in-out infinite}
  .brand-name{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:800;letter-spacing:4px;color:var(--white);text-transform:uppercase}
  .brand-name span{color:var(--orange)}
  .hero-tagline{font-size:12px;color:rgba(245,245,245,.55);letter-spacing:1.5px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;font-weight:500}

  /* ── PROMO STRIP ── */
  .promo-strip{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(90deg,var(--orange),var(--orange2));padding:15px 18px;color:#000;cursor:pointer;border:none;width:100%;font-family:'Barlow',sans-serif;text-align:left;transition:filter .2s}
  .promo-strip:hover{filter:brightness(1.08)}
  .promo-strip-text{font-weight:700;font-size:15px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.5px;text-transform:uppercase}
  .promo-strip-sub{font-size:12px;opacity:.75;margin-top:2px}
  .promo-strip-arrow{font-size:24px;font-weight:900}

  /* ── SECTION LABELS ── */
  .section-label{font-size:10px;font-weight:700;color:var(--orange);text-transform:uppercase;letter-spacing:2px;padding:20px 18px 0;font-family:'Barlow Condensed',sans-serif}
  .section-title{font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:800;letter-spacing:1px;padding:2px 18px 14px;color:var(--white);text-transform:uppercase}

  /* ── SUPER GRID ── */
  .super-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 18px 18px}
  .super-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px 14px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;cursor:pointer;transition:border-color .25s,transform .2s,box-shadow .25s;color:var(--text);position:relative;overflow:hidden}
  .super-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#FF6B0010 0%,transparent 60%);opacity:0;transition:opacity .25s}
  .super-card:hover{border-color:var(--orange);transform:translateY(-3px);box-shadow:0 8px 24px rgba(255,107,0,.12)}
  .super-card:hover::after{opacity:1}
  .super-icon{font-size:26px}
  .super-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:15px;letter-spacing:.3px;text-transform:uppercase}
  .super-sub{font-size:11px;color:var(--muted);display:flex;align-items:center;gap:4px}

  /* ── TYPOGRAPHY ── */
  .page-title{font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:800;letter-spacing:1px;margin-bottom:2px;text-transform:uppercase}
  .page-sub{font-size:13px;color:var(--muted);margin-bottom:22px}

  /* ── INPUTS ── */
  .input-wrap{display:flex;flex-direction:column;gap:5px;margin-bottom:14px}
  .label{font-size:10px;font-weight:700;color:var(--orange);text-transform:uppercase;letter-spacing:1px;font-family:'Barlow Condensed',sans-serif}
  .input{background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:13px 14px;color:var(--text);font-size:15px;font-family:'Barlow',sans-serif;outline:none;transition:border .2s,box-shadow .2s;width:100%}
  .input:focus{border-color:var(--orange);box-shadow:0 0 0 3px rgba(255,107,0,.12)}
  .input::placeholder{color:#555}
  select.input{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
  .input-plate{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:800;letter-spacing:10px;text-align:center;text-transform:uppercase;padding:18px}

  /* ── BUTTONS ── */
  .btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:14px 20px;border-radius:var(--radius-sm);border:none;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:16px;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;transition:opacity .2s,transform .1s,box-shadow .2s;width:100%}
  .btn:active{transform:scale(.97)}
  .btn:disabled{opacity:.35;cursor:not-allowed}
  .btn-primary{background:var(--orange);color:#000;box-shadow:0 4px 14px rgba(255,107,0,.3)}
  .btn-primary:hover:not(:disabled){background:var(--orange2);box-shadow:0 6px 20px rgba(255,107,0,.45)}
  .btn-secondary{background:var(--card2);color:var(--text);border:1px solid var(--border2)}
  .btn-secondary:hover:not(:disabled){border-color:var(--orange);color:var(--orange)}
  .btn-danger{background:var(--danger);color:#fff}
  .btn-success{background:var(--success);color:#000}
  .btn-ghost{background:transparent;color:var(--orange);border:1px solid var(--orange)}
  .btn-ghost:hover{background:#FF6B0015}
  .btn-sm{padding:8px 14px;font-size:13px;width:auto;border-radius:6px}
  .btn-row{display:flex;gap:10px}

  /* ── CARDS ── */
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px}
  .card-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:17px;margin-bottom:3px;text-transform:uppercase}
  .card-sub{font-size:13px;color:var(--muted)}

  /* ── BADGES ── */
  .badge{display:inline-block;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;font-family:'Barlow Condensed',sans-serif}
  .badge-new{background:#22c55e1a;color:var(--success)}
  .badge-used{background:#f59e0b1a;color:var(--warning)}
  .badge-seller{background:#FF6B001a;color:var(--orange)}
  .badge-pending{background:#f59e0b1a;color:var(--warning)}
  .badge-confirmed{background:#22c55e1a;color:var(--success)}
  .badge-cancelled{background:#ef44441a;color:var(--danger)}
  .badge-shipped{background:#3b82f61a;color:#60a5fa}
  .badge-delivered{background:#22c55e1a;color:var(--success)}

  /* ── VEHICLE BANNER ── */
  .vehicle-banner{background:linear-gradient(135deg,#181818,#0f0f0f);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px;position:relative;overflow:hidden}
  .vehicle-banner::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,#FF6B0022 0%,transparent 70%);border-radius:50%}
  .veh-plate{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:800;letter-spacing:8px;color:var(--orange);margin-bottom:4px}
  .veh-name{font-size:20px;font-weight:600;margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.5px}
  .veh-specs{display:flex;gap:10px;flex-wrap:wrap}
  .veh-spec{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:3px}

  /* ── PART CARD ── */
  .part-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:border-color .2s,transform .15s,box-shadow .2s}
  .part-card:hover{border-color:var(--orange);transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,107,0,.1)}
  .part-icon{width:58px;height:58px;border-radius:var(--radius-sm);background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;border:1px solid var(--border)}
  .part-info{flex:1;min-width:0}
  .part-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:15px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.2px}
  .part-oem{font-size:11px;color:var(--muted);font-family:monospace;margin-bottom:6px}
  .part-meta{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .part-price-col{text-align:right;flex-shrink:0}
  .part-price{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:700;color:var(--orange);line-height:1}
  .part-warranty{font-size:11px;color:var(--muted);margin-top:2px}
  .part-stock{font-size:11px;color:var(--muted);margin-top:2px}

  /* ── DETAIL ── */
  .detail-images{background:var(--card2);border-radius:var(--radius);height:220px;display:flex;align-items:center;justify-content:center;font-size:64px;margin-bottom:20px;border:1px solid var(--border);overflow:hidden}
  .detail-images img{width:100%;height:100%;object-fit:cover}
  .detail-thumbs{display:flex;gap:8px;margin-bottom:20px;overflow-x:auto;scrollbar-width:none}
  .detail-thumb{width:60px;height:60px;border-radius:8px;object-fit:cover;border:2px solid transparent;cursor:pointer;flex-shrink:0;transition:border-color .2s}
  .detail-thumb.active{border-color:var(--orange)}
  .detail-title{font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:800;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
  .detail-oem{font-family:monospace;font-size:13px;color:var(--muted);margin-bottom:12px}
  .detail-price{font-family:'Barlow Condensed',sans-serif;font-size:46px;font-weight:800;color:var(--orange);line-height:1;margin-bottom:4px}
  .detail-price-sub{font-size:13px;color:var(--muted);margin-bottom:20px}
  .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
  .detail-stat{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px}
  .detail-stat-label{font-size:10px;color:var(--orange);text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;font-family:'Barlow Condensed',sans-serif;font-weight:700}
  .detail-stat-value{font-size:15px;font-weight:600;font-family:'Barlow Condensed',sans-serif}
  .detail-section{margin-bottom:20px}
  .detail-section-title{font-size:11px;font-weight:700;color:var(--orange);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-family:'Barlow Condensed',sans-serif}
  .qty-ctrl{display:flex;align-items:center;border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;width:fit-content}
  .qty-btn{width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--card2);border:none;color:var(--text);font-size:18px;cursor:pointer;transition:background .2s,color .2s}
  .qty-btn:hover{background:var(--orange);color:#000}
  .qty-val{width:48px;text-align:center;font-size:16px;font-weight:700;background:transparent;border:none;color:var(--text);font-family:'Barlow Condensed',sans-serif}
  .seller-box{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;display:flex;align-items:center;gap:12px}
  .seller-avatar{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--orange),var(--orange2));display:flex;align-items:center;justify-content:center;font-weight:700;color:#000;font-size:16px;flex-shrink:0;font-family:'Barlow Condensed',sans-serif}

  /* ── CART ── */
  .cart-item{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:center;transition:border-color .2s}
  .cart-item:hover{border-color:var(--border2)}
  .cart-item-info{flex:1;min-width:0}
  .cart-item-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:15px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.2px}
  .cart-item-sub{font-size:12px;color:var(--muted)}
  .cart-item-price{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:700;color:var(--orange)}
  .cart-remove{background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px;flex-shrink:0;padding:4px;transition:color .2s}
  .cart-remove:hover{color:var(--danger)}
  .cart-summary{background:var(--card2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-top:16px}
  .cart-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:14px}
  .cart-total{font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:800;color:var(--orange)}

  /* ── ORDERS ── */
  .stars{display:flex;gap:2px}
  .star{font-size:22px;cursor:pointer;transition:transform .1s;line-height:1}
  .star:hover{transform:scale(1.2)}
  .star-sm{font-size:14px}
  .review-card{background:var(--card2);border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid var(--border)}
  .review-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .review-avatar{width:28px;height:28px;border-radius:50%;background:var(--orange);color:#000;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Barlow Condensed',sans-serif}
  .review-name{font-size:13px;font-weight:600;font-family:'Barlow Condensed',sans-serif;letter-spacing:.2px}
  .review-comment{font-size:13px;color:var(--muted);line-height:1.5}
  .seller-rating{display:flex;align-items:center;gap:6px;margin-bottom:4px}
  .rating-avg{font-size:20px;font-weight:800;color:var(--orange);font-family:'Barlow Condensed',sans-serif}
  .rating-count{font-size:12px;color:var(--muted)}
  .order-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:12px;transition:border-color .2s}
  .order-card:hover{border-color:var(--border2)}
  .order-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
  .order-date{font-size:12px;color:var(--muted)}
  .order-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}
  .order-item:last-child{border-bottom:none}
  .order-total-row{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}

  /* ── AUTH ── */
  .auth-screen{min-height:100vh;background:var(--black);display:flex;flex-direction:column;align-items:stretch;overflow:hidden}
  @media(min-width:640px){
    .auth-screen{position:relative;flex-direction:row;align-items:stretch}
    .auth-hero{position:fixed!important;inset:0;height:100vh!important;z-index:0}
    .auth-hero img{width:100%;height:100%;object-fit:cover}
    .auth-hero-overlay{background:linear-gradient(to right,rgba(10,10,10,.95) 38%,rgba(10,10,10,.5) 100%)!important}
    .auth-hero-logo{display:none!important}
    .auth-body{position:relative;z-index:1;width:440px;min-height:100vh;background:transparent!important;border-radius:0!important;margin-top:0!important;padding:0!important;display:flex;flex-direction:column;justify-content:center;padding:40px 40px!important}
    .auth-body::before{content:'';position:absolute;inset:0;background:rgba(17,17,17,.9);backdrop-filter:blur(4px);z-index:-1}
    .auth-desktop-logo{display:flex!important}
  }
  .auth-desktop-logo{display:none;flex-direction:column;margin-bottom:40px}
  .auth-desktop-logo-text{font-family:'Barlow Condensed',sans-serif;font-size:52px;font-weight:800;letter-spacing:6px;color:var(--orange);line-height:1;text-transform:uppercase}
  .auth-desktop-logo-text span{color:var(--white)}
  .auth-desktop-logo-sub{font-size:11px;color:rgba(245,245,245,.4);letter-spacing:3px;text-transform:uppercase;margin-top:5px;font-family:'Barlow Condensed',sans-serif;font-weight:500}
  .auth-hero{position:relative;height:260px;overflow:hidden;flex-shrink:0}
  .auth-hero img{width:100%;height:100%;object-fit:cover;display:block;animation:heroZoom 8s ease-out forwards}
  .auth-hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,10,10,.2),rgba(10,10,10,.92))}
  .auth-hero-logo{position:absolute;bottom:0;left:0;right:0;padding:20px 24px 24px;text-align:center}
  .auth-logo-text{font-family:'Barlow Condensed',sans-serif;font-size:52px;font-weight:800;letter-spacing:6px;color:var(--orange);line-height:1;text-transform:uppercase}
  .auth-logo-text span{color:var(--white)}
  .auth-logo-sub{font-size:11px;color:rgba(245,245,245,.5);letter-spacing:3px;text-transform:uppercase;margin-top:3px}
  .auth-body{background:var(--dark);flex:1;padding:28px 24px 40px;border-radius:20px 20px 0 0;margin-top:-16px;position:relative}
  .auth-box{width:100%;max-width:400px;margin:0 auto}
  .auth-tabs{display:flex;border-radius:var(--radius-sm);overflow:hidden;border:1px solid var(--border);margin-bottom:26px}
  .auth-tab{flex:1;padding:12px;text-align:center;cursor:pointer;font-weight:700;font-size:14px;border:none;background:transparent;color:var(--muted);font-family:'Barlow Condensed',sans-serif;letter-spacing:.5px;text-transform:uppercase;transition:all .2s}
  .auth-tab.active{background:var(--orange);color:#000}
  .btn-google{width:100%;padding:13px;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--dark);color:var(--text);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:16px;transition:all .2s;font-family:'Barlow',sans-serif}
  .btn-google:hover{border-color:var(--orange);background:var(--card2)}
  .auth-divider{display:flex;align-items:center;gap:10px;margin-bottom:16px;color:var(--muted);font-size:12px}
  .auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--border)}

  /* ── FILTER BAR ── */
  .filter-bar{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;margin-bottom:10px;scrollbar-width:none}
  .filter-bar::-webkit-scrollbar{display:none}
  .filter-section{margin-bottom:18px}
  .filter-label{font-size:10px;color:var(--orange);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-family:'Barlow Condensed',sans-serif}
  .chip{flex-shrink:0;padding:7px 16px;border-radius:99px;border:1px solid var(--border);background:var(--card);color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;font-family:'Barlow Condensed',sans-serif;letter-spacing:.3px;text-transform:uppercase;transition:all .2s}
  .chip.active{border-color:var(--orange);background:#FF6B0015;color:var(--orange)}
  .chip:hover:not(.active){border-color:var(--border2);color:var(--text)}

  /* ── SEARCH HERO ── */
  .search-hero{background:linear-gradient(135deg,#181818,#0f0f0f);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:22px;text-align:center;position:relative;overflow:hidden}
  .search-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;background:radial-gradient(circle,#FF6B0018 0%,transparent 70%);border-radius:50%}
  .hero-title-sm{font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;letter-spacing:2px;color:var(--orange);margin-bottom:4px;text-transform:uppercase}
  .hero-sub-sm{font-size:13px;color:var(--muted);margin-bottom:18px}

  /* ── SUPPORT / CHAT ── */
  .chat-box{height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:12px;margin-bottom:12px;background:var(--card);display:flex;flex-direction:column;gap:8px}
  .chat-msg{padding:9px 13px;border-radius:12px;max-width:85%;font-size:14px;line-height:1.4}
  .chat-msg-mine{background:var(--orange);color:#000;align-self:flex-end;border-bottom-right-radius:3px;font-weight:500}
  .chat-msg-other{background:var(--card2);color:var(--text);align-self:flex-start;border-bottom-left-radius:3px;border:1px solid var(--border)}
  .chat-msg-user{font-weight:700;font-size:10px;margin-bottom:2px;opacity:.7;font-family:'Barlow Condensed',sans-serif;letter-spacing:.5px;text-transform:uppercase}
  .chat-msg-time{font-size:10px;opacity:.55;margin-top:3px;text-align:right}
  .chat-input-row{display:flex;gap:8px}
  .chat-input-row .input{flex:1}
  .chat-send-btn{padding:13px 17px;background:var(--orange);color:#000;border:none;border-radius:var(--radius-sm);font-weight:900;cursor:pointer;font-size:18px;flex-shrink:0;transition:background .2s,transform .1s}
  .chat-send-btn:hover{background:var(--orange2)}
  .chat-send-btn:active{transform:scale(.95)}

  /* ── PROFILE ── */
  .profile-avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--orange),var(--orange2));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#000;font-family:'Barlow Condensed',sans-serif}
  .avatar-edit-btn{position:absolute;bottom:0;right:0;background:var(--orange);color:#000;border:none;border-radius:50%;width:26px;height:26px;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(255,107,0,.5)}
  .profile-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:22px}
  .stat-box{background:var(--card);padding:14px;text-align:center}
  .stat-num{font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:800;color:var(--orange)}
  .stat-lbl{font-size:10px;color:var(--muted);font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.5px}
  .seller-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .photo-upload-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .photo-slot{aspect-ratio:1;border-radius:10px;border:1.5px dashed var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;overflow:hidden;background:var(--card2);transition:border-color .2s,box-shadow .2s}
  .photo-slot:hover{border-color:var(--orange);box-shadow:0 0 0 3px rgba(255,107,0,.1)}
  .photo-slot img{width:100%;height:100%;object-fit:cover}
  .photo-slot .remove-photo{position:absolute;top:4px;right:4px;background:#ef444490;color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1}
  .photo-add-icon{font-size:22px;color:var(--muted)}
  .span2{grid-column:span 2}

  /* ── MISC ── */
  .divider{height:1px;background:var(--border);margin:18px 0}
  .empty{text-align:center;padding:60px 20px;color:var(--muted)}
  .empty-icon{font-size:52px;margin-bottom:12px}
  .empty-title{font-size:18px;color:var(--text);font-weight:700;margin-bottom:6px;font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:.5px}
  .empty-sub{font-size:13px}
  .spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--orange);border-radius:50%;animation:spin .7s linear infinite;margin:50px auto}
  .toast{position:fixed;bottom:92px;left:50%;transform:translateX(-50%);background:var(--card2);border:1px solid var(--border2);padding:11px 22px;border-radius:99px;font-size:13px;font-weight:700;z-index:200;animation:fadeUp .25s ease;white-space:nowrap;max-width:90vw;font-family:'Barlow Condensed',sans-serif;letter-spacing:.3px;text-transform:uppercase}
  .toast.success{border-color:var(--success);color:var(--success)}
  .toast.error{border-color:var(--danger);color:var(--danger)}
  .back-btn{display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--muted);font-size:14px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.3px;text-transform:uppercase;padding:0;margin-bottom:18px;transition:color .2s}
  .back-btn:hover{color:var(--orange)}
  .result-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .result-count{font-size:12px;color:var(--muted);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.3px;text-transform:uppercase}
  .toggle-link{text-align:center;font-size:13px;color:var(--muted);margin-top:12px;cursor:pointer;font-family:'Barlow',sans-serif}
  .toggle-link span{color:var(--orange);font-weight:600}
  textarea.input{resize:none}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
  ::-webkit-scrollbar-thumb:hover{background:var(--orange)}
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
    <div className="auth-screen" style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"var(--black)"}}>
      {toastEl}
      {/* Hero com imagem real - login.html style */}
      <div className="auth-hero">
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=840&q=75&auto=format&fit=crop" alt="AutoStore" />
        <div className="auth-hero-overlay" />
        <div className="auth-hero-logo">
          <div className="auth-logo-text">AUTO<span>STORE</span></div>
          <div className="auth-logo-sub">Marketplace Automotivo</div>
        </div>
      </div>
      <div className="auth-body">
      <div className="auth-box">
        {/* Logo visível apenas no desktop */}
        <div className="auth-desktop-logo">
          <div className="auth-desktop-logo-text">AUTO<span>STORE</span></div>
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
  return (
    <div className="screen" style={{paddingBottom:90}}>
      {/* Hero com imagem real - home.html style */}
      <div className="hero">
        <img className="hero-img"
          style={{animationName:"heroZoom",animationDuration:"10s",animationTimingFunction:"ease-out",animationFillMode:"forwards"}}
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=840&q=75&auto=format&fit=crop"
          alt="Oficina mecânica" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="brand-mark">
            <div className="brand-dot" />
            <div className="brand-name">AUTO<span>STORE</span></div>
          </div>
          <div className="hero-tagline">Olá, {user?.name?.split(" ")[0]} 👋 · Marketplace Automotivo</div>
        </div>
      </div>

      {/* Promo strip - home.html style */}
      <button className="promo-strip" onClick={() => setScreen("search")}>
        <div>
          <div className="promo-strip-text">Buscar pela placa</div>
          <div className="promo-strip-sub">Encontre a peça certa para seu veículo</div>
        </div>
        <div className="promo-strip-arrow">→</div>
      </button>

      <div className="section-label">Navegação</div>
      <div className="section-title">O que você precisa?</div>

      <div className="super-grid">
        <div className="super-card anim-fade-up delay-1" onClick={() => setScreen("search")}>
          <div className="super-icon">🚗</div>
          <div className="super-title">Buscar Veículo</div>
          <div className="super-sub">Por placa ou modelo</div>
        </div>
        <div className="super-card anim-fade-up delay-2" onClick={() => setScreen("marketplace")}>
          <div className="super-icon">🔧</div>
          <div className="super-title">Catálogo OEM</div>
          <div className="super-sub">Referências originais</div>
        </div>
        <div className="super-card anim-fade-up delay-2" onClick={() => setScreen("marketplace")}>
          <div className="super-icon">🛒</div>
          <div className="super-title">Marketplace</div>
          <div className="super-sub">Comprar peças <span className="badge badge-new" style={{fontSize:9,padding:"2px 6px"}}>Novo</span></div>
        </div>
        <div className="super-card anim-fade-up delay-3" onClick={() => setScreen("orders")}>
          <div className="super-icon">📦</div>
          <div className="super-title">Meus Pedidos</div>
          <div className="super-sub">Acompanhar entregas</div>
        </div>
        {isSeller && (
          <div className="super-card anim-fade-up delay-4" onClick={() => setScreen("sell")}>
            <div className="super-icon">💰</div>
            <div className="super-title">Anunciar Peça</div>
            <div className="super-sub">Vender pelo OEM</div>
          </div>
        )}
        <div className="super-card anim-fade-up delay-4" onClick={() => setScreen("profile")}>
          <div className="super-icon">👤</div>
          <div className="super-title">Perfil</div>
          <div className="super-sub">Conta e anúncios</div>
        </div>
        <div className="super-card anim-fade-up delay-5" onClick={() => setScreen("support")}>
          <div className="super-icon">💬</div>
          <div className="super-title">Suporte</div>
          <div className="super-sub">Central de ajuda</div>
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
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Total: <strong style={{ color: "var(--orange)" }}>{fmt(data?.price * qty)}</strong></div>
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
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, color: "var(--orange)" }}>{fmt(order.total)}</span>
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
function SellScreen({ user }) {
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
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{styles}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 44, color: "var(--orange)", letterSpacing: 3 }}>AUTOSTORE</div>
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
        <div className="topbar-logo">AUTO<span style={{color:"var(--white)",fontWeight:400}}>STORE</span></div>
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
        <div className="topbar-logo">AUTO<span style={{color:"var(--white)",fontWeight:400}}>STORE</span></div>
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
