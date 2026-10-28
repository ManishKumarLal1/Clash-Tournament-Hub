'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { TournamentCard } from '@/components/tournament/tournament-card';
import { Loader2, Plus, Swords, Check, X, Bell, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';
import { Magnetic } from '@/components/animations/magnetic';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [ongoingTournaments, setOngoingTournaments] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // 2. Hosted Tournaments
      const { data: hostedData } = await supabase.from('tournaments').select('*').eq('host_id', user.id).order('created_at', { ascending: false });
      if (hostedData) {
        setMyTournaments(hostedData.map(t => ({ ...t, joinCode: t.join_code, maxPlayers: t.max_players, startDate: t.start_date })));
      }

      // 3. Ongoing Tournaments (Joined)
      const { data: participations } = await supabase
        .from('participants')
        .select(`
          id, 
          tournament_id,
          tournaments (id, title, status, slug, prize, max_players, start_date)
        `)
        .eq('user_id', user.id);

      if (participations) {
        // Cast tournaments to 'any' to prevent TS from thinking it's an array
        const ongoing = participations
          .map((p: any) => p.tournaments)
          .filter((t: any) => t?.status === 'Ongoing');
        
        // Remove duplicates
        const uniqueOngoing = ongoing.filter(
          (v, i, a) => a.findIndex((t) => t?.id === v?.id) === i
        );
        
        setOngoingTournaments(uniqueOngoing);

        // 4. Recent Matches (Only completed ones)
        const participantIds = participations.map(p => p.id);
        if (participantIds.length > 0) {
          const { data: matchesData } = await supabase
            .from('matches')
            .select(`
              *,
              tournaments (title)
            `)
            .in('winner_id', participantIds)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(5); // Get last 5 wins
          
          if (matchesData) setRecentMatches(matchesData);
        }
      }

      // 5. Pending Invites
      const { data: invitesData } = await supabase
        .from('participants')
        .select(`*, tournaments (title, start_date)`)
        .contains('roster_data', JSON.stringify([{ userId: user.id, status: 'pending' }]));
      if (invitesData) setPendingInvites(invitesData);

      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const handleInviteAction = async (invite: any, action: 'accepted' | 'declined') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedRoster = invite.roster_data.map((player: any) => 
        player.userId === user.id ? { ...player, status: action } : player
      );

      await supabase.from('participants').update({ roster_data: updatedRoster }).eq('id', invite.id);
      setPendingInvites(prev => prev.filter(i => i.id !== invite.id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-2">
            Welcome back, <span className="text-gold">{profile?.display_name || profile?.username}</span>
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
            Here is your command center.
          </TextReveal>
        </div>
        <ScrollReveal delay={0.2}>
          <Magnetic>
            <Link href="/tournaments/new" className="flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-xl hover:scale-105 transition-transform duration-300">
              <Plus className="w-5 h-5" /> Create New
            </Link>
          </Magnetic>
        </ScrollReveal>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <ScrollReveal delay={0.1}>
          <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center"><Swords className="w-6 h-6 text-gold" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{myTournaments.length}</p>
              <p className="text-sm text-[#A1A1AA]">Tournaments Hosted</p>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-[#A1A1AA]" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{ongoingTournaments.length}</p>
              <p className="text-sm text-[#A1A1AA]">Ongoing Tournaments</p>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center"><Trophy className="w-6 h-6 text-gold" /></div>
            <div>
              <p className="text-3xl font-bold text-white">{recentMatches.length}</p>
              <p className="text-sm text-[#A1A1AA]">Recent Match Wins</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2"><Bell className="w-6 h-6 text-gold" /> Team Invitations</h2>
          <StaggerList className="space-y-4">
            {pendingInvites.map((invite: any) => (
              <div key={invite.id} className="bg-[#12121A] border border-gold/30 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
                <div>
                  <p className="text-gold text-sm font-medium mb-1">Invitation to Join Team</p>
                  <h3 className="text-xl font-bold text-white mb-2"><span className="text-gold">{invite.player_name}</span> ({invite.player_tag})</h3>
                  <p className="text-sm text-[#A1A1AA]">Tournament: {invite.tournaments.title} • Starts {invite.tournaments.start_date}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => handleInviteAction(invite, 'declined')} className="flex-1 md:flex-none px-6 py-2 border border-white/10 text-[#A1A1AA] hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2"><X className="w-4 h-4" /> Decline</button>
                  <button onClick={() => handleInviteAction(invite, 'accepted')} className="flex-1 md:flex-none px-6 py-2 bg-gold text-black font-bold rounded-lg hover:bg-[#F5C876] transition-colors flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Accept</button>
                </div>
              </div>
            ))}
          </StaggerList>
        </div>
      )}

      {/* Ongoing Tournaments */}
      {ongoingTournaments.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl text-white mb-6">Ongoing Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingTournaments.map((tournament: any) => (
              <Link key={tournament.id} href={`/tournaments/${tournament.slug}`} className="bg-[#12121A] border border-gold/20 p-6 rounded-2xl hover:border-gold/50 transition-colors group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-xl text-white group-hover:text-gold transition-colors">{tournament.title}</h3>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/20">Live</span>
                </div>
                <p className="text-sm text-[#A1A1AA] mb-2">Prize: <span className="text-white">{tournament.prize}</span></p>
                <p className="text-sm text-[#A1A1AA]">Started: {tournament.start_date}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Hosted Tournaments */}
        <div>
          <h2 className="font-display text-2xl text-white mb-6">Your Hosted Tournaments</h2>
          {myTournaments.length > 0 ? (
            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </StaggerList>
          ) : (
            <div className="bg-[#12121A] border border-white/5 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <Swords className="w-8 h-8 text-[#A1A1AA] mb-4" />
              <p className="text-[#A1A1AA] mb-4 text-sm">You haven't hosted any tournaments.</p>
              <Link href="/tournaments/new" className="text-gold hover:underline font-medium text-sm">Host One</Link>
            </div>
          )}
        </div>

        {/* Recent Matches */}
        <div>
          <h2 className="font-display text-2xl text-white mb-6">Recent Match Wins</h2>
          {recentMatches.length > 0 ? (
            <StaggerList className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="bg-[#12121A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    {/* Using any here because Supabase join typing can be tricky */}
                    <p className="text-sm text-[#A1A1AA] mb-1">{(match.tournaments as any)?.title}</p>
                    <p className="text-white font-medium flex items-center gap-2"><Trophy className="w-4 h-4 text-gold"/> Match Victory</p>
                  </div>
                  <span className="text-xs font-mono text-[#A1A1AA] bg-white/5 px-2 py-1 rounded">Round {match.round_number}</span>
                </div>
              ))}
            </StaggerList>
          ) : (
            <div className="bg-[#12121A] border border-white/5 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
              <Trophy className="w-8 h-8 text-[#A1A1AA] mb-4" />
              <p className="text-[#A1A1AA] text-sm">No recent match wins.</p>
            </div>
          )}
        </div>
      </div>

    </main>
  );
}