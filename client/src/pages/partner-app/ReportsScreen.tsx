import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, ChevronLeft, ChevronRight, Loader2, Users, UserCheck, MousePointerClick, Calendar, Clock } from "lucide-react";

interface PartnerEvent {
  id: number;
  title: string;
  eventDate: string;
  eventTime: string;
  inviteCode: string;
  registeredCount: number;
  attendedCount: number;
  conversionRate: number;
  guestCount: number;
  clickedCount: number;
}

interface EventReport {
  event: { id: number; title: string; eventDate: string; eventTime: string; inviteCode: string };
  guests: Array<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    registeredAt: string;
    clickedZoom: boolean;
    attended: boolean;
    durationMinutes: number;
    questionsAsked: number;
  }>;
  funnel: { invited: number; registered: number; clickedZoom: number; attended: number };
}

function FunnelBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function ReportsScreen({ telegramId }: { telegramId: string }) {
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetch("/api/partner-app/events", {
      headers: { "x-telegram-id": telegramId },
    })
      .then((r) => r.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [telegramId]);

  const loadReport = async (eventId: number) => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/partner-app/events/${eventId}/report`, {
        headers: { "x-telegram-id": telegramId },
      });
      const data = await res.json();
      setSelectedReport(data);
    } catch (err) {
      console.error("Failed to load report:", err);
    }
    setReportLoading(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (selectedReport) {
    const f = selectedReport.funnel;
    const maxFunnel = Math.max(f.invited, f.registered, f.clickedZoom, f.attended, 1);

    return (
      <div className="px-4 pt-5 pb-24 space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedReport(null)}
            className="p-2 rounded-xl bg-white/5 active:bg-white/10"
            data-testid="button-back-reports"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white truncate">{selectedReport.event.title}</h2>
            <p className="text-xs text-gray-400">{selectedReport.event.eventDate} · {selectedReport.event.eventTime}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-4"
        >
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Konversions-Trichter
          </h3>
          <div className="space-y-3">
            <FunnelBar label="Registriert" value={f.registered} maxValue={maxFunnel} color="bg-gradient-to-r from-purple-500 to-purple-600" />
            <FunnelBar label="Zoom geklickt" value={f.clickedZoom} maxValue={maxFunnel} color="bg-gradient-to-r from-blue-500 to-blue-600" />
            <FunnelBar label="Teilgenommen" value={f.attended} maxValue={maxFunnel} color="bg-gradient-to-r from-emerald-500 to-emerald-600" />
          </div>
          {f.registered > 0 && (
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-gray-400">
                Konversion: <span className="font-bold text-white">{Math.round((f.attended / f.registered) * 100)}%</span>
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-bold text-white">Gäste ({selectedReport.guests.length})</h3>
          {selectedReport.guests.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between"
              data-testid={`guest-row-${g.id}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{g.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{g.email}</p>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                {g.attended ? (
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold">
                      ✓ {g.durationMinutes} min
                    </span>
                    {g.questionsAsked > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-semibold">
                        {g.questionsAsked}Q
                      </span>
                    )}
                  </div>
                ) : g.clickedZoom ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold">
                    Zoom geklickt
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-semibold">
                    Nicht erschienen
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-24 space-y-4">
      <h2 className="text-lg font-bold text-white">Meine Berichte</h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-sm text-gray-400">Noch keine Events erstellt</p>
          <p className="text-xs text-gray-500 mt-1">Erstelle dein erstes Webinar-Invite</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => loadReport(event.id)}
              className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-left active:scale-[0.99] transition-transform"
              data-testid={`report-event-${event.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white flex-1 truncate">{event.title}</h3>
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.eventTime}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-semibold text-white">{event.registeredCount || event.guestCount}</span>
                  <span className="text-[10px] text-gray-500">Reg.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">{event.attendedCount}</span>
                  <span className="text-[10px] text-gray-500">Dabei</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-white">{event.clickedCount}</span>
                  <span className="text-[10px] text-gray-500">Klicks</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {reportLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="p-6 rounded-2xl bg-[#1a1a2e] border border-white/10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="text-sm text-gray-400">Lade Bericht...</p>
          </div>
        </div>
      )}
    </div>
  );
}
