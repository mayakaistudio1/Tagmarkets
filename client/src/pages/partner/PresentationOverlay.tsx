import React, { useState, useCallback, useRef, useEffect } from "react";
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
} from "lucide-react";
import type { SharedMessage } from "../PartnerDigitalHub";
import FinancialBackground from "./FinancialBackground";
import EcosystemMapSlide from "./EcosystemMapSlide";

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

interface Slide {
  id: number;
  title: string;
  text: string;
  image: string;
  accent: string;
  chips: Chip[];
  type: "standard" | "ecosystem";
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
    title: "Реальность",
    text: "Рынок финансов растёт.\nИнтерес к пассивному доходу растёт.\n\nНо большинство людей не зарабатывает системно.\n\nПочему?",
    image: "/images/presentation/scene_01.png",
    accent: "#7C3AED",
    type: "standard",
    chips: [
      { text: "Почему большинство не зарабатывает?", intent: "REALITY_WHY" },
      { text: "Какие ошибки делают новички?", intent: "REALITY_MISTAKES" },
    ],
  },
  {
    id: 2,
    title: "Диагноз",
    text: "Проблема не в людях. Проблема в модели.\n\nОбычно всё строится на одном сильном лидере, обещаниях и отсутствии системы дубликации.\n\nБез структуры масштаб невозможен.",
    image: "/images/presentation/scene_02.png",
    accent: "#EF4444",
    type: "standard",
    chips: [
      { text: "Почему модель держится на одном лидере?", intent: "DIAGNOSIS_LEADER" },
      { text: "Что происходит, когда лидер уходит?", intent: "DIAGNOSIS_EXIT" },
    ],
  },
  {
    id: 3,
    title: "Модель",
    text: "JetUp — это не «ещё один проект».\n\nЭто соединение финансового продукта, партнёрской модели и инфраструктуры масштабирования в одной системе.",
    image: "/images/presentation/scene_03.png",
    accent: "#8B5CF6",
    type: "standard",
    chips: [
      { text: "Почему важно соединение трёх элементов?", intent: "MODEL_THREE" },
      { text: "Что ломается, если одного элемента нет?", intent: "MODEL_MISSING" },
    ],
  },
  {
    id: 4,
    title: "Безопасность",
    text: "Капитал остаётся на твоём личном аккаунте.\nВерификация на твоё имя.\nТы контролируешь ввод и вывод средств.\n\nКонтроль — у тебя, не у компании.",
    image: "/images/presentation/scene_04.png",
    accent: "#22C55E",
    type: "standard",
    chips: [
      { text: "Где именно хранится капитал?", intent: "SAFETY_CAPITAL" },
      { text: "Кто принимает решение о выводе?", intent: "SAFETY_WITHDRAW" },
    ],
  },
  {
    id: 5,
    title: "Гибкость",
    text: "Нет жёсткой заморозки.\nТы выбираешь стратегию.\nТы можешь менять решения.\n\nЭто управляемая модель.",
    image: "/images/presentation/scene_05.png",
    accent: "#F59E0B",
    type: "standard",
    chips: [
      { text: "Можно ли поменять стратегию?", intent: "FLEXIBILITY_CHANGE" },
      { text: "Можно ли остановить в любой момент?", intent: "FLEXIBILITY_STOP" },
    ],
  },
  {
    id: 6,
    title: "Рентабельность",
    text: "Мы не строим модель на агрессивных обещаниях.\n\nСистема ориентирована на устойчивость, а не на краткосрочные всплески.\n\nРеалистичный подход сильнее хайпа.",
    image: "/images/presentation/scene_06.png",
    accent: "#10B981",
    type: "standard",
    chips: [
      { text: "Почему вы не обещаете «иксы»?", intent: "PROFIT_NO_HYPE" },
      { text: "Что значит устойчивый подход?", intent: "PROFIT_SUSTAINABLE" },
    ],
  },
  {
    id: 7,
    title: "Масштаб",
    text: "Даже лучший продукт не масштабируется сам.\n\nПартнёру нужна система, которая позволяет дублицировать действия.\n\nБез инфраструктуры масштаб остаётся идеей.",
    image: "/images/presentation/scene_07.png",
    accent: "#F97316",
    type: "standard",
    chips: [
      { text: "Что такое «дубликация» на практике?", intent: "SCALE_DUPLICATION" },
      { text: "Почему продукт сам не масштабируется?", intent: "SCALE_WHY" },
    ],
  },
  {
    id: 8,
    title: "AI-инфраструктура",
    text: "Каждый партнёр получает цифровую систему:\nAI-чат, интерактивную мини-презентацию, квалификацию лидов и поддержку 24/7.\n\nСистема работает за тебя, пока ты спишь.\nОна презентует, объясняет и фильтрует интерес.\n\nЭто позволяет дублицировать себя.",
    image: "/images/presentation/scene_08.png",
    accent: "#E88FEC",
    type: "standard",
    chips: [
      { text: "Что AI делает вместо партнёра?", intent: "AI_REPLACE" },
      { text: "Как AI квалифицирует людей?", intent: "AI_QUALIFY" },
      { text: "Как это выглядит вживую?", intent: "AI_LIVE" },
    ],
  },
  {
    id: 9,
    title: "Экосистема JetUP",
    text: "Единая инфраструктура: брокер, биржа, карта, AI-система и партнёрская сеть — всё связано в одну экосистему.",
    image: "/images/presentation/scene_09.png",
    accent: "#A855F7",
    type: "ecosystem",
    chips: [
      { text: "Как всё связано между собой?", intent: "ECO_CONNECTION" },
      { text: "Что даёт экосистема партнёру?", intent: "ECO_PARTNER_VALUE" },
    ],
  },
  {
    id: 10,
    title: "Выбор",
    text: "Ты можешь просто изучать информацию.\n\nИли выстроить стратегию правильно с первого шага.\n\nЯ помогу определить формат участия под твой опыт и цели.",
    image: "/images/presentation/scene_10.png",
    accent: "#7C3AED",
    type: "standard",
    chips: [],
  },
];

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  onBackToChat,
  onShowEcosystem,
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
  const [cardPulse, setCardPulse] = useState(false);

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
      const ctx = `[Контекст: пользователь смотрит слайд "${slideContext.title}". Содержание: "${slideContext.text}". Ответь на вопрос, опираясь именно на контекст этого слайда. После ответа мягко предложи продолжить презентацию или записаться на созвон.]`;
      history.push({ role: "system", content: ctx });
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
        updateMessage(aiMsgId, `Ошибка: ${error}`);
        setIsStreaming(false);
        if (openChatAfter) setChatOpen(true);
      },
    );
  }, [addMessage, updateMessage, buildChatHistory]);

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
                    </motion.div>
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
                <button className="ph-btn-glass" onClick={() => setChatOpen(true)} data-testid="btn-ask-dennis">
                  <MessageSquare size={18} />
                  Задать вопрос Dennis AI
                </button>
                <button className="ph-btn-outline" onClick={onShowEcosystem} data-testid="btn-show-ecosystem">
                  <Globe size={18} />
                  Открыть JetUp Hub
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
