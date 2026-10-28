'use client';

import { X, Shield, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export function TeamDetailsModal({ isOpen, onClose, team }: { isOpen: boolean, onClose: () => void, team: any }) {
  if (!isOpen || !team) return null;

  // The roster_data is an array of objects: { tag, th, userId, username, status }
  const roster = team.roster_data || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#12121A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-white/10 bg-[#0A0A0F]">
          <div>
            <h2 className="font-display text-2xl text-white">{team.player_name}</h2>
            <p className="text-sm text-gold font-mono">{team.player_tag}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roster List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
          <h3 className="text-sm font-medium text-[#A1A1AA] mb-2 uppercase tracking-wider">Team Roster</h3>
          
          {roster.length === 0 ? (
            <p className="text-[#A1A1AA] text-sm text-center py-4">Roster data unavailable.</p>
          ) : (
            roster.map((player: any, index: number) => (
              <Link 
                key={index} 
                href={`/profile/${player.username || 'unknown'}`}
                className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-[#0A0A0F] hover:border-gold/30 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-gold transition-colors">
                      @{player.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-[#A1A1AA] font-mono">{player.tag}</p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-xs font-medium text-white bg-white/10 px-2 py-0.5 rounded">
                    TH{player.th}
                  </span>
                  {player.status === 'accepted' ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Ready</span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}