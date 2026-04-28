"use client";

import Link from "next/link";
import {
  ArrowUpRight01Icon,
  Location01Icon,
  BedDoubleIcon,
  Bathtub01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

import { Icon } from "@/components/ui/icon";

interface Project {
  title: string;
  location: string;
  type: string;
  beds: number;
  baths: number;
  area: number;
  price: string;
  image: string;
}

const PROJECTS: Project[] = [
  {
    title: "Villa Mirador",
    location: "Concón, Viña del Mar",
    type: "Venta",
    beds: 4,
    baths: 3,
    area: 285,
    price: "UF 35.000",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85&auto=format&fit=crop",
  },
  {
    title: "Departamento El Golf",
    location: "Las Condes, Santiago",
    type: "Arriendo",
    beds: 3,
    baths: 2,
    area: 142,
    price: "$2.400.000 / mes",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85&auto=format&fit=crop",
  },
  {
    title: "Casa La Reserva",
    location: "Chicureo, Colina",
    type: "Venta",
    beds: 5,
    baths: 4,
    area: 420,
    price: "UF 28.500",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=85&auto=format&fit=crop",
  },
  {
    title: "Loft Italia",
    location: "Providencia, Santiago",
    type: "Arriendo",
    beds: 2,
    baths: 1,
    area: 88,
    price: "$1.450.000 / mes",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=85&auto=format&fit=crop",
  },
];

export function LandingDemo() {
  return (
    <section
      id="proyectos"
      className="relative py-28 text-[#1a1612]"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #f4ecdc 0%, #f8f1e1 50%, #f3ebd9 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(40% 40% at 20% 30%, rgba(201,169,110,0.14), transparent 70%), radial-gradient(45% 45% at 85% 75%, rgba(201,169,110,0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-medium text-[#1a1612]/75 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              Casos
            </span>
            <h2 className="mt-5 font-serif text-[42px] font-medium leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
              Operaciones publicadas
              <br />
              desde <span className="italic text-[var(--gold)]">Realtes</span>.
            </h2>
          </div>
          <Link
            href="#"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/55 px-5 py-3 text-[13px] font-medium text-[#1a1612]/85 backdrop-blur-xl hover:bg-white/75 hover:text-[#1a1612]"
          >
            Ver toda la cartera
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70">
              <Icon icon={ArrowUpRight01Icon} size={12} />
            </span>
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-white/45 shadow-[0_20px_60px_-25px_rgba(80,60,30,0.18)] backdrop-blur-2xl transition-all hover:bg-white/60 hover:shadow-[0_28px_70px_-25px_rgba(80,60,30,0.25)]">
      <div className="relative m-2 aspect-[16/11] overflow-hidden rounded-[22px]">
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/35 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            {project.type}
          </span>
          <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[12px] font-semibold text-[#1a1612] backdrop-blur-md">
            {project.price}
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div>
            <div className="font-serif text-[22px] font-medium leading-tight tracking-tight text-white">
              {project.title}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-white/85">
              <Icon icon={Location01Icon} size={11} />
              {project.location}
            </div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1a1612] shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform group-hover:rotate-45">
            <Icon icon={ArrowUpRight01Icon} size={14} />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-[#1a1612]/[0.08] px-2">
        <Spec icon={BedDoubleIcon} label="Hab." value={project.beds} />
        <Spec icon={Bathtub01Icon} label="Baños" value={project.baths} />
        <Spec icon={RulerIcon} label="m²" value={project.area} />
      </div>
    </article>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 px-3 py-3.5 text-[13px]">
      <span className="text-[#1a1612]/40">
        <Icon icon={icon} size={13} />
      </span>
      <span className="font-semibold tabular-numbers text-[#1a1612]">
        {value}
      </span>
      <span className="text-[#1a1612]/55">{label}</span>
    </div>
  );
}
