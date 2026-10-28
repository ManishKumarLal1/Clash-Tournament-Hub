'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface DMProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  otherUser: any; // { id, username, display_name }
}

export function DirectMessageChat({ isOpen, onClose, currentUser, otherUser }: DMProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !currentUser || !otherUser) return;

    const initChat = async () => {
      setIsLoading(true);
      
      // Fetch history between these two specific users
      const { data: history } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (history) setMessages(history);
      
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    initChat();

    // Listen for new messages in real-time
    const channel = supabase
      .channel(`dm_${currentUser.id}_${otherUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const newMsg = payload.new;
          // Check if the message belongs to this specific conversation
          const isRelevant = 
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === otherUser.id) ||
            (newMsg.sender_id === otherUser.id && newMsg.receiver_id === currentUser.id);

          if (!isRelevant) return;

          setMessages((prev) => {
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
  }, [isOpen, currentUser, otherUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || isSending) return;

    setIsSending(true);
    const content = newMessage;
    setNewMessage('');

    const { error } = await supabase.from('direct_messages').insert({
      sender_id: currentUser.id,
      receiver_id: otherUser.id,
      content: content,
    });

    if (error) {
      console.error(error);
      setNewMessage(content);
      setUploadError('Failed to send message.');
    }
    setIsSending(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploadError('');
    setIsUploading(true);
    
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) throw new Error('Cloudinary env vars are missing.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`Cloudinary Error: ${data.error?.message || 'Unknown error'}`);

      const { error } = await supabase.from('direct_messages').insert({
        sender_id: currentUser.id,
        receiver_id: otherUser.id,
        content: '',
        image_url: data.secure_url,
      });

      if (error) throw new Error(`Supabase Error: ${error.message}`);

    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  if (!isOpen || !otherUser) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#0A0A0F] border-l border-white/10 z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#12121A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold to-yellow-200 flex items-center justify-center text-sm font-bold text-[#0A0A0F]">
              {otherUser.display_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-lg text-white">{otherUser.display_name}</h2>
              <p className="text-xs text-[#A1A1AA]">@{otherUser.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#A1A1AA] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {isLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-xs text-[#A1A1AA] bg-white/5 px-3 py-1 rounded-full">Say hi to {otherUser.display_name}!</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className={`max-w-[80%] ${isMe ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-2xl text-sm text-left flex flex-col gap-2 ${isMe ? 'bg-gold text-black rounded-tr-none' : 'bg-[#12121A] border border-white/5 text-white rounded-tl-none'}`}>
                      {msg.image_url && (
                        <img 
                          src={msg.image_url} 
                          alt="Attachment" 
                          className="rounded-lg max-w-full h-auto object-cover border border-black/10" 
                          loading="lazy"
                        />
                      )}
                      {msg.content && <p>{msg.content}</p>}
                    </div>
                    <p className="text-[10px] text-[#A1A1AA] mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-white/10 bg-[#12121A]">
          {uploadError && (
            <p role="alert" className="mb-3 text-xs text-red-400 bg-red-500/10 p-2 rounded">
              {uploadError}
            </p>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-[#0A0A0F] border border-white/10 rounded-xl p-2 focus-within:border-gold/50 transition-all">
            
            <input 
              type="file" 
              accept="image/*" 
              id="dm-image-upload" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
            
            <label 
              htmlFor="dm-image-upload" 
              className={`p-2 transition-colors ${isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer text-[#A1A1AA] hover:text-gold'}`}
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-gold" /> : <ImageIcon className="w-5 h-5" />}
            </label>

            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
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