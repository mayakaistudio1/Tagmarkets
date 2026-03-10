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
    <div style={{ padding: 16, background: "#0a0510", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}>
        <div
          ref={bannerRef}
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

            <h1
              style={{
                fontSize: 84,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.05,
                margin: 0,
                marginBottom: 16,
                letterSpacing: -1.5,
              }}
            >
              FOR NEW PARTNERS
            </h1>
            <p
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: "rgba(255,255,255,0.65)",
                margin: 0,
                marginBottom: 56,
                lineHeight: 1.4,
              }}
            >
              by Dennis, JetUp Founder
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 28,
                marginBottom: 42,
              }}
            >
              <span style={{ fontSize: 160, fontWeight: 800, color: "#C084FC", lineHeight: 1, textShadow: "0 0 50px rgba(168,85,247,0.6)" }}>
                100
              </span>

              <span style={{ fontSize: 72, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1, alignSelf: "center", marginBottom: "10px" }}>
                +
              </span>
              <span style={{ fontSize: 160, fontWeight: 800, color: "#C084FC", lineHeight: 1, textShadow: "0 0 50px rgba(168,85,247,0.6)" }}>
                100
              </span>
            </div>

            <p style={{ fontSize: 38, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0, maxWidth: 850 }}>
              Deposit 100 USDT and get{" "}
              <span style={{ color: "#C084FC", fontWeight: 900 }}>+100 USDT bonus</span>
            </p>
          </div>

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
