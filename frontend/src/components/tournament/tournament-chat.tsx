'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CldUploadWidget } from 'next-cloudinary';

// 1. Initialize Supabase OUTSIDE the component so the connection isn't rebuilt on every render
const supabase = createClient();

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  matchId?: string | null; // Accepts null for global chat
  title?: string;
}

export function TournamentChat({ isOpen, onClose, tournamentId, matchId, title = 'Tournament Chat' }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;

    const initChat = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('username, display_name').eq('id', user.id).single();
        setCurrentUser({ ...user, profile });
      }

      // Build query
      let query = supabase
        .from('messages')
        .select(`*, profiles:user_id (username, display_name)`)
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: true });

      // Filter by match if it's a match chat
      if (matchId) {
        query = query.eq('match_id', matchId);
      } else {
        query = query.is('match_id', null);
      }

      const { data: history } = await query;
      if (history) setMessages(history);
      
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    initChat();

    // Set up Realtime Subscription
    const channel = supabase
      .channel(`chat_${tournamentId}_${matchId || 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        async (payload) => {
          // Ensure the message belongs to this specific thread
          if ((matchId && payload.new.match_id !== matchId) || (!matchId && payload.new.match_id !== null)) return;

          // Fetch the profile of the sender to display their name
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('id', payload.new.user_id)
            .single();

          const newMsg: any = { ...payload.new, profiles: profile };
          
          setMessages((prev) => {
            // Prevent duplicates if the user sent it (optimistic UI handles sender)
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, tournamentId, matchId]); // 2. Removed `supabase` from here to prevent disconnects!

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || isSending) return;

    setIsSending(true);
    const content = newMessage;
    setNewMessage(''); // Optimistic clear

    const { error } = await supabase.from('messages').insert({
      tournament_id: tournamentId,
      match_id: matchId || null,
      user_id: currentUser.id,
      content: content,
    });

    if (error) {
      console.error(error);
      setNewMessage(content); // Restore on error
      alert('Failed to send message.');
    }
    setIsSending(false);
  };

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
            <h2 className="font-display text-xl text-white truncate max-w-[250px]">{title}</h2>
            <p className="text-xs text-emerald-400">Live Chat</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {isLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-xs text-[#A1A1AA] bg-white/5 px-3 py-1 rounded-full">No messages yet. Say hi!</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === currentUser?.id;
              const senderName = msg.profiles?.display_name || msg.profiles?.username || 'Unknown';
              
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isMe ? 'bg-gold text-black' : 'bg-white/10 text-white'}`}>
                    {senderName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                    <p className="text-xs text-[#A1A1AA] mb-1">
                      {isMe ? 'You' : `@${msg.profiles?.username || 'user'}`} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    <div className={`p-3 rounded-2xl text-sm text-left flex flex-col gap-2 ${isMe ? 'bg-gold text-black rounded-tr-none' : 'bg-[#12121A] border border-white/5 text-white rounded-tl-none'}`}>
                      {/* Render Image if exists */}
                      {msg.image_url && (
                        <img 
                          src={msg.image_url} 
                          alt="Attachment" 
                          className="rounded-lg max-w-full h-auto object-cover border border-black/10" 
                          loading="lazy"
                        />
                      )}
                      
                      {/* Render Text if exists */}
                      {msg.content && <p>{msg.content}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-[#12121A]">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-[#0A0A0F] border border-white/10 rounded-xl p-2 focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/50 transition-all">
            
            {/* Cloudinary Integration */}
            <CldUploadWidget 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={async (result: any) => {
                const imageUrl = result.info.secure_url;
                
                if (currentUser) {
                  const { error } = await supabase.from('messages').insert({
                    tournament_id: tournamentId,
                    match_id: matchId || null,
                    user_id: currentUser.id,
                    content: '', 
                    image_url: imageUrl,
                  });
                  
                  if (error) {
                    alert("Error saving image to database: " + error.message);
                    console.error(error);
                  }
                }
              }}
            >
              {({ open }) => (
                <button 
                  type="button" 
                  onClick={() => open()}
                  className="p-2 text-[#A1A1AA] hover:text-gold transition-colors" 
                  title="Upload Image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </CldUploadWidget>

            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              className="p-2 bg-gold text-[#0A0A0F] rounded-lg hover:bg-[#F5C876] transition-colors disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}