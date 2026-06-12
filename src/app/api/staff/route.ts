import { NextResponse } from "next/server";

import { getStaffMembers } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getStaffMembers());
}
