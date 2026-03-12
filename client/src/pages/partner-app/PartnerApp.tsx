import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, BarChart3, Bot, Loader2 } from "lucide-react";
import DashboardScreen from "./DashboardScreen";
import WebinarsScreen from "./WebinarsScreen";
import ReportsScreen from "./ReportsScreen";
import AIAssistantScreen from "./AIAssistantScreen";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "webinars", label: "Webinare", icon: Calendar },
  { id: "reports", label: "Berichte", icon: BarChart3 },
  { id: "ai", label: "AI", icon: Bot },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface PartnerProfile {
  partner: { id: number; name: string; cuNumber: string; status: string };
  stats: { totalInvited: number; totalAttended: number; conversionRate: number; totalEvents: number };
}

export default function PartnerApp() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const telegramId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || "demo";

  useEffect(() => {
    fetch("/api/partner-app/profile", {
      headers: { "x-telegram-id": telegramId },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [telegramId]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0a0a1a]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute -inset-2 rounded-full bg-purple-500/20 animate-ping" />
        </div>
        <p className="mt-6 text-sm text-gray-400 font-medium">Loading Partner App...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0a0a1a] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Zugang nicht verfügbar</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Bitte registriere dich zuerst über den Partner Bot, um Zugang zur Partner App zu erhalten.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a1a] text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-purple-600/8 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-gradient-radial from-indigo-600/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <main className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto no-scrollbar"
          >
            {activeTab === "dashboard" && (
              <DashboardScreen
                profile={profile}
                telegramId={telegramId}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === "webinars" && (
              <WebinarsScreen telegramId={telegramId} />
            )}
            {activeTab === "reports" && (
              <ReportsScreen telegramId={telegramId} />
            )}
            {activeTab === "ai" && (
              <AIAssistantScreen telegramId={telegramId} partnerName={profile.partner.name} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="relative z-20 flex-shrink-0 border-t border-white/5 bg-[#0a0a1a]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center py-1 gap-0.5 min-w-[60px] transition-all active:scale-95"
                data-testid={`partner-tab-${tab.id}`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-purple-500/20" : ""}`}>
                  <tab.icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={`transition-colors ${isActive ? "text-purple-400" : "text-gray-500"}`}
                  />
                </div>
                <span
                  className={`text-[9px] leading-none transition-colors ${
                    isActive ? "font-bold text-purple-400" : "font-medium text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
