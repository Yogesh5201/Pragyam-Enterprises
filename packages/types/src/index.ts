// ==========================================
// PRAGYAM ENTERPRISES - CORE TYPES & DTOS
// ==========================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUYER = 'BUYER',
  SELLER = 'SELLER'
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED'
}

export enum BusinessType {
  RICE_MILLER = 'RICE_MILLER',
  WHOLESALER = 'WHOLESALER',
  EXPORTER = 'EXPORTER',
  COMMODITY_TRADER = 'COMMODITY_TRADER',
  COMMISSION_AGENT = 'COMMISSION_AGENT',
  INSTITUTIONAL_BUYER = 'INSTITUTIONAL_BUYER',
  RETAILER = 'RETAILER'
}

export enum RiceCategory {
  STEAM_RICE = 'STEAM_RICE',
  SELLA_RICE = 'SELLA_RICE',
  GOLDEN_SELLA_RICE = 'GOLDEN_SELLA_RICE',
  LEMON_SELLA_RICE = 'LEMON_SELLA_RICE',
  RAW_RICE = 'RAW_RICE',
  BROWN_RICE = 'BROWN_RICE'
}

export enum RiceClassification {
  BASMATI = 'BASMATI',
  NON_BASMATI = 'NON_BASMATI'
}

export enum PackagingType {
  JUTE_BAG_50KG = 'JUTE_BAG_50KG',
  PP_BAG_50KG = 'PP_BAG_50KG',
  PP_BAG_25KG = 'PP_BAG_25KG',
  BOPP_BAG_25KG = 'BOPP_BAG_25KG',
  NON_WOVEN_BAG_10KG = 'NON_WOVEN_BAG_10KG',
  LOOSE_BULK = 'LOOSE_BULK',
  CUSTOM = 'CUSTOM'
}

export enum QuantityUnit {
  METRIC_TONNE = 'METRIC_TONNE', // MT
  QUINTAL = 'QUINTAL'            // QTL (1 MT = 10 QTL)
}

export enum BrokerageType {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PER_METRIC_TONNE = 'PER_METRIC_TONNE',
  PER_QUINTAL = 'PER_QUINTAL',
  PERCENTAGE_OF_VALUE = 'PERCENTAGE_OF_VALUE',
  CUSTOM_NEGOTIATED = 'CUSTOM_NEGOTIATED'
}

export enum BrokeragePayee {
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  SPLIT = 'SPLIT'
}

export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED_BY_ADMIN = 'SUSPENDED_BY_ADMIN',
  SOLD_OUT = 'SOLD_OUT',
  ARCHIVED = 'ARCHIVED'
}

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  NEGOTIATION = 'NEGOTIATION',
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  READY_FOR_DISPATCH = 'READY_FOR_DISPATCH',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum TransportStatus {
  TRANSPORT_NOT_ASSIGNED = 'TRANSPORT_NOT_ASSIGNED',
  TRANSPORT_ASSIGNED = 'TRANSPORT_ASSIGNED',
  VEHICLE_LOADING = 'VEHICLE_LOADING',
  LOADED = 'LOADED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  REACHED_DESTINATION = 'REACHED_DESTINATION',
  DELIVERED = 'DELIVERED'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  IMPS = 'IMPS',
  CHEQUE = 'CHEQUE',
  ONLINE_GATEWAY = 'ONLINE_GATEWAY'
}

