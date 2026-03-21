export default function EarningPotential() {
  const levels = [
    {
      title: "Старт",
      range: "$300 – $1,000",
      desc: "первый результат",
      bg: "#f9fafb",
      border: "#f3f4f6",
      accent: "#94a3b8",
    },
    {
      title: "Актив",
      range: "$1,000 – $5,000",
      desc: "доход + команда",
      bg: "#faf5ff",
      border: "#e9d5ff",
      accent: "#a855f7",
    },
    {
      title: "Лидер",
      range: "$5,000+",
      desc: "система дохода",
      bg: "linear-gradient(160deg, #f5f0ff, #ede5ff)",
      border: "#c4b5fd",
      accent: "#7c3aed",
    },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#ffffff", fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", zIndex: 10 }} />

      <div className="absolute" style={{ left: "50%", top: "3.5vh", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: "0.75vw", color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ПОТЕНЦИАЛ ДОХОДА
        </div>
        <div style={{ marginTop: "0.8vh", fontWeight: 800, fontSize: "3vw", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Сколько это может давать?
        </div>
        <div style={{ marginTop: "0.8vh" }}>
          <p style={{ fontWeight: 400, fontSize: "0.95vw", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
            Ты можешь начать с личного результата.
          </p>
          <p style={{ fontWeight: 400, fontSize: "0.95vw", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
            И вырасти до системного дохода.
          </p>
        </div>
      </div>

      <div className="absolute" style={{
        top: "22vh", left: "8vw", right: "8vw", bottom: "14vh",
        display: "flex", gap: "2vw",
      }}>
        {levels.map((lvl, i) => (
          <div key={i} style={{
            flex: 1,
            background: lvl.bg,
            border: `1.5px solid ${lvl.border}`,
            borderRadius: "24px",
            padding: "4vh 2.5vw",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            boxShadow: i === 2
              ? "0 12px 40px rgba(124,58,237,0.12)"
              : "0 4px 20px rgba(0,0,0,0.04)",
            position: "relative",
          }}>
            {i === 2 && (
              <div style={{
                position: "absolute", top: "-1.5vh",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                borderRadius: "8px", padding: "0.4vh 1.2vw",
              }}>
                <span style={{ fontWeight: 700, fontSize: "0.6vw", color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  масштаб
                </span>
              </div>
            )}

            <div style={{
              fontWeight: 300, fontSize: "0.7vw", color: lvl.accent,
              textTransform: "uppercase", letterSpacing: "0.15em",
              marginBottom: "2vh",
            }}>
              {`Уровень ${i + 1}`}
            </div>

            <div style={{
              fontWeight: 800, fontSize: "2.2vw", color: "#0f172a",
              letterSpacing: "-0.02em", marginBottom: "1vh",
            }}>
              {lvl.title}
            </div>

            <div style={{
              fontWeight: 800, fontSize: i === 2 ? "3.5vw" : "2.8vw",
              color: lvl.accent,
              letterSpacing: "-0.02em", lineHeight: 1,
              marginBottom: "1.5vh",
            }}>
              {lvl.range}
            </div>

            <div style={{
              width: "3vw", height: "2px",
              background: lvl.accent, opacity: 0.3,
              borderRadius: "2px", marginBottom: "1.5vh",
            }} />

            <div style={{
              fontWeight: 400, fontSize: "0.9vw",
              color: "#64748b", lineHeight: 1.5,
            }}>
              {lvl.desc}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute", left: "8vw", right: "8vw",
        bottom: "14vh", height: "2px",
        background: "linear-gradient(to right, #f3f4f6, #e9d5ff, #7c3aed)",
        borderRadius: "2px",
      }} />

      <div className="absolute" style={{
        bottom: "3vh", left: "50%", transform: "translateX(-50%)",
        textAlign: "center", whiteSpace: "nowrap",
      }}>
        <span style={{ fontWeight: 700, fontSize: "1.5vw", color: "#0f172a" }}>
          Это не потолок.{" "}
        </span>
        <span style={{
          fontWeight: 700, fontSize: "1.5vw",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Это стартовая динамика.
        </span>
      </div>
    </div>
  );
}
