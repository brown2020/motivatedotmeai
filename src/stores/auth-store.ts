import { create } from "zustand";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAuthorizedOrigin, mapAuthError } from "@/lib/auth-errors";

async function clearServerSessionCookie() {
  await fetch("/api/auth/session", {
    method: "DELETE",
    credentials: "include",
  });
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
    // Fall through.
  }
  return "Sign-in worked, but the app could not create a secure session. Please try again.";
}

async function resetFailedSignIn() {
  try {
    await clearServerSessionCookie();
  } catch {
    console.warn("[auth] failed to clear session after sign-in failure");
  }

  if (auth.currentUser) {
    try {
      await firebaseSignOut(auth);
    } catch {
      console.warn("[auth] failed to reset Firebase auth after sign-in failure");
    }
  }
}

async function createServerSession(): Promise<{ ok: true } | { ok: false; message: string }> {
  const idToken = await auth.currentUser?.getIdToken(true);
  if (!idToken) {
    await resetFailedSignIn();
    return {
      ok: false,
      message: "Sign-in finished, but Firebase did not return an identity token.",
    };
  }

  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const message = await getSessionErrorMessage(res);
    await resetFailedSignIn();
    return { ok: false, message };
  }

  return { ok: true };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSigningIn: boolean;
  hasInitialized: boolean;
  error: string | null;
  info: string | null;
  _unsubscribe: (() => void) | null;
  init: () => void;
  clearError: () => void;
  clearInfo: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isSigningIn: false,
  hasInitialized: false,
  error: null,
  info: null,
  _unsubscribe: null,

  clearError: () => set({ error: null }),
  clearInfo: () => set({ info: null }),

  init: () => {
    const state = get();
    if (state.hasInitialized) return;

    set({ hasInitialized: true });
    if (state._unsubscribe) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
      if (!user) {
        fetch("/api/auth/session", { method: "DELETE" }).catch(() => {
          console.warn("[auth] failed to clear session on sign out");
        });
      }
    });

    set({ _unsubscribe: unsubscribe });
  },

  signInWithGoogle: async () => {
    if (get().isSigningIn) return false;

    const provider = new GoogleAuthProvider();
    set({ isSigningIn: true, error: null, info: null });

    try {
      await signInWithPopup(auth, provider);
      const session = await createServerSession();
      if (!session.ok) {
        set({ error: session.message });
        return false;
      }
      set({ error: null });
      return true;
    } catch (error) {
      if (auth.currentUser) {
        await resetFailedSignIn();
      }
      set({ error: mapAuthError(error, "google") });
      return false;
    } finally {
      set({ isSigningIn: false });
    }
  },

  signInWithEmail: async (email, password) => {
    if (get().isSigningIn) return false;
    set({ isSigningIn: true, error: null, info: null });

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      const session = await createServerSession();
      if (!session.ok) {
        set({ error: session.message });
        return false;
      }
      set({ error: null });
      return true;
    } catch (error) {
      if (auth.currentUser) {
        await resetFailedSignIn();
      }
      set({ error: mapAuthError(error, "signin") });
      return false;
    } finally {
      set({ isSigningIn: false });
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    if (get().isSigningIn) return false;
    set({ isSigningIn: true, error: null, info: null });

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const name = displayName?.trim();
      if (name) {
        try {
          await updateProfile(credential.user, { displayName: name });
        } catch {
          console.warn("[auth] signup: could not set display name");
        }
      }
      const session = await createServerSession();
      if (!session.ok) {
        set({ error: session.message });
        return false;
      }
      set({ error: null });
      return true;
    } catch (error) {
      if (auth.currentUser) {
        await resetFailedSignIn();
      }
      set({ error: mapAuthError(error, "signup") });
      return false;
    } finally {
      set({ isSigningIn: false });
    }
  },

  sendPasswordReset: async (email) => {
    if (get().isSigningIn) return false;
    set({ isSigningIn: true, error: null, info: null });

    try {
      const origin = getAuthorizedOrigin();
      await sendPasswordResetEmail(
        auth,
        email.trim(),
        origin ? { url: `${origin}/signin` } : undefined
      );
      // Always show the same confirmation (no email enumeration).
      set({
        info: "If an account uses that email, a password reset link will arrive shortly.",
        error: null,
      });
      return true;
    } catch (error) {
      // Still show friendly confirmation for user-not-found; map others.
      const code =
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof (error as { code: unknown }).code === "string"
          ? (error as { code: string }).code
          : undefined;
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        if (code === "auth/invalid-email") {
          set({ error: mapAuthError(error, "reset") });
          return false;
        }
        set({
          info: "If an account uses that email, a password reset link will arrive shortly.",
          error: null,
        });
        return true;
      }
      set({ error: mapAuthError(error, "reset") });
      return false;
    } finally {
      set({ isSigningIn: false });
    }
  },

  signOut: async () => {
    try {
      set({ error: null, info: null });
      await clearServerSessionCookie();
      await firebaseSignOut(auth);
      if (typeof window !== "undefined") {
        window.location.assign("/signin");
      }
    } catch (error) {
      set({ error: mapAuthError(error, "signin") || "We couldn't sign you out completely. Please try again." });
    }
  },
}));
