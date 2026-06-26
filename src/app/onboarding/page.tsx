"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LOCALE_MAP: Record<string, { language: string; currency: string }> = {
  en: { language: "English", currency: "USD" },
  fr: { language: "Français", currency: "EUR" },
  es: { language: "Español", currency: "EUR" },
  de: { language: "Deutsch", currency: "EUR" },
  pt: { language: "Português", currency: "USD" },
  ar: { language: "العربية", currency: "USD" },
  zh: { language: "中文", currency: "USD" },
  hi: { language: "हिन्दी", currency: "INR" },
  ja: { language: "日本語", currency: "JPY" },
  ru: { language: "Русский", currency: "USD" },
};

export default function OnboardingDetectionPage() {
  const router = useRouter();
  const [detected, setDetected] = useState<{ language: string; currency: string } | null>(null);

  useEffect(() => {
    const browserLocale = navigator.language.slice(0, 2);
    const match = LOCALE_MAP[browserLocale] || LOCALE_MAP["en"];
    setDetected(match);
  }, []);

  if (!detected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0F0F1A]">
        <p className="text-[#A8A6B8] text-sm">Detecting your region...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F1A] px-6 text-center">
      <h1 className="text-2xl font-medium text-[#F5F3ED] mb-3">
        i<span className="text-[#C9A84C]">Vest</span>
      </h1>

      <div className="bg-[#1A1A2E] border border-[#3A3A52] rounded-xl px-5 py-4 max-w-sm mb-6">
        <p className="text-[#F5F3ED] text-sm">
          We&apos;ve set your language to{" "}
          <strong>{detected.language}</strong> and currency to{" "}
          <strong>{detected.currency}</strong>.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => router.push("/auth/signup")}
          className="flex-1 bg-[#C9A84C] text-[#1A1A2E] font-medium text-sm py-3 rounded-lg hover:opacity-90 transition"
        >
          Continue
        </button>
        <button
          onClick={() => router.push("/onboarding/language")}
          className="flex-1 border border-[#3A3A52] text-[#F5F3ED] font-medium text-sm py-3 rounded-lg hover:bg-[#1A1A2E] transition"
        >
          Change Language
        </button>
      </div>
    </main>
  );
}