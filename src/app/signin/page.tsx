import SignInClient from "./sign-in-client";

const ALLOWED_NEXT_PREFIXES = [
  "/dashboard",
  "/goals",
  "/habits",
  "/tracker",
  "/profile",
];

function isAllowedNextPath(pathname: string) {
  return ALLOWED_NEXT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function normalizeNextPath(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return undefined;
  }

  try {
    const parsed = new URL(next, "https://motivate.me");
    if (parsed.origin !== "https://motivate.me") return undefined;
    if (!isAllowedNextPath(parsed.pathname)) return undefined;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return undefined;
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;
  return <SignInClient nextPath={normalizeNextPath(next)} />;
}
