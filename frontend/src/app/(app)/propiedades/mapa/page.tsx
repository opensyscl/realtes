"use client";

import dynamic from "next/dynamic";

// Leaflet rompe en SSR, por eso lo cargamos solo en cliente.
const PropertyMap = dynamic(
  () => import("@/components/properties/property-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-surface-muted/30 text-sm text-foreground-muted">
        Cargando mapa...
      </div>
    ),
  },
);

export default function PropertyMapPage() {
  return <PropertyMap />;
}
