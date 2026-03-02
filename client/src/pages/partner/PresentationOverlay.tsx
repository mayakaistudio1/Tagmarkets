import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Rocket,
} from "lucide-react";

interface PresentationOverlayProps {
  onBackToChat: () => void;
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
}

interface Checkpoint {
  afterSlide: number;
  question: string;
  chips: { label: string; icon: React.FC<{ size?: number }>; action: "goto"; target: number }[];
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
  },
  {
    id: 5,
    title: "Решение",
    text: "JetUP — это экосистема, которая объединяет финансовый продукт и партнёрскую модель в одной структуре.",
    image: "/images/presentation/jetup_brand.png",
    accent: "#8B5CF6",
    icon: Lightbulb,
    overlay: "linear-gradient(to bottom, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0.85) 100%)",
  },
  {
    id: 6,
    title: "Безопасность",
    text: "Средства находятся у лицензированного брокера. Контроль остаётся у клиента. Прозрачность операций.",
    image: "/images/presentation/safety.png",
    accent: "#22C55E",
    icon: Shield,
    overlay: "linear-gradient(to bottom, rgba(34,197,94,0.2) 0%, rgba(0,0,0,0.88) 100%)",
  },
  {
    id: 7,
    title: "Гибкость",
    text: "Нет жёсткой заморозки. Возможность вывода. Управляемость стратегии.",
    image: "/images/presentation/flexibility.png",
    accent: "#F59E0B",
    icon: Layers,
    overlay: "linear-gradient(to bottom, rgba(245,158,11,0.2) 0%, rgba(0,0,0,0.88) 100%)",
  },
  {
    id: 8,
    title: "Рентабельность",
    text: "Баланс доходности и риска. Стратегический подход. Системная модель вместо хайпа.",
    image: "/images/presentation/profitability.png",
    accent: "#10B981",
    icon: BarChart3,
    overlay: "linear-gradient(to bottom, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0.88) 100%)",
  },
  {
    id: 9,
    title: "Переход",
    text: "Даже лучший продукт не масштабируется без системы.",
    image: "/images/presentation/hero_realization.png",
    accent: "#F97316",
    icon: Target,
    overlay: "linear-gradient(to bottom, rgba(249,115,22,0.25) 0%, rgba(0,0,0,0.88) 100%)",
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
  },
  {
    id: 12,
    title: "Выбор",
    text: "Можно продолжать искать идеальный проект.\n\nМожно строить систему в рамках готовой экосистемы.",
    image: "/images/presentation/hero_discovery.png",
    accent: "#7C3AED",
    icon: Rocket,
    overlay: "linear-gradient(to bottom, rgba(124,58,237,0.3) 0%, rgba(0,0,0,0.85) 100%)",
  },
];

const checkpoints: Checkpoint[] = [
  {
    afterSlide: 1,
    question: "Что ты ищешь сейчас?",
    chips: [
      { label: "Пассивный доход", icon: BarChart3, action: "goto", target: 6 },
      { label: "Построение команды", icon: Users, action: "goto", target: 8 },
      { label: "Понять безопасность", icon: Shield, action: "goto", target: 6 },
    ],
  },
  {
    afterSlide: 4,
    question: "Что обычно ломается у людей?",
    chips: [
      { label: "Нет доверия", icon: Shield, action: "goto", target: 6 },
      { label: "Нет системы", icon: Target, action: "goto", target: 9 },
      { label: "Нет результата", icon: BarChart3, action: "goto", target: 8 },
    ],
  },
  {
    afterSlide: 11,
    question: "Какой следующий шаг тебе удобнее?",
    chips: [
      { label: "Показать маркетинг", icon: TrendingUp, action: "goto", target: 10 },
      { label: "Войти по ссылке", icon: Link, action: "goto", target: 12 },
      { label: "Записаться на звонок", icon: Video, action: "goto", target: 12 },
      { label: "Вернуться в чат", icon: MessageSquare, action: "goto", target: -1 },
    ],
  },
];

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({ onBackToChat }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showCheckpoint, setShowCheckpoint] = useState<Checkpoint | null>(null);

  const slide = slides[current];
  const isLast = current === slides.length - 1;
  const progress = ((current + 1) / slides.length) * 100;

  const goTo = useCallback((index: number, dir?: number) => {
    if (index < 0) {
      onBackToChat();
      return;
    }
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    setDirection(dir ?? (clamped > current ? 1 : -1));
    setCurrent(clamped);
    setShowCheckpoint(null);
  }, [current, onBackToChat]);

  const handleNext = useCallback(() => {
    const cp = checkpoints.find((c) => c.afterSlide === current + 1);
    if (cp) {
      setShowCheckpoint(cp);
      return;
    }
    if (current < slides.length - 1) {
      goTo(current + 1, 1);
    }
  }, [current, goTo]);

  const handlePrev = useCallback(() => {
    if (showCheckpoint) {
      setShowCheckpoint(null);
      return;
    }
    if (current > 0) goTo(current - 1, -1);
  }, [current, showCheckpoint, goTo]);

  const handleChip = useCallback((chip: Checkpoint["chips"][0]) => {
    goTo(chip.target === -1 ? -1 : chip.target - 1, 1);
  }, [goTo]);

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

      <div className="pres-top-row">
        <button className="pres-close-btn" onClick={onBackToChat} data-testid="btn-close-pres">
          <X size={18} />
        </button>
        <span className="pres-counter">{current + 1} / {slides.length}</span>
      </div>

      <div className="pres-stage">
        <AnimatePresence mode="wait" custom={direction}>
          {!showCheckpoint ? (
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

                {isLast && (
                  <div className="pres-final-btns">
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
            </motion.div>
          ) : (
            <motion.div
              key="checkpoint"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="pres-checkpoint"
            >
              <div className="pres-cp-glow" style={{ background: slide.accent }} />
              <h3 className="pres-cp-question">{showCheckpoint.question}</h3>
              <div className="pres-cp-chips">
                {showCheckpoint.chips.map((chip, i) => (
                  <button
                    key={i}
                    className="pres-cp-chip"
                    onClick={() => handleChip(chip)}
                    data-testid={`chip-cp-${i}`}
                  >
                    <chip.icon size={18} />
                    {chip.label}
                    <ArrowRight size={14} className="pres-cp-arrow" />
                  </button>
                ))}
              </div>
              <button className="pres-cp-skip" onClick={() => { setShowCheckpoint(null); goTo(current + 1, 1); }}>
                Пропустить
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isLast && !showCheckpoint && (
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
            className="pres-nav-btn pres-nav-next"
            onClick={handleNext}
            style={{ background: `${slide.accent}30`, borderColor: `${slide.accent}50` }}
            data-testid="btn-next-slide"
          >
            Далее
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {showCheckpoint && (
        <div className="pres-nav-row">
          <button className="pres-nav-btn" onClick={handlePrev} data-testid="btn-prev-cp">
            <ChevronLeft size={20} />
            Назад
          </button>
          <div />
        </div>
      )}
    </motion.div>
  );
};

export default PresentationOverlay;
