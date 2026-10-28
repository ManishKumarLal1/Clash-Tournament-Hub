import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0F] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <Trophy className="text-[#0A0A0F] w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Clash<span className="text-gold">Hub</span>
            </span>
          </Link>
          <p className="text-[#A1A1AA] text-sm max-w-sm mb-6">
            The ultimate community-driven platform to host, manage, and compete in Clash of Clans tournaments. 
          </p>
          <p className="text-xs text-[#52525B]">
            This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-[#A1A1AA]">
            <li><Link href="/tournaments" className="hover:text-gold transition-colors">Tournaments</Link></li>
            <li><Link href="/friends" className="hover:text-gold transition-colors">Community Hub</Link></li>
            <li><Link href="/tournaments/new" className="hover:text-gold transition-colors">Host a Tournament</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-medium mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-[#A1A1AA]">
            <li><Link href="#" className="hover:text-gold transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-gold transition-colors">Contact Support</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#52525B]">© {new Date().getFullYear()} ClashHub. All rights reserved.</p>
        <p className="text-sm text-[#52525B]">Built for the Clash Community.</p>
      </div>
    </footer>
  );
}