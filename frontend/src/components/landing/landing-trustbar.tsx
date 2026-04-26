"use client";

const LOGOS = [
  { name: "RE/MAX", className: "font-bold text-2xl tracking-tight" },
  { name: "CENTURY 21", className: "font-extrabold text-xl tracking-[0.15em]" },
  { name: "Coldwell Banker", className: "font-serif text-xl italic" },
  { name: "Keller Williams", className: "font-bold text-base tracking-tight" },
  { name: "eXp Realty", className: "font-bold text-2xl tracking-tight" },
  { name: "Sotheby's", className: "font-serif text-2xl italic tracking-tight" },
];

export function LandingTrustbar() {
  return (
    <section className="bg-[#0a0a0c] py-12 text-white">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
          Confían en Realtes
        </div>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-white/45">
          {LOGOS.map((l) => (
            <li
              key={l.name}
              className={`select-none transition-colors hover:text-white/70 ${l.className}`}
            >
              {l.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
