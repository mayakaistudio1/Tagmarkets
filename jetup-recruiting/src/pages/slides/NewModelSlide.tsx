export default function NewModelSlide() {
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
          width: "75vw",
          height: "65vh",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, rgba(168,85,247,0.04) 50%, transparent 72%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "16vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontWeight: 800,
            fontSize: "clamp(36px, 5.5vw, 94px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
          }}
        >
          Рост должен строиться иначе.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "46vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.8vh",
        }}
      >
        <p
          style={{
            fontWeight: 300,
            fontSize: "1.85vw",
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.5)",
            margin: 0,
            textAlign: "center",
            letterSpacing: "0em",
          }}
        >
          Где{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            продукт
          </span>
          ,{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            партнёрка
          </span>{" "}
          и{" "}
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            система
          </span>
        </p>
        <p
          style={{
            fontWeight: 300,
            fontSize: "1.85vw",
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.5)",
            margin: 0,
            textAlign: "center",
            letterSpacing: "0em",
          }}
        >
          работают как единое целое.
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
          gap: "1.8vh",
        }}
      >
        <div
          style={{
            width: "5vw",
            height: "1px",
            background: "rgba(168,85,247,0.35)",
          }}
        />
        <p
          style={{
            fontWeight: 500,
            fontSize: "1.5vw",
            color: "rgba(255,255,255,0.6)",
            margin: 0,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          И впервые рост становится предсказуемым.
        </p>
        <p
          style={{
            fontWeight: 600,
            fontSize: "1.7vw",
            color: "rgba(255,255,255,0.8)",
            margin: 0,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          И дубликация не зависит от тебя.
        </p>
        <p
          style={{
            fontWeight: 300,
            fontSize: "0.95vw",
            color: "rgba(255,255,255,0.2)",
            margin: 0,
            letterSpacing: "0.03em",
            fontStyle: "italic",
          }}
        >
          Вот где начинается масштаб.
        </p>
      </div>
    </div>
  );
}
