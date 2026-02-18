import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Play,
  FileText,
} from "lucide-react";
import { useLocation } from "wouter";

type FilterTab = "alle" | "trader" | "partner";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: "trader" | "partner";
  format: "video" | "guide";
  duration?: string;
}

const tutorials: Tutorial[] = [
  {
    id: "1",
    title: "Erste Schritte mit TAG Markets",
    description: "Konto eröffnen, MT5 installieren und erste Einzahlung durchführen.",
    type: "trader",
    format: "video",
    duration: "5 Min.",
  },
  {
    id: "2",
    title: "Copy‑X‑Strategie auswählen",
    description: "So findest du die passende Strategie und aktivierst sie.",
    type: "trader",
    format: "video",
    duration: "7 Min.",
  },
  {
    id: "3",
    title: "Amplify verstehen",
    description: "12x‑Skalierung einfach erklärt: Ablauf, Regeln, Gewinn.",
    type: "trader",
    format: "guide",
  },
  {
    id: "4",
    title: "Partnerprogramm erklärt",
    description: "Provisionen, Profit‑Share und Bonusprogramme im Überblick.",
    type: "partner",
    format: "video",
    duration: "6 Min.",
  },
  {
    id: "5",
    title: "Deinen Link richtig teilen",
    description: "Best Practices für Social Media, Telegram und persönliche Empfehlungen.",
    type: "partner",
    format: "guide",
  },
  {
    id: "6",
    title: "Lifestyle‑Rewards erreichen",
    description: "Volumenziele, Rolex, Immobilien und Reise‑Belohnungen.",
    type: "partner",
    format: "guide",
  },
];

const TutorialsPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const getInitialFilter = (): FilterTab => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get("filter");
    if (f === "trader" || f === "partner") return f;
    return "alle";
  };

  const [filter, setFilter] = useState<FilterTab>(getInitialFilter);

  const filteredTutorials = filter === "alle"
    ? tutorials
    : tutorials.filter((t) => t.type === filter);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "alle", label: "Alle" },
    { key: "trader", label: "Für Trader" },
    { key: "partner", label: "Für Partner" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-tutorials"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          Tutorials & Guides
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            Kurzvideos und Schritt‑für‑Schritt‑Anleitungen für Trading und Partnerprogramm.
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
                data-testid={`tab-tutorials-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                data-testid={`tutorial-${tutorial.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tutorial.type === "trader" ? "bg-blue-100" : "bg-emerald-100"
                  }`}>
                    {tutorial.format === "video" ? (
                      <Play size={19} className={tutorial.type === "trader" ? "text-blue-600" : "text-emerald-600"} />
                    ) : (
                      <FileText size={19} className={tutorial.type === "trader" ? "text-blue-600" : "text-emerald-600"} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        tutorial.type === "trader"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {tutorial.type === "trader" ? "Trader" : "Partner"}
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {tutorial.format === "video" ? `Video${tutorial.duration ? ` · ${tutorial.duration}` : ""}` : "Guide"}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-900 leading-tight">
                      {tutorial.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-1 leading-snug font-medium">
                      {tutorial.description}
                    </p>
                  </div>
                </div>
                <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-[12px] font-bold cursor-not-allowed" disabled data-testid={`button-view-${tutorial.id}`}>
                  Coming soon
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub-tutorials"
            >
              <ArrowLeft size={16} />
              Zurück zum Hub
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria-tutorials"
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

export default TutorialsPage;
