import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Video,
  Link,
  MessageSquare,
  Send,
  List,
  Globe,
  Shield,
  TrendingUp,
  Cpu,
} from "lucide-react";
import type { SharedMessage } from "../PartnerDigitalHub";
import FinancialBackground from "./FinancialBackground";
import EcosystemMapSlide from "./EcosystemMapSlide";
import { useLanguage } from "../../contexts/LanguageContext";

interface PresentationOverlayProps {
  onBackToChat: () => void;
  onShowEcosystem: () => void;
  messages: SharedMessage[];
  addMessage: (msg: Omit<SharedMessage, "id">) => number;
  updateMessage: (id: number, text: string) => void;
}

interface Chip {
  text: string;
  intent: string;
}

interface InteractiveItem {
  label: string;
  description: string;
  color?: string;
}

interface Slide {
  id: number;
  title: string;
  text: string;
  image: string;
  accent: string;
  chips: Chip[];
  type: "standard" | "ecosystem";
  interactiveType?: "security-points" | "strategy-cards" | "graph-points" | "ai-nodes";
  interactiveItems?: InteractiveItem[];
}

function buildSlides(t: (key: string) => string): Slide[] {
  return [
    {
      id: 1,
      title: t('pdh.s1.title'),
      text: t('pdh.s1.text'),
      image: "/images/presentation/scene_01.png",
      accent: "#7C3AED",
      type: "standard",
      chips: [
        { text: t('pdh.s1.c1'), intent: "REALITY_WHY" },
        { text: t('pdh.s1.c2'), intent: "REALITY_MISTAKES" },
      ],
    },
    {
      id: 2,
      title: t('pdh.s2.title'),
      text: t('pdh.s2.text'),
      image: "/images/presentation/scene_02.png",
      accent: "#EF4444",
      type: "standard",
      chips: [
        { text: t('pdh.s2.c1'), intent: "DIAGNOSIS_LEADER" },
        { text: t('pdh.s2.c2'), intent: "DIAGNOSIS_EXIT" },
      ],
    },
    {
      id: 3,
      title: t('pdh.s3.title'),
      text: t('pdh.s3.text'),
      image: "/images/presentation/scene_03.png",
      accent: "#8B5CF6",
      type: "standard",
      chips: [
        { text: t('pdh.s3.c1'), intent: "MODEL_THREE" },
        { text: t('pdh.s3.c2'), intent: "MODEL_MISSING" },
      ],
    },
    {
      id: 4,
      title: t('pdh.s4.title'),
      text: t('pdh.s4.text'),
      image: "/images/presentation/scene_04.png",
      accent: "#22C55E",
      type: "standard",
      interactiveType: "security-points",
      interactiveItems: [
        { label: t('pdh.s4.i1.label'), description: t('pdh.s4.i1.desc'), color: "#22C55E" },
        { label: t('pdh.s4.i2.label'), description: t('pdh.s4.i2.desc'), color: "#3B82F6" },
        { label: t('pdh.s4.i3.label'), description: t('pdh.s4.i3.desc'), color: "#F59E0B" },
      ],
      chips: [
        { text: t('pdh.s4.c1'), intent: "SAFETY_CAPITAL" },
        { text: t('pdh.s4.c2'), intent: "SAFETY_WITHDRAW" },
      ],
    },
    {
      id: 5,
      title: t('pdh.s5.title'),
      text: t('pdh.s5.text'),
      image: "/images/presentation/scene_05.png",
      accent: "#F59E0B",
      type: "standard",
      interactiveType: "strategy-cards",
      interactiveItems: [
        { label: t('pdh.s5.i1.label'), description: t('pdh.s5.i1.desc'), color: "#22C55E" },
        { label: t('pdh.s5.i2.label'), description: t('pdh.s5.i2.desc'), color: "#3B82F6" },
        { label: t('pdh.s5.i3.label'), description: t('pdh.s5.i3.desc'), color: "#EF4444" },
      ],
      chips: [
        { text: t('pdh.s5.c1'), intent: "FLEXIBILITY_CHANGE" },
        { text: t('pdh.s5.c2'), intent: "FLEXIBILITY_STOP" },
      ],
    },
    {
      id: 6,
      title: t('pdh.s6.title'),
      text: t('pdh.s6.text'),
      image: "/images/presentation/scene_06.png",
      accent: "#10B981",
      type: "standard",
      interactiveType: "graph-points",
      interactiveItems: [
        { label: t('pdh.s6.i1.label'), description: t('pdh.s6.i1.desc'), color: "#3B82F6" },
        { label: t('pdh.s6.i2.label'), description: t('pdh.s6.i2.desc'), color: "#22C55E" },
        { label: t('pdh.s6.i3.label'), description: t('pdh.s6.i3.desc'), color: "#F59E0B" },
      ],
      chips: [
        { text: t('pdh.s6.c1'), intent: "PROFIT_NO_HYPE" },
        { text: t('pdh.s6.c2'), intent: "PROFIT_SUSTAINABLE" },
      ],
    },
    {
      id: 7,
      title: t('pdh.s7.title'),
      text: t('pdh.s7.text'),
      image: "/images/presentation/scene_07.png",
      accent: "#F97316",
      type: "standard",
      chips: [
        { text: t('pdh.s7.c1'), intent: "SCALE_DUPLICATION" },
        { text: t('pdh.s7.c2'), intent: "SCALE_WHY" },
      ],
    },
    {
      id: 8,
      title: t('pdh.s8.title'),
      text: t('pdh.s8.text'),
      image: "/images/presentation/scene_08.png",
      accent: "#E88FEC",
      type: "standard",
      interactiveType: "ai-nodes",
      interactiveItems: [
        { label: t('pdh.s8.i1.label'), description: t('pdh.s8.i1.desc'), color: "#A855F7" },
        { label: t('pdh.s8.i2.label'), description: t('pdh.s8.i2.desc'), color: "#3B82F6" },
        { label: t('pdh.s8.i3.label'), description: t('pdh.s8.i3.desc'), color: "#22C55E" },
        { label: t('pdh.s8.i4.label'), description: t('pdh.s8.i4.desc'), color: "#F59E0B" },
      ],
      chips: [
        { text: t('pdh.s8.c1'), intent: "AI_REPLACE" },
        { text: t('pdh.s8.c2'), intent: "AI_QUALIFY" },
        { text: t('pdh.s8.c3'), intent: "AI_LIVE" },
      ],
    },
    {
      id: 9,
      title: t('pdh.s9.title'),
      text: t('pdh.s9.text'),
      image: "/images/presentation/scene_09.png",
      accent: "#A855F7",
      type: "ecosystem",
      chips: [
        { text: t('pdh.s9.c1'), intent: "ECO_CONNECTION" },
        { text: t('pdh.s9.c2'), intent: "ECO_PARTNER_VALUE" },
      ],
    },
    {
      id: 10,
      title: t('pdh.s10.title'),
      text: t('pdh.s10.text'),
      image: "/images/presentation/scene_10.png",
      accent: "#7C3AED",
      type: "standard",
      chips: [],
    },
  ];
}

