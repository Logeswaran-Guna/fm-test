import Header from "./components/Header";
import Hero from "./components/Hero";
import PlatformHighlights from "./components/PlatformHighlights";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <PlatformHighlights />
      </main>
    </div>
  );
}
