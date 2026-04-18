import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Settings as SettingsIcon, 
  History as HistoryIcon, 
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Globe, label: 'Domains', path: '/domains' },
  { icon: CalendarDays, label: 'Maintenance', path: '/maintenance' },
  { icon: HistoryIcon, label: 'History', path: '/history' },
  { icon: SettingsIcon, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const [profile, setProfile] = useState({
    name: 'Admin Account',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  const [settings, setSettings] = useState({ logoURL: '' });

  useEffect(() => {
    const savedProfile = localStorage.getItem('domaintrack_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedSettings = localStorage.getItem('domaintrack_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 dark:shadow-none overflow-hidden">
            {settings.logoURL ? (
              <img src={settings.logoURL} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-white" />
            )}
          </div>
          <h1 className="text-xl font-black tracking-tight dark:text-white">DomainTrack</h1>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? 'text-primary-600' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={profile.photo}
              alt="Profile"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-black dark:text-white truncate">{profile.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
