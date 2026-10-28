'use client';

import { useState } from 'react';
import { X, Swords } from 'lucide-react';
import { Magnetic } from '@/components/animations/magnetic';

export function WarStatsModal({ isOpen, onClose, match, onSubmit }: { 
  isOpen: boolean, 
  onClose: () => void, 
  match: any, 
  onSubmit: (data: any) => void 
}) {
  const [team1Stars, setTeam1Stars] = useState(0);
  const [team1Destruction, setTeam1Destruction] = useState(0);
  const [team2Stars, setTeam2Stars] = useState(0);
  const [team2Destruction, setTeam2Destruction] = useState(0);

  if (!isOpen || !match) return null;

  const handleSubmit = () => {
    onSubmit({
      team1: { stars: team1Stars, destruction: team1Destruction },
      team2: { stars: team2Stars, destruction: team2Destruction },
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#12121A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0A0A0F]">
          <h2 className="font-display text-xl text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-gold" /> Report War Results
          </h2>
          <button onClick={onClose} className="text-[#A1A1AA] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Team 1 */}
          <div className="bg-[#0A0A0F] p-4 rounded-xl border border-white/5">
            <h3 className="text-gold font-medium mb-3">Team 1</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#A1A1AA] mb-1 block">Stars</label>
                <input type="number" min="0" max="15" value={team1Stars} onChange={e => setTeam1Stars(parseInt(e.target.value) || 0)} className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold/50" />
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] mb-1 block">Destruction %</label>
                <input type="number" min="0" max="100" step="0.1" value={team1Destruction} onChange={e => setTeam1Destruction(parseFloat(e.target.value) || 0)} className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold/50" />
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-[#0A0A0F] p-4 rounded-xl border border-white/5">
            <h3 className="text-[#A1A1AA] font-medium mb-3">Team 2</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#A1A1AA] mb-1 block">Stars</label>
                <input type="number" min="0" max="15" value={team2Stars} onChange={e => setTeam2Stars(parseInt(e.target.value) || 0)} className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold/50" />
              </div>
              <div>
                <label className="text-xs text-[#A1A1AA] mb-1 block">Destruction %</label>
                <input type="number" min="0" max="100" step="0.1" value={team2Destruction} onChange={e => setTeam2Destruction(parseFloat(e.target.value) || 0)} className="w-full bg-[#12121A] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#0A0A0F] flex justify-end">
          <Magnetic>
            <button onClick={handleSubmit} className="px-6 py-2 bg-gold text-black font-bold rounded-xl hover:bg-[#F5C876] transition-colors">
              Calculate Winner
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}