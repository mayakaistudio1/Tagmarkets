export default function BreakSlide() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0a0f1c", fontFamily: "Montserrat, sans-serif" }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          width: "65vw",
          height: "55vh",
          background:
            "radial-gradient(ellipse at center, rgba(220,38,38,0.05) 0%, transparent 60%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "16vh",
        }}
      >
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(44px, 7vw, 120px)",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          Проблема не
        </p>
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(44px, 7vw, 120px)",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          в продукте.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "50vh",
          width: "28vw",
          height: "1px",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "54vh",
          display: "flex",
          flexDirection: "column",
          gap: "1.8vh",
        }}
      >
        <p
          style={{
            fontWeight: 400,
            fontSize: "1.65vw",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.42)",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Можно менять компании.
        </p>
        <p
          style={{
            fontWeight: 400,
            fontSize: "1.65vw",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.42)",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Можно менять инструменты.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "8vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4vh",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: "1.9vw",
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.85)",
            margin: 0,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Но если нет системы —
        </p>
        <p
          style={{
            fontWeight: 900,
            fontSize: "1.9vw",
            lineHeight: 1.3,
            color: "#a855f7",
            margin: 0,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          ничего не меняется.
        </p>
      </div>
    </div>
  );
}
