'use client';

import { MessageSquare, Crown } from 'lucide-react';
import { Match } from '@/lib/bracket-engine';

interface MatchCardProps {
  match: Match;
  isHost: boolean;
  onAdvanceWinner: (matchId: string, playerId: string, nextMatchId: string | null) => void;
  onOpenMatchChat: (matchName: string) => void;
}

export function MatchCard({ match, isHost, onAdvanceWinner, onOpenMatchChat }: MatchCardProps) {
  if (!match.p1 && !match.p2) return <div className="w-64 h-[88px] bg-white/5 border border-white/5 rounded-xl border-dashed" />; 

  const handleAdvance = (playerId: string) => {
    if (!isHost || match.winnerId || playerId === 'bye') return;
    onAdvanceWinner(match.id, playerId, match.nextMatchId);
  };

  return (
    <div className="relative group w-64 bg-[#12121A] border border-white/5 rounded-xl overflow-hidden hover:border-gold/30 transition-all">
      
      {/* Match Chat Button (Hide if BYE) */}
      {match.p1?.id !== 'bye' && match.p2?.id !== 'bye' && (
        <button 
          onClick={() => onOpenMatchChat(`${match.p1?.name || 'TBD'} vs ${match.p2?.name || 'TBD'}`)}
          className="absolute right-2 top-2 p-1.5 bg-white/5 rounded-md text-[#A1A1AA] hover:text-gold hover:bg-white/10 transition-colors z-10"
          title="Open Match Chat"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col">
        {/* Player 1 */}
        <div 
          onClick={() => handleAdvance(match.p1?.id || '')}
          className={`flex items-center justify-between p-3 border-b border-white/5 
            ${isHost && !match.winnerId && match.p1?.id !== 'bye' ? 'cursor-pointer hover:bg-white/5' : ''} 
            ${match.winnerId === match.p1?.id ? 'bg-gold/10' : ''}
            ${match.p1?.id === 'bye' ? 'opacity-30' : ''}
          `}
        >
          <span className={`text-sm font-medium ${match.winnerId === match.p1?.id ? 'text-gold' : 'text-white'}`}>
            {match.p1?.name || 'TBD'}
          </span>
          {match.winnerId === match.p1?.id && <Crown className="w-4 h-4 text-gold" />}
        </div>

        {/* Player 2 */}
        <div 
          onClick={() => handleAdvance(match.p2?.id || '')}
          className={`flex items-center justify-between p-3 
            ${isHost && !match.winnerId && match.p2?.id !== 'bye' ? 'cursor-pointer hover:bg-white/5' : ''} 
            ${match.winnerId === match.p2?.id ? 'bg-gold/10' : ''}
            ${match.p2?.id === 'bye' ? 'opacity-30' : ''}
          `}
        >
          <span className={`text-sm font-medium ${match.winnerId === match.p2?.id ? 'text-gold' : 'text-white'}`}>
            {match.p2?.name || 'TBD'}
          </span>
          {match.winnerId === match.p2?.id && <Crown className="w-4 h-4 text-gold" />}
        </div>
      </div>
    </div>
  );
}