import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, ChevronRight, X } from "lucide-react";

interface TextOverlay {
  text: string;
  startTime: number;
  endTime: number;
}

interface SubBlock {
  title: string;
  icon?: string;
  content: string;
}

interface SceneConfig {
  id: string;
  label: string;
  part: "intro" | "presentation";
  texts: TextOverlay[];
  duration: number;
  overlayStyle?: string;
  subBlocks?: SubBlock[];
  cardTitle?: string;
  cardSubtitle?: string;
  available: boolean;
}

const scenes: SceneConfig[] = [
  {
    id: "s1",
    label: "Пустота",
    part: "intro",
    overlayStyle: "rgba(0,0,0,0.85)",
    texts: [
      { text: "Представь финансовый мир…", startTime: 1, endTime: 5.5 },
      { text: "где нет хаоса.", startTime: 3.5, endTime: 6.5 },
    ],
    duration: 7,
    available: true,
  },
  {
    id: "s2",
    label: "Идеальный мир",
    part: "intro",
    overlayStyle: "rgba(0,0,0,0.6)",
    texts: [
      { text: "Безопасность", startTime: 0.5, endTime: 2 },
      { text: "Гибкость", startTime: 2, endTime: 3.5 },
      { text: "Доходность", startTime: 3.5, endTime: 5 },
      { text: "Масштаб", startTime: 5, endTime: 7 },
    ],
    duration: 7,
    available: true,
  },
  {
    id: "s3",
    label: "Реальность",
    part: "intro",
    overlayStyle: "rgba(40,0,0,0.7)",
    texts: [
      { text: "Рынки растут.", startTime: 0.5, endTime: 2 },
      { text: "90% людей теряют.", startTime: 2, endTime: 4 },
      { text: "Те же схемы. Те же провалы.", startTime: 4, endTime: 6.5 },
    ],
    duration: 7,
    available: true,
  },
  {
    id: "s4",
    label: "Осознание",
    part: "intro",
    overlayStyle: "rgba(0,0,0,0.7)",
    texts: [
      { text: "Люди хотят доход.", startTime: 1, endTime: 3 },
      { text: "Но требуют безопасность.", startTime: 3, endTime: 5 },
      { text: "И гибкость.", startTime: 5, endTime: 7 },
    ],
    duration: 7,
    available: true,
  },
  {
    id: "s5",
    label: "JetUP",
    part: "presentation",
    cardTitle: "JetUP",
    cardSubtitle: "Это не продукт. Это инфраструктура.",
    texts: [],
    duration: 8,
    available: true,
  },
  {
    id: "s6",
    label: "AI",
    part: "presentation",
    cardTitle: "AI-архитектура",
    cardSubtitle: "Живая система.",
    texts: [],
    duration: 12,
    subBlocks: [
      { title: "Copy-X", icon: "📊", content: "Forex copy-trading. Опытные трейдеры торгуют за вас. Консервативный риск — 0,3% на сделку. Доступ к проверенным стратегиям." },
      { title: "Bit1", icon: "⚡", content: "Криптовалютные стратегии нового поколения. Автоматизированный трейдинг с AI-оптимизацией." },
      { title: "Future AI", icon: "🤖", content: "Будущие AI-инструменты экосистемы. Автоматическая аналитика, прогнозирование, персональные рекомендации." },
    ],
    available: true,
  },
  {
    id: "s7",
    label: "Три кита",
    part: "presentation",
    cardTitle: "Три кита",
    texts: [],
    duration: 12,
    subBlocks: [
      { title: "Безопасность", icon: "🛡", content: "Деньги на вашем счёте Tag Markets. Только вы имеете доступ. Вывод в любой момент (если нет открытой сделки)." },
      { title: "Гибкость", icon: "🔄", content: "Выбор стратегий, минимум от $100. Переключение в любой момент. Полный контроль." },
      { title: "Рентабельность", icon: "📈", content: "2-5% в месяц. 70% прибыли — клиенту. Консервативная стратегия: 0,3% риск на сделку, макс. 10% просадка." },
    ],
    available: true,
  },
  {
    id: "s8",
    label: "Партнёрка",
    part: "presentation",
    cardTitle: "Партнёрская программа",
    cardSubtitle: "Система растёт без хаоса.",
    texts: [],
    duration: 12,
    subBlocks: [
      { title: "Лот-комиссия", icon: "💰", content: "$10.50 за лот в команде. До 10 уровней глубины." },
      { title: "Infinity Bonus", icon: "♾️", content: "1% от объёма €100K, 2% от €300K, 3% от €1M." },
      { title: "Global Pools", icon: "🌍", content: "2 пула по 1% от общего оборота. Выплаты каждые 2 недели." },
    ],
    available: true,
  },
  {
    id: "s9",
    label: "Экосистема",
    part: "intro",
    overlayStyle: "rgba(0,0,0,0.5)",
    texts: [
      { text: "Это не проект.", startTime: 1, endTime: 3.5 },
      { text: "Это экосистема.", startTime: 3.5, endTime: 6.5 },
    ],
    duration: 7,
    available: true,
  },
  {
    id: "s10",
    label: "Финал",
    part: "intro",
    overlayStyle: "rgba(0,0,0,0.8)",
    texts: [
      { text: "Вопрос не в том, работает ли система.", startTime: 1, endTime: 3 },
      { text: "Вопрос — ты внутри неё", startTime: 3, endTime: 5 },
      { text: "или наблюдаешь со стороны?", startTime: 5, endTime: 8 },
    ],
    duration: 10,
    available: true,
  },
];

