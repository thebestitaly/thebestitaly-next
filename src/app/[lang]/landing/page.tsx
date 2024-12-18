"use client";

import React from "react";
import { useParams } from "next/navigation";
import Seo from "@/components/widgets/Seo";
import HeroSection from "@/components/landing/HeroSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import CallToAction from "@/components/landing/CallToAction";

const LandingPage = () => {
  const { lang } = useParams();

  if (lang !== "it") {
    return <div className="text-center py-20">Questa pagina è disponibile solo in italiano.</div>;
  }

  return (
    <div>
      <Seo
        title="Traduci i Tuoi Articoli in 50 Lingue | TheBestItaly"
        description="Espandi il tuo business globalmente con articoli tradotti in 50 lingue. Scopri i pacchetti e raggiungi nuovi clienti oggi stesso!"
      />

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