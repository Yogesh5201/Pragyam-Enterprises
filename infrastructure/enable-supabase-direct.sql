-- =========================================================================
-- PRAGYAM ENTERPRISES: ENABLE SUPABASE DIRECT READ/WRITE & SEED PLATFORM
-- Run this script in your Supabase Dashboard -> SQL Editor (Click 'Run')
-- =========================================================================

-- 1. Disable Row Level Security (RLS) on all platform tables so API routes can read/write directly
ALTER TABLE IF EXISTS "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "BuyerProfile" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SellerProfile" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AdminProfile" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "InventoryListing" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "RiceQualitySpec" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PurchaseRequirement" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PurchaseEnquiry" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "NegotiationRecord" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PurchaseOrder" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TransportRecord" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PaymentRecord" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "InvoiceRecord" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AppSetting" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Notification" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AuditLog" DISABLE ROW LEVEL SECURITY;

-- 2. Initial Super Administrator Account
INSERT INTO "User" ("id", "email", "passwordHash", "role", "status", "mfaEnabled")
VALUES ('usr-admin-001', 'admin@pragyam.com', 'Pragyam@Admin2026!', 'SUPER_ADMIN', 'ACTIVE', true)
ON CONFLICT ("email") DO UPDATE SET "passwordHash" = 'Pragyam@Admin2026!';

INSERT INTO "AdminProfile" ("id", "userId", "fullName", "phone", "roleTitle")
VALUES ('adm-prof-001', 'usr-admin-001', 'Nikhil Bansal', '+91 9896346337', 'Super Administrator & Chief Broker')
ON CONFLICT ("id") DO NOTHING;

-- 3. Verified Rice Millers (Bansal Traders, Taraori Mills, Majha Agro)
INSERT INTO "User" ("id", "email", "passwordHash", "role", "status")
VALUES 
('usr-seller-bansal', 'nikhilbansal9896@gmail.com', 'Pragyam@2026', 'SELLER', 'ACTIVE'),
('usr-seller-001', 'taraori@mills.com', 'Pragyam@2026', 'SELLER', 'ACTIVE'),
('usr-seller-002', 'amritsar@agro.com', 'Pragyam@2026', 'SELLER', 'ACTIVE')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "SellerProfile" ("id", "userId", "fullName", "companyName", "phone", "address", "city", "district", "state", "pinCode", "gstin", "panNumber", "businessType", "millName", "millCapacityMTPerDay", "isVerified")
VALUES 
('sel-prof-bansal', 'usr-seller-bansal', 'Satyanarayan', 'BASNAL TRADESR', '+91 9416365869', 'New Anaj Mandi, Station Road', 'tohana', 'Fatehabad', 'Haryana', '125120', '06ATTPS1820N1Z2', 'ATTPS1820N', 'RICE_MILLER', 'BANSAL TRADERS', 150.00, true),
('sel-prof-001', 'usr-seller-001', 'Rameshwar Lal Singhal', 'Taraori Golden Rice Mills Ltd', '+91 98960 11223', 'Station Road Grain Market', 'Taraori', 'Karnal', 'Haryana', '132116', '06AAACT4455R1Z2', 'AAACT4455R', 'RICE_MILLER', 'Taraori Golden Rice Mills (Unit 1 & 2)', 200.00, true),
('sel-prof-002', 'usr-seller-002', 'Gurpreet Singh Dhillon', 'Majha Agro Processors LLP', '+91 98140 55667', 'GT Road, Jandiala Guru', 'Amritsar', 'Amritsar', 'Punjab', '143115', '03AABFM8899Q1ZT', 'AABFM8899Q', 'RICE_MILLER', 'Majha Ultra Steam Milling Facility', 350.00, true)
ON CONFLICT ("id") DO NOTHING;

-- 4. Verified Institutional Buyers (haruana, Bansal Tradesr, Royal Feast)
INSERT INTO "User" ("id", "email", "passwordHash", "role", "status")
VALUES 
('usr-buyer-haruana', 'buyer-haruana@pragyam.com', 'Pragyam@2026', 'BUYER', 'ACTIVE'),
('usr-buyer-001', 'exports@royalfeast.com', 'Pragyam@2026', 'BUYER', 'ACTIVE')
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "BuyerProfile" ("id", "userId", "fullName", "companyName", "phone", "address", "city", "district", "state", "pinCode", "businessType", "isVerified")
VALUES 
('buy-prof-haruana', 'usr-buyer-haruana', 'BANAN', 'haruana', '+91 9896346337', 'Grain Market Hub, Tona', 'TONA', 'Fatehabad', 'Haryana', '125120', 'WHOLESALER', true),
('buy-prof-001', 'usr-buyer-001', 'Sunil Mehra', 'Royal Feast Global Exporters Pvt Ltd', '+91 98110 33445', 'Barakhamba Road, Connaught Place', 'New Delhi', 'New Delhi', 'Delhi', '110001', 'EXPORTER', true)
ON CONFLICT ("id") DO NOTHING;

