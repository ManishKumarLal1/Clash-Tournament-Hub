'use client';

import { useState } from 'react';
import { TextReveal } from '@/components/animations/text-reveal';
import { Magnetic } from '@/components/animations/magnetic';
import { Trophy, Calendar, Shield, FileText, ArrowLeft, Swords, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

type TournamentType = '1v1' | 'clan_vs_clan';

export default function CreateTournamentPage() {
  const [tournamentType, setTournamentType] = useState<TournamentType>('1v1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    prize: '',
    date: '',
    regDeadline: '',
    format: 'Single Elimination',
    maxPlayers: '16',
    thRestriction: '16', // <-- Added TH Restriction
    rules: '• Friendly wars must be started within 15 minutes of the scheduled time.\n• Screenshots of the result must be posted in the chat.\n',
    warType: '5v5',
    battleModifier: 'Legend 1',
    thRequirements: ['16', '16', '16', '16', '16'],
  });

  const router = useRouter();
  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWarTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = parseInt(e.target.value.split('v')[0]); 
    const newReqs = Array(size).fill('16');
    setFormData({ ...formData, warType: e.target.value, thRequirements: newReqs });
  };

  const handleThChange = (index: number, value: string) => {
    const newReqs = [...formData.thRequirements];
    newReqs[index] = value;
    setFormData({ ...formData, thRequirements: newReqs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("You must be logged in to create a tournament.");
      }

      const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

           const { error } = await supabase.from('tournaments').insert({
        host_id: user.id,
        slug: generatedSlug,
        title: formData.title,
        type: tournamentType,
        format: formData.format,
        prize: formData.prize,
        max_players: parseInt(formData.maxPlayers),
        start_date: formData.date,
        reg_deadline: formData.regDeadline ? new Date(formData.regDeadline).toISOString() : null, // <-- ADD THIS
        join_code: generatedCode,
        th_restriction: tournamentType === '1v1' ? parseInt(formData.thRestriction) : null,
        war_type: tournamentType === 'clan_vs_clan' ? formData.warType : null,
        battle_modifier: tournamentType === 'clan_vs_clan' ? formData.battleModifier : null,
        th_requirements: tournamentType === 'clan_vs_clan' ? formData.thRequirements : null,
      });

      if (error) throw new Error(error.message);

      alert("Tournament Created Successfully!");
      router.refresh();
      router.push('/tournaments'); 
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
      <Link href="/tournaments" className="inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Tournaments
      </Link>

      <div className="mb-10">
        <TextReveal as="h1" className="font-display text-5xl font-bold text-white mb-4">
          Host a <span className="text-gold">Tournament</span>
        </TextReveal>
      </div>

      <div className="flex bg-[#12121A] border border-white/5 p-2 rounded-2xl mb-8">
        <button onClick={() => setTournamentType('1v1')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${tournamentType === '1v1' ? 'bg-gold text-black' : 'text-[#A1A1AA] hover:text-white'}`}>
          <Swords className="w-4 h-4" /> 1v1 Solo
        </button>
        <button onClick={() => setTournamentType('clan_vs_clan')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${tournamentType === 'clan_vs_clan' ? 'bg-gold text-black' : 'text-[#A1A1AA] hover:text-white'}`}>
          <Users className="w-4 h-4" /> Clan vs Clan
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#12121A] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Tournament Name</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. TH16 Masters" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-gold" /> Prize Pool</label>
            <input type="text" name="prize" required value={formData.prize} onChange={handleChange} placeholder="e.g. 5000 Gems" className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-gold" /> Start Date</label>
            <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 [color-scheme:dark]" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-gold" /> Registration Deadline</label>
            <input type="datetime-local" name="regDeadline" required value={formData.regDeadline} onChange={handleChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 [color-scheme:dark]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2"><Shield className="w-4 h-4 text-gold" /> Bracket Format</label>
            <select name="format" value={formData.format} onChange={handleChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 appearance-none">
              <option value="Single Elimination">Single Elimination</option>
              <option value="Double Elimination">Double Elimination</option>
              <option value="Round Robin">Round Robin</option>
            </select>
          </div>
          
          {tournamentType === '1v1' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Max Players</label>
                <select name="maxPlayers" value={formData.maxPlayers} onChange={handleChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 appearance-none">
                  <option value="8">8 Players</option>
                  <option value="16">16 Players</option>
                  <option value="32">32 Players</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Town Hall Restriction</label>
                <select name="thRestriction" value={formData.thRestriction} onChange={handleChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 appearance-none">
                  <option value="18">Town Hall 18 Only</option>
                  <option value="17">Town Hall 17 Only</option>
                  <option value="16">Town Hall 16 Only</option>
                  <option value="15">Town Hall 15 Only</option>
                  <option value="14">Town Hall 14 Only</option>
                </select>
              </div>
            </>
          )}
        </div>

        {tournamentType === 'clan_vs_clan' && (
          <div className="p-5 border border-gold/20 bg-gold/5 rounded-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">War Type</label>
                <select name="warType" value={formData.warType} onChange={handleWarTypeChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 appearance-none">
                  <option value="2v2">2v2</option>
                  <option value="3v3">3v3</option>
                  <option value="5v5">5v5</option>
                  <option value="10v10">10v10</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Battle Modifier</label>
                <select name="battleModifier" value={formData.battleModifier} onChange={handleChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 appearance-none">
                  <option value="Legend 1">Legend 1</option>
                  <option value="Legend 2">Legend 2</option>
                  <option value="Legend 3">Legend 3</option>
                  <option value="Esports">Esports</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-white">Town Hall Composition</label>
              <p className="text-xs text-[#A1A1AA] mb-2">Specify the exact TH level required for each slot.</p>
              <div className="grid grid-cols-5 gap-3">
                {formData.thRequirements.map((th, index) => (
                  <div key={index} className="space-y-1">
                    <span className="text-[10px] text-[#A1A1AA] text-center block uppercase tracking-wider">Slot {index + 1}</span>
                    <select value={th} onChange={(e) => handleThChange(index, e.target.value)} className="w-full bg-[#0A0A0F] border border-white/10 rounded-lg px-2 py-2 text-center text-white focus:outline-none focus:border-gold/50 appearance-none text-sm">
                      {[18, 17, 16, 15, 14, 13, 12].map(level => (
                        <option key={level} value={level}>TH{level}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-white flex items-center gap-2"><FileText className="w-4 h-4 text-gold" /> Rules & Description</label>
          <textarea name="rules" required rows={4} value={formData.rules} onChange={handleChange} className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 resize-none" />
        </div>

        <div className="pt-4 flex justify-end">
          <Magnetic>
            <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-gold text-[#0A0A0F] font-bold rounded-xl hover:bg-[#F5C876] transition-colors shadow-[0_0_20px_rgba(232,182,90,0.2)] flex items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Tournament'}
            </button>
          </Magnetic>
        </div>

      </form>
    </main>
  );
}