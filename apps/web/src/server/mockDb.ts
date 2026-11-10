import fs from 'fs';
import path from 'path';
import {
  UserRole,
  UserStatus,
  BusinessType,
  RiceCategory,
  RiceClassification,
  PackagingType,
  BrokerageType,
  BrokeragePayee,
  ListingStatus,
  PurchaseOrderStatus,
  TransportStatus,
  PaymentMethod,
  PaymentType,
  PaymentStatus,
  RiceQualitySpecs,
  AnonymousInventoryListingDTO,
  SellerInventoryListingDTO,
  AdminInventoryListingDTO,
  PurchaseRequirementDTO,
  PurchaseEnquiryDTO,
  NegotiationRecordDTO,
  PurchaseOrderDTO,
  TransportRecordDTO,
  PaymentRecordDTO,
  InvoiceDTO,
  AuditLogDTO
} from '@pragyam/types';
import { mtToQuintals, pricePerQuintalToMT } from '@pragyam/shared';

export interface DbUser {
  id: string;
  email: string;
  password: string; // Plaintext or hash
  role: UserRole;
  status: UserStatus;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface DbBuyerProfile {
  id: string;
  userId: string;
  fullName: string;
  companyName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  gstin?: string;
  panNumber?: string;
  businessType: BusinessType;
  isVerified: boolean;
}

export interface DbSellerProfile {
  id: string;
  userId: string;
  fullName: string;
  companyName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  gstin?: string;
  panNumber?: string;
  businessType: BusinessType;
  millName: string;
  millCapacityMTPerDay?: number;
  dispatchLocations: string[];
  isVerified: boolean;
}

export interface DbListing {
  id: string;
  sellerId: string;
  anonymousCode: string;
  category: RiceCategory;
  variety: string;
  classification: RiceClassification;
  availableQuantityMT: number;
  minOrderQuantityMT: number;
  maxOrderQuantityMT: number;
  askingPricePerQuintal: number;
  brokerageOffered: number;
  brokerageType: BrokerageType;
  millLocation: string;
  dispatchLocation: string;
  generalizedDistrict: string;
  generalizedState: string;
  qualitySpecs: RiceQualitySpecs;
  packaging: PackagingType;
  availabilityDate: string;
  cropYear: string;
  stockImages: string[];
  notes?: string;
  status: ListingStatus;
  moderationFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

class ServerlessDataStore {
  public users: DbUser[] = [];
  public buyerProfiles: DbBuyerProfile[] = [];
  public sellerProfiles: DbSellerProfile[] = [];
  public listings: DbListing[] = [];
  public requirements: PurchaseRequirementDTO[] = [];
  public enquiries: PurchaseEnquiryDTO[] = [];
  public negotiations: NegotiationRecordDTO[] = [];
  public purchaseOrders: PurchaseOrderDTO[] = [];
  public transportRecords: TransportRecordDTO[] = [];
  public payments: PaymentRecordDTO[] = [];
  public invoices: InvoiceDTO[] = [];
  public auditLogs: AuditLogDTO[] = [];

  private isSeeded = false;

  constructor() {
    this.seed();
  }

