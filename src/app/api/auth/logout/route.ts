import { NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const response = NextResponse.redirect(`${siteUrl()}/`);
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
