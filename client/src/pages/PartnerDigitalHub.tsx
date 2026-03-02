import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import HeroSection from "./partner/HeroSection";
import ChatOverlay from "./partner/ChatOverlay";
import PresentationOverlay from "./partner/PresentationOverlay";

type AppState = "HERO" | "CHAT_OVERLAY" | "PRESENTATION_OVERLAY";

const PartnerDigitalHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<AppState>("HERO");

  const openChat = () => setState("CHAT_OVERLAY");
  const closeChat = () => setState("HERO");
  const openPresentation = () => setState("PRESENTATION_OVERLAY");
  const backToChat = () => setState("CHAT_OVERLAY");
  const openLive = () => setLocation("/live");

  const showChat = state === "CHAT_OVERLAY" || state === "PRESENTATION_OVERLAY";

  return (
    <div className="ph-root">
      <HeroSection
        onOpenChat={openChat}
        onOpenLive={openLive}
        dimmed={showChat}
      />

      <AnimatePresence>
        {showChat && (
          <ChatOverlay
            key="chat"
            onClose={closeChat}
            onTriggerPresentation={openPresentation}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === "PRESENTATION_OVERLAY" && (
          <PresentationOverlay
            key="presentation"
            onBackToChat={backToChat}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerDigitalHub;
