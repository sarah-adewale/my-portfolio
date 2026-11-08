"use client";

import { useEffect, useState } from "react";
import { decodeJwt, keyKind, REGISTERED_CLAIMS, TIME_CLAIMS, verifyJwt, type DecodedJwt } from "@/lib/jwt";
import { CheckIcon, CopyIcon, TrashIcon } from "./icons";
import { Window } from "./window";

type Verification = { state: "none" } | { state: "checking" } | { state: "done"; valid: boolean } | { state: "error"; message: string };

function tryDecode(token: string): { decoded: DecodedJwt } | { error: string } | null {
  if (!token.trim()) return null;
  try {
    return { decoded: decodeJwt(token) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

function ColouredToken({ token }: { token: string }) {
  const parts = token.split(".");
  if (parts.length !== 3) return <>{token}</>;
  return (
    <>
      <span className="seg-0">{parts[0]}</span>.<span className="seg-1">{parts[1]}</span>.<span className="seg-2">{parts[2]}</span>
    </>
  );
}

function formatClaim(name: string, value: unknown) {
  if (TIME_CLAIMS.has(name) && typeof value === "number") {
    const date = new Date(value * 1000);
    const expired = name === "exp" && date.getTime() < Date.now();
    return `${value} (${date.toLocaleString()})${expired ? " · expired" : ""}`;
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}

function Status({ result, verification, needsKey }: { result: ReturnType<typeof tryDecode>; verification: Verification; needsKey: boolean }) {
  if (!result) return <p className="jwt__status">Waiting…</p>;
  if ("error" in result) return <p className="jwt__status jwt__status--error">✗ Invalid JWT · {result.error}</p>;
  if (!needsKey) return <p className="jwt__status jwt__status--warn">✓ Valid JWT · Unsupported algorithm, signature not checked</p>;

  switch (verification.state) {
    case "done":
      return verification.valid ? (
        <p className="jwt__status jwt__status--ok">✓ Valid JWT · Signature verified</p>
      ) : (
        <p className="jwt__status jwt__status--error">✓ Valid JWT · ✗ Invalid signature</p>
      );
    case "error":
      return <p className="jwt__status jwt__status--error">✓ Valid JWT · {verification.message}</p>;
    case "checking":
      return <p className="jwt__status">✓ Valid JWT · Checking signature…</p>;
    default:
      return <p className="jwt__status jwt__status--warn">✓ Valid JWT · Signature not verified</p>;
  }
}

export function JwtWindow({ className = "" }: { className?: string }) {
  const [tab, setTab] = useState<"encoded" | "decoded">("encoded");
  const [view, setView] = useState<"json" | "claims">("json");
  const [token, setToken] = useState("");
  const [key, setKey] = useState("");
  const [copied, setCopied] = useState(false);
  // The last finished check; anything else for the current token and key is still running
  const [checked, setChecked] = useState<{ token: string; key: string; result: Verification } | null>(null);

  const result = tryDecode(token);
  const decoded = result && "decoded" in result ? result.decoded : null;
  const kind = decoded ? keyKind(decoded.header.alg) : null;
  const canVerify = Boolean(decoded && kind && key.trim());

  let verification: Verification = { state: "none" };
  if (canVerify) {
    verification = checked?.token === token && checked.key === key ? checked.result : { state: "checking" };
  }

  useEffect(() => {
    if (!canVerify) return;
    let cancelled = false;
    verifyJwt(token, key)
      .then((valid) => !cancelled && setChecked({ token, key, result: { state: "done", valid } }))
      .catch((error: Error) => !cancelled && setChecked({ token, key, result: { state: "error", message: error.message } }));
    return () => {
      cancelled = true;
    };
  }, [canVerify, token, key]);

  // The tick turns back into the copy icon after a moment
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  function copyToken() {
    if (!token) return;
    navigator.clipboard?.writeText(token).then(() => setCopied(true));
  }

  return (
    <Window title="Try my JWT decoder" className={className}>
      <div>
        <div className="jwt__tabs" role="tablist">
          <button type="button" role="tab" className="jwt__tab" aria-selected={tab === "encoded"} onClick={() => setTab("encoded")}>
            Encoded Token
          </button>
          <button type="button" role="tab" className="jwt__tab" aria-selected={tab === "decoded"} onClick={() => setTab("decoded")}>
            Decoded Token
          </button>
        </div>

        <div className="jwt__panel" role="tabpanel">
          {tab === "encoded" ? (
            <>
              <div className="jwt__panel-head">
                <span className="term__prompt">&gt;_</span> JSON Web Token (JWT)
                <button
                  type="button"
                  className="jwt__icon-btn"
                  aria-label={copied ? "Token copied" : "Copy token"}
                  data-copied={copied || undefined}
                  onClick={copyToken}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
                <span className="sr-only" aria-live="polite">
                  {copied ? "Token copied" : ""}
                </span>
                <button type="button" className="jwt__icon-btn" aria-label="Clear token" onClick={() => setToken("")}>
                  <TrashIcon />
                </button>
              </div>
              <div className="jwt__editor">
                <pre aria-hidden>
                  <ColouredToken token={token} />
                  {/* keeps a trailing newline from collapsing the height */}{" "}
                </pre>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value.trim())}
                  spellCheck={false}
                  aria-label="JSON Web Token"
                  placeholder="Paste a JWT here that you'd like to decode, validate, and verify."
                />
              </div>
              <Status result={result} verification={verification} needsKey={kind !== null} />
              {kind === "secret" && (
                <input
                  className="jwt__key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Secret, to verify the signature"
                  aria-label="Secret"
                  spellCheck={false}
                />
              )}
              {kind === "public-key" && (
                <textarea
                  className="jwt__key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  rows={3}
                  placeholder="Public key (PEM or JWK), to verify the signature"
                  aria-label="Public key"
                  spellCheck={false}
                />
              )}
            </>
          ) : !decoded ? (
            <p className="jwt__status">Paste a valid token in the Encoded Token tab first.</p>
          ) : (
            <>
              <div className="jwt__views">
                <button type="button" className="jwt__view" aria-pressed={view === "json"} onClick={() => setView("json")}>
                  JSON
                </button>
                <button type="button" className="jwt__view" aria-pressed={view === "claims"} onClick={() => setView("claims")}>
                  Claims
                </button>
              </div>
              {view === "json" ? (
                <>
                  <p className="jwt__label seg-0">HEADER</p>
                  <pre className="jwt__json">{JSON.stringify(decoded.header, null, 2)}</pre>
                  <p className="jwt__label seg-1">PAYLOAD</p>
                  <pre className="jwt__json">{JSON.stringify(decoded.payload, null, 2)}</pre>
                </>
              ) : (
                <table className="jwt__claims">
                  <tbody>
                    {Object.entries(decoded.payload).map(([name, value]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>
                          {formatClaim(name, value)}
                          {REGISTERED_CLAIMS[name] && <div className="term__muted">{REGISTERED_CLAIMS[name]}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </Window>
  );
}
