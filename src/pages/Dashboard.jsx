import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Calendar,
  ArrowRight,
  ExternalLink,
  Globe,
  Coins,
  TrendingUp,
  Wallet,
  Activity,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import StatsCard from '../components/common/StatsCard';
import Badge from '../components/common/Badge';

export default function Dashboard() {
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState({ monthly: 0, yearly: 0 });
  const [recentDomains, setRecentDomains] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('domaintrack_history') || '[]');
    const domains = JSON.parse(localStorage.getItem('domaintrack_domains') || '[]');
    const maintenance = JSON.parse(localStorage.getItem('domaintrack_clients') || '[]');

    // Calculate revenue
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let mRev = 0;
    let yRev = 0;

    // Monthly trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = months.map((m, i) => {
      const monthRev = history
        .filter(h => {
          // Date format in history: "17 Apr 2026"
          const d = h.date.split(' '); // [17, Apr, 2026]
          const mIdx = months.indexOf(d[1]);
          return mIdx === i && d[2] === currentYear.toString();
        })
        .reduce((sum, h) => sum + Number(h.amount), 0);
      return { name: m, revenue: monthRev };
    });

    history.forEach(item => {
      const d = item.date.split(' ');
      const mIdx = months.indexOf(d[1]);
      if (mIdx === currentMonth && d[2] === currentYear.toString()) {
        mRev += Number(item.amount);
      }
      if (d[2] === currentYear.toString()) {
        yRev += Number(item.amount);
      }
    });

    setRevenue({ monthly: mRev, yearly: yRev });
    setChartData(trend.slice(Math.max(currentMonth - 5, 0), currentMonth + 1));
    setRecentDomains(domains.slice(0, 5));
    setActiveCount(maintenance.length + domains.length);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight dark:text-white">Overview</h2>
          <p className="text-slate-500 font-medium">Tracking your digital empire and revenue growth.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm animate-pulse">
          <Activity className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">System Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Revenue"
          value={`₹${revenue.monthly.toLocaleString()}`}
          icon={TrendingUp}
          trend="+12%"
          trendType="up"
          color="primary"
        />
        <StatsCard
          title="Yearly Total"
          value={`₹${revenue.yearly.toLocaleString()}`}
          icon={Wallet}
          description="Gross revenue this year"
          color="emerald"
        />
        <StatsCard
          title="Active Services"
          value={activeCount}
          icon={Globe}
          description="Domains + Maintenance"
          color="blue"
        />
        <StatsCard
          title="Expiring Soon"
          value="4"
          icon={Clock}
          description="Within 30 days"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold dark:text-white">Revenue Trends</h3>
                <p className="text-xs text-slate-500 font-medium">Income performance for the last 6 months</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary-500" />
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold dark:text-white">Recent Domains</h3>
                <p className="text-xs text-slate-500 font-medium">Last 5 domains added to tracker</p>
              </div>
              <button
                onClick={() => navigate('/maintenance')}
                className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:gap-3 transition-all"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {recentDomains.map((domain, index) => (
                <div key={index} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">{domain.domainName}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{domain.clientName}</p>
                    </div>
                  </div>
                  <Badge
                    text={`₹${domain.price}`}
                    type={index % 2 === 0 ? 'emerald' : 'primary'}
                  />
                </div>
              ))}
              {recentDomains.length === 0 && (
                <div className="text-center py-8 grayscale opacity-50">
                  <Globe className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-400">No recent domains found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Maintenance Summary */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg hover:shadow-primary-100 transition-shadow group">
            <div className="relative z-10">
              <h4 className="text-xl font-bold mb-2">Need Help?</h4>
              <p className="text-sm text-indigo-100 font-medium mb-6 leading-relaxed">
                Our support team is available 24/7 to help you manage your domains.
              </p>
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                Contact Support
              </button>
            </div>
            <ExternalLink className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold dark:text-white">Account Status</h4>
              <Badge text="Admin" type="primary" />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Server Load</p>
                  <p className="text-sm font-black dark:text-white leading-none">Optimal (0.2s)</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">System Health</p>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-gradient-to-r from-emerald-500 to-primary-500 rounded-full"></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">94% Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
