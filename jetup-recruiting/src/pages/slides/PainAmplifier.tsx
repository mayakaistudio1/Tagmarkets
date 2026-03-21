export default function PainAmplifier() {
  const dilemmas = [
    { label: "Безопасность", trade: "но без роста." },
    { label: "Доходность", trade: "но с риском потерять." },
    { label: "Гибкость", trade: "но без системы." },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0a0f1c", fontFamily: "Montserrat, sans-serif" }}
    >
      <div
        style={{
          position: "absolute",
          left: "-8vw",
          bottom: "-10vh",
          width: "50vw",
          height: "50vh",
          background:
            "radial-gradient(ellipse at bottom left, rgba(124,58,237,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "13vh",
        }}
      >
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(36px, 6.2vw, 108px)",
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          Всегда приходится
        </p>
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(36px, 6.2vw, 108px)",
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          жертвовать чем-то.
        </p>
        <p
          style={{
            fontWeight: 400,
            fontSize: "1.3vw",
            color: "rgba(255,255,255,0.38)",
            margin: "2.2vh 0 0 0",
            letterSpacing: "0.01em",
          }}
        >
          И ты это уже проходил.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "48vh",
          width: "88vw",
          height: "1px",
          background: "rgba(255,255,255,0.07)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "51vh",
          right: "6vw",
          display: "flex",
          flexDirection: "column",
          gap: "3.8vh",
        }}
      >
        {dilemmas.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "2.4vw",
            }}
          >
            <span
              style={{
                fontWeight: 300,
                fontSize: "1.0vw",
                color: "rgba(168,85,247,0.45)",
                minWidth: "1.6vw",
                letterSpacing: "0.05em",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <span
              style={{
                fontWeight: 700,
                fontSize: "2.1vw",
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "-0.015em",
                minWidth: "18vw",
              }}
            >
              {item.label}
            </span>

            <span
              style={{
                fontWeight: 300,
                fontSize: "1.4vw",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              —
            </span>

            <span
              style={{
                fontWeight: 300,
                fontSize: "1.6vw",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0em",
              }}
            >
              {item.trade}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "7vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontWeight: 300,
            fontSize: "1.25vw",
            color: "rgba(255,255,255,0.22)",
            margin: 0,
            letterSpacing: "0.04em",
            fontStyle: "italic",
          }}
        >
          И всегда что-то ломалось.
        </p>
      </div>
    </div>
  );
}
