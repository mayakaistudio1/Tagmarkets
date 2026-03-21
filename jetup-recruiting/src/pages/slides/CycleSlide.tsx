export default function CycleSlide() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0a0f1c", fontFamily: "Montserrat, sans-serif" }}
    >
      <div
        style={{
          position: "absolute",
          right: "-5vw",
          top: "-10vh",
          width: "55vw",
          height: "55vh",
          background:
            "radial-gradient(ellipse at top right, rgba(124,58,237,0.1) 0%, transparent 65%)",
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
            fontSize: "clamp(40px, 6.5vw, 112px)",
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: "#ffffff",
            margin: 0,
          }}
        >
          Ты строишь.
        </p>
        <p
          style={{
            fontWeight: 900,
            fontSize: "clamp(40px, 6.5vw, 112px)",
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: "#7c3aed",
            margin: 0,
          }}
        >
          И всё снова упирается в тебя.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "48vh",
          width: "30vw",
          height: "1px",
          background: "rgba(255,255,255,0.08)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "6vw",
          top: "52vh",
          display: "flex",
          flexDirection: "column",
          gap: "2.2vh",
        }}
      >
        <p
          style={{
            fontWeight: 400,
            fontSize: "1.6vw",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.45)",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Команда растёт.
        </p>
        <p
          style={{
            fontWeight: 400,
            fontSize: "1.6vw",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.45)",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Оборот растёт.
        </p>
        <p
          style={{
            fontWeight: 500,
            fontSize: "1.6vw",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.55)",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Но всё снова зависит от тебя.
        </p>
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
            fontSize: "1.1vw",
            color: "rgba(255,255,255,0.2)",
            margin: 0,
            letterSpacing: "0.03em",
            fontStyle: "italic",
          }}
        >
          И в какой-то момент рост останавливается.
        </p>
      </div>
    </div>
  );
}
