import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Sparkles, GraduationCap, Sun, Moon, Settings, RefreshCw } from 'lucide-react';

export default function Sidebar() {
  const [isLight, setIsLight] = useState(() => {
    return document.documentElement.classList.contains('light');
  });
  const [refreshing, setRefreshing] = useState(false);
  const [hasUrl, setHasUrl] = useState(() => !!localStorage.getItem('bootcamp_sheet_url'));

  const handleRefreshData = async () => {
    const url = localStorage.getItem('bootcamp_sheet_url');
    if (!url) {
      alert("No sheet URL found. Please configure it in Settings first.");
      return;
    }
    
    try {
      setRefreshing(true);
      const { parseExcelFromUrl } = await import('../utils/excelParser');
      const data = await parseExcelFromUrl(url, true);
      localStorage.setItem('bootcamp_data', JSON.stringify(data));
      window.dispatchEvent(new Event('bootcamp_config_updated'));
      alert("Data successfully refreshed from remote URL!");
    } catch (err) {
      alert("Failed to refresh data: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const checkUrl = () => {
      const isUrlSource = localStorage.getItem('bootcamp_data_source') === 'url';
      setHasUrl(isUrlSource && !!localStorage.getItem('bootcamp_sheet_url'));
    };
    checkUrl();
    window.addEventListener('storage', checkUrl);
    window.addEventListener('bootcamp_config_updated', checkUrl);

    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }

    return () => {
      window.removeEventListener('storage', checkUrl);
      window.removeEventListener('bootcamp_config_updated', checkUrl);
    };
  }, [isLight]);

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { to: '/students', icon: Users, label: 'Students', badge: null },
    { to: '/settings', icon: Settings, label: 'Settings', badge: null },
  ];

  return (
    <aside className="w-72 bg-darkBg2 flex flex-col h-screen sticky top-0 overflow-y-auto overflow-x-hidden border-r border-white/[0.04] z-20 custom-scrollbar">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accentBlue/[0.03] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-accentPink/[0.03] rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      {/* Logo */}
      <div className="p-7 flex items-center gap-3 relative z-10">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accentBlue to-accentPurple flex items-center justify-center shadow-lg shadow-accentBlue/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accentGreen rounded-full border-2 border-darkBg2 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            BootAnalytics
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Performance Hub</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-6 relative z-10">
        <p className="px-4 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Navigation</p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
                isActive
                  ? 'bg-gradient-to-r from-accentBlue/15 to-accentPurple/10 text-white font-semibold border border-accentBlue/20 shadow-lg shadow-accentBlue/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-gradient-to-b from-accentBlue to-accentPurple rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-accentBlue/20' : 'group-hover:bg-white/5'}`}>
                  <link.icon className={`w-4 h-4 ${isActive ? 'text-accentBlue' : ''}`} />
                </div>
                <span className="text-sm">{link.label}</span>
                {link.badge && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-accentBlue/25 text-accentBlue' : 'bg-slate-800 text-slate-400'}`}>
                    {link.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Actions & Bottom Card */}
      <div className="mt-auto p-5 relative z-10 flex flex-col gap-3">
        
        {/* Refresh Data (Conditional) */}
        {hasUrl && (
          <button 
            onClick={handleRefreshData}
            disabled={refreshing}
            className="w-full relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 transition-all flex items-center justify-between group disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </div>
              <span className="text-sm font-semibold text-emerald-400">
                {refreshing ? 'Syncing...' : 'Refresh Data'}
              </span>
            </div>
          </button>
        )}

        {/* Toggle Theme */}
        <button 
          onClick={() => setIsLight(!isLight)}
          className="w-full relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-white/5 hover:to-white/10 border border-white/[0.06] transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg transition-all ${isLight ? 'bg-amber-400/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
              {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            <span className="text-sm font-semibold text-white">
              {isLight ? 'Light Mode' : 'Dark Mode'}
            </span>
          </div>
        </button>

        {/* Bottom Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-accentBlue/10 via-accentPurple/5 to-accentPink/10 border border-white/[0.06]">
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-accentAmber/50 animate-pulse" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accentBlue to-accentCyan flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">2026 Cohort</p>
              <p className="text-[10px] text-slate-400">Active Bootcamp</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['SR', 'YK', 'IP'].map((initials, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-darkBg2 flex items-center justify-center text-[8px] font-bold text-white">
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">+9 members</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
