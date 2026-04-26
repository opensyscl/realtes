"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function GalleryGrid({
  photos,
  masonry = false,
}: {
  photos: { id: number; url: string }[];
  masonry?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  if (!photos.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">Galería</h2>
      <div
        className={cn(
          "gap-2",
          masonry
            ? "columns-2 sm:columns-3"
            : "grid grid-cols-2 sm:grid-cols-3",
        )}
      >
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpen(p.url)}
            className={cn(
              "group relative block w-full overflow-hidden rounded-2xl bg-neutral-300",
              masonry ? "mb-2 break-inside-avoid" : "aspect-[4/3]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt=""
              className={cn(
                "w-full object-cover transition-transform duration-500 group-hover:scale-105",
                masonry ? "h-auto" : "h-full",
              )}
            />
          </button>
        ))}
      </div>

      {open && (
        <div
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={open}
            alt=""
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </section>
  );
}
