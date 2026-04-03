"use client";

import useSWR from "swr";
import { fetcher, API_ROUTES, Task } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { 
  CheckSquare,
  Shield,
  Clock,
  ArrowRight,
  Activity
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TasksPage() {
  const { data: tasks, isLoading } = useSWR<{ total: number; items: Task[] }>(
    `${API_ROUTES.tasks}`, 
    fetcher,
    { refreshInterval: 10000 }
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 font-heading tracking-tight mb-2 flex items-center gap-3">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <CheckSquare className="text-blue-500 h-6 w-6" />
          </div>
          Active Operations
        </h1>
        <p className="text-gray-400 text-sm font-sans tracking-wide">Monitor ongoing responder tasks and Web3 smart contract payouts.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute -left-10 bottom-0 w-40 h-40 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left font-sans">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/10">
              <tr>
                <th className="px-6 py-5 font-bold">Operation UID</th>
                <th className="px-6 py-5 font-bold">Incident / Node Link</th>
                <th className="px-6 py-5 font-bold">Operation Phase</th>
                <th className="px-6 py-5 font-bold">T0 Sequence</th>
                <th className="px-6 py-5 font-bold">Web3 Telemetry (Polygon)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/5"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 animate-spin"></div>
                        <Activity className="h-4 w-4 text-blue-500/50" />
                      </div>
                      <span className="font-mono text-xs tracking-widest">FETCHING OPERATIONS...</span>
                    </div>
                  </td>
                </tr>
              ) : tasks?.items?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <span className="font-mono text-xs tracking-widest">NO DISPATCH OPERATIONS FOUND</span>
                  </td>
                </tr>
              ) : (
                tasks?.items?.map((task, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={task.id} 
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs text-gray-500 bg-black/40 border border-white/10 px-2 py-1 rounded">
                        OP-{task.id.split('-')[0].toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 text-xs">
                        <Link href={`/accidents/${task.accident_id}`} className="text-blue-400 hover:text-blue-300 font-bold transition-colors flex items-center gap-1.5 uppercase tracking-widest font-mono">
                          Trace Incident <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <span className="text-gray-500 font-mono tracking-widest uppercase bg-white/5 border border-white/5 px-2 py-1 rounded w-fit">
                          Node: {task.volunteer_id.split('-')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-widest border ${
                        task.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                        task.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                        task.status === 'in-progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(task.assigned_at), { addSuffix: true })}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {task.reward_tx_hash ? (
                        <a href={`https://mumbai.polygonscan.com/tx/${task.reward_tx_hash}`} target="_blank" className="font-mono text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-md border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center gap-2 w-fit">
                          <Shield className="h-3.5 w-3.5" />
                          {task.reward_tx_hash.substring(0, 10)}...
                        </a>
                      ) : task.status === 'verified' ? (
                        <span className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 uppercase font-bold tracking-widest px-3 py-1.5 rounded animate-pulse">Awaiting Contract</span>
                      ) : (
                        <span className="text-[10px] text-gray-500 bg-black/40 border border-white/5 uppercase font-bold tracking-widest px-3 py-1.5 rounded">-</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
