export function env(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function csvEnv(name: string) {
  return new Set(
    (env(name) ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function siteUrl() {
  return env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000";
}
