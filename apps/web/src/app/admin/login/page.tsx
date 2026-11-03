'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../lib/apiClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@pragyam.com');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, mfaCode }),
      });

      if (res.data?.requiresMfa) {
        setRequiresMfa(true);
        setError(null);
      } else if (res.success && res.data?.token) {
        login(res.data.token, res.data.user);
        router.push('/admin');
      } else {
        setError(res.error || 'Administrator authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl border border-amber-500/30 text-white">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#0D3B2E] border-2 border-[#C5A059] rounded-2xl flex items-center justify-center mx-auto text-[#C5A059] shadow-lg">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <span className="text-xs font-black tracking-widest text-[#C5A059] uppercase block">
            CONFIDENTIAL RESTRICTED ACCESS
          </span>
          <h2 className="text-2xl font-black text-white">Super Admin Desk</h2>
          <p className="text-xs text-slate-400">
            Pragyam Enterprises Business Owner & Intermediary Command Center
          </p>
        </div>

        {/* Credentials info helper for testing */}
        <div className="bg-slate-700/60 p-3 rounded-xl border border-slate-600 text-[11px] text-slate-300 space-y-1">
          <span className="font-bold text-amber-300 block">Bootstrap Credentials:</span>
          <div>Email: <span className="font-mono text-white">admin@pragyam.com</span></div>
          <div>Password: <span className="font-mono text-white">Pragyam@Admin2026!</span></div>
          <div>Authenticator 6-Digit MFA: <span className="font-mono text-white">123456</span></div>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-500 text-red-300 p-3.5 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Admin Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          {requiresMfa && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-amber-400 uppercase mb-1 flex items-center justify-between">
                <span>Authenticator MFA Code (6-Digit)</span>
                <span className="text-[10px] text-gray-400 font-normal">Mandatory</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-amber-500/80 rounded-xl text-sm font-mono tracking-widest text-amber-300 outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] hover:bg-amber-400 text-slate-950 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition disabled:opacity-50 shadow-lg"
          >
            <span>{loading ? 'Verifying MFA...' : requiresMfa ? 'Verify MFA & Enter Dashboard' : 'Authenticate Administrator'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </form>
      </div>
    </div>
  );
}
