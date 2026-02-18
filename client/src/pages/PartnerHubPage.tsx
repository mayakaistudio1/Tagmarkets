import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Coins,
  PieChart,
  Infinity,
  Gift,
  FileText,
  ArrowRight,
  Calendar,
  GraduationCap,
  Sparkles,
  BookOpen,
  Users,
  BrainCircuit,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PartnerHubPage: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-partner"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          Partnerprogramm & Einkommen
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            Verdiene am realen Handelsvolumen: Provisionen, Profit‑Share, Infinity Bonus und Global Pools — plus Lifestyle‑Rewards.
          </p>

          <Accordion type="multiple" className="space-y-2.5">
            <AccordionItem
              value="partner-toolkit"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-partner-toolkit"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Dein Partner-Toolkit</span>
                    <span className="text-[12px] text-gray-400 font-medium">Tools, Training und KI‑Power für deinen Erfolg.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-3 pb-2">
                  <div className="flex items-start gap-2.5">
                    <BookOpen className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-bold text-gray-800">Schulung & Wissen:</span>{" "}
                      Zugang zu Webinaren, Tutorials und Trainings — vom Einstieg bis zum Expertenlevel.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-bold text-gray-800">Community & Support:</span>{" "}
                      Aktive Telegram‑Gruppe, persönliche Ansprechpartner und Team‑Calls zum Austausch.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <BrainCircuit className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p>
                      <span className="font-bold text-gray-800">AI-Instrumente:</span>{" "}
                      Als Partner kannst du deinen eigenen personalisierten Digital Hub mit KI‑Beraterin (wie Maria) erhalten — ein smartes Tool für dich, dein Team und deine Kunden.
                    </p>
                  </div>
                  <div className="mt-2 p-3 bg-purple-50 rounded-xl">
                    <p className="text-[12px] text-purple-700 font-semibold leading-relaxed">
                      Genau das, was du hier siehst — diesen Digital Hub — kann jeder JetUP‑Partner für sich und sein Team personalisieren lassen.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="provisionen"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-provisionen"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Provisionen pro Lot</span>
                    <span className="text-[12px] text-gray-400 font-medium">Verdienst pro gehandeltem Lot in deinem Team.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    Du erhältst <span className="font-bold text-gray-800">10,50 USD pro gehandeltem Lot</span> in deinem Team.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Bis zu 10 Ebenen tief</span> — je aktiver dein Team, desto mehr kannst du verdienen.
                  </p>
                  <p>
                    Alle Provisionen basieren auf realem Handelsvolumen — nicht auf Einzahlungen.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="profit-share"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-profit-share"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <PieChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Profit‑Share aus dem Team</span>
                    <span className="text-[12px] text-gray-400 font-medium">Anteil an realen Handelsergebnissen.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    Du erhältst einen <span className="font-bold text-gray-800">Anteil an den realen Handelsergebnissen</span> deines Teams.
                  </p>
                  <p>
                    Gewinnverteilung: <span className="font-bold text-gray-800">70% Kunde</span>, 30% werden auf Trader und die Partnerstruktur verteilt.
                  </p>
                  <p>
                    Auszahlungen basieren auf echten Gewinnen — nicht auf Versprechen.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="infinity-bonus"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-infinity-bonus"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Infinity className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Infinity Bonus</span>
                    <span className="text-[12px] text-gray-400 font-medium">Extra‑Prozente bei wachsendem Teamvolumen.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    Zusätzlicher Bonus‑Prozentsatz, sobald bestimmte Teamvolumen‑Schwellen erreicht werden:
                  </p>
                  <div className="bg-violet-50 rounded-xl p-3.5 space-y-2">
                    <p><span className="font-bold text-gray-800">1%</span> ab 100.000 EUR Volumen</p>
                    <p><span className="font-bold text-gray-800">2%</span> ab 300.000 EUR Volumen</p>
                    <p><span className="font-bold text-gray-800">3%</span> ab 1.000.000 EUR Volumen</p>
                    <p><span className="font-bold text-gray-800">Bis zu +5%</span> bei einem Teamvolumen von 100k bis 20M USD</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="rewards"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-rewards"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Global Pools & Lifestyle-Rewards</span>
                    <span className="text-[12px] text-gray-400 font-medium">Rolex, Immobilien, Reisen und mehr.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-3 pb-2">
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Global Pools:</p>
                    <p>Zwei Pools mit jeweils 1% des Unternehmensgewinns. Auszahlungen alle zwei Wochen.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 mb-1">Lifestyle-Belohnungen:</p>
                    <div className="bg-rose-50 rounded-xl p-3.5 space-y-2">
                      <p>🕐 Rolex‑Uhren ab 500k USD Teamvolumen</p>
                      <p>🏠 Immobilien‑Gutscheine bis 1.200.000 USD</p>
                      <p>✈️ Exklusive Reisen (z. B. Bali, Türkei)</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <a
            href="https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
            data-testid="link-partner-pdf"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <FileText size={19} className="text-red-500" />
            </div>
            <span className="text-[13px] font-semibold text-gray-800 flex-1">
              Partner‑PDF / Präsentation
            </span>
            <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
          </a>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => setLocation("/schedule?filter=partner")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-[12px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="link-partner-call"
            >
              <Calendar size={15} className="text-orange-500" />
              Partner-Calls
            </button>
            <button
              onClick={() => setLocation("/tutorials?filter=partner")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-[12px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="link-partner-tutorials"
            >
              <GraduationCap size={15} className="text-cyan-500" />
              Partner-Tutorials
            </button>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub-partner"
            >
              <ArrowLeft size={16} />
              Zurück zum Hub
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria-partner"
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

export default PartnerHubPage;
