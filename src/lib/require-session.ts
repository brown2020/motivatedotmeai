import "server-only";

import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE_NAME,
  DEV_SESSION_COOKIE_NAME,
  hasValidDevSession,
} from "@/lib/dev-session";

export async function requireSessionUserId(): Promise<string> {
  const jar = await cookies();

  const devCookie = jar.get(DEV_SESSION_COOKIE_NAME)?.value;
  if (hasValidDevSession(devCookie)) {
    // Dev fallback when FIREBASE_SERVICE_ACCOUNT_KEY isn't configured.
    // We can't verify the user; return a stable placeholder.
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
