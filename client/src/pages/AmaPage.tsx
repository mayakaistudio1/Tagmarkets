import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, User, CheckCircle2, Loader2, ExternalLink, Calendar, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import amaBannerImg from "@assets/image_1775509747032.png";

const AMA_DATE = new Date("2026-04-09T17:00:00Z");
const ZOOM_LINK = "https://us06web.zoom.us/j/82572501523";

const LABELS: Record<string, {
  title: string;
  speaker: string;
  speakerRole: string;
  topic: string;
  dateLabel: string;
  timeLabel: string;
  description: string;
  importantNote: string;
  noteText: string;
  formTitle: string;
  namePlaceholder: string;
  contactPlaceholder: string;
  questionPlaceholder: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successMsg: string;
  submitAnother: string;
  ended: string;
  endedMsg: string;
  back: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  nameRequired: string;
  contactRequired: string;
  questionRequired: string;
  joinZoom: string;
}> = {
  de: {
    title: "AMA Session",
    speaker: "Niklas Freihofer",
    speakerRole: "CEO TAG Markets",
    topic: "AMA-Session mit dem CEO von TAG Markets",
    dateLabel: "9. April",
    timeLabel: "19:00 Berlin · 20:00 Moskau",
    description: "Niklas beantwortet eure Fragen live. Kein Skript, keine Präsentation — ein direktes Gespräch mit dem Mann, der hinter der Broker-Infrastruktur unseres Ökosystems steht.\n\nAlles, was ihr schon lange fragen wolltet — stellt es direkt.",
    importantNote: "Wichtig vorab",
    noteText: "Bitte reicht eure Fragen vorab über dieses Formular ein. Wir sammeln die Fragen im Voraus, erstellen eine gemeinsame Liste und greifen im Live-Stream die wichtigsten Punkte auf.",
    formTitle: "Deine Frage einreichen",
    namePlaceholder: "Dein Name",
    contactPlaceholder: "Telegram / E-Mail / Telefon",
    questionPlaceholder: "Deine Frage an Niklas...",
    submit: "Frage absenden",
    submitting: "Wird gesendet...",
    successTitle: "Frage eingereicht!",
    successMsg: "Deine Frage wurde erfolgreich übermittelt. Wir sehen uns am 9. April!",
    submitAnother: "Weitere Frage stellen",
    ended: "Session beendet",
    endedMsg: "Die AMA-Session mit Niklas Freihofer hat bereits stattgefunden. Vielen Dank für deine Teilnahme!",
    back: "Zurück",
    days: "Tage",
    hours: "Std",
    minutes: "Min",
    seconds: "Sek",
    nameRequired: "Name ist erforderlich",
    contactRequired: "Kontaktinformation ist erforderlich",
    questionRequired: "Bitte gib eine Frage ein",
    joinZoom: "Zum Zoom-Call",
  },
  en: {
    title: "AMA Session",
    speaker: "Niklas Freihofer",
    speakerRole: "CEO TAG Markets",
    topic: "AMA Session with the CEO of TAG Markets",
    dateLabel: "April 9",
    timeLabel: "7:00 PM Berlin · 8:00 PM Moscow",
    description: "Niklas answers your questions live. No script, no presentation — a direct conversation with the man behind the brokerage infrastructure of our ecosystem.\n\nEverything you've always wanted to ask — ask it directly.",
    importantNote: "Important",
    noteText: "Please submit your questions in advance using this form. We collect questions beforehand, create a shared list, and address the key points during the live stream.",
    formTitle: "Submit your question",
    namePlaceholder: "Your name",
    contactPlaceholder: "Telegram / Email / Phone",
    questionPlaceholder: "Your question for Niklas...",
    submit: "Submit question",
    submitting: "Submitting...",
    successTitle: "Question submitted!",
    successMsg: "Your question has been successfully submitted. See you on April 9th!",
    submitAnother: "Ask another question",
    ended: "Session ended",
    endedMsg: "The AMA session with Niklas Freihofer has already taken place. Thank you for participating!",
    back: "Back",
    days: "Days",
    hours: "Hrs",
    minutes: "Min",
    seconds: "Sec",
    nameRequired: "Name is required",
    contactRequired: "Contact info is required",
    questionRequired: "Please enter a question",
    joinZoom: "Join Zoom Call",
  },
  ru: {
    title: "AMA Сессия",
    speaker: "Niklas Freihofer",
    speakerRole: "CEO TAG Markets",
    topic: "AMA-сессия с CEO TAG Markets",
    dateLabel: "9 апреля",
    timeLabel: "19:00 Берлин · 20:00 Москва",
    description: "Никлас отвечает на ваши вопросы в прямом эфире. Без сценария, без презентации — прямой разговор с человеком, стоящим за брокерской инфраструктурой нашей экосистемы.\n\nВсё, что вы давно хотели спросить — спрашивайте напрямую.",
    importantNote: "Важно",
    noteText: "Пожалуйста, отправьте ваши вопросы заранее через эту форму. Мы собираем вопросы заранее, составляем общий список и разбираем ключевые моменты во время прямого эфира.",
    formTitle: "Задайте ваш вопрос",
    namePlaceholder: "Ваше имя",
    contactPlaceholder: "Telegram / Email / Телефон",
    questionPlaceholder: "Ваш вопрос Никласу...",
    submit: "Отправить вопрос",
    submitting: "Отправка...",
    successTitle: "Вопрос отправлен!",
    successMsg: "Ваш вопрос успешно отправлен. Увидимся 9 апреля!",
    submitAnother: "Задать ещё вопрос",
    ended: "Сессия завершена",
    endedMsg: "AMA-сессия с Niklas Freihofer уже состоялась. Спасибо за участие!",
    back: "Назад",
    days: "Дн",
    hours: "Ч",
    minutes: "Мин",
    seconds: "Сек",
    nameRequired: "Имя обязательно",
    contactRequired: "Контактная информация обязательна",
    questionRequired: "Пожалуйста, введите вопрос",
    joinZoom: "Перейти в Zoom",
  },
};

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { ended: false, days, hours, minutes, seconds };
}

