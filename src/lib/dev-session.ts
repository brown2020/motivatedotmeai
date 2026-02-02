import "server-only";

export const SESSION_COOKIE_NAME = "__session";
export const DEV_SESSION_COOKIE_NAME = "__dev_session";
export const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * Check if the dev session bypass is enabled.
 * This should only be used in development mode.
 *
 * WARNING: If this returns true in production, it's a security vulnerability.
 */
export function isDevSessionBypassEnabled(): boolean {
  const allowDevSessionBypass = process.env.ALLOW_DEV_SESSION === "1";
  const isProd = process.env.NODE_ENV === "production";

  if (allowDevSessionBypass && isProd) {
    console.warn(
      "⚠️ WARNING: ALLOW_DEV_SESSION is enabled in production! This is a security risk."
    );
    return false; // Never allow in production
  }

  return allowDevSessionBypass && !isProd;
}

/**
 * Check if a dev session cookie value indicates an active dev session.
 */
export function hasValidDevSession(devCookieValue: string | undefined): boolean {
  if (!isDevSessionBypassEnabled()) {
    return false;
  }
  return Boolean(devCookieValue);
}
