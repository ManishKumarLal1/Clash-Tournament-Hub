'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { Shield, Trophy, Swords, Loader2, ArrowLeft, UserPlus, Check, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { TournamentCard } from '@/components/tournament/tournament-card';
import { DirectMessageChat } from '@/components/chat/direct-message-chat';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [hostedTournaments, setHostedTournaments] = useState<any[]>([]);
  const [joinedTournaments, setJoinedTournaments] = useState<any[]>([]);
  const [stats, setStats] = useState({ won: 0, played: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Social State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends'>('none');
  
  // DM State
  const [dmUser, setDmUser] = useState<any>(null);
  const [isDmOpen, setIsDmOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchPublicProfile = async () => {
      // 0. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 1. Fetch Profile by Username
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !profileData) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }
      setProfile(profileData);

      // 2. Check Friendship Status
      if (user && user.id !== profileData.id) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('*')
          .or(`and(user_id.eq.${user.id},friend_id.eq.${profileData.id}),and(user_id.eq.${profileData.id},friend_id.eq.${user.id})`)
          .maybeSingle();

        if (friendship) {
          setFriendshipStatus(friendship.status === 'accepted' ? 'friends' : 'pending');
        }
      }

      // 3. Fetch their linked accounts (public data only)
      const { data: accountsData } = await supabase
        .from('linked_accounts')
        .select('id, player_name, player_tag, th_level')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: true });
      if (accountsData) setAccounts(accountsData);

      // 4. Fetch Tournaments Hosted
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('host_id', profileData.id)
        .order('created_at', { ascending: false });
      
      if (tournamentsData) {
        setHostedTournaments(tournamentsData.map(t => ({
          ...t,
          joinCode: t.join_code,
          maxPlayers: t.max_players,
          startDate: t.start_date,
          host: profileData.display_name || profileData.username
        })));
      }

      // 5. Fetch Tournaments Joined
      const { data: joinedData } = await supabase
        .from('participants')
        .select(`
          tournament_id,
          tournaments (id, title, status, slug, prize, max_players, start_date)
        `)
        .eq('user_id', profileData.id);

      if (joinedData) {
        // Map to a flat array of tournaments
        const tournaments = joinedData
          .map((p: any) => p.tournaments)
          .filter((t: any) => t !== null);

        // Remove duplicates (in case they joined same tournament twice somehow)
        const uniqueJoined = tournaments.filter(
          (v, i, a) => a.findIndex((t) => t?.id === v?.id) === i
        );

        setJoinedTournaments(uniqueJoined.map((t: any) => ({
          ...t,
          joinCode: 'HIDDEN', // Don't expose join code on public profile
          maxPlayers: t.max_players,
          startDate: t.start_date,
          host: 'Various' // We don't have host name here easily
        })));
      }

      // 6. Calculate Stats (Tournaments Played)
      const { data: participations } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', profileData.id);

      if (participations && participations.length > 0) {
        const participantIds = participations.map(p => p.id);
        const { count } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .in('winner_id', participantIds);
          
        setStats({ won: count || 0, played: participations.length });
      } else {
        setStats({ won: 0, played: 0 });
      }

      setIsLoading(false);
    };

    fetchPublicProfile();
  }, [username, supabase]);

  const handleAddFriend = async () => {
    if (!currentUser || !profile) return;
    
    setFriendshipStatus('pending');
    const { error } = await supabase.from('friendships').insert({
      user_id: currentUser.id,
      friend_id: profile.id,
      status: 'pending'
    });

    if (error) {
      alert("Error sending friend request: " + error.message);
      setFriendshipStatus('none');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl text-white font-display mb-4">User not found</h1>
        <Link href="/friends" className="text-gold hover:underline">Go back to Friends</Link>
      </div>
    );
  }

  const joinedDate = profile.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : 'Recently';

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
      <Link href="/friends" className="inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Community
      </Link>

      <div className="mb-12">
        <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-2">
          {profile.display_name}'s <span className="text-gold">Profile</span>
        </TextReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: User Info */}
        <div className="md:col-span-1 space-y-6">
          <ScrollReveal>
            <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-gold to-yellow-200 rounded-full mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(232,182,90,0.3)]">
                <Shield className="w-12 h-12 text-[#0A0A0F]" />
              </div>
              <h2 className="font-display text-2xl text-white">{profile.display_name}</h2>
              <p className="text-sm text-[#A1A1AA] mb-4">@{profile.username} • Joined {joinedDate}</p>
              
              {/* Social Buttons */}
              {currentUser && currentUser.id !== profile.id && (
                <div className="mb-6">
                  {friendshipStatus === 'none' ? (
                    <button 
                      onClick={handleAddFriend}
                      className="w-full py-2 bg-gold text-black font-bold rounded-lg hover:bg-[#F5C876] transition-colors flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Add Friend
                    </button>
                  ) : friendshipStatus === 'pending' ? (
                    <div className="w-full py-2 bg-white/5 border border-white/10 text-[#A1A1AA] font-bold rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                      Request Pending
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-lg flex items-center justify-center gap-2 cursor-default">
                        <Check className="w-4 h-4" /> Friends
                      </div>
                      <button 
                        onClick={() => { setDmUser(profile); setIsDmOpen(true); }}
                        className="w-full py-2 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" /> Send Message
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div>
                  <p className="text-2xl font-bold text-gold">{stats.won}</p>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Matches Won</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{hostedTournaments.length}</p>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Hosted</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Accounts, Hosted, and Joined */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Linked Accounts */}
          <div>
            <h3 className="font-display text-2xl text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" /> Linked Accounts
            </h3>
            <StaggerList className="space-y-3">
              {accounts.length === 0 ? (
                <p className="text-[#A1A1AA] text-sm bg-[#12121A] p-4 rounded-xl border border-white/5">No accounts linked.</p>
              ) : (
                accounts.map((account, index) => (
                  <div key={account.id} className="flex items-center justify-between bg-[#12121A] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                        <Trophy className={`w-5 h-5 ${index === 0 ? 'text-gold' : 'text-[#A1A1AA]'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{account.player_name}</p>
                        <p className="text-sm text-[#A1A1AA] font-mono">{account.player_tag}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white/5 text-white rounded-full text-xs font-medium border border-white/10">
                      TH {account.th_level}
                    </span>
                  </div>
                ))
              )}
            </StaggerList>
          </div>

          {/* Hosted Tournaments */}
          <div>
            <h3 className="font-display text-2xl text-white mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5 text-gold" /> Hosted Tournaments
            </h3>
            {hostedTournaments.length === 0 ? (
               <p className="text-[#A1A1AA] text-sm bg-[#12121A] p-4 rounded-xl border border-white/5">Has not hosted any tournaments.</p>
            ) : (
              <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hostedTournaments.map((t) => (
                  <TournamentCard key={t.id} tournament={t} />
                ))}
              </StaggerList>
            )}
          </div>

          {/* Joined Tournaments */}
          <div>
            <h3 className="font-display text-2xl text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" /> Joined Tournaments
            </h3>
            {joinedTournaments.length === 0 ? (
               <p className="text-[#A1A1AA] text-sm bg-[#12121A] p-4 rounded-xl border border-white/5">Has not joined any tournaments yet.</p>
            ) : (
              <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {joinedTournaments.map((t) => (
                  <TournamentCard key={t.id} tournament={t} />
                ))}
              </StaggerList>
            )}
          </div>

        </div>
      </div>

      <DirectMessageChat 
        isOpen={isDmOpen} 
        onClose={() => setIsDmOpen(false)} 
        currentUser={currentUser} 
        otherUser={dmUser} 
      />
    </main>
  );
}