import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Clock,
  Mic,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "../contexts/LanguageContext";

interface Speaker {
  id: number;
  name: string;
  photo: string;
  role: string;
}

interface ScheduleEvent {
  id: number;
  day: string;
  date: string;
  time: string;
  timezone?: string;
  title: string;
  speaker: string;
  speakerId?: number | null;
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

const EVENT_LABELS: Record<string, { expect: string; joinZoom: string; motto: [string, string, string] }> = {
  de: { expect: "Das erwartet dich:", joinZoom: "Zum Zoom Call", motto: ["STRUKTUR", "TRANSPARENZ", "KONTROLLE"] },
  en: { expect: "What to expect:", joinZoom: "Join Zoom Call", motto: ["STRUCTURE", "TRANSPARENCY", "CONTROL"] },
  ru: { expect: "Что тебя ждёт:", joinZoom: "Присоединиться к Zoom", motto: ["СТРУКТУРА", "ПРОЗРАЧНОСТЬ", "КОНТРОЛЬ"] },
};

const DAY_ORDER: Record<string, number> = {
  montag: 0, monday: 0, понедельник: 0,
  dienstag: 1, tuesday: 1, вторник: 1,
  mittwoch: 2, wednesday: 2, среда: 2,
  donnerstag: 3, thursday: 3, четверг: 3,
  freitag: 4, friday: 4, пятница: 4,
  samstag: 5, saturday: 5, суббота: 5,
  sonntag: 6, sunday: 6, воскресенье: 6,
};

function sortEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((a, b) => {
    const dayA = DAY_ORDER[a.day.toLowerCase()] ?? 99;
    const dayB = DAY_ORDER[b.day.toLowerCase()] ?? 99;
    if (dayA !== dayB) return dayA - dayB;
    const [hA, mA] = (a.time || "00:00").split(":").map(Number);
    const [hB, mB] = (b.time || "00:00").split(":").map(Number);
    return (hA * 60 + (mA || 0)) - (hB * 60 + (mB || 0));
  });
}

