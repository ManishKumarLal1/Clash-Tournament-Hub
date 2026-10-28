'use client';

import { useState } from 'react';
import { Check, ShieldAlert, UserPlus, Search, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface RosterBuilderProps {
  tournamentId: string;
  requirements: string[];
  onRosterChange: (data: { clanName: string; clanTag: string; roster: any[] }) => void;
}

export function RosterBuilder({ tournamentId, requirements = [], onRosterChange }: RosterBuilderProps) {
  const [clanName, setClanName] = useState('');
  const [clanTag, setClanTag] = useState('');
  const [roster, setRoster] = useState<{ tag: string, th: string, userId: string, username: string, status: string }[]>([]);
  
  const [inputTag, setInputTag] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleUpdate = (newRoster: any[], newName = clanName, newTag = clanTag) => {
    setRoster(newRoster);
    onRosterChange({ clanName: newName, clanTag: newTag, roster: newRoster });
  };

      const handleAddMember = async () => {
    setError('');
    if (!inputTag.startsWith('#')) {
      setError('Player tag must start with #');
      return;
    }

    setIsLoading(true);
    const formattedTag = inputTag.toUpperCase();
    
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

    try {
      // 1. Fetch live player data from your backend proxy
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/player?tag=${encodeURIComponent(formattedTag)}`);
      const result = await res.json();

      if (!result.success) {
        throw new Error('Player tag not found in Clash of Clans.');
      }

      const liveTH = result.data.townHallLevel;
      const requiredTh = parseInt(requirements[roster.length]);

      // 2. Check if their real-time TH matches the tournament rules
      if (liveTH !== requiredTh) {
        throw new Error(`Player is TH${liveTH}, but Slot ${roster.length + 1} requires TH${requiredTh}.`);
      }

      // 3. Check if user is registered on your site
      const { data: linkedAccount, error: dbError } = await supabase
        .from('linked_accounts')
        .select('*, profiles:user_id (username)')
        .eq('player_tag', formattedTag)
        .single();

      if (dbError || !linkedAccount) {
        throw new Error('Player is not registered on ClashHub. They must link this account first.');
      }

      // 4. Check for duplicate joining
      const { data: existingEntry } = await supabase
        .from('participants')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', linkedAccount.user_id)
        .maybeSingle();

      if (existingEntry) {
        throw new Error('This player has already joined this tournament.');
      }

      // 5. Add to roster
      const newRoster = [...roster, { 
        tag: formattedTag, 
        th: liveTH.toString(), 
        userId: linkedAccount.user_id,
        username: linkedAccount.profiles?.username || 'unknown',
        status: 'pending' 
      }];
      
      handleUpdate(newRoster);
      setInputTag('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = (index: number) => {
    const newRoster = roster.filter((_, i) => i !== index);
    handleUpdate(newRoster);
  };

  return (
    <div className="space-y-6">
      {/* Clan Details */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#A1A1AA]">Clan Name</label>
          <input 
            type="text" 
            placeholder="e.g. Elite Warriors"
            value={clanName}
            onChange={(e) => { setClanName(e.target.value); handleUpdate(roster, e.target.value, clanTag); }}
            className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gold/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#A1A1AA]">Clan Tag</label>
          <input 
            type="text" 
            placeholder="e.g. #2PQL8YR"
            value={clanTag}
            onChange={(e) => { setClanTag(e.target.value); handleUpdate(roster, clanName, e.target.value); }}
            className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
          <input 
            type="text" 
            placeholder="Enter Player Tag (Must be registered)"
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
            className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white font-mono focus:outline-none focus:border-gold/50"
          />
        </div>
        <button 
          onClick={handleAddMember} 
          disabled={isLoading || !clanName || !clanTag}
          className="px-4 py-2 bg-gold text-black font-bold rounded-xl hover:bg-[#F5C876] transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Slots */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {requirements.map((reqTh, index) => {
          const player = roster[index];
          return (
            <div key={index} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${player ? 'border-gold/30 bg-gold/5' : 'border-white/5 bg-[#0A0A0F]'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#A1A1AA] w-12">Slot {index + 1}</span>
                <span className="text-sm font-medium text-white">{player ? `@${player.username} (${player.tag})` : 'Waiting for tag...'}</span>
              </div>
              <div className="flex items-center gap-2">
                {player ? (
                  <>
                    <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded border border-gold/20 flex items-center gap-1">
                      Pending Approval
                    </span>
                    <button onClick={() => handleRemoveMember(index)} className="text-red-400 hover:text-red-300 ml-2 text-xs font-medium">Remove</button>
                  </>
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