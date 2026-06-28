import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Wrench, Eye, EyeOff, ShieldAlert, CheckCircle, FileText, Receipt, Package, Users, ChevronRight, Check } from 'lucide-react';

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
      color: 'text-sky-650 border-sky-200 bg-sky-50/50',
      glow: 'from-sky-500/5 to-transparent'
    },
    {
      title: 'GST Tax Invoicing & Accounts',
      description: 'Generate proforma, tax, or retail invoices with custom CGST/SGST/IGST splits, surveyor approvals, and number-to-words parsing.',
      tag: 'Accounts & Billing',
      icon: Receipt,
      color: 'text-emerald-655 border-emerald-200 bg-emerald-50/50',
      glow: 'from-emerald-500/5 to-transparent'
    },
    {
      title: 'Spares Inventory Manager',
      description: 'Track catalog counts, manage low stock thresholds, and trigger auto-deductions directly upon finalizing customer bills.',
      tag: 'Spares & Store',
      icon: Package,
      color: 'text-purple-655 border-purple-200 bg-purple-50/50',
      glow: 'from-purple-500/5 to-transparent'
    },
    {
      title: 'Staff Registry & Payroll (EMS)',
      description: 'Track daily employee attendance, log joining files, upload resumes, and calculate salary slips with leave deductions.',
      tag: 'Admins & Management',
      icon: Users,
      color: 'text-indigo-655 border-indigo-200 bg-indigo-50/50',
      glow: 'from-indigo-500/5 to-transparent'
    },
    {
      title: 'Body Shop & Repair Hub',
      description: 'Manage dent repairs, bumper repairs, glass replacements, painting stages, and chassis alignment with high-res images.',
      tag: 'Body Shop (BShop)',
      icon: Wrench,
      color: 'text-orange-655 border-orange-200 bg-orange-50/50',
      glow: 'from-orange-500/5 to-transparent'
    }
  ];

  // Dynamic theme based on selected/typed email
  const activeEmail = email.toLowerCase();
  let activeTheme = {
    color: 'indigo',
    border: 'focus:border-indigo-650 focus:ring-indigo-650',
    btnGradient: 'from-indigo-600 to-blue-600 shadow-indigo-600/10',
    topBlob: 'bg-indigo-600/5',
    bottomBlob: 'bg-sky-600/5'
  };

  if (activeEmail.includes('service')) {
    activeTheme = {
      color: 'sky',
      border: 'focus:border-sky-500 focus:ring-sky-500',
      btnGradient: 'from-sky-500 to-blue-600 shadow-sky-500/10',
      topBlob: 'bg-sky-600/8',
      bottomBlob: 'bg-indigo-600/5'
    };
  } else if (activeEmail.includes('accounts')) {
    activeTheme = {
      color: 'emerald',
      border: 'focus:border-emerald-500 focus:ring-emerald-500',
      btnGradient: 'from-emerald-500 to-teal-600 shadow-emerald-500/10',
      topBlob: 'bg-emerald-600/8',
      bottomBlob: 'bg-cyan-600/5'
    };
  } else if (activeEmail.includes('spares')) {
    activeTheme = {
      color: 'purple',
      border: 'focus:border-purple-500 focus:ring-purple-500',
      btnGradient: 'from-purple-500 to-fuchsia-600 shadow-purple-500/10',
      topBlob: 'bg-purple-600/8',
      bottomBlob: 'bg-pink-600/5'
    };
  } else if (activeEmail.includes('admin')) {
    activeTheme = {
      color: 'indigo',
      border: 'focus:border-indigo-500 focus:ring-indigo-500',
      btnGradient: 'from-indigo-500 to-violet-600 shadow-indigo-500/10',
      topBlob: 'bg-indigo-600/8',
      bottomBlob: 'bg-purple-600/5'
    };
  } else if (activeEmail.includes('bodyshop')) {
    activeTheme = {
      color: 'orange',
      border: 'focus:border-orange-500 focus:ring-orange-500',
      btnGradient: 'from-orange-500 to-amber-600 shadow-orange-500/10',
      topBlob: 'bg-orange-600/8',
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden select-none font-sans animate-fade-in">
      
      {/* Decorative Blur Backgrounds */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${activeTheme.topBlob} rounded-full blur-[140px] transition-all duration-1000 pointer-events-none`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${activeTheme.bottomBlob} rounded-full blur-[140px] transition-all duration-1000 pointer-events-none`} />

      {/* LEFT PANEL: BRANDING & LANDING CAROUSEL */}
      <div className="lg:col-span-7 p-12 lg:p-16 flex flex-col justify-between relative border-r border-slate-200 overflow-hidden hidden lg:flex">
        {/* Glow effect matching the active slide */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr ${slides[activeSlide].glow} rounded-full blur-[100px] transition-all duration-1000 pointer-events-none`} />

        {/* Company Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-indigo-650 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-slate-900 font-sans">AutoWorkshop <span className="text-indigo-600">PRO</span></h1>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-0.5">MVSS Automobiles Pvt. Ltd.</p>
          </div>
        </div>

        {/* Live Status Board Simulator (Extremely Premium Detail) */}
        <div className="my-auto max-w-lg relative z-10 space-y-8">
          
          {/* Active Carousel Slide */}
          <div className="space-y-4 animate-fade-in" key={activeSlide}>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${slides[activeSlide].color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              {slides[activeSlide].tag}
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {slides[activeSlide].title}
            </h2>
            
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">
              {slides[activeSlide].description}
            </p>
          </div>

          {/* Interactive Slide Controls */}
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-350 ${
                  activeSlide === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Live Workshop Stats Dashboard Mock */}
          <div className="bg-white/80 border border-slate-200/80 p-5 rounded-2xl grid grid-cols-3 gap-4 text-center shadow-sm">
            <div>
              <span className="block text-2xl font-black text-slate-800 font-mono">100%</span>
              <span className="block text-[9px] text-slate-450 font-extrabold uppercase tracking-widest mt-1">Paperless</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="block text-2xl font-black text-emerald-650 font-mono">GST</span>
              <span className="block text-[9px] text-slate-450 font-extrabold uppercase tracking-widest mt-1">Compliant</span>
            </div>
            <div>
              <span className="block text-2xl font-black text-sky-655 font-mono">4 Stream</span>
              <span className="block text-[9px] text-slate-455 font-extrabold uppercase tracking-widest mt-1">Collaboration</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-450 font-bold uppercase tracking-wider relative z-10 flex justify-between items-center">
          <span>© 2026 MVSS AUTOMOBILES. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> SECURE AUDIT LOGGED</span>
        </div>
      </div>

      {/* RIGHT PANEL: SLICK LOGIN CARD */}
      <div className="lg:col-span-5 flex flex-col justify-center p-8 sm:p-16 relative z-10 bg-slate-50/20 lg:bg-transparent">
        
        {/* Brand showing on mobile only */}
        <div className="flex items-center gap-3 mb-8 lg:hidden justify-center">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase text-slate-900">AutoWorkshop <span className="text-indigo-655">PRO</span></h1>
            <p className="text-[8px] text-slate-455 font-extrabold tracking-widest uppercase mt-0.5">MVSS Automobiles</p>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Sign In</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Provide your credentials or select a demo profile below to launch the workshop console.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2.5 items-start text-xs text-red-650">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-550 mb-1.5">
                Staff Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. advisor@autoworkshop.com"
                className={`block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none ${activeTheme.border} focus:ring-1 transition-all duration-300 font-mono`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-550">
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
                  className={`block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-xs font-semibold focus:outline-none ${activeTheme.border} focus:ring-1 transition-all duration-300 font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-gradient-to-r ${activeTheme.btnGradient} hover:opacity-90 focus:outline-none transition-all duration-300 disabled:opacity-55`}
            >
              {loading ? 'Verifying profile...' : 'Launch Workshop Shell'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo logins */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-455 mb-4">
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
                  colorClass: 'text-sky-655',
                  borderClass: 'border-slate-200 hover:border-sky-400/80 bg-white hover:bg-sky-50/15 shadow-[0_2px_5px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(56,189,248,0.15)]',
                  activeBg: 'bg-gradient-to-br from-sky-50/50 to-white border-sky-400 shadow-[0_4px_15px_rgba(56,189,248,0.22)] scale-[1.02]',
                  iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
                  stripeClass: 'bg-sky-455 shadow-[0_0_8px_rgba(56,189,248,0.5)]',
                  checkBg: 'bg-sky-550 text-white shadow-md shadow-sky-500/20'
                },
                { 
                  name: 'Billing Executive', 
                  email: 'accounts@autoworkshop.com', 
                  pass: 'accounts123', 
                  slide: 1, 
                  desc: 'GST tax & salary slip', 
                  icon: Receipt,
                  colorClass: 'text-emerald-655',
                  borderClass: 'border-slate-200 hover:border-emerald-400/80 bg-white hover:bg-emerald-50/15 shadow-[0_2px_5px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(52,211,153,0.15)]',
                  activeBg: 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-400 shadow-[0_4px_15px_rgba(52,211,153,0.22)] scale-[1.02]',
                  iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                  stripeClass: 'bg-emerald-455 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
                  checkBg: 'bg-emerald-550 text-white shadow-md shadow-emerald-500/20'
                },
                { 
                  name: 'Spares Manager', 
                  email: 'spares@autoworkshop.com', 
                  pass: 'spares123', 
                  slide: 2, 
                  desc: 'Parts & stock count', 
                  icon: Package,
                  colorClass: 'text-purple-655',
                  borderClass: 'border-slate-200 hover:border-purple-400/80 bg-white hover:bg-purple-50/15 shadow-[0_2px_5px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(192,132,252,0.15)]',
                  activeBg: 'bg-gradient-to-br from-purple-50/50 to-white border-purple-400 shadow-[0_4px_15px_rgba(192,132,252,0.22)] scale-[1.02]',
                  iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
                  stripeClass: 'bg-purple-455 shadow-[0_0_8px_rgba(192,132,252,0.5)]',
                  checkBg: 'bg-purple-550 text-white shadow-md shadow-purple-500/20'
                },
                { 
                  name: 'System Admin', 
                  email: 'admin@autoworkshop.com', 
                  pass: 'admin123', 
                  slide: 3, 
                  desc: 'Full registry & setup', 
                  icon: Users,
                  colorClass: 'text-indigo-655',
                  borderClass: 'border-slate-200 hover:border-indigo-400/80 bg-white hover:bg-indigo-50/15 shadow-[0_2px_5px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(129,140,248,0.15)]',
                  activeBg: 'bg-gradient-to-br from-indigo-50/50 to-white border-indigo-400 shadow-[0_4px_15px_rgba(129,140,248,0.22)] scale-[1.02]',
                  iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
                  stripeClass: 'bg-indigo-455 shadow-[0_0_8px_rgba(129,140,248,0.5)]',
                  checkBg: 'bg-indigo-550 text-white shadow-md shadow-indigo-500/20'
                },
                { 
                  name: 'Body Shop', 
                  email: 'bodyshop@autoworkshop.com', 
                  pass: 'bodyshop123', 
                  slide: 4, 
                  desc: 'Dents, paint & QC', 
                  icon: Wrench,
                  colorClass: 'text-orange-655',
                  borderClass: 'border-slate-200 hover:border-orange-400/80 bg-white hover:bg-orange-50/15 shadow-[0_2px_5px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(251,146,60,0.15)]',
                  activeBg: 'bg-gradient-to-br from-orange-50/50 to-white border-orange-400 shadow-[0_4px_15px_rgba(251,146,60,0.22)] scale-[1.02]',
                  iconBg: 'bg-orange-50 text-orange-600 border border-orange-100',
                  stripeClass: 'bg-orange-455 shadow-[0_0_8px_rgba(251,146,60,0.5)]',
                  checkBg: 'bg-orange-550 text-white shadow-md shadow-orange-500/20'
                },
              ].map(demo => {
                const isActiveUser = email.toLowerCase() === demo.email.toLowerCase();
                const DemoIcon = demo.icon;
                return (
                  <button
                    key={demo.name}
                    type="button"
                    onClick={() => handleDemoFill(demo.email, demo.pass, demo.slide)}
                    className={`text-left p-3.5 rounded-2xl transition-all duration-300 group focus:outline-none relative flex flex-col justify-between hover:-translate-y-[2px] overflow-hidden ${
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
                      <span className="block text-xs font-black text-slate-800 group-hover:text-indigo-900 leading-none flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${demo.colorClass} shadow-[0_0_4px_currentColor]`} />
                        {demo.name}
                      </span>
                    </div>

                    <div className="space-y-1 z-10">
                      <span className="block text-[8px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">{demo.desc}</span>
                      <span className={`block text-[9px] font-mono font-semibold leading-none break-all ${demo.colorClass}`}>
                        {demo.email}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Connection Helper */}
          <div className="border-t border-slate-200 pt-6">
            <div className="bg-white/80 border border-slate-200/80 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              {window.location.hostname === '127.0.0.1' || window.location.hostname === '127.0.0.1' ? (
                <div className="flex-1 space-y-1.5 text-center lg:text-left">
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-indigo-650">Mobile Connection Tip</span>
                  <p className="text-[10px] text-slate-550 leading-relaxed font-medium">
                    To open this on your phone, run <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">ipconfig</code> in your laptop's command prompt to find your IPv4 IP (e.g. <code className="text-indigo-655 font-semibold">192.168.1.21</code>), and navigate to <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">https://192.168.1.21:5173</code> on your browser. A scan-to-connect QR code will then render here automatically!
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-md border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=https://${window.location.hostname}:5173/`}
                      alt="Scan to open on Mobile"
                      className="w-[72px] h-[72px]"
                    />
                  </div>
                  <div className="space-y-1 select-text">
                    <span className="block text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      Scan to Open on Mobile
                    </span>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      Connect your phone to the same Wi-Fi network and scan the QR code to launch or navigate to:
                    </p>
                    <code className="block text-[10px] text-indigo-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/50 font-mono font-bold select-all">
                      https://{window.location.hostname}:5173/
                    </code>
                  </div>
                </>
              )}
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
              <div className="bg-white/80 border border-slate-200 p-4 rounded-2xl animate-fade-in space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-650">Granted Domain Controls</span>
                  <span className="text-[9px] font-mono text-slate-500">{selectedRole}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-500">
                  {domainPermissions.map(item => {
                    let statusLabel = 'Locked';
                    let bgBadge = 'bg-red-50 border-red-100 text-red-650';
                    
                    if (item.status === 'allowed') {
                      statusLabel = 'Control';
                      bgBadge = 'bg-emerald-50 border-emerald-100 text-emerald-650';
                    } else if (item.status === 'view-only') {
                      statusLabel = 'View Only';
                      bgBadge = 'bg-amber-50 border-amber-100 text-amber-650';
                    }

                    return (
                      <div key={item.name} className="flex justify-between items-center py-0.5 border-b border-slate-100/50">
                        <span className={item.status === 'locked' ? 'text-slate-350 line-through' : 'text-slate-600'}>{item.name}</span>
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
