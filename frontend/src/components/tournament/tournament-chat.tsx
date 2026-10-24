'use client';

import { useState } from 'react';
import { X, Send, Image as ImageIcon } from 'lucide-react';
import { Magnetic } from '@/components/animations/magnetic';

export function TournamentChat({ isOpen, onClose, title = 'Tournament Chat' }: { isOpen: boolean, onClose: () => void, title?: string }) {
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#0A0A0F] border-l border-white/10 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#12121A]">
          <div>
            <h2 className="font-display text-xl text-white">{title}</h2>
            <p className="text-xs text-emerald-400">Live Hub</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* System Message */}
          <div className="text-center">
            <span className="text-xs text-[#A1A1AA] bg-white/5 px-3 py-1 rounded-full">Tournament Chat Started</span>
          </div>

          {/* Incoming Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold to-yellow-200 flex-shrink-0" />
            <div>
              <p className="text-xs text-[#A1A1AA] mb-1">ClashKing <span className="text-[10px] opacity-50">10:42 AM</span></p>
              <div className="bg-[#12121A] border border-white/5 p-3 rounded-2xl rounded-tl-none text-sm text-white">
                I'm ready for the match! Let me know when you're online.
              </div>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">YOU</div>
            <div className="text-right">
              <p className="text-xs text-[#A1A1AA] mb-1"><span className="text-[10px] opacity-50">10:44 AM</span> You</p>
              <div className="bg-gold text-[#0A0A0F] p-3 rounded-2xl rounded-tr-none text-sm font-medium text-left">
                Give me 5 mins, just finishing a builder upgrade.
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#12121A]">
          <div className="flex items-center gap-2 bg-[#0A0A0F] border border-white/10 rounded-xl p-2 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/50 transition-all">
            <button className="p-2 text-[#A1A1AA] hover:text-white transition-colors" title="Upload Screenshot">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button className="p-2 bg-gold text-[#0A0A0F] rounded-lg hover:bg-[#F5C876] transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