const SecurityPoints: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-security-row"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    {items.map((item, i) => (
      <button
        key={i}
        className="si-security-pill"
        onClick={() => onSelect(item)}
        data-testid={`security-point-${i}`}
      >
        <span className="si-pill-dot" style={{ background: item.color }} />
        <span className="si-pill-label">{item.label}</span>
      </button>
    ))}
  </motion.div>
);

const StrategyCards: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-strategy-row"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    {items.map((item, i) => (
      <button
        key={i}
        className="si-strategy-card"
        onClick={() => onSelect(item)}
        style={{ borderColor: `${item.color}40` }}
        data-testid={`strategy-card-${i}`}
      >
        <span className="si-strategy-indicator" style={{ background: item.color }} />
        <span className="si-strategy-name">{item.label}</span>
      </button>
    ))}
  </motion.div>
);

const GraphPoints: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-graph-container"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    <svg viewBox="0 0 300 60" className="si-graph-svg">
      <polyline points="10,50 80,35 180,20 290,8" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="2" />
      <polyline points="10,50 80,35 180,20 290,8" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="1.5" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
      </polyline>
    </svg>
    <div className="si-graph-points">
      {items.map((item, i) => (
        <button
          key={i}
          className="si-graph-point"
          onClick={() => onSelect(item)}
          data-testid={`graph-point-${i}`}
        >
          <span className="si-graph-dot" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}>
            <span className="si-graph-dot-ping" style={{ borderColor: item.color }} />
          </span>
          <span className="si-graph-label">{item.label}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

const AiNodes: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-ai-grid"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    {items.map((item, i) => (
      <button
        key={i}
        className="si-ai-node"
        onClick={() => onSelect(item)}
        data-testid={`ai-node-${i}`}
      >
        <span className="si-ai-dot" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}60` }} />
        <span className="si-ai-label">{item.label}</span>
      </button>
    ))}
    <svg className="si-ai-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="25" y1="25" x2="75" y2="25" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="25" y1="75" x2="75" y2="75" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="25" y1="25" x2="25" y2="75" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="75" y1="25" x2="75" y2="75" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="25" y1="25" x2="75" y2="75" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
      <line x1="75" y1="25" x2="25" y2="75" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
    </svg>
  </motion.div>
);

const MicroInfoCard: React.FC<{ item: InteractiveItem; onClose: () => void }> = ({ item, onClose }) =>
  ReactDOM.createPortal(
    <>
      <motion.div
        className="si-micro-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="si-micro-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        <div className="si-micro-header">
          <span className="si-micro-dot" style={{ background: item.color }} />
          <span className="si-micro-title">{item.label}</span>
          <button className="si-micro-close" onClick={onClose}><X size={14} /></button>
        </div>
        <p className="si-micro-desc">{item.description}</p>
      </motion.div>
    </>,
    document.body
  );

async function streamDennisChat(
  chatHistory: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void,
  errorMsg: string,
  connErrorMsg: string,
) {
  try {
    const res = await fetch("/api/partner/dennis/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory }),
    });

    if (!res.ok || !res.body) {
      onError(errorMsg);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            fullText += data.content;
            onChunk(fullText);
          }
          if (data.done) {
            onDone(data.fullContent || fullText);
            return;
          }
          if (data.error) {
            onError(data.error);
            return;
          }
        } catch {}
      }
    }
    onDone(fullText);
  } catch {
    onError(connErrorMsg);
  }
}

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  onBackToChat,
  onShowEcosystem,
  messages,
  addMessage,
  updateMessage,
}) => {
  const { t } = useLanguage();
  const slides = useMemo(() => buildSlides(t), [t]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [cardPulse, setCardPulse] = useState(false);
  const [activeInteractiveItem, setActiveInteractiveItem] = useState<InteractiveItem | null>(null);

  const slide = slides[current];
  const isLast = current === slides.length - 1;
  const progress = ((current + 1) / slides.length) * 100;

  useEffect(() => {
    if (chatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatOpen, messages]);

  const buildChatHistory = useCallback((extraUserMsg?: string, slideContext?: Slide) => {
    const history: { role: string; content: string }[] = [];
    for (const msg of messages) {
      history.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
    if (slideContext) {
      const ctx = `[${t('pdh.slideContext')} "${slideContext.title}". ${slideContext.text}. ${t('pdh.slideContextSuffix')}]`;
      history.push({ role: "system", content: ctx });
    }
    if (extraUserMsg) {
      history.push({ role: "user", content: extraUserMsg });
    }
    return history;
  }, [messages, t]);

  const goTo = useCallback((index: number, dir?: number) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    setDirection(dir ?? (clamped > current ? 1 : -1));
    setCurrent(clamped);
    setShowToc(false);
    setActiveInteractiveItem(null);
  }, [current, slides.length]);

  const handleNext = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1, 1);
  }, [current, goTo, slides.length]);

  const handlePrev = useCallback(() => {
    if (current > 0) goTo(current - 1, -1);
  }, [current, goTo]);

  const sendToAI = useCallback((userText: string, openChatAfter?: boolean, slideCtx?: Slide) => {
    addMessage({ text: userText, sender: "user" });
    setIsStreaming(true);

    const aiMsgId = addMessage({ text: "...", sender: "ai" });
    const history = buildChatHistory(userText, slideCtx);

    streamDennisChat(
      history,
      (partialText) => {
        updateMessage(aiMsgId, partialText);
      },
      (fullText) => {
        updateMessage(aiMsgId, fullText);
        setIsStreaming(false);
        if (openChatAfter) setChatOpen(true);
      },
      (error) => {
        updateMessage(aiMsgId, `${t('pdh.errorShort')}${error}`);
        setIsStreaming(false);
        if (openChatAfter) setChatOpen(true);
      },
      t('pdh.errorResponse'),
      t('pdh.errorConnection'),
    );
  }, [addMessage, updateMessage, buildChatHistory, t]);

  const handleChipClick = useCallback((chip: Chip) => {
    if (isStreaming) return;
    setCardPulse(true);
    setTimeout(() => setCardPulse(false), 150);
    sendToAI(chip.text, true, slide);
  }, [slide, sendToAI, isStreaming]);

  const handleEcoAskDennis = useCallback((intent: string, question: string) => {
    if (isStreaming) return;
    sendToAI(question, true, slide);
  }, [slide, sendToAI, isStreaming]);

  const handleChatSend = useCallback(() => {
    if (!chatInput.trim() || isStreaming) return;
    const text = chatInput.trim();
    setChatInput("");
    sendToAI(text);
  }, [chatInput, sendToAI, isStreaming]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.y > 80 && info.velocity.y > 0) {
      setChatOpen(true);
    }
  }, []);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0, scale: 0.98, y: 18 }),
    center: { x: 0, opacity: 1, scale: 1, y: 0 },
    exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0, scale: 0.98, y: 18 }),
  };

  return (
    <motion.div
      className="pres-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <FinancialBackground slideIndex={current} />

      <div className="pres-progress-bar">
        <motion.div
          className="pres-progress-fill"
          style={{ background: slide.accent }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="pres-layout">
        <div className="pres-main">
          <div className="pres-top-row">
            <button className="pres-close-btn" onClick={onBackToChat} data-testid="btn-close-pres">
              <X size={18} />
            </button>
            <span className="pres-counter">{current + 1} / {slides.length}</span>
            <button className="pres-toc-trigger" onClick={() => setShowToc(true)} data-testid="btn-toc">
              <List size={18} />
            </button>
          </div>

          <motion.div
            className="pres-stage"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="pres-slide-frame"
              >
                {slide.type === "ecosystem" ? (
                  <EcosystemMapSlide onAskDennis={handleEcoAskDennis} />
                ) : (
                  <>
                    <div className="pres-scene-layer">
                      <img src={slide.image} alt="" className="pres-scene-img" />
                      <div className="pres-scene-fade" />
                    </div>

                    <motion.div 
                      className="pres-glass-card"
                      animate={{ scale: cardPulse ? 1.02 : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.span
                        className="pres-slide-num"
                        style={{ color: slide.accent }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.35 }}
                      >
                        {String(slide.id).padStart(2, "0")}
                      </motion.span>
                      <motion.h2
                        className="pres-card-title"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.45, ease: "easeOut" }}
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p
                        className="pres-card-text"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                      >
                        {slide.text.split("\n\n").map((p, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <><br /><br /></>}
                            {p.split("\n").map((line, j) => (
                              <React.Fragment key={j}>
                                {j > 0 && <br />}
                                {line}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </motion.p>

                      {slide.interactiveType && slide.interactiveItems && (
                        <>
                          {slide.interactiveType === "security-points" && (
                            <SecurityPoints items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                          {slide.interactiveType === "strategy-cards" && (
                            <StrategyCards items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                          {slide.interactiveType === "graph-points" && (
                            <GraphPoints items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                          {slide.interactiveType === "ai-nodes" && (
                            <AiNodes items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                        </>
                      )}
                    </motion.div>

                    <AnimatePresence>
                      {activeInteractiveItem && (
                        <MicroInfoCard
                          item={activeInteractiveItem}
                          onClose={() => setActiveInteractiveItem(null)}
                        />
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="pres-bottom-area">
            {slide.chips.length > 0 && (
              <motion.div
                className="pres-chips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.35 }}
              >
                {slide.chips.map((chip, i) => (
                  <button
                    key={i}
                    className="pres-chip"
                    onClick={() => handleChipClick(chip)}
                    disabled={isStreaming}
                    data-testid={`chip-${slide.id}-${i}`}
                  >
                    <MessageSquare size={13} />
                    {chip.text}
                  </button>
                ))}
              </motion.div>
            )}

            <div className="pres-nav-row">
              <button
                className="pres-nav-btn"
                onClick={handlePrev}
                disabled={current === 0}
                data-testid="btn-prev-slide"
              >
                <ChevronLeft size={20} />
              </button>

              {!isLast ? (
                <button
                  className="pres-nav-btn pres-nav-next"
                  onClick={handleNext}
                  style={{ background: `${slide.accent}25`, borderColor: `${slide.accent}40` }}
                  data-testid="btn-next-slide"
                >
                  {t('pdh.next')}
                  <ChevronRight size={20} />
                </button>
              ) : (
                <div style={{ width: 52 }} />
              )}
            </div>

            {isLast && (
              <div className="pres-final-actions">
                <button className="ph-btn-primary" data-testid="btn-schedule-call">
                  <Video size={18} />
                  {t('pdh.scheduleCall')}
                </button>
                <button className="ph-btn-glass" data-testid="btn-start-link">
                  <Link size={18} />
                  {t('pdh.startLink')}
                </button>
                <button className="ph-btn-glass" onClick={() => setChatOpen(true)} data-testid="btn-ask-dennis">
                  <MessageSquare size={18} />
                  {t('pdh.goTelegram')}
                </button>
                <button className="ph-btn-outline" onClick={onShowEcosystem} data-testid="btn-show-ecosystem">
                  <Globe size={18} />
                  {t('pdh.viewEcosystem')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToc && (
          <>
            <motion.div
              className="pres-toc-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToc(false)}
            />
            <motion.div
              className="pres-toc-panel-popup"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="pres-toc-header">
                <span>{t('pdh.toc')}</span>
                <button className="pres-close-btn-small" onClick={() => setShowToc(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="pres-toc-list">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    className={`pres-toc-item ${i === current ? "pres-toc-active" : ""}`}
                    style={i === current ? { borderColor: s.accent, color: s.accent } : undefined}
                    onClick={() => goTo(i)}
                    data-testid={`toc-slide-${s.id}`}
                  >
                    <span className="pres-toc-num">{String(s.id).padStart(2, "0")}</span>
                    <span className="pres-toc-title">{s.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              className="pres-chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              className="pres-chat-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setChatOpen(false);
              }}
            >
              <div className="pres-chat-handle" />
              <div className="pres-chat-head">
                <div className="ph-chat-header-left">
                  <div className="ph-chat-avatar-small">
                    <img src="/dennis-photo.png" alt="Dennis" />
                  </div>
                  <div>
                    <span className="ph-chat-name">Dennis AI</span>
                    <span className="ph-chat-status">
                      <span className="ph-status-dot" />
                      Online
                    </span>
                  </div>
                </div>
                <button className="pres-close-btn" onClick={() => setChatOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="pres-chat-messages" ref={chatScrollRef}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ph-msg ${msg.sender === "user" ? "ph-msg-user" : "ph-msg-ai"}`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="ph-chat-input-row">
                <input
                  type="text"
                  className="ph-chat-input"
                  placeholder={t('pdh.chatPlaceholder')}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                  disabled={isStreaming}
                  data-testid="input-pres-chat"
                />
                <button className="ph-chat-send" onClick={handleChatSend} disabled={isStreaming} data-testid="btn-pres-chat-send">
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PresentationOverlay;
