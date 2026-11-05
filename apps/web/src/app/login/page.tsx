'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wheat, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/apiClient';
import { UserRole } from '@pragyam/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, t, language, setLanguage, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const token = res.data?.token || res.data?.data?.token;
      const user = res.data?.user || res.data?.data?.user;

      if (token && user) {
        login(token, user);
        if (user.role === UserRole.BUYER) {
          router.push('/buyer/dashboard');
        } else if (user.role === UserRole.SELLER) {
          router.push('/seller/dashboard');
        } else {
          router.push('/admin');
        }
      } else {
        setError(res.data?.error || res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#0D3B2E] rounded-2xl flex items-center justify-center mx-auto text-[#C5A059] shadow-md">
            <Wheat className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#0D3B2E]">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500">
            Authorized Rice Millers and Commercial Grain Buyers Portal
          </p>
        </div>

        {/* Demo Fast Logins for reviewers */}
        <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl text-xs space-y-2">
          <span className="font-bold text-[#0D3B2E] block">Instant Demo Access:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await quickLoginAs('BUYER');
                router.push('/buyer/dashboard');
              }}
              className="bg-emerald-700 text-white py-1.5 px-2 rounded-lg font-semibold hover:bg-emerald-800 transition text-[11px]"
            >
              Buyer Demo Login
            </button>
            <button
              type="button"
              onClick={async () => {
                await quickLoginAs('SELLER');
                router.push('/seller/dashboard');
              }}
              className="bg-amber-700 text-white py-1.5 px-2 rounded-lg font-semibold hover:bg-amber-800 transition text-[11px]"
            >
              Seller Mill Demo Login
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D3B2E] hover:bg-[#166534] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition disabled:opacity-50 shadow-md"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#C5A059]" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>New to Pragyam?</span>
          <Link href="/register" className="font-bold text-[#0D3B2E] hover:underline">
            Register Account
          </Link>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/admin/login"
            className="text-[11px] text-[#C5A059] font-bold hover:underline flex items-center justify-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Administrator Login with MFA</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
