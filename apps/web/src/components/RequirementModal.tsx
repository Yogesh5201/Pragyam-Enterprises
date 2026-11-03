'use client';

import React, { useState } from 'react';
import { RiceCategory, RiceClassification, PackagingType } from '@pragyam/types';
import { X, ShieldCheck, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/apiClient';

interface RequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequirementModal({ isOpen, onClose, onSuccess }: RequirementModalProps) {
  const { isAuthenticated, t } = useAuth();
  const [category, setCategory] = useState<RiceCategory>(RiceCategory.STEAM_RICE);
  const [variety, setVariety] = useState<string>('1509 Basmati Steam');
  const [classification, setClassification] = useState<RiceClassification>(RiceClassification.BASMATI);
  const [requiredQuantityMT, setRequiredQuantityMT] = useState<string>('100');
  const [targetPricePerQuintal, setTargetPricePerQuintal] = useState<string>('6800');
  const [grainLengthMm, setGrainLengthMm] = useState<string>('8.35');
  const [whiteness, setWhiteness] = useState<string>('40.0');
  const [moisturePercent, setMoisturePercent] = useState<string>('12.5');
  const [brokenPercent, setBrokenPercent] = useState<string>('1.0');
  const [sortex, setSortex] = useState<boolean>(true);
  const [packagingRequirement, setPackagingRequirement] = useState<PackagingType>(PackagingType.PP_BAG_50KG);
  const [deliveryCity, setDeliveryCity] = useState<string>('New Delhi');
  const [deliveryState, setDeliveryState] = useState<string>('Delhi');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('Please log in as an authorized Buyer to register procurement requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/requirements', {
        method: 'POST',
        body: JSON.stringify({
          category,
          variety,
          classification,
          requiredQuantityMT: Number(requiredQuantityMT),
          targetPricePerQuintal: Number(targetPricePerQuintal),
          qualitySpecs: {
            grainLengthMm: Number(grainLengthMm),
            whiteness: Number(whiteness),
            moisturePercent: Number(moisturePercent),
            brokenPercent: Number(brokenPercent),
            sortex,
          },
          packagingRequirement,
          deliveryLocation: {
            city: deliveryCity,
            state: deliveryState,
          },
          additionalNotes,
        }),
      });

      if (res.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to submit requirement');
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
            <ShieldCheck className="w-4 h-4" />
            <span>Buyer Procurement Desk</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Post Purchase Requirement</h2>
          <p className="text-xs text-amber-100/80 mt-1">
            Pragyam Enterprises will scan all verified mill inventories and negotiate on your behalf.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Requirement Recorded!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Your requirement has been added to our central broker matching engine. You will be notified as soon as an exact stock match is identified and negotiated.
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

            {/* Volume & Target Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Required Quantity (MT) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={requiredQuantityMT}
                  onChange={e => setRequiredQuantityMT(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Price (₹ / Qtl) *</label>
                <input
                  type="number"
                  required
                  value={targetPricePerQuintal}
                  onChange={e => setTargetPricePerQuintal(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0D3B2E]"
                />
              </div>
            </div>

            {/* Quality Specs Banner */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-[#0D3B2E] uppercase block mb-3">Quality Tolerances</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-gray-500 block mb-1">Min Length (mm)</label>
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
                  <label className="text-gray-500 block mb-1">Max Moisture (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={moisturePercent}
                    onChange={e => setMoisturePercent(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Max Broken (%)</label>
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

            {/* Delivery Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Destination City</label>
                <input
                  type="text"
                  value={deliveryCity}
                  onChange={e => setDeliveryCity(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination State</label>
                <input
                  type="text"
                  value={deliveryState}
                  onChange={e => setDeliveryState(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Additional Specifications</label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                placeholder="Specific export packing, inspection requirements..."
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
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{loading ? 'Submitting...' : 'Post Requirement to Central Broker'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
