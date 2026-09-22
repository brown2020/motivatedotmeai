export type AuthErrorContext = "signin" | "signup" | "reset" | "google";

export function mapAuthError(error: unknown, context: AuthErrorContext): string {
  const code =
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : undefined;

  if (code) {
    // Expected auth failures: warn with code only — never console.error(Error).
    console.warn(`[auth] ${context}: ${code}`);
  }

  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return context === "signin"
        ? "Invalid email or password."
        : "We couldn't complete that request. Check your details and try again.";
    case "auth/email-already-in-use":
      return "An account already exists for that email. Sign in instead.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a bit and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was canceled before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists for this email with a different sign-in method.";
    case "auth/missing-email":
      return "Enter your email address.";
    default:
      if (context === "reset") {
        return "If an account uses that email, a password reset link will arrive shortly.";
      }
      if (context === "google") {
        return "We couldn't sign you in with Google. Please try again.";
      }
      if (context === "signup") {
        return "We couldn't create your account. Please try again.";
      }
      return "We couldn't sign you in. Please try again.";
  }
}

/**
 * Normalize loopback hosts so Firebase email-action continue URLs match
 * authorized domains (localhost, not 127.0.0.1).
 */
export function getAuthorizedOrigin(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const { protocol, hostname, port } = window.location;
  const host = hostname === "127.0.0.1" ? "localhost" : hostname;
  const portPart = port ? `:${port}` : "";
  return `${protocol}//${host}${portPart}`;
}
