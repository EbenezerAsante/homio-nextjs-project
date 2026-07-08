"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

export default function SaveSearchButton({ filters }) {
  const supabase = createClient();
  const router = useRouter();
  const [showInput, setShowInput] = useState(false);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const startSave = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      router.push("/login");
      return;
    }
    setShowInput(true);
  };

  const confirmSave = async () => {
    if (!label.trim()) return;
    setSaving(true);

    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("saved_searches").insert({
      user_id: data.user.id,
      label: label.trim(),
      filters,
    });

    setSaving(false);
    if (error) {
      setMessage("Couldn't save search. Try again.");
      return;
    }
    setMessage("Search saved!");
    setShowInput(false);
    setLabel("");
    setTimeout(() => setMessage(null), 3000);
  };

  if (showInput) {
    return (
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. 4-bed houses in Kumasi"
          style={{
            flex: 1,
            border: `1.5px solid ${T.border}`,
            borderRadius: 6,
            padding: "7px 10px",
            fontSize: 13,
          }}
        />
        <button
          onClick={confirmSave}
          disabled={saving}
          style={{
            background: T.navy,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {saving ? "…" : "Save"}
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={startSave}
        style={{
          width: "100%",
          background: "none",
          border: `1.5px solid ${T.navy}`,
          color: T.navy,
          borderRadius: 8,
          padding: "9px 0",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        🔔 Save This Search
      </button>
      {message && <p style={{ fontSize: 12, color: T.green, marginTop: 6, textAlign: "center" }}>{message}</p>}
    </div>
  );
}