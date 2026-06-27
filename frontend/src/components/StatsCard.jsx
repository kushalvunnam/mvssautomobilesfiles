import React from 'react';

// Mini trend graph (Sparkline) for premium UI look
const Sparkline = ({ type }) => {
  const points = type === 'up' 
    ? "5,18 15,12 25,15 35,8 45,10 55,4" 
    : "5,4 15,10 25,8 35,15 45,12 55,18";
  const strokeColor = type === 'up' ? '#10B981' : '#EF4444';
  return (
    <svg className="w-12 h-6 shrink-0 opacity-80" viewBox="0 0 60 25">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function StatsCard({ title, value, icon: Icon, description, trend, trendType }) {
  const getIconStyles = () => {
    const t = title.toLowerCase();
    if (t.includes('revenue') || t.includes('payment')) {
      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
    }
    if (t.includes('customer') || t.includes('vehicle')) {
      return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-indigo-400';
    }
    if (t.includes('low stock') || t.includes('pending')) {
      return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
    }
    if (t.includes('claim') || t.includes('insurance')) {
      return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400';
    }
    if (t.includes('body shop')) {
      return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';
    }
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-350';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-shadow duration-150 animate-fade-in flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${getIconStyles()} shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
        <div className="flex items-center gap-1.5 text-[10px] font-medium">
          {trend && (
            <span className={`px-1 py-0.5 rounded font-semibold ${
              trendType === 'up' 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/15 dark:text-emerald-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-950/15 dark:text-red-400'
            }`}>
              {trend}
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500 truncate">{description}</span>
        </div>
        <Sparkline type={trendType} />
      </div>
    </div>
  );
}
