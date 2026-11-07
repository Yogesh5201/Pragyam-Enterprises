import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const viewport: Viewport = {
  themeColor: '#0D3B2E',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PRAGYAM ENTERPRISES | Rice Brokerage & Trading Management Platform',
  description: 'Confidential, Intermediary-Controlled Rice Brokerage & Trading Platform for Rice Millers, Exporters, and Institutional Buyers.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 antialiased selection:bg-[#C5A059] selection:text-[#0D3B2E]">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
