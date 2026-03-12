import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Loader2, Sparkles, UserPlus, CalendarPlus, PhoneCall, FileText, Target } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { id: "followup-attended", label: "Follow-up: Teilnehmer", icon: UserPlus, prompt: "Schreibe eine Follow-up Nachricht für einen Gast, der am Webinar teilgenommen hat und die volle Zeit geblieben ist." },
  { id: "followup-noshow", label: "Follow-up: No-Show", icon: Target, prompt: "Schreibe eine freundliche Nachricht an einen Gast, der sich registriert hat aber nicht zum Webinar erschienen ist." },
  { id: "invite-next", label: "Zum nächsten Webinar einladen", icon: CalendarPlus, prompt: "Schreibe eine Einladung zum nächsten Webinar für einen Kontakt, der an einem früheren Webinar teilgenommen hat." },
  { id: "book-call", label: "Termin vorschlagen", icon: PhoneCall, prompt: "Schreibe eine Nachricht, um ein persönliches Gespräch mit einem interessierten Kontakt zu vereinbaren." },
  { id: "send-info", label: "Unterlagen senden", icon: FileText, prompt: "Schreibe eine Nachricht, um einem Interessenten Informationsmaterial über JetUP zu senden." },
  { id: "qualify", label: "Interesse qualifizieren", icon: Sparkles, prompt: "Hilf mir mit 3 Fragen, die ich einem Kontakt stellen kann, um sein Interesse an der JetUP Partnerschaft einzuschätzen." },
];

export default function AIAssistantScreen({ telegramId, partnerName }: { telegramId: string; partnerName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/partner-app/ai-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-telegram-id": telegramId },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuche es erneut." }]);
    }
    setSending(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Follow-up Assistant</h2>
            <p className="text-xs text-gray-400">Dein Recruiting-Helfer</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-3">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/15 to-indigo-600/10 border border-purple-500/20">
              <p className="text-sm text-gray-300 leading-relaxed">
                Hallo {partnerName.split(" ")[0]}! Ich bin dein AI-Assistent für Recruiting und Follow-up. 
                Wähle eine Aktion oder schreib mir direkt.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => sendMessage(action.prompt)}
                  className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left active:scale-[0.97] transition-transform"
                  data-testid={`ai-action-${action.id}`}
                >
                  <action.icon className="w-4 h-4 text-purple-400 mb-1.5" />
                  <p className="text-xs font-semibold text-white leading-tight">{action.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md"
                  : "bg-white/[0.06] border border-white/[0.08] text-gray-200 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] rounded-bl-md">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-xs text-gray-400">AI denkt nach...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-white/5"
      >
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frag den AI-Assistenten..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 px-3 py-2 outline-none"
            disabled={sending}
            data-testid="input-ai-message"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-30 active:scale-95 transition-all"
            data-testid="button-send-ai"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>
    </div>
  );
}
