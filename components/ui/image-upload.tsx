/* eslint-disable @next/next/no-img-element */
// <img> is intentional — this component displays local blob: object URLs that
// can't pass through next/image's optimizer.
"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---- helpers ---------------------------------------------------------------

function formatSize(bytes: number): string {
  return bytes < 1_048_576
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ---- component -------------------------------------------------------------

/**
 * Image picker that returns a local object URL for immediate preview.
 *
 * MOCK behaviour: onChange gives the object URL — it is NOT persisted to a
 * server. The URL is valid only for this browser session and is revoked when
 * the user picks a different image or the component unmounts. Callers should
 * treat the URL as an opaque string; real upload wiring comes later.
 */
export function ImageUpload({
  value,
  onChange,
  shape = "square",
  size = 96,
  label,
  maxSizeMB = 5,
  className,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  shape?: "circle" | "square";
  size?: number;
  label?: string;
  maxSizeMB?: number;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Track the most recent object URL we created so we can revoke it.
  const ownUrl = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Revoke on unmount — prevents memory leaks.
  useEffect(() => {
    return () => {
      if (ownUrl.current) {
        URL.revokeObjectURL(ownUrl.current);
        ownUrl.current = null;
      }
    };
  }, []);

  const processFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Only image files are accepted.");
      return;
    }
    if (file.size > maxSizeMB * 1_048_576) {
      setError(`File too large — max ${maxSizeMB} MB (this is ${formatSize(file.size)}).`);
      return;
    }
    // Revoke the previous object URL we created before making a new one.
    if (ownUrl.current) {
      URL.revokeObjectURL(ownUrl.current);
    }
    const url = URL.createObjectURL(file);
    ownUrl.current = url;
    onChange(url);
  };

  const handleRemove = () => {
    if (ownUrl.current) {
      URL.revokeObjectURL(ownUrl.current);
      ownUrl.current = null;
    }
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
  };

  const borderRadius = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-label text-fg-secondary">{label}</span>
      )}

      <div className="flex items-end gap-3">
        {/* Drop zone / preview */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
          }}
          className={cn(
            "group relative shrink-0 overflow-hidden border-2 transition-colors",
            borderRadius,
            isDragOver
              ? "border-brand bg-brand/5"
              : "border-dashed border-border bg-surface-subtle hover:bg-surface-muted",
          )}
          style={{ width: size, height: size }}
          aria-label={value ? "Change image" : "Upload image"}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                className={cn("h-full w-full object-cover", borderRadius)}
              />
              {/* hover overlay */}
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100",
                  borderRadius,
                )}
              >
                <Camera className="size-5 text-white" />
              </span>
            </>
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-1">
              {shape === "circle" ? (
                <Camera className="size-5 text-fg-placeholder" />
              ) : (
                <Upload className="size-5 text-fg-placeholder" />
              )}
              <span className="text-[10px] leading-none text-fg-placeholder">
                Upload
              </span>
            </span>
          )}
        </button>

        {/* Remove action */}
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1 text-xs text-fg-muted transition-colors hover:text-danger"
          >
            <X className="size-3.5" />
            Remove
          </button>
        )}
      </div>

      {error && (
        <p className="text-caption text-destructive">{error}</p>
      )}

      <p className="text-caption text-fg-placeholder">
        Images only · max {maxSizeMB} MB · preview is local, not saved past refresh
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
    </div>
  );
}
