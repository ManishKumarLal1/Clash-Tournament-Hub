'use client';

import { useState } from 'react';
import { TextReveal } from '@/components/animations/text-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { Magnetic } from '@/components/animations/magnetic';
import { Search, UserPlus, Check, X, Swords } from 'lucide-react';

const MOCK_REQUESTS = [
  { id: '1', name: 'BarbarianKing', tag: '#8YV2QLP', th: 16 },
  { id: '2', name: 'ArcherQueen', tag: '#2PQL8YR', th: 15 },
];

const MOCK_FRIENDS = [
  { id: '1', name: 'ClashKing', tag: '#9XYZ123', th: 16, status: 'In Tournament' },
  { id: '2', name: 'WarLord', tag: '#7ABC456', th: 16, status: 'Online' },
  { id: '3', name: 'NightOwl', tag: '#3DEF789', th: 15, status: 'Offline' },
];

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-2">
            Your <span className="text-gold">Friends</span>
          </TextReveal>
          <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
            Add players to coordinate matches and share tournaments.
          </TextReveal>
        </div>

        <ScrollReveal delay={0.2} className="w-full md:w-72">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
            <input 
              type="text" 
              placeholder="Search by name or #tag"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#12121A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
            />
          </div>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Friend Requests */}
        <div>
          <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gold" /> Pending Requests
          </h2>
          <StaggerList className="space-y-4">
            {MOCK_REQUESTS.map((req) => (
              <div key={req.id} className="flex items-center justify-between bg-[#12121A] border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                    {req.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{req.name}</p>
                    <p className="text-xs text-[#A1A1AA] font-mono">{req.tag} • TH{req.th}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </StaggerList>
        </div>

        {/* Friends List */}
        <div>
          <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
            <Swords className="w-5 h-5 text-gold" /> My Friends
          </h2>
          <StaggerList className="space-y-4">
            {MOCK_FRIENDS.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between bg-[#12121A] border border-white/5 p-4 rounded-xl hover:border-gold/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold to-yellow-200 flex items-center justify-center text-sm font-bold text-[#0A0A0F]">
                      {friend.name.charAt(0)}
                    </div>
                    {/* Status Dot */}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12121A] ${
                      friend.status === 'Online' ? 'bg-emerald-500' : 
                      friend.status === 'In Tournament' ? 'bg-gold' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-gold transition-colors">{friend.name}</p>
                    <p className="text-xs text-[#A1A1AA] font-mono">{friend.tag}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-[#A1A1AA]">{friend.status}</span>
                </div>
              </div>
            ))}
          </StaggerList>
        </div>

      </div>
    </main>
  );
}