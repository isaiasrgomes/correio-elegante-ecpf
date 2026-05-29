"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!ACCEPTED.includes(file.type)) {
        setError("Use JPG, PNG ou WebP.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Imagem deve ter no máximo 5MB.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
        onChange(data.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao enviar imagem.");
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-rose-200/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Preview polaroid" className="max-h-64 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-700 shadow-md transition hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <motion.label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 transition-all",
          dragging
            ? "border-rose-400 bg-rose-50/80"
            : "border-rose-200/80 bg-white/50 hover:border-rose-300 hover:bg-rose-50/50"
        )}
      >
        <input
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <ImagePlus className="h-7 w-7" />
        </span>
        <p className="text-sm font-medium text-[#2a1a1f]">
          {uploading ? "Enviando..." : "Arraste sua foto ou clique para selecionar"}
        </p>
        <p className="mt-1 text-xs text-muted">JPG, PNG ou WebP · até 5MB</p>
      </motion.label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
