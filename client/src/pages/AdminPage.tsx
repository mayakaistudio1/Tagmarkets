import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

type Tab = "chat" | "promotions" | "schedule";

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
  messages: ChatMessage[];
}

interface Promotion {
  id?: number;
  badge: string;
  title: string;
  subtitle: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  deadline: string;
  isActive: boolean;
}

interface ScheduleEvent {
  id?: number;
  day: string;
  date: string;
  time: string;
  title: string;
  speaker: string;
  type: string;
  typeBadge: string;
  highlights: string[];
  link: string;
  isActive: boolean;
}

const emptyPromotion: Promotion = {
  badge: "",
  title: "",
  subtitle: "",
  highlights: [],
  ctaText: "",
  ctaLink: "",
  deadline: "",
  isActive: true,
};

const emptyEvent: ScheduleEvent = {
  day: "",
  date: "",
  time: "",
  title: "",
  speaker: "",
  type: "trading",
  typeBadge: "",
  highlights: [],
  link: "",
  isActive: true,
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

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoFormOpen, setPromoFormOpen] = useState(false);

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);

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
        const data = await res.json();
        setChatSessions(data);
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
      const res = await fetch("/api/admin/chat-sessions/export", {
        headers: headers(),
      });
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

  const fetchPromotions = useCallback(async () => {
    setPromoLoading(true);
    try {
      const res = await fetch("/api/admin/promotions", { headers: headers() });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setPromotions(await res.json());
      } else {
        setErrorMsg("Fehler beim Laden der Aktionen");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setPromoLoading(false);
    }
  }, [headers]);

  const savePromotion = async (promo: Promotion) => {
    const method = promo.id ? "PUT" : "POST";
    const url = promo.id
      ? `/api/admin/promotions/${promo.id}`
      : "/api/admin/promotions";
    try {
      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(promo),
      });
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
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
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
      const res = await fetch("/api/admin/schedule-events", {
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      if (res.ok) {
        setEvents(await res.json());
      } else {
        setErrorMsg("Fehler beim Laden der Events");
      }
    } catch {
      setErrorMsg("Verbindungsfehler");
    } finally {
      setEventsLoading(false);
    }
  }, [headers]);

  const saveEvent = async (event: ScheduleEvent) => {
    const method = event.id ? "PUT" : "POST";
    const url = event.id
      ? `/api/admin/schedule-events/${event.id}`
      : "/api/admin/schedule-events";
    try {
      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(event),
      });
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
      const res = await fetch(`/api/admin/schedule-events/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (handleAuthError(res)) return;
      if (!res.ok) setErrorMsg("Fehler beim Löschen");
      fetchEvents();
    } catch {
      setErrorMsg("Verbindungsfehler");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab === "chat") fetchChatSessions();
    if (activeTab === "promotions") fetchPromotions();
    if (activeTab === "schedule") fetchEvents();
  }, [isLoggedIn, activeTab, fetchChatSessions, fetchPromotions, fetchEvents]);

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
          />
        )}
      </main>
    </div>
  );
}

function ChatLogsTab({
  sessions,
  loading,
  filterType,
  setFilterType,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onSearch,
  onExport,
  expandedSession,
  setExpandedSession,
}: {
  sessions: ChatSession[];
  loading: boolean;
  filterType: string;
  setFilterType: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  onSearch: () => void;
  onExport: () => void;
  expandedSession: string | null;
  setExpandedSession: (v: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Typ</label>
            <select
              data-testid="select-chat-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Alle</option>
              <option value="text">Text</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Von</label>
            <input
              data-testid="input-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bis</label>
            <input
              data-testid="input-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            data-testid="button-search-chats"
            onClick={onSearch}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Search size={16} />
            Suchen
          </button>
          <button
            data-testid="button-export-csv"
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ml-auto"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : sessions.length === 0 ? (
          <div data-testid="text-no-sessions" className="p-8 text-center text-gray-500">
            Keine Chat-Sitzungen gefunden
          </div>
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
                  <tr
                    data-testid={`row-session-${session.sessionId}`}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() =>
                      setExpandedSession(
                        expandedSession === session.sessionId ? null : session.sessionId
                      )
                    }
                  >
                    <td className="px-4 py-3 text-sm font-mono text-gray-700">
                      {session.sessionId.substring(0, 12)}...
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          session.type === "video"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {session.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{session.language}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(session.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{session.messages?.length || 0}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {expandedSession === session.sessionId ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </td>
                  </tr>
                  {expandedSession === session.sessionId && (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 bg-gray-50">
                        <div className="max-h-96 overflow-y-auto space-y-2 px-2">
                          {session.messages?.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                                  msg.role === "user"
                                    ? "bg-purple-600 text-white rounded-br-md"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                                }`}
                              >
                                <p className="text-xs font-semibold mb-1 opacity-70">
                                  {msg.role === "user" ? "User" : "Maria"}
                                </p>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                          {(!session.messages || session.messages.length === 0) && (
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

function PromotionsTab({
  promotions,
  loading,
  formOpen,
  setFormOpen,
  editing,
  setEditing,
  onSave,
  onDelete,
}: {
  promotions: Promotion[];
  loading: boolean;
  formOpen: boolean;
  setFormOpen: (v: boolean) => void;
  editing: Promotion | null;
  setEditing: (v: Promotion | null) => void;
  onSave: (p: Promotion) => void;
  onDelete: (id: number) => void;
}) {
  const openNew = () => {
    setEditing({ ...emptyPromotion });
    setFormOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing({ ...p });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Aktionen / Promotions</h2>
        <button
          data-testid="button-new-promotion"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          Neue Aktion
        </button>
      </div>

      {formOpen && editing && (
        <PromotionForm
          promo={editing}
          setPromo={setEditing}
          onSave={() => onSave(editing)}
          onClose={closeForm}
        />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Keine Aktionen vorhanden
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              data-testid={`card-promotion-${promo.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  {promo.badge && (
                    <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-1">
                      {promo.badge}
                    </span>
                  )}
                  <h3 className="font-bold text-gray-900">{promo.title}</h3>
                  <p className="text-sm text-gray-500">{promo.subtitle}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    promo.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {promo.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              {promo.highlights && promo.highlights.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {promo.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              {promo.deadline && (
                <p className="text-xs text-gray-400">Deadline: {promo.deadline}</p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  data-testid={`button-edit-promotion-${promo.id}`}
                  onClick={() => openEdit(promo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                  Bearbeiten
                </button>
                <button
                  data-testid={`button-delete-promotion-${promo.id}`}
                  onClick={() => promo.id && onDelete(promo.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PromotionForm({
  promo,
  setPromo,
  onSave,
  onClose,
}: {
  promo: Promotion;
  setPromo: (p: Promotion) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {promo.id ? "Aktion bearbeiten" : "Neue Aktion"}
          </h3>
          <button data-testid="button-close-promo-form" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Badge" value={promo.badge} onChange={(v) => setPromo({ ...promo, badge: v })} testId="input-promo-badge" />
          <InputField label="Titel" value={promo.title} onChange={(v) => setPromo({ ...promo, title: v })} testId="input-promo-title" />
        </div>
        <InputField label="Subtitle" value={promo.subtitle} onChange={(v) => setPromo({ ...promo, subtitle: v })} testId="input-promo-subtitle" />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Highlights (eine pro Zeile)</label>
          <textarea
            data-testid="textarea-promo-highlights"
            value={(promo.highlights || []).join("\n")}
            onChange={(e) =>
              setPromo({ ...promo, highlights: e.target.value.split("\n").filter((l) => l.trim()) })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="CTA Text" value={promo.ctaText} onChange={(v) => setPromo({ ...promo, ctaText: v })} testId="input-promo-cta-text" />
          <InputField label="CTA Link" value={promo.ctaLink} onChange={(v) => setPromo({ ...promo, ctaLink: v })} testId="input-promo-cta-link" />
        </div>
        <InputField label="Deadline" value={promo.deadline} onChange={(v) => setPromo({ ...promo, deadline: v })} testId="input-promo-deadline" />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Aktiv</label>
          <button
            data-testid="toggle-promo-active"
            type="button"
            onClick={() => setPromo({ ...promo, isActive: !promo.isActive })}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              promo.isActive ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                promo.isActive ? "left-[18px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            data-testid="button-cancel-promo"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            data-testid="button-save-promo"
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Check size={16} />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({
  events,
  loading,
  formOpen,
  setFormOpen,
  editing,
  setEditing,
  onSave,
  onDelete,
}: {
  events: ScheduleEvent[];
  loading: boolean;
  formOpen: boolean;
  setFormOpen: (v: boolean) => void;
  editing: ScheduleEvent | null;
  setEditing: (v: ScheduleEvent | null) => void;
  onSave: (e: ScheduleEvent) => void;
  onDelete: (id: number) => void;
}) {
  const openNew = () => {
    setEditing({ ...emptyEvent });
    setFormOpen(true);
  };

  const openEdit = (e: ScheduleEvent) => {
    setEditing({ ...e });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Webinare & Termine</h2>
        <button
          data-testid="button-new-event"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          Neues Event
        </button>
      </div>

      {formOpen && editing && (
        <EventForm
          event={editing}
          setEvent={setEditing}
          onSave={() => onSave(editing)}
          onClose={closeForm}
        />
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Laden...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Keine Events vorhanden
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              data-testid={`card-event-${event.id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                        event.type === "trading"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {event.typeBadge || event.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.speaker}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    event.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {event.isActive ? "Aktiv" : "Inaktiv"}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{event.day}, {event.date} – {event.time}</p>
              </div>
              {event.highlights && event.highlights.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1">
                  {event.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  data-testid={`button-edit-event-${event.id}`}
                  onClick={() => openEdit(event)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={14} />
                  Bearbeiten
                </button>
                <button
                  data-testid={`button-delete-event-${event.id}`}
                  onClick={() => event.id && onDelete(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventForm({
  event,
  setEvent,
  onSave,
  onClose,
}: {
  event: ScheduleEvent;
  setEvent: (e: ScheduleEvent) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {event.id ? "Event bearbeiten" : "Neues Event"}
          </h3>
          <button data-testid="button-close-event-form" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <InputField label="Tag (z.B. Mo)" value={event.day} onChange={(v) => setEvent({ ...event, day: v })} testId="input-event-day" />
          <InputField label="Datum" value={event.date} onChange={(v) => setEvent({ ...event, date: v })} testId="input-event-date" />
          <InputField label="Uhrzeit" value={event.time} onChange={(v) => setEvent({ ...event, time: v })} testId="input-event-time" />
        </div>
        <InputField label="Titel" value={event.title} onChange={(v) => setEvent({ ...event, title: v })} testId="input-event-title" />
        <InputField label="Speaker" value={event.speaker} onChange={(v) => setEvent({ ...event, speaker: v })} testId="input-event-speaker" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Typ</label>
            <select
              data-testid="select-event-type"
              value={event.type}
              onChange={(e) => setEvent({ ...event, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="trading">Trading</option>
              <option value="partner">Partner</option>
            </select>
          </div>
          <InputField label="Typ Badge" value={event.typeBadge} onChange={(v) => setEvent({ ...event, typeBadge: v })} testId="input-event-type-badge" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Highlights (eine pro Zeile)</label>
          <textarea
            data-testid="textarea-event-highlights"
            value={(event.highlights || []).join("\n")}
            onChange={(e) =>
              setEvent({ ...event, highlights: e.target.value.split("\n").filter((l) => l.trim()) })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <InputField label="Link" value={event.link} onChange={(v) => setEvent({ ...event, link: v })} testId="input-event-link" />
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Aktiv</label>
          <button
            data-testid="toggle-event-active"
            type="button"
            onClick={() => setEvent({ ...event, isActive: !event.isActive })}
            className={`w-10 h-6 rounded-full transition-colors relative ${
              event.isActive ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                event.isActive ? "left-[18px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            data-testid="button-cancel-event"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            data-testid="button-save-event"
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <Check size={16} />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testId: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        data-testid={testId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}

export default AdminPage;
