"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Clean up previous connection
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
    }

    const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:8000';
    
    try {
      const ws = new WebSocket(`${wsUrl}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log("✅ WebSocket Connected");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const payload = JSON.parse(event.data);
          setLastMessage(payload);
          
          switch (payload.type) {
            case 'new_accident':
              mutate(`${API_ROUTES.accidents}?limit=5`);
              mutate(`${API_ROUTES.accidents}?limit=50`);
              mutate(`${API_ROUTES.accidents}?limit=100`);
              mutate(`${API_ROUTES.accidents}?limit=200`);
              break;
              
            case 'volunteer_dispatched':
            case 'task_updated':
              mutate(`${API_ROUTES.tasks}`);
              if (payload.data?.accident_id) {
                mutate(API_ROUTES.accident(payload.data.accident_id));
              }
              break;
          }
        } catch {
          // Silently ignore parse errors
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        // Reconnect after 5 seconds
        reconnectTimer.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 5000);
      };

      ws.onerror = () => {
        // Silently handle — onclose will fire after this and trigger reconnect
        if (!mountedRef.current) return;
        setIsConnected(false);
      };
    } catch {
      // Connection failed, retry after delay
      reconnectTimer.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, 5000);
    }
  }, [mutate]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
