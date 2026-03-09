import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";

const PromoBanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportPNG = async () => {
    if (!bannerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(bannerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 1200,
        height: 675,
      });
      const link = document.createElement("a");
      link.download = "dennis_fast_start_promo_banner.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: 32, background: "#111", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div
        ref={bannerRef}
        style={{
          width: 1200,
          height: 675,
          position: "relative",
          overflow: "hidden",
          borderRadius: 0,
          fontFamily: "'Montserrat', sans-serif",
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
            background: "linear-gradient(135deg, rgba(10,5,30,0.85) 0%, rgba(30,10,60,0.6) 40%, rgba(10,15,40,0.4) 70%, rgba(10,5,30,0.75) 100%)",
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
              filter: "drop-shadow(0 0 40px rgba(124,58,237,0.4))",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 0,
            width: 400,
            height: "100%",
            background: "linear-gradient(to left, rgba(10,5,30,0.0) 0%, rgba(10,5,30,0.0) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 60,
            top: 48,
            right: 500,
            bottom: 48,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(124,58,237,0.25)",
                border: "1px solid rgba(168,85,247,0.4)",
                borderRadius: 8,
                padding: "6px 16px",
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: "#c4b5fd", letterSpacing: 2, textTransform: "uppercase" }}>
                JetUP Partner Promo
              </span>
            </div>

            <h1
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 8,
                letterSpacing: -1,
              }}
            >
              FAST START
            </h1>
            <h2
              style={{
                fontSize: 44,
                fontWeight: 800,
                background: "linear-gradient(135deg, #f59e0b, #f97316, #ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 24,
                letterSpacing: -0.5,
              }}
            >
              BONUS PROMO
            </h2>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: "#f59e0b",
                  lineHeight: 1,
                  textShadow: "0 0 30px rgba(245,158,11,0.4)",
                }}
              >
                100
              </span>
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                +
              </span>
              <span
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: "#f59e0b",
                  lineHeight: 1,
                  textShadow: "0 0 30px rgba(245,158,11,0.4)",
                }}
              >
                100
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1,
                  alignSelf: "center",
                }}
              >
                USD
              </span>
            </div>

            <p
              style={{
                fontSize: 17,
                fontWeight: 500,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.5,
                margin: 0,
                maxWidth: 500,
              }}
            >
              Zahle 100 USD ein und erhalte
              <span style={{ color: "#f59e0b", fontWeight: 700 }}> +100 USD Bonus</span>.
              <br />
              Amplify 24x &bull; Sonic Strategy &bull; 4.800 USD Konto
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                borderRadius: 12,
                padding: "12px 28px",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: 0.5 }}>
                Jetzt teilnehmen
              </span>
              <span style={{ fontSize: 18, color: "#ffffff" }}>&#8594;</span>
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
              Nur für neue Partner
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 30,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: 1 }}>
            DENNIS &bull; FOUNDER JETUP
          </span>
        </div>
      </div>

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
        {exporting ? "Exporting..." : "Download PNG (2400x1350)"}
      </button>
    </div>
  );
};

export default PromoBanner;
