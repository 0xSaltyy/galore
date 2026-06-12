import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  createSessionToken,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
  sessionFromDiscordUser,
} from "@/lib/auth";
import {
  exchangeDiscordCode,
  fetchDiscordOAuthGuildMember,
  fetchDiscordOAuthUser,
} from "@/lib/discord";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${siteUrl()}/admin/login?error=state`);
  }

  try {
    const token = await exchangeDiscordCode(code);
    const [user, guildMember] = await Promise.all([
      fetchDiscordOAuthUser(token.access_token),
      fetchDiscordOAuthGuildMember(token.access_token),
    ]);
    const session = await sessionFromDiscordUser(user, guildMember);

    if (!session) {
      return NextResponse.redirect(`${siteUrl()}/admin/login?error=unauthorized`);
    }

    const response = NextResponse.redirect(`${siteUrl()}/admin`);
    response.cookies.set(SESSION_COOKIE, createSessionToken(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.delete(OAUTH_STATE_COOKIE);

    return response;
  } catch {
    return NextResponse.redirect(`${siteUrl()}/admin/login?error=oauth`);
  }
}
