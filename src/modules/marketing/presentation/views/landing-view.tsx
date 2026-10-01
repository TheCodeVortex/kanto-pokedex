import { CtaSection } from "../components/cta-section";
import { FeaturedPokemonSection } from "../components/featured-pokemon-section";
import { FeaturesSection } from "../components/features-section";
import { HeroSection } from "../components/hero-section";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { TypesSection } from "../components/types-section";

export function LandingView() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <FeaturedPokemonSection />
        <TypesSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
