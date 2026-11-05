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

    this.users.push(seller1User, seller2User);
    this.sellerProfiles.push(seller1Profile, seller2Profile);

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

    this.users.push(buyer1User);
    this.buyerProfiles.push(buyer1Profile);

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
      }
    );

    // 5. Pre-seeded Requirements
    this.requirements.push({
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
    });

    // 6. Pre-seeded Enquiries
    this.enquiries.push({
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
    });

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
      intermediaryBroker: 'Pragyam Enterprises (Karnal Central Desk)',
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
      issuerGstin: '06AAACT4455R1Z2',
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

    // 11. Audit Log
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
export const db = globalStore;
