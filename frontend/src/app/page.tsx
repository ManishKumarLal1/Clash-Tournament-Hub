'use client';

import { useEffect, useState } from 'react';
import { Hero } from '@/components/home/hero/hero';
import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { Footer } from '@/components/layout/footer';
import { TournamentCard } from '@/components/tournament/tournament-card';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Trophy, Newspaper, Twitter } from 'lucide-react';
import Link from 'next/link';

// MOCK DATA for Esports News (Since X/Twitter API is complex for MVP)
const ESPORTS_NEWS = [
  {
    id: 1,
    author: 'Clash of Clans Esports',
    handle: '@EsportsClash',
    time: '2h',
    content: 'The Clash Worlds 2026 Qualifiers are officially underway! 🏆 Check out the bracket and tune in this weekend to see who advances to the main stage. #ClashWorlds #CoC',
    likes: 1240,
    retweets: 342,
  },
  {
    id: 2,
    author: 'ClashHub Updates',
    handle: '@ClashHubApp',
    time: '5h',
    content: 'We just crossed 1,000 registered players! 🎉 To celebrate, we are hosting a $100 Community Tournament this Friday. Sign up in the app now. 🚀',
    likes: 856,
    retweets: 120,
  },
  {
    id: 3,
    author: 'Supercell',
    handle: '@Supercell',
    time: '1d',
    content: 'New Balance Changes incoming! Town Hall 18 defenses are getting a slight nerf to balance the Esports meta. Read the full patch notes on our blog. 🛡️',
    likes: 5600,
    retweets: 1100,
  }
];

export default function HomePage() {
  const [liveTournaments, setLiveTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data } = await supabase
        .from('tournaments')
        .select(`*, profiles:host_id (display_name)`)
        .in('status', ['Registering', 'Ongoing'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) {
        setLiveTournaments(data.map(t => ({
          ...t,
          joinCode: t.join_code,
          maxPlayers: t.max_players,
          startDate: t.start_date,
          host: t.profiles?.display_name || 'Unknown Host'
        })));
      }
      setIsLoading(false);
    };

    fetchTournaments();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      <Hero />
      
      {/* LIVE TOURNAMENTS SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <TextReveal as="h2" className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Live <span className="text-gold">Tournaments</span>
            </TextReveal>
            <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
              Jump into a bracket right now or scout the competition.
            </TextReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <Link href="/tournaments" className="flex items-center gap-2 text-gold hover:text-white transition-colors font-medium">
              View All Tournaments <Trophy className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
        ) : liveTournaments.length > 0 ? (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} />
            ))}
          </StaggerList>
        ) : (
          <div className="text-center py-12 bg-[#12121A] rounded-2xl border border-white/5">
            <p className="text-[#A1A1AA]">No live tournaments right now. Be the first to host one!</p>
            <Link href="/tournaments/new" className="text-gold hover:underline mt-2 inline-block">Host a Tournament</Link>
          </div>
        )}
      </section>

      {/* ESPORTS NEWS SECTION */}
      <section className="py-24 px-6 md:px-12 bg-[#12121A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <TextReveal as="h2" className="font-display text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-gold" /> Esports <span className="text-gold">News</span>
            </TextReveal>
            <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
              The latest updates from the Clash of Clans competitive scene.
            </TextReveal>
          </div>

          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ESPORTS_NEWS.map((news) => (
              <div key={news.id} className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{news.author}</p>
                    <p className="text-xs text-[#A1A1AA]">{news.handle} • {news.time}</p>
                  </div>
                </div>
                <p className="text-sm text-[#D4D4D8] leading-relaxed mb-6">
                  {news.content}
                </p>
                <div className="flex items-center gap-6 text-sm text-[#A1A1AA]">
                  <span className="flex items-center gap-2"><Twitter className="w-4 h-4" /> {news.retweets}</span>
                  <span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> {news.likes}</span>
                </div>
              </div>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-[#0A0A0F] to-[#0A0A0F] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <TextReveal as="h2" className="font-display text-5xl md:text-7xl font-bold text-white mb-6">
            Ready to claim <br /> your <span className="text-gold">glory?</span>
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-lg text-[#A1A1AA] mb-10">
            Create your own custom rules, invite your clan, and host the ultimate tournament. No spreadsheets, just battles.
          </TextReveal>
          <ScrollReveal delay={0.2}>
            <Link href="/tournaments/new" className="inline-flex items-center justify-center px-10 py-5 bg-gold text-black font-bold text-lg rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(232,182,90,0.3)]">
              Host Your Tournament
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}