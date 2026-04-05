"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { authedFetcher, API_ROUTES, Task, VerificationResult } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
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
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  FileCheck,
  ShieldCheck,
  Bot,
  AlertOctagon,
} from "lucide-react";

type UserInfo = { role: string; name: string; id: string };

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function VolunteerPortal() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  // Proof upload state
  const [proofModalTask, setProofModalTask] = useState<Task | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "volunteer") {
      router.push("/dashboard");
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
      const res = await fetch(API_ROUTES.task(taskId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || "Update failed");
      }
      mutate();
    } catch (err: any) {
      console.error("Failed to update task:", err);
      // If completing failed due to missing proofs, open the modal
      if (newStatus === "completed" && err.message?.includes("proof")) {
        const task = myTasks.find((t) => t.id === taskId);
        if (task) openProofModal(task);
      }
    }
  };

  // ── Proof Upload Logic ─────────────────────────────────────
  const openProofModal = (task: Task) => {
    setProofModalTask(task);
    setSelectedFiles([]);
    setUploadError("");
    setUploadSuccess("");
  };

  const closeProofModal = () => {
    setProofModalTask(null);
    setSelectedFiles([]);
    setUploadError("");
    setUploadSuccess("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const existingCount = proofModalTask?.proof_images?.length || 0;
    const maxAllowed = 5 - existingCount - selectedFiles.length;

    if (files.length > maxAllowed) {
      setUploadError(`You can add ${maxAllowed} more image(s). Max 5 total.`);
      return;
    }

    // Validate file types
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const invalid = files.filter((f) => !allowed.includes(f.type));
    if (invalid.length > 0) {
      setUploadError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    // Validate file sizes (10MB)
    const tooBig = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (tooBig.length > 0) {
      setUploadError("Each file must be under 10 MB.");
      return;
    }

    setUploadError("");
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadProofs = async () => {
    if (!proofModalTask || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch(API_ROUTES.taskProofs(proofModalTask.id), {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Upload failed");
      }

      setUploadSuccess("Proofs uploaded successfully! You can now complete the task.");
      setSelectedFiles([]);
      mutate(); // Refresh tasks to get updated proof_images

    } catch (err: any) {
      setUploadError(err.message || "Failed to upload proofs");
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteWithProofs = async () => {
    if (!proofModalTask) return;
    await updateTaskStatus(proofModalTask.id, "completed");
    closeProofModal();
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

  // Get the latest proof_images for the modal task from real-time data
  const currentModalTask = proofModalTask
    ? myTasks.find((t) => t.id === proofModalTask.id) || proofModalTask
    : null;
  const proofCount = currentModalTask?.proof_images?.length || 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Ambient glows */}
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/10 mix-blend-screen blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 mix-blend-screen blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 glass-panel border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
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

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8 relative z-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl md:text-2xl font-bold font-heading tracking-tight mb-1">
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-heading font-semibold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] w-full sm:w-auto"
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                        {/* Show proof count badge */}
                        {(task.proof_images?.length || 0) > 0 && (
                          <span className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Camera className="h-3 w-3" /> {task.proof_images!.length} proof(s)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      {task.status === "accepted" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "in-progress")}
                          className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 px-4 py-2 rounded-xl transition-colors font-heading font-semibold"
                        >
                          Start
                        </button>
                      )}
                      {/* Upload Proofs button */}
                      {(task.status === "accepted" || task.status === "in-progress") && (
                        <button
                          onClick={() => openProofModal(task)}
                          className="flex items-center gap-2 text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 px-4 py-2 rounded-xl transition-colors font-heading font-semibold"
                        >
                          <Camera className="h-3.5 w-3.5" /> Upload Proofs
                        </button>
                      )}
                      {/* Complete button — only if proofs are uploaded */}
                      {(task.status === "accepted" || task.status === "in-progress") && (
                        <button
                          onClick={() => {
                            if ((task.proof_images?.length || 0) < 1) {
                              openProofModal(task);
                            } else {
                              updateTaskStatus(task.id, "completed");
                            }
                          }}
                          className={`flex items-center gap-2 text-xs font-heading font-semibold px-4 py-2 rounded-xl transition-all ${
                            (task.proof_images?.length || 0) >= 1
                              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white"
                              : "bg-gray-500/10 border border-gray-500/20 text-gray-400 hover:bg-gray-500/20"
                          }`}
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                      {/* Proof images count */}
                      {(task.proof_images?.length || 0) > 0 && (
                        <p className="text-xs text-emerald-400/70 mt-1 flex items-center gap-1">
                          <Camera className="h-3 w-3" /> {task.proof_images!.length} proof image(s) submitted
                        </p>
                      )}
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

      {/* ── Proof Upload Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {proofModalTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={closeProofModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-orange-900/20 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30">
                      <Camera className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-white tracking-wide">Upload Proof Images</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Task: OP-{currentModalTask?.id.split("-")[0].toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeProofModal}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Info Banner */}
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <span className="font-bold">📸 Required:</span> Upload photos of the emergency scene and proof that 
                    help has arrived before marking this task as complete.
                  </p>
                </div>

                {/* Already uploaded proofs */}
                {proofCount > 0 && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-2">
                      Previously Uploaded ({proofCount})
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {currentModalTask?.proof_images?.map((url, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden relative group"
                        >
                          <div className="aspect-square relative">
                            <img
                              src={`${BACKEND_URL}${url}`}
                              alt={`Proof ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <FileCheck className="h-5 w-5 text-emerald-400" />
                            </div>
                            {/* Verification badge overlay */}
                            {(() => {
                              const vr = currentModalTask?.verification_results?.find(
                                (r: VerificationResult) => r.image_url === url
                              );
                              if (!vr || vr.error) return null;
                              return (
                                <div className="absolute top-1 left-1 flex gap-1">
                                  {vr.is_accident && (
                                    <span className="text-[8px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded font-bold">
                                      {vr.accident_confidence}%
                                    </span>
                                  )}
                                  {vr.ai_generated && (
                                    <span className="text-[8px] bg-red-500/80 text-white px-1.5 py-0.5 rounded font-bold">
                                      AI
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File selection area */}
                <div>
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-2">
                    Select Images
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/10 hover:border-orange-500/40 rounded-xl py-8 flex flex-col items-center gap-3 transition-all hover:bg-orange-500/5 group"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-orange-500/10 transition-colors">
                      <Upload className="h-6 w-6 text-gray-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 font-heading font-semibold">
                        Tap to select photos
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">
                        JPG, PNG, WebP • Max 10 MB each • Up to {5 - proofCount} image(s)
                      </p>
                    </div>
                  </button>
                </div>

                {/* Selected files preview */}
                {selectedFiles.length > 0 && (
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-2">
                      Selected ({selectedFiles.length})
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedFiles.map((file, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl border border-orange-500/20 bg-orange-500/5 overflow-hidden relative group"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile(i)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1">
                            <p className="text-[9px] text-gray-300 truncate">{file.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error/Success Messages */}
                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" /> {uploadSuccess}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 flex gap-3">
                {/* Upload button */}
                <button
                  onClick={uploadProofs}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl text-sm font-heading font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Upload Proofs"}
                </button>

                {/* Complete button — only enabled if proofs exist */}
                <button
                  onClick={handleCompleteWithProofs}
                  disabled={proofCount < 1 || uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-heading font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4" /> Complete Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
