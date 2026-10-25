'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { TournamentCard } from '@/components/tournament/tournament-card';
import { Loader2, Plus, Swords, Check, X, Bell } from 'lucide-react';
import Link from 'next/link';
import { Magnetic } from '@/components/animations/magnetic';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  
  const supabase = createClient();
  const router = useRouter();

  const fetchDashboardData = async () => {
    setLoading(true);
    // 1. Get current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 2. Fetch their profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileData) setProfile(profileData);

    // 3. Fetch tournaments hosted by this user
    const { data: tournamentsData } = await supabase
      .from('tournaments')
      .select('*')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false });

    if (tournamentsData) {
      const formattedTournaments = tournamentsData.map(t => ({
        ...t,
        joinCode: t.join_code,
        maxPlayers: t.max_players,
        currentPlayers: t.current_players,
        startDate: t.start_date,
      }));
      setMyTournaments(formattedTournaments);
    }

    // 4. Fetch Pending Clan Invites
    const { data: invitesData } = await supabase
      .from('participants')
      .select(`
        *,
        tournaments (title, start_date, type)
      `)
      // Use JSONB containment to find arrays containing this user with a pending status
      .contains('roster_data', JSON.stringify([{ userId: user.id, status: 'pending' }]));

    if (invitesData) setPendingInvites(invitesData);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleInviteAction = async (invite: any, action: 'accepted' | 'declined') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update the JSONB array
      const updatedRoster = invite.roster_data.map((player: any) => {
        if (player.userId === user.id) {
          return { ...player, status: action };
        }
        return player;
      });

      // 2. Save back to database
      const { error } = await supabase
        .from('participants')
        .update({ roster_data: updatedRoster })
        .eq('id', invite.id);

      if (error) throw error;

      // 3. Update local UI state (remove the invite from the list)
      setPendingInvites(prev => prev.filter(i => i.id !== invite.id));
      
      if (action === 'accepted') {
        alert("Invite accepted! Your captain can now see you are ready.");
      }

    } catch (err: any) {
      alert("Error updating invite: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-2">
            Welcome back, <span className="text-gold">{profile?.display_name || profile?.username || 'Commander'}</span>
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
            Here is an overview of your tournaments and activity.
          </TextReveal>
        </div>

        <ScrollReveal delay={0.2}>
          <Magnetic>
            <Link 
              href="/tournaments/new"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-xl hover:scale-105 transition-transform duration-300"
            >
              <Plus className="w-5 h-5" /> Create New
            </Link>
          </Magnetic>
        </ScrollReveal>
      </div>

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-gold" /> Team Invitations
          </h2>
          <StaggerList className="space-y-4">
            {pendingInvites.map((invite: any) => (
              <div key={invite.id} className="bg-[#12121A] border border-gold/30 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
                
                <div>
                  <p className="text-gold text-sm font-medium mb-1">Invitation to Join Team</p>
                  <h3 className="text-xl font-bold text-white mb-2">
                    <span className="text-gold">{invite.player_name}</span> ({invite.player_tag})
                  </h3>
                  <p className="text-sm text-[#A1A1AA]">
                    Tournament: <Link href={`/tournaments/${invite.tournaments.title.toLowerCase().replace(/ /g, '-')}`} className="text-white hover:underline">{invite.tournaments.title}</Link> • Starts {invite.tournaments.start_date}
                  </p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleInviteAction(invite, 'declined')}
                    className="flex-1 md:flex-none px-6 py-2 border border-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button 
                    onClick={() => handleInviteAction(invite, 'accepted')}
                    className="flex-1 md:flex-none px-6 py-2 bg-gold text-black font-bold rounded-lg hover:bg-[#F5C876] transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Accept
                  </button>
                </div>
              </div>
            ))}
          </StaggerList>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <ScrollReveal delay={0.1}>
          <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
              <Swords className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{myTournaments.length}</p>
              <p className="text-sm text-[#A1A1AA]">Tournaments Hosted</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* My Hosted Tournaments */}
      <div>
        <h2 className="font-display text-2xl text-white mb-6">Your Tournaments</h2>
        
        {myTournaments.length > 0 ? (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </StaggerList>
        ) : (
          <div className="bg-[#12121A] border border-white/5 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Swords className="w-8 h-8 text-[#A1A1AA]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No tournaments yet</h3>
            <p className="text-[#A1A1AA] mb-6 max-w-sm">You haven't hosted any tournaments. Create your first one and invite your friends!</p>
            <Link href="/tournaments/new" className="text-gold hover:underline font-medium">
              Host a Tournament
            </Link>
          </div>
        )}
      </div>

    </main>
  );
}