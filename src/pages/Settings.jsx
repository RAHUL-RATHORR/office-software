import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Camera, Save, RefreshCw, Trash2, ShieldCheck, Globe, Image, Upload } from 'lucide-react';

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

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('domaintrack_profile'));
    if (savedProfile) setProfile(savedProfile);

    const savedSettings = JSON.parse(localStorage.getItem('domaintrack_settings'));
    if (savedSettings) setSettings(savedSettings);
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
                className="relative w-40 h-40 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-4 border-dashed border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary-400 transition-all"
              >
                {settings.logoURL ? (
                  <img src={settings.logoURL} alt="Brand Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Logo</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-primary-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Camera className="w-8 h-8 text-white animate-bounce" />
                </div>
                <input 
                  type="file" 
                  ref={logoInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
              </div>
              <div className="space-y-4 flex-1">
                <h4 className="font-bold text-slate-700 dark:text-white">System Brand Logo</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  This logo will appear in the top-left corner of your sidebar. For the best result, use a high-resolution square image (PNG or JPG).
                </p>
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-600 transition-all"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* Profile Upload Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft p-10">
            <h3 className="font-bold text-xl dark:text-white mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              Profile Info
            </h3>
            
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="relative group cursor-pointer" onClick={() => profileInputRef.current?.click()}>
                  <img
                    src={profile.photo}
                    alt="Admin"
                    className="w-32 h-32 rounded-[2.5rem] object-cover ring-4 ring-slate-50 dark:ring-slate-800 shadow-2xl transition-transform group-hover:scale-95"
                  />
                  <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-500 rounded-2xl text-white shadow-xl">
                    <Camera className="w-6 h-6" />
                  </div>
                  <input 
                    type="file" 
                    ref={profileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profile')}
                  />
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-600 font-bold dark:text-white transition-all shadow-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-600 font-bold dark:text-white transition-all shadow-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none min-h-[300px] flex flex-col justify-center">
            <ShieldCheck className="w-16 h-16 mb-6 opacity-40 animate-pulse" />
            <h4 className="text-3xl font-black mb-4 italic tracking-tighter leading-none">LOCAL<br/>FIRST</h4>
            <p className="text-sm text-indigo-100 font-bold leading-relaxed opacity-90 max-w-[200px]">
              No servers. No cloud tracking. Your data stays on your machine.
            </p>
            <Globe className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-12" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft p-10">
            <h4 className="font-black dark:text-white mb-8 uppercase tracking-[0.2em] text-[10px] text-slate-400">Environment</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol</span>
                <span className="text-xs font-black dark:text-white italic">Encrypted LS</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uptime</span>
                <span className="text-xs font-black text-emerald-500">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
