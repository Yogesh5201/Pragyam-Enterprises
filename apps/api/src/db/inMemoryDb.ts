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
import bcrypt from 'bcryptjs';

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  mfaSecret?: string;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface DbListing {
  id: string;
  sellerId: string;
  anonymousCode: string; // e.g. PRG-1025
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
  moderationReason?: string;
  createdAt: string;
  updatedAt: string;
}

class DatabaseStore {
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
  public notifications: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }> = [];

  private isSeeded = false;

  constructor() {
    this.seedInitialData();
  }

  public logAudit(
    userId: string,
    userRole: UserRole,
    action: string,
    entityType: string,
    entityId: string,
    details: string,
    ipAddress?: string
  ) {
    const entry: AuditLogDTO = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      entityType,
      entityId,
      details,
      ipAddress
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  public seedInitialData() {
    if (this.isSeeded) return;
    this.isSeeded = true;

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('Pragyam@2026', salt);
    const adminPasswordHash = bcrypt.hashSync('Pragyam@Admin2026!', salt);

    // 1. Super Admin
    const adminUser: DbUser = {
      id: 'usr-admin-001',
      email: 'admin@pragyam.com',
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      mfaEnabled: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    };
    this.users.push(adminUser);

    // 2. Sellers
    const seller1User: DbUser = {
      id: 'usr-seller-001',
      email: 'taraori@mills.com',
      passwordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z'
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
      isVerified: true,
      createdAt: '2026-01-10T00:00:00.000Z',
      updatedAt: '2026-01-10T00:00:00.000Z'
    };

    const seller2User: DbUser = {
      id: 'usr-seller-002',
      email: 'amritsar@agro.com',
      passwordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z'
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
      isVerified: true,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z'
    };

    const seller3User: DbUser = {
      id: 'usr-seller-003',
      email: 'gondia@ricex.com',
      passwordHash,
      role: UserRole.SELLER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-20T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z'
    };
    const seller3Profile: DbSellerProfile = {
      id: 'sel-prof-003',
      userId: seller3User.id,
      fullName: 'Vinod Kumar Agrawal',
      companyName: 'Vidarbha Rice Processing Corp',
      phone: '+91 94221 88776',
      address: 'Kudwa MIDC Area',
      city: 'Gondia',
      district: 'Gondia',
      state: 'Maharashtra',
      pinCode: '441614',
      gstin: '27AABCV3322P1ZA',
      panNumber: 'AABCV3322P',
      businessType: BusinessType.RICE_MILLER,
      millName: 'Gondia Parboiled & Raw Rice Plant',
      millCapacityMTPerDay: 180,
      dispatchLocations: ['Nagpur Rail Depot', 'JNPT CFS'],
      isVerified: true,
      createdAt: '2026-01-20T00:00:00.000Z',
      updatedAt: '2026-01-20T00:00:00.000Z'
    };

    this.users.push(seller1User, seller2User, seller3User);
    this.sellerProfiles.push(seller1Profile, seller2Profile, seller3Profile);

    // 3. Buyers
    const buyer1User: DbUser = {
      id: 'usr-buyer-001',
      email: 'exports@royalfeast.com',
      passwordHash,
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-05T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z'
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
      isVerified: true,
      createdAt: '2026-01-05T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z'
    };

    const buyer2User: DbUser = {
      id: 'usr-buyer-002',
      email: 'orders@mumbaigrain.com',
      passwordHash,
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      mfaEnabled: false,
      createdAt: '2026-01-18T00:00:00.000Z',
      updatedAt: '2026-01-18T00:00:00.000Z'
    };
    const buyer2Profile: DbBuyerProfile = {
      id: 'buy-prof-002',
      userId: buyer2User.id,
      fullName: 'Mahesh B. Shah',
      companyName: 'Navi Mumbai Agro Distribution Ltd',
      phone: '+91 98200 44556',
      address: 'APMC Market II, Sector 19, Vashi',
      city: 'Navi Mumbai',
      district: 'Thane',
      state: 'Maharashtra',
      pinCode: '400703',
      gstin: '27AABCN7766D1ZY',
      panNumber: 'AABCN7766D',
      businessType: BusinessType.WHOLESALER,
      isVerified: true,
      createdAt: '2026-01-18T00:00:00.000Z',
      updatedAt: '2026-01-18T00:00:00.000Z'
    };

    this.users.push(buyer1User, buyer2User);
    this.buyerProfiles.push(buyer1Profile, buyer2Profile);

    // 4. Initial Anonymous Listings (Real rice varieties)
    const listing1: DbListing = {
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
      brokerageOffered: 100, // Rs 100 per MT
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
      availabilityDate: '2026-11-10T00:00:00.000Z',
      cropYear: '2025-2026',
      stockImages: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
      notes: 'Export standard double polish 1121 Golden Sella, aged paddy milling.',
      status: ListingStatus.ACTIVE,
      moderationFlagged: false,
      createdAt: '2026-10-25T10:00:00.000Z',
      updatedAt: '2026-10-25T10:00:00.000Z'
    };

    const listing2: DbListing = {
      id: 'lst-1048',
      sellerId: seller2Profile.id,
      anonymousCode: 'PRG-1048',
      category: RiceCategory.STEAM_RICE,
      variety: '1509 Basmati Steam',
      classification: RiceClassification.BASMATI,
      availableQuantityMT: 350,
      minOrderQuantityMT: 30,
      maxOrderQuantityMT: 350,
      askingPricePerQuintal: 6800,
      brokerageOffered: 100,
      brokerageType: BrokerageType.PER_METRIC_TONNE,
      millLocation: 'GT Road, Jandiala Guru, Amritsar',
      dispatchLocation: 'Amritsar Yard',
      generalizedDistrict: 'Amritsar',
      generalizedState: 'Punjab',
      qualitySpecs: {
        grainLengthMm: 8.40,
        whiteness: 42.5,
        moisturePercent: 12.5,
        brokenPercent: 1.5,
        foreignMatterPercent: 0.1,
        damagedGrainPercent: 0.7,
        chalkyGrainPercent: 1.2,
        yellowGrainPercent: 0.4,
        sortex: true,
        cropYear: '2025-2026'
      },
      packaging: PackagingType.NON_WOVEN_BAG_10KG,
      availabilityDate: '2026-11-05T00:00:00.000Z',
      cropYear: '2025-2026',
      stockImages: ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'],
      notes: 'Super white 1509 Steam, optimal elongation on cooking.',
      status: ListingStatus.ACTIVE,
      moderationFlagged: false,
      createdAt: '2026-10-28T14:30:00.000Z',
      updatedAt: '2026-10-28T14:30:00.000Z'
    };

    const listing3: DbListing = {
      id: 'lst-1092',
      sellerId: seller3Profile.id,
      anonymousCode: 'PRG-1092',
      category: RiceCategory.RAW_RICE,
      variety: 'Sona Masoori Raw Old Crop',
      classification: RiceClassification.NON_BASMATI,
      availableQuantityMT: 800,
      minOrderQuantityMT: 50,
      maxOrderQuantityMT: 800,
      askingPricePerQuintal: 4800,
      brokerageOffered: 50,
      brokerageType: BrokerageType.PER_METRIC_TONNE,
      millLocation: 'MIDC Gondia',
      dispatchLocation: 'Gondia Rail Siding',
      generalizedDistrict: 'Gondia',
      generalizedState: 'Maharashtra',
      qualitySpecs: {
        grainLengthMm: 5.20,
        whiteness: 39.0,
        moisturePercent: 13.0,
        brokenPercent: 2.0,
        foreignMatterPercent: 0.1,
        damagedGrainPercent: 0.5,
        chalkyGrainPercent: 1.5,
        yellowGrainPercent: 0.3,
        sortex: true,
        cropYear: '2024-2025'
      },
      packaging: PackagingType.PP_BAG_25KG,
      availabilityDate: '2026-11-01T00:00:00.000Z',
      cropYear: '2024-2025',
      stockImages: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
      notes: '12 months naturally aged Sona Masoori, ideal for catering & retail.',
      status: ListingStatus.ACTIVE,
      moderationFlagged: false,
      createdAt: '2026-10-20T09:15:00.000Z',
      updatedAt: '2026-10-20T09:15:00.000Z'
    };

    const listing4: DbListing = {
      id: 'lst-2015',
      sellerId: seller1Profile.id,
      anonymousCode: 'PRG-2015',
      category: RiceCategory.SELLA_RICE,
      variety: 'Sugandha White Sella',
      classification: RiceClassification.NON_BASMATI,
      availableQuantityMT: 450,
      minOrderQuantityMT: 25,
      maxOrderQuantityMT: 450,
      askingPricePerQuintal: 5400,
      brokerageOffered: 80,
      brokerageType: BrokerageType.PER_METRIC_TONNE,
      millLocation: 'Taraori Industrial Area',
      dispatchLocation: 'Karnal Dispatch Depot',
      generalizedDistrict: 'Karnal',
      generalizedState: 'Haryana',
      qualitySpecs: {
        grainLengthMm: 7.85,
        whiteness: 41.0,
        moisturePercent: 12.2,
        brokenPercent: 1.2,
        foreignMatterPercent: 0.08,
        damagedGrainPercent: 0.6,
        chalkyGrainPercent: 1.0,
        yellowGrainPercent: 0.3,
        sortex: true,
        cropYear: '2025-2026'
      },
      packaging: PackagingType.PP_BAG_50KG,
      availabilityDate: '2026-11-15T00:00:00.000Z',
      cropYear: '2025-2026',
      stockImages: ['https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80'],
      notes: 'Top grade Sugandha White Sella, zero chalkiness.',
      status: ListingStatus.ACTIVE,
      moderationFlagged: false,
      createdAt: '2026-10-29T11:00:00.000Z',
      updatedAt: '2026-10-29T11:00:00.000Z'
    };

    this.listings.push(listing1, listing2, listing3, listing4);

    // 5. Purchase Requirements (Buyer side)
    const requirement1: PurchaseRequirementDTO = {
      id: 'req-4081',
      anonymousCode: 'REQ-4081',
      buyerId: buyer1Profile.id,
      buyerName: buyer1Profile.fullName,
      buyerCompanyName: buyer1Profile.companyName,
      category: RiceCategory.GOLDEN_SELLA_RICE,
      variety: '1121 Golden Sella Basmati',
      classification: RiceClassification.BASMATI,
      requiredQuantityMT: 200,
      requiredQuantityQuintals: 2000,
      targetPricePerQuintal: 8100,
      targetPricePerMT: 81000,
      qualitySpecs: {
        grainLengthMm: 8.35,
        whiteness: 40.0,
        moisturePercent: 12.5,
        brokenPercent: 1.0,
        foreignMatterPercent: 0.05,
        damagedGrainPercent: 0.5,
        chalkyGrainPercent: 1.0,
        yellowGrainPercent: 0.5,
        sortex: true,
        cropYear: '2025-2026'
      },
      packagingRequirement: PackagingType.PP_BAG_50KG,
      deliveryLocation: {
        city: 'New Delhi',
        district: 'New Delhi',
        state: 'Delhi',
        pinCode: '110001'
      },
      requiredDeliveryDate: '2026-11-20T00:00:00.000Z',
      additionalNotes: 'Urgent container shipment for Middle East buyer. Require inspection report.',
      status: 'OPEN',
      createdAt: '2026-10-30T10:00:00.000Z'
    };

    const requirement2: PurchaseRequirementDTO = {
      id: 'req-4095',
      anonymousCode: 'REQ-4095',
      buyerId: buyer2Profile.id,
      buyerName: buyer2Profile.fullName,
      buyerCompanyName: buyer2Profile.companyName,
      category: RiceCategory.RAW_RICE,
      variety: 'Sona Masoori Raw Old Crop',
      classification: RiceClassification.NON_BASMATI,
      requiredQuantityMT: 300,
      requiredQuantityQuintals: 3000,
      targetPricePerQuintal: 4750,
      targetPricePerMT: 47500,
      qualitySpecs: {
        grainLengthMm: 5.20,
        whiteness: 39.0,
        moisturePercent: 13.0,
        brokenPercent: 2.0,
        foreignMatterPercent: 0.1,
        damagedGrainPercent: 0.5,
        chalkyGrainPercent: 1.5,
        yellowGrainPercent: 0.3,
        sortex: true,
        cropYear: '2024-2025'
      },
      packagingRequirement: PackagingType.PP_BAG_25KG,
      deliveryLocation: {
        city: 'Navi Mumbai',
        district: 'Thane',
        state: 'Maharashtra',
        pinCode: '400703'
      },
      requiredDeliveryDate: '2026-11-25T00:00:00.000Z',
      additionalNotes: 'Monthly regular replenishment order.',
      status: 'UNDER_NEGOTIATION',
      createdAt: '2026-10-31T15:20:00.000Z'
    };

    this.requirements.push(requirement1, requirement2);

    // 6. Purchase Enquiry
    const enquiry1: PurchaseEnquiryDTO = {
      id: 'enq-7023',
      enquiryCode: 'ENQ-7023',
      listingId: listing1.id,
      anonymousListingCode: listing1.anonymousCode,
      category: listing1.category,
      variety: listing1.variety,
      buyerId: buyer1Profile.id,
      buyerCompanyName: buyer1Profile.companyName,
      requestedQuantityMT: 100,
      targetPricePerQuintal: 8150,
      buyerNotes: 'Ready to place immediate contract if price is ₹8,150/quintal.',
      adminStatus: 'CONVERTED_TO_PO',
      adminNotes: 'Negotiated with Taraori Mills to close at ₹8,150. Commission ₹100/MT.',
      createdAt: '2026-10-26T11:00:00.000Z'
    };
    this.enquiries.push(enquiry1);

    // 7. Negotiation Record
    const negotiation1: NegotiationRecordDTO = {
      id: 'neg-3011',
      enquiryId: enquiry1.id,
      listingId: listing1.id,
      anonymousListingCode: listing1.anonymousCode,
      buyerId: buyer1Profile.id,
      buyerCompanyName: buyer1Profile.companyName,
      sellerId: seller1Profile.id,
      sellerCompanyName: seller1Profile.companyName,
      sellerInitialPrice: 8200,
      buyerTargetPrice: 8100,
      adminNegotiatedPrice: 8150,
      finalAgreedPrice: 8150,
      agreedQuantityMT: 100,
      brokeragePerUnit: 100,
      brokerageType: BrokerageType.PER_METRIC_TONNE,
      brokeragePayee: BrokeragePayee.SELLER,
      buyerAgreed: true,
      sellerAgreed: true,
      adminConfirmed: true,
      notes: 'Deal finalized by Pragyam Brokerage Desk. Official PO created.',
      status: 'CONVERTED_TO_PO',
      updatedAt: '2026-10-27T16:00:00.000Z',
      history: [
        {
          timestamp: '2026-10-26T11:00:00.000Z',
          note: 'Buyer submitted enquiry with target price ₹8,100/Qtl.',
          price: 8100,
          actor: 'BUYER'
        },
        {
          timestamp: '2026-10-26T15:00:00.000Z',
          note: 'Admin consulted Seller. Seller agreed to discount from ₹8,200 to ₹8,150.',
          price: 8150,
          actor: 'ADMIN'
        },
        {
          timestamp: '2026-10-27T10:30:00.000Z',
          note: 'Buyer accepted agreed price ₹8,150/Qtl.',
          price: 8150,
          actor: 'BUYER'
        },
        {
          timestamp: '2026-10-27T12:00:00.000Z',
          note: 'Admin locked deal. Purchase Order PE-PO-2026-001 issued.',
          price: 8150,
          actor: 'ADMIN'
        }
      ]
    };
    this.negotiations.push(negotiation1);

    // 8. Purchase Order (Official Pragyam PO)
    const goodsTotal = 100 * 10 * 8150; // 100 MT = 1000 Qtl * 8150 = ₹81,50,000
    const brokerageTotal = 100 * 100; // 100 MT * 100 = ₹10,000
    const po1: PurchaseOrderDTO = {
      id: 'po-2026-001',
      poNumber: 'PE-PO-2026-001',
      orderDate: '2026-10-27T12:00:00.000Z',
      riceCategory: RiceCategory.GOLDEN_SELLA_RICE,
      riceVariety: '1121 Golden Sella Basmati',
      classification: RiceClassification.BASMATI,
      quantityMT: 100,
      quantityQuintals: 1000,
      agreedRatePerQuintal: 8150,
      agreedRatePerMT: 81500,
      totalGoodsValue: goodsTotal,
      qualitySpecs: listing1.qualitySpecs,
      packaging: PackagingType.PP_BAG_50KG,
      dispatchLocation: 'Taraori Golden Rice Mills, Karnal, Haryana',
      deliveryLocation: 'Royal Feast CFS Yard, Okhla, New Delhi',
      deliveryDate: '2026-11-12T00:00:00.000Z',
      paymentTerms: '20% Advance against Bilty, 80% on destination delivery inspection',
      brokerageAmount: brokerageTotal,
      brokerageType: BrokerageType.PER_METRIC_TONNE,
      brokeragePayee: BrokeragePayee.SELLER,
      status: PurchaseOrderStatus.IN_TRANSIT,
      specialInstructions: 'Grain inspection certificate from SGS required at loading dock.',
      createdAt: '2026-10-27T12:00:00.000Z',
      updatedAt: '2026-10-29T09:00:00.000Z',
      pdfDocumentUrl: '/api/purchase-orders/po-2026-001/pdf',
      buyerId: buyer1Profile.id,
      buyerCompanyName: buyer1Profile.companyName,
      sellerId: seller1Profile.id,
      sellerCompanyName: seller1Profile.companyName
    };
    this.purchaseOrders.push(po1);

    // 9. Transport Record (Bilty / LR)
    const transport1: TransportRecordDTO = {
      id: 'trp-901',
      poId: po1.id,
      poNumber: po1.poNumber,
      transporterName: 'North-India Golden Logistics Corp',
      vehicleNumber: 'HR-05-AU-9821',
      driverName: 'Sarabjeet Singh',
      driverPhone: '+91 94160 22334',
      biltyNumber: 'LR-KNL-2026-7844',
      ewayBillNumber: 'EWB-2610-8899-1234',
      loadingLocation: 'Taraori Mill Depot, Karnal, Haryana',
      deliveryLocation: 'Royal Feast CFS Yard, New Delhi',
      loadingDate: '2026-10-28T09:00:00.000Z',
      dispatchDate: '2026-10-28T18:00:00.000Z',
      expectedDeliveryDate: '2026-10-30T14:00:00.000Z',
      quantityLoadedMT: 100,
      bagCount: 2000,
      freightCharges: 42000,
      freightStatus: 'PAID_BY_BUYER',
      status: TransportStatus.IN_TRANSIT,
      statusLogs: [
        {
          status: TransportStatus.TRANSPORT_ASSIGNED,
          timestamp: '2026-10-27T15:00:00.000Z',
          locationNote: 'Vehicle HR-05-AU-9821 assigned by broker'
        },
        {
          status: TransportStatus.VEHICLE_LOADING,
          timestamp: '2026-10-28T09:00:00.000Z',
          locationNote: '2000 PP bags of 50kg loaded at Taraori mill'
        },
        {
          status: TransportStatus.DISPATCHED,
          timestamp: '2026-10-28T18:00:00.000Z',
          locationNote: 'Vehicle cleared weighing bridge, Bilty LR-KNL-2026-7844 generated'
        },
        {
          status: TransportStatus.IN_TRANSIT,
          timestamp: '2026-10-29T08:00:00.000Z',
          locationNote: 'Vehicle crossed Panipat Toll Plaza, en route to Delhi'
        }
      ],
      proofOfDispatchUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
    };
    this.transportRecords.push(transport1);

    // 10. Payment Records
    const payment1: PaymentRecordDTO = {
      id: 'pay-001',
      poId: po1.id,
      poNumber: po1.poNumber,
      paymentType: PaymentType.GOODS_PAYMENT,
      amount: 1630000, // 20% advance
      payerRole: 'BUYER',
      payerId: buyer1Profile.id,
      payerName: buyer1Profile.companyName,
      method: PaymentMethod.RTGS,
      referenceNumber: 'RTGS-HDFC261028-98442',
      paymentDate: '2026-10-28T11:30:00.000Z',
      status: PaymentStatus.VERIFIED,
      verifiedByAdmin: true,
      notes: 'Advance 20% received directly into verified mill escrow account.'
    };

    const payment2: PaymentRecordDTO = {
      id: 'pay-002',
      poId: po1.id,
      poNumber: po1.poNumber,
      paymentType: PaymentType.BROKERAGE_PAYMENT,
      amount: 11800, // 10,000 + 18% GST = 11,800
      payerRole: 'SELLER',
      payerId: seller1Profile.id,
      payerName: seller1Profile.companyName,
      method: PaymentMethod.UPI,
      referenceNumber: 'UPI-261028-PRAGYAM-001',
      paymentDate: '2026-10-28T16:00:00.000Z',
      status: PaymentStatus.VERIFIED,
      verifiedByAdmin: true,
      notes: 'Brokerage fee + GST received into Pragyam Enterprises official account.'
    };

    this.payments.push(payment1, payment2);

    // 11. Invoice Record (Brokerage Tax Invoice)
    const invoice1: InvoiceDTO = {
      id: 'inv-pe-001',
      invoiceNumber: 'INV-PE-2026-0001',
      invoiceType: 'BROKERAGE_INVOICE',
      poId: po1.id,
      poNumber: po1.poNumber,
      issuerName: 'Pragyam Enterprises',
      issuerGstin: '06AAACP1234F1Z8',
      clientName: seller1Profile.companyName,
      clientGstin: seller1Profile.gstin,
      taxableAmount: 10000,
      cgstPercent: 9,
      cgstAmount: 900,
      sgstPercent: 9,
      sgstAmount: 900,
      igstPercent: 0,
      igstAmount: 0,
      totalTax: 1800,
      grandTotal: 11800,
      hsnSacCode: '998319',
      invoiceDate: '2026-10-28T17:00:00.000Z',
      pdfUrl: '/api/invoices/inv-pe-001/pdf'
    };
    this.invoices.push(invoice1);

    // Initial audit log
    this.logAudit(
      adminUser.id,
      UserRole.SUPER_ADMIN,
      'PLATFORM_BOOTSTRAP',
      'SYSTEM',
      'SYS-001',
      'System initialized with verified mills, buyers, listings, and seed transactions.'
    );
  }
}

export const db = new DatabaseStore();
