import { create } from "zustand";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAuthorizedOrigin, mapAuthError } from "@/lib/auth-errors";
import { sendWithContinueUrlFallback, readAuthErrorCode } from "@/lib/verification-email";
import {
  VERIFICATION_RESEND_COOLDOWN_MS,
  remainingVerificationCooldownMs,
  verificationCooldownMessage,
} from "@/lib/verification-cooldown";

function emailActionContinueUrl(): string | undefined {
  const origin = getAuthorizedOrigin();
  return origin ? `${origin}/signin` : undefined;
}

async function sendCurrentUserVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw Object.assign(new Error("No signed-in user to verify"), {
      code: "auth/null-user",
    });
  }
  await sendWithContinueUrlFallback(emailActionContinueUrl(), (settings) =>
    sendEmailVerification(user, settings)
  );
}

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
    if (data.code === "EMAIL_NOT_VERIFIED") {
      return "Verify your email before signing in. Check your inbox for the verification link.";
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
  resendVerificationEmail: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  verificationCooldownUntil: number | null;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const cooldownRemaining = () =>
    remainingVerificationCooldownMs(get().verificationCooldownUntil, Date.now());

  const noteVerificationSent = () => {
    set({ verificationCooldownUntil: Date.now() + VERIFICATION_RESEND_COOLDOWN_MS });
  };

  const sendVerificationOrCooldown = async (): Promise<"sent" | "cooldown"> => {
    if (cooldownRemaining() > 0) return "cooldown";
    try {
      await sendCurrentUserVerificationEmail();
    } catch (error) {
      if (readAuthErrorCode(error) === "auth/too-many-requests") {
        noteVerificationSent();
      }
      throw error;
    }
    noteVerificationSent();
    return "sent";
  };

  return {
  user: null,
  isLoading: true,
  isSigningIn: false,
  hasInitialized: false,
  error: null,
  info: null,
  verificationCooldownUntil: null,
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
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        const remaining = cooldownRemaining();
        if (remaining > 0) {
          await resetFailedSignIn();
          set({
            error: "Verify your email before signing in. Check the link we just sent.",
            info: verificationCooldownMessage(remaining),
          });
          return false;
        }
        try {
          const delivery = await sendVerificationOrCooldown();
          await resetFailedSignIn();
          if (delivery === "cooldown") {
            set({
              error: "Verify your email before signing in. Check the link we just sent.",
              info: verificationCooldownMessage(cooldownRemaining()),
            });
            return false;
          }
        } catch (error) {
          await resetFailedSignIn();
          if (readAuthErrorCode(error) === "auth/too-many-requests") {
            set({
              error: null,
              info: verificationCooldownMessage(cooldownRemaining()),
            });
            return false;
          }
          set({ error: mapAuthError(error, "verify") });
          return false;
        }
        set({
          error:
            "Verify your email before signing in. A verification link is on its way. If it does not arrive, use Resend verification email.",
        });
        return false;
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
      try {
        await sendCurrentUserVerificationEmail();
        noteVerificationSent();
        await resetFailedSignIn();
      } catch (error) {
        await resetFailedSignIn();
        if (readAuthErrorCode(error) === "auth/too-many-requests") {
          noteVerificationSent();
          set({
            info: `Account created. ${verificationCooldownMessage(cooldownRemaining())}`,
            error: null,
          });
          return false;
        }
        set({
          error: `Your account was created, but the verification email was not sent. ${mapAuthError(error, "verify")} Use Resend verification email below.`,
          info: null,
        });
        return false;
      }
      set({
        info: "Account created. Check your email to verify it, then sign in. You can resend the link in a minute.",
        error: null,
      });
      return false;
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
      await sendWithContinueUrlFallback(emailActionContinueUrl(), (settings) =>
        sendPasswordResetEmail(auth, email.trim(), settings)
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

  resendVerificationEmail: async (email, password) => {
    if (get().isSigningIn) return false;
    const trimmed = email.trim();
    if (!trimmed || !password) {
      set({
        error: "Enter your email and password to resend the verification link.",
        info: null,
      });
      return false;
    }

    const remaining = cooldownRemaining();
    if (remaining > 0) {
      set({
        info: verificationCooldownMessage(remaining),
        error: null,
      });
      return false;
    }

    set({ isSigningIn: true, error: null, info: null });

    try {
      const sameUser =
        auth.currentUser?.email?.toLowerCase() === trimmed.toLowerCase();
      if (!sameUser) {
        await signInWithEmailAndPassword(auth, trimmed, password);
      }
      const user = auth.currentUser;
      if (!user) {
        set({
          error: "Sign-in finished, but Firebase did not return a user.",
        });
        return false;
      }

      await user.reload();
      if (user.emailVerified) {
        const session = await createServerSession();
        if (!session.ok) {
          set({ error: session.message });
          return false;
        }
        set({ error: null, info: null });
        return true;
      }

      const delivery = await sendVerificationOrCooldown();
      await resetFailedSignIn();
      if (delivery === "cooldown") {
        set({
          info: verificationCooldownMessage(cooldownRemaining()),
          error: null,
        });
        return false;
      }
      set({
        info: "Verification email sent. Check your inbox and spam folder, then sign in.",
        error: null,
      });
      return false;
    } catch (error) {
      if (auth.currentUser) {
        await resetFailedSignIn();
      }
      if (readAuthErrorCode(error) === "auth/too-many-requests") {
        set({
          info: verificationCooldownMessage(cooldownRemaining()),
          error: null,
        });
        return false;
      }
      set({ error: mapAuthError(error, "verify") });
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
};
});
