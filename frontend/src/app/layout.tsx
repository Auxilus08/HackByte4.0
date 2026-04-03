import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { WebSocketProvider } from "@/components/WebSocketProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartAccident - NextGen Responder AI",
  description: "Real-time AI-driven accident monitoring and dispatch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex bg-[#050505] text-[#f0f0f0] selection:bg-red-500/30 overflow-hidden">
        <WebSocketProvider>
          {/* Ambient global background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
            <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-red-900/10 mix-blend-screen blur-[120px]"></div>
            <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 mix-blend-screen blur-[100px]"></div>
          </div>

          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden relative">
            <Navbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative z-0 scroll-smooth">
              <div className="max-w-[1600px] mx-auto w-full h-full">
                {children}
              </div>
            </main>
          </div>
        </WebSocketProvider>
      </body>
    </html>
  );
}
