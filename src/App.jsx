import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-darkBg text-slate-200 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden bg-mesh relative">
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
