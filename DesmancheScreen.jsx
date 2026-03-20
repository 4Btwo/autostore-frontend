// ═══════════════════════════════════════════════════════════════════════════════
// AUTOSTORE — DesmancheScreen
// Cole este componente no App.jsx antes da seção // ─── APP ───
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. CSS — adicionar junto com os outros estilos ──────────────────────────
/*
  .chassi-input-wrap{position:relative;margin-bottom:16px}
  .chassi-input{width:100%;background:var(--dark);border:2px solid var(--border);border-radius:var(--radius);padding:14px 16px;font-size:16px;color:var(--text);font-family:'DM Sans',sans-serif;letter-spacing:2px;text-transform:uppercase;transition:border-color .2s}
  .chassi-input:focus{outline:none;border-color:var(--accent)}
  .chassi-len{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--muted)}
  .vehicle-card{background:var(--dark);border:1px solid var(--accent);border-radius:var(--radius);padding:18px;margin-bottom:20px;position:relative;overflow:hidden}
  .vehicle-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),#FF6B00)}
  .vehicle-card-brand{font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--accent);letter-spacing:2px;line-height:1}
  .vehicle-card-model{font-size:16px;font-weight:700;color:var(--text);margin-top:2px}
  .vehicle-card-specs{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
  .vehicle-spec-pill{background:var(--card2);border-radius:20px;padding:4px 12px;font-size:11px;color:var(--muted2);font-weight:500}
  .vehicle-mock-warn{background:#f5a62315;border:1px solid #f5a62340;border-radius:var(--radius-sm);padding:10px 14px;font-size:12px;color:#f5a623;margin-top:12px;line-height:1.5}
  .sub-grid{display:grid;gap:10px;margin-bottom:24px}
  .sub-card{background:var(--dark);border:1.5px solid var(--border);border-radius:var(--radius);padding:16px;cursor:pointer;transition:all .18s;user-select:none;position:relative;overflow:hidden}
  .sub-card.selected{border-color:var(--accent);background:rgba(245,166,35,0.05)}
  .sub-card.selected::after{content:'✓';position:absolute;top:12px;right:14px;font-size:16px;color:var(--accent);font-weight:700}
  .sub-card-header{display:flex;align-items:center;gap:10px;margin-bottom:6px}
  .sub-card-icon{font-size:22px;flex-shrink:0}
  .sub-card-label{font-size:15px;font-weight:700;color:var(--text)}
  .sub-card-count{font-size:12px;color:var(--muted)}
  .sub-card-parts{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
  .sub-part-tag{background:var(--card2);border-radius:4px;padding:2px 7px;font-size:10px;color:var(--muted2)}
  .sub-part-tag.more{color:var(--accent)}
  .publish-bar{background:var(--dark);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:16px}
  .publish-bar-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  .publish-bar-count{font-size:24px;font-weight:700;color:var(--accent)}
  .publish-bar-label{font-size:13px;color:var(--muted)}
  .progress-bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden}
  .progress-fill{height:100%;background:var(--accent);transition:width .3s}
  .step-indicator{display:flex;align-items:center;gap:8px;margin-bottom:20px}
  .step-dot{width:8px;height:8px;border-radius:50%;background:var(--border);transition:background .2s}
  .step-dot.done{background:var(--accent)}
  .step-line{flex:1;height:2px;background:var(--border)}
  .step-line.done{background:var(--accent)}
*/

