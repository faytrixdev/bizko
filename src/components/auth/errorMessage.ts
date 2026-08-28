const ERROR_KEYS: Record<string, string> = {
  identifiants_invalid: "auth2.errorInvalidCredentials",
  signup_failed: "auth2.errorSignupFailed",
  forgot_failed: "auth2.errorForgotFailed",
  fetch_failed: "auth2.errorFetchFailed",
  account_exists: "auth2.errorSignupFailed",
};

/**
 * Maps an error code/status returned by server actions to a localized,
 * user-friendly message. Unknown values fall back to a generic message so we
 * never leak internal details (e.g. raw Supabase error messages) to end users.
 */
export function authErrorText(t: (path: string) => string, raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const decoded = decodeURIComponent(raw);
  const key = ERROR_KEYS[decoded];
  if (key) return t(key);
  return t("auth2.errorFetchFailed");
}
