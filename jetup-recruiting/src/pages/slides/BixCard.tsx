const features = [
  "мгновенные переводы",
  "IBAN / SWIFT",
  "высокие лимиты",
  "прямой доступ к средствам",
];

export default function BixCard() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#ffffff", fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", zIndex: 10 }} />

      <div className="absolute" style={{ left: "5vw", top: "3.5vh" }}>
        <div style={{ fontWeight: 700, fontSize: "0.75vw", color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          BIX.FI / ECOSYSTEM
        </div>
        <div style={{ marginTop: "0.5vh", fontWeight: 800, fontSize: "2.7vw", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          BIX — Доступ к деньгам
        </div>
        <div style={{ marginTop: "0.4vh", fontWeight: 500, fontSize: "0.85vw", color: "#94a3b8" }}>
          Доход → сразу в использование
        </div>
      </div>

      <div className="absolute" style={{
        top: "17vh", left: "5vw", right: "5vw", bottom: "10vh",
        display: "grid", gridTemplateColumns: "1fr 1.8fr 1.1fr", gap: "1.5vw",
      }}>
        <div style={{
          background: "#faf8ff", borderRadius: "16px", padding: "2.5vh 1.8vw",
          border: "1px solid #ede9fe",
          boxShadow: "0 2px 12px rgba(124,58,237,0.06)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5vw", marginBottom: "2vh" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: "0.9vw", color: "#7c3aed" }}>Возможности</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
            {features.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.8vw",
                paddingBottom: i < features.length - 1 ? "1.2vh" : 0,
                borderBottom: i < features.length - 1 ? "1px solid #ede9fe" : "none",
              }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M3 8l4 4 6-6" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontWeight: 500, fontSize: "0.9vw", color: "#334155", lineHeight: 1.3 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #ede9fe", paddingTop: "1.2vh", marginTop: "1.5vh" }}>
            <div style={{ fontWeight: 400, fontSize: "0.65vw", color: "#94a3b8", lineHeight: 1.5 }}>
              Без внешних кошельков
            </div>
            <div style={{ fontWeight: 400, fontSize: "0.65vw", color: "#94a3b8", lineHeight: 1.5 }}>
              Без лишних действий
            </div>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(160deg, #faf8ff 0%, #ffffff 100%)",
          borderRadius: "20px", padding: "3vh 2vw",
          border: "1px solid #ede9fe",
          boxShadow: "0 8px 40px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.03)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly",
        }}>
          <div style={{
            background: "#ffffff",
            border: "2px solid #7c3aed",
            borderRadius: "14px",
            padding: "1.5vh 3vw",
            boxShadow: "0 4px 20px rgba(124,58,237,0.14)",
            display: "flex", alignItems: "center", gap: "0.8vw",
            width: "70%",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
              <path d="M8 12h8M12 8v8" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: "1.1vw", color: "#7c3aed", letterSpacing: "0.05em" }}>
              IB PORTAL / WALLET
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5vh" }}>
            <div style={{ width: "2px", height: "2.5vh", background: "linear-gradient(180deg, #7c3aed, #a78bfa)" }} />
            <svg width="22" height="18" viewBox="0 0 24 18" fill="none">
              <path d="M12 0v14M5 9l7 8 7-8" stroke="url(#arrowGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="arrowGrad" x1="12" y1="0" x2="12" y2="18">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ width: "2px", height: "1.5vh", background: "linear-gradient(180deg, #a78bfa, #22c55e)" }} />
          </div>

          <div style={{
            background: "linear-gradient(135deg, #f0fdf4, #ffffff)",
            border: "2px solid #22c55e",
            borderRadius: "14px",
            padding: "1.5vh 3vw",
            boxShadow: "0 4px 20px rgba(34,197,94,0.14)",
            display: "flex", alignItems: "center", gap: "0.8vw",
            width: "70%",
          }}>
            <svg width="24" height="18" viewBox="0 0 28 20" fill="none">
              <rect x="1" y="1" width="26" height="18" rx="3" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
              <rect x="1" y="5" width="26" height="3" fill="#22c55e" opacity="0.3" />
              <rect x="4" y="12" width="6" height="2.5" rx="1" fill="#22c55e" />
              <rect x="18" y="12" width="6" height="2.5" rx="1" fill="#bbf7d0" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: "1.1vw", color: "#15803d", letterSpacing: "0.05em" }}>
              DEBIT CARD
            </span>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #f3e8ff 40%, #dcfce7 100%)",
            border: "1px solid #e9d5ff",
            borderRadius: "12px",
            padding: "1.2vh 2vw",
            display: "flex", alignItems: "center", gap: "0.8vw",
            width: "80%",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <span style={{ fontWeight: 700, fontSize: "0.82vw", color: "#7c3aed" }}>В один клик: </span>
              <span style={{ fontWeight: 600, fontSize: "0.82vw", color: "#15803d" }}>доход → карта → оплата по всему миру</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vh" }}>
          <div style={{
            flex: 2,
            background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)",
            borderRadius: "16px",
            padding: "2.5vh 1.8vw",
            border: "1px solid #334155",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: "60%", height: "100%",
              background: "radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.18) 0%, transparent 60%)",
              pointerEvents: "none",
            }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: "0.85vw", color: "#a78bfa", letterSpacing: "0.1em" }}>BIX.FI</span>
                <span style={{ fontWeight: 600, fontSize: "0.6vw", color: "#64748b", letterSpacing: "0.08em" }}>VISA</span>
              </div>
              <div style={{ marginTop: "2vh" }}>
                <svg width="32" height="22" viewBox="0 0 30 22" fill="none">
                  <rect x="0" y="0" width="30" height="22" rx="3" fill="#a78bfa" opacity="0.3" />
                  <rect x="2" y="8" width="6" height="5" rx="1" fill="#a78bfa" opacity="0.6" />
                </svg>
              </div>
              <div style={{ marginTop: "2vh", fontFamily: "'Courier New', monospace", fontSize: "0.78vw", color: "#94a3b8", letterSpacing: "0.22em" }}>
                •••• •••• •••• 4821
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: "0.5vw", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>VALID THRU</div>
                <div style={{ fontSize: "0.7vw", color: "#cbd5e1", fontWeight: 600, marginTop: "0.2vh" }}>12/28</div>
              </div>
              <div style={{
                width: "2.2vw", height: "2.2vw", borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)", opacity: 0.7,
              }} />
            </div>
          </div>

          <div style={{
            flex: 1,
            background: "linear-gradient(160deg, #faf8ff 0%, #ffffff 100%)",
            borderRadius: "16px",
            padding: "2vh 1.8vw",
            border: "1px solid #ede9fe",
            boxShadow: "0 4px 20px rgba(124,58,237,0.06)",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="18" rx="3" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
                <path d="M2 8h20" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="12" cy="15" r="2" fill="#22c55e" />
              </svg>
              <span style={{ fontWeight: 600, fontSize: "0.75vw", color: "#64748b" }}>Баланс</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.3vw" }}>
              <span style={{ fontWeight: 800, fontSize: "2vw", color: "#22c55e" }}>$12,480</span>
              <span style={{ fontWeight: 500, fontSize: "0.7vw", color: "#94a3b8" }}>.00</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3vw" }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6l4-4 4 4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontWeight: 600, fontSize: "0.65vw", color: "#22c55e" }}>+$2,340</span>
              <span style={{ fontWeight: 400, fontSize: "0.6vw", color: "#94a3b8" }}>за неделю</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute" style={{
        bottom: "2.8vh", left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap",
      }}>
        <span style={{ fontWeight: 700, fontSize: "1.6vw", color: "#0f172a" }}>Ты не просто зарабатываешь. </span>
        <span style={{
          fontWeight: 700, fontSize: "1.6vw",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Ты используешь.
        </span>
      </div>
    </div>
  );
}
