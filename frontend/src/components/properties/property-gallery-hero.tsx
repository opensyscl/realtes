"use client";

import { useEffect, useState } from "react";
import {
  Cancel01Icon,
  Image01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PropertyNewIcon,
} from "@hugeicons/core-free-icons";

import { Icon } from "@/components/ui/icon";
import { usePhotos } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface PhotoLike {
  id: number | string;
  url: string;
  name?: string;
}

/**
 * Hero galería estilo Airbnb: 1 imagen grande a la izquierda + grid 2x2 a la derecha.
 * Si hay menos de 5 fotos se ajusta al número disponible. Click en cualquier imagen
 * abre el lightbox con navegación. Última imagen del grid muestra "+N más" si hay
 * más fotos que las 5 visibles.
 */
export function PropertyGalleryHero({
  propertyId,
  fallbackUrl,
  alt = "",
}: {
  propertyId: number;
  fallbackUrl?: string | null;
  alt?: string;
}) {
  const { data, isLoading } = usePhotos(propertyId);
  const photos = (data ?? []) as PhotoLike[];
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Si no hay fotos pero hay cover_image_url, lo usamos como única
  const allPhotos = photos.length === 0 && fallbackUrl
    ? [{ id: "cover", url: fallbackUrl }]
    : photos;

  // Reusable cell class — cada imagen tiene su propio border-radius (no el container)
  // min-h-0 + min-w-0 evita que la imagen intrínseca infle el grid track.
  const cellCls =
    "group relative block h-full w-full min-h-0 min-w-0 overflow-hidden rounded-md bg-surface-muted";

  if (isLoading) {
    return (
      <div className="grid h-[260px] self-start lg:h-[340px] grid-cols-1 gap-2.5 lg:grid-cols-2">
        <div className="h-full animate-pulse rounded-md bg-surface-muted/60" />
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-full w-full animate-pulse rounded-md bg-surface-muted/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (allPhotos.length === 0) {
    return (
      <div className="flex h-[260px] self-start lg:h-[340px] items-center justify-center rounded-md bg-gradient-to-br from-surface-muted to-border-subtle text-foreground-muted">
        <div className="flex flex-col items-center gap-2">
          <Icon icon={PropertyNewIcon} size={48} />
          <span className="text-sm">Sin fotos todavía</span>
        </div>
      </div>
    );
  }

  // Solo una foto: imagen aspect-[2/1] full-width
  if (allPhotos.length === 1) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightboxIdx(0)}
          className="block h-[260px] self-start lg:h-[340px] w-full overflow-hidden rounded-md bg-surface-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={allPhotos[0].url}
            alt={alt}
            className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </button>
        {lightboxIdx !== null && (
          <Lightbox
            photos={allPhotos}
            initial={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </>
    );
  }

  // 2+ fotos: layout Airbnb. Container aspect-[2/1] = dos cuadrados lado a lado.
  // Imagen 1 ocupa la columna izquierda completa.
  // Las siguientes 2-4 forman un grid 2x2 cuadrado en la columna derecha.
  const main = allPhotos[0];
  const sides = allPhotos.slice(1, 5);
  const remaining = Math.max(0, allPhotos.length - 5);

  return (
    <>
      {/* Wrapper relative para que el badge "Ver todas" flote sobre la galería */}
      <div className="relative h-[260px] self-start lg:h-[340px]">
        <div className="grid h-full grid-cols-1 gap-2.5 lg:grid-cols-2">
          {/* Imagen grande izquierda (cuadrada) */}
          <button
            type="button"
            onClick={() => setLightboxIdx(0)}
            className={cellCls}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main.url}
              alt={alt}
              className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>

          {/* Grid derecha 2x2 cuadrado */}
          <div
            className={cn(
              "grid h-full min-h-0 min-w-0 gap-2.5",
              sides.length === 1 && "grid-cols-1 grid-rows-1",
              sides.length === 2 && "grid-cols-1 grid-rows-2",
              sides.length === 3 && "grid-cols-2 grid-rows-2",
              sides.length === 4 && "grid-cols-2 grid-rows-2",
            )}
          >
            {sides.map((photo, i) => {
              const isLast = i === sides.length - 1;
              const showMore = isLast && remaining > 0;
              const idxInAll = i + 1;
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIdx(idxInAll)}
                  className={cellCls}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {showMore && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px] transition-colors group-hover:bg-black/65">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-foreground shadow-lg">
                        <Icon icon={Image01Icon} size={12} />
                        +{remaining} más
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {lightboxIdx !== null && (
        <Lightbox
          photos={allPhotos}
          initial={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

function Lightbox({
  photos,
  initial,
  onClose,
}: {
  photos: PhotoLike[];
  initial: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initial);

  const next = () => setIdx((i) => (i + 1) % photos.length);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  const photo = photos[idx];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header con contador + close */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4 text-white">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium tabular-numbers backdrop-blur">
          {idx + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20"
          aria-label="Cerrar"
        >
          <Icon icon={Cancel01Icon} size={16} />
        </button>
      </div>

      {/* Imagen central */}
      <div
        className="relative max-h-[85vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          className="max-h-[85vh] max-w-full rounded-2xl object-contain"
        />
      </div>

      {/* Flechas navegación */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
            aria-label="Anterior"
          >
            <Icon icon={ArrowLeft01Icon} size={18} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
            aria-label="Siguiente"
          >
            <Icon icon={ArrowRight01Icon} size={18} />
          </button>
        </>
      )}

      {/* Thumbnails strip al pie */}
      {photos.length > 1 && (
        <div
          className="absolute inset-x-0 bottom-6 flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex max-w-[90vw] gap-2 overflow-x-auto rounded-2xl bg-white/10 p-2 backdrop-blur">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setIdx(i)}
                className={cn(
                  "h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  i === idx
                    ? "border-white scale-105"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
