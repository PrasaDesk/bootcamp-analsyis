import React, { useMemo } from 'react';
import ScoreboardTable from '../components/ScoreboardTable';
import WeeklyTrendChart from '../components/WeeklyTrendChart';
import LoadingSpinner from '../components/LoadingSpinner';
import useBootcampData from '../hooks/useBootcampData';
import MissingConfig from '../components/MissingConfig';
import { Users, TrendingUp, Award, Target, Zap, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const { data: bootcampData, loading, error } = useBootcampData();

  // Compute stats from data
  const stats = useMemo(() => {
    if (!bootcampData || bootcampData.length === 0) return null;
    const total = bootcampData.length;
    const mern = bootcampData.filter(s => s.track === 'MERN').length;
    const java = total - mern;
    const avgOverall = total > 0 ? Math.round(bootcampData.reduce((sum, s) => sum + (s.scores.overall || 0), 0) / total) : 0;
    const topPerformer = bootcampData.reduce((best, s) => (s.scores.overall || 0) > (best.scores.overall || 0) ? s : best, bootcampData[0]);
    const excellentCount = bootcampData.filter(s => s.scores.overallRating === 'Good' || s.scores.overallRating === 'Excellent').length;
    
    return { total, mern, java, avgOverall, topPerformer, excellentCount };
  }, [bootcampData]);

  if (loading) return <LoadingSpinner message="Loading Dashboard..." />;
  if (error === 'missing_config') return <MissingConfig />;
  if (error) return <div className="p-10 text-center text-red-400">Error: {error}</div>;
  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Students',
      value: stats.total,
      subtitle: `${stats.mern} MERN · ${stats.java} Java`,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      glow: 'glow-blue',
      iconBg: 'bg-blue-500/15',
      trend: '+12%',
    },
    {
      label: 'Average Score', 
      value: `${stats.avgOverall}%`,
      subtitle: 'Across all candidates',
      icon: TrendingUp,
      gradient: 'from-cyan-400 to-teal-500',
      glow: 'glow-cyan',
      iconBg: 'bg-cyan-500/15',
      trend: null,
    },
    {
      label: 'Top Achievers',
      value: stats.excellentCount,
      subtitle: 'Good or Excellent rating',
      icon: Award,
      gradient: 'from-amber-400 to-orange-500',
      glow: 'glow-amber',
      iconBg: 'bg-amber-500/15',
      trend: null,
    },
    {
      label: 'Top Performer',
      value: stats.topPerformer?.name?.split(' ')[0] || 'N/A',
      subtitle: `${stats.topPerformer?.scores?.overall || 0}% overall`,
      icon: Zap,
      gradient: 'from-pink-500 to-rose-500',
      glow: 'glow-pink',
      iconBg: 'bg-pink-500/15',
      trend: null,
    },
  ];

  return (
    <div className="p-6 md:p-10">
      
      {/* Header Section */}
      <header className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-accentBlue to-accentPurple" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
        </div>
        <p className="text-slate-400 ml-5 text-base">
          Monitor candidate progress, ratings, and performance metrics in real-time.
        </p>
      </header>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {statCards.map((card, index) => (
          <div 
            key={card.label}
            className={`glass-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 cursor-default ${card.glow} animate-fade-in-up-delay-${index + 1}`}
          >
            {/* Background gradient orb */}
            <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${card.iconBg} ring-1 ring-white/5`}>
                  <card.icon className="w-5 h-5 text-slate-300" />
                </div>
                {card.trend && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    {card.trend}
                  </span>
                )}
              </div>
              <p className={`text-3xl font-extrabold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {card.value}
              </p>
              <p className="text-sm font-semibold text-slate-200 mt-1">{card.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Trend Chart */}
      <div className="mb-10 animate-fade-in-up-delay-3">
        <WeeklyTrendChart data={bootcampData} />
      </div>

      {/* Scoreboard Table */}
      <div className="animate-fade-in-up-delay-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-accentBlue/10 ring-1 ring-accentBlue/20">
            <Target className="w-5 h-5 text-accentBlue" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Candidate Scoreboard</h2>
            <p className="text-xs text-slate-500">Full performance breakdown with sorting & filtering</p>
          </div>
        </div>
        <ScoreboardTable data={bootcampData} />
      </div>
    </div>
  );
}
