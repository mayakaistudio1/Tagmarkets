export default function BridgeSlide() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0a0f1c", fontFamily: "Montserrat, sans-serif" }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw",
          height: "70vh",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, rgba(168,85,247,0.04) 50%, transparent 72%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "22vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6vh",
        }}
      >
        <p
          style={{
            fontWeight: 200,
            fontSize: "clamp(32px, 4.5vw, 76px)",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            color: "rgba(255,255,255,0.7)",
            margin: 0,
            textAlign: "center",
          }}
        >
          А если проблема не в тебе?
        </p>
        <p
          style={{
            fontWeight: 800,
            fontSize: "clamp(32px, 4.5vw, 76px)",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
          }}
        >
          А в системе?
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "54vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontWeight: 300,
            fontSize: "1.9vw",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            margin: 0,
            maxWidth: "56vw",
            letterSpacing: "0em",
          }}
        >
          Где{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            продукт
          </span>
          ,{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            партнёрская модель
          </span>{" "}
          и{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            инструменты
          </span>{" "}
          работают как одна система.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "9vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.2vh",
        }}
      >
        <div
          style={{
            width: "5vw",
            height: "1px",
            background: "rgba(168,85,247,0.4)",
          }}
        />
        <p
          style={{
            fontWeight: 700,
            fontSize: "1.9vw",
            letterSpacing: "-0.01em",
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
          }}
        >
          JetUP — это не рост.{" "}
          <span style={{ color: "rgba(168,85,247,0.9)" }}>
            Это управляемый рост.
          </span>
        </p>
        <p
          style={{
            fontWeight: 300,
            fontSize: "1.05vw",
            color: "rgba(255,255,255,0.25)",
            margin: 0,
            letterSpacing: "0.02em",
            fontStyle: "italic",
          }}
        >
          И дальше ты поймёшь, за счёт чего это возможно.
        </p>
      </div>
    </div>
  );
}
