import { Hero } from '@/components/home/hero/hero';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Hero />
      
      {/* A placeholder section just to prove scrolling works */}
      <section className="h-screen flex items-center justify-center bg-[#0A0A0F]">
        <p className="text-white/20 font-display text-4xl">Scroll down...</p>
      </section>
    </main>
  );
}