import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../server/mockDb';
import { UserRole, ListingStatus, PurchaseOrderStatus, TransportStatus, PaymentStatus } from '@pragyam/types';
import {
  generateExcelWorkbook,
  generatePurchaseOrderPdfBuffer,
  generateInvoicePdfBuffer
} from '../../../server/documentService';

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
    const fullListings = db.listings.map(l => {
      const seller = db.sellerProfiles.find(s => s.id === l.sellerId);
      return {
        ...l,
        sellerCompanyName: seller?.companyName || seller?.millName || 'Taraori Golden Rice Mills Ltd',
        sellerFullName: seller?.fullName || 'Rameshwar Lal Singhal',
        sellerPhone: seller?.phone || '+91 98960 11223',
        sellerActualInfo: {
          sellerId: seller?.id,
          sellerName: seller?.fullName,
          millName: seller?.millName,
          phone: seller?.phone,
          gstin: seller?.gstin,
          actualMillLocation: l.millLocation
        }
      };
    });
    return NextResponse.json({ success: true, listings: fullListings });
  }

  // 4. Seller Inventory
  if (path === 'inventory/seller/my-listings') {
    // Return listings for the primary seller
    const sellerListings = db.listings.map(l => ({
      ...l,
      sellerActualInfo: {
        millName: 'Taraori Golden Rice Mills',
        actualMillLocation: l.millLocation
      }
    }));
    return NextResponse.json({ success: true, listings: sellerListings });
  }

  // 5. Requirements
  if (path === 'requirements/my-requirements' || path === 'requirements/admin/all' || path === 'requirements') {
    return NextResponse.json({ success: true, requirements: db.requirements });
  }

  // 6. Enquiries
  if (path === 'enquiries/my-enquiries' || path === 'enquiries') {
    return NextResponse.json({ success: true, enquiries: db.enquiries });
  }

  // 7. Matching Recommendations (AI Broker Matching)
  if (path === 'matching/admin/recommendations') {
    const recommendations = db.requirements.map(req => {
      const matched = db.listings[0];
      return {
        requirementId: req.id,
        requirementCode: req.requirementCode,
        buyerCompanyName: 'Royal Feast Global Exporters Pvt Ltd',
        variety: req.variety,
        requiredMT: req.requiredQuantityMT,
        targetPricePerQuintal: req.targetPricePerQuintal,
        listingId: matched.id,
        anonymousListingCode: matched.anonymousCode,
        sellerMillName: 'Taraori Golden Rice Mills Ltd',
        sellerCompanyName: 'Taraori Golden Rice Mills Ltd',
        sellerAskingPrice: matched.askingPricePerQuintal,
        sellerAvailableMT: matched.availableQuantityMT,
        category: req.category,
        overallMatchScore: 94,
        qualityScore: 96,
        priceScore: 92,
        quantityScore: 95,
        locationScore: 90,
        recommendationSummary: 'High probability deal: Specs closely aligned. Taraori Mill has 500 MT ready stock with required length (8.35mm).',
        differences: {
          grainLengthDiff: 0.05,
          priceDiffPerQuintal: 100,
          quantityDiffMT: 0,
          moistureDiff: 0.2,
          brokenDiff: 0.5,
          whitenessDiff: 2.0
        },
        reasons: ['Grain length matches: 8.35mm', 'Sortex certified 100%', 'Ready stock at Karnal Depot']
      };
    });
    return NextResponse.json({ success: true, recommendations });
  }

  // 8. Negotiations
  if (path === 'negotiations/admin/all') {
    const negs = [
      {
        id: 'neg-101',
        enquiryId: 'enq-301',
        buyerId: 'buy-prof-001',
        buyerCompanyName: 'Royal Feast Global Exporters',
        sellerId: 'sel-prof-001',
        sellerMillName: 'Taraori Golden Rice Mills',
        sellerCompanyName: 'Taraori Golden Rice Mills',
        anonymousListingCode: 'PRG-1025',
        variety: '1121 Golden Sella Basmati',
        requestedQuantityMT: 100,
        agreedQuantityMT: 100,
        buyerTargetPrice: 8100,
        sellerAskingPrice: 8200,
        sellerInitialPrice: 8200,
        adminNegotiatedPrice: 8150,
        finalAgreedPrice: 8150,
        brokeragePerMT: 100,
        brokeragePerUnit: 100,
        brokeragePayee: 'BUYER_AND_SELLER_SPLIT',
        status: 'AGREED',
        history: [
          { actor: 'BUYER', note: 'Offered ₹8,100/Qtl for 100 MT' },
          { actor: 'SELLER', note: 'Quoted ₹8,200/Qtl ex-mill' },
          { actor: 'ADMIN', note: 'Broker counter-offer settled at ₹8,150/Qtl mutually accepted' }
        ],
        updatedAt: new Date().toISOString()
      }
    ];
    return NextResponse.json({ success: true, negotiations: negs });
  }

  // 9. Purchase Orders
  if (
    path === 'purchase-orders/admin/all' ||
    path === 'purchase-orders/buyer/my-orders' ||
    path === 'purchase-orders/seller/my-orders'
  ) {
    const purchaseOrders = db.purchaseOrders.map(po => ({
      ...po,
      orderDate: (po as any).orderDate || po.createdAt,
      brokerageAmount: (po as any).brokerageAmount || (po as any).totalBrokerageAmount || 74000,
      dispatchLocation: (po as any).dispatchLocation || 'Taraori Mill Depot, Karnal'
    }));
    return NextResponse.json({ success: true, purchaseOrders });
  }

  // 10. Purchase Order PDF Download
  if (path.startsWith('purchase-orders/') && path.endsWith('/pdf')) {
    const segments = path.split('/');
    const poId = segments[1];
    const po = db.purchaseOrders.find(p => p.id === poId || p.poNumber === poId) || db.purchaseOrders[0];
    const pdfBuf = await generatePurchaseOrderPdfBuffer(po);
    return new NextResponse(pdfBuf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${po.poNumber || 'PO-2026-9042'}.pdf"`
      }
    });
  }

  // 10b. Invoice PDF Download
  if (path.startsWith('invoices/') && path.endsWith('/pdf')) {
    const segments = path.split('/');
    const invId = segments[1];
    const inv = db.invoices.find(i => i.id === invId || i.invoiceNumber === invId) || db.invoices[0];
    const pdfBuf = await generateInvoicePdfBuffer(inv);
    const safeInvNum = (inv.invoiceNumber || 'Invoice').replace(/\//g, '_');
    return new NextResponse(pdfBuf, {
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
    return NextResponse.json({ success: true, buyers: db.buyerProfiles });
  }
  if (path === 'users/admin/sellers') {
    return NextResponse.json({ success: true, sellers: db.sellerProfiles });
  }

  // 17. Genuine Excel (.xlsx) Export
  if (path.startsWith('export/admin/excel/')) {
    const dataset = path.replace('export/admin/excel/', '');
    const xlsxBuf = generateExcelWorkbook(dataset);
    return new NextResponse(xlsxBuf, {
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
  const path = params.path.join('/');
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    // empty body
  }

  // 1. Super Admin Login
  if (path === 'auth/admin/login') {
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
  if (path === 'auth/login') {
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
    path === 'auth/register'
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

    if (!email || !password || !fullName || !companyName || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all mandatory fields (Name, Business Name, Phone, Email, Password).'
        },
        { status: 400 }
      );
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'This email address is already registered. Please login instead.'
        },
        { status: 409 }
      );
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      password,
      role: isSeller ? UserRole.SELLER : UserRole.BUYER,
      status: 'ACTIVE' as any,
      mfaEnabled: false,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);

    let profile: any = null;

    if (isSeller) {
      profile = {
        id: `sel-${Date.now()}`,
        userId: newUser.id,
        fullName,
        companyName: companyName || millName || 'Rice Mill Enterprise',
        phone,
        address: address || 'Industrial Area',
        city: city || 'Tohana',
        district: district || city || 'Fatehabad',
        state: state || 'Haryana',
        pinCode: pinCode || '125120',
        gstin: gstin || '',
        businessType: businessType || 'RICE_MILLER',
        millName: millName || companyName || 'Rice Mill Enterprise',
        millCapacityMTPerDay: Number(millCapacityMTPerDay) || 100,
        dispatchLocations: Array.isArray(dispatchLocations) ? dispatchLocations : [city || 'Mill Depot'],
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      db.sellerProfiles.push(profile);
    } else {
      profile = {
        id: `buy-${Date.now()}`,
        userId: newUser.id,
        fullName,
        companyName: companyName || 'Grain Trading Co',
        phone,
        address: address || 'Market Yard',
        city: city || 'New Delhi',
        district: district || city || 'New Delhi',
        state: state || 'Delhi',
        pinCode: pinCode || '110001',
        gstin: gstin || '',
        businessType: businessType || 'EXPORTER',
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      db.buyerProfiles.push(profile);
    }

    const token = `pragyam-client-token-${newUser.id}`;

    return NextResponse.json(
      {
        success: true,
        message: `${isSeller ? 'Rice Miller' : 'Authorized Buyer'} registration completed successfully.`,
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullName,
          profile
        }
      },
      { status: 201 }
    );
  }

  // 4. Submit Enquiry
  if (path === 'enquiries') {
    const { listingId, requestedQuantityMT, targetPricePerQuintal, buyerNotes } = body;
    const listing = db.listings.find(l => l.id === listingId) || db.listings[0];
    const newEnq = {
      id: `enq-${Date.now()}`,
      buyerId: 'buy-prof-001',
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
    return NextResponse.json({ success: true, enquiry: newEnq });
  }

  // 5. Submit Requirement
  if (path === 'requirements') {
    const rawLoc = body.deliveryLocation;
    const locationStr =
      typeof rawLoc === 'object' && rawLoc !== null
        ? `${rawLoc.city || ''}${rawLoc.city && rawLoc.state ? ', ' : ''}${rawLoc.state || ''}`.trim()
        : String(rawLoc || 'New Delhi, Delhi');

    const qSpecs = body.qualitySpecs || {};
    const newReq = {
      id: `req-${Date.now()}`,
      buyerId: 'buy-prof-001',
      requirementCode: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: body.category || 'STEAM_RICE',
      variety: body.variety || '1509 Basmati Steam',
      classification: body.classification || 'BASMATI',
      requiredQuantityMT: Number(body.requiredQuantityMT) || 100,
      minQuantityMT: Number(body.minQuantityMT) || 50,
      maxQuantityMT: Number(body.maxQuantityMT) || 150,
      targetPricePerQuintal: Number(body.targetPricePerQuintal) || 6800,
      targetPricePerMT: (Number(body.targetPricePerQuintal) || 6800) * 10,
      deliveryLocation: locationStr,
      preferredDeliveryDate: body.preferredDeliveryDate || 'Immediate Dispatch',
      paymentTermsOffered: body.paymentTermsOffered || 'Standard Broker Escrow Terms',
      qualitySpecs: {
        grainLengthMm: Number(qSpecs.grainLengthMm || body.grainLengthMm) || 8.35,
        whiteness: Number(qSpecs.whiteness || body.whiteness) || 40.0,
        moisturePercent: Number(qSpecs.moisturePercent || body.moisturePercent) || 12.5,
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
    return NextResponse.json({ success: true, requirement: newReq });
  }

  // 6. Add Inventory (Seller)
  if (path === 'inventory') {
    const newListing: any = {
      id: `lst-${Date.now()}`,
      sellerId: 'sel-prof-001',
      anonymousCode: `PRG-${Math.floor(1000 + Math.random() * 9000)}`,
      category: body.category || 'GOLDEN_SELLA_RICE',
      variety: body.variety || '1121 Golden Sella Basmati',
      classification: body.classification || 'BASMATI',
      availableQuantityMT: Number(body.availableQuantityMT) || 100,
      minOrderQuantityMT: 20,
      maxOrderQuantityMT: Number(body.availableQuantityMT) || 100,
      askingPricePerQuintal: Number(body.askingPricePerQuintal) || 8200,
      brokerageOffered: Number(body.brokerageOffered) || 100,
      brokerageType: body.brokerageType || 'PER_METRIC_TONNE',
      millLocation: body.dispatchLocation || 'Karnal Mill Hub',
      dispatchLocation: body.dispatchLocation || 'Karnal Depot',
      generalizedDistrict: 'Karnal',
      generalizedState: 'Haryana',
      qualitySpecs: {
        grainLengthMm: Number(body.grainLengthMm) || 8.35,
        whiteness: Number(body.whiteness) || 40.0,
        moisturePercent: Number(body.moisturePercent) || 12.0,
        brokenPercent: Number(body.brokenPercent) || 1.0,
        foreignMatterPercent: 0.05,
        damagedGrainPercent: 0.5,
        chalkyGrainPercent: 1.0,
        yellowGrainPercent: 0.5,
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
    return NextResponse.json({ success: true, listing: sanitizeListing(newListing) });
  }

  // 7. Confirm Deal in Negotiation
  if (path.includes('confirm-deal')) {
    return NextResponse.json({
      success: true,
      message: 'Deal confirmed and locked at agreed rate. Converted to official Purchase Order.'
    });
  }

  // 8. Create Purchase Order
  if (path === 'purchase-orders/admin/create') {
    const newPo = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      enquiryId: body.enquiryId || 'enq-301',
      listingId: body.listingId || 'lst-1025',
      buyerId: 'buy-prof-001',
      sellerId: 'sel-prof-001',
      intermediaryBroker: 'Pragyam Enterprises (Central Desk)',
      riceCategory: body.riceCategory || 'GOLDEN_SELLA_RICE',
      riceVariety: body.riceVariety || '1121 Golden Sella Basmati',
      quantityMT: Number(body.quantityMT) || 100,
      quantityQuintals: (Number(body.quantityMT) || 100) * 10,
      agreedRatePerQuintal: Number(body.agreedRatePerQuintal) || 8150,
      agreedRatePerMT: (Number(body.agreedRatePerQuintal) || 8150) * 10,
      totalGoodsValue: (Number(body.quantityMT) || 100) * (Number(body.agreedRatePerQuintal) || 8150) * 10,
      brokeragePerMT: 100,
      totalBrokerageAmount: (Number(body.quantityMT) || 100) * 100,
      brokeragePayee: 'BOTH_SPLIT' as any,
      paymentTerms: body.paymentTerms || 'Standard Broker Escrow',
      qualitySpecs: {
        grainLengthMm: 8.35,
        whiteness: 40.0,
        moisturePercent: 12.0,
        brokenPercent: 1.0,
        sortex: true
      },
      deliveryLocation: body.deliveryLocation || 'Mundra CFS',
      expectedDispatchDate: '2026-03-10',
      deliveryDeadline: '2026-03-20',
      status: PurchaseOrderStatus.PO_ISSUED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.purchaseOrders.unshift(newPo);
    return NextResponse.json({ success: true, purchaseOrder: newPo });
  }

  // 9. Verify Payment
  if (path.includes('verify')) {
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

  return NextResponse.json({ success: false, error: `Endpoint not found: POST ${path}` }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    // empty body
  }

  if (path.includes('status')) {
    return NextResponse.json({
      success: true,
      message: `Status successfully updated to ${body.status || 'UPDATED'}.`
    });
  }

  return NextResponse.json({ success: true, message: 'Resource updated successfully.' });
}
