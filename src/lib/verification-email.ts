export const UNAUTHORIZED_CONTINUE_URI = "auth/unauthorized-continue-uri";

export type EmailContinueSettings = { url: string } | undefined;

export function readAuthErrorCode(error: unknown): string | undefined {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}

/**
 * Firebase rejects actionCodeSettings when the continue URL host is not in
 * the Auth authorized-domain list. Vercel preview hosts fail this way, and
 * the email is not sent. Retry once with no continue URL so delivery uses
 * the project's default email-action handler.
 */
export async function sendWithContinueUrlFallback(
  continueUrl: string | undefined,
  send: (settings: EmailContinueSettings) => Promise<void>
): Promise<void> {
  if (!continueUrl) {
    await send(undefined);
    return;
  }

  try {
    await send({ url: continueUrl });
  } catch (error) {
    if (readAuthErrorCode(error) !== UNAUTHORIZED_CONTINUE_URI) {
      throw error;
    }
    console.warn(
      "[auth] continue URL is not an authorized domain; retrying without it"
    );
    await send(undefined);
  }
}
