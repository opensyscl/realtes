"use client";

import { useState } from "react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";

export function GallerySlider({ photos }: { photos: { id: number; url: string }[] }) {
  const [active, setActive] = useState(0);
  if (!photos.length) return null;

  const next = () => setActive((a) => (a + 1) % photos.length);
  const prev = () => setActive((a) => (a - 1 + photos.length) % photos.length);

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">Galería</h2>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-neutral-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[active].url}
          alt=""
          className="h-full w-full object-cover"
        />
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow-md backdrop-blur transition-colors hover:bg-white"
        >
          <Icon icon={ArrowLeft01Icon} size={18} />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 shadow-md backdrop-blur transition-colors hover:bg-white"
        >
          <Icon icon={ArrowRight01Icon} size={18} />
        </button>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white tabular-numbers backdrop-blur-sm">
          {active + 1} / {photos.length}
        </span>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActive(i)}
            className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
              active === i ? "border-[var(--brand)]" : "border-transparent"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
