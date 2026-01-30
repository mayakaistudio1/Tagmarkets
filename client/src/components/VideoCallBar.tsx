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
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, X, Volume2 } from 'lucide-react';
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
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
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

  const handleActiveSpeakersChanged = useCallback((speakers: any[]) => {
    if (!roomRef.current) return;
    
    const localIdentity = roomRef.current.localParticipant.identity;
    const avatarIsSpeaking = speakers.some(
      (speaker) => speaker.identity !== localIdentity
    );

    console.log("Active speakers changed, avatar speaking:", avatarIsSpeaking);

    setIsAvatarTalking((prevTalking) => {
      if (avatarIsSpeaking && !prevTalking) {
        console.log("Avatar started speaking - muting user mic");
        roomRef.current?.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
        return true;
      } else if (!avatarIsSpeaking && prevTalking) {
        console.log("Avatar stopped speaking - unmuting user mic");
        roomRef.current?.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
        return false;
      }
      return prevTalking;
    });
  }, []);

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
      const url = startData?.data?.livekit_url;
      const accessToken = startData?.data?.livekit_client_token;

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
      room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) {
          setStatus('active');
        } else if (state === ConnectionState.Disconnected) {
          setStatus('finished');
        }
      });

      await room.connect(url, accessToken);
      
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);
      setIsAvatarTalking(false);

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
    <AnimatePresence>
      {(isActive || status !== 'idle') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black flex flex-col"
        >
          <div className="relative flex-1 w-full overflow-hidden bg-gray-900">
            {status === 'connecting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                <span className="text-lg font-medium">Подключение к Марии...</span>
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
              <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 z-20">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md text-sm font-medium transition-all",
                  isAvatarTalking 
                    ? "bg-primary/20 text-primary border border-primary/30" 
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                )}>
                  {isAvatarTalking ? (
                    <>
                      <Volume2 size={18} className="animate-pulse" />
                      <span>Мария говорит...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={18} />
                      <span>Ваш микрофон включён</span>
                    </>
                  )}
                </div>
                
                <Button
                  variant="destructive"
                  onClick={endSession}
                  className="rounded-full h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-xl shadow-red-900/20 gap-2"
                >
                  <PhoneOff size={24} />
                  Завершить звонок
                </Button>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 text-white p-6 z-30">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <X size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ошибка подключения</h3>
                  <p className="text-gray-400 mb-6">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={endSession} variant="ghost" className="text-white hover:bg-white/10">
                      Закрыть
                    </Button>
                    <Button onClick={startSession} className="bg-primary text-black font-bold">
                      Попробовать снова
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
