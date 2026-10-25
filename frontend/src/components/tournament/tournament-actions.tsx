'use client';

import { useState } from 'react';
import { Magnetic } from '@/components/animations/magnetic';
import { TournamentChat } from '@/components/tournament/tournament-chat';
import { JoinModal } from '@/components/tournament/join-modal';
import { MessageSquare, CheckCircle } from 'lucide-react';

export function TournamentActions({ tournament, hasJoined }: { tournament: any, hasJoined: boolean }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 hover:border-gold/50 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
        >
          <MessageSquare className="w-5 h-5 text-gold" />
          Chat Hub
        </button>
        
        {hasJoined ? (
          <div className="w-full sm:w-auto px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
            <CheckCircle className="w-5 h-5" /> Already Joined
          </div>
        ) : (
          <Magnetic>
            <button 
              onClick={() => setIsJoinOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-gold text-black font-medium rounded-xl hover:scale-105 transition-transform duration-300"
            >
              Join Tournament
            </button>
          </Magnetic>
        )}
      </div>

      // Find the TournamentChat component at the bottom:
<TournamentChat 
  isOpen={isChatOpen} 
  onClose={() => setIsChatOpen(false)} 
  tournamentId={tournament.id}
  title="Tournament Hub Chat" 
/>
      {!hasJoined && (
        <JoinModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} tournament={tournament} />
      )}
    </>
  );
}