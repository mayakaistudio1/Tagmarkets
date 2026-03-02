import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Mic,
  FileText,
  Send,
  Instagram,
  Calendar,
  GraduationCap,
  Phone,
  ChevronDown,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

const PARTNER = {
  name: "Dennis Schymanietz",
  role: "Founder · Infrastructure Architect",
  tagline: "Ich zeige dir, wie JetUP wirklich funktioniert — klar, transparent und skalierbar.",
  photo: "/dennis-photo.png",
};

type SheetType = "passive" | "build" | "clarity" | "resources" | "avatar" | null;

const PartnerDigitalHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

  const closeSheet = () => setActiveSheet(null);

  return (
    <div className="pdh-root">
      <div className="pdh-topline" />
      <div className="pdh-wrap">

        <div className="pdh-hero">
          <div className="pdh-photo-wrap">
            <img
              src={PARTNER.photo}
              alt={PARTNER.name}
              className="pdh-photo"
              data-testid="img-partner-photo"
            />
            <div className="pdh-live-ring" />
            <div className="pdh-online-badge">
              <span className="pdh-dot" />
              Online
            </div>
          </div>

          <h1 className="pdh-name" data-testid="text-partner-name">{PARTNER.name}</h1>
          <p className="pdh-role" data-testid="text-partner-role">{PARTNER.role}</p>
          <p className="pdh-tagline">{PARTNER.tagline}</p>

          <div className="pdh-cta-row">
            <button
              className="pdh-btn-main"
              onClick={() => setActiveSheet("avatar")}
              data-testid="btn-avatar-call"
            >
              <Video size={18} />
              Mit meinem KI-Avatar sprechen
            </button>
            <a
              href="https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="pdh-btn-sec"
              data-testid="btn-presentation"
            >
              <FileText size={16} />
              Kurz-Pr&#228;sentation ansehen
            </a>
          </div>
        </div>

        <div className="pdh-guide">
          <p className="pdh-guide-q">Wof&#252;r bist du heute hier?</p>
          <div className="pdh-chips">
            <button className="pdh-chip" onClick={() => setActiveSheet("passive")} data-testid="chip-passive">
              <span className="pdh-chip-icon">&#128176;</span> Passives Einkommen
            </button>
            <button className="pdh-chip" onClick={() => setActiveSheet("build")} data-testid="chip-build">
              <span className="pdh-chip-icon">&#128640;</span> Struktur aufbauen
            </button>
            <button className="pdh-chip" onClick={() => setActiveSheet("clarity")} data-testid="chip-clarity">
              <span className="pdh-chip-icon">&#129300;</span> Erst verstehen
            </button>
          </div>
        </div>

        <div className="pdh-webinar-card" data-testid="card-webinar">
          <div className="pdh-webinar-badge">
            <span className="pdh-live-dot" />
            N&#228;chstes Live-Webinar
          </div>
          <p className="pdh-webinar-title">Dein klarer Einstieg in JetUP</p>
          <p className="pdh-webinar-time">Mittwoch · 19:30 Uhr</p>
          <button
            className="pdh-btn-main pdh-btn-sm"
            onClick={() => setLocation("/schedule")}
            data-testid="btn-webinar-join"
          >
            Jetzt teilnehmen
          </button>
        </div>

        <button
          className="pdh-resources-btn"
          onClick={() => setActiveSheet("resources")}
          data-testid="btn-resources"
        >
          Mehr Ressourcen
          <ChevronDown size={16} />
        </button>

        <div className="pdh-footer">Powered by JetUP</div>
      </div>

      <AnimatePresence>
        {activeSheet && (
          <motion.div
            className="pdh-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSheet}
          >
            <motion.div
              className="pdh-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pdh-sheet-handle" />
              <button className="pdh-sheet-close" onClick={closeSheet} data-testid="btn-close-sheet">
                <X size={18} />
              </button>

              {activeSheet === "passive" && (
                <div className="pdh-sheet-content">
                  <h2 className="pdh-sheet-title">Dein Kapital bleibt auf deinem Broker-Konto.</h2>
                  <p className="pdh-sheet-text">
                    Keine Einfrierungen. Du beh&#228;ltst Kontrolle.<br />
                    Realistische Strategien statt Hype.
                  </p>
                  <div className="pdh-sheet-btns">
                    <button className="pdh-btn-main" onClick={() => { closeSheet(); setLocation("/trading"); }} data-testid="btn-start-client">
                      Als Kunde starten
                    </button>
                    <button className="pdh-btn-sec" onClick={() => { closeSheet(); setActiveSheet("avatar"); }} data-testid="btn-ask-dennis">
                      Frage an Dennis stellen
                    </button>
                  </div>
                </div>
              )}

              {activeSheet === "build" && (
                <div className="pdh-sheet-content">
                  <h2 className="pdh-sheet-title">Mehrere Einkommensquellen. Eine Infrastruktur.</h2>
                  <p className="pdh-sheet-text">
                    Broker + Exchange + Card Layer.<br />
                    Mit KI-Duplikation f&#252;r dein Team.
                  </p>
                  <div className="pdh-sheet-btns">
                    <button className="pdh-btn-main" onClick={() => { closeSheet(); setLocation("/partner"); }} data-testid="btn-become-partner">
                      Partner werden
                    </button>
                    <a
                      href="https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdh-btn-sec"
                      data-testid="btn-marketing-plan"
                    >
                      Marketingplan ansehen
                    </a>
                  </div>
                </div>
              )}

              {activeSheet === "clarity" && (
                <div className="pdh-sheet-content">
                  <h2 className="pdh-sheet-title">Kurz erkl&#228;rt: Was ist JetUP?</h2>
                  <p className="pdh-sheet-text">
                    Ein Infrastruktur-Modell mit mehreren Einkommens-Layern.<br />
                    Keine Blackbox. Klare Struktur.
                  </p>
                  <div className="pdh-sheet-btns">
                    <a
                      href="https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdh-btn-main"
                      data-testid="btn-overview"
                    >
                      5-Minuten &#220;bersicht
                    </a>
                    <button className="pdh-btn-sec" onClick={() => { closeSheet(); setLocation("/schedule"); }} data-testid="btn-webinar-sheet">
                      Webinar ansehen
                    </button>
                  </div>
                </div>
              )}

              {activeSheet === "resources" && (
                <div className="pdh-sheet-content">
                  <h2 className="pdh-sheet-title">Ressourcen</h2>
                  <div className="pdh-resource-list">
                    <a
                      href="https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdh-resource-item"
                      data-testid="res-presentation"
                    >
                      <FileText size={18} />
                      <span>Pr&#228;sentation</span>
                    </a>
                    <a
                      href="https://t.me/JetUpDach"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdh-resource-item"
                      data-testid="res-telegram"
                    >
                      <Send size={18} />
                      <span>Telegram Community</span>
                    </a>
                    <button
                      className="pdh-resource-item"
                      onClick={() => { closeSheet(); setLocation("/schedule"); }}
                      data-testid="res-webinars"
                    >
                      <Calendar size={18} />
                      <span>Webinar &#220;bersicht</span>
                    </button>
                    <button
                      className="pdh-resource-item"
                      onClick={() => { closeSheet(); setLocation("/tutorials"); }}
                      data-testid="res-tutorials"
                    >
                      <GraduationCap size={18} />
                      <span>Tutorials</span>
                    </button>
                    <a
                      href="https://www.instagram.com/jetup.official"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdh-resource-item"
                      data-testid="res-instagram"
                    >
                      <Instagram size={18} />
                      <span>Instagram</span>
                    </a>
                    <a
                      href="https://t.me/dennis_jetup"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdh-resource-item"
                      data-testid="res-support"
                    >
                      <Phone size={18} />
                      <span>Support</span>
                    </a>
                  </div>
                </div>
              )}

              {activeSheet === "avatar" && (
                <div className="pdh-sheet-content pdh-avatar-sheet">
                  <h2 className="pdh-sheet-title">Sprich direkt mit Dennis</h2>
                  <p className="pdh-sheet-text">
                    Stelle jede Frage zu Marketing, Boni oder Einstieg.<br />
                    Sofortige Antwort — auf Deutsch, Russisch oder Englisch.
                  </p>
                  <div className="pdh-avatar-frame">
                    <img
                      src={PARTNER.photo}
                      alt={PARTNER.name}
                      className="pdh-avatar-img"
                    />
                    <div className="pdh-avatar-glow" />
                  </div>
                  <button className="pdh-btn-main pdh-btn-talk" data-testid="btn-start-conversation">
                    <Mic size={18} />
                    Gespr&#228;ch starten
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerDigitalHub;
