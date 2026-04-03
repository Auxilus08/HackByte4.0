"use client";

import { Bell, Search, Menu, Zap } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-20 glass-panel border-b-white/5 flex items-center justify-between px-6 sticky top-0 z-10 w-full shadow-lg">
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-400 hover:text-white">
          <Menu className="h-6 w-6" />
        </button>
        <div className="relative hidden md:flex items-center group">
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400 group-focus-within:text-red-500 transition-colors z-10" />
          <input 
            type="text" 
            placeholder="Search across network..." 
            className="pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 w-80 transition-all font-sans relative z-0"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity blur-md"></div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Zap className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 animate-pulse" />
          <span className="text-xs text-gray-300 font-mono">NODE: <span className="text-emerald-400">ACTIVE</span></span>
        </div>

        <button className="relative p-2.5 text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/10 group">
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
