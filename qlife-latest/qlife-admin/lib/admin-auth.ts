// Admin auth. Separate from end-user auth (WorkOS) — the backend exposes a
// single hardcoded admin login (POST /v1/admin/login) that returns a signed
// HS256 session token stored in localStorage.

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5012";

const TOKEN_KEY = "qlife.admin.idToken";

/**
 * Sign in against the backend admin login endpoint and return the session
 * token. Throws with the backend's message on bad credentials.
 */
export async function adminSignIn(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    cache: "no-store",
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body && (body.message || body.error)) || "Sign in failed";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  const token = body?.data?.token;
  if (!token) throw new Error("Sign in failed");
  return token as string;
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export function signOut() {
  clearToken();
}

/** Decode the admin email out of the stored HS256 session token (claims only). */
export function getAdminEmail(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return typeof json.email === "string" ? json.email : null;
  } catch {
    return null;
  }
}
