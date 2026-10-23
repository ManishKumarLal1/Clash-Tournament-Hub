import { TextReveal } from '@/components/animations/text-reveal';
import { Magnetic } from '@/components/animations/magnetic';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.08) 0%, rgba(10, 10, 15, 1) 60%)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Badge */}
        <div className="mb-8 overflow-hidden">
          <p className="inline-block border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-[#A1A1AA] uppercase tracking-widest">
            The Ultimate Clash Hub
          </p>
        </div>

        {/* Headline */}
        <TextReveal as="h1" delay={0.1} className="font-display text-6xl md:text-8xl lg:text-[7rem] font-bold leading-[0.9] tracking-tighter text-white">
          Forge Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8B65A] to-[#F5C876]">
            Legacy.
          </span>
        </TextReveal>

        {/* Subheadline */}
        <TextReveal as="p" delay={0.4} className="mt-8 text-lg md:text-xl text-[#A1A1AA] max-w-2xl font-light">
          Create custom rules, host intense 1v1 tournaments, and track your clan's rise to the top. No spreadsheets, just glory.
        </TextReveal>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-6">
          <Magnetic>
            <Link 
              href="/tournaments" 
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#E8B65A] text-[#0A0A0F] font-medium rounded-full overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <span className="relative z-10">Explore Tournaments</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </Link>
          </Magnetic>

          <Magnetic>
            <Link 
              href="/tournaments/new" 
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-full transition-colors duration-300 hover:border-[#E8B65A]"
            >
              Host Your Own
            </Link>
          </Magnetic>
        </div>

      </div>
    </section>
  );
}