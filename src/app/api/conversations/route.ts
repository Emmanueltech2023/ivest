import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Get all conversations this user is part of
    const { data: participations, error: partError } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (partError) throw partError;
    if (!participations || participations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const conversationIds = participations.map((p) => p.conversation_id);

    // Get the other participant in each conversation
    const { data: otherParticipants, error: otherError } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        profiles (
          id,
          full_name,
          username,
          avatar_url,
          is_verified
        )
      `)
      .in("conversation_id", conversationIds)
      .neq("user_id", userId);

    if (otherError) throw otherError;

    // Get last message for each conversation
    const conversations = await Promise.all(
      conversationIds.map(async (convId) => {
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        const { data: unreadCount } = await supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("conversation_id", convId)
          .eq("is_read", false)
          .neq("sender_id", userId);

        const otherParticipant = otherParticipants?.find(
          (p) => p.conversation_id === convId
        );

        return {
          id: convId,
          otherUser: otherParticipant?.profiles,
          lastMessage: lastMsg?.content || "No messages yet",
          lastMessageTime: lastMsg?.created_at || null,
          unreadCount: unreadCount?.length || 0,
        };
      })
    );

    return NextResponse.json({ conversations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}