"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, User, LogOut, Settings, HelpCircle, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const router = useRouter();
  const { sidebarOpen } = useAppStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; email?: string } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch current user on mount
  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        setUserProfile({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserProfile({
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
        });
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    router.push("/");
    router.refresh(); // Refresh to clear server-side session
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-background/95 backdrop-blur-sm border-b border-border",
        "flex items-center justify-between px-6",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        sidebarOpen ? "left-64" : "left-16"
      )}
    >
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-md animate-in" style={{ animationDelay: '100ms' }}>
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
          <Input
            placeholder="Search properties, leads..."
            className="pl-9 bg-muted/40 border-transparent hover:border-border focus-visible:border-primary focus-visible:ring-1 focus-visible:bg-background transition-all duration-300"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 animate-in" style={{ animationDelay: '200ms' }}>
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group">
          <Bell className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-12" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse-soft" />
        </Button>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(!profileOpen)}
            className="rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 group flex items-center gap-2 px-2"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-border transition-all duration-300 group-hover:ring-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10">
              <User className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              profileOpen && "rotate-180"
            )} />
          </Button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-xl shadow-lg shadow-black/10 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-sm">{userProfile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{userProfile?.email || 'Not signed in'}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    Free Plan
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Billing & Plan</span>
                </Link>
                <Link
                  href="/help"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Help & Support</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-border pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
