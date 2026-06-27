"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  MessageCircle,
  Calendar,
  Bookmark,
  User,
  Search,
  SlidersHorizontal,
  Star,
  CheckCircle,
  TrendingUp,
  Bell,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  short_description: string;
  category: string;
  sector: string;
  funding_goal: number;
  equity_offered: number;
  amount_raised: number;
  country: string;
  tier: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    is_verified: boolean;
    trust_score: number;
  };
};

const NAV = [
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "chats", icon: MessageCircle, label: "Chats" },
  { id: "meetings", icon: Calendar, label: "Meetings" },
  { id: "bookmarks", icon: Bookmark, label: "Saved" },
  { id: "profile", icon: User, label: "Profile" },
];

const FILTERS = [
  "All",
  "Web2",
  "Web3",
  "Africa",
  "Asia",
  "FinTech",
  "HealthTech",
  "DeFi",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}

function getRaisedPercent(goal: number, raised: number) {
  if (!goal) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}

const AVATAR_COLORS = [
  "bg-emerald-900 text-emerald-300",
  "bg-blue-900 text-blue-300",
  "bg-purple-900 text-purple-300",
  "bg-orange-900 text-orange-300",
  "bg-indigo-900 text-indigo-300",
  "bg-rose-900 text-rose-300",
];

