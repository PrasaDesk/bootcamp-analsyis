import React from 'react';
import { MessageCircle } from 'lucide-react';

const ACCENT_COLORS = [
  { bg: 'bg-violet-500/10', text: 'text-violet-400', ring: 'ring-violet-500/20' },
  { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', ring: 'ring-cyan-500/20' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/20' },
  { bg: 'bg-pink-500/10', text: 'text-pink-400', ring: 'ring-pink-500/20' },
];

export default function RemarkCard({ remark, index = 0 }) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  
  return (
    <div className="group relative bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 hover:border-white/[0.08] hover:bg-white/[0.03] transition-all duration-300">
      {/* Top stripe */}
      <div className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent ${accent.text.replace('text', 'via')}/20 to-transparent`} />
      
      <div className="flex items-start gap-3.5">
        <div className={`p-2 rounded-xl ${accent.bg} ring-1 ${accent.ring} shrink-0 group-hover:scale-105 transition-transform`}>
          <MessageCircle className={`w-4 h-4 ${accent.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-300 text-sm leading-relaxed mb-3">"{remark.remark}"</p>
          <div className="flex items-center gap-3 text-[11px]">
            <span className={`font-bold ${accent.text} uppercase tracking-wider`}>{remark.category}</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500 font-semibold">by {remark.mentor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
