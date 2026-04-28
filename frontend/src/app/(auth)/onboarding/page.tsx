import type { Metadata } from "next";

import { OnboardingClient } from "./onboarding-client";

export const metadata: Metadata = {
  title: "Configura tu corredora",
  description:
    "Configuremos tu corredora en 3 pasos. Datos básicos, primera propiedad y listo.",
  alternates: { canonical: "/onboarding" },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
