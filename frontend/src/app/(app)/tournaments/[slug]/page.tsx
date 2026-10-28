'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextReveal } from '@/components/animations/text-reveal';
import { Trophy, Users, Shield, Calendar, ArrowLeft, Loader2, Info, Swords, Crosshair, Play, XCircle } from 'lucide-react';
import Link from 'next/link';
import { TournamentActions } from '@/components/tournament/tournament-actions';
import { BracketView } from '@/components/tournament/bracket-view';
import { CopyCode } from '@/components/tournament/copy-code';
import { TeamDetailsModal } from '@/components/tournament/team-details-modal';

export default function TournamentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  
  // State for the Team Modal
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const supabase = createClient();

  const fetchTournamentAndParticipants = async () => {
    if (!slug) return;

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Fetch Tournament (Added host username to the join)
    const { data, error } = await supabase
      .from('tournaments')
      .select(`*, profiles:host_id (display_name, username)`)
      .eq('slug', slug)
      .single();

    if (error || !data) {
      setNotFoundError(true);
      setIsLoading(false);
      return;
    }

    const formatted = {
      ...data,
      joinCode: data.join_code,
      maxPlayers: data.max_players,
      startDate: data.start_date,
      regDeadline: data.reg_deadline ? new Date(data.reg_deadline).toLocaleString() : 'N/A',
      thRestriction: data.th_restriction,
      thRequirements: data.th_requirements,
      host: data.profiles?.display_name || 'Unknown Host',
      hostUsername: data.profiles?.username || 'unknown'
    };
    setTournament(formatted);

    // Check if current user is the Host
    if (user && data.host_id === user.id) {
      setIsHost(true);
    }

    // 3. Fetch Participants (Added username join)
    const { data: participantsData } = await supabase
      .from('participants')
      .select(`*, profiles:user_id (username)`)
      .eq('tournament_id', data.id);

    if (participantsData) {
      setParticipants(participantsData);
      
      // Check if current user is already in the list
      if (user) {
        const userJoined = participantsData.some((p) => {
          if (p.user_id === user.id) return true;
          if (p.roster_data && Array.isArray(p.roster_data)) {
            return p.roster_data.some((member: any) => member.userId === user.id);
          }
          return false;
        });
        setHasJoined(userJoined);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchTournamentAndParticipants();
  }, [slug, supabase]);

  const handleStartTournament = async () => {
    if (!confirm("Are you sure? This will lock registration and generate the bracket.")) return;
    setIsStarting(true);

    try {
      if (participants.length < 2) throw new Error("You need at least 2 participants.");

      let generatedMatches;
      if (tournament.format === 'Double Elimination') {
        const { generateDoubleEliminationDB } = await import('@/lib/bracket-de');
        generatedMatches = generateDoubleEliminationDB(participants);
      } else {
        const { generateBracketDB } = await import('@/lib/bracket-db');
        generatedMatches = generateBracketDB(participants);
      }

      const { error: insertError } = await supabase.from('matches').insert(
        generatedMatches.map((m: any) => ({ ...m, tournament_id: tournament.id }))
      );

      if (insertError) throw insertError;

      await supabase.from('tournaments').update({ status: 'Ongoing' }).eq('id', tournament.id);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
      setIsStarting(false);
    }
  };

  const handleCancelTournament = async () => {
    if (!confirm("Are you sure you want to cancel this tournament? This cannot be undone.")) return;
    try {
      await supabase.from('tournaments').update({ status: 'Cancelled' }).eq('id', tournament.id);
      window.location.reload();
    } catch (err) {
      alert("Failed to cancel tournament.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (notFoundError || !tournament) {
    notFound();
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      <Link href="/tournaments" className="inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Tournaments
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${
            tournament.status === 'Cancelled' 
              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
              : 'bg-gold/10 text-gold border-gold/20'
          }`}>
            {tournament.status}
          </span>
          <span className="text-[#A1A1AA] text-sm">
            Hosted by{' '}
            <Link href={`/profile/${tournament.hostUsername}`} className="hover:text-gold transition-colors underline decoration-white/20 hover:decoration-gold">
              {tournament.host}
            </Link>
          </span>
        </div>
        
        <TextReveal as="h1" className="font-display text-5xl md:text-7xl font-bold text-white mb-2">
          {tournament.title}
        </TextReveal>

        <div className="flex items-center gap-2 mb-8">
          <span className="text-sm text-[#A1A1AA]">Join Code:</span>
          <CopyCode code={tournament.joinCode || 'NO-CODE'} />
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#12121A] border border-white/5 rounded-2xl mb-8">
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1"><Trophy className="w-3 h-3"/> Prize</p>
            <p className="text-lg font-medium text-gold">{tournament.prize}</p>
          </div>
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Starts</p>
            <p className="text-lg font-medium text-white">{tournament.startDate}</p>
          </div>
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1"><Shield className="w-3 h-3"/> Format</p>
            <p className="text-lg font-medium text-white">{tournament.format}</p>
          </div>
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1"><Info className="w-3 h-3"/> Reg. Deadline</p>
            <p className="text-lg font-medium text-white">{tournament.regDeadline}</p>
          </div>

          {tournament.type === '1v1' && tournament.thRestriction && (
            <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-4 mt-2">
              <p className="text-sm text-[#A1A1AA]">
                <strong className="text-white">Restriction:</strong> Only Town Hall {tournament.thRestriction} accounts are allowed to register.
              </p>
            </div>
          )}

          {tournament.type === 'clan_vs_clan' && (
            <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1"><Swords className="w-3 h-3"/> War Type</p>
                <p className="text-lg font-medium text-white">{tournament.war_type}</p>
              </div>
              <div>
                <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1"><Crosshair className="w-3 h-3"/> Modifier</p>
                <p className="text-lg font-medium text-white">{tournament.battle_modifier}</p>
              </div>
              <div className="col-span-full mt-2">
                <p className="text-xs text-[#A1A1AA] mb-2">Required Roster Composition:</p>
                <div className="flex gap-2">
                  {tournament.thRequirements?.map((th: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm font-mono text-white">
                      TH{th}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between p-6 bg-[#12121A] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gold" />
            <span className="text-white font-medium text-lg">{participants.length} / {tournament.maxPlayers}</span>
            <span className="text-[#A1A1AA] text-sm ml-2">Slots Filled</span>
          </div>
          
          <TournamentActions tournament={tournament} hasJoined={hasJoined} />
        </div>

        {/* ADMIN CONTROLS */}
        {isHost && tournament.status === 'Registering' && (
          <div className="mt-4 p-4 border border-gold/30 bg-gold/5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium flex items-center gap-2"><Play className="w-4 h-4 text-gold"/> Admin Controls</p>
              <p className="text-xs text-[#A1A1AA] mt-1">Lock registration and automatically generate the bracket.</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleCancelTournament}
                className="w-full md:w-auto px-6 py-3 border border-red-500/30 text-red-400 font-bold rounded-lg hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Cancel
              </button>
              <button 
                onClick={handleStartTournament}
                disabled={isStarting || participants.length < 2}
                className="w-full md:w-auto px-8 py-3 bg-gold text-black font-bold rounded-lg hover:bg-[#F5C876] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Tournament'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="font-display text-2xl text-white mb-4">Rules & Info</h2>
          <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 text-sm text-[#A1A1AA] whitespace-pre-wrap">
            {tournament.rules || 'No specific rules provided.'}
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-display text-2xl text-white mb-4">Participants</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {participants.length === 0 ? (
              <div className="col-span-full py-8 text-center bg-[#12121A] border border-dashed border-white/10 rounded-2xl">
                <p className="text-[#A1A1AA]">No players have joined yet. Be the first!</p>
              </div>
            ) : (
              participants.map((p) => {
                // For Clan vs Clan, open the Team Modal
                if (tournament.type === 'clan_vs_clan') {
                  return (
                    <button 
                      key={p.id} 
                      onClick={() => { setSelectedTeam(p); setIsTeamModalOpen(true); }}
                      className="flex items-center gap-3 bg-[#12121A] border border-white/5 p-3 rounded-xl hover:border-gold/30 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Users className="w-4 h-4 text-gold" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate group-hover:text-gold transition-colors">{p.player_name}</p>
                        <p className="text-xs text-[#A1A1AA] font-mono">View Team</p>
                      </div>
                    </button>
                  );
                }

                // For 1v1, link directly to their profile
                const targetUsername = p.profiles?.username || 'unknown';
                return (
                  <Link 
                    href={`/profile/${targetUsername}`}
                    key={p.id} 
                    className="flex items-center gap-3 bg-[#12121A] border border-white/5 p-3 rounded-xl hover:border-gold/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <Users className="w-4 h-4 text-gold" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-white truncate group-hover:text-gold transition-colors">{p.player_name}</p>
                      <p className="text-xs text-[#A1A1AA] font-mono">TH{p.th_level}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* BRACKET SECTION (Only show if Ongoing) */}
      {tournament.status === 'Ongoing' && (
        <div className="mt-16 border-t border-white/10 pt-16">
          <BracketView tournamentId={tournament.id} isHost={isHost} />
        </div>
      )}

      {/* Team Details Modal */}
      <TeamDetailsModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        team={selectedTeam} 
      />
    </main>
  );
}