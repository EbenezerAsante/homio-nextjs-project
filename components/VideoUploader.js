"use client";

import { useRef, useState } from "react";
import { uploadListingVideo, setListingVideoLink, removeListingVideo } from "@/lib/admin-queries";
import { T } from "@/lib/constants";
import { Video, Link as LinkIcon, X } from "lucide-react";

const MAX_DURATION_SECONDS = 180; // 3 minutes

export default function VideoUploader({ agentId, listingId, videoUrl, onChange }) {
  const [mode, setMode] = useState("upload"); // upload | link
  const [uploading, setUploading] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  function getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const videoEl = document.createElement("video");
      videoEl.preload = "metadata";
      videoEl.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(videoEl.duration);
      };
      videoEl.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read video file"));
      };
      videoEl.src = url;
    });
  }

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const duration = await getVideoDuration(file);
      if (duration > MAX_DURATION_SECONDS) {
        setUploading(false);
        setError(`Video is ${Math.ceil(duration / 60)} min long. Please keep it under 3 minutes.`);
        return;
      }
      const url = await uploadListingVideo(agentId, listingId, file);
      onChange(url);
    } catch (e) {
      setError(e.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveLink() {
    if (!linkInput.trim()) return;
    try {
      new URL(linkInput.trim());
    } catch {
      setError("Please enter a valid URL.");
      return;
    }
    setError(null);
    await setListingVideoLink(listingId, linkInput.trim());
    onChange(linkInput.trim());
    setLinkInput("");
  }

  async function handleRemove() {
    await removeListingVideo(listingId);
    onChange(null);
  }

  return (
    <div className="field">
      <label>Video Tour <span className="text-muted">— optional, max 3 minutes</span></label>

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
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setMode("upload")}
              style={{ border: `1.5px solid ${mode === "upload" ? T.navy : T.border}`, background: mode === "upload" ? T.navy : "#fff", color: mode === "upload" ? "#fff" : T.gray1, borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              <Video size={13} /> Upload Video
            </button>
            <button
              type="button"
              onClick={() => setMode("link")}
              style={{ border: `1.5px solid ${mode === "link" ? T.navy : T.border}`, background: mode === "link" ? T.navy : "#fff", color: mode === "link" ? "#fff" : T.gray1, borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
            >
              <LinkIcon size={13} /> Paste Link
            </button>
          </div>

          {mode === "upload" ? (
            <label className="photo-dropzone" style={{ display: "flex" }}>
              {uploading ? (
                <div className="spinner" />
              ) : (
                <>
                  <span style={{ fontSize: 20 }}>+</span>
                  <span>Add a video (max 3 min)</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>
          ) : (
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
                style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 8, padding: "0 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Save
              </button>
            </div>
          )}
        </>
      )}

      {error && <div style={{ color: T.red, fontSize: 12.5, marginTop: 8 }}>{error}</div>}
    </div>
  );
}