import React from 'react';

// Mini trend graph (Sparkline) for premium UI look
const Sparkline = ({ type }) => {
  const points = type === 'up' 
    ? "5,18 15,12 25,15 35,8 45,10 55,4" 
    : "5,4 15,10 25,8 35,15 45,12 55,18";
  const strokeColor = type === 'up' ? '#10B981' : '#EF4444';
  return (
    <svg className="w-14 h-7 shrink-0 opacity-80" viewBox="0 0 60 25">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function StatsCard({ title, value, icon: Icon, description, trend, trendType }) {
  // Dynamic colorful gradient icon wrapper based on title
  const getIconStyles = () => {
    const t = title.toLowerCase();
    if (t.includes('revenue') || t.includes('payment')) {
      return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400';
    }
    if (t.includes('customer') || t.includes('vehicle')) {
      return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450';
    }
    if (t.includes('low stock') || t.includes('pending')) {
      return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400';
    }
    if (t.includes('claim') || t.includes('insurance')) {
      return 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400';
    }
    if (t.includes('body shop')) {
      return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450';
    }
    return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[16px] shadow-xs hover:shadow-md transition-all duration-200 animate-fade-in flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white mt-1.5">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-2xl ${getIconStyles()} shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded ${
              trendType === 'up' 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
            }`}>
              {trend}
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500">{description}</span>
        </div>
        <Sparkline type={trendType} />
      </div>
    </div>
  );
}
