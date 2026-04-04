"use client";

import { Bell, Search, Menu, Zap, LogOut, X, AlertTriangle, CheckSquare, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useWebSocket } from "@/components/WebSocketProvider";
import useSWR from "swr";
import { fetcher, API_ROUTES, Accident, Task } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type NotificationItem = {
  id: string;
  type: "accident" | "task";
  title: string;
  description: string;
  time: string;
  link: string;
};

export function Navbar() {
  const router = useRouter();
  const { isConnected, lastMessage } = useWebSocket();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch data for search
  const { data: accidentsData } = useSWR<{ total: number; items: Accident[] }>(
    `${API_ROUTES.accidents}?limit=100`,
    fetcher
  );
  const { data: tasksData } = useSWR<{ total: number; items: Task[] }>(
    API_ROUTES.tasks,
    fetcher
  );

  // Track WebSocket notifications
  useEffect(() => {
    if (!lastMessage) return;
    const payload = lastMessage;
    let notif: NotificationItem | null = null;

    if (payload.type === "new_accident") {
      notif = {
        id: payload.data?.id || Date.now().toString(),
        type: "accident",
        title: "New Incident Reported",
        description: payload.data?.location_name || "Unknown location",
        time: new Date().toISOString(),
        link: `/dashboard/accidents/${payload.data?.id}`,
      };
    } else if (payload.type === "task_updated" || payload.type === "volunteer_dispatched") {
      notif = {
        id: payload.data?.id || Date.now().toString(),
        type: "task",
        title: payload.type === "volunteer_dispatched" ? "Volunteer Dispatched" : "Task Updated",
        description: `Status: ${payload.data?.status || "unknown"}`,
        time: new Date().toISOString(),
        link: `/dashboard/tasks`,
      };
    }
    if (notif) {
      setNotifications(prev => [notif!, ...prev].slice(0, 20));
      setUnreadCount(prev => prev + 1);
    }
  }, [lastMessage]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search results
  const searchResults = searchQuery.trim().length > 1 ? [
    ...(accidentsData?.items?.filter(a =>
      a.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.source_id?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5).map(a => ({
      id: a.id,
      type: "accident" as const,
      title: a.location_name,
      subtitle: a.criticality,
      link: `/dashboard/accidents/${a.id}`,
    })) || []),
  ] : [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSearchSelect = (link: string) => {
    router.push(link);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <header className="h-14 md:h-20 glass-panel border-b-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 w-full shadow-lg">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden text-gray-400 hover:text-white p-1"
          onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative hidden md:flex items-center group">
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors z-10" />
          <input 
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search incidents by location..." 
            className="pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 w-80 transition-all font-sans relative z-0"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity blur-md"></div>

          {/* Search results dropdown */}
          {searchOpen && searchQuery.trim().length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSearchSelect(r.link)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      <div>
                        <p className="text-sm text-white font-heading">{r.title}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{r.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-xs font-mono tracking-widest">
                  NO RESULTS FOUND
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Zap className={`h-3.5 w-3.5 ${isConnected ? 'text-yellow-500 fill-yellow-500 animate-pulse' : 'text-gray-600'}`} />
          <span className="text-xs text-gray-300 font-mono">WS: <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>{isConnected ? 'LIVE' : 'OFFLINE'}</span></span>
        </div>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={handleNotifClick}
            className="relative p-2.5 text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/10 group"
          >
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-[7px] text-white font-bold"></span>
              </>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-heading font-semibold text-white tracking-wide">Notifications</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif, i) => (
                      <Link 
                        key={`${notif.id}-${i}`}
                        href={notif.link}
                        onClick={() => setNotifOpen(false)}
                        className="block px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${notif.type === 'accident' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {notif.type === 'accident' ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <p className="text-sm text-white font-heading">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{notif.description}</p>
                            <p className="text-[10px] text-gray-600 font-mono mt-1">
                              {formatDistanceToNow(new Date(notif.time), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-3 text-gray-700" />
                    <p className="text-xs font-mono tracking-widest">NO NOTIFICATIONS</p>
                    <p className="text-[10px] text-gray-600 mt-1">Real-time alerts will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="p-2 md:p-2.5 text-gray-500 hover:text-red-400 transition-all rounded-xl hover:bg-white/10"
          title="Logout"
        >
          <LogOut className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>
    </header>
  );
}
