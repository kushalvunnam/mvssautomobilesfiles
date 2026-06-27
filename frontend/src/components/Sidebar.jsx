import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  FileText, 
  FileCheck, 
  Receipt, 
  Package, 
  ShieldCheck, 
  History, 
  LogOut,
  Wrench,
  X,
  TrendingUp,
  CreditCard,
  Settings,
  UserCheck,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, isOpen, setIsOpen }) {
  const role = user?.role || 'Guest';

  // Navigation Items matching the mockup exactly
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Accounts'] },
    { id: 'customers', name: 'Customers', icon: Users, roles: ['Admin', 'Service', 'Accounts', 'Body Shop'], hasSubmenu: true },
    { id: 'vehicles', name: 'Vehicles', icon: Car, roles: ['Admin', 'Service', 'Accounts', 'Body Shop'], hasSubmenu: true },
    { id: 'jobcards', name: 'Job Cards', icon: FileText, roles: ['Admin', 'Service', 'Spares', 'Body Shop'], hasSubmenu: true },
    { id: 'estimates', name: 'Estimation', icon: FileCheck, roles: ['Admin', 'Service', 'Spares'], hasSubmenu: true },
    { id: 'bodyshop', name: 'Body Shop', icon: Wrench, roles: ['Admin', 'Body Shop'], hasSubmenu: true },
    { id: 'inventory', name: 'Inventory / Spares', icon: Package, roles: ['Admin', 'Spares'], hasSubmenu: true },
    { id: 'invoices', name: 'Billing & Invoices', icon: Receipt, roles: ['Admin', 'Accounts'], hasSubmenu: true },
    { id: 'payments', name: 'Payments', icon: CreditCard, roles: ['Admin', 'Accounts'], hasSubmenu: true },
    { id: 'claims', name: 'Insurance Claims', icon: ShieldCheck, roles: ['Admin', 'Accounts', 'Service', 'Body Shop'], hasSubmenu: true },
    { id: 'employees', name: 'Employees', icon: Users, roles: ['Admin', 'Accounts'], hasSubmenu: true },
    { id: 'reports', name: 'Reports', icon: TrendingUp, roles: ['Admin', 'Accounts', 'Service', 'Spares'], hasSubmenu: true },
    { id: 'gatepass', name: 'Gate Pass', icon: FileText, roles: ['Admin', 'Accounts', 'Service', 'Spares'], hasSubmenu: true },
    { id: 'settings', name: 'Settings', icon: Settings, roles: ['Admin'] },
    { id: 'usermanagement', name: 'User Management', icon: UserCheck, roles: ['Admin'] },
    { id: 'help', name: 'Help & Support', icon: HelpCircle, roles: ['Admin', 'Accounts', 'Service', 'Spares', 'Body Shop'] },
  ];

  // Filter items based on user role to keep same business permissions
  const filteredItems = navigationItems.filter(item => item.roles.includes(role));

  const handleItemClick = (item) => {
    // Map custom layout items to existing activeTab state
    if (item.id === 'gatepass' || item.id === 'payments') {
      setCurrentTab('invoices'); // Map gate pass / payments to Invoices page
    } else if (item.id === 'usermanagement') {
      setCurrentTab('employees');
    } else if (item.id === 'settings' || item.id === 'help') {
      setCurrentTab('dashboard'); // Placeholder mapping
    } else {
      setCurrentTab(item.id);
    }
    setIsOpen(false);
  };

  // Determine if item is visually active
  const isItemActive = (item) => {
    if (currentTab === 'invoices' && (item.id === 'gatepass' || item.id === 'payments')) return true;
    if (currentTab === 'employees' && item.id === 'usermanagement') return true;
    return currentTab === item.id;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside 
        style={{ background: 'linear-gradient(180deg, #0F4CFF 0%, #0036C7 100%)' }}
        className={`fixed md:static inset-y-0 left-0 w-64 text-white flex flex-col h-screen shrink-0 select-none transition-transform duration-300 z-50 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Section with Car Outline silhouette */}
        <div className="p-6 border-b border-white/10 flex flex-col items-center justify-center relative">
          <div className="flex flex-col items-center justify-center w-full space-y-1 mt-2">
            <svg className="w-24 h-10 text-white drop-shadow-md" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10,24 Q15,8 40,8 L65,8 Q90,8 92,24" />
              <path d="M5,24 L95,24" strokeWidth="1.5" />
              <path d="M8,26 L92,26" strokeWidth="1" />
              <circle cx="25" cy="24" r="5" fill="#0036C7" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="75" cy="24" r="5" fill="#0036C7" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <div className="text-center mt-1">
              <h2 className="text-white font-black text-lg tracking-widest leading-none">MVSS</h2>
              <span className="text-[9px] text-indigo-100 font-extrabold tracking-widest block mt-0.5">AUTOMOBILES</span>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white md:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Options List */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = isItemActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 relative ${
                  isActive 
                    ? 'bg-white text-[#0F4CFF] shadow-md shadow-black/10 font-extrabold' 
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0F4CFF]' : 'text-white/80'}`} />
                  <span>{item.name}</span>
                </div>
                {item.hasSubmenu && (
                  <ChevronDown className={`w-3 h-3 opacity-60 ${isActive ? 'text-[#0F4CFF]' : 'text-white/80'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Help Support Panel Widget */}
        <div className="px-4 py-2 border-t border-white/10">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center relative overflow-hidden">
            <div className="flex justify-center mb-1 text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 10a6 6 0 10-12 0c0 7 3 9 3 9h6s3-2 3-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v3m-3-3v1a2 2 0 002 2h2a2 2 0 002-2v-1" />
              </svg>
            </div>
            <p className="font-black text-white text-[10px]">Need Help?</p>
            <p className="text-[8px] text-white/70 font-semibold">Contact Support</p>
            <p className="text-[10px] text-white font-black mt-1 font-mono">+91 96400 12345</p>
          </div>
        </div>

        {/* Bottom profile / logout */}
        <div className="p-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-[10px] border border-white/10 shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-white font-bold text-xs truncate leading-none">{user?.name || 'User'}</h4>
              <span className="text-[9px] text-white/50 font-semibold mt-0.5 block">{user?.role}</span>
            </div>
            <button
              onClick={onLogout}
              className="ml-auto p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Glowing sports car footer banner outline */}
          <div className="w-full px-4 pt-1 pb-2 opacity-30 select-none pointer-events-none">
            <svg className="w-full h-8 text-white" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5,20 C15,16 25,6 45,6 L68,6 C82,6 88,16 95,20 L95,22 L5,22 Z" />
              <circle cx="24" cy="21" r="3.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="76" cy="21" r="3.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}
