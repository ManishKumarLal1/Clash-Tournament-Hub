'use client';

import { useState, useEffect } from 'react';
import { TextReveal } from '@/components/animations/text-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Search, Loader2, Users, UserPlus, Check, X, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { DirectMessageChat } from '@/components/chat/direct-message-chat';

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [friendships, setFriendships] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // DM State
  const [dmUser, setDmUser] = useState<any>(null);
  const [isDmOpen, setIsDmOpen] = useState(false);
  
  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    // 1. Fetch all users (excluding self)
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .neq('id', user.id)
      .order('created_at', { ascending: false });
    if (usersData) setUsers(usersData);

    // 2. Fetch all friendships involving the current user
    const { data: friendsData } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    if (friendsData) setFriendships(friendsData);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleAddFriend = async (targetId: string) => {
    if (!currentUser) return;
    
    const tempId = Math.random().toString();
    const newRequest = { id: tempId, user_id: currentUser.id, friend_id: targetId, status: 'pending' };
    setFriendships([...friendships, newRequest]);

    const { error, data } = await supabase.from('friendships').insert({
      user_id: currentUser.id,
      friend_id: targetId,
      status: 'pending'
    }).select().single();

    if (error) {
      alert("Error sending request: " + error.message);
      setFriendships(friendships.filter(f => f.id !== tempId));
    } else {
      setFriendships(prev => prev.map(f => f.id === tempId ? data : f));
    }
  };

  const handleAccept = async (requestId: string) => {
    setFriendships(friendships.map(f => f.id === requestId ? { ...f, status: 'accepted' } : f));
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId);
    if (error) {
      alert("Error accepting request.");
      fetchData();
    }
  };

  const handleDeclineOrRemove = async (requestId: string) => {
    setFriendships(friendships.filter(f => f.id !== requestId));
    const { error } = await supabase.from('friendships').delete().eq('id', requestId);
    if (error) {
      alert("Error removing friend/request.");
      fetchData();
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    );
  });

  // Split into Pending Requests and Friends
  const incomingRequests = friendships.filter(f => f.status === 'pending' && f.friend_id === currentUser?.id);
  const myFriends = friendships.filter(f => f.status === 'accepted');

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-2">
            Community <span className="text-gold">Hub</span>
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
            Find players, make friends, and build your network.
          </TextReveal>
        </div>

        <ScrollReveal delay={0.2} className="w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input 
              type="text" 
              placeholder="Search by @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12121A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Sidebar: Requests & Friends */}
        <div className="lg:col-span-1 space-y-8">
          {/* Incoming Requests */}
          {incomingRequests.length > 0 && (
            <div>
              <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold" /> Requests ({incomingRequests.length})
              </h2>
              <div className="space-y-3">
                {incomingRequests.map(req => {
                  const sender = users.find(u => u.id === req.user_id);
                  if (!sender) return null;
                  return (
                    <div key={req.id} className="bg-[#12121A] border border-gold/30 p-3 rounded-xl flex items-center justify-between">
                      <Link href={`/profile/${sender.username}`} className="text-sm text-white hover:text-gold font-medium truncate">
                        @{sender.username}
                      </Link>
                      <div className="flex gap-1">
                        <button onClick={() => handleAccept(req.id)} className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleDeclineOrRemove(req.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div>
            <h2 className="font-display text-xl text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" /> My Friends ({myFriends.length})
            </h2>
            <div className="space-y-3">
              {myFriends.length === 0 ? (
                <p className="text-sm text-[#A1A1AA]">You haven't added any friends yet.</p>
              ) : (
                myFriends.map(f => {
                  const friendId = f.user_id === currentUser?.id ? f.friend_id : f.user_id;
                  const friend = users.find(u => u.id === friendId);
                  if (!friend) return null;
                  return (
                    <div key={f.id} className="bg-[#12121A] border border-white/5 p-3 rounded-xl flex items-center justify-between group">
                      <Link href={`/profile/${friend.username}`} className="text-sm text-white hover:text-gold font-medium truncate">
                        @{friend.username}
                      </Link>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setDmUser(friend); setIsDmOpen(true); }}
                          className="p-1.5 bg-gold/10 text-gold hover:bg-gold hover:text-black rounded transition-colors"
                          title="Message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeclineOrRemove(f.id)} className="text-xs text-[#A1A1AA] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: All Users Directory */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl text-white mb-6">All Players</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
          ) : filteredUsers.length > 0 ? (
            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredUsers.map((user) => {
                const relationship = friendships.find(
                  f => (f.user_id === currentUser?.id && f.friend_id === user.id) || 
                       (f.friend_id === currentUser?.id && f.user_id === user.id)
                );
                
                return (
                  <div key={user.id} className="bg-[#12121A] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                    <Link href={`/profile/${user.username}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold to-yellow-200 flex items-center justify-center text-sm font-bold text-[#0A0A0F]">
                        {user.display_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-gold transition-colors">{user.display_name}</p>
                        <p className="text-xs text-[#A1A1AA] font-mono">@{user.username}</p>
                      </div>
                    </Link>

                    <div>
                      {!relationship ? (
                        <button 
                          onClick={() => handleAddFriend(user.id)}
                          className="p-2 bg-gold/10 text-gold hover:bg-gold hover:text-black rounded-lg transition-colors"
                          title="Add Friend"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      ) : relationship.status === 'pending' ? (
                        <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">Pending</span>
                      ) : (
                        <button 
                          onClick={() => { setDmUser(user); setIsDmOpen(true); }}
                          className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-1"
                          title="Message"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </StaggerList>
          ) : (
            <div className="text-center py-20 bg-[#12121A] border border-white/5 rounded-2xl flex flex-col items-center">
              <Users className="w-12 h-12 text-[#A1A1AA] mb-4" />
              <p className="text-[#A1A1AA] text-lg mb-2">No users found</p>
            </div>
          )}
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