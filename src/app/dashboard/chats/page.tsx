"use client";

import { Suspense } from "react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
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
  Loader2,
  MessageCircle,
  Phone,
  X,
  Square,
  Play,
  Pause,
  Image as ImageIcon,
  File as LucideFile,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useVoiceRecorder } from "@/lib/useVoiceRecorder";

type Profile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  is_verified: boolean;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
  is_read: boolean;
  profiles: Profile;
};

type Conversation = {
  id: string;
  otherUser: Profile;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
};

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function formatDuration(secs: number) {
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

const AVATAR_COLORS = [
  "bg-emerald-900 text-emerald-300",
  "bg-blue-900 text-blue-300",
  "bg-purple-900 text-purple-300",
  "bg-orange-900 text-orange-300",
  "bg-indigo-900 text-indigo-300",
];

function getColor(id: string) {
  return AVATAR_COLORS[id?.charCodeAt(0) % AVATAR_COLORS.length];
}

function isImageFile(name: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

function ChatsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const {
    recording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    resetAudio,
  } = useVoiceRecorder();

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    full_name: string;
  } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    searchParams.get("conversationId") || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callUrl, setCallUrl] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    agenda: "",
    date: "",
    time: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    searchParams.get("conversationId") ? "chat" : "list"
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeConvo = conversations.find((c) => c.id === activeConversationId);

  const fetchConversations = useCallback(async (userId: string) => {
    setLoadingConvos(true);
    const res = await fetch(`/api/conversations?userId=${userId}`);
    const { conversations: data } = await res.json();
    setConversations(data || []);
    setLoadingConvos(false);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
        fetchConversations(profile.id);
      }
    };

    void loadUser();
  }, [supabase, fetchConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    const markRead = async () => {
      if (!activeConversationId || !currentUser) return;

      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          userId: currentUser.id,
        }),
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    };

    void markRead();
  }, [activeConversationId, currentUser]);

  // Realtime subscription
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`messages:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select(`*, profiles(id, full_name, username, avatar_url, is_verified)`)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => {
              if (prev.find((m) => m.id === data.id)) return prev;
              return [...prev, data];
            });

            // Mark as read immediately if it's from the other person
            if (data.sender_id !== currentUser?.id) {
              fetch("/api/messages/read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  conversationId: activeConversationId,
                  userId: currentUser?.id,
                }),
              });
            }

            // Update conversation last message
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeConversationId
                  ? { ...c, lastMessage: data.content, lastMessageTime: data.created_at }
                  : c
              )
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversationId, currentUser, supabase]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversationId) return;

      setLoadingMessages(true);
      const res = await fetch(`/api/messages?conversationId=${activeConversationId}`);
      const { messages: data } = await res.json();
      setMessages(data || []);
      setLoadingMessages(false);
    };

    void loadMessages();
  }, [activeConversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !activeConversationId || !currentUser || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversationId,
        senderId: currentUser.id,
        content,
        messageType: "text",
      }),
    });
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId || !currentUser) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", activeConversationId);
    formData.append("senderId", currentUser.id);

    await fetch("/api/messages/upload", { method: "POST", body: formData });
    setUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendVoiceNote = async () => {
    if (!audioBlob || !activeConversationId || !currentUser) return;

    const formData = new FormData();
    formData.append("file", audioBlob, `voice-note-${Date.now()}.webm`);
    formData.append("conversationId", activeConversationId);
    formData.append("senderId", currentUser.id);

    await fetch("/api/messages/upload", { method: "POST", body: formData });
    resetAudio();
  };

  const handleNDA = async () => {
    if (!activeConversationId || !currentUser) return;

    await fetch("/api/messages/nda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversationId,
        senderId: currentUser.id,
        senderName: currentUser.full_name,
        recipientName: activeConvo?.otherUser?.full_name,
      }),
    });
  };

  const handleScheduleMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time) return;

    const scheduledAt = new Date(
      `${meetingForm.date}T${meetingForm.time}`
    ).toISOString();

    await fetch("/api/meetings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversationId,
        organizerId: currentUser?.id,
        participantId: activeConvo?.otherUser?.id,
        title: meetingForm.title,
        agenda: meetingForm.agenda,
        scheduledAt,
        timezone: meetingForm.timezone,
      }),
    });

    setShowMeetingModal(false);
    setMeetingForm({ title: "", agenda: "", date: "", time: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  };

  const startCall = async (videoEnabled: boolean) => {
    if (!activeConversationId) return;

    const res = await fetch("/api/calls/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeConversationId }),
    });
    const { url } = await res.json();

    // Send call link as system message
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversationId,
        senderId: currentUser?.id,
        content: `📞 ${videoEnabled ? "Video" : "Voice"} call started\n\nJoin here: ${url}`,
        messageType: "system",
      }),
    });

    setCallUrl(url);
    setInCall(true);
  };

  const openConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMobileView("chat");
  };

  return (
    <div className="h-screen bg-[#0F0F1A] flex flex-col overflow-hidden">

      {/* In-call overlay */}
      {inCall && callUrl && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0F0F1A]">
            <span className="text-[#F5F3ED] text-sm font-medium">
              {activeConvo?.otherUser?.full_name} — Live call
            </span>
            <button
              onClick={() => { setInCall(false); setCallUrl(null); }}
              className="flex items-center gap-2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg"
            >
              <Phone size={13} />
              End call
            </button>
          </div>
          <iframe
            src={callUrl}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            className="flex-1 w-full border-none"
          />
        </div>
      )}

      {/* Top bar — FIXED */}
      <header className="bg-[#0F0F1A] border-b border-[#3A3A52] px-4 py-3 flex items-center gap-3 shrink-0 z-20">
        <button onClick={() => router.back()}>
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

        {/* Conversation list — FIXED WIDTH */}
        <div
          className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex flex-col w-full md:w-72 border-r border-[#3A3A52] shrink-0 overflow-hidden`}
        >
          {/* List header */}
          <div className="px-4 py-3 border-b border-[#3A3A52] shrink-0">
            <div className="text-[#F5F3ED] text-sm font-medium">Chats</div>
          </div>

          {/* Community button */}
          <button
            onClick={() => router.push("/dashboard/community")}
            className="flex items-center gap-3 px-4 py-3 border-b border-[#3A3A52] hover:bg-[#1A1A2E] transition text-left"
          >
            <div className="w-10 h-10 rounded-full bg-[#C9A84C20] flex items-center justify-center shrink-0">
              <Users size={18} className="text-[#C9A84C]" />
            </div>
            <div>
              <div className="text-[#F5F3ED] text-sm font-medium">
                iVest Community
              </div>
              <div className="text-[#5C5A70] text-xs">
                Global investor & builder forum
              </div>
            </div>
          </button>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="text-[#C9A84C] animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 gap-3">
                <MessageCircle size={28} className="text-[#3A3A52]" />
                <p className="text-[#5C5A70] text-sm text-center">
                  No conversations yet
                </p>
                <p className="text-[#5C5A70] text-xs text-center">
                  Start a chat from a project in the Explore feed
                </p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#3A3A52] text-left transition w-full ${
                    activeConversationId === c.id ? "bg-[#1A1A2E]" : "hover:bg-[#1A1A2E]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${getColor(c.otherUser?.id || "a")}`}>
                    {getInitials(c.otherUser?.full_name || "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[#F5F3ED] text-sm font-medium truncate">
                          {c.otherUser?.full_name || "Unknown"}
                        </span>
                        {c.otherUser?.is_verified && (
                          <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                        )}
                      </div>
                      {c.lastMessageTime && (
                        <span className="text-[#5C5A70] text-xs shrink-0">
                          {timeAgo(c.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[#5C5A70] text-xs truncate">
                        {c.lastMessage}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-[#C9A84C] rounded-full text-[#1A1A2E] text-xs flex items-center justify-center font-medium shrink-0 ml-1">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-1 flex-col overflow-hidden`}>
          {activeConvo ? (
            <>
              {/* Chat header — FIXED */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3A3A52] bg-[#0F0F1A] shrink-0">
                <button className="md:hidden" onClick={() => setMobileView("list")}>
                  <ArrowLeft size={18} className="text-[#A8A6B8]" />
                </button>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${getColor(activeConvo.otherUser?.id || "a")}`}>
                  {getInitials(activeConvo.otherUser?.full_name || "?")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[#F5F3ED] text-sm font-medium">
                      {activeConvo.otherUser?.full_name}
                    </span>
                    {activeConvo.otherUser?.is_verified && (
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
                {/* Call buttons */}
                <button
                  onClick={() => startCall(false)}
                  className="w-8 h-8 flex items-center justify-center border border-[#3A3A52] rounded-lg hover:bg-[#1A1A2E] transition"
                  title="Voice call"
                >
                  <Phone size={15} className="text-[#A8A6B8]" />
                </button>
                <button
                  onClick={() => startCall(true)}
                  className="w-8 h-8 flex items-center justify-center border border-[#3A3A52] rounded-lg hover:bg-[#1A1A2E] transition"
                  title="Video call"
                >
                  <Video size={15} className="text-[#A8A6B8]" />
                </button>
              </div>

              {/* Translation banner */}
              <div className="flex items-center gap-2 px-4 py-1.5 bg-[#C9A84C10] border-b border-[#C9A84C30] shrink-0">
                <Globe size={11} className="text-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs">
                  Auto-translated · Powered by DeepL
                </span>
              </div>

              {/* Messages — SCROLLABLE */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={20} className="text-[#C9A84C] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <p className="text-[#5C5A70] text-sm">No messages yet</p>
                    <p className="text-[#5C5A70] text-xs">Send the first message below</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const isSystem = msg.message_type === "system";
                    const isFile = msg.message_type === "file";
                    const isVoice = msg.file_name?.endsWith(".webm");
                    const isImage = isFile && isImageFile(msg.file_name || "");

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="bg-[#C9A84C10] border border-[#C9A84C30] rounded-xl px-4 py-3 max-w-sm text-xs text-[#C9A84C] whitespace-pre-line text-center">
                            {msg.content}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && (
                          <span className="text-[#5C5A70] text-xs mb-1 ml-1">
                            {msg.profiles?.full_name}
                          </span>
                        )}

                        {isImage ? (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={msg.file_url || ""}
                              alt={msg.file_name || "image"}
                              width={400}
                              height={400}
                              unoptimized
                              className="max-w-xs rounded-xl border border-[#3A3A52] cursor-pointer hover:opacity-90 transition"
                            />
                          </a>
                        ) : isVoice ? (
                          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl max-w-xs ${isMe ? "bg-[#C9A84C]" : "bg-[#1A1A2E] border border-[#3A3A52]"}`}>
                            <button
                              onClick={() => {
                                if (playingAudio === msg.id) {
                                  audioRef.current?.pause();
                                  setPlayingAudio(null);
                                } else {
                                  if (audioRef.current) {
                                    audioRef.current.src = msg.file_url || "";
                                    audioRef.current.play();
                                    setPlayingAudio(msg.id);
                                    audioRef.current.onended = () => setPlayingAudio(null);
                                  }
                                }
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center fshrink-0 ${isMe ? "bg-[#1A1A2E20]" : "bg-[#C9A84C20]"}`}
                            >
                              {playingAudio === msg.id ? (
                                <Pause size={14} className={isMe ? "text-[#1A1A2E]" : "text-[#C9A84C]"} />
                              ) : (
                                <Play size={14} className={isMe ? "text-[#1A1A2E]" : "text-[#C9A84C]"} />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className={`text-xs font-medium ${isMe ? "text-[#1A1A2E]" : "text-[#F5F3ED]"}`}>
                                Voice note
                              </div>
                              <div className="h-0.5 bg-current opacity-20 rounded mt-1" />
                            </div>
                          </div>
                        ) : isFile ? (
                          <a
                            href={msg.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl max-w-xs border ${isMe ? "bg-[#C9A84C] border-transparent" : "bg-[#1A1A2E] border-[#3A3A52]"}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? "bg-[#1A1A2E20]" : "bg-[#C9A84C20]"}`}>
                              {msg.file_name?.includes(".pdf") ? (
                                <FileText size={15} className={isMe ? "text-[#1A1A2E]" : "text-[#C9A84C]"} />
                              ) : (
                                <LucideFile size={15} className={isMe ? "text-[#1A1A2E]" : "text-[#C9A84C]"} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-medium truncate ${isMe ? "text-[#1A1A2E]" : "text-[#F5F3ED]"}`}>
                                {msg.file_name || msg.content}
                              </div>
                              <div className={`text-xs opacity-60 ${isMe ? "text-[#1A1A2E]" : "text-[#A8A6B8]"}`}>
                                Tap to download
                              </div>
                            </div>
                          </a>
                        ) : (
                          <div className={`max-w-xs md:max-w-sm px-3 py-2.5 rounded-xl text-sm leading-relaxed ${isMe ? "bg-[#C9A84C] text-[#1A1A2E]" : "bg-[#1A1A2E] text-[#F5F3ED]"}`}>
                            {msg.content}
                          </div>
                        )}

                        <span className="text-[#5C5A70] text-xs mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {isMe && (
                            <span className="ml-1">
                              {msg.is_read ? " ✓✓" : " ✓"}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
                <audio ref={audioRef} className="hidden" />
              </div>

              {/* Voice recording UI */}
              {recording && (
                <div className="flex items-center gap-3 px-4 py-3 border-t border-[#3A3A52] bg-red-900/20 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-sm flex-1">
                    Recording… {formatDuration(duration)}
                  </span>
                  <button onClick={cancelRecording} className="text-[#5C5A70] hover:text-[#A8A6B8]">
                    <X size={18} />
                  </button>
                  <button
                    onClick={stopRecording}
                    className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <Square size={12} className="text-white fill-white" />
                  </button>
                </div>
              )}

              {/* Voice note preview */}
              {audioBlob && !recording && (
                <div className="flex items-center gap-3 px-4 py-3 border-t border-[#3A3A52] bg-[#1A1A2E] shrink-0">
                  <Mic size={16} className="text-[#C9A84C]" />
                  <span className="text-[#A8A6B8] text-sm flex-1">
                    Voice note ready — {formatDuration(duration)}
                  </span>
                  <button onClick={cancelRecording} className="text-[#5C5A70] hover:text-[#A8A6B8] mr-2">
                    <X size={16} />
                  </button>
                  <button
                    onClick={sendVoiceNote}
                    className="bg-[#C9A84C] text-[#1A1A2E] text-xs px-4 py-1.5 rounded-lg font-medium"
                  >
                    Send
                  </button>
                </div>
              )}

              {/* Bottom bar — FIXED */}
              {!recording && !audioBlob && (
                <>
                  {/* Action bar */}
                  <div className="flex items-center gap-2 px-4 py-2 border-t border-[#3A3A52] overflow-x-auto shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-[#A8A6B8] border border-[#3A3A52] px-2.5 py-1.5 rounded-lg hover:bg-[#1A1A2E] transition"
                    >
                      {uploadingFile ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
                      {uploadingFile ? "Uploading…" : "File"}
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.setAttribute("accept", "image/*");
                        fileInputRef.current?.click();
                        setTimeout(() => fileInputRef.current?.setAttribute("accept", ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp"), 1000);
                      }}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-[#A8A6B8] border border-[#3A3A52] px-2.5 py-1.5 rounded-lg hover:bg-[#1A1A2E] transition"
                    >
                      <ImageIcon size={12} />
                      Image
                    </button>
                    <button
                      onClick={handleNDA}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-[#A8A6B8] border border-[#3A3A52] px-2.5 py-1.5 rounded-lg hover:bg-[#1A1A2E] transition"
                    >
                      <FileText size={12} />
                      NDA
                    </button>
                    <button
                      onClick={() => setShowMeetingModal(true)}
                      className="shrink-0 flex items-center gap-1.5 text-xs text-[#A8A6B8] border border-[#3A3A52] px-2.5 py-1.5 rounded-lg hover:bg-[#1A1A2E] transition"
                    >
                      <Calendar size={12} />
                      Meeting
                    </button>
                  </div>

                  {/* Message input */}
                  <div className="flex items-center gap-2 px-4 py-3 border-t border-[#3A3A52] shrink-0">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Type a message…"
                      className="flex-1 bg-[#1A1A2E] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
                    />
                    {input.trim() ? (
                      <button
                        onClick={sendMessage}
                        disabled={sending}
                        className="w-10 h-10 bg-[#C9A84C] rounded-lg flex items-center justify-center shrink-0 hover:opacity-90 transition"
                      >
                        {sending ? (
                          <Loader2 size={16} className="text-[#1A1A2E] animate-spin" />
                        ) : (
                          <Send size={16} className="text-[#1A1A2E]" />
                        )}
                      </button>
                    ) : (
                      <button
                        onMouseDown={startRecording}
                        className="w-10 h-10 bg-[#1A1A2E] border border-[#3A3A52] rounded-lg flex items-center justify-center shrink-0 hover:border-[#C9A84C] transition"
                        title="Hold to record voice note"
                      >
                        <Mic size={16} className="text-[#A8A6B8]" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <MessageCircle size={32} className="text-[#3A3A52]" />
              <p className="text-[#5C5A70] text-sm">Select a conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Meeting modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center px-4">
          <div className="bg-[#1A1A2E] border border-[#3A3A52] rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#F5F3ED] text-base font-medium">
                Schedule Meeting
              </h3>
              <button onClick={() => setShowMeetingModal(false)}>
                <X size={18} className="text-[#5C5A70]" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={meetingForm.title}
                onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                placeholder="Meeting title *"
                className="w-full bg-[#0F0F1A] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                  className="w-full bg-[#0F0F1A] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#C9A84C] transition"
                />
                <input
                  type="time"
                  value={meetingForm.time}
                  onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                  className="w-full bg-[#0F0F1A] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#C9A84C] transition"
                />
              </div>
              <textarea
                value={meetingForm.agenda}
                onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                rows={2}
                placeholder="Agenda (optional)"
                className="w-full bg-[#0F0F1A] border border-[#3A3A52] text-[#F5F3ED] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#C9A84C] transition placeholder-[#5C5A70] resize-none"
              />
              <button
                onClick={handleScheduleMeeting}
                disabled={!meetingForm.title || !meetingForm.date || !meetingForm.time}
                className={`w-full font-medium text-sm py-3 rounded-lg transition ${
                  meetingForm.title && meetingForm.date && meetingForm.time
                    ? "bg-[#C9A84C] text-[#1A1A2E] hover:opacity-90"
                    : "bg-[#2A2A3E] text-[#5C5A70] cursor-not-allowed"
                }`}
              >
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
          <Loader2 size={24} className="text-[#C9A84C] animate-spin" />
        </div>
      }
    >
      <ChatsInner />
    </Suspense>
  );
}