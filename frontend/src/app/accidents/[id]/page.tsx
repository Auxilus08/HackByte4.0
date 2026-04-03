"use client";

import useSWR from "swr";
import { fetcher, API_ROUTES, Accident, Task } from "@/lib/api";
import { formatDistanceToNow, format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  AlertTriangle,
  FileText,
  User,
  ShieldAlert,
  Activity,
  Zap
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Map needs to be client-side only
const DetailMapWithNoSSR = dynamic(() => import("@/components/DetailMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-black/40 animate-pulse text-gray-500 flex items-center justify-center font-mono text-xs tracking-widest border border-white/5">INITIALIZING GEO-MAP...</div>
});

export default function AccidentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const { data: accident, error, isLoading } = useSWR<Accident>(
    id ? API_ROUTES.accident(id) : null,
    fetcher
  );

  const { data: tasks } = useSWR<{ total: number; items: Task[] }>(
    `${API_ROUTES.tasks}`, 
    fetcher
  );

  const accidentTasks = tasks?.items.filter(t => t.accident_id === id) || [];
  const latestTask = accidentTasks[0]; // Assuming newest first

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-white/5"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-500 animate-spin glow-red"></div>
          <Activity className="h-5 w-5 text-red-500/50" />
        </div>
      </div>
    );
  }

  if (error || !accident) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <div className="w-24 h-24 rounded-full bg-red-500/5 flex items-center justify-center mb-6 border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-heading text-white font-bold mb-2">Record Classified or Missing</h2>
        <p className="mb-8 font-sans">The requested incident telemetry could not be extracted from the central database.</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 glass-panel hover:bg-white/10 text-white rounded-xl transition-all font-medium tracking-wide">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-5 relative">
        <button 
          onClick={() => router.back()} 
          className="p-3 glass-panel rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all hover:-translate-x-1 shadow-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 font-heading tracking-tight mb-0.5">
              Incident Diagnostics
            </h1>
            <span className="font-mono text-[10px] text-gray-400 bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg shadow-inner uppercase tracking-widest">
              TX: {accident.source_id.split('-').pop()}
            </span>
          </div>
          <p className="text-gray-500 text-xs font-mono flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3 text-red-500" /> 
            TRANSMITTED {formatDistanceToNow(new Date(accident.created_at), { addSuffix: true }).toUpperCase()} 
            <span className="text-gray-700 text-lg leading-none mb-1">•</span> 
            {format(new Date(accident.created_at), "yyyy-MM-dd HH:mm:ss")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
            <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] pointer-events-none rounded-full opacity-20 ${accident.criticality === "Highly Critical" ? "bg-red-500" : "bg-yellow-500"}`}></div>

            <div className="p-8 border-b border-white/5 relative z-10">
              <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2 mb-8 tracking-wide">
                <FileText className="h-5 w-5 text-red-500" />
                Situational Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">Current Node Status</span>
                    <div className="mt-2.5 flex items-center">
                      <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border ${
                        accident.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                        accident.status === 'dispatched' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                      }`}>
                        {accident.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">AI Threat Assessment</span>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${accident.criticality === "Highly Critical" ? "border-red-500/30 bg-red-500/10 text-red-500 glow-red" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <span className={`font-heading font-bold text-xl tracking-tight ${accident.criticality === "Highly Critical" ? "text-red-400" : "text-yellow-400"}`}>
                        {accident.criticality}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">Geospatial Coordinates</span>
                    <div className="mt-2.5 flex items-start gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                      <MapPin className="h-5 w-5 text-red-500 shrink-0" />
                      <span className="text-gray-200 text-sm font-sans leading-relaxed block">
                        {accident.location_name}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">Required Units</span>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {accident.assistance_required?.length > 0 ? (
                        accident.assistance_required.map(tag => (
                          <span key={tag} className="text-xs text-blue-300 font-bold bg-blue-900/30 px-3 py-1.5 rounded-lg shadow-inner border border-blue-500/20 uppercase tracking-wider">
                            {tag.replace('_', ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600 font-mono italic p-2 bg-black/40 rounded border border-white/5">NONE SPECIFIED</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-black/30 relative z-10 border-t border-white/5">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold block mb-3 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500" /> Machine Transcription
              </span>
              <p className="text-gray-300 text-lg font-sans leading-relaxed tracking-wide p-6 rounded-xl border border-white/10 bg-white/5 italic shadow-inner">
                "{accident.description || "Voice buffer empty."}"
              </p>
            </div>
          </div>

          <div className="h-[400px] glass-panel rounded-2xl overflow-hidden shadow-2xl relative z-0 p-1">
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
            {accident.location && (
              <div className="h-full w-full rounded-xl overflow-hidden relative">
                <DetailMapWithNoSSR 
                  lat={accident.location.lat} 
                  lng={accident.location.lng} 
                  criticality={accident.criticality}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Dispatch & Timeline */}
        <div className="space-y-8">
          <div className="glass-panel rounded-2xl p-7 shadow-2xl relative overflow-hidden">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2 mb-6 tracking-wide">
              <User className="h-5 w-5 text-blue-500" />
              Dispatch Override
            </h2>
            
            {latestTask ? (
              <div className="space-y-6 relative z-10">
                 <div className="p-5 bg-gradient-to-br from-blue-900/20 to-black/40 border border-blue-500/20 rounded-xl shadow-inner">
                   <div className="flex items-center gap-4 mb-3">
                     <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg font-heading font-bold border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                       V
                     </div>
                     <div>
                       <p className="text-white font-sans font-semibold tracking-wide">Operative Assigned</p>
                       <Link href={`/volunteers/${latestTask.volunteer_id}`} className="text-xs font-mono tracking-widest text-blue-400 hover:text-blue-300 transition-colors uppercase mt-0.5 block">
                         ACCESS PROFILE →
                       </Link>
                     </div>
                   </div>
                 </div>
                 
                 <div className="border border-white/10 bg-black/30 rounded-xl p-5 shadow-inner">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">Sequence Phase</span>
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded shadow-inner border border-white/5">{latestTask.status.replace('-', ' ')}</span>
                   </div>
                   <div className="w-full bg-gray-900 rounded-full h-2 mt-3 border border-white/5 overflow-hidden">
                     <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${latestTask.status === 'verified' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'}`} 
                        style={{ width: latestTask.status === 'completed' || latestTask.status === 'verified' ? '100%' : '50%' }}
                     ></div>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="p-6 bg-black/30 rounded-xl border border-white/5 text-center relative z-10">
                <Activity className="h-10 w-10 text-red-500/40 mx-auto mb-4 animate-pulse" />
                <p className="text-xs font-mono font-bold tracking-widest text-gray-400 mb-6 uppercase">No Operative Attached</p>
                <button className="w-full py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] border border-red-400 relative overflow-hidden group">
                  <span className="relative z-10">Force Dispatch Override</span>
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </button>
              </div>
            )}
          </div>
          
          <div className="glass-panel rounded-2xl p-7 shadow-2xl">
            <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2 mb-8 tracking-wide">
              <Clock className="h-5 w-5 text-emerald-500" />
              Event Telemetry
            </h2>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              
              <div className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-[#050505] bg-emerald-500 text-gray-900 shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0 z-10 relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50"></div>
                </div>
                <div className="pt-0.5">
                  <div className="text-sm font-sans font-bold text-white tracking-wide mb-1">Incoming Transmission Logged</div>
                  <div className="text-xs font-sans text-gray-400 leading-relaxed mb-2">Automated ingress parsed via Twilio Voice API module.</div>
                  <div className="text-[10px] font-mono font-bold tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded inline-block">
                    {format(new Date(accident.created_at), "HH:mm:ss.SSS")}
                  </div>
                </div>
              </div>

              {latestTask && (
                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-[#050505] bg-blue-500 text-gray-900 shadow-[0_0_10px_rgba(59,130,246,0.5)] shrink-0 z-10 relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                  </div>
                  <div className="pt-0.5">
                    <div className="text-sm font-sans font-bold text-white tracking-wide mb-1">Geospatial Lock</div>
                    <div className="text-xs font-sans text-gray-400 leading-relaxed mb-2">PostGIS successfully triangulated nearest active operative.</div>
                    <div className="text-[10px] font-mono font-bold tracking-widest text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded inline-block">
                      {format(new Date(latestTask.assigned_at), "HH:mm:ss.SSS")}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