export default function AmaPage() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const l = LABELS[language] || LABELS.de;
  const countdown = useCountdown(AMA_DATE);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError(l.nameRequired); return; }
    if (!contact.trim()) { setError(l.contactRequired); return; }
    if (!question.trim()) { setError(l.questionRequired); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/ama/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), contact: contact.trim(), question: question.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit");
      }
      setSubmitted(true);
      setName("");
      setContact("");
      setQuestion("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0c0b1a]">
      <div className="sticky top-0 z-10 bg-[#0c0b1a]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setLocation("/")}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
            data-testid="button-back-ama"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <h1 className="text-[17px] font-extrabold text-white flex-1 tracking-tight">
            {l.title}
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-0"
        >
          <div className="relative w-full overflow-hidden">
            <img
              src={amaBannerImg}
              alt="AMA Session with Niklas Freihofer"
              className="w-full h-auto object-cover"
              data-testid="img-ama-banner"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <div className="px-5 pt-5 pb-2 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7C3AED]/20 text-[#A855F7] uppercase tracking-wider">
                AMA Session
              </span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7C3AED] text-white">
                Zoom-Call
              </span>
            </div>

            <h2 className="text-[20px] font-extrabold text-white leading-tight" data-testid="text-ama-topic">
              {l.topic}
            </h2>

            <div className="flex items-center gap-3 text-[13px]">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Calendar size={14} className="text-[#A855F7]" />
                <span className="font-semibold" data-testid="text-ama-date">{l.dateLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Clock size={14} className="text-[#A855F7]" />
                <span data-testid="text-ama-time">{l.timeLabel}</span>
              </div>
            </div>

            <p className="text-[13px] text-gray-400 leading-relaxed whitespace-pre-line">
              {l.description}
            </p>
          </div>

          {countdown.ended ? (
            <div className="px-5 pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 rounded-2xl p-5 text-center space-y-3 border border-white/10"
              >
                <CheckCircle2 size={32} className="text-green-400 mx-auto" />
                <h3 className="text-[16px] font-bold text-white" data-testid="text-ama-ended">{l.ended}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">{l.endedMsg}</p>
              </motion.div>
            </div>
          ) : (
            <div className="px-5 pb-6 space-y-5">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: countdown.days, label: l.days },
                  { value: countdown.hours, label: l.hours },
                  { value: countdown.minutes, label: l.minutes },
                  { value: countdown.seconds, label: l.seconds },
                ].map((item, i) => (
                  <div key={i} className="bg-[#1a1830] rounded-xl p-3 text-center border border-[#2d2a4a]" data-testid={`countdown-${i}`}>
                    <div className="text-[22px] font-extrabold text-white tabular-nums">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-[#A855F7] font-semibold uppercase tracking-wider mt-0.5">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={ZOOM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[14px] font-bold active:scale-[0.97] transition-transform shadow-lg shadow-purple-900/30"
                data-testid="link-ama-zoom"
              >
                <ExternalLink size={16} />
                {l.joinZoom}
              </a>

              <div className="bg-[#1a1830] rounded-2xl p-4 border border-[#2d2a4a]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#A855F7] uppercase tracking-wider">
                    {l.importantNote}
                  </span>
                </div>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  {l.noteText}
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center space-y-3"
                >
                  <CheckCircle2 size={32} className="text-green-400 mx-auto" />
                  <h3 className="text-[16px] font-bold text-white" data-testid="text-ama-success">{l.successTitle}</h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed">{l.successMsg}</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-white/10 text-white text-[13px] font-semibold hover:bg-white/15 active:scale-95 transition-all"
                    data-testid="button-ama-another"
                  >
                    {l.submitAnother}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <h3 className="text-[15px] font-bold text-white">{l.formTitle}</h3>

                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={l.namePlaceholder}
                      className="w-full pl-10 pr-4 py-3 bg-[#1a1830] border border-[#2d2a4a] rounded-xl text-white text-[14px] placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
                      data-testid="input-ama-name"
                    />
                  </div>

                  <input
                    type="text"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder={l.contactPlaceholder}
                    className="w-full px-4 py-3 bg-[#1a1830] border border-[#2d2a4a] rounded-xl text-white text-[14px] placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30"
                    data-testid="input-ama-contact"
                  />

                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder={l.questionPlaceholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#1a1830] border border-[#2d2a4a] rounded-xl text-white text-[14px] placeholder-gray-500 focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 resize-none"
                    data-testid="input-ama-question"
                  />

                  {error && (
                    <p className="text-[12px] text-red-400 font-medium" data-testid="text-ama-error">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[13px] font-bold active:scale-[0.97] transition-transform disabled:opacity-50 shadow-lg shadow-purple-900/30"
                    data-testid="button-ama-submit"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    {submitting ? l.submitting : l.submit}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="px-5 pb-8">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 text-white/60 text-[13px] font-semibold active:scale-[0.97] transition-transform border border-white/5"
              data-testid="button-ama-back"
            >
              <ArrowLeft size={15} />
              {l.back}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
