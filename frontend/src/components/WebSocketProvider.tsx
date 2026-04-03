"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { API_ROUTES } from "@/lib/api";

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: any | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
});

export const useWebSocket = () => useContext(WebSocketContext);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    // In production, you'd use a robust solution like reconnecting-websocket or socket.io
    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws`);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLastMessage(payload);
        
        switch (payload.type) {
          case 'new_accident':
            console.log("New Event: Accident Triggered", payload.data);
            // Invalidate accidents cache to trigger a live re-fetch
            mutate(`${API_ROUTES.accidents}?limit=5`);
            mutate(`${API_ROUTES.accidents}?limit=50`);
            break;
            
          case 'volunteer_dispatched':
          case 'task_updated':
            console.log("New Event: Task Upate", payload.data);
            mutate(`${API_ROUTES.tasks}`);
            
            // If we are currently looking at a specific accident page, update that too
            if (payload.data.accident_id) {
              mutate(API_ROUTES.accident(payload.data.accident_id));
            }
            break;
            
          default:
            console.log("Received unknown WS event:", payload.type);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      // Optional: Add simple reconnect logic
      setTimeout(() => {
        // Since React 18 strict mode runs this twice, simple timeouts without refs may race 
        // For hackathon sake, relying on full page load is fine, but re-connecting is better
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      ws.close();
    };
  }, [mutate]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
