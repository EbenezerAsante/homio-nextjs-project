"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { T } from "@/lib/constants";

export default function ShareProfileButton({ name }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name || "This lister"} on Homio`, url });
      } catch {
        // user cancelled the share sheet — no action needed
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        border: `1.5px solid ${T.border}`, background: "#fff", color: T.gray1,
        borderRadius: 8, padding: "9px 10px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
      }}
    >
      {copied ? <Check size={14} color={T.green} /> : <Share2 size={14} />}
      {copied ? "Copied!" : "Share"}
    </button>
  );
}