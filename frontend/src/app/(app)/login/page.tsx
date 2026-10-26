'use client';

import { useState } from 'react';
import { TextReveal } from '@/components/animations/text-reveal';
import { Magnetic } from '@/components/animations/magnetic';
import Link from 'next/link';
import { Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Reconstruct the hidden email from the username
    const fakeEmail = `${formData.username.toLowerCase()}@clashhub.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: fakeEmail,
      password: formData.password,
    });

    if (error) {
      // Don't give away too much info for security (e.g., "User not found")
      setError('Invalid username or password.');
      setIsLoading(false);
      return;
    }

    // Success! Redirect to the dashboard
    router.push('/dashboard');
  };

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
            Welcome Back
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-[#A1A1AA] text-center mb-8">
            Log in to manage your tournaments
          </TextReveal>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]">@</span>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                  placeholder="legendking" 
                  className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-gold/50" 
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Password</label>
                {/* Optional: Add forgot password link here later */}
              </div>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••" 
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" 
              />
            </div>

            <Magnetic>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full mt-6 py-4 bg-gold text-black font-bold rounded-xl hover:bg-[#F5C876] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Log In <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </Magnetic>
          </form>

          <p className="text-center text-sm text-[#A1A1AA] mt-6">
            Don't have an account? <Link href="/register" className="text-gold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}