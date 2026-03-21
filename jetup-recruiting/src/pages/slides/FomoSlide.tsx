export default function FomoSlide() {
  const blocks = [
    {
      title: "Ранняя позиция",
      desc: "зайти на старте сильнее, чем догонять позже",
    },
    {
      title: "Международное развитие",
      desc: "система строится сразу широко, не локально",
    },
    {
      title: "AI-инфраструктура",
      desc: "то, чего ещё нет у большинства на рынке",
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
      <div className="absolute" style={{
        left: "50%", top: "40%", transform: "translate(-50%, -50%)",
        width: "70vw", height: "70vw",
        background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div className="absolute top-0 left-0 right-0" style={{ height: "0.833vh", background: "#7c3aed", zIndex: 10 }} />

      <div className="absolute" style={{
        left: 0, right: 0, top: "5vh", textAlign: "center", padding: "0 12vw",
      }}>
        <div style={{ fontWeight: 700, fontSize: "0.75vw", color: "#a855f7", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          TIMING
        </div>
        <p style={{
          fontWeight: 800, fontSize: "3.2vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", color: "#ffffff", margin: "1vh 0 0 0",
        }}>
          Сейчас формируется
        </p>
        <p style={{
          fontWeight: 800, fontSize: "3.2vw", lineHeight: 1.12,
          letterSpacing: "-0.03em", margin: "0.2vh 0 0 0",
        }}>
          <span style={{ color: "#a855f7" }}>первая линия лидеров.</span>
        </p>
        <p style={{
          fontWeight: 400, fontSize: "0.9vw", color: "rgba(255,255,255,0.35)",
          margin: "1.2vh 0 0 0", lineHeight: 1.5,
        }}>
          Мы не просто подключаем людей. Мы собираем тех, кто запускается вместе с системой.
        </p>
      </div>

      <div className="absolute" style={{
        left: "8vw", right: "8vw", top: "32vh",
        display: "flex", gap: "1.5vw",
      }}>
        {blocks.map((block, i) => (
          <div key={i} style={{
            flex: 1,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(168,85,247,0.1)",
            borderRadius: "24px",
            padding: "4vh 2.2vw",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{
              fontWeight: 700, fontSize: "1.3vw", color: "#ffffff",
              marginBottom: "1.2vh", lineHeight: 1.2,
            }}>
              {block.title}
            </div>
            <div style={{
              width: "2.5vw", height: "2px",
              background: "linear-gradient(90deg, #a855f7, transparent)",
              borderRadius: "2px", marginBottom: "1.2vh",
            }} />
            <div style={{
              fontWeight: 400, fontSize: "0.85vw",
              color: "rgba(255,255,255,0.45)", lineHeight: 1.5,
            }}>
              {block.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute" style={{
        left: "50%", top: "62vh", transform: "translateX(-50%)",
        textAlign: "center", width: "60vw",
      }}>
        <div style={{
          background: "rgba(168,85,247,0.06)",
          border: "1px solid rgba(168,85,247,0.15)",
          borderRadius: "16px",
          padding: "2.5vh 3vw",
        }}>
          <p style={{
            fontWeight: 500, fontSize: "1.1vw",
            color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5,
          }}>
            Позже можно будет подключиться.{" "}
            <span style={{ color: "#a855f7", fontWeight: 600 }}>
              Но не с той же позицией.
            </span>
          </p>
        </div>
      </div>

      <div className="absolute" style={{
        bottom: "4vh", left: 0, right: 0, textAlign: "center", padding: "0 10vw",
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.08))",
          border: "1px solid rgba(168,85,247,0.25)",
          borderRadius: "18px",
          padding: "2.5vh 4vw",
          display: "inline-block",
          boxShadow: "0 0 40px rgba(124,58,237,0.12)",
        }}>
          <p style={{
            fontWeight: 600, fontSize: "1.2vw",
            color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.5,
          }}>
            Если ты видишь масштаб —{" "}
            <span style={{ color: "#c084fc", fontWeight: 700 }}>
              сейчас время заходить в систему.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
