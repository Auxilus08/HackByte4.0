"use client";

import useSWR from "swr";
import { fetcher, API_ROUTES, Accident } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { 
  AlertTriangle, 
  Search,
  Filter,
  ArrowRight,
  Clock,
  MapPin,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const PAGE_SIZE = 20;

export default function AccidentsListPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  
  const { data, error, isLoading } = useSWR<{ total: number; items: Accident[] }>(
    `${API_ROUTES.accidents}?limit=200`, 
    fetcher,
    { refreshInterval: 10000 }
  );

  const filteredAccidents = useMemo(() => {
    let items = data?.items || [];
    if (statusFilter !== "all") {
      items = items.filter(acc => acc.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(acc =>
        acc.location_name?.toLowerCase().includes(q) ||
        acc.description?.toLowerCase().includes(q) ||
        acc.source_id?.toLowerCase().includes(q) ||
        acc.criticality?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, statusFilter, searchQuery]);

  const totalPages = Math.ceil((filteredAccidents?.length || 0) / PAGE_SIZE);
  const paginatedAccidents = filteredAccidents?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filters change
  const handleFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(0);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 font-heading tracking-tight mb-2 flex items-center gap-3">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/30 glow-red shadow-lg">
              <AlertTriangle className="text-red-500 h-6 w-6" />
            </div>
            Incident Register
          </h1>
          <p className="text-gray-400 text-sm font-sans tracking-wide">Historical log and real-time feed of all reported collisions and emergencies.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto relative z-10">
          <div className="relative flex-1 sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-white transition-colors z-10" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search locations, descriptions..." 
              className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-500 transition-all font-sans relative z-0"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-focus-within:opacity-10 pointer-events-none transition-opacity blur-md"></div>
          </div>
          <div className="relative group">
            <select 
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 glass-panel rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-red-500/50 text-white font-sans cursor-pointer hover:bg-white/5 transition-colors relative z-0"
            >
              <option value="all" className="bg-gray-900">All Nodes</option>
              <option value="reported" className="bg-gray-900">Reported</option>
              <option value="assessing" className="bg-gray-900">Assessing</option>
              <option value="dispatched" className="bg-gray-900">Dispatched</option>
              <option value="resolved" className="bg-gray-900">Resolved</option>
            </select>
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-white pointer-events-none transition-colors z-10" />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-500"></div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-red-500/5 blur-3xl pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left font-sans">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/10">
              <tr>
                <th className="px-6 py-5 font-bold">Trace ID</th>
                <th className="px-6 py-5 font-bold">Coordinates & Threat Level</th>
                <th className="px-6 py-5 font-bold">Support Reqs</th>
                <th className="px-6 py-5 font-bold">Node Status</th>
                <th className="px-6 py-5 font-bold">Timestamp</th>
                <th className="px-6 py-5 text-right font-bold">Override</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/5"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-500 animate-spin"></div>
                        <Activity className="h-4 w-4 text-red-500/50" />
                      </div>
                      <span className="font-mono text-xs tracking-widest">CONNECTING TO DATABASE...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedAccidents?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <span className="font-mono text-xs tracking-widest">NO RECORDS MATCH QUERY</span>
                  </td>
                </tr>
              ) : (
                paginatedAccidents?.map((accident, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={accident.id} 
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group relative"
                  >
                    <td className="px-6 py-5">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-red-500 transition-colors"></div>
                      <span className="font-mono text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                        {accident.source_id.split('-').pop()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <span className="font-heading font-medium text-white flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-500" />
                          {accident.location_name}
                        </span>
                        {accident.criticality === "Highly Critical" ? (
                          <span className="w-fit bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded shadow-inner border border-red-500/20 uppercase tracking-widest font-bold">
                            Level: Critical
                          </span>
                        ) : (
                          <span className="w-fit bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded shadow-inner border border-yellow-500/20 uppercase tracking-widest font-bold">
                            Level: Moderate
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {accident.assistance_required?.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] text-blue-300 bg-blue-900/30 px-2 py-1 rounded shadow-inner border border-blue-500/20 uppercase tracking-widest font-medium">
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                        {accident.assistance_required?.length > 2 && (
                          <span className="text-[9px] text-gray-400 bg-black/40 px-2 py-1 rounded border border-white/10 font-mono">
                            +{accident.assistance_required.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-widest border ${
                        accident.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                        accident.status === 'dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                        accident.status === 'assessing' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 glow-yellow'
                      }`}>
                        {accident.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(accident.created_at), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/dashboard/accidents/${accident.id}`}
                        className="inline-flex items-center justify-center p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 group/btn"
                      >
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-mono bg-black/20">
          <span>QUERY YIELD: <strong className="text-white font-sans">{filteredAccidents?.length || 0}</strong> / <strong className="text-white font-sans">{data?.total || 0}</strong> ROWS{totalPages > 1 && <> · PAGE <strong className="text-white font-sans">{page + 1}</strong> / <strong className="text-white font-sans">{totalPages}</strong></>}</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-1.5 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5 disabled:cursor-not-allowed tracking-wider"
            >
              PREV
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-1.5 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-white/5 disabled:cursor-not-allowed tracking-wider"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
