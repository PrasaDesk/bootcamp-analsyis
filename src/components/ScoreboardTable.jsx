import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, Filter, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

const AVATAR_GRADIENTS = [
  'from-[var(--color-av1-st)] to-[var(--color-av1-en)]',
  'from-[var(--color-av2-st)] to-[var(--color-av2-en)]',
  'from-[var(--color-av3-st)] to-[var(--color-av3-en)]',
  'from-[var(--color-av4-st)] to-[var(--color-av4-en)]',
  'from-[var(--color-av5-st)] to-[var(--color-av5-en)]',
  'from-[var(--color-av6-st)] to-[var(--color-av6-en)]',
  'from-[var(--color-av7-st)] to-[var(--color-av7-en)]',
  'from-[var(--color-av8-st)] to-[var(--color-av8-en)]',
];

function getAvatarGradient(id) {
  return AVATAR_GRADIENTS[(id - 1) % AVATAR_GRADIENTS.length];
}

export default function ScoreboardTable({ data }) {
  const [sorting, setSorting] = useState([{ id: 'overall', desc: true }]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('All');

  const filteredData = useMemo(() => {
    let result = data;
    if (trackFilter !== 'All') {
      result = result.filter((student) => {
        if (trackFilter === 'MERN') return student.track.trim() === 'MERN';
        if (trackFilter === 'Java') return ['J2EE-React', 'Java-React'].includes(student.track.trim());
        return true;
      });
    }
    return result;
  }, [data, trackFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        size: 50,
        cell: (info) => (
          <span className="text-slate-500 font-mono text-sm font-semibold">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Student Name',
        cell: (info) => {
          const id = info.row.original.id;
          const grad = getAvatarGradient(id);
          return (
            <Link to={`/student/${id}`} className="flex items-center gap-3 group">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-xs font-black text-white shadow-lg ring-1 ring-white/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                {info.getValue().substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-white group-hover:text-accentBlue transition-colors text-base">
                  {info.getValue()}
                </span>
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: 'track',
        header: 'Track',
        cell: (info) => {
          const track = info.getValue() || 'Unknown';
          const isMERN = track === 'MERN';
          return (
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
              isMERN 
                ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {track}
            </span>
          );
        }
      },
      {
        accessorFn: (row) => row.scores.midTerm,
        id: 'midTerm', 
        header: 'Mid Term',
        cell: (info) => {
          const val = info.getValue();
          return (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${Math.min(val, 100)}%` }} />
              </div>
              <span className="font-mono text-base font-bold text-slate-300">{val}%</span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.scores.overall,
        id: 'overall',
        header: 'Overall',
        cell: (info) => {
          const score = info.getValue();
          let color = 'from-emerald-400 to-green-500';
          let textColor = 'text-emerald-400';
          if (score < 40) { color = 'from-red-400 to-rose-500'; textColor = 'text-red-400'; }
          else if (score < 70) { color = 'from-amber-400 to-orange-500'; textColor = 'text-amber-400'; }
          return (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${Math.min(score, 100)}%` }} />
              </div>
              <span className={`font-mono text-base font-extrabold ${textColor}`}>{score}%</span>
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.scores.overallRating,
        id: 'overallRating',
        header: 'Rating',
        cell: (info) => {
          const rating = info.getValue() || 'N/A';
          let classes = 'bg-slate-800/50 text-slate-400 border-slate-700/50';
          if (rating === 'Good' || rating === 'Excellent') classes = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
          if (rating === 'Poor') classes = 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]';
          if (rating === 'Average') classes = 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
          
          return (
            <span className={`px-4 py-2 rounded-lg text-xs font-bold text-center inline-block min-w-[90px] border ${classes}`}>
              {rating}
            </span>
          );
        }
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-5 text-sm">
      {/* Controls */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 border border-white/[0.06] rounded-xl bg-darkBg/80 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accentBlue/40 focus:border-accentBlue/30 text-sm transition-all shadow-inner"
            placeholder="Search by student name..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* Track Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 mr-1" />
          {['All', 'MERN', 'Java'].map((track) => (
            <button
              key={track}
              onClick={() => setTrackFilter(track)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                trackFilter === track
                  ? 'bg-gradient-to-r from-accentBlue/20 to-accentPurple/20 text-white border-accentBlue/30 shadow-lg shadow-accentBlue/10'
                  : 'bg-transparent text-slate-500 border-white/[0.04] hover:bg-white/[0.03] hover:text-slate-300'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-white/[0.04]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap bg-white/[0.01]"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-300 transition-colors' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUp className="w-3.5 h-3.5 text-accentBlue" />,
                            desc: <ChevronDown className="w-3.5 h-3.5 text-accentBlue" />,
                          }[header.column.getIsSorted()] ?? null}
                          {header.column.getCanSort() && !header.column.getIsSorted() && (
                            <ArrowUpDown className="w-3 h-3 text-slate-700" />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr 
                  key={row.id} 
                  className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group"
                  style={{ animationDelay: `${rowIndex * 0.02}s` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3.5 px-6 whitespace-nowrap text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-10 h-10 text-slate-700" />
                      <p className="text-slate-500 font-medium">No students found</p>
                      <p className="text-slate-600 text-xs">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-400">{table.getRowModel().rows.length}</span> of <span className="font-bold text-slate-400">{data.length}</span> candidates
          </p>
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Hash className="w-3 h-3" />
            <span>Sorted by {sorting[0]?.id || 'default'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
