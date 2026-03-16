import React, { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Calendar, Clock, User, Mic, Star, Send, ChevronRight } from "lucide-react";

interface InviteData {
  inviteCode: string;
  prospectName: string;
  partnerName: string;
  isRegistered: boolean;
  discType: string | null;
  inviteStrategy: string | null;
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

function getDiscQuickReplies(discType: string | null, isRegistered: boolean): string[] {
  if (isRegistered) return ["Remind me 1 hour before", "Remind me 15 min before", "No reminder needed"];
  switch (discType) {
    case "D": return ["Ja, interessiert", "Zur Sache", "Registriere mich"];
    case "I": return ["Klingt spannend!", "Erzähl mir mehr", "Ja, ich will!"];
    case "S": return ["Kannst du mehr erzählen?", "Vielleicht", "Ja, registriere mich"];
    case "C": return ["Was genau wird gezeigt?", "Zeig mir Details", "Ja, registriere mich"];
    default: return ["Yes, register me", "Tell me more", "Not sure yet"];
  }
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

export default function PersonalInvitePage() {
  const [, params] = useRoute("/personal-invite/:code");
  const code = params?.code;

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
  const [regData, setRegData] = useState({ name: "", email: "", telegram: "" });
  const [registering, setRegistering] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
        if (data.chatHistory?.length > 0) {
          setMessages(data.chatHistory.map((m: any) => ({ role: m.role, content: m.content, type: "text" })));
          setPhase("chat");
          if (!data.isRegistered) {
            setQuickReplies(getDiscQuickReplies(data.discType, false));
          }
        }
        if (data.isRegistered) {
          setRegData({ name: "", email: "", telegram: "" });
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
      const res = await fetch(`/api/personal-invite/${code}/init-chat`, { method: "POST" });
      if (!res.ok) throw new Error("Init chat failed");
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.reply, type: "text" }]);
      setQuickReplies(data.quickReplies || []);
      setIsRegistered(data.isRegistered);
      if (data.chatHistory?.length > 1) {
        setMessages(data.chatHistory.map((m: any) => ({ role: m.role, content: m.content, type: "text" })));
      }
    } catch {
      setMessages([{ role: "assistant", content: "Hi! I'd love to tell you about this webinar. Would you like to register?", type: "text" }]);
      setQuickReplies(getDiscQuickReplies(inviteData?.discType || null, false));
    }
    setSending(false);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const lowerText = text.toLowerCase();
    if (!isRegistered && (lowerText.includes("register") || lowerText.includes("registrier") || lowerText.includes("sign up") || lowerText === "yes, register me" || lowerText === "ja, ich will!" || lowerText === "ja, registriere mich")) {
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
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, type: "text" }]);
      setQuickReplies(data.quickReplies || []);
      setIsRegistered(data.isRegistered);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again.", type: "text" }]);
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
      setMessages((prev) => [...prev, { role: "assistant", content: "Registration failed. Please try again.", type: "text" }]);
    }
    setRegistering(false);
  };

  const handleReminderChoice = async (choice: string) => {
    setMessages((prev) => [...prev, { role: "user", content: choice, type: "text" }]);
    setQuickReplies([]);
    setSending(true);

    const preference = choice.includes("1 hour") ? "1_hour" : choice.includes("15 min") ? "15_min" : "none";
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
      setMessages((prev) => [...prev, { role: "assistant", content: "Got it! See you at the webinar!", type: "text" }]);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-gray-400">Loading invitation...</p>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <span className="text-xl">❌</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1.5">Invitation Not Found</h1>
        <p className="text-sm text-gray-400">This invitation link is no longer available.</p>
      </div>
    );
  }

  const ev = inviteData.event;

  if (phase === "landing") {
    return (
      <div className="min-h-screen bg-[#F5F5F7] overflow-y-auto no-scrollbar">
        <div className="max-w-md mx-auto px-5 py-6 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-3"
          >
            <img src="/jetup-logo.png" alt="JetUP Logo" className="h-8" data-testid="img-logo" />
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
              <Star className="w-3 h-3 mr-1.5" />
              Personal Invitation
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
                <span className="text-blue-600 font-medium" data-testid="text-partner-name">{inviteData.partnerName}</span> invited you
              </p>
              <h1 className="text-xl font-bold text-gray-900 leading-tight" data-testid="text-event-title">
                {ev?.title || "Private Webinar"}
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
                  <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Speaker</p>
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
                  <p className="text-[10px] uppercase text-gray-400 font-semibold">Date</p>
                  <p className="text-sm font-semibold text-gray-900" data-testid="text-event-date">{formatDate(ev?.date || "")}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-semibold">Time</p>
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
              Open Invitation
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          <div className="text-center pb-4">
            <p className="text-[10px] text-gray-400">Powered by JetUP</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F5F5F7] overflow-hidden">
      <div className="flex-shrink-0 bg-white px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Star className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-gray-900 truncate">{ev?.title || "Webinar"}</h2>
            <p className="text-[11px] text-gray-400">from {inviteData.partnerName}</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
        {sending && messages.length === 0 && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white rounded-bl-md" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-400">Preparing your invitation...</span>
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
              <p className="text-xs font-semibold text-gray-700 mb-2">Quick Registration</p>
              <input
                required
                placeholder="Your name"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                data-testid="input-reg-name"
              />
              <input
                required
                type="email"
                placeholder="Your email"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                data-testid="input-reg-email"
              />
              <input
                placeholder="Telegram @username (optional)"
                value={regData.telegram}
                onChange={(e) => setRegData({ ...regData, telegram: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                data-testid="input-reg-telegram"
              />
              <button
                type="submit"
                disabled={registering}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50"
                data-testid="button-confirm-register"
              >
                {registering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Registration"}
              </button>
            </form>
          </motion.div>
        )}

        {sending && messages.length > 0 && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white rounded-bl-md" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-400">Typing...</span>
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
                  if (qr.includes("Remind") || qr.includes("No reminder")) {
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
              placeholder="Type a message..."
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
