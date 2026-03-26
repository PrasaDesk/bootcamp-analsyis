import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Sparkles } from 'lucide-react';

const CARD_ACCENTS = [
  { border: 'hover:border-violet-500/30', glow: 'group-hover:shadow-violet-500/10', avatar: 'from-violet-500 to-purple-600' },
  { border: 'hover:border-blue-500/30', glow: 'group-hover:shadow-blue-500/10', avatar: 'from-blue-500 to-indigo-600' },
  { border: 'hover:border-cyan-500/30', glow: 'group-hover:shadow-cyan-500/10', avatar: 'from-cyan-400 to-teal-500' },
  { border: 'hover:border-emerald-500/30', glow: 'group-hover:shadow-emerald-500/10', avatar: 'from-emerald-400 to-green-600' },
  { border: 'hover:border-amber-500/30', glow: 'group-hover:shadow-amber-500/10', avatar: 'from-amber-400 to-orange-500' },
  { border: 'hover:border-pink-500/30', glow: 'group-hover:shadow-pink-500/10', avatar: 'from-pink-500 to-rose-500' },
  { border: 'hover:border-fuchsia-500/30', glow: 'group-hover:shadow-fuchsia-500/10', avatar: 'from-fuchsia-500 to-purple-500' },
  { border: 'hover:border-sky-500/30', glow: 'group-hover:shadow-sky-500/10', avatar: 'from-sky-400 to-blue-500' },
];

export default function StudentCard({ student, index }) {
  const isMERN = student.track === 'MERN';
  const overall = student.scores.overall || 0;
  const accent = CARD_ACCENTS[(index || 0) % CARD_ACCENTS.length];
  
  let progressGradient = 'from-emerald-400 to-green-500';
  if (overall < 40) progressGradient = 'from-red-400 to-rose-500';
  else if (overall < 70) progressGradient = 'from-amber-400 to-orange-500';

  return (
    <Link 
      to={`/student/${student.id}`}
      className={`block glass-card p-0 group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl ${accent.glow} ${accent.border} overflow-hidden relative`}
      style={{ animationDelay: `${(index || 0) * 0.05}s` }}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accent.avatar} opacity-60 group-hover:opacity-100 transition-opacity`} />
      
      {/* Background orb */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${accent.avatar} rounded-full opacity-[0.03] group-hover:opacity-[0.08] blur-2xl transition-opacity duration-500`} />

      <div className="p-5 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent.avatar} flex items-center justify-center text-sm font-bold text-white shadow-lg ring-1 ring-white/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500`}>
              {student.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-accentBlue transition-colors text-sm leading-tight">{student.name}</h3>
              <span className={`inline-block mt-1.5 text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-0.5 rounded-md border ${isMERN ? 'border-blue-500/20 text-blue-400 bg-blue-500/10' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10'}`}>
                {student.track || 'Unassigned'}
              </span>
            </div>
          </div>
          <div className="p-2 bg-white/[0.03] rounded-xl text-slate-500 group-hover:bg-accentBlue/10 group-hover:text-accentBlue transition-all duration-300 group-hover:translate-x-0.5">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] group-hover:border-white/[0.08] transition-colors">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Mid Term</p>
            <p className="font-mono font-bold text-lg text-white">{student.scores.midTerm}<span className="text-xs text-slate-500">%</span></p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] group-hover:border-white/[0.08] transition-colors">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Overall</p>
            <p className="font-mono font-bold text-lg text-white">{overall}<span className="text-xs text-slate-500">%</span></p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              Progress
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">{overall}%</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden ring-1 ring-white/[0.04]">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-1000 ease-out relative`}
              style={{ width: `${Math.min(overall, 100)}%` }}
            >
              {/* Animated sparkle at end */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-50 blur-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
