"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ROUTES } from "@/lib/api";
import { motion } from "framer-motion";
import { Activity, Shield, Users, ArrowRight, Phone, Lock, User, Wallet } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"select" | "admin" | "volunteer-login" | "volunteer-register">("select");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin form
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("");

  // Volunteer form
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_ROUTES.adminLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify({ role: data.role, name: data.name, id: data.user_id }));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_ROUTES.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify({ role: data.role, name: data.name, id: data.user_id }));
      router.push("/portal");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_ROUTES.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, wallet_address: wallet || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify({ role: data.role, name: data.name, id: data.user_id }));
      router.push("/portal");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-red-900/10 mix-blend-screen blur-[120px]" />
      <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 mix-blend-screen blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-red-500/10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <Activity className="text-red-500 h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-wider font-heading">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">SMART</span>
              <span className="text-red-500">AI</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm tracking-wide">Emergency Response Platform</p>
        </div>

        {/* Role Selection */}
        {mode === "select" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button
              onClick={() => setMode("admin")}
              className="w-full glass-panel rounded-2xl p-6 flex items-center gap-4 hover:bg-white/[0.06] transition-all group border border-white/5 hover:border-red-500/20"
            >
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-heading font-semibold tracking-wide">Admin Dashboard</h3>
                <p className="text-gray-500 text-xs mt-0.5">Monitor incidents, manage dispatch</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-red-400 transition-colors" />
            </button>

            <button
              onClick={() => setMode("volunteer-login")}
              className="w-full glass-panel rounded-2xl p-6 flex items-center gap-4 hover:bg-white/[0.06] transition-all group border border-white/5 hover:border-blue-500/20"
            >
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-heading font-semibold tracking-wide">Volunteer Portal</h3>
                <p className="text-gray-500 text-xs mt-0.5">Accept tasks, earn MATIC rewards</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </button>
          </motion.div>
        )}

        {/* Admin Login Form */}
        {mode === "admin" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleAdminLogin} className="glass-panel rounded-2xl p-8 space-y-6 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-red-500" />
              <h2 className="font-heading text-lg font-semibold text-white tracking-wide">Admin Login</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} placeholder="Username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none transition-colors" />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-heading font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:opacity-50">
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>

            <button type="button" onClick={() => { setMode("select"); setError(""); }} className="w-full text-gray-500 text-xs hover:text-gray-300 transition-colors">← Back to selection</button>
          </motion.form>
        )}

        {/* Volunteer Login Form */}
        {mode === "volunteer-login" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleVolunteerLogin} className="glass-panel rounded-2xl p-8 space-y-6 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h2 className="font-heading text-lg font-semibold text-white tracking-wide">Volunteer Login</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (+919876543210)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-colors" />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-heading font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50">
              {loading ? "Logging in..." : "Sign In"}
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>No account?</span>
              <button type="button" onClick={() => { setMode("volunteer-register"); setError(""); }} className="text-blue-400 hover:text-blue-300 transition-colors"> Register here</button>
            </div>
            <button type="button" onClick={() => { setMode("select"); setError(""); }} className="w-full text-gray-500 text-xs hover:text-gray-300 transition-colors">← Back to selection</button>
          </motion.form>
        )}

        {/* Volunteer Register Form */}
        {mode === "volunteer-register" && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleRegister} className="glass-panel rounded-2xl p-8 space-y-6 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <h2 className="font-heading text-lg font-semibold text-white tracking-wide">Join as Volunteer</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (+919876543210)" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 4 chars)" required minLength={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Wallet Address (0x... optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors" />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-heading font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Already registered?</span>
              <button type="button" onClick={() => { setMode("volunteer-login"); setError(""); }} className="text-blue-400 hover:text-blue-300 transition-colors">Sign in</button>
            </div>
            <button type="button" onClick={() => { setMode("select"); setError(""); }} className="w-full text-gray-500 text-xs hover:text-gray-300 transition-colors">← Back to selection</button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
