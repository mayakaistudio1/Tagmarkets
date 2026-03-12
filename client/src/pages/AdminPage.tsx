import React, { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import {
  Shield,
  LogOut,
  MessageSquare,
  Tag,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Users,
  Upload,
  Globe,
  Loader2,
  Image as ImageIcon,
  FileSpreadsheet,
  ExternalLink,
  BarChart3,
  Brain,
  Gift,
  Link as LinkIcon,
  UserCheck,
  Video,
} from "lucide-react";

type Tab = "chat" | "promotions" | "schedule" | "speakers" | "promo" | "invites" | "partners";

interface AnalysisSection {
  title: string;
  items: string[];
}

interface AnalysisReport {
  summary: string;
  sections: AnalysisSection[];
  sessionsAnalyzed: number;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  sessionId: string;
  type: string;
  language: string;
  createdAt: string;
  messageCount: number;
}

interface InviteGuest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  registeredAt: string;
  clickedZoom: boolean;
  clickedAt?: string;
}

interface InviteEvent {
  id: number;
  partnerName: string;
  partnerCu: string;
  zoomLink: string;
  title: string;
  eventDate: string;
  eventTime: string;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  guestCount: number;
  clickedCount: number;
  zoomSyncedCount?: number;
}

interface AdminPartner {
  id: number;
  name: string;
  cuNumber: string;
  telegramUsername?: string;
  phone?: string;
  email?: string;
  status: string;
  createdAt: string;
}

interface Speaker {
  id?: number;
  name: string;
  photo: string;
  role: string;
  isActive: boolean;
}

interface Promotion {
  id?: number;
  badge: string;
  title: string;
  subtitle: string;
  banner: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  deadline: string;
  language: string;
  translationGroup?: string;
  isActive: boolean;
}

interface ScheduleEvent {
  id?: number;
  day: string;
  date: string;
  time: string;
  timezone: string;
  title: string;
  speaker: string;
  speakerId?: number | null;
  speakerPhoto?: string | null;
  type: string;
  typeBadge: string;
  banner: string;
  highlights: string[];
  link: string;
  language: string;
  translationGroup?: string;
  isActive: boolean;
}

const emptySpeaker: Speaker = { name: "", photo: "", role: "", isActive: true };

const emptyPromotion: Promotion = {
  badge: "",
  title: "",
  subtitle: "",
  banner: "",
  highlights: [],
  ctaText: "",
  ctaLink: "",
  deadline: "",
  language: "de",
  isActive: true,
};

const emptyEvent: ScheduleEvent = {
  day: "",
  date: "",
  time: "",
  timezone: "CET",
  title: "",
  speaker: "",
  speakerId: null,
  type: "trading",
  typeBadge: "",
  banner: "",
  highlights: [],
  link: "",
  language: "de",
  isActive: true,
};

const LANG_LABELS: Record<string, string> = { de: "DE", en: "EN", ru: "RU" };
const LANG_COLORS: Record<string, string> = {
  de: "bg-yellow-100 text-yellow-700",
  en: "bg-blue-100 text-blue-700",
  ru: "bg-red-100 text-red-700",
};

