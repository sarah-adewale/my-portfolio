"use client";

import { useState } from "react";
import { decodeJwt, type DecodedJwt } from "@/lib/jwt";

function tryDecode(token: string): { decoded: DecodedJwt } | { error: string } | null {
  if (!token.trim()) return null;
  try {
    return { decoded: decodeJwt(token) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <h2 className="mb-2 font-semibold">{title}</h2>
      <pre className="overflow-auto rounded bg-black/5 p-3 text-sm dark:bg-white/10">{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}

export function JwtDecoder() {
  const [token, setToken] = useState("");
  const result = tryDecode(token);

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={5}
        spellCheck={false}
        placeholder="Paste a JWT"
        className="rounded border px-3 py-2 font-mono text-sm"
      />
      {result && "error" in result && <p className="text-red-600">{result.error}</p>}
      {result && "decoded" in result && (
        <div className="grid gap-4 md:grid-cols-2">
          <JsonPanel title="Header" value={result.decoded.header} />
          <JsonPanel title="Payload" value={result.decoded.payload} />
        </div>
      )}
    </div>
  );
}
