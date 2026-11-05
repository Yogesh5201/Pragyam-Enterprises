'use client';

import React from 'react';
import Link from 'next/link';
import { Wheat, ShieldCheck, MapPin, Phone, Mail, Award, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Footer() {
  const { t } = useAuth();

  return (
    <footer className="bg-[#062018] text-gray-300 border-t border-[#C5A059]/20 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#C5A059] flex items-center justify-center text-[#0D3B2E]">
                <Wheat className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                PRAGYAM <span className="text-[#C5A059]">ENTERPRISES</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              India's premier confidential agricultural trading intermediary. Empowering rice millers, exporters, and institutional buyers with structured contracts, quality compliance, and assured settlements.
            </p>
            <div className="flex items-center space-x-2 text-xs text-amber-300 font-semibold bg-[#0D3B2E] p-2.5 rounded-lg border border-[#C5A059]/30">
              <Lock className="w-4 h-4 text-[#C5A059]" />
              <span>100% Intermediary Privacy Guaranteed</span>
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Trade Classifications
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>1121 Golden Sella & Raw Basmati</li>
              <li>1509 Steam & Sella Basmati</li>
              <li>1401 & 1718 Traditional Basmati</li>
              <li>Sugandha & Sharbati Non-Basmati</li>
              <li>Sona Masoori Naturally Aged Crop</li>
              <li>PR14 & IR64 Parboiled Rice</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#C5A059] transition">
                  Anonymous Stock Directory
                </Link>
              </li>
              <li>
                <Link href="/buyer/dashboard" className="hover:text-[#C5A059] transition">
                  Buyer Procurement Desk
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-[#C5A059] transition">
                  Rice Mill Supply Management
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-amber-300 hover:text-white transition flex items-center space-x-1 font-bold">
                  <span>📱 Pragyam Mobile App (Android/iOS)</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-amber-300 transition flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Central Broker Administration</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Brokerage Headquarters */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Registered Desk
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <span>G.T. Road, Near Grain Market Hub, Karnal, Haryana - 132001, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>+91 98120 00000 / Desk: 0184-220000</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>desk@pragyam.com</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-2 border-t border-white/5">
                GSTIN: 06AAACP1234F1Z8 | Brokerage SAC: 998319
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PRAGYAM ENTERPRISES. {t.allRightsReserved}</p>
          <p className="mt-2 sm:mt-0 text-[11px] text-gray-400">
            Grain quality parameters conform to AGMARK & Indian Rice Millers Trade Standards.
          </p>
        </div>
      </div>
    </footer>
  );
}
