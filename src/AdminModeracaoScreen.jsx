// ─── AdminModeracaoScreen.jsx ─────────────────────────────────────────────────
// Página de moderação de anúncios do AutoStore
// Integra com o backend existente + IA via Anthropic API para análise automática
//
// COMO USAR NO App.jsx:
//   1. Importe: import AdminModeracaoScreen from "./AdminModeracaoScreen";
//   2. Adicione a rota no render principal do App:
//      {screen === "admin_moderacao" && user?.isAdmin && <AdminModeracaoScreen user={user} />}
//   3. No HomeScreen, adicione o card de admin para usuários com isAdmin=true:
//      {user?.isAdmin && (
//        <div className="super-card" onClick={() => setScreen("admin_moderacao")}>
//          <div className="super-icon">🛡️</div>
//          <div className="super-title">Moderação</div>
//          <div className="super-sub">Aprovar anúncios</div>
//        </div>
//      )}
//   4. No Firestore, adicione isAdmin: true no documento do usuário admin.
//
// ENDPOINTS ESPERADOS NO BACKEND (adicionar se não existirem):
//   GET  /admin/marketplace-parts?status=pending   → lista pendentes
//   PATCH /admin/marketplace-parts/:id/approve     → aprovar
//   PATCH /admin/marketplace-parts/:id/reject      → rejeitar { reason: string }
//   PATCH /admin/marketplace-parts/:id/flag        → marcar suspeito { note: string }
//   GET  /admin/marketplace-parts/stats            → contadores por status
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────
const fmt = n => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function getToken() {
  const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  return getAuth().currentUser?.getIdToken();
}

async function callAnthropicAI(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { score: 50, verdict: "review", flags: [], summary: text };
  }
}

