"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "zh-CN", name: "Chinese (Simplified)", native: "简体中文", flag: "🇨🇳" },
  { code: "zh-TW", name: "Chinese (Traditional)", native: "繁體中文", flag: "🇹🇼" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
];

export default function LanguageSelectPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("en");

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0F0F1A] px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-[#F5F3ED] mb-1">
            i<span className="text-[#C9A84C]">Vest</span>
          </h1>
          <p className="text-[#A8A6B8] text-sm">Select your preferred language</p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-3 mb-4 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
        />

        {/* Language List */}
        <div className="flex flex-col gap-2 mb-6 max-h-80 overflow-y-auto pr-1">
          {filtered.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition ${
                selected === lang.code
                  ? "border-[#C9A84C] bg-[#C9A84C10]"
                  : "border-[#3A3A52] bg-[#1A1A2E] hover:border-[#5C5A70]"
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div>
                <div className="text-[#F5F3ED] text-sm font-medium">{lang.name}</div>
                <div className="text-[#5C5A70] text-xs">{lang.native}</div>
              </div>
              {selected === lang.code && (
                <span className="ml-auto text-[#C9A84C] text-sm">✓</span>
              )}
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-[#5C5A70] text-sm text-center py-4">
              No language found
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={() => router.push("/auth/signup")}
          className="w-full bg-[#C9A84C] text-[#1A1A2E] font-medium text-sm py-3 rounded-lg hover:opacity-90 transition"
        >
          Save Preference
        </button>
      </div>
    </main>
  );
}