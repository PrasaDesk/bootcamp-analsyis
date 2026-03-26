import React, { useState, useEffect } from 'react';
import { parseExcelData, parseExcelFromUrl } from '../utils/excelParser';
import { Settings as SettingsIcon, Save, UploadCloud, CheckCircle2, AlertTriangle, Link as LinkIcon, Clock, Trash2 } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState('0');
  const [dataSource, setDataSource] = useState('local');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('google_api_key');
    const storedUrl = localStorage.getItem('bootcamp_sheet_url');
    const storedInterval = localStorage.getItem('bootcamp_refresh_interval');
    const storedSource = localStorage.getItem('bootcamp_data_source');
    
    if (storedKey) setApiKey(storedKey);
    if (storedUrl) setSheetUrl(storedUrl);
    if (storedInterval) setRefreshInterval(storedInterval);
    if (storedSource) setDataSource(storedSource);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClearUrl = () => {
    setSheetUrl('');
    localStorage.removeItem('bootcamp_sheet_url');
    window.dispatchEvent(new Event('bootcamp_config_updated'));
    setStatus({ type: 'success', message: 'Remote URL removed successfully.' });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setStatus(null);

      // Save Configs
      if (apiKey) localStorage.setItem('google_api_key', apiKey);
      if (sheetUrl) localStorage.setItem('bootcamp_sheet_url', sheetUrl);
      localStorage.setItem('bootcamp_refresh_interval', refreshInterval);
      localStorage.setItem('bootcamp_data_source', dataSource);

      // Process Excel explicitly based on data source
      if (dataSource === 'local') {
        if (file) {
          const parsedData = await parseExcelData(file);
          localStorage.setItem('bootcamp_data', JSON.stringify(parsedData));
        }
      } else if (dataSource === 'url') {
        if (sheetUrl && (!localStorage.getItem('bootcamp_data') || localStorage.getItem('bootcamp_data_source') === 'local' || file)) {
          // Force a structural update mapping from the new targeted stream natively
          const parsedData = await parseExcelFromUrl(sheetUrl);
          localStorage.setItem('bootcamp_data', JSON.stringify(parsedData));
        }
      }

      window.dispatchEvent(new Event('bootcamp_config_updated'));
      
      setStatus({ type: 'success', message: 'Settings saved and applied successfully.' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to process file. Ensure it matches the requested Excel template.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto w-full">
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.05]">
            <SettingsIcon className="w-6 h-6 text-slate-300" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Configuration</h1>
        </div>
        <p className="text-slate-500 text-sm">Upload your bootcamp Excel file and set up your local API keys.</p>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-8 animate-fade-in-up-delay-1 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <div>
          <label className="block text-sm font-bold text-white mb-2">Google AI Studio API Key</label>
          <p className="text-xs text-slate-400 mb-3">Required to run the AI Student Analysis features.</p>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-2">Data Source Mode</label>
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setDataSource('local')} 
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex justify-center items-center gap-2 ${dataSource === 'local' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
            >
              <UploadCloud className="w-4 h-4" /> Local Upload
              {dataSource === 'local' && <CheckCircle2 className="w-4 h-4 ml-1" />}
            </button>
            <button 
              onClick={() => setDataSource('url')} 
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all flex justify-center items-center gap-2 ${dataSource === 'url' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
            >
              <LinkIcon className="w-4 h-4" /> Remote URL
              {dataSource === 'url' && <CheckCircle2 className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>

        {dataSource === 'url' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-white">Remote Sheet URL</label>
                {localStorage.getItem('bootcamp_sheet_url') && (
                  <button onClick={handleClearUrl} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold bg-red-400/10 px-2 py-1 rounded-md border border-red-500/20 active:scale-95 transition-all">
                    <Trash2 className="w-3 h-3" /> Remove URL
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">If hosted on an endpoint, provide the download link.</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://mysite.com/data_file.xlsx"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-white mb-2">Auto-Refresh</label>
              <p className="text-xs text-slate-400 mb-3">Background syncing interval.</p>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-slate-500" />
                </div>
                <select 
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="0">Off (Manual Only)</option>
                  <option value="10">Every 10 Seconds</option>
                  <option value="30">Every 30 Seconds</option>
                  <option value="60">Every 1 Minute</option>
                  <option value="300">Every 5 Minutes</option>
                  <option value="900">Every 15 Minutes</option>
                  <option value="1800">Every 30 Minutes</option>
                  <option value="3600">Every 1 Hour</option>
                </select>
              </div>
            </div>
            </div>
          </div>
        )}

        {dataSource === 'local' && (
          <div className="animate-fade-in-up">
            <label className="block text-sm font-bold text-white mb-2">Bootcamp Excel File</label>
            <p className="text-xs text-slate-400 mb-3">Upload your performance tracking sheet. This data will be saved securely in your browser's local storage.</p>
            <div className="relative group">
              <input 
                type="file" 
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-slate-900/50 border border-slate-700 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center group-hover:bg-slate-800/50 group-hover:border-indigo-500/50 transition-all">
                <UploadCloud className="w-8 h-8 text-slate-500 mb-3 group-hover:text-indigo-400 transition-colors" />
                <p className="text-sm font-bold text-white">{file ? file.name : 'Click or drag Excel file to upload'}</p>
                <p className="text-xs text-slate-500 mt-1">.xlsx limits: up to ~5MB locally</p>
              </div>
            </div>
          </div>
        )}

        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border`}>
            {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
            <p className={`text-sm font-bold ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{status.message}</p>
          </div>
        )}

        <button 
          onClick={handleSave}
          disabled={loading || (!apiKey && !file && !sheetUrl)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
          {loading ? 'Processing...' : <><Save className="w-4 h-4" /> Save Configuration</>}
        </button>
      </div>
    </div>
  );
}
