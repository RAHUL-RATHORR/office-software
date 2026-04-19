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
  Clock,
  Loader2
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

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [revenue, setRevenue] = useState({ monthly: 0, yearly: 0 });
  const [recentDomains, setRecentDomains] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [stats, setStats] = useState({ domainCount: 0, clientCount: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [domainsRes, historyRes, maintenanceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/domains`),
        fetch(`${API_BASE_URL}/api/history`),
        fetch(`${API_BASE_URL}/api/maintenance`)
      ]);

      if (domainsRes.ok && historyRes.ok && maintenanceRes.ok) {
        const domains = await domainsRes.json();
        const history = await historyRes.json();
        const maintenance = await maintenanceRes.json();

        // Calculate stats
        const activeDomains = domains.filter(d => d.status === 'Active' || d.status === 'Expiring Soon');
        setActiveCount(activeDomains.length);
        setStats({ domainCount: domains.length, clientCount: maintenance.length });
        setRecentDomains(domains.slice(0, 5));

        // Calculate revenue
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let mRev = 0;
        let yRev = 0;

        history.forEach(item => {
          // MongoDB historical items or legacy items with Date object
          const itemDate = new Date(item.date);
          if (itemDate.getFullYear() === currentYear) {
            yRev += (item.amount || 0);
            if (itemDate.getMonth() === currentMonth) {
              mRev += (item.amount || 0);
            }
          }
        });

        setRevenue({ monthly: mRev, yearly: yRev });

        // Trend chart data (Last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trend = months.map((m, i) => {
          const monthlyTotal = history.reduce((acc, item) => {
            const itemDate = new Date(item.date);
            return (itemDate.getMonth() === i && itemDate.getFullYear() === currentYear) ? acc + (item.amount || 0) : acc;
          }, 0);
          return { name: m, revenue: monthlyTotal };
        });
        setChartData(trend);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Syncing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight dark:text-white">Dashboard Overview</h2>
          <p className="text-slate-500 font-medium">Cloud sync active. Monitoring your global assets.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Cloud Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Domains"
          value={stats.domainCount}
          icon={Globe}
          trend="+4%"
          color="indigo"
          description="Managed records"
        />
        <StatsCard
          title="Active Assets"
          value={activeCount}
          icon={Activity}
          trend={`${Math.round((activeCount/stats.domainCount)*100 || 0)}%`}
          color="emerald"
          description="Uptime monitoring"
        />
        <StatsCard
          title="Monthly Income"
          value={`₹${revenue.monthly}`}
          icon={Wallet}
          trend="Growth"
          color="amber"
          description="Current month"
        />
        <StatsCard
          title="Yearly AMC"
          value={`₹${revenue.yearly}`}
          icon={Coins}
          trend="Projected"
          color="rose"
          description="Annual revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold dark:text-white">Revenue Performance</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Projected vs Actual AMC collections</p>
            </div>
            <TrendingUp className="w-6 h-6 text-primary-500" />
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '12px'
                  }}
                  itemStyle={{color: '#818cf8'}}
                  cursor={{stroke: '#4f46e5', strokeWidth: 2}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold dark:text-white">Recent Assets</h3>
            <button onClick={() => navigate('/domains')} className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {recentDomains.map((domain, i) => (
              <div key={domain._id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/domains')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all border border-transparent group-hover:border-primary-100">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{domain.domainName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{domain.expiryDate}</p>
                  </div>
                </div>
                <Badge variant={domain.status === 'Active' ? 'success' : 'warning'}>
                  {domain.daysLeft}d
                </Badge>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/maintenance')}
            className="w-full mt-10 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between group hover:border-primary-400 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary-600 shadow-sm transition-transform group-hover:scale-110">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Client Sync</p>
                <p className="text-sm font-bold dark:text-white">{stats.clientCount} Active Clients</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
