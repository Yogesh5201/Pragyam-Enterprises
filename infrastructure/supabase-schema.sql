-- =========================================================================
-- PRAGYAM ENTERPRISES: CONFIDENTIAL RICE BROKERAGE PLATFORM
-- PRODUCTION SUPABASE POSTGRESQL SCHEMA WITH ACID TRANSACTIONS & RLS
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-running
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "AppSetting" CASCADE;
DROP TABLE IF EXISTS "InvoiceRecord" CASCADE;
DROP TABLE IF EXISTS "PaymentRecord" CASCADE;
DROP TABLE IF EXISTS "TransportRecord" CASCADE;
DROP TABLE IF EXISTS "PurchaseOrder" CASCADE;
DROP TABLE IF EXISTS "NegotiationRecord" CASCADE;
DROP TABLE IF EXISTS "PurchaseEnquiry" CASCADE;
DROP TABLE IF EXISTS "RiceQualitySpec" CASCADE;
DROP TABLE IF EXISTS "PurchaseRequirement" CASCADE;
DROP TABLE IF EXISTS "InventoryListing" CASCADE;
DROP TABLE IF EXISTS "AdminProfile" CASCADE;
DROP TABLE IF EXISTS "SellerProfile" CASCADE;
DROP TABLE IF EXISTS "BuyerProfile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 1. User Account Table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL, -- SUPER_ADMIN, BUYER, SELLER
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "mfaSecret" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Buyer Profile Table
CREATE TABLE "BuyerProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "gstin" TEXT,
    "panNumber" TEXT,
    "businessType" TEXT NOT NULL, -- EXPORTER, WHOLESALER, etc.
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Seller Mill Profile Table (Strictly confidential from buyers)
CREATE TABLE "SellerProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "gstin" TEXT,
    "panNumber" TEXT,
    "businessType" TEXT NOT NULL,
    "millName" TEXT NOT NULL,
    "millCapacityMTPerDay" NUMERIC(10, 2),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Super Admin Profile Table
CREATE TABLE "AdminProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL DEFAULT 'Super Administrator',
    "permissions" TEXT[] DEFAULT '{"ALL"}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Inventory Listings (Anonymized for Trade Protection)
CREATE TABLE "InventoryListing" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "sellerId" TEXT NOT NULL REFERENCES "SellerProfile"("id") ON DELETE CASCADE,
    "anonymousCode" TEXT UNIQUE NOT NULL, -- e.g. PRG-1025
    "category" TEXT NOT NULL, -- STEAM_RICE, GOLDEN_SELLA_RICE, etc.
    "variety" TEXT NOT NULL,
    "classification" TEXT NOT NULL, -- BASMATI, NON_BASMATI
    "availableQuantityMT" NUMERIC(12, 3) NOT NULL,
    "minOrderQuantityMT" NUMERIC(12, 3) NOT NULL,
    "maxOrderQuantityMT" NUMERIC(12, 3) NOT NULL,
    "askingPricePerQuintal" NUMERIC(10, 2) NOT NULL,
    "askingPricePerMT" NUMERIC(12, 2) NOT NULL,
    "brokerageOffered" NUMERIC(10, 2) NOT NULL,
    "brokerageType" TEXT NOT NULL DEFAULT 'PER_METRIC_TONNE',
    "millLocation" TEXT NOT NULL,
    "dispatchLocation" TEXT NOT NULL,
    "generalizedDistrict" TEXT NOT NULL, -- Masked location for buyers
    "generalizedState" TEXT NOT NULL,
    "availabilityDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "cropYear" TEXT NOT NULL,
    "packaging" TEXT NOT NULL,
    "stockImages" TEXT[] DEFAULT '{}',
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "moderationFlagged" BOOLEAN NOT NULL DEFAULT false,
    "moderationReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Buyer Purchase Requirements
