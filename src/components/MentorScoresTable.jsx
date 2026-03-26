import React, { useState } from 'react';
import { Users, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';

const CATEGORY_COLORS = {
  'Communication': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  'Professionalism and Discipline': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-500' },
  'Proactiveness': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-500' },
  'Learning and Agile': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  'React': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', dot: 'bg-sky-500' },
  'Node': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  'Java': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
};

const DEFAULT_COLOR = { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-500' };

const WEEKS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
const WEEK_KEYS = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8'];

function ScoreCell({ value }) {
  if (!value || value === 0) {
    return <span className="text-slate-700 font-mono text-xs">—</span>;
  }
  let color = 'text-emerald-400';
  if (value < 4) color = 'text-red-400';
  else if (value < 7) color = 'text-amber-400';
  
  return <span className={`font-mono text-sm font-bold ${color}`}>{value}</span>;
}

export default function MentorScoresTable({ mentorScores }) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const categories = Object.keys(mentorScores || {}).filter(
    cat => ['Communication', 'Professionalism and Discipline', 'Proactiveness', 'Learning and Agile', 'React', 'Node', 'Java'].includes(cat)
  );

  if (categories.length === 0) {
    return (
      <div className="bg-white/[0.02] rounded-xl p-8 text-center border border-dashed border-white/[0.06]">
        <Users className="w-8 h-8 text-slate-700 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No mentor scores recorded yet.</p>
      </div>
    );
  }

  const allExpanded = expandedCategories.size === categories.length;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categories));
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Expand / Collapse All */}
      <div className="flex justify-end mb-1">
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200"
        >
          <ChevronsUpDown className="w-4 h-4" />
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      {categories.map(category => {
        const color = CATEGORY_COLORS[category] || DEFAULT_COLOR;
        const entries = mentorScores[category] || [];
        const isExpanded = expandedCategories.has(category);

        // Calculate total for category
        const totalAllWeeks = entries.reduce((sum, entry) => {
          return sum + WEEK_KEYS.reduce((wSum, key) => wSum + (entry[key] || 0), 0);
        }, 0);

        return (
          <div key={category} className={`rounded-2xl border ${color.border} overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-white/[0.02]' : 'bg-white/[0.01] hover:bg-white/[0.02]'}`}>
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                <span className="text-base font-bold text-white">{category}</span>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${color.bg} ${color.text}`}>
                  {entries.length} mentor{entries.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-slate-500">
                  Total: <span className={`font-bold ${totalAllWeeks > 0 ? color.text : 'text-slate-600'}`}>{totalAllWeeks}</span>
                </span>
                {isExpanded ? (
                  <ChevronDown className={`w-4 h-4 ${color.text}`} />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </button>

            {/* Expanded Scores Grid */}
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.04]">
                        <th className="py-2 pr-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-28">Mentor</th>
                        {WEEKS.map(w => (
                          <th key={w} className="py-2 px-2 text-xs font-bold text-slate-600 uppercase tracking-wider text-center w-12">{w}</th>
                        ))}
                        <th className="py-2 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-14">Todo</th>
                        <th className="py-2 pl-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-14">Sum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => {
                        const rowTotal = WEEK_KEYS.reduce((sum, key) => sum + (entry[key] || 0), 0) + (entry.todo || 0);
                        return (
                          <tr key={idx} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg ${color.bg} flex items-center justify-center text-[10px] font-bold ${color.text}`}>
                                  {entry.mentor.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-slate-300">{entry.mentor}</span>
                              </div>
                            </td>
                            {WEEK_KEYS.map(key => (
                              <td key={key} className="py-2.5 px-2 text-center">
                                <ScoreCell value={entry[key]} />
                              </td>
                            ))}
                            <td className="py-2.5 px-2 text-center">
                              <ScoreCell value={entry.todo} />
                            </td>
                            <td className="py-2.5 pl-3 text-right">
                              <span className={`font-mono text-sm font-bold ${rowTotal > 0 ? 'text-white' : 'text-slate-700'}`}>{rowTotal}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
