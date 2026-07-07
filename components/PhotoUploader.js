"use client";

import { useRef, useState } from "react";
import { uploadListingPhotos, deleteListingPhoto } from "@/lib/admin-queries";

// images: array of public URLs, first = cover photo
export default function PhotoUploader({ agentId, listingId, images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragIndex = useRef(null);
  const fileInputRef = useRef(null);

  async function convertIfHeic(file) {
    const isHeic = /\.(heic|heif)$/i.test(file.name) || file.type === "image/heic" || file.type === "image/heif";
    if (!isHeic) return file;

    const heic2any = (await import("heic2any")).default;
    const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([convertedBlob], newName, { type: "image/jpeg" });
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name)
    );
    if (!files.length) return;
    setUploading(true);
    try {
      const converted = await Promise.all(files.map(convertIfHeic));
      const urls = await uploadListingPhotos(agentId, listingId, converted);
      onChange([...images, ...urls]);
    } catch (err) {
      console.error(err);
      alert("Some photos failed to upload. Check your listing-images storage bucket is set to public.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(index) {
    const url = images[index];
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    deleteListingPhoto(url).catch(() => {});
  }

  function handleDragStart(index) {
    dragIndex.current = index;
  }

  function handleDrop(index) {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onChange(next);
    dragIndex.current = null;
  }

  return (
    <div className="field">
      <label>Photos {images.length > 0 && <span className="text-muted">— drag to reorder, first is the cover photo</span>}</label>
      <div className="photo-grid">
        {images.map((url, i) => (
          <div
            key={url + i}
            className={`photo-tile ${i === 0 ? "cover" : ""}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
          >
            <img src={url} alt={`Listing photo ${i + 1}`} />
            <button type="button" className="photo-remove" onClick={() => handleRemove(i)} aria-label="Remove photo">
              ×
            </button>
          </div>
        ))}
      </div>

      <label
        className={`photo-dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <div className="spinner" />
        ) : (
          <>
            <span style={{ fontSize: 20 }}>+</span>
            <span>Add photos</span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
    </div>
  );
}
