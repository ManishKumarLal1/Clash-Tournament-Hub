import { TournamentCard } from '@/components/tournament/tournament-card';
import { StaggerList } from '@/components/animations/stagger-list';
import { MOCK_TOURNAMENTS } from '@/lib/mock/tournaments';
import { TextReveal } from '@/components/animations/text-reveal';

export default function TournamentsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-16">
        <TextReveal as="h1" className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
          Discover <span className="text-gold">Tournaments</span>
        </TextReveal>
        <TextReveal as="p" delay={0.1} className="text-[#A1A1AA] text-lg max-w-2xl">
          Browse open brackets, find your next challenge, and prove your mastery. 
        </TextReveal>
      </div>

      {/* Filter / Tabs (Placeholder for later FlipGrid integration) */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button className="px-5 py-2 rounded-full bg-gold text-black font-medium text-sm transition-colors">All Tournaments</button>
        <button className="px-5 py-2 rounded-full bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/5">Registering</button>
        <button className="px-5 py-2 rounded-full bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/5">Ongoing</button>
        <button className="px-5 py-2 rounded-full bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 font-medium text-sm transition-colors border border-white/5">1v1</button>
      </div>

      {/* Grid of Cards */}
      <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TOURNAMENTS.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </StaggerList>

    </main>
  );
}