function convertTime(time: string, fromTz: string, toTz: string): string {
  const [h, m] = time.split(":").map(Number);
  const fromOffset = TIMEZONE_OFFSETS[fromTz] ?? 1;
  const toOffset = TIMEZONE_OFFSETS[toTz] ?? 3;
  let newH = h + (toOffset - fromOffset);
  if (newH >= 24) newH -= 24;
  if (newH < 0) newH += 24;
  return `${String(newH).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

function JetUpLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="url(#jetup-grad)" />
        <path d="M14 12 L14 24 Q14 28 18 28 L20 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M20 12 L20 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 12 L26 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 14 L28 28" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="11" r="2" fill="#C084FC" />
        <defs>
          <linearGradient id="jetup-grad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[#7C3AED] font-extrabold text-[14px] tracking-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
        Jet<span className="text-[#A855F7]">UP</span>
      </span>
    </div>
  );
}

function BannerGridPattern() {
  const rows = 5;
  const cols = 8;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <div key={`${r}-${c}`} className="bg-[#f3f4f6] rounded-[3px]" style={{ opacity: 0.18 }} />
      );
    }
  }
  return (
    <div className="absolute inset-0 p-2 grid gap-1 pointer-events-none"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {cells}
    </div>
  );
}

function EventBanner({ event, speakerPhoto }: { event: ScheduleEvent; speakerPhoto?: string }) {
  if (event.banner) {
    return <img src={event.banner} alt={event.title} className="w-full h-auto object-cover" data-testid={`banner-${event.id}`} />;
  }

  const tz = event.timezone || "CET";
  const tzLabel = tz === "CET" || tz === "CEST" ? "Berlin Zeit" : tz === "MSK" ? "Moskau Zeit" : tz;

  return (
    <div className="relative w-full aspect-[2/1] overflow-hidden" data-testid={`banner-${event.id}`}
      style={{ background: "linear-gradient(-29deg, rgb(182, 139, 255) 0%, rgb(255, 255, 255) 69%)" }}>
      <BannerGridPattern />

      <div className="absolute inset-0 flex">
        <div className="flex-1 flex flex-col justify-between py-[4%] px-[4%] z-10" style={{ maxWidth: "62%" }}>
          <img src="/jetup-logo-banner.png" alt="JetUP" className="h-[16%] w-auto object-contain self-start" />

          <div className="space-y-[2%]">
            <p className="text-[#1a1a1a] font-bold text-[clamp(10px,3.2vw,32px)] leading-tight" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Zoom Call
            </p>
            <h3 className="text-[#7C3AED] font-bold leading-[1.1] uppercase" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(12px,3.8vw,50px)" }}>
              &ldquo;{event.title}&rdquo;
            </h3>
          </div>

          <div className="flex items-center gap-[1.5%] flex-wrap">
            <img src="/calendar-icon-banner.png" alt="" className="h-[clamp(10px,2.5vw,34px)] w-auto opacity-80" />
            <span className="text-black text-[clamp(8px,2.8vw,36px)]" style={{ fontFamily: "Inter, sans-serif" }}>
              {[event.date, event.day].filter(Boolean).join(" · ")}
            </span>
            {event.time && (
              <>
                <span className="bg-black rounded-full" style={{ width: "clamp(2px,0.4vw,5px)", height: "clamp(2px,0.4vw,5px)" }} />
                <span className="text-black text-[clamp(8px,2.8vw,36px)]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {event.time}
                </span>
              </>
            )}
            <span className="text-[#aeaeae] text-[clamp(8px,2.8vw,36px)]" style={{ fontFamily: "Inter, sans-serif" }}>
              ({tzLabel})
            </span>
          </div>

          <div className="flex items-center gap-[2%]">
            {(() => {
              const motto = (EVENT_LABELS[event.language || "de"] || EVENT_LABELS.de).motto;
              return motto.map((word, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="bg-[#a855f7] rounded-full" style={{ width: "clamp(2px,0.4vw,5px)", height: "clamp(2px,0.4vw,5px)" }} />}
                  <span className="font-bold text-[#111827] uppercase" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(6px,1.2vw,16px)", letterSpacing: "3px" }}>
                    {word}
                  </span>
                </React.Fragment>
              ));
            })()}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 pr-[3%]">
          {speakerPhoto ? (
            <>
              <div className="relative w-[75%] aspect-square">
                <div className="absolute -inset-[4%] rounded-full border-[3px] border-[#C084FC]/40" />
                <img src={speakerPhoto} alt={event.speaker}
                  className="w-full h-full rounded-full object-cover object-top" />
              </div>
              <div className="mt-[4%] bg-white rounded px-[6%] py-[2%] shadow-sm">
                <p className="font-semibold text-black text-center whitespace-nowrap" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(7px,1.8vw,24px)" }}>
                  Speaker: {event.speaker}
                </p>
              </div>
            </>
          ) : (
            <div className="w-[75%] aspect-square rounded-full bg-gradient-to-br from-[#C084FC]/20 to-[#A855F7]/10 flex items-center justify-center">
              <Mic size={24} className="text-[#7C3AED]/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SchedulePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const [filteredEvents, setFilteredEvents] = useState<ScheduleEvent[]>([]);
  const [speakersMap, setSpeakersMap] = useState<Record<number, Speaker>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/schedule-events").then(r => r.json()),
      fetch("/api/speakers").then(r => r.json()),
    ])
      .then(([events, speakers]) => {
        setFilteredEvents(sortEvents(events));
        const map: Record<number, Speaker> = {};
        for (const s of speakers) { map[s.id] = s; }
        setSpeakersMap(map);
      })
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
          data-testid="button-back-schedule"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          {t("scheduleTitle")}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-purple-500" />
          </div>
        ) : (<motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            {t("scheduleSubtitle")}
          </p>

          <div className="flex gap-2">
            <span className="px-4 py-2.5 rounded-xl text-[12px] font-bold jetup-gradient text-white btn-glow" data-testid="tab-schedule-alle">
              {t("scheduleAll")}
            </span>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const speaker = event.speakerId ? speakersMap[event.speakerId] : undefined;
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
                  data-testid={`event-${event.id}`}
                >
                  <EventBanner event={event} speakerPhoto={speaker?.photo} />

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {event.typeBadge && (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          event.type === "trading"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}>
                          {event.typeBadge}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                        Zoom Call
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
                    </div>

                    <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                      "{event.title}"
                    </h3>

                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <span className="text-[12px] text-gray-500 font-medium">
                          {[event.date, event.day].filter(Boolean).join(", ")}{event.time ? `, ${event.time} ${event.timezone || "CET"} | ${convertTime(event.time, event.timezone || "CET", "MSK")} MSK` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mic size={13} className="text-gray-400" />
                        <span className="text-[12px] text-gray-500 font-medium">
                          {event.speaker}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{(EVENT_LABELS[event.language || "de"] || EVENT_LABELS.de).expect}</p>
                      {event.highlights.map((h, i) => (
                        <p key={i} className="text-[12px] text-gray-600 font-medium leading-snug flex items-start gap-1.5">
                          <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                          {h}
                        </p>
                      ))}
                    </div>

                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl jetup-gradient-glow text-white text-[13px] font-bold active:scale-[0.97] transition-transform"
                      data-testid={`zoom-link-${event.id}`}
                    >
                      <ExternalLink size={15} />
                      {(EVENT_LABELS[event.language || "de"] || EVENT_LABELS.de).joinZoom}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[13px] text-gray-400 font-medium">
                {t("scheduleNoEvents")}
              </p>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub-schedule"
            >
              <ArrowLeft size={16} />
              {t("backToHub")}
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria-schedule"
            >
              <MessageCircle size={16} />
              {t("askMaria")}
            </button>
          </div>
        </motion.div>)}
      </div>
    </div>
  );
};

export default SchedulePage;
