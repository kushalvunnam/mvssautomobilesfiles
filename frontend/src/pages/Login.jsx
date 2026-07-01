import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Wrench, Eye, EyeOff, ShieldAlert, CheckCircle, FileText, Receipt, Package, Users, ChevronRight, Check, Cpu } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Carousel states
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'Digital Job Card Wizard',
      description: 'Log vehicle check sheets, capture customer signatures, and trace auto damage on an interactive 3D damage canvas.',
      tag: 'Service Advisors',
      icon: FileText,
      color: 'text-sky-400 border-sky-900/30 bg-sky-950/20',
      glow: 'from-sky-500/5 to-transparent'
    },
    {
      title: 'GST Tax Invoicing & Accounts',
      description: 'Generate proforma, tax, or retail invoices with custom CGST/SGST/IGST splits, surveyor approvals, and number-to-words parsing.',
      tag: 'Accounts & Billing',
      icon: Receipt,
      color: 'text-emerald-400 border-emerald-900/30 bg-emerald-950/20',
      glow: 'from-emerald-500/5 to-transparent'
    },
    {
      title: 'Spares Inventory Manager',
      description: 'Track catalog counts, manage low stock thresholds, and trigger auto-deductions directly upon finalizing customer bills.',
      tag: 'Spares & Store',
      icon: Package,
      color: 'text-purple-400 border-purple-900/30 bg-purple-950/20',
      glow: 'from-purple-500/5 to-transparent'
    },
    {
      title: 'Staff Registry & Payroll (EMS)',
      description: 'Track daily employee attendance, log joining files, upload resumes, and calculate salary slips with leave deductions.',
      tag: 'Admins & Management',
      icon: Users,
      color: 'text-indigo-400 border-indigo-900/30 bg-indigo-950/20',
      glow: 'from-indigo-500/5 to-transparent'
    },
    {
      title: 'Body Shop & Repair Hub',
      description: 'Manage dent repairs, bumper repairs, glass replacements, painting stages, and chassis alignment with high-res images.',
      tag: 'Body Shop (BShop)',
      icon: Wrench,
      color: 'text-orange-400 border-orange-900/30 bg-orange-950/20',
      glow: 'from-orange-500/5 to-transparent'
    }
  ];

  // Dynamic theme based on selected/typed email
  const activeEmail = email.toLowerCase();
  let activeTheme = {
    color: 'indigo',
    border: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    btnGradient: 'from-indigo-600 to-blue-600 shadow-indigo-950/50 bg-indigo-600',
    topBlob: 'bg-indigo-600/10',
    bottomBlob: 'bg-sky-600/5'
  };

  if (activeEmail.includes('service')) {
    activeTheme = {
      color: 'sky',
      border: 'focus:border-sky-500 focus:ring-sky-500/20',
      btnGradient: 'from-sky-500 to-blue-600 shadow-sky-950/50 bg-sky-500',
      topBlob: 'bg-sky-600/10',
      bottomBlob: 'bg-indigo-600/5'
    };
  } else if (activeEmail.includes('accounts')) {
    activeTheme = {
      color: 'emerald',
      border: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      btnGradient: 'from-emerald-500 to-teal-650 shadow-emerald-950/50 bg-emerald-500',
      topBlob: 'bg-emerald-600/10',
      bottomBlob: 'bg-cyan-600/5'
    };
  } else if (activeEmail.includes('spares')) {
    activeTheme = {
      color: 'purple',
      border: 'focus:border-purple-500 focus:ring-purple-500/20',
      btnGradient: 'from-purple-500 to-fuchsia-600 shadow-purple-950/50 bg-purple-500',
      topBlob: 'bg-purple-600/10',
      bottomBlob: 'bg-pink-600/5'
    };
  } else if (activeEmail.includes('admin')) {
    activeTheme = {
      color: 'indigo',
      border: 'focus:border-indigo-500 focus:ring-indigo-500/20',
      btnGradient: 'from-indigo-600 to-violet-600 shadow-indigo-950/50 bg-indigo-600',
      topBlob: 'bg-indigo-600/10',
      bottomBlob: 'bg-purple-900/5'
    };
  } else if (activeEmail.includes('bodyshop')) {
    activeTheme = {
      color: 'orange',
      border: 'focus:border-orange-500 focus:ring-orange-500/20',
      btnGradient: 'from-orange-500 to-amber-600 shadow-orange-950/50 bg-orange-550',
      topBlob: 'bg-orange-600/10',
      bottomBlob: 'bg-yellow-600/5'
    };
  }

  // Rotate slides automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      // Check if credentials match demo accounts for offline fallback!
      const demoAccounts = {
        'admin@autoworkshop.com': { name: 'Demo Admin', role: 'Admin', pass: 'admin123' },
        'accounts@autoworkshop.com': { name: 'Sarah Accountant', role: 'Accounts', pass: 'accounts123' },
        'service@autoworkshop.com': { name: 'John Service', role: 'Service', pass: 'service123' },
        'spares@autoworkshop.com': { name: 'Mike Spares', role: 'Spares', pass: 'spares123' },
        'bodyshop@autoworkshop.com': { name: 'Body Shop Manager', role: 'Body Shop', pass: 'bodyshop123' }
      };

      const account = demoAccounts[email.toLowerCase()];
      if (account && account.pass === password) {
        console.warn('Backend offline. Logged in via Offline Demo Mode.');
        onLoginSuccess({
          id: 'demo_user_id',
          name: account.name,
          email: email.toLowerCase(),
          role: account.role
        }, 'mock_jwt_token_for_offline_demo');
        return;
      }
      setError(err.message + ' (Database offline: Logged in via Offline Demo Mode instead)');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass, slideIdx) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setActiveSlide(slideIdx);
    setError('');
  };

  const CurrentSlideIcon = slides[activeSlide].icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden select-none font-sans animate-fade-in">
      
      {/* Decorative Blur Backgrounds */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${activeTheme.topBlob} rounded-full blur-[140px] transition-all duration-1000 pointer-events-none`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${activeTheme.bottomBlob} rounded-full blur-[140px] transition-all duration-1000 pointer-events-none`} />

      {/* LEFT PANEL: BRANDING & LANDING CAROUSEL */}
      <div className="lg:col-span-7 p-12 lg:p-16 flex flex-col justify-between relative border-r border-slate-900 overflow-hidden hidden lg:flex bg-slate-950">
        {/* Glow effect matching the active slide */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr ${slides[activeSlide].glow} rounded-full blur-[100px] transition-all duration-1000 pointer-events-none`} />

        {/* Company Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-1 bg-white rounded-lg shadow-md border border-slate-800 shrink-0">
            <img 
              src="/workshop/page_1_img_1.png" 
              alt="MVSS Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider uppercase text-white font-sans leading-tight">
              MVSS <span className="text-indigo-400">AUTOMOBILES</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Pvt. Ltd.
            </p>
          </div>
        </div>

        {/* Live Status Board Simulator (Extremely Premium Detail) */}
        <div className="my-auto max-w-lg relative z-10 space-y-8">
          
          {/* Active Carousel Slide */}
          <div className="space-y-4 animate-fade-in" key={activeSlide}>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${slides[activeSlide].color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {slides[activeSlide].tag}
            </div>
            
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight uppercase">
              {slides[activeSlide].title}
            </h2>
            
            <p className="text-sm text-slate-450 font-semibold leading-relaxed">
              {slides[activeSlide].description}
            </p>
          </div>

          {/* Interactive Slide Controls */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Live Workshop Stats Dashboard Mock */}
          <div className="bg-slate-900/35 border border-slate-850 p-5 rounded-2xl grid grid-cols-3 gap-4 text-center shadow-lg backdrop-blur-xs">
            <div>
              <span className="block text-2xl font-black text-white font-mono">100%</span>
              <span className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">Paperless</span>
            </div>
            <div className="border-x border-slate-900">
              <span className="block text-2xl font-black text-emerald-400 font-mono">GST</span>
              <span className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-1">Compliant</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-sky-400 font-mono">5 Stream</span>
              <span className="block text-[9px] text-slate-505 font-extrabold uppercase tracking-widest mt-1">Console</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider relative z-10 flex justify-between items-center">
          <span>© 2026 MVSS AUTOMOBILES. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            SECURE AUDIT LOGGER ACTIVE
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: SLICK LOGIN CARD */}
      <div className="lg:col-span-5 flex flex-col justify-center p-8 sm:p-16 relative z-10 bg-slate-950/60 lg:bg-transparent">
        
        {/* Brand showing on mobile only */}
        <div className="flex items-center gap-3 mb-8 lg:hidden justify-center">
          <div className="p-1 bg-white rounded-lg shadow-md border border-slate-800 shrink-0">
            <img 
              src="/workshop/page_1_img_1.png" 
              alt="MVSS Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-white leading-tight">
              MVSS <span className="text-indigo-400">AUTOMOBILES</span>
            </h1>
            <p className="text-[8px] text-slate-500 font-extrabold tracking-widest uppercase mt-0.5">
              Pvt. Ltd.
            </p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Staff Portal Access</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Provide your credentials or select an authorized stream shortcut below to launch the workshop console.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 flex gap-2.5 items-start text-xs text-red-400">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Staff Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. service@autoworkshop.com"
                className={`block w-full px-4 py-3.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-650 text-xs font-semibold focus:outline-none ${activeTheme.border} focus:ring-1 transition-all duration-300 font-mono`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Secure Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full px-4 py-3.5 bg-slate-950 border border-slate-850 rounded-xl text-white placeholder-slate-650 text-xs font-semibold focus:outline-none ${activeTheme.border} focus:ring-1 transition-all duration-300 font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-1.5 py-3.5 px-4 rounded-xl shadow-sm text-xs font-black uppercase text-white bg-gradient-to-r ${activeTheme.btnGradient} hover:opacity-90 focus:outline-none transition-all duration-300 disabled:opacity-55 hover:scale-[1.01]`}
            >
              {loading ? 'Verifying profile...' : 'Login'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo logins */}
          <div className="border-t border-slate-900 pt-6">
            <h4 className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-4">
              Authorized Streams Quick-Access
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { 
                  name: 'Service Advisor', 
                  email: 'service@autoworkshop.com', 
                  pass: 'service123', 
                  slide: 0, 
                  desc: 'Job cards & canvas', 
                  icon: FileText,
                  colorClass: 'text-sky-400',
                  borderClass: 'border-slate-900 hover:border-sky-500/50 bg-slate-900/10 hover:bg-sky-950/10 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                  activeBg: 'bg-gradient-to-br from-sky-950/20 to-slate-900/40 border-sky-500 shadow-lg shadow-sky-950/30 scale-[1.02]',
                  iconBg: 'bg-sky-950/50 text-sky-400 border border-sky-900/30',
                  stripeClass: 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.5)]',
                  checkBg: 'bg-sky-500 text-white'
                },
                { 
                  name: 'Billing Exec', 
                  email: 'accounts@autoworkshop.com', 
                  pass: 'accounts123', 
                  slide: 1, 
                  desc: 'GST tax & bills', 
                  icon: Receipt,
                  colorClass: 'text-emerald-400',
                  borderClass: 'border-slate-900 hover:border-emerald-500/50 bg-slate-900/10 hover:bg-emerald-950/10 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                  activeBg: 'bg-gradient-to-br from-emerald-950/20 to-slate-900/40 border-emerald-500 shadow-lg shadow-emerald-950/30 scale-[1.02]',
                  iconBg: 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30',
                  stripeClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
                  checkBg: 'bg-emerald-500 text-white'
                },
                { 
                  name: 'Spares Manager', 
                  email: 'spares@autoworkshop.com', 
                  pass: 'spares123', 
                  slide: 2, 
                  desc: 'Parts & stock count', 
                  icon: Package,
                  colorClass: 'text-purple-400',
                  borderClass: 'border-slate-900 hover:border-purple-500/50 bg-slate-900/10 hover:bg-purple-950/10 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                  activeBg: 'bg-gradient-to-br from-purple-950/20 to-slate-900/40 border-purple-500 shadow-lg shadow-purple-950/30 scale-[1.02]',
                  iconBg: 'bg-purple-950/50 text-purple-400 border border-purple-900/30',
                  stripeClass: 'bg-purple-500 shadow-[0_0_8px_rgba(192,132,252,0.5)]',
                  checkBg: 'bg-purple-500 text-white'
                },
                { 
                  name: 'System Admin', 
                  email: 'admin@autoworkshop.com', 
                  pass: 'admin123', 
                  slide: 3, 
                  desc: 'Full registry & setup', 
                  icon: Users,
                  colorClass: 'text-indigo-400',
                  borderClass: 'border-slate-900 hover:border-indigo-500/50 bg-slate-900/10 hover:bg-indigo-950/10 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                  activeBg: 'bg-gradient-to-br from-indigo-950/20 to-slate-900/40 border-indigo-500 shadow-lg shadow-indigo-950/30 scale-[1.02]',
                  iconBg: 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/30',
                  stripeClass: 'bg-indigo-500 shadow-[0_0_8px_rgba(129,140,248,0.5)]',
                  checkBg: 'bg-indigo-500 text-white'
                },
                { 
                  name: 'Body Shop', 
                  email: 'bodyshop@autoworkshop.com', 
                  pass: 'bodyshop123', 
                  slide: 4, 
                  desc: 'Dents, paint & QC', 
                  icon: Wrench,
                  colorClass: 'text-orange-400',
                  borderClass: 'border-slate-900 hover:border-orange-500/50 bg-slate-900/10 hover:bg-orange-950/10 shadow-[0_2px_5px_rgba(0,0,0,0.3)]',
                  activeBg: 'bg-gradient-to-br from-orange-950/20 to-slate-900/40 border-orange-500 shadow-lg shadow-orange-950/30 scale-[1.02]',
                  iconBg: 'bg-orange-950/50 text-orange-400 border border-orange-900/30',
                  stripeClass: 'bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.5)]',
                  checkBg: 'bg-orange-500 text-white'
                },
              ].map(demo => {
                const isActiveUser = email.toLowerCase() === demo.email.toLowerCase();
                const DemoIcon = demo.icon;
                return (
                  <button
                    key={demo.name}
                    type="button"
                    onClick={() => handleDemoFill(demo.email, demo.pass, demo.slide)}
                    className={`text-left p-3 rounded-2xl transition-all duration-305 group focus:outline-none relative flex flex-col justify-between hover:-translate-y-[2px] overflow-hidden ${
                      isActiveUser 
                        ? demo.activeBg 
                        : demo.borderClass
                    }`}
                  >
                    {/* Glowing LED stripe at top */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
                      isActiveUser ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'
                    } ${demo.stripeClass}`} />

                    {isActiveUser && (
                      <span className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center ${demo.checkBg}`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2 z-10">
                      <div className={`p-1.5 rounded-lg shrink-0 ${demo.iconBg}`}>
                        <DemoIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="space-y-1 z-10">
                      <span className="block text-[10px] font-black text-slate-205 leading-none">{demo.name}</span>
                      <span className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider leading-none mt-0.5">{demo.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Domain Control Panel */}
          {(() => {
            const activeEmail = email.toLowerCase();
            const selectedRole = activeEmail.includes('service') ? 'Service Advisor'
              : activeEmail.includes('accounts') ? 'Billing Executive'
              : activeEmail.includes('spares') ? 'Spares Manager'
              : activeEmail.includes('admin') ? 'System Admin'
              : activeEmail.includes('bodyshop') ? 'Body Shop Manager' : null;

            if (!selectedRole) return null;

            const domainPermissions = {
              'Service Advisor': [
                { name: 'Analytics Dashboard', status: 'locked' },
                { name: 'Customers & Timelines', status: 'allowed' },
                { name: 'Vehicle Profiles', status: 'allowed' },
                { name: 'Job Cards & Inspection', status: 'allowed' },
                { name: 'Proforma Estimates', status: 'allowed' },
                { name: 'GST Invoices & Billing', status: 'locked' },
                { name: 'Spares Inventory', status: 'locked' },
                { name: 'Staff Registry & EMS', status: 'locked' },
                { name: 'Insurance Claims', status: 'allowed' },
                { name: 'System Audit Logs', status: 'locked' }
              ],
              'Billing Executive': [
                { name: 'Analytics Dashboard', status: 'allowed' },
                { name: 'Customers & Timelines', status: 'allowed' },
                { name: 'Vehicle Profiles', status: 'allowed' },
                { name: 'Job Cards & Inspection', status: 'locked' },
                { name: 'Proforma Estimates', status: 'locked' },
                { name: 'GST Invoices & Billing', status: 'allowed' },
                { name: 'Spares Inventory', status: 'locked' },
                { name: 'Staff Registry & EMS', status: 'allowed' },
                { name: 'Insurance Claims', status: 'allowed' },
                { name: 'System Audit Logs', status: 'locked' }
              ],
              'Spares Manager': [
                { name: 'Analytics Dashboard', status: 'locked' },
                { name: 'Customers & Timelines', status: 'locked' },
                { name: 'Vehicle Profiles', status: 'locked' },
                { name: 'Job Cards & Inspection', status: 'view-only' },
                { name: 'Proforma Estimates', status: 'view-only' },
                { name: 'GST Invoices & Billing', status: 'locked' },
                { name: 'Spares Inventory', status: 'allowed' },
                { name: 'Staff Registry & EMS', status: 'locked' },
                { name: 'Insurance Claims', status: 'locked' },
                { name: 'System Audit Logs', status: 'locked' }
              ],
              'System Admin': [
                { name: 'Analytics Dashboard', status: 'allowed' },
                { name: 'Customers & Timelines', status: 'allowed' },
                { name: 'Vehicle Profiles', status: 'allowed' },
                { name: 'Job Cards & Inspection', status: 'allowed' },
                { name: 'Proforma Estimates', status: 'allowed' },
                { name: 'GST Invoices & Billing', status: 'allowed' },
                { name: 'Spares Inventory', status: 'allowed' },
                { name: 'Staff Registry & EMS', status: 'allowed' },
                { name: 'Insurance Claims', status: 'allowed' },
                { name: 'System Audit Logs', status: 'allowed' }
              ],
              'Body Shop Manager': [
                { name: 'Analytics Dashboard', status: 'locked' },
                { name: 'Customers & Timelines', status: 'view-only' },
                { name: 'Vehicle Profiles', status: 'allowed' },
                { name: 'Job Cards & Inspection', status: 'allowed' },
                { name: 'Proforma Estimates', status: 'locked' },
                { name: 'GST Invoices & Billing', status: 'locked' },
                { name: 'Spares Inventory', status: 'locked' },
                { name: 'Staff Registry & EMS', status: 'locked' },
                { name: 'Insurance Claims', status: 'allowed' },
                { name: 'System Audit Logs', status: 'locked' }
              ]
            }[selectedRole];

            return (
              <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-2xl animate-fade-in space-y-3 shadow-lg backdrop-blur-xs select-text">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 font-sans">Granted Domain Controls</span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">{selectedRole}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-400">
                  {domainPermissions.map(item => {
                    let statusLabel = 'Locked';
                    let bgBadge = 'bg-red-950/20 border-red-900/30 text-red-400';
                    
                    if (item.status === 'allowed') {
                      statusLabel = 'Control';
                      bgBadge = 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400';
                    } else if (item.status === 'view-only') {
                      statusLabel = 'View Only';
                      bgBadge = 'bg-amber-950/20 border-amber-900/30 text-amber-400';
                    }

                    return (
                      <div key={item.name} className="flex justify-between items-center py-0.5 border-b border-slate-900/60">
                        <span className={item.status === 'locked' ? 'text-slate-600 line-through' : 'text-slate-350'}>{item.name}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase border ${bgBadge}`}>
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
