import React, { useState, useEffect } from 'react';
import { Search, History as HistoryIcon, User, Coins, Calendar, ArrowUpRight, Clock } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('domaintrack_history') || '[]');
    // Sort by date (latest first)
    setHistory(savedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const filteredHistory = history.filter(item => 
    item.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.amount?.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Payment History</h2>
          <p className="text-slate-500 font-medium">Review all your maintenance and service transactions.</p>
        </div>
        
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by client or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm shadow-soft focus:ring-2 focus:ring-primary-100 transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Client / Source</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium dark:text-slate-300">{item.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-500" />
                        </div>
                        <span className="text-sm font-bold dark:text-white">{item.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <Coins className="w-4 h-4" />
                        <span>₹{item.amount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Received
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 font-medium italic truncate max-w-[200px] block">
                        {item.notes || 'Maintenance Payment'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic grayscale opacity-70">
                    <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No transactions found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
