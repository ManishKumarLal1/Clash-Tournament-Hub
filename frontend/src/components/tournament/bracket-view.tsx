'use client';

import { useState, useEffect } from 'react';
import { Match, Player, generateBracket } from '@/lib/bracket-engine';
import { MatchCard } from './match-card';
import { TournamentChat } from './tournament-chat';
import { Trophy } from 'lucide-react';

// 6 Players to test the BYE system (Next power of 2 is 8, so 2 BYEs)
const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'ClashKing' }, { id: 'p2', name: 'WarLord' },
  { id: 'p3', name: 'NightOwl' }, { id: 'p4', name: 'ProClasher' },
  { id: 'p5', name: 'DragonSlayer' }, { id: 'p6', name: 'ElixirThief' },
];

export function BracketView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState('Tournament Chat');
  const isHost = true; 

  useEffect(() => {
    setMatches(generateBracket(MOCK_PLAYERS));
  }, []);

  const handleAdvanceWinner = (matchId: string, playerId: string, nextMatchId: string | null) => {
    setMatches((prevMatches) => {
      const updated = prevMatches.map((m) => 
        m.id === matchId ? { ...m, winnerId: playerId } : m
      );

      // If it's the final match, don't try to advance further
      if (!nextMatchId) return updated; 

      const winningPlayer = MOCK_PLAYERS.find((p) => p.id === playerId);
      
      return updated.map((m) => {
        if (m.id === nextMatchId) {
          if (!m.p1) return { ...m, p1: winningPlayer || null };
          if (!m.p2) return { ...m, p2: winningPlayer || null };
        }
        return m;
      });
    });
  };

  const openChat = (title: string) => {
    setChatTitle(title);
    setIsChatOpen(true);
  };

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  const finalMatch = matches.find(m => m.round === rounds[rounds.length - 1]);

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semifinals';
    if (round === totalRounds - 2) return 'Quarterfinals';
    return `Round ${round}`;
  };

  if (matches.length === 0) return <div className="text-center text-[#A1A1AA] py-12">Generating Random Bracket...</div>;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display text-3xl text-white">Tournament Bracket</h2>
          <p className="text-sm text-[#A1A1AA] mt-1">Randomized matching with BYEs</p>
        </div>
        {isHost && (
          <span className="bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-xs font-medium">
            Host Mode: Click a player to advance them
          </span>
        )}
      </div>

      {/* Champion Banner */}
      {finalMatch?.winnerId && (
        <div className="mb-12 p-6 bg-gradient-to-r from-gold/20 to-transparent border border-gold/30 rounded-2xl flex items-center gap-4">
          <Trophy className="w-10 h-10 text-gold" />
          <div>
            <h3 className="font-display text-2xl text-white">Tournament Champion</h3>
            <p className="text-gold font-medium text-lg">
              {/* ADDED ?. TO p1.name AND p2.name BELOW */}
              {finalMatch.p1?.id === finalMatch.winnerId ? finalMatch.p1?.name : finalMatch.p2?.name}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-12 overflow-x-auto pb-8 pt-4 px-2 custom-scrollbar">
        {rounds.map((round) => {
          const roundMatches = matches.filter((m) => m.round === round);
          return (
            <div key={round} className="flex flex-col min-w-[280px]">
              <h3 className="text-center font-display text-lg text-[#A1A1AA] mb-6">
                {getRoundName(round, rounds.length)}
              </h3>
              <div className="flex flex-col justify-around flex-grow gap-6">
                {roundMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isHost={isHost}
                    onAdvanceWinner={handleAdvanceWinner}
                    onOpenMatchChat={openChat}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <TournamentChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        title={chatTitle} 
      />
    </div>
  );
}