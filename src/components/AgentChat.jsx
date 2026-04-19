import { useState, useRef, useEffect } from "react";
import { getAuth } from "firebase/auth";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── Mapa de perfil visual por tipo de usuário ────────────────────────────────
const PROFILE_INFO = {
  buyer: {
    label: "Assistente de Compras",
    greeting:
      "Olá! Sou seu assistente de autopeças 👋\n\nPosso ajudar você a encontrar a peça certa para o seu veículo com 100% de certeza pelo catálogo OEM.\n\nInforme a **placa do seu veículo** e me diga qual peça você precisa!",
    color: "#2563eb",
    icon: "🔍",
  },
  seller: {
    label: "Assistente de Vendas",
    greeting:
      "Olá, vendedor! Sou seu assistente de publicação 👋\n\nPosso ajudar você a validar códigos OEM e garantir que seus anúncios estejam corretos no catálogo.\n\nMe informe o **código OEM** da peça que deseja anunciar!",
    color: "#16a34a",
    icon: "🏪",
  },
  dismantler: {
    label: "Assistente de Desmanche",
    greeting:
      "Olá! Sou seu assistente de desmanche 👋\n\nPosso identificar seu veículo e gerar o catálogo completo de peças para publicação.\n\nInforme o **número do chassi (VIN)** do veículo que deseja desmontar!",
    color: "#9333ea",
    icon: "🔧",
  },
};

// ─── Renderiza markdown simples (negrito e quebras de linha) ──────────────────
function renderMessage(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function AgentChat({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Determina o perfil a partir do user.type do App.jsx
  const profile =
    user?.type === "dismantler"
      ? "dismantler"
      : user?.type === "seller"
      ? "seller"
      : "buyer";

  const profileInfo = PROFILE_INFO[profile];

  // Inicializa com a mensagem de boas-vindas ao abrir
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          text: profileInfo.greeting,
          id: Date.now(),
        },
      ]);
    }
  }, [open]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Foca o input ao abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text, id: Date.now() }]);
    setLoading(true);

    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) throw new Error("Usuário não autenticado");

      const res = await fetch(`${API}/agent/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erro ao processar resposta");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.data.reply, id: Date.now() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
          id: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClose() {
    setOpen(false);
    setMessages([]);
    setInput("");
  }

  return (
    <>
      {/* ── Botão flutuante ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: profileInfo.color,
            border: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title="Assistente AutoStore"
        >
          🤖
        </button>
      )}

      {/* ── Painel do chat ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 1000,
            width: "100%",
            maxWidth: 400,
            height: "100dvh",
            maxHeight: 620,
            bottom: 24,
            right: 24,
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#fff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: profileInfo.color,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 22 }}>{profileInfo.icon}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}
              >
                {profileInfo.label}
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
                AutoStore · Online agora
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                padding: "4px 8px",
                fontSize: 16,
                lineHeight: 1,
              }}
              title="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Mensagens */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#f8fafc",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "10px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === "user"
                        ? profileInfo.color
                        : msg.error
                        ? "#fef2f2"
                        : "#fff",
                    color:
                      msg.role === "user"
                        ? "#fff"
                        : msg.error
                        ? "#dc2626"
                        : "#1e293b",
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {renderMessage(msg.text)}
                </div>
              </div>
            ))}

            {/* Indicador de digitação */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#94a3b8",
                        display: "inline-block",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: 8,
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: "9px 12px",
                fontSize: 13.5,
                lineHeight: 1.5,
                outline: "none",
                fontFamily: "inherit",
                color: "#1e293b",
                background: loading ? "#f8fafc" : "#fff",
                transition: "border-color 0.15s",
                maxHeight: 100,
                overflowY: "auto",
              }}
              onFocus={(e) => (e.target.style.borderColor = profileInfo.color)}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                background:
                  loading || !input.trim() ? "#e2e8f0" : profileInfo.color,
                border: "none",
                borderRadius: 10,
                width: 40,
                height: 40,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
                alignSelf: "flex-end",
              }}
              title="Enviar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke={loading || !input.trim() ? "#94a3b8" : "#fff"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Animação dos dots */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
