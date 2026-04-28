import type { Metadata } from "next";

import { ResetClient } from "./reset-client";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description:
    "Crea una nueva contraseña para tu cuenta de Realtes.",
  alternates: { canonical: "/reset" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function ResetPage() {
  return <ResetClient />;
}
