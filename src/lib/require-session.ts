import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";
const DEV_SESSION_COOKIE_NAME = "__dev_session";

export async function requireSessionUserId(): Promise<string> {
  const jar = await cookies();
  const allowDevSessionBypass = process.env.ALLOW_DEV_SESSION === "1";

  const devCookie = jar.get(DEV_SESSION_COOKIE_NAME)?.value;
  if (
    allowDevSessionBypass &&
    process.env.NODE_ENV !== "production" &&
    devCookie
  ) {
    // Dev fallback when FIREBASE_SERVICE_ACCOUNT_KEY isn't configured.
    // We can’t verify the user; return a stable placeholder.
    return "dev";
  }

  const sessionCookie = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    throw new Error("UNAUTHENTICATED");
  }

  const adminAuth = getAdminAuth();
  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decoded?.uid) {
    throw new Error("UNAUTHENTICATED");
  }

  return decoded.uid;
}
