"use client";

import useSWR from "swr";
import { fetcher, API_ROUTES, Accident, Task, Volunteer } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { 
  Clock, 
  Car,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  DatabaseZap,
  Globe2,
  AlertTriangle,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardHome() {
  const { data: accidentsData } = useSWR<{ total: number; items: Accident[] }>(
    `${API_ROUTES.accidents}?limit=5`, 
    fetcher,
    { refreshInterval: 10000 }
  );
  
  const { data: tasksData } = useSWR<{ total: number; items: Task[] }>(
    `${API_ROUTES.tasks}`, 
    fetcher,
    { refreshInterval: 10000 }
  );

  const { data: volunteersData } = useSWR<{ total: number; items: Volunteer[] }>(
    `${API_ROUTES.volunteers}?available_only=true`, 
    fetcher,
    { refreshInterval: 15000 }
  );

  // Live health check
  const { data: healthData } = useSWR<{ status: string; service: string }>(
    API_ROUTES.health,
    fetcher,
    { refreshInterval: 30000 }
  );

  // Blockchain pool info
  const { data: poolData } = useSWR(
    API_ROUTES.poolInfo,
    fetcher,
    { refreshInterval: 60000 }
  );

  const activeAccidents = accidentsData?.items.filter(a => a.status !== 'resolved') || [];
  const activeTasks = tasksData?.items.filter(t => t.status !== 'completed' && t.status !== 'verified') || [];
  const completedTasks = tasksData?.items.filter(t => t.status === 'verified') || [];

  const isApiHealthy = healthData?.status === "healthy";

  const stats = [
    { 
      label: "Active Incidents", 
      value: activeAccidents.length, 
      icon: Activity, 
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      glow: "glow-red",
      link: "/dashboard/accidents"
    },
    { 
      label: "Operations Live", 
      value: activeTasks.length, 
      icon: DatabaseZap, 
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      link: "/dashboard/tasks"
    },
    { 
      label: "Network Nodes", 
      value: volunteersData?.total || 0, 
      icon: Globe2, 
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
      link: "/dashboard/volunteers"
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 font-heading tracking-tight mb-1 md:mb-2">
          Global Operations Center
        </h1>
        <p className="text-gray-400 text-xs md:text-sm font-sans tracking-wide">Real-time surveillance & automated dispatch telemetry.</p>
        <div className="absolute right-0 top-0 hidden md:flex items-center gap-2 text-xs border border-white/10 glass-panel px-3 py-1.5 rounded-full text-gray-300">
          <span className={`w-1.5 h-1.5 rounded-full ${isApiHealthy ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></span>
          {isApiHealthy ? "System Sequence Normal" : "System Degraded"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <Link href={stat.link} key={stat.label}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              className="relative overflow-hidden glass-panel rounded-xl md:rounded-2xl p-4 md:p-6 group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
            >
              <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${stat.bg} blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              
              <div className="flex items-center gap-3 md:gap-5 relative z-10">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center ${stat.bg} ${stat.border} border ${stat.glow}`}>
                  <stat.icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.color} drop-shadow-lg`} />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs md:text-sm text-gray-400 font-sans tracking-widest uppercase mb-0.5 md:mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl md:text-4xl font-heading font-bold text-white tracking-tight">{stat.value}</h3>
                    <span className="text-xs text-gray-500 font-mono">/ units</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Incident Feed */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-white tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-400" />
              Incoming Telemetry
            </h2>
            <Link href="/dashboard/accidents" className="text-xs font-sans text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 group">
              View All <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="glass-panel overflow-hidden shadow-2xl rounded-2xl">
            {accidentsData?.items && accidentsData.items.length > 0 ? (
              <div className="divide-y divide-white/5">
                {accidentsData.items.map((accident, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={accident.id} 
                    className="hover:bg-white/5 transition-colors relative group"
                  >
                    <Link href={`/dashboard/accidents/${accident.id}`} className="block p-5">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-red-500 transition-colors"></div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {accident.criticality === "Highly Critical" ? (
                            <span className="bg-red-500/10 text-red-400 text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-widest border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                              Critical Alert
                            </span>
                          ) : (
                            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2.5 py-1.5 rounded-md font-bold uppercase tracking-widest border border-yellow-500/20">
                              Moderate
                            </span>
                          )}
                          <span className="text-[10px] bg-black/40 text-gray-400 px-2.5 py-1.5 rounded-md border border-white/5 uppercase tracking-widest font-bold">
                            {accident.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono bg-black/40 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1.5 shadow-inner">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {formatDistanceToNow(new Date(accident.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <h3 className="text-base md:text-lg font-heading font-medium text-white mb-2 flex items-center gap-2 tracking-wide pl-2">
                        <Car className="h-4 w-4 text-gray-500 shrink-0" />
                        <span className="break-words">{accident.location_name}</span>
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 pl-8 font-sans leading-relaxed">
                        &quot;{accident.description || "Transcription pending..."}&quot;
                      </p>
                      
                      <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2 pl-2 sm:pl-8">
                        {accident.assistance_required?.map(tag => (
                          <span key={tag} className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded shadow-inner border border-blue-500/10 tracking-wide">
                            {tag.replace('_', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                  <ShieldAlert className="h-8 w-8 text-gray-600 opacity-50" />
                </div>
                <p className="font-heading tracking-widest uppercase text-sm">Sector Clear</p>
                <p className="text-xs font-mono mt-2 opacity-50">No recent incidents in buffer</p>
              </div>
            )}
          </div>
        </div>
        
        {/* System Diagnostics */}
        <div className="space-y-5">
          <h2 className="text-lg font-heading font-semibold text-white tracking-wide flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-400" />
            System Diagnostics
          </h2>
          
          <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <ShieldAlert className="w-48 h-48 -mr-10 -mb-10" />
            </div>
            
            <div className="space-y-6 relative z-10">
              {/* API Health */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400 tracking-widest">BACKEND API</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md border ${
                    isApiHealthy 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isApiHealthy ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`}></span>
                    {isApiHealthy ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full ${isApiHealthy ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 w-[98%] shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 w-[10%]'}`}></div>
                </div>
              </div>

              {/* ML Prediction Core */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400 tracking-widest">ML PREDICTION CORE</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md border ${
                    isApiHealthy 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-gray-500 bg-black/40 border-white/5'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isApiHealthy ? 'bg-emerald-400 animate-ping' : 'bg-gray-500'}`}></span>
                    {isApiHealthy ? "ONLINE" : "STANDBY"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full ${isApiHealthy ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 w-[95%] shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-600 w-[0%]'}`}></div>
                </div>
              </div>

              {/* Dispatch Engine */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400 tracking-widest">GEO-DISPATCH ENGINE</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md border ${
                    activeTasks.length > 0 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTasks.length > 0 ? 'bg-emerald-400 animate-ping' : 'bg-yellow-400'}`}></span>
                    {activeTasks.length > 0 ? "ACTIVE" : "IDLE"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full transition-all duration-1000 ${
                    activeTasks.length > 0 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                  }`} style={{ width: activeTasks.length > 0 ? '85%' : '45%' }}></div>
                </div>
              </div>

              {/* Blockchain Status */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-400 tracking-widest">POLYGON BLOCKCHAIN</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-md border ${
                    poolData && !poolData?.error
                      ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                      : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${poolData && !poolData?.error ? 'bg-purple-400' : 'bg-yellow-400'}`}></span>
                    {poolData && !poolData?.error ? "SYNCED" : "CHECK CONFIG"}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1 border border-white/5 overflow-hidden">
                  <div className={`h-1 rounded-full ${
                    poolData && !poolData?.error 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-400 w-[90%] shadow-[0_0_10px_rgba(168,85,247,0.8)]'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-400 w-[30%]'
                  }`}></div>
                </div>
              </div>
              
              {/* Pool Info */}
              {poolData && !poolData?.error && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Reward Pool</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Balance</span>
                      <span className="text-sm font-heading font-bold text-white">{poolData.balance_matic || "—"} MATIC</span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Rewards Sent</span>
                      <span className="text-sm font-heading font-bold text-white">{completedTasks.length}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-white/10 mt-6">
                <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                  <span>LAST SYNC</span>
                  <span className="text-white">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
