import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Room, 
  RoomEvent, 
  Track, 
  RemoteTrack, 
  RemoteTrackPublication, 
  RemoteParticipant, 
  ConnectionState 
} from 'livekit-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoCallBarProps {
  isActive: boolean;
  onStart: () => void;
  onEnd: () => void;
}

export default function VideoCallBar({ isActive, onStart, onEnd }: VideoCallBarProps) {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'finished'>('idle');
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const roomRef = useRef<Room | null>(null);

  const handleTrackSubscribed = useCallback(
    (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video && videoRef.current) {
        track.attach(videoRef.current);
      } else if (track.kind === Track.Kind.Audio && audioContainerRef.current) {
        const trackId = `${participant.identity}-${track.sid}`;
        let audioEl = audioElementsRef.current.get(trackId);
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          audioEl.setAttribute("playsinline", "true");
          audioEl.id = trackId;
          audioContainerRef.current.appendChild(audioEl);
          audioElementsRef.current.set(trackId, audioEl);
        }
        track.attach(audioEl);
        audioEl.play().catch(err => console.log("Audio autoplay blocked:", err.message));
      }
    },
    []
  );

  const handleTrackUnsubscribed = useCallback(
    (track: RemoteTrack, publication?: RemoteTrackPublication, participant?: RemoteParticipant) => {
      track.detach();
      if (track.kind === Track.Kind.Audio && participant && track.sid) {
        const trackId = `${participant.identity}-${track.sid}`;
        const audioEl = audioElementsRef.current.get(trackId);
        if (audioEl) {
          audioEl.remove();
          audioElementsRef.current.delete(trackId);
        }
      }
    },
    []
  );

  const startSession = async () => {
    try {
      setStatus('connecting');
      setError(null);

      const tokenResponse = await fetch('/api/liveavatar/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'ru' }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Failed to get token: ${errText}`);
      }

      const tokenData = await tokenResponse.json();
      const { session_id, session_token, raw } = tokenData;
      
      if (!session_token) {
        throw new Error('No session token received');
      }

      setSessionId(session_id);
      setSessionToken(session_token);

      const startResponse = await fetch('/api/liveavatar/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token }),
      });

      if (!startResponse.ok) {
        const errText = await startResponse.text();
        throw new Error(`Failed to start session: ${errText}`);
      }

      const startData = await startResponse.json();
      const url = startData?.data?.url;
      const accessToken = startData?.data?.access_token;

      if (!url || !accessToken) {
        throw new Error('Missing LiveKit connection data');
      }

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) {
          setStatus('active');
        } else if (state === ConnectionState.Disconnected) {
          setStatus('finished');
        }
      });

      await room.connect(url, accessToken);

      setStatus('active');
      onStart();
    } catch (err: any) {
      console.error('Session start error:', err);
      setError(err.message || 'Failed to start video call');
      setStatus('idle');
    }
  };

  const endSession = async () => {
    try {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      if (sessionId && sessionToken) {
        await fetch('/api/liveavatar/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, session_token: sessionToken }),
        });
      }
    } catch (err) {
      console.error('End session error:', err);
    } finally {
      setStatus('idle');
      setSessionId(null);
      setSessionToken(null);
      onEnd();
    }
  };

  const toggleMute = () => {
    if (roomRef.current) {
      const localPart = roomRef.current.localParticipant;
      localPart.audioTrackPublications.forEach(pub => {
        if (pub.track) {
          pub.track.mediaStreamTrack.enabled = isMuted;
        }
      });
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  if (!isActive && status === 'idle') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10 p-3"
        >
          <Button
            onClick={() => setIsOverlayVisible(true)}
            variant="outline"
            className="w-full h-12 rounded-xl border-primary/30 bg-white text-primary hover:bg-primary/5 font-bold gap-2"
            data-testid="button-start-video"
          >
            <Video size={20} />
            Начать видеозвонок с Марией
          </Button>
        </motion.div>

        <AnimatePresence>
          {isOverlayVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 text-center"
            >
              <button 
                onClick={() => setIsOverlayVisible(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>

              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Mic className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">Мария</h2>
              <p className="text-gray-400 mb-8 max-w-[280px]">Готова ответить на ваши вопросы в режиме реального времени</p>
              <Button
                onClick={() => {
                  setIsOverlayVisible(false);
                  startSession();
                }}
                className="w-full max-w-[280px] h-14 rounded-2xl bg-primary text-black font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                data-testid="button-confirm-start-video"
              >
                Начать разговор
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="sticky top-0 z-40 bg-black"
    >
      <div className="relative aspect-[16/9] max-h-[200px] w-full overflow-hidden">
        {status === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
            <Loader2 size={32} className="animate-spin mb-2" />
            <span className="text-sm">Подключение...</span>
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={cn("w-full h-full object-cover", status !== 'active' && "hidden")}
        />
        
        <div ref={audioContainerRef} className="hidden" />
        
        {status === 'active' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className={cn(
                "rounded-full w-10 h-10 border-white/30",
                isMuted ? "bg-red-500/80 text-white" : "bg-white/20 text-white"
              )}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={endSession}
              className="rounded-full w-12 h-12"
            >
              <PhoneOff size={20} />
            </Button>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 text-white p-4">
            <div className="text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <Button onClick={startSession} variant="outline" size="sm">
                Попробовать снова
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
