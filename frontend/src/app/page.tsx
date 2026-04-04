"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Activity, Shield, Users, ArrowRight, Phone, Zap, Globe2, 
  CheckCircle2, ChevronRight, Radio, Cpu, Coins, MapPin,
  Siren, HeartPulse, BarChart3, Lock
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden noise-overlay">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-red-900/15 mix-blend-screen blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[50%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 mix-blend-screen blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[40%] rounded-full bg-purple-900/8 mix-blend-screen blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Grid background */}
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

      {/* ── Navigation ─────────────────── */}
      <nav className="relative z-20 border-b border-white/5 backdrop-blur-xl bg-black/30 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 glow-red">
              <Activity className="text-red-500 h-5 w-5" />
            </div>
            <span className="font-heading font-bold tracking-widest text-lg">
              <span className="text-gradient-white">SMART</span>
              <span className="text-red-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 mr-4 text-xs glass-panel px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-400 font-mono tracking-wider">SYSTEM ONLINE</span>
            </div>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors font-heading tracking-wide px-4 py-2">
              Login
            </Link>
            <Link
              href="/login"
              className="text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-heading font-semibold px-5 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Emergency Ticker ─────────────────── */}
      <div className="relative z-10 emergency-bar py-2 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-8 whitespace-nowrap text-xs font-mono text-red-400/80"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-6">
              <span className="flex items-center gap-2"><Radio className="h-3 w-3" /> LIVE EMERGENCY MONITORING</span>
              <span className="text-white/20">│</span>
              <span className="flex items-center gap-2"><Siren className="h-3 w-3" /> AI-POWERED SEVERITY CLASSIFICATION</span>
              <span className="text-white/20">│</span>
              <span className="flex items-center gap-2"><Coins className="h-3 w-3" /> BLOCKCHAIN REWARD DISTRIBUTION</span>
              <span className="text-white/20">│</span>
              <span className="flex items-center gap-2"><Globe2 className="h-3 w-3" /> GEO-SPATIAL VOLUNTEER DISPATCH</span>
              <span className="text-white/20">│</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Hero Section ─────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-red-500 pulse-dot" />
            <span className="text-xs text-red-300 font-mono tracking-wider">HACKBYTE 4.0 · EMERGENCY RESPONSE PLATFORM</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight leading-[1.05] mb-6">
            <span className="text-gradient-white">
              Emergency Response
            </span>
            <br />
            <span className="text-gradient-red">
              Reimagined.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Call a number. AI classifies severity. Nearest volunteer dispatched. 
            Blockchain rewards verified responders. <span className="text-white font-medium">All in under 90 seconds.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-heading font-semibold px-8 py-4 rounded-2xl text-base transition-all shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_50px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Access Command Center <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass-panel glass-panel-hover text-gray-300 hover:text-white font-heading font-semibold px-8 py-4 rounded-2xl text-base"
            >
              <HeartPulse className="h-4 w-4" /> Volunteer Portal
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Response Time", value: "<90s", icon: Zap, color: "yellow", desc: "Voice to dispatch" },
            { label: "ML Accuracy", value: "99.6%", icon: Shield, color: "red", desc: "F1 classification score" },
            { label: "Network Coverage", value: "24/7", icon: Globe2, color: "blue", desc: "Always available" },
            { label: "Blockchain", value: "MATIC", icon: Coins, color: "purple", desc: "Polygon Amoy testnet" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 text-center group cursor-default scanline-overlay relative overflow-hidden"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 mb-3`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
              </div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-white">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
              <p className="text-[9px] text-gray-600 mt-1 font-mono">{stat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── Call Flow Pipeline ─────────────────── */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono text-red-400 tracking-widest uppercase mb-4 block">End-to-End Pipeline</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              From <span className="text-gradient-red">Phone Call</span> to <span className="text-gradient-red">Reward</span>
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              Every step is automated, transparent, and happens in real-time.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Voice Report", desc: "Caller dials in and describes the accident in natural speech", icon: Phone, color: "red" },
              { step: "02", title: "AI Analysis", desc: "TF-IDF + ML classifies severity, extracts assistance types", icon: Cpu, color: "orange" },
              { step: "03", title: "Geocode", desc: "Google Maps API converts spoken address to exact coordinates", icon: MapPin, color: "blue" },
              { step: "04", title: "Auto-Dispatch", desc: "PostGIS finds nearest available volunteer via proximity query", icon: Radio, color: "emerald" },
              { step: "05", title: "Reward", desc: "Smart contract sends 0.01 MATIC to verified volunteer's wallet", icon: Coins, color: "purple" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 relative overflow-hidden group"
              >
                <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full bg-${item.color}-500/5 blur-2xl group-hover:bg-${item.color}-500/10 transition-all duration-500`} />
                <div className="relative z-10">
                  <span className="text-[10px] font-mono text-gray-600 tracking-widest block mb-3">STEP {item.step}</span>
                  <div className={`w-11 h-11 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/25 flex items-center justify-center mb-4`}>
                    <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                  </div>
                  <h3 className="text-base font-heading font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <ChevronRight className="h-4 w-4 text-gray-700" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────── */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-mono text-blue-400 tracking-widest uppercase mb-4 block">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
              Built for <span className="text-gradient-red">Real Emergencies</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Every feature designed with one goal — save lives faster.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Voice-First Reporting", desc: "Natural speech input via Twilio. No app downloads needed — just call.", icon: Phone, color: "red" },
              { title: "Real-Time Dashboard", desc: "Live WebSocket updates. Interactive maps. Glassmorphism dark-mode UI.", icon: BarChart3, color: "blue" },
              { title: "ML Severity Engine", desc: "TF-IDF + GradientBoosting with 99.6% F1. Rule-based fallback built in.", icon: Cpu, color: "orange" },
              { title: "PostGIS Spatial Dispatch", desc: "ST_Distance proximity queries find the nearest available volunteer instantly.", icon: MapPin, color: "emerald" },
              { title: "Blockchain Rewards", desc: "Solidity RewardPool contract on Polygon. Double-payout prevention on-chain.", icon: Lock, color: "purple" },
              { title: "Volunteer Network", desc: "Self-registration portal with geolocation. Accept tasks, earn MATIC.", icon: Users, color: "yellow" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden group"
              >
                <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-${feature.color}-500/5 blur-3xl group-hover:bg-${feature.color}-500/10 transition-all duration-700`} />
                <div className="relative z-10">
                  <div className={`w-11 h-11 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/25 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-5 w-5 text-${feature.color}-500`} />
                  </div>
                  <h3 className="text-base font-heading font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────── */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase mb-4 block">Technology</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">Powered By</h2>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[
              { name: "Next.js 16", cat: "Frontend" },
              { name: "FastAPI", cat: "Backend" },
              { name: "PostgreSQL", cat: "Database" },
              { name: "PostGIS", cat: "Spatial" },
              { name: "Twilio Voice", cat: "Telephony" },
              { name: "scikit-learn", cat: "ML" },
              { name: "Polygon", cat: "Chain" },
              { name: "Solidity", cat: "Contract" },
              { name: "WebSockets", cat: "Realtime" },
              { name: "Leaflet", cat: "Maps" },
            ].map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="glass-panel glass-panel-hover rounded-xl p-4 text-center cursor-default"
              >
                <p className="text-sm font-heading font-medium text-white">{tech.name}</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1 font-mono">{tech.cat}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────── */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="glass-panel gradient-border rounded-3xl p-10 sm:p-14 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-red-500/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-blue-500/5 blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 glow-red mb-6">
                  <Siren className="h-7 w-7 text-red-500" />
                </div>
                <h2 className="text-2xl sm:text-4xl font-heading font-bold text-white mb-4">
                  Ready to save lives?
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
                  Whether you&apos;re an admin managing emergency response or a volunteer earning crypto rewards — get started now.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/login"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-heading font-semibold px-8 py-4 rounded-2xl text-base transition-all shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                  >
                    Launch Platform <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            <span className="font-heading font-bold text-sm tracking-widest text-gray-400">
              SMART<span className="text-red-500">AI</span>
            </span>
          </div>
          <p className="text-xs text-gray-600 font-mono tracking-wide">
            Built for HackByte 4.0 · Polygon Amoy Testnet · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
