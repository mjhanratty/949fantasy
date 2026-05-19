import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HeroSection } from "@/components/marketing/hero-section";
import { PricingCTA } from "@/components/marketing/pricing-cta";
import { RankingsPreviewCard } from "@/components/marketing/rankings-preview-card";
import { SiteShell } from "@/components/marketing/site-shell";

export default function Home() {
  return (
    <SiteShell>
      <HeroSection />
      <RankingsPreviewCard />
      <FeatureGrid />
      <PricingCTA />
    </SiteShell>
  );
}
