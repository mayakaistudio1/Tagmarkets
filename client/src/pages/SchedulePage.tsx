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
  title: string;
  speaker: string;
  speakerId?: number | null;
  type: "trading" | "partner";
  typeBadge: string;
  banner: string;
  highlights: string[];
  link: string;
}

function EventBanner({ event, speakerPhoto }: { event: ScheduleEvent; speakerPhoto?: string }) {
  if (event.banner) {
    return <img src={event.banner} alt={event.title} className="w-full h-auto object-cover" data-testid={`banner-${event.id}`} />;
  }

  return (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#7C3AED] to-[#A855F7]" data-testid={`banner-${event.id}`}>
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 flex">
        <div className="flex-1 flex flex-col justify-center px-5 py-4 z-10">
          <span className={`self-start text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${
            event.type === "trading" ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"
          }`}>
            {event.typeBadge}
          </span>
          <h3 className="text-white font-extrabold text-[15px] leading-tight mb-1.5">
            {event.title}
          </h3>
          <p className="text-white/80 text-[12px] font-medium">
            {event.date} | {event.time} Uhr
          </p>
          <p className="text-white/70 text-[11px] mt-0.5">
            mit {event.speaker}
          </p>
        </div>
        {speakerPhoto && (
          <div className="w-[40%] relative">
            <img src={speakerPhoto} alt={event.speaker} className="absolute bottom-0 right-0 h-full w-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] via-transparent to-transparent" />
          </div>
        )}
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
      fetch(`/api/schedule-events?lang=${language}`).then(r => r.json()),
      fetch("/api/speakers").then(r => r.json()),
    ])
      .then(([events, speakers]) => {
        setFilteredEvents(events);
        const map: Record<number, Speaker> = {};
        for (const s of speakers) { map[s.id] = s; }
        setSpeakersMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

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
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        event.type === "trading"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {event.typeBadge}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                        Zoom Call
                      </span>
                    </div>

                    <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
                      "{event.title}"
                    </h3>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <span className="text-[12px] text-gray-500 font-medium">
                          {event.date}, {event.time} {t("scheduleUhr")}
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
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{t("scheduleExpect")}</p>
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
                      {t("scheduleJoinZoom")}
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
