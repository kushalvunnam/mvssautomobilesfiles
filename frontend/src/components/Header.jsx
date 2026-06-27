import React, { useState, useEffect } from 'react';
import { Sun, Moon, Bell, AlertTriangle, Menu, LogOut, Search, Calendar, MessageSquare } from 'lucide-react';

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

  // Fetch low stock alerts
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
  const getFormattedDay = () => {
    return new Date().toLocaleDateString('en-IN', { weekday: 'long' });
  };
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <header className="flex flex-col md:flex-row md:h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 py-3 md:py-0 justify-between items-stretch md:items-center gap-3 select-none relative z-40">
      
      {/* Mobile top-row container */}
      <div className="w-full flex justify-between items-center md:contents">
        
        {/* Left Side: Hamburger, Logo, Company Name */}
        <div className="flex items-center gap-2.5 md:gap-3.5 min-w-0 md:order-1">
          <button
            onClick={onMenuClick}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors shrink-0"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {/* Minimalist Corporate Car Icon Logo */}
            <svg className="w-6 h-6 text-indigo-650 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12.5V16c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate leading-none">
                MVSS Automobiles
              </h1>
              <span className="hidden md:block text-[8px] text-slate-400 dark:text-slate-500 font-bold tracking-wider mt-0.5 uppercase">
                Workshop Management System
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Widgets */}
        <div className="flex items-center gap-2 md:gap-3.5 shrink-0 md:order-3">
          
          {/* Date Widget (Desktop only) */}
          <div className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <div className="text-[9px] leading-tight font-medium">
              <span className="text-slate-700 dark:text-slate-200">{getFormattedDate()}</span>
              <span className="text-slate-400 dark:text-slate-500 ml-1">({getFormattedDay()})</span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {/* Theme switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Messages badge */}
            <button className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
              <MessageSquare className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </button>

            {/* Alerts Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsMenu(!showAlertsMenu)}
                className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>

              {showAlertsMenu && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-3 text-xs z-50 animate-fade-in">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">System Alerts</span>
                    <span className="text-[9px] bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 font-bold px-1.5 py-0.5 rounded-full">
                      {alerts.length} Low Stock
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto mt-2 px-2 space-y-1">
                    {alerts.length > 0 ? (
                      alerts.map(item => (
                        <div key={item._id} className="flex gap-2.5 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors items-start">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.partName}</p>
                            <p className="text-slate-400 dark:text-slate-500 font-medium">
                              Stock: {item.stockQuantity} (Threshold: {item.lowStockThreshold})
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 dark:text-slate-500 text-center py-4 font-medium">All parts stock levels normal.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User profile identifier avatar */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              <svg className="w-5.5 h-5.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="text-left hidden md:block">
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                {user?.name || 'Admin User'}
              </span>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                {user?.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg md:hidden transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Middle Search Bar */}
      <div className="w-full md:max-w-xs lg:max-w-sm flex items-center relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden focus-within:border-indigo-650 transition-colors shrink-0 md:order-2">
        <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
        <input
          type="text"
          placeholder="Search ERP modules..."
          className="w-full px-2 py-1.5 bg-transparent text-xs font-semibold focus:outline-none dark:text-white"
        />
      </div>

    </header>
  );
}
