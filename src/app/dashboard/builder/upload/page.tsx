"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SECTORS = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "AgriTech",
  "DeFi",
  "NFT",
  "DAO",
  "Infrastructure",
  "E-commerce",
  "SaaS",
  "AI/ML",
  "CleanTech",
  "Other",
];

export default function UploadProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
const [selectedTierInfo, setSelectedTierInfo] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    shortDescription: "",
    fullDescription: "",
    category: "web2",
    sector: "",
    fundingGoal: "",
    equityOffered: "",
    country: "",
    tier: "free",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderId: user.id,
          name: form.name,
          shortDescription: form.shortDescription,
          fullDescription: form.fullDescription,
          category: form.category,
          sector: form.sector,
          fundingGoal: parseFloat(form.fundingGoal),
          equityOffered: parseFloat(form.equityOffered),
          country: form.country,
          tier: form.tier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");

      router.push("/dashboard/builder");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0F0F1A] px-4 py-6 pb-12">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/dashboard/builder")}>
            <ArrowLeft size={20} className="text-[#A8A6B8]" />
          </button>
          <div>
            <h1 className="text-[#F5F3ED] text-base font-medium">
              Upload project
            </h1>
            <p className="text-[#5C5A70] text-xs">
              Connect with global investors
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-xs rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Project name */}
          <div>
            <label className="text-[#A8A6B8] text-xs mb-1.5 block">
              Project Name *
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. ChainVault Protocol"
              className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
            />
          </div>

          {/* Short description */}
          <div>
            <label className="text-[#A8A6B8] text-xs mb-1.5 block">
              Short Description * (shown on card)
            </label>
            <input
              name="shortDescription"
              required
              value={form.shortDescription}
              onChange={handleChange}
              placeholder="One line summary of your project"
              className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
            />
          </div>

          {/* Full description */}
          <div>
            <label className="text-[#A8A6B8] text-xs mb-1.5 block">
              Full Description *
            </label>
            <textarea
              name="fullDescription"
              required
              value={form.fullDescription}
              onChange={handleChange}
              rows={4}
              placeholder="Detailed overview — problem, solution, traction, team…"
              className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70] resize-none"
            />
          </div>

          {/* Category + Sector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#A8A6B8] text-xs mb-1.5 block">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition"
              >
                <option value="web2">Web2</option>
                <option value="web3">Web3</option>
              </select>
            </div>
            <div>
              <label className="text-[#A8A6B8] text-xs mb-1.5 block">
                Sector *
              </label>
              <select
                name="sector"
                required
                value={form.sector}
                onChange={handleChange}
                className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition"
              >
                <option value="">Select sector</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Funding goal + Equity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#A8A6B8] text-xs mb-1.5 block">
                Funding Goal (USD) *
              </label>
              <input
                name="fundingGoal"
                type="number"
                required
                min="1000"
                value={form.fundingGoal}
                onChange={handleChange}
                placeholder="e.g. 500000"
                className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
              />
            </div>
            <div>
              <label className="text-[#A8A6B8] text-xs mb-1.5 block">
                Equity Offered (%) *
              </label>
              <input
                name="equityOffered"
                type="number"
                required
                min="0.1"
                max="100"
                step="0.1"
                value={form.equityOffered}
                onChange={handleChange}
                placeholder="e.g. 15"
                className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="text-[#A8A6B8] text-xs mb-1.5 block">
              Country *
            </label>
            <input
              name="country"
              required
              value={form.country}
              onChange={handleChange}
              placeholder="e.g. Nigeria"
              className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
            />
          </div>

         {/* Tier */}
