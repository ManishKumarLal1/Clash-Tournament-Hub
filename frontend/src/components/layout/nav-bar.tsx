'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap/register';
import Link from 'next/link';
import { Trophy, User, Users, Home } from 'lucide-react';

export function NavBar() {
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Hide/Show Navbar on Scroll
    ScrollTrigger.create({
      start: 'top -50',
      end: 99999,
      onUpdate: (self) => {
        if (self.direction === 1) {
          // Scrolling down
          gsap.to(navRef.current, { y: '-100%', duration: 0.4, ease: 'power2.inOut' });
        } else {
          // Scrolling up
          gsap.to(navRef.current, { y: '0%', duration: 0.4, ease: 'power2.inOut' });
        }
      },
    });
  }, { scope: navRef });

  return (
    <nav 
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0F]/60 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="text-[#0A0A0F] w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Clash<span className="text-gold">Hub</span>
          </span>
        </Link>

        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
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

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link 
            href="/tournaments/new" 
            className="hidden md:block text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            Host Tournament
          </Link>
          
          {/* Mobile Menu Icon (Just a placeholder for now) */}
          <button className="md:hidden text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}