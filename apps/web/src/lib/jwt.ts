export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeSegment(segment: string, name: string): Record<string, unknown> {
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error(`The ${name} is not valid base64url-encoded JSON.`);
  }
}

// Decodes without verifying the signature. Runs entirely in the browser.
export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT has three parts separated by dots.");
  const [header, payload, signature] = parts;
  return {
    header: decodeSegment(header, "header"),
    payload: decodeSegment(payload, "payload"),
    signature,
  };
}
