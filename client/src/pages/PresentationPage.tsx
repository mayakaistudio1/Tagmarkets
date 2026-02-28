import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

interface TextOverlay {
  text: string;
  startTime: number;
  endTime: number;
}

interface SceneConfig {
  id: string;
  label: string;
  type: "video" | "visual";
  video?: string;
  videoFilter?: string;
  visualBg?: string;
  texts: TextOverlay[];
  duration: number;
  available: boolean;
}

const allScenes: SceneConfig[] = [
  {
    id: "scene1",
    label: "Пустота",
    type: "visual",
    visualBg: "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)",
    texts: [
      { text: "Представь финансовый мир…", startTime: 1, endTime: 5.5 },
      { text: "где нет хаоса.", startTime: 3.5, endTime: 6.5 },
    ],
    duration: 7,
    available: true,
  },
  {
    id: "scene2",
    label: "Идеальный мир",
    type: "video",
    video: "/videos/scene2_ideal_world.mp4",
    videoFilter: "saturate(0.75) brightness(0.8)",
    texts: [
      { text: "Безопасность", startTime: 0.5, endTime: 2 },
      { text: "Гибкость", startTime: 2, endTime: 3.5 },
      { text: "Доходность", startTime: 3.5, endTime: 5 },
      { text: "Масштаб", startTime: 5, endTime: 7 },
    ],
    duration: 8,
    available: true,
  },
  { id: "scene3", label: "Реальность", type: "visual", texts: [], duration: 8, available: false },
  { id: "scene4", label: "Осознание", type: "visual", texts: [], duration: 8, available: false },
  { id: "scene5", label: "JetUP", type: "visual", texts: [], duration: 8, available: false },
  { id: "scene6", label: "AI", type: "visual", texts: [], duration: 8, available: false },
  { id: "scene7", label: "Три кита", type: "visual", texts: [], duration: 8, available: false },
  { id: "scene8", label: "Масштаб", type: "visual", texts: [], duration: 8, available: false },
  { id: "scene9", label: "Экосистема", type: "visual", texts: [], duration: 8, available: false },
  { id: "scene10", label: "Финал", type: "visual", texts: [], duration: 8, available: false },
];

const activeScenes = allScenes.filter((s) => s.available);

