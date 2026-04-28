import { randomBytes } from "crypto";

const TOKEN_LENGTH = 32;
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

const tokenStore = new Map<string, number>();

export function generateCsrfToken(): string {
  const token = randomBytes(TOKEN_LENGTH).toString("hex");
  tokenStore.set(token, Date.now() + TOKEN_EXPIRY);

  // Clean expired tokens
  const now = Date.now();
  for (const [t, expires] of tokenStore) {
    if (expires < now) tokenStore.delete(t);
  }

  return token;
}

export function validateCsrfToken(token: string | null): boolean {
  if (!token) return false;
  const expires = tokenStore.get(token);
  if (!expires || expires < Date.now()) {
    tokenStore.delete(token);
    return false;
  }
  tokenStore.delete(token); // One-time use
  return true;
}
