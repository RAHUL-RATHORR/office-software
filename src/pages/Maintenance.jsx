import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Notebook, User, Edit2, History, Clock, FileText, Calendar, ToggleLeft, ToggleRight, CheckCircle2, XCircle, Trash2, Activity } from 'lucide-react';
import Modal from '../components/common/Modal';
import { clients as initialClients } from '../data/mockData';

export default function Maintenance() {
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('domaintrack_clients');
    const parsed = saved ? JSON.parse(saved) : initialClients;
    return parsed.map(c => ({
      ...c,
      isActive: c.isActive === undefined ? true : c.isActive,
      address: c.address || '',
      notes: c.notes || '',
      serviceName: c.serviceName || '',
      amount: c.amount || c.paidAmount || 0,
      expiryDate: c.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    }));
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('domaintrack_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ id: null, action: '', name: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    serviceName: '',
    amount: 0,
    isActive: true,
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  });

  useEffect(() => {
    localStorage.setItem('domaintrack_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('domaintrack_history', JSON.stringify(history));
  }, [history]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      serviceName: '',
      amount: 0,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address || '',
      notes: client.notes || '',
      serviceName: client.serviceName || '',
      amount: client.amount || 0,
      expiryDate: client.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    setEditingId(client.id);
    setIsModalOpen(true);
  };

  const toggleStatus = (id) => {
    const client = clients.find(c => c.id === id);
    setConfirmData({
      id: id,
      action: client.isActive ? 'Inactivate' : 'Activate',
      name: client.name
    });
    setIsConfirmOpen(true);
  };

  const handleConfirmStatus = () => {
    setClients(prev => prev.map(c => 
      c.id === confirmData.id ? { ...c, isActive: !c.isActive } : c
    ));
    setIsConfirmOpen(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    setClients(prev => prev.filter(c => c.id !== deleteId));
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  const getDaysLeft = (dateStr) => {
    if (!dateStr) return 0;
    const expiry = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sendWhatsApp = (client) => {
    const days = getDaysLeft(client.expiryDate);
    const message = `Hi ${client.name}, your AMC for "${client.serviceName}" (₹${client.amount}) is ${days <= 0 ? 'expired' : `expiring in ${days} days`} (${client.expiryDate}). Please renew to avoid service interruption. - Team DomainTrack`;
    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      alert('Kripya naam aur phone number bharein');
      return;
    }

    const newAmount = Number(formData.amount);
    let finalExpiry = formData.expiryDate;

    if (editingId) {
      const oldClient = clients.find(c => c.id === editingId);
      const oldAmount = oldClient.amount || 0;
      const difference = newAmount - oldAmount;

      if (difference > 0) {
        const currentExp = new Date(oldClient.expiryDate);
        currentExp.setDate(currentExp.getDate() + 365);
        finalExpiry = currentExp.toISOString().split('T')[0];

        const historyEntry = {
          id: Date.now(),
          clientId: editingId,
          clientName: formData.name,
          amount: difference,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          notes: `AMC Renewed: ${formData.serviceName}`
        };
        setHistory(prev => [historyEntry, ...prev]);
      }

      setClients(prev => prev.map(c =>
        c.id === editingId ? {
          ...c,
          ...formData,
          amount: newAmount,
          expiryDate: finalExpiry
        } : c
      ));
    } else {
      const newId = Date.now();
      const newRecord = {
        id: newId,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`,
        ...formData,
        amount: newAmount
      };

      if (newAmount > 0) {
        const historyEntry = {
          id: Date.now() + 1,
          clientId: newId,
          clientName: formData.name,
          amount: newAmount,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          notes: `Initial AMC: ${formData.serviceName}`
        };
        setHistory(prev => [historyEntry, ...prev]);
      }

      setClients(prev => [newRecord, ...prev]);
    }

    setIsModalOpen(false);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery);
    
    if (statusFilter === 'Active') return matchesSearch && client.isActive;
    if (statusFilter === 'Inactive') return matchesSearch && !client.isActive;
    return matchesSearch;
  });

  const activeCount = clients.filter(c => c.isActive).length;
  const inactiveCount = clients.filter(c => !c.isActive).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Maintenance</h2>
          <p className="text-slate-500 font-medium">Manage annual maintenance fees and service expiry.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddClick}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-2.5"
          >
            <Plus className="w-5 h-5" />
            Add Record
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('Active')}
          className={`cursor-pointer group p-4 bg-white dark:bg-slate-900 rounded-2xl border shadow-soft transition-all hover:shadow-md ${statusFilter === 'Active' ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-100 dark:border-slate-800'}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Services</p>
              <h3 className="text-2xl font-bold dark:text-white">{activeCount}</h3>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Inactive')}
          className={`cursor-pointer group p-4 bg-white dark:bg-slate-900 rounded-2xl border shadow-soft transition-all hover:shadow-md ${statusFilter === 'Inactive' ? 'border-slate-400 ring-1 ring-slate-400' : 'border-slate-100 dark:border-slate-800'}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl group-hover:scale-110 transition-transform">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inactive/Paused</p>
              <h3 className="text-2xl font-bold dark:text-white">{inactiveCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="grow relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or AMC service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-primary-500" />
            Payment History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 font-semibold text-xs text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">AMC Services</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">AMC Cost (₹)</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((client) => {
                const daysLeft = getDaysLeft(client.expiryDate);

                let statusColor = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
                let dotColor = 'bg-emerald-500';
                let statusLabel = `${daysLeft} Days Left`;

                if (daysLeft <= 1) {
                  statusColor = 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 animate-pulse';
                  dotColor = 'bg-rose-500';
                  statusLabel = daysLeft < 0 ? 'Expired' : 'Expires Today';
                } else if (daysLeft <= 15) {
                  statusColor = 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
                  dotColor = 'bg-orange-500';
                } else if (daysLeft <= 30) {
                  statusColor = 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
                  dotColor = 'bg-amber-500';
                }

                return (
                  <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={client.avatar} alt={client.name} className="w-10 h-10 rounded-xl shadow-sm" />
                        <div>
                          <span className="block font-bold text-slate-700 dark:text-slate-200">
                            {client.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{client.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {client.serviceName || 'Annual Maintenance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleStatus(client.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${client.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${client.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300">
                        ₹{client.amount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${statusColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                          {statusLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium pl-1">Expiry: {new Date(client.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(client)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all hover:scale-110"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(client.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingId ? 'Edit Maintenance Record' : 'Add New Record'}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: General Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-50/30 dark:bg-primary-900/10 rounded-2xl border border-primary-100/50 dark:border-primary-800/50 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${formData.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                    <p className={`text-xs font-black ${formData.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {formData.isActive ? 'ACTIVE SERVICE' : 'INACTIVE'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none transition-all shadow-none font-bold text-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-primary-600 focus:ring-0 outline-none transition-all shadow-none font-bold text-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-primary-600 focus:ring-0 outline-none transition-all shadow-none font-bold text-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">Address / Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Service address..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-primary-600 focus:ring-0 outline-none transition-all shadow-none font-medium text-slate-700 dark:text-white"
                ></textarea>
              </div>
            </div>

            {/* Right Column: Service Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-5 bg-amber-500 rounded-full shadow-lg shadow-amber-200"></div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Details</h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">AMC Service Name</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    placeholder="e.g. Website Maintenance"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none transition-all shadow-none font-bold text-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">AMC Cost (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-9 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none font-bold text-emerald-600 transition-all shadow-none"
                  />
                </div>
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
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary-600 focus:ring-0 outline-none font-black transition-all shadow-none text-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* History Modal remains same */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="AMC Payment History"
        footer={<button onClick={() => setIsHistoryOpen(false)} className="btn-primary w-full">Close</button>}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.filter(h => h.clientName.toLowerCase().includes(historySearchQuery.toLowerCase())).map(h => (
                  <tr key={h.id}>
                    <td className="px-4 py-3 text-sm font-bold dark:text-white">{h.clientName}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">₹{h.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-xs font-bold dark:text-slate-300">{h.date}</p>
                      <p className="text-[10px] text-slate-400">{h.time}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onSave={handleConfirmStatus}
        title="Confirm Status Change"
        footer={
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmStatus}
              className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-all shadow-sm ${confirmData.action === 'Activate' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'}`}
            >
              Confirm {confirmData.action}
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmData.action === 'Activate' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {confirmData.action === 'Activate' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <h4 className="text-lg font-bold dark:text-white mb-2">Are you sure?</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kya aap sach mein <span className="font-bold text-slate-700 dark:text-slate-200">"{confirmData.name}"</span> ki service ko <span className={confirmData.action === 'Activate' ? 'text-emerald-600' : 'text-rose-600'}>{confirmData.action}</span> karna chahte hain?
          </p>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSave={confirmDelete}
        title="Confirm Deletion"
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
              Delete Record
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold dark:text-white mb-2">Delete Client?</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kya aap sach mein is record ko delete karna chahte hain? Is ke baad data wapas nahi aayega.
          </p>
        </div>
      </Modal>
    </div>
  );
}
