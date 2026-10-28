'use client';

import { useState, useEffect } from 'react';
import { TournamentCard } from '@/components/tournament/tournament-card';
import { StaggerList } from '@/components/animations/stagger-list';
import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Search, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          profiles:host_id (display_name),
          participants (count)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map(t => ({
          ...t,
          joinCode: t.join_code,
          maxPlayers: t.max_players,
          // DYNAMIC COUNT HERE:
          currentPlayers: t.participants?.[0]?.count || 0,
          startDate: t.start_date,
          host: t.profiles?.display_name || 'Unknown Host'
        }));
        setTournaments(formatted);
      }
      setIsLoading(false);
    };

    fetchTournaments();
  }, [supabase]);

  const filteredTournaments = tournaments.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      (t.host && t.host.toLowerCase().includes(query)) ||
      (t.joinCode && t.joinCode.toLowerCase().includes(query))
    );
  });

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <TextReveal as="h1" className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
            Discover <span className="text-gold">Tournaments</span>
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-[#A1A1AA] text-lg max-w-2xl">
            Browse open brackets, find your next challenge, and prove your mastery.
          </TextReveal>
        </div>

        <ScrollReveal delay={0.2} className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input 
              type="text" 
              placeholder="Search by name, host, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12121A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            />
          </div>
        </ScrollReveal>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : filteredTournaments.length > 0 ? (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </StaggerList>
      ) : (
        <div className="text-center py-24 bg-[#12121A] border border-white/5 rounded-2xl flex flex-col items-center">
          <p className="text-[#A1A1AA] text-lg mb-4">
            {searchQuery ? `No tournaments found matching "${searchQuery}"` : 'No tournaments have been created yet.'}
          </p>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </main>
  );
}