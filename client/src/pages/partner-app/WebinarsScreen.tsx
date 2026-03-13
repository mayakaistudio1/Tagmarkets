import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, User, Globe, Loader2, ChevronLeft, ChevronRight,
  Send, Copy, Check, Share2, MessageCircle, Phone,
  Mail, Facebook, Instagram, Link2, Users, UserCheck, FileText, Sparkles
} from "lucide-react";

interface Webinar {
  id: number; title: string; date: string; time: string; timezone: string;
  speaker: string; speakerPhoto: string | null; type: string; typeBadge: string;
  highlights: string[]; language: string;
  invitesSent: number; registeredCount: number;
}

interface InviteResult {
  inviteCode: string; inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

interface EventDetail {
  id: number; title: string; eventDate: string; eventTime: string;
  registeredCount: number; attendedCount: number; conversionRate: number;
  inviteCode: string; guestCount: number; clickedCount: number;
}

interface EventReport {
  event: { id: number; title: string; eventDate: string; eventTime: string; inviteCode: string };
  guests: Array<{
    id: number; name: string; email: string; phone: string | null;
    registeredAt: string; clickedZoom: boolean; attended: boolean;
    durationMinutes: number; questionsAsked: number; questionTexts: string[];
  }>;
  funnel: { invited: number; registered: number; clickedZoom: number; attended: number };
}

const MESSAGE_TEMPLATES = [
  {
    id: "professional",
    label: "Professional",
    icon: "💼",
    generate: (event: { title: string; date: string; time: string; speaker: string }, url: string) =>
      `Ich möchte Sie herzlich zu unserem exklusiven Webinar einladen:\n\n📌 ${event.title}\n📅 ${event.date} um ${event.time}\n🎤 Speaker: ${event.speaker}\n\nMelden Sie sich jetzt an:\n${url}`,
  },
  {
    id: "friendly",
    label: "Friendly",
    icon: "😊",
    generate: (event: { title: string; date: string; time: string; speaker: string }, url: string) =>
      `Hey! Ich habe ein spannendes Webinar für dich:\n\n🎯 ${event.title}\n📅 ${event.date}, ${event.time}\n🎤 Mit ${event.speaker}\n\nSchau mal rein, es lohnt sich! 👇\n${url}`,
  },
  {
    id: "short",
    label: "Short & Direct",
    icon: "⚡",
    generate: (event: { title: string; date: string; time: string; speaker: string }, url: string) =>
      `${event.title} — ${event.date}, ${event.time}.\nJetzt anmelden: ${url}`,
  },
];

interface PersonalInviteResult {
  inviteCode: string;
  inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

type Screen = "list" | "detail" | "invite-type" | "template-select" | "share" | "personal-form" | "personal-share";

export default function WebinarsScreen({ telegramId }: { telegramId: string }) {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(MESSAGE_TEMPLATES[0]);
  const [shareMode, setShareMode] = useState<"personal" | "social">("personal");
  const [eventDetails, setEventDetails] = useState<EventDetail[]>([]);
  const [eventReport, setEventReport] = useState<EventReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [personalInviteResult, setPersonalInviteResult] = useState<PersonalInviteResult | null>(null);
  const [personalCreating, setPersonalCreating] = useState(false);
  const [prospectForm, setProspectForm] = useState({ name: "", type: "Neutral", note: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/partner-app/webinars", { headers: { "x-telegram-id": telegramId } }).then((r) => r.json()),
      fetch("/api/partner-app/events", { headers: { "x-telegram-id": telegramId } }).then((r) => r.json()),
    ])
      .then(([webinarData, eventsData]) => {
        setWebinars(webinarData);
        setEventDetails(eventsData);
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
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  const loadEventReport = async (eventId: number) => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/partner-app/events/${eventId}/report`, { headers: { "x-telegram-id": telegramId } });
      setEventReport(await res.json());
    } catch (err) { console.error(err); }
    setReportLoading(false);
  };

  const createPersonalInvite = async () => {
    if (!selectedWebinar || personalCreating) return;
    setPersonalCreating(true);
    try {
      const res = await fetch("/api/partner-app/create-personal-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-telegram-id": telegramId },
        body: JSON.stringify({
          scheduleEventId: selectedWebinar.id,
          prospectName: prospectForm.name,
          prospectType: prospectForm.type,
          prospectNote: prospectForm.note || undefined,
        }),
      });
      const data = await res.json();
      setPersonalInviteResult(data);
      setScreen("personal-share");
    } catch (err) { console.error(err); }
    setPersonalCreating(false);
  };

  const getPersonalInviteFullUrl = () => `${window.location.origin}${personalInviteResult?.inviteUrl || ""}`;

  const getFullUrl = () => `${window.location.origin}${inviteResult?.inviteUrl || ""}`;

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || getFullUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareText = () => {
    if (!inviteResult) return "";
    return selectedTemplate.generate(inviteResult.event, getFullUrl());
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
      case "instagram": handleCopy(getShareText()); break;
    }
  };

  const handleSelectWebinar = (w: Webinar) => {
    setSelectedWebinar(w);
    setInviteResult(null);
    setEventReport(null);
    setScreen("detail");
  };

  const handleStartInvite = () => {
    setScreen("invite-type");
  };

  const handleInviteType = (type: "personal" | "social") => {
    setShareMode(type);
    setScreen("template-select");
  };

  const handleTemplateSelected = async (template: typeof MESSAGE_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    if (!inviteResult) await createInvite();
    setScreen("share");
  };

  const goBack = () => {
    switch (screen) {
      case "share": setScreen("template-select"); break;
      case "template-select": setScreen("invite-type"); break;
      case "invite-type": setScreen("detail"); break;
      case "personal-share": setScreen("personal-form"); break;
      case "personal-form": setScreen("detail"); break;
      case "detail": setScreen("list"); setEventReport(null); break;
      default: setScreen("list"); break;
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  }

  if (screen === "share" && (creating || !inviteResult)) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-gray-400">Creating invite link...</p>
      </div>
    );
  }

  if (screen === "share" && inviteResult) {
    const shareChannels = shareMode === "personal"
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
          {shareMode === "personal" ? "Personal Invite" : "Social Share"}
        </h2>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Your invite link</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1 font-mono" data-testid="text-invite-url">{getFullUrl()}</p>
            <button onClick={() => handleCopy()} className="p-1.5 rounded-lg bg-white active:bg-gray-100" data-testid="button-copy-link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Message preview</p>
            <span className="text-[10px] text-blue-600 font-medium">{selectedTemplate.icon} {selectedTemplate.label}</span>
          </div>
          <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed" data-testid="text-share-message">{getShareText()}</p>
        </div>

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
          onClick={() => handleCopy(getShareText())}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
          data-testid="button-copy-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-700">{copied ? "Copied!" : "Copy message + link"}</span>
        </button>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          All registrations via this link are automatically attributed to you.
        </p>
      </div>
    );
  }

  if (screen === "template-select") {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-base font-semibold text-gray-900 mb-1">Choose message style</h2>
        <p className="text-xs text-gray-400 mb-5">Select how your invitation will look</p>

        <div className="space-y-3">
          {MESSAGE_TEMPLATES.map((tpl, i) => {
            const previewText = selectedWebinar
              ? tpl.generate(
                  { title: selectedWebinar.title, date: selectedWebinar.date, time: selectedWebinar.time, speaker: selectedWebinar.speaker },
                  "https://..."
                )
              : "";
            return (
              <motion.button
                key={tpl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleTemplateSelected(tpl)}
                className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                data-testid={`template-${tpl.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="text-sm font-semibold text-gray-900">{tpl.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-[11px] text-gray-400 whitespace-pre-line leading-relaxed line-clamp-3">{previewText}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === "personal-share" && personalInviteResult) {
    const personalShareChannels = [
      { id: "telegram", label: "Telegram", icon: Send, bg: "bg-blue-500" },
      { id: "whatsapp", label: "WhatsApp", icon: Phone, bg: "bg-green-500" },
      { id: "email", label: "E-Mail", icon: Mail, bg: "bg-gray-600" },
    ];

    const personalShareText = `Hey ${prospectForm.name}! I have a special invitation for you — check it out:\n${getPersonalInviteFullUrl()}`;

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Personal Invite Created</h2>
        <p className="text-xs text-gray-400 mb-5">AI will personally invite {prospectForm.name}</p>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Your personal invite link</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1 font-mono" data-testid="text-personal-invite-url">{getPersonalInviteFullUrl()}</p>
            <button onClick={() => { navigator.clipboard.writeText(getPersonalInviteFullUrl()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded-lg bg-white active:bg-gray-100" data-testid="button-copy-personal-link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              When {prospectForm.name} opens this link, an AI assistant will personally invite them to the webinar and help them register — all in a conversational chat.
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Send via</p>
        <div className="space-y-2 mb-5">
          {personalShareChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                const text = encodeURIComponent(personalShareText);
                const url = encodeURIComponent(getPersonalInviteFullUrl());
                switch (ch.id) {
                  case "telegram": window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank"); break;
                  case "whatsapp": window.open(`https://wa.me/?text=${text}`, "_blank"); break;
                  case "email": window.open(`mailto:?subject=Personal Invitation&body=${text}`, "_blank"); break;
                }
              }}
              className={`w-full flex items-center gap-2.5 p-3.5 rounded-xl ${ch.bg} text-white active:opacity-90 transition-opacity`}
              data-testid={`personal-share-${ch.id}`}
            >
              <ch.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{ch.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { navigator.clipboard.writeText(personalShareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
          data-testid="button-copy-personal-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-700">{copied ? "Copied!" : "Copy message + link"}</span>
        </button>
      </div>
    );
  }

  if (screen === "personal-form" && selectedWebinar) {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">Personal AI Invite</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-xs text-gray-400 mb-1">For webinar</p>
          <p className="text-sm font-semibold text-gray-900">{selectedWebinar.title}</p>
          <p className="text-xs text-gray-400 mt-1">{selectedWebinar.date} at {selectedWebinar.time}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Prospect Name *</label>
            <input
              required
              placeholder="e.g. Max Müller"
              value={prospectForm.name}
              onChange={(e) => setProspectForm({ ...prospectForm, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              data-testid="input-prospect-name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Prospect Type</label>
            <select
              value={prospectForm.type}
              onChange={(e) => setProspectForm({ ...prospectForm, type: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
              data-testid="select-prospect-type"
            >
              <option value="Investor">Investor</option>
              <option value="MLM Leader">MLM Leader</option>
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Beginner">Beginner</option>
              <option value="Neutral">Neutral</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Note for AI (optional)</label>
            <textarea
              placeholder="e.g. Interested in crypto, met at conference..."
              value={prospectForm.note}
              onChange={(e) => setProspectForm({ ...prospectForm, note: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              data-testid="textarea-prospect-note"
            />
          </div>

          <button
            onClick={createPersonalInvite}
            disabled={!prospectForm.name.trim() || personalCreating}
            className="w-full py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="button-create-personal-invite"
          >
            {personalCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create AI Invite
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
          The AI will use the prospect's name, type, and your note to create a personalized conversation when they open the link.
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

  if (screen === "detail" && selectedWebinar) {
    const relatedEvents = eventDetails.filter((e) => {
      return e.title === selectedWebinar.title || (selectedWebinar as any).scheduleEventId === e.id;
    });

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">
              {selectedWebinar.typeBadge}
            </span>
            {selectedWebinar.language && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Globe className="w-2.5 h-2.5" /> {selectedWebinar.language.toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">{selectedWebinar.title}</h2>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedWebinar.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedWebinar.time}</span>
          </div>
          {selectedWebinar.speaker && (
            <div className="flex items-center gap-2">
              {selectedWebinar.speakerPhoto ? (
                <img src={selectedWebinar.speakerPhoto} alt={selectedWebinar.speaker} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
              <span className="text-sm text-gray-600">{selectedWebinar.speaker}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Send className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{selectedWebinar.invitesSent}</p>
            <p className="text-[10px] text-gray-400 uppercase font-medium">Invites Sent</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <UserCheck className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{selectedWebinar.registeredCount}</p>
            <p className="text-[10px] text-gray-400 uppercase font-medium">Registered</p>
          </div>
        </div>

        <div className="flex gap-3 mb-5">
          <button
            onClick={handleStartInvite}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors"
            data-testid="button-send-invite"
          >
            Send Invite
          </button>
          <button
            onClick={() => { setProspectForm({ name: "", type: "Neutral", note: "" }); setPersonalInviteResult(null); setScreen("personal-form"); }}
            className="flex-1 py-3 rounded-xl bg-white border border-blue-200 text-sm font-semibold text-blue-600 active:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
            data-testid="button-personal-ai-invite"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Invite
          </button>
        </div>

        {relatedEvents.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Invite Links</h3>
            <div className="space-y-2">
              {relatedEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => loadEventReport(ev.id)}
                  className="w-full bg-white rounded-xl p-4 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  data-testid={`detail-event-${ev.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 font-mono truncate">{ev.inviteCode}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{ev.registeredCount}</span> reg</span>
                      <span className="text-xs text-gray-500"><span className="font-semibold text-emerald-600">{ev.attendedCount}</span> att</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {eventReport && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Guest Details</h3>
            <div className="space-y-2">
              {eventReport.guests.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl p-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  data-testid={`guest-detail-${g.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{g.name}</p>
                    {g.attended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                        ✓ Attended
                      </span>
                    ) : g.clickedZoom ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">Clicked</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">No show</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">{g.email}</p>
                  {g.attended && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-500">⏱ {g.durationMinutes} min</span>
                        {g.questionsAsked > 0 && <span className="text-[11px] text-gray-500">💬 {g.questionsAsked} questions</span>}
                      </div>
                      {g.questionTexts && g.questionTexts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {g.questionTexts.map((q, qi) => (
                            <div key={qi} className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                              <p className="text-[11px] text-gray-600">"{q}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              {eventReport.guests.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No guests registered yet</p>
              )}
            </div>
          </motion.div>
        )}

        {reportLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}
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
                <div className="flex items-center gap-2 mb-3">
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

              <div className="flex items-center gap-4 mb-4 py-2 px-3 rounded-lg bg-gray-50">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Send className="w-3 h-3 text-blue-400" />
                  <span className="font-semibold text-gray-700">{w.invitesSent}</span> sent
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-gray-700">{w.registeredCount}</span> registered
                </span>
              </div>

              <button
                onClick={() => handleSelectWebinar(w)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors"
                data-testid={`invite-webinar-${w.id}`}
              >
                View & Invite
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
