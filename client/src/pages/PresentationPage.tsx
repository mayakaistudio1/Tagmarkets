import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

interface TextOverlay {
  text: string;
  startTime: number;
  className?: string;
}

interface SceneConfig {
  id: string;
  video?: string;
  bgClass?: string;
  texts: TextOverlay[];
  duration: number;
}

const scenes: SceneConfig[] = [
  {
    id: "scene1-emptiness",
    video: "/videos/scene1_emptiness.mp4",
    texts: [
      { text: "Представь финансовый мир…", startTime: 1 },
      { text: "где нет хаоса.", startTime: 3.5 },
    ],
    duration: 8,
  },
];

function SceneRenderer({ scene }: { scene: SceneConfig }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const animFrameRef = useRef<number>(0);

  const updateTime = useCallback(() => {
    if (videoRef.current && !isEnded) {
      setCurrentTime(videoRef.current.currentTime);
      animFrameRef.current = requestAnimationFrame(updateTime);
    }
  }, [isEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      animFrameRef.current = requestAnimationFrame(updateTime);
    };
    const handleEnded = () => {
      setIsEnded(true);
      cancelAnimationFrame(animFrameRef.current);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("ended", handleEnded);

    video.play().catch(() => {});

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateTime]);

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsEnded(false);
      setCurrentTime(0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black" data-testid="scene-container">
      {scene.video && (
        <video
          ref={videoRef}
          src={scene.video}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(0.4) brightness(0.7)" }}
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
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8">
        {scene.texts.map((overlay, i) => {
          const visible = currentTime >= overlay.startTime;
          return (
            <div
              key={i}
              className={`transition-all duration-[2000ms] ease-out ${overlay.className || ""}`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
              }}
              data-testid={`text-overlay-${i}`}
            >
              <p
                className="text-white text-center font-light tracking-wide"
                style={{
                  fontSize: "clamp(1.4rem, 4vw, 2.8rem)",
                  lineHeight: 1.5,
                  textShadow: "0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(100,100,255,0.15)",
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {overlay.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex gap-3">
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
          data-testid="button-mute-toggle"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        {isEnded && (
          <button
            onClick={handleReplay}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all animate-fade-in"
            data-testid="button-replay"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {!isEnded && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] z-20">
          <div
            className="h-full bg-gradient-to-r from-blue-500/60 to-purple-500/60 transition-all duration-300"
            style={{ width: `${(currentTime / scene.duration) * 100}%` }}
            data-testid="progress-bar"
          />
        </div>
      )}
    </div>
  );
}

export default function PresentationPage() {
  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ cursor: "default" }}
      data-testid="presentation-page"
    >
      <SceneRenderer scene={scenes[0]} />
    </div>
  );
}
