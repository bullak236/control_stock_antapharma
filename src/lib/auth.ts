export const SESSION_COOKIE_NAME = "antapharma_session";

export interface SessionPayload {
  userId: string;
  email: string;
  nombre: string;
  rol: "OWNER" | "ADMIN" | "AUDITOR";
  exp: number;
}

const SECRET_KEY =
  process.env.ERP_AUTH_SECRET || "antapharma-erp-edge-secret-2026-david";

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signPayloadEdge(payload: SessionPayload): Promise<string> {
  const encoder = new TextEncoder();
  const data = btoa(encodeURIComponent(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${toHex(sig)}`;
}

export async function verifyTokenEdge(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  try {
    const [data, sigHex] = token.split(".");
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSig = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(data)
    );
    if (toHex(expectedSig) !== sigHex) return null;
    const decoded = JSON.parse(
      decodeURIComponent(atob(data))
    ) as SessionPayload;
    if (decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}
