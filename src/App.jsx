import { useState, useEffect, useRef } from "react";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = n => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const colors = {
    error: "bg-red-500 text-white",
    success: "bg-green-500 text-white",
    warning: "bg-amber-400 text-black",
  };
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap animate-fade-up max-w-xs text-center ${colors[type] || colors.error}`}>
      {msg}
    </div>
  );
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
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={`cursor-pointer transition-transform hover:scale-125 ${size === "sm" ? "text-sm" : "text-xl"}`}
          style={{ color: n <= active ? "#f5a623" : "#1E2D45" }}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(null)}
        >★</span>
      ))}
    </div>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icons = {
  Home: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Search: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Shop: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Cart: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  Orders: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Sell: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  User: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Back: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  X: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Logout: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Chat: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ type, children }) {
  const classes = {
    new: "bg-green-500/15 text-green-400 border border-green-500/20",
    used: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
    seller: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    pending: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
    confirmed: "bg-green-500/15 text-green-400 border border-green-500/20",
    cancelled: "bg-red-500/15 text-red-300 border border-red-500/20",
    shipped: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    delivered: "bg-green-500/15 text-green-400 border border-green-500/20",
    neutral: "bg-slate-700 text-slate-400 border border-slate-600",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${classes[type] || classes.neutral}`}>
      {children}
    </span>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 mb-3.5">
      {label && <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>}
      <input
        className="bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3.5 py-3 text-slate-100 text-sm font-['Inter'] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder-slate-500 w-full transition-all"
        {...props}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 mb-3.5">
      {label && <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>}
      <select
        className="bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3.5 py-3 text-slate-100 text-sm font-['Inter'] outline-none focus:border-blue-500 appearance-none cursor-pointer w-full"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
