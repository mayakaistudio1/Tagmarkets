export default function AiTools() {
  const modules = [
    {
      label: "AI ассистент",
      lines: ["отвечает 24/7", "ведёт диалог", "квалифицирует"],
      angle: { top: "8vh", left: "6vw" },
    },
    {
      label: "Zoom-рекрутер",
      lines: ["приглашает", "доводит до вебинара", "делает follow-up"],
      angle: { top: "8vh", right: "6vw" },
    },
    {
      label: "Personal Digital Hub",
      lines: ["материалы", "презентации", "единая точка входа"],
      angle: { bottom: "14vh", left: "6vw" },
    },
    {
      label: "AI-аватар",
      lines: ["говорит за тебя", "работает 24/7", "масштабирует присутствие"],
      angle: { bottom: "14vh", right: "6vw" },
    },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #060a14 0%, #0b1025 40%, #120e30 100%)",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "#7c3aed", zIndex: 10 }} />

      <div className="absolute" style={{ left: 0, right: 0, top: "3vh", textAlign: "center", padding: "0 12vw" }}>
        <p style={{
          fontWeight: 800, fontSize: "2.8vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", color: "#ffffff", margin: 0,
        }}>
          Ты не строишь команду.
        </p>
        <p style={{
          fontWeight: 800, fontSize: "2.8vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", margin: "0.2vh 0 0 0",
        }}>
          <span style={{ color: "#ffffff" }}>Система делает это </span>
          <span style={{ color: "#a855f7" }}>вместе с тобой.</span>
        </p>
        <p style={{
          fontWeight: 400, fontSize: "0.9vw", color: "rgba(255,255,255,0.35)",
          margin: "1vh 0 0 0",
        }}>
          AI снимает с лидера 80% повторяющихся действий.
        </p>
      </div>

      <div className="absolute" style={{
        left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: "14vw", height: "14vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(124,58,237,0.05) 50%, transparent 70%)",
        border: "1px solid rgba(168,85,247,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
        boxShadow: "0 0 80px rgba(124,58,237,0.15), 0 0 160px rgba(124,58,237,0.05)",
      }}>
        <div style={{
          width: "6vw", height: "6vw", borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(168,85,247,0.15))",
          border: "1px solid rgba(168,85,247,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
          boxShadow: "0 0 30px rgba(124,58,237,0.3)",
        }}>
          <span style={{
            fontWeight: 800, fontSize: "0.9vw", color: "#ffffff",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>AI</span>
          <span style={{
            fontWeight: 400, fontSize: "0.55vw", color: "rgba(168,85,247,0.8)",
            letterSpacing: "0.15em", textTransform: "uppercase",
          }}>CORE</span>
        </div>
      </div>

      <div className="absolute" style={{
        left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: "26vw", height: "26vw", borderRadius: "50%",
        border: "1px solid rgba(168,85,247,0.06)",
        pointerEvents: "none",
      }} />

      <div className="absolute" style={{
        left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: "38vw", height: "38vw", borderRadius: "50%",
        border: "1px solid rgba(168,85,247,0.04)",
        pointerEvents: "none",
      }} />

      {modules.map((mod, i) => {
        const pos: React.CSSProperties = {};
        if (mod.angle.top) pos.top = mod.angle.top;
        if ((mod.angle as Record<string, string>).bottom) pos.bottom = (mod.angle as Record<string, string>).bottom;
        if (mod.angle.left) pos.left = mod.angle.left;
        if ((mod.angle as Record<string, string>).right) pos.right = (mod.angle as Record<string, string>).right;

        return (
          <div key={i} className="absolute" style={{
            ...pos,
            width: "20vw",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(168,85,247,0.1)",
              borderRadius: "18px",
              padding: "2.2vh 1.8vw",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
            }}>
              <div style={{
                fontWeight: 700, fontSize: "0.95vw", color: "#c084fc",
                marginBottom: "1vh",
              }}>
                {mod.label}
              </div>
              {mod.lines.map((line, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "center", gap: "0.5vw",
                  marginTop: j > 0 ? "0.5vh" : 0,
                }}>
                  <div style={{
                    width: "4px", height: "4px", minWidth: "4px",
                    borderRadius: "50%", background: "rgba(168,85,247,0.5)",
                  }} />
                  <span style={{
                    fontWeight: 400, fontSize: "0.78vw",
                    color: "rgba(255,255,255,0.5)", lineHeight: 1.4,
                  }}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <svg className="absolute" style={{ left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
        <line x1="37%" y1="46%" x2="24%" y2="28%" stroke="rgba(168,85,247,0.08)" strokeWidth="1" />
        <line x1="63%" y1="46%" x2="76%" y2="28%" stroke="rgba(168,85,247,0.08)" strokeWidth="1" />
        <line x1="37%" y1="54%" x2="24%" y2="72%" stroke="rgba(168,85,247,0.08)" strokeWidth="1" />
        <line x1="63%" y1="54%" x2="76%" y2="72%" stroke="rgba(168,85,247,0.08)" strokeWidth="1" />
      </svg>

      <div className="absolute" style={{
        bottom: "3.5vh", left: 0, right: 0,
        textAlign: "center",
      }}>
        <p style={{
          fontWeight: 700, fontSize: "1.5vw",
          color: "#ffffff", margin: 0, letterSpacing: "-0.02em",
        }}>
          Вот почему рост больше{" "}
          <span style={{ color: "#a855f7" }}>не зависит только от тебя.</span>
        </p>
      </div>
    </div>
  );
}
