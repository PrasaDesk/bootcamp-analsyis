import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, BarChart3, ClipboardList, Target, CheckCircle2, Sparkles, Star, Calendar, Award, Code2, Globe } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import useBootcampData from '../hooks/useBootcampData';
import PerformanceChart from '../components/PerformanceChart';
import MentorScoresTable from '../components/MentorScoresTable';
import LoadingSpinner from '../components/LoadingSpinner';
import MissingConfig from '../components/MissingConfig';
import AIAnalysisSection from '../components/AIAnalysisSection';
import { getStudentInsights } from '../utils/studentInsights';
import { jsPDF } from 'jspdf';
import domtoimage from 'dom-to-image-more';

export default function StudentDetail() {
  const { id } = useParams();
  const { data: bootcampData, loading, error } = useBootcampData();
  const [termFilter, setTermFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = React.useRef(null);

  if (loading) return <LoadingSpinner message="Loading Student Details..." />;
  if (error === 'missing_config') return <MissingConfig />;
  if (error) return <div className="p-10 text-center text-red-400">Error: {error}</div>;

  const student = bootcampData.find(s => s.id.toString() === id);

  if (!student) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/50 flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Student not found</h2>
        <p className="text-slate-500 mb-6 text-sm">The requested student could not be located.</p>
        <Link to="/students" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>
    );
  }

  const overall = student.scores.overall || 0;
  const isMERN = student.track === 'MERN';
  const insights = getStudentInsights(student, { maxPerSide: 2 });

  const weeksToMap = termFilter === 'all' ? [1, 2, 3, 4, 5, 6, 7, 8] : termFilter === 'mid' ? [1, 2, 3, 4] : [5, 6, 7, 8];

  // Build weekly data for bar chart
  const weeklyData = weeksToMap.map(weekNum => ({
    name: `W${weekNum}`,
    score: student.scores[`week${weekNum}`] || 0
  }));

  // Build category trend data
  const categoriesPresent = Object.keys(student.mentorScores || {}).map(c => c === 'Professionalism and Discipline' ? 'Discipline' : c);

  const categoryTrendData = weeksToMap.map(weekNum => {
    const weekKey = `week${weekNum}`;
    const weekData = { name: `W${weekNum}` };

    Object.keys(student.mentorScores || {}).forEach(category => {
      const displayCategory = category === 'Professionalism and Discipline' ? 'Discipline' : category;
      const mentors = student.mentorScores[category];
      let total = 0;
      let count = 0;
      mentors.forEach(m => {
        if (m[weekKey] !== null) {
          total += m[weekKey];
          count++;
        }
      });
      weekData[displayCategory] = count > 0 ? Math.round((total / count) * 10) / 10 : null;
    });

    return weekData;
  });

  const categoryColors = {
    'Communication': '#8b5cf6',
    'Discipline': '#ec4899',
    'Proactiveness': '#f59e0b',
    'Learning and Agile': '#10b981',
    'React': '#06b6d4',
    'Node': '#3b82f6',
    'Java': '#ef4444',
  };

  const filteredMetrics = [];
  const validCategoriesForMetrics = ['Communication', 'Professionalism and Discipline', 'Proactiveness', 'Learning and Agile', 'React', 'Node', 'Java'];
  validCategoriesForMetrics.forEach(category => {
    if (!student.mentorScores || !student.mentorScores[category]) return;
    const entries = student.mentorScores[category];
    let totalScore = 0;
    let scoreCount = 0;
    entries.forEach(entry => {
      let weekScores = [];
      if (termFilter === 'all') weekScores = [entry.week1, entry.week2, entry.week3, entry.week4, entry.week5, entry.week6, entry.week7, entry.week8];
      else if (termFilter === 'mid') weekScores = [entry.week1, entry.week2, entry.week3, entry.week4];
      else if (termFilter === 'last') weekScores = [entry.week5, entry.week6, entry.week7, entry.week8];

      weekScores.forEach(s => {
        if (s !== null) {
          totalScore += s;
          scoreCount++;
        }
      });
    });
    const avgScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 10) / 10 : 0;
    filteredMetrics.push({
      subject: category === 'Professionalism and Discipline' ? 'Discipline' : category,
      score: avgScore,
    });
  });

  const quickStats = [
    { label: 'Mid Term', value: `${student.scores.midTerm}%`, icon: Calendar, color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-500/10' },
    { label: 'Overall', value: `${overall}%`, icon: Award, color: 'from-violet-400 to-purple-500', bg: 'bg-violet-500/10' },
    { label: 'Rating', value: student.scores.overallRating, icon: Star, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10' },
    { label: 'Track', value: student.track, icon: isMERN ? Globe : Code2, color: isMERN ? 'from-blue-400 to-indigo-500' : 'from-emerald-400 to-teal-500', bg: isMERN ? 'bg-blue-500/10' : 'bg-emerald-500/10' },
  ];

  const BarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, var(--color-tooltipBg), var(--color-tooltipBg2))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
        }}>
          <p style={{ color: 'var(--color-slate-400)', fontSize: '10px', fontWeight: 600, marginBottom: '2px' }}>{payload[0].payload.name}</p>
          <p style={{ color: '#6366f1', fontSize: '16px', fontWeight: 800 }}>{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const exportFullReport = async () => {
    if (!student || !pdfRef.current) return;

    try {
      setIsExporting(true);
      // Brief delay to allow UI to update (like showing load states)
      await new Promise(resolve => setTimeout(resolve, 150)); // Allow re-render

      const element = pdfRef.current;
      const imgData = await domtoimage.toPng(element, {
        bgcolor: '#0f172a',
        scale: 2
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      // Calculate dynamic height to fit one continuous page so it perfectly mimics the dashboard
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Re-initialize pdf with custom height if it's very long
      const finalPdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);

      finalPdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      finalPdf.save(`${student.name?.replace(/\s+/g, '_') || 'Student'}_Full_Report.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 pb-20 relative">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        {/* Back Nav */}
        <Link to="/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium group">
          <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-accentBlue/10 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          Back to Students
        </Link>

        {/* Export Button */}
        {/* <button 
          onClick={exportFullReport}
          disabled={isExporting}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isExporting ? 'bg-indigo-500/20 text-indigo-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20'}`}
        >
          {isExporting ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Compiling Report...</>
          ) : (
            <><ClipboardList className="w-4 h-4" /> Export Full Report</>
          )}
        </button> */}
      </div>

      <div ref={pdfRef} className="rounded-3xl relative">
        {isExporting && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-indigo-500/30 flex flex-col items-center gap-4">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
              <p className="text-sm font-bold text-white tracking-widest uppercase">Capturing High-Res Snapshot...</p>
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="glass-card p-0 mb-8 overflow-hidden relative animate-fade-in-up">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accentBlue/[0.06] to-accentPurple/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-accentPink/[0.04] to-accentAmber/[0.04] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-accentBlue via-accentPurple to-accentPink" />

          <div className="p-8 md:p-10 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Student Info */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accentBlue to-accentPurple flex items-center justify-center text-2xl font-black text-white shadow-2xl shadow-accentBlue/20 ring-2 ring-white/10">
                    {student.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center border-2 border-darkBg">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">{student.name}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-[0.15em] font-bold px-3 py-1 rounded-lg border ${isMERN ? 'border-blue-500/20 text-blue-400 bg-blue-500/10' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10'}`}>
                      {student.track || 'Unassigned'}
                    </span>
                    <span className="text-sm text-slate-500 font-mono">#{student.id.toString().padStart(3, '0')}</span>
                    <div className="flex flex-wrap gap-2">
                      {insights.strengths.map((t) => (
                        <span key={`s-${t}`} className="px-3 py-1 rounded-lg text-[10px] font-extrabold tracking-wide border bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                          {t}
                        </span>
                      ))}
                      {insights.weaknesses.map((t) => (
                        <span key={`w-${t}`} className="px-3 py-1 rounded-lg text-[10px] font-extrabold tracking-wide border bg-rose-500/10 text-rose-300 border-rose-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {quickStats.map((stat) => (
                <div key={stat.label} className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all group cursor-default">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                      <stat.icon className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Term Filter Controls */}
        <div className="flex justify-end mb-4 animate-fade-in-up">
          <div className="bg-slate-800/50 p-1.5 rounded-xl flex items-center gap-1 border border-white/10 relative z-10 backdrop-blur-md">
            <button
              onClick={() => setTermFilter('all')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${termFilter === 'all' ? 'bg-[var(--color-filter-indigo)] text-[var(--color-filter-text)] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              All Weeks
            </button>
            <button
              onClick={() => setTermFilter('mid')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${termFilter === 'mid' ? 'bg-[var(--color-filter-cyan)] text-[var(--color-filter-text)] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Mid Term (W1-W4)
            </button>
            <button
              onClick={() => setTermFilter('last')}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${termFilter === 'last' ? 'bg-[var(--color-filter-purple)] text-[var(--color-filter-text)] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              Last Term (W5-W8)
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* AI Analysis Integration */}
            <AIAnalysisSection student={student} />

            {/* Weekly Progress Line Chart */}
            <section className="glass-card p-6 md:p-8 overflow-hidden relative animate-fade-in-up-delay-2">
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Weekly Scores</h2>
                  <p className="text-xs text-slate-500">Performance across 8 training weeks</p>
                </div>
              </div>
              <div className="h-56 relative z-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.2)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 10]} tickCount={6} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.1)' }} />
                    <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Category Trends Line Chart */}
            <section className="glass-card p-6 md:p-8 overflow-hidden relative animate-fade-in-up-delay-2">
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Skill Trends</h2>
                  <p className="text-xs text-slate-500">Category performance across weeks</p>
                </div>
              </div>
              <div className="h-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={categoryTrendData} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.2)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-tooltipBg)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, marginBottom: '5px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    {categoriesPresent.filter(c => c !== 'null' && c !== 'undefined').map((category) => (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category}
                        stroke={categoryColors[category] || '#94a3b8'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Mentor Scoring Grid */}
            <section className="glass-card p-6 md:p-8 overflow-hidden relative animate-fade-in-up-delay-3">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                  <ClipboardList className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Mentor Scoring Grid</h2>
                  <p className="text-xs text-slate-500">Weekly scores given by each mentor per evaluation category</p>
                </div>
              </div>
              <div className="relative z-10">
                <MentorScoresTable mentorScores={student.mentorScores} />
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Radar Chart (Moved here) */}
            <section className="glass-card p-6 overflow-hidden relative animate-fade-in-up-delay-1">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="p-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Proficiency Breakdown</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Skill assessment</p>
                </div>
              </div>
              <div className="bg-white/[0.01] rounded-xl border border-white/[0.03] p-3 relative z-10">
                <PerformanceChart data={filteredMetrics} height="h-64" />
              </div>
            </section>

            {/* Overall Comments */}
            {student.overallComments && student.overallComments.length > 0 && (
              <section className="glass-card p-6 md:p-8 overflow-hidden relative animate-fade-in-up-delay-2">
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                    <ClipboardList className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Overall Feedback</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Final summary points</p>
                  </div>
                </div>
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.04] space-y-3 relative z-10">
                  {student.overallComments.map((note, i) => (
                    <p key={i} className="text-sm font-medium text-slate-300 leading-relaxed relative pl-4">
                      <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                      {note}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {/* Review Timeline */}
            <section className="glass-card p-6 md:p-8 overflow-hidden relative animate-fade-in-up-delay-2">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2.5 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Review Timeline</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Meeting logs</p>
                </div>
              </div>
              <div className="space-y-0 relative z-10">
                {student.moms && student.moms.map((mom, idx) => (
                  <div key={idx} className="relative pl-7 pb-6 last:pb-0">
                    {idx < student.moms.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-amber-500/40 to-transparent" />
                    )}
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{mom.meeting} Review</h3>
                    <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04] space-y-3">
                      {Array.isArray(mom.notes) ? (
                        mom.notes.map((note, i) => (
                          <p key={i} className="text-xs text-slate-400 leading-relaxed relative pl-3">
                            <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-amber-500/50" />
                            {note}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 leading-relaxed">{mom.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!student.moms || student.moms.length === 0) && (
                  <p className="text-sm text-slate-600 italic">No timeline available.</p>
                )}
              </div>
            </section>

            {/* Project Scorecard */}
            <section className="glass-card p-6 md:p-8 overflow-hidden relative animate-fade-in-up-delay-3">
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Project Score</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Breakdown</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border border-blue-500/20">
                  {student.projectFeedback?.totalPoints || 0} pts
                </span>
              </div>

              <div className="space-y-2 relative z-10">
                {student.projectFeedback?.scorecard?.length > 0 ? (
                  student.projectFeedback.scorecard.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm py-2.5 px-3.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.04] group">
                      <span className="text-slate-400 group-hover:text-slate-200 transition-colors text-xs">{item.criteria}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${(item.points / 10) * 100}%` }} />
                        </div>
                        <span className="font-mono text-xs text-blue-400 font-bold w-8 text-right">{item.points}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600 italic text-center p-6">Scorecard unavailable.</p>
                )}
              </div>
            </section>
          </div>
        </div>

      </div> {/* End of pdfRef */}
    </div>
  );
}
