import React, { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import HeroSection from "./partner/HeroSection";
import ChatOverlay from "./partner/ChatOverlay";
import PresentationOverlay from "./partner/PresentationOverlay";

export interface SharedMessage {
  id: number;
  text: string;
  sender: "ai" | "user";
  type?: "presentation_trigger";
}

type AppState = "HERO" | "CHAT_OVERLAY" | "PRESENTATION_OVERLAY";

const PartnerDigitalHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<AppState>("HERO");
  const [presentationWatched, setPresentationWatched] = useState(false);
  const nextId = useRef(2);

  const [messages, setMessages] = useState<SharedMessage[]>([
    {
      id: 1,
      text: "Привет! Я — AI-копия Дениса. Ты рассматриваешь пассивный доход или построение команды?",
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
            presentationWatched={presentationWatched}
            messages={messages}
            addMessage={addMessage}
            updateMessage={updateMessage}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === "PRESENTATION_OVERLAY" && (
          <PresentationOverlay
            key="presentation"
            onBackToChat={backToChat}
            messages={messages}
            addMessage={addMessage}
            updateMessage={updateMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerDigitalHub;
