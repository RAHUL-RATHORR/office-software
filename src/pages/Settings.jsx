import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Camera, Save, RefreshCw, Trash2, ShieldCheck, Globe, Image, Upload, CloudDownload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Badge from '../components/common/Badge';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Settings() {
  const logoInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: 'Admin Account',
    email: 'admin@gmail.com',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });

  const [settings, setSettings] = useState({
    logoURL: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState({ domains: 0, maintenance: 0, history: 0 });

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('domaintrack_profile'));
    if (savedProfile) setProfile(savedProfile);

    const savedSettings = JSON.parse(localStorage.getItem('domaintrack_settings'));
    if (savedSettings) setSettings(savedSettings);

    // Calculate unsynced data stats
    const localDomains = JSON.parse(localStorage.getItem('domaintrack_domains') || '[]');
    const localClients = JSON.parse(localStorage.getItem('domaintrack_clients') || '[]');
    const localHistory = JSON.parse(localStorage.getItem('domaintrack_history') || '[]');
    setSyncStats({
      domains: localDomains.length,
      maintenance: localClients.length,
      history: localHistory.length
    });
  }, []);

  const handleFileUpload = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large! Please choose an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'logo') {
          setSettings(prev => ({ ...prev, logoURL: reader.result }));
        } else {
          setProfile(prev => ({ ...prev, photo: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('domaintrack_profile', JSON.stringify(profile));
      localStorage.setItem('domaintrack_settings', JSON.stringify(settings));
      setIsSaving(false);
      window.location.reload(); 
    }, 800);
  };

  const syncToCloud = async () => {
    if (syncStats.domains === 0 && syncStats.maintenance === 0 && syncStats.history === 0) {
      alert("No local data found to sync.");
      return;
    }

    if (!confirm(`Are you sure you want to migrate ${syncStats.domains + syncStats.maintenance} records to MongoDB Cloud?`)) return;

    setIsSyncing(true);
    try {
      const localDomains = JSON.parse(localStorage.getItem('domaintrack_domains') || '[]');
      const localClients = JSON.parse(localStorage.getItem('domaintrack_clients') || '[]');
      const localHistory = JSON.parse(localStorage.getItem('domaintrack_history') || '[]');

      // Sync Domains
      for (const domain of localDomains) {
        delete domain.id; // Let MongoDB generate _id
        await fetch(`${API_BASE_URL}/api/domains`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(domain)
        });
      }

      // Sync Clients
      for (const client of localClients) {
        delete client.id;
        await fetch(`${API_BASE_URL}/api/maintenance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client)
        });
      }

      // Sync History
      for (const item of localHistory) {
        delete item.id;
        await fetch(`${API_BASE_URL}/api/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }

      alert("🎉 Data Synced Successfully to Cloud!");
      // Optionally clear local data after sync
      localStorage.removeItem('domaintrack_domains');
      localStorage.removeItem('domaintrack_clients');
      localStorage.removeItem('domaintrack_history');
      setSyncStats({ domains: 0, maintenance: 0, history: 0 });
      window.location.reload();

    } catch (error) {
      console.error("Sync failed:", error);
      alert("Error syncing data. Make sure your server is running.");
    } finally {
      setIsSyncing(false);
    }
  };

  const clearData = () => {
    if (confirm('Are you sure? This will delete all your local domains, maintenance, and history data permanently.')) {
      localStorage.removeItem('domaintrack_domains');
      localStorage.removeItem('domaintrack_clients');
      localStorage.removeItem('domaintrack_history');
      localStorage.removeItem('domaintrack_settings');
      localStorage.removeItem('domaintrack_profile');
      alert('Data cleared successfully.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight dark:text-white">Settings</h2>
          <p className="text-slate-500 font-medium text-sm">Upload your brand assets and manage profile data.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Syncing...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cloud Migration Section */}
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-1 shadow-2xl overflow-hidden group">
            <div className="bg-white dark:bg-slate-900 rounded-[2.8rem] p-10 h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl dark:text-white flex items-center gap-3">
                  <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                    <CloudDownload className="w-6 h-6 text-primary-600" />
                  </div>
                  Cloud Data Sync
                </h3>
                <Badge variant={syncStats.domains > 0 ? "warning" : "success"}>
                   {syncStats.domains > 0 ? "Pending Sync" : "Cloud Ready"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div>
                    <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">
                      Transform your local experience into a global one. Syncing will move your browser data to **MongoDB Atlas Cloud**, enabling access from any device.
                    </p>
                    <div className="space-y-3 mb-8">
                       <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {syncStats.domains} Domains found locally
                       </div>
                       <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {syncStats.maintenance} AMC Clients found locally
                       </div>
                    </div>
                    <button
                      onClick={syncToCloud}
                      disabled={isSyncing}
                      className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 dark:hover:bg-primary-50 transition-all flex items-center justify-center gap-2 group shadow-xl"
                    >
                      {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudDownload className="w-5 h-5 group-hover:bounce" />}
                      {isSyncing ? 'Migrating Data...' : 'Sync Local Data to Cloud'}
                    </button>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                       <AlertCircle className="w-6 h-6 text-primary-500" />
                       <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Security Note</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                      Synced data is stored in your private MongoDB cluster. Ensure your server is running before starting migration.
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Brand Logo Upload Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft p-10">
            <h3 className="font-bold text-xl dark:text-white mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                <Image className="w-6 h-6 text-primary-600" />
              </div>
              Brand Identity
            </h3>
            
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="w-40 h-40 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-all overflow-hidden relative group"
              >
                {settings.logoURL ? (
                  <>
                    <img src={settings.logoURL} alt="Brand Logo" className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={logoInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Your Brand Logo</p>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">This logo will be displayed at the top of the sidebar. Transparent PNG or SVG is recommended for the best look.</p>
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline"
                >
                  Change Logo
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft p-10">
            <h3 className="font-bold text-xl dark:text-white mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              Admin Profile
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <div className="relative group cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                  <img src={profile.photo} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl" alt="Profile" />
                  <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={profileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profile')}
                  />
                </div>
                <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Photo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft p-10">
            <h3 className="font-bold text-xl dark:text-white mb-6 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              Quick Info
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version</p>
                <p className="text-sm font-bold dark:text-white">DomainTrack 2.0 (Stable)</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <p className="text-sm font-bold text-emerald-600">Connected to Cloud</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rose-50/50 dark:bg-rose-900/5 rounded-[3rem] border border-rose-100 dark:border-rose-900/10 p-10">
            <h3 className="font-bold text-xl text-rose-600 mb-6 flex items-center gap-3">
              <Trash2 className="w-6 h-6" />
              Reset
            </h3>
            <p className="text-xs text-rose-600/70 font-bold leading-relaxed mb-6 capitalize tracking-tight">
              Delete all data from browser memory. Use sync before clearing if you want to keep data in cloud.
            </p>
            <button
              onClick={clearData}
              className="w-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 hover:text-white transition-all shadow-sm"
            >
              Clear Local Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
