"use client";

import dynamic from "next/dynamic";

// Map needs to be client-side only because leaflet uses window
const MapWithNoSSR = dynamic(() => import("@/components/MapComponent"), { 
  ssr: false,
  loading: () => <div className="h-full min-h-[600px] w-full bg-gray-900 border border-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-500">Loading map application...</div>
});

export default function MapPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Live Map View</h1>
        <p className="text-gray-400 text-sm">Geospatial visualization of all active incidents and volunteers.</p>
      </div>
      
      <div className="flex-1 min-h-[600px] w-full relative z-0">
        <MapWithNoSSR />
      </div>
    </div>
  );
}