  public seed() {
    if (this.isSeeded) return;
    this.isSeeded = true;

    // 1. Super Admin
    this.users.push({
      id: 'usr-admin-001',
      email: 'admin@pragyam.com',
      password: 'Pragyam@Admin2026!',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      mfaEnabled: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    });

    // 2. Sellers (Rice Millers)
    const seller1User: DbUser = {
      id: 'usr-seller-001',
      email: 'taraori@mills.com',
      password: 'Pragyam@2026',
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-10T00:00:00.000Z'
    };
    const seller1Profile: DbSellerProfile = {
      id: 'sel-prof-001',
      userId: seller1User.id,
      fullName: 'Rameshwar Lal Singhal',
      companyName: 'Taraori Golden Rice Mills Ltd',
      phone: '+91 98960 11223',
      address: 'Near Old Grain Market, Station Road',
      city: 'Taraori',
      district: 'Karnal',
      state: 'Haryana',
      pinCode: '132116',
      gstin: '06AAACT4455R1Z2',
      panNumber: 'AAACT4455R',
      businessType: BusinessType.RICE_MILLER,
      millName: 'Taraori Golden Rice Mills (Unit 1 & 2)',
      millCapacityMTPerDay: 200,
      dispatchLocations: ['Karnal Dispatch Depot', 'Mundra Port CFS'],
      isVerified: true
    };

    const seller2User: DbUser = {
      id: 'usr-seller-002',
      email: 'amritsar@agro.com',
      password: 'Pragyam@2026',
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-15T00:00:00.000Z'
    };
    const seller2Profile: DbSellerProfile = {
      id: 'sel-prof-002',
      userId: seller2User.id,
      fullName: 'Gurpreet Singh Dhillon',
      companyName: 'Majha Agro Processors LLP',
      phone: '+91 98140 55667',
      address: 'GT Road, Jandiala Guru',
      city: 'Amritsar',
      district: 'Amritsar',
      state: 'Punjab',
      pinCode: '143115',
      gstin: '03AABFM8899Q1ZT',
      panNumber: 'AABFM8899Q',
      businessType: BusinessType.RICE_MILLER,
      millName: 'Majha Ultra Steam Milling Facility',
      millCapacityMTPerDay: 350,
      dispatchLocations: ['Amritsar Dry Port', 'Kandla Port CFS'],
      isVerified: true
    };

    const seller3User: DbUser = {
      id: 'usr-seller-bansal',
      email: 'nikhilbansal9896@gmail.com',
      password: 'Pragyam@2026',
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-02-10T00:00:00.000Z'
    };
    const seller3Profile: DbSellerProfile = {
      id: 'sel-prof-bansal',
      userId: seller3User.id,
      fullName: 'Satyanarayan',
      companyName: 'BASNAL TRADESR',
      phone: '+91 9416365869',
      address: 'New Anaj Mandi, Station Road',
      city: 'tohana',
      district: 'Fatehabad',
      state: 'Haryana',
      pinCode: '125120',
      gstin: '06ATTPS1820N1Z2',
      panNumber: 'ATTPS1820N',
      businessType: BusinessType.RICE_MILLER,
      millName: 'BANSAL TRADERS',
      millCapacityMTPerDay: 150,
      dispatchLocations: ['TOHANA Yard', 'Tohana Mandi Depot'],
      isVerified: true
    };

    this.users.push(seller1User, seller2User, seller3User);
    this.sellerProfiles.push(seller1Profile, seller2Profile, seller3Profile);

    // 3. Buyers (Institutional Purchasers & Exporters)
    const buyer1User: DbUser = {
      id: 'usr-buyer-001',
      email: 'exports@royalfeast.com',
      password: 'Pragyam@2026',
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-05T00:00:00.000Z'
    };
    const buyer1Profile: DbBuyerProfile = {
      id: 'buy-prof-001',
      userId: buyer1User.id,
      fullName: 'Sunil Mehra',
      companyName: 'Royal Feast Global Exporters Pvt Ltd',
      phone: '+91 98110 33445',
      address: 'Barakhamba Road, Connaught Place',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      pinCode: '110001',
      gstin: '07AABCR9911K1ZX',
      panNumber: 'AABCR9911K',
      businessType: BusinessType.EXPORTER,
      isVerified: true
    };

    const buyer2User: DbUser = {
      id: 'usr-buyer-haruana',
      email: 'buyer-haruana@pragyam.com',
      password: 'Pragyam@2026',
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-02-12T00:00:00.000Z'
    };
    const buyer2Profile: DbBuyerProfile = {
      id: 'buy-prof-haruana',
      userId: buyer2User.id,
      fullName: 'BANAN',
      companyName: 'haruana',
      phone: '+91 9896346337',
      address: 'Grain Market Hub, Tona',
      city: 'TONA',
      district: 'Fatehabad',
      state: 'Haryana',
      pinCode: '125120',
      businessType: BusinessType.WHOLESALER,
      isVerified: true
    };

    this.users.push(buyer1User, buyer2User);
    this.buyerProfiles.push(buyer1Profile, buyer2Profile);

    // 4. Initial Anonymous Listings
    this.listings.push(
      {
        id: 'lst-1025',
        sellerId: seller1Profile.id,
        anonymousCode: 'PRG-1025',
        category: RiceCategory.GOLDEN_SELLA_RICE,
        variety: '1121 Golden Sella Basmati',
        classification: RiceClassification.BASMATI,
        availableQuantityMT: 500,
        minOrderQuantityMT: 25,
        maxOrderQuantityMT: 500,
        askingPricePerQuintal: 8200,
        brokerageOffered: 100,
        brokerageType: BrokerageType.PER_METRIC_TONNE,
        millLocation: 'Taraori Industrial Sector, Karnal',
        dispatchLocation: 'Karnal Dispatch Depot',
        generalizedDistrict: 'Karnal',
        generalizedState: 'Haryana',
        qualitySpecs: {
          grainLengthMm: 8.35,
          whiteness: 40.0,
          moisturePercent: 12.0,
          brokenPercent: 1.0,
          foreignMatterPercent: 0.05,
          damagedGrainPercent: 0.5,
          chalkyGrainPercent: 1.0,
          yellowGrainPercent: 0.5,
          sortex: true,
          cropYear: '2025-2026'
        },
        packaging: PackagingType.PP_BAG_50KG,
        availabilityDate: 'Immediate Ready Stock',
        cropYear: '2025-2026',
        stockImages: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
        ],
        notes: 'Premium export grade 1121 Golden Sella. AGMARK Grade A certified.',
        status: ListingStatus.PUBLISHED,
        moderationFlagged: false,
        createdAt: '2026-02-01T10:00:00.000Z',
        updatedAt: '2026-02-01T10:00:00.000Z'
      },
      {
        id: 'lst-1026',
        sellerId: seller2Profile.id,
        anonymousCode: 'PRG-1026',
        category: RiceCategory.STEAM_RICE,
        variety: '1509 Steam Basmati Extra Long Grain',
        classification: RiceClassification.BASMATI,
        availableQuantityMT: 750,
        minOrderQuantityMT: 50,
        maxOrderQuantityMT: 750,
        askingPricePerQuintal: 7400,
        brokerageOffered: 1.0,
        brokerageType: BrokerageType.PERCENTAGE,
        millLocation: 'Jandiala Guru Mill Area, Amritsar',
        dispatchLocation: 'Amritsar Dry Port',
        generalizedDistrict: 'Amritsar',
        generalizedState: 'Punjab',
        qualitySpecs: {
          grainLengthMm: 8.42,
          whiteness: 42.0,
          moisturePercent: 12.2,
          brokenPercent: 1.5,
          foreignMatterPercent: 0.08,
          damagedGrainPercent: 0.7,
          chalkyGrainPercent: 1.2,
          yellowGrainPercent: 0.4,
          sortex: true,
          cropYear: '2025-2026'
        },
        packaging: PackagingType.BOPP_BAG_25KG,
        availabilityDate: 'Ready for Dispatch',
        cropYear: '2025-2026',
        stockImages: [
          'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80'
        ],
        notes: 'High aromatic cooking quality. Excellent kernel elongation.',
        status: ListingStatus.PUBLISHED,
        moderationFlagged: false,
        createdAt: '2026-02-05T12:00:00.000Z',
        updatedAt: '2026-02-05T12:00:00.000Z'
      },
      {
        id: 'lst-1028',
        sellerId: seller1Profile.id,
        anonymousCode: 'PRG-1028',
        category: RiceCategory.RAW_RICE,
        variety: 'Sona Masoori Raw Aged Rice',
        classification: RiceClassification.NON_BASMATI,
        availableQuantityMT: 400,
        minOrderQuantityMT: 20,
        maxOrderQuantityMT: 400,
        askingPricePerQuintal: 5200,
        brokerageOffered: 75,
        brokerageType: BrokerageType.PER_METRIC_TONNE,
        millLocation: 'Gondia Processing Complex',
        dispatchLocation: 'Nagpur Rail Siding',
        generalizedDistrict: 'Gondia',
        generalizedState: 'Maharashtra',
        qualitySpecs: {
          grainLengthMm: 5.25,
          whiteness: 39.0,
          moisturePercent: 11.8,
          brokenPercent: 2.0,
          foreignMatterPercent: 0.1,
          damagedGrainPercent: 0.8,
          chalkyGrainPercent: 1.5,
          yellowGrainPercent: 0.5,
          sortex: true,
          cropYear: '2024-2025'
        },
        packaging: PackagingType.JUTE_BAG_50KG,
        availabilityDate: 'Immediate Loading',
        cropYear: '2024-2025',
        stockImages: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
        ],
        notes: 'Naturally aged 18+ months. Light weight non-sticky texture.',
        status: ListingStatus.PUBLISHED,
        moderationFlagged: false,
        createdAt: '2026-02-10T14:30:00.000Z',
        updatedAt: '2026-02-10T14:30:00.000Z'
      },
      {
        id: 'lst-3428',
        sellerId: seller3Profile.id,
        anonymousCode: 'PRG-3428',
        category: RiceCategory.GOLDEN_SELLA_RICE,
        variety: '1121 Golden Sella Basmati',
        classification: RiceClassification.BASMATI,
        availableQuantityMT: 70,
        minOrderQuantityMT: 20,
        maxOrderQuantityMT: 70,
        askingPricePerQuintal: 9000,
        brokerageOffered: 40,
        brokerageType: BrokerageType.PER_METRIC_TONNE,
        millLocation: 'TOHANA Mill Yard, Haryana',
        dispatchLocation: 'TOHANA',
        generalizedDistrict: 'Fatehabad',
        generalizedState: 'Haryana',
        qualitySpecs: {
          grainLengthMm: 8.35,
          whiteness: 40.0,
          moisturePercent: 12.0,
          brokenPercent: 1.0,
          foreignMatterPercent: 0.05,
          damagedGrainPercent: 0.5,
          chalkyGrainPercent: 1.0,
          yellowGrainPercent: 0.4,
          sortex: true,
          cropYear: '2025-2026'
        },
        packaging: PackagingType.PP_BAG_50KG,
        availabilityDate: 'Immediate Stock',
        cropYear: '2025-2026',
        stockImages: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'
        ],
        notes: 'Bansal Traders verified ready lot ex-Tohana.',
        status: ListingStatus.PUBLISHED,
        moderationFlagged: false,
        createdAt: '2026-02-16T10:00:00.000Z',
        updatedAt: '2026-02-16T10:00:00.000Z'
      }
    );

