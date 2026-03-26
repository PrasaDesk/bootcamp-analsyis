import React, { useState, useMemo } from 'react';
import useBootcampData from '../hooks/useBootcampData';
import StudentCard from '../components/StudentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import MissingConfig from '../components/MissingConfig';
import { Search, Users } from 'lucide-react';

export default function StudentList() {
  const { data: bootcampData, loading, error } = useBootcampData();
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState('All');

  const filteredStudents = useMemo(() => {
    if (!bootcampData) return [];
    return bootcampData.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrack = 
        trackFilter === 'All' ? true :
        trackFilter === 'MERN' ? student.track === 'MERN' :
        ['J2EE-React', 'Java-React'].includes(student.track?.trim());
      return matchesSearch && matchesTrack;
    });
  }, [bootcampData, searchTerm, trackFilter]);

  if (loading) return <LoadingSpinner message="Loading Students..." />;
  if (error === 'missing_config') return <MissingConfig />;
  if (error) return <div className="p-10 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <header className="mb-10 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-accentPurple to-accentPink" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Students
          </h1>
        </div>
        <p className="text-slate-400 ml-5 text-base">
          Browse and explore all bootcamp participants.
        </p>
      </header>

      {/* Controls */}
      <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center animate-fade-in-up-delay-1">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 border border-white/[0.06] rounded-xl bg-darkBg/80 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accentPurple/40 focus:border-accentPurple/30 text-sm transition-all"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          {/* Track Filter */}
          <div className="flex items-center gap-2">
            {['All', 'MERN', 'Java'].map((track) => (
              <button
                key={track}
                onClick={() => setTrackFilter(track)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                  trackFilter === track
                    ? 'bg-gradient-to-r from-accentPurple/20 to-accentPink/20 text-white border-accentPurple/30 shadow-lg shadow-accentPurple/10'
                    : 'bg-transparent text-slate-500 border-white/[0.04] hover:bg-white/[0.03] hover:text-slate-300'
                }`}
              >
                {track}
              </button>
            ))}
          </div>

          {/* Count Badge */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-400">
            <Users className="w-3.5 h-3.5" />
            <span className="font-bold text-white">{filteredStudents.length}</span>
            <span>found</span>
          </div>
        </div>
      </div>
      
      {/* Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in-up-delay-2">
          {filteredStudents.map((student, index) => (
            <StudentCard key={student.id} student={student} index={index} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center animate-fade-in-up-delay-2">
          <Search className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-400">No students found</p>
          <p className="text-sm text-slate-600 mt-1">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
