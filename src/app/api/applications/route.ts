import { NextResponse } from "next/server";

import { sendStaffWebhook } from "@/lib/discord";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { applicationSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = applicationSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application fields." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const application = parsed.data;
  const { data, error } = await supabase
    .from("staff_applications")
    .insert({
      discord_username: application.discordUsername,
      discord_user_id: application.discordUserId,
      age: application.age,
      timezone: application.timezone,
      activity_level: application.activityLevel,
      why_staff: application.whyStaff,
      vc_problem_response: application.vcProblemResponse,
      argument_response: application.argumentResponse,
      previous_experience: application.previousExperience,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sendStaffWebhook({
    embeds: [
      {
        title: "New Staff Application",
        color: 0xdc2626,
        fields: [
          { name: "Discord", value: application.discordUsername, inline: true },
          { name: "User ID", value: application.discordUserId, inline: true },
          { name: "Age", value: String(application.age), inline: true },
          { name: "Timezone", value: application.timezone, inline: true },
          { name: "Activity", value: application.activityLevel, inline: true },
          { name: "Why staff?", value: application.whyStaff.slice(0, 1024) },
          { name: "VC problem response", value: application.vcProblemResponse.slice(0, 1024) },
          { name: "Argument response", value: application.argumentResponse.slice(0, 1024) },
          { name: "Previous experience", value: application.previousExperience.slice(0, 1024) },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }).catch(() => null);

  return NextResponse.json({ id: data.id });
}
