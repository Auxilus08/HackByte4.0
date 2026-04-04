"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { WebSocketProvider } from "@/components/WebSocketProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.role !== "admin") {
      router.replace("/portal");
      return;
    }
    setAuthed(true);
  }, [router]);

  if (!authed) return null;

  return (
    <WebSocketProvider>
      <div className="flex min-h-screen">
        {/* Ambient global background glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-red-900/10 mix-blend-screen blur-[120px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 mix-blend-screen blur-[100px]"></div>
        </div>

        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden relative">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-8 md:p-8 md:pb-12 relative z-0 scroll-smooth">
            <div className="max-w-[1600px] mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </WebSocketProvider>
  );
}
