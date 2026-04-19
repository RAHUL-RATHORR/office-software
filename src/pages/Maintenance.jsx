import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Notebook, User, Edit2, History, Clock, FileText, Calendar, ToggleLeft, ToggleRight, CheckCircle2, XCircle, Trash2, Activity, Loader2, Save } from 'lucide-react';
import Modal from '../components/common/Modal';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Maintenance() {
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch Data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, historyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/maintenance`),
        fetch(`${API_BASE_URL}/api/history`)
      ]);
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      isActive: true,
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || '',
      serviceName: client.serviceName || '',
      amount: client.amount || 0,
      isActive: client.isActive,
      expiryDate: client.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    setEditingId(client._id);
    setIsModalOpen(true);
  };

  const toggleStatus = (id) => {
    const client = clients.find(c => c._id === id);
    setConfirmData({
      id: id,
      action: client.isActive ? 'Inactivate' : 'Activate',
      name: client.name
    });
    setIsConfirmOpen(true);
  };

  const confirmStatusChange = async () => {
    setIsSubmitting(true);
    const client = clients.find(c => c._id === confirmData.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/${confirmData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !client.isActive })
      });
      if (response.ok) {
        const updated = await response.json();
        setClients(prev => prev.map(c => c._id === confirmData.id ? updated : c));
        setIsConfirmOpen(false);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/maintenance/${deleteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setClients(prev => prev.filter(c => c._id !== deleteId));
        setIsDeleteOpen(false);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      if (editingId) {
        response = await fetch(`${API_BASE_URL}/api/maintenance/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/maintenance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        const savedData = await response.json();
        
        // Log to history if new
        if (!editingId) {
          const newHistory = {
            clientId: savedData._id,
            clientName: savedData.name,
            amount: savedData.amount,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          await fetch(`${API_BASE_URL}/api/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newHistory)
          });
          
          // Re-fetch history to be sure
          const historyRes = await fetch(`${API_BASE_URL}/api/history`);
          if (historyRes.ok) setHistory(await historyRes.json());
        }

        if (editingId) {
          setClients(prev => prev.map(c => c._id === editingId ? savedData : c));
        } else {
          setClients(prev => [savedData, ...prev]);
        }
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving maintenance record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      client.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Active') return matchesSearch && client.isActive;
    if (statusFilter === 'Inactive') return matchesSearch && !client.isActive;
    return matchesSearch;
  });

  const filteredHistory = history.filter(item =>
    item.clientName?.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Maintenance & AMC</h2>
          <p className="text-slate-500 font-medium">Manage client renewals and services.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all shadow-sm group"
          >
            <History className="w-5 h-5 group-hover:rotate-[-10deg] transition-transform" />
          </button>
          <button
            onClick={handleAddClick}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-200 dark:shadow-none flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Client
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-4">
          <div className="grow relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-100 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {['All', 'Active', 'Inactive'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${statusFilter === f
                  ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {f}
              </button>
            ))}
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
            <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Client Detail</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{client.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{client.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{client.serviceName}</p>
                      <p className="text-xs text-emerald-500 font-black italic">₹{client.amount}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {client.expiryDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(client._id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${client.isActive
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                    >
                      {client.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {client.isActive ? 'Active' : 'Expired'}
                    </button>
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
                        onClick={() => handleDeleteClick(client._id)}
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
      </div>

      {/* Client History Modal */}
      <Modal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Service Payment History"
        size="lg"
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={historySearchQuery}
              onChange={(e) => setHistorySearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm"
            />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredHistory.map((item) => (
              <div key={item._id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-primary-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.clientName}</h5>
                    <div className="flex items-center gap-3 text-[10px] items-center font-bold text-slate-400 lowercase tracking-widest mt-1">
                      <span className="flex items-center gap-1 uppercase"><Calendar className="w-3 h-3" /> {item.date}</span>
                      <span className="flex items-center gap-1 uppercase"><Clock className="w-3 h-3" /> {item.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">₹{item.amount}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Received</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Add/Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Client Detail' : 'Add New Client'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Customer Identity</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Customer Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jane Smith"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:border-primary-600 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:border-primary-600 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="jane@example.com"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:border-primary-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address..."
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:border-primary-600 outline-none transition-all min-h-[60px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Service Configuration</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Service or Plan Name</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      name="serviceName"
                      value={formData.serviceName}
                      onChange={handleInputChange}
                      placeholder="e.g., SEO Monthly"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">AMC Amount (₹)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl py-3 px-4 text-sm font-black text-emerald-600 focus:border-emerald-500 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Sync Date / Expiry</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold focus:border-primary-600 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Internal Notes</label>
                  <div className="relative">
                    <Notebook className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Private notes..."
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:border-primary-600 outline-none transition-all min-h-[70px] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-100 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {editingId ? 'Update Client' : 'Deploy Records'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Change Status"
        size="sm"
      >
        <div className="space-y-6 text-center">
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
            <Activity className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold dark:text-white capitalize mb-2">{confirmData.action} Client?</h4>
            <p className="text-sm text-slate-500 font-medium">Are you sure you want to {confirmData.action.toLowerCase()} <span className="text-primary-600 font-bold">{confirmData.name}</span>?</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500"
            >
              Wait
            </button>
            <button
              onClick={confirmStatusChange}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Do it'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Record"
        size="sm"
      >
        <div className="space-y-6 text-center">
          <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-rose-900 dark:text-rose-400 mb-2">Delete Permanently?</h4>
            <p className="text-sm text-rose-700 dark:text-rose-500 font-medium">This record will be removed from your cloud database forever.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500"
            >
              No, Keep it
            </button>
            <button
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
