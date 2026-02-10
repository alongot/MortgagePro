"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

export function Header() {
  const { sidebarOpen } = useAppStore();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-background/95 backdrop-blur-sm border-b border-border",
        "flex items-center justify-between px-6",
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "left-64" : "left-16"
      )}
    >
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Quick search..."
            className="pl-9 bg-muted/40 border-transparent hover:border-border focus-visible:border-primary focus-visible:ring-1 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative rounded-lg">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-lg">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-border">
            <User className="h-4 w-4 text-primary" />
          </div>
        </Button>
      </div>
    </header>
  );
}
