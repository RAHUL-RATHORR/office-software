import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "primary" }) {
  const colorMap = {
    primary: "text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400",
    success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    warning: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    danger: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-soft card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold dark:text-white">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md",
                trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {trendValue}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
