import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, Mic, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import ShareMenu from "@/components/ShareMenu";

interface ScheduleEvent {
  id: number;
  day: string;
  date: string;
  time: string;
  timezone?: string;
  title: string;
  speaker: string;
  speakerId?: number | null;
  speakerPhoto?: string | null;
  type: "trading" | "partner";
  typeBadge: string;
  banner: string;
  highlights: string[];
  link: string;
  language?: string;
}

const TIMEZONE_OFFSETS: Record<string, number> = {
  CET: 1, CEST: 2, MSK: 3, EST: -5, EDT: -4, PST: -8, PDT: -7, GST: 4, UTC: 0,
};

const EVENT_LABELS: Record<string, { expect: string; joinZoom: string }> = {
  de: { expect: "Das erwartet dich:", joinZoom: "Zum Zoom‑Call" },
  en: { expect: "What to expect:", joinZoom: "Join Zoom Call" },
  ru: { expect: "Что вас ждёт:", joinZoom: "Перейти в Zoom" },
};

function convertTripleTime(time: string, fromTz: string): string {
  const [h, m] = time.split(":").map(Number);
  const fromOffset = TIMEZONE_OFFSETS[fromTz] ?? 1;
  const getZonedTime = (offset: number) => {
    let newH = h + (offset - fromOffset);
    if (newH >= 24) newH -= 24;
    if (newH < 0) newH += 24;
    return `${String(newH).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  };
  return `${getZonedTime(1)} BER | ${getZonedTime(3)} MSK | ${getZonedTime(4)} DXB`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }
  return dateStr;
}

export default function EventDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/event/:id");
  const { language } = useLanguage();
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/schedule-events/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setEvent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  const labels = EVENT_LABELS[language] || EVENT_LABELS.de;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500 text-[14px]">Event not found</p>
        <button onClick={() => setLocation("/schedule")} className="text-purple-600 font-medium text-[13px]">
          ← Back to Schedule
        </button>
      </div>
    );
  }

  const tripleTime = event.time ? convertTripleTime(event.time, event.timezone || "CET") : "";
  const shareUrl = `${window.location.origin}/event/${event.id}`;
  const shareBody = `🎯 JetUP Webinar\n\n«${event.title}»\n\n🎙 ${event.speaker}\n📅 ${formatDate(event.date)}, ${event.day}\n🕐 ${tripleTime}`;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/schedule")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-event"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight truncate">
          {event.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] mt-2"
        >
          {event.banner && (
            <img src={event.banner} alt={event.title} className="w-full h-auto object-cover" data-testid={`banner-event-${event.id}`} />
          )}

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {event.typeBadge && (
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  event.type === "trading" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                }`}>
                  {event.typeBadge}
                </span>
              )}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                Zoom‑Call
              </span>
              {event.language && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  event.language === "de" ? "bg-yellow-100 text-yellow-700" :
                  event.language === "en" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {event.language === "de" ? "DE" : event.language === "en" ? "EN" : "RU"}
                </span>
              )}
              <div className="ml-auto">
                <ShareMenu
                  shareBody={shareBody}
                  shareUrl={shareUrl}
                  title={event.title}
                  testId={`button-share-event-${event.id}`}
                />
              </div>
            </div>

            <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
              "{event.title}"
            </h3>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                <span className="text-[12px] text-gray-500 font-medium">
                  {[formatDate(event.date), event.day].filter(Boolean).join(", ")}{event.time ? `, ${tripleTime}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mic size={13} className="text-gray-400" />
                <span className="text-[12px] text-gray-500 font-medium">
                  {event.speaker}
                </span>
              </div>
            </div>

            {event.highlights && event.highlights.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{labels.expect}</p>
                {event.highlights.map((h, i) => (
                  <p key={i} className="text-[12px] text-gray-600 font-medium leading-snug flex items-start gap-1.5">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                    {h}
                  </p>
                ))}
              </div>
            )}

            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl jetup-gradient-glow text-white text-[13px] font-bold active:scale-[0.97] transition-transform"
              data-testid={`zoom-link-${event.id}`}
            >
              <ExternalLink size={15} />
              {labels.joinZoom}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
