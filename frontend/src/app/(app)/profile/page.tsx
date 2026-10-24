import { TextReveal } from '@/components/animations/text-reveal';
import { ScrollReveal } from '@/components/animations/scroll-reveal';
import { StaggerList } from '@/components/animations/stagger-list';
import { Magnetic } from '@/components/animations/magnetic';
import { Shield, Trophy, Swords, Plus } from 'lucide-react';

export default function ProfilePage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="mb-12">
        <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-2">
          My <span className="text-gold">Profile</span>
        </TextReveal>
        <TextReveal as="p" delay={0.1} className="text-[#A1A1AA]">
          Manage your linked accounts and view your tournament history.
        </TextReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & User Info */}
        <div className="md:col-span-1 space-y-6">
          <ScrollReveal>
            <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-gold to-yellow-200 rounded-full mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(232,182,90,0.3)]">
                <Shield className="w-12 h-12 text-[#0A0A0F]" />
              </div>
              <h2 className="font-display text-2xl text-white">ProClasher</h2>
              <p className="text-sm text-[#A1A1AA] mb-6">Joined Oct 2026</p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div>
                  <p className="text-2xl font-bold text-gold">12</p>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Wins</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">4</p>
                  <p className="text-xs text-[#A1A1AA] uppercase tracking-wide">Hosted</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Linked Accounts */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-display text-2xl text-white">Linked Accounts</h3>
          </div>

          <StaggerList className="space-y-4">
            {/* Account Card 1 */}
            <div className="flex items-center justify-between bg-[#12121A] border border-white/5 p-4 rounded-xl hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                  <Trophy className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-white text-lg">Legendary King</p>
                  <p className="text-sm text-[#A1A1AA] font-mono">#2PQL8YRV</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium border border-gold/20 mb-1">
                  Town Hall 16
                </span>
                <p className="text-xs text-[#A1A1AA]">Main Account</p>
              </div>
            </div>

            {/* Account Card 2 */}
            <div className="flex items-center justify-between bg-[#12121A] border border-white/5 p-4 rounded-xl hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                  <Swords className="w-6 h-6 text-[#A1A1AA]" />
                </div>
                <div>
                  <p className="font-medium text-white text-lg">Mini Maxer</p>
                  <p className="text-sm text-[#A1A1AA] font-mono">#8YV2QLP</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-white/5 text-[#A1A1AA] rounded-full text-xs font-medium border border-white/10 mb-1">
                  Town Hall 15
                </span>
                <p className="text-xs text-[#A1A1AA]">Alt Account</p>
              </div>
            </div>
          </StaggerList>

          <ScrollReveal delay={0.2} className="pt-4">
            <Magnetic>
              <button className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-white/20 rounded-xl text-[#A1A1AA] hover:text-white hover:border-gold/50 hover:bg-white/5 transition-all">
                <Plus className="w-5 h-5" />
                Link New Clash Account
              </button>
            </Magnetic>
          </ScrollReveal>
        </div>

      </div>
    </main>
  );
}