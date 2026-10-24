'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-mono text-white tracking-widest transition-colors flex items-center gap-2"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#A1A1AA]" />}
      {code}
    </button>
  );
}