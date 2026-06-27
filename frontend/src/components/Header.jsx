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
    <header className="flex flex-col md:flex-row md:h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 py-3.5 md:py-0 justify-between items-stretch md:items-center gap-3 select-none relative z-40">
      
      {/* Mobile top-row container (renders as transparent layout wrapper on desktop) */}
      <div className="flex justify-between items-center md:contents">
        
        {/* Left Side: Hamburger, Logo, Company Name */}
        <div className="flex items-center gap-2 md:gap-3.5 min-w-0 md:order-1">
          <button
            onClick={onMenuClick}
            className="p-2 bg-[#0F4CFF] hover:bg-indigo-700 text-white rounded-full shadow-md transition-all shrink-0"
          >
            <Menu className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            {/* Logo */}
            <svg className="w-8 h-5 text-[#0F4CFF] shrink-0" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10,24 Q15,8 40,8 L65,8 Q90,8 92,24" />
              <path d="M5,24 L95,24" strokeWidth="1.5" />
              <circle cx="25" cy="24" r="5" fill="#0F4CFF" />
              <circle cx="75" cy="24" r="5" fill="#0F4CFF" />
            </svg>
            
            <div className="min-w-0 flex flex-col justify-center">
              <h1 className="text-xs md:text-base font-black text-slate-850 dark:text-white truncate leading-none">
                MVSS Automobiles
              </h1>
              <span className="hidden md:block text-[9px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wide mt-1 uppercase">
                Workshop Management System
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Widgets (stays on the right of the top row on mobile; moves to the far right on desktop) */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0 md:order-3">
          {/* Date Widget (Desktop only) */}
          <div className="hidden md:flex items-center gap-2.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-850">
            <Calendar className="w-4.5 h-4.5 text-slate-650 dark:text-slate-400" />
            <div className="text-[10px] leading-tight">
              <p className="font-extrabold text-slate-750 dark:text-white">{getFormattedDate()}</p>
              <p className="font-semibold text-slate-400 dark:text-slate-500">{getFormattedDay()}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 md:p-2 text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-105 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 md:w-4.5 md:h-4.5" /> : <Moon className="w-4 h-4 md:w-4.5 md:h-4.5" />}
            </button>

            {/* Messages badge */}
            <button className="p-1.5 md:p-2 text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-105 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all relative">
              <MessageSquare className="w-4 h-4 md:w-4.5 md:h-4.5" />
              <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 text-[7px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                3
              </span>
            </button>

            {/* Alerts Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsMenu(!showAlertsMenu)}
                className="p-1.5 md:p-2 text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-105 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all relative"
              >
                <Bell className="w-4 h-4 md:w-4.5 md:h-4.5" />
                <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 text-[7px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {alerts.length > 0 ? alerts.length : 5}
                </span>
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
          </div>

          {/* User profile details */}
          <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 md:pl-4">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              <svg className="w-6.5 h-6.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="text-left hidden md:block">
              <span className="block text-xs font-black text-slate-800 dark:text-slate-200 leading-none">
                {user?.name || 'Admin User'}
              </span>
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">
                {user?.role === 'Admin' ? 'Administrator' : user?.role || 'Staff'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-455 hover:text-red-650 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl md:hidden transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Search Bar sitting below header elements on mobile; inline in the middle on desktop */}
      <div className="w-full md:max-w-xs lg:max-w-sm flex items-center relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden focus-within:border-[#0F4CFF] focus-within:ring-2 focus-within:ring-indigo-650/15 transition-all shrink-0 md:order-2">
        <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
        <input
          type="text"
          placeholder="Search anything here..."
          className="w-full px-2.5 py-2 md:py-2.5 bg-transparent text-xs font-semibold focus:outline-none dark:text-white"
        />
        <button className="bg-[#0F4CFF] hover:bg-indigo-700 text-white px-4 py-2 md:py-2.5 shrink-0 transition-colors flex items-center justify-center">
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>

    </header>
  );
}
