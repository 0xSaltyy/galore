const warnedEnvIssues = new Set<string>();

export function env(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function warnEnvIssue(name: string, issue: string) {
  const key = `${name}:${issue}`;

  if (warnedEnvIssues.has(key)) {
    return;
  }

  warnedEnvIssues.add(key);
  console.warn(`[galore] ${name} ${issue}. No secret values were printed.`);
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
  return httpUrlEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000") ?? "http://localhost:3000";
}

export function httpUrlEnv(name: string, fallback?: string) {
  const value = env(name);

  if (!value) {
    if (!fallback) {
      warnEnvIssue(name, "is missing");
    }

    return fallback;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      warnEnvIssue(name, "is invalid: must use http:// or https://");
      return fallback;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    warnEnvIssue(name, "is invalid: must be a valid HTTP or HTTPS URL");
    return fallback;
  }
}
