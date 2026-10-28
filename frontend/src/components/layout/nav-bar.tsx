'use client';
import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap/register';
import Link from 'next/link';
import { Trophy, User, Users, X, Menu, LayoutDashboard, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function NavBar() {
  const navRef = useRef<HTMLElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    setIsMobileOpen(false);
  };

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
      <nav ref={navRef} className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0F]/60 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 transition-colors">
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
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/tournaments" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Trophy className="w-4 h-4" /> Tournaments
                </Link>
                <Link href="/friends" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Users className="w-4 h-4" /> Community
                </Link>
                <Link href="/profile" className="flex items-center gap-2 hover:text-white transition-colors">
                  <User className="w-4 h-4" /> Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/tournaments" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Trophy className="w-4 h-4" /> Tournaments
                </Link>
                <Link href="/friends" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Users className="w-4 h-4" /> Community
                </Link>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading && (
              user ? (
                <>
                  <Link href="/tournaments/new" className="text-sm font-medium bg-gold text-black px-5 py-2 rounded-full hover:bg-[#F5C876] transition-colors">
                    Host Tournament
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-medium text-[#A1A1AA] hover:text-red-400 transition-colors p-2" title="Log Out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-white hover:text-gold transition-colors">
                    Log In
                  </Link>
                  <Link href="/register" className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-colors">
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white z-50 relative p-2" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-[#0A0A0F]/95 backdrop-blur-2xl z-40 transition-all duration-500 flex flex-col items-center justify-center gap-8 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {user ? (
          <>
            <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="text-2xl font-display text-white hover:text-gold">Dashboard</Link>
            <Link href="/tournaments" onClick={() => setIsMobileOpen(false)} className="text-2xl font-display text-white hover:text-gold">Tournaments</Link>
            <Link href="/friends" onClick={() => setIsMobileOpen(false)} className="text-2xl font-display text-white hover:text-gold">Community</Link>
            <Link href="/profile" onClick={() => setIsMobileOpen(false)} className="text-2xl font-display text-white hover:text-gold">Profile</Link>
            <div className="w-12 h-px bg-white/10 my-2" />
            <Link href="/tournaments/new" onClick={() => setIsMobileOpen(false)} className="bg-gold text-black font-bold px-8 py-3 rounded-full">Host Tournament</Link>
            <button onClick={handleLogout} className="text-red-400 font-medium hover:text-red-300">Log Out</button>
          </>
        ) : (
          <>
            <Link href="/tournaments" onClick={() => setIsMobileOpen(false)} className="text-2xl font-display text-white hover:text-gold">Tournaments</Link>
            <Link href="/friends" onClick={() => setIsMobileOpen(false)} className="text-2xl font-display text-white hover:text-gold">Community</Link>
            <div className="w-12 h-px bg-white/10 my-2" />
            <Link href="/login" onClick={() => setIsMobileOpen(false)} className="text-2xl font-display text-white hover:text-gold">Log In</Link>
            <Link href="/register" onClick={() => setIsMobileOpen(false)} className="bg-white text-black font-bold px-8 py-3 rounded-full">Sign Up</Link>
          </>
        )}
      </div>
    </>
  );
}