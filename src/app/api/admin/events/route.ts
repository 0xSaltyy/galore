import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { eventSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (raw && raw.isActive === undefined) {
    raw.isActive = false;
  }

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event fields." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const event = parsed.data;
  const payload = {
    title: event.title,
    description: event.description,
    starts_at: event.startsAt,
    host: event.host || null,
    event_type: event.eventType,
    is_active: event.isActive,
    updated_by: session.userId,
  };

  const query = event.id
    ? supabase.from("events").update(payload).eq("id", event.id)
    : supabase.from("events").insert(payload);

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing event id." }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