    // 5. Pre-seeded Requirements
    this.requirements.push(
      {
        id: 'req-201',
        buyerId: buyer1Profile.id,
        requirementCode: 'REQ-2026-8801',
        category: RiceCategory.GOLDEN_SELLA_RICE,
        variety: '1121 Golden Sella Basmati',
        classification: RiceClassification.BASMATI,
        requiredQuantityMT: 200,
        minQuantityMT: 100,
        maxQuantityMT: 250,
        targetPricePerQuintal: 8100,
        targetPricePerMT: 81000,
        deliveryLocation: 'Mundra Port CFS, Gujarat',
        preferredDeliveryDate: '2026-03-15',
        paymentTermsOffered: '10% Advance, 90% Against Delivery Bilty & Quality Report',
        qualitySpecs: {
          grainLengthMm: 8.35,
          whiteness: 40.0,
          moisturePercent: 12.0,
          brokenPercent: 1.0,
          sortex: true
        },
        packagingRequired: PackagingType.PP_BAG_50KG,
        status: 'MATCHED' as any,
        matchedListingsCount: 1,
        createdAt: '2026-02-15T09:00:00.000Z',
        updatedAt: '2026-02-15T09:00:00.000Z'
      },
      {
        id: 'req-haruana-01',
        buyerId: buyer2Profile.id,
        requirementCode: 'REQ-2026-3401',
        category: RiceCategory.GOLDEN_SELLA_RICE,
        variety: '1121 Golden Sella Basmati',
        classification: RiceClassification.BASMATI,
        requiredQuantityMT: 70,
        minQuantityMT: 50,
        maxQuantityMT: 100,
        targetPricePerQuintal: 8950,
        targetPricePerMT: 89500,
        deliveryLocation: 'TONA, Haryana',
        preferredDeliveryDate: 'Immediate Dispatch',
        paymentTermsOffered: '10% Advance Escrow, 90% on Tohana Yard Loading',
        qualitySpecs: {
          grainLengthMm: 8.35,
          whiteness: 40.0,
          moisturePercent: 12.0,
          brokenPercent: 1.0,
          sortex: true
        },
        packagingRequired: PackagingType.PP_BAG_50KG,
        status: 'OPEN' as any,
        matchedListingsCount: 1,
        createdAt: '2026-02-16T11:00:00.000Z',
        updatedAt: '2026-02-16T11:00:00.000Z'
      }
    );

