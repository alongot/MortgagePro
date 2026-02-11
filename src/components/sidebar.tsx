"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  List,
  Kanban,
  CheckSquare,
  Settings,
  Building2,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/lists", label: "Lists", icon: List },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background border-r border-border flex flex-col",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0 overflow-hidden">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Building2 className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "text-lg font-bold tracking-tight text-foreground whitespace-nowrap transition-all duration-300",
              sidebarOpen
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4 absolute"
            )}
          >
            MortgagePro
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group relative",
                "transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-all duration-300",
                  !sidebarOpen && "mx-auto",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  sidebarOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 absolute left-12"
                )}
              >
                {item.label}
              </span>
              {/* Active indicator */}
              {isActive && (
                <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-full animate-scale-in" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2 shrink-0">
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-center w-full py-2 rounded-lg text-sm group",
            "text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 active:scale-95"
          )}
        >
          <span
            className={cn(
              "transition-transform duration-300",
              sidebarOpen ? "rotate-0" : "rotate-180"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </span>
          <span
            className={cn(
              "ml-2 whitespace-nowrap transition-all duration-300",
              sidebarOpen
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 w-0 overflow-hidden"
            )}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
