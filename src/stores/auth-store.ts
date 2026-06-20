import { create } from "zustand";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

async function clearServerSessionCookie() {
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
  });
}

async function resetFailedSignIn() {
  try {
    await clearServerSessionCookie();
  } catch (error) {
    console.error("Failed to clear session after sign-in failure:", error);
  }

  if (auth.currentUser) {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error(
        "Failed to reset Firebase auth after sign-in failure:",
        error
      );
    }
  }
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  hasInitialized: boolean;
  _unsubscribe: (() => void) | null;
  init: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  hasInitialized: false,
  _unsubscribe: null,

  init: () => {
    const state = get();
    if (state.hasInitialized) return;

    // Mark as initialized immediately to prevent double initialization
    set({ hasInitialized: true });

    // If we already have a subscription, don't create another
    if (state._unsubscribe) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
      // Keep server session cookies in sync with Firebase auth state.
      // If Firebase signs out (token revoked/expired, cleared storage, etc),
      // ensure we clear the httpOnly session cookies so `proxy.ts` blocks again.
      if (!user) {
        fetch("/api/auth/session", { method: "DELETE" }).catch((err) => {
          console.error("Failed to clear session on sign out:", err);
        });
      }
    });

    // Store the unsubscribe function in state
    set({ _unsubscribe: unsubscribe });
  },

  signInWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    try {
      // First, complete the Firebase popup auth
      const credential = await signInWithPopup(auth, provider);

      // Get a fresh token
      const idToken = await credential.user.getIdToken(true);
      if (!idToken) {
        await resetFailedSignIn();
        return false;
      }

      // Create server-side session cookie
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        console.error("Failed to create session:", await res.text());
        await resetFailedSignIn();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (auth.currentUser) {
        await resetFailedSignIn();
      }
      return false;
    }
  },

  signOut: async () => {
    try {
      // 1) Clear server-side session cookies (httpOnly)
      await clearServerSessionCookie();
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
