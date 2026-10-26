'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageSquare, Crown, Loader2, RefreshCw } from 'lucide-react';
import { TournamentChat } from './tournament-chat';

export function BracketView({ tournamentId, isHost }: { tournamentId: string, isHost: boolean }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState('Match Chat');
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchBracket = async () => {
    const { data: matchData } = await supabase.from('matches').select('*').eq('tournament_id', tournamentId).order('round_number', { ascending: true });
    const { data: participantData } = await supabase.from('participants').select('*').eq('tournament_id', tournamentId);
    if (matchData && participantData) {
      setMatches(matchData);
      setParticipants(participantData);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchBracket(); }, [tournamentId]);

  const getPlayerName = (id: string | null) => {
    if (!id) return 'TBD';
    return participants.find(part => part.id === id)?.player_name || 'TBD';
  };

  const handleAdvanceWinner = async (match: any, winnerId: string, loserId: string | null) => {
    if (!isHost) return;
    
    // 1. Complete current match
    await supabase.from('matches').update({ winner_id: winnerId, status: 'completed' }).eq('id', match.id);

    // 2. Route Winner (Standard Brackets)
    if (match.next_winner_match_id) {
      const payload = match.next_winner_slot === 'p1' ? { p1_id: winnerId } : { p2_id: winnerId };
      const { data: nextW } = await supabase.from('matches').select('*').eq('id', match.next_winner_match_id).single();
      if (nextW) {
        const isReady = (match.next_winner_slot === 'p1' && nextW.p2_id) || (match.next_winner_slot === 'p2' && nextW.p1_id);
        await supabase.from('matches').update({ ...payload, status: isReady ? 'ready' : 'pending' }).eq('id', match.next_winner_match_id);
      }
    }

    // 3. Route Loser (Standard Bracket Drop-down)
    if (match.bracket_type === 'winners' && match.next_loser_match_id && loserId) {
      const payload = match.next_loser_slot === 'p1' ? { p1_id: loserId } : { p2_id: loserId };
      const { data: nextL } = await supabase.from('matches').select('*').eq('id', match.next_loser_match_id).single();
      if (nextL) {
        const isReady = (match.next_loser_slot === 'p1' && nextL.p2_id) || (match.next_loser_slot === 'p2' && nextL.p1_id);
        await supabase.from('matches').update({ ...payload, status: isReady ? 'ready' : 'pending' }).eq('id', match.next_loser_match_id);
      }
    }

    // 4. Handle Grand Final Reset Logic
    if (match.bracket_type === 'grand_final' && match.match_index === 0) {
      // If the Losers Bracket team (p2) wins GF1, we need a reset match.
      if (winnerId === match.p2_id) {
        const resetMatch = matches.find(m => m.bracket_type === 'grand_final' && m.match_index === 1);
        if (resetMatch) {
          await supabase.from('matches').update({
            p1_id: match.p1_id, // WB Team
            p2_id: match.p2_id, // LB Team
            status: 'ready'
          }).eq('id', resetMatch.id);
        }
      }
    }

    fetchBracket();
  };

  const renderMatchCard = (match: any) => {
    if (!match) return null;
    const isResetMatch = match.bracket_type === 'grand_final' && match.match_index === 1;
    
    return (
      <div key={match.id} className={`relative group w-64 border rounded-xl overflow-hidden transition-all ${isResetMatch ? 'border-gold/50 shadow-[0_0_15px_rgba(232,182,90,0.2)]' : 'border-white/5 bg-[#12121A] hover:border-gold/30'}`}>
        {isResetMatch && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />}
        
                <button 
          onClick={() => { 
            setChatTitle(`${getPlayerName(match.p1_id)} vs ${getPlayerName(match.p2_id)}`); 
            setActiveMatchId(match.id); // <-- Set the specific match ID
            setIsChatOpen(true); 
          }} 
          className="absolute right-2 top-2 p-1.5 bg-white/5 rounded-md text-[#A1A1AA] hover:text-gold hover:bg-white/10 transition-colors z-10"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col">
          <div 
            onClick={() => match.p1_id && match.p2_id && !match.winner_id && isHost && handleAdvanceWinner(match, match.p1_id, match.p2_id)}
            className={`flex items-center justify-between p-3 border-b border-white/5 ${match.p1_id && match.p2_id && isHost && !match.winner_id ? 'cursor-pointer hover:bg-white/5' : ''} ${match.winner_id === match.p1_id ? 'bg-gold/10' : ''}`}
          >
            <span className={`text-sm font-medium ${match.winner_id === match.p1_id ? 'text-gold' : 'text-white'}`}>{getPlayerName(match.p1_id)}</span>
            {match.winner_id === match.p1_id && <Crown className="w-4 h-4 text-gold" />}
          </div>
          <div 
            onClick={() => match.p1_id && match.p2_id && !match.winner_id && isHost && handleAdvanceWinner(match, match.p2_id, match.p1_id)}
            className={`flex items-center justify-between p-3 ${match.p1_id && match.p2_id && isHost && !match.winner_id ? 'cursor-pointer hover:bg-white/5' : ''} ${match.winner_id === match.p2_id ? 'bg-gold/10' : ''}`}
          >
            <span className={`text-sm font-medium ${match.winner_id === match.p2_id ? 'text-gold' : 'text-white'}`}>{getPlayerName(match.p2_id)}</span>
            {match.winner_id === match.p2_id && <Crown className="w-4 h-4 text-gold" />}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;
  
  const wbRounds = Array.from(new Set(matches.filter(m => m.bracket_type === 'winners').map(m => m.round_number))).sort((a, b) => a - b);
  const lbRounds = Array.from(new Set(matches.filter(m => m.bracket_type === 'losers').map(m => m.round_number))).sort((a, b) => a - b);
  
  const gf1 = matches.find(m => m.bracket_type === 'grand_final' && m.match_index === 0);
  const gf2 = matches.find(m => m.bracket_type === 'grand_final' && m.match_index === 1);

  // Champion Logic: 
  // If GF1 is won by the WB team (p1), they are champion. 
  // If GF1 is won by the LB team (p2), GF2 must be played, and the winner of GF2 is champion.
  let championId = null;
  if (gf2?.winner_id) {
    championId = gf2.winner_id;
  } else if (gf1?.winner_id && gf1.winner_id === gf1.p1_id) {
    championId = gf1.winner_id;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <h2 className="font-display text-3xl text-white">Tournament Bracket</h2>
        {isHost && <span className="bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-xs font-medium">Host Mode Active</span>}
      </div>

      {championId && (
        <div className="mb-12 p-6 bg-gradient-to-r from-gold/20 to-transparent border border-gold/30 rounded-2xl flex items-center gap-4">
          <Crown className="w-10 h-10 text-gold" />
          <div>
            <h3 className="font-display text-2xl text-white">Tournament Champion</h3>
            <p className="text-gold font-medium text-lg">{getPlayerName(championId)}</p>
          </div>
        </div>
      )}

      {/* Winners Bracket */}
      <div className="mb-12">
        <h3 className="font-display text-xl text-gold mb-4">Winners Bracket</h3>
        <div className="flex gap-12 overflow-x-auto pb-4 px-2 custom-scrollbar">
          {wbRounds.map(round => (
            <div key={`wb-${round}`} className="flex flex-col min-w-[280px]">
              <h4 className="text-center font-display text-sm text-[#A1A1AA] mb-4 uppercase tracking-wider">Round {round}</h4>
              <div className="flex flex-col justify-around flex-grow gap-6">
                {matches.filter(m => m.bracket_type === 'winners' && m.round_number === round).map(renderMatchCard)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Losers Bracket */}
      {lbRounds.length > 0 && (
        <div className="mb-12">
          <h3 className="font-display text-xl text-[#A1A1AA] mb-4">Losers Bracket</h3>
          <div className="flex gap-12 overflow-x-auto pb-4 px-2 custom-scrollbar opacity-80 hover:opacity-100 transition-opacity">
            {lbRounds.map(round => (
              <div key={`lb-${round}`} className="flex flex-col min-w-[280px]">
                <h4 className="text-center font-display text-sm text-[#A1A1AA] mb-4 uppercase tracking-wider">Round {round}</h4>
                <div className="flex flex-col justify-around flex-grow gap-6">
                  {matches.filter(m => m.bracket_type === 'losers' && m.round_number === round).map(renderMatchCard)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grand Finals */}
      {gf1 && (
        <div>
          <h3 className="font-display text-xl text-white mb-4 flex items-center gap-2">
            Grand Finals {gf1.p2_id && <span className="text-xs bg-gold text-black px-2 py-0.5 rounded font-bold uppercase tracking-wider">Reset Available</span>}
          </h3>
          <div className="flex gap-6 items-start">
            <div>
              <h4 className="text-center font-display text-sm text-[#A1A1AA] mb-4 uppercase tracking-wider">Match 1</h4>
              {renderMatchCard(gf1)}
            </div>
            
            {gf2 && (
              <div className={`transition-all duration-500 ${gf2.status === 'ready' || gf2.winner_id ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4 pointer-events-none grayscale'}`}>
                <h4 className="text-center font-display text-sm text-gold mb-4 uppercase tracking-wider flex items-center justify-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Reset Match
                </h4>
                {renderMatchCard(gf2)}
                {(!gf2.p1_id || !gf2.p2_id) && <p className="text-xs text-center text-[#A1A1AA] mt-2 max-w-[256px]">Plays only if Losers team wins Match 1.</p>}
              </div>
            )}
          </div>
        </div>
      )}

            <TournamentChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        tournamentId={tournamentId}
        matchId={activeMatchId} // <-- We need to track which match is active
        title={chatTitle} 
      />
    </div>
  );
}