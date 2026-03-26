import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function PerformanceChart({ data, type = 'radar', height = 'h-80' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-600">
        <p className="text-sm">No performance metrics available.</p>
      </div>
    );
  }

  // Use provided data since it's already filtered by useBootcampData.js
    const chartData = data
      .map(d => ({ 
        ...d, 
        fullMark: 10,
        // Shorten long labels just in case
        subject: d.subject === 'Professionalism and Discipline' ? 'Discipline' : d.subject
      }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, var(--color-tooltipBg), var(--color-tooltipBg2))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        }}>
          <p style={{ color: 'var(--color-slate-400)', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>{payload[0].payload.subject}</p>
          <p style={{ color: '#6366f1', fontSize: '18px', fontWeight: 800 }}>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${height} w-full text-xs`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="var(--color-gridLine)" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            tickLine={false}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 10]} 
            tick={{ fill: '#475569', fontSize: 10 }} 
            axisLine={false}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#radarGrad)"
            fillOpacity={1}
            dot={{ r: 4, fill: '#6366f1', stroke: '#0a0e1a', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#818cf8', stroke: '#0a0e1a', strokeWidth: 3 }}
          />
          <defs>
            <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
            </radialGradient>
          </defs>
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
