"use client";

export function TourSection({
  tourUrl,
  videoUrl,
}: {
  tourUrl?: string | null;
  videoUrl?: string | null;
}) {
  const src = tourUrl ?? embedYoutube(videoUrl ?? "");
  if (!src) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">
        {tourUrl ? "Tour virtual 360°" : "Vídeo"}
      </h2>
      <div className="aspect-video w-full overflow-hidden rounded-3xl bg-foreground/5">
        <iframe
          src={src}
          className="h-full w-full"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
          allowFullScreen
          loading="lazy"
          title="Tour"
        />
      </div>
    </section>
  );
}

function embedYoutube(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}