function Timeline({
  currentIndex,
  onSelect,
}: {
  currentIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 px-3 pt-4 pb-2" data-testid="timeline">
      <div className="relative flex items-center justify-between max-w-3xl mx-auto">
        <div className="absolute top-[9px] left-0 right-0 h-[2px] bg-white/10" />
        <div
          className="absolute top-[9px] left-0 h-[2px] transition-all duration-700"
          style={{
            width: `${(currentIndex / Math.max(scenes.length - 1, 1)) * 100}%`,
            background: "linear-gradient(90deg, #FFD700, #FFA500)",
          }}
        />
        {scenes.map((scene, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <button
              key={scene.id}
              onClick={() => scene.available && onSelect(i)}
              className="relative flex flex-col items-center z-10"
              style={{ cursor: scene.available ? "pointer" : "default", opacity: scene.available ? 1 : 0.3 }}
              data-testid={`timeline-dot-${i}`}
            >
              <div
                className="w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center"
                style={{
                  borderColor: isActive ? "#FFD700" : "rgba(255,255,255,0.15)",
                  backgroundColor: isCurrent ? "#FFD700" : isActive ? "rgba(255,215,0,0.25)" : "transparent",
                  transform: isCurrent ? "scale(1.3)" : "scale(1)",
                  boxShadow: isCurrent ? "0 0 10px rgba(255,215,0,0.4)" : "none",
                }}
              >
                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              <span
                className="mt-1.5 transition-all duration-300 whitespace-nowrap"
                style={{
                  color: isActive ? "#FFD700" : "rgba(255,255,255,0.25)",
                  fontSize: "9px",
                  fontWeight: isCurrent ? 600 : 400,
                  letterSpacing: "0.03em",
                }}
              >
                {scene.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Subtitles({ texts, currentTime }: { texts: TextOverlay[]; currentTime: number }) {
  const activeTexts = texts.filter((t) => currentTime >= t.startTime && currentTime <= t.endTime);
  if (activeTexts.length === 0) return null;

  return (
    <div
      className="absolute left-0 right-0 z-20 flex flex-col items-center gap-1 px-6"
      style={{ bottom: "10%" }}
      data-testid="subtitles"
    >
      {activeTexts.map((t, i) => (
        <p
          key={`${t.text}-${i}`}
          className="text-center font-bold animate-subtitle-in"
          style={{
            color: "#FFD700",
            fontSize: "clamp(1.6rem, 5vw, 3.5rem)",
            lineHeight: 1.3,
            textShadow: "0 2px 8px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4)",
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            letterSpacing: "0.01em",
          }}
          data-testid={`subtitle-${i}`}
        >
          {t.text}
        </p>
      ))}
    </div>
  );
}

function PresentationCard({
  scene,
  onNext,
}: {
  scene: SceneConfig;
  onNext: () => void;
}) {
  const [openBlock, setOpenBlock] = useState<number | null>(null);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-6" data-testid="presentation-card">
      <div
        className="w-full max-w-lg rounded-2xl p-8 animate-card-in"
        style={{
          background: "rgba(10,10,30,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,215,0,0.15)",
          boxShadow: "0 0 60px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.05)",
        }}
      >
        {scene.cardTitle && (
          <h2
            className="text-center font-bold mb-2"
            style={{
              color: "#FFD700",
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              textShadow: "0 0 20px rgba(255,215,0,0.2)",
              letterSpacing: "0.03em",
            }}
            data-testid="card-title"
          >
            {scene.cardTitle}
          </h2>
        )}
        {scene.cardSubtitle && (
          <p className="text-center text-white/60 text-base mb-6" data-testid="card-subtitle">
            {scene.cardSubtitle}
          </p>
        )}

        {scene.subBlocks && (
          <div className="flex flex-col gap-3 mb-6">
            {scene.subBlocks.map((block, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenBlock(openBlock === i ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-left"
                  style={{
                    background: openBlock === i ? "rgba(255,215,0,0.12)" : "rgba(255,255,255,0.05)",
                    border: openBlock === i ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                  data-testid={`block-${i}`}
                >
                  <span className="text-xl">{block.icon}</span>
                  <span className="text-white font-medium flex-1">{block.title}</span>
                  <ChevronRight
                    size={16}
                    className="text-white/40 transition-transform duration-300"
                    style={{ transform: openBlock === i ? "rotate(90deg)" : "rotate(0)" }}
                  />
                </button>
                {openBlock === i && (
                  <div className="px-4 py-3 text-white/70 text-sm leading-relaxed animate-block-expand" data-testid={`block-content-${i}`}>
                    {block.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!scene.subBlocks && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onNext}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "#000",
              }}
              data-testid="button-next"
            >
              Далее
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PresentationPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [finished, setFinished] = useState(false);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const scene = scenes[sceneIndex];

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= scenes.length || transitioning || !scenes[idx].available) return;
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex(idx);
        setCurrentTime(0);
        setFinished(false);
        startRef.current = performance.now();
        setTimeout(() => setTransitioning(false), 100);
      }, 600);
    },
    [transitioning]
  );

  const handleNext = useCallback(() => {
    if (sceneIndex < scenes.length - 1) {
      goTo(sceneIndex + 1);
    } else {
      setFinished(true);
    }
  }, [sceneIndex, goTo]);

  useEffect(() => {
    if (scene.part === "presentation" && scene.subBlocks) return;

    startRef.current = performance.now();
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setCurrentTime(t);
      if (t >= scene.duration) {
        handleNext();
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(timerRef.current);
  }, [scene.id, scene.duration, scene.part, handleNext]);

  const handleReplay = () => {
    setTransitioning(true);
    setTimeout(() => {
      setSceneIndex(0);
      setCurrentTime(0);
      setFinished(false);
      startRef.current = performance.now();
      setTimeout(() => setTransitioning(false), 100);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" data-testid="presentation-page">
      <style>{`
        @keyframes subtitleIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-subtitle-in { animation: subtitleIn 0.6s ease-out forwards; }
        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-card-in { animation: cardIn 0.7s ease-out forwards; }
        @keyframes blockExpand {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 200px; }
        }
        .animate-block-expand { animation: blockExpand 0.3s ease-out forwards; overflow: hidden; }
      `}</style>

      <video
        ref={bgVideoRef}
        src="/videos/city_night_panorama.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "saturate(0.6) brightness(0.5)" }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        data-testid="bg-video"
      />

      <div
        className="absolute inset-0 transition-all duration-[600ms] pointer-events-none"
        style={{ backgroundColor: scene.overlayStyle || "rgba(0,0,0,0.5)" }}
      />

      <div
        className="absolute inset-0 transition-opacity duration-[600ms]"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {scene.part === "intro" && <Subtitles texts={scene.texts} currentTime={currentTime} />}
        {scene.part === "presentation" && (
          <PresentationCard key={scene.id} scene={scene} onNext={handleNext} />
        )}
      </div>

      <Timeline currentIndex={sceneIndex} onSelect={goTo} />

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-5 left-3 z-50 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-all"
        data-testid="button-mute-toggle"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {finished && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm animate-card-in">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: "#FFD700", textShadow: "0 0 30px rgba(255,215,0,0.3)" }}
          >
            JetUP
          </h2>
          <div className="flex gap-4">
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
              data-testid="button-replay"
            >
              <RotateCcw size={16} />
              Сначала
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#000" }}
              data-testid="button-start"
            >
              Начать
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
