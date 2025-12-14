import { create } from "zustand";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hasInitialized: boolean;
  init: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

let unsubscribeAuth: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  hasInitialized: false,

  init: () => {
    if (get().hasInitialized) return;
    set({ hasInitialized: true });

    if (unsubscribeAuth) return;

    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
      // Keep server session cookies in sync with Firebase auth state.
      // If Firebase signs out (token revoked/expired, cleared storage, etc),
      // ensure we clear the httpOnly session cookies so `proxy.ts` blocks again.
      if (!user) {
        fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
      }
    });
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) return false;

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      return res.ok;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return false;
    }
  },

  signOut: async () => {
    try {
      // 1) Clear server-side session cookies (httpOnly)
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
      // 2) Clear Firebase client auth state
      await firebaseSignOut(auth);
      // 3) Force a full navigation so any preloaded client routes are discarded
      //    and server/proxy checks are re-applied on first load.
      if (typeof window !== "undefined") {
        window.location.assign("/signin");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));