    // 6. Pre-seeded Enquiries
    this.enquiries.push(
      {
        id: 'enq-301',
        buyerId: buyer1Profile.id,
        listingId: 'lst-1025',
        enquiryCode: 'ENQ-2026-4401',
        anonymousListingCode: 'PRG-1025',
        requestedQuantityMT: 100,
        targetPricePerQuintal: 8150,
        buyerNotes: 'Ready for immediate dispatch contract upon broker verification.',
        adminStatus: 'CONVERTED_TO_DEAL' as any,
        sellerInformedStatus: 'ACCEPTED' as any,
        createdAt: '2026-02-18T11:00:00.000Z',
        updatedAt: '2026-02-18T14:00:00.000Z'
      },
      {
        id: 'enq-haruana-01',
        buyerId: buyer2Profile.id,
        listingId: 'lst-3428',
        enquiryCode: 'ENQ-2026-7789',
        anonymousListingCode: 'PRG-3428',
        requestedQuantityMT: 70,
        targetPricePerQuintal: 8950,
        buyerNotes: 'Commercial purchase enquiry for Bansal Traders Tohana yard stock.',
        adminStatus: 'PENDING_ADMIN_REVIEW' as any,
        sellerInformedStatus: 'ACCEPTED' as any,
        createdAt: '2026-02-18T12:00:00.000Z',
        updatedAt: '2026-02-18T12:00:00.000Z'
      }
    );

