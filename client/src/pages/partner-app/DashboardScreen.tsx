import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, TrendingUp, CalendarPlus, BarChart3, ChevronRight, Zap } from "lucide-react";

interface Props {
  profile: {
    partner: { id: number; name: string; cuNumber: string };
    stats: { totalInvited: number; totalAttended: number; conversionRate: number; totalEvents: number };
  };
  telegramId: string;
  onNavigate: (tab: string) => void;
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

interface RecentEvent {
  id: number;
  title: string;
  eventDate: string;
  eventTime: string;
  registeredCount: number;
  attendedCount: number;
  conversionRate: number;
}

export default function DashboardScreen({ profile, telegramId, onNavigate }: Props) {
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);

  useEffect(() => {
    fetch("/api/partner-app/events", {
      headers: { "x-telegram-id": telegramId },
    })
      .then((r) => r.json())
      .then((data) => setRecentEvents(data.slice(0, 3)))
      .catch(() => {});
  }, [telegramId]);

  const metrics = [
    {
      label: "Eingeladen",
      value: profile.stats.totalInvited,
      icon: Users,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    {
      label: "Teilgenommen",
      value: profile.stats.totalAttended,
      icon: UserCheck,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      label: "Konversion",
      value: profile.stats.conversionRate,
      suffix: "%",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
  ];

  const firstName = profile.partner.name.split(" ")[0];

  return (
    <div className="px-4 pt-6 pb-24 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Willkommen zurück</p>
            <h1 className="text-lg font-bold text-white" data-testid="text-partner-welcome">{firstName}</h1>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 via-indigo-600/10 to-transparent border border-purple-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-purple-400" />
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Dein Recruiting System</p>
        </div>
        <p className="text-[13px] text-gray-300 leading-relaxed">
          Verwalte deine Webinar-Einladungen, verfolge Ergebnisse und nutze AI für smartes Follow-up.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.08] p-3 text-center"
          >
            <div className={`mx-auto w-8 h-8 rounded-xl ${m.bgColor} flex items-center justify-center mb-2`}>
              <m.icon className={`w-4 h-4 ${m.iconColor}`} />
            </div>
            <p className="text-xl font-bold text-white" data-testid={`stat-${m.label.toLowerCase()}`}>
              <AnimatedCounter value={m.value} suffix={m.suffix} />
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{m.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          onClick={() => onNavigate("webinars")}
          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-transform"
          data-testid="button-create-invite"
        >
          <CalendarPlus className="w-5 h-5 text-white" />
          <span className="text-sm font-bold text-white">Einladen</span>
        </button>
        <button
          onClick={() => onNavigate("reports")}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.06] border border-white/10 active:scale-[0.98] transition-transform"
          data-testid="button-view-reports"
        >
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-bold text-white">Berichte</span>
        </button>
      </motion.div>

      {recentEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Letzte Events</h3>
            <button onClick={() => onNavigate("reports")} className="text-xs text-purple-400 font-medium flex items-center gap-0.5">
              Alle <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {recentEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.08 }}
              className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between"
              data-testid={`recent-event-${event.id}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{event.title}</p>
                <p className="text-xs text-gray-400">{event.eventDate} · {event.eventTime}</p>
              </div>
              <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{event.registeredCount}</p>
                  <p className="text-[9px] text-gray-500">Reg.</p>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">{event.attendedCount}</p>
                  <p className="text-[9px] text-gray-500">Dabei</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
