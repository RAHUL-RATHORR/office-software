import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Trash2, Globe, Calendar, CreditCard, Clock, Plus, Server, Key, Copy, Eye, EyeOff, Check, User, FileText, AlertCircle, ArrowUp } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { domains as initialDomains } from '../data/mockData';

export default function Domains() {
  const [domains, setDomains] = useState(() => {
    const saved = localStorage.getItem('domaintrack_domains');
    return saved ? JSON.parse(saved) : initialDomains;
  });

  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [credModal, setCredModal] = useState({ isOpen: false, domain: null });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteData, setDeleteData] = useState({ id: null, name: '' });
  const [copiedField, setCopiedField] = useState(null);
  const [isPlatformBlinking, setIsPlatformBlinking] = useState(false);

  const [formData, setFormData] = useState({
    domainName: '',
    clientName: '',
    platform: '',
    expiryDate: '',
    remainingAmount: 0,
    platformId: '',
    platformPass: ''
  });

  useEffect(() => {
    localStorage.setItem('domaintrack_domains', JSON.stringify(domains));
  }, [domains]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      domainName: '',
      clientName: '',
      platform: '',
      expiryDate: '',
      remainingAmount: 0,
      platformId: '',
      platformPass: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (domain) => {
    setEditingId(domain.id);
    setFormData({
      domainName: domain.domainName,
      clientName: domain.clientName,
      platform: domain.platform,
      expiryDate: domain.expiryDate,
      remainingAmount: domain.remainingAmount,
      platformId: domain.platformId || '',
      platformPass: domain.platformPass || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteData({ id, name });
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setDomains(prev => prev.filter(d => d.id !== deleteData.id));
    setIsDeleteOpen(false);
    setDeleteData({ id: null, name: '' });
  };

  const calculateStats = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status = 'Active';
    if (diffDays <= 7) status = 'Expiring Soon';
    if (diffDays <= 2) status = 'Urgent';

    return { daysLeft: diffDays, status };
  };

  const handleSave = () => {
    if (!formData.domainName || !formData.clientName) {
      alert('Kripya domain aur client name bharein');
      return;
    }

    const { daysLeft, status } = calculateStats(formData.expiryDate);

    if (editingId) {
      setDomains(prev => prev.map(d =>
        d.id === editingId ? {
          ...d,
          ...formData,
          daysLeft,
          status,
          platformId: formData.platformId,
          platformPass: formData.platformPass
        } : d
      ));
    } else {
      const newDomain = {
        id: Date.now(),
        ...formData,
        daysLeft,
        status
      };
      setDomains(prev => [newDomain, ...prev]);
    }
    setIsModalOpen(false);
  };

  const triggerPlatformBlink = () => {
    if (!formData.platform) {
      setIsPlatformBlinking(true);
      setTimeout(() => setIsPlatformBlinking(false), 2000);
    }
  };

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.domainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'All') return matchesSearch;
    if (filter === 'Expiring Soon') return matchesSearch && (domain.status === 'Expiring Soon' || domain.status === 'Urgent');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Domain Portfolio</h2>
          <p className="text-slate-500 font-medium">Monitor expiry dates and status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddClick}
            className="btn-primary flex items-center gap-2 px-5 py-2.5"
          >
            <Plus className="w-5 h-5" />
            Add Domain
          </button>
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto scrollbar-hide">
            {['All', 'Expiring Soon'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${filter === tab
                    ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="grow relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by domain or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 font-semibold text-xs text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Domain Info</th>
                <th className="px-6 py-4">Platform</th>
                <th className="px-6 py-4">Status & Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDomains.map((domain) => (
                <tr key={domain.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{domain.domainName}</p>
                        <p className="text-xs text-slate-400 font-medium">Client: {domain.clientName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <Server className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{domain.platform}</span>
                        {(domain.platformId || domain.platformPass) && (
                          <button
                            onClick={() => setCredModal({ isOpen: true, domain })}
                            className="flex items-center gap-1 text-[10px] font-bold text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-widest mt-0.5"
                          >
                            <Key className="w-2.5 h-2.5" />
                            View Login
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {domain.expiryDate}
                      </div>
                      <Badge variant={domain.status === 'Active' ? 'success' : domain.status === 'Urgent' ? 'danger' : 'warning'}>
                        <Clock className="w-3 h-3" />
                        {domain.daysLeft} Days Left
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(domain)}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(domain.id, domain.domainName)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDomains.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs">No domains found</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingId ? 'Edit Domain Details' : 'Register New Domain'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: General Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 bg-primary-500 rounded-full shadow-lg shadow-primary-200"></div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">General Information</h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Domain Name</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    name="domainName"
                    value={formData.domainName}
                    onChange={handleInputChange}
                    placeholder="example.com" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none transition-all shadow-none font-bold text-slate-700 dark:text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Client Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma" 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none transition-all shadow-none font-bold text-slate-700 dark:text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Platform</label>
                  <select 
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-xl py-3 px-4 text-sm outline-none appearance-none font-bold transition-all duration-300 shadow-none ${
                      isPlatformBlinking 
                      ? 'border-primary-500 ring-4 ring-primary-100 dark:ring-primary-900/50 scale-[1.02] bg-white dark:bg-slate-700' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 focus:border-primary-600'
                    }`}
                  >
                    <option value="">Select Platform</option>
                    <option value="GoDaddy">GoDaddy</option>
                    <option value="Hostinger">Hostinger</option>
                    <option value="BigRock">BigRock</option>
                    <option value="Namecheap">Namecheap</option>
                    <option value="Google Domains">Google Domains</option>
                    <option value="Other">Other</option>
                  </select>

                  {/* Creative Floating Nudge */}
                  {isPlatformBlinking && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex justify-center animate-bounce z-10 w-full">
                      <div className="bg-primary-600 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white dark:border-slate-900 whitespace-nowrap">
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>SELECT PLATFORM FIRST!</span>
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="date" 
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-3 text-sm focus:border-primary-600 focus:ring-0 outline-none font-bold transition-all shadow-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Platform Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1 h-5 rounded-full shadow-lg ${formData.platform ? 'bg-amber-500 shadow-amber-200' : 'bg-slate-300 shadow-none'}`}></div>
                <h4 className={`text-xs font-bold uppercase tracking-widest ${formData.platform ? 'text-slate-500' : 'text-slate-400'}`}>Platform Credentials</h4>
              </div>

              {!formData.platform ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-pulse">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                    <Server className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                    ⚠️ First select a platform to enable credentials
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border-2 border-amber-100/50 dark:border-amber-800/50 flex gap-3 mb-2 animate-in zoom-in duration-300">
                  <Key className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                    Now you can enter your <span className="font-black underline">{formData.platform}</span> credentials for quick access.
                  </p>
                </div>
              )}
              
              <div 
                className={`transition-all duration-300 ${!formData.platform ? 'cursor-help' : ''}`}
                onClick={triggerPlatformBlink}
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Platform ID / Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    name="platformId"
                    value={formData.platformId}
                    onChange={handleInputChange}
                    readOnly={!formData.platform}
                    placeholder={formData.platform ? `${formData.platform} ID` : 'Select platform first'} 
                    className={`w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none font-bold transition-all shadow-none ${!formData.platform ? 'bg-slate-100/50 dark:bg-slate-800/20' : ''}`} 
                  />
                </div>
              </div>

              <div 
                className={`transition-all duration-300 ${!formData.platform ? 'cursor-help' : ''}`}
                onClick={triggerPlatformBlink}
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Platform Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    name="platformPass"
                    value={formData.platformPass}
                    onChange={handleInputChange}
                    readOnly={!formData.platform}
                    placeholder={formData.platform ? `${formData.platform} Password` : 'Select platform first'} 
                    className={`w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none font-bold transition-all shadow-none ${!formData.platform ? 'bg-slate-100/50 dark:bg-slate-800/20' : ''}`} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* View Credentials Modal */}
      <Modal
        isOpen={credModal.isOpen}
        onClose={() => setCredModal({ isOpen: false, domain: null })}
        title="Platform Credentials"
        footer={
          <button
            onClick={() => setCredModal({ isOpen: false, domain: null })}
            className="btn-primary w-full py-2.5"
          >
            Close Details
          </button>
        }
      >
        {credModal.domain && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-1">
                <Globe className="w-4 h-4 text-primary-500" />
                <h4 className="font-bold text-sm dark:text-white">{credModal.domain.domainName}</h4>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-7">{credModal.domain.platform}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Login ID / Username</label>
                <div className="flex items-center gap-2">
                  <div className="grow bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold dark:text-white border border-transparent">
                    {credModal.domain.platformId || 'Not Set'}
                  </div>
                  <button
                    onClick={() => handleCopy(credModal.domain.platformId, 'id')}
                    className={`p-2.5 rounded-xl transition-all ${copiedField === 'id' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-600'}`}
                  >
                    {copiedField === 'id' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
                <div className="flex items-center gap-2">
                  <div className="grow bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold dark:text-white border border-transparent">
                    {credModal.domain.platformPass || '••••••••'}
                  </div>
                  <button
                    onClick={() => handleCopy(credModal.domain.platformPass, 'pass')}
                    className={`p-2.5 rounded-xl transition-all ${copiedField === 'pass' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-600'}`}
                  >
                    {copiedField === 'pass' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 flex gap-3">
              <Key className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                Be careful when sharing these credentials. They provide full access to your domain hosting platform.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSave={confirmDelete}
        title="Confirm Domain Deletion"
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-sm shadow-rose-200"
            >
              Delete Domain
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold dark:text-white mb-2">Are you sure?</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kya aap sach mein <span className="font-bold text-slate-700 dark:text-slate-200">{deleteData.name}</span> ko portfolio se delete karna chahte hain?
          </p>
        </div>
      </Modal>
    </div>
  );
}
