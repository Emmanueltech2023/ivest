"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Compass, MessageCircle, Calendar, Bookmark,
  User, LayoutGrid, Upload, TrendingUp, Users,
  Bell, LogOut, Menu, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
};

const INVESTOR_NAV: NavItem[] = [
  { id: "explore", icon: Compass, label: "Explore", href: "/dashboard/investor" },
  { id: "chats", icon: MessageCircle, label: "Messages", href: "/dashboard/chats" },
  { id: "meetings", icon: Calendar, label: "Meetings", href: "/dashboard/meetings" },
  { id: "bookmarks", icon: Bookmark, label: "Saved", href: "/dashboard/bookmarks" },
  { id: "profile", icon: User, label: "Profile", href: "/dashboard/profile" },
];

const BUILDER_NAV: NavItem[] = [
  { id: "projects", icon: LayoutGrid, label: "My Projects", href: "/dashboard/builder" },
  { id: "investors", icon: TrendingUp, label: "Find Investors", href: "/dashboard/investors" },
  { id: "upload", icon: Upload, label: "Upload Project", href: "/dashboard/builder/upload" },
  { id: "chats", icon: MessageCircle, label: "Messages", href: "/dashboard/chats" },
  { id: "meetings", icon: Calendar, label: "Meetings", href: "/dashboard/meetings" },
  { id: "team", icon: Users, label: "Team", href: "/dashboard/team" },
  { id: "profile", icon: User, label: "Profile", href: "/dashboard/profile" },
];

interface Props {
  children: React.ReactNode;
  role: "investor" | "builder";
  username?: string;
  fullName?: string;
  unreadCount?: number;
}

export default function DashboardShell({
  children, role, username, fullName, unreadCount = 0,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = role === "investor" ? INVESTOR_NAV : BUILDER_NAV;

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-[#3A3A52] shrink-0 fixed top-0 left-0 h-full z-30">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#3A3A52]">
          <div className="text-xl font-medium text-[#F5F3ED]">
            i<span className="text-[#C9A84C]">Vest</span>
          </div>
          <div className="text-xs text-[#5C5A70] mt-0.5 capitalize">
            {role} dashboard
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition w-full text-left ${
                  active
                    ? "bg-[#C9A84C20] text-[#C9A84C] font-medium"
                    : "text-[#A8A6B8] hover:bg-[#1A1A2E] hover:text-[#F5F3ED]"
                }`}
              >
                <Icon size={17} className="shrink-0" />
                <span>{item.label}</span>
                {item.id === "chats" && unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-[#C9A84C] rounded-full text-[#1A1A2E] text-xs flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom — user + logout */}
        <div className="px-3 py-4 border-t border-[#3A3A52]">
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[#1A1A2E] transition mb-1"
          >
            <div className="w-8 h-8 rounded-full bg-[#C9A84C20] text-[#C9A84C] text-xs font-medium flex items-center justify-center shrink-0">
              {getInitials(fullName || "")}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[#F5F3ED] text-xs font-medium truncate">
                {fullName || "Loading…"}
              </div>
              <div className="text-[#5C5A70] text-xs truncate">
                @{username || ""}
              </div>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[#5C5A70] hover:text-red-400 hover:bg-[#1A1A2E] transition text-sm"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#0F0F1A] border-b border-[#3A3A52] px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu size={20} className="text-[#A8A6B8]" />
        </button>
        <div className="text-base font-medium text-[#F5F3ED] flex-1">
          i<span className="text-[#C9A84C]">Vest</span>
        </div>
        <button onClick={() => router.push("/dashboard/notifications")}>
          <Bell size={20} className="text-[#A8A6B8]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#C9A84C20] text-[#C9A84C] text-xs font-medium flex items-center justify-center">
          {getInitials(fullName || "")}
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="w-64 bg-[#0F0F1A] border-l border-[#3A3A52] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#3A3A52]">
              <div className="text-lg font-medium text-[#F5F3ED]">
                i<span className="text-[#C9A84C]">Vest</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} className="text-[#A8A6B8]" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <button
                    key={item.id}
                    onClick={() => { router.push(item.href); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition w-full text-left ${
                      active
                        ? "bg-[#C9A84C20] text-[#C9A84C] font-medium"
                        : "text-[#A8A6B8] hover:bg-[#1A1A2E]"
                    }`}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-[#3A3A52]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[#5C5A70] hover:text-red-400 transition text-sm"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 md:ml-56 min-h-screen">
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[#3A3A52] sticky top-0 bg-[#0F0F1A] z-20">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/notifications")}
              className="relative w-9 h-9 flex items-center justify-center border border-[#3A3A52] rounded-lg hover:bg-[#1A1A2E] transition"
            >
              <Bell size={17} className="text-[#A8A6B8]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A84C] rounded-full text-[#1A1A2E] text-xs flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Page content — constrained width on desktop */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-16 md:pt-4 pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0F0F1A] border-t border-[#3A3A52] flex z-30">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="flex-1 flex flex-col items-center gap-1 py-3"
            >
              <Icon size={20} className={active ? "text-[#C9A84C]" : "text-[#5C5A70]"} />
              <span className={`text-xs ${active ? "text-[#C9A84C]" : "text-[#5C5A70]"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}