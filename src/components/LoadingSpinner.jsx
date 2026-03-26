import React from 'react';

export default function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-white/[0.05]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accentBlue animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-accentPurple animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-accentCyan animate-spin" style={{ animationDuration: '1.5s' }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white mb-1">{message}</p>
        <p className="text-xs text-slate-500">Parsing latest Excel data...</p>
      </div>
    </div>
  );
}
