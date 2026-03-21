export default function IncomeStructure() {
  const blocks = [
    { title: "Торговый объём", desc: "доход с активности команды" },
    { title: "Доход клиентов", desc: "profit share с результата" },
    { title: "Глубина структуры", desc: "infinity bonus при росте команды" },
    { title: "Большой объём", desc: "global pool на другом уровне масштаба" },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#ffffff", fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "linear-gradient(90deg, #7c3aed, #a78bfa)", zIndex: 10 }} />

      <div className="absolute" style={{ left: "50%", top: "3.5vh", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: "0.75vw", color: "#7c3aed", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          СТРУКТУРА ДОХОДА
        </div>
        <div style={{ marginTop: "0.8vh", fontWeight: 800, fontSize: "3vw", color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Из чего строится доход?
        </div>
        <div style={{ marginTop: "0.8vh" }}>
          <p style={{ fontWeight: 400, fontSize: "0.95vw", color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
            Не от обещаний. А от активности системы и рынка.
          </p>
        </div>
      </div>

      <div className="absolute" style={{
        top: "20vh", left: "8vw", right: "8vw", bottom: "14vh",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8vw",
      }}>
        {blocks.map((block, i) => (
          <div key={i} style={{
            background: i === 0 ? "#faf5ff" : "#f9fafb",
            border: i === 0 ? "1.5px solid #e9d5ff" : "1.5px solid #f3f4f6",
            borderRadius: "24px",
            padding: "4vh 3vw",
            display: "flex", flexDirection: "column",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              fontWeight: 300, fontSize: "0.65vw", color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.15em",
              marginBottom: "1.5vh",
            }}>
              {`Источник ${i + 1}`}
            </div>

            <div style={{
              fontWeight: 800, fontSize: "2vw",
              color: "#0f172a", letterSpacing: "-0.02em",
              marginBottom: "1vh",
            }}>
              {block.title}
            </div>

            <div style={{
              width: "3vw", height: "2px",
              background: i === 0 ? "#7c3aed" : "#e2e8f0",
              borderRadius: "2px", marginBottom: "1.2vh",
            }} />

            <div style={{
              fontWeight: 400, fontSize: "1vw",
              color: "#64748b", lineHeight: 1.5,
            }}>
              {block.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute" style={{
        bottom: "3vh", left: "50%", transform: "translateX(-50%)",
        textAlign: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: "1.5vw", color: "#0f172a" }}>
          Ты можешь начать с одного источника.{" "}
        </span>
        <span style={{
          fontWeight: 700, fontSize: "1.5vw",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          И вырасти до системы дохода.
        </span>
      </div>
    </div>
  );
}
