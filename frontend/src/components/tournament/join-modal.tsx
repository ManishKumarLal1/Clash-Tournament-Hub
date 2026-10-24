'use client';

import { X, Users, Swords } from 'lucide-react';
import { Magnetic } from '@/components/animations/magnetic';
import { RosterBuilder } from './roster-builder';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: any;
}

export function JoinModal({ isOpen, onClose, tournament }: JoinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-[#12121A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0A0A0F]">
          <div>
            <h2 className="font-display text-2xl text-white">Join Tournament</h2>
            <p className="text-sm text-[#A1A1AA] mt-1">{tournament.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {tournament.type === 'clan_vs_clan' ? (
            <div className="space-y-4">
              <div className="bg-gold/10 border border-gold/20 p-4 rounded-xl flex gap-3 text-sm text-gold">
                <Users className="w-5 h-5 flex-shrink-0" />
                <p>This is a <strong>{tournament.warType}</strong> Clan vs Clan tournament. You must provide a roster that matches the required TH composition.</p>
              </div>
              <RosterBuilder requirements={tournament.thRequirements} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-3 text-sm text-white">
                <Swords className="w-5 h-5 text-gold flex-shrink-0" />
                <p>Select the account you want to use for this 1v1 tournament.</p>
              </div>
              
              {/* Mock Account Selector */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 border border-gold/50 bg-gold/5 rounded-lg cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold to-yellow-200 flex items-center justify-center font-bold text-black">L</div>
                  <div>
                    <p className="text-sm font-medium text-white">Legendary King</p>
                    <p className="text-xs text-[#A1A1AA] font-mono">#2PQL8YRV • TH16</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-[#0A0A0F] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <Magnetic>
            <button 
              onClick={() => {
                alert('Successfully registered! (Mock)');
                onClose();
              }}
              className="px-6 py-2 bg-gold text-black font-bold rounded-xl hover:bg-[#F5C876] transition-colors"
            >
              Confirm Registration
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}