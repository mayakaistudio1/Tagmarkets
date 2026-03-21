const features = [
  "фьючерсная торговля и спотовый рынок",
  "копитрейдинг и автоматизация",
  "высокая ликвидность",
  "доступ к крипто-рынку 24/7",
];

const licenses = [
  "лицензия DASP (Сальвадор)",
  "лицензия MSB (Канада)",
];

export default function Bit1Exchange() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#ffffff", fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", zIndex: 10 }} />

      <div className="absolute" style={{ left: "5vw", top: "3.5vh" }}>
        <div style={{ fontWeight: 700, fontSize: "0.75vw", color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          — ПАРТНЁР ЭКОСИСТЕМЫ
        </div>
        <div style={{ marginTop: "0.5vh" }}>
          <span style={{ fontWeight: 800, fontSize: "2.7vw", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            BIT1 —{" "}
          </span>
          <span style={{
            fontWeight: 800, fontSize: "2.7vw",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>
            Криптовалютная инфраструктура
          </span>
        </div>
        <div style={{ marginTop: "0.4vh", fontWeight: 500, fontSize: "0.85vw", color: "#94a3b8" }}>
          Дополнительный рынок внутри системы
        </div>
      </div>

      <div className="absolute" style={{
        top: "17vh", left: "5vw", right: "5vw", bottom: "10vh",
        display: "grid", gridTemplateColumns: "1fr 12vw 1fr", gap: "1.5vw",
      }}>
        <div style={{
          background: "linear-gradient(160deg, #faf8ff 0%, #ffffff 100%)",
          borderRadius: "20px", padding: "3vh 2.5vw",
          border: "1px solid #ede9fe",
          boxShadow: "0 8px 40px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.03)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.9vw", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2.5vh" }}>
            Рынок и возможности
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
            {features.map((feat, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
                <div style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a78bfa)", flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600, fontSize: "1.05vw", color: "#1e293b", lineHeight: 1.4 }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #ede9fe", paddingTop: "1.5vh", marginTop: "1.5vh" }}>
            <div style={{ fontWeight: 400, fontSize: "0.7vw", color: "#94a3b8", lineHeight: 1.5 }}>
              Полный набор инструментов для работы с крипто-рынком
            </div>
          </div>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <svg width="100%" height="70%" viewBox="0 0 120 300" fill="none" style={{ opacity: 0.18 }}>
            <path d="M20 270 L35 230 L50 245 L65 185 L80 205 L95 135 L110 75 L110 300 L20 300 Z" fill="url(#fillGrad)" />
            <path d="M20 270 L35 230 L50 245 L65 185 L80 205 L95 135 L110 75" stroke="url(#lineGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="300" x2="120" y2="0">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="fillGrad" x1="60" y1="300" x2="60" y2="0">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.25" />
              </linearGradient>
            </defs>
          </svg>

          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", gap: "4vh" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "2.8vw", color: "#0f172a", opacity: 0.12, lineHeight: 1 }}>₿</div>
              <div style={{ fontWeight: 700, fontSize: "0.7vw", color: "#94a3b8", marginTop: "0.4vh", letterSpacing: "0.1em" }}>BTC</div>
            </div>
            <div style={{ width: "1px", height: "6vh", background: "linear-gradient(180deg, transparent, #ede9fe, transparent)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "2.3vw", color: "#0f172a", opacity: 0.12, lineHeight: 1 }}>Ξ</div>
              <div style={{ fontWeight: 700, fontSize: "0.7vw", color: "#94a3b8", marginTop: "0.4vh", letterSpacing: "0.1em" }}>ETH</div>
            </div>
          </div>
        </div>

        <div style={{
          background: "linear-gradient(160deg, #faf8ff 0%, #ffffff 100%)",
          borderRadius: "20px", padding: "3vh 2.5vw",
          border: "1px solid #ede9fe",
          boxShadow: "0 8px 40px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.03)",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ fontWeight: 800, fontSize: "2vw", color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "1.5vh" }}>
            ⚡ Bit1
          </div>

          <div style={{ width: "100%", height: "1px", background: "#ede9fe", marginBottom: "2.5vh" }} />

          <div style={{ fontWeight: 700, fontSize: "0.65vw", color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2vh" }}>
            Юридическая база:
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "1.5vh" }}>
            {licenses.map((lic, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "1vw",
                padding: "1.5vh 1.2vw",
                background: "#f8fafc", borderRadius: "12px",
                border: "1px solid #f1f5f9",
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: "0.9vw", color: "#334155", lineHeight: 1.3 }}>
                  {lic}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", paddingTop: "2.5vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.6vw",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "12px", padding: "1.2vh 2vw",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill="#dcfce7" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontWeight: 700, fontSize: "0.9vw", color: "#059669" }}>Licensed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute" style={{
        bottom: "2.8vh", left: "50%", transform: "translateX(-50%)", textAlign: "center", whiteSpace: "nowrap",
      }}>
        <span style={{ fontWeight: 700, fontSize: "1.6vw", color: "#0f172a" }}>Это не отдельный продукт. </span>
        <span style={{
          fontWeight: 700, fontSize: "1.6vw",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Это часть финансовой системы.
        </span>
      </div>
    </div>
  );
}
