"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  AlertTriangle, 
  Users, 
  CheckSquare,
  Activity,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("System Operator");

  // Load user name from localStorage
  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        setUserName(parsed.name || "System Operator");
      }
    } catch {}
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Expose toggle function via custom event so Navbar can trigger it
  useEffect(() => {
    const handler = () => setMobileOpen(prev => !prev);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  const routes = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Map", href: "/dashboard/map", icon: MapIcon },
    { name: "Incidents", href: "/dashboard/accidents", icon: AlertTriangle },
    { name: "Network", href: "/dashboard/volunteers", icon: Users },
    { name: "Dispatch", href: "/dashboard/tasks", icon: CheckSquare },
  ];

  const sidebarContent = (
    <>
      <div className="h-20 flex items-center px-6 relative shrink-0">
        <h1 className="text-xl font-bold tracking-widest flex items-center gap-3 relative z-10 w-full">
          <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 glow-red">
            <Activity className="text-red-500 h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-heading">
            SMART<span className="text-red-500 font-bold">AI</span>
          </span>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        <nav className="space-y-2 relative">
          {routes.map((route) => {
            const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== '/dashboard') || (route.href === '/dashboard' && pathname === '/dashboard');
            return (
              <Link
                key={route.href}
                href={route.href}
                className="relative group block"
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-sidebar-pill"
                    className="absolute inset-0 bg-red-500/10 border border-red-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "text-red-400 font-medium" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                  <route.icon className={`h-5 w-5 ${isActive ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}`} />
                  <span className="font-heading tracking-wide text-sm">{route.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-5 border-t border-white/5 m-2 rounded-2xl bg-white/5 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-sm font-bold text-white border border-gray-700 shadow-inner">
              {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#050505]"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-heading font-semibold text-white tracking-wide">{userName}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Connected</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 glass-panel border-r-white/5 text-gray-300 hidden md:flex flex-col h-screen sticky top-0 z-20 shadow-2xl relative">
        <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        {sidebarContent}
      </aside>

      {/* Mobile overlay + sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 w-72 h-full glass-panel text-gray-300 flex flex-col z-50 md:hidden shadow-2xl border-r border-white/10"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
