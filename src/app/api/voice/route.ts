import { NextResponse } from "next/server";

import { getServerStats, getVoiceSnapshot } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [channels, stats] = await Promise.all([getVoiceSnapshot(), getServerStats()]);
  return NextResponse.json({ channels, stats });
}
