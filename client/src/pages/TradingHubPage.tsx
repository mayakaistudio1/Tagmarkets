import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Shield,
  Bot,
  Zap,
  Rocket,
  ListOrdered,
  HelpCircle,
  ArrowRight,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TradingHubPage: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-trading"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          Trading & Strategien
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            Dein Trading‑Bereich: Broker, Copy‑Trading (Copy‑X) und Amplify 12x — alles an einem Ort.
          </p>

          <Accordion type="multiple" className="space-y-2.5">
            <AccordionItem
              value="tag-markets"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-tag-markets"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Broker: TAG Markets</span>
                    <span className="text-[12px] text-gray-400 font-medium">Regulierte Multi‑Asset‑Plattform mit MT5.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    <span className="font-bold text-gray-800">Regulierung:</span>{" "}
                    Lizenziert durch die FSC Mauritius (Lizenz GB21026474).
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Handelsbedingungen:</span>{" "}
                    Hebel bis 1:500. Über 400 Instrumente.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Auszahlung:</span>{" "}
                    Im Durchschnitt innerhalb von 24 Stunden.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Umfang:</span>{" "}
                    Über 500.000 Trader weltweit, monatliches Handelsvolumen über 200 Mrd. USD.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Sicherheit:</span>{" "}
                    Schutz von Daten und Kundengeldern nach Bankstandards. Dein Geld bleibt auf deinem eigenen Konto.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="copy-x"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-copy-x"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-fuchsia-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Copy-X Strategien</span>
                    <span className="text-[12px] text-gray-400 font-medium">Automatisches Copy‑Trading für potenziell passives Einkommen.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    Professionelle Strategien automatisch kopieren. Du behältst
                    <span className="font-bold text-gray-800"> 70% des Gewinns</span>.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Volle Statistik:</span>{" "}
                    Transparente Performance‑Daten für jede Strategie.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Kontrolle:</span>{" "}
                    Jederzeit pausierbar. Dein Geld bleibt auf deinem Konto.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Risikomanagement:</span>{" "}
                    Konservativer Ansatz: max. 10% Drawdown und 0,3% Risiko pro Trade.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="vortex"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-vortex"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Vortex Strategy</span>
                    <span className="text-[12px] text-purple-500 font-semibold">Coming soon · exklusiv für die JetUP Community</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p className="text-purple-600 font-semibold">
                    Coming soon — exklusiv für die JetUP Community.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="amplify"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-amplify"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Amplify 12x</span>
                    <span className="text-[12px] text-gray-400 font-medium">Skaliere dein Eigenkapital um bis zu das 12‑Fache.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    Amplify erhöht dein Handelslimit beim Broker — sofern du die Risikomanagement‑Regeln einhältst.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">12x Skalierung:</span>{" "}
                    Mit 1.000 USD eigenem Kapital erhältst du 12.000 USD Handelskapital.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Echte Liquidität:</span>{" "}
                    Kein Prop-Firm-Modell — du handelst am realen Markt.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">100% Gewinn:</span>{" "}
                    Dein gesamter Gewinn gehört dir und ist jederzeit auszahlbar.
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">Kein Kredit:</span>{" "}
                    Kein Bonus, keine Drittparteien — volle Kontrolle.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="schnellstart"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-schnellstart"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <ListOrdered className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">Schnellstart in 5 Schritten</span>
                    <span className="text-[12px] text-gray-400 font-medium">Von der Registrierung bis zum ersten Trade.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p><span className="font-bold text-gray-800">1. Registrierung:</span> Erstelle ein Konto im JetUP IB‑Portal.</p>
                  <p><span className="font-bold text-gray-800">2. Verbindung:</span> Registriere dich beim Partner-Broker TAG Markets.</p>
                  <p><span className="font-bold text-gray-800">3. Installation:</span> Lade MetaTrader 5 herunter und installiere die App.</p>
                  <p><span className="font-bold text-gray-800">4. Einzahlung:</span> Lade dein Handelskonto beim Broker auf (mind. 100 USD).</p>
                  <p><span className="font-bold text-gray-800">5. Zugang:</span> Erhalte Zugang zu Copy-X, Signalen und Schulungen.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="faq"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-faq-trading"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">FAQ zu Trading & TAG Markets</span>
                    <span className="text-[12px] text-gray-400 font-medium">Häufige Fragen auf einen Blick.</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-3 pb-2">
                  <div>
                    <p className="font-bold text-gray-800">Ist mein Geld sicher?</p>
                    <p>Ja. Dein Geld liegt auf deinem eigenen Konto bei TAG Markets. Nur du hast Zugriff. Jederzeit auszahlbar.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Wie viel muss ich investieren?</p>
                    <p>Mindestens 100 USD als Kunde, 250 USD, wenn du zusätzlich Partner werden möchtest.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Wie hoch ist das Risiko?</p>
                    <p>Konservativer Ansatz: max. 0,3% pro Trade und max. 10% Drawdown. Keine Garantien — aber klar definierte Regeln.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Wie viel kann ich verdienen?</p>
                    <p>Bei Copy‑X‑Strategien werden oft 2–5% pro Monat angestrebt. Ergebnisse variieren; keine Garantien.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => setLocation("/schedule?filter=trading")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-[12px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="link-trading-call"
            >
              <Calendar size={15} className="text-orange-500" />
              Trading‑Calls
            </button>
            <button
              onClick={() => setLocation("/tutorials?filter=trader")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-[12px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="link-trading-tutorials"
            >
              <GraduationCap size={15} className="text-cyan-500" />
              Tutorials
            </button>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub"
            >
              <ArrowLeft size={16} />
              Zurück zum Hub
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria"
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

export default TradingHubPage;