function Btn({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base = "flex items-center justify-center gap-2 rounded-[10px] font-bold font-['Inter'] tracking-wide cursor-pointer transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { md: "px-5 py-3 text-sm", sm: "px-3.5 py-1.5 text-xs" };
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-[#1E293B] text-slate-200 border border-[#2D3F55] hover:border-blue-500 hover:text-blue-400",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-blue-300 border border-blue-500/30 hover:bg-blue-500/8",
    accent: "bg-green-500 text-white hover:bg-green-600",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── CHIP / FILTER ────────────────────────────────────────────────────────────
function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
        active
          ? "border-blue-500 bg-blue-500/10 text-blue-300"
          : "border-[#2D3F55] bg-[#111827] text-slate-500 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="w-9 h-9 border-[3px] border-[#2D3F55] border-t-blue-500 rounded-full animate-spin mx-auto my-6" />
);

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }) {
  return (
    <div className="text-center py-14 px-5">
      <div className="text-5xl mb-4 opacity-50">{icon}</div>
      <div className="text-lg font-bold text-slate-100 mb-1.5">{title}</div>
      {sub && <div className="text-sm text-slate-500">{sub}</div>}
    </div>
  );
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
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
    const isInAppBrowser = /Instagram|FBAN|FBAV|Twitter|Line|Snapchat|FB_IAB/i.test(navigator.userAgent);
    if (isInAppBrowser) { show("Abra no Chrome ou Safari para entrar com Google 🌐", "warning"); return; }
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
    <div className="min-h-screen flex flex-col bg-[#0A0F1E]">
      {toastEl}
      {/* Hero */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=840&q=75&auto=format&fit=crop" alt="AutoStore" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/10 to-[#0A0F1E]/95" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
          <div className="flex items-center gap-2.5 justify-center">
            <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-black">A</span>
            </div>
            <span className="text-3xl font-black text-white tracking-wide">AutoStore</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Marketplace Automotivo</p>
        </div>
      </div>

      {/* Body */}
      <div className="bg-[#0F172A] flex-1 px-6 pt-7 pb-10 rounded-t-[20px] -mt-5 relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Tabs */}
          <div className="flex bg-[#111827] rounded-[10px] p-1 mb-6 gap-1">
            {["login", "register"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-center font-semibold text-sm rounded-lg transition-all ${
                  tab === t ? "bg-blue-500 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t === "login" ? "Entrar" : "Cadastrar"}
              </button>
            ))}
          </div>

          {/Instagram|FBAN|FBAV|Twitter|Line|Snapchat|FB_IAB/i.test(navigator.userAgent) ? (
            <div className="bg-amber-500/10 border border-amber-500 rounded-[10px] p-3 mb-4 text-sm text-amber-300 text-center leading-relaxed">
              🌐 Para entrar com Google, abra no <strong>Chrome</strong> ou <strong>Safari</strong>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full py-3 rounded-[10px] border border-[#2D3F55] bg-[#111827] text-slate-100 text-sm font-semibold flex items-center justify-center gap-2.5 mb-3.5 hover:border-blue-500 hover:bg-[#1E293B] transition-all disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-2.9-11.9-7.1l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.5 4.6-4.6 6l6.2 5.2C40.7 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
              {loading ? "Aguarde..." : "Continuar com Google"}
            </button>
          )}

          <div className="flex items-center gap-2.5 mb-3.5 text-slate-500 text-xs">
            <div className="flex-1 h-px bg-[#2D3F55]" />
            ou
            <div className="flex-1 h-px bg-[#2D3F55]" />
          </div>

          {tab === "login" ? (
            <>
              <Input label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={set("email")} />
              <Input label="Senha" type="password" placeholder="••••••" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && login()} />
              <Btn onClick={login} disabled={loading} className="w-full">{loading ? "Entrando..." : "Entrar"}</Btn>
            </>
          ) : (
            <>
              <Input label="Nome" placeholder="Seu nome completo" value={form.name} onChange={set("name")} />
              <Input label="Email" type="email" placeholder="seu@email.com" value={form.email} onChange={set("email")} />
              <Input label="Senha" type="password" placeholder="mín. 6 caracteres" value={form.password} onChange={set("password")} />
              <Select label="Tipo de conta" value={form.type} onChange={set("type")}>
                <option value="buyer">Comprador</option>
                <option value="seller">Vendedor</option>
              </Select>
              <Btn onClick={register} disabled={loading} className="w-full">{loading ? "Criando conta..." : "Criar conta"}</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ user, setScreen }) {
  const isSeller = user?.type === "seller";
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
    <div className="overflow-y-auto pb-20 scrollbar-none">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=85&auto=format&fit=crop" alt="AutoStore" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/15 via-[#0A0F1E]/60 to-[#0A0F1E]/96" />
        <div className="absolute bottom-0 left-0 right-0 p-5 pb-7">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full px-3 py-1 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider">Marketplace Automotivo</span>
          </div>
          <h1 className="text-3xl font-black text-white leading-tight mb-2">
            Peças e acessórios<br/>automotivos<br/>
            <span className="text-blue-300">de qualidade</span>
          </h1>
          <p className="text-sm text-white/60 mb-4 leading-relaxed">Encontre tudo o que seu carro precisa<br/>em lojas confiáveis.</p>
          <Btn onClick={() => setScreen("marketplace")} className="w-auto px-6">Explorar Produtos</Btn>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto scrollbar-none bg-[#111827] border-b border-[#1E2D45]">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => { setActiveCat(i); setScreen("marketplace"); }}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3.5 text-[11px] font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeCat === i
                ? "text-blue-400 border-blue-500 bg-blue-500/6"
                : "text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/4"
            }`}
          >
            <span className="text-xl leading-none">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Quick Search Banner */}
      <button
        onClick={() => setScreen("search")}
        className="mx-4 mt-3 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl px-5 py-4 flex items-center justify-between w-[calc(100%-32px)] hover:brightness-110 transition-all"
      >
        <div className="text-left">
          <div className="text-sm font-bold text-white mb-0.5">🔍 Buscar pela placa</div>
          <div className="text-xs text-white/75">Encontre a peça certa para seu carro</div>
        </div>
        <span className="text-2xl text-white/90 font-black">→</span>
      </button>

      {/* Lojas em Destaque */}
      <div className="flex justify-between items-center px-4 pt-5 pb-3">
        <span className="text-[17px] font-bold text-slate-100">Lojas em Destaque</span>
        <button onClick={() => setScreen("marketplace")} className="text-xs text-blue-300 font-semibold">Ver todas →</button>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {stores.map((store, i) => (
          <div
            key={i}
            onClick={() => setScreen("marketplace")}
            className="bg-[#111827] border border-[#1E2D45] rounded-2xl overflow-hidden cursor-pointer transition-all hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]"
          >
            <img src={store.img} alt={store.name} className="w-full h-28 object-cover" />
            <div className="p-3">
              <div className="text-sm font-bold text-slate-100 mb-2.5">{store.name}</div>
              <Btn size="sm" className="text-xs px-3.5 py-1.5">Ver Loja</Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Produtos Populares */}
      <div className="flex justify-between items-center px-4 pb-3">
        <span className="text-[17px] font-bold text-slate-100">Produtos Populares</span>
        <button onClick={() => setScreen("marketplace")} className="text-xs text-blue-300 font-semibold">Ver mais →</button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-none">
        {popularProducts.map((prod, i) => (
          <div
            key={i}
            onClick={() => setScreen("marketplace")}
            className="flex-shrink-0 w-36 bg-[#111827] border border-[#1E2D45] rounded-[10px] overflow-hidden cursor-pointer transition-all hover:border-blue-500 hover:-translate-y-0.5"
          >
            <img src={prod.img} alt={prod.name} className="w-full h-24 object-cover" />
            <div className="p-2.5">
              <div className="text-xs font-semibold text-slate-100 mb-1 truncate">{prod.name}</div>
              <div className="text-sm font-black text-green-400">{prod.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Seller Quick Actions */}
      {isSeller && (
        <div className="px-4 pb-4">
          <div className="text-[17px] font-bold text-slate-100 mb-3">Ações Rápidas</div>
          <div className="flex flex-col gap-2.5">
            <button onClick={() => setScreen("sell")} className="flex items-center gap-2.5 bg-blue-500 rounded-[10px] px-4 py-3.5 hover:bg-blue-600 transition-all">
              <span className="text-xl">📦</span>
              <span className="font-bold text-white text-sm">+ Novo Produto</span>
            </button>
            <button onClick={() => setScreen("sell")} className="flex items-center gap-2.5 bg-[#111827] border border-[#1E2D45] rounded-[10px] px-4 py-3.5 hover:border-blue-500 transition-all">
              <span className="text-xl">🏪</span>
              <span className="font-semibold text-slate-100 text-sm">Ver Minha Loja</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SELL DASHBOARD ───────────────────────────────────────────────────────────
function SellDashboard({ user, setScreen }) {
  const firstName = user?.name?.split(" ")[0] || "Usuário";

  const metrics = [
    { icon: "💰", label: "Vendas Hoje", value: "R$ 1.250", sub: "+12% hoje", subColor: "text-green-400", bg: "bg-green-500/12" },
    { icon: "📦", label: "Pedidos Hoje", value: "18", sub: "8 pendentes", subColor: "text-amber-400", bg: "bg-amber-500/12" },
    { icon: "📈", label: "Crescimento", value: "+12,5%", sub: "↑ esta semana", subColor: "text-green-400", bg: "bg-green-500/12" },
    { icon: "%", label: "Conversão", value: "5,4%", sub: "↑ +0.8%", subColor: "text-green-400", bg: "bg-blue-500/12" },
  ];

  const recentOrders = [
    { id: "#1024", client: "João Silva", status: "pending", value: "R$ 320,00" },
    { id: "#1023", client: "Ana Souza", status: "shipped", value: "R$ 150,00" },
    { id: "#1022", client: "Marco Lima", status: "delivered", value: "R$ 210,00" },
  ];

  const statusLabel = { pending: "Pendente", shipped: "Enviado", delivered: "Concluído", cancelled: "Cancelado" };
  const statusBadgeType = { pending: "pending", shipped: "shipped", delivered: "delivered", cancelled: "cancelled" };

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
    <div className="overflow-y-auto pb-20 scrollbar-none">
      <div className="px-4 pt-5 pb-0">
        <h1 className="text-2xl font-black text-slate-100 mb-1">Visão Geral</h1>
        <p className="text-sm text-slate-500 mb-5">
          Bem-vindo de volta, <span className="text-blue-300 font-bold">{firstName}</span>!
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 px-4 pb-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-4 relative overflow-hidden">
            <div className={`w-9 h-9 ${m.bg} rounded-[9px] flex items-center justify-center text-base mb-2.5`}>{m.icon}</div>
            <div className="text-xs text-slate-500 font-medium mb-1">{m.label}</div>
            <div className="text-xl font-black text-slate-100">{m.value}</div>
            <div className={`text-[11px] mt-1 ${m.subColor}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-4 pb-4">
        <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-100">Vendas da Semana</span>
            <span className="text-[11px] bg-[#1E293B] border border-[#1E2D45] px-2.5 py-1 rounded-full text-slate-500 font-medium">Últimos 7 dias</span>
          </div>
          <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
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
          <div className="flex justify-between mt-2">
            {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d,i) => (
              <span key={i} className="text-[10px] text-slate-500 font-medium">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-4 pb-4">
        <div className="flex justify-between items-center mb-3.5">
          <span className="text-sm font-bold text-slate-100">Últimos Pedidos</span>
          <button onClick={() => setScreen("orders")} className="text-xs text-blue-300 bg-[#1E293B] border border-[#1E2D45] px-3 py-1.5 rounded-full font-semibold">Ver Todos →</button>
        </div>
        <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 px-3.5 py-2.5 border-b border-[#1E2D45]">
            {["Pedido","Cliente","Status","Valor"].map(h => (
              <span key={h} className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">{h}</span>
            ))}
          </div>
          {recentOrders.map((order, i) => (
            <div key={i} className={`grid grid-cols-4 px-3.5 py-3.5 items-center ${i < recentOrders.length - 1 ? "border-b border-[#1E2D45]" : ""}`}>
              <span className="font-bold text-slate-100 text-sm">{order.id}</span>
              <span className="text-sm text-slate-300">{order.client}</span>
              <Badge type={statusBadgeType[order.status] || "pending"}>{statusLabel[order.status]}</Badge>
              <span className="text-sm font-bold text-slate-100 text-right">{order.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <div className="text-sm font-bold text-slate-100 mb-3">Ações Rápidas</div>
        <button onClick={() => setScreen("sell")} className="flex items-center gap-2.5 bg-blue-500 rounded-[10px] px-4 py-3.5 w-full mb-2.5 hover:bg-blue-600 transition-all">
          <span className="text-xl">📦</span>
          <span className="font-bold text-white text-sm">+ Novo Produto</span>
        </button>
        <button onClick={() => setScreen("marketplace")} className="flex items-center gap-2.5 bg-[#111827] border border-[#1E2D45] rounded-[10px] px-4 py-3.5 w-full hover:border-blue-500 transition-all">
          <span className="text-xl">🏪</span>
          <span className="font-semibold text-slate-100 text-sm">Ver Minha Loja</span>
        </button>
      </div>
    </div>
  );
}

// ─── SEARCH SCREEN ────────────────────────────────────────────────────────────
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
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      {toastEl}
      <h1 className="text-2xl font-black text-slate-100 mb-1">Buscar Peças</h1>
      <p className="text-sm text-slate-500 mb-5">Encontre peças compatíveis com seu veículo</p>

      {/* Search Hero */}
      <div className="bg-gradient-to-br from-[#111827] to-[#1E293B] border border-[#1E2D45] rounded-2xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl" />
        <h2 className="text-xl font-black text-slate-100 mb-1">🔍 BUSCA POR PLACA</h2>
        <p className="text-sm text-slate-500 mb-4">Digite a placa para identificar o veículo</p>
        <input
          className="bg-[#111827] border border-[#2D3F55] rounded-[10px] px-4 py-4 text-blue-300 text-3xl font-black tracking-[8px] text-center w-full outline-none focus:border-blue-500 uppercase placeholder-slate-600"
          placeholder="ABC1D23"
          value={plate}
          maxLength={8}
          onChange={e => setPlate(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && byPlate()}
        />
        <Btn onClick={byPlate} disabled={loading} className="w-full mt-3">
          {loading ? "Buscando..." : "Buscar por Placa"}
        </Btn>
      </div>

      <button
        onClick={() => setMode(m => m === "plate" ? "manual" : "plate")}
        className="text-sm text-center w-full text-slate-500 mb-4 hover:text-slate-300 transition-colors"
      >
        {mode === "plate" ? <>Busca manual? <span className="text-blue-400">Clique aqui</span></> : <>Usar placa? <span className="text-blue-400">Clique aqui</span></>}
      </button>

      {mode === "manual" && (
        <div className="mt-4">
          <div className="h-px bg-[#1E2D45] mb-4" />
          <div className="font-semibold mb-3.5 text-slate-200">Busca por dados do veículo</div>
          <Input label="Marca" placeholder="ex: volkswagen" value={manual.brand} onChange={set("brand")} />
          <Input label="Modelo" placeholder="ex: gol" value={manual.model} onChange={set("model")} />
          <Input label="Motor" placeholder="ex: 1.0" value={manual.engineDisplacement} onChange={set("engineDisplacement")} />
          <Select label="Combustível" value={manual.fuelType} onChange={set("fuelType")}>
            <option value="">Selecione</option>
            <option value="flex">Flex</option>
            <option value="gasolina">Gasolina</option>
            <option value="diesel">Diesel</option>
            <option value="elétrico">Elétrico</option>
          </Select>
          <Btn onClick={byManual} disabled={loading} className="w-full">{loading ? "Buscando..." : "Buscar Peças"}</Btn>
        </div>
      )}
    </div>
  );
}

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────
function ResultsScreen({ vehicleData, onBack, onSelectPart }) {
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const { plate, vehicle, parts } = vehicleData;
  const categories = ["all", ...new Set(parts.map(p => p.part?.categoryName).filter(Boolean))];
  const filtered = parts.filter(p => {
    const condOk = filter === "all" || p.condition === filter;
    const catOk = catFilter === "all" || p.part?.categoryName === catFilter;
    return condOk && catOk;
  });

  return (
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      <button onClick={onBack} className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold mb-4 hover:text-blue-300 transition-colors">
        <Icons.Back /> Voltar
      </button>

      {/* Vehicle Banner */}
      <div className="bg-gradient-to-br from-[#111827] to-[#1E293B] border border-[#1E2D45] rounded-2xl p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full" />
        {plate && <div className="text-2xl font-black tracking-[6px] text-blue-300 mb-1">{plate}</div>}
        <div className="text-lg font-bold text-slate-100 mb-2">{vehicle?.brand} {vehicle?.model}</div>
        <div className="flex gap-2.5 flex-wrap">
          {(vehicle?.engine || vehicle?.engineDisplacement) && <span className="text-xs text-slate-500 bg-[#1E293B] px-2.5 py-1 rounded-full border border-[#1E2D45]">⚙️ {vehicle.engine || vehicle.engineDisplacement}</span>}
          {vehicle?.fuelType && <span className="text-xs text-slate-500 bg-[#1E293B] px-2.5 py-1 rounded-full border border-[#1E2D45]">⛽ {vehicle.fuelType}</span>}
          {vehicle?.year && <span className="text-xs text-slate-500 bg-[#1E293B] px-2.5 py-1 rounded-full border border-[#1E2D45]">📅 {vehicle.year}</span>}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-black text-slate-100">Peças Compatíveis</h2>
        <span className="text-sm text-slate-500">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {[{ k: "all", l: "Todas" }, { k: "new", l: "Novas" }, { k: "used", l: "Usadas" }].map(f => (
          <Chip key={f.k} active={filter === f.k} onClick={() => setFilter(f.k)}>{f.l}</Chip>
        ))}
      </div>
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map(c => (
            <Chip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>{c === "all" ? "Todas" : c}</Chip>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="🔧" title="Nenhuma peça encontrada" sub="Tente outro filtro" />
      ) : filtered.map((item, i) => (
        <PartCard key={item.id || i} item={item} onClick={() => onSelectPart(item)} />
      ))}
    </div>
  );
}

// ─── PART CARD (reusable) ─────────────────────────────────────────────────────
function PartCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-3.5 mb-2.5 flex gap-3 items-start cursor-pointer transition-all hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.10)]"
    >
      <div className="w-14 h-14 rounded-[10px] bg-[#1E293B] flex items-center justify-center text-2xl flex-shrink-0 border border-[#1E2D45]">🔧</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-slate-100 mb-0.5 truncate">{item.part?.name || item.name || "Peça Automotiva"}</div>
        <div className="font-mono text-[11px] text-slate-500 mb-1.5">OEM: {item.part?.oemNumber || item.oemNumber || "—"}</div>
        <div className="flex gap-1.5 flex-wrap">
          <Badge type={item.condition === "used" ? "used" : "new"}>{item.condition === "used" ? "Usada" : "Nova"}</Badge>
          {item.part?.brand && <Badge type="seller">{item.part.brand}</Badge>}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xl font-black text-green-400 leading-none">{fmt(item.price)}</div>
        {item.warrantyMonths > 0 && <div className="text-[11px] text-slate-500 mt-0.5">{item.warrantyMonths}m garantia</div>}
        <div className="text-[11px] text-slate-500 mt-0.5">Est: {item.stock || 0}</div>
      </div>
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
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      <h1 className="text-2xl font-black text-slate-100 mb-1">Marketplace</h1>
      <p className="text-sm text-slate-500 mb-4">Autopeças no catálogo OEM</p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {[{ k: "all", l: "Todos" }, { k: "new", l: "Novos" }, { k: "used", l: "Usados" }].map(f => (
          <Chip key={f.k} active={filter === f.k} onClick={() => setFilter(f.k)}>{f.l}</Chip>
        ))}
      </div>
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map(c => (
            <Chip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>{c === "all" ? "Todas" : c}</Chip>
          ))}
        </div>
      )}

      {loading ? (
        <div>
          {[1,2,3].map(i => (
            <div key={i} className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-3.5 mb-2.5 flex gap-3 items-start">
              <div className="w-14 h-14 rounded-[10px] bg-[#1E293B] flex-shrink-0 animate-pulse" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3.5 bg-[#1E293B] rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-[#1E293B] rounded w-1/2 animate-pulse" />
                <div className="h-5 bg-[#1E293B] rounded w-1/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🛒" title="Nenhuma peça disponível" />
      ) : filtered.map((item, i) => (
        <PartCard key={item.id || i} item={item} onClick={() => onSelectPart(item)} />
      ))}
    </div>
  );
}

// ─── PART DETAIL ──────────────────────────────────────────────────────────────
function PartDetailScreen({ part, onBack, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [detail, setDetail] = useState(null);
  const [show, toastEl] = useToast();
  const [reviews, setReviews] = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!part?.id) return;
    fetch(`${API}/marketplaceParts/${part.id}`).then(r => r.json()).then(d => setDetail(d.data || part)).catch(() => setDetail(part));
  }, [part?.id]);

  const data = detail || part;
  const maxQty = data?.stock || 99;
  const imgs = data?.images?.length ? data.images : (data?.part?.images?.length ? data.part.images : []);

  useEffect(() => {
    const sellerId = data?.sellerId || data?.seller?.uid;
    if (!sellerId) return;
    fetch(`${API}/reviews/seller/${sellerId}`).then(r => r.json()).then(d => setReviews(d.data || [])).catch(() => {});
  }, [data?.sellerId]);

  const addToCart = () => {
    if (qty > maxQty) return show(`Estoque disponível: ${maxQty}`);
    onAddToCart({ ...data, quantity: qty });
    show("Adicionado ao carrinho! 🛒", "success");
  };

  return (
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      {toastEl}
      <button onClick={onBack} className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold mb-4 hover:text-blue-300 transition-colors">
        <Icons.Back /> Voltar
      </button>

      {/* Images */}
      {imgs.length > 0 ? (
        <>
          <div className="bg-[#1E293B] rounded-2xl h-56 flex items-center justify-center mb-5 border border-[#1E2D45] overflow-hidden">
            <img src={imgs[activeImg]} alt="" className="w-full h-full object-cover" />
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
              {imgs.map((img, i) => (
                <img key={i} src={img} className={`w-14 h-14 rounded-lg object-cover border-2 cursor-pointer flex-shrink-0 transition-all ${activeImg === i ? "border-blue-500" : "border-transparent"}`} onClick={() => setActiveImg(i)} alt="" />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-[#1E293B] rounded-2xl h-56 flex items-center justify-center mb-5 border border-[#1E2D45] text-6xl">🔧</div>
      )}

      {/* Info */}
      <div className="mb-5">
        <div className="flex gap-1.5 flex-wrap mb-2">
          <Badge type={data?.condition === "used" ? "used" : "new"}>{data?.condition === "used" ? "Usada" : "Nova"}</Badge>
          {data?.part?.brandName && <Badge type="seller">{data.part.brandName}</Badge>}
          {data?.part?.categoryName && <Badge type="neutral">{data.part.categoryName}</Badge>}
        </div>
        <h1 className="text-2xl font-black text-slate-100 mb-1">{data?.part?.name || data?.name || "Peça Automotiva"}</h1>
        <div className="font-mono text-sm text-slate-500 mb-3">OEM: {data?.part?.oemNumber || data?.oemNumber || "—"}</div>
        <div className="text-4xl font-black text-green-400 leading-none mb-1">{fmt(data?.price)}</div>
        <div className="text-sm text-slate-500 mb-5">{data?.warrantyMonths > 0 ? `✅ ${data.warrantyMonths} meses de garantia` : "Sem garantia informada"}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <div className="bg-[#1E293B] border border-[#1E2D45] rounded-[10px] p-3">
          <div className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold mb-1">Estoque</div>
          <div className={`text-sm font-bold ${(data?.stock || 0) > 0 ? "text-green-400" : "text-red-400"}`}>{data?.stock || 0} un.</div>
        </div>
        <div className="bg-[#1E293B] border border-[#1E2D45] rounded-[10px] p-3">
          <div className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold mb-1">Condição</div>
          <div className="text-sm font-bold text-slate-100">{data?.condition === "used" ? "Usada" : "Nova"}</div>
        </div>
        {data?.part?.weightKg > 0 && (
          <div className="bg-[#1E293B] border border-[#1E2D45] rounded-[10px] p-3">
            <div className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold mb-1">Peso</div>
            <div className="text-sm font-bold text-slate-100">{data.part.weightKg} kg</div>
          </div>
        )}
        {data?.warrantyMonths > 0 && (
          <div className="bg-[#1E293B] border border-[#1E2D45] rounded-[10px] p-3">
            <div className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold mb-1">Garantia</div>
            <div className="text-sm font-bold text-slate-100">{data.warrantyMonths} meses</div>
          </div>
        )}
      </div>

      {/* Description */}
      {(data?.part?.description || data?.description) && (
        <div className="mb-5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Descrição</div>
          <p className="text-sm text-slate-400 leading-relaxed">{data.part?.description || data.description}</p>
        </div>
      )}

      {/* Seller */}
      {data?.seller && (
        <div className="mb-5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Vendedor</div>
          <div className="bg-[#1E293B] border border-[#1E2D45] rounded-[10px] p-3.5 flex items-center gap-3">
            {data.seller.photo
              ? <img src={data.seller.photo} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-white text-base flex-shrink-0">{(data.seller.name || "V")[0].toUpperCase()}</div>
            }
            <div className="flex-1">
              <div className="font-semibold text-sm text-slate-100">{data.seller.name}</div>
              <div className="text-xs text-slate-500">{data.seller.sellerVerified ? "✅ Vendedor verificado" : "⏳ Verificação pendente"}</div>
              {data.seller.ratingAvg > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars value={Math.round(data.seller.ratingAvg)} size="sm" />
                  <span className="text-sm font-bold text-green-400">{data.seller.ratingAvg.toFixed(1)}</span>
                  <span className="text-xs text-slate-500">({data.seller.ratingCount})</span>
                </div>
              )}
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="mt-3.5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Avaliações</div>
              {reviews.slice(0,3).map((r, i) => (
                <div key={i} className="bg-[#1E293B] rounded-[10px] p-3 mb-2.5 border border-[#1E2D45]">
                  <div className="flex items-center gap-2 mb-1.5">
                    {r.buyerPhoto
                      ? <img src={r.buyerPhoto} alt="" className="w-7 h-7 rounded-full object-cover" />
                      : <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">{(r.buyerName||"U")[0]}</div>
                    }
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{r.buyerName}</div>
                      <Stars value={r.rating} size="sm" />
                    </div>
                  </div>
                  {r.comment && <div className="text-sm text-slate-500 leading-relaxed">{r.comment}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add to Cart */}
      {(data?.stock || 0) > 0 ? (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2.5">Quantidade</div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-[#2D3F55] rounded-[10px] overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center bg-[#1E293B] text-slate-100 text-lg hover:bg-blue-500 hover:text-white transition-all">−</button>
              <span className="w-12 text-center text-base font-bold text-slate-100">{qty}</span>
              <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="w-10 h-10 flex items-center justify-center bg-[#1E293B] text-slate-100 text-lg hover:bg-blue-500 hover:text-white transition-all">+</button>
            </div>
            <div className="text-sm text-slate-500">Total: <strong className="text-green-400">{fmt(data?.price * qty)}</strong></div>
          </div>
          <Btn onClick={addToCart} className="w-full"><Icons.Cart /> Adicionar ao Carrinho</Btn>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[10px] p-3.5 text-center text-red-400 font-semibold">
          ⚠️ Peça sem estoque no momento
        </div>
      )}
    </div>
  );
}

// ─── CART SCREEN ──────────────────────────────────────────────────────────────
function CartScreen({ cart, onUpdateQty, onRemove, onCheckout, loading }) {
  const total = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  if (cart.length === 0) return (
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      <h1 className="text-2xl font-black text-slate-100 mb-1">Carrinho</h1>
      <EmptyState icon="🛒" title="Carrinho vazio" sub="Adicione peças para continuar" />
    </div>
  );

  return (
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      <h1 className="text-2xl font-black text-slate-100 mb-1">Carrinho</h1>
      <p className="text-sm text-slate-500 mb-4">{totalItems} {totalItems === 1 ? "item" : "itens"}</p>

      {cart.map((item, i) => (
        <div key={item.id || i} className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-3.5 mb-2.5 flex gap-3 items-center">
          <div className="w-12 h-12 rounded-[10px] bg-[#1E293B] flex items-center justify-center text-xl flex-shrink-0 border border-[#1E2D45]">🔧</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-slate-100 mb-0.5 truncate">{item.part?.name || item.name || "Peça"}</div>
            <div className="text-xs text-slate-500 mb-1.5">OEM: {item.part?.oemNumber || item.oemNumber || "—"}</div>
            <div className="flex items-center border border-[#2D3F55] rounded-[10px] overflow-hidden w-fit scale-90 origin-left">
              <button onClick={() => onUpdateQty(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-[#1E293B] text-slate-100 hover:bg-blue-500 hover:text-white transition-all">−</button>
              <span className="w-8 text-center text-sm font-bold text-slate-100">{item.quantity}</span>
              <button onClick={() => onUpdateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-[#1E293B] text-slate-100 hover:bg-blue-500 hover:text-white transition-all">+</button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="text-lg font-black text-green-400">{fmt(item.price * item.quantity)}</div>
            <button onClick={() => onRemove(item.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1"><Icons.X /></button>
          </div>
        </div>
      ))}

      <div className="bg-[#1E293B] border border-[#1E2D45] rounded-2xl p-4 mt-4">
        <div className="flex justify-between items-center mb-2.5 text-sm text-slate-300">
          <span className="text-slate-500">Subtotal</span><span>{fmt(total)}</span>
        </div>
        <div className="flex justify-between items-center mb-2.5 text-sm text-slate-300">
          <span className="text-slate-500">Frete</span><span className="text-slate-500">A combinar</span>
        </div>
        <div className="h-px bg-[#1E2D45] my-2.5" />
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-100">Total</span>
          <span className="text-3xl font-black text-green-400">{fmt(total)}</span>
        </div>
        <Btn onClick={onCheckout} disabled={loading} className="w-full mt-3.5">
          {loading ? "Redirecionando..." : <><Icons.Cart /> Pagar com Mercado Pago</>}
        </Btn>
      </div>
    </div>
  );
}

// ─── ORDERS SCREEN ────────────────────────────────────────────────────────────
function OrdersScreen({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [show, toastEl] = useToast();

  const statusLabel = { pending: "Pendente", confirmed: "Confirmado", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado" };
  const statusBadgeType = { pending: "pending", confirmed: "confirmed", shipped: "shipped", delivered: "delivered", cancelled: "cancelled" };

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
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      {toastEl}

      {/* Review Modal */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setReviewing(null)}>
          <div className="bg-[#0F172A] rounded-t-[20px] p-7 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="font-bold text-lg text-slate-100 mb-1">Avaliar compra</div>
            <div className="text-sm text-slate-500 mb-5">Pedido #{(reviewing.id||"").slice(-8).toUpperCase()}</div>
            <div className="mb-4">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Sua nota</div>
              <Stars value={rating} onChange={setRating} />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Comentário (opcional)</label>
              <textarea className="bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3.5 py-3 text-slate-100 text-sm outline-none focus:border-blue-500 placeholder-slate-500 w-full resize-none" rows={3} placeholder="Como foi sua experiência?" value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <div className="flex gap-2.5">
              <Btn variant="secondary" onClick={() => setReviewing(null)} className="flex-1">Cancelar</Btn>
              <Btn onClick={submitReview} disabled={submitting || !rating} className="flex-1">{submitting ? "Enviando..." : "Enviar avaliação"}</Btn>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-black text-slate-100 mb-1">Meus Pedidos</h1>
      <p className="text-sm text-slate-500 mb-4">Histórico de compras</p>

      {loading ? <Spinner /> : orders.length === 0 ? (
        <EmptyState icon="📦" title="Nenhum pedido ainda" sub="Seus pedidos aparecerão aqui" />
      ) : orders.map((order, i) => (
        <div key={order.id || i} className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-4 mb-3 hover:border-[#2D3F55] transition-colors">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="font-semibold text-sm text-slate-100">Pedido #{(order.id || "").slice(-8).toUpperCase()}</div>
              <div className="text-xs text-slate-500 mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("pt-BR") : "—"}</div>
            </div>
            <Badge type={statusBadgeType[order.status] || "pending"}>{statusLabel[order.status] || order.status}</Badge>
          </div>
          {(order.items || []).map((item, j) => (
            <div key={j} className="flex justify-between py-2 border-b border-[#1E2D45] last:border-0 text-sm text-slate-300">
              <span>{item.name || "Peça"} × {item.quantity}</span>
              <span className="text-slate-500">{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#1E2D45]">
            <span className="font-semibold text-slate-100">Total</span>
            <span className="text-2xl font-black text-green-400">{fmt(order.total)}</span>
          </div>
          {order.status === "delivered" && !order.reviewed && (
            <Btn variant="secondary" onClick={() => setReviewing(order)} className="w-full mt-2.5 text-sm">⭐ Avaliar compra</Btn>
          )}
          {order.reviewed && <div className="mt-2.5 text-xs text-green-400">✅ Avaliação enviada</div>}
        </div>
      ))}
    </div>
  );
}

// ─── SELL SCREEN ──────────────────────────────────────────────────────────────
function SellScreen({ user, setScreen }) {
  if (user?.type !== "seller") return null;
  return <SellDashboard user={user} setScreen={setScreen} />;
}

// ─── SELL FORM SCREEN ─────────────────────────────────────────────────────────
function SellFormScreen({ user }) {
  const [step, setStep] = useState(1);
  const [oem, setOem] = useState("");
  const [masterPart, setMasterPart] = useState(null);
  const [form, setForm] = useState({ price: "", stock: "", condition: "new", warrantyMonths: "0", description: "" });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [show, toastEl] = useToast();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const fileInputRef = useRef();

  const addPhoto = (e) => {
    const files = Array.from(e.target.files || []);
    const toAdd = files.slice(0, 4 - photos.length).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos(p => [...p, ...toAdd]);
    e.target.value = "";
  };

  const searchOEM = async () => {
    if (!oem.trim()) return show("Digite o número OEM ou nome da peça");
    setLoading(true); setSuggestions([]);
    try {
      const res = await fetch(`${API}/parts?oem=${encodeURIComponent(oem)}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.data || []);
      const exact = arr.find(p => p.oemNumber?.toLowerCase() === oem.toLowerCase());
      if (exact) { setMasterPart(exact); setStep(2); return; }
      const partial = arr.filter(p => p.oemNumber?.toLowerCase().includes(oem.toLowerCase()) || p.name?.toLowerCase().includes(oem.toLowerCase()));
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
      const res = await fetch(`${API}/marketplaceParts`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao anunciar");
      show("Peça anunciada com sucesso! 🎉", "success");
      setStep(1); setOem(""); setMasterPart(null); setPhotos([]);
      setForm({ price: "", stock: "", condition: "new", warrantyMonths: "0", description: "" });
    } catch { show("Erro ao anunciar peça"); }
    finally { setLoading(false); }
  };

  return (
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      {toastEl}
      <h1 className="text-2xl font-black text-slate-100 mb-1">Anunciar Peça</h1>
      <p className="text-sm text-slate-500 mb-4">Venda pelo catálogo OEM — sem duplicidade</p>

      {step === 1 ? (
        <>
          <div className="bg-[#111827] border border-amber-500/25 rounded-2xl p-4 mb-5">
            <p className="text-sm text-slate-400 leading-relaxed">🔖 Busque pelo número OEM da peça. Isso garante que compradores encontram a peça correta para seu veículo.</p>
          </div>
          <Input label="Número OEM ou nome da peça" placeholder="ex: NGK-BKR5EIX ou Vela de Ignição" value={oem} onChange={e => { setOem(e.target.value.toUpperCase()); setSuggestions([]); }} onKeyDown={e => e.key === "Enter" && searchOEM()} />
          <Btn onClick={searchOEM} disabled={loading} className="w-full">{loading ? "Buscando..." : "🔍 Buscar no Catálogo OEM"}</Btn>
          {suggestions.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Selecione a peça:</div>
              {suggestions.map((p, i) => (
                <PartCard key={i} item={p} onClick={() => { setMasterPart(p); setStep(2); setSuggestions([]); }} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-[#111827] border border-green-500/30 rounded-2xl p-4 mb-4">
            <div className="flex gap-2.5 items-start">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-semibold text-slate-100">{masterPart?.name}</div>
                <div className="font-mono text-xs text-slate-500">OEM: {masterPart?.oemNumber}</div>
                {masterPart?.description && <div className="text-xs text-slate-500 mt-1">{masterPart.description}</div>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mb-3.5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Fotos da peça <span className="text-slate-600 normal-case font-normal">({photos.length}/4)</span></div>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-[10px] overflow-hidden border border-[#2D3F55]">
                  <img src={p.preview} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setPhotos(ph => ph.filter((_,j) => j !== i))} className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white text-xs leading-none">×</button>
                </div>
              ))}
              {photos.length < 4 && (
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[10px] border border-dashed border-[#2D3F55] flex items-center justify-center text-2xl text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all">📷</button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={addPhoto} />
          </div>

          <div className="grid grid-cols-2 gap-x-3">
            <Input label="Preço (R$)" type="number" placeholder="150.00" value={form.price} onChange={set("price")} />
            <Input label="Qtd. em estoque" type="number" placeholder="1" value={form.stock} onChange={set("stock")} />
            <Select label="Condição" value={form.condition} onChange={set("condition")}>
              <option value="new">Nova</option>
              <option value="used">Usada</option>
            </Select>
            <Input label="Garantia (meses)" type="number" placeholder="0" value={form.warrantyMonths} onChange={set("warrantyMonths")} />
          </div>
          <div className="flex flex-col gap-1.5 mb-3.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Observações</label>
            <textarea className="bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3.5 py-3 text-slate-100 text-sm outline-none focus:border-blue-500 placeholder-slate-500 w-full resize-none" placeholder="Estado, origem, detalhes..." rows={3} value={form.description} onChange={set("description")} />
          </div>
          <div className="flex gap-2.5">
            <Btn variant="secondary" onClick={() => setStep(1)} className="flex-1">Voltar</Btn>
            <Btn onClick={submit} disabled={loading} className="flex-1">{loading ? "Anunciando..." : "📦 Anunciar"}</Btn>
          </div>
        </>
      )}
    </div>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
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

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("pt-BR"));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(pos => setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`));
  }, []);

  useEffect(() => {
    const load = async () => {
      await initFirebase();
      const snap = await firebaseFirestore.getDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", user.uid));
      if (snap.exists()) { const d = snap.data(); setName(d.name||""); setBio(d.bio||""); if (d.photo) setPhoto(d.photo); }
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
      await firebaseFirestore.setDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", user.uid), { name, bio }, { merge: true });
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
      setPhoto(data.data.photo); onUpdateUser?.({ ...user, photo: data.data.photo }); show("Foto atualizada! 🎉", "success");
    } catch {
      try {
        const sRef = firebaseStorage.storageRef(firebaseStorage.instance, `profiles/${user.uid}`);
        await firebaseStorage.uploadBytes(sRef, file);
        const url = await firebaseStorage.getDownloadURL(sRef);
        setPhoto(url);
        await firebaseFirestore.updateDoc(firebaseFirestore.doc(firebaseFirestore.instance, "users", user.uid), { photo: url });
        onUpdateUser?.({ ...user, photo: url }); show("Foto atualizada! 🎉", "success");
      } catch { show("Erro ao atualizar foto"); }
    } finally { setPhotoLoading(false); e.target.value = ""; }
  };

  const logout = async () => { await initFirebase(); await firebaseAuth.signOut(firebaseAuth.instance); onLogout(); };

  return (
    <div className="overflow-y-auto px-4 py-5 pb-24 scrollbar-none">
      {toastEl}

      {/* Avatar */}
      <div className="flex flex-col items-center pt-2 mb-6">
        <div className="relative cursor-pointer mb-3" onClick={() => photoInputRef.current?.click()}>
          {photo
            ? <img src={photo} alt="" className="w-20 h-20 rounded-full object-cover" />
            : <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-black text-white">{initials}</div>
          }
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#111827] border-2 border-[#0F172A] rounded-full flex items-center justify-center text-sm">
            {photoLoading ? "⏳" : "📷"}
          </div>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={uploadPhoto} />
        <div className="text-xl font-bold text-slate-100">{user?.name}</div>
        <div className="text-sm text-slate-500 mb-1.5">{user?.email}</div>
        <Badge type={isSeller ? "seller" : "new"}>{isSeller ? "Vendedor" : "Comprador"}</Badge>
      </div>

      {/* Seller Stats */}
      {isSeller && (
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { num: myParts.length, lbl: "Anúncios" },
            { num: myParts.reduce((s, p) => s + (p.stock || 0), 0), lbl: "Em estoque" },
            { num: myParts.filter(p => p.condition === "new").length, lbl: "Novas" },
          ].map((s, i) => (
            <div key={i} className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-slate-100">{s.num}</div>
              <div className="text-xs text-slate-500">{s.lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile */}
      <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-4 mb-4">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3.5">Editar Perfil</div>
        <Input label="Nome" value={name} onChange={e => setName(e.target.value)} />
        <div className="flex flex-col gap-1.5 mb-3.5">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Bio</label>
          <textarea className="bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3.5 py-3 text-slate-100 text-sm outline-none focus:border-blue-500 placeholder-slate-500 w-full resize-none" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Fale um pouco sobre você..." />
        </div>
        <Btn onClick={saveProfile} disabled={savingProfile} className="w-full">{savingProfile ? "Salvando..." : "Salvar Perfil"}</Btn>
      </div>

      {/* Account Data */}
      <div className="bg-[#111827] border border-[#1E2D45] rounded-2xl p-4 mb-4">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Dados da conta</div>
        {[
          ["Email", user?.email],
          ["Tipo", isSeller ? "Vendedor" : "Comprador"],
          isSeller ? ["Verificação", user?.sellerVerified ? "✅ Verificado" : "⏳ Pendente"] : null,
          time ? ["Hora local", time] : null,
          location ? ["Localização", location] : null,
        ].filter(Boolean).map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm mb-2 last:mb-0">
            <span className="text-slate-500">{k}</span>
            <span className={`font-medium ${k === "Localização" ? "font-mono text-xs text-right" : "text-slate-200"}`}>{v}</span>
          </div>
        ))}
      </div>

      <Btn variant="danger" onClick={logout} className="w-full"><Icons.Logout /> Sair da conta</Btn>
    </div>
  );
}

// ─── PAYMENT SCREENS ──────────────────────────────────────────────────────────
function PaymentSuccessScreen({ setScreen, clearCart }) {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId") || sessionStorage.getItem("pendingOrderId");
  useEffect(() => { clearCart(); sessionStorage.removeItem("pendingOrderId"); window.history.replaceState({}, "", window.location.pathname); }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-5">
      <div className="text-7xl mb-4">🎉</div>
      <h1 className="text-2xl font-black text-green-400 mb-2">Pagamento Aprovado!</h1>
      <p className="text-sm text-slate-500 mb-2">Seu pedido foi confirmado com sucesso.</p>
      {orderId && <div className="font-mono text-xs text-slate-500 bg-[#111827] px-3.5 py-1.5 rounded-full mb-6">Pedido #{orderId.slice(-8).toUpperCase()}</div>}
      <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">O vendedor foi notificado e entrará em contato em breve.</p>
      <Btn onClick={() => setScreen("orders")} className="max-w-xs w-full mb-2.5">Ver Meus Pedidos</Btn>
      <Btn variant="secondary" onClick={() => setScreen("home")} className="max-w-xs w-full">Voltar ao Início</Btn>
    </div>
  );
}

function PaymentFailureScreen({ setScreen }) {
  useEffect(() => { window.history.replaceState({}, "", window.location.pathname); }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-5">
      <div className="text-7xl mb-4">😕</div>
      <h1 className="text-2xl font-black text-red-400 mb-2">Pagamento Recusado</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">Não foi possível processar seu pagamento. Verifique os dados e tente novamente.</p>
      <Btn onClick={() => setScreen("cart")} className="max-w-xs w-full mb-2.5">Tentar Novamente</Btn>
      <Btn variant="secondary" onClick={() => setScreen("home")} className="max-w-xs w-full">Voltar ao Início</Btn>
    </div>
  );
}

function PaymentPendingScreen({ setScreen }) {
  useEffect(() => { window.history.replaceState({}, "", window.location.pathname); }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-5">
      <div className="text-7xl mb-4">⏳</div>
      <h1 className="text-2xl font-black text-amber-400 mb-2">Pagamento Pendente</h1>
      <p className="text-sm text-slate-500 mb-8 max-w-xs leading-relaxed">Seu pagamento está sendo processado. Pode levar alguns minutos.</p>
      <Btn onClick={() => setScreen("orders")} className="max-w-xs w-full mb-2.5">Ver Meus Pedidos</Btn>
      <Btn variant="secondary" onClick={() => setScreen("home")} className="max-w-xs w-full">Voltar ao Início</Btn>
    </div>
  );
}

// ─── SUPPORT SCREEN ───────────────────────────────────────────────────────────
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
        setTimeout(() => { if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; }, 50);
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
    setMsg(""); inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full px-4 py-5 pb-24">
      <h1 className="text-2xl font-black text-slate-100 mb-1">Suporte AutoStore</h1>
      <p className="text-sm text-slate-500 mb-4">Canal de atendimento em tempo real</p>

      <div ref={chatBoxRef} className="flex-1 min-h-0 h-72 overflow-y-auto border border-[#1E2D45] rounded-2xl p-3 mb-3 bg-[#111827] flex flex-col gap-2 scrollbar-none">
        {messages.length === 0 && <div className="text-center text-slate-500 text-sm m-auto">Nenhuma mensagem ainda. Diga olá! 👋</div>}
        {messages.map((m) => {
          const isMine = m.user === user?.email;
          const time = new Date(m.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              <div className={`px-3.5 py-2.5 rounded-xl max-w-[85%] text-sm leading-snug ${isMine ? "bg-blue-500 text-white rounded-br-sm" : "bg-[#1E293B] text-slate-200 rounded-bl-sm border border-[#1E2D45]"}`}>
                {!isMine && <div className="text-[11px] font-semibold text-blue-300 mb-0.5">{m.user}</div>}
                {m.text}
                <div className={`text-[10px] opacity-55 mt-1 text-right`}>{time}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input ref={inputRef} className="flex-1 bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3.5 py-3 text-slate-100 text-sm outline-none focus:border-blue-500 placeholder-slate-500" placeholder="Digite sua mensagem..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
        <button onClick={sendMessage} className="px-4 py-3 bg-blue-500 text-white rounded-[10px] font-bold text-lg hover:bg-blue-600 transition-all flex-shrink-0">➤</button>
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

  useEffect(() => {
    const params = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    if (params.includes("/pagamento/sucesso") || searchParams.get("collection_status") === "approved") setScreen("payment_success");
    else if (params.includes("/pagamento/falha") || searchParams.get("collection_status") === "rejected") setScreen("payment_failure");
    else if (params.includes("/pagamento/pendente") || searchParams.get("collection_status") === "pending") setScreen("payment_pending");
  }, []);

  useEffect(() => {
    initFirebase().then(async () => {
      try {
        const result = await firebaseAuth.getRedirectResult(firebaseAuth.instance);
        if (result?.user) {
          const userRef = firebaseFirestore.doc(firebaseFirestore.instance, "users", result.user.uid);
          const snap = await firebaseFirestore.getDoc(userRef);
          if (!snap.exists()) await firebaseFirestore.setDoc(userRef, { name: result.user.displayName || "Usuário Google", email: result.user.email, photo: result.user.photoURL || null, type: "buyer", sellerVerified: false, active: true, createdAt: new Date().toISOString() });
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

  const addToCart = (item) => setCart(c => {
    const existing = c.find(i => i.id === item.id);
    if (existing) return c.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
    return [...c, item];
  });
  const updateQty = (id, qty) => { if (qty <= 0) return setCart(c => c.filter(i => i.id !== id)); setCart(c => c.map(i => i.id === id ? { ...i, quantity: qty } : i)); };
  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  const checkout = async () => {
    if (cart.length === 0) return;
    setCartLoading(true);
    try {
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
      const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const items = cart.map(i => ({ marketplacePartId: i.id, name: i.part?.name || i.name || "Peça", oemNumber: i.part?.oemNumber || i.oemNumber, sellerId: i.sellerId, price: Number(i.price), quantity: Number(i.quantity) }));
      const res = await fetch(`${API}/payments/create`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ items, total }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao criar pagamento");
      sessionStorage.setItem("pendingOrderId", data.data.orderId);
      window.location.href = data.data.initPoint;
    } catch (e) { show(e.message || "Erro ao ir para pagamento"); }
    finally { setCartLoading(false); }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center gap-2.5 justify-center mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-[10px] flex items-center justify-center">
            <span className="text-white text-xl font-black">A</span>
          </div>
          <span className="text-3xl font-black text-white tracking-wide">AutoStore</span>
        </div>
        <Spinner />
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
    ...(isSeller ? [{ key: "sell", label: "Vender", icon: <Icons.Sell /> }] : []),
    { key: "profile", label: "Conta", icon: <Icons.User /> },
  ];

  // Part detail view
  if (selectedPart) return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto bg-[#0F172A]">
      {toastEl}
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#0F172A] sticky top-0 z-50 border-b border-[#1E2D45]">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><span className="text-white text-sm font-black">A</span></div>
          <span className="text-lg font-black text-slate-100 tracking-wide">AutoStore</span>
        </div>
        <button onClick={() => { setSelectedPart(null); setScreen("cart"); }} className="relative bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3.5 py-2 flex items-center gap-1.5 text-slate-100 text-xs font-medium hover:border-blue-500 hover:bg-[#1E293B] transition-all">
          <Icons.Cart />
          {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-[#0F172A]">{cartCount}</span>}
        </button>
      </div>
      <PartDetailScreen part={selectedPart} onBack={() => setSelectedPart(null)} onAddToCart={(item) => { addToCart(item); }} />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto bg-[#0F172A]">
      {toastEl}

      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#0F172A] sticky top-0 z-50 border-b border-[#1E2D45]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen("home")}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"><span className="text-white text-sm font-black">A</span></div>
          <span className="text-lg font-black text-slate-100 tracking-wide">AutoStore</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScreen("cart")} className="relative bg-[#111827] border border-[#2D3F55] rounded-[10px] px-3 py-2 flex items-center gap-1.5 text-slate-100 text-xs font-medium hover:border-blue-500 hover:bg-[#1E293B] transition-all">
            <Icons.Cart />
            <span>Carrinho</span>
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-[#0F172A]">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Screens */}
      <div className="flex-1 overflow-hidden">
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
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#111827] border-t border-[#1E2D45] flex z-50 pb-[env(safe-area-inset-bottom,8px)]">
        {navItems.map(item => {
          const isActive = screen === item.key || (screen === "results" && item.key === "search") || (screen === "cart" && item.key === "marketplace");
          return (
            <button
              key={item.key}
              onClick={() => setScreen(item.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 pb-1.5 gap-1 text-[10px] font-semibold transition-colors relative ${
                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
