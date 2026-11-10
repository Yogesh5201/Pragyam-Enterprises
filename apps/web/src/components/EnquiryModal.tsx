'use client';

import React, { useState } from 'react';
import { AnonymousInventoryListingDTO } from '@pragyam/types';
import { X, ShieldCheck, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/apiClient';

interface EnquiryModalProps {
  listing: AnonymousInventoryListingDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EnquiryModal({ listing, isOpen, onClose, onSuccess }: EnquiryModalProps) {
  const { user, isAuthenticated, t } = useAuth();
  const [quantityMT, setQuantityMT] = useState<string>('50');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [buyerNotes, setBuyerNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      setError('Please sign in as an authorized Buyer to submit commercial purchase enquiries.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/enquiries', {
        method: 'POST',
        body: JSON.stringify({
          listingId: listing.id,
          requestedQuantityMT: Number(quantityMT),
          targetPricePerQuintal: targetPrice ? Number(targetPrice) : listing.askingPricePerQuintal,
          buyerNotes,
        }),
      });

      if (res.success) {
        if (res.data?.enquiry) {
          try {
            const localEnqs = JSON.parse(localStorage.getItem('pragyam_registered_enquiries') || '[]');
            localEnqs.unshift(res.data.enquiry);
            localStorage.setItem('pragyam_registered_enquiries', JSON.stringify(localEnqs));
          } catch (e) {}
        }
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to submit enquiry');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
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
            <span>Pragyam Intermediary Brokerage Desk</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Commercial Purchase Enquiry</h2>
          <p className="text-xs text-amber-100/80 mt-1">
            Enquiry for stock reference: <span className="font-mono font-bold text-white">{listing.anonymousCode}</span> ({listing.variety})
          </p>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Enquiry Dispatched Successfully!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Your purchase enquiry has been logged directly with the Pragyam Enterprises Central Brokerage Desk. Our broker will contact the supplier, negotiate optimal rates, and notify your buyer dashboard.
            </p>
            <div className="pt-4">
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-xs flex items-center space-x-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Listing summary strip */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <span className="text-gray-500 block text-[11px]">Asking Rate</span>
                <span className="font-extrabold text-[#0D3B2E]">
                  ₹{listing.askingPricePerQuintal?.toLocaleString('en-IN')} / Quintal
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Available Volume</span>
                <span className="font-extrabold text-slate-800">{listing.availableQuantityMT} MT</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">Origin</span>
                <span className="font-medium text-slate-700">{listing.generalizedLocation?.district}</span>
              </div>
            </div>

            {/* Required Quantity MT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Required Quantity (Metric Tonnes) *
              </label>
              <input
                type="number"
                min="10"
                max={listing.availableQuantityMT}
                required
                value={quantityMT}
                onChange={e => setQuantityMT(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0D3B2E] focus:border-[#0D3B2E] outline-none"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Equals {(Number(quantityMT) || 0) * 10} Quintals (Approx. {((Number(quantityMT) || 0) * 20)} Bags of 50kg)
              </span>
            </div>

            {/* Target Price per Quintal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target Price (₹ per Quintal)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={e => setTargetPrice(e.target.value)}
                placeholder={`Leave blank to propose asking price (₹${listing.askingPricePerQuintal})`}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0D3B2E] focus:border-[#0D3B2E] outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Special Procurement Instructions
              </label>
              <textarea
                rows={3}
                value={buyerNotes}
                onChange={e => setBuyerNotes(e.target.value)}
                placeholder="Delivery timeline, payment arrangement, sample requirements..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#0D3B2E] focus:border-[#0D3B2E] outline-none"
              />
            </div>

            {/* Confidentiality Reminder */}
            <div className="bg-[#FAF9F6] p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
              <span>
                Your identity is never exposed to the supplier. Pragyam Enterprises brokers negotiate all contracts independently.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-2">
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
                <Send className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{loading ? 'Submitting...' : 'Submit Enquiry to Broker'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
