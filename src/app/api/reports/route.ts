import { NextResponse } from "next/server";

import { sendStaffWebhook } from "@/lib/discord";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { reportSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = reportSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report or appeal fields." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const report = parsed.data;
  const { data, error } = await supabase
    .from("reports")
    .insert({
      type: report.type,
      discord_username: report.discordUsername,
      discord_user_id: report.discordUserId,
      subject: report.subject,
      details: report.details,
      evidence_url: report.evidenceUrl || null,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendStaffWebhook({
    embeds: [
      {
        title: report.type === "ban_appeal" ? "New Ban Appeal" : "New Report",
        color: report.type === "ban_appeal" ? 0x4682a9 : 0xdc2626,
        fields: [
          { name: "Discord", value: report.discordUsername, inline: true },
          { name: "User ID", value: report.discordUserId, inline: true },
          { name: "Subject", value: report.subject },
          { name: "Details", value: report.details.slice(0, 1024) },
          { name: "Evidence", value: report.evidenceUrl || "None" },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }).catch(() => null);

  return NextResponse.json({ id: data.id });
}