CREATE TABLE "PurchaseRequirement" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "buyerId" TEXT NOT NULL REFERENCES "BuyerProfile"("id") ON DELETE CASCADE,
    "anonymousCode" TEXT UNIQUE NOT NULL, -- e.g. REQ-2026-8801
    "category" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "requiredQuantityMT" NUMERIC(12, 3) NOT NULL,
    "targetPricePerQuintal" NUMERIC(10, 2) NOT NULL,
    "targetPricePerMT" NUMERIC(12, 2) NOT NULL,
    "packagingRequirement" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryDistrict" TEXT NOT NULL,
    "deliveryState" TEXT NOT NULL,
    "deliveryPinCode" TEXT,
    "requiredDeliveryDate" TIMESTAMPTZ NOT NULL,
    "additionalNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Rice Quality Specifications
CREATE TABLE "RiceQualitySpec" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "listingId" TEXT UNIQUE REFERENCES "InventoryListing"("id") ON DELETE CASCADE,
    "requirementId" TEXT UNIQUE REFERENCES "PurchaseRequirement"("id") ON DELETE CASCADE,
    "grainLengthMm" NUMERIC(4, 2) NOT NULL,
    "whiteness" NUMERIC(4, 1) NOT NULL,
    "moisturePercent" NUMERIC(4, 2) NOT NULL,
    "brokenPercent" NUMERIC(4, 2) NOT NULL,
    "foreignMatterPercent" NUMERIC(4, 2) NOT NULL DEFAULT 0.05,
    "damagedGrainPercent" NUMERIC(4, 2) NOT NULL DEFAULT 0.5,
    "chalkyGrainPercent" NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    "yellowGrainPercent" NUMERIC(4, 2) NOT NULL DEFAULT 0.5,
    "sortex" BOOLEAN NOT NULL DEFAULT true,
    "cropYear" TEXT NOT NULL
);

-- 8. Purchase Enquiries
CREATE TABLE "PurchaseEnquiry" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "enquiryCode" TEXT UNIQUE NOT NULL, -- e.g. ENQ-2026-4401
    "listingId" TEXT NOT NULL REFERENCES "InventoryListing"("id") ON DELETE CASCADE,
    "buyerId" TEXT NOT NULL REFERENCES "BuyerProfile"("id") ON DELETE CASCADE,
    "requestedQuantityMT" NUMERIC(12, 3) NOT NULL,
    "targetPricePerQuintal" NUMERIC(10, 2) NOT NULL,
    "buyerNotes" TEXT,
    "adminStatus" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Deals & Price Negotiations (Super Admin Controlled)
CREATE TABLE "NegotiationRecord" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "enquiryId" TEXT UNIQUE NOT NULL REFERENCES "PurchaseEnquiry"("id") ON DELETE CASCADE,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sellerInitialPrice" NUMERIC(10, 2) NOT NULL,
    "buyerTargetPrice" NUMERIC(10, 2) NOT NULL,
    "adminNegotiatedPrice" NUMERIC(10, 2) NOT NULL,
    "finalAgreedPrice" NUMERIC(10, 2) NOT NULL,
    "agreedQuantityMT" NUMERIC(12, 3) NOT NULL,
    "brokeragePerUnit" NUMERIC(10, 2) NOT NULL,
    "brokerageType" TEXT NOT NULL DEFAULT 'PER_METRIC_TONNE',
    "brokeragePayee" TEXT NOT NULL DEFAULT 'BOTH_SPLIT',
    "buyerAgreed" BOOLEAN NOT NULL DEFAULT false,
    "sellerAgreed" BOOLEAN NOT NULL DEFAULT false,
    "adminConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "history" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Legally Binding Purchase Orders
