'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap/register';
import Link from 'next/link';
import { Trophy, User, Users, X, Menu } from 'lucide-react';
import { Magnetic } from '@/components/animations/magnetic';

export function NavBar() {
  const navRef = useRef<HTMLElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({
      start: 'top -50',
      end: 99999,
      onUpdate: (self) => {
        if (self.direction === 1 && !isMobileOpen) {
          gsap.to(navRef.current, { y: '-100%', duration: 0.4, ease: 'power2.inOut' });
        } else {
          gsap.to(navRef.current, { y: '0%', duration: 0.4, ease: 'power2.inOut' });
        }
      },
    });
  }, { scope: navRef, dependencies: [isMobileOpen] });

  return (
    <>
      <nav 
        ref={navRef}
        className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0F]/60 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group z-50 relative">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="text-[#0A0A0F] w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Clash<span className="text-gold">Hub</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
            <Link href="/tournaments" className="flex items-center gap-2 hover:text-white transition-colors">
              <Trophy className="w-4 h-4" /> Tournaments
            </Link>
            <Link href="/friends" className="flex items-center gap-2 hover:text-white transition-colors">
              <Users className="w-4 h-4" /> Friends
            </Link>
            <Link href="/profile" className="flex items-center gap-2 hover:text-white transition-colors">
              <User className="w-4 h-4" /> Profile
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Magnetic>
              <Link href="/tournaments/new" className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-colors">
                Host Tournament
              </Link>
            </Magnetic>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white z-50 relative p-2"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#0A0A0F]/95 backdrop-blur-2xl z-40 transition-all duration-500 flex flex-col items-center justify-center gap-8 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <Link href="/tournaments" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 text-2xl font-display text-white hover:text-gold transition-colors">
          <Trophy className="w-6 h-6" /> Tournaments
        </Link>
        <Link href="/friends" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 text-2xl font-display text-white hover:text-gold transition-colors">
          <Users className="w-6 h-6" /> Friends
        </Link>
        <Link href="/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 text-2xl font-display text-white hover:text-gold transition-colors">
          <User className="w-6 h-6" /> Profile
        </Link>
        <div className="w-12 h-px bg-white/10 my-4" />
        <Link href="/tournaments/new" onClick={() => setIsMobileOpen(false)} className="bg-gold text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform">
          Host Tournament
        </Link>
      </div>
    </>
  );
}