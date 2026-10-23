import Link from 'next/link';
import { Trophy, Users, Calendar } from 'lucide-react';

interface TournamentCardProps {
  tournament: any; // In the future, replace 'any' with a proper TypeScript interface
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const isFull = tournament.currentPlayers >= tournament.maxPlayers;
  const progressPercentage = (tournament.currentPlayers / tournament.maxPlayers) * 100;

  return (
    <Link href={`/tournaments/${tournament.slug}`} className="block group">
      <div className="bg-[#12121A] border border-white/5 rounded-2xl p-6 h-full flex flex-col relative overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_30px_rgba(232,182,90,0.05)] hover:-translate-y-1">
        
        {/* Subtle top gradient glow on hover */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header: Title & Status */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display font-bold text-2xl text-white group-hover:text-gold transition-colors">
            {tournament.title}
          </h3>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
            isFull ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {tournament.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6 flex-grow">
          <div className="flex items-center text-sm text-[#A1A1AA]">
            <Trophy className="w-4 h-4 mr-3 text-gold/70" />
            <span>{tournament.format}</span>
          </div>
          <div className="flex items-center text-sm text-[#A1A1AA]">
            <Calendar className="w-4 h-4 mr-3 text-gold/70" />
            <span>Starts {tournament.startDate}</span>
          </div>
          <div className="flex items-center text-sm text-white font-medium">
            <span className="w-4 h-4 mr-3 flex items-center justify-center text-gold/70">★</span>
            <span>Prize: {tournament.prize}</span>
          </div>
        </div>

        {/* Footer: Player Count & Progress Bar */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-[#A1A1AA] mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {tournament.currentPlayers}/{tournament.maxPlayers} Players
            </span>
            <span>Hosted by {tournament.host}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-gold'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}