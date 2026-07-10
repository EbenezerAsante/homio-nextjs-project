import { T } from "@/lib/constants";
import { Newspaper } from "lucide-react";

export const metadata = { title: "Blog | Homio Ghana" };

export default function BlogPage() {
  return (
    <div style={{ background: T.bg, minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EFF4FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Newspaper size={24} color={T.navy} strokeWidth={2.2} />
        </div>
        <p style={{ color: T.gold, fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 10px" }}>
          Blog
        </p>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 26, margin: "0 0 12px" }}>
          Our first posts are on the way
        </h1>
        <p style={{ color: T.gray2, fontSize: 14.5, lineHeight: 1.7 }}>
          We're putting together guides on renting, buying, and navigating property in Ghana. Check back soon.
        </p>
      </div>
    </div>
  );
}