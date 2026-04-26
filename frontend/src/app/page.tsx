import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingTrustbar } from "@/components/landing/landing-trustbar";
import { LandingProblemSolution } from "@/components/landing/landing-problem-solution";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingDemo } from "@/components/landing/landing-demo";
import { LandingBenefits } from "@/components/landing/landing-benefits";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingSecurity } from "@/components/landing/landing-security";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingNavbar />
      <LandingHero />
      <LandingTrustbar />
      <LandingProblemSolution />
      <LandingFeatures />
      <LandingDemo />
      <LandingBenefits />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingPricing />
      <LandingSecurity />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  );
}
