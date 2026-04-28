"use client";

const LOGOS = [
  { name: "RE/MAX", className: "font-bold text-2xl tracking-tight" },
  { name: "CENTURY 21", className: "font-extrabold text-xl tracking-[0.18em]" },
  { name: "Coldwell Banker", className: "font-serif text-xl italic" },
  { name: "Keller Williams", className: "font-bold text-base tracking-tight" },
  { name: "eXp Realty", className: "font-bold text-2xl tracking-tight" },
  { name: "Sotheby's", className: "font-serif text-2xl italic tracking-tight" },
];

export function LandingTrustbar() {
  return (
    <section className="relative py-10">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f3ecdf 0%, #f7f1e6 100%)",
        }}
      />
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-6 lg:flex-row lg:gap-10">
        <div className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#1a1612]/45">
          Trabajan con Realtes
        </div>
        <div className="hidden h-6 w-px bg-[#1a1612]/12 lg:block" />
        <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-12 gap-y-5 text-[#1a1612]/35 lg:justify-between">
          {LOGOS.map((l) => (
            <li
              key={l.name}
              className={`select-none transition-colors hover:text-[#1a1612]/70 ${l.className}`}
            >
              {l.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
