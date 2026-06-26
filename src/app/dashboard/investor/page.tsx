"use client";

import { useState } from "react";
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
} from "lucide-react";

const PROJECTS = [
  {
    id: 1,
    name: "ChainVault Protocol",
    founder: "Nkosi K.",
    initials: "NK",
    color: "bg-emerald-900 text-emerald-300",
    category: "Web3",
    sector: "DeFi",
    goal: "$2.4M",
    equity: "12%",
    raised: 68,
    region: "South Africa",
    premium: true,
    verified: true,
    description: "DeFi treasury management with cross-chain yield optimization.",
  },
  {
    id: 2,
    name: "MediLink Africa",
    founder: "Siti M.",
    initials: "SM",
    color: "bg-blue-900 text-blue-300",
    category: "Web2",
    sector: "HealthTech",
    goal: "$800K",
    equity: "18%",
    raised: 41,
    region: "Nigeria",
    premium: true,
    verified: true,
    description: "Telemedicine & EHR platform for underserved communities.",
  },
  {
    id: 3,
    name: "NovaTrade",
    founder: "Lucas R.",
    initials: "LR",
    color: "bg-purple-900 text-purple-300",
    category: "Web3",
    sector: "FinTech",
    goal: "$1.1M",
    equity: "8%",
    raised: 22,
    region: "Brazil",
    premium: false,
    verified: true,
    description: "Decentralized cross-border payment rails for emerging markets.",
  },
  {
    id: 4,
    name: "SkillForge",
    founder: "Amara D.",
    initials: "AD",
    color: "bg-orange-900 text-orange-300",
    category: "Web2",
    sector: "EdTech",
    goal: "$300K",
    equity: "20%",
    raised: 15,
    region: "Kenya",
    premium: false,
    verified: true,
    description: "AI-powered vocational training for blue-collar workers in SE Asia.",
  },
  {
    id: 5,
    name: "HarvestAI",
    founder: "Chidi O.",
    initials: "CO",
    color: "bg-green-900 text-green-300",
    category: "Web2",
    sector: "AgriTech",
    goal: "$200K",
    equity: "22%",
    raised: 8,
    region: "Nigeria",
    premium: false,
    verified: false,
    description: "Satellite + AI crop monitoring for smallholder farmers.",
  },
  {
    id: 6,
    name: "ZKProof Labs",
    founder: "Yuki T.",
    initials: "YT",
    color: "bg-indigo-900 text-indigo-300",
    category: "Web3",
    sector: "Infra",
    goal: "$500K",
    equity: "15%",
    raised: 33,
    region: "Japan",
    premium: false,
    verified: true,
    description: "Zero-knowledge proof infrastructure for enterprise data privacy.",
  },
];

const NAV = [
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "chats", icon: MessageCircle, label: "Chats", badge: 3 },
  { id: "meetings", icon: Calendar, label: "Meetings" },
  { id: "bookmarks", icon: Bookmark, label: "Saved" },
  { id: "profile", icon: User, label: "Profile" },
];

const FILTERS = ["All", "Web2", "Web3", "Africa", "Asia", "FinTech", "HealthTech", "DeFi"];

export default function InvestorDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("explore");
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const filtered = PROJECTS.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sector.toLowerCase().includes(search.toLowerCase()) ||
      p.region.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      p.category === activeFilter ||
      p.sector === activeFilter ||
      p.region.includes(activeFilter);
    return matchSearch && matchFilter;
  });

  const premium = filtered.filter((p) => p.premium);
  const standard = filtered.filter((p) => !p.premium);

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

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
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A84C] rounded-full text-[#1A1A2E] text-xs flex items-center justify-center font-medium">
            5
          </span>
        </button>
        <div className="w-8 h-8 rounded-full bg-[#C9A84C20] text-[#C9A84C] text-xs font-medium flex items-center justify-center">
          AO
        </div>
      </header>

      {/* Filter bar */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[#3A3A52] scrollbar-hide">
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

        {/* Premium listings */}
        {premium.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} className="text-[#C9A84C]" fill="#C9A84C" />
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
                  router={router}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#5C5A70] text-sm">No projects match your search.</p>
          </div>
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
                if (item.id === "chats") router.push("/dashboard/chats");
              }}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={isActive ? "text-[#C9A84C]" : "text-[#5C5A70]"}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C9A84C] rounded-full text-[#1A1A2E] text-xs flex items-center justify-center font-medium">
                    {item.badge}
                  </span>
                )}
              </div>
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
  router,
}: {
  project: (typeof PROJECTS)[0];
  bookmarks: number[];
  toggleBookmark: (id: number) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const isBookmarked = bookmarks.includes(p.id);
  return (
    <div className="bg-[#1A1A2E] border border-[#3A3A52] rounded-xl p-4 flex flex-col gap-3 hover:border-[#5C5A70] transition">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {p.premium && (
            <Star size={12} className="text-[#C9A84C]" fill="#C9A84C" />
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              p.category === "Web3"
                ? "bg-purple-900 text-purple-300"
                : "bg-blue-900 text-blue-300"
            }`}
          >
            {p.category}
          </span>
          <span className="text-xs text-[#5C5A70]">{p.sector}</span>
        </div>
        <button onClick={() => toggleBookmark(p.id)}>
          <Bookmark
            size={15}
            className={
              isBookmarked ? "text-[#C9A84C] fill-[#C9A84C]" : "text-[#5C5A70]"
            }
          />
        </button>
      </div>

      {/* Founder + name */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${p.color}`}
        >
          {p.initials}
        </div>
        <div>
          <div className="text-[#F5F3ED] text-sm font-medium">{p.name}</div>
          <div className="flex items-center gap-1">
            {p.verified && (
              <CheckCircle size={11} className="text-emerald-400" />
            )}
            <span className="text-[#5C5A70] text-xs">
              {p.verified ? "Verified founder" : p.founder}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#A8A6B8] text-xs leading-relaxed">{p.description}</p>

      {/* Metrics */}
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="text-[#5C5A70] text-xs mb-0.5">Goal</div>
          <div className="text-[#F5F3ED] text-sm font-medium">{p.goal}</div>
        </div>
        <div className="flex-1">
          <div className="text-[#5C5A70] text-xs mb-0.5">Equity</div>
          <div className="text-[#F5F3ED] text-sm font-medium">{p.equity}</div>
        </div>
        <div className="flex-1">
          <div className="text-[#5C5A70] text-xs mb-0.5">Raised</div>
          <div className="text-[#C9A84C] text-sm font-medium">{p.raised}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#2A2A3E] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C9A84C] rounded-full"
          style={{ width: `${p.raised}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => router.push("/dashboard/chats")}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#C9A84C] text-[#1A1A2E] text-xs font-medium py-2 rounded-lg hover:opacity-90 transition"
        >
          <MessageCircle size={13} />
          Chat
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 border border-[#3A3A52] text-[#A8A6B8] text-xs py-2 rounded-lg hover:border-[#5C5A70] transition">
          <TrendingUp size={13} />
          Details
        </button>
      </div>
    </div>
  );
}