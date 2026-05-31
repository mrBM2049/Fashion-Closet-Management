"use client";
import { useState, useRef, useCallback } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

export default function ImageUploader({ currentUrl, onUpload }: { currentUrl?: string | null; onUpload: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError(null); setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPreview(data.url); onUpload(data.url);
    } catch (e: any) { setError(e.message); } finally { setUploading(false); }
  }, [onUpload]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    upload(file);
  };

  return (
    <div className="space-y-1.5">
      <div onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        className={`relative w-full aspect-square rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-colors
          ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"}
          ${uploading ? "pointer-events-none" : ""}`}>
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {!uploading && (
              <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); onUpload(""); if (inputRef.current) inputRef.current.value = ""; }}
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground p-4">
            <ImagePlus className="w-8 h-8 opacity-40" />
            <p className="text-xs text-center leading-tight">Click or drag & drop<br /><span className="opacity-60">JPEG, PNG, WebP · max 5 MB</span></p>
          </div>
        )}
        {uploading && <div className="absolute inset-0 bg-background/70 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
