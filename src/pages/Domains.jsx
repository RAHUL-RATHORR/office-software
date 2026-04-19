import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Trash2, Globe, Calendar, CreditCard, Clock, Plus, Server, Key, Copy, Eye, EyeOff, Check, User, FileText, AlertCircle, ArrowUp, Loader2 } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Domains() {
  const [domains, setDomains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch Domains from API
  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/domains`);
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setEditingId(domain._id); // MongoDB uses _id
    setFormData({
      domainName: domain.domainName,
      clientName: domain.clientName,
      platform: domain.platform,
      expiryDate: domain.expiryDate,
      remainingAmount: domain.remainingAmount || 0,
      platformId: domain.platformId || '',
      platformPass: domain.platformPass || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    setDeleteData({ id, name });
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/domains/${deleteData.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDomains(prev => prev.filter(d => d._id !== deleteData.id));
        setIsDeleteOpen(false);
        setDeleteData({ id: null, name: '' });
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.platform) {
      triggerPlatformBlink();
      return;
    }

    const { daysLeft, status } = calculateStats(formData.expiryDate);
    const submitData = { ...formData, daysLeft, status };

    setIsSubmitting(true);

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_BASE_URL}/api/domains/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/domains`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
      }

      if (response.ok) {
        const savedData = await response.json();
        if (editingId) {
          setDomains(prev => prev.map(d => d._id === editingId ? savedData : d));
        } else {
          setDomains(prev => [savedData, ...prev]);
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving domain:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerPlatformBlink = () => {
    if (!formData.platform) {
      setIsPlatformBlinking(true);
      setTimeout(() => setIsPlatformBlinking(false), 2000);
    }
  };

  const filteredDomains = domains.filter(domain => {
    const matchesSearch = domain.domainName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.clientName?.toLowerCase().includes(searchQuery.toLowerCase());

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
        </div>

        <div className="overflow-x-auto min-h-[300px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Syncing Cloud...</p>
              </div>
            </div>
          )}

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
                <tr key={domain._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(domain)}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(domain._id, domain.domainName)}
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

        {!isLoading && filteredDomains.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs">No domains found</h3>
          </div>
        )}
      </div>

      {/* Domain Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Domain' : 'Add New Domain'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Domain Name</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="domainName"
                    value={formData.domainName}
                    onChange={handleInputChange}
                    placeholder="example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-600 transition-all font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Client Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-600 transition-all font-bold"
                    required
                  />
                </div>
              </div>
              <div className={cn("transition-all duration-500 p-3 rounded-xl", isPlatformBlinking ? "bg-rose-50 dark:bg-rose-900/20 ring-2 ring-rose-500" : "")}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Registration Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['GoDaddy', 'Hostinger', 'BigRock', 'Namecheap', 'Google', 'Other'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: p })}
                      className={cn(
                        "py-2 px-3 rounded-lg text-xs font-bold transition-all border",
                        formData.platform === p 
                          ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200" 
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-400"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-600 transition-all font-bold"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Platform ID</label>
                  <input
                    name="platformId"
                    value={formData.platformId}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary-600 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Platform Password</label>
                  <input
                    name="platformPass"
                    value={formData.platformPass}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary-600 transition-all font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 px-1">Remaining Amount (₹)</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="remainingAmount"
                    value={formData.remainingAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 transition-all font-black text-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 shrink-0" />}
              {editingId ? 'Update Domain' : 'Save Domain'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Login Credentials Modal */}
      <Modal
        isOpen={credModal.isOpen}
        onClose={() => setCredModal({ isOpen: false, domain: null })}
        title="Login Credentials"
        size="md"
      >
        {credModal.domain && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                   <Server className="w-5 h-5 text-primary-500" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registrar</p>
                   <p className="text-sm font-black dark:text-white leading-none">{credModal.domain.platform}</p>
                 </div>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Platform login ID</label>
                    <div className="group relative">
                      <input 
                        readOnly 
                        value={credModal.domain.platformId || 'N/A'} 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold dark:text-white"
                      />
                      <button 
                        onClick={() => handleCopy(credModal.domain.platformId, 'id')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary-500 transition-colors"
                      >
                        {copiedField === 'id' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 px-1">Platform Password</label>
                    <div className="group relative">
                      <input 
                        type="text" 
                        readOnly 
                        value={credModal.domain.platformPass || 'N/A'} 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold dark:text-white"
                      />
                      <button 
                        onClick={() => handleCopy(credModal.domain.platformPass, 'pass')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary-500 transition-colors"
                      >
                        {copiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
               <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
               <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider leading-relaxed">
                 Warning: These credentials grant direct access to your domain registry. Keep them secure.
               </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Domain"
        size="sm"
      >
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-rose-900 dark:text-rose-400 mb-2">Are you sure?</h4>
            <p className="text-sm text-rose-700 dark:text-rose-500 font-medium">
              You are about to delete <span className="font-black underline">{deleteData.name}</span>.<br />This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Now'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Utility function for conditional classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
