import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  SESSION_COOKIE_NAME,
  DEV_SESSION_COOKIE_NAME,
  SESSION_EXPIRES_IN_MS,
  isDevSessionBypassEnabled,
} from "@/lib/dev-session";

// Allowed origins for CSRF protection
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://localhost:3000",
];

function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // In production, check against allowed origins or same-site
  if (process.env.NODE_ENV === "production") {
    // Allow same-origin requests (no Origin header) or matching origins
    const prodOrigin = process.env.NEXT_PUBLIC_APP_URL;
    if (prodOrigin && origin === prodOrigin) return true;
    return false;
  }

  // In development, allow localhost
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

export async function POST(req: Request) {
  // CSRF protection: verify origin header
  const headersList = await headers();
  const origin = headersList.get("origin");
  const referer = headersList.get("referer");

  // Check if request comes from a valid origin
  if (!isValidOrigin(origin) && !referer?.includes("localhost")) {
    // Allow requests without origin (same-origin requests from some browsers)
    if (origin !== null) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 }
      );
    }
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
