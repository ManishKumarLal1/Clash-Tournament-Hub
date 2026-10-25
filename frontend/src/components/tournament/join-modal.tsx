'use client';

import { useState, useEffect } from 'react';
import { X, Users, Swords, Loader2 } from 'lucide-react';
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
      
      if (data && data.length > 0) {
        setAccounts(data);
        setSelectedAccount(data[0].id);
      }
    };
    fetchAccounts();
  }, [isOpen, supabase]);

  const handleJoin = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      if (tournament.type === '1v1') {
        if (!selectedAccount) throw new Error("Please select an account to join with.");
        const account = accounts.find(a => a.id === selectedAccount);

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
          player_tag: teamData.clanTag, // Use Clan Tag as the main identifier
          player_name: teamData.clanName,
          th_level: 0, // Teams don't have a single TH
          team_name: teamData.clanName,
          team_tag: teamData.clanTag,
          roster_data: teamData.roster,
        });

        if (dbError) {
          if (dbError.code === '23505') throw new Error("This Clan has already joined this tournament.");
          throw new Error(dbError.message);
        }
      }

      alert("Successfully registered!");
      onClose();
      router.refresh(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Check if we can submit
  const canSubmit1v1 = accounts.length > 0 && selectedAccount !== '';
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
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
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
                <p>Select the account you want to use for this 1v1 tournament.</p>
              </div>
              
              <div className="space-y-2">
                {accounts.length === 0 ? (
                   <p className="text-sm text-[#A1A1AA] text-center py-4">No linked accounts found. Go to your Profile to link an account first.</p>
                ) : (
                  accounts.map((acc) => (
                    <div 
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc.id)}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedAccount === acc.id ? 'border-gold/50 bg-gold/5' : 'border-white/10 hover:border-white/20'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold to-yellow-200 flex items-center justify-center font-bold text-black">L</div>
                      <div>
                        <p className="text-sm font-medium text-white">{acc.player_name}</p>
                        <p className="text-xs text-[#A1A1AA] font-mono">{acc.player_tag} • TH{acc.th_level}</p>
                      </div>
                    </div>
                  ))
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