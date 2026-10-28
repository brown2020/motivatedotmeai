const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function originOf(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      LOCAL_DEV_HOSTS.has(url.hostname)
    );
  } catch {
    return false;
  }
}

/**
 * Session cookie mutations must come from the app origin.
 * Production does not accept loopback or a missing Origin/Referer.
 * Non-production accepts loopback only, for `next dev`.
 */
export function isAllowedSessionOrigin(
  originHeader: string | null,
  refererHeader: string | null,
  env: { nodeEnv?: string; appUrl?: string }
): boolean {
  const candidate = originOf(originHeader) ?? originOf(refererHeader);
  if (!candidate) return false;

  const isProd = env.nodeEnv === "production";
  if (!isProd) return isLocalDevOrigin(candidate);

  const appOrigin = originOf(env.appUrl);
  return Boolean(appOrigin && candidate === appOrigin);
}
