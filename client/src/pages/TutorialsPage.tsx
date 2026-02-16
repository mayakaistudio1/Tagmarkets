import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Play,
  FileText,
  TrendingUp,
  Users,
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
    description: "Kontoeröffnung, MT5 Installation und erste Einzahlung.",
    type: "trader",
    format: "video",
    duration: "5 Min",
  },
  {
    id: "2",
    title: "Copy-X Strategie auswählen",
    description: "Wie du die passende Strategie findest und aktivierst.",
    type: "trader",
    format: "video",
    duration: "7 Min",
  },
  {
    id: "3",
    title: "Amplify verstehen",
    description: "12x Skalierung einfach erklärt: Ablauf, Regeln, Gewinn.",
    type: "trader",
    format: "guide",
  },
  {
    id: "4",
    title: "Partnerprogramm erklärt",
    description: "Provisionen, Profit-Share und Bonusprogramme im Überblick.",
    type: "partner",
    format: "video",
    duration: "6 Min",
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
    title: "Lifestyle-Rewards erreichen",
    description: "Volumen-Ziele, Rolex, Immobilien und Reise-Belohnungen.",
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
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-tutorials"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[16px] font-bold text-gray-900 flex-1">
          Tutorials & Guides
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Kurzvideos & Schritt-für-Schritt Anleitungen für Trading und Partnerprogramm.
          </p>

          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                  filter === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-500"
                }`}
                data-testid={`tab-tutorials-${tab.key}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white rounded-2xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                data-testid={`tutorial-${tutorial.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tutorial.type === "trader" ? "bg-blue-100" : "bg-emerald-100"
                  }`}>
                    {tutorial.format === "video" ? (
                      <Play size={18} className={tutorial.type === "trader" ? "text-blue-600" : "text-emerald-600"} />
                    ) : (
                      <FileText size={18} className={tutorial.type === "trader" ? "text-blue-600" : "text-emerald-600"} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tutorial.type === "trader"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {tutorial.type === "trader" ? "Trader" : "Partner"}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {tutorial.format === "video" ? `Video${tutorial.duration ? ` · ${tutorial.duration}` : ""}` : "Guide"}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-semibold text-gray-900 leading-tight">
                      {tutorial.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                      {tutorial.description}
                    </p>
                  </div>
                </div>
                <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary text-[12px] font-semibold active:scale-[0.97] transition-transform">
                  {tutorial.format === "video" ? <Play size={14} /> : <FileText size={14} />}
                  Ansehen
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-medium text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub-tutorials"
            >
              <ArrowLeft size={16} />
              Zurück zum Hub
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient text-[13px] font-medium text-white active:scale-[0.97] transition-transform shadow-sm"
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