<div>
  <label className="text-[#A8A6B8] text-xs mb-1.5 block">
    Listing tier
  </label>
  <div className="grid grid-cols-3 gap-2">
    {[
      {
        id: "free",
        label: "Free",
        description: "Standard placement",
        price: "$0",
      },
      {
        id: "pro",
        label: "Pro",
        description: "Badge + more visibility",
        price: "$29/mo",
      },
      {
        id: "premium",
        label: "Premium",
        description: "Pinned at top of feed",
        price: "$79/mo",
      },
    ].map((t) => (
      <button
        key={t.id}
        type="button"
        onClick={() => {
          if (t.id === "free") {
            setForm({ ...form, tier: "free" });
            setShowUpgradePrompt(false);
          } else {
            setSelectedTierInfo(t.id);
            setShowUpgradePrompt(true);
          }
        }}
        className={`py-3 px-2 rounded-lg border text-left transition ${
          form.tier === t.id
            ? "border-[#C9A84C] bg-[#C9A84C10]"
            : "border-[#3A3A52] hover:border-[#5C5A70]"
        }`}
      >
        <div
          className={`text-xs font-medium mb-0.5 ${
            form.tier === t.id
              ? "text-[#C9A84C]"
              : "text-[#F5F3ED]"
          }`}
        >
          {t.label}
        </div>
        <div className="text-[#5C5A70] text-xs">
          {t.description}
        </div>
        <div
          className={`text-xs font-medium mt-1 ${
            t.id === "free"
              ? "text-[#5C5A70]"
              : "text-[#C9A84C]"
          }`}
        >
          {t.price}
        </div>
      </button>
    ))}
  </div>

  {/* Current tier label */}
  <p className="text-[#5C5A70] text-xs mt-2">
    Currently selected:{" "}
    <span className="text-[#C9A84C] font-medium">
      {form.tier.charAt(0).toUpperCase() + form.tier.slice(1)}
    </span>
  </p>
</div>

{/* Upgrade prompt modal */}
{showUpgradePrompt && selectedTierInfo && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center px-4">
    <div className="bg-[#1A1A2E] border border-[#3A3A52] rounded-2xl p-6 w-full max-w-sm">
      <div className="text-center mb-5">
        <div className="w-12 h-12 rounded-full bg-[#C9A84C20] flex items-center justify-center mx-auto mb-3">
          <Star size={22} className="text-[#C9A84C]" />
        </div>
        <h3 className="text-[#F5F3ED] text-base font-medium mb-1">
          Upgrade to{" "}
          {selectedTierInfo.charAt(0).toUpperCase() +
            selectedTierInfo.slice(1)}
        </h3>
        <p className="text-[#A8A6B8] text-xs leading-relaxed">
          {selectedTierInfo === "pro"
            ? "Get a Pro badge, increased visibility in the investor feed, and priority in search results."
            : "Pin your project at the very top of the investor feed with a gold star. Maximum global exposure."}
        </p>
      </div>

      <div className="bg-[#0F0F1A] rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#A8A6B8] text-xs">Plan</span>
          <span className="text-[#F5F3ED] text-xs font-medium">
            {selectedTierInfo === "pro"
              ? "Pro — $29/month"
              : "Premium — $79/month"}
          </span>
        </div>
        {(selectedTierInfo === "pro"
          ? [
              "Pro badge on your project card",
              "2× more visibility in investor feed",
              "Priority search placement",
              "Unlimited investor messages",
            ]
          : [
              "Everything in Pro",
              "Pinned at top of all listings",
              "Gold star featured placement",
              "AI match recommendations",
              "Priority investor introductions",
            ]
        ).map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2 py-1.5"
          >
            <div className="w-4 h-4 rounded-full bg-[#C9A84C20] flex items-center justify-center shrink-0">
              <svg
                width="8"
                height="8"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M2 5l2.5 2.5L8 3"
                  stroke="#C9A84C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[#A8A6B8] text-xs">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          // Stripe payment will go here in monetization sprint
          // For now just note it and close
          setShowUpgradePrompt(false);
          alert(
            "Payment integration coming soon. Your project will be published on the Free tier for now."
          );
        }}
        className="w-full bg-[#C9A84C] text-[#1A1A2E] font-medium text-sm py-3 rounded-lg hover:opacity-90 transition mb-2"
      >
        Upgrade & Publish —{" "}
        {selectedTierInfo === "pro" ? "$29/mo" : "$79/mo"}
      </button>
      <button
        onClick={() => {
          setShowUpgradePrompt(false);
          setForm({ ...form, tier: "free" });
        }}
        className="w-full border border-[#3A3A52] text-[#A8A6B8] text-sm py-3 rounded-lg hover:bg-[#0F0F1A] transition"
      >
        Continue with Free tier
      </button>
    </div>
  </div>
)}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-medium text-sm py-3 rounded-lg transition mt-2 ${
              loading
                ? "bg-[#2A2A3E] text-[#5C5A70] cursor-not-allowed"
                : "bg-[#C9A84C] text-[#1A1A2E] hover:opacity-90"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Publishing…
              </span>
            ) : (
              "Publish Project"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
