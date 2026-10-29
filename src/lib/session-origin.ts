const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Vercel preview hostnames for the ignitechannel team, e.g. app-git-dev-ignitechannel.vercel.app */
const IGNITECHANNEL_PREVIEW_HOST =
  /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-ignitechannel\.vercel\.app$/;

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

export function isIgnitechannelPreviewOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      IGNITECHANNEL_PREVIEW_HOST.test(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

function hostHeaderMatchesOrigin(originUrl: URL, hostHeader: string): boolean {
  const first = hostHeader.split(",")[0]?.trim();
  if (!first) return false;
  let parsed: URL;
  try {
    parsed = new URL(`http://${first}`);
  } catch {
    return false;
  }
  if (parsed.hostname.toLowerCase() !== originUrl.hostname.toLowerCase()) {
    return false;
  }
  if (!parsed.port) return true;
  const originPort = originUrl.port || (originUrl.protocol === "https:" ? "443" : "80");
  return parsed.port === originPort;
}

/** True when the browser origin is the host that received this request. */
export function isSameOriginAsRequest(
  origin: string,
  host: string | null | undefined,
  forwardedHost: string | null | undefined
): boolean {
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }
  if (originUrl.protocol !== "https:" && originUrl.protocol !== "http:") return false;
  return [forwardedHost, host].some(
    (value) => Boolean(value) && hostHeaderMatchesOrigin(originUrl, value as string)
  );
}

/**
 * Session cookie mutations must come from this deployment.
 * Production accepts the configured app URL, the request's own host
 * (Host or x-forwarded-host), and https previews on *-ignitechannel.vercel.app.
 * A foreign Origin is still rejected. Non-production accepts loopback only.
 */
export function isAllowedSessionOrigin(
  originHeader: string | null,
  refererHeader: string | null,
  env: {
    nodeEnv?: string;
    appUrl?: string;
    host?: string | null;
    forwardedHost?: string | null;
  }
): boolean {
  const candidate = originOf(originHeader) ?? originOf(refererHeader);
  if (!candidate) return false;

  const isProd = env.nodeEnv === "production";
  if (!isProd) return isLocalDevOrigin(candidate);

  const appOrigin = originOf(env.appUrl);
  if (appOrigin && candidate === appOrigin) return true;

  let candidateUrl: URL;
  try {
    candidateUrl = new URL(candidate);
  } catch {
    return false;
  }
  if (candidateUrl.protocol !== "https:") return false;

  if (isSameOriginAsRequest(candidate, env.host, env.forwardedHost)) return true;
  return isIgnitechannelPreviewOrigin(candidate);
}