function AdminPage() {
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuthError = (res: Response) => {
    if (res.status === 401) {
      setIsLoggedIn(false);
      setAdminPassword("");
      setLoginError("Sitzung abgelaufen. Bitte erneut anmelden.");
      return true;
    }
    return false;
  };

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatFilterType, setChatFilterType] = useState("all");
  const [chatDateFrom, setChatDateFrom] = useState("");
  const [chatDateTo, setChatDateTo] = useState("");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const [speakersList, setSpeakersList] = useState<Speaker[]>([]);
  const [speakersLoading, setSpeakersLoading] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [speakerFormOpen, setSpeakerFormOpen] = useState(false);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoFormOpen, setPromoFormOpen] = useState(false);

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);

  const [promoApps, setPromoApps] = useState<any[]>([]);
  const [promoAppsLoading, setPromoAppsLoading] = useState(false);

  const [dennisPromos, setDennisPromos] = useState<any[]>([]);
  const [dennisPromosLoading, setDennisPromosLoading] = useState(false);
  const [editingDennisPromo, setEditingDennisPromo] = useState<any | null>(null);
  const [dennisPromoFormOpen, setDennisPromoFormOpen] = useState(false);
  const [promoSubTab, setPromoSubTab] = useState<"offers" | "applications">("offers");

  const [inviteEvents, setInviteEvents] = useState<InviteEvent[]>([]);
  const [adminPartners, setAdminPartners] = useState<AdminPartner[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [editingInvite, setEditingInvite] = useState<Partial<InviteEvent> | null>(null);
  const [inviteFormOpen, setInviteFormOpen] = useState(false);
  const [selectedInviteReport, setSelectedInviteReport] = useState<InviteEvent | null>(null);
  const [inviteGuests, setInviteGuests] = useState<InviteGuest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      "x-admin-password": adminPassword,
    }),
    [adminPassword]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAdminPassword(password);
        setIsLoggedIn(true);
        setPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.message || "Falsches Passwort");
      }
    } catch {
      setLoginError("Verbindungsfehler");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminPassword("");
    setPassword("");
    setChatSessions([]);
    setPromotions([]);
    setEvents([]);
    setSpeakersList([]);
  };

  const fetchChatSessions = useCallback(async () => {
    setChatLoading(true);
    try {
      const params = new URLSearchParams();
      if (chatFilterType !== "all") params.set("type", chatFilterType);
      if (chatDateFrom) params.set("from", chatDateFrom);
      if (chatDateTo) params.set("to", chatDateTo);
      const res = await fetch(`/api/admin/chat-sessions?${params.toString()}`, {
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setChatSessions(await res.json());
      } else {
        setErrorMsg("Fehler beim Laden der Chat-Sitzungen");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setChatLoading(false);
    }
  }, [chatFilterType, chatDateFrom, chatDateTo, headers]);

  const exportCSV = async () => {
    try {
      const res = await fetch("/api/admin/chat-sessions/export", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chat-sessions.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        setErrorMsg("Export fehlgeschlagen");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchPromoApps = useCallback(async () => {
    setPromoAppsLoading(true);
    try {
      const res = await fetch("/api/admin/promo-applications", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setPromoApps(await res.json());
      else setErrorMsg("Fehler beim Laden der Promo-Anträge");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setPromoAppsLoading(false);
    }
  }, [headers]);

  const updatePromoAppStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/promo-applications/${id}/status`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status }),
      });
      if (handleAuthError(res)) return;
      if (res.ok) fetchPromoApps();
      else setErrorMsg("Fehler beim Aktualisieren");
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const exportPromoAppsCSV = () => {
    const csvHeader = "ID,Name,Email,CU Number,Status,Date\n";
    const csvRows = promoApps.map((a: any) =>
      `${a.id},"${a.name}","${a.email}","${a.cuNumber}","${a.status}","${new Date(a.createdAt).toLocaleString()}"`
    ).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `promo-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchDennisPromos = useCallback(async () => {
    setDennisPromosLoading(true);
    try {
      const res = await fetch("/api/admin/dennis-promos", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setDennisPromos(await res.json());
      else setErrorMsg("Fehler beim Laden der Dennis Promos");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setDennisPromosLoading(false);
    }
  }, [headers]);

  const saveDennisPromo = async (promo: any) => {
    const method = promo.id ? "PUT" : "POST";
    const url = promo.id ? `/api/admin/dennis-promos/${promo.id}` : "/api/admin/dennis-promos";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(promo) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setDennisPromoFormOpen(false);
        setEditingDennisPromo(null);
        fetchDennisPromos();
      } else {
        setErrorMsg("Fehler beim Speichern");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deleteDennisPromo = async (id: number) => {
    if (!confirm("Promo wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/dennis-promos/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchDennisPromos();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchSpeakers = useCallback(async () => {
    setSpeakersLoading(true);
    try {
      const res = await fetch("/api/admin/speakers", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setSpeakersList(await res.json());
      else setErrorMsg("Fehler beim Laden der Sprecher");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setSpeakersLoading(false);
    }
  }, [headers]);

  const saveSpeaker = async (speaker: Speaker) => {
    const method = speaker.id ? "PUT" : "POST";
    const url = speaker.id ? `/api/admin/speakers/${speaker.id}` : "/api/admin/speakers";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(speaker) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setSpeakerFormOpen(false);
        setEditingSpeaker(null);
        fetchSpeakers();
      } else {
        setErrorMsg("Fehler beim Speichern");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deleteSpeaker = async (id: number) => {
    if (!confirm("Sprecher wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/speakers/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchSpeakers();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchPromotions = useCallback(async () => {
    setPromoLoading(true);
    try {
      const res = await fetch("/api/admin/promotions", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setPromotions(await res.json());
      else setErrorMsg("Fehler beim Laden der Aktionen");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setPromoLoading(false);
    }
  }, [headers]);

  const savePromotion = async (promo: Promotion) => {
    const method = promo.id ? "PUT" : "POST";
    const url = promo.id ? `/api/admin/promotions/${promo.id}` : "/api/admin/promotions";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(promo) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setPromoFormOpen(false);
        setEditingPromo(null);
        fetchPromotions();
      } else {
        setErrorMsg("Fehler beim Speichern der Aktion");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deletePromotion = async (id: number) => {
    if (!confirm("Aktion wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchPromotions();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const res = await fetch("/api/admin/schedule-events", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setEvents(await res.json());
      else setErrorMsg("Fehler beim Laden der Events");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setEventsLoading(false);
    }
  }, [headers]);

  const saveEvent = async (event: ScheduleEvent) => {
    const method = event.id ? "PUT" : "POST";
    const url = event.id ? `/api/admin/schedule-events/${event.id}` : "/api/admin/schedule-events";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(event) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setEventFormOpen(false);
        setEditingEvent(null);
        fetchEvents();
      } else {
        setErrorMsg("Fehler beim Speichern des Events");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const deleteEvent = async (id: number) => {
    if (!confirm("Event wirklich löschen?")) return;
    try {
      const res = await fetch(`/api/admin/schedule-events/${id}`, { method: "DELETE", headers: headers() });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchEvents();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setAdminPartners(await res.json());
    } catch {}
  }, [headers]);

  const fetchInviteEvents = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const res = await fetch("/api/admin/invite-events", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) setInviteEvents(await res.json());
      else setErrorMsg("Fehler beim Laden der Einladungen");
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setInvitesLoading(false);
    }
  }, [headers]);

  const saveInviteEvent = async (event: Partial<InviteEvent>) => {
    const method = "POST";
    const url = "/api/admin/invite-events";
    try {
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(event) });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setInviteFormOpen(false);
        setEditingInvite(null);
        fetchInviteEvents();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Fehler beim Speichern");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const fetchInviteReport = async (id: number) => {
    setGuestsLoading(true);
    try {
      const res = await fetch(`/api/admin/invite-events/${id}/report`, { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) {
        const data = await res.json();
        setInviteGuests(data.guests);
        setSelectedInviteReport(data.event);
      } else {
        setErrorMsg("Fehler beim Laden des Berichts");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setGuestsLoading(false);
    }
  };

  const sendInviteTelegramReport = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/invite-events/${id}/send-report`, {
        method: "POST",
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      if (res.ok) {
        alert("Bericht gesendet!");
      } else {
        setErrorMsg("Fehler beim Senden des Berichts");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  const syncZoomData = async (eventId: number) => {
    try {
      const res = await fetch(`/api/admin/zoom-sync/${eventId}`, {
        method: "POST",
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      const data = await res.json();
      if (data.error) {
        alert(`Zoom Sync: ${data.error}`);
      } else {
        alert(`Zoom Sync: ${data.synced} synchronisiert, ${data.skipped} übersprungen`);
        fetchInviteEvents();
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === "chat") fetchChatSessions();
    if (activeTab === "promotions") fetchPromotions();
    if (activeTab === "schedule") { fetchEvents(); fetchSpeakers(); }
    if (activeTab === "speakers") fetchSpeakers();
    if (activeTab === "promo") { fetchPromoApps(); fetchDennisPromos(); }
    if (activeTab === "invites") fetchInviteEvents();
    if (activeTab === "partners") fetchPartners();
  }, [isLoggedIn, activeTab, fetchChatSessions, fetchPromotions, fetchEvents, fetchSpeakers, fetchPromoApps, fetchInviteEvents, fetchPartners]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">JetApp Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Admin-Bereich Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                data-testid="input-admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Passwort"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                data-testid="button-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && (
              <p data-testid="text-login-error" className="text-red-500 text-sm text-center">
                {loginError}
              </p>
            )}
            <button
              data-testid="button-admin-login"
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loginLoading ? "..." : "Einloggen"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "chat", label: "Chat Logs", icon: <MessageSquare size={18} /> },
    { key: "promotions", label: "Aktionen", icon: <Tag size={18} /> },
    { key: "schedule", label: "Webinare", icon: <Calendar size={18} /> },
    { key: "speakers", label: "Sprecher", icon: <Users size={18} /> },
    { key: "promo", label: "Promo", icon: <Gift size={18} /> },
    { key: "invites", label: "Invites", icon: <LinkIcon size={18} /> },
    { key: "partners", label: "Partners", icon: <UserCheck size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {errorMsg && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-500 text-white px-6 py-3 flex items-center justify-between" data-testid="error-banner">
          <span className="text-sm font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-white hover:text-red-100"><X size={18} /></button>
        </div>
      )}
      <header className={`bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky ${errorMsg ? 'top-10' : 'top-0'} z-50`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">JetApp Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              data-testid={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <button
          data-testid="button-admin-logout"
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <main className="flex-1 p-6">
        {activeTab === "chat" && (
          <ChatLogsTab
            sessions={chatSessions}
            loading={chatLoading}
            filterType={chatFilterType}
            setFilterType={setChatFilterType}
            dateFrom={chatDateFrom}
            setDateFrom={setChatDateFrom}
            dateTo={chatDateTo}
            setDateTo={setChatDateTo}
            onSearch={fetchChatSessions}
            onExport={exportCSV}
            expandedSession={expandedSession}
            setExpandedSession={setExpandedSession}
            headers={headers}
          />
        )}
        {activeTab === "promotions" && (
          <PromotionsTab
            promotions={promotions}
            loading={promoLoading}
            formOpen={promoFormOpen}
            setFormOpen={setPromoFormOpen}
            editing={editingPromo}
            setEditing={setEditingPromo}
            onSave={savePromotion}
            onDelete={deletePromotion}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "schedule" && (
          <ScheduleTab
            events={events}
            loading={eventsLoading}
            formOpen={eventFormOpen}
            setFormOpen={setEventFormOpen}
            editing={editingEvent}
            setEditing={setEditingEvent}
            onSave={saveEvent}
            onDelete={deleteEvent}
            speakers={speakersList}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "speakers" && (
          <SpeakersTab
            speakers={speakersList}
            loading={speakersLoading}
            formOpen={speakerFormOpen}
            setFormOpen={setSpeakerFormOpen}
            editing={editingSpeaker}
            setEditing={setEditingSpeaker}
            onSave={saveSpeaker}
            onDelete={deleteSpeaker}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "promo" && (
          <DennisPromoTab
            dennisPromos={dennisPromos}
            dennisPromosLoading={dennisPromosLoading}
            formOpen={dennisPromoFormOpen}
            setFormOpen={setDennisPromoFormOpen}
            editing={editingDennisPromo}
            setEditing={setEditingDennisPromo}
            onSave={saveDennisPromo}
            onDelete={deleteDennisPromo}
            promoApps={promoApps}
            promoAppsLoading={promoAppsLoading}
            updatePromoAppStatus={updatePromoAppStatus}
            exportPromoAppsCSV={exportPromoAppsCSV}
            promoSubTab={promoSubTab}
            setPromoSubTab={setPromoSubTab}
            adminPassword={adminPassword}
          />
        )}
        {activeTab === "invites" && (
          <InvitesTab
            events={inviteEvents}
            loading={invitesLoading}
            formOpen={inviteFormOpen}
            setFormOpen={setInviteFormOpen}
            editing={editingInvite}
            setEditing={setEditingInvite}
            onSave={saveInviteEvent}
            onReport={fetchInviteReport}
            onSendTelegramReport={sendInviteTelegramReport}
            onZoomSync={syncZoomData}
            selectedReport={selectedInviteReport}
            setSelectedReport={setSelectedInviteReport}
            guests={inviteGuests}
            guestsLoading={guestsLoading}
            headers={headers}
          />
        )}
        {activeTab === "partners" && (
          <PartnersTab partners={adminPartners} />
        )}
      </main>
    </div>
  );
}

function ChatLogsTab({
  sessions, loading, filterType, setFilterType, dateFrom, setDateFrom, dateTo, setDateTo, onSearch, onExport, expandedSession, setExpandedSession, headers,
}: {
  sessions: ChatSession[]; loading: boolean; filterType: string; setFilterType: (v: string) => void;
  dateFrom: string; setDateFrom: (v: string) => void; dateTo: string; setDateTo: (v: string) => void;
  onSearch: () => void; onExport: () => void; expandedSession: string | null; setExpandedSession: (v: string | null) => void;
  headers: () => Record<string, string>;
}) {
  const [loadedMessages, setLoadedMessages] = useState<Record<string, any[]>>({});
  const [messagesLoading, setMessagesLoading] = useState<string | null>(null);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState<string | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [analysisLang, setAnalysisLang] = useState<string>("all");
  const [analysisChatType, setAnalysisChatType] = useState<string>("text");
  const [analysisReportLang, setAnalysisReportLang] = useState<string>("de");
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const handleSyncSheets = async () => {
    setSheetsSyncing(true);
    setSheetsError(null);
    setSheetsUrl(null);
    try {
      const res = await fetch("/api/admin/sync-sheets", { method: "POST", headers: headers() });
      if (res.ok) {
        const data = await res.json();
        setSheetsUrl(data.spreadsheetUrl);
      } else {
        const err = await res.json().catch(() => ({}));
        setSheetsError(err.error || "Sync fehlgeschlagen");
      }
    } catch {
      setSheetsError("Verbindungsfehler");
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalysisRunning(true);
    setAnalysisError(null);
    setAnalysisReport(null);
    setExpandedSections({});
    try {
      const res = await fetch("/api/admin/analyze-maria", {
        method: "POST",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ language: analysisLang, chatType: analysisChatType, reportLanguage: analysisReportLang }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisReport(data);
        const initial: Record<number, boolean> = {};
        data.sections?.forEach((_: any, i: number) => { initial[i] = true; });
        setExpandedSections(initial);
      } else {
        const err = await res.json().catch(() => ({}));
        setAnalysisError(err.error || "Analyse fehlgeschlagen");
      }
    } catch {
      setAnalysisError("Verbindungsfehler");
    } finally {
      setAnalysisRunning(false);
    }
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleExpand = async (sessionId: string) => {
    if (expandedSession === sessionId) { setExpandedSession(null); return; }
    setExpandedSession(sessionId);
    if (!loadedMessages[sessionId]) {
      setMessagesLoading(sessionId);
      try {
        const res = await fetch(`/api/admin/chat-sessions/${sessionId}/messages`, { headers: headers() });
        if (res.ok) {
          const msgs = await res.json();
          setLoadedMessages((prev) => ({ ...prev, [sessionId]: msgs }));
        }
      } catch {}
      setMessagesLoading(null);
    }
  };

  const handleExportSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/chat-sessions/${sessionId}/export`, { headers: headers() });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat-${sessionId.substring(0, 8)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Typ</label>
            <select data-testid="select-chat-type" value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">Alle</option>
              <option value="text">Text</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Von</label>
            <input data-testid="input-date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bis</label>
            <input data-testid="input-date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button data-testid="button-search-chats" onClick={onSearch}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Search size={16} /> Suchen
          </button>
          <button data-testid="button-export-csv" onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-auto">
            <Download size={16} /> Export CSV
          </button>
          <button data-testid="button-sync-sheets" onClick={handleSyncSheets} disabled={sheetsSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {sheetsSyncing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {sheetsSyncing ? "Sync..." : "Google Sheets"}
          </button>
        </div>
        {sheetsUrl && (
          <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <Check size={16} />
            <span>Synchronisiert!</span>
            <a href={sheetsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-700 underline font-medium hover:text-green-900" data-testid="link-sheets-url">
              Google Sheet öffnen <ExternalLink size={14} />
            </a>
          </div>
        )}
        {sheetsError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {sheetsError}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Modus</label>
              <select data-testid="select-analysis-type" value={analysisChatType} onChange={(e) => setAnalysisChatType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="text">Text Chat</option>
                <option value="video">Live Avatar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dialoge</label>
              <select data-testid="select-analysis-lang" value={analysisLang} onChange={(e) => setAnalysisLang(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">Alle Sprachen</option>
                <option value="de">Deutsch</option>
                <option value="ru">Russisch</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Bericht</label>
              <select data-testid="select-report-lang" value={analysisReportLang} onChange={(e) => setAnalysisReportLang(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="de">Deutsch</option>
                <option value="ru">Russisch</option>
              </select>
            </div>
            <div className="pt-5">
              <button data-testid="button-analyze-maria" onClick={handleAnalyze} disabled={analysisRunning}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {analysisRunning ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                {analysisRunning ? "Analyse läuft..." : "Analyse Марии"}
              </button>
            </div>
          </div>
          {analysisError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {analysisError}
            </div>
          )}
        </div>
      </div>

      {analysisReport && (
        <div className="bg-white rounded-xl border border-indigo-200 overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-indigo-600" />
              <div>
                <h3 className="font-semibold text-indigo-900" data-testid="text-analysis-title">
                  Analyse — {analysisChatType === "video" ? "Live Avatar" : "Text Chat"}
                </h3>
                <p className="text-xs text-indigo-600" data-testid="text-analysis-count">{analysisReport.sessionsAnalyzed} Sitzungen analysiert</p>
              </div>
            </div>
            <button data-testid="button-close-analysis" onClick={() => setAnalysisReport(null)}
              className="p-1 text-indigo-400 hover:text-indigo-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800" data-testid="text-analysis-summary">
              {analysisReport.summary}
            </div>
            <div className="space-y-3">
              {analysisReport.sections.map((section, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button data-testid={`button-section-${idx}`} onClick={() => toggleSection(idx)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                    <span className="font-medium text-sm text-gray-800">{section.title}</span>
                    {expandedSections[idx] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  {expandedSections[idx] && (
                    <div className="p-3 space-y-2">
                      {section.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex gap-2 text-sm text-gray-700" data-testid={`text-analysis-item-${idx}-${iIdx}`}>
                          <span className="text-indigo-400 mt-0.5 shrink-0">&#8226;</span>
                          <span className="whitespace-pre-wrap">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : sessions.length === 0 ? (
          <div data-testid="text-no-sessions" className="p-8 text-center text-gray-500">Keine Chat-Sitzungen gefunden</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Session ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Typ</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sprache</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Datum</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nachrichten</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <React.Fragment key={session.sessionId}>
                  <tr data-testid={`row-session-${session.sessionId}`}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleExpand(session.sessionId)}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">{session.sessionId.substring(0, 12)}...</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${session.type === "video" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{session.type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{session.language}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(session.createdAt).toLocaleDateString("de-DE")}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{session.messageCount || 0}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button
                        data-testid={`button-export-session-${session.sessionId}`}
                        onClick={(e) => handleExportSession(e, session.sessionId)}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                        title="Download CSV"
                      >
                        <Download size={14} />
                      </button>
                      <span className="text-gray-400">{expandedSession === session.sessionId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
                    </td>
                  </tr>
                  {expandedSession === session.sessionId && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        <div className="max-h-96 overflow-y-auto space-y-2 px-2">
                          {messagesLoading === session.sessionId ? (
                            <p className="text-sm text-gray-400 text-center py-4">Laden...</p>
                          ) : (loadedMessages[session.sessionId] || []).length > 0 ? (
                            (loadedMessages[session.sessionId] || []).map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-purple-600 text-white rounded-br-md" : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"}`}>
                                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.role === "user" ? "User" : "Maria"}</p>
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-4">Keine Nachrichten</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SpeakersTab({
  speakers, loading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete, adminPassword,
}: {
  speakers: Speaker[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: Speaker | null; setEditing: (v: Speaker | null) => void;
  onSave: (s: Speaker) => void; onDelete: (id: number) => void; adminPassword: string;
}) {
  const openNew = () => { setEditing({ ...emptySpeaker }); setFormOpen(true); };
  const openEdit = (s: Speaker) => { setEditing({ ...s }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Sprecher / Speakers</h2>
        <button data-testid="button-new-speaker" onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          <Plus size={16} /> Neuer Sprecher
        </button>
      </div>

      {formOpen && editing && (
        <SpeakerForm speaker={editing} setSpeaker={setEditing} onSave={() => onSave(editing)} onClose={closeForm} adminPassword={adminPassword} />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : speakers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Keine Sprecher vorhanden</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {speakers.map((s) => (
            <div key={s.id} data-testid={`card-speaker-${s.id}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start gap-4">
                {s.photo ? (
                  <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center"><Users size={24} className="text-gray-400" /></div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500">{s.role}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {s.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button data-testid={`button-edit-speaker-${s.id}`} onClick={() => openEdit(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={14} /> Bearbeiten
                </button>
                <button data-testid={`button-delete-speaker-${s.id}`} onClick={() => s.id && onDelete(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpeakerForm({ speaker, setSpeaker, onSave, onClose, adminPassword }: {
  speaker: Speaker; setSpeaker: (s: Speaker) => void; onSave: () => void; onClose: () => void; adminPassword: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSpeaker({ ...speaker, photo: data.url });
      }
    } catch {}
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{speaker.id ? "Sprecher bearbeiten" : "Neuer Sprecher"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <InputField label="Name" value={speaker.name} onChange={(v) => setSpeaker({ ...speaker, name: v })} testId="input-speaker-name" />
        <InputField label="Rolle" value={speaker.role} onChange={(v) => setSpeaker({ ...speaker, role: v })} testId="input-speaker-role" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Foto</label>
          <div className="flex items-center gap-3">
            {speaker.photo ? (
              <img src={speaker.photo} alt="preview" className="w-16 h-16 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center"><ImageIcon size={24} className="text-gray-400" /></div>
            )}
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Foto hochladen
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <InputField label="oder Foto URL" value={speaker.photo} onChange={(v) => setSpeaker({ ...speaker, photo: v })} testId="input-speaker-photo" />
        </div>
        <ToggleField label="Aktiv" value={speaker.isActive} onChange={(v) => setSpeaker({ ...speaker, isActive: v })} testId="toggle-speaker-active" />
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-speaker" onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Check size={16} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function PromotionsTab({
  promotions, loading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete, adminPassword,
}: {
  promotions: Promotion[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: Promotion | null; setEditing: (v: Promotion | null) => void;
  onSave: (p: Promotion) => void; onDelete: (id: number) => void; adminPassword: string;
}) {
  const openNew = () => { setEditing({ ...emptyPromotion }); setFormOpen(true); };
  const openEdit = (p: Promotion) => { setEditing({ ...p }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Aktionen / Promotions</h2>
        <button data-testid="button-new-promotion" onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          <Plus size={16} /> Neue Aktion
        </button>
      </div>

      {formOpen && editing && (
        <PromotionForm promo={editing} setPromo={setEditing} onSave={onSave} onClose={closeForm} adminPassword={adminPassword} />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Keine Aktionen vorhanden</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => (
            <div key={promo.id} data-testid={`card-promotion-${promo.id}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {promo.badge && (
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{promo.badge}</span>
                    )}
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${LANG_COLORS[promo.language] || "bg-gray-100 text-gray-600"}`}>
                      {LANG_LABELS[promo.language] || promo.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{promo.title}</h3>
                  <p className="text-sm text-gray-500">{promo.subtitle}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {promo.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              {promo.highlights && promo.highlights.length > 0 && promo.highlights.some(h => h.trim()) && (
                <p className="text-sm text-gray-600 whitespace-pre-line">{promo.highlights.join("\n")}</p>
              )}
              {promo.deadline && <p className="text-xs text-gray-400">Deadline: {promo.deadline}</p>}
              {promo.translationGroup && (
                <p className="text-xs text-gray-400 flex items-center gap-1"><Globe size={12} /> Gruppe: {promo.translationGroup.substring(0, 8)}...</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button data-testid={`button-edit-promotion-${promo.id}`} onClick={() => openEdit(promo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={14} /> Bearbeiten
                </button>
                <button data-testid={`button-delete-promotion-${promo.id}`} onClick={() => promo.id && onDelete(promo.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionForm({ promo, setPromo, onSave, onClose, adminPassword }: {
  promo: Promotion; setPromo: (p: Promotion) => void;
  onSave: (p: Promotion) => void; onClose: () => void; adminPassword: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPromo({ ...promo, banner: data.url });
      }
    } catch {}
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{promo.id ? "Aktion bearbeiten" : "Neue Aktion"}</h3>
          <button data-testid="button-close-promo-form" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sprache</label>
            <select data-testid="select-promo-language" value={promo.language} onChange={(e) => setPromo({ ...promo, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <InputField label="Badge" value={promo.badge} onChange={(v) => setPromo({ ...promo, badge: v })} testId="input-promo-badge" />
        </div>
        <InputField label="Titel" value={promo.title} onChange={(v) => setPromo({ ...promo, title: v })} testId="input-promo-title" />
        <InputField label="Subtitle" value={promo.subtitle} onChange={(v) => setPromo({ ...promo, subtitle: v })} testId="input-promo-subtitle" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Banner</label>
          <div className="flex items-center gap-3">
            {promo.banner && <img src={promo.banner} alt="banner" className="h-16 rounded-lg object-cover" />}
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Banner hochladen
              <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
            </label>
          </div>
          <InputField label="oder Banner URL" value={promo.banner} onChange={(v) => setPromo({ ...promo, banner: v })} testId="input-promo-banner" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Text</label>
          <textarea data-testid="textarea-promo-highlights" value={(promo.highlights || []).join("\n")}
            onChange={(e) => setPromo({ ...promo, highlights: e.target.value.split("\n") })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
              }
            }}
            rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="CTA Text" value={promo.ctaText} onChange={(v) => setPromo({ ...promo, ctaText: v })} testId="input-promo-cta-text" />
          <InputField label="CTA Link" value={promo.ctaLink} onChange={(v) => setPromo({ ...promo, ctaLink: v })} testId="input-promo-cta-link" />
        </div>
        <InputField label="Deadline" value={promo.deadline} onChange={(v) => setPromo({ ...promo, deadline: v })} testId="input-promo-deadline" />
        <ToggleField label="Aktiv" value={promo.isActive} onChange={(v) => setPromo({ ...promo, isActive: v })} testId="toggle-promo-active" />
        <div className="flex justify-end gap-3 pt-2">
          <button data-testid="button-cancel-promo" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-promo" onClick={() => onSave(promo)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Check size={16} /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({
  events, loading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete, speakers, adminPassword,
}: {
  events: ScheduleEvent[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: ScheduleEvent | null; setEditing: (v: ScheduleEvent | null) => void;
  onSave: (e: ScheduleEvent) => void; onDelete: (id: number) => void;
  speakers: Speaker[]; adminPassword: string;
}) {
  const openNew = () => { setEditing({ ...emptyEvent }); setFormOpen(true); };
  const openEdit = (e: ScheduleEvent) => { setEditing({ ...e }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Webinare & Termine</h2>
        <button data-testid="button-new-event" onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
          <Plus size={16} /> Neues Event
        </button>
      </div>

      {formOpen && editing && (
        <EventForm event={editing} setEvent={setEditing} onSave={onSave} onClose={closeForm} speakers={speakers} adminPassword={adminPassword} />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Keine Events vorhanden</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} data-testid={`card-event-${event.id}`} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${event.type === "trading" ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {event.typeBadge || event.type}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${LANG_COLORS[event.language] || "bg-gray-100 text-gray-600"}`}>
                      {LANG_LABELS[event.language] || event.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.speaker}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${event.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {event.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{event.day}, {event.date} - {event.time} {event.timezone || "CET"}</p>
              </div>
              {event.highlights && event.highlights.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {event.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5"><Check size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />{h}</li>
                  ))}
                </ul>
              )}
              {event.translationGroup && (
                <p className="text-xs text-gray-400 flex items-center gap-1"><Globe size={12} /> Gruppe: {event.translationGroup.substring(0, 8)}...</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button data-testid={`button-edit-event-${event.id}`} onClick={() => openEdit(event)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={14} /> Bearbeiten
                </button>
                {(event.banner || event.speakerPhoto) && (
                  <button data-testid={`button-download-banner-${event.id}`} onClick={() => openEdit(event)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <Download size={14} /> Banner
                  </button>
                )}
                <button data-testid={`button-delete-event-${event.id}`} onClick={() => event.id && onDelete(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} /> Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventForm({ event, setEvent, onSave, onClose, speakers, adminPassword }: {
  event: ScheduleEvent; setEvent: (e: ScheduleEvent) => void;
  onSave: (e: ScheduleEvent) => void; onClose: () => void;
  speakers: Speaker[]; adminPassword: string;
}) {

  const bannerRef = useRef<HTMLDivElement>(null);

  const handleSpeakerSelect = (speakerId: string) => {
    if (speakerId === "") {
      setEvent({ ...event, speakerId: null, speaker: "", speakerPhoto: null });
      return;
    }
    const id = parseInt(speakerId);
    const found = speakers.find(s => s.id === id);
    if (found) {
      setEvent({ ...event, speakerId: found.id, speaker: found.name, speakerPhoto: found.photo || null });
    }
  };

  const currentSpeakerPhoto = event.speakerPhoto || speakers.find(s => s.id === event.speakerId)?.photo || "";

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">{event.id ? "Event bearbeiten" : "Neues Event"}</h3>
          <button data-testid="button-close-event-form" onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto flex-1 custom-scrollbar">

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Sprache</label>
            <select data-testid="select-event-language" value={event.language} onChange={(e) => setEvent({ ...event, language: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="de">Deutsch</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Typ</label>
            <select data-testid="select-event-type" value={event.type} onChange={(e) => setEvent({ ...event, type: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="trading">Trading</option>
              <option value="partner">Partner</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Tag (z.B. Mittwoch)" value={event.day} onChange={(v) => setEvent({ ...event, day: v })} testId="input-event-day" />
          <InputField label="Datum (z.B. Jeden Mittwoch)" value={event.date} onChange={(v) => setEvent({ ...event, date: v })} testId="input-event-date" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Uhrzeit</label>
            <input data-testid="input-event-time" type="time" value={event.time}
              onChange={(e) => setEvent({ ...event, time: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Zeitzone</label>
            <select data-testid="select-event-timezone" value={event.timezone || "CET"}
              onChange={(e) => setEvent({ ...event, timezone: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="CET">CET (Berlin)</option>
              <option value="CEST">CEST (Berlin Sommer)</option>
              <option value="MSK">MSK (Moskau)</option>
              <option value="EST">EST (New York)</option>
              <option value="GST">GST (Dubai)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <InputField label="Titel" value={event.title} onChange={(v) => setEvent({ ...event, title: v })} testId="input-event-title" />

        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Sprecher</label>
          <select data-testid="select-event-speaker" value={event.speakerId || ""}
            onChange={(e) => handleSpeakerSelect(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
            <option value="">-- Sprecher wählen --</option>
            {speakers.filter(s => s.isActive).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
            ))}
          </select>
          {event.speakerId && currentSpeakerPhoto && (
            <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 rounded-lg">
              <img src={currentSpeakerPhoto} alt={event.speaker} className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-[13px] font-medium text-gray-700">{event.speaker}</span>
            </div>
          )}
          {!event.speakerId && (
            <InputField label="oder manuell eingeben" value={event.speaker} onChange={(v) => setEvent({ ...event, speaker: v })} testId="input-event-speaker" />
          )}
        </div>

        <InputField label="Typ Badge" value={event.typeBadge} onChange={(v) => setEvent({ ...event, typeBadge: v })} testId="input-event-type-badge" />

        <div>
          <label className="block text-[10px] font-medium text-gray-400 mb-0.5">Highlights (eine pro Zeile)</label>
          <textarea data-testid="textarea-event-highlights" value={(event.highlights || []).join("\n")}
            onChange={(e) => setEvent({ ...event, highlights: e.target.value.split("\n") })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
              }
            }}
            rows={2} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
        </div>

        <InputField label="Link" value={event.link} onChange={(v) => setEvent({ ...event, link: v })} testId="input-event-link" />

        <ToggleField label="Aktiv" value={event.isActive} onChange={(v) => setEvent({ ...event, isActive: v })} testId="toggle-event-active" />

        {(currentSpeakerPhoto || event.banner) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-medium text-gray-400">Banner Vorschau</label>
              <button
                type="button"
                data-testid="button-download-banner-preview"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const W = 1200, H = 660;
                  const tz = event.timezone || "CET";
                  const tripleTime = event.time ? convertTripleTime(event.time, tz) : "";
                  const titleLen = event.title?.length || 0;
                  const titleFontSize = titleLen > 40 ? 36 : titleLen > 25 ? 42 : 48;
                  const sloganWords = event.language === "ru" ? ["СТРУКТУРА", "ПРОЗРАЧНОСТЬ", "КОНТРОЛЬ"] :
                    event.language === "en" ? ["STRUCTURE", "TRANSPARENCY", "CONTROL"] :
                    ["STRUKTUR", "TRANSPARENZ", "KONTROLLE"];
                  const speakerName = event.speaker || "Name";
                  const spkFontSize = speakerName.length > 20 ? 16 : speakerName.length > 15 ? 18 : 20;
                  const dateStr = [formatDate(event.date), event.day].filter(Boolean).join(" · ") || "Datum";

                  const wrapper = document.createElement("div");
                  wrapper.style.cssText = `position:fixed;left:-9999px;top:0;width:${W}px;height:${H}px;overflow:hidden;z-index:-1;`;
                  const inner = document.createElement("div");
                  inner.style.cssText = `width:${W}px;height:${H}px;position:relative;background:linear-gradient(-29deg,rgb(182,139,255) 0%,rgb(255,255,255) 69%);font-family:Montserrat,sans-serif;overflow:hidden;margin:0;padding:0;`;

                  const gridHtml = Array.from({length:40},()=>'<div style="background:#f3f4f6;opacity:0.18;border-radius:2px;"></div>').join("");
                  inner.innerHTML = `
                    <div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(5,1fr);gap:2px;padding:8px;pointer-events:none;">${gridHtml}</div>
                    <img src="/jetup-logo-banner.png" crossorigin="anonymous" style="position:absolute;left:40px;top:60px;height:48px;width:auto;z-index:10;" />
                    <p style="position:absolute;left:40px;top:200px;z-index:10;color:#1a1a1a;font-weight:700;font-size:32px;line-height:1.2;margin:0;">Zoom Call</p>
                    <h3 style="position:absolute;left:40px;top:240px;z-index:10;width:620px;color:#7C3AED;font-weight:800;font-size:${titleFontSize}px;line-height:1.1;text-transform:uppercase;word-break:break-word;letter-spacing:-0.02em;margin:0;">\u201C${event.title || "Webinar Titel"}\u201D</h3>
                    <div style="position:absolute;left:40px;top:420px;z-index:10;width:620px;">
                      <div style="margin:0;padding:0;line-height:1.2;display:flex;flex-direction:column;align-items:flex-start;">
                        <span style="color:#1a1a1a;font-weight:700;font-size:32px;margin:0 0 2px 0;text-align:left;display:block;">${dateStr}</span>
                        ${tripleTime ? `<span style="color:#9ca3af;font-weight:500;font-size:24px;margin:0;text-align:left;display:block;white-space:nowrap;">(${tripleTime})</span>` : ""}
                      </div>
                    </div>
                    <div style="position:absolute;left:40px;top:590px;z-index:10;">
                      ${sloganWords.map((w,i) => `${i > 0 ? '<span style="color:#a855f7;font-size:22px;margin:0 10px;vertical-align:middle;">•</span>' : ''}<span style="font-weight:700;color:#111827;text-transform:uppercase;font-size:18px;letter-spacing:3px;vertical-align:middle;">${w}</span>`).join("")}
                    </div>
                    <div style="position:absolute;left:720px;top:100px;z-index:10;width:440px;text-align:center;">
                      ${currentSpeakerPhoto ? `
                        <div style="position:relative;width:340px;height:340px;margin:0 auto 24px auto;overflow:hidden;border-radius:50%;">
                          <div style="position:absolute;inset:0;border-radius:50%;border:4px solid rgba(192,132,252,0.4);z-index:2;pointer-events:none;"></div>
                          <img src="${currentSpeakerPhoto}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block;" />
                        </div>
                        <div style="display:inline-block;background:white;border-radius:8px;padding:12px 28px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                          <span style="font-family:Inter,sans-serif;font-weight:700;color:black;font-size:${spkFontSize + 2}px;">Speaker: ${speakerName}</span>
                        </div>
                      ` : ''}
                    </div>`;

                  wrapper.appendChild(inner);
                  document.body.appendChild(wrapper);

                  const imgs = wrapper.querySelectorAll("img");
                  const loadPromises = Array.from(imgs).map(img => new Promise<void>((resolve) => {
                    if (img.complete && img.naturalWidth > 0) { resolve(); return; }
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                  }));

                  Promise.all(loadPromises).then(() => {
                    return new Promise(r => setTimeout(r, 300));
                  }).then(() => {
                    return html2canvas(inner, {
                      useCORS: true,
                      allowTaint: true,
                      scale: 2,
                      backgroundColor: null,
                      width: W,
                      height: H,
                      windowWidth: W,
                      windowHeight: H,
                      x: 0,
                      y: 0,
                      scrollX: 0,
                      scrollY: 0,
                      logging: false,
                    });
                  }).then(canvas => {
                    const dataUrl = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = dataUrl;
                    a.download = `banner-${event.title?.replace(/\s+/g, "-") || "webinar"}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    document.body.removeChild(wrapper);
                  }).catch((err) => {
                    console.error("Banner export error:", err);
                    try { document.body.removeChild(wrapper); } catch {}
                  });
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <Download size={12} /> Banner herunterladen
              </button>
            </div>
            <EventBannerPreview ref={bannerRef} event={event} speakerPhoto={currentSpeakerPhoto} />
          </div>
        )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          <button data-testid="button-cancel-event" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-event" onClick={() => onSave(event)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            <Check size={16} /> Speichern
          </button>
        </div>
      </div>
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

function convertTripleTime(time: string, fromTz: string): string {
  const [h, m] = time.split(":").map(Number);
  const TIMEZONE_OFFSETS: Record<string, number> = {
    CET: 1, CEST: 2, MSK: 3, GST: 4, UTC: 0
  };
  const fromOffset = TIMEZONE_OFFSETS[fromTz] ?? 1;
  
  const getZonedTime = (offset: number) => {
    let newH = h + (offset - fromOffset);
    if (newH >= 24) newH -= 24;
    if (newH < 0) newH += 24;
    return `${String(newH).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  };

  return `${getZonedTime(1)} BER | ${getZonedTime(3)} MSK | ${getZonedTime(4)} DXB`;
}

const EventBannerPreview = React.forwardRef<HTMLDivElement, { event: ScheduleEvent; speakerPhoto: string }>(({ event, speakerPhoto }, ref) => {
  const tz = event.timezone || "CET";
  const tripleTime = event.time ? convertTripleTime(event.time, tz) : "";

  const rows = 5;
  const cols = 8;
  const gridCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gridCells.push(<div key={`${r}-${c}`} className="bg-[#f3f4f6] rounded-[2px]" style={{ opacity: 0.18 }} />);
    }
  }

  return (
    <div ref={ref} className="relative w-full rounded-xl overflow-hidden shadow-lg"
      style={{ background: "linear-gradient(-29deg, rgb(182, 139, 255) 0%, rgb(255, 255, 255) 69%)", containerType: "inline-size" }}>
      <div className="pt-[55%]" />
      <div className="absolute inset-0 p-1 grid gap-[2px] pointer-events-none"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {gridCells}
      </div>

      <div className="absolute inset-0 flex">
        <div className="flex-1 flex flex-col justify-between z-10" style={{ maxWidth: "62%", padding: "12% 5% 4% 5%" }}>
          <img src="/jetup-logo-banner.png" alt="JetUP" className="h-[12%] w-auto object-contain self-start mb-[4%]" />

          <div className="space-y-[1%]">
            <p className="text-[#1a1a1a] font-bold leading-tight" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2.7cqw" }}>
              Zoom Call
            </p>
            <h3 className="text-[#7C3AED] font-extrabold leading-[1.1] uppercase break-words" style={{ fontFamily: "Montserrat, sans-serif", fontSize: ((event.title?.length || 0) > 40 ? "3cqw" : (event.title?.length || 0) > 25 ? "3.5cqw" : "4cqw"), letterSpacing: "-0.02em" }}>
              &ldquo;{event.title || "Webinar Titel"}&rdquo;
            </h3>
          </div>

          <div className="flex flex-col gap-[1%]">
            <div className="flex items-center gap-[1.5%] flex-wrap">
              <img src="/calendar-icon-banner.png" alt="" style={{ height: "2.2cqw" }} className="w-auto opacity-80" />
              <span className="text-[#1a1a1a] font-bold" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2.5cqw" }}>
                {[formatDate(event.date), event.day].filter(Boolean).join(" · ") || "Datum"}
              </span>
            </div>
            {tripleTime && (
              <span className="text-[#9ca3af] font-medium" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2cqw" }}>
                ({tripleTime})
              </span>
            )}
          </div>

          <div className="flex items-center gap-[2%]">
            {(event.language === "ru" ? ["СТРУКТУРА", "ПРОЗРАЧНОСТЬ", "КОНТРОЛЬ"] :
              event.language === "en" ? ["STRUCTURE", "TRANSPARENCY", "CONTROL"] :
              ["STRUKTUR", "TRANSPARENZ", "KONTROLLE"]).map((word, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="bg-[#a855f7] rounded-full" style={{ width: "0.7cqw", height: "0.7cqw" }} />}
                <span className="font-bold text-[#111827] uppercase" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "1.5cqw", letterSpacing: "0.3cqw", lineHeight: "1" }}>{word}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 pr-[3%]">
          {speakerPhoto ? (
            <>
              <div className="relative w-[70%] aspect-square">
                <div className="absolute -inset-[4%] rounded-full border-[3px] border-[#C084FC]/40" />
                <img src={speakerPhoto} alt="speaker" className="w-full h-full rounded-full object-cover object-top" />
              </div>
              <div className="mt-[4%] bg-white rounded px-[6%] py-[2%] shadow-sm w-fit max-w-[90%] overflow-hidden">
                <p className="font-semibold text-black text-center truncate" style={{ fontFamily: "Inter, sans-serif", fontSize: "2.2cqw" }}>
                  Speaker: {event.speaker || "Name"}
                </p>
              </div>
            </>
          ) : (
            <div className="w-[60%] aspect-square rounded-full bg-gradient-to-br from-[#C084FC]/20 to-[#A855F7]/10" />
          )}
        </div>
      </div>
    </div>
  );
});

function InputField({ label, value, onChange, testId }: {
  label: string; value: string; onChange: (v: string) => void; testId: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-gray-400 mb-0.5">{label}</label>
      <input 
        data-testid={testId} 
        type={label.toLowerCase().includes("datum") ? "date" : "text"} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" 
      />
    </div>
  );
}

function ToggleField({ label, value, onChange, testId }: {
  label: string; value: boolean; onChange: (v: boolean) => void; testId: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <button data-testid={testId} type="button" onClick={() => onChange(!value)}
        className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-purple-600" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function DennisPromoTab({
  dennisPromos, dennisPromosLoading, formOpen, setFormOpen, editing, setEditing, onSave, onDelete,
  promoApps, promoAppsLoading, updatePromoAppStatus, exportPromoAppsCSV, promoSubTab, setPromoSubTab, adminPassword,
}: {
  dennisPromos: any[]; dennisPromosLoading: boolean;
  formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: any | null; setEditing: (v: any | null) => void;
  onSave: (promo: any) => void; onDelete: (id: number) => void;
  promoApps: any[]; promoAppsLoading: boolean;
  updatePromoAppStatus: (id: number, status: string) => void;
  exportPromoAppsCSV: () => void;
  promoSubTab: "offers" | "applications";
  setPromoSubTab: (v: "offers" | "applications") => void;
  adminPassword: string;
}) {
  const [form, setForm] = useState<any>({
    title: "", shortDesc: "", description: "", rules: [], isActive: true, sortOrder: 0, language: "ru", translationGroup: "",
  });
  const [rulesText, setRulesText] = useState("");

  useEffect(() => {
    if (editing) {
      setForm(editing);
      setRulesText((editing.rules || []).join("\n"));
    } else {
      setForm({ title: "", shortDesc: "", description: "", rules: [], isActive: true, sortOrder: 0, language: "ru", translationGroup: "" });
      setRulesText("");
    }
  }, [editing]);

  const handleSave = () => {
    const rules = rulesText.split("\n").map((r: string) => r.trim()).filter(Boolean);
    onSave({ ...form, rules });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setPromoSubTab("offers")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            promoSubTab === "offers" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
          }`}
          data-testid="subtab-offers"
        >
          <Gift size={16} className="inline mr-1.5" />
          Промо-акции
        </button>
        <button
          onClick={() => setPromoSubTab("applications")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            promoSubTab === "applications" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"
          }`}
          data-testid="subtab-applications"
        >
          <Users size={16} className="inline mr-1.5" />
          Заявки ({promoApps.length})
        </button>
      </div>

      {promoSubTab === "offers" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Dennis Promo — Управление акциями</h2>
            <button
              onClick={() => { setEditing(null); setFormOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
              data-testid="btn-add-dennis-promo"
            >
              <Plus size={16} />
              Добавить акцию
            </button>
          </div>

          {formOpen && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-orange-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{editing?.id ? "Редактировать" : "Новая"} промо-акция</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Заголовок</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Dennis Fast Start Promo"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                    data-testid="input-dp-title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Краткое описание (кнопка)</label>
                  <input
                    type="text"
                    value={form.shortDesc}
                    onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                    placeholder="Пополни баланс на 100 и получи ещё +100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                    data-testid="input-dp-short-desc"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Полное описание</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Подробное описание акции..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none resize-y"
                    data-testid="input-dp-description"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Правила (каждое с новой строки)</label>
                  <textarea
                    value={rulesText}
                    onChange={(e) => setRulesText(e.target.value)}
                    rows={4}
                    placeholder={"Правило 1\nПравило 2\nПравило 3"}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none resize-y font-mono"
                    data-testid="input-dp-rules"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sprache / Язык</label>
                    <select
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                      data-testid="select-dp-language"
                    >
                      <option value="ru">🇷🇺 Русский</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="en">🇬🇧 English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Gruppe / Группа перевода</label>
                    <input
                      type="text"
                      value={form.translationGroup || ""}
                      onChange={(e) => setForm({ ...form, translationGroup: e.target.value })}
                      placeholder="fast-start-100"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                      data-testid="input-dp-translation-group"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Активна</label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, isActive: !form.isActive })}
                      className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      data-testid="toggle-dp-active"
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mr-2">Порядок</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                      data-testid="input-dp-sort"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
                    data-testid="btn-save-dp"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => { setFormOpen(false); setEditing(null); }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    data-testid="btn-cancel-dp"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {dennisPromosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-orange-600" />
            </div>
          ) : dennisPromos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Нет промо-акций. Добавьте первую акцию.
            </div>
          ) : (
            <div className="space-y-3">
              {dennisPromos.map((promo: any) => (
                <div key={promo.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100" data-testid={`dp-card-${promo.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900">{promo.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${LANG_COLORS[promo.language] || "bg-gray-100 text-gray-700"}`}>
                          {LANG_LABELS[promo.language] || promo.language}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {promo.isActive ? "Активна" : "Выключена"}
                        </span>
                        {promo.translationGroup && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-600">
                            {promo.translationGroup}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{promo.shortDesc}</p>
                      <p className="text-xs text-gray-400">{promo.description?.substring(0, 100)}{promo.description?.length > 100 ? "..." : ""}</p>
                      {promo.rules?.length > 0 && (
                        <p className="text-[10px] text-gray-400 mt-1">Правила: {promo.rules.length} шт.</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3">
                      <button
                        onClick={() => { setEditing(promo); setFormOpen(true); }}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        data-testid={`btn-edit-dp-${promo.id}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(promo.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        data-testid={`btn-delete-dp-${promo.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {promoSubTab === "applications" && (
        <PromoApplicationsSubTab
          promoApps={promoApps}
          promoAppsLoading={promoAppsLoading}
          updatePromoAppStatus={updatePromoAppStatus}
          exportPromoAppsCSV={exportPromoAppsCSV}
          adminPassword={adminPassword}
        />
      )}
    </div>
  );
}

function PromoApplicationsSubTab({
  promoApps, promoAppsLoading, updatePromoAppStatus, exportPromoAppsCSV, adminPassword,
}: {
  promoApps: any[]; promoAppsLoading: boolean;
  updatePromoAppStatus: (id: number, status: string) => void;
  exportPromoAppsCSV: () => void;
  adminPassword: string;
}) {
  const [syncing, setSyncing] = useState(false);
  const [checkingVerifications, setCheckingVerifications] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const checkVerifications = async () => {
    setCheckingVerifications(true);
    setVerificationResult(null);
    try {
      const res = await fetch("/api/admin/check-promo-verifications", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      });
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data.processedCount > 0 ? `${data.processedCount} verification(s) processed` : "No new verifications found");
        if (data.processedCount > 0) {
          window.location.reload();
        }
      } else {
        setVerificationResult(data.error || "Check failed");
      }
    } catch (err: any) {
      setVerificationResult(err.message || "Check failed");
    } finally {
      setCheckingVerifications(false);
    }
  };

  const syncToSheets = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/admin/sync-promo-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
      });
      const data = await res.json();
      if (data.success) {
        setSheetUrl(data.spreadsheetUrl);
      } else {
        setSyncError(data.error || "Sync failed");
      }
    } catch (err: any) {
      setSyncError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-900">Заявки на промо-акции</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={checkVerifications}
            disabled={checkingVerifications}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            data-testid="btn-check-verifications"
          >
            {checkingVerifications ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Check Verifications
          </button>
          <button
            onClick={syncToSheets}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            data-testid="btn-sync-promo-sheets"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            Google Sheets
          </button>
          <button
            onClick={exportPromoAppsCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            data-testid="btn-export-promo-csv"
          >
            <Download size={16} />
            CSV Export
          </button>
        </div>
      </div>
      {sheetUrl && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm">
          <FileSpreadsheet size={16} className="text-blue-600 flex-shrink-0" />
          <span className="text-blue-800">Синхронизировано!</span>
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1 ml-1" data-testid="link-promo-sheet">
            Открыть таблицу <ExternalLink size={12} />
          </a>
        </div>
      )}
      {verificationResult && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700" data-testid="verification-result">
          {verificationResult}
        </div>
      )}
      {syncError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{syncError}</div>
      )}
      {promoAppsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-purple-600" />
        </div>
      ) : promoApps.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Нет заявок</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">CU Number</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Verified</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoApps.map((app: any) => (
                <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50" data-testid={`row-promo-app-${app.id}`}>
                  <td className="px-4 py-3 text-gray-500">#{app.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{app.name}</td>
                  <td className="px-4 py-3 text-gray-700">{app.email}</td>
                  <td className="px-4 py-3 text-gray-700 font-mono">{app.cuNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      app.status === "verified" ? "bg-blue-100 text-blue-700" :
                      app.status === "approved" ? "bg-green-100 text-green-700" :
                      app.status === "rejected" ? "bg-red-100 text-red-700" :
                      app.status === "duplicate" ? "bg-orange-100 text-orange-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`} data-testid={`badge-status-${app.id}`}>
                      {app.status === "duplicate" ? "повторная" : app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {app.verifiedAt ? (
                      <div>
                        <span className="text-blue-600 font-medium" data-testid={`verified-date-${app.id}`}>{new Date(app.verifiedAt).toLocaleString()}</span>
                        {app.emailSentAt && <span className="block text-green-600 mt-0.5" data-testid={`email-sent-${app.id}`}>Email sent</span>}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(app.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {app.status !== "approved" && (
                        <button
                          onClick={() => updatePromoAppStatus(app.id, "approved")}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200"
                          data-testid={`btn-approve-${app.id}`}
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {app.status !== "rejected" && (
                        <button
                          onClick={() => updatePromoAppStatus(app.id, "rejected")}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200"
                          data-testid={`btn-reject-${app.id}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPage;

function InvitesTab({
  events, loading, formOpen, setFormOpen, editing, setEditing, onSave, onReport, onSendTelegramReport, onZoomSync, selectedReport, setSelectedReport, guests, guestsLoading, headers
}: {
  events: InviteEvent[]; loading: boolean; formOpen: boolean; setFormOpen: (v: boolean) => void;
  editing: Partial<InviteEvent> | null; setEditing: (v: Partial<InviteEvent> | null) => void;
  onSave: (e: Partial<InviteEvent>) => void;
  onReport: (id: number) => void;
  onSendTelegramReport: (id: number) => void;
  onZoomSync: (eventId: number) => void;
  selectedReport: InviteEvent | null;
  setSelectedReport: (v: InviteEvent | null) => void;
  guests: InviteGuest[];
  guestsLoading: boolean;
  headers: () => Record<string, string>;
}) {
  const [zoomStatus, setZoomStatus] = useState<{ configured: boolean; ok: boolean; error?: string } | null>(null);
  const [zoomChecking, setZoomChecking] = useState(false);
  const [showZoomConfig, setShowZoomConfig] = useState(false);
  const [zoomCreds, setZoomCreds] = useState({ accountId: "", clientId: "", clientSecret: "" });
  const [zoomSaving, setZoomSaving] = useState(false);

  const checkZoomStatus = async () => {
    setZoomChecking(true);
    try {
      const res = await fetch("/api/admin/zoom-test", { headers: headers() });
      if (res.ok) setZoomStatus(await res.json());
    } catch {}
    setZoomChecking(false);
  };

  const saveZoomCredentials = async () => {
    setZoomSaving(true);
    try {
      const res = await fetch("/api/admin/zoom-credentials", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(zoomCreds),
      });
      if (res.ok) {
        const data = await res.json();
        setZoomStatus(data);
        if (data.ok) {
          setShowZoomConfig(false);
          setZoomCreds({ accountId: "", clientId: "", clientSecret: "" });
        }
      }
    } catch {}
    setZoomSaving(false);
  };

  useEffect(() => { checkZoomStatus(); }, []);
  const openNew = () => { setEditing({ partnerName: "", partnerCu: "", zoomLink: "", title: "", eventDate: "", eventTime: "", isActive: true }); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Kopiert!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Partner Invites Management</h2>
          {zoomStatus && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${zoomStatus.ok ? 'bg-green-500' : zoomStatus.configured ? 'bg-yellow-500' : 'bg-gray-400'}`} />
              <span className="text-xs text-gray-500">
                Zoom: {zoomStatus.ok ? 'Verbunden' : zoomStatus.configured ? `Fehler: ${zoomStatus.error}` : 'Nicht konfiguriert'}
              </span>
              {zoomChecking && <Loader2 size={12} className="animate-spin text-gray-400" />}
              <button onClick={() => setShowZoomConfig(!showZoomConfig)}
                className="text-xs text-purple-600 hover:text-purple-700 underline ml-1">
                {zoomStatus.ok ? 'Ändern' : 'Konfigurieren'}
              </button>
            </div>
          )}
        </div>
        
      </div>

      {showZoomConfig && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Zoom API Credentials</h3>
            <button onClick={() => setShowZoomConfig(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <p className="text-xs text-gray-500">Server-to-Server OAuth credentials from <a href="https://marketplace.zoom.us/" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">Zoom Marketplace</a></p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Account ID</label>
              <input data-testid="input-zoom-account-id" type="text" value={zoomCreds.accountId}
                onChange={(e) => setZoomCreds({ ...zoomCreds, accountId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Account ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client ID</label>
              <input data-testid="input-zoom-client-id" type="text" value={zoomCreds.clientId}
                onChange={(e) => setZoomCreds({ ...zoomCreds, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Client ID" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Secret</label>
              <input data-testid="input-zoom-client-secret" type="password" value={zoomCreds.clientSecret}
                onChange={(e) => setZoomCreds({ ...zoomCreds, clientSecret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Client Secret" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button data-testid="button-save-zoom-creds" onClick={saveZoomCredentials} disabled={zoomSaving || !zoomCreds.accountId || !zoomCreds.clientId || !zoomCreds.clientSecret}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {zoomSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Speichern & Testen
            </button>
            {zoomStatus?.configured && !zoomStatus.ok && zoomStatus.error && (
              <span className="text-xs text-red-500">{zoomStatus.error}</span>
            )}
          </div>
        </div>
      )}

      

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">No invite events found</div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} data-testid={`card-invite-${event.id}`} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${event.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {event.isActive ? "Active" : "Inactive"}
                    </span>
                    {(event.zoomSyncedCount ?? 0) > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                        <Video size={10} /> {event.zoomSyncedCount} synced
                      </span>
                    ) : event.zoomLink ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                        Zoom: not synced
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-600">Partner: <span className="font-medium">{event.partnerName}</span> ({event.partnerCu})</p>
                  <p className="text-sm text-gray-500">{event.eventDate} at {event.eventTime}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Registered</p>
                      <p className="text-lg font-bold text-purple-600">{event.guestCount || 0}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Clicked Zoom</p>
                      <p className="text-lg font-bold text-blue-600">{event.clickedCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-gray-50">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 max-w-md">
                  <LinkIcon size={14} className="text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-500 truncate font-mono">{`${window.location.origin}/invite/${event.inviteCode}`}</span>
                  <button onClick={() => copyToClipboard(`${window.location.origin}/invite/${event.inviteCode}`)}
                    className="ml-auto text-purple-600 hover:text-purple-700 font-medium text-xs">Copy</button>
                </div>

                <button onClick={() => onReport(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                  <BarChart3 size={14} /> View Details
                </button>
                
                <button onClick={() => onSendTelegramReport(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100">
                  <MessageSquare size={14} /> Send TG Report
                </button>

                {zoomStatus?.ok && event.zoomLink && (
                  <button data-testid={`button-zoom-sync-${event.id}`} onClick={() => onZoomSync(event.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100">
                    <Video size={14} /> Zoom Sync
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Guest Report: {selectedReport.title}</h3>
                <p className="text-sm text-gray-500">Partner: {selectedReport.partnerName} ({selectedReport.partnerCu})</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {guestsLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-purple-500" /></div>
              ) : guests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No guests registered yet</div>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Registered</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Clicked Zoom</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{guest.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{guest.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{guest.phone || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{new Date(guest.registeredAt).toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            {guest.clickedZoom ? (
                              <div className="flex flex-col items-center">
                                <Check className="text-green-500" size={18} />
                                <span className="text-[10px] text-gray-400">{new Date(guest.clickedAt!).toLocaleTimeString()}</span>
                              </div>
                            ) : (
                              <X className="text-gray-300 mx-auto" size={18} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InviteForm({ event, setEvent, onSave, onClose }: {
  event: Partial<InviteEvent>; setEvent: (e: Partial<InviteEvent>) => void; onSave: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Create New Invite Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        
        <InputField label="Event Title" value={event.title || ""} onChange={(v) => setEvent({ ...event, title: v })} testId="input-invite-title" />
        
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Partner Name" value={event.partnerName || ""} onChange={(v) => setEvent({ ...event, partnerName: v })} testId="input-invite-partner-name" />
          <InputField label="Partner CU Number" value={event.partnerCu || ""} onChange={(v) => setEvent({ ...event, partnerCu: v })} testId="input-invite-partner-cu" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Date" value={event.eventDate || ""} onChange={(v) => setEvent({ ...event, eventDate: v })} testId="input-invite-date" />
          <InputField label="Time" value={event.eventTime || ""} onChange={(v) => setEvent({ ...event, eventTime: v })} testId="input-invite-time" />
        </div>

        <InputField label="Zoom Link" value={event.zoomLink || ""} onChange={(v) => setEvent({ ...event, zoomLink: v })} testId="input-invite-zoom-link" />
        
        <ToggleField label="Active" value={event.isActive ?? true} onChange={(v) => setEvent({ ...event, isActive: v })} testId="toggle-invite-active" />

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Abbrechen</button>
          <button data-testid="button-save-invite" onClick={onSave}
            disabled={!event.title || !event.partnerName || !event.partnerCu || !event.zoomLink}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
            <Check size={16} /> Create
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnersTab({ partners }: { partners: AdminPartner[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" data-testid="text-partners-title">
          Registrierte Partner ({partners.length})
        </h2>
      </div>
      {partners.length === 0 ? (
        <p className="text-gray-500" data-testid="text-no-partners">Noch keine Partner registriert.</p>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow" data-testid={`card-partner-${p.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900" data-testid={`text-partner-name-${p.id}`}>{p.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.cuNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.status === "active" ? "Aktiv" : p.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    {p.telegramUsername && (
                      <span>📱 @{p.telegramUsername}</span>
                    )}
                    {p.email && (
                      <span>📧 {p.email}</span>
                    )}
                    {p.phone && (
                      <span>📞 {p.phone}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString("de-DE")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
