"use client";

import { useState } from "react";
import { setListingVideoLink, removeListingVideo } from "@/lib/admin-queries";
import { T } from "@/lib/constants";
import { Video, X } from "lucide-react";

export default function VideoUploader({ listingId, videoUrl, onChange }) {
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveLink() {
    if (!linkInput.trim()) return;
    try {
      new URL(linkInput.trim());
    } catch {
      setError("Please enter a valid URL.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await setListingVideoLink(listingId, linkInput.trim());
      onChange(linkInput.trim());
      setLinkInput("");
    } catch (e) {
      setError(e.message || "Failed to save video link");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    await removeListingVideo(listingId);
    onChange(null);
  }

  return (
    <div className="field">
      <label>Video Tour <span className="text-muted">— optional</span></label>

      {videoUrl ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
          <Video size={16} color={T.navy} />
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: T.navy, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {videoUrl}
          </a>
          <button type="button" onClick={handleRemove} style={{ background: "none", border: "none", cursor: "pointer", color: T.red }} aria-label="Remove video">
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="https://youtube.com/watch?v=..."
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              style={{ flex: 1, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontSize: 13 }}
            />
            <button
              type="button"
              onClick={handleSaveLink}
              disabled={saving}
              style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", fontWeight: 700, fontSize: 13, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
          <p style={{ fontSize: 12, color: T.gray2, marginTop: 8, marginBottom: 0 }}>
            Upload your video to YouTube (unlisted works fine) or Vimeo, then paste the link here.
          </p>
        </>
      )}

      {error && <div style={{ color: T.red, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
    </div>
  );
}