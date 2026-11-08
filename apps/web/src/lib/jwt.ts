// Decoding and signature verification run entirely in the browser (Web Crypto).

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  parts: [string, string, string];
}

function base64UrlToBytes(segment: string): Uint8Array<ArrayBuffer> {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function decodeSegment(segment: string, name: string): Record<string, unknown> {
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
    if (typeof json !== "object" || json === null || Array.isArray(json)) throw new Error();
    return json;
  } catch {
    throw new Error(`The ${name} is not valid base64url-encoded JSON.`);
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("A JWT has three parts separated by dots.");
  const [header, payload, signature] = parts;
  return {
    header: decodeSegment(header, "header"),
    payload: decodeSegment(payload, "payload"),
    parts: [header, payload, signature],
  };
}

type Verifier =
  | { kind: "hmac"; hash: string }
  | { kind: "public"; importParams: RsaHashedImportParams | EcKeyImportParams; verifyParams: AlgorithmIdentifier | RsaPssParams | EcdsaParams };

function verifierFor(alg: unknown): Verifier | null {
  if (typeof alg !== "string") return null;
  const bits = alg.slice(2);
  if (!["256", "384", "512"].includes(bits)) return null;
  const hash = `SHA-${bits}`;

  switch (alg.slice(0, 2)) {
    case "HS":
      return { kind: "hmac", hash };
    case "RS":
      return {
        kind: "public",
        importParams: { name: "RSASSA-PKCS1-v1_5", hash },
        verifyParams: "RSASSA-PKCS1-v1_5",
      };
    case "PS":
      return {
        kind: "public",
        importParams: { name: "RSA-PSS", hash },
        verifyParams: { name: "RSA-PSS", saltLength: Number(bits) / 8 },
      };
    case "ES": {
      const namedCurve = { "256": "P-256", "384": "P-384", "512": "P-521" }[bits]!;
      return {
        kind: "public",
        importParams: { name: "ECDSA", namedCurve },
        verifyParams: { name: "ECDSA", hash },
      };
    }
    default:
      return null;
  }
}

/** Whether the algorithm takes a shared secret (HS*) or a public key (RS*, PS*, ES*). */
export function keyKind(alg: unknown): "secret" | "public-key" | null {
  const verifier = verifierFor(alg);
  if (!verifier) return null;
  return verifier.kind === "hmac" ? "secret" : "public-key";
}

async function importPublicKey(key: string, params: RsaHashedImportParams | EcKeyImportParams): Promise<CryptoKey> {
  const trimmed = key.trim();
  if (trimmed.startsWith("{")) {
    return crypto.subtle.importKey("jwk", JSON.parse(trimmed), params, false, ["verify"]);
  }
  const body = trimmed
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("spki", der, params, false, ["verify"]);
}

/**
 * Checks the signature with a secret (HS*) or a public key as PEM or JWK (RS*, PS*, ES*).
 * Throws when the algorithm is unsupported or the key can't be read.
 */
export async function verifyJwt(token: string, key: string): Promise<boolean> {
  const { header, parts } = decodeJwt(token);
  const verifier = verifierFor(header.alg);
  if (!verifier) throw new Error(`Unsupported algorithm: ${String(header.alg)}`);

  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = base64UrlToBytes(parts[2]);

  if (verifier.kind === "hmac") {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "HMAC", hash: verifier.hash },
      false,
      ["verify"],
    );
    return crypto.subtle.verify("HMAC", cryptoKey, signature, data);
  }

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await importPublicKey(key, verifier.importParams);
  } catch {
    throw new Error("Couldn’t read the public key. Paste it as PEM (BEGIN PUBLIC KEY) or JWK.");
  }
  return crypto.subtle.verify(verifier.verifyParams, cryptoKey, signature, data);
}

export const REGISTERED_CLAIMS: Record<string, string> = {
  iss: "Issuer",
  sub: "Subject",
  aud: "Audience",
  exp: "Expires at",
  nbf: "Not valid before",
  iat: "Issued at",
  jti: "JWT ID",
};

export const TIME_CLAIMS = new Set(["exp", "nbf", "iat"]);
