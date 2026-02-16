import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Calendar,
  ExternalLink,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";

type FilterTab = "alle" | "trading" | "partner";

interface ScheduleEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: "trading" | "partner";
  typeBadge: string;
  link?: string;
}

const events: ScheduleEvent[] = [
  {
    id: "1",
    date: "Mi, 19. Feb",
    time: "20:00",
    title: "Trading & Amplify Q&A",
    type: "trading",
    typeBadge: "Trading",
    link: "#",
  },
  {
    id: "2",
    date: "Fr, 21. Feb",
    time: "19:00",
    title: "Partner-Call: Einkommen & Plan",
    type: "partner",
    typeBadge: "Partner",
    link: "#",
  },
  {
    id: "3",
    date: "Mo, 24. Feb",
    time: "20:00",
    title: "Copy-X Strategien Live-Review",
    type: "trading",
    typeBadge: "Trading",
    link: "#",
  },
  {
    id: "4",
    date: "Mi, 26. Feb",
    time: "19:00",
    title: "Neue Partner Onboarding",
    type: "partner",
    typeBadge: "Partner",
    link: "#",
  },
  {
    id: "5",
    date: "Fr, 28. Feb",
    time: "20:00",
    title: "TAG Markets: MT5 Tipps & Tricks",
    type: "trading",
    typeBadge: "Trading",
    link: "#",
  },
];

const SchedulePage: React.FC = () => {
  const [, setLocation] = useLocation();

  const getInitialFilter = (): FilterTab => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filter");
    if (f === "trading" || f === "partner") return f;
    return "alle";
  };

  const [filter, setFilter] = useState<FilterTab>(getInitialFilter);

  const filteredEvents = filter === "alle"
    ? events
    : events.filter((e) => e.type === filter);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "alle", label: "Alle" },
    { key: "trading", label: "Trading" },
    { key: "partner", label: "Partner" },
  ];

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
          Webinare & Termine
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            Nächste Live-Calls, Events & Schulungen.
          </p>

          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                  filter === tab.key
                    ? "jetup-gradient text-white btn-glow"
                    : "bg-gray-100 text-gray-500"
                }`}
                data-testid={`tab-schedule-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                data-testid={`event-${event.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                    <Calendar size={17} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        event.type === "trading"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {event.typeBadge}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock size={13} className="text-gray-400" />
                      <span className="text-[12px] text-gray-500 font-medium">
                        {event.date} – {event.time} Uhr
                      </span>
                    </div>
                  </div>
                </div>
                {event.link && (
                  <div className="mt-3 flex gap-2">
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-[12px] font-bold active:scale-[0.97] transition-transform"
                      data-testid={`zoom-link-${event.id}`}
                    >
                      <ExternalLink size={14} />
                      Zum Zoom
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[13px] text-gray-400 font-medium">
                Keine Termine in dieser Kategorie.
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
              Zurück zum Hub
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria-schedule"
            >
              <MessageCircle size={16} />
              Frag Maria
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SchedulePage;