-- 5. Active Rice Stock Listings
INSERT INTO "InventoryListing" ("id", "sellerId", "anonymousCode", "category", "variety", "classification", "availableQuantityMT", "minOrderQuantityMT", "maxOrderQuantityMT", "askingPricePerQuintal", "askingPricePerMT", "brokerageOffered", "brokerageType", "millLocation", "dispatchLocation", "generalizedDistrict", "generalizedState", "cropYear", "packaging", "notes", "status")
VALUES 
('lst-3428', 'sel-prof-bansal', 'PRG-3428', 'GOLDEN_SELLA_RICE', '1121 Golden Sella Basmati', 'BASMATI', 70.000, 20.000, 70.000, 9000.00, 90000.00, 40.00, 'PER_METRIC_TONNE', 'TOHANA Mill Yard, Haryana', 'TOHANA', 'Fatehabad', 'Haryana', '2025-2026', 'PP_BAG_50KG', 'Premium quality 1121 Golden Sella Basmati stock ready for dispatch.', 'ACTIVE'),
('lst-1025', 'sel-prof-001', 'PRG-1025', 'GOLDEN_SELLA_RICE', '1121 Golden Sella Basmati', 'BASMATI', 500.000, 25.000, 500.000, 8200.00, 82000.00, 100.00, 'PER_METRIC_TONNE', 'Taraori Industrial Sector, Karnal', 'Karnal Dispatch Depot', 'Karnal', 'Haryana', '2025-2026', 'PP_BAG_50KG', 'Export grade golden sella basmati with excellent cooking elongation.', 'ACTIVE'),
('lst-1026', 'sel-prof-002', 'PRG-1026', 'STEAM_RICE', '1509 Steam Basmati Extra Long Grain', 'BASMATI', 750.000, 50.000, 750.000, 7400.00, 74000.00, 100.00, 'PER_METRIC_TONNE', 'Jandiala Guru Mill Area, Amritsar', 'Amritsar Dry Port', 'Amritsar', 'Punjab', '2025-2026', 'BOPP_BAG_25KG', '100% Sortex cleaned extra long grain steam basmati.', 'ACTIVE'),
('lst-1028', 'sel-prof-001', 'PRG-1028', 'RAW_RICE', 'Sona Masoori Raw Aged Rice', 'NON_BASMATI', 400.000, 20.000, 400.000, 5200.00, 52000.00, 75.00, 'PER_METRIC_TONNE', 'Gondia Processing Complex', 'Nagpur Rail Siding', 'Gondia', 'Maharashtra', '2024-2025', 'JUTE_BAG_50KG', 'Naturally aged 18+ months non-sticky raw rice.', 'ACTIVE')
ON CONFLICT ("id") DO NOTHING;

-- 6. Quality Specs
INSERT INTO "RiceQualitySpec" ("id", "listingId", "grainLengthMm", "whiteness", "moisturePercent", "brokenPercent", "foreignMatterPercent", "damagedGrainPercent", "chalkyGrainPercent", "yellowGrainPercent", "sortex", "cropYear")
VALUES 
('qspec-3428', 'lst-3428', 8.35, 40.0, 12.00, 1.00, 0.05, 0.50, 1.00, 0.40, true, '2025-2026'),
('qspec-101', 'lst-1025', 8.35, 40.0, 12.00, 1.00, 0.05, 0.50, 1.00, 0.50, true, '2025-2026'),
('qspec-102', 'lst-1026', 8.42, 42.0, 12.20, 1.50, 0.08, 0.70, 1.20, 0.40, true, '2025-2026'),
('qspec-103', 'lst-1028', 5.25, 39.0, 11.80, 2.00, 0.10, 0.80, 1.50, 0.50, true, '2024-2025')
ON CONFLICT ("id") DO NOTHING;

-- 7. Purchase Requirements
INSERT INTO "PurchaseRequirement" ("id", "buyerId", "requirementCode", "category", "variety", "classification", "requiredQuantityMT", "minQuantityMT", "maxQuantityMT", "targetPricePerQuintal", "targetPricePerMT", "deliveryLocation", "preferredDeliveryDate", "paymentTermsOffered", "packagingRequired", "status")
VALUES 
('req-haruana-01', 'buy-prof-haruana', 'REQ-2026-8801', 'GOLDEN_SELLA_RICE', '1121 Golden Sella Basmati', 'BASMATI', 100.00, 50.00, 100.00, 8950.00, 89500.00, 'TONA Hub, Haryana', 'Immediate Dispatch', 'Broker Escrow Transfer', 'PP_BAG_50KG', 'OPEN')
ON CONFLICT ("id") DO NOTHING;

