import { T } from "@/lib/constants";

export const metadata = { title: "For Contributors | Homio Ghana" };

export default function Page() {
  return (
    <div style={{ background: T.bg, minHeight: "70vh", padding: "64px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" }}>
          Homio
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 32, margin: "0 0 14px" }}>
          For Contributors
        </h1>
        <p style={{ color: T.gray2, fontSize: 15, lineHeight: 1.7 }}>
          Details on how to contribute to Homio are coming soon.
        </p>
      </div>
    </div>
  );
}