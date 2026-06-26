"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Mic,
  Video,
  Calendar,
  FileText,
  CheckCircle,
  Globe,
} from "lucide-react";

const CONVERSATIONS = [
  {
    id: 1,
    name: "ChainVault Protocol",
    initials: "NK",
    color: "bg-emerald-900 text-emerald-300",
    lastMessage: "We can share the full whitepaper now.",
    time: "2m",
    unread: 2,
    verified: true,
    online: true,
  },
  {
    id: 2,
    name: "MediLink Africa",
    initials: "SM",
    color: "bg-blue-900 text-blue-300",
    lastMessage: "Meeting confirmed for Thursday.",
    time: "1h",
    unread: 0,
    verified: true,
    online: false,
  },
  {
    id: 3,
    name: "HarvestAI",
    initials: "CO",
    color: "bg-green-900 text-green-300",
    lastMessage: "Thanks for your interest!",
    time: "2d",
    unread: 0,
    verified: false,
    online: false,
  },
  {
    id: 4,
    name: "ZKProof Labs",
    initials: "YT",
    color: "bg-indigo-900 text-indigo-300",
    lastMessage: "Here is our latest audit report.",
    time: "3d",
    unread: 1,
    verified: true,
    online: true,
  },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: "them",
    text: "We can share the full whitepaper with you now.",
    translated: true,
    originalLang: "Swahili",
    time: "10:02 AM",
  },
  {
    id: 2,
    from: "me",
    text: "Great! Could you also share the latest audit report?",
    translated: false,
    originalLang: null,
    time: "10:05 AM",
  },
  {
    id: 3,
    from: "them",
    text: "Of course. The CertiK audit was completed last month. Sending both now.",
    translated: true,
    originalLang: "Swahili",
    time: "10:07 AM",
  },
  {
    id: 4,
    from: "them",
    text: "📄 ChainVault_PitchDeck_v3.pdf",
    translated: false,
    originalLang: null,
    time: "10:08 AM",
    isFile: true,
  },
  {
    id: 5,
    from: "me",
    text: "Perfect. I would like to schedule a call with the full team.",
    translated: false,
    originalLang: null,
    time: "10:11 AM",
  },
];

export default function ChatsPage() {
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [showOriginal, setShowOriginal] = useState<number[]>([]);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        from: "me",
        text: input.trim(),
        translated: false,
        originalLang: null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          from: "them",
          text: "Thank you for your message. We will get back to you shortly.",
          translated: true,
          originalLang: "Swahili",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1200);
  };

  const activeConvo = CONVERSATIONS.find((c) => c.id === activeChat);

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#0F0F1A] border-b border-[#3A3A52] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/investor")}>
          <ArrowLeft size={20} className="text-[#A8A6B8]" />
        </button>
        <h1 className="text-lg font-medium text-[#F5F3ED]">
          i<span className="text-[#C9A84C]">Vest</span>
          <span className="text-[#A8A6B8] text-sm font-normal ml-2">
            Messages
          </span>
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Conversation list — hidden on mobile when chat open */}
        <div
          className={`${
            mobileView === "chat" ? "hidden" : "flex"
          } md:flex flex-col w-full md:w-64 border-r border-[#3A3A52] overflow-y-auto`}
        >
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveChat(c.id);
                setMobileView("chat");
              }}
              className={`flex items-start gap-3 px-4 py-3 border-b border-[#3A3A52] text-left transition ${
                activeChat === c.id
                  ? "bg-[#1A1A2E]"
                  : "hover:bg-[#1A1A2E]"
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ${c.color}`}
                >
                  {c.initials}
                </div>
                {c.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0F0F1A]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[#F5F3ED] text-sm font-medium truncate">
                      {c.name}
                    </span>
                    {c.verified && (
                      <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <span className="text-[#5C5A70] text-xs shrink-0">
                    {c.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#5C5A70] text-xs truncate">
                    {c.lastMessage}
                  </p>
                  {c.unread > 0 && (
                    <span className="w-4 h-4 bg-[#C9A84C] rounded-full text-[#1A1A2E] text-xs flex items-center justify-center font-medium shrink-0 ml-1">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div
          className={`${
            mobileView === "list" ? "hidden" : "flex"
          } md:flex flex-1 flex-col`}
        >
          {activeConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3A3A52] bg-[#0F0F1A]">
                <button
                  className="md:hidden"
                  onClick={() => setMobileView("list")}
                >
                  <ArrowLeft size={18} className="text-[#A8A6B8]" />
                </button>
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium ${activeConvo.color}`}
                  >
                    {activeConvo.initials}
                  </div>
                  {activeConvo.online && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#0F0F1A]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[#F5F3ED] text-sm font-medium">
                      {activeConvo.name}
                    </span>
                    {activeConvo.verified && (
                      <CheckCircle size={12} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe size={10} className="text-[#5C5A70]" />
                    <span className="text-[#5C5A70] text-xs">
                      AI translation active
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/dashboard/meetings")}
                  className="flex items-center gap-1.5 border border-[#3A3A52] text-[#A8A6B8] text-xs px-3 py-1.5 rounded-lg hover:bg-[#1A1A2E] transition"
                >
                  <Video size={13} />
                  Call
                </button>
              </div>

              {/* Translation banner */}
              <div className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C10] border-b border-[#C9A84C30]">
                <Globe size={12} className="text-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs">
                  Messages auto-translated to English · Powered by DeepL
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.from === "me" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-sm px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                        msg.from === "me"
                          ? "bg-[#C9A84C] text-[#1A1A2E]"
                          : msg.isFile
                          ? "bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED]"
                          : "bg-[#1A1A2E] text-[#F5F3ED]"
                      }`}
                    >
                      {msg.isFile ? (
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#C9A84C]" />
                          <span className="text-xs">{msg.text}</span>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[#5C5A70] text-xs">{msg.time}</span>
                      {msg.translated && (
                        <button
                          onClick={() =>
                            setShowOriginal((prev) =>
                              prev.includes(msg.id)
                                ? prev.filter((id) => id !== msg.id)
                                : [...prev, msg.id]
                            )
                          }
                          className="text-[#C9A84C] text-xs underline underline-offset-2"
                        >
                          {showOriginal.includes(msg.id)
                            ? "Hide original"
                            : `View original (${msg.originalLang})`}
                        </button>
                      )}
                    </div>
                    {showOriginal.includes(msg.id) && (
                      <div className="text-[#5C5A70] text-xs mt-1 italic max-w-xs">
                        [Original {msg.originalLang}]: Tunaweza kushiriki
                        whitepaper kamili nawe sasa.
                      </div>
                    )}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 px-4 py-2 border-t border-[#3A3A52] overflow-x-auto">
                {[
                  { icon: Paperclip, label: "File" },
                  { icon: Mic, label: "Voice" },
                  { icon: FileText, label: "NDA" },
                  { icon: Calendar, label: "Meeting" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="shrink-0 flex items-center gap-1.5 text-xs text-[#A8A6B8] border border-[#3A3A52] px-2.5 py-1.5 rounded-lg hover:bg-[#1A1A2E] transition"
                  >
                    <action.icon size={12} />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-[#3A3A52]">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message… (auto-translated to recipient)"
                  className="flex-1 bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
                />
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 bg-[#C9A84C] rounded-lg flex items-center justify-center hover:opacity-90 transition shrink-0"
                >
                  <Send size={16} className="text-[#1A1A2E]" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#5C5A70] text-sm">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 