import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE_NAME,
  DEV_SESSION_COOKIE_NAME,
  SESSION_EXPIRES_IN_MS,
  isDevSessionBypassEnabled,
} from "@/lib/dev-session";

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function getOrigin(value: string): string | null {
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

function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;

  if (process.env.NODE_ENV === "production") {
    const prodOrigin = process.env.NEXT_PUBLIC_APP_URL
      ? getOrigin(process.env.NEXT_PUBLIC_APP_URL)
      : null;
    if (prodOrigin && origin === prodOrigin) return true;
    return false;
  }

  return isLocalDevOrigin(origin);
}

function isValidReferer(referer: string | null): boolean {
  if (!referer) return false;
  const refererOrigin = getOrigin(referer);
  return isValidOrigin(refererOrigin);
}

export async function POST(req: Request) {
  // CSRF protection: verify origin header
  const headersList = await headers();
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");

  if (
    (origin && !isValidOrigin(origin)) ||
    (!origin && referer && !isValidReferer(referer))
  ) {
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 }
    );
  }

  const isAdminConfigured = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const isProd = process.env.NODE_ENV === "production";

  if (!isAdminConfigured && isProd) {
    return NextResponse.json(
      {
        error:
          "Session cookies not configured (missing FIREBASE_SERVICE_ACCOUNT_KEY).",
        code: "SESSION_NOT_CONFIGURED",
      },
      { status: 500 }
    );
  }

  let idToken: unknown;
  try {
    const body = (await req.json()) as { idToken?: unknown };
    idToken = body.idToken;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof idToken !== "string" || idToken.length < 50) {
    return NextResponse.json({ error: "Invalid idToken" }, { status: 400 });
  }

  // Dev fallback: allow a dev-only cookie so local development isn't blocked.
  if (!isAdminConfigured && !isProd) {
    if (!isDevSessionBypassEnabled()) {
      return NextResponse.json(
        {
          error:
            "Dev session bypass disabled. Set FIREBASE_SERVICE_ACCOUNT_KEY for real session cookies, or set ALLOW_DEV_SESSION=1 to re-enable the dev bypass.",
          code: "DEV_SESSION_DISABLED",
        },
        { status: 501 }
      );
    }

    const jar = await cookies();
    jar.set(DEV_SESSION_COOKIE_NAME, "1", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
    });
    return NextResponse.json({ ok: true, mode: "dev" });
  }

  try {
    const adminAuth = getAdminAuth();
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Changed from "lax" for better CSRF protection
      path: "/",
      maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to create session cookie:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  jar.set(DEV_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
