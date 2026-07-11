import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { 
  Users, 
  Receipt, 
  Package, 
  Wrench, 
  Settings, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  ShieldCheck,
  CheckCircle,
  Copy,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  // Demoweb credentials mapped to backend seed accounts
  const emailMapping = {
    'advisor@mvssautomobiles.com': { target: 'service@autoworkshop.com', pass: 'service123' },
    'billing@mvssautomobiles.com': { target: 'accounts@autoworkshop.com', pass: 'accounts123' },
    'spares@mvssautomobiles.com': { target: 'spares@autoworkshop.com', pass: 'spares123' },
    'bodyshop@mvssautomobiles.com': { target: 'bodyshop@autoworkshop.com', pass: 'bodyshop123' },
    'admin@mvssautomobiles.com': { target: 'admin@autoworkshop.com', pass: 'admin123' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let loginEmail = email.trim();
    let loginPassword = password;

    const mapped = emailMapping[loginEmail.toLowerCase()];
    if (mapped) {
      const expectedPass = 
        loginEmail.toLowerCase().includes('advisor') ? 'Advisor@123' :
        loginEmail.toLowerCase().includes('billing') ? 'Billing@123' :
        loginEmail.toLowerCase().includes('spares') ? 'Spares@123' :
        loginEmail.toLowerCase().includes('bodyshop') ? 'Bodyshop@123' : 'Admin@123';
      
      if (loginPassword === expectedPass) {
        loginEmail = mapped.target;
        loginPassword = mapped.pass;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err) {
      // Offline fallback check
      const demoAccounts = {
        'admin@autoworkshop.com': { name: 'Demo Admin', role: 'Admin', pass: 'admin123' },
        'accounts@autoworkshop.com': { name: 'Sarah Accountant', role: 'Accounts', pass: 'accounts123' },
        'service@autoworkshop.com': { name: 'John Service', role: 'Service', pass: 'service123' },
        'spares@autoworkshop.com': { name: 'Mike Spares', role: 'Spares', pass: 'spares123' },
        'bodyshop@autoworkshop.com': { name: 'Body Shop Manager', role: 'Body Shop', pass: 'bodyshop123' }
      };

      const account = demoAccounts[loginEmail.toLowerCase()];
      if (account && account.pass === loginPassword) {
        console.warn('Backend offline. Logged in via Offline Demo Mode.');
        onLoginSuccess({
          id: 'demo_user_id',
          name: account.name,
          email: loginEmail.toLowerCase(),
          role: account.role
        }, 'mock_jwt_token_for_offline_demo');
        return;
      }
      setError(err.message + ' (Database offline: Logged in via Offline Demo Mode instead)');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const roles = [
    { name: 'Service Advisor', desc: 'Job Cards & Inspection', email: 'advisor@mvssautomobiles.com', pass: 'Advisor@123', icon: Users, color: 'text-blue-500' },
    { name: 'Billing Executive', desc: 'GST Billing & Invoices', email: 'billing@mvssautomobiles.com', pass: 'Billing@123', icon: Receipt, color: 'text-emerald-500' },
    { name: 'Spares Manager', desc: 'Inventory & Stock Control', email: 'spares@mvssautomobiles.com', pass: 'Spares@123', icon: Package, color: 'text-amber-500' },
    { name: 'Body Shop', desc: 'Denting, Paint & Claims', email: 'bodyshop@mvssautomobiles.com', pass: 'Bodyshop@123', icon: Wrench, color: 'text-indigo-500' },
    { name: 'System Admin', desc: 'Control Panel & Audits', email: 'admin@mvssautomobiles.com', pass: 'Admin@123', icon: Settings, color: 'text-[#C1121F]' }
  ];

  return (
    <div className="min-h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center py-10 px-4 md:px-8 select-none font-sans">
      
      {/* Red accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C1121F]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-10 shadow-2xl relative z-10 space-y-8 animate-scale-up">
        
        {/* Branding header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-2xl border border-slate-200/50 shadow-sm shrink-0">
              <img 
                src="/workshop/page_1_img_1.png" 
                alt="MVSS Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black tracking-wider uppercase text-slate-850 dark:text-white leading-tight">
                MVSS <span className="text-[#C1121F]">AUTOMOBILES</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mt-0.5">Enterprise Portal Access</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Secure ERP Network Active
            </span>
          </div>
        </div>

        {/* Outer Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Role Selection Grid (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-[#C1121F]">Step 1: Choose Staff Role Card</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Select a role below to view credentials and auto-fill login details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map(r => {
                const Icon = r.icon;
                const isActive = email.toLowerCase() === r.email.toLowerCase();

                return (
                  <div
                    key={r.name}
                    onClick={() => handleDemoFill(r.email, r.pass)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-[105px] group ${
                      isActive 
                        ? 'border-[#C1121F] bg-[#C1121F]/5 shadow-md shadow-[#C1121F]/5 scale-[1.01]' 
                        : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 hover:border-[#C1121F]/40 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl ${r.color}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(r.email, `${r.name}-copy`);
                        }}
                        className="text-[8px] font-black uppercase text-slate-400 hover:text-[#C1121F] bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800 transition-colors"
                      >
                        {copiedKey === `${r.name}-copy` ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase leading-none">{r.name}</h4>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5 leading-tight">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Display Credentials Panel */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800 p-3.5 rounded-2xl space-y-2">
              <span className="text-[9px] font-extrabold uppercase text-slate-400 block tracking-wider">Demo Access Credentials</span>
              <div className="grid grid-cols-2 gap-3 text-[9px] font-bold text-slate-500">
                <div>
                  <span className="block text-[8px] text-slate-400 uppercase">Selected Email</span>
                  <span className="block font-mono text-slate-700 dark:text-slate-350 truncate mt-0.5">{email || '(Select role above)'}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-slate-400 uppercase">Selected Password</span>
                  <span className="block font-mono text-slate-700 dark:text-slate-350 truncate mt-0.5">{password || '(Select role above)'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Login Fields & Submit Form (5 Columns) */}
          <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4">
            
            <div>
              <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-[#C1121F]">Step 2: Authenticate</h2>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Please check credentials and click Login.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200/50 rounded-xl p-3 flex gap-2.5 items-start text-[10px] text-[#C1121F] animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-bold leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-3.5">
              
              {/* Email Input */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-[9px] font-extrabold uppercase text-slate-450 tracking-wider">Staff Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advisor@mvssautomobiles.com"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#C1121F] font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-[9px] font-extrabold uppercase text-slate-450 tracking-wider">Portal Access Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#C1121F] font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 flex items-center text-slate-450 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Terms / Info */}
            <div className="text-[9px] text-slate-400 font-bold leading-relaxed pt-1">
              By logging in, you agree to secure workshop audit logs collection (including user role, action, and IP Address details).
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase text-white bg-gradient-to-r from-[#C1121F] to-[#9b0f16] hover:opacity-95 transition-all shadow-md shadow-[#C1121F]/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Validating credentials...' : 'Enter ERP System'}
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