    // 7. Confirmed Purchase Order
    this.purchaseOrders.push({
      id: 'po-401',
      poNumber: 'PO-2026-9042',
      orderDate: '2026-02-20T10:00:00.000Z',
      enquiryId: 'enq-301',
      listingId: 'lst-1026',
      buyerId: buyer1Profile.id,
      buyerCompanyName: buyer1Profile.companyName,
      sellerId: seller2Profile.id,
      sellerCompanyName: seller2Profile.millName,
      intermediaryBroker: 'Pragyam Enterprises (Tohana Central Desk)',
      riceCategory: RiceCategory.STEAM_RICE,
      riceVariety: '1509 Steam Basmati Extra Long Grain',
      classification: RiceClassification.BASMATI,
      quantityMT: 100,
      quantityQuintals: 1000,
      agreedRatePerQuintal: 7400,
      agreedRatePerMT: 74000,
      totalGoodsValue: 7400000,
      brokerageAmount: 74000,
      brokeragePerMT: 740,
      totalBrokerageAmount: 74000,
      brokerageType: BrokerageType.PER_METRIC_TONNE,
      brokeragePayee: BrokeragePayee.BOTH_SPLIT,
      paymentTerms: '20% Advance on PO confirmation, 80% on Dispatch Bilty issuance.',
      qualitySpecs: {
        grainLengthMm: 8.42,
        whiteness: 42.0,
        moisturePercent: 12.2,
        brokenPercent: 1.5,
        sortex: true,
        cropYear: '2025-2026'
      } as any,
      packaging: PackagingType.PP_BAG_50KG,
      dispatchLocation: 'Taraori Mill Depot, Karnal',
      deliveryLocation: 'Kandla CFS Yard, Gujarat',
      deliveryDate: '2026-03-05',
      expectedDispatchDate: '2026-02-28',
      deliveryDeadline: '2026-03-05',
      status: PurchaseOrderStatus.IN_TRANSIT,
      createdAt: '2026-02-20T10:00:00.000Z',
      updatedAt: '2026-02-25T16:00:00.000Z'
    } as any);

