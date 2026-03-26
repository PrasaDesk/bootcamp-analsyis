import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Settings } from 'lucide-react';

export default function MissingConfig() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in-up">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Configuration Required</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        To power the dashboard and AI features, please upload your bootcamp data file and provide your Google API key in the settings panel.
      </p>
      <Link 
        to="/settings" 
        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
      >
        <Settings className="w-4 h-4" />
        Configure Settings
      </Link>
    </div>
  );
}
