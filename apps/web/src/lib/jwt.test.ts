import { describe, expect, it } from "vitest";
import { decodeJwt, keyKind, verifyJwt } from "./jwt";

function base64Url(bytes: ArrayBuffer | Uint8Array): string {
  return Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)).toString("base64url");
}

// Signed at runtime rather than committed, so secret scanners don't flag a fixture
const HS256_SECRET = "your-256-bit-secret";
const HS256_TOKEN = await signHs256({ sub: "1234567890", name: "John Doe", iat: 1516239022 }, HS256_SECRET);

async function signHs256(payload: object, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const head = base64Url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${base64Url(sig)}`;
}

async function signRs256(payload: object) {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  const head = base64Url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const body = base64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(`${head}.${body}`));
  const spki = Buffer.from(await crypto.subtle.exportKey("spki", publicKey)).toString("base64");
  const pem = `-----BEGIN PUBLIC KEY-----\n${spki.match(/.{1,64}/g)!.join("\n")}\n-----END PUBLIC KEY-----`;
  const jwk = JSON.stringify(await crypto.subtle.exportKey("jwk", publicKey));
  return { token: `${head}.${body}.${base64Url(sig)}`, pem, jwk };
}

describe("decodeJwt", () => {
  it("decodes the header and payload", () => {
    const { header, payload } = decodeJwt(HS256_TOKEN);
    expect(header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(payload).toMatchObject({ sub: "1234567890", name: "John Doe" });
  });

  it("rejects a token without three parts", () => {
    expect(() => decodeJwt("abc.def")).toThrow("three parts");
  });

  it("rejects a segment that isn't JSON", () => {
    expect(() => decodeJwt("bm90IGpzb24.e30.sig")).toThrow("header");
  });
});

describe("verifyJwt", () => {
  it("verifies HS256 with the right secret", async () => {
    await expect(verifyJwt(HS256_TOKEN, HS256_SECRET)).resolves.toBe(true);
  });

  it("fails HS256 with the wrong secret", async () => {
    await expect(verifyJwt(HS256_TOKEN, "wrong")).resolves.toBe(false);
  });

  it("verifies RS256 with a PEM or JWK public key", async () => {
    const { token, pem, jwk } = await signRs256({ sub: "sarah" });
    await expect(verifyJwt(token, pem)).resolves.toBe(true);
    await expect(verifyJwt(token, jwk)).resolves.toBe(true);
  });

  it("fails RS256 when the payload was tampered with", async () => {
    const { token, pem } = await signRs256({ admin: false });
    const [head, , sig] = token.split(".");
    const forged = base64Url(new TextEncoder().encode(JSON.stringify({ admin: true })));
    await expect(verifyJwt(`${head}.${forged}.${sig}`, pem)).resolves.toBe(false);
  });

  it("refuses alg: none", async () => {
    const none = `${base64Url(new TextEncoder().encode('{"alg":"none"}'))}.e30.`;
    await expect(verifyJwt(none, "")).rejects.toThrow("Unsupported algorithm");
  });
});

describe("keyKind", () => {
  it("maps algorithms to the key they need", () => {
    expect(keyKind("HS512")).toBe("secret");
    expect(keyKind("ES256")).toBe("public-key");
    expect(keyKind("none")).toBeNull();
  });
});
