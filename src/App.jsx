import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast';

function App() {
  const baseUrl = import.meta.env.BASE_URL
  // React Router expects basename without trailing slash (except "/").
  const routerBasename = baseUrl === '/'
    ? '/'
    : baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl

  return (
    <BrowserRouter basename={routerBasename}>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px'
          }
        }} 
      />
      <div className="flex min-h-screen bg-darkBg text-slate-200 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-x-clip bg-mesh relative">
          {/* Subtle top gradient stripe */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accentBlue/20 to-transparent" />
          <div className="w-full h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<StudentList />} />
              <Route path="/student/:id" element={<StudentDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
