'use client';

import React, { useState } from 'react';
import { RiceCategory, RiceClassification, PackagingType, BrokerageType } from '@pragyam/types';
import { X, ShieldCheck, Plus, CheckCircle2, AlertCircle, Wheat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/apiClient';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddStockModal({ isOpen, onClose, onSuccess }: AddStockModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [variety, setVariety] = useState<string>('1121 Golden Sella Basmati');
  const [category, setCategory] = useState<RiceCategory>(RiceCategory.GOLDEN_SELLA_RICE);
  const [classification, setClassification] = useState<RiceClassification>(RiceClassification.BASMATI);
  const [availableQuantityMT, setAvailableQuantityMT] = useState<string>('250');
  const [askingPricePerQuintal, setAskingPricePerQuintal] = useState<string>('8200');
  const [brokerageOffered, setBrokerageOffered] = useState<string>('100');
  const [brokerageType, setBrokerageType] = useState<BrokerageType>(BrokerageType.PER_METRIC_TONNE);
  const [grainLengthMm, setGrainLengthMm] = useState<string>('8.35');
  const [whiteness, setWhiteness] = useState<string>('40.0');
  const [moisturePercent, setMoisturePercent] = useState<string>('12.0');
  const [brokenPercent, setBrokenPercent] = useState<string>('1.0');
  const [sortex, setSortex] = useState<boolean>(true);
  const [packaging, setPackaging] = useState<PackagingType>(PackagingType.PP_BAG_50KG);
  const [dispatchLocation, setDispatchLocation] = useState<string>('Karnal Dispatch Depot');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('Please log in as an authorized Seller / Rice Miller to publish stock listings.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          variety,
          category,
          classification,
          availableQuantityMT: Number(availableQuantityMT),
          askingPricePerQuintal: Number(askingPricePerQuintal),
          brokerageOffered: Number(brokerageOffered),
          brokerageType,
          qualitySpecs: {
            grainLengthMm: Number(grainLengthMm),
            whiteness: Number(whiteness),
            moisturePercent: Number(moisturePercent),
            brokenPercent: Number(brokenPercent),
            sortex,
          },
          packaging,
          dispatchLocation,
          notes,
        }),
      });

      if (res.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to add stock listing');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#0D3B2E] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-300 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#C5A059] uppercase tracking-wider mb-1">
            <Wheat className="w-4 h-4" />
            <span>Rice Miller Inventory Portal</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Add New Rice Stock</h2>
          <p className="text-xs text-amber-100/80 mt-1">
            Stock will be validated and automatically published to buyers as an anonymous inventory listing.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Stock Published to Catalog!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Your rice listing is now active on Pragyam Enterprises. Buyers can view your anonymous listing and submit purchase enquiries through the central broker.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="bg-[#0D3B2E] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#166534] transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs flex items-center space-x-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Variety & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rice Variety *</label>
                <input
                  type="text"
                  required
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  placeholder="e.g. 1121 Golden Sella Basmati"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Rice Category *</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as RiceCategory)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                >
                  <option value={RiceCategory.STEAM_RICE}>Steam Rice</option>
                  <option value={RiceCategory.SELLA_RICE}>Sella Rice</option>
                  <option value={RiceCategory.GOLDEN_SELLA_RICE}>Golden Sella Rice</option>
                  <option value={RiceCategory.LEMON_SELLA_RICE}>Lemon Sella Rice</option>
                  <option value={RiceCategory.RAW_RICE}>Raw Rice</option>
                  <option value={RiceCategory.BROWN_RICE}>Brown Rice</option>
                </select>
              </div>
            </div>

            {/* Volume & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Available Quantity (MT) *</label>
                <input
                  type="number"
                  required
                  min="5"
                  value={availableQuantityMT}
                  onChange={e => setAvailableQuantityMT(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Asking Price (₹ / Qtl) *</label>
                <input
                  type="number"
                  required
                  value={askingPricePerQuintal}
                  onChange={e => setAskingPricePerQuintal(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>
            </div>

            {/* Brokerage Offered */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/60">
              <div>
                <label className="block text-xs font-bold text-[#0D3B2E] uppercase mb-1">Brokerage Offered</label>
                <input
                  type="number"
                  value={brokerageOffered}
                  onChange={e => setBrokerageOffered(e.target.value)}
                  className="w-full px-3.5 py-2 border border-amber-300 rounded-xl text-xs outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D3B2E] uppercase mb-1">Brokerage Basis</label>
                <select
                  value={brokerageType}
                  onChange={e => setBrokerageType(e.target.value as BrokerageType)}
                  className="w-full px-3.5 py-2 border border-amber-300 rounded-xl text-xs outline-none bg-white"
                >
                  <option value={BrokerageType.PER_METRIC_TONNE}>₹ per Metric Tonne (MT)</option>
                  <option value={BrokerageType.PER_QUINTAL}>₹ per Quintal</option>
                  <option value={BrokerageType.PERCENTAGE_OF_VALUE}>% of Goods Value</option>
                </select>
              </div>
            </div>

            {/* Quality Specs Banner */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-[#0D3B2E] uppercase block mb-3">Grain Specifications</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-gray-500 block mb-1">Length (mm)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={grainLengthMm}
                    onChange={e => setGrainLengthMm(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Whiteness (Kett)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={whiteness}
                    onChange={e => setWhiteness(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePercent}
                    onChange={e => setMoisturePercent(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Broken (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={brokenPercent}
                    onChange={e => setBrokenPercent(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Dispatch & Packaging */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dispatch Location / Yard</label>
                <input
                  type="text"
                  value={dispatchLocation}
                  onChange={e => setDispatchLocation(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Packaging Type</label>
                <select
                  value={packaging}
                  onChange={e => setPackaging(e.target.value as PackagingType)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                >
                  <option value={PackagingType.PP_BAG_50KG}>PP Bag 50kg</option>
                  <option value={PackagingType.PP_BAG_25KG}>PP Bag 25kg</option>
                  <option value={PackagingType.JUTE_BAG_50KG}>Jute Bag 50kg</option>
                  <option value={PackagingType.NON_WOVEN_BAG_10KG}>Non-Woven Bag 10kg</option>
                  <option value={PackagingType.BOPP_BAG_25KG}>BOPP Bag 25kg</option>
                  <option value={PackagingType.LOOSE_BULK}>Loose Bulk</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Private Mill Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Paddy harvest lot, aging details, inspection availability..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0D3B2E] hover:bg-[#166534] text-white flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{loading ? 'Publishing...' : 'Publish Stock Listing'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
