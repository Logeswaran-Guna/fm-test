import Header from "./components/Header";
import Hero from "./components/Hero";
import LearnLeadBand from "./components/LearnLeadBand";
import PlatformHighlights from "./components/PlatformHighlights";
import PerksAndBenefits from "./components/PerksAndBenefits";
import LearningCategories from "./components/LearningCategories";
import Testimonials from "./components/Testimonials";
import Partners from "./components/Partners";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <LearnLeadBand />
        <PlatformHighlights />
        <PerksAndBenefits />
        <LearningCategories />
        <Testimonials />
        <Partners />
      </main>
      <Footer />
    </div>
  );
}
