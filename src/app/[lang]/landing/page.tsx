import React from "react";
import { generateMetadata as generateSEO } from "@/components/widgets/seo-utils";
import HeroSection from "@/components/landing/HeroSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import CallToAction from "@/components/landing/CallToAction";

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props) {
  return generateSEO({
    title: "Traduci i Tuoi Articoli in 50 Lingue | TheBestItaly",
    description: "Espandi il tuo business globalmente con articoli tradotti in 50 lingue. Scopri i pacchetti e raggiungi nuovi clienti oggi stesso!",
  });
}

const LandingPage = async ({ params }: Props) => {
  const { lang } = await params;

  if (lang !== "it") {
    return <div className="text-center py-20">Questa pagina è disponibile solo in italiano.</div>;
  }

  return (
    <div>
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <PricingSection />
      <FaqSection />
      <CallToAction />
    </div>
  );
};

export default LandingPage;