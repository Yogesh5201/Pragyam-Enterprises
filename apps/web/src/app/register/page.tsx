'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wheat, Building, ShoppingCart, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/apiClient';
import { BusinessType } from '@pragyam/types';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [accountType, setAccountType] = useState<'BUYER' | 'SELLER'>('BUYER');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Haryana');
  const [pinCode, setPinCode] = useState('');
  const [gstin, setGstin] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.WHOLESALER);

  // Seller-specific
  const [millName, setMillName] = useState('');
  const [millCapacityMTPerDay, setMillCapacityMTPerDay] = useState('150');
  const [dispatchLocation, setDispatchLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const endpoint = accountType === 'BUYER' ? '/auth/register/buyer' : '/auth/register/seller';
      const payload: any = {
        fullName,
        companyName,
        phone,
        email,
        password,
        address,
        city,
        district: district || city,
        state,
        pinCode,
        gstin,
        businessType: accountType === 'SELLER' ? BusinessType.RICE_MILLER : businessType,
      };

      if (accountType === 'SELLER') {
        payload.millName = millName || `${companyName} Rice Milling Unit`;
        payload.millCapacityMTPerDay = Number(millCapacityMTPerDay);
        payload.dispatchLocations = [dispatchLocation || city];
      }

      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success && res.data?.token) {
        login(res.data.token, res.data.user);
        router.push(accountType === 'BUYER' ? '/buyer/dashboard' : '/seller/dashboard');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#0D3B2E] rounded-2xl flex items-center justify-center mx-auto text-[#C5A059] shadow-md">
            <Wheat className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[#0D3B2E]">Register with Pragyam Enterprises</h2>
          <p className="text-xs text-slate-500">
            Join the verified confidential grain brokerage trading network
          </p>
        </div>

        {/* Account Type Selector Tab */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setAccountType('BUYER')}
            className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
              accountType === 'BUYER'
                ? 'bg-white text-[#0D3B2E] shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-[#C5A059]" />
            <span>Buyer / Purchaser Account</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('SELLER')}
            className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition ${
              accountType === 'SELLER'
                ? 'bg-white text-[#0D3B2E] shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-[#C5A059]" />
            <span>Seller / Rice Miller Account</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company / Business Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Haryana Grain Corp"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>
          </div>

          {/* Location fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Karnal"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={e => setState(e.target.value)}
                placeholder="Haryana"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">PIN Code *</label>
              <input
                type="text"
                required
                value={pinCode}
                onChange={e => setPinCode(e.target.value)}
                placeholder="132001"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={gstin}
                onChange={e => setGstin(e.target.value.toUpperCase())}
                placeholder="06AAACT0000R1Z1"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>

            {accountType === 'SELLER' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rice Mill Name *</label>
                <input
                  type="text"
                  required
                  value={millName}
                  onChange={e => setMillName(e.target.value)}
                  placeholder="e.g. Taraori Modern Mill Facility"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value={BusinessType.WHOLESALER}>Wholesaler</option>
                  <option value={BusinessType.EXPORTER}>Exporter</option>
                  <option value={BusinessType.COMMODITY_TRADER}>Commodity Trader</option>
                  <option value={BusinessType.INSTITUTIONAL_BUYER}>Institutional Buyer</option>
                </select>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#FAF9F6] rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
            <span>
              By registering, you agree to Pragyam Enterprises Intermediary Brokerage Rules. Direct contact with cross-parties is strictly prohibited.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D3B2E] hover:bg-[#166534] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition disabled:opacity-50 shadow-md"
          >
            <span>{loading ? 'Registering...' : `Complete ${accountType === 'BUYER' ? 'Buyer' : 'Seller'} Registration`}</span>
            <ArrowRight className="w-4 h-4 text-[#C5A059]" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-[#0D3B2E] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
