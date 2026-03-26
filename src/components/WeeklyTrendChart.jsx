import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

export default function WeeklyTrendChart({ data }) {
  const [termFilter, setTermFilter] = useState('all');

  const chartData = useMemo(() => {
    const allWeeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
    const allKeys = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8'];
    
    let weeks = allWeeks;
    let keys = allKeys;
    if (termFilter === 'mid') {
      weeks = allWeeks.slice(0, 4);
      keys = allKeys.slice(0, 4);
    } else if (termFilter === 'last') {
      weeks = allWeeks.slice(4, 8);
      keys = allKeys.slice(4, 8);
    }
    
    return weeks.map((week, i) => {
      const key = keys[i];
      const total = data.length;
      const avg = total > 0 ? Math.round(data.reduce((sum, s) => sum + (s.scores[key] || 0), 0) / total) : 0;
      
      const weekData = { name: week, average: avg };
      data.forEach(student => {
        weekData[student.name] = student.scores[key] || 0;
      });

      return weekData;
    });
  }, [data, termFilter]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, var(--color-tooltipBg), var(--color-tooltipBg2))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '12px',
          padding: '14px 18px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
        }}>
          <p style={{ color: 'var(--color-slate-400)', fontSize: '11px', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x-4 y-2' }}>
            {[...payload].sort((a, b) => b.value - a.value).map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', paddingRight: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
                <span style={{ color: 'var(--color-slate-200)', fontSize: '12px', fontWeight: entry.name === 'Overall' ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{entry.name}</span>
                <span style={{ color: entry.color, fontSize: '12px', fontWeight: 700, marginLeft: 'auto' }}>{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 md:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-accentCyan/5 to-accentBlue/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Weekly Performance Trend</h2>
            <p className="text-xs text-slate-500">Average scores across {termFilter === 'all' ? 'all' : termFilter === 'mid' ? 'first 4' : 'last 4'} weeks</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="bg-slate-800/50 p-1 rounded-xl flex items-center gap-1 border border-white/10 backdrop-blur-md">
            <button 
              onClick={() => setTermFilter('all')} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${termFilter === 'all' ? 'bg-[var(--color-filter-indigo)] text-[var(--color-filter-text)] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              All Weeks
            </button>
            <button 
              onClick={() => setTermFilter('mid')} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${termFilter === 'mid' ? 'bg-[var(--color-filter-cyan)] text-[var(--color-filter-text)] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Mid Term
            </button>
            <button 
              onClick={() => setTermFilter('last')} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${termFilter === 'last' ? 'bg-[var(--color-filter-purple)] text-[var(--color-filter-text)] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Last Term
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-indigo-500 ring-2 ring-indigo-500/20" />
              <span className="text-slate-400 font-bold">Overall Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-md bg-slate-500 ring-2 ring-slate-500/20" />
              <span className="text-slate-400 font-medium">Students</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-80 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gridLine)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'var(--color-slate-400)', fontSize: 11, fontWeight: 500 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'var(--color-slate-500)', fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {data.map((student, idx) => {
              const colors = ['#f43f5e', '#a855f7', '#3b82f6', '#0ea5e9', '#10b981', '#fbbf24', '#f97316', '#14b8a6', '#8b5cf6', '#ec4899', '#facc15', '#2dd4bf'];
              const color = colors[idx % colors.length];
              return (
                <Line 
                  key={student.name}
                  type="monotone"
                  dataKey={student.name}
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={0.6}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              );
            })}
            
            <Line 
              type="monotone" 
              dataKey="average" 
              name="Overall" 
              stroke="#6366f1" 
              strokeWidth={4} 
              dot={{ r: 5, fill: '#6366f1', stroke: 'var(--color-chartFill)', strokeWidth: 2 }} 
              activeDot={{ r: 7, stroke: '#6366f1', strokeWidth: 2, fill: 'var(--color-chartFill)' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
