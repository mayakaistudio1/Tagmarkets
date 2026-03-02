import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  MessageSquare,
  ChevronDown,
  X,
  Send,
  FileText,
  Calendar,
  GraduationCap,
  Instagram,
  Phone,
  LayoutGrid,
  ShieldCheck,
  Zap,
  Users
} from "lucide-react";
import { useLocation } from "wouter";

const PARTNER = {
  name: "Dennis",
  role: "JetUp Partner",
  tagline: "Задай моему AI любой вопрос или пообщайся со мной вживую.",
  photo: "/dennis-photo.png",
};

const PartnerDigitalHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const [chatInput, setChatInput] = useState("");

  const quickActions = [
    "Как работает JetUp?",
    "Это безопасно?",
    "Можно ли заработать?",
    "С чего начать?",
  ];

  const valueCards = [
    {
      title: "Система и структура",
      desc: "Пошаговый алгоритм роста и понятная архитектура бизнеса.",
      icon: LayoutGrid,
      color: "text-blue-400"
    },
    {
      title: "Масштабирование и команда",
      desc: "Инструменты для быстрого кратного роста вашей структуры.",
      icon: Users,
      color: "text-purple-400"
    },
    {
      title: "Контроль и безопасность",
      desc: "Ваши средства всегда под вашим полным контролем.",
      icon: ShieldCheck,
      color: "text-emerald-400"
    },
    {
      title: "Партнёрские возможности",
      desc: "Эксклюзивные условия для активных лидеров экосистемы.",
      icon: Zap,
      color: "text-amber-400"
    }
  ];

  return (
    <div className="pdh-v3-root no-scrollbar">
      {/* ЭКРАН 1: HERO */}
      <section className="pdh-v3-hero">
        <div className="pdh-v3-hero-bg">
          <img src={PARTNER.photo} alt={PARTNER.name} className="pdh-v3-hero-img" />
          <div className="pdh-v3-hero-overlay" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pdh-v3-hero-content"
        >
          <h1 className="pdh-v3-hero-name">{PARTNER.name}</h1>
          <p className="pdh-v3-hero-role">{PARTNER.role}</p>
          <p className="pdh-v3-hero-tagline">{PARTNER.tagline}</p>
          
          <div className="pdh-v3-hero-btns">
            <button className="pdh-v3-btn-primary">
              <Video size={18} />
              Пообщаться вживую
            </button>
            <button className="pdh-v3-btn-glass">
              <MessageSquare size={18} />
              Написать AI-Денису
            </button>
          </div>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="pdh-v3-scroll-indicator"
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* ЭКРАН 2: ЧАТ */}
      <section className="pdh-v3-chat-section">
        <div className="pdh-v3-section-container">
          <div className="pdh-v3-chat-header">
            <div className="pdh-v3-chat-status">
              <span className="pdh-v3-status-dot" />
              AI-Денис онлайн
            </div>
          </div>
          
          <div className="pdh-v3-chat-quick-actions">
            {quickActions.map((action, i) => (
              <button key={i} className="pdh-v3-quick-btn">{action}</button>
            ))}
          </div>

          <div className="pdh-v3-chat-window">
            <div className="pdh-v3-message-ai">
              Привет! Я — AI-копия Дениса. С чего бы ты хотел начать наше знакомство с JetUp?
            </div>
          </div>

          <div className="pdh-v3-chat-input-wrap">
            <input 
              type="text" 
              placeholder="Спроси меня о чем угодно..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="pdh-v3-chat-input"
            />
            <button className="pdh-v3-chat-send">
              <Send size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ЭКРАН 3: ПОЧЕМУ Я */}
      <section className="pdh-v3-values-section">
        <div className="pdh-v3-section-container">
          <h2 className="pdh-v3-section-title">Почему работают со мной</h2>
          <div className="pdh-v3-values-grid">
            {valueCards.map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="pdh-v3-value-card"
              >
                <div className={`pdh-v3-card-icon ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <h3 className="pdh-v3-card-title">{card.title}</h3>
                <p className="pdh-v3-card-desc">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ЭКРАН 4: ДЕЙСТВИЕ */}
      <section className="pdh-v3-cta-section">
        <div className="pdh-v3-section-container">
          <h2 className="pdh-v3-section-title">Готов начать?</h2>
          <div className="pdh-v3-cta-btns">
            <button className="pdh-v3-btn-primary w-full">Записаться на созвон</button>
            <button className="pdh-v3-btn-glass w-full">Начать по моей ссылке</button>
          </div>
          
          <div className="pdh-v3-footer">
            <p>© {new Date().getFullYear()} Dennis · JetUp Partner</p>
            <span className="opacity-30">Powered by JetUP AI</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerDigitalHub;
