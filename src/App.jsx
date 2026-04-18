import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import Domains from './pages/Domains';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('domaintrack_auth') === 'true';
  });

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} setAuth={setIsAuthenticated} />
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <footer className="p-8 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            &copy; 2026 DomainTrack UI Dashboard. Professional Service Tracker.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
