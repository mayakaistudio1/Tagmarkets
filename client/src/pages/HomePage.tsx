import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  UserPlus,
  Download,
  Info,
  ListOrdered,
  TrendingUp,
  Shield,
  Wrench,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language, setLanguage } = useLanguage();

  const languages: Language[] = ["ru", "en", "de"];
  const cycleLanguage = () => {
    const idx = languages.indexOf(language);
    setLanguage(languages[(idx + 1) % languages.length]);
  };

  const goToMaria = () => {
    setLocation("/maria");
  };

  const sections = [
    {
      id: "about",
      icon: Info,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      title: "Über JetUP",
      content: (
        <div className="text-[13px] text-gray-600 leading-relaxed space-y-3">
          <p>
            JetUP ist ein modernes Ökosystem, das verifizierte Anbieter, Tools
            und Dienstleistungen in einer strukturierten und transparenten
            Umgebung vereint. Die Plattform ersetzt das Markteingangschaos durch
            einen einzigen Zugangspunkt mit ganzheitlicher Unterstützung.
          </p>
          <div className="space-y-1.5">
            <p>
              <span className="font-semibold text-gray-800">Struktur:</span>{" "}
              Klare Handlungsalgorithmen für Marktteilnehmer.
            </p>
            <p>
              <span className="font-semibold text-gray-800">Transparenz:</span>{" "}
              Verständliche Arbeits- und Gewinnverteilungsbedingungen.
            </p>
            <p>
              <span className="font-semibold text-gray-800">Kontrolle:</span>{" "}
              Instrumentenauswahl und Kapitalmanagement liegen immer beim Kunden.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "steps",
      icon: ListOrdered,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "5 Schritte zum Start",
      content: (
        <div className="text-[13px] text-gray-600 leading-relaxed space-y-2">
          <p>
            <span className="font-semibold text-gray-800">1. Registrierung:</span>{" "}
            Erstellen Sie ein Konto auf dem JetUP IB Portal.
          </p>
          <p>
            <span className="font-semibold text-gray-800">2. Verbindung:</span>{" "}
            Registrieren Sie sich beim Partner-Broker TAG Markets.
          </p>
          <p>
            <span className="font-semibold text-gray-800">3. Installation:</span>{" "}
            Laden Sie MetaTrader 5 herunter und installieren Sie es.
          </p>
          <p>
            <span className="font-semibold text-gray-800">4. Einzahlung:</span>{" "}
            Füllen Sie Ihr Handelskonto beim Broker auf.
          </p>
          <p>
            <span className="font-semibold text-gray-800">5. Zugang:</span>{" "}
            Erhalten Sie Zugang zu Ökosystem-Tools (Signale, Copy-Trading,
            Schulung).
          </p>
        </div>
      ),
    },
    {
      id: "amplify",
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: "Amplify — Finanzierte Konten",
      content: (
        <div className="text-[13px] text-gray-600 leading-relaxed space-y-3">
          <p>
            Amplify ist die Möglichkeit, Ihr Handelslimit zu erhöhen,
            bereitgestellt vom Broker bei Einhaltung der
            Risikomanagement-Regeln.
          </p>
          <div className="space-y-1.5">
            <p>
              <span className="font-semibold text-gray-800">
                12x Skalierung:
              </span>{" "}
              Mit eigenen 1.000 $ erhalten Sie ein Handelskapital von 12.000 $.
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Echte Liquidität:
              </span>{" "}
              Im Gegensatz zu typischen Prop-Firmen verbindet Amplify Sie mit
              dem realen Markt.
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                Gewinnentnahme:
              </span>{" "}
              100% Ihres Gewinns gehören Ihnen, jederzeit auszahlbar.
            </p>
            <p>
              <span className="font-semibold text-gray-800">Sicherheit:</span>{" "}
              Kein Kredit, kein Bonus. Kapitalverwaltung durch Dritte ist
              ausgeschlossen.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "tag-markets",
      icon: Shield,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "TAG Markets — Broker",
      content: (
        <div className="text-[13px] text-gray-600 leading-relaxed space-y-1.5">
          <p>
            <span className="font-semibold text-gray-800">Regulierung:</span>{" "}
            Lizenziert durch FSC Mauritius (Lizenz GB21026474).
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              Handelsbedingungen:
            </span>{" "}
            Maximaler Hebel 1:500.
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              Auszahlungsgeschwindigkeit:
            </span>{" "}
            Durchschnittliche Auszahlung in 24 Stunden.
          </p>
          <p>
            <span className="font-semibold text-gray-800">Umfang:</span> Über
            500.000 Trader weltweit, monatliches Handelsvolumen über 200 Mrd. $.
          </p>
          <p>
            <span className="font-semibold text-gray-800">Sicherheit:</span>{" "}
            Schutz von Daten und Mitteln nach Bankstandards.
          </p>
        </div>
      ),
    },
    {
      id: "tools",
      icon: Wrench,
      iconBg: "bg-fuchsia-100",
      iconColor: "text-fuchsia-600",
      title: "Ökosystem-Tools",
      content: (
        <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5">
          <p>
            <span className="font-semibold text-gray-800">
              Copy-X (Copy-Trading):
            </span>{" "}
            Automatisches Kopieren professioneller Strategien. Der Kunde behält
            70% des Gewinns, mit voller Statistik und jederzeitiger
            Abschaltmöglichkeit.
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              Handelssignale:
            </span>{" "}
            In Echtzeit mit präzisen Einstiegspunkten, Stop Loss/Take Profit und
            technischer Analyse.
          </p>
          <p>
            <span className="font-semibold text-gray-800">
              JetUP Akademie:
            </span>{" "}
            "Smart Start"-Programm für Trading-Grundlagen, Risikomanagement und
            Systemdenken.
          </p>
          <p>
            <span className="font-semibold text-gray-800">Dienste:</span>{" "}
            BIX.FI Debitkarten (Krypto-Fiat-Konvertierung) und Kryptobörse
            BIT1.COM.
          </p>
        </div>
      ),
    },
    {
      id: "partner",
      icon: Users,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      title: "Partnerprogramm & Belohnungen",
      content: (
        <div className="text-[13px] text-gray-600 leading-relaxed space-y-3">
          <div>
            <p className="font-semibold text-gray-800 mb-1.5">
              Einkommensquellen:
            </p>
            <div className="space-y-1.5">
              <p>
                <span className="font-semibold text-gray-800">
                  Provisionen:
                </span>{" "}
                Pro gehandeltem Lot (bis zu 10 Ebenen tief).
              </p>
              <p>
                <span className="font-semibold text-gray-800">
                  Profit Share:
                </span>{" "}
                Anteil an den realen Handelsergebnissen des Teams.
              </p>
              <p>
                <span className="font-semibold text-gray-800">
                  Infinity Bonus:
                </span>{" "}
                Zusätzlicher Prozentsatz (bis +5%) bei Erreichen des
                Teamvolumens (100k–20M $).
              </p>
              <p>
                <span className="font-semibold text-gray-800">
                  Global Pools:
                </span>{" "}
                Teilnahme an der Gewinnverteilung des gesamten Unternehmens.
              </p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1.5">
              Lifestyle-Belohnungen:
            </p>
            <div className="space-y-1.5">
              <p>Rolex-Uhren (ab einem Volumen von 500k $).</p>
              <p>Immobiliengutscheine im Wert von 1.200.000 $.</p>
              <p>Exklusive Reisen (Bali, Türkei).</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex justify-end px-4 pt-3 pb-2 flex-shrink-0">
        <button
          onClick={cycleLanguage}
          className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          data-testid="language-toggle"
        >
          <span
            className={
              language === "ru" ? "font-bold text-primary" : "text-gray-400"
            }
          >
            RU
          </span>
          <span className="text-gray-200">|</span>
          <span
            className={
              language === "en" ? "font-bold text-primary" : "text-gray-400"
            }
          >
            EN
          </span>
          <span className="text-gray-200">|</span>
          <span
            className={
              language === "de" ? "font-bold text-primary" : "text-gray-400"
            }
          >
            DE
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center pt-2 pb-1"
        >
          <img
            src="/jetup-logo.png"
            alt="JetUP"
            className="w-16 h-16 object-contain mb-2"
            data-testid="img-logo"
          />
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary/50">
            Struktur. Transparenz. Kontrolle.
          </p>
          <p className="text-[13px] font-medium text-gray-500 mt-1 leading-snug">
            Dein klarer Einstieg in die Finanzmärkte
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={goToMaria}
            className="w-full bg-white rounded-2xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center gap-3.5 active:scale-[0.98] transition-transform text-left"
            data-testid="cta-ask-maria"
          >
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <div className="absolute -left-0.5 bottom-0 flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-semibold text-gray-600">
                  online
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-gray-900">
                Live-Beraterin
              </h3>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Tippen Sie, um zu sprechen
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <ArrowRight size={20} className="text-white" />
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="multiple" className="space-y-2.5">
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border-none bg-white rounded-2xl px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                data-testid={`accordion-${section.id}`}
              >
                <AccordionTrigger
                  className="hover:no-underline py-3.5"
                  data-testid={`accordion-trigger-${section.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl ${section.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <section.icon
                        className={`w-4 h-4 ${section.iconColor}`}
                      />
                    </div>
                    <span className="text-[14px] font-semibold text-gray-900">
                      {section.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>{section.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-2.5"
        >
          <a
            href="https://jetup.ibportal.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.97] transition-transform"
            data-testid="link-register"
          >
            <div className="w-10 h-10 rounded-xl jetup-gradient flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-gray-900">
              Registrierung
            </span>
          </a>
          <a
            href="/jetup-presentation-de.pdf"
            download
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.97] transition-transform"
            data-testid="link-pdf-download"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <span className="text-[13px] font-semibold text-gray-900">
              PDF herunterladen
            </span>
          </a>
        </motion.div>

        <div className="text-center py-4">
          <span className="text-[11px] text-gray-400 font-medium">@jetup</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