CREATE TABLE "PurchaseOrder" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "poNumber" TEXT UNIQUE NOT NULL, -- e.g. PO-2026-9042
    "negotiationId" TEXT UNIQUE REFERENCES "NegotiationRecord"("id") ON DELETE SET NULL,
    "listingId" TEXT NOT NULL REFERENCES "InventoryListing"("id"),
    "buyerId" TEXT NOT NULL REFERENCES "BuyerProfile"("id"),
    "sellerId" TEXT NOT NULL REFERENCES "SellerProfile"("id"),
    "riceCategory" TEXT NOT NULL,
    "riceVariety" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "quantityMT" NUMERIC(12, 3) NOT NULL,
    "quantityQuintals" NUMERIC(12, 2) NOT NULL,
    "agreedRatePerQuintal" NUMERIC(10, 2) NOT NULL,
    "agreedRatePerMT" NUMERIC(12, 2) NOT NULL,
    "totalGoodsValue" NUMERIC(14, 2) NOT NULL,
    "packaging" TEXT NOT NULL,
    "dispatchLocation" TEXT NOT NULL,
    "deliveryLocation" TEXT NOT NULL,
    "deliveryDate" TIMESTAMPTZ NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "brokerageAmount" NUMERIC(10, 2) NOT NULL,
    "brokerageType" TEXT NOT NULL,
    "brokeragePayee" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, PROCESSING, DISPATCHED, IN_TRANSIT, DELIVERED, COMPLETED
    "specialInstructions" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Logistics, Vehicle & Bilty (LR) Desk
CREATE TABLE "TransportRecord" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "poId" TEXT UNIQUE NOT NULL REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE,
    "transporterName" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "biltyNumber" TEXT NOT NULL, -- LR number
    "ewayBillNumber" TEXT,
    "loadingLocation" TEXT NOT NULL,
    "deliveryLocation" TEXT NOT NULL,
    "loadingDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "dispatchDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "expectedDeliveryDate" TIMESTAMPTZ NOT NULL,
    "quantityLoadedMT" NUMERIC(12, 3) NOT NULL,
    "bagCount" INTEGER NOT NULL,
    "freightCharges" NUMERIC(10, 2) NOT NULL,
    "freightStatus" TEXT NOT NULL DEFAULT 'PAID_BY_BUYER',
    "status" TEXT NOT NULL DEFAULT 'IN_TRANSIT',
    "statusLogs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "proofOfDispatchUrl" TEXT,
    "proofOfDeliveryUrl" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Escrow & Brokerage Payments
CREATE TABLE "PaymentRecord" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "poId" TEXT NOT NULL REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE,
    "paymentType" TEXT NOT NULL, -- GOODS_PAYMENT, BROKERAGE_PAYMENT
    "amount" NUMERIC(14, 2) NOT NULL,
    "payerRole" TEXT NOT NULL, -- BUYER, SELLER
    "payerBuyerId" TEXT REFERENCES "BuyerProfile"("id"),
    "payerSellerId" TEXT REFERENCES "SellerProfile"("id"),
    "method" TEXT NOT NULL, -- RTGS, NEFT, UPI, BANK_TRANSFER
    "referenceNumber" TEXT NOT NULL, -- UTR number
    "paymentDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "status" TEXT NOT NULL DEFAULT 'VERIFIED',
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Official GST Tax Invoices (SAC Code 998319)
CREATE TABLE "InvoiceRecord" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "invoiceNumber" TEXT UNIQUE NOT NULL, -- e.g. PRG/INV/2026/042
    "invoiceType" TEXT NOT NULL DEFAULT 'BROKERAGE_INVOICE',
    "poId" TEXT NOT NULL REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE,
    "issuerName" TEXT NOT NULL DEFAULT 'Pragyam Enterprises',
    "issuerGstin" TEXT NOT NULL DEFAULT '06AAACT4455R1Z2',
    "clientName" TEXT NOT NULL,
    "clientGstin" TEXT,
    "taxableAmount" NUMERIC(14, 2) NOT NULL,
    "cgstPercent" NUMERIC(4, 2) NOT NULL DEFAULT 9.0,
    "cgstAmount" NUMERIC(10, 2) NOT NULL,
    "sgstPercent" NUMERIC(4, 2) NOT NULL DEFAULT 9.0,
    "sgstAmount" NUMERIC(10, 2) NOT NULL,
    "igstPercent" NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
    "igstAmount" NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    "totalTax" NUMERIC(10, 2) NOT NULL,
    "grandTotal" NUMERIC(14, 2) NOT NULL,
    "hsnSacCode" TEXT NOT NULL DEFAULT '998319',
    "invoiceDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Immutable Security Audit Trail
