"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useAppStore } from "@/stores/app-store";
import { usePathname, useRouter } from "next/navigation";

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

    const protectedPrefixes = [
      "/dashboard",
      "/goals",
      "/habits",
      "/tracker",
      "/profile",
    ];
    const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
    if (!isProtected) return;

    const search =
      typeof window !== "undefined" ? window.location.search || "" : "";
    const next = encodeURIComponent(`${pathname}${search}`);
    router.replace(`/signin?next=${next}`);
  }, [isAuthLoading, pathname, router, uid]);

  return children;
}
