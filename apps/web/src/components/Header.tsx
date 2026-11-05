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
  LogOut,
  SlidersHorizontal,
  FileSpreadsheet,
  PackageCheck,
  Building2,
  LogIn
} from 'lucide-react';

export function Header() {
  const { user, role, isAuthenticated, logout, language, setLanguage, t } = useAuth();
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

          {/* Center Navigation Links - Adaptive to Logged-in Role */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="text-white hover:text-[#C5A059] transition-colors flex items-center space-x-1"
            >
              <span>{t.browseStock}</span>
            </Link>

            {/* Public Links when NOT authenticated */}
            {!isAuthenticated && (
              <>
                <a
                  href="#assurance"
                  className="text-gray-300 hover:text-[#C5A059] transition-colors"
                >
                  {language === 'hi' ? 'गोपनीयता आश्वासन' : 'Confidentiality Assurance'}
                </a>
                <a
                  href="#specifications"
                  className="text-gray-300 hover:text-[#C5A059] transition-colors"
                >
                  {language === 'hi' ? 'गुणवत्ता मानक' : 'Quality Standards'}
                </a>
              </>
            )}

            {/* Buyer Specific Links (Only visible when logged in as Buyer) */}
            {isAuthenticated && role === UserRole.BUYER && (
              <>
                <Link
                  href="/buyer/dashboard?tab=requirements"
                  className="text-amber-200 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{t.myRequirements}</span>
                </Link>
                <Link
                  href="/buyer/dashboard?tab=orders"
                  className="text-gray-300 hover:text-[#C5A059] transition-colors"
                >
                  {t.myOrders}
                </Link>
                <Link
                  href="/buyer/dashboard?tab=enquiries"
                  className="text-gray-300 hover:text-[#C5A059] transition-colors"
                >
                  My Enquiries
                </Link>
              </>
            )}

            {/* Seller Specific Links (Only visible when logged in as Seller) */}
            {isAuthenticated && role === UserRole.SELLER && (
              <>
                <Link
                  href="/seller/dashboard?tab=stock"
                  className="text-amber-200 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t.myStock}</span>
                </Link>
                <Link
                  href="/seller/dashboard?tab=orders"
                  className="text-gray-300 hover:text-[#C5A059] transition-colors flex items-center space-x-1"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>{t.myOrders}</span>
                </Link>
              </>
            )}

            {/* Admin Specific Links (Only visible when logged in as Super Admin) */}
            {isAuthenticated && role === UserRole.SUPER_ADMIN && (
              <Link
                href="/admin"
                className="text-amber-300 font-bold hover:text-white transition-colors flex items-center space-x-1.5 bg-[#166534]/60 px-3.5 py-1.5 rounded-lg border border-amber-400/40 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
                <span>Super Admin Desk</span>
              </Link>
            )}
          </nav>

          {/* Right Action Tools: Language, Auth */}
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

            {/* Auth Actions - Clean and Role-Driven */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRoleNav}
                  className="flex items-center space-x-2 bg-[#C5A059] text-[#0D3B2E] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-400 transition shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[130px]">
                    {role === UserRole.SUPER_ADMIN
                      ? 'Admin Command Center'
                      : role === UserRole.BUYER
                      ? `${user?.profile?.companyName || user?.email?.split('@')[0]} (Buyer)`
                      : `${user?.profile?.millName || user?.profile?.companyName || user?.email?.split('@')[0]} (Miller)`}
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
                  className="text-white hover:text-[#C5A059] text-xs font-semibold px-3 py-1.5 transition flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{t.login}</span>
                </Link>
                <Link
                  href="/register"
                  className="bg-[#C5A059] text-[#0D3B2E] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-400 transition shadow-sm"
                >
                  {t.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
