export default function DiagnosticSlide() {
  const items = [
    "Продукт реально даёт результат?",
    "Модель масштабируется?",
    "Система работает без тебя?",
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0a0f1c", fontFamily: "Montserrat, sans-serif" }}
    >
      {/* Purple top border */}
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "#7c3aed" }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute",
        left: "50%", top: "38%",
        transform: "translate(-50%, -50%)",
        width: "90vw", height: "70vh",
        background: "radial-gradient(ellipse at center, rgba(124,58,237,0.07) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Headline */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: "9vh",
        textAlign: "center",
        padding: "0 6vw",
      }}>
        <p style={{
          fontWeight: 900,
          fontSize: "clamp(30px, 4.6vw, 80px)",
          lineHeight: 1.08,
          letterSpacing: "-0.035em",
          color: "#ffffff",
          margin: 0,
        }}>
          У тебя сейчас это всё есть вместе?
        </p>

        <p style={{
          fontWeight: 500,
          fontSize: "clamp(14px, 1.85vw, 32px)",
          color: "rgba(168,85,247,0.85)",
          margin: "2.5vh 0 0 0",
          letterSpacing: "-0.01em",
        }}>
          Ответь себе честно.
        </p>
      </div>

      {/* Checklist */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "38vh",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "3.8vh",
        minWidth: "52vw",
      }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="group"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.8vw",
              cursor: "default",
              padding: "1.6vh 2.2vw",
              borderRadius: "0.8vw",
              border: "1px solid rgba(168,85,247,0.12)",
              background: "rgba(124,58,237,0.04)",
              transition: "all 0.2s ease",
            }}
          >
            {/* Checkbox */}
            <div style={{
              width: "clamp(18px, 1.6vw, 28px)",
              height: "clamp(18px, 1.6vw, 28px)",
              border: "2px solid rgba(168,85,247,0.5)",
              borderRadius: "0.3vw",
              flexShrink: 0,
            }} />

            {/* Text */}
            <p style={{
              fontWeight: 600,
              fontSize: "clamp(15px, 1.9vw, 32px)",
              color: "rgba(255,255,255,0.88)",
              margin: 0,
              letterSpacing: "-0.015em",
              lineHeight: 1.2,
            }}>
              {item}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom question */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        bottom: "7vh",
        textAlign: "center",
      }}>
        <p style={{
          fontWeight: 700,
          fontSize: "clamp(16px, 2.1vw, 36px)",
          color: "rgba(255,255,255,0.55)",
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          Сколько из этого — «да»?
        </p>
      </div>
    </div>
  );
}
