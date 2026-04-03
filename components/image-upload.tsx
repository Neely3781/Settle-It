"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}

export function ImageUpload({ images, onChange, max = 4 }: ImageUploadProps) {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const remainingSlots = max - images.length;
      const toProcess = files.slice(0, remainingSlots);

      const newImages: string[] = [];
      for (const file of toProcess) {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }

      onChange([...images, ...newImages]);
      e.target.value = "";
    },
    [images, onChange, max]
  );

  const removeImage = (idx: number) => {
    const next = [...images];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border/40 bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Screenshot ${idx + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              onClick={() => removeImage(idx)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < max && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 transition hover:border-primary/40 hover:bg-muted/50">
            <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
