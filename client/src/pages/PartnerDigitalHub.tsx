import React, { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import HeroSection from "./partner/HeroSection";
import ChatOverlay from "./partner/ChatOverlay";
import PresentationOverlay from "./partner/PresentationOverlay";
import EcosystemOverlay from "./partner/EcosystemOverlay";

export interface SharedMessage {
  id: number;
  text: string;
  sender: "ai" | "user";
  type?: "presentation_trigger";
}

type AppState = "HERO" | "CHAT_OVERLAY" | "PRESENTATION_OVERLAY" | "ECOSYSTEM_OVERLAY";

const PartnerDigitalHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<AppState>("HERO");
  const [presentationWatched, setPresentationWatched] = useState(false);
  const nextId = useRef(2);

  const [messages, setMessages] = useState<SharedMessage[]>([
    {
      id: 1,
      text: "Привет! Я — AI-копия Денниса.\n\nМогу за пару минут показать, как устроена система JetUP, или ответить на любой вопрос.\n\nЧто тебе сейчас интереснее?",
      sender: "ai",
    },
  ]);

  const addMessage = useCallback((msg: Omit<SharedMessage, "id">) => {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { ...msg, id }]);
    return id;
  }, []);

  const updateMessage = useCallback((id: number, text: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text } : m))
    );
  }, []);

  const openChat = () => setState("CHAT_OVERLAY");
  const closeChat = () => setState("HERO");
  const openPresentation = () => setState("PRESENTATION_OVERLAY");
  const backToChat = () => {
    setPresentationWatched(true);
    setState("CHAT_OVERLAY");
  };
  const showEcosystem = () => setState("ECOSYSTEM_OVERLAY");
  const closeEcosystem = () => setState("PRESENTATION_OVERLAY");
  const openLive = () => setLocation("/live");

  const showChat = state === "CHAT_OVERLAY" || state === "PRESENTATION_OVERLAY" || state === "ECOSYSTEM_OVERLAY";

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
            presentationWatched={presentationWatched}
            messages={messages}
            addMessage={addMessage}
            updateMessage={updateMessage}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(state === "PRESENTATION_OVERLAY" || state === "ECOSYSTEM_OVERLAY") && (
          <PresentationOverlay
            key="presentation"
            onBackToChat={backToChat}
            onShowEcosystem={showEcosystem}
            messages={messages}
            addMessage={addMessage}
            updateMessage={updateMessage}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === "ECOSYSTEM_OVERLAY" && (
          <EcosystemOverlay
            key="ecosystem"
            onClose={closeEcosystem}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerDigitalHub;
