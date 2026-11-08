import type { Metadata } from "next";
import { JwtWindow } from "@/components/jwt-window";

export const metadata: Metadata = {
  title: "JWT Decoder · Sarah Adewale",
};

export default function JwtPage() {
  return (
    <main className="page" style={{ gridTemplateColumns: "minmax(0, 720px)", justifyContent: "center", paddingTop: 48 }}>
      <JwtWindow />
    </main>
  );
}
