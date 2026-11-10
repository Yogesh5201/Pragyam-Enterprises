'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wheat,
  ShieldCheck,
  TrendingUp,
  Users,
  Building,
  Package,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Truck,
  Download,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  FileCheck2,
  Lock,
  ChevronRight,
  History,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/apiClient';
import {
  UserRole,
  DashboardMetricsDTO,
  MatchingResultDTO,
  PurchaseOrderStatus,
  TransportStatus
} from '@pragyam/types';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { user, role, isAuthenticated, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'inventory'
    | 'requirements'
    | 'matching'
    | 'negotiations'
    | 'orders'
    | 'transport'
    | 'payments'
    | 'invoices'
    | 'buyers'
    | 'sellers'
    | 'export'
    | 'audit'
  >('overview');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetricsDTO | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [matchingResults, setMatchingResults] = useState<MatchingResultDTO[]>([]);
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [transportRecords, setTransportRecords] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Forms / Dialogs
  const [selectedNegForPo, setSelectedNegForPo] = useState<any | null>(null);
  const [newPoForm, setNewPoForm] = useState({
    dispatchLocation: '',
    deliveryLocation: '',
    paymentTerms: '20% Advance against Bilty, 80% on destination inspection',
  });

  const [transportForm, setTransportForm] = useState({
    poId: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    biltyNumber: '',
    ewayBillNumber: '',
    freightCharges: '35000',
  });

  // Verify Admin role
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || role !== UserRole.SUPER_ADMIN) {
        router.push('/admin/login');
      } else {
        loadAllData();
      }
    }
  }, [isLoading, isAuthenticated, role]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        metricsRes,
        listingsRes,
        matchingRes,
        negRes,
        ordersRes,
        paymentsRes,
        invoicesRes,
        buyersRes,
        sellersRes,
        auditRes,
        reqRes,
        trpRes
      ] = await Promise.all([
        apiRequest('/analytics/admin/summary'),
        apiRequest('/inventory/admin/all'),
        apiRequest('/matching/admin/recommendations'),
        apiRequest('/negotiations/admin/all'),
        apiRequest('/purchase-orders/admin/all'),
        apiRequest('/payments/admin/all'),
        apiRequest('/invoices/admin/all'),
        apiRequest('/users/admin/buyers'),
        apiRequest('/users/admin/sellers'),
        apiRequest('/audit/admin/logs?limit=50'),
        apiRequest('/requirements/admin/all'),
        apiRequest('/transport/admin/all'),
      ]);

      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data.metrics || metricsRes.data);
      }
      if (listingsRes.success && listingsRes.data) {
        setListings(listingsRes.data.listings || []);
      }
      if (matchingRes.success && matchingRes.data) {
        setMatchingResults(matchingRes.data.recommendations || []);
      }
      if (negRes.success && negRes.data) {
        setNegotiations(negRes.data.negotiations || []);
      }
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data.purchaseOrders || []);
      }
      if (paymentsRes.success && paymentsRes.data) {
        setPayments(paymentsRes.data.payments || []);
      }
      if (invoicesRes.success && invoicesRes.data) {
        setInvoices(invoicesRes.data.invoices || []);
      }
      if (buyersRes.success && buyersRes.data) {
        setBuyers(buyersRes.data.buyers || []);
      }
      if (sellersRes.success && sellersRes.data) {
        setSellers(sellersRes.data.sellers || []);
      }
      if (auditRes.success && auditRes.data) {
        setAuditLogs(auditRes.data.logs || auditRes.data.auditLogs || []);
      }
      if (reqRes.success && reqRes.data) {
        setRequirements(reqRes.data.requirements || []);
      }
      if (trpRes.success && trpRes.data) {
        setTransportRecords(trpRes.data.transportRecords || []);
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // 1. Issue Official PO from Confirmed Negotiation
  const handleIssuePo = async (neg: any) => {
    try {
      const res = await apiRequest('/purchase-orders/admin/create', {
        method: 'POST',
        body: JSON.stringify({
          negotiationId: neg.id,
          listingId: neg.listingId,
          buyerId: neg.buyerId,
          sellerId: neg.sellerId,
          quantityMT: neg.agreedQuantityMT,
          agreedRatePerQuintal: neg.finalAgreedPrice,
          brokeragePerUnit: neg.brokeragePerUnit,
          brokerageType: neg.brokerageType,
          brokeragePayee: neg.brokeragePayee,
          dispatchLocation: newPoForm.dispatchLocation || 'Karnal Dispatch Depot',
          deliveryLocation: newPoForm.deliveryLocation || 'Delhi CFS Yard',
          paymentTerms: newPoForm.paymentTerms,
        }),
      });

      if (res.success) {
        showNotification(`Official Purchase Order ${res.data.purchaseOrder.poNumber} issued successfully!`);
        setSelectedNegForPo(null);
        loadAllData();
        setActiveTab('orders');
      } else {
        setActionError(res.error || 'Failed to issue PO');
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  // 2. Download Excel dataset
  const handleExportExcel = async (dataset: string) => {
    try {
      const res = await apiRequest(`/export/admin/excel/${dataset}`);
      if (res.success && res.data) {
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Pragyam_${dataset}_report_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification(`Excel report for ${dataset} exported successfully.`);
      } else {
        setActionError(res.error || `Failed to export ${dataset} report`);
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  // 3. Download PO or Invoice PDF
  const handleDownloadPdf = async (type: 'po' | 'invoice', id: string, numberStr: string) => {
    try {
      const endpoint = type === 'po' ? `/purchase-orders/${id}/pdf` : `/invoices/${id}/pdf`;
      const res = await apiRequest(endpoint);
      if (res.success && res.data) {
        const safeName = (numberStr || type).replace(/[\/\\]/g, '_');
        const url = window.URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showNotification(`Downloaded ${safeName}.pdf`);
      } else {
        setActionError(res.error || `Failed to download ${type}`);
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  // 4. Verify Payment
  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await apiRequest(`/payments/admin/${paymentId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
      if (res.success) {
        showNotification('Payment verified and ledger updated.');
        loadAllData();
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  // 5. Update PO Status
  const handleUpdateOrderStatus = async (poId: string, status: string) => {
    try {
      const res = await apiRequest(`/purchase-orders/admin/${poId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        showNotification(`Order status updated to ${status}.`);
        loadAllData();
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  if (isLoading || !isAuthenticated || role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-[#C5A059]" />
          <span className="text-sm font-semibold text-slate-300">
            Access Restricted: Super Administrator Authentication & MFA Required
          </span>
        </div>
      </div>
    );
  }

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <Wheat className="w-12 h-12 text-[#C5A059] animate-spin" />
          <span className="text-sm font-semibold text-slate-300">
            Loading Pragyam Enterprises Central Broker Command Center...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header Bar */}
      <div className="bg-[#0D3B2E] text-white px-6 py-4 shadow-md border-b border-[#C5A059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059] flex items-center justify-center text-[#0D3B2E] font-black shadow-md">
            PE
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                SUPER ADMINISTRATOR DESK
              </h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[10px] font-bold">
                MFA ACTIVE
              </span>
            </div>
            <span className="text-xs text-amber-100/70 block">
              Pragyam Enterprises Commercial Operations & Intermediary Hub
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAllData}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition text-xs flex items-center space-x-1"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="bg-emerald-600 text-white py-2.5 px-6 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-inner">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="bg-red-600 text-white py-2.5 px-6 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-inner">
          <AlertCircle className="w-4 h-4" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Admin Workspace (Sidebar + Workspace) */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex-shrink-0">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mb-2">
            Operations
          </div>
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#C5A059]" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'inventory'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-[#C5A059]" />
              <span>Inventory & Mill Stock ({listings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('requirements')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'requirements'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-[#C5A059]" />
              <span>Buyer Requirements ({requirements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('matching')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'matching'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Matching Engine ({matchingResults.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('negotiations')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'negotiations'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-[#C5A059]" />
              <span>Negotiation Desk ({negotiations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'orders'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-[#C5A059]" />
              <span>Purchase Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transport')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'transport'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4 text-[#C5A059]" />
              <span>Transport & Bilty (LR)</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'payments'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 text-[#C5A059]" />
              <span>Payments & Settlements</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'invoices'
                  ? 'bg-[#0D3B2E] text-white font-bold border border-[#C5A059]/40'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-[#C5A059]" />
              <span>GST Tax Invoices ({invoices.length})</span>
            </button>
          </nav>

          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-3 mt-6 mb-2">
            Entities & Audits
          </div>
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('buyers')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'buyers'
                  ? 'bg-[#0D3B2E] text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-[#C5A059]" />
              <span>Buyers Directory ({buyers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sellers')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'sellers'
                  ? 'bg-[#0D3B2E] text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4 text-[#C5A059]" />
              <span>Rice Mills Directory ({sellers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'export'
                  ? 'bg-[#0D3B2E] text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4 text-[#C5A059]" />
              <span>Excel (XLSX) Exports</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'audit'
                  ? 'bg-[#0D3B2E] text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4 text-[#C5A059]" />
              <span>Immutable Audit Logs</span>
            </button>
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW & KPIS */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Commercial Performance Overview</h2>
                <p className="text-xs text-slate-500">Live operational ledger across all contracts, dispatches, and brokerage earnings.</p>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gross Trade Value</span>
                  <div className="text-2xl font-black text-[#0D3B2E]">
                    ₹{metrics.totalTransactionValue?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Total completed & active contracts</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Brokerage Earned</span>
                  <div className="text-2xl font-black text-[#C5A059]">
                    ₹{metrics.totalBrokerageEarned?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium block">Intermediary commission</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Sales Volume</span>
                  <div className="text-2xl font-black text-slate-800">
                    {metrics.totalSalesMT} MT
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium block">
                    ({metrics.totalSalesMT * 10} Quintals traded)
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Inventory</span>
                  <div className="text-2xl font-black text-slate-800">
                    {metrics.totalStockAvailableMT} MT
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Across {listings.length} listed lots</span>
                </div>
              </div>

              {/* Second row KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Received Payments</span>
                  <div className="text-xl font-extrabold text-emerald-700">
                    ₹{metrics.receivedPayments?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-gray-400">Verified by accounts</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Outstanding Balance</span>
                  <div className="text-xl font-extrabold text-amber-600">
                    ₹{metrics.outstandingPayments?.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-gray-400">Pending delivery settlements</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Purchase Orders</span>
                  <div className="text-xl font-extrabold text-[#0D3B2E]">
                    {metrics.totalPurchaseOrders} Orders
                  </div>
                  <span className="text-[11px] text-gray-400">{metrics.pendingOrders} pending, {metrics.completedOrders} completed</span>
                </div>

                <div
                  onClick={() => setActiveTab('requirements')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-[#0D3B2E] transition"
                >
                  <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Buyer Demands</span>
                  <div className="text-xl font-extrabold text-[#0D3B2E]">
                    {requirements.length} Requirements
                  </div>
                  <span className="text-[11px] text-[#C5A059] font-bold">View Procurement Demands ➔</span>
                </div>
              </div>

              {/* Monthly Trend & Category Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Monthly Commercial Sales Trend
                  </h3>
                  <div className="space-y-3">
                    {(metrics.monthlySalesTrend || []).map((m, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{m.month}</span>
                          <span className="text-[#0D3B2E]">₹{(m.amount / 100000).toFixed(1)} Lakhs ({m.volumeMT} MT)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-[#0D3B2E] h-2 rounded-full"
                            style={{ width: `${Math.min(100, (m.amount / 35000000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Rice Category Distribution
                  </h3>
                  <div className="space-y-3">
                    {(metrics.categoryDistribution || []).map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{cat.category}</span>
                          <span className="text-amber-700">{cat.volumeMT} MT ({cat.count} listings)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-[#C5A059] h-2 rounded-full"
                            style={{ width: `${Math.min(100, (cat.volumeMT / 800) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY MANAGEMENT WITH SELLER IDENTITIES */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Inventory & Mill Stock Control</h2>
                  <p className="text-xs text-slate-500">Super Admin unredacted view showing actual mill owners, contact numbers, and rates.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                      <tr>
                        <th className="p-3.5">Stock Code</th>
                        <th className="p-3.5">Rice Variety / Category</th>
                        <th className="p-3.5">Available (MT)</th>
                        <th className="p-3.5">Asking Rate</th>
                        <th className="p-3.5">Actual Mill & Contact (Admin)</th>
                        <th className="p-3.5">Brokerage Offered</th>
                        <th className="p-3.5">Specs (Length/Moist/Broken)</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(listings || []).map(l => (
                        <tr key={l.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-mono font-bold text-[#0D3B2E]">{l.anonymousCode}</td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 block">{l.variety}</span>
                            <span className="text-[10px] text-gray-500">{l.category}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-900">{l.availableQuantityMT} MT</td>
                          <td className="p-3.5 font-bold text-[#0D3B2E]">₹{l.askingPricePerQuintal?.toLocaleString('en-IN')}/Qtl</td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{l.sellerCompanyName}</span>
                            <span className="text-[11px] text-slate-500 block">{l.sellerFullName} ({l.sellerPhone})</span>
                            <span className="text-[10px] text-amber-700">{l.millLocation}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-emerald-700">₹{l.brokerageOffered} / MT</td>
                          <td className="p-3.5 text-gray-600">
                            {l.qualitySpecs?.grainLengthMm}mm | {l.qualitySpecs?.moisturePercent}% | {l.qualitySpecs?.brokenPercent}%
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BUYER PROCUREMENT REQUIREMENTS REGISTER */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Buyer Procurement Demands ({requirements.length})</h2>
                  <p className="text-xs text-slate-500">Live purchase requirements broadcast by verified buyers, wholesale traders, and exporters.</p>
                </div>
              </div>

              {requirements.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">No active buyer requirements yet</h3>
                  <p className="text-xs text-slate-500">When buyers post requirements from their portal, they will appear here immediately.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                        <tr>
                          <th className="p-3.5">Req Code</th>
                          <th className="p-3.5">Rice Variety / Category</th>
                          <th className="p-3.5">Required Volume</th>
                          <th className="p-3.5">Target Rate</th>
                          <th className="p-3.5">Quality Specifications</th>
                          <th className="p-3.5">Destination Hub</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requirements.map((req: any) => (
                          <tr key={req.id} className="hover:bg-slate-50 transition">
                            <td className="p-3.5">
                              <span className="font-mono font-bold text-[#0D3B2E] block">{req.requirementCode || req.id}</span>
                              <span className="font-bold text-slate-800 text-[11px] block">{req.buyerCompanyName || 'Buyer'}</span>
                              <span className="text-[10px] text-gray-500 block">{req.buyerFullName} ({req.buyerPhone})</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-slate-800 block">{req.variety}</span>
                              <span className="text-[10px] text-gray-500">{req.category}</span>
                            </td>
                            <td className="p-3.5 font-semibold text-slate-900">
                              {req.requiredQuantityMT} MT ({Number(req.requiredQuantityMT) * 10} Qtl)
                            </td>
                            <td className="p-3.5 font-bold text-[#0D3B2E]">
                              ₹{req.targetPricePerQuintal?.toLocaleString('en-IN')}/Qtl
                            </td>
                            <td className="p-3.5 text-gray-600">
                              {req.qualitySpecs?.grainLengthMm}mm | {req.qualitySpecs?.moisturePercent}% Moist | {req.qualitySpecs?.brokenPercent}% Broken
                            </td>
                            <td className="p-3.5 text-slate-700">
                              {typeof req.deliveryLocation === 'object' && req.deliveryLocation !== null
                                ? `${req.deliveryLocation.city || ''}, ${req.deliveryLocation.state || ''}`
                                : String(req.deliveryLocation || 'Delhi Hub')}
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {req.status || 'OPEN'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => {
                                  setActiveTab('matching');
                                  showNotification(`Matching active mill stock for ${req.variety}`);
                                }}
                                className="bg-[#0D3B2E] hover:bg-[#166534] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition inline-flex items-center space-x-1"
                              >
                                <span>Match Mill Stock</span>
                                <ArrowRight className="w-3 h-3 text-[#C5A059]" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BUYER-SELLER MATCHING ENGINE */}
          {activeTab === 'matching' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Buyer-Seller Intelligent Matching Engine</h2>
                <p className="text-xs text-slate-500">
                  Calculates compatibility between Buyer Purchase Requirements and Available Mill Stock across category, variety, grain length, moisture, whiteness, broken %, and target price.
                </p>
              </div>

              {matchingResults.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800">No high-probability matches pending</h3>
                  <p className="text-xs text-slate-500">All current requirements have either been matched or have significant quality deltas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(matchingResults || []).map((m, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-[#0D3B2E] text-white flex flex-col items-center justify-center font-black">
                            <span className="text-base text-[#C5A059]">{m.overallMatchScore}%</span>
                            <span className="text-[9px] uppercase tracking-wider text-gray-300">Match</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-extrabold text-slate-900 text-sm">
                                {m.variety} ({m.category?.replace('_', ' ')})
                              </h3>
                              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-700">
                                Req: {m.requirementCode} ➔ Stock: {m.anonymousListingCode}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 block">
                              Buyer: <strong className="text-slate-800">{m.buyerCompanyName}</strong> | Supplier Mill: <strong className="text-slate-800">{m.sellerCompanyName}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setActiveTab('negotiations');
                              showNotification(`Initiated deal negotiation for ${m.variety}`);
                            }}
                            className="bg-[#0D3B2E] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <span>Open Negotiation Desk</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                          </button>
                        </div>
                      </div>

                      {/* Differences Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-gray-500 block text-[10px]">Quality Score</span>
                          <span className="font-bold text-[#0D3B2E] text-sm">{m.qualityScore ?? 95}%</span>
                          <span className="text-[10px] text-gray-500 block">Length Δ {m.differences?.grainLengthDiff ?? 0}mm</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-gray-500 block text-[10px]">Price Proximity</span>
                          <span className="font-bold text-[#0D3B2E] text-sm">{m.priceScore ?? 92}%</span>
                          <span className="text-[10px] text-gray-500 block">Price Δ ₹{m.differences?.priceDiffPerQuintal ?? 0}/Qtl</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-gray-500 block text-[10px]">Quantity Fulfillment</span>
                          <span className="font-bold text-[#0D3B2E] text-sm">{m.quantityScore ?? 98}%</span>
                          <span className="text-[10px] text-gray-500 block">Delta: {m.differences?.quantityDiffMT ?? 0} MT</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-gray-500 block text-[10px]">Moisture & Broken</span>
                          <span className="font-bold text-slate-800 text-sm">Compliant</span>
                          <span className="text-[10px] text-gray-500 block">Moisture Δ {m.differences?.moistureDiff ?? 0}%</span>
                        </div>
                      </div>

                      <div className="bg-amber-50/70 p-2.5 rounded-xl text-xs text-amber-900 border border-amber-200/60 font-medium">
                        💡 <strong>Broker Recommendation:</strong> {m.recommendationSummary}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NEGOTIATIONS DESK */}
          {activeTab === 'negotiations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Admin-Controlled Negotiation Hub</h2>
                <p className="text-xs text-slate-500">
                  Manage active price negotiations between millers and purchasers. Only Super Admin can finalize price and convert to official Purchase Order.
                </p>
              </div>

              <div className="space-y-4">
                {(negotiations || []).map(neg => (
                  <div key={neg.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#0D3B2E]">{neg.anonymousListingCode}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                            {neg.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Buyer: <strong className="text-slate-800">{neg.buyerCompanyName}</strong> ⟷ Mill: <strong className="text-slate-800">{neg.sellerCompanyName}</strong>
                        </span>
                      </div>

                      {neg.status === 'AGREED' ? (
                        <button
                          onClick={() => {
                            setSelectedNegForPo(neg);
                            setNewPoForm({
                              dispatchLocation: neg.anonymousListingCode === 'PRG-3428' ? 'TOHANA Mill Yard, Haryana' : 'Taraori Mill Depot, Karnal',
                              deliveryLocation: neg.buyerCompanyName?.includes('haruana') ? 'TONA Hub, Haryana' : 'New Delhi CFS Yard',
                              paymentTerms: '10% Advance Escrow against Bilty, 90% on destination inspection',
                            });
                          }}
                          className="bg-[#0D3B2E] hover:bg-[#166534] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-md"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-[#C5A059]" />
                          <span>Generate Official Purchase Order</span>
                        </button>
                      ) : neg.status === 'CONVERTED_TO_PO' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center space-x-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Official PO Issued</span>
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            await apiRequest(`/negotiations/admin/${neg.id}/confirm-deal`, {
                              method: 'POST',
                              body: JSON.stringify({
                                finalAgreedPrice: neg.adminNegotiatedPrice,
                                agreedQuantityMT: neg.agreedQuantityMT,
                              }),
                            });
                            showNotification('Deal agreed and locked! You can now generate official PO.');
                            loadAllData();
                          }}
                          className="bg-[#C5A059] hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                          Lock & Finalize Deal Price
                        </button>
                      )}
                    </div>

                    {/* Price Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="text-gray-500 block text-[10px]">Seller Asking Price</span>
                        <span className="text-sm font-bold text-slate-800">₹{neg.sellerInitialPrice}/Qtl</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="text-gray-500 block text-[10px]">Buyer Target Price</span>
                        <span className="text-sm font-bold text-slate-800">₹{neg.buyerTargetPrice}/Qtl</span>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                        <span className="text-emerald-700 block text-[10px] font-bold">Agreed / Negotiated Rate</span>
                        <span className="text-base font-black text-emerald-800">₹{neg.finalAgreedPrice || neg.adminNegotiatedPrice}/Qtl</span>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                        <span className="text-amber-800 block text-[10px] font-bold">Brokerage Fee</span>
                        <span className="text-base font-black text-amber-900">₹{neg.brokeragePerUnit} / MT ({neg.brokeragePayee})</span>
                      </div>
                    </div>

                    {/* Negotiation History */}
                    {neg.history && neg.history.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Internal Broker Audit Notes:</span>
                        {(neg.history || []).map((h: any, i: number) => (
                          <div key={i} className="text-slate-600 flex items-start space-x-2">
                            <span className="text-amber-600 font-mono text-[11px] font-bold">[{h.actor}]</span>
                            <span>{h.note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PURCHASE ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Official Purchase Orders (POs)</h2>
                  <p className="text-xs text-slate-500">Official legally-binding contracts issued by Pragyam Enterprises.</p>
                </div>
              </div>

              <div className="space-y-4">
                {(orders || []).map(po => (
                  <div key={po.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-[#0D3B2E]">{po.poNumber}</span>
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {po.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Date: {new Date(po.orderDate || po.createdAt || Date.now()).toLocaleDateString('en-IN')} | Variety: <strong>{po.riceVariety}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadPdf('po', po.id, po.poNumber)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                        >
                          <Download className="w-3.5 h-3.5 text-[#0D3B2E]" />
                          <span>Download PDF</span>
                        </button>

                        <select
                          value={po.status}
                          onChange={e => handleUpdateOrderStatus(po.id, e.target.value)}
                          className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none"
                        >
                          <option value={PurchaseOrderStatus.CONFIRMED}>Confirmed</option>
                          <option value={PurchaseOrderStatus.PROCESSING}>Processing</option>
                          <option value={PurchaseOrderStatus.READY_FOR_DISPATCH}>Ready for Dispatch</option>
                          <option value={PurchaseOrderStatus.DISPATCHED}>Dispatched</option>
                          <option value={PurchaseOrderStatus.IN_TRANSIT}>In Transit</option>
                          <option value={PurchaseOrderStatus.DELIVERED}>Delivered</option>
                          <option value={PurchaseOrderStatus.COMPLETED}>Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Volume & Rate</span>
                        <span className="font-bold text-slate-800">{po.quantityMT} MT @ ₹{po.agreedRatePerQuintal}/Qtl</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Total Goods Value</span>
                        <span className="font-extrabold text-[#0D3B2E]">₹{po.totalGoodsValue?.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Brokerage Earned</span>
                        <span className="font-bold text-[#C5A059]">₹{po.brokerageAmount?.toLocaleString('en-IN')} ({po.brokeragePayee})</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Locations</span>
                        <span className="text-slate-700 truncate block">{po.dispatchLocation} ➔ {po.deliveryLocation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TRANSPORT & BILTY */}
          {activeTab === 'transport' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Transport & Bilty (LR) Logistics Desk</h2>
                <p className="text-xs text-slate-500">Live vehicle assignment, driver details, LR/Bilty numbers, and dispatch progression.</p>
              </div>

              <div className="space-y-4">
                {(transportRecords.length > 0 ? transportRecords : orders).map((item: any) => {
                  const t = transportRecords.find((tr: any) => tr.poNumber === item.poNumber || tr.poId === item.id) || item;
                  const po = orders.find((o: any) => o.poNumber === t.poNumber || o.id === t.purchaseOrderId) || item;
                  return (
                    <div key={t.id || po.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-bold text-[#0D3B2E]">{t.poNumber || po.poNumber}</span> - <span>{po.riceVariety || '1121 Golden Sella Basmati'} ({t.loadedQuantityMT || po.quantityMT || 70} MT)</span>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                          {t.status || 'Vehicle Assigned'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500 block text-[10px]">Vehicle Number</span>
                          <span className="font-mono font-bold text-slate-900">{t.vehicleNumber || 'HR-23-BC-4412'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Bilty (LR) Number</span>
                          <span className="font-mono font-bold text-[#0D3B2E]">{t.biltyNumber || 'LR-TOH-2026-7844'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Driver Details</span>
                          <span className="text-slate-800">{t.driverName || 'Sarabjeet Singh'} ({t.driverPhone || '+91 94160 22334'})</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px]">Freight & Transporter</span>
                          <span className="text-emerald-700 font-semibold">₹{(t.freightCharges || 35000).toLocaleString('en-IN')} ({t.transporterName || 'Tohana Logistics'})</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 pt-1 border-t border-slate-50">
                        <span className="font-semibold text-slate-700">Dispatch Route:</span>
                        <span>{t.loadingLocation || po.dispatchLocation || 'TOHANA Mill Yard'} ➔ {t.deliveryLocation || po.deliveryLocation || 'TONA Hub'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: PAYMENTS & SETTLEMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Payments & Brokerage Settlements</h2>
                <p className="text-xs text-slate-500">Offline RTGS/NEFT UTR verifications and online payment reconciliation.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-3.5">Payment ID</th>
                      <th className="p-3.5">PO Number</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Amount (₹)</th>
                      <th className="p-3.5">Payer Details</th>
                      <th className="p-3.5">Method & Reference</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(payments || []).map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono text-gray-600">{pay.id}</td>
                        <td className="p-3.5 font-bold text-[#0D3B2E]">{pay.poNumber}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pay.paymentType === 'BROKERAGE_PAYMENT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {pay.paymentType}
                          </span>
                        </td>
                        <td className="p-3.5 font-extrabold text-slate-900">₹{pay.amount?.toLocaleString('en-IN')}</td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800">{pay.payerName}</span>
                          <span className="text-[10px] text-gray-500 block">({pay.payerRole})</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium">{pay.method}</span>
                          <span className="font-mono text-[10px] text-gray-500 block">{pay.referenceNumber}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {!pay.verifiedByAdmin && (
                            <button
                              onClick={() => handleVerifyPayment(pay.id)}
                              className="bg-emerald-600 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-emerald-700"
                            >
                              Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: GST INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900">GST Tax Invoices Register</h2>
                  <p className="text-xs text-slate-500">Official brokerage tax documentation under SAC Code 998319 (18% GST).</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-3.5">Invoice Number</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Billed To (Client)</th>
                      <th className="p-3.5">PO Ref</th>
                      <th className="p-3.5">Taxable (₹)</th>
                      <th className="p-3.5">Tax (₹)</th>
                      <th className="p-3.5">Grand Total (₹)</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(invoices || []).map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold font-mono text-[#0D3B2E]">{inv.invoiceNumber}</td>
                        <td className="p-3.5 text-gray-600">{new Date(inv.invoiceDate || inv.issueDate || Date.now()).toLocaleDateString('en-IN')}</td>
                        <td className="p-3.5 font-semibold text-slate-800">{inv.clientName}</td>
                        <td className="p-3.5 font-mono text-gray-500">{inv.poNumber}</td>
                        <td className="p-3.5">₹{inv.taxableAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-gray-600">₹{inv.totalTax?.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-black text-[#0D3B2E]">₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleDownloadPdf('invoice', inv.id, inv.invoiceNumber)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1"
                          >
                            <Download className="w-3 h-3 text-[#0D3B2E]" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: BUYERS DIRECTORY */}
          {activeTab === 'buyers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Registered Buyers Directory</h2>
                <p className="text-xs text-slate-500">Exporters, wholesalers, and institutional buyers verified on the platform.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-3.5">Company Name</th>
                      <th className="p-3.5">Contact Person</th>
                      <th className="p-3.5">Phone & Email</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">GSTIN</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(buyers || []).map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{b.companyName}</td>
                        <td className="p-3.5 font-medium">{b.fullName}</td>
                        <td className="p-3.5 text-gray-600">
                          {b.phone}
                          <span className="text-[10px] text-gray-400 block">{b.email}</span>
                        </td>
                        <td className="p-3.5 text-gray-600">{b.city}, {b.state}</td>
                        <td className="p-3.5 font-mono">{b.gstin || 'N/A'}</td>
                        <td className="p-3.5"><span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{b.businessType}</span></td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            {b.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: SELLERS & MILLS */}
          {activeTab === 'sellers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Rice Millers & Suppliers Directory</h2>
                <p className="text-xs text-slate-500">Verified rice milling plants, milling capacity, and locations.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600">
                    <tr>
                      <th className="p-3.5">Mill Name</th>
                      <th className="p-3.5">Company & Owner</th>
                      <th className="p-3.5">Phone & Email</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Capacity (MT/Day)</th>
                      <th className="p-3.5">GSTIN</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(sellers || []).map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-[#0D3B2E]">{s.millName}</td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          {s.companyName}
                          <span className="text-[10px] text-gray-500 block">{s.fullName}</span>
                        </td>
                        <td className="p-3.5 text-gray-600">
                          {s.phone}
                          <span className="text-[10px] text-gray-400 block">{s.email}</span>
                        </td>
                        <td className="p-3.5 text-gray-600">{s.city}, {s.state}</td>
                        <td className="p-3.5 font-bold text-slate-800">{s.millCapacityMTPerDay} MT</td>
                        <td className="p-3.5 font-mono">{s.gstin || 'N/A'}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            {s.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: EXCEL EXPORTS */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Export Operational Registers (Excel / XLSX)</h2>
                <p className="text-xs text-slate-500">Download formatted multi-column spreadsheets for tax audits and internal accounting.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { name: 'Purchase Orders & Brokerage', key: 'orders', desc: 'All confirmed orders, agreed rates, goods value, and earned commission' },
                  { name: 'Rice Stock Inventory', key: 'inventory', desc: 'Full inventory register including mill identities, stock quantities, and prices' },
                  { name: 'Registered Buyers Directory', key: 'buyers', desc: 'Complete verified purchaser registry with GSTIN and phone numbers' },
                  { name: 'Registered Mills Directory', key: 'sellers', desc: 'Complete rice mill registry with capacities and dispatch locations' },
                  { name: 'Payments & UTR Register', key: 'payments', desc: 'All incoming RTGS, NEFT, and brokerage payment records' },
                  { name: 'Transport & Logistics Records', key: 'transport', desc: 'All bilty (LR) numbers, vehicle numbers, and freight charges' },
                ].map(item => (
                  <div key={item.key} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-[#0D3B2E] font-bold text-sm mb-1">
                        <FileSpreadsheet className="w-4 h-4 text-[#C5A059]" />
                        <span>{item.name}</span>
                      </div>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleExportExcel(item.key)}
                      className="w-full bg-[#0D3B2E] hover:bg-[#166534] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Download XLSX Report</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: IMMUTABLE AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">Immutable Security & Business Audit Trail</h2>
                <p className="text-xs text-slate-500">Cryptographically verifiable event log of all price changes, contract issuances, and user actions.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-600 font-sans">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Entity</th>
                      <th className="p-3.5">Details</th>
                      <th className="p-3.5">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {(auditLogs || []).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 text-gray-500">{new Date(log.timestamp || Date.now()).toLocaleString('en-IN')}</td>
                        <td className="p-3 font-bold text-amber-700">{log.userRole || 'SYSTEM'}</td>
                        <td className="p-3 font-bold text-[#0D3B2E]">{log.action}</td>
                        <td className="p-3 text-slate-600">{log.entityType} ({log.entityId})</td>
                        <td className="p-3 text-slate-800 font-sans">{log.details}</td>
                        <td className="p-3 text-gray-400">{log.ipAddress || '127.0.0.1'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Generate Official PO from Negotiation */}
      {selectedNegForPo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-[#0D3B2E]">Issue Official Purchase Order</h3>
            <p className="text-xs text-slate-600">
              Generating official contract for <strong>{selectedNegForPo.agreedQuantityMT} MT</strong> at <strong>₹{selectedNegForPo.finalAgreedPrice}/Qtl</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Dispatch Yard / Mill Origin</label>
                <input
                  type="text"
                  value={newPoForm.dispatchLocation}
                  onChange={e => setNewPoForm({ ...newPoForm, dispatchLocation: e.target.value })}
                  placeholder="e.g. Taraori Mill Depot, Karnal"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Buyer Delivery Destination</label>
                <input
                  type="text"
                  value={newPoForm.deliveryLocation}
                  onChange={e => setNewPoForm({ ...newPoForm, deliveryLocation: e.target.value })}
                  placeholder="e.g. Royal Feast CFS Yard, New Delhi"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={newPoForm.paymentTerms}
                  onChange={e => setNewPoForm({ ...newPoForm, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedNegForPo(null)}
                className="w-1/3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleIssuePo(selectedNegForPo)}
                className="w-2/3 py-2 text-xs font-bold bg-[#0D3B2E] text-white rounded-xl hover:bg-[#166534]"
              >
                Confirm & Issue PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
