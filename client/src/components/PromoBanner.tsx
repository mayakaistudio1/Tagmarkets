import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";

type BannerFormat = "horizontal" | "vertical";

const PromoBanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<BannerFormat>("vertical");

  const exportPNG = async () => {
    if (!bannerRef.current) return;
    setExporting(true);
    try {
      const w = format === "vertical" ? 1080 : 1200;
      const h = format === "vertical" ? 1350 : 675;
      const canvas = await html2canvas(bannerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: w,
        height: h,
      });
      const link = document.createElement("a");
      link.download = `dennis_fast_start_promo_${format}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: 32, background: "#0a0510", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <button
          onClick={() => setFormat("vertical")}
          style={{
            padding: "8px 20px",
            background: format === "vertical" ? "#7C3AED" : "#222",
            color: "#fff",
            border: format === "vertical" ? "2px solid #A855F7" : "2px solid #333",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          4:5 Vertical (Telegram)
        </button>
        <button
          onClick={() => setFormat("horizontal")}
          style={{
            padding: "8px 20px",
            background: format === "horizontal" ? "#7C3AED" : "#222",
            color: "#fff",
            border: format === "horizontal" ? "2px solid #A855F7" : "2px solid #333",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          16:9 Horizontal
        </button>
      </div>

      {format === "vertical" ? (
        <VerticalBanner ref={bannerRef} />
      ) : (
        <HorizontalBanner ref={bannerRef} />
      )}

      <button
        onClick={exportPNG}
        disabled={exporting}
        style={{
          padding: "12px 32px",
          background: exporting ? "#555" : "#7C3AED",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: exporting ? "default" : "pointer",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {exporting ? "Exporting..." : `Download PNG ${format === "vertical" ? "(2160x2700)" : "(2400x1350)"}`}
      </button>
    </div>
  );
};

const VerticalBanner = React.forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    style={{
      width: 1080,
      height: 1350,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Montserrat', sans-serif",
      background: "#08051a",
    }}
  >
    <img
      src="/promo_banner_bg_vertical.png"
      alt=""
      crossOrigin="anonymous"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.85,
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(8,5,26,0.7) 0%, rgba(8,5,26,0.3) 30%, rgba(8,5,26,0.15) 50%, rgba(8,5,26,0.5) 80%, rgba(8,5,26,0.85) 100%)",
      }}
    />

    <div
      style={{
        position: "absolute",
        right: -30,
        bottom: 0,
        width: 620,
        height: "75%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <img
        src="/dennis-photo.png"
        alt="Dennis"
        crossOrigin="anonymous"
        style={{
          height: "100%",
          objectFit: "contain",
          objectPosition: "bottom",
          filter: "drop-shadow(0 0 50px rgba(124,58,237,0.5)) drop-shadow(0 0 100px rgba(124,58,237,0.2))",
        }}
      />
    </div>

    <div
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: "100%",
        height: "35%",
        background: "linear-gradient(to top, rgba(8,5,26,0.95) 0%, rgba(8,5,26,0.7) 50%, rgba(8,5,26,0) 100%)",
      }}
    />

    <div
      style={{
        position: "absolute",
        left: 50,
        top: 50,
        right: 50,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(168,85,247,0.2))",
          border: "1px solid rgba(168,85,247,0.5)",
          borderRadius: 10,
          padding: "8px 20px",
          marginBottom: 24,
          alignSelf: "flex-start",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#c4b5fd", letterSpacing: 3, textTransform: "uppercase" }}>
          JetUP Partner Promo
        </span>
      </div>

      <h1
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.05,
          margin: 0,
          marginBottom: 4,
          letterSpacing: -1,
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}
      >
        Fast Start Promo
      </h1>

      <p
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          margin: 0,
          marginBottom: 0,
          lineHeight: 1.5,
        }}
      >
        For new partners
        <br />
        by Dennis, JetUP Founder
      </p>
    </div>

    <div
      style={{
        position: "absolute",
        left: 50,
        bottom: 60,
        right: 50,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 0,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 92,
            fontWeight: 800,
            color: "#C084FC",
            lineHeight: 1,
            textShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(124,58,237,0.3)",
          }}
        >
          100
        </span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1,
            marginLeft: 6,
            marginRight: 16,
            alignSelf: "center",
          }}
        >
          USDT
        </span>
        <span
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1,
            alignSelf: "center",
            marginRight: 16,
          }}
        >
          +
        </span>
        <span
          style={{
            fontSize: 92,
            fontWeight: 800,
            color: "#C084FC",
            lineHeight: 1,
            textShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 80px rgba(124,58,237,0.3)",
          }}
        >
          100
        </span>
        <span
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1,
            marginLeft: 6,
            alignSelf: "center",
          }}
        >
          USDT
        </span>
      </div>

      <p
        style={{
          fontSize: 19,
          fontWeight: 500,
          color: "rgba(255,255,255,0.6)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Deposit 100 USDT and get{" "}
        <span style={{ color: "#C084FC", fontWeight: 700 }}>+100 USDT bonus</span>
      </p>
    </div>
  </div>
));

const HorizontalBanner = React.forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    style={{
      width: 1200,
      height: 675,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Montserrat', sans-serif",
      background: "#08051a",
    }}
  >
    <img
      src="/promo_banner_bg.png"
      alt=""
      crossOrigin="anonymous"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(10,5,30,0.88) 0%, rgba(40,15,80,0.55) 40%, rgba(10,15,40,0.35) 70%, rgba(10,5,30,0.8) 100%)",
      }}
    />

    <div
      style={{
        position: "absolute",
        right: -20,
        bottom: 0,
        width: 480,
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <img
        src="/dennis-photo.png"
        alt="Dennis"
        crossOrigin="anonymous"
        style={{
          height: "95%",
          objectFit: "contain",
          objectPosition: "bottom",
          filter: "drop-shadow(0 0 40px rgba(124,58,237,0.5))",
        }}
      />
    </div>

    <div
      style={{
        position: "absolute",
        left: 60,
        top: 48,
        right: 500,
        bottom: 48,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 0,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.2))",
          border: "1px solid rgba(168,85,247,0.45)",
          borderRadius: 8,
          padding: "6px 16px",
          marginBottom: 22,
          alignSelf: "flex-start",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#c4b5fd", letterSpacing: 2.5, textTransform: "uppercase" }}>
          JetUP Partner Promo
        </span>
      </div>

      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1.05,
          margin: 0,
          marginBottom: 4,
          letterSpacing: -1,
        }}
      >
        Fast Start Promo
      </h1>
      <p
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          margin: 0,
          marginBottom: 24,
          lineHeight: 1.4,
        }}
      >
        For new partners &bull; by Dennis, JetUP Founder
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 76, fontWeight: 800, color: "#C084FC", lineHeight: 1, textShadow: "0 0 30px rgba(168,85,247,0.45)" }}>
          100
        </span>
        <span style={{ fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.5)", lineHeight: 1, alignSelf: "center" }}>
          USDT
        </span>
        <span style={{ fontSize: 38, fontWeight: 700, color: "rgba(255,255,255,0.7)", lineHeight: 1 }}>
          +
        </span>
        <span style={{ fontSize: 76, fontWeight: 800, color: "#C084FC", lineHeight: 1, textShadow: "0 0 30px rgba(168,85,247,0.45)" }}>
          100
        </span>
        <span style={{ fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.5)", lineHeight: 1, alignSelf: "center" }}>
          USDT
        </span>
      </div>

      <p style={{ fontSize: 17, fontWeight: 500, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
        Deposit 100 USDT and get{" "}
        <span style={{ color: "#C084FC", fontWeight: 700 }}>+100 USDT bonus</span>
      </p>
    </div>

    <div style={{ position: "absolute", bottom: 20, right: 30 }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: 1 }}>
        DENNIS &bull; FOUNDER JETUP
      </span>
    </div>
  </div>
));

export default PromoBanner;
