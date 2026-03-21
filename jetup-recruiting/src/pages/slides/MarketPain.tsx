export default function MarketPain() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0a0f1c", fontFamily: "Montserrat, sans-serif" }}
    >
      <div
        style={{
          position: "absolute",
          right: "-10vw",
          top: "-15vh",
          width: "55vw",
          height: "60vh",
          background:
            "radial-gradient(ellipse at top right, rgba(220,38,38,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "14vh",
        }}
      >
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(48px, 7.8vw, 130px)",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          Рынок устал
        </p>
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(48px, 7.8vw, 130px)",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: "#7c3aed",
            margin: 0,
          }}
        >
          доверять.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "47vh",
          width: "30vw",
          height: "1px",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "50vh",
          display: "flex",
          flexDirection: "column",
          gap: "4.5vh",
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: "2.4vw",
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
            }}
          >
            Дубликация не работает.
          </p>
          <p
            style={{
              fontWeight: 400,
              fontSize: "1.15vw",
              color: "rgba(168,85,247,0.65)",
              margin: "0.5vh 0 0 0",
              letterSpacing: "0.01em",
            }}
          >
            Ты уже это проходил.
          </p>
        </div>

        <div>
          <p
            style={{
              fontWeight: 600,
              fontSize: "1.9vw",
              color: "rgba(255,255,255,0.65)",
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            Системы нет. Всё держится на тебе.
          </p>
        </div>

        <div>
          <p
            style={{
              fontWeight: 400,
              fontSize: "1.45vw",
              color: "rgba(255,255,255,0.38)",
              margin: 0,
              lineHeight: 1.3,
              letterSpacing: "0em",
            }}
          >
            Рост держится на лидере.
            <span
              style={{
                display: "block",
                fontWeight: 300,
                fontSize: "1.1vw",
                color: "rgba(255,255,255,0.22)",
                marginTop: "0.4vh",
              }}
            >
              И рано или поздно всё останавливается.
            </span>
          </p>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: "6vw",
          bottom: "8vh",
          textAlign: "right",
        }}
      >
        <p
          style={{
            fontWeight: 300,
            fontSize: "1.05vw",
            color: "rgba(255,255,255,0.2)",
            margin: 0,
            letterSpacing: "0.04em",
            fontStyle: "italic",
          }}
        >
          Ты уже это проходил.
        </p>
      </div>
    </div>
  );
}
