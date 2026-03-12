import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, Globe, Loader2, ChevronLeft,
  Send, Copy, Check, Share2, MessageCircle, Phone,
  Mail, Facebook, Instagram, Link2, Sparkles
} from "lucide-react";

interface Webinar {
  id: number;
  title: string;
  date: string;
  time: string;
  timezone: string;
  speaker: string;
  speakerPhoto: string | null;
  type: string;
  typeBadge: string;
  highlights: string[];
  language: string;
}

interface InviteResult {
  inviteCode: string;
  inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

type Screen = "list" | "detail" | "invite-type" | "personal" | "social";

export default function WebinarsScreen({ telegramId }: { telegramId: string }) {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/partner-app/webinars", {
      headers: { "x-telegram-id": telegramId },
    })
      .then((r) => r.json())
      .then((data) => {
        setWebinars(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [telegramId]);

  const createInvite = async () => {
    if (!selectedWebinar || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/partner-app/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-telegram-id": telegramId },
        body: JSON.stringify({ scheduleEventId: selectedWebinar.id }),
      });
      const data = await res.json();
      setInviteResult(data);
    } catch (err) {
      console.error("Failed to create invite:", err);
    }
    setCreating(false);
  };

  const getFullUrl = () => {
    const base = window.location.origin;
    return `${base}${inviteResult?.inviteUrl || ""}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareText = () => {
    if (!inviteResult) return "";
    return `🎯 Ich lade dich ein zum Webinar:\n\n📌 ${inviteResult.event.title}\n📅 ${inviteResult.event.date} um ${inviteResult.event.time}\n🎤 Speaker: ${inviteResult.event.speaker}\n\nKostenlose Anmeldung hier:\n${getFullUrl()}`;
  };

  const shareVia = (platform: string) => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getFullUrl());
    const tg = (window as any).Telegram?.WebApp;

    switch (platform) {
      case "telegram":
        if (tg?.openTelegramLink) {
          tg.openTelegramLink(`https://t.me/share/url?url=${url}&text=${text}`);
        } else {
          window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
        }
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${text}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(inviteResult?.event.title || "")}&body=${text}`, "_blank");
        break;
      case "instagram":
        navigator.clipboard.writeText(getShareText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const handleSelectWebinar = (w: Webinar) => {
    setSelectedWebinar(w);
    setInviteResult(null);
    setScreen("invite-type");
  };

  const handleInviteType = async (type: "personal" | "social") => {
    if (!inviteResult) {
      await createInvite();
    }
    setScreen(type);
  };

  const goBack = () => {
    if (screen === "personal" || screen === "social") setScreen("invite-type");
    else if (screen === "invite-type" || screen === "detail") setScreen("list");
    else setScreen("list");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (screen === "personal" || screen === "social") {
    if (creating || !inviteResult) {
      return (
        <div className="h-full flex flex-col items-center justify-center px-6">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-4" />
          <p className="text-sm text-gray-400">Erstelle persönlichen Link...</p>
        </div>
      );
    }

    return (
      <div className="px-4 pt-5 pb-24 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-xl bg-white/5 active:bg-white/10" data-testid="button-back">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-base font-bold text-white">
            {screen === "personal" ? "Persönliche Einladung" : "Social Share"}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/15 to-indigo-600/10 border border-purple-500/20 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Dein Einladungslink</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-black/30 border border-white/10">
            <Link2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <p className="text-xs text-gray-300 truncate flex-1 font-mono" data-testid="text-invite-url">
              {getFullUrl()}
            </p>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-purple-500/20 active:bg-purple-500/30 transition-colors"
              data-testid="button-copy-link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
            </button>
          </div>
        </motion.div>

        {screen === "personal" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-white">Direkt senden via</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "telegram", label: "Telegram", icon: Send, color: "from-blue-500 to-blue-600" },
                { id: "whatsapp", label: "WhatsApp", icon: Phone, color: "from-green-500 to-green-600" },
                { id: "email", label: "E-Mail", icon: Mail, color: "from-gray-500 to-gray-600" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => shareVia(ch.id)}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl bg-gradient-to-r ${ch.color} shadow-lg active:scale-[0.97] transition-transform`}
                  data-testid={`share-${ch.id}`}
                >
                  <ch.icon className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">{ch.label}</span>
                </button>
              ))}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 active:scale-[0.97] transition-transform"
                data-testid="share-copy"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
                <span className="text-sm font-semibold text-white">{copied ? "Kopiert!" : "Link kopieren"}</span>
              </button>
            </div>
          </motion.div>
        )}

        {screen === "social" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fertiger Text zum Teilen</p>
              <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed" data-testid="text-share-message">
                {getShareText()}
              </p>
            </div>

            <h3 className="text-sm font-semibold text-white">Teilen auf</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "telegram", label: "Telegram", icon: Send, color: "from-blue-500 to-blue-600" },
                { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "from-green-500 to-green-600" },
                { id: "facebook", label: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700" },
                { id: "instagram", label: "Instagram kopieren", icon: Instagram, color: "from-pink-500 to-purple-600" },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => shareVia(ch.id)}
                  className={`flex items-center gap-2.5 p-3.5 rounded-xl bg-gradient-to-r ${ch.color} shadow-lg active:scale-[0.97] transition-transform`}
                  data-testid={`social-${ch.id}`}
                >
                  <ch.icon className="w-4 h-4 text-white" />
                  <span className="text-xs font-semibold text-white">{ch.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.06] border border-white/10 active:scale-[0.98] transition-transform"
              data-testid="button-copy-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
              <span className="text-sm font-semibold text-white">{copied ? "Kopiert!" : "Text + Link kopieren"}</span>
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-3 rounded-xl bg-white/[0.03] border border-white/5"
        >
          <p className="text-[11px] text-gray-500 text-center">
            Jede Registrierung über diesen Link wird dir automatisch zugeordnet.
          </p>
        </motion.div>
      </div>
    );
  }

  if (screen === "invite-type") {
    return (
      <div className="px-4 pt-5 pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-2 rounded-xl bg-white/5 active:bg-white/10" data-testid="button-back">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-base font-bold text-white">Wie möchtest du einladen?</h2>
        </div>

        {selectedWebinar && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2"
          >
            <p className="text-sm font-bold text-white">{selectedWebinar.title}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedWebinar.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedWebinar.time}</span>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleInviteType("personal")}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-purple-600/20 to-indigo-600/10 border border-purple-500/20 text-left active:scale-[0.98] transition-transform"
            data-testid="button-personal-invite"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Persönliche Einladung</p>
                <p className="text-xs text-gray-400">Direkt an eine Person senden</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleInviteType("social")}
            className="w-full p-5 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/10 border border-blue-500/20 text-left active:scale-[0.98] transition-transform"
            data-testid="button-social-share"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Social Share</p>
                <p className="text-xs text-gray-400">Über soziale Medien teilen</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-24 space-y-4">
      <h2 className="text-lg font-bold text-white">Nächste Webinare</h2>

      {webinars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-sm text-gray-400">Keine Webinare geplant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webinars.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3 active:scale-[0.99] transition-transform"
              data-testid={`webinar-card-${w.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-semibold">
                      {w.typeBadge}
                    </span>
                    {w.language && (
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                        <Globe className="w-2.5 h-2.5" /> {w.language.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">{w.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>{w.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>{w.time} {w.timezone}</span>
                </div>
              </div>

              {w.speaker && (
                <div className="flex items-center gap-2">
                  {w.speakerPhoto ? (
                    <img src={w.speakerPhoto} alt={w.speaker} className="w-6 h-6 rounded-full object-cover border border-purple-500/30" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-purple-400" />
                    </div>
                  )}
                  <span className="text-xs text-gray-300">{w.speaker}</span>
                </div>
              )}

              <button
                onClick={() => handleSelectWebinar(w)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-bold text-white shadow-md shadow-purple-500/20 active:scale-[0.98] transition-transform"
                data-testid={`invite-webinar-${w.id}`}
              >
                Einladen
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