CREATE TABLE "AuditLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "userId" TEXT REFERENCES "User"("id"),
    "userRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT DEFAULT '127.0.0.1'
);

-- 15. User Notifications
CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Platform App Settings
CREATE TABLE "AppSetting" (
    "key" TEXT PRIMARY KEY,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- INDEXES FOR HIGH-SPEED B2B QUERIES (10,000+ USERS)
-- =========================================================================
CREATE INDEX idx_user_email_role ON "User"("email", "role");
CREATE INDEX idx_listing_cat_status ON "InventoryListing"("category", "status", "generalizedState");
CREATE INDEX idx_enquiry_listing_buyer ON "PurchaseEnquiry"("listingId", "buyerId");
CREATE INDEX idx_po_buyer_seller_status ON "PurchaseOrder"("buyerId", "sellerId", "status");
CREATE INDEX idx_payment_po_status ON "PaymentRecord"("poId", "status");
CREATE INDEX idx_audit_timestamp ON "AuditLog"("timestamp" DESC);

-- =========================================================================
-- INITIAL SEED DATA: SUPER ADMIN & VERIFIED MILLS/BUYERS
-- =========================================================================

-- 1. Super Admin User (admin@pragyam.com / Pragyam@Admin2026!)
INSERT INTO "User" ("id", "email", "passwordHash", "role", "status", "mfaEnabled")
VALUES ('usr-admin-001', 'admin@pragyam.com', '$2a$10$wT0H7eQ0tT/n.p9iO4f2A.X7KzH4e0qH5f7hY7kP6u4hN9vE8l6Wa', 'SUPER_ADMIN', 'ACTIVE', true)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "AdminProfile" ("id", "userId", "fullName", "phone", "roleTitle")
VALUES ('adm-prof-001', 'usr-admin-001', 'Nikhil Bansal', '+91 9896346337', 'Super Administrator & Chief Broker')
ON CONFLICT DO NOTHING;

-- 2. Verified Rice Mill Sellers
INSERT INTO "User" ("id", "email", "passwordHash", "role", "status")
VALUES 
('usr-seller-001', 'taraori@mills.com', '$2a$10$wT0H7eQ0tT/n.p9iO4f2A.X7KzH4e0qH5f7hY7kP6u4hN9vE8l6Wa', 'SELLER', 'ACTIVE'),
('usr-seller-002', 'amritsar@agro.com', '$2a$10$wT0H7eQ0tT/n.p9iO4f2A.X7KzH4e0qH5f7hY7kP6u4hN9vE8l6Wa', 'SELLER', 'ACTIVE')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "SellerProfile" ("id", "userId", "fullName", "companyName", "phone", "address", "city", "district", "state", "pinCode", "gstin", "panNumber", "businessType", "millName", "millCapacityMTPerDay", "isVerified")
VALUES 
('sel-prof-001', 'usr-seller-001', 'Rameshwar Lal Singhal', 'Taraori Golden Rice Mills Ltd', '+91 98960 11223', 'Station Road Grain Market', 'Taraori', 'Karnal', 'Haryana', '132116', '06AAACT4455R1Z2', 'AAACT4455R', 'RICE_MILLER', 'Taraori Golden Rice Mills (Unit 1 & 2)', 200.00, true),
('sel-prof-002', 'usr-seller-002', 'Gurpreet Singh Dhillon', 'Majha Agro Processors LLP', '+91 98140 55667', 'GT Road, Jandiala Guru', 'Amritsar', 'Amritsar', 'Punjab', '143115', '03AABFM8899Q1ZT', 'AABFM8899Q', 'RICE_MILLER', 'Majha Ultra Steam Milling Facility', 350.00, true)
ON CONFLICT DO NOTHING;

-- 3. Verified Buyer (Sunil Mehra, Royal Feast Global Exporters)
INSERT INTO "User" ("id", "email", "passwordHash", "role", "status")
VALUES ('usr-buyer-001', 'exports@royalfeast.com', '$2a$10$wT0H7eQ0tT/n.p9iO4f2A.X7KzH4e0qH5f7hY7kP6u4hN9vE8l6Wa', 'BUYER', 'ACTIVE')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "BuyerProfile" ("id", "userId", "fullName", "companyName", "phone", "address", "city", "district", "state", "pinCode", "gstin", "panNumber", "businessType", "isVerified")
VALUES ('buy-prof-001', 'usr-buyer-001', 'Sunil Mehra', 'Royal Feast Global Exporters Pvt Ltd', '+91 98110 33445', 'Barakhamba Road, Connaught Place', 'New Delhi', 'New Delhi', 'Delhi', '110001', '07AABCR9911K1ZX', 'AABCR9911K', 'EXPORTER', true)
ON CONFLICT DO NOTHING;

-- 4. Initial Anonymous Rice Listings
INSERT INTO "InventoryListing" ("id", "sellerId", "anonymousCode", "category", "variety", "classification", "availableQuantityMT", "minOrderQuantityMT", "maxOrderQuantityMT", "askingPricePerQuintal", "askingPricePerMT", "brokerageOffered", "brokerageType", "millLocation", "dispatchLocation", "generalizedDistrict", "generalizedState", "cropYear", "packaging", "notes", "status")
VALUES 
('lst-1025', 'sel-prof-001', 'PRG-1025', 'GOLDEN_SELLA_RICE', '1121 Golden Sella Basmati', 'BASMATI', 500.000, 25.000, 500.000, 8200.00, 82000.00, 100.00, 'PER_METRIC_TONNE', 'Taraori Industrial Sector, Karnal', 'Karnal Dispatch Depot', 'Karnal', 'Haryana', '2025-2026', 'PP_BAG_50KG', 'Export grade golden sella basmati with excellent cooking elongation.', 'ACTIVE'),
('lst-1026', 'sel-prof-002', 'PRG-1026', 'STEAM_RICE', '1509 Steam Basmati Extra Long Grain', 'BASMATI', 750.000, 50.000, 750.000, 7400.00, 74000.00, 100.00, 'PER_METRIC_TONNE', 'Jandiala Guru Mill Area, Amritsar', 'Amritsar Dry Port', 'Amritsar', 'Punjab', '2025-2026', 'BOPP_BAG_25KG', '100% Sortex cleaned extra long grain steam basmati.', 'ACTIVE'),
('lst-1028', 'sel-prof-001', 'PRG-1028', 'RAW_RICE', 'Sona Masoori Raw Aged Rice', 'NON_BASMATI', 400.000, 20.000, 400.000, 5200.00, 52000.00, 75.00, 'PER_METRIC_TONNE', 'Gondia Processing Complex', 'Nagpur Rail Siding', 'Gondia', 'Maharashtra', '2024-2025', 'JUTE_BAG_50KG', 'Naturally aged 18+ months non-sticky raw rice.', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 5. Quality Specs
INSERT INTO "RiceQualitySpec" ("id", "listingId", "grainLengthMm", "whiteness", "moisturePercent", "brokenPercent", "foreignMatterPercent", "damagedGrainPercent", "chalkyGrainPercent", "yellowGrainPercent", "sortex", "cropYear")
VALUES 
('qspec-101', 'lst-1025', 8.35, 40.0, 12.00, 1.00, 0.05, 0.50, 1.00, 0.50, true, '2025-2026'),
('qspec-102', 'lst-1026', 8.42, 42.0, 12.20, 1.50, 0.08, 0.70, 1.20, 0.40, true, '2025-2026'),
('qspec-103', 'lst-1028', 5.25, 39.0, 11.80, 2.00, 0.10, 0.80, 1.50, 0.50, true, '2024-2025')
ON CONFLICT DO NOTHING;

-- 6. Confirmed Deal Purchase Order
INSERT INTO "PurchaseOrder" ("id", "poNumber", "listingId", "buyerId", "sellerId", "riceCategory", "riceVariety", "classification", "quantityMT", "quantityQuintals", "agreedRatePerQuintal", "agreedRatePerMT", "totalGoodsValue", "packaging", "dispatchLocation", "deliveryLocation", "deliveryDate", "paymentTerms", "brokerageAmount", "brokerageType", "brokeragePayee", "status")
VALUES ('po-401', 'PO-2026-9042', 'lst-1026', 'buy-prof-001', 'sel-prof-002', 'STEAM_RICE', '1509 Steam Basmati Extra Long Grain', 'BASMATI', 100.000, 1000.00, 7400.00, 74000.00, 7400000.00, 'PP_BAG_50KG', 'Taraori Mill Depot, Karnal', 'Kandla CFS Yard, Gujarat', NOW() + INTERVAL '10 days', '20% Advance on PO confirmation, 80% on Dispatch Bilty issuance.', 74000.00, 'PER_METRIC_TONNE', 'BOTH_SPLIT', 'IN_TRANSIT')
ON CONFLICT DO NOTHING;

-- 7. Transport Record & Bilty
INSERT INTO "TransportRecord" ("id", "poId", "transporterName", "vehicleNumber", "driverName", "driverPhone", "biltyNumber", "ewayBillNumber", "loadingLocation", "deliveryLocation", "expectedDeliveryDate", "quantityLoadedMT", "bagCount", "freightCharges", "freightStatus", "status")
VALUES ('trp-501', 'po-401', 'Om Logistics Inter-State Carriers', 'HR-05-AW-8921', 'Gurmeet Singh', '+91 98120 54321', 'LR-2026-8819', 'EWB-77192019', 'Taraori Mill Depot, Karnal', 'Kandla CFS Yard, Gujarat', NOW() + INTERVAL '3 days', 50.000, 1000, 38000.00, 'PAID_BY_BUYER', 'IN_TRANSIT')
ON CONFLICT DO NOTHING;

-- 8. Payment Record
INSERT INTO "PaymentRecord" ("id", "poId", "paymentType", "amount", "payerRole", "payerBuyerId", "method", "referenceNumber", "status", "verifiedByAdmin", "notes")
VALUES ('pay-601', 'po-401', 'BROKERAGE_PAYMENT', 1480000.00, 'BUYER', 'buy-prof-001', 'RTGS Transfer', 'RTGS-2026-881920', 'VERIFIED', true, 'Advance 20% verified in Pragyam Escrow Account.')
ON CONFLICT DO NOTHING;

-- 9. GST Brokerage Invoice
INSERT INTO "InvoiceRecord" ("id", "invoiceNumber", "invoiceType", "poId", "issuerName", "issuerGstin", "clientName", "clientGstin", "taxableAmount", "cgstPercent", "cgstAmount", "sgstPercent", "sgstAmount", "totalTax", "grandTotal", "hsnSacCode")
VALUES ('inv-701', 'PRG/INV/2026/042', 'BROKERAGE_INVOICE', 'po-401', 'Pragyam Enterprises', NULL, 'Royal Feast Global Exporters Pvt Ltd', '07AABCR9911K1ZX', 37000.00, 9.0, 3330.00, 9.0, 3330.00, 6660.00, 43660.00, '998319')
ON CONFLICT DO NOTHING;

-- 10. Audit Log
INSERT INTO "AuditLog" ("id", "action", "entityType", "entityId", "details")
VALUES ('aud-001', 'BOOTSTRAP_COMPLETE', 'SYSTEM', 'SUPABASE-DATABASE', 'Pragyam Enterprises Supabase PostgreSQL database initialized with ACID transactions and live catalog.')
ON CONFLICT DO NOTHING;
