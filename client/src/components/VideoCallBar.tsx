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
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, X, Volume2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { getConversationTree, getNode, type ConversationNode } from './GuidedConversationTree';

interface VideoCallBarProps {
  isActive: boolean;
  onStart: () => void;
  onEnd: () => void;
  guided?: boolean;
  onSwitchToChat?: () => void;
}

export default function VideoCallBar({ isActive, onStart, onEnd, guided = false, onSwitchToChat }: VideoCallBarProps) {
  const { language } = useLanguage();
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'finished'>('idle');
  const [isMuted, setIsMuted] = useState(true);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [showButtons, setShowButtons] = useState(false);
  const [isGuidedComplete, setIsGuidedComplete] = useState(false);
  const [waitingForGreeting, setWaitingForGreeting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const roomRef = useRef<Room | null>(null);
  const speakerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<{ sender: string; text: string; timestamp: number }[]>([]);
  const greetingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const tree = guided ? getConversationTree(language) : null;

  const allTexts = {
    en: {
      liveVideo: 'LIVE',
      startVideoCall: 'Video call with Maria',
      startVideoCallDesc: 'Talk face-to-face in real time',
      maria: 'Maria',
      readyToAnswer: 'Ready to answer your questions in real time',
      startConversation: 'Start conversation',
      connectingToMaria: 'Connecting to Maria...',
      mariaSpeaking: 'Maria is speaking...',
      micEnabled: 'Your microphone is on',
      holdToSpeak: 'Hold to speak',
      endCall: 'End call',
      connectionError: 'Connection error',
      close: 'Close',
      tryAgain: 'Try again',
      continueInChat: 'Continue in text chat',
      guidedLabel: 'GUIDED',
      guidedDesc: 'Interactive guided experience',
    },
    de: {
      liveVideo: 'LIVE',
      startVideoCall: 'Videoanruf mit Maria',
      startVideoCallDesc: 'Sprich persönlich in Echtzeit mit Maria.',
      maria: 'Maria',
      readyToAnswer: 'Bereit, deine Fragen in Echtzeit zu beantworten',
      startConversation: 'Gespräch starten',
      connectingToMaria: 'Verbindung zu Maria wird hergestellt …',
      mariaSpeaking: 'Maria spricht …',
      micEnabled: 'Dein Mikrofon ist an',
      holdToSpeak: 'Halten zum Sprechen',
      endCall: 'Anruf beenden',
      connectionError: 'Verbindungsfehler',
      close: 'Schließen',
      tryAgain: 'Erneut versuchen',
      continueInChat: 'Weiter im Text-Chat',
      guidedLabel: 'GUIDED',
      guidedDesc: 'Interaktives geführtes Erlebnis',
    },
    ru: {
      liveVideo: 'LIVE',
      startVideoCall: 'Видеозвонок с Марией',
      startVideoCallDesc: 'Общайтесь лично в реальном времени',
      maria: 'Мария',
      readyToAnswer: 'Готова ответить на ваши вопросы в режиме реального времени',
      startConversation: 'Начать разговор',
      connectingToMaria: 'Подключение к Марии...',
      mariaSpeaking: 'Мария говорит...',
      micEnabled: 'Ваш микрофон включён',
      holdToSpeak: 'Удерживайте для речи',
      endCall: 'Завершить звонок',
      connectionError: 'Ошибка подключения',
      close: 'Закрыть',
      tryAgain: 'Попробовать снова',
      continueInChat: 'Продолжить в чате',
      guidedLabel: 'GUIDED',
      guidedDesc: 'Интерактивный гид',
    },
  };
  const texts = allTexts[language as keyof typeof allTexts] || allTexts.de;

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

  const enableUserMic = useCallback(() => {
    console.log("Enabling user microphone");
    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);
    }
    setIsAvatarTalking(false);
  }, []);

  const disableUserMic = useCallback(() => {
    console.log("Disabling user microphone");
    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(false);
      setIsMuted(true);
    }
    setIsAvatarTalking(true);
  }, []);

  const handleActiveSpeakersChanged = useCallback((speakers: any[]) => {
    if (!roomRef.current) return;
    
    const localIdentity = roomRef.current.localParticipant.identity;
    const avatarIsSpeaking = speakers.some(
      (speaker) => speaker.identity !== localIdentity && speaker.identity !== "client"
    );

    console.log("Active speakers changed, speakers:", speakers.map(s => s.identity), "avatar speaking:", avatarIsSpeaking);

    if (speakerTimeoutRef.current) {
      clearTimeout(speakerTimeoutRef.current);
      speakerTimeoutRef.current = null;
    }

    if (avatarIsSpeaking) {
      setShowButtons(false);
      disableUserMic();
      if (pttRecoveryRef.current) {
        clearTimeout(pttRecoveryRef.current);
        pttRecoveryRef.current = null;
      }
    } else {
      speakerTimeoutRef.current = setTimeout(() => {
        console.log("Speaker timeout - avatar finished");
        if (!guided) {
          enableUserMic();
        } else {
          setIsAvatarTalking(false);
          setIsMuted(true);
          if (roomRef.current) {
            roomRef.current.localParticipant.setMicrophoneEnabled(false);
          }
          setShowButtons(true);
          if (waitingForGreeting) {
            setWaitingForGreeting(false);
            setCurrentNodeId(tree?.rootNodeId || null);
            if (greetingTimerRef.current) {
              clearTimeout(greetingTimerRef.current);
              greetingTimerRef.current = null;
            }
          }
        }
      }, 1000);
    }
  }, [enableUserMic, disableUserMic, guided, tree, waitingForGreeting]);

  const handleDataReceived = useCallback((payload: Uint8Array) => {
    try {
      const message = new TextDecoder().decode(payload);
      console.log("Raw data received:", message);
      
      let data: any;
      try {
        data = JSON.parse(message);
      } catch {
        return;
      }

      const eventType = data?.type || data?.event || data?.action;
      console.log("Data event type:", eventType);

      if (data.event_type === 'avatar.transcription' && data.text) {
        transcriptRef.current.push({ sender: 'avatar', text: data.text, timestamp: Date.now() });
      } else if (data.event_type === 'user.transcription' && data.text) {
        transcriptRef.current.push({ sender: 'user', text: data.text, timestamp: Date.now() });
      }

      if (eventType === "avatar_start_talking" || eventType === "agent_start_talking" || 
          eventType === "start_talking" || eventType === "speaking_started") {
        console.log("Avatar started talking (data event)");
        if (speakerTimeoutRef.current) {
          clearTimeout(speakerTimeoutRef.current);
          speakerTimeoutRef.current = null;
        }
        setShowButtons(false);
        disableUserMic();
      } else if (eventType === "avatar_stop_talking" || eventType === "agent_stop_talking" ||
                 eventType === "stop_talking" || eventType === "speaking_ended") {
        console.log("Avatar stopped talking (data event)");
        speakerTimeoutRef.current = setTimeout(() => {
          if (!guided) {
            enableUserMic();
          } else {
            setIsAvatarTalking(false);
            setIsMuted(true);
            if (roomRef.current) {
              roomRef.current.localParticipant.setMicrophoneEnabled(false);
            }
            setShowButtons(true);
            if (waitingForGreeting) {
              setWaitingForGreeting(false);
              setCurrentNodeId(tree?.rootNodeId || null);
              if (greetingTimerRef.current) {
                clearTimeout(greetingTimerRef.current);
                greetingTimerRef.current = null;
              }
            }
          }
        }, 500);
      }
    } catch (e) {
      console.log("Error processing data message:", e);
    }
  }, [enableUserMic, disableUserMic, guided, tree, waitingForGreeting]);

  const startSession = async () => {
    try {
      setStatus('connecting');
      setError(null);
      transcriptRef.current = [];
      setShowButtons(false);
      setCurrentNodeId(null);
      setIsGuidedComplete(false);

      const tokenResponse = await fetch('/api/liveavatar/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, guided }),
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
      room.on(RoomEvent.DataReceived, handleDataReceived);
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) {
          setStatus('active');
        } else if (state === ConnectionState.Disconnected) {
          setStatus('finished');
        }
      });

      await room.connect(url, accessToken);
      
      if (guided) {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
        setIsAvatarTalking(false);
        setWaitingForGreeting(true);
        greetingTimerRef.current = setTimeout(() => {
          setWaitingForGreeting(false);
          setCurrentNodeId(tree?.rootNodeId || null);
          setShowButtons(true);
        }, 12000);
      } else {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
        setIsAvatarTalking(false);
      }

      setStatus('active');
      onStart();
    } catch (err: any) {
      console.error('Session start error:', err);
      setError(err.message || 'Failed to start video call');
      setStatus('idle');
    }
  };

  const sendTextToAvatar = async (text: string): Promise<boolean> => {
    if (!roomRef.current) return false;
    
    const encoder = new TextEncoder();
    const formats = [
      JSON.stringify({ type: "user.text", text }),
      JSON.stringify({ type: "user_input", text }),
      JSON.stringify({ type: "chat", message: text }),
    ];

    for (const msg of formats) {
      try {
        await roomRef.current.localParticipant.publishData(encoder.encode(msg), { reliable: true });
        console.log("Sent via data channel:", msg);
      } catch (e) {
        console.warn("Data channel format failed:", e);
      }
    }

    try {
      await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ru' ? 'ru-RU' : language === 'de' ? 'de-DE' : 'en-US';
      utterance.volume = 0.9;
      
      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
        setTimeout(resolve, 8000);
      });
      
      await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      console.log("Sent text via TTS->mic:", text);
      return true;
    } catch (e) {
      console.error("TTS approach failed:", e);
      if (roomRef.current) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      }
    }

    return true;
  };

  const handleGuidedButtonClick = async (userText: string, nextNodeId: string | null) => {
    setShowButtons(false);
    
    transcriptRef.current.push({ sender: 'user', text: userText, timestamp: Date.now() });

    const messageSent = await sendTextToAvatar(userText);

    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
      const nextNode = tree ? getNode(tree, nextNodeId) : null;
      if (nextNode?.isTerminal) {
        setIsGuidedComplete(true);
        setShowButtons(false);
      }
    }

    if (!messageSent) {
      setTimeout(() => setShowButtons(true), 2000);
    }
  };

  const pttRecoveryRef = useRef<NodeJS.Timeout | null>(null);

  const handlePushToTalkStart = async () => {
    if (isAvatarTalking || !roomRef.current) return;
    setIsPushToTalkActive(true);
    setShowButtons(false);
    if (pttRecoveryRef.current) {
      clearTimeout(pttRecoveryRef.current);
      pttRecoveryRef.current = null;
    }
    await roomRef.current.localParticipant.setMicrophoneEnabled(true);
    setIsMuted(false);
  };

  const handlePushToTalkEnd = async () => {
    if (!roomRef.current) return;
    setIsPushToTalkActive(false);
    await roomRef.current.localParticipant.setMicrophoneEnabled(false);
    setIsMuted(true);
    pttRecoveryRef.current = setTimeout(() => {
      setShowButtons(true);
    }, 15000);
  };

  const endSession = async () => {
    try {
      if (speakerTimeoutRef.current) {
        clearTimeout(speakerTimeoutRef.current);
        speakerTimeoutRef.current = null;
      }
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
        greetingTimerRef.current = null;
      }
      if (pttRecoveryRef.current) {
        clearTimeout(pttRecoveryRef.current);
        pttRecoveryRef.current = null;
      }
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

        if (transcriptRef.current.length > 0) {
          try {
            await fetch(`/api/liveavatar/sessions/${sessionId}/transcript`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                language,
                messages: transcriptRef.current,
              }),
            });
          } catch (e) {
            console.error('Failed to save video transcript:', e);
          }
        }
      }
    } catch (err) {
      console.error('End session error:', err);
    } finally {
      transcriptRef.current = [];
      setStatus('idle');
      setSessionId(null);
      setSessionToken(null);
      setShowButtons(false);
      setCurrentNodeId(null);
      setIsGuidedComplete(false);
      setWaitingForGreeting(false);
      onEnd();
    }
  };


  useEffect(() => {
    return () => {
      if (speakerTimeoutRef.current) {
        clearTimeout(speakerTimeoutRef.current);
      }
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
      }
      if (pttRecoveryRef.current) {
        clearTimeout(pttRecoveryRef.current);
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  const currentNode: ConversationNode | null = (guided && tree && currentNodeId) 
    ? getNode(tree, currentNodeId) 
    : null;

  if (!isActive && status === 'idle') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 p-3 flex-shrink-0"
        >
          <button
            onClick={() => setIsOverlayVisible(true)}
            className="w-full rounded-2xl jetup-gradient p-3.5 flex items-center gap-3 shadow-[0_4px_20px_rgba(124,58,237,0.3)] active:scale-[0.98] transition-transform"
            data-testid="button-start-video"
          >
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Video size={22} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-[14px]">{texts.startVideoCall}</span>
                <span className={cn(
                  "px-1.5 py-0.5 text-white text-[9px] font-bold rounded-md",
                  guided ? "bg-emerald-500 animate-pulse" : "bg-red-500 animate-pulse"
                )}>
                  {guided ? texts.guidedLabel : texts.liveVideo}
                </span>
              </div>
              <p className="text-white/70 text-[11px] mt-0.5">
                {guided ? texts.guidedDesc : texts.startVideoCallDesc}
              </p>
            </div>
          </button>
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
              <h2 className="text-2xl font-bold mb-2 text-white">{texts.maria}</h2>
              <p className="text-gray-400 mb-8 max-w-[280px]">{texts.readyToAnswer}</p>
              <Button
                onClick={() => {
                  setIsOverlayVisible(false);
                  startSession();
                }}
                className="w-full max-w-[280px] h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                data-testid="button-confirm-start-video"
              >
                {texts.startConversation}
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
                <span className="text-lg font-medium">{texts.connectingToMaria}</span>
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
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center z-20 pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">
                {isAvatarTalking && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-primary/20 text-primary border border-primary/30 text-sm font-medium">
                      <Volume2 size={18} className="animate-pulse" />
                      <span>{texts.mariaSpeaking}</span>
                    </span>
                  </div>
                )}

                {guided && showButtons && currentNode && !isGuidedComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full px-4 mb-4"
                  >
                    <div className="flex flex-col gap-2 max-w-sm mx-auto">
                      {currentNode.buttons.map((btn, idx) => (
                        <motion.button
                          key={`${currentNode.id}-${idx}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => handleGuidedButtonClick(btn.userText, btn.nextNodeId)}
                          className="w-full px-5 py-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl text-white text-sm font-medium text-left hover:bg-white/25 active:scale-[0.97] transition-all"
                          data-testid={`guided-btn-${btn.label.slice(0, 15)}`}
                        >
                          {btn.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {guided && isGuidedComplete && !isAvatarTalking && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full px-4 mb-4"
                  >
                    <div className="flex flex-col gap-3 max-w-sm mx-auto">
                      {onSwitchToChat && (
                        <button
                          onClick={() => {
                            endSession();
                            onSwitchToChat();
                          }}
                          className="w-full px-5 py-4 bg-primary/90 backdrop-blur-md border border-primary/50 rounded-2xl text-white text-sm font-bold text-center hover:bg-primary active:scale-[0.97] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                          data-testid="button-guided-continue-chat"
                        >
                          <MessageCircle size={20} />
                          <span>{texts.continueInChat}</span>
                        </button>
                      )}
                      <button
                        onClick={endSession}
                        className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white/70 text-sm font-medium text-center hover:bg-white/20 active:scale-[0.97] transition-all"
                        data-testid="button-guided-end-call"
                      >
                        {texts.endCall}
                      </button>
                    </div>
                  </motion.div>
                )}

                {!isAvatarTalking && !guided && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-medium">
                      <Mic size={18} />
                      <span>{texts.micEnabled}</span>
                    </span>
                  </div>
                )}

                {!isGuidedComplete && (
                  <div className="flex items-center justify-center gap-5">
                    {guided ? (
                      <button
                        onPointerDown={handlePushToTalkStart}
                        onPointerUp={handlePushToTalkEnd}
                        onPointerLeave={handlePushToTalkEnd}
                        onContextMenu={(e) => e.preventDefault()}
                        disabled={isAvatarTalking}
                        className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center transition-all relative",
                          isPushToTalkActive 
                            ? "bg-primary text-black scale-110" 
                            : "bg-white/20 text-white",
                          isAvatarTalking && "opacity-40 cursor-not-allowed"
                        )}
                        data-testid="button-push-to-talk"
                      >
                        {isPushToTalkActive && (
                          <>
                            <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
                            <span className="absolute inset-[-4px] rounded-full border-2 border-primary/60 animate-pulse" />
                          </>
                        )}
                        <Mic size={26} className="relative z-10" />
                      </button>
                    ) : null}
                    
                    <button
                      onClick={endSession}
                      className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-xl shadow-red-900/30"
                      data-testid="button-end-call"
                    >
                      <PhoneOff size={26} />
                    </button>
                  </div>
                )}

                {guided && !isGuidedComplete && (
                  <p className="text-white/40 text-xs mt-3">{texts.holdToSpeak}</p>
                )}
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 text-white p-6 z-30">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <X size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{texts.connectionError}</h3>
                  <p className="text-gray-400 mb-6">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={endSession} variant="ghost" className="text-white hover:bg-white/10">
                      {texts.close}
                    </Button>
                    <Button onClick={startSession} className="bg-primary text-white font-bold">
                      {texts.tryAgain}
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