    // 8. Transport Record
    this.transportRecords.push({
      id: 'trp-501',
      purchaseOrderId: 'po-401',
      poId: 'po-401',
      poNumber: 'PO-2026-9042',
      transporterName: 'Om Logistics Inter-State Carriers',
      driverName: 'Gurmeet Singh',
      driverPhone: '+91 98120 54321',
      vehicleNumber: 'HR-05-AW-8921',
      biltyNumber: 'LR-2026-8819',
      ewayBillNumber: 'EWB-77192019',
      loadedQuantityMT: 50,
      quantityLoadedMT: 50,
      bagCount: 1000,
      loadingLocation: 'Taraori Mill Depot, Karnal',
      deliveryLocation: 'Kandla CFS Yard, Gujarat',
      loadingDate: '2026-02-25T12:00:00.000Z',
      dispatchDate: '2026-02-25T14:30:00.000Z',
      expectedDeliveryDate: '2026-03-01T18:00:00.000Z',
      estimatedArrival: '2026-03-01T18:00:00.000Z',
      deliveryCFSLocation: 'Kandla CFS Yard, Gujarat',
      freightCharges: 38000,
      freightStatus: 'PAID_BY_BUYER',
      status: TransportStatus.IN_TRANSIT,
      statusLogs: [
        {
          status: TransportStatus.DISPATCHED,
          timestamp: '2026-02-25T14:30:00.000Z',
          locationNote: 'Vehicle departed from Taraori Mill Depot'
        },
        {
          status: TransportStatus.IN_TRANSIT,
          timestamp: '2026-02-26T10:00:00.000Z',
          locationNote: 'Passing Jaipur-Ajmer Expressway'
        }
      ],
      createdAt: '2026-02-25T15:00:00.000Z',
      updatedAt: '2026-02-25T15:00:00.000Z'
    } as any);

    // 9. Payment Record
    this.payments.push({
      id: 'pay-601',
      purchaseOrderId: 'po-401',
      poId: 'po-401',
      poNumber: 'PO-2026-9042',
      payerName: 'Royal Feast Global Exporters Pvt Ltd',
      payerId: buyer1Profile.id,
      payerRole: 'BUYER',
      amount: 1480000,
      paymentType: PaymentType.BROKERAGE_PAYMENT,
      paymentMethod: PaymentMethod.RTGS,
      method: 'RTGS Transfer',
      referenceNumber: 'RTGS-2026-881920',
      paymentReference: 'RTGS-2026-881920',
      paymentDate: '2026-02-21T11:00:00.000Z',
      status: PaymentStatus.VERIFIED,
      transactionDate: '2026-02-21T11:00:00.000Z',
      verifiedByAdmin: true,
      notes: 'Advance 20% verified in Pragyam Brokerage Escrow Account.'
    } as any);

    // 10. Brokerage Invoice
    this.invoices.push({
      id: 'inv-701',
      invoiceNumber: 'PRG/INV/2026/042',
      invoiceType: 'BROKERAGE_INVOICE',
      purchaseOrderId: 'po-401',
      poId: 'po-401',
      poNumber: 'PO-2026-9042',
      issuerName: 'Pragyam Enterprises',
      issuerPan: 'HSAPB2553Q',
      bankDetails: 'Bank of Baroda | Tohana | A/C: 53600100009068 | IFSC: BARB0TOHANA (Nikhil Bansal)',
      billedToRole: UserRole.BUYER,
      billedToName: buyer1Profile.companyName,
      clientName: buyer1Profile.companyName,
      clientGstin: buyer1Profile.gstin,
      sacCode: '998319',
      hsnSacCode: '998319',
      brokerageAmount: 37000,
      taxableAmount: 37000,
      cgstPercent: 9.0,
      cgstRate: 9.0,
      cgstAmount: 3330,
      sgstPercent: 9.0,
      sgstRate: 9.0,
      sgstAmount: 3330,
      igstPercent: 0,
      igstRate: 0,
      igstAmount: 0,
      totalTaxAmount: 6660,
      totalTax: 6660,
      grandTotal: 43660,
      status: 'GENERATED' as any,
      issueDate: '2026-02-20T12:00:00.000Z',
      invoiceDate: '2026-02-20T12:00:00.000Z',
      dueDate: '2026-03-05T00:00:00.000Z'
    } as any);