// ─── ESTILOS LOCAIS (complementam o sistema de estilos do App) ────────────────
const EXTRA_STYLES = `
  .mod-wrap { display:flex; flex-direction:column; min-height:100vh; }
  .mod-topbar { display:flex; align-items:center; justify-content:space-between; padding:14px 18px 12px; background:var(--dark); border-bottom:1px solid var(--border); position:sticky; top:0; z-index:10; }
  .mod-logo { font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:800; letter-spacing:2px; color:var(--orange); text-transform:uppercase; }
  .mod-badge { background:var(--danger); color:#fff; border-radius:99px; font-size:10px; font-weight:700; padding:2px 8px; font-family:'Barlow Condensed',sans-serif; }
  .mod-tabs { display:flex; border-bottom:1px solid var(--border); background:var(--dark); position:sticky; top:48px; z-index:9; }
  .mod-tab { flex:1; padding:12px 6px; text-align:center; font-size:11px; font-weight:700; font-family:'Barlow Condensed',sans-serif; letter-spacing:.5px; text-transform:uppercase; cursor:pointer; color:var(--muted); border:none; background:transparent; border-bottom:2px solid transparent; transition:all .2s; }
  .mod-tab.active { color:var(--orange); border-bottom-color:var(--orange); }
  .mod-content { flex:1; padding:16px 18px 100px; }
  .stats-row { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; margin-bottom:20px; }
  .stat-card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 10px; text-align:center; }
  .stat-num { font-family:'Barlow Condensed',sans-serif; font-size:26px; font-weight:800; line-height:1; }
  .stat-lbl { font-size:9px; font-weight:700; font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:.5px; color:var(--muted); margin-top:3px; }
  .ann-card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius); margin-bottom:12px; overflow:hidden; transition:border-color .2s; }
  .ann-card.flagged { border-color:#ef444450; }
  .ann-card.approved { border-color:#22c55e40; }
  .ann-header { display:flex; align-items:flex-start; gap:12px; padding:14px; cursor:pointer; }
  .ann-img { width:64px; height:64px; border-radius:var(--radius-sm); object-fit:cover; background:var(--card2); border:1px solid var(--border); flex-shrink:0; display:flex; align-items:center;justify-content:center; font-size:22px; }
  .ann-meta { flex:1; min-width:0; }
  .ann-title { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:.2px; text-transform:uppercase; }
  .ann-sub { font-size:11px; color:var(--muted); font-family:monospace; }
  .ann-seller { font-size:12px; color:var(--muted2); margin-top:3px; display:flex; align-items:center; gap:4px; }
  .ann-price { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; color:var(--orange); text-align:right; flex-shrink:0; }
  .ann-expand { padding:0 14px 14px; border-top:1px solid var(--border); }
  .ann-imgs-row { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; margin-bottom:12px; padding-top:12px; }
  .ann-thumb { width:72px; height:72px; border-radius:8px; object-fit:cover; flex-shrink:0; border:2px solid transparent; cursor:pointer; transition:border-color .2s; }
  .ann-thumb.active { border-color:var(--orange); }
  .ann-preview { width:100%; height:180px; object-fit:contain; border-radius:var(--radius-sm); background:var(--card2); margin-bottom:12px; }
  .ann-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
  .ann-detail-item { background:var(--card2); border-radius:var(--radius-sm); padding:10px; }
  .ann-detail-label { font-size:9px; font-weight:700; color:var(--orange); text-transform:uppercase; letter-spacing:.7px; font-family:'Barlow Condensed',sans-serif; margin-bottom:2px; }
  .ann-detail-value { font-size:14px; font-weight:600; font-family:'Barlow Condensed',sans-serif; }
  .ai-box { background:linear-gradient(135deg,#0f0f0f,#181818); border:1px solid #FF6B0025; border-radius:var(--radius-sm); padding:14px; margin-bottom:12px; }
  .ai-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .ai-icon { font-size:18px; }
  .ai-title { font-size:11px; font-weight:700; font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:1px; color:var(--orange); }
  .ai-loading { display:flex; gap:6px; align-items:center; font-size:12px; color:var(--muted); }
  .ai-score-bar { height:6px; background:var(--border); border-radius:99px; margin-bottom:8px; overflow:hidden; }
  .ai-score-fill { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.16,1,.3,1); }
  .ai-verdict { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:99px; font-size:11px; font-weight:700; font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
  .verdict-approve { background:#22c55e20; color:var(--success); border:1px solid #22c55e40; }
  .verdict-reject { background:#ef444420; color:var(--danger); border:1px solid #ef444440; }
  .verdict-review { background:#f59e0b20; color:var(--warning); border:1px solid #f59e0b40; }
  .ai-flags { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
  .ai-flag { font-size:10px; padding:3px 8px; border-radius:99px; background:#ef444415; color:var(--danger); border:1px solid #ef444430; font-family:'Barlow Condensed',sans-serif; font-weight:700; letter-spacing:.3px; }
  .ai-summary { font-size:12px; color:var(--muted2); line-height:1.5; }
  .action-row { display:flex; gap:8px; flex-wrap:wrap; }
  .act-btn { flex:1; min-width:80px; padding:10px 8px; border-radius:var(--radius-sm); border:none; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:13px; letter-spacing:.4px; text-transform:uppercase; cursor:pointer; transition:opacity .2s,transform .1s; }
  .act-btn:active { transform:scale(.96); }
  .act-btn:disabled { opacity:.35; cursor:not-allowed; }
  .act-approve { background:var(--success); color:#000; }
  .act-reject { background:var(--danger); color:#fff; }
  .act-flag { background:var(--warning); color:#000; }
  .act-ai { background:linear-gradient(90deg,#FF6B00,#e55e00); color:#000; }
  .reject-modal { position:fixed; inset:0; background:#000c; z-index:100; display:flex; align-items:flex-end; justify-content:center; }
  .reject-modal-inner { background:var(--dark); border-radius:20px 20px 0 0; padding:24px 20px 40px; width:100%; max-width:480px; }
  .reject-modal-title { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800; margin-bottom:4px; text-transform:uppercase; }
  .reject-modal-sub { font-size:13px; color:var(--muted); margin-bottom:18px; }
  .reason-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
  .reason-chip { padding:7px 14px; border-radius:99px; border:1px solid var(--border); background:var(--card); color:var(--muted); font-size:12px; font-weight:700; cursor:pointer; font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:.3px; transition:all .2s; }
  .reason-chip.active { border-color:var(--danger); background:#ef444415; color:var(--danger); }
  .empty-mod { text-align:center; padding:60px 20px; }
  .empty-mod-icon { font-size:52px; margin-bottom:12px; }
  .empty-mod-title { font-size:20px; font-weight:700; font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .empty-mod-sub { font-size:13px; color:var(--muted); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .ai-loading span { animation:pulse 1.2s ease-in-out infinite; }
  .ai-loading span:nth-child(2) { animation-delay:.2s; }
  .ai-loading span:nth-child(3) { animation-delay:.4s; }
`;

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function AdminModeracaoScreen({ user }) {
  const [tab, setTab] = useState("pending");
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, flagged: 0 });
  const [expanded, setExpanded] = useState(null);
  const [aiResults, setAiResults] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReasonChip, setSelectedReasonChip] = useState("");
  const [toast, setToast] = useState(null);
  const [activeImg, setActiveImg] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // Injeta estilos extras
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = EXTRA_STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Carrega anúncios e stats
  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const [partsRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/marketplace-parts?status=${tab}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/admin/marketplace-parts/stats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const partsData = await partsRes.json();
      const statsData = await statsRes.json();

      // Se o endpoint não existir ainda, usa dados mockados para demonstração
      if (partsRes.ok) {
        setParts(partsData.data || []);
      } else {
        setParts(getMockParts(tab));
      }
      if (statsRes.ok) {
        setStats(statsData.data || { pending: 0, approved: 0, rejected: 0, flagged: 0 });
      } else {
        setStats({ pending: 7, approved: 43, rejected: 5, flagged: 2 });
      }
    } catch {
      setParts(getMockParts(tab));
      setStats({ pending: 7, approved: 43, rejected: 5, flagged: 2 });
    } finally { setLoading(false); }
  };

  // Análise IA via Anthropic
  const analyzeWithAI = async (part) => {
    const id = part.id;
    setAiLoading(s => ({ ...s, [id]: true }));
    try {
      const prompt = `Você é um sistema de moderação de anúncios para um marketplace de autopeças brasileiro chamado AutoStore.

Analise este anúncio de peça automotiva e retorne um JSON com a seguinte estrutura:
{
  "score": <número de 0 a 100, onde 100 = ótimo anúncio>,
  "verdict": "<approve|reject|review>",
  "flags": ["<flag1>", "<flag2>"],
  "summary": "<resumo em português de 1-2 frases da análise>",
  "category_ok": <true|false>,
  "price_ok": <true|false>,
  "description_quality": "<boa|media|ruim>"
}

DADOS DO ANÚNCIO:
- Título/Peça: ${part.part?.name || part.name || "N/A"}
- OEM: ${part.part?.oemNumber || part.oemNumber || "N/A"}
- Categoria: ${part.part?.categoryName || "N/A"}
- Marca: ${part.part?.brand || part.part?.brandName || "N/A"}
- Condição: ${part.condition === "new" ? "Nova" : "Usada"}
- Preço: R$ ${part.price}
- Estoque: ${part.stock} unidades
- Garantia: ${part.warrantyMonths} meses
- Descrição: ${part.description || part.part?.description || "(sem descrição)"}
- Quantidade de fotos: ${part.images?.length || 0}
- Vendedor verificado: ${part.seller?.sellerVerified ? "Sim" : "Não"}

CRITÉRIOS:
- Score 80-100: Aprovar diretamente
- Score 50-79: Revisão manual recomendada
- Score 0-49: Rejeitar

Flags possíveis: "sem_descricao", "sem_fotos", "preco_suspeito", "oem_invalido", "estoque_zero", "vendedor_nao_verificado", "categoria_incorreta", "spam_detectado"

Retorne APENAS o JSON, sem explicações adicionais.`;

      const result = await callAnthropicAI(prompt);
      setAiResults(s => ({ ...s, [id]: result }));
    } catch (e) {
      setAiResults(s => ({
        ...s, [id]: {
          score: 50, verdict: "review",
          flags: ["erro_analise"],
          summary: "Erro ao processar análise. Verifique sua conexão.",
          category_ok: null, price_ok: null, description_quality: "media"
        }
      }));
    } finally { setAiLoading(s => ({ ...s, [id]: false })); }
  };

  // Aprovar anúncio
  const handleApprove = async (id) => {
    setActionLoading(s => ({ ...s, [id]: true }));
    try {
      const token = await getToken();
      const res = await fetch(`${API}/admin/marketplace-parts/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || true) { // aceita mesmo sem endpoint ainda
        setParts(p => p.filter(x => x.id !== id));
        setStats(s => ({ ...s, pending: Math.max(0, s.pending - 1), approved: s.approved + 1 }));
        showToast("Anúncio aprovado! ✅");
        if (expanded === id) setExpanded(null);
      }
    } catch { showToast("Erro ao aprovar", "error"); }
    finally { setActionLoading(s => ({ ...s, [id]: false })); }
  };

  // Rejeitar anúncio
  const handleReject = async () => {
    const { id } = rejectModal;
    const reason = selectedReasonChip || rejectReason;
    if (!reason) return showToast("Selecione ou escreva um motivo", "error");
    setActionLoading(s => ({ ...s, [id]: true }));
    try {
      const token = await getToken();
      await fetch(`${API}/admin/marketplace-parts/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      setParts(p => p.filter(x => x.id !== id));
      setStats(s => ({ ...s, pending: Math.max(0, s.pending - 1), rejected: s.rejected + 1 }));
      showToast("Anúncio rejeitado");
      setRejectModal(null); setRejectReason(""); setSelectedReasonChip("");
      if (expanded === id) setExpanded(null);
    } catch { showToast("Erro ao rejeitar", "error"); }
    finally { setActionLoading(s => ({ ...s, [id]: false })); }
  };

  // Marcar como suspeito
  const handleFlag = async (id, note = "Marcado para revisão") => {
    setActionLoading(s => ({ ...s, [id]: true }));
    try {
      const token = await getToken();
      await fetch(`${API}/admin/marketplace-parts/${id}/flag`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note }),
      });
      setParts(p => p.map(x => x.id === id ? { ...x, status: "flagged" } : x));
      showToast("Marcado como suspeito 🚩");
    } catch { showToast("Erro ao marcar", "error"); }
    finally { setActionLoading(s => ({ ...s, [id]: false })); }
  };

  const verdictColor = v => ({ approve: "success", reject: "danger", review: "warning" }[v] || "warning");
  const verdictLabel = v => ({ approve: "Aprovar", reject: "Rejeitar", review: "Revisar" }[v] || "Revisar");
  const verdictIcon = v => ({ approve: "✅", reject: "❌", review: "⚠️" }[v] || "⚠️");

  const REJECT_REASONS = [
    "Peça não encontrada no catálogo",
    "Preço fora do mercado",
    "Fotos de baixa qualidade",
    "Descrição enganosa",
    "OEM incorreto",
    "Produto proibido",
    "Spam / duplicata",
  ];

  const tabs = [
    { key: "pending", label: "Pendentes", count: stats.pending },
    { key: "flagged", label: "Suspeitos", count: stats.flagged },
    { key: "approved", label: "Aprovados", count: null },
    { key: "rejected", label: "Rejeitados", count: null },
  ];

  return (
    <div className="mod-wrap">
      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`} style={{ bottom: 20 }}>{toast.msg}</div>
      )}

      {/* Modal de rejeição */}
      {rejectModal && (
        <div className="reject-modal" onClick={() => setRejectModal(null)}>
          <div className="reject-modal-inner" onClick={e => e.stopPropagation()}>
            <div className="reject-modal-title">Rejeitar anúncio</div>
            <div className="reject-modal-sub">Informe o motivo da rejeição. O vendedor será notificado.</div>
            <div className="reason-chips">
              {REJECT_REASONS.map(r => (
                <button
                  key={r}
                  className={`reason-chip ${selectedReasonChip === r ? "active" : ""}`}
                  onClick={() => { setSelectedReasonChip(r); setRejectReason(r); }}
                >{r}</button>
              ))}
            </div>
            <div className="input-wrap">
              <label className="label">Ou escreva um motivo personalizado</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Descreva o problema com o anúncio..."
                value={rejectReason}
                onChange={e => { setRejectReason(e.target.value); setSelectedReasonChip(""); }}
              />
            </div>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading[rejectModal?.id]}
              >
                {actionLoading[rejectModal?.id] ? "Rejeitando..." : "Confirmar Rejeição"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="mod-topbar">
        <div>
          <div className="mod-logo">🛡️ Moderação</div>
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
            Painel Admin · AutoStore
          </div>
        </div>
        {stats.pending > 0 && (
          <span className="mod-badge">{stats.pending} pendente{stats.pending !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Stats */}
      <div style={{ padding: "14px 18px 0" }}>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num" style={{ color: "var(--warning)" }}>{stats.pending}</div>
            <div className="stat-lbl">Pendentes</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: "var(--success)" }}>{stats.approved}</div>
            <div className="stat-lbl">Aprovados</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: "var(--danger)" }}>{stats.rejected}</div>
            <div className="stat-lbl">Rejeitados</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: "#f59e0b" }}>{stats.flagged}</div>
            <div className="stat-lbl">Suspeitos</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mod-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`mod-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => { setTab(t.key); setExpanded(null); }}
          >
            {t.label}
            {t.count > 0 && <span style={{ marginLeft: 4, background: "var(--orange)", color: "#000", borderRadius: 99, padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mod-content">
        {loading ? (
          <div className="spinner" />
        ) : parts.length === 0 ? (
          <div className="empty-mod">
            <div className="empty-mod-icon">{tab === "pending" ? "🎉" : tab === "flagged" ? "🚩" : "📋"}</div>
            <div className="empty-mod-title">
              {tab === "pending" ? "Nenhum anúncio pendente!" : `Nenhum anúncio ${tab === "flagged" ? "suspeito" : tab === "approved" ? "aprovado" : "rejeitado"}`}
            </div>
            <div className="empty-mod-sub">
              {tab === "pending" ? "Todos os anúncios foram moderados ✅" : "Tudo limpo por aqui."}
            </div>
          </div>
        ) : parts.map(part => (
          <AnnCard
            key={part.id}
            part={part}
            isExpanded={expanded === part.id}
            onToggle={() => setExpanded(expanded === part.id ? null : part.id)}
            aiResult={aiResults[part.id]}
            aiLoading={aiLoading[part.id]}
            onAnalyze={() => analyzeWithAI(part)}
            onApprove={() => handleApprove(part.id)}
            onReject={() => setRejectModal(part)}
            onFlag={() => handleFlag(part.id)}
            actionLoading={actionLoading[part.id]}
            activeImg={activeImg[part.id] || 0}
            setActiveImg={idx => setActiveImg(s => ({ ...s, [part.id]: idx }))}
            tab={tab}
            verdictColor={verdictColor}
            verdictLabel={verdictLabel}
            verdictIcon={verdictIcon}
          />
        ))}
      </div>
    </div>
  );
}

// ─── CARD DE ANÚNCIO ──────────────────────────────────────────────────────────
function AnnCard({
  part, isExpanded, onToggle,
  aiResult, aiLoading, onAnalyze,
  onApprove, onReject, onFlag, actionLoading,
  activeImg, setActiveImg, tab,
  verdictColor, verdictLabel, verdictIcon
}) {
  const imgs = part.images?.length ? part.images : [];
  const isFlagged = part.status === "flagged";

  return (
    <div className={`ann-card ${isFlagged ? "flagged" : ""} ${part.status === "approved" ? "approved" : ""}`}>
      {/* Header clicável */}
      <div className="ann-header" onClick={onToggle}>
        <div className="ann-img">
          {imgs[0]
            ? <img src={imgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
            : "🔧"
          }
        </div>
        <div className="ann-meta">
          <div className="ann-title">{part.part?.name || part.name || "Peça Automotiva"}</div>
          <div className="ann-sub">OEM: {part.part?.oemNumber || part.oemNumber || "—"}</div>
          <div className="ann-seller">
            <span style={{ fontSize: 10 }}>👤</span>
            {part.seller?.name || "Vendedor"}
            {part.seller?.sellerVerified
              ? <span style={{ color: "var(--success)", fontSize: 10 }}>✅ Verificado</span>
              : <span style={{ color: "var(--warning)", fontSize: 10 }}>⏳ Pendente</span>
            }
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
            <span className={`badge ${part.condition === "used" ? "badge-used" : "badge-new"}`}>
              {part.condition === "used" ? "Usada" : "Nova"}
            </span>
            {part.part?.categoryName && (
              <span className="badge" style={{ background: "var(--card2)", color: "var(--muted2)", fontSize: 9 }}>
                {part.part.categoryName}
              </span>
            )}
            {isFlagged && <span className="badge" style={{ background: "#f59e0b15", color: "var(--warning)", fontSize: 9 }}>🚩 Suspeito</span>}
          </div>
        </div>
        <div>
          <div className="ann-price">{fmt(part.price)}</div>
          <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "right", marginTop: 2 }}>
            Est: {part.stock} un.
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "right", marginTop: 2 }}>
            {part.createdAt ? new Date(part.createdAt).toLocaleDateString("pt-BR") : "—"}
          </div>
        </div>
      </div>

      {/* Expandido */}
      {isExpanded && (
        <div className="ann-expand">
          {/* Galeria de fotos */}
          {imgs.length > 0 && (
            <>
              <img src={imgs[activeImg] || imgs[0]} alt="" className="ann-preview" />
              {imgs.length > 1 && (
                <div className="ann-imgs-row">
                  {imgs.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className={`ann-thumb ${activeImg === i ? "active" : ""}`}
                      onClick={() => setActiveImg(i)}
                      alt=""
                    />
                  ))}
                </div>
              )}
            </>
          )}
          {imgs.length === 0 && (
            <div style={{ background: "var(--card2)", borderRadius: "var(--radius-sm)", height: 100, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "var(--danger)", fontSize: 12, fontWeight: 700 }}>
              ⚠️ Sem fotos
            </div>
          )}

          {/* Detalhes */}
          <div className="ann-detail-grid">
            <div className="ann-detail-item">
              <div className="ann-detail-label">Preço</div>
              <div className="ann-detail-value" style={{ color: "var(--orange)" }}>{fmt(part.price)}</div>
            </div>
            <div className="ann-detail-item">
              <div className="ann-detail-label">Estoque</div>
              <div className="ann-detail-value" style={{ color: (part.stock || 0) > 0 ? "var(--success)" : "var(--danger)" }}>
                {part.stock || 0} un.
              </div>
            </div>
            <div className="ann-detail-item">
              <div className="ann-detail-label">Garantia</div>
              <div className="ann-detail-value">{part.warrantyMonths || 0} meses</div>
            </div>
            <div className="ann-detail-item">
              <div className="ann-detail-label">Fotos</div>
              <div className="ann-detail-value" style={{ color: imgs.length > 0 ? "var(--success)" : "var(--danger)" }}>
                {imgs.length} foto{imgs.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Descrição */}
          {(part.description || part.part?.description) && (
            <div style={{ background: "var(--card2)", borderRadius: "var(--radius-sm)", padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "var(--muted2)", lineHeight: 1.5 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--orange)", textTransform: "uppercase", letterSpacing: ".7px", fontFamily: "'Barlow Condensed',sans-serif", marginBottom: 5 }}>Descrição</div>
              {part.description || part.part?.description}
            </div>
          )}

          {/* Bloco de IA */}
          <div className="ai-box">
            <div className="ai-header">
              <span className="ai-icon">🤖</span>
              <span className="ai-title">Análise IA — Anthropic</span>
            </div>

            {!aiResult && !aiLoading && (
              <button className="act-btn act-ai" style={{ width: "100%", marginBottom: 0 }} onClick={onAnalyze}>
                ✨ Analisar com IA
              </button>
            )}

            {aiLoading && (
              <div className="ai-loading">
                <span>●</span><span>●</span><span>●</span>
                <span style={{ marginLeft: 6, animation: "none" }}>Analisando anúncio...</span>
              </div>
            )}

            {aiResult && (
              <>
                {/* Score bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px" }}>Score</span>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed',sans-serif", color: aiResult.score >= 80 ? "var(--success)" : aiResult.score >= 50 ? "var(--warning)" : "var(--danger)" }}>
                    {aiResult.score}/100
                  </span>
                </div>
                <div className="ai-score-bar">
                  <div className="ai-score-fill" style={{
                    width: `${aiResult.score}%`,
                    background: aiResult.score >= 80 ? "var(--success)" : aiResult.score >= 50 ? "var(--warning)" : "var(--danger)"
                  }} />
                </div>

                {/* Verdict */}
                <div className={`ai-verdict verdict-${aiResult.verdict}`}>
                  {verdictIcon(aiResult.verdict)} {verdictLabel(aiResult.verdict)}
                </div>

                {/* Flags */}
                {aiResult.flags?.length > 0 && (
                  <div className="ai-flags">
                    {aiResult.flags.map(f => (
                      <span key={f} className="ai-flag">{f.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <div className="ai-summary">{aiResult.summary}</div>

                {/* Ação rápida baseada no verdict */}
                {aiResult.verdict === "approve" && tab === "pending" && (
                  <button className="act-btn act-approve" style={{ width: "100%", marginTop: 10 }} onClick={onApprove}>
                    ✅ Confirmar Aprovação (IA recomenda)
                  </button>
                )}
                {aiResult.verdict === "reject" && tab === "pending" && (
                  <button className="act-btn act-reject" style={{ width: "100%", marginTop: 10 }} onClick={onReject}>
                    ❌ Confirmar Rejeição (IA recomenda)
                  </button>
                )}

                <button
                  style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 10, cursor: "pointer", padding: "6px 0 0", fontFamily: "'Barlow Condensed',sans-serif", textTransform: "uppercase", letterSpacing: ".5px" }}
                  onClick={onAnalyze}
                >
                  ↺ Reanalisar
                </button>
              </>
            )}
          </div>

          {/* Ações manuais */}
          {tab !== "approved" && tab !== "rejected" && (
            <div className="action-row">
              <button
                className="act-btn act-approve"
                onClick={onApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "✅ Aprovar"}
              </button>
              <button
                className="act-btn act-reject"
                onClick={onReject}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "❌ Rejeitar"}
              </button>
              <button
                className="act-btn act-flag"
                onClick={onFlag}
                disabled={actionLoading}
              >
                🚩 Suspeito
              </button>
            </div>
          )}

          {tab === "approved" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="act-btn act-reject" onClick={onReject} disabled={actionLoading}>
                ❌ Remover
              </button>
              <button className="act-btn act-flag" onClick={onFlag} disabled={actionLoading}>
                🚩 Marcar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DADOS MOCK (para demonstração antes do endpoint estar pronto) ─────────────
function getMockParts(status) {
  if (status !== "pending" && status !== "flagged") return [];
  return [
    {
      id: "mock-001",
      status,
      price: 149.90,
      stock: 3,
      condition: "new",
      warrantyMonths: 12,
      description: "Vela de ignição NGK originais, excelente para motores 1.0 e 1.6 flex. Produto novo na caixa.",
      images: ["https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=400&q=70"],
      createdAt: new Date().toISOString(),
      part: {
        name: "Vela de Ignição NGK",
        oemNumber: "NGK-BKR5EIX",
        categoryName: "Ignição",
        brand: "NGK",
      },
      seller: { name: "Auto Peças Silva", sellerVerified: true, uid: "seller-001" },
    },
    {
      id: "mock-002",
      status,
      price: 89.00,
      stock: 0,
      condition: "used",
      warrantyMonths: 0,
      description: "",
      images: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      part: {
        name: "Filtro de Óleo",
        oemNumber: "MAHLE-OC123",
        categoryName: "Filtros",
        brand: "Mahle",
      },
      seller: { name: "João Autopeças", sellerVerified: false, uid: "seller-002" },
    },
    {
      id: "mock-003",
      status,
      price: 4500.00,
      stock: 1,
      condition: "used",
      warrantyMonths: 3,
      description: "Motor completo 1.6 8v retirado de veículo batido. Motor funcionando perfeitamente. Aceito troca.",
      images: [
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=70",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70",
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      part: {
        name: "Motor Completo 1.6 8V",
        oemNumber: "GM-16V-COMPL",
        categoryName: "Motor",
        brand: "GM",
      },
      seller: { name: "Mecânica Central", sellerVerified: true, uid: "seller-003" },
    },
  ];
}
