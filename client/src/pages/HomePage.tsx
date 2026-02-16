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
} from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();

  const goToMaria = () => setLocation("/maria");
  const goToTrading = () => setLocation("/trading");
  const goToPartner = () => setLocation("/partner");

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
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-6 space-y-4">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center pt-1 pb-1"
          >
            <img
              src="/jetup-logo.png"
              alt="JetUP"
              className="w-14 h-14 object-contain mb-1.5"
              data-testid="img-logo"
            />
            <h1 className="text-[15px] font-bold text-gray-900">
              JetApp – JetUP Ökosystem
            </h1>
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-primary/50 mt-0.5">
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
              className="w-full bg-white rounded-2xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center gap-3.5 active:scale-[0.98] transition-transform text-left"
              data-testid="cta-ask-maria"
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">M</span>
                </div>
                <div className="absolute -left-0.5 bottom-0 flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-semibold text-gray-600">online</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-gray-900">Maria – Live-Beraterin</h3>
                <div className="flex gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Video size={12} /> Video
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <MessageCircle size={12} /> Chat
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                <ArrowRight size={18} className="text-white" />
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
              className="w-full rounded-2xl p-5 text-left active:scale-[0.98] transition-transform shadow-[0_2px_12px_rgba(124,58,237,0.15)] bg-gradient-to-br from-purple-600 to-indigo-600"
              data-testid="card-trading-hub"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-white leading-tight">
                    Trading mit TAG Markets & Copy-X
                  </h3>
                  <p className="text-[12px] text-white/70 mt-1 leading-snug">
                    Handel, Copy-Trading & Amplify in einem Bereich.
                  </p>
                </div>
                <ArrowRight size={20} className="text-white/60 mt-2 flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={goToPartner}
              className="w-full rounded-2xl p-5 text-left active:scale-[0.98] transition-transform shadow-[0_2px_12px_rgba(16,185,129,0.15)] bg-gradient-to-br from-emerald-600 to-teal-600"
              data-testid="card-partner-hub"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-white leading-tight">
                    Partnerprogramm & Einkommen
                  </h3>
                  <p className="text-[12px] text-white/70 mt-1 leading-snug">
                    Provisionen, Profit-Share, Rewards (Rolex, Immobilien, Reisen).
                  </p>
                </div>
                <ArrowRight size={20} className="text-white/60 mt-2 flex-shrink-0" />
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              Direkte Links
            </p>
            <div className="space-y-2">
              {directLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_6px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-transform"
                  data-testid={`direct-link-${i}`}
                >
                  <div className={`w-9 h-9 rounded-lg ${link.bg} flex items-center justify-center flex-shrink-0`}>
                    <link.icon size={18} className={link.color} />
                  </div>
                  <span className="text-[13px] font-medium text-gray-800 flex-1">
                    {link.label}
                  </span>
                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                </a>
              ))}
            </div>
          </motion.div>

          <div className="text-center pt-2 pb-2">
            <span className="text-[10px] text-gray-300 font-medium">@jetup</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
