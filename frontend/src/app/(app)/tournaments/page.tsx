'use client'; // <-- Added to allow useState

import { useState } from 'react';
import { TournamentCard } from '@/components/tournament/tournament-card';
import { StaggerList } from '@/components/animations/stagger-list';
import { MOCK_TOURNAMENTS } from '@/lib/mock/tournaments';
import { TextReveal } from '@/components/animations/text-reveal';
import { Search } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/scroll-reveal';

export default function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic: Search by Title, Host, or Join Code
  const filteredTournaments = MOCK_TOURNAMENTS.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.host.toLowerCase().includes(query) ||
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

        {/* Search Bar */}
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

      {/* Filter / Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        <button className="px-5 py-2 rounded-full bg-gold text-black font-medium text-sm transition-colors whitespace-nowrap">All Tournaments</button>
        <button className="px-5 py-2 rounded-full bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/5 whitespace-nowrap">Registering</button>
        <button className="px-5 py-2 rounded-full bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/5 whitespace-nowrap">Ongoing</button>
        <button className="px-5 py-2 rounded-full bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/5 whitespace-nowrap">1v1</button>
        <button className="px-5 py-2 rounded-full bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/5 whitespace-nowrap">Clan vs Clan</button>
      </div>

      {/* Grid of Cards */}
      {filteredTournaments.length > 0 ? (
        <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </StaggerList>
      ) : (
        <div className="text-center py-24 bg-[#12121A] border border-white/5 rounded-2xl">
          <p className="text-[#A1A1AA] text-lg">No tournaments found matching "{searchQuery}"</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-4 text-gold hover:underline font-medium"
          >
            Clear Search
          </button>
        </div>
      )}

    </main>
  );
}