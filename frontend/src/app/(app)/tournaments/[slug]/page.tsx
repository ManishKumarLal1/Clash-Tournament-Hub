import { notFound } from 'next/navigation';
import { MOCK_TOURNAMENTS } from '@/lib/mock/tournaments';
import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Trophy, Users, Shield, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TournamentActions } from '@/components/tournament/tournament-actions';
import { BracketView } from '@/components/tournament/bracket-view';

export default async function TournamentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15 requires awaiting params
  const { slug } = await params;
  
  const tournament = MOCK_TOURNAMENTS.find((t) => t.slug === slug);

  if (!tournament) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      
      {/* Back Button */}
      <Link href="/tournaments" className="inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Tournaments
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
            {tournament.status}
          </span>
          <span className="text-[#A1A1AA] text-sm">Hosted by {tournament.host}</span>
        </div>
        
        <TextReveal as="h1" className="font-display text-5xl md:text-7xl font-bold text-white mb-6">
          {tournament.title}
        </TextReveal>

        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 bg-[#12121A] border border-white/5 rounded-2xl">
          <div className="flex flex-wrap gap-6 md:gap-8">
            <div>
              <p className="text-xs text-[#A1A1AA] mb-1">Prize Pool</p>
              <p className="text-xl font-medium text-gold flex items-center gap-2">
                <Trophy className="w-5 h-5" /> {tournament.prize}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A1A1AA] mb-1">Date</p>
              <p className="text-xl font-medium text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#A1A1AA]" /> {tournament.startDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A1A1AA] mb-1">Format</p>
              <p className="text-xl font-medium text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#A1A1AA]" /> {tournament.format}
              </p>
            </div>
          </div>

          {/* Our new Client Component */}
          <TournamentActions />
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Rules Section */}
        <div className="md:col-span-1">
          <h2 className="font-display text-2xl text-white mb-4">Rules & Info</h2>
          <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 space-y-4 text-sm text-[#A1A1AA]">
            <p>• Only Town Hall 16 allowed.</p>
            <p>• Best of 1 (BO1) single elimination.</p>
            <p>• Friendly wars must be started within 15 minutes of the scheduled time.</p>
            <p>• Screenshots of the result must be posted in the chat.</p>
            <p>• <strong className="text-white">Host controls results:</strong> The tournament host acts as the referee and manually updates the bracket winners.</p>
          </div>
        </div>

        {/* Participants Section */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-display text-2xl text-white">Participants</h2>
            <span className="text-sm text-[#A1A1AA]">{tournament.currentPlayers}/{tournament.maxPlayers} Joined</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: tournament.currentPlayers }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#12121A] border border-white/5 p-3 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#A1A1AA]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Player {i + 1}</p>
                  <p className="text-xs text-[#A1A1AA]">#2PQL8YR</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16 border-t border-white/10 pt-16">
        <BracketView />
      </div>
    </main>
  );
}