    // 11. Negotiations Desk
    this.negotiations.push(
      {
        id: 'neg-101',
        enquiryId: 'enq-301',
        buyerId: buyer1Profile.id,
        buyerCompanyName: 'Royal Feast Global Exporters Pvt Ltd',
        sellerId: seller1Profile.id,
        sellerMillName: 'Taraori Golden Rice Mills Ltd',
        sellerCompanyName: 'Taraori Golden Rice Mills Ltd',
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
        brokeragePayee: 'BUYER_AND_SELLER_SPLIT' as any,
        status: 'AGREED' as any,
        history: [
          { actor: 'BUYER' as any, note: 'Offered ₹8,100/Qtl for 100 MT ex-Karnal depot' },
          { actor: 'SELLER' as any, note: 'Quoted ₹8,200/Qtl ex-mill gate' },
          { actor: 'ADMIN' as any, note: 'Broker counter-offer settled at ₹8,150/Qtl mutually accepted' }
        ],
        updatedAt: new Date().toISOString()
      } as any,
      {
        id: 'neg-bansal-01',
        enquiryId: 'enq-haruana-01',
        buyerId: buyer2Profile.id,
        buyerCompanyName: 'haruana (Representative: BANAN)',
        sellerId: seller3Profile.id,
        sellerMillName: 'BANSAL TRADERS (Satyanarayan)',
        sellerCompanyName: 'BASNAL TRADESR',
        anonymousListingCode: 'PRG-3428',
        variety: '1121 Golden Sella Basmati',
        requestedQuantityMT: 70,
        agreedQuantityMT: 70,
        buyerTargetPrice: 8900,
        sellerAskingPrice: 9000,
        sellerInitialPrice: 9000,
        adminNegotiatedPrice: 8950,
        finalAgreedPrice: 8950,
        brokeragePerMT: 40,
        brokeragePerUnit: 40,
        brokeragePayee: 'BUYER_AND_SELLER_SPLIT' as any,
        status: 'UNDER_BROKER_REVIEW' as any,
        history: [
          { actor: 'SELLER' as any, note: 'Bansal Traders listed 70 MT @ ₹9,000/Qtl ex-Tohana yard with ₹40/MT brokerage offered' },
          { actor: 'BUYER' as any, note: 'haruana submitted procurement enquiry at target ₹8,900/Qtl' },
          { actor: 'ADMIN' as any, note: 'Pragyam Central Intermediary Desk counter-settlement proposed at ₹8,950/Qtl' }
        ],
        updatedAt: new Date().toISOString()
      } as any
    );

