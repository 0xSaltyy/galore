import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { fetchDiscordGuildMember, guildMemberAvatarUrl, displayNameFromDiscord } from "@/lib/discord";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { staffSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = staffSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid staff fields." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const staff = parsed.data;
  const discordMember = await fetchDiscordGuildMember(staff.discordUserId).catch(() => null);
  const displayName = discordMember ? displayNameFromDiscord(discordMember) : staff.displayName;
  const avatarUrl = discordMember?.user
    ? guildMemberAvatarUrl(
        discordMember.user.id,
        discordMember.avatar,
        discordMember.user.avatar,
        discordMember.user.discriminator,
      )
    : null;

  const payload = {
    discord_user_id: staff.discordUserId,
    display_name: displayName,
    avatar_url: avatarUrl,
    rank: staff.rank,
    status: staff.status,
    bio: staff.bio,
    sort_order: staff.sortOrder,
  };

  const query = staff.id
    ? supabase.from("staff_members").update(payload).eq("id", staff.id)
    : supabase.from("staff_members").upsert(payload, { onConflict: "discord_user_id" });

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
