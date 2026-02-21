import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Zap, Clock, Loader2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export interface PromoItem {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  banner: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  deadline?: string | null;
  gradient: string;
  badgeColor: string;
}

const PromoDetailPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const [promoItems, setPromoItems] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => setPromoItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          {t("promo.title")}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-purple-500" />
          </div>
        ) : (<div className="space-y-4 pt-2">
          {language === "ru" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(124,58,237,0.18)]"
              data-testid="video-turkey-promo"
            >
              <div className="relative">
                <video
                  ref={videoRef}
                  src="/videos/turkey-heroes-promo.mp4"
                  className="w-full aspect-video object-cover"
                  muted={isMuted}
                  loop
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {!isPlaying && (
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl active:scale-95 transition-all hover:scale-105"
                      data-testid="button-play-turkey"
                    >
                      <Play size={28} className="text-purple-600 ml-1" />
                    </button>
                  )}
                </div>
                {isPlaying && (
                  <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE PROMO
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {isPlaying && (
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
                      data-testid="button-pause-turkey"
                    >
                      <Pause size={16} className="text-white" />
                    </button>
                  )}
                  <button
                    onClick={toggleMute}
                    className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
                    data-testid="button-mute-turkey"
                  >
                    {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 text-white flex items-center gap-1">
                    <Zap size={8} />
                    PROMO VIDEO
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">20.02 — 20.04.2026</span>
                </div>
                <h3 className="text-[15px] font-extrabold text-gray-900 leading-tight">
                  🇹🇷 TURKEY CALLS THE HEROES
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                  Достигни объёма команды $150,000 и выиграй эксклюзивную поездку в Стамбул. 14–17 мая 2026.
                </p>
              </div>
            </motion.div>
          )}
          {promoItems.map((promo, idx) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
            >
              <img
                src={promo.banner}
                alt={promo.title}
                className="w-full h-auto object-cover"
                data-testid={`img-promo-${promo.id}`}
              />

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${promo.badgeColor} text-white flex items-center gap-1`}>
                    <Zap size={8} />
                    {promo.badge}
                  </span>
                </div>

                <h3 className="text-[16px] font-extrabold text-gray-900 leading-tight" data-testid={`text-promo-title-${promo.id}`}>
                  {promo.title}
                </h3>

                <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                  {promo.subtitle}
                </p>

                <div className="space-y-1.5">
                  {promo.highlights.map((h, i) => (
                    <p key={i} className="text-[12px] text-gray-600 font-medium flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      {h}
                    </p>
                  ))}
                </div>

                {promo.deadline && (
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2">
                    <Clock size={14} className="text-orange-500 flex-shrink-0" />
                    <p className="text-[11px] text-orange-700 font-semibold">
                      {promo.deadline}
                    </p>
                  </div>
                )}

                {promo.ctaLink ? (
                  <a
                    href={promo.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl jetup-gradient text-white text-[13px] font-bold active:scale-[0.97] transition-transform shadow-[0_2px_12px_rgba(124,58,237,0.3)]"
                    data-testid={`button-promo-cta-${promo.id}`}
                  >
                    <ExternalLink size={14} />
                    {promo.ctaText}
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-200 text-gray-400 text-[13px] font-bold cursor-not-allowed"
                    data-testid={`button-promo-cta-disabled-${promo.id}`}
                  >
                    {promo.ctaText}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {promoItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[14px] text-gray-400 font-medium">{t("promo.noPromos")}</p>
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
};

export default PromoDetailPage;
