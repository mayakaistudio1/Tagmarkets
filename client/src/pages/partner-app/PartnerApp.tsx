import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Video, BarChart3, Bot, Loader2, User, Hash, Phone, Mail, ArrowRight, LogIn, LogOut } from "lucide-react";
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

type AppState = "loading" | "needs-telegram-login" | "needs-registration" | "ready";

function getInitialTab(): TabId {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab === "webinars" || tab === "reports" || tab === "ai" || tab === "dashboard") {
    return tab;
  }
  return "dashboard";
}

function getTelegramId(): string | null {
  if (sessionStorage.getItem("partnerLoggedOut") === "true") {
    return null;
  }
  const tg = (window as any).Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id?.toString();
  if (userId) return userId;
  const stored = sessionStorage.getItem("partnerTelegramId");
  if (stored) return stored;
  return null;
}

function getTelegramUsername(): string | null {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.username || null;
}

function TelegramLoginScreen({ onLogin }: { onLogin: (telegramId: string) => void }) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    (window as any).onTelegramAuth = (user: any) => {
      if (user?.id) {
        sessionStorage.setItem("partnerTelegramId", String(user.id));
        onLogin(String(user.id));
      }
    };

    const botUsername = "Jetup_partner_test_bot";
    const container = document.getElementById("telegram-login-container");
    if (container) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute("data-telegram-login", botUsername);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "12");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      script.async = true;
      container.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [onLogin]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-8 text-center" data-testid="telegram-login-screen">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
        <LogIn className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">JetUP Partner Hub</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
        Sign in with your Telegram account to access the Partner App.
      </p>

      <div id="telegram-login-container" className="mb-6 min-h-[44px]" />

      <button
        onClick={() => setShowManualInput(!showManualInput)}
        className="text-xs text-gray-400 underline"
        data-testid="button-manual-login-toggle"
      >
        Having trouble? Enter Telegram ID manually
      </button>

      {showManualInput && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Your Telegram ID"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            data-testid="input-manual-telegram-id"
          />
          <button
            onClick={() => {
              if (manualId.trim()) {
                sessionStorage.setItem("partnerTelegramId", manualId.trim());
                onLogin(manualId.trim());
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            data-testid="button-manual-login-submit"
          >
            Go
          </button>
        </div>
      )}
    </div>
  );
}

function RegistrationScreen({ telegramId, onRegistered }: { telegramId: string; onRegistered: (profile: PartnerProfile) => void }) {
  const [name, setName] = useState("");
  const [cuNumber, setCuNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const telegramUsername = getTelegramUsername();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cuNumber.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/partner-app/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-id": telegramId,
        },
        body: JSON.stringify({
          name: name.trim(),
          cuNumber: cuNumber.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          telegramUsername,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      const profile = await res.json();
      onRegistered(profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto" data-testid="registration-screen">
      <div className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 mx-auto shadow-lg shadow-blue-200">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Welcome to JetUP</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Set up your partner profile to get started with invitations, tracking, and AI tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <User size={14} />
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              data-testid="input-register-name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Hash size={14} />
              CU Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={cuNumber}
              onChange={(e) => setCuNumber(e.target.value)}
              placeholder="Your CU number"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              data-testid="input-register-cu"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Phone size={14} />
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 123 456 7890"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              data-testid="input-register-phone"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
              <Mail size={14} />
              Email <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              data-testid="input-register-email"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600" data-testid="text-register-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim() || !cuNumber.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors mt-6"
            data-testid="button-register-submit"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Get Started
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PartnerApp() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [appState, setAppState] = useState<AppState>("loading");
  const [telegramId, setTelegramId] = useState<string | null>(getTelegramId);

  const loadProfile = useCallback(async (tgId: string) => {
    try {
      const r = await fetch("/api/partner-app/profile", {
        headers: { "x-telegram-id": tgId },
      });
      if (r.status === 401) {
        setAppState("needs-registration");
        return;
      }
      if (!r.ok) throw new Error("Failed to load profile");
      const data = await r.json();
      setProfile(data);
      setAppState("ready");
    } catch {
      setAppState("needs-registration");
    }
  }, []);

  useEffect(() => {
    if (!telegramId) {
      setAppState("needs-telegram-login");
      return;
    }
    loadProfile(telegramId);
  }, [telegramId, loadProfile]);

  const handleTelegramLogin = useCallback((newTelegramId: string) => {
    sessionStorage.removeItem("partnerLoggedOut");
    sessionStorage.setItem("partnerTelegramId", newTelegramId);
    setTelegramId(newTelegramId);
    setAppState("loading");
    loadProfile(newTelegramId);
  }, [loadProfile]);

  const handleLogout = useCallback(() => {
    sessionStorage.setItem("partnerLoggedOut", "true");
    sessionStorage.removeItem("partnerTelegramId");
    setTelegramId(null);
    setProfile(null);
    setAppState("needs-telegram-login");
  }, []);

  const handleRegistered = useCallback((newProfile: PartnerProfile) => {
    setProfile(newProfile);
    setAppState("ready");
  }, []);

  if (appState === "loading") {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (appState === "needs-telegram-login") {
    return <TelegramLoginScreen onLogin={handleTelegramLogin} />;
  }

  if (appState === "needs-registration" && telegramId) {
    return <RegistrationScreen telegramId={telegramId} onRegistered={handleRegistered} />;
  }

  if (!profile || !telegramId) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const isTelegramContext = !!(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] overflow-hidden">
      {!isTelegramContext && (
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={14} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{profile.partner.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            data-testid="button-logout"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
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
