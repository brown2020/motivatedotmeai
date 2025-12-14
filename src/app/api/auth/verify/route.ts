import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";
const DEV_SESSION_COOKIE_NAME = "__dev_session";

export async function GET() {
  const jar = await cookies();

  const allowDevSessionBypass = process.env.ALLOW_DEV_SESSION === "1";
  const devCookie = jar.get(DEV_SESSION_COOKIE_NAME)?.value;
  if (
    allowDevSessionBypass &&
    process.env.NODE_ENV !== "production" &&
    devCookie
  ) {
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
