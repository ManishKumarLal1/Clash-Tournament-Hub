'use client';

import { useState, useEffect } from 'react';
import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { Magnetic } from '@/components/animations/magnetic';
import { Shield, Trophy, Swords, Plus, X, Hash, KeyRound, Link2, Loader2, Trash2, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns'; // Make sure you have date-fns installed

interface LinkedAccount {
  id: string;
  player_tag: string;
  player_name: string;
  th_level: number;
}

export default function ProfilePage() {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Real User Data State
  const [profileData, setProfileData] = useState<any>(null);
  const [hostedCount, setHostedCount] = useState(0);

  // Form State
  const [playerTag, setPlayerTag] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState('');

  const supabase = createClient();

  // 1. Fetch real profile data, hosted count, and linked accounts
  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) setProfileData(profile);

      // Fetch Hosted Tournaments Count
      const { count } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', user.id);
      
      if (count !== null) setHostedCount(count);

      // Fetch Linked Accounts
      const { data: linkedAccounts } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (linkedAccounts) setAccounts(linkedAccounts);
      
      setIsLoading(false);
    };

    fetchProfileData();
  }, [supabase]);

  // 2. Handle linking a new account
    const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!playerTag.startsWith('#')) {
      setError('Player tag must start with #');
      setIsSubmitting(false);
      return;
    }

    const formattedTag = playerTag.toUpperCase();

    try {
      // 1. Call your local backend proxy to verify the token!
      const response = await fetch('http://localhost:3001/api/verify-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: formattedTag, token: apiToken })
      });

      const result = await response.json();

      if (!result.success || !result.verified) {
        throw new Error(result.reason || 'Invalid API Token. Make sure you copied it correctly from the game settings.');
      }

      // 2. The proxy verified it and returned the real player data!
      const { name, townHallLevel } = result.player;

      // 3. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 4. Save to database
      const { data, error: dbError } = await supabase
        .from('linked_accounts')
        .insert({
          user_id: user.id,
          player_tag: formattedTag,
          player_name: name, // Real name from API
          th_level: townHallLevel, // Real TH from API
        })
        .select()
        .single();

      if (dbError) {
        if (dbError.code === '23505') throw new Error('This account is already linked.');
        throw new Error(dbError.message);
      }

      // Success: Update UI
      setAccounts([...accounts, data]);
      setShowLinkForm(false);
      setPlayerTag('');
      setApiToken('');
    } catch (err: any) {
      setError(err.message || 'Failed to verify account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle deleting an account
  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to unlink this account?')) return;
    
    const { error } = await supabase.from('linked_accounts').delete().eq('id', id);
    if (!error) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  // Format joined date (fallback to current date if missing)
  const joinedDate = profileData?.created_at ? format(new Date(profileData.created_at), 'MMM yyyy') : 'Recently';

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="mb-12">
        <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-2">
          My <span className="text-gold">Profile</span>
        </TextReveal>
        <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
          Manage your linked accounts and view your tournament history.
        </TextReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & User Info */}
        <div className="md:col-span-1 space-y-6">
          <ScrollReveal>
            <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-gold to-yellow-200 rounded-full mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(232,182,90,0.3)]">
                <Shield className="w-12 h-12 text-[#0A0A0F]" />
              </div>
              
              {/* DYNAMIC USERNAME */}
              <h2 className="font-display text-2xl text-white">
                {profileData?.display_name || 'Clasher'}
              </h2>
              <p className="text-sm text-[#A1A1AA] mb-6">
                @{profileData?.username || 'username'} • Joined {joinedDate}
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div>
                  {/* Note: Wins will remain 0 until we build match results */}
                  <p className="text-2xl font-bold text-gold">0</p>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Wins</p>
                </div>
                <div>
                  {/* DYNAMIC HOSTED COUNT */}
                  <p className="text-2xl font-bold text-white">{hostedCount}</p>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Hosted</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Linked Accounts */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-display text-2xl text-white">Linked Accounts</h3>
          </div>

          <StaggerList className="space-y-4">
            {accounts.map((account, index) => (
              <div key={account.id} className="flex items-center justify-between bg-[#12121A] border border-white/5 p-4 rounded-xl hover:border-gold/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                    <Trophy className={`w-6 h-6 ${index === 0 ? 'text-gold' : 'text-[#A1A1AA]'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-white text-lg">{account.player_name}</p>
                    <p className="text-sm text-[#A1A1AA] font-mono">{account.player_tag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="inline-block px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium border border-gold/20 mb-1">
                      Town Hall {account.th_level}
                    </span>
                    <p className="text-xs text-[#A1A1AA]">{index === 0 ? 'Main Account' : 'Alt Account'}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-2 text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Unlink Account"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </StaggerList>

          {/* Link New Account Section */}
          <ScrollReveal delay={0.2} className="pt-4">
            {!showLinkForm ? (
              <Magnetic>
                <button 
                  onClick={() => setShowLinkForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-white/20 rounded-xl text-[#A1A1AA] hover:text-white hover:border-gold/50 hover:bg-white/5 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Link New Clash Account
                </button>
              </Magnetic>
            ) : (
              <div className="bg-[#12121A] border border-gold/30 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-display text-lg text-white flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-gold" /> Link Account
                  </h3>
                  <button 
                    onClick={() => setShowLinkForm(false)} 
                    className="text-[#A1A1AA] hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLinkAccount} className="space-y-3">
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                    <input 
                      type="text" 
                      required
                      value={playerTag}
                      onChange={(e) => setPlayerTag(e.target.value)}
                      placeholder="Player Tag (e.g. #TH16)" 
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-gold/50 transition-colors" 
                    />
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                    <input 
                      type="password" 
                      required
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="API Token (from game settings)" 
                      className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-mono focus:outline-none focus:border-gold/50 transition-colors" 
                    />
                  </div>
                  
                  <div className="bg-white/5 p-3 rounded-lg text-xs text-[#A1A1AA] leading-relaxed">
                    To verify ownership, open Clash of Clans, go to <strong className="text-white">Settings &gt; API Token</strong>, and paste the generated token here. <em>Note: Tokens expire in 5 minutes.</em>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gold text-black font-bold rounded-lg hover:bg-[#F5C876] transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Link'}
                  </button>
                </form>
              </div>
            )}
          </ScrollReveal>
        </div>

      </div>
    </main>
  );
}