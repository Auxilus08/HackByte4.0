"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authedFetcher, API_ROUTES, Task } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Activity,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Wallet,
  Award,
  ArrowRight,
  Loader2,
} from "lucide-react";

type UserInfo = { role: string; name: string; id: string };

export default function VolunteerPortal() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "volunteer") {
      router.push("/");
      return;
    }
    setUser(parsed);
  }, [router]);

  const { data: taskData, isLoading, mutate } = useSWR<{ total: number; items: Task[] }>(
    API_ROUTES.tasks,
    authedFetcher,
    { refreshInterval: 5000 }
  );

  const myTasks = taskData?.items?.filter((t) => t.volunteer_id === user?.id) || [];
  const pendingTasks = myTasks.filter((t) => t.status === "pending");
  const activeTasks = myTasks.filter((t) => t.status === "accepted" || t.status === "in-progress");
  const completedTasks = myTasks.filter((t) => t.status === "completed" || t.status === "verified");
  const rewardedTasks = myTasks.filter((t) => t.reward_tx_hash);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(API_ROUTES.task(taskId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      mutate();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  const stats = [
    { label: "Pending", value: pendingTasks.length, icon: Clock, color: "yellow" },
    { label: "Active", value: activeTasks.length, icon: Activity, color: "purple" },
    { label: "Completed", value: completedTasks.length, icon: CheckCircle2, color: "emerald" },
    { label: "Rewards", value: rewardedTasks.length, icon: Award, color: "blue" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Ambient glows */}
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/10 mix-blend-screen blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 mix-blend-screen blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 glass-panel border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Activity className="text-blue-500 h-5 w-5" />
            </div>
            <span className="font-heading font-bold tracking-widest text-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">SMART</span>
              <span className="text-red-500">AI</span>
              <span className="text-gray-500 text-xs ml-2 tracking-wider">VOLUNTEER</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 font-heading">{user.name}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-500 hover:text-red-400">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-heading tracking-tight mb-1">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">{user.name}</span>
          </h1>
          <p className="text-gray-500 text-sm">Your active missions and reward status</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-5 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold font-heading">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-yellow-500 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> New Missions
            </h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel rounded-2xl p-5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-gray-500">OP-{task.id.split("-")[0].toUpperCase()}</span>
                      <p className="text-sm text-gray-300 mt-1">
                        Incident: <span className="text-white font-semibold">{task.accident_id.split("-")[0].toUpperCase()}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Assigned {formatDistanceToNow(new Date(task.assigned_at), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={() => updateTaskStatus(task.id, "accepted")}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-heading font-semibold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      Accept <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-purple-500 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Active Missions
            </h2>
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel rounded-2xl p-5 border border-purple-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-gray-500">OP-{task.id.split("-")[0].toUpperCase()}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${
                          task.status === "accepted"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {task.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === "accepted" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "in-progress")}
                          className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 px-4 py-2 rounded-xl transition-colors font-heading font-semibold"
                        >
                          Start
                        </button>
                      )}
                      {(task.status === "accepted" || task.status === "in-progress") && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "completed")}
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-heading font-semibold px-4 py-2 rounded-xl transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Completed & Rewards */}
        {completedTasks.length > 0 && (
          <section>
            <h2 className="text-sm font-heading font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Completed Missions
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel rounded-2xl p-5 border border-emerald-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-gray-500">OP-{task.id.split("-")[0].toUpperCase()}</span>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.completed_at
                          ? `Completed ${formatDistanceToNow(new Date(task.completed_at), { addSuffix: true })}`
                          : task.verified_at
                          ? `Verified ${formatDistanceToNow(new Date(task.verified_at), { addSuffix: true })}`
                          : ""}
                      </p>
                    </div>
                    <div>
                      {task.reward_tx_hash ? (
                        <a
                          href={`https://amoy.polygonscan.com/tx/${task.reward_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          <span className="flex flex-col">
                            <span className="text-[9px] text-emerald-500/70 uppercase tracking-widest">Reward Sent</span>
                            <span className="font-mono">{task.reward_tx_hash.substring(0, 10)}...{task.reward_tx_hash.substring(task.reward_tx_hash.length - 4)}</span>
                          </span>
                        </a>
                      ) : task.status === "verified" ? (
                        <span className="text-[10px] text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 uppercase font-bold tracking-widest px-3 py-2 rounded-xl animate-pulse flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Processing Reward
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase font-bold tracking-widest px-3 py-2 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Awaiting Verification
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 animate-spin" />
              <Activity className="h-4 w-4 text-blue-500/50" />
            </div>
            <span className="font-mono text-xs tracking-widest text-gray-500">LOADING MISSIONS...</span>
          </div>
        )}

        {!isLoading && myTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Shield className="h-12 w-12 text-gray-700 mb-4" />
            <p className="font-heading text-gray-500 tracking-wide">No missions assigned yet</p>
            <p className="text-xs text-gray-600 mt-1">You'll be notified when an incident needs your help</p>
          </div>
        )}
      </main>
    </div>
  );
}
