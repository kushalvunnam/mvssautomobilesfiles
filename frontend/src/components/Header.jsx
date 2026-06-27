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

  // Verified checkmark inline SVG
  const VerifiedBadge = () => (
    <svg className="w-5 h-5 text-[#0F4CFF] fill-current shrink-0" viewBox="0 0 24 24">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );

  return (
    <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex justify-between items-center select-none relative z-40">
      
      {/* Left side: Hamburger button + Welcome Greeting Header */}
      <div className="flex items-center gap-4">
        {/* Modern hamburger button in blue circle */}
        <button
          onClick={onMenuClick}
          className="p-2.5 bg-[#0F4CFF] hover:bg-indigo-700 text-white rounded-full shadow-md transition-all shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest block leading-none">
              Welcome back,
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-850 dark:text-slate-105 tracking-tight leading-none">
              {user?.name || 'Admin'}
            </h1>
            <VerifiedBadge />
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-1 block">
            MVSS Automobiles Workshop Management System
          </span>
        </div>
      </div>

      {/* Middle: Search bar with blue action button */}
      <div className="hidden lg:flex items-center relative max-w-sm w-full mx-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden focus-within:border-[#0F4CFF] focus-within:ring-2 focus-within:ring-indigo-650/15 transition-all">
        <Search className="w-4.5 h-4.5 text-slate-400 ml-3 shrink-0" />
        <input
          type="text"
          placeholder="Search anything here..."
          className="w-full px-2.5 py-2.5 bg-transparent text-xs font-semibold focus:outline-none dark:text-white"
        />
        <button className="bg-[#0F4CFF] hover:bg-indigo-700 text-white px-4 py-2.5 shrink-0 transition-colors flex items-center justify-center">
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Right side: Date, Notifications, Messages, Profile Avatar */}
      <div className="flex items-center gap-5">
        
        {/* Date Widget */}
        <div className="hidden sm:flex items-center gap-2.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-850">
          <Calendar className="w-4.5 h-4.5 text-slate-650 dark:text-slate-400" />
          <div className="text-[10px] leading-tight">
            <p className="font-extrabold text-slate-750 dark:text-white">{getFormattedDate()}</p>
            <p className="font-semibold text-slate-400 dark:text-slate-500">{getFormattedDay()}</p>
          </div>
        </div>

        {/* Notifications and Chat Icons */}
        <div className="flex items-center gap-1.5">
          {/* Theme switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-105 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Messages bell */}
          <button className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-105 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all relative">
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              3
            </span>
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsMenu(!showAlertsMenu)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-105 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all relative"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
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

        {/* User Profile Identifier avatar */}
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
            {/* Custom generic avatar graphic */}
            <svg className="w-7 h-7 text-slate-550" fill="currentColor" viewBox="0 0 24 24">
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
          {/* Mobile logout */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-450 hover:text-red-650 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
