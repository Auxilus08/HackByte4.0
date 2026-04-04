"use client";

import useSWR from "swr";
import { fetcher, API_ROUTES, Accident, Task, Volunteer } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { 
  Clock, Car, Activity, ShieldAlert, ArrowUpRight, DatabaseZap,
  Globe2, AlertTriangle, Wallet, Siren, Radio, Cpu, Zap, 
  TrendingUp, HeartPulse
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardHome() {
  const { data: accidentsData } = useSWR<{ total: number; items: Accident[] }>(
    `${API_ROUTES.accidents}?limit=5`, fetcher, { refreshInterval: 10000 }
  );
  const { data: tasksData } = useSWR<{ total: number; items: Task[] }>(
    `${API_ROUTES.tasks}`, fetcher, { refreshInterval: 10000 }
  );
  const { data: volunteersData } = useSWR<{ total: number; items: Volunteer[] }>(
    `${API_ROUTES.volunteers}?available_only=true`, fetcher, { refreshInterval: 15000 }
  );
  const { data: healthData } = useSWR<{ status: string; service: string }>(
    API_ROUTES.health, fetcher, { refreshInterval: 30000 }
  );
  const { data: poolData } = useSWR(
    API_ROUTES.poolInfo, fetcher, { refreshInterval: 60000 }
  );

  const activeAccidents = accidentsData?.items.filter(a => a.status !== 'resolved') || [];
  const activeTasks = tasksData?.items.filter(t => t.status !== 'completed' && t.status !== 'verified') || [];
  const completedTasks = tasksData?.items.filter(t => t.status === 'verified') || [];
  const isApiHealthy = healthData?.status === "healthy";

  const stats = [
    { label: "Active Incidents", value: activeAccidents.length, icon: Siren, color: "red", desc: "Unresolved reports", link: "/dashboard/accidents" },
    { label: "Live Operations", value: activeTasks.length, icon: Radio, color: "blue", desc: "Dispatched tasks", link: "/dashboard/tasks" },
    { label: "Network Nodes", value: volunteersData?.total || 0, icon: Globe2, color: "emerald", desc: "Available volunteers", link: "/dashboard/volunteers" },
    { label: "Verified Tasks", value: completedTasks.length, icon: Wallet, color: "purple", desc: "Rewards distributed", link: "/dashboard/tasks" },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in">
      {/* Header */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 glow-red">
                <Activity className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient-white font-heading tracking-tight mb-1">
              Global Operations
            </h1>
            <p className="text-gray-500 text-xs md:text-sm font-sans tracking-wide">Real-time surveillance & automated dispatch telemetry</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs glass-panel px-4 py-2 rounded-xl text-gray-300">
              <span className={`w-2 h-2 rounded-full pulse-dot ${isApiHealthy ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {isApiHealthy ? "All Systems Normal" : "System Degraded"}
            </div>
            <div className="text-xs glass-panel px-4 py-2 rounded-xl text-gray-500 font-mono hidden sm:block">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, idx) => (
          <Link href={stat.link} key={stat.label}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
              className="relative overflow-hidden glass-panel glass-panel-hover rounded-2xl p-4 md:p-5 group cursor-pointer scanline-overlay"
            >
              <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-${stat.color}-500/5 blur-2xl group-hover:bg-${stat.color}-500/10 transition-all duration-500`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-tight">{stat.value}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
                <p className="text-[9px] text-gray-600 font-mono mt-0.5">{stat.desc}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Incident Feed ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-heading font-semibold text-white tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Live Incident Feed
            </h2>
            <Link href="/dashboard/accidents" className="text-xs font-sans text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 group">
              View All <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="glass-panel overflow-hidden rounded-2xl">
            {accidentsData?.items && accidentsData.items.length > 0 ? (
              <div className="divide-y divide-white/5">
                {accidentsData.items.map((accident, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={accident.id} 
                    className="hover:bg-white/[0.02] transition-all relative group"
                  >
                    <Link href={`/dashboard/accidents/${accident.id}`} className="block p-4 md:p-5">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-red-500 transition-colors" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {accident.criticality === "Highly Critical" ? (
                            <span className="bg-red-500/10 text-red-400 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border border-red-500/20 status-critical flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              CRITICAL
                            </span>
                          ) : (
                            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-widest border border-yellow-500/20 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                              MODERATE
                            </span>
                          )}
                          <span className="text-[10px] bg-black/40 text-gray-500 px-2.5 py-1 rounded-lg border border-white/5 uppercase tracking-widest font-bold font-mono">
                            {accident.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(accident.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <h3 className="text-sm md:text-base font-heading font-medium text-white mb-2 flex items-center gap-2 tracking-wide">
                        <Car className="h-4 w-4 text-gray-600 shrink-0" />
                        <span className="break-words">{accident.location_name}</span>
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 pl-6 font-sans leading-relaxed">
                        &quot;{accident.description || "Transcription pending..."}&quot;
                      </p>
                      
                      {accident.assistance_required && accident.assistance_required.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-6">
                          {accident.assistance_required.map(tag => (
                            <span key={tag} className="text-[10px] text-blue-400 font-medium bg-blue-500/8 px-2 py-0.5 rounded-md border border-blue-500/10 tracking-wider uppercase">
                              {tag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4 border border-white/5">
                  <ShieldAlert className="h-8 w-8 text-gray-700" />
                </div>
                <p className="font-heading tracking-widest uppercase text-sm text-gray-600">Sector Clear</p>
                <p className="text-[10px] font-mono mt-2 text-gray-700">No incidents in buffer — all quiet</p>
              </div>
            )}
          </div>
        </div>
        
        {/* ── System Diagnostics ── */}
        <div className="space-y-4">
          <h2 className="text-base font-heading font-semibold text-white tracking-wide flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-500" />
            System Diagnostics
          </h2>
          
          <div className="glass-panel rounded-2xl p-5 md:p-6 relative overflow-hidden scanline-overlay">
            <div className="space-y-5 relative z-10">
              {/* Backend API */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest">BACKEND API</span>
                  <span className={`flex items-center gap-1.5 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md border ${isApiHealthy ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isApiHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    {isApiHealthy ? "ONLINE" : "CHECK"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full transition-all duration-1000 ${isApiHealthy ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 w-[95%]' : 'bg-red-500 w-[10%]'}`} />
                </div>
              </div>

              {/* ML Prediction */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest">ML PREDICTION</span>
                  <span className={`flex items-center gap-1.5 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md border ${isApiHealthy ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-gray-500 bg-gray-500/10 border-gray-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isApiHealthy ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
                    {isApiHealthy ? "ONLINE" : "CHECK"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full transition-all duration-1000 ${isApiHealthy ? 'bg-gradient-to-r from-amber-600 to-amber-400 w-[95%]' : 'bg-gray-600 w-[10%]'}`} />
                </div>
              </div>

              {/* Geo-Dispatch */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest">GEO-DISPATCH</span>
                  <span className={`flex items-center gap-1.5 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md border ${activeTasks.length > 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTasks.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
                    {activeTasks.length > 0 ? "ACTIVE" : "IDLE"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full transition-all duration-1000 ${activeTasks.length > 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`} style={{ width: activeTasks.length > 0 ? '85%' : '45%' }} />
                </div>
              </div>

              {/* Blockchain */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest">BLOCKCHAIN</span>
                  <span className={`flex items-center gap-1.5 text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-md border ${poolData && !poolData?.error ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${poolData && !poolData?.error ? 'bg-purple-400' : 'bg-yellow-400'}`} />
                    {poolData && !poolData?.error ? "SYNCED" : "CHECK"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full transition-all duration-1000 ${poolData && !poolData?.error ? 'bg-gradient-to-r from-purple-600 to-purple-400 w-[90%]' : 'bg-gradient-to-r from-yellow-600 to-yellow-400 w-[30%]'}`} />
                </div>
              </div>

              {/* Pool Info */}
              {poolData && !poolData?.error && (
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest font-bold">Reward Pool</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest block mb-1">Balance</span>
                      <span className="text-sm font-heading font-bold text-white">{poolData.balance_matic || "—"}</span>
                      <span className="text-[9px] text-gray-600 ml-1">MATIC</span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-[9px] text-gray-600 uppercase tracking-widest block mb-1">Verified</span>
                      <span className="text-sm font-heading font-bold text-white">{completedTasks.length}</span>
                      <span className="text-[9px] text-gray-600 ml-1">tasks</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-600">
                  <span className="tracking-widest">LAST SYNC</span>
                  <span className="text-gray-400">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h3 className="text-[10px] font-mono text-gray-600 tracking-widest uppercase font-bold mb-3">Quick Actions</h3>
            <Link href="/dashboard/accidents" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Siren className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-heading font-medium text-white">View Incidents</p>
                <p className="text-[9px] text-gray-600">Monitor live accident reports</p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-white transition-colors" />
            </Link>
            <Link href="/dashboard/volunteers" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <HeartPulse className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-heading font-medium text-white">Manage Network</p>
                <p className="text-[9px] text-gray-600">Add or configure volunteers</p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-white transition-colors" />
            </Link>
            <Link href="/dashboard/map" className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe2 className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-heading font-medium text-white">Live Map</p>
                <p className="text-[9px] text-gray-600">Geospatial incident view</p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
