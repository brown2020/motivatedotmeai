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

function getFirebaseAuthErrorMessage(error: unknown): string {
  const code =
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : undefined;

  switch (code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was canceled before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.";
    case "auth/network-request-failed":
      return "The sign-in request could not reach Firebase. Check your connection and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists for this email with a different sign-in method.";
    case "auth/too-many-requests":
      return "Firebase temporarily blocked sign-in attempts. Please wait a bit and try again.";
    default:
      return "We couldn't sign you in with Google. Please try again.";
  }
}

async function getSessionErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown; code?: unknown };
    if (data.code === "SESSION_NOT_CONFIGURED") {
      return "Server sessions are not configured. Add the Firebase Admin service account key before signing in here.";
    }
    if (data.code === "DEV_SESSION_DISABLED") {
      return "Local session creation is disabled. Add the Firebase Admin key, or enable the local dev session bypass.";
    }
    if (typeof data.error === "string") return data.error;
  } catch {
    // Fall through to the generic message.
  }

  return "Google sign-in worked, but the app could not create a secure session. Please try again.";
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
  isSigningIn: boolean;
  hasInitialized: boolean;
  error: string | null;
  _unsubscribe: (() => void) | null;
  init: () => void;
  clearError: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isSigningIn: false,
  hasInitialized: false,
  error: null,
  _unsubscribe: null,

  clearError: () => set({ error: null }),

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
    if (get().isSigningIn) return false;

    const provider = new GoogleAuthProvider();
    set({ isSigningIn: true, error: null });

    try {
      // First, complete the Firebase popup auth
      const credential = await signInWithPopup(auth, provider);

      // Get a fresh token
      const idToken = await credential.user.getIdToken(true);
      if (!idToken) {
        await resetFailedSignIn();
        set({
          error:
            "Google sign-in finished, but Firebase did not return an identity token.",
        });
        return false;
      }

      // Create server-side session cookie
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const message = await getSessionErrorMessage(res);
        console.error("Failed to create session:", message);
        await resetFailedSignIn();
        set({ error: message });
        return false;
      }

      set({ error: null });
      return true;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      if (auth.currentUser) {
        await resetFailedSignIn();
      }
      set({ error: getFirebaseAuthErrorMessage(error) });
      return false;
    } finally {
      set({ isSigningIn: false });
    }
  },

  signOut: async () => {
    try {
      set({ error: null });
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
      set({ error: "We couldn't sign you out completely. Please try again." });
    }
  },
}));
