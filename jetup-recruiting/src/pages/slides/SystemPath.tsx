export default function SystemPath() {
  const stages = [
    {
      title: "Вход",
      sub: "Регистрация и доступ к системе",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round">
          <polygon points="5,3 20,12 5,21" fill="rgba(168,85,247,0.2)" stroke="rgba(168,85,247,0.6)" />
        </svg>
      ),
      glow: false,
    },
    {
      title: "Продукт",
      sub: "Подключение к стратегии и первому результату",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="9" width="18" height="12" rx="2" fill="rgba(168,85,247,0.1)" stroke="rgba(168,85,247,0.5)" />
          <path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="rgba(168,85,247,0.5)" />
        </svg>
      ),
      glow: false,
    },
    {
      title: "Доход",
      sub: "Ты зарабатываешь как клиент",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.6)" />
          <path d="M12 6v1.5m0 9V18m-2.5-8.5a2.5 2.5 0 0 1 5 0c0 2.5-5 2.5-5 5a2.5 2.5 0 0 0 5 0" stroke="rgba(16,185,129,0.8)" />
        </svg>
      ),
      glow: false,
    },
    {
      title: "Партнёр",
      sub: "Ты усиливаешь результат через команду",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,18 8,13 12,17 21,6" />
          <polyline points="15,6 21,6 21,12" />
        </svg>
      ),
      glow: false,
    },
    {
      title: "Масштаб",
      sub: "AI и система начинают работать вместе с тобой",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round">
          <polygon points="12,2 21,6.5 21,17.5 12,22 3,17.5 3,6.5" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.8)" />
          <circle cx="12" cy="12" r="3" fill="rgba(168,85,247,0.3)" stroke="rgba(168,85,247,0.9)" />
        </svg>
      ),
      glow: true,
    },
  ];

  return (
    <div style={{
      position: "relative", width: "100vw", height: "100vh", overflow: "hidden",
      fontFamily: "Montserrat, sans-serif",
      background: "linear-gradient(170deg, #0a0e1a 0%, #0d1229 40%, #110f2e 100%)",
    }}>
      <div style={{
        position: "absolute", left: "65%", top: "55%", transform: "translate(-50%, -50%)",
        width: "60vw", height: "60vw",
        background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "0.833vh", background: "#7c3aed", zIndex: 10 }} />

      <div style={{ position: "absolute", left: 0, right: 0, top: "5vh", textAlign: "center", padding: "0 10vw" }}>
        <p style={{
          fontWeight: 800, fontSize: "3.2vw", lineHeight: 1.12, letterSpacing: "-0.03em",
          color: "#ffffff", margin: 0,
        }}>
          Ты не начинаешь с нуля.
        </p>
        <p style={{
          fontWeight: 800, fontSize: "3.2vw", lineHeight: 1.12, letterSpacing: "-0.03em",
          color: "#ffffff", margin: "0.2vh 0 0 0",
        }}>
          Ты входишь в{" "}
          <span style={{ color: "#a855f7" }}>уже работающую систему.</span>
        </p>
        <p style={{
          fontWeight: 400, fontSize: "1vw", color: "rgba(255,255,255,0.35)",
          margin: "1.2vh 0 0 0", lineHeight: 1.5,
        }}>
          Простой путь от входа до результата и масштабирования.
        </p>
      </div>

      <div style={{
        position: "absolute", left: "4vw", right: "4vw",
        top: "50%", transform: "translateY(-50%)",
        paddingTop: "5vh",
      }}>
        <div style={{
          position: "absolute",
          left: "10%", right: "10%",
          top: "calc(50% - 1.5vh)",
          height: "2px",
          background: "linear-gradient(to right, rgba(168,85,247,0.05), rgba(168,85,247,0.25) 20%, rgba(168,85,247,0.4) 50%, rgba(168,85,247,0.5) 80%, rgba(168,85,247,0.7))",
          zIndex: 0,
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          {stages.map((s, i) => (
            <div key={i} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "0 0.8vw",
            }}>
              <div style={{
                width: "clamp(50px, 5.5vw, 80px)",
                height: "clamp(50px, 5.5vw, 80px)",
                borderRadius: "20px",
                background: s.glow
                  ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.1))"
                  : "rgba(255,255,255,0.03)",
                border: s.glow
                  ? "1.5px solid rgba(168,85,247,0.5)"
                  : "1px solid rgba(255,255,255,0.06)",
                boxShadow: s.glow
                  ? "0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(124,58,237,0.1)"
                  : "0 4px 20px rgba(0,0,0,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "20%",
                backdropFilter: "blur(8px)",
              }}>
                {s.icon}
              </div>

              <div style={{
                marginTop: "2.5vh", width: "12px", height: "12px",
                borderRadius: "50%",
                background: s.glow
                  ? "#a855f7"
                  : i === 2 ? "rgba(16,185,129,0.7)" : "rgba(168,85,247,0.4)",
                border: s.glow
                  ? "2px solid rgba(168,85,247,0.8)"
                  : "1.5px solid rgba(168,85,247,0.3)",
                boxShadow: s.glow
                  ? "0 0 16px rgba(168,85,247,0.6)"
                  : i === 2 ? "0 0 10px rgba(16,185,129,0.3)" : "none",
              }} />

              <p style={{
                fontWeight: 700,
                fontSize: "clamp(14px, 1.4vw, 24px)",
                letterSpacing: "-0.015em",
                color: s.glow ? "#c084fc" : "#ffffff",
                margin: "2vh 0 0 0",
                textAlign: "center",
                textShadow: s.glow ? "0 0 24px rgba(168,85,247,0.5)" : "none",
              }}>
                {s.title}
              </p>

              <p style={{
                fontWeight: 400,
                fontSize: "clamp(9px, 0.82vw, 14px)",
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.35)",
                margin: "0.8vh 0 0 0",
                textAlign: "center",
                maxWidth: "12vw",
              }}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: "5vh",
        textAlign: "center", padding: "0 8vw",
      }}>
        <p style={{
          fontWeight: 700, fontSize: "clamp(14px, 1.7vw, 28px)",
          color: "#ffffff", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3,
        }}>
          Ты заходишь как человек.{" "}
          <span style={{ color: "#a855f7" }}>А растёшь уже внутри системы.</span>
        </p>
      </div>
    </div>
  );
}
