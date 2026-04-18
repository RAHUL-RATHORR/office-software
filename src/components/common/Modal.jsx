import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, onSave, title, children, footer, size = 'md' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 text-left">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300`}>
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-white uppercase tracking-tight">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          {children}
        </div>
        
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          {footer ? footer : (
            <>
              <button 
                onClick={onClose}
                className="px-5 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 text-[13px]"
              >
                Cancel
              </button>
              <button 
                onClick={onSave || onClose}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-200 dark:shadow-none transition-all active:scale-95 text-[13px]"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
