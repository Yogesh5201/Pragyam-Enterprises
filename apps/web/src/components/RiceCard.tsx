'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AnonymousInventoryListingDTO, UserRole } from '@pragyam/types';
import {
  Wheat,
  MapPin,
  Sparkles,
  Package,
  ArrowRight,
  Lock,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RiceCardProps {
  listing: AnonymousInventoryListingDTO;
  onEnquire: (listing: AnonymousInventoryListingDTO) => void;
}

export function RiceCard({ listing, onEnquire }: RiceCardProps) {
  const { t, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const q = listing.qualitySpecs;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 overflow-hidden flex flex-col group hover:-translate-y-1">
      {/* Top Banner with Anonymous ID & Category */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {listing.stockImages && listing.stockImages.length > 0 ? (
          <img
            src={listing.stockImages[0]}
            alt={listing.variety}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0D3B2E]/10 to-[#C5A059]/20 flex items-center justify-center">
            <Wheat className="w-16 h-16 text-[#0D3B2E]/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Anonymous ID badge */}
        <div className="absolute top-3 left-3 bg-[#0D3B2E]/90 backdrop-blur-md text-[#C5A059] px-3 py-1 rounded-full text-xs font-black tracking-widest border border-[#C5A059]/40 shadow-md">
          {listing.anonymousCode}
        </div>

        {/* Sortex badge */}
        {q?.sortex && (
          <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>100% Sortex</span>
          </div>
        )}

        {/* Bottom image overlay titles */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
            {listing.category?.replace('_', ' ')} • {listing.classification}
          </span>
          <h3 className="text-lg font-extrabold leading-tight truncate">
            {listing.variety}
          </h3>
        </div>
      </div>

      {/* Pricing & Volume Strip */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-[#FAF9F6] to-[#F4F2EC] border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 font-semibold block uppercase">
            Asking Rate
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-extrabold text-[#0D3B2E]">
              ₹{listing.askingPricePerQuintal?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-600 font-medium">/ Quintal</span>
          </div>
          <span className="text-[11px] text-gray-500">
            (₹{(listing.askingPricePerQuintal * 10).toLocaleString('en-IN')} / MT)
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-500 font-semibold block uppercase">
            Available Volume
          </span>
          <span className="text-lg font-black text-slate-800">
            {listing.availableQuantityMT} MT
          </span>
          <span className="text-[11px] text-gray-500 block">
            ({listing.availableQuantityQuintals || listing.availableQuantityMT * 10} Qtl)
          </span>
        </div>
      </div>

      {/* Quality Specifications Grid */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Grain Length:</span>
            <span className="font-bold text-slate-800">{q?.grainLengthMm} mm</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Whiteness:</span>
            <span className="font-bold text-slate-800">{q?.whiteness} Kett</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Moisture:</span>
            <span className="font-bold text-slate-800">{q?.moisturePercent}% Max</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Broken Grain:</span>
            <span className="font-bold text-slate-800">{q?.brokenPercent}% Max</span>
          </div>
        </div>

        {/* Origin Hub & Packaging */}
        <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="font-medium">
                {listing.generalizedLocation?.district}, {listing.generalizedLocation?.state}
              </span>
            </div>
            <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
              Crop {listing.cropYear}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-gray-600">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">Packaging: {listing.packaging?.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Action Button: Role-sensitive action */}
        {!isAuthenticated ? (
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-[#0D3B2E] hover:bg-[#166534] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm group-hover:shadow-md"
          >
            <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Login as Buyer to Enquire</span>
          </button>
        ) : role === UserRole.BUYER ? (
          <button
            onClick={() => onEnquire(listing)}
            className="w-full bg-[#0D3B2E] hover:bg-[#166534] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm group-hover:shadow-md"
          >
            <span>{t.submitEnquiry}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
          </button>
        ) : role === UserRole.SELLER ? (
          <button
            onClick={() => router.push('/seller/dashboard')}
            className="w-full bg-slate-700 hover:bg-slate-800 text-amber-200 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Miller Portal (Manage My Stock)</span>
          </button>
        ) : (
          <button
            onClick={() => router.push('/admin')}
            className="w-full bg-[#166534] hover:bg-[#0D3B2E] text-amber-300 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors border border-amber-400/30"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Open in Super Admin Hub</span>
          </button>
        )}
      </div>
    </div>
  );
}
