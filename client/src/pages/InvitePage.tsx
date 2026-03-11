import React, { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Calendar, Clock, User, ExternalLink, AlertCircle, Mic, Star, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ScheduleEventData {
  speaker: string;
  speakerPhoto: string | null;
  banner: string | null;
  highlights: string[];
  type: string;
  typeBadge: string;
  timezone: string;
  day: string;
  language: string;
}

interface InviteEvent {
  id: number;
  partnerName: string;
  title: string;
  eventDate: string;
  eventTime: string;
  isActive: boolean;
  scheduleEvent?: ScheduleEventData | null;
}

function CountdownTimer({ eventDate, eventTime }: { eventDate: string; eventTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function parseEventDate(dateStr: string, timeStr: string): Date | null {
      let d: Date | null = null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        d = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
      } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split(".");
        d = new Date(`${year}-${month}-${day}T${timeStr || "00:00"}:00`);
      }
      return d && !isNaN(d.getTime()) ? d : null;
    }

    const target = parseEventDate(eventDate, eventTime);
    if (!target) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;
      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  if (!timeLeft) return null;

  return (
    <div className="grid grid-cols-4 gap-2 w-full" data-testid="countdown-timer">
      {[
        { label: "Tage", value: timeLeft.days },
        { label: "Std", value: timeLeft.hours },
        { label: "Min", value: timeLeft.minutes },
        { label: "Sek", value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center p-2 rounded-xl bg-gradient-to-b from-purple-500/20 to-purple-600/10 border border-purple-500/20">
          <span className="text-xl font-bold text-white tabular-nums">{String(item.value).padStart(2, "0")}</span>
          <span className="text-[9px] uppercase text-purple-300 font-semibold tracking-wider">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }
  return dateStr;
}

const InvitePage = () => {
  const [, params] = useRoute("/invite/:code");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const code = params?.code;

  const [event, setEvent] = useState<InviteEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [registering, setRegistering] = useState(false);
  const [registeredGuestId, setRegisteredGuestId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!code) return;

    fetch(`/api/invite/${code}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Event not found");
          throw new Error("Failed to load event");
        }
        return res.json();
      })
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setRegistering(true);
    try {
      const res = await fetch(`/api/invite/${code}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data = await res.json();
      setRegisteredGuestId(data.guestId);
      toast({
        title: "Erfolgreich!",
        description: "Du bist für das Event registriert!",
      });
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinZoom = async () => {
    if (!code || !registeredGuestId) return;

    try {
      const res = await fetch(`/api/invite/${code}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: registeredGuestId }),
      });

      if (!res.ok) throw new Error("Failed to track click");

      const data = await res.json();
      if (data.zoomLink) {
        window.open(data.zoomLink, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: "Zoom-Link konnte nicht geöffnet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white p-6">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-4" />
        <p className="text-sm text-gray-400">Lade Event-Details...</p>
      </div>
    );
  }

  if (error || !event || !event.isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] text-white p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h1 className="text-xl font-bold mb-2">Event nicht verfügbar</h1>
        <p className="text-gray-400 mb-6">
          {error || "Diese Einladung ist nicht mehr aktiv."}
        </p>
        <Button onClick={() => setLocation("/")} variant="outline" data-testid="button-back-home"
          className="border-gray-700 text-gray-300 hover:bg-gray-800">
          Zurück zur Startseite
        </Button>
      </div>
    );
  }

  const se = event.scheduleEvent;
  const speakerName = se?.speaker;
  const speakerPhoto = se?.speakerPhoto;
  const highlights = se?.highlights || [];
  const bannerUrl = se?.banner;

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-y-auto no-scrollbar">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-3"
        >
          <img src="/jetup-logo.png" alt="JetUP Logo" className="h-10" data-testid="img-logo" />
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium">
            <Star className="w-3 h-3 mr-1.5" />
            Persönliche Einladung
          </div>
        </motion.div>

        {bannerUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10"
          >
            <img src={bannerUrl} alt={event.title} className="w-full h-auto" data-testid="img-event-banner" />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-5"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300" data-testid="text-event-title">
              {event.title}
            </h1>
            <p className="text-sm text-gray-400">
              Вас приглашает: <span className="text-purple-300 font-semibold" data-testid="text-partner-name">{event.partnerName}</span>
            </p>
          </div>

          {speakerName && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              {speakerPhoto ? (
                <img src={speakerPhoto} alt={speakerName} className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30" data-testid="img-speaker" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-purple-400" />
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Speaker</p>
                <p className="text-sm font-semibold text-white" data-testid="text-speaker-name">{speakerName}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-semibold">Datum</p>
                <p className="text-sm font-medium" data-testid="text-event-date">{formatDate(event.eventDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] uppercase text-gray-500 font-semibold">Uhrzeit</p>
                <p className="text-sm font-medium" data-testid="text-event-time">{event.eventTime}</p>
              </div>
            </div>
          </div>

          <CountdownTimer eventDate={event.eventDate} eventTime={event.eventTime} />

          {highlights.length > 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3" /> Das erwartet dich
              </p>
              {highlights.map((h, i) => (
                <p key={i} className="text-[13px] text-gray-300 leading-snug flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                  {h}
                </p>
              ))}
            </div>
          )}

          {!registeredGuestId ? (
            <motion.form
              onSubmit={handleRegister}
              className="space-y-4 p-5 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-white/10 shadow-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-center text-sm font-bold text-white">Jetzt kostenlos registrieren</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Vollständiger Name</label>
                <Input
                  required
                  placeholder="Dein Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500"
                  data-testid="input-guest-name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">E-Mail-Adresse</label>
                <Input
                  required
                  type="email"
                  placeholder="deine@email.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500"
                  data-testid="input-guest-email"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Telefon (optional)</label>
                <Input
                  type="tel"
                  placeholder="+49 ..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500"
                  data-testid="input-guest-phone"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold h-12 shadow-lg shadow-purple-500/20 text-sm"
                disabled={registering}
                data-testid="button-register"
              >
                {registering ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Kostenlos registrieren"
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              className="space-y-5 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <p className="text-sm font-semibold">Registrierung erfolgreich!</p>
                <p className="text-xs text-emerald-500/70 mt-1">Du bist für das Event angemeldet.</p>
              </div>
              <Button
                onClick={handleJoinZoom}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-16 text-lg shadow-lg shadow-blue-500/20"
                data-testid="button-join-zoom"
              >
                Zoom Meeting beitreten
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-gray-500 italic">
                Klicke auf den Button, um das Zoom-Meeting in einem neuen Tab zu öffnen.
              </p>
            </motion.div>
          )}
        </motion.div>

        <div className="text-center pb-4">
          <p className="text-[10px] text-gray-600">Powered by JetUP</p>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
