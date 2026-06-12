import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

let adminClient: SupabaseClient | null | undefined;
let publicClient: SupabaseClient | null | undefined;

const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export function getSupabaseAdminClient() {
  if (adminClient !== undefined) {
    return adminClient;
  }

  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");

  adminClient = url && key ? createClient(url, key, options) : null;
  return adminClient;
}

export function getSupabasePublicClient() {
  if (publicClient !== undefined) {
    return publicClient;
  }

  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  publicClient = url && key ? createClient(url, key, options) : null;
  return publicClient;
}

export function getReadableSupabaseClient() {
  return getSupabaseAdminClient() ?? getSupabasePublicClient();
}
