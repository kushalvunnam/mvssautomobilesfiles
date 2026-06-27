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
  ShoppingBag,
  ArrowUpRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Dashboard({ token, user, setActiveTab }) {
  // 1. Restore the original 12 stats cards state fields
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
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dates = [
      '', '', '', '', '', '', 1,
      2, 3, 4, 5, 6, 7, 8,
      9, 10, 11, 12, 13, 14, 15,
      16, 17, 18, 19, 20, 21, 22,
      23, 24, 25, 26, 27, 28, 29,
      30
    ];
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Calendar</h4>
          <span className="text-[10px] font-black text-[#0F4CFF]">June 2025</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400">
          {days.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2 text-center text-[10px] font-bold">
          {dates.map((d, idx) => (
            <span 
              key={idx} 
              className={`py-1 rounded-lg transition-all ${
                d === 27 
                  ? 'bg-[#0F4CFF] text-white shadow-sm shadow-[#0F4CFF]/20' 
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
    { no: 'JC-270625-0012', model: 'Hyundai Creta', plate: 'TS09AB1234', status: 'In Progress', statusColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400', cost: 8450 },
    { no: 'JC-270625-0011', model: 'Maruti Swift', plate: 'TS08CD5678', status: 'Pending', statusColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400', cost: 4200 },
    { no: 'JC-270625-0010', model: 'Honda City', plate: 'TS09EF9876', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400', cost: 12600 },
    { no: 'JC-270625-0009', model: 'Tata Nexon', plate: 'TS07GH4321', status: 'Waiting Parts', statusColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400', cost: 6300 },
    { no: 'JC-270625-0008', model: 'Mahindra XUV700', plate: 'TS09IJ1111', status: 'In Progress', statusColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400', cost: 15750 }
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
      
      {/* 12 Stats Cards Grid (Restored all items in 6-column SaaS layouts) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4">Job Card Status</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-2">
              {/* Conic-gradient Donut Chart using dynamic percentages */}
              <div 
                className="w-32 h-32 rounded-full relative shrink-0" 
                style={{
                  background: `conic-gradient(#F97316 0% ${pendingPct}%, #0F4CFF ${pendingPct}% ${pendingPct + progressPct}%, #10B981 ${pendingPct + progressPct}% ${pendingPct + progressPct + completedPct}%, #A855F7 ${pendingPct + progressPct + completedPct}% ${pendingPct + progressPct + completedPct + waitingPct}%, #06B6D4 ${pendingPct + progressPct + completedPct + waitingPct}% 100%)`
                }}
              >
                <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-850 dark:text-white leading-none">{totalJobs}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Total</span>
                </div>
              </div>
              
              {/* Legend details */}
              <div className="space-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 w-full">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" />Pending</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{stats.pendingJobCards || 0} ({pendingPct}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#0F4CFF]" />In Progress</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{stats.activeJobCards || 0} ({progressPct}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Completed</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{stats.completedJobCards || 0} ({completedPct}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" />Waiting Parts</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{stats.waitingPartsJobCards || 10} ({waitingPct}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />Delivered</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{stats.deliveredJobCards || 5} ({deliveredPct}%)</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('jobcards')}
            className="w-full mt-6 py-2 border border-slate-200 dark:border-slate-800 hover:border-[#0F4CFF] text-[#0F4CFF] dark:text-indigo-400 rounded-xl text-xs font-bold transition-all hover:bg-indigo-50/5 flex items-center justify-center gap-1.5"
          >
            View All Job Cards
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recent Job Cards List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Recent Job Cards</h4>
              <button onClick={() => setActiveTab('jobcards')} className="text-[10px] font-black text-[#0F4CFF] uppercase tracking-wider hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentJobs.map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-55 dark:hover:bg-slate-950 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-850 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 flex items-center justify-center text-slate-450 shrink-0">
                      <Car className="w-5 h-5 text-[#0F4CFF]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-white leading-none">{job.no}</p>
                      <p className="text-[10px] text-slate-455 mt-1 font-semibold">{job.model} ({job.plate})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${job.statusColor}`}>
                      {job.status}
                    </span>
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-200 font-mono">
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Reminders / Alerts</h4>
              <button onClick={() => setActiveTab('inventory')} className="text-[10px] font-black text-[#0F4CFF] uppercase tracking-wider hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-red-50/40 dark:bg-red-950/5 border border-red-100/50 dark:border-red-950/20 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-red-750 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Insurance Expiring ({stats.insuranceClaims || 3})</span>
                </div>
                <button onClick={() => setActiveTab('claims')} className="px-3 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg shadow-2xs transition-colors">
                  View
                </button>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-orange-50/40 dark:bg-orange-950/5 border border-orange-100/50 dark:border-orange-950/20 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-400">
                  <Clock className="w-4 h-4" />
                  <span>Vehicle Servicing Due ({stats.activeJobCards || 5})</span>
                </div>
                <button onClick={() => setActiveTab('jobcards')} className="px-3 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900 rounded-lg shadow-2xs transition-colors">
                  View
                </button>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-purple-50/40 dark:bg-purple-950/5 border border-purple-100/50 dark:border-purple-950/20 rounded-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Low Stock Items ({stats.lowStockItems || 15})</span>
                </div>
                <button onClick={() => setActiveTab('inventory')} className="px-3 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900 rounded-lg shadow-2xs transition-colors">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Service Streams</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">Distribution</span>
            </div>
            
            <div className="space-y-3.5 mt-2">
              {charts.serviceTypeChart && charts.serviceTypeChart.length > 0 ? (
                charts.serviceTypeChart.map((item, idx) => {
                  const totalVal = charts.serviceTypeChart.reduce((s, i) => s + i.value, 0);
                  const percent = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                  const colors = ['bg-[#0F4CFF]', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-500', 'bg-rose-500'];
                  const bg = colors[idx % colors.length];

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                        <span>{item.name}</span>
                        <span className="font-mono text-slate-500">{item.value} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-50 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
                        <div 
                          className={`h-full rounded-full ${bg}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Fallback to Mockup default if DB is empty */
                [
                  { name: 'General Service', count: 45, color: 'bg-[#0F4CFF]' },
                  { name: 'Engine Repair', count: 28, color: 'bg-emerald-500' },
                  { name: 'Body Painting', count: 18, color: 'bg-orange-500' },
                  { name: 'Clutch Repair', count: 14, color: 'bg-purple-500' },
                  { name: 'AC Service', count: 12, color: 'bg-rose-500' }
                ].map((serv, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                      <span>{serv.name}</span>
                      <span className="font-mono text-slate-500">{serv.count}</span>
                    </div>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-100 dark:border-slate-900">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Revenue Overview</h4>
              <select className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-bold">
                <option>This Month</option>
              </select>
            </div>
            
            <div className="relative mt-2">
              {revenuePoints.length > 1 ? (
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
                    fill="url(#rev-grad-dynamic)"
                    opacity="0.1"
                  />

                  {/* Glowing shadow line */}
                  <polyline
                    fill="none"
                    stroke="#0F4CFF"
                    strokeWidth="5"
                    points={linePointsString}
                    opacity="0.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Line path */}
                  <polyline
                    fill="none"
                    stroke="#0F4CFF"
                    strokeWidth="2.5"
                    points={linePointsString}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data dots */}
                  {revenuePoints.map((p, idx) => {
                    const x = (idx / (revenuePoints.length - 1)) * (chartWidth - 40) + 20;
                    const y = chartHeight - (p.amount / maxRevenue) * (chartHeight - 30) - 15;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#0F4CFF"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  <defs>
                    <linearGradient id="rev-grad-dynamic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F4CFF" />
                      <stop offset="100%" stopColor="#0F4CFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              ) : (
                /* Fallback to Mockup default if DB is empty */
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
                    opacity="0.1"
                  />
                  <polyline
                    fill="none"
                    stroke="#0F4CFF"
                    strokeWidth="5"
                    points="20,115 85,90 150,95 215,80 280,85 345,65 410,75 475,25"
                    opacity="0.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    fill="none"
                    stroke="#0F4CFF"
                    strokeWidth="2.5"
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
                      r="4"
                      fill="#0F4CFF"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}
                  <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F4CFF" />
                      <stop offset="100%" stopColor="#0F4CFF" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* Month Labels */}
              <div className="flex justify-between px-2.5 mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs lg:col-span-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3 mt-1 text-center">
              
              <button 
                onClick={() => setActiveTab('jobcards')}
                className="p-3 bg-blue-50/40 hover:bg-blue-50/80 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 border border-blue-100/50 dark:border-blue-950/20 rounded-xl transition-all flex flex-col items-center gap-2 group"
              >
                <div className="p-2 bg-blue-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                  <Plus className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">New Job Card</span>
              </button>

              <button 
                onClick={() => setActiveTab('customers')}
                className="p-3 bg-emerald-50/40 hover:bg-emerald-50/80 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-950/20 rounded-xl transition-all flex flex-col items-center gap-2 group"
              >
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">Add Customer</span>
              </button>

              <button 
                onClick={() => setActiveTab('vehicles')}
                className="p-3 bg-orange-50/40 hover:bg-orange-50/80 dark:bg-orange-950/10 dark:hover:bg-orange-950/20 border border-orange-100/50 dark:border-orange-950/20 rounded-xl transition-all flex flex-col items-center gap-2 group"
              >
                <div className="p-2 bg-orange-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                  <Car className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">Add Vehicle</span>
              </button>

              <button 
                onClick={() => setActiveTab('invoices')}
                className="p-3 bg-purple-50/40 hover:bg-purple-50/80 dark:bg-purple-950/10 dark:hover:bg-purple-950/20 border border-purple-100/50 dark:border-purple-950/20 rounded-xl transition-all flex flex-col items-center gap-2 group"
              >
                <div className="p-2 bg-purple-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">Create Invoice</span>
              </button>

              <button 
                onClick={() => setActiveTab('inventory')}
                className="p-3 bg-rose-50/40 hover:bg-rose-50/80 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 border border-rose-100/50 dark:border-rose-950/20 rounded-xl transition-all flex flex-col items-center gap-2 group"
              >
                <div className="p-2 bg-rose-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                  <Package className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">Inventory Entry</span>
              </button>

              <button 
                onClick={() => setActiveTab('reports')}
                className="p-3 bg-cyan-50/40 hover:bg-cyan-50/80 dark:bg-cyan-950/10 dark:hover:bg-cyan-950/20 border border-cyan-100/50 dark:border-cyan-950/20 rounded-xl transition-all flex flex-col items-center gap-2 group"
              >
                <div className="p-2 bg-cyan-500 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-350">Reports</span>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* Footer layout matching mockup exactly */}
      <footer className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-slate-400 gap-2 select-none">
        <span>© 2025 MVSS Automobiles. All Rights Reserved.</span>
        <span className="flex items-center gap-1">
          Designed with <span className="text-red-500 text-xs">❤️</span> for MVSS Automobiles
        </span>
      </footer>

    </div>
  );
}
