import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE_NAME,
  DEV_SESSION_COOKIE_NAME,
  hasValidDevSession,
} from "@/lib/dev-session";

export async function GET() {
  const jar = await cookies();

  const devCookie = jar.get(DEV_SESSION_COOKIE_NAME)?.value;
  if (hasValidDevSession(devCookie)) {
    return NextResponse.json({ ok: true, mode: "dev", uid: "dev" });
  }

  const sessionCookie = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const isAdminConfigured = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (!isAdminConfigured) {
    return NextResponse.json(
      { ok: false, error: "SESSION_NOT_CONFIGURED" },
      { status: 501 }
    );
  }

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ ok: true, uid: decoded.uid });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
