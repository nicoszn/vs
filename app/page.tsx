import HeroSection from "@/components/landing/HeroSection";
import TickerBar from "@/components/landing/TickerBar";
import FeaturesStrip from "@/components/landing/FeaturesStrip";
import WinnersFeed from "@/components/landing/WinnersFeed";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="invex-root">
      <HeroSection />
      <TickerBar />
      <FeaturesStrip />
      <WinnersFeed />
      <CTASection />
    </main>
  );
}
