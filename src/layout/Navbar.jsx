import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, ChevronDown, Menu, Globe, User, Clock, AlertTriangle, Lock } from 'lucide-react';
import Modal from '../components/common/Modal';

export default function Navbar({ onMenuClick, setAuth }) {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ domains: [], maintenance: [] });
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState({
    name: 'Admin Account',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  useEffect(() => {
    generateNotifications();
    const saved = localStorage.getItem('domaintrack_profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('domaintrack_auth');
    setAuth(false);
    navigate('/login');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    const storedCreds = JSON.parse(localStorage.getItem('domaintrack_creds') || JSON.stringify({
      email: 'admin@gmail.com',
      password: '123456'
    }));

    if (passForm.old !== storedCreds.password) {
      alert('Puraana password galat hai!');
      return;
    }
    if (passForm.new !== passForm.confirm) {
      alert('Naya password match nahi ho raha!');
      return;
    }
    if (passForm.new.length < 4) {
      alert('Password kam se kam 4 characters ka hona chahiye');
      return;
    }

    localStorage.setItem('domaintrack_creds', JSON.stringify({
      ...storedCreds,
      password: passForm.new
    }));
    
    alert('Password successfully badal gaya hai!');
    setIsPassModalOpen(false);
    setPassForm({ old: '', new: '', confirm: '' });
  };

  const generateNotifications = () => {
    const list = [];
    const domains = JSON.parse(localStorage.getItem('domaintrack_domains') || '[]');
    domains.forEach(d => {
      const days = Number(d.daysLeft);
      if (days <= 30) {
        list.push({
          id: `domain-${d.id}`,
          type: 'domain',
          name: d.domainName,
          daysLeft: days,
          date: d.expiryDate,
          path: '/domains',
          severity: days <= 1 ? 'critical' : days <= 7 ? 'urgent' : days <= 15 ? 'warning' : 'info'
        });
      }
    });

    const clients = JSON.parse(localStorage.getItem('domaintrack_clients') || '[]');
    clients.forEach(c => {
      const expiry = new Date(c.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (diff <= 30) {
        list.push({
          id: `maintenance-${c.id}`,
          type: 'maintenance',
          name: c.name,
          daysLeft: diff,
          date: c.expiryDate,
          path: '/maintenance',
          severity: diff <= 1 ? 'critical' : diff <= 7 ? 'urgent' : diff <= 15 ? 'warning' : 'info'
        });
      }
    });
    setNotifications(list.sort((a, b) => a.daysLeft - b.daysLeft));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearchOpen(false);
      return;
    }

    const domains = JSON.parse(localStorage.getItem('domaintrack_domains') || '[]');
    const clients = JSON.parse(localStorage.getItem('domaintrack_clients') || '[]');

    const filteredDomains = domains.filter(d => 
      d.domainName.toLowerCase().includes(query.toLowerCase()) || 
      d.clientName.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 4);

    const filteredMaintenance = clients.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 4);

    setSearchResults({ domains: filteredDomains, maintenance: filteredMaintenance });
    setIsSearchOpen(true);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const getNotifColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      case 'urgent': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'warning': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      default: return 'text-primary-600 bg-primary-50 dark:bg-primary-900/20';
    }
  };

  return (
    <>
      <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:hidden mr-4">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 max-w-xl hidden sm:block relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search domains, maintenance..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setIsSearchOpen(true)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all outline-none"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[70vh] overflow-y-auto">
              {searchResults.domains.length === 0 && searchResults.maintenance.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-sm font-medium">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {/* Domains Section */}
                  {searchResults.domains.length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Domains</p>
                      {searchResults.domains.map(d => (
                        <button
                          key={d.id}
                          onClick={() => {
                            navigate('/domains');
                            setIsSearchOpen(false);
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-500">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">{d.domainName}</p>
                            <p className="text-[10px] text-slate-500">{d.clientName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Maintenance Section */}
                  {searchResults.maintenance.length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maintenance</p>
                      {searchResults.maintenance.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            navigate('/maintenance');
                            setIsSearchOpen(false);
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">{c.name}</p>
                            <p className="text-[10px] text-slate-500">{c.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors"
              >
                Close Search
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2.5 rounded-xl transition-colors relative ${isNotifOpen ? 'bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
            )}
            <Bell className="w-5 h-5" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold text-sm dark:text-white">Notifications</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-50 dark:bg-primary-900/40 text-primary-600 rounded-full uppercase tracking-wider">
                  {notifications.length} Alerts
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        navigate(n.path);
                        setIsNotifOpen(false);
                      }}
                      className="w-full p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800/50 text-left last:border-0"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getNotifColor(n.severity)}`}>
                        {n.type === 'domain' ? <Globe className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <p className="text-sm font-bold dark:text-white truncate">
                          {n.type === 'domain' ? 'Domain Expiry' : 'Maintenance Alert'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium truncate">{n.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className={`text-[10px] font-bold ${n.severity === 'critical' ? 'text-rose-500' : 'text-slate-500'}`}>
                            {n.daysLeft <= 0 ? 'Expired' : `${n.daysLeft} days left`}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">All caught up!</p>
                    <p className="text-xs text-slate-400">No urgent alerts found.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={profile.photo}
              alt="Profile"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold dark:text-white">{profile.name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Admin</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setIsPassModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Change Password
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </header>

      {/* Change Password Modal */}
      <Modal 
        isOpen={isPassModalOpen} 
        onClose={() => setIsPassModalOpen(false)}
        title="Change Password"
        footer={(
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setIsPassModalOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordUpdate}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-100"
            >
              Update Now
            </button>
          </div>
        )}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-medium mb-4">Enter your details to update credentials.</p>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Current Password</label>
            <input
              type="password"
              required
              placeholder="Enter current password"
              value={passForm.old}
              onChange={(e) => setPassForm({ ...passForm, old: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-2"></div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">New Password</label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={passForm.new}
              onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={passForm.confirm}
              onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
