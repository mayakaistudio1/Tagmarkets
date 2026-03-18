import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, ChevronLeft, ChevronRight, Loader2, Users, UserCheck, Calendar, Clock, MessageCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

interface PartnerEvent {
  id: number; title: string; eventDate: string; eventTime: string;
  registeredCount: number; attendedCount: number; conversionRate: number;
  guestCount: number; clickedCount: number; invitesSent: number;
  inviteEventIds?: number[];
}

interface EventReport {
  event: { id: number; title: string; eventDate: string; eventTime: string; inviteCode: string };
  guests: Array<{
    id: number; name: string; email: string; phone: string | null;
    registeredAt: string; clickedZoom: boolean; attended: boolean;
    durationMinutes: number; questionsAsked: number; questionTexts: string[];
  }>;
  funnel: { invited: number; registered: number; clickedZoom: number; attended: number };
}

function FunnelBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
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
  const [expandedGuest, setExpandedGuest] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/partner-app/events", { headers: { "x-telegram-id": telegramId } })
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [telegramId]);

  const loadReport = async (event: PartnerEvent) => {
    setReportLoading(true);
    try {
      const ids = event.inviteEventIds || [event.id];
      const reports = await Promise.all(
        ids.map((id) => fetch(`/api/partner-app/events/${id}/report`, { headers: { "x-telegram-id": telegramId } }).then((r) => r.json()))
      );
      const combined: EventReport = {
        event: reports[0].event,
        guests: reports.flatMap((r: any) => r.guests),
        funnel: {
          invited: reports.reduce((s: number, r: any) => s + r.funnel.invited, 0),
          registered: reports.reduce((s: number, r: any) => s + r.funnel.registered, 0),
          clickedZoom: reports.reduce((s: number, r: any) => s + r.funnel.clickedZoom, 0),
          attended: reports.reduce((s: number, r: any) => s + r.funnel.attended, 0),
        },
      };
      setSelectedReport(combined);
    } catch (err) { console.error(err); }
    setReportLoading(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  if (selectedReport) {
    const f = selectedReport.funnel;
    const maxFunnel = Math.max(f.registered, f.clickedZoom, f.attended, 1);

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={() => setSelectedReport(null)} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back-reports">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">{selectedReport.event.title}</h2>
          <p className="text-xs text-gray-400 mt-1">{selectedReport.event.eventDate} · {selectedReport.event.eventTime}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> {t('pa.conversionFunnel')}
          </h3>
          <div className="space-y-4">
            <FunnelBar label={t('pa.registered')} value={f.registered} maxValue={maxFunnel} color="bg-blue-500" />
            <FunnelBar label={t('pa.clickedZoom')} value={f.clickedZoom} maxValue={maxFunnel} color="bg-purple-500" />
            <FunnelBar label={t('pa.attended')} value={f.attended} maxValue={maxFunnel} color="bg-emerald-500" />
          </div>
          {f.registered > 0 && (
            <div className="pt-3 mt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {t('pa.conversionRateLabel')}: <span className="font-semibold text-gray-900">{Math.round((f.attended / f.registered) * 100)}%</span>
              </p>
            </div>
          )}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('pa.guests')} ({selectedReport.guests.length})</h3>
        <div className="space-y-2">
          {selectedReport.guests.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`guest-row-${g.id}`}
            >
              <button
                className="w-full p-4 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
                onClick={() => setExpandedGuest(expandedGuest === g.id ? null : g.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{g.email}</p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {g.attended ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                      ✓ {g.durationMinutes}m
                      {g.questionsAsked > 0 && ` · ${g.questionsAsked}Q`}
                    </span>
                  ) : g.clickedZoom ? (
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">{t('pa.clicked')}</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">{t('pa.noShow')}</span>
                  )}
                </div>
              </button>
              {expandedGuest === g.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-4 pb-4 border-t border-gray-50"
                >
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {g.attended && <span>⏱ {g.durationMinutes} min</span>}
                      {g.phone && <span>📞 {g.phone}</span>}
                      {g.clickedZoom && <span className="text-blue-500">🔗 {t('pa.clickedZoom')}</span>}
                    </div>
                    {g.questionTexts && g.questionTexts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {t('pa.questionsAsked')}:
                        </p>
                        <div className="space-y-1.5">
                          {g.questionTexts.map((q, qi) => (
                            <div key={qi} className="bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-xs text-gray-700">{q}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!g.questionTexts || g.questionTexts.length === 0) && g.attended && (
                      <p className="text-[11px] text-gray-400 italic">{t('pa.noQuestions')}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-28">
      <h2 className="text-lg font-bold text-gray-900 mb-5">{t('pa.statistics')}</h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{t('pa.noEventsYet')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('pa.createFirstInvite')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => loadReport(event)}
              className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`report-event-${event.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{event.title}</h3>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 ml-2" />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.eventTime}</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700">{event.registeredCount || event.guestCount}</span>
                  <span className="text-[10px] text-gray-400">{t('pa.registered')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-700">{event.attendedCount}</span>
                  <span className="text-[10px] text-gray-400">{t('pa.attended')}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {reportLoading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}