-- 8. Purchase Enquiries
INSERT INTO "PurchaseEnquiry" ("id", "listingId", "buyerId", "enquiryCode", "requestedQuantityMT", "targetPricePerQuintal", "buyerNotes", "status")
VALUES 
('enq-haruana-01', 'lst-1025', 'buy-prof-haruana', 'ENQ-2026-4401', 100.00, 8150.00, 'Requires urgent loading with sortex clean grains.', 'CONVERTED_TO_DEAL')
ON CONFLICT ("id") DO NOTHING;

-- 9. Active Negotiations
INSERT INTO "NegotiationRecord" ("id", "enquiryId", "listingId", "buyerId", "sellerId", "negotiationCode", "currentRound", "buyerProposedPrice", "sellerProposedPrice", "agreedQuantityMT", "finalAgreedPrice", "brokeragePerUnit", "brokerageType", "brokeragePayee", "status")
VALUES 
('neg-bansal-haruana-01', 'enq-haruana-01', 'lst-3428', 'buy-prof-haruana', 'sel-prof-bansal', 'NEG-2026-7720', 2, 8950.00, 9000.00, 70.00, 8975.00, 40.00, 'PER_METRIC_TONNE', 'BOTH_SPLIT', 'AGREED')
ON CONFLICT ("id") DO NOTHING;

-- 10. Purchase Orders
INSERT INTO "PurchaseOrder" ("id", "poNumber", "listingId", "buyerId", "sellerId", "riceCategory", "riceVariety", "classification", "quantityMT", "quantityQuintals", "agreedRatePerQuintal", "agreedRatePerMT", "totalGoodsValue", "packaging", "dispatchLocation", "deliveryLocation", "deliveryDate", "paymentTerms", "brokerageAmount", "brokerageType", "brokeragePayee", "status")
VALUES 
('po-401', 'PO-2026-9042', 'lst-1026', 'buy-prof-001', 'sel-prof-002', 'STEAM_RICE', '1509 Steam Basmati Extra Long Grain', 'BASMATI', 100.000, 1000.00, 7400.00, 74000.00, 7400000.00, 'PP_BAG_50KG', 'Taraori Mill Depot, Karnal', 'Kandla CFS Yard, Gujarat', NOW() + INTERVAL '10 days', '20% Advance on PO confirmation, 80% on Dispatch Bilty issuance.', 74000.00, 'PER_METRIC_TONNE', 'BOTH_SPLIT', 'IN_TRANSIT')
ON CONFLICT ("id") DO NOTHING;

-- 11. Transport Records & Logistics
INSERT INTO "TransportRecord" ("id", "poId", "transporterName", "vehicleNumber", "driverName", "driverPhone", "biltyNumber", "ewayBillNumber", "loadingLocation", "deliveryLocation", "expectedDeliveryDate", "quantityLoadedMT", "bagCount", "freightCharges", "freightStatus", "status")
VALUES 
('trp-501', 'po-401', 'Om Logistics Inter-State Carriers', 'HR-05-AW-8921', 'Gurmeet Singh', '+91 98120 54321', 'LR-2026-8819', 'EWB-77192019', 'Taraori Mill Depot, Karnal', 'Kandla CFS Yard, Gujarat', NOW() + INTERVAL '3 days', 50.000, 1000, 38000.00, 'PAID_BY_BUYER', 'IN_TRANSIT')
ON CONFLICT ("id") DO NOTHING;

-- 12. Escrow Payment Records
INSERT INTO "PaymentRecord" ("id", "poId", "paymentType", "amount", "payerRole", "payerBuyerId", "method", "referenceNumber", "status", "verifiedByAdmin", "notes")
VALUES 
('pay-601', 'po-401', 'BROKERAGE_PAYMENT', 1480000.00, 'BUYER', 'buy-prof-001', 'RTGS Transfer', 'RTGS-2026-881920', 'VERIFIED', true, 'Advance 20% verified in Bank of Baroda Tohana Escrow Account.')
ON CONFLICT ("id") DO NOTHING;

-- 13. Official Invoices (Zero GST / Non-GST Commission Bill)
INSERT INTO "InvoiceRecord" ("id", "invoiceNumber", "invoiceType", "poId", "issuerName", "issuerGstin", "clientName", "clientGstin", "taxableAmount", "cgstPercent", "cgstAmount", "sgstPercent", "sgstAmount", "totalTax", "grandTotal", "hsnSacCode")
VALUES 
('inv-701', 'PRG/INV/2026/042', 'COMMISSION_BILL', 'po-401', 'Pragyam Enterprises', NULL, 'Royal Feast Global Exporters Pvt Ltd', '07AABCR9911K1ZX', 37000.00, 0.0, 0.0, 0.0, 0.0, 0.0, 37000.00, '998319')
ON CONFLICT ("id") DO NOTHING;

-- 14. Audit Log
INSERT INTO "AuditLog" ("id", "action", "entityType", "entityId", "details")
VALUES 
('aud-001', 'SUPABASE_ENABLED', 'SYSTEM', 'SUPABASE-POSTGRESQL', 'Direct read/write database permissions enabled for Pragyam Enterprises broker platform.')
ON CONFLICT ("id") DO NOTHING;
