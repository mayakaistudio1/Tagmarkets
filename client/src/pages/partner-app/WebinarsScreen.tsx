import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, User, Globe, Loader2, ChevronLeft,
  Send, Copy, Check, Share2, MessageCircle, Phone,
  Mail, Facebook, Instagram, Link2
} from "lucide-react";

interface Webinar {
  id: number; title: string; date: string; time: string; timezone: string;
  speaker: string; speakerPhoto: string | null; type: string; typeBadge: string;
  highlights: string[]; language: string;
}

interface InviteResult {
  inviteCode: string; inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

type Screen = "list" | "invite-type" | "personal" | "social";

export default function WebinarsScreen({ telegramId }: { telegramId: string }) {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/partner-app/webinars", { headers: { "x-telegram-id": telegramId } })
      .then((r) => r.json())
      .then((data) => { setWebinars(data); setLoading(false); })
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
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  const getFullUrl = () => `${window.location.origin}${inviteResult?.inviteUrl || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareText = () => {
    if (!inviteResult) return "";
    return `🎯 Einladung zum Webinar:\n\n📌 ${inviteResult.event.title}\n📅 ${inviteResult.event.date} um ${inviteResult.event.time}\n🎤 ${inviteResult.event.speaker}\n\nAnmeldung: ${getFullUrl()}`;
  };

  const shareVia = (platform: string) => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getFullUrl());
    const tg = (window as any).Telegram?.WebApp;
    switch (platform) {
      case "telegram":
        if (tg?.openTelegramLink) tg.openTelegramLink(`https://t.me/share/url?url=${url}&text=${text}`);
        else window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
        break;
      case "whatsapp": window.open(`https://wa.me/?text=${text}`, "_blank"); break;
      case "facebook": window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank"); break;
      case "email": window.open(`mailto:?subject=${encodeURIComponent(inviteResult?.event.title || "")}&body=${text}`, "_blank"); break;
      case "instagram": navigator.clipboard.writeText(getShareText()); setCopied(true); setTimeout(() => setCopied(false), 2000); break;
    }
  };

  const handleSelectWebinar = (w: Webinar) => {
    setSelectedWebinar(w);
    setInviteResult(null);
    setScreen("invite-type");
  };

  const handleInviteType = async (type: "personal" | "social") => {
    if (!inviteResult) await createInvite();
    setScreen(type);
  };

  const goBack = () => {
    if (screen === "personal" || screen === "social") setScreen("invite-type");
    else setScreen("list");
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  }

  if ((screen === "personal" || screen === "social") && (creating || !inviteResult)) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-gray-400">Creating invite link...</p>
      </div>
    );
  }

  if (screen === "personal" || screen === "social") {
    const shareChannels = screen === "personal"
      ? [
          { id: "telegram", label: "Telegram", icon: Send, bg: "bg-blue-500" },
          { id: "whatsapp", label: "WhatsApp", icon: Phone, bg: "bg-green-500" },
          { id: "email", label: "E-Mail", icon: Mail, bg: "bg-gray-600" },
        ]
      : [
          { id: "telegram", label: "Telegram", icon: Send, bg: "bg-blue-500" },
          { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, bg: "bg-green-500" },
          { id: "facebook", label: "Facebook", icon: Facebook, bg: "bg-blue-600" },
          { id: "instagram", label: "Instagram", icon: Instagram, bg: "bg-gradient-to-r from-pink-500 to-purple-500" },
        ];

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {screen === "personal" ? "Personal Invite" : "Social Share"}
        </h2>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Your invite link</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1 font-mono" data-testid="text-invite-url">{getFullUrl()}</p>
            <button onClick={handleCopy} className="p-1.5 rounded-lg bg-white active:bg-gray-100" data-testid="button-copy-link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>

        {screen === "social" && (
          <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Share text</p>
            <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed" data-testid="text-share-message">{getShareText()}</p>
          </div>
        )}

        <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Send via</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {shareChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => shareVia(ch.id)}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl ${ch.bg} text-white active:opacity-90 transition-opacity`}
              data-testid={`share-${ch.id}`}
            >
              <ch.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{ch.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
          data-testid="button-copy-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-700">{copied ? "Copied!" : "Copy link"}</span>
        </button>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          All registrations via this link are automatically attributed to you.
        </p>
      </div>
    );
  }

  if (screen === "invite-type") {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {selectedWebinar && (
          <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-sm font-semibold text-gray-900 mb-1">{selectedWebinar.title}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedWebinar.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedWebinar.time}</span>
            </div>
          </div>
        )}

        <h2 className="text-base font-semibold text-gray-900 mb-4">How would you like to invite?</h2>

        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleInviteType("personal")}
            className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            data-testid="button-personal-invite"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Personal Invite</p>
                <p className="text-xs text-gray-400">Send directly to a person</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => handleInviteType("social")}
            className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            data-testid="button-social-share"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Social Share</p>
                <p className="text-xs text-gray-400">Share on social media</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-28">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Upcoming Meetings</h2>

      {webinars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No meetings scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webinars.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`webinar-card-${w.id}`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">
                  {w.typeBadge}
                </span>
                {w.language && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <Globe className="w-2.5 h-2.5" /> {w.language.toUpperCase()}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">{w.title}</h3>

              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" /> {w.date}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> {w.time}
                </span>
              </div>

              {w.speaker && (
                <div className="flex items-center gap-2 mb-4">
                  {w.speakerPhoto ? (
                    <img src={w.speakerPhoto} alt={w.speaker} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <span className="text-xs text-gray-500">{w.speaker}</span>
                </div>
              )}

              <button
                onClick={() => handleSelectWebinar(w)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors"
                data-testid={`invite-webinar-${w.id}`}
              >
                Invite
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
