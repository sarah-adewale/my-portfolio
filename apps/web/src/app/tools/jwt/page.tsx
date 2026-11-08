import type { Metadata } from "next";
import { JwtDecoder } from "@/components/jwt-decoder";

export const metadata: Metadata = {
  title: "JWT Decoder · Sarah Adewale",
};

export default function JwtPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-semibold">JWT Decoder</h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">Decoding happens in your browser. Your token is never sent anywhere.</p>
      <JwtDecoder />
    </main>
  );
}
