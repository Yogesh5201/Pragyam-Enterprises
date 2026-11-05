'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnonymousInventoryListingDTO, RiceCategory, RiceClassification, UserRole } from '@pragyam/types';
import {
  Wheat,
  ShieldCheck,
  Search,
  Filter,
  SlidersHorizontal,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Award,
  Truck,
  FileCheck2,
  RefreshCw,
  LogIn,
  UserPlus,
  Building2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/apiClient';
import { RiceCard } from '../components/RiceCard';
import { EnquiryModal } from '../components/EnquiryModal';
import { RequirementModal } from '../components/RequirementModal';
import { AddStockModal } from '../components/AddStockModal';

export default function HomePage() {
  const router = useRouter();
  const { role, isAuthenticated, t, language } = useAuth();
  const [listings, setListings] = useState<AnonymousInventoryListingDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchVariety, setSearchVariety] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minGrainLength, setMinGrainLength] = useState<string>('');
  const [maxMoisture, setMaxMoisture] = useState<string>('');

  // Modals
  const [selectedListingForEnquiry, setSelectedListingForEnquiry] = useState<AnonymousInventoryListingDTO | null>(null);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState<boolean>(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState<boolean>(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchVariety) params.append('variety', searchVariety);
      if (selectedCategory) params.append('category', selectedCategory);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minGrainLength) params.append('minGrainLength', minGrainLength);
      if (maxMoisture) params.append('maxMoisture', maxMoisture);

      const res = await apiRequest(`/inventory?${params.toString()}`);
      if (res.success && res.data?.listings) {
        setListings(res.data.listings);
      }
    } catch (e) {
      console.error('Failed to load listings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const handleResetFilters = () => {
    setSearchVariety('');
    setSelectedCategory('');
    setMaxPrice('');
    setMinGrainLength('');
    setMaxMoisture('');
    setTimeout(fetchListings, 50);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0D3B2E] via-[#062018] to-[#0D3B2E] text-white py-16 sm:py-24 overflow-hidden border-b border-[#C5A059]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-[#C5A059]/20 border border-[#C5A059]/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Pragyam Central Intermediary Brokerage Desk</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Confidential, Admin-Controlled <span className="text-[#C5A059]">Rice Brokerage</span> Platform.
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {language === 'hi'
                ? 'भारत का प्रमुख गोपनीय चावल व्यापार मंच। खरीदार और मिलर पहचान की पूर्ण सुरक्षा, आधिकारिक खरीद आदेश, गुणवत्ता मिलान और पारदर्शी ब्रोकरेज प्रबंधन।'
                : 'India’s premier grain trading intermediary. Enforcing strict commercial confidentiality: direct buyer-seller interaction is prohibited, guaranteeing secure brokerage, verified mill stock, and dispute-free settlements.'}
            </p>

            {/* Role-Specific Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {!isAuthenticated ? (
                <>
                  <a
                    href="#catalog"
                    className="bg-[#C5A059] hover:bg-amber-400 text-[#0D3B2E] px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg hover:shadow-xl"
                  >
                    <Wheat className="w-4 h-4" />
                    <span>Browse Rice Inventory</span>
                  </a>

                  <Link
                    href="/register"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/25 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition backdrop-blur-sm"
                  >
                    <UserPlus className="w-4 h-4 text-[#C5A059]" />
                    <span>Register to Trade</span>
                  </Link>

                  <Link
                    href="/login"
                    className="bg-emerald-950/60 hover:bg-emerald-900 text-amber-200 border border-emerald-500/30 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition"
                  >
                    <LogIn className="w-4 h-4 text-[#C5A059]" />
                    <span>Client Sign In</span>
                  </Link>
                </>
              ) : role === UserRole.BUYER ? (
                <>
                  <button
                    onClick={() => setIsRequirementModalOpen(true)}
                    className="bg-[#C5A059] hover:bg-amber-400 text-[#0D3B2E] px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg hover:shadow-xl"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{t.postRequirement}</span>
                  </button>

                  <Link
                    href="/buyer/dashboard"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition"
                  >
                    <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                    <span>Buyer Procurement Desk</span>
                  </Link>
                </>
              ) : role === UserRole.SELLER ? (
                <>
                  <button
                    onClick={() => setIsAddStockModalOpen(true)}
                    className="bg-[#C5A059] hover:bg-amber-400 text-[#0D3B2E] px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg hover:shadow-xl"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t.addStock}</span>
                  </button>

                  <Link
                    href="/seller/dashboard"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition"
                  >
                    <Building2 className="w-4 h-4 text-[#C5A059]" />
                    <span>Miller Inventory Desk</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/admin"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#0D3B2E]" />
                  <span>Enter Super Admin Command Center</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-xs text-amber-200/80 block">Active Stock Available</span>
              <span className="text-2xl font-black text-white">2,100+ MT</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-xs text-amber-200/80 block">Verified Rice Mills</span>
              <span className="text-2xl font-black text-white">40+ Mills</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-xs text-amber-200/80 block">Completed Transactions</span>
              <span className="text-2xl font-black text-white">₹3.56+ Cr</span>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <span className="text-xs text-amber-200/80 block">Intermediary Integrity</span>
              <span className="text-2xl font-black text-[#C5A059]">100% Private</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog & Search Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0D3B2E] flex items-center space-x-2">
                <Wheat className="w-5 h-5 text-[#C5A059]" />
                <span>{t.browseStock}</span>
              </h2>
              <p className="text-xs text-slate-500">
                All inventory listings are strictly anonymous to protect supplier and purchaser confidentiality.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedCategory === ''
                    ? 'bg-[#0D3B2E] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {Object.values(RiceCategory).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-[#0D3B2E] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Search Inputs Grid */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Search Variety</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. 1121, Sella, Sona..."
                  value={searchVariety}
                  onChange={e => setSearchVariety(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Max Price (₹/Qtl)</label>
              <input
                type="number"
                placeholder="e.g. 8500"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Min Length (mm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 8.2"
                value={minGrainLength}
                onChange={e => setMinGrainLength(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Max Moisture (%)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 12.5"
                value={maxMoisture}
                onChange={e => setMaxMoisture(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="flex-1 bg-[#0D3B2E] text-white py-2 rounded-xl text-xs font-bold hover:bg-[#166534] transition flex items-center justify-center space-x-1"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 border border-slate-300 rounded-xl text-gray-600 hover:bg-slate-100 transition"
                title="Reset Filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <Wheat className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No matching rice stock found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search parameters or submit a Purchase Requirement so our broker can source it directly.
            </p>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                } else if (role === UserRole.BUYER) {
                  setIsRequirementModalOpen(true);
                } else {
                  router.push('/seller/dashboard');
                }
              }}
              className="bg-[#0D3B2E] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#166534] transition"
            >
              {!isAuthenticated
                ? 'Sign In to Post Requirement'
                : role === UserRole.BUYER
                ? 'Post Purchase Requirement'
                : 'Go to Miller Dashboard'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <RiceCard
                key={listing.id}
                listing={listing}
                onEnquire={l => {
                  if (!isAuthenticated) {
                    router.push('/login');
                  } else {
                    setSelectedListingForEnquiry(l);
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Brokerage Architecture Section */}
      <section id="assurance" className="bg-[#FAF9F6] border-y border-slate-200 py-16 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">
              Institutional Trade Assurance
            </span>
            <h2 className="text-3xl font-black text-[#0D3B2E]">
              Why Leading Mills & Exporters Trade With Pragyam
            </h2>
            <p className="text-xs text-slate-600">
              Designed specifically to resolve grain quality disputes, protect trade commission, and guarantee end-to-end transaction integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#0D3B2E]/10 flex items-center justify-center text-[#0D3B2E]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Enforced Intermediary Privacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All communications and negotiations are routed through the central broker. Buyers and sellers never see identifying contact numbers, protecting all trade relationships.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Strict Quality Tolerances</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every contract specifies precise grain length (mm), moisture percentage, whiteness, broken percentage, and optical Sortex cleaning standards with AGMARK compliance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Live Logistics & Bilty Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time transport tracking from mill loading dock to delivery CFS yard, with verified vehicle numbers, LR/Bilty generation, and E-Way bill reconciliation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <EnquiryModal
        listing={selectedListingForEnquiry}
        isOpen={!!selectedListingForEnquiry}
        onClose={() => setSelectedListingForEnquiry(null)}
      />

      <RequirementModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
      />

      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSuccess={fetchListings}
      />
    </div>
  );
}
