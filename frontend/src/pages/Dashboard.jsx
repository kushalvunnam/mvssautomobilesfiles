import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShoppingBag,
  IndianRupee,
  Wrench
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Dashboard({ token, user, setActiveTab }) {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalVehicles: 0,
    activeJobCards: 0,
    completedJobCards: 0,
    pendingJobCards: 0,
    revenueThisMonth: 0,
    revenueThisYear: 0,
    pendingPayments: 0,
    inventoryValue: 0,
    lowStockItems: 0,
    insuranceClaims: 0,
    bodyShopJobs: 0
  });
  const [charts, setCharts] = useState({
    revenueChart: [],
    serviceTypeChart: [],
    topPartsChart: [],
    billingBreakdown: { spareParts: 0, labour: 0, gst: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, chartsRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/stats', { headers }),
          fetch('http://localhost:5000/api/dashboard/charts', { headers }),
        ]);

        if (statsRes.ok && chartsRes.ok) {
          const statsData = await statsRes.json();
          const chartsData = await chartsRes.json();
          setStats(statsData);
          setCharts(chartsData);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full min-h-[400px] text-sm font-semibold text-slate-400">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping mr-2" />
        Loading analytics dashboard...
      </div>
    );
  }

  if (user?.role === 'Service' || user?.role === 'Spares') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-full min-h-[300px] text-sm font-semibold text-slate-400 p-6 text-center">
        <ShieldCheck className="w-12 h-12 text-slate-500 mb-3" />
        <h4 className="text-slate-800 dark:text-white font-bold text-sm">Access Restricted</h4>
        <p className="text-xs text-slate-450 mt-1 max-w-xs leading-relaxed">
          Please use the sidebar to access your designated workspace modules.
        </p>
      </div>
    );
  }

  // Calculate SVG Line Chart coordinates for Revenue Chart
  const revenuePoints = charts.revenueChart || [];
  const maxRevenue = Math.max(...revenuePoints.map(p => p.amount), 1000);
  const chartHeight = 120;
  const chartWidth = 500;
  const linePointsString = revenuePoints.map((p, idx) => {
    const x = (idx / (revenuePoints.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (p.amount / maxRevenue) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 animate-fade-in p-1 select-none">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 p-6 sm:p-8 text-white shadow-lg shadow-indigo-650/10">
        {/* Glow overlay */}
        <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-sky-400/25 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/15 text-indigo-100 border border-white/10">
              <Sparkles className="w-3 h-3" />
              Live Workspace Console
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-none">
              {getGreeting()}, {user?.name || 'User'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-150 font-semibold max-w-xl leading-relaxed">
              AutoWorkshop Pro is online. Currently tracking <span className="text-white font-black">{stats.activeJobCards || stats.openJobCards || 0} active vehicle cards</span> in the servicing lifecycle.
            </p>
          </div>
          
          {/* Quick stats badges in banner */}
          <div className="flex gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3.5 rounded-2xl min-w-[110px] text-center shadow-xs">
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-indigo-200">Active Jobs</span>
              <span className="block text-2xl font-black mt-1 font-mono text-white">{stats.activeJobCards || stats.openJobCards || 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3.5 rounded-2xl min-w-[110px] text-center shadow-xs">
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-indigo-200">Revenue</span>
              <span className="block text-2xl font-black mt-1 font-mono text-emerald-300">₹{Math.round(stats.revenueThisMonth || stats.monthlyRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        <StatsCard 
          title="Total Customers" 
          value={stats.totalCustomers || 0} 
          icon={Users} 
          description="Registered Clients" 
          trend="+4%" 
          trendType="up" 
        />
        <StatsCard 
          title="Total Vehicles" 
          value={stats.totalVehicles || 0} 
          icon={Car} 
          description="Automobile Registry" 
          trend="+5%" 
          trendType="up" 
        />
        <StatsCard 
          title="Active Job Cards" 
          value={stats.activeJobCards || stats.openJobCards || 0} 
          icon={FileText} 
          description="Active Shop Floor" 
          trend="In Progress" 
          trendType="up" 
        />
        <StatsCard 
          title="Completed Job Cards" 
          value={stats.completedJobCards || stats.closedJobCards || 0} 
          icon={CheckCircle2} 
          description="Delivered Vehicles" 
          trend="Closed" 
          trendType="up" 
        />
        <StatsCard 
          title="Pending Job Cards" 
          value={stats.pendingJobCards || 0} 
          icon={Clock} 
          description="Awaiting Work" 
          trend="Queue" 
          trendType="up" 
        />
        <StatsCard 
          title="Revenue This Month" 
          value={`₹${Math.round(stats.revenueThisMonth || stats.monthlyRevenue || 0).toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          description="Current Month" 
          trend="+12%" 
          trendType="up" 
        />
        <StatsCard 
          title="Revenue This Year" 
          value={`₹${Math.round(stats.revenueThisYear || 0).toLocaleString('en-IN')}`} 
          icon={TrendingUp} 
          description="Current Year" 
          trend="Annual" 
          trendType="up" 
        />
        <StatsCard 
          title="Pending Payments" 
          value={`₹${Math.round(stats.pendingPayments || 0).toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          description="Unpaid Invoices" 
          trend="Due" 
          trendType="down" 
        />
        <StatsCard 
          title="Inventory Value" 
          value={`₹${Math.round(stats.inventoryValue || 0).toLocaleString('en-IN')}`} 
          icon={ShoppingBag} 
          description="Stock Valuation" 
          trend="Asset" 
          trendType="up" 
        />
        <StatsCard 
          title="Low Stock Items" 
          value={stats.lowStockItems || 0} 
          icon={AlertTriangle} 
          description="Needs Reordering" 
          trend={stats.lowStockItems > 0 ? 'Warning' : 'OK'} 
          trendType={stats.lowStockItems > 0 ? 'down' : 'up'} 
        />
        <StatsCard 
          title="Insurance Claims" 
          value={stats.insuranceClaims || stats.activeClaims || 0} 
          icon={ShieldCheck} 
          description="Insurance surveys" 
          trend="Claim Tracking" 
          trendType="up" 
        />
        <StatsCard 
          title="Body Shop Jobs" 
          value={stats.bodyShopJobs || 0} 
          icon={Wrench} 
          description="Dent/Paint/Align" 
          trend="In Progress" 
          trendType="up" 
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Line Chart widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">Revenue Trend</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Last 6 Months</span>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Finalized Bills
            </span>
          </div>
          
          {revenuePoints.length > 1 ? (
            <div className="relative">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                {/* Horizontal Gridlines */}
                {[0, 0.5, 1].map((val, idx) => {
                  const y = chartHeight - val * (chartHeight - 30) - 15;
                  return (
                    <g key={idx}>
                      <line x1="20" y1={y} x2={chartWidth - 20} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                      <text x="25" y={y - 4} fontSize="8" fill="#94a3b8" fontWeight="bold" className="font-mono">
                        ₹{Math.round(val * maxRevenue).toLocaleString('en-IN')}
                      </text>
                    </g>
                  );
                })}
                
                {/* Area under the line */}
                <path
                  d={`M 20,${chartHeight - 15} L ${linePointsString} L ${chartWidth - 20},${chartHeight - 15} Z`}
                  fill="url(#revenue-gradient)"
                  opacity="0.1"
                />

                {/* Glowing shadow line */}
                <polyline
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="6"
                  points={linePointsString}
                  opacity="0.15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Line path */}
                <polyline
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  points={linePointsString}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point dots */}
                {revenuePoints.map((p, idx) => {
                  const x = (idx / (revenuePoints.length - 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - (p.amount / maxRevenue) * (chartHeight - 30) - 15;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#4f46e5"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-all hover:r-6 hover:fill-indigo-700"
                    />
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Month Labels */}
              <div className="flex justify-between px-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {revenuePoints.map((p, idx) => (
                  <span key={idx}>{p.month}</span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-xs font-semibold">No recent finalized invoices to map trend.</p>
          )}
        </div>

        {/* Bar Chart Service type */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">Service Streams</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Distribution of Works</span>
          </div>
          
          <div className="space-y-4.5 mt-6">
            {charts.serviceTypeChart && charts.serviceTypeChart.length > 0 ? (
              charts.serviceTypeChart.map((item, idx) => {
                const totalVal = charts.serviceTypeChart.reduce((s, i) => s + i.value, 0);
                const percent = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                
                // Theme colors
                const colors = [
                  'bg-indigo-500', 
                  'bg-sky-500', 
                  'bg-emerald-500', 
                  'bg-amber-500', 
                  'bg-pink-500'
                ];
                const bg = colors[idx % colors.length];

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-650 dark:text-slate-350">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${bg}`} />
                        {item.name}
                      </span>
                      <span className="font-mono text-slate-500">{item.value} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
                      <div 
                        className={`h-full rounded-full ${bg} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-center py-12 text-xs font-semibold">No servicing distribution data logged yet.</p>
            )}
          </div>
        </div>

        {/* Domain Revenue / Spent Breakdown Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">Revenue Breakdown</h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Domain Share proportions</span>
          </div>
          
          <div className="space-y-4.5 mt-6">
            {(() => {
              const breakdown = charts.billingBreakdown || { spareParts: 0, labour: 0, gst: 0 };
              const total = (breakdown.spareParts || 0) + (breakdown.labour || 0) + (breakdown.gst || 0);
              
              const domains = [
                { name: 'Spare Parts Billed', value: breakdown.spareParts || 0, color: 'bg-indigo-500' },
                { name: 'Labour & Services', value: breakdown.labour || 0, color: 'bg-emerald-500' },
                { name: 'GST Taxes Collected', value: breakdown.gst || 0, color: 'bg-amber-500' }
              ];

              return domains.map((domain, idx) => {
                const percent = total > 0 ? Math.round((domain.value / total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-655 dark:text-slate-350">
                      <span className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${domain.color}`} />
                        {domain.name}
                      </span>
                      <span className="font-mono text-slate-500">₹{Math.round(domain.value).toLocaleString('en-IN')} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
                      <div 
                        className={`h-full rounded-full ${domain.color} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

      </div>

      {/* Top spare parts and action quick shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top spare parts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm lg:col-span-2">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-5">Top Consumed Spare Parts</h4>
          
          <div className="space-y-3">
            {charts.topPartsChart && charts.topPartsChart.length > 0 ? (
              charts.topPartsChart.map((part, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50/50 dark:bg-slate-950/45 rounded-2xl border border-slate-100 dark:border-slate-850 hover:border-indigo-500/10 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{part.name}</p>
                      <p className="text-[9px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">Parts Catalog Reference</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-350 font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-xl">
                    {part.qty} units billed
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-center py-10 text-xs font-semibold">No spare parts billed in final invoices yet.</p>
            )}
          </div>
        </div>

        {/* Quick Shortcuts / Action Cards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-5">Action Shortcuts</h4>
            <div className="space-y-3.5">
              {(user?.role === 'Admin' || user?.role === 'Service') && (
                <button 
                  onClick={() => setActiveTab('jobcards')} 
                  className="w-full flex items-center justify-between p-4 bg-slate-55/40 hover:bg-indigo-50/20 dark:bg-slate-950/30 dark:hover:bg-indigo-950/10 rounded-2xl transition-all border border-slate-100 dark:border-slate-850 hover:border-indigo-500/25 group text-left"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                      Create Digital Job Card
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-450 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </h5>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">Arrival check sheets & canvas markings</p>
                  </div>
                </button>
              )}

              {(user?.role === 'Admin' || user?.role === 'Service') && (
                <button 
                  onClick={() => setActiveTab('estimates')} 
                  className="w-full flex items-center justify-between p-4 bg-slate-55/40 hover:bg-indigo-50/20 dark:bg-slate-950/30 dark:hover:bg-indigo-950/10 rounded-2xl transition-all border border-slate-100 dark:border-slate-850 hover:border-indigo-500/25 group text-left"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                      Prepare Proforma Estimate
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-450 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </h5>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">Draft parts and labour pricing</p>
                  </div>
                </button>
              )}

              {(user?.role === 'Admin' || user?.role === 'Accounts') && (
                <button 
                  onClick={() => setActiveTab('invoices')} 
                  className="w-full flex items-center justify-between p-4 bg-slate-55/40 hover:bg-indigo-50/20 dark:bg-slate-950/30 dark:hover:bg-indigo-950/10 rounded-2xl transition-all border border-slate-100 dark:border-slate-850 hover:border-indigo-500/25 group text-left"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5 font-sans">
                      Generate Tax Invoice
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-450 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </h5>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">Final GST billing & claims processing</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 p-4 rounded-2xl text-center text-xs mt-6 relative overflow-hidden">
            <span className="absolute -left-4 -bottom-4 w-12 h-12 bg-indigo-500/5 rounded-full blur-xs" />
            <p className="font-extrabold text-indigo-700 dark:text-indigo-400 font-sans">Secure Database Synced</p>
            <p className="text-slate-450 font-semibold text-[9px] mt-0.5">All actions and edits are locked to the secure audit catalog.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
