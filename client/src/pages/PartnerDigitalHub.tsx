import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Users,
  FolderOpen,
  Send,
  Instagram,
  Video,
  MessageCircle,
  Calendar,
  GraduationCap,
  ChevronRight,
  Megaphone,
  Phone,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const PARTNER = {
  name: "Dennis Schymanietz",
  role: "Founder JetUP",
  photo: "/dennis-photo.png",
  telegram: "https://t.me/dennis_jetup",
  whatsapp: "https://wa.me/4917612345678",
  phone: "tel:+4917612345678",
};

const PartnerDigitalHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [showAvatarOverlay, setShowAvatarOverlay] = useState(false);

  const greeting = {
    de: "Willkommen in meinem digitalen Hub. Hier findest du alles rund um das JetUP-Ökosystem — Strategien, Tools und persönliche Unterstützung.",
    ru: "Добро пожаловать в мой цифровой хаб. Здесь вы найдёте всё об экосистеме JetUP — стратегии, инструменты и персональную поддержку.",
    en: "Welcome to my digital hub. Here you'll find everything about the JetUP ecosystem — strategies, tools, and personal support.",
  }[language];

  const avatarCta = {
    de: "Videoanruf mit Dennis starten",
    ru: "Начать видеозвонок с Dennis",
    en: "Start video call with Dennis",
  }[language];

  const digitalAssistant = {
    de: "Digitaler Assistent",
    ru: "Цифровой ассистент",
    en: "Digital Assistant",
  }[language];

  const contactLabels = {
    de: { tg: "Telegram", wa: "WhatsApp", call: "Anrufen" },
    ru: { tg: "Telegram", wa: "WhatsApp", call: "Позвонить" },
    en: { tg: "Telegram", wa: "WhatsApp", call: "Call" },
  }[language];

  const directLinks = [
    {
      icon: FolderOpen,
      label: t("home.presentations"),
      href: "https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: Send,
      label: t("home.telegram"),
      href: "https://t.me/JetUpDach",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Instagram,
      label: t("home.instagram"),
      href: "https://www.instagram.com/jetup.official",
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="px-5 pt-4 pb-6 space-y-4 min-h-full">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative mb-3">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-[0_4px_32px_rgba(124,58,237,0.25)] ring-3 ring-purple-200">
                <img
                  src={PARTNER.photo}
                  alt={PARTNER.name}
                  className="w-full h-full object-cover object-top"
                  data-testid="img-partner-photo"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-md">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-green-600">Online</span>
              </div>
            </div>

            <h1 className="text-[20px] font-extrabold text-gray-900 leading-tight" data-testid="text-partner-name">
              {PARTNER.name}
            </h1>
            <p className="text-[13px] font-semibold text-purple-600 mt-0.5" data-testid="text-partner-role">
              {PARTNER.role}
            </p>

            <div className="flex items-center gap-2 mt-3">
              {(["de", "ru", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  data-testid={`btn-lang-${lang}`}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase transition-all ${
                    language === lang
                      ? "jetup-gradient text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex justify-center gap-3"
          >
            <a
              href={PARTNER.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              data-testid="btn-contact-telegram"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm">
                <Send size={20} className="text-blue-500" />
              </div>
              <span className="text-[10px] font-semibold text-gray-500">{contactLabels.tg}</span>
            </a>
            <a
              href={PARTNER.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              data-testid="btn-contact-whatsapp"
            >
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shadow-sm">
                <MessageCircle size={20} className="text-green-500" />
              </div>
              <span className="text-[10px] font-semibold text-gray-500">{contactLabels.wa}</span>
            </a>
            <a
              href={PARTNER.phone}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              data-testid="btn-contact-phone"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shadow-sm">
                <Phone size={20} className="text-purple-500" />
              </div>
              <span className="text-[10px] font-semibold text-gray-500">{contactLabels.call}</span>
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[12px] text-gray-500 text-center leading-relaxed px-2"
            data-testid="text-partner-greeting"
          >
            {greeting}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => setShowAvatarOverlay(true)}
              className="w-full rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
              data-testid="btn-start-avatar"
            >
              <div className="relative bg-gradient-to-br from-[#1a0a2e] via-[#2d1b4e] to-[#1a0a2e] px-5 py-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.3),transparent_70%)]" />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-bold text-green-300">AI</span>
                </div>
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-purple-400/30 shadow-[0_0_24px_rgba(124,58,237,0.4)] flex-shrink-0">
                    <img
                      src={PARTNER.photo}
                      alt={PARTNER.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider mb-1">
                      {digitalAssistant}
                    </p>
                    <p className="text-[14px] font-bold text-white leading-snug">
                      {avatarCta}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-md px-2 py-0.5">
                        <Video size={10} className="text-purple-300" />
                        <span className="text-[10px] text-purple-200 font-semibold">Live</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-md px-2 py-0.5">
                        <MessageCircle size={10} className="text-purple-300" />
                        <span className="text-[10px] text-purple-200 font-semibold">Voice</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-500/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-1 ring-purple-400/30">
                    <Video size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2.5"
          >
            <button
              onClick={() => setLocation("/trading")}
              className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-[#7C3AED] to-[#A855F7] card-glow-strong"
              data-testid="card-trading-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-white leading-tight flex-1">
                  {t("home.trading")}
                </h3>
                <ChevronRight size={18} className="text-white/80 flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={() => setLocation("/partner")}
              className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-emerald-600 to-teal-500 shadow-[0_4px_24px_rgba(16,185,129,0.2)]"
              data-testid="card-partner-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-white leading-tight flex-1">
                  {t("home.partner")}
                </h3>
                <ChevronRight size={18} className="text-white/80 flex-shrink-0" />
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-2.5"
          >
            <button
              onClick={() => setLocation("/promo")}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="button-aktionen"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Megaphone size={18} className="text-purple-600" />
              </div>
              <span className="text-[13px] font-bold text-gray-900 flex-1 min-w-0">{t("home.promo")}</span>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>

            <button
              onClick={() => setLocation("/schedule")}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-schedule"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-orange-600" />
              </div>
              <span className="text-[13px] font-bold text-gray-900 flex-1 min-w-0">{t("home.schedule")}</span>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>

            <button
              onClick={() => setLocation("/tutorials")}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-tutorials"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} className="text-cyan-600" />
              </div>
              <span className="text-[13px] font-bold text-gray-900 flex-1 min-w-0">{t("home.tutorials")}</span>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
              {t("home.directLinks")}
            </p>
            <div className="space-y-2">
              {directLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
                  data-testid={`direct-link-${i}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center flex-shrink-0`}>
                    <link.icon size={19} className={link.color} />
                  </div>
                  <span className="text-[13px] font-semibold text-gray-800 flex-1">
                    {link.label}
                  </span>
                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-center gap-2 pt-2 pb-4"
          >
            <img
              src="/jetup-logo.png"
              alt="JetUP"
              className="w-6 h-6 object-contain opacity-40"
            />
            <span className="text-[10px] text-gray-300 font-semibold">Powered by JetUP</span>
          </motion.div>

        </div>
      </div>

      {showAvatarOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
        >
          <button
            onClick={() => setShowAvatarOverlay(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95"
            data-testid="btn-close-avatar"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-purple-500/30 shadow-[0_0_60px_rgba(124,58,237,0.4)] mb-6">
            <img
              src={PARTNER.photo}
              alt={PARTNER.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <p className="text-white text-[16px] font-bold mb-2">{PARTNER.name}</p>
          <p className="text-purple-300 text-[12px] font-semibold mb-6">{digitalAssistant}</p>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-[12px] text-white/70 font-medium">
              {{ de: "LiveAvatar wird hier integriert", ru: "LiveAvatar будет интегрирован здесь", en: "LiveAvatar will be integrated here" }[language]}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PartnerDigitalHub;
