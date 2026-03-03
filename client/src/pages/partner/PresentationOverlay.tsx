import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Video,
  Link,
  MessageSquare,
  Star,
  Shield,
  TrendingUp,
  BarChart3,
  Layers,
  Zap,
  Target,
  Users,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Rocket,
  HelpCircle,
  ChevronDown,
  Send,
  Check,
  List,
} from "lucide-react";
import type { SharedMessage } from "../PartnerDigitalHub";

interface PresentationOverlayProps {
  onBackToChat: () => void;
  messages: SharedMessage[];
  addMessage: (msg: Omit<SharedMessage, "id">) => number;
  updateMessage: (id: number, text: string) => void;
}

interface Slide {
  id: number;
  title: string;
  text: string;
  bullets?: string[];
  image: string;
  accent: string;
  icon: React.FC<{ size?: number; className?: string }>;
  overlay: string;
  suggestedQuestion: string;
}

async function streamDennisChat(
  chatHistory: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void,
) {
  try {
    const res = await fetch("/api/partner/dennis/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory }),
    });

    if (!res.ok || !res.body) {
      onError("Не удалось получить ответ");
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
    onError("Ошибка соединения");
  }
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Мечта",
    text: "Представьте проект, который долгосрочный. Где вы строите большую команду даже на перегретом рынке. Где есть чек, развитие и система дубликации.",
    image: "/images/presentation/hero_dream.png",
    accent: "#7C3AED",
    icon: Star,
    overlay: "linear-gradient(to bottom, rgba(124,58,237,0.3) 0%, rgba(0,0,0,0.85) 100%)",
    suggestedQuestion: "Как найти такой проект?",
  },
  {
    id: 2,
    title: "Стандарт",
    text: "Идеальный проект должен включать:",
    bullets: [
      "Финансовый продукт, связанный с реальным рынком",
      "Безопасность капитала",
      "Возможность вывода средств",
      "Маркетинг-план",
      "Систему дубликации",
    ],
    image: "/images/presentation/platform.png",
    accent: "#3B82F6",
    icon: CheckCircle,
    overlay: "linear-gradient(to bottom, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Почему именно эти критерии?",
  },
  {
    id: 3,
    title: "Факты рынка",
    text: "",
    bullets: [
      "Финансовые рынки растут",
      "MLM-индустрия > 650 млрд",
      "Интерес к пассивному доходу увеличивается",
    ],
    image: "/images/presentation/hero_scale.png",
    accent: "#06B6D4",
    icon: TrendingUp,
    overlay: "linear-gradient(to bottom, rgba(6,182,212,0.2) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Какие перспективы у рынка?",
  },
  {
    id: 4,
    title: "Диагноз",
    text: "",
    bullets: [
      "Нет баланса между прибылью и безопасностью",
      "Нет прозрачности",
      "Нет системы дубликации",
      "Всё держится на лидере",
    ],
    image: "/images/presentation/hero_chaos.png",
    accent: "#EF4444",
    icon: AlertTriangle,
    overlay: "linear-gradient(to bottom, rgba(239,68,68,0.2) 0%, rgba(0,0,0,0.9) 100%)",
    suggestedQuestion: "Почему 90% остаются без результата?",
  },
  {
    id: 5,
    title: "Решение",
    text: "JetUP — это экосистема, которая объединяет финансовый продукт и партнёрскую модель в одной структуре.",
    image: "/images/presentation/jetup_brand.png",
    accent: "#8B5CF6",
    icon: Lightbulb,
    overlay: "linear-gradient(to bottom, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0.85) 100%)",
    suggestedQuestion: "Что входит в экосистему JetUP?",
  },
  {
    id: 6,
    title: "Безопасность",
    text: "Средства находятся у лицензированного брокера. Контроль остаётся у клиента. Прозрачность операций.",
    image: "/images/presentation/safety.png",
    accent: "#22C55E",
    icon: Shield,
    overlay: "linear-gradient(to bottom, rgba(34,197,94,0.2) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Как обеспечивается безопасность средств?",
  },
  {
    id: 7,
    title: "Гибкость",
    text: "Нет жёсткой заморозки. Возможность вывода. Управляемость стратегии.",
    image: "/images/presentation/flexibility.png",
    accent: "#F59E0B",
    icon: Layers,
    overlay: "linear-gradient(to bottom, rgba(245,158,11,0.2) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Как работает вывод средств?",
  },
  {
    id: 8,
    title: "Рентабельность",
    text: "Баланс доходности и риска. Стратегический подход. Системная модель вместо хайпа.",
    image: "/images/presentation/profitability.png",
    accent: "#10B981",
    icon: BarChart3,
    overlay: "linear-gradient(to bottom, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Какая доходность и риски?",
  },
  {
    id: 9,
    title: "Переход",
    text: "Даже лучший продукт не масштабируется без системы.",
    image: "/images/presentation/hero_realization.png",
    accent: "#F97316",
    icon: Target,
    overlay: "linear-gradient(to bottom, rgba(249,115,22,0.25) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Почему система важнее продукта?",
  },
  {
    id: 10,
    title: "Партнёрская модель",
    text: "Маркетинг-план — потенциал. Результат создаёт инфраструктура.",
    bullets: [
      "Profit Share",
      "Infinity Bonus",
      "Global Pools",
      "Lifestyle Incentives",
    ],
    image: "/images/presentation/partner_network.png",
    accent: "#A855F7",
    icon: Users,
    overlay: "linear-gradient(to bottom, rgba(168,85,247,0.25) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Как работает партнёрская программа?",
  },
  {
    id: 11,
    title: "Простота механики",
    text: "",
    bullets: [
      "Человек → продукт",
      "→ партнёрская программа",
      "→ дубликация",
      "→ рост структуры",
    ],
    image: "/images/presentation/automation.png",
    accent: "#E88FEC",
    icon: Zap,
    overlay: "linear-gradient(to bottom, rgba(232,143,236,0.2) 0%, rgba(0,0,0,0.88) 100%)",
    suggestedQuestion: "Как работает дубликация?",
  },
  {
    id: 12,
    title: "Выбор",
    text: "Можно продолжать искать идеальный проект.\n\nМожно строить систему в рамках готовой экосистемы.",
    image: "/images/presentation/hero_discovery.png",
    accent: "#7C3AED",
    icon: Rocket,
    overlay: "linear-gradient(to bottom, rgba(124,58,237,0.3) 0%, rgba(0,0,0,0.85) 100%)",
    suggestedQuestion: "Как начать прямо сейчас?",
  },
];

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  onBackToChat,
  messages,
  addMessage,
  updateMessage,
}) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");

  const slide = slides[current];
  const isLast = current === slides.length - 1;
  const progress = ((current + 1) / slides.length) * 100;

  useEffect(() => {
    if (chatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatOpen, messages]);

  const buildChatHistory = useCallback((extraUserMsg?: string) => {
    const history: { role: string; content: string }[] = [];
    for (const msg of messages) {
      history.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
    if (extraUserMsg) {
      history.push({ role: "user", content: extraUserMsg });
    }
    return history;
  }, [messages]);

  const goTo = useCallback((index: number, dir?: number) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    setDirection(dir ?? (clamped > current ? 1 : -1));
    setCurrent(clamped);
    setShowToc(false);
  }, [current]);

  const handleNext = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1, 1);
  }, [current, goTo]);

  const handlePrev = useCallback(() => {
    if (current > 0) goTo(current - 1, -1);
  }, [current, goTo]);

  const sendToAI = useCallback((userText: string, openChatAfter?: boolean) => {
    addMessage({ text: userText, sender: "user" });
    setIsStreaming(true);

    const aiMsgId = addMessage({ text: "...", sender: "ai" });
    const history = buildChatHistory(userText);

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
        updateMessage(aiMsgId, `Ошибка: ${error}`);
        setIsStreaming(false);
        if (openChatAfter) setChatOpen(true);
      },
    );
  }, [addMessage, updateMessage, buildChatHistory]);

  const handleAskQuestion = useCallback(() => {
    if (isStreaming) return;
    sendToAI(slide.suggestedQuestion, true);
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
    enter: (d: number) => ({ x: d > 0 ? 280 : -280, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -280 : 280, opacity: 0, scale: 0.95 }),
  };

  return (
    <motion.div
      className="pres-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="pres-card"
              >
                <div className="pres-card-bg">
                  <img src={slide.image} alt="" className="pres-card-img" />
                  <div className="pres-card-overlay" style={{ background: slide.overlay }} />
                </div>

                <div className="pres-card-content">
                  <div className="pres-card-icon" style={{ background: `${slide.accent}25`, color: slide.accent }}>
                    <slide.icon size={22} />
                  </div>
                  <span className="pres-slide-num" style={{ color: slide.accent }}>
                    {String(slide.id).padStart(2, "0")}
                  </span>
                  <h2 className="pres-card-title">{slide.title}</h2>
                  {slide.text && (
                    <p className="pres-card-text">
                      {slide.text.split("\n\n").map((p, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <br />}
                          {p}
                        </React.Fragment>
                      ))}
                    </p>
                  )}
                  {slide.bullets && (
                    <ul className="pres-bullets">
                      {slide.bullets.map((b, i) => (
                        <li key={i} className="pres-bullet">
                          <span className="pres-bullet-dot" style={{ background: slide.accent }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="pres-nav-row">
            <button
              className="pres-nav-btn"
              onClick={handlePrev}
              disabled={current === 0}
              data-testid="btn-prev-slide"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              className="pres-ask-btn-fixed"
              onClick={handleAskQuestion}
              style={{ background: `${slide.accent}20`, borderColor: `${slide.accent}40`, color: slide.accent }}
              data-testid={`btn-ask-${slide.id}`}
            >
              <HelpCircle size={15} />
              {slide.suggestedQuestion}
            </button>

            {!isLast ? (
              <button
                className="pres-nav-btn pres-nav-next"
                onClick={handleNext}
                style={{ background: `${slide.accent}30`, borderColor: `${slide.accent}50` }}
                data-testid="btn-next-slide"
              >
                Далее
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
                Записаться на созвон
              </button>
              <button className="ph-btn-glass" data-testid="btn-start-link">
                <Link size={18} />
                Начать по моей ссылке
              </button>
              <button className="pres-back-link" onClick={onBackToChat} data-testid="btn-back-to-chat">
                <MessageSquare size={14} />
                Вернуться в чат
              </button>
            </div>
          )}
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
                <span>Оглавление</span>
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
                  placeholder="Напиши сообщение..."
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
