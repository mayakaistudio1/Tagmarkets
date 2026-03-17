import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Video, BarChart3, Bot, Loader2 } from "lucide-react";
import DashboardScreen from "./DashboardScreen";
import WebinarsScreen from "./WebinarsScreen";
import ReportsScreen from "./ReportsScreen";
import AIAssistantScreen from "./AIAssistantScreen";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "webinars", label: "Meetings", icon: Video },
  { id: "reports", label: "Statistics", icon: BarChart3 },
  { id: "ai", label: "AI", icon: Bot },
] as const;

type TabId = (typeof tabs)[number]["id"];

interface PartnerProfile {
  partner: { id: number; name: string; cuNumber: string; status: string };
  stats: { totalInvited: number; totalAttended: number; conversionRate: number; totalEvents: number };
}

function getInitialTab(): TabId {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab === "webinars" || tab === "reports" || tab === "ai" || tab === "dashboard") {
    return tab;
  }
  return "dashboard";
}

export default function PartnerApp() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
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
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white px-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-base font-semibold text-gray-900 mb-1.5">Access Restricted</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Please register via the Partner Bot to get access.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] overflow-hidden">
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full overflow-y-auto no-scrollbar"
          >
            {activeTab === "dashboard" && (
              <DashboardScreen profile={profile} telegramId={telegramId} onNavigate={setActiveTab} />
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

      <div className="flex-shrink-0 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-4 pt-2 pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center py-1.5 gap-1 min-w-[56px] transition-all active:scale-95"
                data-testid={`partner-tab-${tab.id}`}
              >
                <tab.icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? "text-blue-600" : "text-gray-400"}
                />
                <span className={`text-[10px] leading-none ${isActive ? "font-semibold text-blue-600" : "font-medium text-gray-400"}`}>
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