// ─── 2. Componente DesmancheScreen ───────────────────────────────────────────
function DesmancheScreen({ user }) {
  const [step, setStep] = React.useState(1); // 1: input VIN | 2: selecionar subs | 3: publicando | 4: sucesso
  const [vin, setVin] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [vehicleData, setVehicleData] = React.useState(null);
  const [catalog, setCatalog] = React.useState([]);
  const [selected, setSelected] = React.useState(new Set(["freios", "eletrica", "escapamento"]));
  const [publishing, setPublishing] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [show, toastEl] = useToast();

  const totalParts = catalog
    .filter(s => selected.has(s.id))
    .reduce((acc, s) => acc + s.totalParts, 0);

  const handleVinChange = e => {
    const val = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").substring(0, 17);
    setVin(val);
  };

  const searchChassi = async () => {
    if (vin.length !== 17) return show("O chassi deve ter 17 caracteres");
    setLoading(true);
    try {
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
      const res = await fetch(`${API}/chassi/${vin}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao consultar chassi");
      setVehicleData(data.data.vehicle);
      setCatalog(data.data.catalog);
      setStep(2);
    } catch { show("Erro de conexão"); }
    finally { setLoading(false); }
  };

  const toggleSub = id => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(catalog.map(s => s.id)));
  const clearAll = () => setSelected(new Set());

  const publish = async () => {
    if (selected.size === 0) return show("Selecione ao menos uma subcoleção");
    setPublishing(true);
    setStep(3);
    try {
      await initFirebase();
      const token = await firebaseAuth.instance.currentUser?.getIdToken();
      const res = await fetch(`${API}/chassi/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vin,
          vehicleData,
          selectedSubcollections: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (!res.ok) return show(data.message || "Erro ao publicar");
      setResult(data.data);
      setStep(4);
    } catch { show("Erro ao publicar"); setStep(2); }
    finally { setPublishing(false); }
  };

  const reset = () => {
    setStep(1); setVin(""); setVehicleData(null); setCatalog([]);
    setSelected(new Set(["freios", "eletrica", "escapamento"])); setResult(null);
  };

  return (
    <div className="screen">
      {toastEl}

      {/* Header */}
      <div className="page-title">Desmanche por Chassi</div>
      <div className="page-sub">Publique todas as peças de um veículo de uma vez</div>

      {/* Step indicator */}
      <div className="step-indicator" style={{ marginBottom: 24 }}>
        {[1,2,3].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step-dot ${step > s ? "done" : step === s ? "done" : ""}`} />
            {i < 2 && <div className={`step-line ${step > s ? "done" : ""}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: Input VIN ── */}
      {step === 1 && (
        <>
          <div className="card" style={{ borderColor: "#f5a62325", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>
              🔑 Digite o <strong style={{ color: "var(--text)" }}>número do chassi (VIN)</strong> do veículo. O sistema gera automaticamente o catálogo completo de peças agrupadas por subcoleção.
            </div>
          </div>

          <div className="chassi-input-wrap">
            <input
              className="chassi-input"
              placeholder="9BWZZZ377VT004251"
              value={vin}
              onChange={handleVinChange}
              maxLength={17}
              onKeyDown={e => e.key === "Enter" && searchChassi()}
            />
            <span className="chassi-len" style={{ color: vin.length === 17 ? "var(--accent)" : "var(--muted)" }}>
              {vin.length}/17
            </span>
          </div>

          {vin.length > 0 && vin.length < 17 && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, marginTop: -8 }}>
              Faltam {17 - vin.length} caracteres
            </div>
          )}

          <button className="btn btn-primary" onClick={searchChassi} disabled={loading || vin.length !== 17}>
            {loading ? "Consultando chassi..." : "🔍 Consultar Chassi"}
          </button>

          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 16, textAlign: "center" }}>
            O chassi fica na calcada do para-brisa ou na porta do motorista
          </div>
        </>
      )}

      {/* ── STEP 2: Selecionar subcoleções ── */}
      {step === 2 && vehicleData && (
        <>
          {/* Card do veículo */}
          <div className="vehicle-card">
            <div className="vehicle-card-brand">{vehicleData.brand}</div>
            <div className="vehicle-card-model">{vehicleData.model || "Modelo não identificado"}</div>
            <div className="vehicle-card-specs">
              {vehicleData.year && <span className="vehicle-spec-pill">📅 {vehicleData.year}</span>}
              {vehicleData.engine && <span className="vehicle-spec-pill">⚙️ {vehicleData.engine}</span>}
              {vehicleData.fuel && <span className="vehicle-spec-pill">⛽ {vehicleData.fuel}</span>}
              {vehicleData.color && <span className="vehicle-spec-pill">🎨 {vehicleData.color}</span>}
              <span className="vehicle-spec-pill" style={{ fontFamily: "monospace", fontSize: 10 }}>{vin}</span>
            </div>
            {vehicleData.mock && (
              <div className="vehicle-mock-warn">
                ⚠️ API de chassi completa ainda não ativada. Modelo e motor podem não estar corretos — confirme visualmente antes de publicar.
              </div>
            )}
          </div>

          {/* Contador + ações */}
          <div className="publish-bar">
            <div className="publish-bar-row">
              <div>
                <div className="publish-bar-count">{totalParts}</div>
                <div className="publish-bar-label">peças selecionadas de {selected.size} subcoleção{selected.size !== 1 ? "ções" : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={selectAll}>Todas</button>
                <button className="btn btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={clearAll}>Limpar</button>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(selected.size / catalog.length) * 100}%` }} />
            </div>
          </div>

          {/* Grid de subcoleções */}
          <div className="sub-grid">
            {catalog.map(sub => {
              const isSelected = selected.has(sub.id);
              const preview = sub.parts.slice(0, 4);
              const remaining = sub.totalParts - preview.length;
              return (
                <div
                  key={sub.id}
                  className={`sub-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSub(sub.id)}
                >
                  <div className="sub-card-header">
                    <span className="sub-card-icon">{sub.icon}</span>
                    <div>
                      <div className="sub-card-label">{sub.label}</div>
                      <div className="sub-card-count">{sub.totalParts} peças</div>
                    </div>
                  </div>
                  <div className="sub-card-parts">
                    {preview.map((p, i) => (
                      <span key={i} className="sub-part-tag">{p.name}</span>
                    ))}
                    {remaining > 0 && (
                      <span className="sub-part-tag more">+{remaining} mais</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="btn-row">
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Voltar</button>
            <button
              className="btn btn-primary"
              onClick={publish}
              disabled={selected.size === 0}
            >
              📦 Publicar {totalParts} anúncios
            </button>
          </div>
        </>
      )}

      {/* ── STEP 3: Publicando ── */}
      {step === 3 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="spinner" style={{ margin: "0 auto 20px" }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Publicando anúncios...</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            Criando {totalParts} peças com preço zerado.<br />Você vai precificar depois.
          </div>
        </div>
      )}

      {/* ── STEP 4: Sucesso ── */}
      {step === 4 && result && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", marginBottom: 4 }}>
            {result.created} anúncios criados!
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
            Veículo: {vehicleData?.brand} {vehicleData?.model} {vehicleData?.year}
          </div>

          {result.errors?.length > 0 && (
            <div className="card" style={{ borderColor: "#ef444440", marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 8 }}>⚠️ {result.errors.length} erros:</div>
              {result.errors.map((e, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>• {e}</div>
              ))}
            </div>
          )}

          <div className="card" style={{ marginBottom: 20, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>
              Próximos passos
            </div>
            {[
              "Vá em Meus Anúncios → filtre por 'Preço zerado'",
              "Fotografe as peças e adicione as fotos",
              "Defina o preço de cada peça",
              "Ative os anúncios quando estiver pronto",
            ].map((txt, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{i + 1}.</span>
                <span style={{ color: "var(--muted)" }}>{txt}</span>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={reset} style={{ marginBottom: 12 }}>
            + Novo desmanche
          </button>
          <div className="btn btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent("goToSell"))}>
            Ver meus anúncios
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 3. Adicionar no HomeScreen — tile de desmanche (só para sellers) ─────────
/*
  // No HomeScreen, adicionar tile após o tile de "Anunciar Peça":
  {isSeller && (
    <div className="home-tile" onClick={() => setScreen("desmanche")}>
      <div className="tile-icon">🔩</div>
      <div className="tile-label">Desmanche</div>
      <div className="tile-sub">Publicar por chassi</div>
    </div>
  )}
*/

// ─── 4. Adicionar no render do App ───────────────────────────────────────────
/*
  // Após: {screen === "sell" && isSeller && <SellScreen user={user} />}
  {screen === "desmanche" && isSeller && <DesmancheScreen user={user} />}
*/

// ─── 5. Adicionar no app.js do backend ───────────────────────────────────────
/*
  import chassiRoutes from "./routes/chassi.routes.js";
  app.use("/chassi", chassiRoutes);
*/
