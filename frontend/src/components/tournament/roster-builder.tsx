'use client';

import { useState } from 'react';
import { Check, ShieldAlert, UserPlus, Search } from 'lucide-react';
import { Magnetic } from '@/components/animations/magnetic';

export function RosterBuilder({ requirements }: { requirements: string[] }) {
  const [clanName, setClanName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [roster, setRoster] = useState<{ tag: string, th: string }[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock API database to simulate real player tags
  const MOCK_API_DB: Record<string, string> = {
    '#TH18': '18',
    '#TH17': '17',
    '#TH16': '16',
    '#TH15': '15',
  };

  const handleAddMember = () => {
    setError('');
    if (!inputTag.startsWith('#')) {
      setError('Player tag must start with # (e.g. #TH18)');
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const formattedTag = inputTag.toUpperCase();
      const simulatedTh = MOCK_API_DB[formattedTag];

      if (!simulatedTh) {
        setError('Player not found. Try #TH18, #TH17, #TH16, or #TH15');
        setIsLoading(false);
        return;
      }

      if (roster.some(p => p.tag === formattedTag)) {
        setError('This player is already in the roster.');
        setIsLoading(false);
        return;
      }

      if (roster.length >= requirements.length) {
        setError('Roster is full.');
        setIsLoading(false);
        return;
      }

      const currentSlotIndex = roster.length;
      const requiredTh = requirements[currentSlotIndex];

      if (simulatedTh !== requiredTh) {
        setError(`Player is TH${simulatedTh}, but Slot ${currentSlotIndex + 1} requires TH${requiredTh}.`);
        setIsLoading(false);
        return;
      }

      setRoster([...roster, { tag: formattedTag, th: simulatedTh }]);
      setInputTag('');
      setIsLoading(false);
    }, 600); // 600ms delay
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#A1A1AA]">Clan Name</label>
          <input 
            type="text" 
            placeholder="e.g. Elite Warriors"
            value={clanName}
            onChange={(e) => setClanName(e.target.value)}
            className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#A1A1AA]">Clan Tag</label>
          <input 
            type="text" 
            placeholder="e.g. #2PQL8YR"
            value={clanTag}
            onChange={(e) => setClanTag(e.target.value)}
            className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <div className="h-px w-full bg-white/10" />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <input 
            type="text" 
            placeholder="Enter Player Tag (e.g. #TH18)"
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white font-mono focus:outline-none focus:border-gold/50"
          />
        </div>
        <button 
          onClick={handleAddMember} 
          disabled={isLoading}
          className="px-4 py-2 bg-gold text-black font-bold rounded-xl hover:bg-[#F5C876] transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : <UserPlus className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {requirements.map((reqTh, index) => {
          const player = roster[index];
          return (
            <div key={index} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${player ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5 bg-[#0A0A0F]'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#A1A1AA] w-12">Slot {index + 1}</span>
                <span className="text-sm font-medium text-white">{player ? player.tag : 'Waiting for tag...'}</span>
              </div>
              <div className="flex items-center gap-2">
                {player ? (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> TH{player.th} Verified
                  </span>
                ) : (
                  <span className="text-xs bg-white/5 text-[#A1A1AA] px-2 py-1 rounded border border-white/10">
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