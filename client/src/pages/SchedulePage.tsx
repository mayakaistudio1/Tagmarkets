import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Clock,
  Mic,
} from "lucide-react";
import { useLocation } from "wouter";

interface ScheduleEvent {
  id: string;
  day: string;
  date: string;
  time: string;
  title: string;
  speaker: string;
  type: "trading" | "partner";
  typeBadge: string;
  banner: string;
  highlights: string[];
  link: string;
}

const events: ScheduleEvent[] = [
  {
    id: "lorenz",
    day: "Mittwoch",
    date: "Jeden Mittwoch",
    time: "19:00",
    title: "Dein klarer Einstieg in die Finanzmärkte",
    speaker: "Lorenz Brunner",
    type: "trading",
    typeBadge: "Trading",
    banner: "/webinar-lorenz.png",
    highlights: [
      "Einstieg in die Finanzmärkte — strukturiert und verständlich",
      "Transparenz und Kontrolle über dein Kapital",
      "Praxisnahe Strategien für deinen Start",
    ],
    link: "https://us05web.zoom.us/j/83031264996?pwd=XG7QRgjUPi6qTet3jWybMf9OJu8IQi.1",
  },
  {
    id: "eddy",
    day: "Donnerstag",
    date: "Jeden Donnerstag",
    time: "19:00",
    title: "JetUP Ökosystem: Deine Möglichkeiten im Überblick",
    speaker: "Eddy Kanke",
    type: "partner",
    typeBadge: "Partner",
    banner: "/webinar-eddy.png",
    highlights: [
      "Überblick über das JetUP Ökosystem",
      "Deine Möglichkeiten als Investor",
      "Partnerprogramm & zusätzliche Einkommensmöglichkeiten",
    ],
    link: "https://us02web.zoom.us/j/87966496089?pwd=wn9dtI4JKkSow8shBHE3bNsj2IIImt.1",
  },
];

const SchedulePage: React.FC = () => {
  const [, setLocation] = useLocation();

  const filteredEvents = events;

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
            Wöchentliche Live Zoom Calls mit unseren Experten. Kostenlos und ohne Anmeldung.
          </p>

          <div className="flex gap-2">
            <span className="px-4 py-2.5 rounded-xl text-[12px] font-bold jetup-gradient text-white btn-glow" data-testid="tab-schedule-alle">
              Alle
            </span>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
                data-testid={`event-${event.id}`}
              >
                <img
                  src={event.banner}
                  alt={event.title}
                  className="w-full h-auto object-cover"
                  data-testid={`banner-${event.id}`}
                />

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
                        {event.date}, {event.time} Uhr
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
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Das erwartet dich:</p>
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
                    Zum Zoom Call
                  </a>
                </div>
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
