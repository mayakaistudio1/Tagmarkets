export default function RecruitingHub() {
  const hubItems = ["Мой профиль", "Recruiting flow", "Telegram-бот", "Digital Hub", "Обучение"];
  const points = [
    "Один вход для презентаций и материалов",
    "Путь гостя фиксируется и сопровождается",
    "Follow-up и следующий шаг не теряются",
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #0a0e1a 0%, #0d1229 40%, #110f2e 100%)",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "#7c3aed", zIndex: 10 }} />

      <div className="absolute" style={{ left: "5vw", top: "3.5vh" }}>
        <div style={{ fontWeight: 700, fontSize: "0.75vw", color: "#a855f7", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          RECRUITING HUB
        </div>
        <p style={{
          fontWeight: 800, fontSize: "2.8vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", color: "#ffffff", margin: "0.5vh 0 0 0",
        }}>
          Ты не работаешь в хаосе.
        </p>
        <p style={{
          fontWeight: 800, fontSize: "2.8vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", margin: "0.2vh 0 0 0",
        }}>
          <span style={{ color: "#ffffff" }}>Ты </span>
          <span style={{ color: "#a855f7" }}>управляешь ростом.</span>
        </p>
        <p style={{
          fontWeight: 400, fontSize: "0.9vw", color: "rgba(255,255,255,0.35)",
          margin: "1vh 0 0 0",
        }}>
          Один hub вместо десятков ссылок, чатов и ручных действий.
        </p>
      </div>

      <div className="absolute" style={{
        left: "5vw", top: "30vh", width: "38vw",
        display: "flex", flexDirection: "column", gap: "3vh",
      }}>
        {points.map((point, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1vw" }}>
            <div style={{
              width: "10px", height: "10px", minWidth: "10px",
              borderRadius: "50%",
              background: "rgba(168,85,247,0.3)",
              border: "1.5px solid rgba(168,85,247,0.5)",
              marginTop: "0.3vh",
            }} />
            <span style={{
              fontWeight: 500, fontSize: "1.1vw",
              color: "rgba(255,255,255,0.7)", lineHeight: 1.5,
            }}>
              {point}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute" style={{
        right: "8vw", top: "14vh",
        width: "28vw",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 20px 80px rgba(0,0,0,0.4), 0 0 60px rgba(124,58,237,0.08)",
        }}>
          <div style={{
            height: "2.5vh",
            background: "rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4vw",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          </div>

          <div style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            padding: "2.5vh 2vw",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontWeight: 800, fontSize: "1.3vw", color: "#ffffff",
              letterSpacing: "0.06em",
            }}>JETUP HUB</span>
          </div>

          <div style={{ padding: "1.5vh 1.5vw", display: "flex", flexDirection: "column", gap: "1vh" }}>
            {hubItems.map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "14px",
                padding: "1.8vh 1.5vw",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{
                  fontWeight: 500, fontSize: "0.95vw",
                  color: "rgba(255,255,255,0.75)",
                }}>{item}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute" style={{
        bottom: "3.5vh", left: 0, right: 0, textAlign: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: "1.5vw", color: "#ffffff" }}>
          Система не только привлекает.{" "}
        </span>
        <span style={{ fontWeight: 700, fontSize: "1.5vw", color: "#a855f7" }}>
          Она доводит.
        </span>
      </div>
    </div>
  );
}
