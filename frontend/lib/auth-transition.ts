/** Session flag so the dashboard can play a short enter after auth navigate. */
export const AUTH_ENTER_KEY = "nocta-auth-enter";

/** Login exit duration before `router.push` — long enough to read the handoff. */
export const AUTH_EXIT_MS = 520;

export const authEaseOut = [0.22, 1, 0.36, 1] as const;

export function markAuthEnter(): void {
  try {
    sessionStorage.setItem(AUTH_ENTER_KEY, "1");
  } catch {
    // private mode / blocked storage — enter animation simply skips
  }
}

export function consumeAuthEnter(): boolean {
  try {
    const value = sessionStorage.getItem(AUTH_ENTER_KEY);
    if (value) sessionStorage.removeItem(AUTH_ENTER_KEY);
    return value === "1";
  } catch {
    return false;
  }
}
