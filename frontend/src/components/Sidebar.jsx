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
  TrendingUp
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, isOpen, setIsOpen }) {
  const role = user?.role || 'Guest';

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Accounts'] },
    { id: 'bodyshop', name: 'Body Shop', icon: Wrench, roles: ['Admin', 'Body Shop'] },
    { id: 'customers', name: 'Customers', icon: Users, roles: ['Admin', 'Service', 'Accounts', 'Body Shop'] },
    { id: 'vehicles', name: 'Vehicles', icon: Car, roles: ['Admin', 'Service', 'Accounts', 'Body Shop'] },
    { id: 'jobcards', name: 'Job Cards', icon: FileText, roles: ['Admin', 'Service', 'Spares', 'Body Shop'] },
    { id: 'estimates', name: 'Estimates', icon: FileCheck, roles: ['Admin', 'Service', 'Spares'] },
    { id: 'invoices', name: 'Invoices', icon: Receipt, roles: ['Admin', 'Accounts'] },
    { id: 'inventory', name: 'Inventory Parts', icon: Package, roles: ['Admin', 'Spares'] },
    { id: 'employees', name: 'Employees', icon: Users, roles: ['Admin', 'Accounts'] },
    { id: 'claims', name: 'Insurance Claims', icon: ShieldCheck, roles: ['Admin', 'Accounts', 'Service', 'Body Shop'] },
    { id: 'reports', name: 'Reports', icon: TrendingUp, roles: ['Admin', 'Accounts', 'Service', 'Spares'] },
    { id: 'auditlogs', name: 'Audit Logs', icon: History, roles: ['Admin'] },
  ];

  const filteredItems = navigationItems.filter(item => item.roles.includes(role));

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
        {/* Brand Section */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-indigo-650 rounded-xl shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-sm tracking-wider uppercase">AutoWorkshop</h2>
              <span className="text-[10px] text-white/70 font-bold tracking-widest uppercase">PRO</span>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white md:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Options */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 relative ${
                  isActive 
                    ? 'bg-white text-indigo-700 shadow-lg shadow-black/10 font-bold' 
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-700' : 'text-white/80'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile / Logout Section */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-xs border border-white/10">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-white font-bold text-xs truncate">{user?.name || 'User'}</h4>
              <span className="text-[10px] text-white/60 font-semibold block">{user?.role}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-bold transition-all duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </aside>
      </>
    );
  }
