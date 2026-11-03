'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wheat,
  ShieldCheck,
  Package,
  FileSpreadsheet,
  FileText,
  Clock,
  Download,
  PlusCircle,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { apiRequest } from '../../../lib/apiClient';
import { UserRole } from '@pragyam/types';
import { RequirementModal } from '../../../components/RequirementModal';

function BuyerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'requirements' | 'enquiries' | 'orders' | 'dispatch' | 'payments'>(
    (searchParams.get('tab') as any) || 'enquiries'
  );

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || role !== UserRole.BUYER) {
        router.push('/login');
      } else {
        loadData();
      }
    }
  }, [isLoading, isAuthenticated, role]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enqRes, reqRes, ordRes, payRes] = await Promise.all([
        apiRequest('/enquiries/my-enquiries'),
        apiRequest('/requirements/my-requirements'),
        apiRequest('/purchase-orders/buyer/my-orders'),
        apiRequest('/payments/my-payments'),
      ]);

      if (enqRes.success && enqRes.data) setEnquiries(enqRes.data.enquiries);
      if (reqRes.success && reqRes.data) setRequirements(reqRes.data.requirements);
      if (ordRes.success && ordRes.data) setOrders(ordRes.data.purchaseOrders);
      if (payRes.success && payRes.data) setPayments(payRes.data.payments);
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
        a.download = `${poNumber}.pdf`;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Buyer Welcome Banner */}
      <div className="bg-[#0D3B2E] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#C5A059]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#C5A059] uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Buyer Procurement Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            {user?.profile?.companyName || 'Institutional Purchaser'}
          </h1>
          <p className="text-xs text-amber-100/70 mt-1">
            Contact Representative: {user?.profile?.fullName} | City: {user?.profile?.city}, {user?.profile?.state}
          </p>
        </div>

        <button
          onClick={() => setIsRequirementModalOpen(true)}
          className="bg-[#C5A059] hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-[#0D3B2E]" />
          <span>Post Purchase Requirement</span>
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
          { key: 'enquiries', label: `My Enquiries (${enquiries.length})` },
          { key: 'requirements', label: `My Requirements (${requirements.length})` },
          { key: 'orders', label: `Confirmed Orders (${orders.length})` },
          { key: 'dispatch', label: 'Logistics Tracking' },
          { key: 'payments', label: `Payments & Receipts (${payments.length})` },
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

      {/* Tab 1: Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">Submitted Purchase Enquiries</h2>
          {enquiries.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
              You haven't submitted any enquiries yet. Browse the Rice Stock directory to enquire.
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.map(e => (
                <div key={e.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#0D3B2E]">{e.enquiryCode}</span>
                      <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-700">
                        Stock: {e.anonymousListingCode}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                        {e.adminStatus}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 block mt-1">
                      {e.variety} ({e.category?.replace('_', ' ')})
                    </span>
                    <span className="text-xs text-slate-600">
                      Requested: <strong>{e.requestedQuantityMT} MT</strong> | Target: <strong>₹{e.targetPricePerQuintal}/Qtl</strong>
                    </span>
                    {e.adminNotes && (
                      <p className="text-xs text-amber-900 bg-amber-50/70 p-2 rounded-lg mt-2 font-medium">
                        💬 <strong>Broker Desk Note:</strong> {e.adminNotes}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    <span>Submitted: {new Date(e.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Requirements */}
      {activeTab === 'requirements' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">Registered Procurement Requirements</h2>
          {requirements.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
              No purchase requirements recorded. Click "Post Purchase Requirement" to broadcast to the broker.
            </div>
          ) : (
            <div className="space-y-3">
              {requirements.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#0D3B2E]">{r.anonymousCode}</span>
                      <span className="text-xs font-bold text-slate-800">{r.variety}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                    <div>Volume: <strong>{r.requiredQuantityMT} MT</strong></div>
                    <div>Target: <strong>₹{r.targetPricePerQuintal}/Qtl</strong></div>
                    <div>Length: <strong>{r.qualitySpecs?.grainLengthMm} mm</strong></div>
                    <div>Moisture: <strong>{r.qualitySpecs?.moisturePercent}%</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Confirmed Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">My Confirmed Purchase Orders</h2>
          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border text-center text-xs text-slate-500">
              No confirmed purchase orders yet. Once a deal is negotiated, official POs will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(po => (
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
                      <span>Download Official PO (PDF)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Commodity</span>
                      <span className="font-bold text-slate-800">{po.riceVariety}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Quantity</span>
                      <span className="font-bold text-slate-800">{po.quantityMT} MT ({po.quantityQuintals} Qtl)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Agreed Rate</span>
                      <span className="font-bold text-slate-800">₹{po.agreedRatePerQuintal}/Qtl</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Total Goods Value</span>
                      <span className="font-extrabold text-[#0D3B2E]">₹{po.totalGoodsValue?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Dispatch Tracking */}
      {activeTab === 'dispatch' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">Consignment Dispatch & Transport Tracking</h2>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 text-xs">
              <span className="font-bold text-[#0D3B2E]">Consignment for PO: PE-PO-2026-001</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">IN TRANSIT</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px]">Vehicle No</span>
                <span className="font-mono font-bold text-slate-800">HR-05-AU-9821</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Bilty (LR) No</span>
                <span className="font-mono font-bold text-[#0D3B2E]">LR-KNL-2026-7844</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Driver Contact</span>
                <span className="font-bold text-slate-800">Sarabjeet Singh (+91 94160 22334)</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Expected Destination</span>
                <span className="font-bold text-slate-800">Delhi CFS Yard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">Payment History & Receipts</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b font-bold text-slate-600">
                <tr>
                  <th className="p-3">Reference / UTR</th>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount (₹)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td className="p-3 font-mono">{pay.referenceNumber}</td>
                    <td className="p-3 font-bold text-[#0D3B2E]">{pay.poNumber}</td>
                    <td className="p-3">{pay.method}</td>
                    <td className="p-3 font-bold">₹{pay.amount?.toLocaleString('en-IN')}</td>
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

      <RequirementModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Buyer Desk...</div>}>
      <BuyerDashboardContent />
    </Suspense>
  );
}
