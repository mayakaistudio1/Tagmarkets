import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

interface TextOverlay {
  text: string;
  startTime: number;
  endTime?: number;
  className?: string;
}

interface SceneConfig {
  id: string;
  video?: string;
  videoFilter?: string;
  texts: TextOverlay[];
  duration: number;
}

const scenes: SceneConfig[] = [
  {
    id: "scene1-emptiness",
    video: "/videos/scene1_emptiness.mp4",
    videoFilter: "saturate(0.3) brightness(0.6)",
    texts: [
      { text: "Представь финансовый мир…", startTime: 1 },
      { text: "где нет хаоса.", startTime: 3.5 },
    ],
    duration: 8,
  },
  {
    id: "scene2-ideal-world",
    video: "/videos/scene2_ideal_world.mp4",
    videoFilter: "saturate(0.8) brightness(0.85)",
    texts: [
      { text: "Безопасность", startTime: 0.5, endTime: 7 },
      { text: "Гибкость", startTime: 2, endTime: 7 },
      { text: "Доходность", startTime: 3.5, endTime: 7 },
      { text: "Масштаб", startTime: 5, endTime: 7 },
    ],
    duration: 8,
  },
];

function SceneRenderer({
  scene,
  onEnded,
  isMuted,
}: {
  scene: SceneConfig;
  onEnded: () => void;
  isMuted: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);
  const animFrameRef = useRef<number>(0);

  const updateTime = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      animFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    const handleCanPlay = () => setReady(true);
    const handlePlay = () => {
      animFrameRef.current = requestAnimationFrame(updateTime);
    };
    const handleEnded = () => {
      cancelAnimationFrame(animFrameRef.current);
      onEnded();
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("play", handlePlay);
    video.addEventListener("ended", handleEnded);

    video.currentTime = 0;
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [scene.id, updateTime, onEnded]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" data-testid={`scene-${scene.id}`}>
      {scene.video && (
        <video
          ref={videoRef}
          src={scene.video}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: scene.videoFilter || "saturate(0.4) brightness(0.7)" }}
          muted={isMuted}
          playsInline
          preload="auto"
          data-testid="scene-video"
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8 gap-2">
        {scene.texts.map((overlay, i) => {
          const visible = currentTime >= overlay.startTime && (!overlay.endTime || currentTime <= overlay.endTime);
          return (
            <div
              key={`${scene.id}-${i}`}
              className="transition-all duration-[1500ms] ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
              }}
              data-testid={`text-overlay-${i}`}
            >
              <p
                className="text-white text-center font-light tracking-wide"
                style={{
                  fontSize: "clamp(1.4rem, 4.5vw, 3rem)",
                  lineHeight: 1.6,
                  textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 60px rgba(100,100,255,0.12)",
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                {overlay.text}
              </p>
            </div>
          );
        })}
      </div>

      {ready && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] z-20">
          <div
            className="h-full bg-gradient-to-r from-blue-500/50 to-purple-500/50 transition-all duration-200"
            style={{ width: `${(currentTime / scene.duration) * 100}%` }}
            data-testid="progress-bar"
          />
        </div>
      )}
    </div>
  );
}

export default function PresentationPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const goToScene = useCallback((index: number) => {
    if (index < 0 || index >= scenes.length || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentScene(index);
      setIsFinished(false);
      setTimeout(() => setTransitioning(false), 100);
    }, 600);
  }, [transitioning]);

  const handleSceneEnded = useCallback(() => {
    if (currentScene < scenes.length - 1) {
      goToScene(currentScene + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentScene, goToScene]);

  const handleReplay = () => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentScene(0);
      setIsFinished(false);
      setTimeout(() => setTransitioning(false), 100);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ cursor: "default" }}
      data-testid="presentation-page"
    >
      <div
        className="absolute inset-0 transition-opacity duration-[600ms]"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <SceneRenderer
          key={`scene-${currentScene}`}
          scene={scenes[currentScene]}
          onEnded={handleSceneEnded}
          isMuted={isMuted}
        />
      </div>

      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <span className="text-white/40 text-xs font-mono" data-testid="text-scene-counter">
          {currentScene + 1} / {scenes.length}
        </span>
      </div>

      <div className="absolute bottom-6 left-6 z-30 flex gap-2">
        {currentScene > 0 && (
          <button
            onClick={() => goToScene(currentScene - 1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            data-testid="button-prev-scene"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {currentScene < scenes.length - 1 && (
          <button
            onClick={() => goToScene(currentScene + 1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            data-testid="button-next-scene"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      <div className="absolute bottom-6 right-6 z-30 flex gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          data-testid="button-mute-toggle"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        {isFinished && (
          <button
            onClick={handleReplay}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            data-testid="button-replay"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
