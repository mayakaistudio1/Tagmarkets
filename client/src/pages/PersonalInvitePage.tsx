import React, { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Calendar, Clock, User, Mic, Star, Send, ChevronRight, Globe, ChevronDown, ChevronUp, Info, MessageSquare, Phone } from "lucide-react";
import { useLanguage, Language } from "../contexts/LanguageContext";

interface InviteData {
  inviteCode: string;
  prospectName: string;
  partnerName: string;
  isRegistered: boolean;
  discType: string | null;
  inviteStrategy: string | null;
  language?: string;
  event: {
    title: string;
    date: string;
    time: string;
    speaker: string;
    speakerPhoto: string | null;
    banner: string | null;
    highlights: string[];
    typeBadge: string;
  } | null;
  chatHistory: Array<{ role: string; content: string }>;
}

const discQuickRepliesMap: Record<string, Record<string, string[]>> = {
  en: {
    D: ["Yes, interested", "Get to the point", "Register me"],
    I: ["Sounds exciting!", "Tell me more", "Yes, I want in!"],
    S: ["Can you tell me more?", "Maybe", "Yes, register me"],
    C: ["What exactly will be shown?", "Show me details", "Yes, register me"],
    default: ["Yes, register me", "Tell me more", "Not sure yet"],
  },
  de: {
    D: ["Ja, interessiert", "Zur Sache", "Registriere mich"],
    I: ["Klingt spannend!", "Erzähl mir mehr", "Ja, ich will!"],
    S: ["Kannst du mehr erzählen?", "Vielleicht", "Ja, registriere mich"],
    C: ["Was genau wird gezeigt?", "Zeig mir Details", "Ja, registriere mich"],
    default: ["Ja, registriere mich", "Erzähl mir mehr", "Bin mir unsicher"],
  },
  ru: {
    D: ["Да, интересно", "К делу", "Зарегистрируй меня"],
    I: ["Звучит круто!", "Расскажи ещё", "Да, хочу!"],
    S: ["Расскажи подробнее?", "Может быть", "Да, зарегистрируй"],
    C: ["Что именно покажут?", "Покажи детали", "Да, зарегистрируй"],
    default: ["Да, зарегистрируй", "Расскажи ещё", "Пока не уверен"],
  },
};

const reminderRepliesMap: Record<string, string[]> = {
  en: ["Remind me 1 hour before", "Remind me 15 min before", "No reminder needed"],
  de: ["Erinnerung 1 Stunde vorher", "Erinnerung 15 Min. vorher", "Keine Erinnerung nötig"],
  ru: ["Напомни за 1 час", "Напомни за 15 минут", "Напоминание не нужно"],
};

function getDiscQuickReplies(discType: string | null, isRegistered: boolean, lang: string = "en"): string[] {
  const l = lang in discQuickRepliesMap ? lang : "en";
  if (isRegistered) return reminderRepliesMap[l] || reminderRepliesMap.en;
  const langMap = discQuickRepliesMap[l];
  return langMap[discType || "default"] || langMap.default;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "registration-form" | "registration-success";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }
  return dateStr;
}

