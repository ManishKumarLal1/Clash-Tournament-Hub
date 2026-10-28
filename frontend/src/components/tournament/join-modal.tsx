'use client';

import { useState, useEffect } from 'react';
import { X, Users, Swords, Loader2, ShieldAlert } from 'lucide-react';
import { Magnetic } from '@/components/animations/magnetic';
import { RosterBuilder } from './roster-builder';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function JoinModal({ isOpen, onClose, tournament }: { isOpen: boolean, onClose: () => void, tournament: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [error, setError] = useState('');

  // Clan vs Clan State
  const [teamData, setTeamData] = useState<{ clanName: string; clanTag: string; roster: any[] }>({
    clanName: '',
    clanTag: '',
    roster: []
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const fetchAccounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('user_id', user.id);
      
      if (data) {
        setAccounts(data);
        // Auto-select the first ELIGIBLE account (if any)
        const firstEligible = data.find(acc => 
          tournament.type !== '1v1' || 
          !tournament.thRestriction || 
          acc.th_level === tournament.thRestriction
        );
        if (firstEligible) {
          setSelectedAccount(firstEligible.id);
        }
      }
    };
    fetchAccounts();
  }, [isOpen, supabase, tournament]);

  const handleJoin = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      if (tournament.type === '1v1') {
        if (!selectedAccount) throw new Error("Please select an account to join with.");
        
        const account = accounts.find(a => a.id === selectedAccount);

        // --- VALIDATION LOGIC ---
        if (tournament.thRestriction && account.th_level !== tournament.thRestriction) {
          throw new Error(`This tournament is restricted to Town Hall ${tournament.thRestriction}. Your account is TH${account.th_level}.`);
        }

        // Save to database
        const { error: dbError } = await supabase.from('participants').insert({
          tournament_id: tournament.id,
          user_id: user.id,
          player_tag: account.player_tag,
          player_name: account.player_name,
          th_level: account.th_level,
        });

        if (dbError) {
          if (dbError.code === '23505') throw new Error("You have already joined this tournament.");
          throw new Error(dbError.message);
        }
      } else {
        // CLAN VS CLAN INSERT
        if (!teamData.clanName || !teamData.clanTag) throw new Error("Please provide Clan Name and Tag.");
        if (teamData.roster.length !== tournament.thRequirements.length) throw new Error("Roster is not complete.");

        const { error: dbError } = await supabase.from('participants').insert({
          tournament_id: tournament.id,
          user_id: user.id,
          player_tag: teamData.clanTag, 
          player_name: teamData.clanName,
          th_level: 0, 
          team_name: teamData.clanName,
          team_tag: teamData.clanTag,
          roster_data: teamData.roster,
        });

        if (dbError) {
          if (dbError.code === '23505') throw new Error("This Clan has already joined this tournament.");
          throw new Error(dbError.message);
        }
      }

      onClose();
      router.refresh(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canSubmit1v1 = accounts.length > 0 && selectedAccount !== '' && !error;
  const canSubmitClan = teamData.clanName && teamData.clanTag && teamData.roster.length === (tournament.thRequirements?.length || 0);
  const isButtonDisabled = isSubmitting || (tournament.type === '1v1' ? !canSubmit1v1 : !canSubmitClan);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#12121A] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0A0A0F]">
          <div>
            <h2 className="font-display text-2xl text-white">Join Tournament</h2>
            <p className="text-sm text-[#A1A1AA] mt-1">{tournament.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {tournament.type === 'clan_vs_clan' ? (
             <RosterBuilder 
               tournamentId={tournament.id}
               requirements={tournament.thRequirements || []} 
               onRosterChange={setTeamData}
             />
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-3 text-sm text-white">
                <Swords className="w-5 h-5 text-gold flex-shrink-0" />
                <div>
                  <p>Select the account you want to use.</p>
                  {tournament.thRestriction && (
                    <p className="text-gold mt-1 font-medium">Requires Town Hall {tournament.thRestriction}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {accounts.length === 0 ? (
                   <p className="text-sm text-[#A1A1AA] text-center py-4">No linked accounts found. Go to your Profile to link an account first.</p>
                ) : (
                  accounts.map((acc) => {
                    const isEligible = !tournament.thRestriction || acc.th_level === tournament.thRestriction;
                    
                    return (
                      <div 
                        key={acc.id}
                        onClick={() => {
                          if (isEligible) {
                            setSelectedAccount(acc.id);
                            setError(''); // Clear errors when selecting a valid account
                          }
                        }}
                        className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                          !isEligible ? 'opacity-50 cursor-not-allowed border-white/5 bg-black/20' : 
                          selectedAccount === acc.id ? 'border-gold/50 bg-gold/5 cursor-pointer' : 
                          'border-white/10 hover:border-white/20 cursor-pointer'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isEligible ? 'bg-gradient-to-tr from-gold to-yellow-200 text-black' : 'bg-white/10 text-white'}`}>
                          {acc.player_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{acc.player_name}</p>
                          <p className="text-xs text-[#A1A1AA] font-mono">{acc.player_tag} • TH{acc.th_level}</p>
                        </div>
                        {!isEligible && (
                          <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                            Ineligible
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-[#0A0A0F] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <Magnetic>
            <button 
              onClick={handleJoin}
              disabled={isButtonDisabled}
              className="px-6 py-2 bg-gold text-black font-bold rounded-xl hover:bg-[#F5C876] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Registration'}
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}