    // 12. Audit Log
    this.auditLogs.push({
      id: 'AUD-001',
      timestamp: new Date().toISOString(),
      userId: 'usr-admin-001',
      userRole: UserRole.SUPER_ADMIN,
      action: 'BOOTSTRAP_COMPLETE',
      entityType: 'SYSTEM',
      entityId: 'PRAGYAM-PLATFORM',
      details: 'Pragyam Enterprises Brokerage Intermediary System fully operational.'
    });
  }

  private getStoragePath() {
    const tmpDir = process.platform === 'win32' ? process.env.TEMP || 'C:\\Windows\\Temp' : '/tmp';
    return path.join(tmpDir, 'pragyam_serverless_db.json');
  }

  public persist() {
    try {
      const data = {
        users: this.users,
        buyerProfiles: this.buyerProfiles,
        sellerProfiles: this.sellerProfiles,
        listings: this.listings,
        requirements: this.requirements,
        enquiries: this.enquiries,
        negotiations: this.negotiations,
        purchaseOrders: this.purchaseOrders,
        transportRecords: this.transportRecords,
        payments: this.payments,
        invoices: this.invoices,
        auditLogs: this.auditLogs
      };
      fs.writeFileSync(this.getStoragePath(), JSON.stringify(data), 'utf-8');
    } catch (e) {
      // Non-fatal on restricted environments
    }
  }

  public loadFromDisk() {
    try {
      const p = this.getStoragePath();
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.users)) {
            const userMap = new Map(this.users.map(u => [u.id, u]));
            parsed.users.forEach((u: any) => userMap.set(u.id, u));
            this.users = Array.from(userMap.values());
          }
          if (Array.isArray(parsed.buyerProfiles)) {
            const buyerMap = new Map(this.buyerProfiles.map(b => [b.id, b]));
            parsed.buyerProfiles.forEach((b: any) => buyerMap.set(b.id, b));
            this.buyerProfiles = Array.from(buyerMap.values());
          }
          if (Array.isArray(parsed.sellerProfiles)) {
            const sellerMap = new Map(this.sellerProfiles.map(s => [s.id, s]));
            parsed.sellerProfiles.forEach((s: any) => sellerMap.set(s.id, s));
            this.sellerProfiles = Array.from(sellerMap.values());
          }
          if (Array.isArray(parsed.listings)) {
            const listingMap = new Map(this.listings.map(l => [l.id, l]));
            parsed.listings.forEach((l: any) => listingMap.set(l.id, l));
            this.listings = Array.from(listingMap.values());
          }
          if (Array.isArray(parsed.requirements)) {
            const reqMap = new Map(this.requirements.map(r => [r.id, r]));
            parsed.requirements.forEach((r: any) => reqMap.set(r.id, r));
            this.requirements = Array.from(reqMap.values());
          }
          if (Array.isArray(parsed.enquiries)) {
            const enqMap = new Map(this.enquiries.map(e => [e.id, e]));
            parsed.enquiries.forEach((e: any) => enqMap.set(e.id, e));
            this.enquiries = Array.from(enqMap.values());
          }
          if (Array.isArray(parsed.negotiations)) {
            const negMap = new Map(this.negotiations.map(n => [n.id, n]));
            parsed.negotiations.forEach((n: any) => negMap.set(n.id, n));
            this.negotiations = Array.from(negMap.values());
          }
          if (Array.isArray(parsed.purchaseOrders)) {
            const poMap = new Map(this.purchaseOrders.map(p => [p.id, p]));
            parsed.purchaseOrders.forEach((p: any) => poMap.set(p.id, p));
            this.purchaseOrders = Array.from(poMap.values());
          }
          if (Array.isArray(parsed.transportRecords)) {
            const trMap = new Map(this.transportRecords.map(t => [t.id, t]));
            parsed.transportRecords.forEach((t: any) => trMap.set(t.id, t));
            this.transportRecords = Array.from(trMap.values());
          }
          if (Array.isArray(parsed.payments)) {
            const payMap = new Map(this.payments.map(p => [p.id, p]));
            parsed.payments.forEach((p: any) => payMap.set(p.id, p));
            this.payments = Array.from(payMap.values());
          }
          if (Array.isArray(parsed.invoices)) {
            const invMap = new Map(this.invoices.map(i => [i.id, i]));
            parsed.invoices.forEach((i: any) => invMap.set(i.id, i));
            this.invoices = Array.from(invMap.values());
          }
          if (Array.isArray(parsed.auditLogs)) {
            const auditMap = new Map(this.auditLogs.map(a => [a.id, a]));
            parsed.auditLogs.forEach((a: any) => auditMap.set(a.id, a));
            this.auditLogs = Array.from(auditMap.values());
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Helper getters
  public findUser(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getBuyerProfile(userId: string) {
    return this.buyerProfiles.find(b => b.userId === userId);
  }

  public getSellerProfile(userId: string) {
    return this.sellerProfiles.find(s => s.userId === userId);
  }
}

// Global singleton instance
const globalStore = new ServerlessDataStore();
globalStore.loadFromDisk();
export const db = globalStore;
