import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Video,
  MessageCircle,
  Megaphone,
  Calendar,
  GraduationCap,
  FolderOpen,
  Send,
  Instagram,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";

const PARTNER = {
  name: "Dennis Schymanietz",
  role: "Founder · Infrastructure Architect",
  micro: "I build scalable ecosystems — not hype.",
  photo: "/dennis-photo.png",
};

interface ChipDef {
  label: string;
  reply: string;
  target?: string;
}

const GUIDE_CHIPS: ChipDef[] = [
  {
    label: "I want passive income",
    reply: "Good. Passive works when capital control is clear. Let me show you the passive path.",
    target: "passive",
  },
  {
    label: "I want to build a structure",
    reply: "Perfect. Scale comes from structure and infrastructure. Let\u2019s look at the partner path.",
    target: "build",
  },
  {
    label: "I need clarity first",
    reply: "Sure. Let\u2019s start with the ecosystem and what makes it different.",
    target: "clarity",
  },
];

const PASSIVE_CHIPS: ChipDef[] = [
  {
    label: "How does safety work?",
    reply: "Safety is built around custody: your funds stay on your broker account, not with JetUP. What do you want to control most \u2014 risk or liquidity?",
  },
  {
    label: "What results are realistic?",
    reply: "A healthy approach is steady, not extreme. Typical expectations are in a realistic range, with no guarantees. Are you looking for smooth growth or higher volatility?",
  },
  {
    label: "How do I start small?",
    reply: "Starting small is fine. The key is a clean setup, then a strategy choice. Do you want to test first, or commit to a longer plan?",
  },
];

const BUILD_CHIPS: ChipDef[] = [
  {
    label: "Show me the marketing plan",
    reply: "Marketing plan is volume-driven: broker lots, exchange fees, and card activity. The question is: are you building one strong leg, or two or three serious leaders?",
  },
  {
    label: "How do bonuses work?",
    reply: "Bonuses depend on structure activity: lots, ranks, pools. I can summarize it quickly, but first \u2014 do you already have a team, or start from zero?",
  },
  {
    label: "What\u2019s the fastest way to build?",
    reply: "Fastest way is clarity plus consistency: pick a path, create daily contact, and let the hub duplicate the basics. Do you want a simple daily routine or a stronger launch sprint?",
  },
  {
    label: "Do I need a team already?",
    reply: "No. A team helps, but infrastructure helps more. If you start alone, you need a clean offer and daily activity. How many conversations can you realistically do per day?",
  },
];

const CLARITY_CHIPS: ChipDef[] = [
  {
    label: "What is JetUP exactly?",
    reply: "JetUP gives access and structure. Your capital stays on your broker account. Do you want to test as a client first, or evaluate partnership directly?",
  },
  {
    label: "What makes it different?",
    reply: "The difference is infrastructure: multiple income layers and built-in AI duplication. What matters most to you \u2014 safety, simplicity, or scale?",
  },
  {
    label: "Can I get the presentation?",
    reply: "You can download the presentation inside the hub. Want the short version first, or do you prefer the full deck?",
  },
];

const PartnerDigitalHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const [bubbleText, setBubbleText] = useState("Tell me what you want today \u2014 I'll guide you.");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 1200);
  }, []);

  const handleChip = useCallback((chip: ChipDef) => {
    setBubbleText(chip.reply);
    if (chip.target) {
      setTimeout(() => scrollToSection(chip.target!), 200);
    }
  }, [scrollToSection]);

  const handleLiveCall = useCallback(() => {
    setBubbleText("If you want, we can go live. Before we do \u2014 are you here for passive income, or to build something scalable?");
  }, []);

  const sectionClass = (id: string) =>
    `pdh-card pdh-section ${highlightId === id ? "pdh-highlight" : ""}`;

  return (
    <div className="h-full flex flex-col overflow-hidden pdh-root">
      <div className="pdh-topline" />
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="pdh-wrap">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pdh-card"
            id="top"
          >
            <div className="flex items-center gap-3.5">
              <div className="pdh-avatar">
                <img
                  src={PARTNER.photo}
                  alt={PARTNER.name}
                  className="w-full h-full object-cover object-top"
                  data-testid="img-partner-photo"
                />
                <div className="pdh-online">
                  <span className="pdh-dot" />
                  Online
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="pdh-h1" data-testid="text-partner-name">{PARTNER.name}</h1>
                <p className="pdh-sub" data-testid="text-partner-role">{PARTNER.role}</p>
                <p className="pdh-micro">{PARTNER.micro}</p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-3.5">
              <button
                className="pdh-btn pdh-btn-primary flex-1"
                onClick={handleLiveCall}
                data-testid="btn-live-call"
              >
                <Video size={15} className="inline mr-1.5 -mt-0.5" />
                Enter Strategy Call
              </button>
              <button
                className="pdh-btn flex-1"
                onClick={() => scrollToSection("guide")}
                data-testid="btn-start-here"
              >
                <MessageCircle size={15} className="inline mr-1.5 -mt-0.5" />
                Start Here
              </button>
            </div>

            <div className="pdh-chat" id="guide">
              <div className="pdh-chat-label">Guided entry</div>
              <div className="pdh-bubble" data-testid="text-bubble">
                {bubbleText}
              </div>
              <div className="pdh-chips">
                {GUIDE_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    className="pdh-chip"
                    onClick={() => handleChip(chip)}
                    data-testid={`chip-guide-${i}`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="pdh-card"
          >
            <h2 className="pdh-sec-title">Choose your path</h2>
            <p className="pdh-sec-text">You can explore on your own, or let the guide navigate you to the right section.</p>
            <div className="pdh-grid mt-3">
              {[
                { id: "passive", title: "Passive exposure", desc: "Start as a client, choose a strategy, keep control of your capital.", reply: "Passive path: control first, then performance." },
                { id: "build", title: "Build income", desc: "Multiple income layers across broker, exchange, and card infrastructure.", reply: "Partner path: income scale comes from structure and activity." },
                { id: "clarity", title: "Clarity first", desc: "Quick overview of how JetUP is structured and why it is different.", reply: "Clarity first: ecosystem, trust model, and what\u2019s different." },
              ].map((path) => (
                <button
                  key={path.id}
                  className="pdh-path"
                  onClick={() => handleChip({ label: path.title, reply: path.reply, target: path.id })}
                  data-testid={`path-${path.id}`}
                >
                  <b className="font-[Montserrat] text-[14px]">{path.title}</b>
                  <small className="block mt-1.5 text-[13px] leading-snug opacity-70">{path.desc}</small>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={sectionClass("ecosystem")}
            id="ecosystem"
          >
            <h2 className="pdh-sec-title">JetUP ecosystem</h2>
            <p className="pdh-sec-text">One community. Multiple income engines — built on infrastructure, not hype cycles.</p>
            <div className="pdh-orb mt-3">
              <div className="pdh-ring" />
              <div className="pdh-center">JetUP</div>
              <div className="pdh-sat" style={{ left: 14, top: 38 }}>TagMarkets · Broker</div>
              <div className="pdh-sat" style={{ right: 14, top: 62 }}>BitOne · Exchange</div>
              <div className="pdh-sat" style={{ left: 22, bottom: 34 }}>BIXFi · Card & IBAN</div>
              <div className="pdh-sat" style={{ right: 18, bottom: 26 }}>AI · Duplication</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={sectionClass("passive")}
            id="passive"
          >
            <h2 className="pdh-sec-title">Passive path</h2>
            <p className="pdh-sec-text">
              Capital stays on your personal broker account. No frozen deposits. You choose a strategy and control withdrawals. Realistic expectations matter. If you want, ask Dennis for the best starting approach.
            </p>
            <div className="pdh-chips mt-3">
              {PASSIVE_CHIPS.map((chip, i) => (
                <button key={i} className="pdh-chip" onClick={() => handleChip(chip)} data-testid={`chip-passive-${i}`}>
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5 mt-3.5">
              <button className="pdh-btn pdh-btn-primary flex-1" onClick={() => setLocation("/trading")} data-testid="btn-start-client">
                Start as Client
              </button>
              <button className="pdh-btn flex-1" onClick={() => scrollToSection("guide")} data-testid="btn-ask-dennis-passive">
                Ask Dennis (text)
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={sectionClass("build")}
            id="build"
          >
            <h2 className="pdh-sec-title">Build path</h2>
            <p className="pdh-sec-text">
              If you want scale, you need infrastructure. JetUP combines broker volume, exchange fee sharing, and card activity — plus an AI-powered partner hub that helps you duplicate without chaos.
            </p>
            <div className="pdh-card-inner mt-3">
              <p className="pdh-sec-text">
                <b className="text-[rgba(245,243,255,0.92)]">Partner facts:</b> broker lot commission is ten dollars fifty cents, up to ten levels. Exchange layer can redistribute up to sixty percent of trading fees via ranks. Pools and Infinity bonuses exist to reward structure volume.
              </p>
            </div>
            <div className="pdh-chips mt-3">
              {BUILD_CHIPS.map((chip, i) => (
                <button key={i} className="pdh-chip" onClick={() => handleChip(chip)} data-testid={`chip-build-${i}`}>
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5 mt-3.5">
              <button className="pdh-btn pdh-btn-primary flex-1" onClick={() => setLocation("/partner")} data-testid="btn-start-partner">
                Start as Partner
              </button>
              <button className="pdh-btn flex-1" onClick={() => setLocation("/schedule")} data-testid="btn-join-webinar">
                Join Webinar
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={sectionClass("clarity")}
            id="clarity"
          >
            <h2 className="pdh-sec-title">Clarity first</h2>
            <p className="pdh-sec-text">
              JetUP is access to infrastructure. Broker custody stays with you. The ecosystem expands across broker, exchange, and card layers, so you can build one community with multiple income engines.
            </p>
            <div className="pdh-chips mt-3">
              {CLARITY_CHIPS.map((chip, i) => (
                <button key={i} className="pdh-chip" onClick={() => handleChip(chip)} data-testid={`chip-clarity-${i}`}>
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5 mt-3.5">
              <a
                href="https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="pdh-btn pdh-btn-primary flex-1 text-center"
                data-testid="btn-open-presentation"
              >
                Open Presentation
              </a>
              <button className="pdh-btn flex-1" onClick={() => setLocation("/schedule")} data-testid="btn-webinars-clarity">
                Webinars & Schedule
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pdh-card"
            id="tools"
          >
            <h2 className="pdh-sec-title">Tools</h2>
            <p className="pdh-sec-text">Secondary resources for when you want deeper detail.</p>
            <div className="pdh-grid mt-3">
              <button className="pdh-path" onClick={() => setLocation("/promo")} data-testid="tool-promotions">
                <div className="flex items-center gap-2.5">
                  <Megaphone size={16} className="text-purple-400 flex-shrink-0" />
                  <b className="font-[Montserrat] text-[14px]">Promotions</b>
                </div>
                <small className="block mt-1.5 text-[13px] leading-snug opacity-70">Current incentives and updates.</small>
              </button>
              <button className="pdh-path" onClick={() => setLocation("/schedule")} data-testid="tool-webinars">
                <div className="flex items-center gap-2.5">
                  <Calendar size={16} className="text-orange-400 flex-shrink-0" />
                  <b className="font-[Montserrat] text-[14px]">Webinars & Schedule</b>
                </div>
                <small className="block mt-1.5 text-[13px] leading-snug opacity-70">Live onboarding and product walkthroughs.</small>
              </button>
              <button className="pdh-path" onClick={() => setLocation("/tutorials")} data-testid="tool-tutorials">
                <div className="flex items-center gap-2.5">
                  <GraduationCap size={16} className="text-cyan-400 flex-shrink-0" />
                  <b className="font-[Montserrat] text-[14px]">Tutorials & Guides</b>
                </div>
                <small className="block mt-1.5 text-[13px] leading-snug opacity-70">Step-by-step education and basics.</small>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="pdh-card"
          >
            <h2 className="pdh-sec-title">Materials</h2>
            <p className="pdh-sec-text">Presentations and community links.</p>
            <div className="pdh-grid mt-3">
              <a
                href="https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="pdh-path"
                data-testid="material-presentations"
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen size={16} className="text-yellow-400 flex-shrink-0" />
                  <b className="font-[Montserrat] text-[14px]">Presentations</b>
                </div>
                <small className="block mt-1.5 text-[13px] leading-snug opacity-70">Download directly inside the hub.</small>
              </a>
              <a
                href="https://t.me/JetUpDach"
                target="_blank"
                rel="noopener noreferrer"
                className="pdh-path"
                data-testid="material-telegram"
              >
                <div className="flex items-center gap-2.5">
                  <Send size={16} className="text-blue-400 flex-shrink-0" />
                  <b className="font-[Montserrat] text-[14px]">Telegram</b>
                </div>
                <small className="block mt-1.5 text-[13px] leading-snug opacity-70">Community updates.</small>
              </a>
              <a
                href="https://www.instagram.com/jetup.official"
                target="_blank"
                rel="noopener noreferrer"
                className="pdh-path"
                data-testid="material-instagram"
              >
                <div className="flex items-center gap-2.5">
                  <Instagram size={16} className="text-pink-400 flex-shrink-0" />
                  <b className="font-[Montserrat] text-[14px]">Instagram</b>
                </div>
                <small className="block mt-1.5 text-[13px] leading-snug opacity-70">Short content & lifestyle.</small>
              </a>
            </div>
          </motion.div>

          <div className="text-center opacity-50 text-[12px] pt-2 pb-6">
            Powered by JetUP
          </div>

        </div>
      </div>
    </div>
  );
};

export default PartnerDigitalHub;