function getColor(id: string) {
  const index =
    id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function InvestorDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("explore");
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [profile, setProfile] = useState<{
    full_name: string;
    username: string;
  } | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/projects");
    const { projects } = await res.json();
    setProjects(projects || []);
    setLoading(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, username")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  }, [supabase]);

  const fetchBookmarks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("bookmarks")
      .select("project_id")
      .eq("user_id", user.id);
    if (data) setBookmarks(data.map((b) => b.project_id));
  }, [supabase]);

  useEffect(() => {
    const loadData = async () => {
      await fetchProjects();
      await fetchProfile();
      await fetchBookmarks();
    };

    void loadData();
  }, [fetchProjects, fetchProfile, fetchBookmarks]);

  const toggleBookmark = async (projectId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const isBookmarked = bookmarks.includes(projectId);

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId);
      setBookmarks((prev) => prev.filter((id) => id !== projectId));
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, project_id: projectId });
      setBookmarks((prev) => [...prev, projectId]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sector?.toLowerCase().includes(search.toLowerCase()) ||
      p.country?.toLowerCase().includes(search.toLowerCase()) ||
      p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      activeFilter === "All" ||
      p.category?.toLowerCase() === activeFilter.toLowerCase() ||
      p.sector === activeFilter ||
      p.country?.includes(activeFilter);

    return matchSearch && matchFilter;
  });

  const premium = filtered.filter((p) => p.tier === "premium");
  const standard = filtered.filter((p) => p.tier !== "premium");

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#0F0F1A] border-b border-[#3A3A52] px-4 py-3 flex items-center gap-3">
        <h1 className="text-lg font-medium text-[#F5F3ED]">
          i<span className="text-[#C9A84C]">Vest</span>
        </h1>
        <div className="flex-1 flex items-center gap-2 bg-[#1A1A2E] border border-[#3A3A52] rounded-lg px-3 py-2">
          <Search size={14} className="text-[#5C5A70] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search startups, sectors, founders…"
            className="flex-1 bg-transparent text-[#F5F3ED] text-sm outline-none placeholder-[#5C5A70]"
          />
        </div>
        <button className="relative">
          <Bell size={20} className="text-[#A8A6B8]" />
        </button>
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-full bg-[#C9A84C20] text-[#C9A84C] text-xs font-medium flex items-center justify-center"
        >
          {profile ? getInitials(profile.full_name) : ".."}
        </button>
      </header>

      {/* Filter bar */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[#3A3A52]">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
              activeFilter === f
                ? "bg-[#C9A84C] text-[#1A1A2E] border-[#C9A84C] font-medium"
                : "border-[#3A3A52] text-[#A8A6B8] hover:border-[#5C5A70]"
            }`}
          >
            {f}
          </button>
        ))}
        <button className="shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-[#3A3A52] text-[#A8A6B8]">
          <SlidersHorizontal size={11} />
          More
          <ChevronDown size={11} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="text-[#C9A84C] animate-spin" />
            <p className="text-[#5C5A70] text-sm">Loading projects…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-[#F5F3ED] text-sm font-medium">
              No projects yet
            </p>
            <p className="text-[#5C5A70] text-xs text-center max-w-xs">
              Be the first to list a project or check back soon as builders
              join iVest.
            </p>
          </div>
        ) : (
          <>
            {/* Premium listings */}
            {premium.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star
                    size={13}
                    className="text-[#C9A84C]"
                    fill="#C9A84C"
                  />
                  <span className="text-xs font-medium text-[#A8A6B8] uppercase tracking-wider">
                    Premium listings
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {premium.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      bookmarks={bookmarks}
                      toggleBookmark={toggleBookmark}
                      getColor={getColor}
                      formatCurrency={formatCurrency}
                      getRaisedPercent={getRaisedPercent}
                      getInitials={getInitials}
                      router={router}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Standard listings */}
            {standard.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-[#A8A6B8] uppercase tracking-wider">
                    All listings
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {standard.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      bookmarks={bookmarks}
                      toggleBookmark={toggleBookmark}
                      getColor={getColor}
                      formatCurrency={formatCurrency}
                      getRaisedPercent={getRaisedPercent}
                      getInitials={getInitials}
                      router={router}
                    />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#5C5A70] text-sm">
                  No projects match your search.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F0F1A] border-t border-[#3A3A52] flex z-20">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveNav(item.id);
                if (item.id === "chats")
                  router.push("/dashboard/chats");
                if (item.id === "meetings")
                  router.push("/dashboard/meetings");
                if (item.id === "profile")
                  router.push("/dashboard/profile");
              }}
              className="flex-1 flex flex-col items-center gap-1 py-3"
            >
              <Icon
                size={20}
                className={
                  isActive ? "text-[#C9A84C]" : "text-[#5C5A70]"
                }
              />
              <span
                className={`text-xs ${
                  isActive ? "text-[#C9A84C]" : "text-[#5C5A70]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function ProjectCard({
  project: p,
  bookmarks,
  toggleBookmark,
  getColor,
  formatCurrency,
  getRaisedPercent,
  getInitials,
  router,
}: {
  project: Project;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  getColor: (id: string) => string;
  formatCurrency: (n: number) => string;
  getRaisedPercent: (goal: number, raised: number) => number;
  getInitials: (name: string) => string;
  router: ReturnType<typeof useRouter>;
}) {
  const isBookmarked = bookmarks.includes(p.id);
  const raisedPct = getRaisedPercent(p.funding_goal, p.amount_raised);

  return (
    <div className="bg-[#1A1A2E] border border-[#3A3A52] rounded-xl p-4 flex flex-col gap-3 hover:border-[#5C5A70] transition">

      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {p.tier === "premium" && (
            <Star size={12} className="text-[#C9A84C]" fill="#C9A84C" />
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              p.category === "web3"
                ? "bg-purple-900 text-purple-300"
                : "bg-blue-900 text-blue-300"
            }`}
          >
            {p.category?.toUpperCase()}
          </span>
          <span className="text-xs text-[#5C5A70]">{p.sector}</span>
        </div>
        <button onClick={() => toggleBookmark(p.id)}>
          <Bookmark
            size={15}
            className={
              isBookmarked
                ? "text-[#C9A84C] fill-[#C9A84C]"
                : "text-[#5C5A70]"
            }
          />
        </button>
      </div>

      {/* Founder + name */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${getColor(
            p.profiles?.id || "a"
          )}`}
        >
          {getInitials(p.profiles?.full_name || "?")}
        </div>
        <div>
          <div className="text-[#F5F3ED] text-sm font-medium">
            {p.name}
          </div>
          <div className="flex items-center gap-1">
            {p.profiles?.is_verified && (
              <CheckCircle size={11} className="text-emerald-400" />
            )}
            <span className="text-[#5C5A70] text-xs">
              {p.profiles?.is_verified
                ? "Verified founder"
                : p.profiles?.full_name}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#A8A6B8] text-xs leading-relaxed line-clamp-2">
        {p.short_description}
      </p>

      {/* Metrics */}
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="text-[#5C5A70] text-xs mb-0.5">Goal</div>
          <div className="text-[#F5F3ED] text-sm font-medium">
            {formatCurrency(p.funding_goal)}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[#5C5A70] text-xs mb-0.5">Equity</div>
          <div className="text-[#F5F3ED] text-sm font-medium">
            {p.equity_offered}%
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[#5C5A70] text-xs mb-0.5">Raised</div>
          <div className="text-[#C9A84C] text-sm font-medium">
            {raisedPct}%
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#2A2A3E] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C9A84C] rounded-full transition-all"
          style={{ width: `${raisedPct}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
  onClick={async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const res = await fetch("/api/conversations/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        otherUserId: p.profiles?.id,
        projectId: p.id,
      }),
    });

    const { conversationId } = await res.json();
    router.push(`/dashboard/chats?conversationId=${conversationId}`);
  }}
  className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A84C] text-[#1A1A2E] text-xs font-medium py-2 rounded-lg hover:opacity-90 transition"
>
  <MessageCircle size={13} />
  Chat
</button>
        <button
          onClick={() =>
            router.push(`/dashboard/project/${p.id}`)
          }
          className="flex-1 flex items-center justify-center gap-1.5 border border-[#3A3A52] text-[#A8A6B8] text-xs py-2 rounded-lg hover:border-[#5C5A70] transition"
        >
          <TrendingUp size={13} />
          Details
        </button>
      </div>
    </div>
  );
}