import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env, httpUrlEnv, warnEnvIssue } from "@/lib/env";

let adminClient: SupabaseClient | null | undefined;
let publicClient: SupabaseClient | null | undefined;

const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

function createSupabaseClient(keyName: string) {
  const url = httpUrlEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = env(keyName);

  if (!url || !key) {
    if (!key) {
      warnEnvIssue(keyName, "is missing");
    }

    return null;
  }

  try {
    return createClient(url, key, options);
  } catch {
    warnEnvIssue("Supabase", `client is disabled because ${keyName} or NEXT_PUBLIC_SUPABASE_URL is invalid`);
    return null;
  }
}

export function getSupabaseAdminClient() {
  if (adminClient !== undefined) {
    return adminClient;
  }

  adminClient = createSupabaseClient("SUPABASE_SERVICE_ROLE_KEY");
  return adminClient;
}

export function getSupabasePublicClient() {
  if (publicClient !== undefined) {
    return publicClient;
  }

  publicClient = createSupabaseClient("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return publicClient;
}

export function getReadableSupabaseClient() {
  return getSupabaseAdminClient() ?? getSupabasePublicClient();
}
