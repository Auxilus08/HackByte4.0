"use client";

import { motion } from "framer-motion";
import { Activity, Shield, Users, ArrowRight, Phone, Zap, Globe2, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-red-900/15 mix-blend-screen blur-[140px]" />
        <div className="absolute top-[50%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 mix-blend-screen blur-[120px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[40%] rounded-full bg-purple-900/8 mix-blend-screen blur-[100px]" />
      </div>

      {/* ── Navigation ─────────────────── */}
      <nav className="relative z-20 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <Activity className="text-red-500 h-5 w-5" />
            </div>
            <span className="font-heading font-bold tracking-widest text-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">SMART</span>
              <span className="text-red-500">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors font-heading tracking-wide px-4 py-2">
              Login
            </Link>
            <Link
              href="/login"
              className="text-sm bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-heading font-semibold px-5 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-gray-300 font-mono tracking-wider">POWERED BY AI + BLOCKCHAIN</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight leading-[1.1] mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-100 to-gray-400">
              Accident Response,
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-500 to-orange-500">
              Reimagined
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed font-sans">
            Voice-powered reporting, AI-driven severity assessment, and blockchain-incentivized volunteer dispatch — all in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-heading font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Access Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 glass-panel text-gray-300 hover:text-white font-heading font-semibold px-8 py-3.5 rounded-xl text-base transition-all hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Users className="h-4 w-4" /> Join as Volunteer
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Response Time", value: "<90s", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { label: "AI Assessment", value: "98%", icon: Shield, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Volunteer Network", value: "24/7", icon: Globe2, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "On-Chain Rewards", value: "MATIC", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-panel rounded-2xl p-5 text-center group hover:-translate-y-1 transition-transform"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-xl sm:text-2xl font-heading font-bold text-white">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How It Works ─────────────────── */}
      <section className="relative z-10 py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
              From accident detection to volunteer reward, every step is automated and transparent.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "01",
                title: "Voice Report",
                description: "Witness calls in or reports via app. Twilio captures the voice data and our AI transcribes it instantly.",
                icon: Phone,
                color: "red",
              },
              {
                step: "02",
                title: "AI Assessment",
                description: "Gemini AI analyzes severity, determines required assistance, and identifies the geolocation automatically.",
                icon: Shield,
                color: "blue",
              },
              {
                step: "03",
                title: "Smart Dispatch",
                description: "Nearest available volunteers are notified. Upon completion, MATIC rewards are sent via Polygon smart contract.",
                icon: Zap,
                color: "emerald",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-${item.color}-500/5 blur-2xl group-hover:bg-${item.color}-500/10 transition-colors`} />
                <span className="text-xs font-mono text-gray-600 tracking-widest">STEP {item.step}</span>
                <div className={`mt-4 w-12 h-12 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/30 flex items-center justify-center mb-4`}>
                  <item.icon className={`h-6 w-6 text-${item.color}-500`} />
                </div>
                <h3 className="text-lg font-heading font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────── */}
      <section className="relative z-10 py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">Built With</h2>
            <p className="text-gray-500 text-sm">Modern technologies for a robust, scalable platform.</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {["Next.js", "FastAPI", "PostgreSQL + PostGIS", "Twilio", "Google Gemini AI", "Polygon (MATIC)", "Solidity", "Leaflet Maps", "WebSockets"].map(
              (tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="text-xs sm:text-sm font-mono text-gray-300 glass-panel px-4 py-2 rounded-xl hover:bg-white/10 transition-colors cursor-default border border-white/5"
                >
                  {tech}
                </motion.span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────── */}
      <section className="relative z-10 py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Ready to make roads safer?
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              Whether you&apos;re an admin managing incidents or a volunteer earning rewards, SmartAI has a role for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-heading font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
              >
                Get Started Now <ChevronRight className="h-4 w-4" />
              </Link>
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
            Built for HackByte 4.0 · {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
