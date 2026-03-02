import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Video, Link, MessageSquare } from "lucide-react";

interface PresentationOverlayProps {
  onBackToChat: () => void;
}

const slides = [
  {
    id: 1,
    title: "Мечта",
    text: "Представь, что у тебя есть система, которая работает на тебя 24/7. Без привязки к месту, без лимитов по доходу.",
    accent: "#7C3AED",
  },
  {
    id: 2,
    title: "JetUP Инфраструктура",
    text: "JetUP — это не просто платформа. Это экосистема из брокера, биржи и платёжных карт. Три источника дохода в одной структуре.",
    accent: "#3B82F6",
  },
  {
    id: 3,
    title: "Безопасность",
    text: "Твой капитал остаётся на твоём брокерском счёте. Никаких заморозок. Полный контроль над выводом средств.",
    accent: "#22C55E",
  },
  {
    id: 4,
    title: "Партнёрская программа",
    text: "Комиссия $10.50 за лот. До 10 уровней глубины. До 60% от торговых сборов биржи. Пулы и Infinity бонусы.",
    accent: "#F59E0B",
  },
  {
    id: 5,
    title: "AI-Дупликация",
    text: "Каждый партнёр получает свой AI-хаб — цифрового двойника, который работает за тебя. Автоматизация рекрутинга.",
    accent: "#E88FEC",
  },
];

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({ onBackToChat }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const isLast = current === slides.length - 1;

  const go = (dir: number) => {
    const next = current + dir;
    if (next < 0 || next >= slides.length) return;
    setDirection(dir);
    setCurrent(next);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <motion.div
      className="ph-pres-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="ph-pres-header">
        <button className="ph-pres-close" onClick={onBackToChat} data-testid="btn-close-pres">
          <X size={20} />
        </button>
        <div className="ph-pres-dots">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`ph-pres-dot ${i === current ? "ph-pres-dot-active" : ""}`}
              style={i === current ? { background: slides[current].accent } : undefined}
            />
          ))}
        </div>
        <div style={{ width: 32 }} />
      </div>

      <div className="ph-pres-body">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="ph-pres-slide"
          >
            <div
              className="ph-pres-accent-bar"
              style={{ background: slides[current].accent }}
            />
            <span className="ph-pres-slide-num">{`0${current + 1}`}</span>
            <h2 className="ph-pres-slide-title">{slides[current].title}</h2>
            <p className="ph-pres-slide-text">{slides[current].text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="ph-pres-nav">
        {!isLast ? (
          <>
            <button
              className="ph-pres-nav-btn"
              onClick={() => go(-1)}
              disabled={current === 0}
              data-testid="btn-prev-slide"
            >
              <ChevronLeft size={20} />
              Назад
            </button>
            <button
              className="ph-pres-nav-btn ph-pres-nav-next"
              onClick={() => go(1)}
              data-testid="btn-next-slide"
            >
              Далее
              <ChevronRight size={20} />
            </button>
          </>
        ) : (
          <div className="ph-pres-final">
            <button className="ph-btn-primary w-full" data-testid="btn-schedule-call">
              <Video size={18} />
              Записаться на созвон
            </button>
            <button className="ph-btn-glass w-full" data-testid="btn-start-link">
              <Link size={18} />
              Начать по моей ссылке
            </button>
            <button
              className="ph-pres-back-btn"
              onClick={onBackToChat}
              data-testid="btn-back-to-chat"
            >
              <MessageSquare size={16} />
              Вернуться в чат
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PresentationOverlay;
