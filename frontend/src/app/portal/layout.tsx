import { WebSocketProvider } from "@/components/WebSocketProvider";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
}
