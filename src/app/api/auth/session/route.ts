import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";

const SESSION_COOKIE_NAME = "__session";
const DEV_SESSION_COOKIE_NAME = "__dev_session";
const SESSION_EXPIRES_IN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export async function POST(req: Request) {
  const isAdminConfigured = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const isProd = process.env.NODE_ENV === "production";
  const allowDevSessionBypass = process.env.ALLOW_DEV_SESSION === "1";

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
    if (!allowDevSessionBypass) {
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
      sameSite: "lax",
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
      sameSite: "lax",
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
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  jar.set(DEV_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ ok: true });
}