export enum PaymentType {
  GOODS_PAYMENT = 'GOODS_PAYMENT',
  BROKERAGE_PAYMENT = 'BROKERAGE_PAYMENT'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// ------------------------------------------
// Quality Specifications
// ------------------------------------------
export interface RiceQualitySpecs {
  grainLengthMm: number;        // e.g. 8.35
  whiteness: number;            // Kett scale, e.g. 38 - 42
  moisturePercent: number;      // e.g. 11.5 - 13.0
  brokenPercent: number;        // e.g. 1.0 - 2.0
  foreignMatterPercent: number; // e.g. 0.05
  damagedGrainPercent: number;  // e.g. 0.5
  chalkyGrainPercent: number;   // e.g. 1.0
  yellowGrainPercent: number;   // e.g. 0.5
  sortex: boolean;              // 100% Sortex Cleaned
  cropYear: string;             // e.g. '2024-2025' or '2025-2026'
}

// ------------------------------------------
// User Profiles & Confidentiality DTOs
// ------------------------------------------
export interface UserBase {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface BuyerProfile {
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
  purchasePreferences?: string[];
  isVerified: boolean;
}

export interface SellerProfile {
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

// ------------------------------------------
// Inventory Listings
// ------------------------------------------

// Anonymous listing visible ONLY to Buyers:
// NO seller name, NO mill name, NO phone, NO address!
export interface AnonymousInventoryListingDTO {
  id: string;
  anonymousCode: string; // e.g. "PRG-1025"
  category: RiceCategory;
  variety: string;
  classification: RiceClassification;
  availableQuantityMT: number;
  availableQuantityQuintals: number;
  minOrderQuantityMT: number;
  maxOrderQuantityMT: number;
  askingPricePerQuintal: number;
  askingPricePerMT: number;
  qualitySpecs: RiceQualitySpecs;
  packaging: PackagingType;
  generalizedLocation: {
    district: string;
    state: string;
  };
  availabilityDate: string;
  cropYear: string;
  stockImages: string[];
  status: ListingStatus;
  createdAt: string;
}

// Seller's own view of listing
export interface SellerInventoryListingDTO {
  id: string;
  anonymousCode: string;
  category: RiceCategory;
  variety: string;
  classification: RiceClassification;
  availableQuantityMT: number;
  availableQuantityQuintals: number;
  minOrderQuantityMT: number;
  maxOrderQuantityMT: number;
  askingPricePerQuintal: number;
  askingPricePerMT: number;
  brokerageOffered: number;
  brokerageType: BrokerageType;
  millLocation: string;
  dispatchLocation: string;
  qualitySpecs: RiceQualitySpecs;
  packaging: PackagingType;
  availabilityDate: string;
  cropYear: string;
  stockImages: string[];
  notes?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

// Admin complete view with seller identification
export interface AdminInventoryListingDTO extends SellerInventoryListingDTO {
  sellerId: string;
  sellerFullName: string;
  sellerCompanyName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerGstin?: string;
  moderationFlagged: boolean;
  moderationReason?: string;
}

// ------------------------------------------
// Purchase Requirements (Buyer side)
// ------------------------------------------
export interface PurchaseRequirementDTO {
  id: string;
  anonymousCode: string; // e.g. "REQ-4081"
  buyerId?: string; // Visible only to Admin
  buyerName?: string; // Visible only to Admin
  buyerCompanyName?: string; // Visible only to Admin
  category: RiceCategory;
  variety: string;
  classification: RiceClassification;
  requiredQuantityMT: number;
  requiredQuantityQuintals: number;
  targetPricePerQuintal: number;
  targetPricePerMT: number;
  qualitySpecs: RiceQualitySpecs;
  packagingRequirement: PackagingType;
  deliveryLocation: {
    city: string;
    district: string;
    state: string;
    pinCode?: string;
  };
  requiredDeliveryDate: string;
  additionalNotes?: string;
  status: 'OPEN' | 'MATCHED' | 'UNDER_NEGOTIATION' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

// ------------------------------------------
// Purchase Enquiries & Negotiations
// ------------------------------------------
export interface PurchaseEnquiryDTO {
  id: string;
  enquiryCode: string; // e.g. "ENQ-7023"
  listingId: string;
  anonymousListingCode: string;
  category: RiceCategory;
  variety: string;
  buyerId: string;
  buyerCompanyName?: string; // Admin only
  requestedQuantityMT: number;
  targetPricePerQuintal: number;
  buyerNotes?: string;
  adminStatus: 'PENDING_REVIEW' | 'SELLER_CONTACTED' | 'NEGOTIATING' | 'OFFER_MADE' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED_TO_PO';
  adminNotes?: string;
  createdAt: string;
}

export interface NegotiationRecordDTO {
  id: string;
  enquiryId: string;
  listingId: string;
  anonymousListingCode: string;
  buyerId: string;
  buyerCompanyName: string; // Admin only
  sellerId: string;
  sellerCompanyName: string; // Admin only
  sellerInitialPrice: number;
  buyerTargetPrice: number;
  adminNegotiatedPrice: number;
  finalAgreedPrice: number;
  agreedQuantityMT: number;
  brokeragePerUnit: number;
  brokerageType: BrokerageType;
  brokeragePayee: BrokeragePayee;
  buyerAgreed: boolean;
  sellerAgreed: boolean;
  adminConfirmed: boolean;
  notes: string;
  status: 'ACTIVE' | 'AGREED' | 'REJECTED' | 'CONVERTED_TO_PO';
  updatedAt: string;
  history: Array<{
    timestamp: string;
    note: string;
    price: number;
    actor: 'ADMIN' | 'BUYER' | 'SELLER';
  }>;
}

// ------------------------------------------
// Buyer-Seller Matching Engine
// ------------------------------------------
export interface MatchDifferenceDetail {
  grainLengthDiff: number;
  moistureDiff: number;
  brokenDiff: number;
  whitenessDiff: number;
  priceDiffPerQuintal: number;
  quantityDiffMT: number;
}

export interface MatchingResultDTO {
  requirementId: string;
  requirementCode: string;
  listingId: string;
  anonymousListingCode: string;
  category: RiceCategory;
  variety: string;
  overallMatchScore: number; // 0 - 100%
  qualityScore: number;      // 0 - 100%
  priceScore: number;        // 0 - 100%
  quantityScore: number;     // 0 - 100%
  locationScore: number;     // 0 - 100%
  differences: MatchDifferenceDetail;
  recommendationSummary: string;
  // Admin only
  sellerCompanyName?: string;
  buyerCompanyName?: string;
}

// ------------------------------------------
// Purchase Orders
// ------------------------------------------
export interface PurchaseOrderDTO {
  id: string;
  poNumber: string; // e.g. "PE-PO-2026-001"
  orderDate: string;
  riceCategory: RiceCategory;
  riceVariety: string;
  classification: RiceClassification;
  quantityMT: number;
  quantityQuintals: number;
  agreedRatePerQuintal: number;
  agreedRatePerMT: number;
  totalGoodsValue: number;
  qualitySpecs: RiceQualitySpecs;
  packaging: PackagingType;
  dispatchLocation: string; // Admin sees full, Buyer sees state/city
  deliveryLocation: string; // Admin sees full, Seller sees state/city
  deliveryDate: string;
  paymentTerms: string;
  brokerageAmount: number;
  brokerageType: BrokerageType;
  brokeragePayee: BrokeragePayee;
  status: PurchaseOrderStatus;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  // PDF download URLs
  pdfDocumentUrl?: string;
  // Admin-only fields:
  buyerId?: string;
  buyerCompanyName?: string;
  sellerId?: string;
  sellerCompanyName?: string;
}

// ------------------------------------------
// Transport & Dispatch
// ------------------------------------------
export interface TransportRecordDTO {
  id: string;
  poId: string;
  poNumber: string;
  transporterName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  biltyNumber: string; // LR number
  ewayBillNumber?: string;
  loadingLocation: string;
  deliveryLocation: string;
  loadingDate: string;
  dispatchDate: string;
  expectedDeliveryDate: string;
  quantityLoadedMT: number;
  bagCount: number;
  freightCharges: number;
  freightStatus: 'PAID_BY_BUYER' | 'PAID_BY_SELLER' | 'TO_PAY_ON_DELIVERY';
  status: TransportStatus;
  statusLogs: Array<{
    status: TransportStatus;
    timestamp: string;
    locationNote: string;
  }>;
  proofOfDispatchUrl?: string;
  proofOfDeliveryUrl?: string;
}

// ------------------------------------------
// Payments & GST
// ------------------------------------------
export interface PaymentRecordDTO {
  id: string;
  poId: string;
  poNumber: string;
  paymentType: PaymentType;
  amount: number;
  payerRole: 'BUYER' | 'SELLER';
  payerId: string;
  payerName?: string; // Admin only
  method: PaymentMethod;
  referenceNumber: string; // UTR or Cheque no or Razorpay payment ID
  paymentDate: string;
  status: PaymentStatus;
  verifiedByAdmin: boolean;
  notes?: string;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string; // e.g. "INV-PE-2026-0012"
  invoiceType: 'BROKERAGE_INVOICE' | 'GOODS_PROFORMA_INVOICE';
  poId: string;
  poNumber: string;
  issuerName: string; // Pragyam Enterprises
  issuerGstin: string;
  clientName: string;
  clientGstin?: string;
  taxableAmount: number;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  igstPercent: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
  hsnSacCode: string;
  invoiceDate: string;
  pdfUrl?: string;
}

// ------------------------------------------
// Analytics & Dashboard Summary
// ------------------------------------------
export interface DashboardMetricsDTO {
  totalTransactionValue: number;
  totalSalesMT: number;
  totalPurchaseOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  activeBuyers: number;
  activeSellers: number;
  totalStockAvailableMT: number;
  totalBrokerageEarned: number;
  outstandingPayments: number;
  receivedPayments: number;
  pendingDispatches: number;
  monthlySalesTrend: Array<{ month: string; amount: number; volumeMT: number }>;
  categoryDistribution: Array<{ category: string; count: number; volumeMT: number }>;
}

// ------------------------------------------
// Audit Trail
// ------------------------------------------
export interface AuditLogDTO {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}
