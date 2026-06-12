import { NextResponse } from "next/server";

import { getServerStats } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getServerStats());
}
