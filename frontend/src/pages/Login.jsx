import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loginEmail = email.trim();
    const loginPassword = password;

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
      console.error('Authentication error:', err);
      setError(err.message || 'Network error: Unable to connect to authorization servers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center py-10 px-4 select-none font-sans relative">
      
      {/* Red accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C1121F]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 animate-scale-up">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="p-2 bg-[#030712] rounded-full border-2 border-[#C1121F]/30 shadow-lg overflow-hidden shrink-0">
            <img 
              src="/workshop/auto4m_logo_v1.svg" 
              alt="MVSS Logo" 
              className="h-32 w-32 object-cover rounded-full"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-black tracking-wider uppercase text-[#0B1528] leading-tight">
              MVSS <span className="text-[#C1121F]">AUTOMOBILES</span>
            </h1>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mt-0.5">Authorized Portal Access</p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#C1121F]/10 text-[#C1121F] rounded-full text-[8px] font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#C1121F] rounded-full animate-pulse" />
            Secure Connection Active
          </span>
        </div>

        {/* Login Fields & Submit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200/50 rounded-xl p-3 flex gap-2.5 items-start text-[10px] text-[#C1121F] animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold leading-relaxed">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-[8px] font-black uppercase text-slate-450 tracking-wider">Staff Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@auto4m.in"
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#C1121F] transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-[8px] font-black uppercase text-slate-455 tracking-wider">Portal Access Password</label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Password Recovery: Please contact the system administrator or IT helpdesk to reset your auth credentials.'); }} 
                  className="text-[8px] font-black text-[#C1121F] hover:underline uppercase tracking-wider"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-[#C1121F] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 flex items-center text-slate-455 hover:text-slate-655"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Info */}
          <div className="text-[9px] text-slate-400 font-bold leading-relaxed pt-1 text-center">
            Authorized access only. All activities are securely logged in the audit ledger.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black uppercase text-white bg-gradient-to-r from-[#C1121F] to-[#9b0f16] hover:opacity-95 transition-all shadow-md shadow-[#C1121F]/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Validating credentials...' : 'Enter ERP System'}
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>

    </div>
  );
}
