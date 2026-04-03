"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icon issues
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const redIcon = createIcon('red');
const yellowIcon = createIcon('gold');

interface DetailMapProps {
  lat: number;
  lng: number;
  criticality: string;
}

export default function DetailMap({ lat, lng, criticality }: DetailMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-gray-900 border border-gray-800 rounded-xl animate-pulse"></div>;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[lat, lng]} 
        zoom={14} 
        scrollWheelZoom={false} 
        className="h-full w-full bg-gray-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        <Marker 
          position={[lat, lng]}
          icon={criticality === "Highly Critical" ? redIcon : yellowIcon}
        >
          <Popup className="custom-popup">
            <div className="font-semibold px-2 text-center text-sm">Incident Location</div>
          </Popup>
        </Marker>
      </MapContainer>
      <style jsx global>{`
        .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .leaflet-container {
          background-color: #111827 !important;
        }
      `}</style>
    </div>
  );
}
