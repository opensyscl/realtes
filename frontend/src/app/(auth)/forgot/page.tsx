import type { Metadata } from "next";

import { ForgotClient } from "./forgot-client";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description:
    "Restablece tu contraseña de Realtes. Te enviamos un email con instrucciones.",
  alternates: { canonical: "/forgot" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function ForgotPage() {
  return <ForgotClient />;
}
