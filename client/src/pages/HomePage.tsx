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
  Megaphone,
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
      label: "Präsentationen",
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
        <div className="px-5 pt-3 pb-6 space-y-3">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <img
              src="/jetup-logo.png"
              alt="JetUP"
              className="w-12 h-12 object-contain mb-1"
              data-testid="img-logo"
            />
            <h1 className="text-[16px] font-extrabold text-gray-900 tracking-tight">
              JetApp – JetUP Ökosystem
            </h1>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gradient-purple mt-0.5">
              Struktur. Transparenz. Kontrolle.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <button
              onClick={goToMaria}
              className="w-full bg-white rounded-2xl px-4 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.06)] flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
              data-testid="cta-ask-maria"
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 flex items-center justify-center shadow-[0_4px_16px_rgba(124,58,237,0.3)]">
                  <span className="text-sm font-extrabold text-white">M</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-gray-900">Maria – Live-Beraterin</h3>
                  <div className="flex items-center gap-1 bg-green-50 rounded-full px-1.5 py-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-green-600">online</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold bg-gray-50 rounded-md px-2 py-0.5">
                    <Video size={10} className="text-purple-500" /> Video
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold bg-gray-50 rounded-md px-2 py-0.5">
                    <MessageCircle size={10} className="text-purple-500" /> Chat
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full jetup-gradient flex items-center justify-center flex-shrink-0 shadow-[0_2px_12px_rgba(124,58,237,0.3)]">
                <ArrowRight size={14} className="text-white" />
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2.5"
          >
            <button
              onClick={goToTrading}
              className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-[#7C3AED] to-[#A855F7] card-glow-strong"
              data-testid="card-trading-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-white leading-tight flex-1">
                  Trading & Strategien
                </h3>
                <ChevronRight size={18} className="text-white/80 flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={goToPartner}
              className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-emerald-600 to-teal-500 shadow-[0_4px_24px_rgba(16,185,129,0.2)]"
              data-testid="card-partner-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="text-[14px] font-bold text-white leading-tight flex-1">
                  Partnerprogramm & Einkommen
                </h3>
                <ChevronRight size={18} className="text-white/80 flex-shrink-0" />
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
              onClick={() => setLocation("/promo")}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="button-aktionen"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Megaphone size={18} className="text-purple-600" />
              </div>
              <span className="text-[13px] font-bold text-gray-900 flex-1 min-w-0">Promotions</span>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>

            <button
              onClick={goToSchedule}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-schedule"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-orange-600" />
              </div>
              <span className="text-[13px] font-bold text-gray-900 flex-1 min-w-0">Webinare & Termine</span>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>

            <button
              onClick={goToTutorials}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-tutorials"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} className="text-cyan-600" />
              </div>
              <span className="text-[13px] font-bold text-gray-900 flex-1 min-w-0">Tutorials & Guides</span>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
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

        </div>
      </div>
    </div>
  );
};

export default HomePage;
