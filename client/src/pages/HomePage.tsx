import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Users,
  FolderOpen,
  Send,
  Instagram,
  Globe,
  Video,
  MessageCircle,
  Calendar,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  const goToMaria = () => setLocation("/maria");
  const goToTrading = () => setLocation("/trading");
  const goToPartner = () => setLocation("/partner");
  const goToSchedule = () => setLocation("/schedule");
  const goToTutorials = () => setLocation("/tutorials");

  const directLinks = [
    {
      icon: FolderOpen,
      label: "Google Drive – Präsentationen",
      href: "https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: Send,
      label: "Telegram Kanal",
      href: "https://t.me/JetUpDach",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/jetup.official?igsh=MjZwdXJpd2JsYmw1&utm_source=qr",
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      icon: Globe,
      label: "Registrierung – IB Portal",
      href: "https://jetup.ibportal.io",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-6 space-y-5">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center pt-1 pb-1"
          >
            <img
              src="/jetup-logo.png"
              alt="JetUP"
              className="w-16 h-16 object-contain mb-2"
              data-testid="img-logo"
            />
            <h1 className="text-[18px] font-extrabold text-gray-900 tracking-tight">
              JetApp – JetUP Ökosystem
            </h1>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-purple mt-1">
              Struktur. Transparenz. Kontrolle.
            </p>
            <p className="text-[13px] text-gray-500 mt-2.5 leading-relaxed max-w-[320px] font-medium">
              Herzlich willkommen im JetApp Digital Hub – Trading & Partner-Einkommen mit Struktur und Transparenz.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <button
              onClick={goToMaria}
              className="w-full bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] flex items-center gap-3.5 active:scale-[0.98] transition-transform text-left"
              data-testid="cta-ask-maria"
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 flex items-center justify-center shadow-[0_4px_16px_rgba(124,58,237,0.3)]">
                  <span className="text-lg font-extrabold text-white">M</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-gray-900">Maria – Live-Beraterin</h3>
                  <div className="flex items-center gap-1 bg-green-50 rounded-full px-2 py-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-green-600">online</span>
                  </div>
                </div>
                <p className="text-[12px] text-gray-400 mt-0.5 font-medium leading-snug">
                  Bereit, deine Fragen in Echtzeit zu beantworten.
                </p>
                <div className="flex gap-2.5 mt-2">
                  <span className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold bg-gray-50 rounded-lg px-2.5 py-1">
                    <Video size={12} className="text-purple-500" /> Video
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold bg-gray-50 rounded-lg px-2.5 py-1">
                    <MessageCircle size={12} className="text-purple-500" /> Chat
                  </span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full jetup-gradient flex items-center justify-center flex-shrink-0 shadow-[0_2px_12px_rgba(124,58,237,0.3)]">
                <ArrowRight size={16} className="text-white" />
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <button
              onClick={goToTrading}
              className="w-full rounded-2xl p-5 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-[#7C3AED] to-[#A855F7] card-glow-strong"
              data-testid="card-trading-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <TrendingUp size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-white leading-tight">
                    Trading & Strategien
                  </h3>
                  <p className="text-[12px] text-white/75 mt-1 leading-snug font-medium">
                    Broker, Copy-Trading & Amplify — alles in einem Bereich.
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[11px] font-semibold text-white/60">Öffnen</span>
                  <ChevronRight size={18} className="text-white/80" />
                </div>
              </div>
            </button>

            <button
              onClick={goToPartner}
              className="w-full rounded-2xl p-5 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-emerald-600 to-teal-500 shadow-[0_4px_24px_rgba(16,185,129,0.2)]"
              data-testid="card-partner-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Users size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-white leading-tight">
                    Partnerprogramm & Einkommen
                  </h3>
                  <p className="text-[12px] text-white/75 mt-1 leading-snug font-medium">
                    Provisionen, Profit-Share, Rewards (Rolex, Immobilien, Reisen).
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[11px] font-semibold text-white/60">Öffnen</span>
                  <ChevronRight size={18} className="text-white/80" />
                </div>
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2.5"
          >
            <button
              onClick={goToSchedule}
              className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-schedule"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-bold text-gray-900 block">Webinare & Termine</span>
                <span className="text-[11px] text-gray-400 font-medium">Live-Calls & Events</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
            </button>

            <button
              onClick={goToTutorials}
              className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-tutorials"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={20} className="text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-bold text-gray-900 block">Tutorials & Guides</span>
                <span className="text-[11px] text-gray-400 font-medium">Videos & Anleitungen</span>
              </div>
              <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 px-1">
              Direkte Links
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

          <div className="text-center pt-2 pb-2">
            <span className="text-[10px] text-gray-300 font-semibold tracking-wider">@jetup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
