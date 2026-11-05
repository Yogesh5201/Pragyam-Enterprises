'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wheat,
  Building,
  PlusCircle,
  Package,
  FileCheck2,
  DollarSign,
  Download,
  Truck,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../lib/apiClient';
import { UserRole } from '@pragyam/types';
import { AddStockModal } from '../../../components/AddStockModal';

function SellerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'stock' | 'orders' | 'dispatch' | 'brokerage'>(
    (searchParams.get('tab') as any) || 'stock'
  );

  const [myListings, setMyListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || role !== UserRole.SELLER) {
        router.push('/login');
      } else {
        loadData();
      }
    }
  }, [isLoading, isAuthenticated, role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, ordRes, payRes] = await Promise.all([
        apiRequest('/inventory/seller/my-listings'),
        apiRequest('/purchase-orders/seller/my-orders'),
        apiRequest('/payments/my-payments'),
      ]);

      if (listRes.success && listRes.data) setMyListings(listRes.data.listings || []);
      if (ordRes.success && ordRes.data) setOrders(ordRes.data.purchaseOrders || []);
      if (payRes.success && payRes.data) setPayments(payRes.data.payments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPO = async (poId: string, poNumber: string) => {
    try {
      const res = await apiRequest(`/purchase-orders/${poId}/pdf`);
      if (res.success && res.data) {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${poNumber}_Seller.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setActionSuccess(`Downloaded official contract ${poNumber}.pdf`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !isAuthenticated || role !== UserRole.SELLER) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Wheat className="w-10 h-10 text-[#0D3B2E] animate-spin" />
          <p className="text-xs font-semibold text-slate-600">
            Verifying Rice Miller Supply Authorization...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Miller Welcome Banner */}
      <div className="bg-[#0D3B2E] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#C5A059]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#C5A059] uppercase mb-1">
            <Building className="w-4 h-4" />
            <span>Verified Rice Miller & Supplier Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {user?.profile?.companyName || 'Rice Milling Facility'}
          </h1>
          <p className="text-xs text-amber-100/70 mt-1">
            Milling Unit: <strong>{user?.profile?.millName || 'Unit 1'}</strong> | Capacity: <strong>{user?.profile?.millCapacityMTPerDay || 150} MT/Day</strong> | City: {user?.profile?.city}, {user?.profile?.state}
          </p>
        </div>

        <button
          onClick={() => setIsAddStockModalOpen(true)}
          className="bg-[#C5A059] hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-[#0D3B2E]" />
          <span>Add New Stock Listing</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl text-xs font-bold text-center">
          {actionSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 overflow-x-auto text-xs font-bold">
        {[
          { key: 'stock', label: `My Rice Stock (${myListings.length})` },
          { key: 'orders', label: `Confirmed Orders (${orders.length})` },
          { key: 'dispatch', label: 'Dispatch & Bilty Updates' },
          { key: 'brokerage', label: 'Brokerage Settlements' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-3 px-2 transition whitespace-nowrap ${
              activeTab === t.key
                ? 'border-b-2 border-[#0D3B2E] text-[#0D3B2E]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: My Rice Stock */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800">Active Mill Inventory</h2>
            <span className="text-xs text-slate-500">Auto-published anonymously to verified buyers</span>
          </div>

          <div className="space-y-3">
            {(myListings || []).map(l => (
              <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#0D3B2E]">{l.anonymousCode}</span>
                    <span className="text-sm font-black text-slate-900">{l.variety}</span>
                    <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">
                      {l.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                    <div>Available: <strong>{l.availableQuantityMT} MT</strong></div>
                    <div>Asking Rate: <strong className="text-[#0D3B2E]">₹{l.askingPricePerQuintal}/Qtl</strong></div>
                    <div>Brokerage Offered: <strong className="text-amber-700">₹{l.brokerageOffered}/MT</strong></div>
                    <div>Dispatch Yard: <strong>{l.dispatchLocation}</strong></div>
                  </div>

                  <div className="text-[11px] text-gray-500">
                    Specs: Grain Length {l.qualitySpecs?.grainLengthMm}mm | Moisture {l.qualitySpecs?.moisturePercent}% | Broken {l.qualitySpecs?.brokenPercent}% | Sortex Clean
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg">
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Confirmed Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">Confirmed Supply Contracts</h2>
          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
              No confirmed contracts yet. Pragyam Brokerage Desk will notify you upon deal confirmation.
            </div>
          ) : (
            <div className="space-y-3">
              {(orders || []).map(po => (
                <div key={po.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-[#0D3B2E]">{po.poNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {po.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        Intermediary Broker: <strong>{po.intermediaryBroker}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownloadPO(po.id, po.poNumber)}
                      className="bg-[#0D3B2E] hover:bg-[#166534] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Download Supplier PO (PDF)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Supply Commodity</span>
                      <span className="font-bold text-slate-800">{po.riceVariety}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Supply Volume</span>
                      <span className="font-bold text-slate-800">{po.quantityMT} MT</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Agreed Supply Rate</span>
                      <span className="font-bold text-slate-800">₹{po.agreedRatePerQuintal}/Qtl</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Total Contract Value</span>
                      <span className="font-extrabold text-[#0D3B2E]">₹{po.totalGoodsValue?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Dispatch & Bilty */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">Dispatch & Bilty Updates</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <span className="font-bold text-[#0D3B2E] block">Active Dispatch for PE-PO-2026-001:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Vehicle Assigned</span>
                <span className="font-mono font-bold text-slate-900">HR-05-AU-9821</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Bilty (LR) Number</span>
                <span className="font-mono font-bold text-[#0D3B2E]">LR-KNL-2026-7844</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Status</span>
                <span className="font-bold text-blue-700">IN TRANSIT TO DELHI</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Brokerage Settlements */}
      {activeTab === 'brokerage' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">Brokerage Settlements Ledger</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b font-bold text-slate-600">
                <tr>
                  <th className="p-3">Reference / UTR</th>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Brokerage Fee</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(payments || []).map(pay => (
                  <tr key={pay.id}>
                    <td className="p-3 font-mono">{pay.referenceNumber}</td>
                    <td className="p-3 font-bold text-[#0D3B2E]">{pay.poNumber}</td>
                    <td className="p-3 font-bold text-amber-900">₹{pay.amount?.toLocaleString('en-IN')}</td>
                    <td className="p-3">{pay.method}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddStockModal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

export default function SellerDashboard() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Seller Desk...</div>}>
      <SellerDashboardContent />
    </Suspense>
  );
}
