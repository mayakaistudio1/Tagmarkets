import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2, Calendar, Clock, User, ExternalLink, AlertCircle, Mic, Star, Timer } from "lucide-react";
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

function getTimezoneOffsetStr(tz: string, isoDateStr?: string): string {
  // Map all timezone abbreviations used in admin UI to IANA timezone names
  const ianaMap: Record<string, string> = {
    "CET": "Europe/Berlin", "CEST": "Europe/Berlin",
    "MEZ": "Europe/Berlin", "MESZ": "Europe/Berlin", "MET": "Europe/Berlin",
    "MSK": "Europe/Moscow",
    "GST": "Asia/Dubai",
    "EST": "America/New_York", "EDT": "America/New_York",
    "UTC": "UTC", "GMT": "UTC",
    "Europe/Berlin": "Europe/Berlin",
    "Europe/Moscow": "Europe/Moscow",
    "Asia/Dubai": "Asia/Dubai",
    "America/New_York": "America/New_York",
  };
  const ianaZone = ianaMap[tz];
  if (!ianaZone) return "+00:00";
  // Use the event date (not current date) to determine DST-aware UTC offset via Intl API
  const refDate = isoDateStr ? new Date(`${isoDateStr}T12:00:00Z`) : new Date();
  try {
    const utcMs = refDate.getTime();
    const localMs = new Date(refDate.toLocaleString("en-US", { timeZone: ianaZone })).getTime();
    const offsetMinutes = Math.round((localMs - utcMs) / (1000 * 60));
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absMin = Math.abs(offsetMinutes);
    const h = String(Math.floor(absMin / 60)).padStart(2, "0");
    const m = String(absMin % 60).padStart(2, "0");
    return `${sign}${h}:${m}`;
  } catch {
    return "+00:00";
  }
}

