export default function FinalStep() {
  const options = [
    {
      label: "Созвон",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.85)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      label: "Старт по ссылке",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.85)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
    {
      label: "Аватар",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.85)" strokeWidth="1.5" strokeLinecap="round">
          <polygon points="12,2 21,6.5 21,17.5 12,22 3,17.5 3,6.5" />
          <circle cx="12" cy="12" r="3" fill="rgba(168,85,247,0.2)" />
        </svg>
      ),
    },
    {
      label: "Telegram",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 3L9 13" />
          <path d="M21 3l-7 18-4-8-8-4 18-7z" />
        </svg>
      ),
    },
    {
      label: "Digital Hub",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.85)" strokeWidth="1.5" strokeLinecap="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{
      background: "linear-gradient(170deg, #060a14 0%, #0b1025 40%, #120e30 100%)",
      fontFamily: "Montserrat, sans-serif",
    }}>
      <div className="absolute" style={{
        left: "50%", top: "35%", transform: "translate(-50%, -50%)",
        width: "60vw", height: "60vw",
        background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "#7c3aed", zIndex: 10 }} />

      <div className="absolute" style={{
        left: 0, right: 0, top: "6vh", textAlign: "center", padding: "0 12vw",
      }}>
        <p style={{
          fontWeight: 800, fontSize: "3.2vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", color: "#ffffff", margin: 0,
        }}>
          Ты уже всё увидел.
        </p>
        <p style={{
          fontWeight: 800, fontSize: "3.2vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", margin: "0.3vh 0 0 0",
        }}>
          <span style={{ color: "#ffffff" }}>Теперь вопрос — </span>
          <span style={{ color: "#a855f7" }}>что ты выбираешь?</span>
        </p>
        <p style={{
          fontWeight: 400, fontSize: "1vw", color: "rgba(255,255,255,0.35)",
          margin: "1.5vh 0 0 0",
        }}>
          Как тебе удобнее двигаться дальше?
        </p>
      </div>

      <div className="absolute" style={{
        left: "8vw", right: "8vw",
        top: "38vh",
        display: "flex", gap: "1.3vw",
      }}>
        {options.map((opt, i) => (
          <div key={i} style={{
            flex: 1,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(168,85,247,0.12)",
            borderRadius: "24px",
            padding: "5vh 1.5vw",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "2.5vh", textAlign: "center",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
          }}>
            <div style={{
              width: "3.5vw", height: "3.5vw",
              borderRadius: "50%",
              background: "rgba(168,85,247,0.06)",
              border: "1px solid rgba(168,85,247,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "22%",
            }}>
              {opt.icon}
            </div>
            <div style={{
              fontWeight: 700, fontSize: "1.1vw", color: "#ffffff",
            }}>
              {opt.label}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute" style={{
        bottom: "5vh", left: "50%", transform: "translateX(-50%)",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          borderRadius: "16px", padding: "2vh 5vw",
          boxShadow: "0 0 50px rgba(124,58,237,0.25), 0 8px 30px rgba(0,0,0,0.3)",
        }}>
          <span style={{
            fontWeight: 700, fontSize: "1.3vw", color: "#ffffff",
            letterSpacing: "0.02em",
          }}>
            Инфраструктура готова. Осталось начать.
          </span>
        </div>
      </div>
    </div>
  );
}