function Timeline({
  scenes,
  currentIndex,
  onSelect,
}: {
  scenes: SceneConfig[];
  currentIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-5 pb-3" data-testid="timeline">
      <div className="relative flex items-center justify-between max-w-2xl mx-auto">
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
          const clickable = scene.available;
          return (
            <button
              key={scene.id}
              onClick={() => clickable && onSelect(i)}
              className="relative flex flex-col items-center z-10 group"
              style={{ cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.3 }}
              data-testid={`timeline-dot-${i}`}
            >
              <div
                className="w-[18px] h-[18px] rounded-full border-2 transition-all duration-500 flex items-center justify-center"
                style={{
                  borderColor: isActive ? "#FFD700" : "rgba(255,255,255,0.2)",
                  backgroundColor: isCurrent ? "#FFD700" : isActive ? "rgba(255,215,0,0.3)" : "transparent",
                  transform: isCurrent ? "scale(1.2)" : "scale(1)",
                  boxShadow: isCurrent ? "0 0 12px rgba(255,215,0,0.5)" : "none",
                }}
              >
                {isCurrent && <div className="w-[6px] h-[6px] rounded-full bg-black" />}
              </div>
              <span
                className="mt-2 text-[10px] font-medium tracking-wide transition-all duration-300 whitespace-nowrap"
                style={{
                  color: isActive ? "#FFD700" : "rgba(255,255,255,0.3)",
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
  return (
    <div
      className="absolute left-0 right-0 z-20 flex flex-col items-center px-6"
      style={{ bottom: "12%" }}
      data-testid="subtitles"
    >
      {texts.map((t, i) => {
        const visible = currentTime >= t.startTime && currentTime <= t.endTime;
        return (
          <div
            key={i}
            className="transition-all duration-[800ms] ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              position: visible ? "relative" : "absolute",
            }}
          >
            <p
              className="text-center font-bold"
              style={{
                color: "#FFD700",
                fontSize: "clamp(1.5rem, 5vw, 3.2rem)",
                lineHeight: 1.4,
                textShadow:
                  "0 2px 8px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7), 0 0 60px rgba(0,0,0,0.4)",
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "0.02em",
              }}
              data-testid={`subtitle-${i}`}
            >
              {t.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ParticleField() {
  const particles = useRef(
    Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animation: `drift ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0); opacity: 0.1; }
          50% { opacity: 0.4; }
          100% { transform: translate(${Math.random() > 0.5 ? "" : "-"}30px, ${Math.random() > 0.5 ? "" : "-"}40px); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

function VisualScene({
  scene,
  onTimeUpdate,
  onEnded,
}: {
  scene: SceneConfig;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    setElapsed(0);

    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setElapsed(t);
      onTimeUpdate(t);
      if (t >= scene.duration) {
        onEnded();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [scene.id, scene.duration, onTimeUpdate, onEnded]);

  return (
    <div
      className="absolute inset-0"
      style={{ background: scene.visualBg || "#000" }}
      data-testid={`visual-${scene.id}`}
    >
      <ParticleField />
    </div>
  );
}

function VideoScene({
  scene,
  isMuted,
  onTimeUpdate,
  onEnded,
}: {
  scene: SceneConfig;
  isMuted: boolean;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = isMuted;
    v.play().catch(() => {});
  }, [scene.id]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  return (
    <video
      ref={videoRef}
      src={scene.video}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ filter: scene.videoFilter || "none" }}
      muted={isMuted}
      playsInline
      preload="auto"
      onTimeUpdate={() => {
        if (videoRef.current) onTimeUpdate(videoRef.current.currentTime);
      }}
      onEnded={onEnded}
      data-testid={`video-${scene.id}`}
    />
  );
}

export default function PresentationPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [finished, setFinished] = useState(false);

  const scene = activeScenes[sceneIndex];

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= activeScenes.length || transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex(idx);
        setCurrentTime(0);
        setFinished(false);
        setTimeout(() => setTransitioning(false), 100);
      }, 800);
    },
    [transitioning]
  );

  const handleEnded = useCallback(() => {
    if (sceneIndex < activeScenes.length - 1) {
      goTo(sceneIndex + 1);
    } else {
      setFinished(true);
    }
  }, [sceneIndex, goTo]);

  const handleTimeUpdate = useCallback((t: number) => {
    setCurrentTime(t);
  }, []);

  const handleReplay = () => {
    setTransitioning(true);
    setTimeout(() => {
      setSceneIndex(0);
      setCurrentTime(0);
      setFinished(false);
      setTimeout(() => setTransitioning(false), 100);
    }, 800);
  };

  const handleTimelineSelect = useCallback(
    (idx: number) => {
      const globalIdx = allScenes.findIndex((s) => s.id === activeScenes[idx]?.id);
      if (globalIdx >= 0 && allScenes[globalIdx].available) {
        goTo(idx);
      }
    },
    [goTo]
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" data-testid="presentation-page">
      <div
        className="absolute inset-0 transition-opacity duration-[800ms]"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {scene.type === "video" ? (
          <VideoScene
            key={scene.id}
            scene={scene}
            isMuted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        ) : (
          <VisualScene
            key={scene.id}
            scene={scene}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 15%, transparent 75%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        <Subtitles texts={scene.texts} currentTime={currentTime} />
      </div>

      <Timeline scenes={allScenes} currentIndex={allScenes.findIndex((s) => s.id === scene.id)} onSelect={(i) => {
        const globalScene = allScenes[i];
        if (!globalScene.available) return;
        const activeIdx = activeScenes.findIndex((s) => s.id === globalScene.id);
        if (activeIdx >= 0) handleTimelineSelect(activeIdx);
      }} />

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-5 left-4 z-30 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all"
        data-testid="button-mute-toggle"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {finished && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            onClick={handleReplay}
            className="w-14 h-14 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            data-testid="button-replay"
          >
            <RotateCcw size={24} />
          </button>
          <span className="mt-4 text-white/50 text-sm">Начать сначала</span>
        </div>
      )}
    </div>
  );
}
