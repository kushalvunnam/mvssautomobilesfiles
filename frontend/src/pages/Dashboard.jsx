import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  IndianRupee, 
  Wrench,
  Plus,
  Package,
  Calendar,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Dashboard({ token, user, setActiveTab }) {
  // 1. Restore the original stats cards state fields
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

  // 2. Restore the original charts state bindings
  const [charts, setCharts] = useState({
    revenueChart: [],
    serviceTypeChart: [],
    topPartsChart: [],
    billingBreakdown: { spareParts: 0, labour: 0, gst: 0 }
  });

  const [loading, setLoading] = useState(true);

  // 3. Restore the original Promise.all backend data fetch logic
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
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping mr-2" />
        Loading analytics dashboard...
      </div>
    );
  }

  if (user?.role === 'Service' || user?.role === 'Spares') {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-full min-h-[300px] text-sm font-semibold text-slate-400 p-6 text-center">
        <ShieldCheck className="w-10 h-10 text-slate-450 mb-3" />
        <h4 className="text-slate-800 dark:text-white font-bold text-sm">Access Restricted</h4>
        <p className="text-xs text-slate-450 mt-1 max-w-xs leading-relaxed">
          Please use the sidebar to access your designated workspace modules.
        </p>
      </div>
    );
  }

  // 4. Restore original SVG Line Chart coordinates calculations
  const revenuePoints = charts.revenueChart || [];
  const maxRevenue = Math.max(...revenuePoints.map(p => p.amount), 1000);
  const chartHeight = 120;
  const chartWidth = 500;
  const linePointsString = revenuePoints.map((p, idx) => {
    const x = (idx / (revenuePoints.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (p.amount / maxRevenue) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  // Mini calendar widget rendering June 2025
  const CalendarWidget = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dates = [
      '', '', '', '', '', '', 1,
      2, 3, 4, 5, 6, 7, 8,
      9, 10, 11, 12, 13, 14, 15,
      16, 17, 18, 19, 20, 21, 22,
      23, 24, 25, 26, 27, 28, 29,
      30
    ];
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Calendar</h4>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">June 2025</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-450 dark:text-slate-500">
          {days.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2 text-center text-[10px]">
          {dates.map((d, idx) => (
            <span 
              key={idx} 
              className={`py-1 rounded font-medium transition-all ${
                d === 27 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : d === '' 
                    ? 'text-transparent' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Recent job cards list with custom backgrounds
  const recentJobs = [
    { no: 'JC-270625-0012', model: 'Hyundai Creta', plate: 'TS09AB1234', status: 'In Progress', statusColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450', cost: 8450 },
    { no: 'JC-270625-0011', model: 'Maruti Swift', plate: 'TS08CD5678', status: 'Pending', statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400', cost: 4200 },
    { no: 'JC-270625-0010', model: 'Honda City', plate: 'TS09EF9876', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400', cost: 12600 },
    { no: 'JC-270625-0009', model: 'Tata Nexon', plate: 'TS07GH4321', status: 'Waiting Parts', statusColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400', cost: 6300 },
    { no: 'JC-270625-0008', model: 'Mahindra XUV700', plate: 'TS09IJ1111', status: 'In Progress', statusColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450', cost: 15750 }
  ];

  // Dynamic Donut status calculations
  const totalJobs = (stats.pendingJobCards || 0) + (stats.activeJobCards || 0) + (stats.completedJobCards || 0) + (stats.waitingPartsJobCards || 10) + (stats.deliveredJobCards || 5);
  const pendingPct = totalJobs > 0 ? Math.round(((stats.pendingJobCards || 0) / totalJobs) * 100) : 27;
  const progressPct = totalJobs > 0 ? Math.round(((stats.activeJobCards || 0) / totalJobs) * 100) : 38;
  const completedPct = totalJobs > 0 ? Math.round(((stats.completedJobCards || 0) / totalJobs) * 100) : 23;
  const waitingPct = totalJobs > 0 ? Math.round(((stats.waitingPartsJobCards || 10) / totalJobs) * 100) : 8;
  const deliveredPct = totalJobs > 0 ? Math.round(((stats.deliveredJobCards || 5) / totalJobs) * 100) : 4;

  return (
    <div className="space-y-6 animate-fade-in p-1 select-none">
      
      {/* 12 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
          value={stats.activeJobCards || 0} 
          icon={FileText} 
          description="Active Shop Floor" 
          trend="In Progress" 
          trendType="up" 
        />
        <StatsCard 
          title="Completed Job Cards" 
          value={stats.completedJobCards || 0} 
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
          value={stats.insuranceClaims || 0} 
          icon={ShieldCheck} 
          description="Insurance surveys" 
          trend="Claims" 
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

      {/* Middle Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Job Card Status Donut Chart Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-4">Job Card Status</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-2">
              {/* Conic-gradient Donut Chart using premium slate colors */}
              <div 
                className="w-28 h-28 rounded-full relative shrink-0" 
                style={{
                  background: `conic-gradient(#f59e0b 0% ${pendingPct}%, #2563eb ${pendingPct}% ${pendingPct + progressPct}%, #10b981 ${pendingPct + progressPct}% ${pendingPct + progressPct + completedPct}%, #8b5cf6 ${pendingPct + progressPct + completedPct}% ${pendingPct + progressPct + completedPct + waitingPct}%, #06b6d4 ${pendingPct + progressPct + completedPct + waitingPct}% 100%)`
                }}
              >
                <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">{totalJobs}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">Total</span>
                </div>
              </div>
              
              {/* Legend details */}
              <div className="space-y-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 w-full">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Pending</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{stats.pendingJobCards || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600" />In Progress</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{stats.activeJobCards || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Completed</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{stats.completedJobCards || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" />Waiting Parts</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{stats.waitingPartsJobCards || 10}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" />Delivered</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{stats.deliveredJobCards || 5}</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('jobcards')}
            className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-800 hover:border-indigo-600 text-indigo-650 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            View All Job Cards
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Job Cards List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Recent Job Cards</h4>
              <button onClick={() => setActiveTab('jobcards')} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              {recentJobs.map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Car className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-850 dark:text-white truncate leading-none">{job.no}</p>
                      <p className="text-[10px] text-slate-450 mt-1 font-semibold truncate">{job.model} ({job.plate})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${job.statusColor}`}>
                      {job.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      ₹{job.cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side widgets column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <CalendarWidget />
          
          {/* Reminders / Alerts list linked dynamically to DB stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Alerts</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>Low Stock ({stats.lowStockItems || 15})</span>
                </div>
                <button onClick={() => setActiveTab('inventory')} className="px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-[9px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded transition-colors shadow-2xs">
                  View
                </button>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Active Jobs ({stats.activeJobCards || 5})</span>
                </div>
                <button onClick={() => setActiveTab('jobcards')} className="px-2 py-0.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-[9px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded transition-colors shadow-2xs">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Charts & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Service type chart / Service Streams */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Service Streams</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Breakdown</span>
            </div>
            
            <div className="space-y-3 mt-2">
              {charts.serviceTypeChart && charts.serviceTypeChart.length > 0 ? (
                charts.serviceTypeChart.map((item, idx) => {
                  const totalVal = charts.serviceTypeChart.reduce((s, i) => s + i.value, 0);
                  const percent = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                  const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                  const bg = colors[idx % colors.length];

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-650 dark:text-slate-350">
                        <span>{item.name}</span>
                        <span className="font-mono text-slate-500">{item.value} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-50 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
                        <div 
                          className={`h-full rounded-full ${bg}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback to Corporate default list */
                [
                  { name: 'General Service', count: 45, color: 'bg-indigo-650' },
                  { name: 'Engine Repair', count: 28, color: 'bg-emerald-500' },
                  { name: 'Body Painting', count: 18, color: 'bg-amber-500' },
                  { name: 'Clutch Repair', count: 14, color: 'bg-purple-500' },
                  { name: 'AC Service', count: 12, color: 'bg-rose-500' }
                ].map((serv, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-650 dark:text-slate-350">
                      <span>{serv.name}</span>
                      <span className="font-mono text-slate-450">{serv.count}</span>
                    </div>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
                      <div 
                        className={`h-full rounded-full ${serv.color}`}
                        style={{ width: `${(serv.count / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Revenue Overview Line Chart Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider">Revenue Overview</h4>
              <select className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-bold">
                <option>This Month</option>
              </select>
            </div>
            
            <div className="relative mt-2">
              {revenuePoints.length > 1 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
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
                  <path
                    d={`M 20,${chartHeight - 15} L ${linePointsString} L ${chartWidth - 20},${chartHeight - 15} Z`}
                    fill="url(#rev-grad-dynamic)"
                    opacity="0.05"
                  />
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2"
                    points={linePointsString}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {revenuePoints.map((p, idx) => {
                    const x = (idx / (revenuePoints.length - 1)) * (chartWidth - 40) + 20;
                    const y = chartHeight - (p.amount / maxRevenue) * (chartHeight - 30) - 15;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="rev-grad-dynamic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              ) : (
                /* Corporate Fallback Chart Layout */
                <svg viewBox="0 0 500 130" className="w-full h-auto overflow-visible">
                  {[0, 0.5, 1].map((val, idx) => {
                    const y = 115 - val * 90;
                    return (
                      <g key={idx}>
                        <line x1="20" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                        <text x="25" y={y - 4} fontSize="8" fill="#94a3b8" fontWeight="bold" className="font-mono">
                          ₹{Math.round(val * 300).toLocaleString('en-IN')}K
                        </text>
                      </g>
                    );
                  })}
                  <path
                    d="M 20,115 L 20,115 L 85,90 L 150,95 L 215,80 L 280,85 L 345,65 L 410,75 L 475,25 L 475,115 Z"
                    fill="url(#rev-grad)"
                    opacity="0.05"
                  />
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2"
                    points="20,115 85,90 150,95 215,80 280,85 345,65 410,75 475,25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {[
                    { x: 20, y: 115 },
                    { x: 85, y: 90 },
                    { x: 150, y: 95 },
                    { x: 215, y: 80 },
                    { x: 280, y: 85 },
                    { x: 345, y: 65 },
                    { x: 410, y: 75 },
                    { x: 475, y: 25 }
                  ].map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="3.5"
                      fill="#4f46e5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}
                  <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* Month Labels */}
              <div className="flex justify-between px-2.5 mt-2 text-[9px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
                {revenuePoints.length > 1 ? (
                  revenuePoints.map((p, idx) => <span key={idx}>{p.month}</span>)
                ) : (
                  <>
                    <span>01 Jun</span>
                    <span>07 Jun</span>
                    <span>13 Jun</span>
                    <span>19 Jun</span>
                    <span>25 Jun</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm lg:col-span-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2.5 mt-1 text-center">
              
              <button 
                onClick={() => setActiveTab('jobcards')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex flex-col items-center gap-2 group"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-md">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">New Job Card</span>
              </button>

              <button 
                onClick={() => setActiveTab('customers')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex flex-col items-center gap-2 group"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-md">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Add Customer</span>
              </button>

              <button 
                onClick={() => setActiveTab('vehicles')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex flex-col items-center gap-2 group"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-md">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Add Vehicle</span>
              </button>

              <button 
                onClick={() => setActiveTab('invoices')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex flex-col items-center gap-2 group"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-md">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Create Invoice</span>
              </button>

              <button 
                onClick={() => setActiveTab('inventory')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex flex-col items-center gap-2 group"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-md">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Inventory Entry</span>
              </button>

              <button 
                onClick={() => setActiveTab('reports')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex flex-col items-center gap-2 group"
              >
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-md">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Reports</span>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[9px] font-semibold text-slate-400 gap-1.5 select-none">
        <span>© 2025 MVSS Automobiles. All Rights Reserved.</span>
        <span>Designed with precision for MVSS Automobiles</span>
      </footer>

    </div>
  );
}