function detectLanguage(): Language {
  const nav = navigator.language?.toLowerCase() || "";
  if (nav.startsWith("de")) return "de";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

export default function PersonalInvitePage() {
  const [, params] = useRoute("/personal-invite/:code");
  const code = params?.code;
  const { language, setLanguage, t } = useLanguage();

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"landing" | "chat">("landing");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegForm, setShowRegForm] = useState(false);
  const [regData, setRegData] = useState({ name: "", email: "", telegram: "", phone: "", reminderChannel: "whatsapp" as "whatsapp" | "telegram" });
  const [registering, setRegistering] = useState(false);
  const [showEventInfo, setShowEventInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [langInitialized, setLangInitialized] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/personal-invite/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invite not found");
        return r.json();
      })
      .then((data) => {
        setInviteData(data);
        setIsRegistered(data.isRegistered);
        if (!langInitialized) {
          const inviteLang = (data.language as Language) || detectLanguage();
          if (["en", "de", "ru"].includes(inviteLang)) setLanguage(inviteLang as Language);
          setLangInitialized(true);
        }
        if (data.chatHistory?.length > 0) {
          setMessages(data.chatHistory.map((m: any) => ({ role: m.role, content: m.content, type: "text" })));
          setPhase("chat");
          if (!data.isRegistered) {
            setQuickReplies(getDiscQuickReplies(data.discType, false, language));
          }
        }
        if (data.isRegistered) {
          setRegData({ name: "", email: "", telegram: "", phone: "", reminderChannel: "whatsapp" });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, [messages, showRegForm]);

  const initChat = async () => {
    setPhase("chat");
    setSending(true);
    try {
      const res = await fetch(`/api/personal-invite/${code}/init-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      if (!res.ok) throw new Error("Init chat failed");
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.reply, type: "text" }]);
      setQuickReplies(data.quickReplies || getDiscQuickReplies(inviteData?.discType || null, false, language));
      setIsRegistered(data.isRegistered);
      if (data.chatHistory?.length > 1) {
        setMessages(data.chatHistory.map((m: any) => ({ role: m.role, content: m.content, type: "text" })));
      }
    } catch {
      const fallbackMsg = language === "de" ? "Hallo! Ich möchte Ihnen gerne von diesem Webinar erzählen. Möchten Sie sich registrieren?" : language === "ru" ? "Привет! Хочу рассказать вам о вебинаре. Хотите зарегистрироваться?" : "Hi! I'd love to tell you about this webinar. Would you like to register?";
      setMessages([{ role: "assistant", content: fallbackMsg, type: "text" }]);
      setQuickReplies(getDiscQuickReplies(inviteData?.discType || null, false, language));
    }
    setSending(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const lowerText = text.toLowerCase();
    if (!isRegistered && (lowerText.includes("register") || lowerText.includes("registrier") || lowerText.includes("зарегистрируй") || lowerText.includes("sign up") || lowerText === "yes, register me" || lowerText === "ja, ich will!" || lowerText === "ja, registriere mich" || lowerText === "да, хочу!" || lowerText === "да, зарегистрируй")) {
      setMessages((prev) => [...prev, { role: "user", content: text, type: "text" }]);
      setQuickReplies([]);
      setShowRegForm(true);
      if (inviteData?.prospectName) {
        setRegData((prev) => ({ ...prev, name: inviteData.prospectName }));
      }
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text, type: "text" }]);
    setInput("");
    setQuickReplies([]);
    setSending(true);

    try {
      const res = await fetch(`/api/personal-invite/${code}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, type: "text" }]);
      setQuickReplies(data.quickReplies || []);
      setIsRegistered(data.isRegistered);
    } catch {
      const errMsg = language === "de" ? "Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut." : language === "ru" ? "Извините, что-то пошло не так. Попробуйте ещё раз." : "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg, type: "text" }]);
    }
    setSending(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name || !regData.email) return;
    setRegistering(true);
    try {
      const res = await fetch(`/api/personal-invite/${code}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Registration failed");
      }
      const data = await res.json();
      if (data.success) {
        setShowRegForm(false);
        setIsRegistered(true);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.chatHistory?.[data.chatHistory.length - 1]?.content || `You're registered! 🎉`, type: "text" },
        ]);
        setQuickReplies(data.quickReplies || []);
      }
    } catch {
      const errMsg = language === "de" ? "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut." : language === "ru" ? "Регистрация не удалась. Попробуйте ещё раз." : "Registration failed. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg, type: "text" }]);
    }
    setRegistering(false);
  };

  const handleReminderChoice = async (choice: string) => {
    setMessages((prev) => [...prev, { role: "user", content: choice, type: "text" }]);
    setQuickReplies([]);
    setSending(true);

    const preference = (choice.includes("1 hour") || choice.includes("1 Stunde") || choice.includes("1 час")) ? "1_hour" : (choice.includes("15 min") || choice.includes("15 Min") || choice.includes("15 минут")) ? "15_min" : "none";
    try {
      const res = await fetch(`/api/personal-invite/${code}/reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference }),
      });
      if (!res.ok) throw new Error("Reminder request failed");
      const data = await res.json();
      if (data.chatHistory?.length) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.chatHistory[data.chatHistory.length - 1].content, type: "text" }]);
      }
    } catch {
      const fallback = language === "de" ? "Verstanden! Bis zum Webinar!" : language === "ru" ? "Понял! До встречи на вебинаре!" : "Got it! See you at the webinar!";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback, type: "text" }]);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-gray-400">{t('pi.loading')}</p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <span className="text-xl">❌</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1.5">{t('pi.notFound')}</h1>
        <p className="text-sm text-gray-400">{t('pi.notFoundDesc')}</p>
      </div>
    );
  }

  const ev = inviteData.event;

  const langOptions: { value: Language; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "de", label: "DE" },
    { value: "ru", label: "RU" },
  ];

  if (phase === "landing") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto px-5 py-6 space-y-5">
          <div className="flex justify-end">
            <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <Globe className="w-3 h-3 text-gray-400" />
              {langOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${language === opt.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-600"}`}
                  data-testid={`lang-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-3"
          >
            <img src="/jetup-logo.png" alt="JetUP Logo" className="h-8" data-testid="img-logo" />
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              <Star className="w-3 h-3 mr-1.5" />
              {t('pi.personalInvitation')}
            </div>
          </motion.div>

          {ev?.banner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <img src={ev.banner} alt={ev.title} className="w-full h-auto" data-testid="img-event-banner" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-5"
          >
            <div className="text-center space-y-1.5">
              <p className="text-sm text-gray-400">
                <span className="text-blue-600 font-medium" data-testid="text-partner-name">{inviteData.partnerName}</span> {t('pi.invitedYou')}
              </p>
              <h1 className="text-xl font-bold text-gray-900 leading-tight" data-testid="text-event-title">
                {ev?.title || "Webinar"}
              </h1>
            </div>

            {ev?.speaker && (
              <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                {ev.speakerPhoto ? (
                  <img src={ev.speakerPhoto} alt={ev.speaker} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-blue-500" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">{t('pi.speaker')}</p>
                  <p className="text-sm font-semibold text-gray-900">{ev.speaker}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-semibold">{t('pi.date')}</p>
                  <p className="text-sm font-semibold text-gray-900" data-testid="text-event-date">{formatDate(ev?.date || "")}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-semibold">{t('pi.time')}</p>
                  <p className="text-sm font-semibold text-gray-900" data-testid="text-event-time">{ev?.time || ""}</p>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={initChat}
              className="w-full py-4 rounded-2xl bg-blue-600 text-base font-bold text-white active:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              data-testid="button-open-invitation"
            >
              {t('pi.openInvitation')}
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          <div className="text-center pb-4">
            <p className="text-[10px] text-gray-400">{t('pi.poweredBy')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F7] overflow-hidden">
      <div className="flex-shrink-0 bg-white border-b border-gray-100">
        <div className="px-5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Star className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-gray-900 truncate">{ev?.title || "Webinar"}</h2>
            <p className="text-[11px] text-gray-400">{t('pi.from')} {inviteData.partnerName}</p>
          </div>
          <button
            onClick={() => setShowEventInfo(!showEventInfo)}
            className="p-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
            data-testid="button-toggle-event-info"
          >
            {showEventInfo ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <Info className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
        <AnimatePresence>
          {showEventInfo && ev && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-3 space-y-2.5">
                {ev.banner && (
                  <img src={ev.banner} alt={ev.title} className="w-full h-32 object-cover rounded-xl" />
                )}
                {ev.speaker && (
                  <div className="flex items-center gap-2.5">
                    {ev.speakerPhoto ? (
                      <img src={ev.speakerPhoto} alt={ev.speaker} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                    <span className="text-xs font-medium text-gray-700">{ev.speaker}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(ev.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ev.time}</span>
                </div>
                {ev.highlights?.length > 0 && (
                  <ul className="space-y-1">
                    {ev.highlights.map((h: string, i: number) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-blue-500 mt-0.5">•</span>{h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
        {sending && messages.length === 0 && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white rounded-bl-md" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-400">{t('pi.preparing')}</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white text-gray-700 rounded-bl-md"
                }`}
                style={msg.role === "assistant" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" } : undefined}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {showRegForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <form
              onSubmit={handleRegister}
              className="max-w-[90%] bg-white rounded-2xl rounded-bl-md p-4 space-y-3"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <p className="text-xs font-semibold text-gray-700 mb-2">{t('pi.quickReg')}</p>
              <input
                required
                placeholder={t('pi.yourName')}
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                data-testid="input-reg-name"
              />
              <input
                required
                type="email"
                placeholder={t('pi.yourEmail')}
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                data-testid="input-reg-email"
              />
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider mb-1.5">{t('pi.reminderChannel')}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRegData({ ...regData, reminderChannel: "whatsapp", telegram: "" })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors border ${regData.reminderChannel === "whatsapp" ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}
                    data-testid="button-channel-whatsapp"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {t('pi.whatsapp')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegData({ ...regData, reminderChannel: "telegram", phone: "" })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors border ${regData.reminderChannel === "telegram" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}
                    data-testid="button-channel-telegram"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t('pi.telegram')}
                  </button>
                </div>
              </div>
              {regData.reminderChannel === "whatsapp" ? (
                <input
                  placeholder={t('pi.phoneNumber')}
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  type="tel"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  data-testid="input-reg-phone"
                />
              ) : (
                <input
                  placeholder={t('pi.telegramUsername')}
                  value={regData.telegram}
                  onChange={(e) => setRegData({ ...regData, telegram: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  data-testid="input-reg-telegram"
                />
              )}
              <button
                type="submit"
                disabled={registering}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50"
                data-testid="button-confirm-register"
              >
                {registering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('pi.confirmReg')}
              </button>
            </form>
          </motion.div>
        )}

        {sending && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white rounded-bl-md" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-400">{t('pi.typing')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {quickReplies.length > 0 && !showRegForm && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((qr) => (
              <motion.button
                key={qr}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (qr.includes("Remind") || qr.includes("No reminder") || qr.includes("Erinnerung") || qr.includes("Keine Erinnerung") || qr.includes("Напомни") || qr.includes("Напоминание")) {
                    handleReminderChoice(qr);
                  } else {
                    sendMessage(qr);
                  }
                }}
                className="px-3.5 py-2 rounded-full bg-white border border-blue-200 text-xs font-medium text-blue-600 active:bg-blue-50 transition-colors"
                data-testid={`quick-reply-${qr.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {qr}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {!showRegForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex-shrink-0 px-4 pb-4 pt-2 bg-white border-t border-gray-100"
        >
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('pi.typeMessage')}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 px-3 py-2 outline-none"
              disabled={sending}
              data-testid="input-chat-message"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-xl bg-blue-600 disabled:opacity-30 active:bg-blue-700 transition-colors"
              data-testid="button-send-chat"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
