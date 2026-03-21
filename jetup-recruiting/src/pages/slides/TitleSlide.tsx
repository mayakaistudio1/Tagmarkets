export default function TitleSlide() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0a0f1c", fontFamily: "Montserrat, sans-serif" }}
    >
      <img
        src="/hero-network.png"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.12,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "28%",
          transform: "translate(-50%, -50%)",
          width: "70vw",
          height: "60vh",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(168,85,247,0.07) 45%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "14vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
        }}
      >
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(80px, 13vw, 200px)",
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
          }}
        >
          JETUP
        </p>
        <div
          style={{
            width: "8vw",
            height: "2px",
            marginTop: "2.4vh",
            background: "linear-gradient(to right, #7c3aed, #a855f7, #7c3aed)",
            borderRadius: "2px",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "44vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6vh",
        }}
      >
        <p
          style={{
            fontWeight: 400,
            fontSize: "1.65vw",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.42)",
            textAlign: "center",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Рынок меняется. И старые модели больше не дают роста.
        </p>
        <p
          style={{
            fontWeight: 600,
            fontSize: "1.45vw",
            lineHeight: 1.4,
            color: "rgba(168,85,247,0.9)",
            textAlign: "center",
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          Ты это уже чувствуешь.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontWeight: 300,
            fontSize: "2.6vw",
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.88)",
            textAlign: "center",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Новая инфраструктура партнёрского роста
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "7vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.8vw",
        }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: "1.1vw",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            whiteSpace: "nowrap",
          }}
        >
          Финансовые продукты
        </span>
        <span
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "rgba(168,85,247,0.7)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: 500,
            fontSize: "1.1vw",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            whiteSpace: "nowrap",
          }}
        >
          Партнёрская система
        </span>
        <span
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "rgba(168,85,247,0.7)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: 500,
            fontSize: "1.1vw",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            whiteSpace: "nowrap",
          }}
        >
          AI-дупликация
        </span>
      </div>
    </div>
  );
}
