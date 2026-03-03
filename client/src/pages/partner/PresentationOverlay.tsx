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
  detailedAnswer: string;
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
    detailedAnswer: "Ключевые критерии долгосрочного проекта: реальный финансовый продукт, прозрачная структура, возможность вывода средств и система дубликации. JetUP объединяет все эти элементы в одной экосистеме — брокер, биржа и платёжные карты. Это не очередной хайп, а инфраструктура для построения бизнеса.",
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
    detailedAnswer: "Эти пять критериев — результат анализа сотен проектов. Без реального продукта — нет ценности. Без безопасности — нет доверия. Без вывода — нет свободы. Без маркетинг-плана — нет мотивации для партнёров. Без дубликации — нет масштабирования. JetUP закрывает каждый из этих пунктов через свою инфраструктуру.",
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
    detailedAnswer: "Глобальный рынок сетевого маркетинга превысил 650 млрд долларов и продолжает расти. Финтех-сектор растёт на 20% ежегодно. Пересечение этих двух трендов — именно то место, где находится JetUP. Спрос на пассивный доход и финансовую грамотность увеличивается, особенно среди молодой аудитории 25-45 лет.",
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
    detailedAnswer: "Главная проблема — отсутствие системы. В большинстве проектов всё завязано на лидере: он рекрутирует, обучает, мотивирует. Когда лидер останавливается — структура замирает. Плюс часто нет реального продукта, только маркетинг. А без прозрачности люди теряют доверие. JetUP решает это через AI-хабы: каждый партнёр получает цифрового двойника, который работает за него — объясняет, отвечает на вопросы, проводит презентации.",
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
    detailedAnswer: "Экосистема JetUP — это три направления: лицензированный брокер для торговли и инвестиций, криптобиржа с собственными торговыми сборами, и платёжные карты для повседневных расчётов. Каждое направление генерирует доход, а партнёрская программа позволяет получать комиссию со всех трёх источников одновременно.",
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
    detailedAnswer: "Принцип кастодиальности: твои средства всегда на твоём брокерском счёте, не у JetUP. Брокер регулируется финансовыми органами. Ты в любой момент можешь вывести средства — нет заморозок, нет скрытых условий. Все операции прозрачны и видны в личном кабинете. Это ключевое отличие от большинства проектов на рынке.",
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
    detailedAnswer: "В JetUP нет жёстких сроков заморозки. Ты можешь вывести средства в любой момент по стандартной процедуре брокера. Ты сам выбираешь стратегию — от консервативной до агрессивной. Можешь менять параметры, приостанавливать или полностью выходить. Полный контроль остаётся у тебя.",
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
    detailedAnswer: "JetUP — это не обещания сверхдоходности, а системный подход. Доходность зависит от выбранной стратегии и рыночных условий. Ключевое преимущество — баланс: ты не ставишь всё на одну карту. Три источника дохода (брокер, биржа, карты) диверсифицируют риски. Плюс партнёрская программа создаёт дополнительный, не зависящий от рынка доход.",
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
    detailedAnswer: "Отличный продукт — это фундамент, но без системы дубликации он остаётся только у тебя. Система — это то, что позволяет любому партнёру повторить результат без личного наставничества 24/7. В JetUP это решается через AI-хабы: каждый партнёр получает цифрового двойника, который работает за него — объясняет, отвечает на вопросы, проводит презентации.",
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
    detailedAnswer: "Четыре источника дохода для партнёров. Profit Share — комиссия $10.50 за лот с брокера. Infinity Bonus — до 10 уровней глубины. Global Pools — доля от глобального оборота биржи до 60%. Lifestyle Incentives — бонусы за достижения (путешествия, авто, lifestyle). Маркетинг-план создаёт потенциал, но реальный результат обеспечивает инфраструктура JetUP.",
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
    detailedAnswer: "Механика простая: человек знакомится с продуктом через AI-хаб партнёра. Если ему интересно — регистрируется. Получает свой AI-хаб и начинает делиться ссылкой. Его контакты проходят тот же путь. Система работает автоматически: AI отвечает на вопросы, проводит презентации, собирает контакты. Партнёру не нужно быть экспертом — система дублицирует процесс за него.",
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
    detailedAnswer: "Два пути: как клиент — открываешь брокерский счёт, выбираешь стратегию и начинаешь получать пассивный доход. Как партнёр — получаешь свой AI-хаб, делишься ссылкой и строишь структуру. Можно совмещать оба направления. Запишись на созвон с Денисом для персонального разбора или начни по реферальной ссылке.",
  },
];

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  onBackToChat,
  messages,
  addMessage,
}) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showToc, setShowToc] = useState(false);
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

  const handleAskQuestion = useCallback(() => {
    addMessage({ text: slide.suggestedQuestion, sender: "user" });
    setTimeout(() => {
      addMessage({ text: slide.detailedAnswer, sender: "ai" });
      setChatOpen(true);
    }, 600);
  }, [slide, addMessage]);

  const handleChatSend = useCallback(() => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    addMessage({ text, sender: "user" });
    setTimeout(() => {
      const aiReply = "Хороший вопрос! Давай я объясню подробнее. В JetUP каждый элемент экосистемы работает как отдельный источник дохода — и всё это под твоим контролем.";
      addMessage({ text: aiReply, sender: "ai" });
    }, 800);
  }, [chatInput, addMessage]);

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
                  data-testid="input-pres-chat"
                />
                <button className="ph-chat-send" onClick={handleChatSend} data-testid="btn-pres-chat-send">
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
