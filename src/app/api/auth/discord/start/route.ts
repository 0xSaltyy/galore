import { NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE } from "@/lib/auth";
import {
  DISCORD_OAUTH_AUTHORIZE_URL,
  getDiscordRedirectUri,
} from "@/lib/discord-config";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = env("DISCORD_CLIENT_ID");
  const redirectUri = getDiscordRedirectUri();

  if (!clientId) {
    return NextResponse.json({ error: "DISCORD_CLIENT_ID is not configured." }, { status: 503 });
  }

  const state = crypto.randomUUID();
  const url = new URL(DISCORD_OAUTH_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify guilds.members.read");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "none");

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return response;
}
