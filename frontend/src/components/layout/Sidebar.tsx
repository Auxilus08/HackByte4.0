"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  AlertTriangle, 
  Users, 
  CheckSquare,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();

  const routes = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Live Map", href: "/map", icon: MapIcon },
    { name: "Incidents", href: "/accidents", icon: AlertTriangle },
    { name: "Network", href: "/volunteers", icon: Users },
    { name: "Dispatch", href: "/tasks", icon: CheckSquare },
  ];

  return (
    <aside className="w-64 glass-panel border-r-white/5 text-gray-300 md:flex flex-col hidden h-screen sticky top-0 z-20 shadow-2xl relative">
      <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
      
      <div className="h-20 flex items-center px-6 relative">
        <h1 className="text-xl font-bold tracking-widest flex items-center gap-3 relative z-10 w-full">
          <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 glow-red">
            <Activity className="text-red-500 h-5 w-5" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-heading">
            SMART<span className="text-red-500 font-bold">AI</span>
          </span>
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        <nav className="space-y-2 relative">
          {routes.map((route) => {
            const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== '/');
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
      
      <div className="p-5 border-t border-white/5 m-2 rounded-2xl bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-sm font-bold text-white border border-gray-700 shadow-inner">
              OP
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#050505]"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-heading font-semibold text-white tracking-wide">System Operator</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
