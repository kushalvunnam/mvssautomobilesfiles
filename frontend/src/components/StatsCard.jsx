import React from 'react';

export default function StatsCard({ title, value, icon: Icon, description, trend, trendType }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-350 rounded-xl">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-1.5 text-xs border-t border-slate-100 dark:border-slate-800/50 pt-3">
          {trend && (
            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
              trendType === 'up' 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
            }`}>
              {trend}
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500 font-medium">{description}</span>
        </div>
      )}
    </div>
  );
}