function CountdownTimer({ eventDate, eventTime, timezone }: { eventDate: string; eventTime: string; timezone?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function parseEventDate(dateStr: string, timeStr: string): Date | null {
      let isoDate: string | null = null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        isoDate = dateStr;
      } else if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split(".");
        isoDate = `${year}-${month}-${day}`;
      }
      if (!isoDate) return null;
      const offset = timezone ? getTimezoneOffsetStr(timezone, isoDate) : "+01:00";
      const d = new Date(`${isoDate}T${timeStr || "00:00"}:00${offset}`);
      return !isNaN(d.getTime()) ? d : null;
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
  }, [eventDate, eventTime, timezone]);

  if (!timeLeft) return null;

  return (
    <div className="grid grid-cols-4 gap-2 w-full" data-testid="countdown-timer">
      {[
        { label: "Tage", value: timeLeft.days },
        { label: "Std", value: timeLeft.hours },
        { label: "Min", value: timeLeft.minutes },
        { label: "Sek", value: timeLeft.seconds },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center p-3 rounded-2xl bg-blue-50">
          <span className="text-2xl font-bold text-gray-900 tabular-nums">{String(item.value).padStart(2, "0")}</span>
          <span className="text-[9px] uppercase text-gray-400 font-semibold tracking-wider mt-0.5">{item.label}</span>
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
      .then((data) => { setEvent(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
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
      toast({ title: "Erfolgreich!", description: "Du bist für das Event registriert!" });
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
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
      if (data.zoomLink) window.open(data.zoomLink, "_blank");
    } catch (err: any) {
      toast({ title: "Fehler", description: "Zoom-Link konnte nicht geöffnet werden.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-gray-400">Lade Event-Details...</p>
      </div>
    );
  }

  if (error || !event || !event.isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-1.5">Event nicht verfügbar</h1>
        <p className="text-sm text-gray-400 mb-6">
          {error || "Diese Einladung ist nicht mehr aktiv."}
        </p>
        <button onClick={() => setLocation("/")} className="px-5 py-2.5 rounded-xl bg-gray-100 text-sm font-medium text-gray-600 active:bg-gray-200 transition-colors" data-testid="button-back-home">
          Zurück zur Startseite
        </button>
      </div>
    );
  }

  const se = event.scheduleEvent;
  const speakerName = se?.speaker;
  const speakerPhoto = se?.speakerPhoto;
  const highlights = se?.highlights || [];
  const bannerUrl = se?.banner;

  return (
    <div className="min-h-screen bg-[#F5F5F7] overflow-y-auto no-scrollbar">
      <div className="max-w-md mx-auto px-5 py-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-3"
        >
          <img src="/jetup-logo.png" alt="JetUP Logo" className="h-8" data-testid="img-logo" />
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
            <Star className="w-3 h-3 mr-1.5" />
            Persönliche Einladung
          </div>
        </motion.div>

        {bannerUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
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
          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-bold text-gray-900 leading-tight" data-testid="text-event-title">
              {event.title}
            </h1>
            <p className="text-sm text-gray-400">
              Einladung von <span className="text-blue-600 font-medium" data-testid="text-partner-name">{event.partnerName}</span>
            </p>
          </div>

          {speakerName && (
            <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              {speakerPhoto ? (
                <img src={speakerPhoto} alt={speakerName} className="w-12 h-12 rounded-xl object-cover" data-testid="img-speaker" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-blue-500" />
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Speaker</p>
                <p className="text-sm font-semibold text-gray-900" data-testid="text-speaker-name">{speakerName}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Datum</p>
                <p className="text-sm font-semibold text-gray-900" data-testid="text-event-date">{formatDate(event.eventDate)}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-semibold">Uhrzeit</p>
                <p className="text-sm font-semibold text-gray-900" data-testid="text-event-time">
                  {event.eventTime}{se?.timezone ? ` ${se.timezone}` : ""}
                </p>
              </div>
            </div>
          </div>

          <CountdownTimer eventDate={event.eventDate} eventTime={event.eventTime} timezone={se?.timezone} />

          {highlights.length > 0 && (
            <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-blue-500" /> Das erwartet dich
              </p>
              {highlights.map((h, i) => (
                <p key={i} className="text-sm text-gray-600 leading-snug flex items-start gap-2.5">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                  {h}
                </p>
              ))}
            </div>
          )}

          {!registeredGuestId ? (
            <motion.form
              onSubmit={handleRegister}
              className="bg-white rounded-2xl p-5 space-y-4"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-bold text-gray-900 text-center">Jetzt kostenlos registrieren</h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Vollständiger Name</label>
                <input
                  required
                  placeholder="Dein Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  data-testid="input-guest-name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">E-Mail-Adresse</label>
                <input
                  required
                  type="email"
                  placeholder="deine@email.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  data-testid="input-guest-email"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">Telefon (optional)</label>
                <input
                  type="tel"
                  placeholder="+49 ..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  data-testid="input-guest-phone"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 text-sm font-bold text-white active:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={registering}
                data-testid="button-register"
              >
                {registering ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Kostenlos registrieren"
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              className="space-y-4 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-emerald-50 rounded-2xl p-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">✓</span>
                </div>
                <p className="text-sm font-bold text-gray-900">Registrierung erfolgreich!</p>
                <p className="text-xs text-gray-500 mt-1">Du bist für das Event angemeldet.</p>
              </div>
              <button
                onClick={handleJoinZoom}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 text-base font-bold text-white active:bg-blue-700 transition-colors"
                data-testid="button-join-zoom"
              >
                Zoom Meeting beitreten
                <ExternalLink className="w-5 h-5" />
              </button>
              <p className="text-[11px] text-gray-400">
                Klicke auf den Button, um das Zoom-Meeting in einem neuen Tab zu öffnen.
              </p>
            </motion.div>
          )}
        </motion.div>

        <div className="text-center pb-4">
          <p className="text-[10px] text-gray-400">Powered by JetUP</p>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
