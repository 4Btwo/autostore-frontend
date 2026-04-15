import { useState } from "react";

export default function App() {
  const [search, setSearch] = useState("");

  const categorias = [
    "Motor",
    "Freio",
    "Suspensão",
    "Elétrica",
    "Acessórios",
  ];

  const produtos = Array.from({ length: 12 });

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #eee",
        padding: "16px"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <h1>AutoStore</h1>
          <button style={{
            background: "#000",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px"
          }}>
            Login
          </button>
        </div>
      </div>

      {/* CONTAINER */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px"
      }}>

        {/* HERO */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
            Encontre peças automotivas
          </h2>

          <input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "16px",
              borderRadius: "10px",
              border: "1px solid #ddd"
            }}
          />
        </div>

        {/* CATEGORIAS */}
        <div style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          marginBottom: "24px"
        }}>
          {categorias.map((cat, i) => (
            <button key={i} style={{
              background: "#fff",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid #eee",
              whiteSpace: "nowrap"
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {produtos.map((_, i) => (
            <div key={i} style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid #eee"
            }}>
              <div style={{
                height: "140px",
                background: "#eee",
                borderRadius: "10px",
                marginBottom: "10px"
              }} />

              <h3>Produto {i + 1}</h3>

              <p style={{ color: "#666", fontSize: "14px" }}>
                Descrição do produto
              </p>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px"
              }}>
                <strong>R$ 99</strong>

                <button style={{
                  background: "#000",
                  color: "#fff",
                  padding: "6px 10px",
                  borderRadius: "8px"
                }}>
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
