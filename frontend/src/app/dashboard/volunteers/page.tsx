"use client";

import useSWR from "swr";
import { fetcher, API_ROUTES, Volunteer, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { 
  Users,
  Search,
  CheckCircle,
  XCircle,
  Phone,
  Link2,
  MapPin,
  Activity,
  X,
  Trash2,
  Save,
  Wallet,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type ModalMode = "add" | "edit" | null;

export default function VolunteersPage() {
  const { data, isLoading, mutate } = useSWR<{ total: number; items: Volunteer[] }>(
    `${API_ROUTES.volunteers}`, 
    fetcher,
    { refreshInterval: 15000 }
  );

  const [modal, setModal] = useState<ModalMode>(null);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formWallet, setFormWallet] = useState("");
  const [formAvailable, setFormAvailable] = useState(true);

  const openAdd = () => {
    setFormName("");
    setFormPhone("");
    setFormWallet("");
    setFormAvailable(true);
    setError("");
    setModal("add");
  };

  const openEdit = (vol: Volunteer) => {
    setEditingVolunteer(vol);
    setFormName(vol.name);
    setFormPhone(vol.phone);
    setFormWallet(vol.wallet_address || "");
    setFormAvailable(vol.is_available);
    setError("");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditingVolunteer(null);
    setError("");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiPost(API_ROUTES.volunteers, {
        name: formName,
        phone: formPhone,
        wallet_address: formWallet || null,
        is_available: formAvailable,
      });
      mutate();
      closeModal();
    } catch (err: any) {
      setError(err.message || "Failed to add volunteer");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer) return;
    setSaving(true);
    setError("");
    try {
      await apiPatch(API_ROUTES.volunteer(editingVolunteer.id), {
        name: formName,
        phone: formPhone,
        wallet_address: formWallet || null,
        is_available: formAvailable,
      });
      mutate();
      closeModal();
    } catch (err: any) {
      setError(err.message || "Failed to update volunteer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingVolunteer) return;
    if (!confirm("Are you sure you want to remove this node from the network?")) return;
    setSaving(true);
    try {
      await apiDelete(API_ROUTES.volunteer(editingVolunteer.id));
      mutate();
      closeModal();
    } catch (err: any) {
      setError(err.message || "Failed to delete volunteer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 font-heading tracking-tight mb-2 flex items-center gap-3">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Users className="text-emerald-500 h-6 w-6" />
            </div>
            Node Network
          </h1>
          <p className="text-gray-400 text-sm font-sans tracking-wide">Live telemetry and blockchain wallet linkage for operational nodes.</p>
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto relative z-10">
          <button 
            onClick={openAdd}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] border border-emerald-400 relative overflow-hidden group"
          >
            <span className="relative z-10 whitespace-nowrap">+ Add New Node</span>
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute -right-10 top-0 w-40 h-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left font-sans">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/10">
              <tr>
                <th className="px-6 py-5 font-bold">Node Identity</th>
                <th className="px-6 py-5 font-bold">Availability State</th>
                <th className="px-6 py-5 font-bold">Geospatial Lock</th>
                <th className="px-6 py-5 font-bold">Smart Contract (Polygon)</th>
                <th className="px-6 py-5 text-right font-bold">Parameters</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/5"></div>
                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-emerald-500 animate-spin"></div>
                        <Activity className="h-4 w-4 text-emerald-500/50" />
                      </div>
                      <span className="font-mono text-xs tracking-widest">LOCATING NODES...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <span className="font-mono text-xs tracking-widest">NO ACTIVE NODES IN NETWORK</span>
                  </td>
                </tr>
              ) : (
                data?.items?.map((volunteer, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={volunteer.id} 
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors relative group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-heading font-medium text-white text-base">{volunteer.name}</span>
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
                          <Phone className="h-3 w-3" />
                          {volunteer.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {volunteer.is_available ? (
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <CheckCircle className="h-3 w-3" />
                          Standby
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-red-400 bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/30">
                          <XCircle className="h-3 w-3" />
                          Busy
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {volunteer.location ? (
                        <span className="flex items-center gap-2 font-mono text-xs text-gray-300">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          {volunteer.location.lat.toFixed(4)}, {volunteer.location.lng.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono tracking-widest text-gray-600 bg-black/40 px-2.5 py-1 rounded border border-white/5 uppercase">No Lock</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {volunteer.wallet_address ? (
                        <a 
                          href={`https://amoy.polygonscan.com/address/${volunteer.wallet_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-purple-400 bg-purple-500/5 px-3 py-1.5 rounded-md border border-purple-500/20 flex items-center gap-2 w-fit hover:bg-purple-500/10 transition-colors"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          {volunteer.wallet_address.substring(0, 6)}...{volunteer.wallet_address.substring(38)}
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono tracking-widest text-gray-600 bg-black/40 px-2.5 py-1 rounded border border-white/5 uppercase">Not Synced</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => openEdit(volunteer)}
                        className="text-[10px] uppercase tracking-widest text-blue-400 font-bold bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-colors border border-blue-500/20"
                      >
                        CONFIG
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-panel rounded-2xl p-8 w-full max-w-lg border border-white/10 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={closeModal} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    {modal === "add" ? <Users className="h-5 w-5 text-emerald-500" /> : <User className="h-5 w-5 text-blue-500" />}
                  </div>
                  <h2 className="font-heading text-lg font-semibold text-white tracking-wide">
                    {modal === "add" ? "Register New Node" : "Configure Node"}
                  </h2>
                </div>

                <form onSubmit={modal === "add" ? handleAddSubmit : handleEditSubmit} className="space-y-5">
                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-2">Identity</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Full Name" required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-2">Contact</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+919876543210" required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-2">Wallet Address (Polygon)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input type="text" value={formWallet} onChange={(e) => setFormWallet(e.target.value)} placeholder="0x... (optional)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-2">Availability</label>
                    <button
                      type="button"
                      onClick={() => setFormAvailable(!formAvailable)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full ${
                        formAvailable 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}
                    >
                      {formAvailable ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <span className="text-sm font-heading font-medium">{formAvailable ? "Standby — Available" : "Busy — Unavailable"}</span>
                    </button>
                  </div>

                  {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                  <div className="flex items-center gap-3 pt-2">
                    {modal === "edit" && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={saving}
                        className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-heading font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Processing..." : modal === "add" ? "Register Node" : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
