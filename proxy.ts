import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "__session";
const DEV_SESSION_COOKIE_NAME = "__dev_session";

const SIGN_IN_PATH = "/signin";

const PROTECTED_PREFIXES = ["/dashboard", "/goals", "/habits", "/profile"];
const PUBLIC_PREFIXES = [SIGN_IN_PATH];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getNextParam(pathname: string, search: string) {
  // Preserve existing query string when redirecting to signin.
  const raw = `${pathname}${search || ""}`;
  return encodeURIComponent(raw);
}

export function proxyMiddleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip all API routes (session handling happens server-side).
  if (pathname.startsWith("/api")) return NextResponse.next();

  const hasSessionCookie = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const hasDevSessionCookie =
    process.env.NODE_ENV !== "production" &&
    Boolean(req.cookies.get(DEV_SESSION_COOKIE_NAME)?.value);
  const isSignedIn = hasSessionCookie || hasDevSessionCookie;

  // Always allow public routes (signin, assets, etc)
  if (isPublicPath(pathname)) {
    // If already signed in, keep "/" and "/signin" as landing redirects.
    if (isSignedIn && (pathname === "/" || pathname === SIGN_IN_PATH)) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Anything that's not public and is explicitly protected requires sign-in.
  if (!isSignedIn && isProtectedPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = SIGN_IN_PATH;
    url.search = `?next=${getNextParam(pathname, search)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Apply to everything except:
     * - next internals
     * - static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};

export default function proxy(req: NextRequest) {
  return proxyMiddleware(req);
}
