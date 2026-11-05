import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../server/mockDb';
import { UserRole, ListingStatus, PurchaseOrderStatus, TransportStatus, PaymentStatus } from '@pragyam/types';

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
        sellerAskingPrice: matched.askingPricePerQuintal,
        sellerAvailableMT: matched.availableQuantityMT,
        compatibilityScore: 94.5,
        priceGapPerQuintal: matched.askingPricePerQuintal - req.targetPricePerQuintal,
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
        anonymousListingCode: 'PRG-1025',
        variety: '1121 Golden Sella Basmati',
        requestedQuantityMT: 100,
        buyerTargetPrice: 8100,
        sellerAskingPrice: 8200,
        adminNegotiatedPrice: 8150,
        brokeragePerMT: 100,
        status: 'IN_NEGOTIATION',
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
    return NextResponse.json({ success: true, purchaseOrders: db.purchaseOrders });
  }

  // 10. Purchase Order PDF Download
  if (path.startsWith('purchase-orders/') && path.endsWith('/pdf')) {
    const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 18 Tf
50 720 Td
(PRAGYAM ENTERPRISES - OFFICIAL PURCHASE ORDER) Tj
/F1 12 Tf
50 690 Td
(PO NUMBER: PO-2026-9042 | COMMODITY: 1509 STEAM BASMATI | VALUE: INR 74,00,000) Tj
ET
endstream endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
0000000210 00000 n 
trailer << /Size 5 /Root 1 0 R >>
startxref
380
%%EOF`;
    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="PO-2026-9042.pdf"'
      }
    });
  }

  // 11. Transport / Bilty
  if (path === 'transport/admin/all') {
    return NextResponse.json({ success: true, transportRecords: db.transportRecords });
  }

  // 12. Payments
  if (path === 'payments/admin/all' || path === 'payments/my-payments') {
    return NextResponse.json({ success: true, payments: db.payments });
  }

  // 13. Invoices
  if (path === 'invoices/admin/all') {
    return NextResponse.json({ success: true, invoices: db.invoices });
  }

  // 14. Analytics Summary
  if (path === 'analytics/admin/summary') {
    return NextResponse.json({
      success: true,
      metrics: {
        totalBrokerageRevenueINR: 3560000,
        totalTradedVolumeMT: 4820,
        activeListingsCount: db.listings.length,
        pendingEnquiriesCount: db.enquiries.length,
        activeNegotiationsCount: 1,
        confirmedOrdersCount: db.purchaseOrders.length,
        totalRegisteredMills: db.sellerProfiles.length + 38,
        totalRegisteredBuyers: db.buyerProfiles.length + 64,
        inTransitDeliveriesCount: db.transportRecords.length,
        recentBrokerageCollectedINR: 74000
      }
    });
  }

  // 15. Audit Logs
  if (path === 'audit/admin/logs') {
    return NextResponse.json({ success: true, auditLogs: db.auditLogs });
  }

  // 16. Users (Admin directory)
  if (path === 'users/admin/buyers') {
    return NextResponse.json({ success: true, buyers: db.buyerProfiles });
  }
  if (path === 'users/admin/sellers') {
    return NextResponse.json({ success: true, sellers: db.sellerProfiles });
  }

  // 17. Excel Export Mock
  if (path.startsWith('export/admin/excel/')) {
    const csvContent = `ID,Commodity,Quantity_MT,Rate_Per_Qtl,Status\nPO-2026-9042,1509 Steam Basmati,100,7400,IN_TRANSIT\n`;
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Pragyam_Export.xlsx"'
      }
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

  // 3. User Registration
  if (path === 'auth/register') {
    const { email, password, role, fullName, companyName, phone, businessType, millName } = body;
    const newUser = {
      id: `usr-${Date.now()}`,
      email,
      password: password || 'Pragyam@2026',
      role: role || UserRole.BUYER,
      status: 'ACTIVE' as any,
      mfaEnabled: false,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);

    if (role === UserRole.SELLER) {
      db.sellerProfiles.push({
        id: `sel-${Date.now()}`,
        userId: newUser.id,
        fullName: fullName || 'Miller Partner',
        companyName: companyName || millName || 'Rice Mill Enterprise',
        phone: phone || '+91 98000 00000',
        address: 'Industrial Grain Area',
        city: 'Karnal',
        district: 'Karnal',
        state: 'Haryana',
        pinCode: '132001',
        businessType: businessType || 'RICE_MILLER',
        millName: millName || companyName || 'Rice Mill Unit',
        dispatchLocations: ['Karnal Depot'],
        isVerified: true
      });
    } else {
      db.buyerProfiles.push({
        id: `buy-${Date.now()}`,
        userId: newUser.id,
        fullName: fullName || 'Purchaser Partner',
        companyName: companyName || 'Grain Trading Co',
        phone: phone || '+91 98000 00000',
        address: 'APMC Market Hub',
        city: 'New Delhi',
        district: 'New Delhi',
        state: 'Delhi',
        pinCode: '110001',
        businessType: businessType || 'EXPORTER',
        isVerified: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully. You may now sign in.'
    });
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
    const newReq = {
      id: `req-${Date.now()}`,
      buyerId: 'buy-prof-001',
      requirementCode: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      category: body.category || 'GOLDEN_SELLA_RICE',
      variety: body.variety || '1121 Golden Sella Basmati',
      classification: body.classification || 'BASMATI',
      requiredQuantityMT: Number(body.requiredQuantityMT) || 100,
      minQuantityMT: Number(body.minQuantityMT) || 50,
      maxQuantityMT: Number(body.maxQuantityMT) || 150,
      targetPricePerQuintal: Number(body.targetPricePerQuintal) || 8100,
      targetPricePerMT: (Number(body.targetPricePerQuintal) || 8100) * 10,
      deliveryLocation: body.deliveryLocation || 'Delhi Hub',
      preferredDeliveryDate: body.preferredDeliveryDate || '2026-03-30',
      paymentTermsOffered: body.paymentTermsOffered || 'Standard Broker Escrow Terms',
      qualitySpecs: {
        grainLengthMm: Number(body.grainLengthMm) || 8.35,
        whiteness: Number(body.whiteness) || 40.0,
        moisturePercent: Number(body.moisturePercent) || 12.0,
        brokenPercent: Number(body.brokenPercent) || 1.0,
        sortex: true
      },
      packagingRequired: body.packagingRequired || 'PP_BAG_50KG',
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
