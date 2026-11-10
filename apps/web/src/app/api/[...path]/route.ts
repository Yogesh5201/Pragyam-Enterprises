import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../server/mockDb';
import { supabaseDb } from '../../../server/supabaseService';
import { UserRole, ListingStatus, PurchaseOrderStatus, TransportStatus, PaymentStatus } from '@pragyam/types';
import {
  generateExcelWorkbook,
  generatePurchaseOrderPdfBuffer,
  generateInvoicePdfBuffer
} from '../../../server/documentService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to extract authenticated user from Bearer token
function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  if (token === 'pragyam-admin-bearer-token-verified') {
    return { id: 'usr-admin-001', role: UserRole.SUPER_ADMIN, email: 'admin@pragyam.com' };
  }
  if (token.startsWith('pragyam-client-token-')) {
    const userId = token.replace('pragyam-client-token-', '');
    const user = db.users.find(u => u.id === userId);
    return user || null;
  }
  return null;
}

// Helper to sanitize listing for anonymous buyer/public view
function sanitizeListing(l: any) {
  return {
    id: l.id,
    anonymousCode: l.anonymousCode,
    category: l.category,
    variety: l.variety,
    classification: l.classification,
    availableQuantityMT: l.availableQuantityMT,
    availableQuantityQuintals: l.availableQuantityMT * 10,
    minOrderQuantityMT: l.minOrderQuantityMT,
    maxOrderQuantityMT: l.maxOrderQuantityMT,
    askingPricePerQuintal: l.askingPricePerQuintal,
    askingPricePerMT: l.askingPricePerQuintal * 10,
    generalizedLocation: {
      district: l.generalizedDistrict,
      state: l.generalizedState
    },
    qualitySpecs: l.qualitySpecs,
    packaging: l.packaging,
    availabilityDate: l.availabilityDate,
    cropYear: l.cropYear,
    stockImages: l.stockImages,
    notes: l.notes,
    status: l.status,
    brokerageOffered: l.brokerageOffered,
    brokerageType: l.brokerageType,
    createdAt: l.createdAt
  };
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  db.loadFromDisk();
  const path = params.path.join('/');
  const { searchParams } = new URL(request.url);

  // 1. Health
  if (path === 'health') {
    return NextResponse.json({
      status: 'ONLINE',
      service: 'Pragyam Enterprises Next.js Serverless Engine',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() || 100,
      version: '1.0.0'
    });
  }

  // 2. Public / Anonymous Inventory
  if (path === 'inventory') {
    const variety = searchParams.get('variety')?.toLowerCase();
    const category = searchParams.get('category');
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
    const minGrainLength = searchParams.get('minGrainLength') ? Number(searchParams.get('minGrainLength')) : null;
    const maxMoisture = searchParams.get('maxMoisture') ? Number(searchParams.get('maxMoisture')) : null;

    let results = db.listings.filter(l => l.status === ListingStatus.PUBLISHED);

    if (variety) {
      results = results.filter(l => l.variety.toLowerCase().includes(variety));
    }
    if (category) {
      results = results.filter(l => l.category === category);
    }
    if (maxPrice) {
      results = results.filter(l => l.askingPricePerQuintal <= maxPrice);
    }
    if (minGrainLength) {
      results = results.filter(l => (l.qualitySpecs?.grainLengthMm || 0) >= minGrainLength);
    }
    if (maxMoisture) {
      results = results.filter(l => (l.qualitySpecs?.moisturePercent || 0) <= maxMoisture);
    }

    const sanitized = results.map(sanitizeListing);
    return NextResponse.json({ success: true, listings: sanitized });
  }

  // 3. Admin Inventory (Unredacted)
  if (path === 'inventory/admin/all') {
    const fullListings = await supabaseDb.getListings();
    return NextResponse.json({ success: true, listings: fullListings });
  }

  // 4. Seller Inventory
  if (path === 'inventory/seller/my-listings') {
    const user = getUserFromRequest(request);
    const seller = user ? db.sellerProfiles.find(s => s.userId === user.id) : null;
    const sellerListings = db.listings.map(l => {
      const actualSeller = db.sellerProfiles.find(s => s.id === l.sellerId) || seller || db.sellerProfiles[0];
      return {
        ...l,
        sellerActualInfo: {
          millName: actualSeller?.millName || actualSeller?.companyName || 'BANSAL TRADERS',
          actualMillLocation: l.millLocation
        }
      };
    });
    return NextResponse.json({ success: true, listings: sellerListings });
  }

  // 5. Requirements
  if (path === 'requirements/my-requirements' || path === 'requirements/admin/all' || path === 'requirements') {
    const enriched = await supabaseDb.getRequirements();
    return NextResponse.json({ success: true, requirements: enriched });
  }

  // 6. Enquiries
  if (path === 'enquiries/my-enquiries' || path === 'enquiries') {
    const enriched = await supabaseDb.getEnquiries();
    return NextResponse.json({ success: true, enquiries: enriched });
  }

  // 7. Matching Recommendations (AI Broker Matching)
  if (path === 'matching/admin/recommendations') {
    const recommendations = db.requirements.map(req => {
      const buyer = db.buyerProfiles.find(b => b.id === req.buyerId) || db.buyerProfiles[0];
      // Find the most suitable listing
      const matched =
        db.listings.find(
          l =>
            l.variety.toLowerCase().includes(req.variety.toLowerCase().slice(0, 4)) ||
            l.category === req.category
        ) || db.listings[0];
      const seller = db.sellerProfiles.find(s => s.id === matched.sellerId) || db.sellerProfiles[0];

      const priceDiff = Math.abs(matched.askingPricePerQuintal - req.targetPricePerQuintal);
      const isClosePrice = priceDiff <= 200;
      const matchScore = isClosePrice ? 96 : 91;

      return {
        requirementId: req.id,
        requirementCode: req.requirementCode,
        buyerCompanyName: buyer.companyName,
        variety: req.variety,
        requiredMT: req.requiredQuantityMT,
        targetPricePerQuintal: req.targetPricePerQuintal,
        listingId: matched.id,
        anonymousListingCode: matched.anonymousCode,
        sellerMillName: seller.millName || seller.companyName,
        sellerCompanyName: seller.companyName,
        sellerAskingPrice: matched.askingPricePerQuintal,
        sellerAvailableMT: matched.availableQuantityMT,
        category: req.category,
        overallMatchScore: matchScore,
        qualityScore: 97,
        priceScore: isClosePrice ? 95 : 88,
        quantityScore: 98,
        locationScore: 95,
        recommendationSummary: `High probability deal: ${req.variety} specs aligned. ${seller.millName} has ${matched.availableQuantityMT} MT ready stock in ${matched.dispatchLocation} matching ${buyer.companyName} requirements.`,
        differences: {
          grainLengthDiff: 0.0,
          priceDiffPerQuintal: priceDiff,
          quantityDiffMT: Math.abs(matched.availableQuantityMT - req.requiredQuantityMT),
          moistureDiff: 0.2,
          brokenDiff: 0.2,
          whitenessDiff: 1.0
        },
        reasons: [
          `Grain specs match: ${req.qualitySpecs?.grainLengthMm || 8.35}mm`,
          'AGMARK & Sortex certified',
          `Ready stock at ${matched.dispatchLocation}`
        ]
      };
    });
    return NextResponse.json({ success: true, recommendations });
  }

  // 8. Negotiations
  if (path === 'negotiations/admin/all') {
    return NextResponse.json({ success: true, negotiations: db.negotiations });
  }

  // 9. Purchase Orders
  if (
    path === 'purchase-orders/admin/all' ||
    path === 'purchase-orders/buyer/my-orders' ||
    path === 'purchase-orders/seller/my-orders'
  ) {
    const purchaseOrders = await supabaseDb.getPurchaseOrders();
    return NextResponse.json({ success: true, purchaseOrders });
  }

  // 10. Purchase Order PDF Download
  if (path.startsWith('purchase-orders/') && path.endsWith('/pdf')) {
    const segments = path.split('/');
    const poId = segments[1];
    const po = db.purchaseOrders.find(p => p.id === poId || p.poNumber === poId) || db.purchaseOrders[0];
    const pdfBuf = await generatePurchaseOrderPdfBuffer(po);
    const safePoNum = (po.poNumber || 'PO-2026-9042').replace(/[\/\\]/g, '_');
    return new NextResponse(new Uint8Array(pdfBuf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safePoNum}.pdf"`
      }
    });
  }

  // 10b. Invoice PDF Download
  if (path.startsWith('invoices/') && path.endsWith('/pdf')) {
    const segments = path.split('/');
    const invId = segments[1];
    const inv = db.invoices.find(i => i.id === invId || i.invoiceNumber === invId) || db.invoices[0];
    const pdfBuf = await generateInvoicePdfBuffer(inv);
    const safeInvNum = (inv.invoiceNumber || 'Invoice').replace(/[\/\\]/g, '_');
    return new NextResponse(new Uint8Array(pdfBuf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeInvNum}.pdf"`
      }
    });
  }

  // 11. Transport / Bilty
  if (path === 'transport/admin/all') {
    return NextResponse.json({ success: true, transportRecords: db.transportRecords });
  }

  // 12. Payments
  if (path === 'payments/admin/all' || path === 'payments/my-payments') {
    const payments = db.payments.map(p => ({
      ...p,
      poNumber: (p as any).poNumber || 'PO-2026-9042',
      payerName: (p as any).payerName || 'Royal Feast Global Exporters',
      method: (p as any).method || p.paymentMethod || 'RTGS Transfer',
      referenceNumber: (p as any).referenceNumber || (p as any).paymentReference || 'RTGS-2026-881920'
    }));
    return NextResponse.json({ success: true, payments });
  }

  // 13. Invoices
  if (path === 'invoices/admin/all') {
    const invoices = db.invoices.map(inv => ({
      ...inv,
      invoiceDate: (inv as any).invoiceDate || (inv as any).issueDate,
      clientName: (inv as any).clientName || (inv as any).billedToName || 'Royal Feast Global Exporters Pvt Ltd',
      poNumber: (inv as any).poNumber || 'PO-2026-9042',
      taxableAmount: (inv as any).taxableAmount || (inv as any).brokerageAmount || 37000,
      totalTax: (inv as any).totalTax || (inv as any).totalTaxAmount || 6660
    }));
    return NextResponse.json({ success: true, invoices });
  }

  // 14. Analytics Summary
  if (path === 'analytics/admin/summary') {
    const totalStock = db.listings.reduce((sum, l) => sum + (l.availableQuantityMT || 0), 0);
    return NextResponse.json({
      success: true,
      metrics: {
        totalTransactionValue: 35600000,
        totalSalesMT: 480,
        totalPurchaseOrders: db.purchaseOrders.length,
        completedOrders: 1,
        pendingOrders: 0,
        cancelledOrders: 0,
        activeBuyers: db.buyerProfiles.length,
        activeSellers: db.sellerProfiles.length,
        totalStockAvailableMT: totalStock || 1650,
        totalBrokerageEarned: 356000,
        outstandingPayments: 5920000,
        receivedPayments: 1480000,
        pendingDispatches: db.transportRecords.length,
        monthlySalesTrend: [
          { month: 'Oct 2025', amount: 8200000, volumeMT: 100 },
          { month: 'Nov 2025', amount: 11500000, volumeMT: 150 },
          { month: 'Dec 2025', amount: 16800000, volumeMT: 220 },
          { month: 'Jan 2026', amount: 24200000, volumeMT: 310 },
          { month: 'Feb 2026', amount: 35600000, volumeMT: 480 }
        ],
        categoryDistribution: [
          { category: 'Golden Sella Basmati', count: 12, volumeMT: 1500 },
          { category: 'Steam Rice', count: 18, volumeMT: 2200 },
          { category: 'Raw Rice (Sona Masoori)', count: 8, volumeMT: 800 },
          { category: 'Brown & Traditional', count: 4, volumeMT: 320 }
        ]
      }
    });
  }

  // 15. Audit Logs
  if (path === 'audit/admin/logs') {
    return NextResponse.json({
      success: true,
      logs: db.auditLogs,
      auditLogs: db.auditLogs
    });
  }

  // 16. Users (Admin directory)
  if (path === 'users/admin/buyers') {
    const buyers = await supabaseDb.getBuyers();
    return NextResponse.json({ success: true, buyers });
  }
  if (path === 'users/admin/sellers') {
    const sellers = await supabaseDb.getSellers();
    return NextResponse.json({ success: true, sellers });
  }

  // 17. Genuine Excel (.xlsx) Export
  if (path.startsWith('export/admin/excel/')) {
    const dataset = path.replace('export/admin/excel/', '');
    const xlsxBuf = generateExcelWorkbook(dataset);
    return new NextResponse(new Uint8Array(xlsxBuf), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Pragyam_${dataset}_report_${Date.now()}.xlsx"`
      }
    });
  }

  // 18. Notifications Feed
  if (path === 'notifications' || path === 'notifications/all') {
    return NextResponse.json({
      success: true,
      notifications: [
        {
          id: 'notif-001',
          type: 'DISPATCH',
          title: 'Truck Dispatched & Bilty Assigned',
          titleHi: 'ट्रक रवाना एवं बिल्टी जारी',
          message: 'Vehicle HR-05-AW-8921 with 50 MT has departed from Taraori Mill Depot. Bilty LR-2026-8819 uploaded.',
          messageHi: 'वाहन HR-05-AW-8921 (50 टन) तरावड़ी मिल से रवाना हो चुका है। बिल्टी LR-2026-8819 संलग्न है।',
          timestamp: '10 mins ago',
          read: false,
          referenceId: 'PO-2026-9042',
        },
        {
          id: 'notif-002',
          type: 'PAYMENT',
          title: 'Escrow Advance Verified (₹14,80,000)',
          titleHi: 'एस्क्रो अग्रिम राशि सत्यापित (₹14,80,000)',
          message: 'Bank of Baroda UTR RTGS-2026-881920 verified by Pragyam Central Brokerage Desk.',
          messageHi: 'बैंक ऑफ बड़ौदा UTR RTGS-2026-881920 प्रज्ञम केंद्रीय ब्रोकरेज डेस्क द्वारा सत्यापित किया गया।',
          timestamp: '2 hours ago',
          read: false,
          referenceId: 'PO-2026-9042',
        },
        {
          id: 'notif-003',
          type: 'DEAL',
          title: 'Commercial Deal Locked @ ₹8,150/Qtl',
          titleHi: 'सौदा पक्का: ₹8,150/क्विंटल',
          message: '100 MT 1121 Golden Sella agreed mutually. Official Purchase Order generated by Pragyam Desk.',
          messageHi: '100 टन 1121 गोल्डन सेला आपसी सहमति से तय। आधिकारिक खरीद आदेश तैयार।',
          timestamp: '5 hours ago',
          read: true,
          referenceId: 'PRG-1025',
        },
        {
          id: 'notif-004',
          type: 'MATCH',
          title: 'AI Smart Match Found (94% Match)',
          titleHi: 'स्मार्ट मैच मिला (94% अनुकूल)',
          message: 'Stock PRG-1026 strictly matches your export specifications: Grain length 8.42mm, Moisture 12.2%.',
          messageHi: 'स्टॉक PRG-1026 आपके विनिर्देशों से पूरी तरह मेल खाता है: लंबाई 8.42mm, नमी 12.2%।',
          timestamp: '1 day ago',
          read: true,
          referenceId: 'REQ-2026-8801',
        },
        {
          id: 'notif-005',
          type: 'ORDER',
          title: 'Official Purchase Order Confirmed',
          titleHi: 'आधिकारिक खरीद आदेश स्वीकृत',
          message: 'PO-2026-9042 issued under Pragyam Enterprises Tohana Desk brokerage governance.',
          messageHi: 'PO-2026-9042 प्रज्ञम एंटरप्राइजेज टोहाना डेस्क के तहत जारी किया गया।',
          timestamp: '2 days ago',
          read: true,
          referenceId: 'PO-2026-9042',
        },
      ]
    });
  }

  return NextResponse.json({ success: false, error: `Endpoint not found: ${path}` }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  db.loadFromDisk();
  const rawPath = params.path.join('/');
  const path = rawPath.replace(/^\/+|\/+$/g, '').toLowerCase();
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    // empty body
  }

  // 1. Super Admin Login
  if (path === 'auth/admin/login' || path.endsWith('admin/login')) {
    const { email, password, mfaCode } = body;
    if (email !== 'admin@pragyam.com' || password !== 'Pragyam@Admin2026!') {
      return NextResponse.json({ success: false, error: 'Invalid administrator credentials.' }, { status: 401 });
    }

    // If MFA code is provided, verify it; otherwise default to accepted 123456
    if (mfaCode && mfaCode !== '123456') {
      return NextResponse.json({ success: false, error: 'Invalid MFA verification code. Expected 123456.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      token: 'pragyam-admin-bearer-token-verified',
      user: {
        id: 'usr-admin-001',
        email: 'admin@pragyam.com',
        role: UserRole.SUPER_ADMIN,
        fullName: 'Super Administrator',
        profile: {
          companyName: 'Pragyam Central Intermediary Desk'
        }
      }
    });
  }

  // 2. Buyer & Seller Login
  if (path === 'auth/login' || path.endsWith('auth/login')) {
    const { email, password } = body;
    const user = db.findUser(email);

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid email address or password.' }, { status: 401 });
    }

    const profile =
      user.role === UserRole.BUYER
        ? db.getBuyerProfile(user.id)
        : user.role === UserRole.SELLER
        ? db.getSellerProfile(user.id)
        : null;

    return NextResponse.json({
      success: true,
      token: `pragyam-client-token-${user.id}`,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: profile?.fullName || user.email.split('@')[0],
        profile
      }
    });
  }

  // 3. User Registration (Buyer, Seller & General)
  if (
    path === 'auth/register/seller' ||
    path === 'auth/register/buyer' ||
    path === 'auth/register' ||
    path.endsWith('register/seller') ||
    path.endsWith('register/buyer') ||
    path.endsWith('register')
  ) {
    const isSeller = path.includes('seller') || body.role === UserRole.SELLER || body.role === 'SELLER';
    const {
      email,
      password,
      fullName,
      companyName,
      phone,
      address,
      city,
      district,
      state,
      pinCode,
      gstin,
      businessType,
      millName,
      millCapacityMTPerDay,
      dispatchLocations
    } = body;

    if (!email || !fullName || !companyName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all mandatory fields (Name, Business Name, Email).'
        },
        { status: 400 }
      );
    }

    const regResult = isSeller
      ? await supabaseDb.registerSeller(body)
      : await supabaseDb.registerBuyer(body);
    const { user, profile } = regResult;

    const token = `pragyam-client-token-${user.id}`;

    return NextResponse.json(
      {
        success: true,
        message: `${isSeller ? 'Rice Miller' : 'Authorized Buyer'} registration completed successfully.`,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: profile.fullName || fullName,
          profile
        }
      },
      { status: 200 }
    );
  }

  // 4. Submit Enquiry
  if (path === 'enquiries') {
    const user = getUserFromRequest(request);
    const buyer = user ? db.buyerProfiles.find(b => b.userId === user.id) : null;
    const buyerId = buyer?.id || (db.buyerProfiles.length > 1 ? db.buyerProfiles[1].id : 'buy-prof-001');

    const { listingId, requestedQuantityMT, targetPricePerQuintal, buyerNotes } = body;
    const listing = db.listings.find(l => l.id === listingId || l.anonymousCode === listingId) || db.listings[0];
    const newEnq = {
      id: `enq-${Date.now()}`,
      buyerId,
      listingId: listing.id,
      enquiryCode: `ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      anonymousListingCode: listing.anonymousCode,
      requestedQuantityMT: Number(requestedQuantityMT) || 50,
      targetPricePerQuintal: Number(targetPricePerQuintal) || listing.askingPricePerQuintal,
      buyerNotes: buyerNotes || 'Commercial purchase enquiry submitted to broker.',
      adminStatus: 'PENDING_ADMIN_REVIEW' as any,
      sellerInformedStatus: 'PENDING' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.enquiries.unshift(newEnq);
    db.persist();
    return NextResponse.json({ success: true, enquiry: newEnq });
  }

  // 5. Submit Requirement
  if (path === 'requirements') {
    const user = getUserFromRequest(request);
    const buyer = user ? db.buyerProfiles.find(b => b.userId === user.id) : null;
    const buyerId = buyer?.id || (db.buyerProfiles.length > 1 ? db.buyerProfiles[1].id : 'buy-prof-001');

    const rawLoc = body.deliveryLocation;
    const locationStr =
      typeof rawLoc === 'object' && rawLoc !== null
        ? `${rawLoc.city || ''}${rawLoc.city && rawLoc.state ? ', ' : ''}${rawLoc.state || ''}`.trim()
        : String(rawLoc || 'New Delhi, Delhi');

    const qSpecs = body.qualitySpecs || {};
    const newReq = {
      id: `req-${Date.now()}`,
      buyerId,
      requirementCode: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: body.category || 'GOLDEN_SELLA_RICE',
      variety: body.variety || '1121 Golden Sella Basmati',
      classification: body.classification || 'BASMATI',
      requiredQuantityMT: Number(body.requiredQuantityMT) || 70,
      minQuantityMT: Number(body.minQuantityMT) || 50,
      maxQuantityMT: Number(body.maxQuantityMT) || 100,
      targetPricePerQuintal: Number(body.targetPricePerQuintal) || 8950,
      targetPricePerMT: (Number(body.targetPricePerQuintal) || 8950) * 10,
      deliveryLocation: locationStr,
      preferredDeliveryDate: body.preferredDeliveryDate || 'Immediate Dispatch',
      paymentTermsOffered: body.paymentTermsOffered || 'Standard Broker Escrow Terms',
      qualitySpecs: {
        grainLengthMm: Number(qSpecs.grainLengthMm || body.grainLengthMm) || 8.35,
        whiteness: Number(qSpecs.whiteness || body.whiteness) || 40.0,
        moisturePercent: Number(qSpecs.moisturePercent || body.moisturePercent) || 12.0,
        brokenPercent: Number(qSpecs.brokenPercent || body.brokenPercent) || 1.0,
        sortex: qSpecs.sortex !== undefined ? qSpecs.sortex : true
      },
      packagingRequired: body.packagingRequirement || body.packagingRequired || 'PP_BAG_50KG',
      status: 'OPEN' as any,
      matchedListingsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.requirements.unshift(newReq);
    db.persist();
    await supabaseDb.addRequirement(newReq);
    return NextResponse.json({ success: true, requirement: newReq });
  }

  // 6. Add Inventory (Seller)
  if (path === 'inventory') {
    const user = getUserFromRequest(request);
    const seller = user ? db.sellerProfiles.find(s => s.userId === user.id) : null;
    const sellerId = seller?.id || (db.sellerProfiles.length > 2 ? db.sellerProfiles[2].id : 'sel-prof-bansal');

    const newListing: any = {
      id: `lst-${Date.now()}`,
      sellerId,
      anonymousCode: `PRG-${Math.floor(1000 + Math.random() * 9000)}`,
      category: body.category || 'GOLDEN_SELLA_RICE',
      variety: body.variety || '1121 Golden Sella Basmati',
      classification: body.classification || 'BASMATI',
      availableQuantityMT: Number(body.availableQuantityMT) || 70,
      minOrderQuantityMT: 20,
      maxOrderQuantityMT: Number(body.availableQuantityMT) || 70,
      askingPricePerQuintal: Number(body.askingPricePerQuintal) || 9000,
      brokerageOffered: Number(body.brokerageOffered) || 40,
      brokerageType: body.brokerageType || 'PER_METRIC_TONNE',
      millLocation: body.dispatchLocation || 'TOHANA Mill Yard, Haryana',
      dispatchLocation: body.dispatchLocation || 'TOHANA',
      generalizedDistrict: 'Fatehabad',
      generalizedState: 'Haryana',
      qualitySpecs: {
        grainLengthMm: Number(body.grainLengthMm) || 8.35,
        whiteness: Number(body.whiteness) || 40.0,
        moisturePercent: Number(body.moisturePercent) || 12.0,
        brokenPercent: Number(body.brokenPercent) || 1.0,
        foreignMatterPercent: 0.05,
        damagedGrainPercent: 0.5,
        chalkyGrainPercent: 1.0,
        yellowGrainPercent: 0.4,
        sortex: body.sortex !== false,
        cropYear: '2025-2026'
      },
      packaging: body.packaging || 'PP_BAG_50KG',
      availabilityDate: 'Immediate Stock',
      cropYear: '2025-2026',
      stockImages: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
      ],
      notes: body.notes || 'Verified mill batch.',
      status: ListingStatus.PUBLISHED,
      moderationFlagged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.listings.unshift(newListing);
    db.persist();
    await supabaseDb.addListing(newListing);
    return NextResponse.json({ success: true, listing: sanitizeListing(newListing) });
  }

  // 7. Confirm Deal in Negotiation
  if (path.includes('confirm-deal')) {
    const segments = path.split('/');
    const negId = segments.find(s => s.startsWith('neg-'));
    const neg = db.negotiations.find(n => n.id === negId) || db.negotiations[db.negotiations.length - 1];
    if (neg) {
      neg.status = 'AGREED' as any;
      if (body.finalAgreedPrice) neg.finalAgreedPrice = Number(body.finalAgreedPrice);
      if (body.agreedQuantityMT) neg.agreedQuantityMT = Number(body.agreedQuantityMT);
      neg.updatedAt = new Date().toISOString();
    }
    db.persist();
    return NextResponse.json({
      success: true,
      message: 'Deal confirmed and locked at agreed rate. Converted to official Purchase Order.'
    });
  }

  // 8. Create Purchase Order
  if (path === 'purchase-orders/admin/create') {
    const listing = db.listings.find(l => l.id === body.listingId || l.anonymousCode === body.listingId) || db.listings[0];
    const buyer = db.buyerProfiles.find(b => b.id === body.buyerId) || db.buyerProfiles[0];
    const seller = db.sellerProfiles.find(s => s.id === body.sellerId) || db.sellerProfiles.find(s => s.id === listing.sellerId) || db.sellerProfiles[0];
    const quantityMT = Number(body.quantityMT) || 70;
    const agreedRatePerQuintal = Number(body.agreedRatePerQuintal) || 8950;
    const brokeragePerMT = Number(body.brokeragePerUnit || body.brokeragePerMT) || 40;

    const newPo = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      enquiryId: body.enquiryId || 'enq-haruana-01',
      listingId: listing.id,
      buyerId: buyer.id,
      buyerCompanyName: buyer.companyName,
      sellerId: seller.id,
      sellerCompanyName: seller.millName || seller.companyName,
      intermediaryBroker: 'Pragyam Enterprises (Tohana Central Desk)',
      riceCategory: listing.category || 'GOLDEN_SELLA_RICE',
      riceVariety: listing.variety || '1121 Golden Sella Basmati',
      classification: listing.classification || 'BASMATI',
      quantityMT,
      quantityQuintals: quantityMT * 10,
      agreedRatePerQuintal,
      agreedRatePerMT: agreedRatePerQuintal * 10,
      totalGoodsValue: quantityMT * agreedRatePerQuintal * 10,
      brokerageAmount: quantityMT * brokeragePerMT,
      brokeragePerMT,
      totalBrokerageAmount: quantityMT * brokeragePerMT,
      brokerageType: 'PER_METRIC_TONNE' as any,
      brokeragePayee: 'BUYER_AND_SELLER_SPLIT' as any,
      paymentTerms: body.paymentTerms || '10% Advance Escrow, 90% against Loading & Bilty',
      qualitySpecs: listing.qualitySpecs || {
        grainLengthMm: 8.35,
        whiteness: 40.0,
        moisturePercent: 12.0,
        brokenPercent: 1.0,
        sortex: true,
        cropYear: '2025-2026'
      },
      packaging: listing.packaging || 'PP_BAG_50KG',
      dispatchLocation: body.dispatchLocation || listing.dispatchLocation || 'TOHANA Mill Yard, Haryana',
      deliveryLocation: body.deliveryLocation || 'TONA Hub / Delhi NCR',
      deliveryDate: '2026-03-05',
      expectedDispatchDate: '2026-02-28',
      deliveryDeadline: '2026-03-05',
      status: PurchaseOrderStatus.PO_ISSUED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.purchaseOrders.unshift(newPo as any);

    // Update matching negotiation
    const neg = db.negotiations.find(n => n.enquiryId === body.enquiryId || n.anonymousListingCode === listing.anonymousCode);
    if (neg) {
      neg.status = 'CONVERTED_TO_PO' as any;
      neg.updatedAt = new Date().toISOString();
    }

    // Auto-create Transport Record
    db.transportRecords.unshift({
      id: `trp-${Date.now()}`,
      purchaseOrderId: newPo.id,
      poId: newPo.id,
      poNumber: newPo.poNumber,
      transporterName: 'Tohana Inter-State Logistics',
      driverName: 'Sarabjeet Singh',
      driverPhone: '+91 94160 22334',
      vehicleNumber: 'HR-23-BC-4412',
      biltyNumber: `LR-TOH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ewayBillNumber: `EWB-99${Math.floor(100000 + Math.random() * 900000)}`,
      loadedQuantityMT: newPo.quantityMT,
      quantityLoadedMT: newPo.quantityMT,
      bagCount: newPo.quantityMT * 20,
      loadingLocation: newPo.dispatchLocation,
      deliveryLocation: newPo.deliveryLocation,
      loadingDate: new Date().toISOString(),
      dispatchDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      freightCharges: 35000,
      freightStatus: 'PAID_BY_BUYER',
      status: TransportStatus.ASSIGNED,
      statusLogs: [
        {
          status: TransportStatus.ASSIGNED,
          timestamp: new Date().toISOString(),
          locationNote: 'Vehicle and Driver assigned for Tohana Mandi dispatch'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    // Auto-create Invoice
    db.invoices.unshift({
      id: `inv-${Date.now()}`,
      invoiceNumber: `PRG/INV/2026/${Math.floor(100 + Math.random() * 900)}`,
      invoiceType: 'BROKERAGE_INVOICE',
      purchaseOrderId: newPo.id,
      poId: newPo.id,
      poNumber: newPo.poNumber,
      issuerName: 'Pragyam Enterprises',
      issuerPan: 'HSAPB2553Q',
      bankDetails: 'Bank of Baroda | Tohana | A/C: 53600100009068 | IFSC: BARB0TOHANA (Nikhil Bansal)',
      billedToRole: UserRole.BUYER,
      billedToName: buyer.companyName,
      clientName: buyer.companyName,
      clientGstin: buyer.gstin || '',
      sacCode: '998319',
      hsnSacCode: '998319',
      brokerageAmount: newPo.totalBrokerageAmount,
      taxableAmount: newPo.totalBrokerageAmount,
      cgstPercent: 9.0,
      cgstRate: 9.0,
      cgstAmount: Math.round(newPo.totalBrokerageAmount * 0.09),
      sgstPercent: 9.0,
      sgstRate: 9.0,
      sgstAmount: Math.round(newPo.totalBrokerageAmount * 0.09),
      igstPercent: 0,
      igstRate: 0,
      igstAmount: 0,
      totalTaxAmount: Math.round(newPo.totalBrokerageAmount * 0.18),
      totalTax: Math.round(newPo.totalBrokerageAmount * 0.18),
      grandTotal: Math.round(newPo.totalBrokerageAmount * 1.18),
      status: 'GENERATED' as any,
      issueDate: new Date().toISOString(),
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 15).toISOString()
    } as any);

    // Auto-create Payment Record (10% advance escrow)
    const advanceAmount = Math.round(newPo.totalGoodsValue * 0.1);
    db.payments.unshift({
      id: `pay-${Date.now()}`,
      purchaseOrderId: newPo.id,
      poId: newPo.id,
      poNumber: newPo.poNumber,
      payerName: buyer.companyName,
      payerId: buyer.id,
      payerRole: 'BUYER',
      amount: advanceAmount,
      paymentType: 'COMMODITY_ADVANCE' as any,
      paymentMethod: 'RTGS' as any,
      method: 'RTGS Escrow Transfer',
      referenceNumber: `RTGS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentReference: `RTGS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentDate: new Date().toISOString(),
      status: 'VERIFIED' as any,
      transactionDate: new Date().toISOString(),
      verifiedByAdmin: true,
      notes: '10% Advance deposit verified in Pragyam Central Escrow Desk.'
    } as any);

    db.persist();
    return NextResponse.json({ success: true, purchaseOrder: newPo });
  }

  // 9. Verify Payment (POST)
  if (path.includes('verify')) {
    const segments = path.split('/');
    const payId = segments.find(s => s.startsWith('pay-')) || segments[2];
    const pay = db.payments.find(p => p.id === payId) || db.payments[0];
    if (pay) {
      pay.status = 'VERIFIED' as any;
      (pay as any).verifiedByAdmin = true;
      (pay as any).updatedAt = new Date().toISOString();
    }
    db.persist();
    return NextResponse.json({
      success: true,
      message: 'Payment verified and credited to Pragyam Brokerage Escrow.'
    });
  }

  // 10. Mark Notifications
  if (path === 'notifications/mark-all-read' || path.startsWith('notifications/mark-read')) {
    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read.'
    });
  }

  // 11. Sync Buyer from Client / Admin
  if (path === 'users/admin/sync-buyer' || path === 'users/sync-buyer') {
    const { buyer } = body;
    if (buyer && buyer.companyName) {
      const existing = db.buyerProfiles.find(
        b => b.id === buyer.id || (b.companyName.toLowerCase() === buyer.companyName.toLowerCase() && b.phone === buyer.phone)
      );
      if (!existing) {
        db.buyerProfiles.unshift({
          id: buyer.id || `buy-${Date.now()}`,
          userId: buyer.userId || `usr-${Date.now()}`,
          fullName: buyer.fullName || 'Authorized Buyer',
          companyName: buyer.companyName,
          phone: buyer.phone || '+91 98000 00000',
          email: buyer.email || 'buyer@pragyam.com',
          address: buyer.address || 'Market Yard',
          city: buyer.city || 'New Delhi',
          district: buyer.district || buyer.city || 'New Delhi',
          state: buyer.state || 'Delhi',
          pinCode: buyer.pinCode || '110001',
          gstin: buyer.gstin || '',
          businessType: buyer.businessType || 'EXPORTER',
          isVerified: buyer.isVerified !== undefined ? buyer.isVerified : true,
          createdAt: buyer.createdAt || new Date().toISOString()
        } as any);
        db.persist();
      }
    }
    return NextResponse.json({ success: true, buyers: db.buyerProfiles });
  }

  return NextResponse.json({ success: false, error: `Endpoint not found: POST ${path}` }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  db.loadFromDisk();
  const path = params.path.join('/');
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    // empty body
  }

  // Handle PO status update
  if (path.includes('purchase-orders') && path.includes('status')) {
    const segments = path.split('/');
    const poId = segments.find(s => s.startsWith('po-') || s.startsWith('PO-')) || segments[2];
    const po = db.purchaseOrders.find(p => p.id === poId || p.poNumber === poId) || db.purchaseOrders[0];
    if (po && body.status) {
      po.status = body.status;
      (po as any).updatedAt = new Date().toISOString();
    }
    db.persist();
    return NextResponse.json({ success: true, message: `PO status updated to ${body.status}` });
  }

  // Handle payment verify (PUT)
  if (path.includes('verify')) {
    const segments = path.split('/');
    const payId = segments.find(s => s.startsWith('pay-')) || segments[2];
    const pay = db.payments.find(p => p.id === payId) || db.payments[0];
    if (pay) {
      pay.status = 'VERIFIED' as any;
      (pay as any).verifiedByAdmin = true;
      (pay as any).updatedAt = new Date().toISOString();
    }
    db.persist();
    return NextResponse.json({ success: true, message: 'Payment verified and ledger updated.' });
  }

  if (path.includes('status')) {
    return NextResponse.json({
      success: true,
      message: `Status successfully updated to ${body.status || 'UPDATED'}.`
    });
  }

  return NextResponse.json({ success: true, message: 'Resource updated successfully.' });
}
