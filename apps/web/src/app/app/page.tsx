'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  ShieldCheck,
  Wheat,
  Search,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  Package,
  Truck,
  ArrowRight,
  Sparkles,
  Download,
  QrCode,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  Building2,
  Calendar,
  MapPin,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  User,
  Share2
} from 'lucide-react';
import { RiceCategory, RiceClassification } from '@pragyam/types';

export default function MobileAppShowcasePage() {
  // Mobile Simulator State
  const [activeRole, setActiveRole] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [mobileTab, setMobileTab] = useState<'stock' | 'requirements' | 'orders' | 'dispatch' | 'profile'>('stock');
  const [deviceType, setDeviceType] = useState<'ios' | 'android'>('ios');
  const [simLanguage, setSimLanguage] = useState<'en' | 'hi'>('en');

  // Interactive In-App States
  const [selectedStockForEnquiry, setSelectedStockForEnquiry] = useState<any | null>(null);
  const [enquiryQuantity, setEnquiryQuantity] = useState('50');
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [newStockVariety, setNewStockVariety] = useState('1121 Golden Sella Basmati');
  const [newStockMT, setNewStockMT] = useState('300');
  const [newStockPrice, setNewStockPrice] = useState('8300');
  const [stockAddedSuccess, setStockAddedSuccess] = useState(false);

  // In-app sample stock
  const [simListings, setSimListings] = useState([
    {
      id: 'PRG-1025',
      variety: '1121 Golden Sella Basmati',
      category: 'Golden Sella Rice',
      volumeMT: 250,
      pricePerQtl: 8200,
      grainLength: '8.35 mm',
      moisture: '12.0%',
      broken: '1.0%',
      sortex: true,
      location: 'Karnal, Haryana',
      crop: '2025-2026'
    },
    {
      id: 'PRG-1026',
      variety: '1509 Steam Basmati',
      category: 'Steam Rice',
      volumeMT: 400,
      pricePerQtl: 7400,
      grainLength: '8.40 mm',
      moisture: '12.2%',
      broken: '1.5%',
      sortex: true,
      location: 'Taraori, Haryana',
      crop: '2025-2026'
    },
    {
      id: 'PRG-1028',
      variety: 'Sona Masoori Raw Rice',
      category: 'Raw Rice',
      volumeMT: 350,
      pricePerQtl: 5200,
      grainLength: '5.20 mm',
      moisture: '11.8%',
      broken: '2.0%',
      sortex: true,
      location: 'Gondia, Maharashtra',
      crop: '2024-2025'
    }
  ]);

  const handleSimEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setSelectedStockForEnquiry(null);
    }, 2000);
  };

  const handleSimAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `PRG-${Math.floor(1000 + Math.random() * 9000)}`,
      variety: newStockVariety,
      category: 'Golden Sella Rice',
      volumeMT: Number(newStockMT),
      pricePerQtl: Number(newStockPrice),
      grainLength: '8.30 mm',
      moisture: '12.0%',
      broken: '1.0%',
      sortex: true,
      location: 'Karnal Depot',
      crop: '2025-2026'
    };
    setSimListings([newEntry, ...simListings]);
    setStockAddedSuccess(true);
    setTimeout(() => {
      setStockAddedSuccess(false);
      setIsAddStockOpen(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      {/* Header Overview */}
      <div className="max-w-7xl mx-auto space-y-4 mb-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#C5A059]/20 border border-[#C5A059]/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300 mb-2">
              <Smartphone className="w-4 h-4 text-[#C5A059]" />
              <span>Native Mobile Platform (Android & iOS)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Pragyam Enterprises <span className="text-[#C5A059]">Mobile App</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              Complete, production-ready React Native / Expo application engineered for commercial rice millers and bulk grain buyers. Full feature parity with the web platform under strict intermediary confidentiality.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <span>Back to Web Catalog</span>
            </Link>
            <a
              href="#download-section"
              className="bg-[#C5A059] hover:bg-amber-400 text-[#0D3B2E] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Get APK / Install</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Phone Simulator (Left) + Architecture & Downloads (Right) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Interactive Mobile Device Simulator */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {/* Simulator Toolbar Controls */}
          <div className="w-full max-w-[390px] mb-4 bg-slate-800 p-2.5 rounded-2xl border border-slate-700 flex items-center justify-between text-xs">
            {/* Role Switcher */}
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700">
              <button
                onClick={() => {
                  setActiveRole('BUYER');
                  setMobileTab('stock');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                  activeRole === 'BUYER' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Buyer App
              </button>
              <button
                onClick={() => {
                  setActiveRole('SELLER');
                  setMobileTab('stock');
                }}
                className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                  activeRole === 'SELLER' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Miller App
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-700 text-[11px]">
              <button
                onClick={() => setSimLanguage('en')}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  simLanguage === 'en' ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                EN
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setSimLanguage('hi')}
                className={`px-1.5 py-0.5 rounded font-bold ${
                  simLanguage === 'hi' ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Device Switcher */}
            <button
              onClick={() => setDeviceType(deviceType === 'ios' ? 'android' : 'ios')}
              className="text-[11px] text-slate-300 hover:text-amber-300 font-bold px-2 py-1 rounded-lg bg-slate-900 border border-slate-700"
            >
              {deviceType === 'ios' ? 'iPhone 15' : 'Android'}
            </button>
          </div>

          {/* Smartphone Hardware Frame (Responsive: Native full-screen on mobile, mockup on desktop) */}
          <div
            className={`w-full max-w-[420px] md:h-[780px] h-[85vh] bg-black md:rounded-[48px] rounded-2xl md:p-3.5 p-0 shadow-2xl relative md:border-4 ${
              deviceType === 'ios' ? 'border-[#383838]' : 'border-[#1E293B]'
            } ring-1 ring-white/20`}
          >
            {/* Phone Screen Glass */}
            <div className="w-full h-full bg-[#FAF9F6] text-slate-900 md:rounded-[38px] rounded-2xl overflow-hidden flex flex-col relative select-none">
              {/* Dynamic Island / Camera Notch (Desktop Preview) */}
              <div className="hidden md:flex bg-[#0D3B2E] text-white pt-2 px-6 pb-2 items-center justify-between text-xs z-20">
                <span className="font-bold text-[11px]">19:50</span>

                {/* Dynamic Island Pill */}
                <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>

                <div className="flex items-center space-x-1.5 text-[10px]">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* In-App Header Bar */}
              <div className="bg-[#0D3B2E] text-white px-4 py-2.5 flex items-center justify-between shadow-md border-b border-[#C5A059]/30 z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C5A059] flex items-center justify-center text-[#0D3B2E]">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-xs leading-none block">PRAGYAM</span>
                    <span className="text-[9px] text-[#C5A059] font-bold uppercase tracking-wider block">
                      {activeRole === 'BUYER'
                        ? simLanguage === 'hi'
                          ? 'क्रेता प्रोक्योरमेंट'
                          : 'Buyer Procurement'
                        : simLanguage === 'hi'
                        ? 'मिलर इन्वेंट्री'
                        : 'Miller Supply'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] bg-white/10 text-amber-200 px-2 py-0.5 rounded-full border border-white/10 font-bold">
                    {activeRole === 'BUYER' ? 'Buyer Mode' : 'Miller Mode'}
                  </span>
                </div>
              </div>

              {/* In-App Body (Scrollable Screen) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {/* 1. STOCK TAB (BUYER & SELLER) */}
                {mobileTab === 'stock' && (
                  <>
                    {/* Mode Header Banner */}
                    <div className="bg-gradient-to-r from-[#0D3B2E] to-[#166534] p-3 rounded-2xl text-white shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#C5A059] font-black uppercase tracking-wider block">
                          {activeRole === 'BUYER' ? 'CONFIDENTIAL DIRECTORY' : 'MILL INVENTORY DESK'}
                        </span>
                        <h3 className="text-sm font-black">
                          {activeRole === 'BUYER' ? 'Verified Mill Rice Stock' : 'Active Mill Lots'}
                        </h3>
                      </div>
                      {activeRole === 'SELLER' && (
                        <button
                          onClick={() => setIsAddStockOpen(true)}
                          className="bg-[#C5A059] text-[#0D3B2E] px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1 shadow"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add Stock</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search variety, 1121, Sella..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] outline-none shadow-sm"
                        readOnly
                      />
                    </div>

                    {/* Stock Cards List */}
                    <div className="space-y-2.5">
                      {simListings.map(item => (
                        <div
                          key={item.id}
                          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#0D3B2E] bg-amber-100/80 px-2 py-0.5 rounded-full border border-[#C5A059]/40">
                              {item.id}
                            </span>
                            {item.sortex && (
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                                100% Sortex
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase block">
                              {item.category}
                            </span>
                            <h4 className="text-xs font-black text-slate-800 leading-tight">
                              {item.variety}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2 rounded-xl">
                            <div>
                              <span className="text-gray-500 block">Rate:</span>
                              <span className="font-extrabold text-[#0D3B2E]">₹{item.pricePerQtl}/Qtl</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Volume:</span>
                              <span className="font-extrabold text-slate-800">{item.volumeMT} MT</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Length:</span>
                              <span className="font-bold text-slate-700">{item.grainLength}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Moisture:</span>
                              <span className="font-bold text-slate-700">{item.moisture}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          {activeRole === 'BUYER' ? (
                            <button
                              onClick={() => setSelectedStockForEnquiry(item)}
                              className="w-full bg-[#0D3B2E] hover:bg-[#166534] text-white py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 shadow-sm transition"
                            >
                              <span>Submit Trade Enquiry</span>
                              <ArrowRight className="w-3 h-3 text-[#C5A059]" />
                            </button>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                              <span>Origin: {item.location}</span>
                              <span className="text-emerald-700 font-bold">Published</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* 2. REQUIREMENTS TAB (BUYER) */}
                {mobileTab === 'requirements' && (
                  <div className="space-y-3">
                    <div className="bg-[#0D3B2E] p-3 rounded-2xl text-white">
                      <span className="text-[10px] text-[#C5A059] font-bold block">PURCHASE BROADCAST</span>
                      <h3 className="text-xs font-black">My Purchase Requirements</h3>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        Broadcast your grain specs to verified mills via Pragyam Broker Desk.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">ACTIVE RFQ</span>
                        <span className="text-gray-400">Req #REQ-8821</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900">1121 Golden Sella Basmati</h4>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                        <span>Quantity: <strong>100 MT</strong></span>
                        <span>Target: <strong>₹8,100/Qtl</strong></span>
                        <span>Moisture: <strong>&lt; 12.0%</strong></span>
                        <span>Delivery: <strong>Delhi Hub</strong></span>
                      </div>
                      <div className="text-[10px] text-amber-700 font-bold flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Matching Mill Stock in Progress</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ORDERS TAB */}
                {mobileTab === 'orders' && (
                  <div className="space-y-3">
                    <div className="bg-[#0D3B2E] p-3 rounded-2xl text-white">
                      <span className="text-[10px] text-[#C5A059] font-bold block">OFFICIAL CONTRACTS</span>
                      <h3 className="text-xs font-black">Confirmed Purchase Orders</h3>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-black text-[#0D3B2E]">PO-2026-9042</span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          DISPATCHED
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900">1509 Steam Basmati (100 MT)</h4>
                      <p className="text-[10px] text-slate-500">Contract Total: ₹74,00,000</p>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500">
                          <span>PO Issued</span>
                          <span>Loading</span>
                          <span className="text-emerald-700 font-black">In Transit</span>
                          <span>Delivered</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full w-3/4 rounded-full" />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => alert('Downloading official stamped Purchase Order PDF...')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1"
                        >
                          <Download className="w-3 h-3 text-[#0D3B2E]" />
                          <span>Download PO PDF</span>
                        </button>
                        <span className="text-[9px] text-slate-400">SAC 998319</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DISPATCH TAB */}
                {mobileTab === 'dispatch' && (
                  <div className="space-y-3">
                    <div className="bg-[#0D3B2E] p-3 rounded-2xl text-white">
                      <span className="text-[10px] text-[#C5A059] font-bold block">TRANSPORT RECONCILIATION</span>
                      <h3 className="text-xs font-black">Bilty & Truck Tracker</h3>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-800">
                        <Truck className="w-4 h-4 text-[#0D3B2E]" />
                        <span>Truck: HR-05-AW-8921</span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-[10px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Driver Name:</span>
                          <strong>Gurmeet Singh</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Driver Mobile:</span>
                          <strong>+91 98120 54321</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Bilty / LR Number:</span>
                          <strong className="text-[#0D3B2E]">LR-2026-8819</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>E-Way Bill:</span>
                          <strong>EWB-77192019</strong>
                        </div>
                      </div>

                      <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl text-[10px] font-bold border border-emerald-200">
                        ✓ Dispatched from Karnal Depot ➔ In Transit to Kandla CFS
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PROFILE TAB */}
                {mobileTab === 'profile' && (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-[#0D3B2E] text-[#C5A059] flex items-center justify-center font-black text-sm mx-auto shadow-md">
                        {activeRole === 'BUYER' ? 'RF' : 'TM'}
                      </div>
                      <h3 className="text-xs font-black text-slate-900">
                        {activeRole === 'BUYER' ? 'Royal Feast Global Exports' : 'Taraori Rice Mills Ltd.'}
                      </h3>
                      <span className="text-[10px] bg-amber-100 text-[#0D3B2E] px-2 py-0.5 rounded-full font-bold">
                        {activeRole === 'BUYER' ? 'Authorized Bulk Purchaser' : 'Verified Rice Milling Facility'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                        <span>Commercial GSTIN:</span>
                        <strong className="text-slate-900">06AAACR5421K1ZB</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                        <span>Trade Assurance:</span>
                        <strong className="text-emerald-700">100% Intermediary Protected</strong>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600">
                        <span>Central Broker:</span>
                        <strong className="text-[#0D3B2E]">Pragyam Enterprises</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* In-App Interactive Enquiry Modal (When buyer taps enquiry) */}
              {selectedStockForEnquiry && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-end">
                  <div className="bg-white w-full rounded-t-3xl p-4 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[9px] font-black text-[#C5A059] uppercase block">Trade Enquiry</span>
                        <h4 className="text-xs font-black text-[#0D3B2E]">{selectedStockForEnquiry.variety}</h4>
                      </div>
                      <button
                        onClick={() => setSelectedStockForEnquiry(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>

                    {enquirySuccess ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h5 className="text-xs font-black">Trade Enquiry Sent!</h5>
                        <p className="text-[10px] text-emerald-700">
                          Routed to Pragyam Central Broker Desk. A commercial agent will confirm pricing.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSimEnquirySubmit} className="space-y-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-1">
                            Requested Volume (Metric Tonnes)
                          </label>
                          <input
                            type="number"
                            value={enquiryQuantity}
                            onChange={e => setEnquiryQuantity(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                            required
                          />
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Mill Asking Rate:</span>
                            <span className="font-bold">₹{selectedStockForEnquiry.pricePerQtl}/Qtl</span>
                          </div>
                          <div className="flex justify-between text-[#0D3B2E] font-extrabold">
                            <span>Approx. Deal Value:</span>
                            <span>₹{((Number(enquiryQuantity) || 0) * selectedStockForEnquiry.pricePerQtl * 10).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#0D3B2E] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                          Submit to Pragyam Broker Desk
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* In-App Interactive Add Stock Modal (For Miller) */}
              {isAddStockOpen && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-end">
                  <div className="bg-white w-full rounded-t-3xl p-4 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[9px] font-black text-[#C5A059] uppercase block">Miller Inventory</span>
                        <h4 className="text-xs font-black text-[#0D3B2E]">Publish Mill Lot</h4>
                      </div>
                      <button
                        onClick={() => setIsAddStockOpen(false)}
                        className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>

                    {stockAddedSuccess ? (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h5 className="text-xs font-black">Stock Published!</h5>
                        <p className="text-[10px] text-emerald-700">
                          Now listed in Pragyam anonymous directory for verified buyers.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSimAddStock} className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Rice Variety</label>
                          <input
                            type="text"
                            value={newStockVariety}
                            onChange={e => setNewStockVariety(e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Quantity (MT)</label>
                            <input
                              type="number"
                              value={newStockMT}
                              onChange={e => setNewStockMT(e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Price (₹/Qtl)</label>
                            <input
                              type="number"
                              value={newStockPrice}
                              onChange={e => setNewStockPrice(e.target.value)}
                              className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#0D3B2E] text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                        >
                          Publish to Directory
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Native In-App Bottom Tab Bar */}
              <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-between text-slate-500 z-10">
                <button
                  onClick={() => setMobileTab('stock')}
                  className={`flex flex-col items-center space-y-0.5 transition ${
                    mobileTab === 'stock' ? 'text-[#0D3B2E] font-black' : 'hover:text-slate-800'
                  }`}
                >
                  <Wheat className="w-4 h-4" />
                  <span className="text-[9px]">Stock</span>
                </button>

                {activeRole === 'BUYER' ? (
                  <button
                    onClick={() => setMobileTab('requirements')}
                    className={`flex flex-col items-center space-y-0.5 transition ${
                      mobileTab === 'requirements' ? 'text-[#0D3B2E] font-black' : 'hover:text-slate-800'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-[9px]">Requirements</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddStockOpen(true)}
                    className="flex flex-col items-center space-y-0.5 text-amber-700 font-bold"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-[9px]">Add Stock</span>
                  </button>
                )}

                <button
                  onClick={() => setMobileTab('orders')}
                  className={`flex flex-col items-center space-y-0.5 transition ${
                    mobileTab === 'orders' ? 'text-[#0D3B2E] font-black' : 'hover:text-slate-800'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span className="text-[9px]">Orders</span>
                </button>

                <button
                  onClick={() => setMobileTab('dispatch')}
                  className={`flex flex-col items-center space-y-0.5 transition ${
                    mobileTab === 'dispatch' ? 'text-[#0D3B2E] font-black' : 'hover:text-slate-800'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span className="text-[9px]">Bilty/LR</span>
                </button>

                <button
                  onClick={() => setMobileTab('profile')}
                  className={`flex flex-col items-center space-y-0.5 transition ${
                    mobileTab === 'profile' ? 'text-[#0D3B2E] font-black' : 'hover:text-slate-800'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="text-[9px]">Profile</span>
                </button>
              </div>

              {/* Phone Home Bar Indicator */}
              <div className="bg-white pb-2 flex justify-center">
                <div className="w-32 h-1 bg-slate-300 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Architecture, Features & APK Download Hub */}
        <div id="download-section" className="lg:col-span-6 space-y-8">
          {/* Card 1: Native Mobile Capabilities */}
          <div className="bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#C5A059] flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Full-Stack Mobile Architecture</h3>
                <span className="text-xs text-slate-400">React Native • Expo 51+ • TypeScript</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confidentiality Engine</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Mobile DTO sanitization strips mill contact information before network responses reach the phone.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold">
                  <Truck className="w-4 h-4" />
                  <span>Real-Time Bilty & GPS</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Truck number verification, driver contact, and dispatch milestones from mill to export port.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 font-bold">
                  <FileText className="w-4 h-4" />
                  <span>Offline Stamped PDF POs</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  One-tap download and offline viewing of official broker purchase orders with AGMARK specs.
                </p>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Bilingual Interface</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Complete native localization in English and Hindi (हिंदी) across all trading flows.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Android APK & Expo QR Code */}
          <div className="bg-gradient-to-br from-[#0D3B2E] via-[#062018] to-[#0D3B2E] p-6 sm:p-8 rounded-3xl border border-[#C5A059]/40 space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-bold text-[#C5A059] uppercase tracking-wider block mb-1">
                BUILD & DISTRIBUTION HUB
              </span>
              <h3 className="text-2xl font-black text-white">Get the App on Your Phone</h3>
              <p className="text-xs text-gray-300 mt-1">
                Choose your deployment method below to test on Android or iOS physical devices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Preview APK */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                  <Download className="w-4 h-4" />
                  <span>Android APK Package</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Direct standalone release APK built for Android 8.0 through Android 15 (Target SDK 34/35).
                </p>
                <div className="bg-black/30 p-2 rounded-xl text-[10px] font-mono text-emerald-300 break-all">
                  com.pragyam.enterprises
                </div>
                <a
                  href="/downloads/Pragyam_Enterprises_v1.0.0.apk"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Pragyam Enterprises Preview APK package downloaded. Install via adb install or transfer to device.');
                  }}
                  className="w-full bg-[#C5A059] hover:bg-amber-400 text-[#0D3B2E] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK (Release)</span>
                </a>
              </div>

              {/* Option B: Expo Go */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>Expo Go Development</span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Run the live Metro bundler on your local machine and scan with Expo Go on your mobile camera.
                </p>
                <div className="bg-black/30 p-2 rounded-xl text-[10px] font-mono text-amber-200">
                  npm run dev:mobile
                </div>
                <div className="w-full bg-white/10 text-white py-2 px-3 rounded-xl text-xs font-bold text-center border border-white/20">
                  Metro Port: 8081 / QR Active
                </div>
              </div>
            </div>

            {/* CLI Build Command Reference */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#C5A059] uppercase block">
                Production Cloud Build (EAS CLI)
              </span>
              <code className="text-xs font-mono text-emerald-300 block">
                eas build --platform android --profile production
              </code>
              <p className="text-[11px] text-gray-400">
                Generates a production AAB bundle signed with the Pragyam release keystore for Google Play Store console upload.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}