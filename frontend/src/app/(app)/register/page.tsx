'use client';

import { TextReveal } from '@/components/animations/text-reveal';
import { Magnetic } from '@/components/animations/magnetic';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Trophy className="text-[#0A0A0F] w-6 h-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            Clash<span className="text-gold">Hub</span>
          </span>
        </Link>

        <div className="bg-[#12121A] border border-white/5 rounded-3xl p-8 shadow-2xl">
          <TextReveal as="h1" className="font-display text-3xl font-bold text-white mb-2 text-center">
            Create an Account
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-[#A1A1AA] text-center mb-8">
            Join the ultimate tournament platform
          </TextReveal>

          <form className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white">Profile Name</label>
              <input type="text" placeholder="e.g. Legendary King" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-white">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]">@</span>
                <input type="text" placeholder="legendking" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-gold/50" />
              </div>
              <p className="text-xs text-[#A1A1AA]">This will be your unique ID for friends to find you.</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-white">Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
            </div>

            <Magnetic>
              <button type="button" className="w-full mt-6 py-4 bg-gold text-black font-bold rounded-xl hover:bg-[#F5C876] transition-colors flex items-center justify-center gap-2">
                Create Account <ArrowRight className="w-5 h-5" />
              </button>
            </Magnetic>
          </form>
        </div>
      </div>
    </div>
  );
}