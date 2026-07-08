"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { T } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return (
    <div style={{ background: T.bg, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 40, maxWidth: 480, width: "100%", textAlign: "center", boxShadow: T.shadow, border: `1px solid ${T.border}` }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.greenL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle2 size={26} color={T.green} />
        </div>
        <h1 style={{ color: T.navy, fontWeight: 900, fontSize: 20, margin: "0 0 8px" }}>You're set up as a Property Owner</h1>
        <p style={{ color: T.gray2, fontSize: 14, lineHeight: 1.6, margin: "0 0 24px" }}>
          The full owner dashboard — listing your property, managing enquiries, and scheduling viewings — is coming next.
          For now, you can head back to your dashboard.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}