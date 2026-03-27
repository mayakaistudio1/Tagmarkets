import React from "react";

const bonusGroups = [
  {
    title: "Bonus 1 — Lot Commissions",
    images: [
      { file: "lot-commissions-01-deal-flow.png", label: "Deal-to-Commission Flow" },
      { file: "lot-commissions-02-team-depth.png", label: "Team Depth Map" },
      { file: "lot-commissions-03-recurring-pulse.png", label: "Recurring Income Pulse" },
      { file: "lot-commissions-04-activity-economy.png", label: "Structured Activity Economy" },
    ],
  },
  {
    title: "Bonus 2 — Profit Share",
    images: [
      { file: "profit-share-05-result-flow.png", label: "Result Flow Structure" },
      { file: "profit-share-06-activity-result-split.png", label: "Activity vs Result Split" },
      { file: "profit-share-07-profitable-growth.png", label: "Profitable Team Growth" },
      { file: "profit-share-08-residual-architecture.png", label: "Residual Income Architecture" },
    ],
  },
  {
    title: "Bonus 3 — Infinity Bonus",
    images: [
      { file: "infinity-bonus-09-deep-expansion.png", label: "Deep Network Expansion" },
      { file: "infinity-bonus-10-duplication-engine.png", label: "Duplication Engine" },
      { file: "infinity-bonus-11-scale-beyond.png", label: "Scale Beyond First Levels" },
      { file: "infinity-bonus-12-scalable-org.png", label: "Scalable Org Architecture" },
    ],
  },
  {
    title: "Bonus 4 — Global Pool",
    images: [
      { file: "global-pool-13-company-pool.png", label: "Company-Wide Pool Layer" },
      { file: "global-pool-14-maturity-layer.png", label: "Maturity Layer Activation" },
      { file: "global-pool-15-bonus-economy.png", label: "Bonus Economy Map" },
      { file: "global-pool-16-leader-system.png", label: "Long-Term Leader System" },
    ],
  },
];

export default function BrollGalleryPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060212",
        color: "#fff",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        padding: "40px 24px",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <h1
        data-testid="text-gallery-title"
        style={{
          fontSize: 32,
          fontWeight: 800,
          textAlign: "center",
          marginBottom: 8,
          background: "linear-gradient(180deg, #7C3AED 0%, #C084FC 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        JetUP B-Roll Templates for HeyGen
      </h1>
      <p
        data-testid="text-gallery-subtitle"
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
          marginBottom: 48,
        }}
      >
        16 branded visual graphics — 4 per bonus type
      </p>

      {bonusGroups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 56 }}>
          <h2
            data-testid={`text-group-title-${gi}`}
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: "1px solid rgba(124, 58, 237, 0.3)",
              color: "#C084FC",
            }}
          >
            {group.title}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {group.images.map((img, ii) => (
              <div
                key={ii}
                data-testid={`card-broll-${gi}-${ii}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <img
                  src={`/images/heygen-broll/${img.file}`}
                  alt={img.label}
                  data-testid={`img-broll-${gi}-${ii}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    background: "#060212",
                  }}
                />
                <div
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.8)",
                    borderTop: "1px solid rgba(124, 58, 237, 0.15)",
                  }}
                >
                  <span data-testid={`text-broll-label-${gi}-${ii}`}>{img.label}</span>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 4,
                      fontFamily: "monospace",
                    }}
                  >
                    {img.file}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
