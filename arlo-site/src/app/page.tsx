import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/sections/Hero";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { SolutionsSection } from "@/components/sections/SolutionsSection";
import { AISection } from "@/components/sections/AISection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { BusinessValue } from "@/components/sections/BusinessValue";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionsSection />
        <AISection />
        <HowItWorks />
        <BusinessValue />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
