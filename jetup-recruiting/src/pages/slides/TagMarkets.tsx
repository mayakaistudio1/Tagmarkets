const steps = [
  { num: "1", text: "Выбираешь стратегию" },
  { num: "2", text: "Подключаешься" },
  { num: "3", text: "Получаешь результат" },
];

const trustItems = [
  "лицензированный брокер",
  "средства на твоём счёте",
  "средства не передаются в управление",
  "полный контроль",
  "встроенный риск-менеджмент",
];

export default function TagMarkets() {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const clientArc = circ * 0.7;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#ffffff", fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", zIndex: 10 }} />

      <div className="absolute" style={{ left: "5vw", top: "3.5vh" }}>
        <div style={{ fontWeight: 700, fontSize: "0.75vw", color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          TAG MARKETS / COPY X
        </div>
        <div style={{ marginTop: "0.5vh", fontWeight: 800, fontSize: "2.7vw", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Ты подключаешься к результату.
        </div>
        <div style={{ marginTop: "0.4vh", fontWeight: 500, fontSize: "0.85vw", color: "#94a3b8" }}>
          CopyX + Amplify внутри лицензированного брокера
        </div>
      </div>

      <div className="absolute" style={{
        top: "17vh", left: "5vw", right: "5vw", bottom: "10vh",
        display: "grid", gridTemplateColumns: "1fr 1.6fr 1.1fr 1fr", gap: "1.25vw",
      }}>
        <div style={{
          background: "#faf8ff", borderRadius: "16px", padding: "2.5vh 1.5vw",
          border: "1px solid #ede9fe",
          boxShadow: "0 2px 12px rgba(124,58,237,0.06)",
          display: "flex", flexDirection: "column", gap: "2vh",
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.9vw", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            CopyX
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75vw" }}>
                <div style={{
                  width: "2vw", height: "2vw", minWidth: "24px", minHeight: "24px",
                  borderRadius: "8px",
                  background: i === 2 ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : "#ede9fe",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.75vw",
                  color: i === 2 ? "#fff" : "#7c3aed", flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.9vw", color: "#1e293b", lineHeight: 1.3 }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #ede9fe", paddingTop: "1.2vh" }}>
            <div style={{ fontWeight: 600, fontSize: "0.7vw", color: "#7c3aed" }}>50+ стратегий</div>
            <div style={{ fontWeight: 400, fontSize: "0.65vw", color: "#94a3b8", marginTop: "0.3vh", lineHeight: 1.4 }}>
              Полный контроль остаётся у тебя
            </div>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(160deg, #faf8ff 0%, #ffffff 100%)",
          borderRadius: "20px", padding: "3vh 2vw",
          border: "1px solid #ede9fe",
          boxShadow: "0 8px 40px rgba(124,58,237,0.09), 0 1px 3px rgba(0,0,0,0.03)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", textAlign: "center",
        }}>
          <div style={{ fontWeight: 300, fontSize: "0.6vw", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.18em" }}>
            Усиление торгового объёма
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "6vw", color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 0.9 }}>
              24X
            </div>
            <div style={{
              fontWeight: 700, fontSize: "1.4vw",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", marginTop: "0.5vh",
            }}>
              AMPLIFY
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.8vw",
            background: "#f8fafc", borderRadius: "12px", padding: "1.2vh 1.8vw",
            border: "1px solid #f1f5f9",
          }}>
            <span style={{ fontWeight: 600, fontSize: "0.95vw", color: "#475569" }}>$1,000</span>
            <svg width="18" height="10" viewBox="0 0 20 10" fill="none">
              <path d="M0 5h16M13 1l4 4-4 4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: "1vw", color: "#7c3aed" }}>до $24,000</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw", fontSize: "0.8vw", fontWeight: 500, color: "#64748b" }}>
            <span>1% = <strong style={{ color: "#0f172a" }}>$10</strong></span>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
              <path d="M0 4h10M8 1l3 3-3 3" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>1% = <strong style={{ color: "#7c3aed" }}>$240</strong></span>
          </div>
          <div style={{
            background: "#f8fafc", borderRadius: "8px", padding: "0.6vh 1.2vw",
            fontSize: "0.7vw", fontWeight: 500, color: "#94a3b8",
            border: "1px solid #f1f5f9",
          }}>
            без опыта торговли
          </div>
        </div>

        <div style={{
          background: "linear-gradient(160deg, #faf8ff 0%, #ffffff 100%)",
          borderRadius: "20px", padding: "2.5vh 1.5vw",
          border: "1px solid #ede9fe",
          boxShadow: "0 4px 24px rgba(124,58,237,0.07), 0 1px 3px rgba(0,0,0,0.02)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly", textAlign: "center",
        }}>
          <div style={{ fontWeight: 300, fontSize: "0.6vw", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Распределение
          </div>

          <svg width="120" height="120" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="50" cy="50" r={r}
              fill="none" stroke="url(#purpleGrad)" strokeWidth="10"
              strokeDasharray={`${clientArc} ${circ}`}
              strokeDashoffset={circ * 0.25}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <text x="50" y="46" textAnchor="middle" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: "22px", fill: "#0f172a" }}>70%</text>
            <text x="50" y="60" textAnchor="middle" style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "9px", fill: "#94a3b8" }}>клиенту</text>
          </svg>

          <div>
            <div style={{ fontWeight: 700, fontSize: "1vw", color: "#0f172a" }}>70% прибыли</div>
            <div style={{ fontWeight: 500, fontSize: "0.7vw", color: "#64748b", marginTop: "0.3vh" }}>остаётся у клиента</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8vw" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3vw" }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "3px", background: "#7c3aed" }} />
              <span style={{ fontSize: "0.6vw", fontWeight: 500, color: "#64748b" }}>клиент</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3vw" }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "3px", background: "#e2e8f0" }} />
              <span style={{ fontSize: "0.6vw", fontWeight: 500, color: "#94a3b8" }}>система</span>
            </div>
          </div>
        </div>

        <div style={{
          background: "#f0fdf4", borderRadius: "16px", padding: "2.5vh 1.5vw",
          border: "1px solid #bbf7d0",
          boxShadow: "0 2px 12px rgba(16,185,129,0.06)",
          display: "flex", flexDirection: "column", gap: "1.5vh",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#dcfce7" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: "0.9vw", color: "#059669" }}>Безопасность</span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
            {trustItems.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.5vw",
                paddingBottom: i < trustItems.length - 1 ? "1vh" : 0,
                borderBottom: i < trustItems.length - 1 ? "1px solid #dcfce7" : "none",
              }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M3 8l4 4 6-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontWeight: 500, fontSize: "0.78vw", color: "#334155", lineHeight: 1.3 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute" style={{
        bottom: "2.8vh", left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap",
      }}>
        <span style={{ fontWeight: 700, fontSize: "1.6vw", color: "#0f172a" }}>Ты не торгуешь сам. </span>
        <span style={{
          fontWeight: 700, fontSize: "1.6vw",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Система работает за тебя.
        </span>
      </div>
    </div>
  );
}
