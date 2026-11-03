'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@pragyam/types';
import {
  Wheat,
  ShieldCheck,
  User,
  Globe,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';

export function Header() {
  const { user, role, isAuthenticated, logout, language, setLanguage, t, quickLoginAs } = useAuth();
  const router = useRouter();

  const handleRoleNav = () => {
    if (role === UserRole.SUPER_ADMIN) router.push('/admin');
    else if (role === UserRole.SELLER) router.push('/seller/dashboard');
    else if (role === UserRole.BUYER) router.push('/buyer/dashboard');
    else router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0D3B2E] text-white shadow-md border-b border-[#C5A059]/30">
      {/* Top Banner Notice */}
      <div className="bg-[#062018] px-4 py-1 text-center text-xs text-amber-200/90 flex items-center justify-center space-x-2 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
        <span>{t.confidentialityNotice}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#92400E] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Wheat className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white block">
                PRAGYAM <span className="text-[#C5A059]">ENTERPRISES</span>
              </span>
              <span className="text-[10px] sm:text-xs text-amber-100/80 font-medium tracking-wider uppercase block">
                {language === 'hi' ? 'चावल ब्रोकरेज एवं व्यापार प्रबंधन' : 'Rice Brokerage & Trading Management'}
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="text-white hover:text-[#C5A059] transition-colors flex items-center space-x-1"
            >
              <span>{t.browseStock}</span>
            </Link>

            {role === UserRole.BUYER && (
              <>
                <Link
                  href="/buyer/dashboard?tab=requirements"
                  className="text-white hover:text-[#C5A059] transition-colors"
                >
                  {t.myRequirements}
                </Link>
                <Link
                  href="/buyer/dashboard?tab=orders"
                  className="text-white hover:text-[#C5A059] transition-colors"
                >
                  {t.myOrders}
                </Link>
              </>
            )}

            {role === UserRole.SELLER && (
              <>
                <Link
                  href="/seller/dashboard?tab=stock"
                  className="text-white hover:text-[#C5A059] transition-colors"
                >
                  {t.myStock}
                </Link>
                <Link
                  href="/seller/dashboard?tab=orders"
                  className="text-white hover:text-[#C5A059] transition-colors"
                >
                  {t.myOrders}
                </Link>
              </>
            )}

            {role === UserRole.SUPER_ADMIN && (
              <Link
                href="/admin"
                className="text-amber-300 font-semibold hover:text-white transition-colors flex items-center space-x-1.5 bg-[#166534]/50 px-3 py-1.5 rounded-lg border border-amber-400/30"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
                <span>Super Admin Hub</span>
              </Link>
            )}
          </nav>

          {/* Right Action Tools: Language, Demo Selector, Auth */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Language Toggle (EN / HI) */}
            <div className="flex items-center bg-[#062018] rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  language === 'en'
                    ? 'bg-[#C5A059] text-[#0D3B2E]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  language === 'hi'
                    ? 'bg-[#C5A059] text-[#0D3B2E]'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Role Demo Switcher dropdown for instant reviewer access */}
            <div className="hidden lg:flex items-center space-x-1 bg-white/10 px-2 py-1 rounded-lg border border-white/15 text-xs">
              <span className="text-gray-300 font-mono text-[11px]">Role:</span>
              <button
                onClick={() => quickLoginAs('BUYER')}
                className={`px-2 py-0.5 rounded transition ${
                  role === UserRole.BUYER
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'hover:bg-white/20 text-gray-200'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => quickLoginAs('SELLER')}
                className={`px-2 py-0.5 rounded transition ${
                  role === UserRole.SELLER
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'hover:bg-white/20 text-gray-200'
                }`}
              >
                Seller
              </button>
              <button
                onClick={() => quickLoginAs('ADMIN')}
                className={`px-2 py-0.5 rounded transition ${
                  role === UserRole.SUPER_ADMIN
                    ? 'bg-amber-500 text-black font-bold'
                    : 'hover:bg-white/20 text-amber-300'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRoleNav}
                  className="flex items-center space-x-2 bg-[#C5A059] text-[#0D3B2E] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-400 transition shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">
                    {role === UserRole.SUPER_ADMIN
                      ? 'Admin Portal'
                      : user?.profile?.companyName || user?.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-800 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-white hover:text-[#C5A059] text-xs font-semibold px-3 py-1.5 transition"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="bg-[#C5A059] text-[#0D3B2E] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-400 transition shadow-sm"
                >
                  {t.register}
                </Link>
                <Link
                  href="/admin/login"
                  className="bg-[#166534] text-amber-200 border border-[#C5A059]/40 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#062018] transition flex items-center space-x-1"
                >
                  <ShieldCheck className="w-3 h-3 text-[#C5A059]" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
