'use client';

import { useState } from 'react';
import { Check, X, ShieldAlert, UserPlus } from 'lucide-react';

// Mock rules from the tournament creation
const REQUIRED_COMPOSITION = ['18', '17', '17', '16', '16'];

export function RosterBuilder() {
  const [roster, setRoster] = useState<{ tag: string, th: string }[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [error, setError] = useState('');

  const handleAddMember = () => {
    setError('');
    // 1. Simulate fetching from Clash of Clans API
    // For this example, we'll randomize a TH level to simulate the API response
    const simulatedTh = Math.floor(Math.random() * (18 - 15 + 1) + 15).toString(); 
    
    // 2. Check if we already have enough players
    if (roster.length >= REQUIRED_COMPOSITION.length) {
      setError('Roster is full.');
      return;
    }

    // 3. Validate TH level against the specific slot requirement
    const currentSlotIndex = roster.length;
    const requiredTh = REQUIRED_COMPOSITION[currentSlotIndex];

    if (simulatedTh !== requiredTh) {
      setError(`Player is TH${simulatedTh}, but Slot ${currentSlotIndex + 1} requires TH${requiredTh}.`);
      return;
    }

    // 4. Add to roster
    setRoster([...roster, { tag: inputTag, th: simulatedTh }]);
    setInputTag('');
  };

  return (
    <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6">
      <h3 className="font-display text-xl text-white mb-2">Submit Your Roster</h3>
      <p className="text-sm text-[#A1A1AA] mb-6">Enter your clan members' Player Tags. We will automatically verify their Town Hall level via the CoC API.</p>

      {/* Input Area */}
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="#PlayerTag"
          value={inputTag}
          onChange={(e) => setInputTag(e.target.value)}
          className="flex-1 bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-2 text-white font-mono"
        />
        <button onClick={handleAddMember} className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg">
          <ShieldAlert className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Slots */}
      <div className="space-y-2">
        {REQUIRED_COMPOSITION.map((reqTh, index) => {
          const player = roster[index];
          return (
            <div key={index} className="flex items-center justify-between p-3 border border-white/5 rounded-lg bg-[#0A0A0F]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#A1A1AA] w-12">Slot {index + 1}</span>
                <span className="text-sm font-medium text-white">{player ? player.tag : 'Empty'}</span>
              </div>
              <div className="flex items-center gap-2">
                {player ? (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3" /> TH{player.th} Verified
                  </span>
                ) : (
                  <span className="text-xs bg-white/5 text-[#A1A1AA] px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                    Requires TH{reqTh}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}