/** Session cookies are issued only after Firebase says the email is verified. */
export function hasVerifiedEmail(claims: { email_verified?: unknown }): boolean {
  return claims.email_verified === true;
}
