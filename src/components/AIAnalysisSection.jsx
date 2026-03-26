import React, { useState, useEffect } from 'react';
import { generateStudentAnalysisPrompt } from '../utils/aiPrompt';
import { Sparkles, BrainCircuit, RefreshCw, AlertTriangle, ChevronRight, Target } from 'lucide-react';

export default function AIAnalysisSection({ student }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const storageKey = `bootcamp_ai_analysis_${student.id}`;

  // Check localStorage on mount or when student changes
  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setAnalysis(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse locally stored AI analysis:", e);
      }
    } else {
      setAnalysis(null); // Reset if observing a new student without cache
    }
    setError(null);
  }, [student.id, storageKey]);

  const fetchAIAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = localStorage.getItem('google_api_key');
      if (!apiKey) {
        throw new Error("Google API Key is missing. Please configure it in your Settings interface.");
      }

      const prompt = generateStudentAnalysisPrompt(student);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || "Failed to fetch response from Google AI API.");
      }

      const data = await response.json();
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

      // Try to clean markdown wrap if explicitly returned
      if (content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
      }

      const parsedJSON = JSON.parse(content);
      
      const analysisData = {
        summary: parsedJSON.summary || "No summary provided by the AI.",
        focusTags: parsedJSON.focusTags || [],
        improvements: parsedJSON.improvements || ["No specific actionable points provided."]
      };
      
      setAnalysis(analysisData);
      localStorage.setItem(storageKey, JSON.stringify(analysisData));
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card mb-8 overflow-hidden relative">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-fuchsia-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      
      <div className="p-6 md:p-8 relative z-10 flex flex-col items-start gap-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/20">
            <BrainCircuit className="w-5 h-5 text-fuchsia-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Strategy & Mentorship Plan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated synthesis of the student's entire bootcamp trajectory</p>
          </div>
        </div>

        {!analysis && !loading && (
          <button 
            onClick={fetchAIAnalysis}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-95 border border-fuchsia-400/20"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-100" />
            Generate Expert Analysis
          </button>
        )}
      </div>

      <div className="p-6 md:p-8 relative z-10 space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <RefreshCw className="w-8 h-8 text-fuchsia-400 animate-spin" />
            <p className="text-sm font-medium text-slate-400 animate-pulse">Running advanced diagnostic synthesis...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400">Analysis Failed</p>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-2xl p-5 md:p-6 shadow-inner">
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                {analysis.summary}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Priority Focus Areas</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.focusTags?.length > 0 ? analysis.focusTags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/[0.03] text-indigo-300 border border-indigo-400/20 shadow-sm"
                  >
                    #{tag}
                  </span>
                )) : (
                  <span className="text-slate-500 text-xs italic">No specific focus markers mapped.</span>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Targeted Action Plan</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.improvements?.map((imp, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl flex items-start gap-3 group hover:border-emerald-500/30 transition-colors">
                    <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{imp}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
               <button 
                onClick={fetchAIAnalysis}
                className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-400/70 hover:text-fuchsia-400 transition-colors"
               >
                <RefreshCw className="w-3.5 h-3.5" /> Re-run Analysis
               </button>
            </div>
          </div>
        )}

        {!analysis && !loading && !error && (
          <div className="bg-slate-800/20 border border-slate-700/50 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <BrainCircuit className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 max-w-sm">Tap the button above to synthesize the student's entire performance trail into a structured, highly actionable study plan using AI.</p>
          </div>
        )}
      </div>
    </div>
  );
}
