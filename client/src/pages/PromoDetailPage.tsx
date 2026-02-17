import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, ExternalLink, Zap, Clock } from "lucide-react";
import { useLocation } from "wouter";

export interface PromoItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  banner: string;
  description: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  deadline?: string;
  gradient: string;
  badgeColor: string;
}

export const promoItems: PromoItem[] = [
  {
    id: "24x-boost",
    badge: "SPEZIALAKTION · bis 18. Februar",
    title: "AKTIVIERE 24X TRADING-BOOST",
    subtitle: "Normalerweise 12X Multiplikator, jetzt 24X. 2x mehr Kapital & Gewinn aus denselben Trades!",
    banner: "/promo-24x-boost.png",
    description: "Nutze den verstärkten 24X-Multiplikator, um dein Kapital und dein Gewinnpotenzial schneller zu steigern. Nur während der zeitlich begrenzten Aktion verfügbar.",
    highlights: [
      "24X statt 12X Multiplikator auf deine Trades",
      "Doppeltes Kapital & Gewinnpotenzial",
      "Gleiche Strategie, doppelter Hebel",
      "Zeitlich begrenzt — nur bis 18. Februar",
    ],
    ctaText: "Jetzt aktivieren",
    ctaLink: "https://jetup.ibportal.io",
    deadline: "Nur bis 18. Februar verfügbar. Danach wieder Standard-12X.",
    gradient: "from-[#7C3AED] to-[#A855F7]",
    badgeColor: "bg-orange-500",
  },
];

const PromoDetailPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const getPromoId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || promoItems[0]?.id;
  };

  const promo = promoItems.find((p) => p.id === getPromoId()) || promoItems[0];

  if (!promo) return null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-promo"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          Aktion
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)]">
            <img
              src={promo.banner}
              alt={promo.title}
              className="w-full h-auto object-cover"
              data-testid="img-promo-banner"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${promo.badgeColor} text-white flex items-center gap-1`}>
              <Zap size={10} />
              {promo.badge}
            </span>
          </div>

          <h2 className="text-[20px] font-extrabold text-gray-900 leading-tight" data-testid="text-promo-title">
            {promo.title}
          </h2>

          <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
            {promo.subtitle}
          </p>

          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            {promo.description}
          </p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Was du bekommst:</p>
            {promo.highlights.map((h, i) => (
              <p key={i} className="text-[13px] text-gray-700 font-medium leading-snug flex items-start gap-2">
                <span className="text-purple-500 mt-0.5 flex-shrink-0">&#10003;</span>
                {h}
              </p>
            ))}
          </div>

          {promo.deadline && (
            <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-3">
              <Clock size={16} className="text-orange-500 flex-shrink-0" />
              <p className="text-[12px] text-orange-700 font-semibold">
                {promo.deadline}
              </p>
            </div>
          )}

          <a
            href={promo.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl jetup-gradient-glow text-white text-[14px] font-bold active:scale-[0.97] transition-transform"
            data-testid="button-promo-cta"
          >
            <ExternalLink size={16} />
            {promo.ctaText}
          </a>

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub-promo"
            >
              <ArrowLeft size={16} />
              Zurück zum Hub
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria-promo"
            >
              <MessageCircle size={16} />
              Frag Maria
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PromoDetailPage;
