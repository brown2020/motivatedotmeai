"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { usePathname, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/goals",
  "/habits",
  "/tracker",
  "/profile",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export function Providers({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.init);
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const initForUser = useAppStore((s) => s.initForUser);
  const darkMode = useAppStore((s) => s.user?.preferences.darkMode);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    initForUser(uid);
  }, [initForUser, uid]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode === true);
  }, [darkMode]);

  useEffect(() => {
    // Client-side guard:
    // Next can navigate between static client pages without hitting the server.
    // Once auth is resolved and the user is logged out, force redirect.
    if (isAuthLoading) return;
    if (uid) return;

    if (!isProtectedPath(pathname)) return;

    const search =
      typeof window !== "undefined" ? window.location.search || "" : "";
    const next = encodeURIComponent(`${pathname}${search}`);
    router.replace(`/signin?next=${next}`);
  }, [isAuthLoading, pathname, router, uid]);

  // Don't render protected content until auth state is resolved
  // This prevents the flash of authenticated content for unauthenticated users
  if (isAuthLoading && isProtectedPath(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return children;
}
