"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-6 animate-in">{children}</div>
      </main>
    </div>
  );
}
