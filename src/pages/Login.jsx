import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({ setAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const isAuth = localStorage.getItem('domaintrack_auth') === 'true';
    if (isAuth) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Get stored credentials or set defaults
    const storedCreds = JSON.parse(localStorage.getItem('domaintrack_creds') || JSON.stringify({
      email: 'admin@gmail.com',
      password: '123456'
    }));

    if (email === storedCreds.email && password === storedCreds.password) {
      localStorage.setItem('domaintrack_auth', 'true');
      setAuth(true);
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#4338ca] to-[#7c3aed]">
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-3xl animate-pulse"></div>

      <div className="w-full max-w-[480px] p-6 sm:p-12 relative z-10">
        <div className="bg-white rounded-[32px] shadow-2xl p-8 sm:p-12 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#1e293b] mb-2 tracking-tight">Welcome Back !</h1>
            <p className="text-slate-500 font-medium">Sign in to continue to Your Company</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4f46e5] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:border-[#4f46e5] focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4f46e5] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-11 pr-12 text-sm focus:border-[#4f46e5] focus:bg-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 px-1 animate-shake">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-white font-black py-4 rounded-xl shadow-lg shadow-teal-100 hover:shadow-teal-200 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest text-xs mt-4"
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center mt-12 text-[10px] font-bold text-white/60 uppercase tracking-widest">
          © 2026 Your Company. All rights reserved.
        </p>
      </div>
    </div>
  );
}
