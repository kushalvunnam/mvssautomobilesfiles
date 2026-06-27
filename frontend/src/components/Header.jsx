import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, AlertTriangle, Menu, LogOut, Search, Calendar } from 'lucide-react';

export default function Header({ user, token, currentTab, onMenuClick, onLogout }) {
  const [darkMode, setDarkMode] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  // Sync Dark Mode state
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fetch low stock items for warnings
  useEffect(() => {
    if (!token) return;
    const fetchLowStockAlerts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/inventory?lowStock=true', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error('Failed to load stock alerts:', err);
      }
    };
    fetchLowStockAlerts();
    const interval = setInterval(fetchLowStockAlerts, 120000);
    return () => clearInterval(interval);
  }, [token]);

  // Format date widget
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get human-friendly Tab name
  const getTabLabel = () => {
    if (!currentTab) return 'Dashboard';
    switch (currentTab) {
      case 'dashboard': return 'Dashboard';
      case 'bodyshop': return 'Body Shop Console';
      case 'customers': return 'Customer Registry';
      case 'vehicles': return 'Vehicle Registry';
      case 'jobcards': return 'Servicing Job Cards';
      case 'estimates': return 'Estimation Center';
      case 'invoices': return 'Invoices & Billing';
      case 'inventory': return 'Inventory & Spares';
      case 'employees': return 'Staff Management';
      case 'claims': return 'Insurance Claims';
      case 'reports': return 'Reports & Analytics';
      case 'auditlogs': return 'Audit Logs';
      default: return currentTab.charAt(0).toUpperCase() + currentTab.slice(1);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex justify-between items-center select-none relative z-40">
      
      {/* Left side: Hamburger, Company, Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden transition-all animate-pulse"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex flex-col">
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            MVSS Automobiles
          </span>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold mt-0.5">
            <span>Console</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-black">{getTabLabel()}</span>
          </div>
        </div>
      </div>

      {/* Middle: SaaS search bar */}
      <div className="hidden md:flex items-center relative max-w-xs w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Global quick search..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 dark:text-white transition-all"
        />
      </div>

      {/* Right side: Date widget, Theme, Alerts, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Date Widget */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
          <Calendar className="w-3.5 h-3.5 text-indigo-650" />
          <span>{getFormattedDate()}</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showAlertsMenu && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 text-sm z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">System Alerts</span>
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold px-1.5 py-0.5 rounded-full">
                  {alerts.length} Low Stock
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto mt-2 px-2 space-y-1">
                {alerts.length > 0 ? (
                  alerts.map(item => (
                    <div key={item._id} className="flex gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all items-start">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.partName}</p>
                        <p className="text-slate-400 dark:text-slate-500 font-medium">
                          Only {item.stockQuantity} remaining (Threshold: {item.lowStockThreshold})
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 text-center py-4 text-xs font-medium">All parts stock levels normal.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile identifier */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name}</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400">{user?.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {/* Mobile-only logout button */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-550 hover:text-red-650 dark:text-slate-450 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
