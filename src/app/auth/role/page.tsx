"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Rocket, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  {
    id: "investor",
    icon: TrendingUp,
    title: "Investor",
    description: "Browse verified startups, chat with founders, close deals and track your portfolio.",
  },
  {
    id: "builder",
    icon: Rocket,
    title: "Startup / Builder",
    description: "Upload your project, share your pitch deck, connect with global investors.",
  },
  {
    id: "team",
    icon: Users,
    title: "Team Member",
    description: "Collaborate on projects, join chats and meetings as part of a startup team.",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
  if (!selected) return;
  setLoading(true);

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        updates: { role: selected },
      }),
    });
  }

  router.push("/auth/category");
  setLoading(false);
};

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F1A] px-6 py-12">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-[#F5F3ED] mb-1">
            i<span className="text-[#C9A84C]">Vest</span>
          </h1>
          <p className="text-[#A8A6B8] text-sm">Who are you on iVest?</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-8 rounded-full ${
                  s <= 2 ? "bg-[#C9A84C]" : "bg-[#3A3A52]"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`flex items-start gap-4 px-4 py-4 rounded-xl border text-left transition ${
                  isSelected
                    ? "border-[#C9A84C] bg-[#C9A84C10]"
                    : "border-[#3A3A52] bg-[#1A1A2E] hover:border-[#5C5A70]"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-[#C9A84C20]" : "bg-[#2A2A3E]"}`}>
                  <Icon size={20} className={isSelected ? "text-[#C9A84C]" : "text-[#A8A6B8]"} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium mb-1 ${isSelected ? "text-[#C9A84C]" : "text-[#F5F3ED]"}`}>
                    {role.title}
                  </div>
                  <div className="text-[#5C5A70] text-xs leading-relaxed">
                    {role.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className={`w-full font-medium text-sm py-3 rounded-lg transition ${
            selected && !loading
              ? "bg-[#C9A84C] text-[#1A1A2E] hover:opacity-90"
              : "bg-[#2A2A3E] text-[#5C5A70] cursor-not-allowed"
          }`}
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </div>
    </main>
  );
}