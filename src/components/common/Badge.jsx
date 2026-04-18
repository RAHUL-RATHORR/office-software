import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    info: "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 leading-tight",
      variants[variant]
    )}>
      {children}
    </span>
  );
}
