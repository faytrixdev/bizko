const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_RE.test(username);
}

export const USERNAME_PATTERN = "[a-z0-9_]{3,30}";
