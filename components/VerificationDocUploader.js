"use client";

import { useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { createClient } from "../lib/supabase-client";
import { T } from "../lib/constants";

const MAX_FILE_MB = 10;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export default function VerificationDocUploader({ userId, documents, onChange }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PDF, JPG, or PNG files are accepted.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_FILE_MB}MB.`);
      return;
    }

    setUploading(true);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("verification-documents")
      .upload(path, file);

    setUploading(false);

    if (uploadError) {
      setError(uploadError.message || "Upload failed. Try again.");
      return;
    }

    const newDoc = { path, name: file.name, uploaded_at: new Date().toISOString() };
    onChange([...(documents || []), newDoc]);
  };

  const removeDoc = async (doc) => {
    await supabase.storage.from("verification-documents").remove([doc.path]);
    onChange((documents || []).filter((d) => d.path !== doc.path));
  };

  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.gray1, marginBottom: 6 }}>
        Supporting Documents (ID, business registration, etc.)
      </label>
      <p style={{ fontSize: 12, color: T.gray3, margin: "0 0 10px" }}>
        PDF, JPG, or PNG — max {MAX_FILE_MB}MB per file. These are kept private and only visible to you and Homio admins.
      </p>

      {documents && documents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {documents.map((doc) => (
            <div
              key={doc.path}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: T.bg, borderRadius: 8, padding: "8px 12px", fontSize: 13,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <FileText size={15} color={T.navy} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(doc)}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.gray3, flexShrink: 0, padding: 4 }}
                aria-label="Remove document"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          border: `1.5px dashed ${T.border}`, borderRadius: 8, padding: "14px",
          fontSize: 13, fontWeight: 600, color: T.navy, cursor: uploading ? "default" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {uploading ? "Uploading…" : "Upload a document"}
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
      </label>

      {error && <p style={{ color: T.red, fontSize: 12.5, marginTop: 8 }}>{error}</p>}
    </div>
  );
}