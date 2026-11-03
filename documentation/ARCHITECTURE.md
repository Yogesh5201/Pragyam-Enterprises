# PRAGYAM ENTERPRISES
## Confidential Rice Brokerage & Trading Management Platform
### Comprehensive System Architecture Document

---

## 1. Executive Summary & Core Business Rule

**Pragyam Enterprises** is a dedicated, admin-controlled, confidential rice brokerage and trading management platform. The platform is designed specifically to protect the commercial viability and commission revenue of the broker.

### The Absolute Intermediary Principle
- **No Direct Buyer-Seller Interaction**: Buyers and sellers must NEVER be able to identify, contact, negotiate with, or transact directly with each other through the platform.
- **Enforcement Levels**:
  1. **Database Level**: Strictly decoupled relational design where public views only access anonymized abstractions (`anonymousCode` like `PRG-1025` or `REQ-4081`).
  2. **API & Serialization Level**: Role-based Data Transfer Objects (DTOs). The API never transmits mill names, contact numbers, email addresses, or tax IDs to unauthorized roles.
  3. **Operational Level**: All negotiations, enquiries, and deals are processed exclusively by the Super Admin (Broker).
  4. **Document Level**: Purchase orders and bilty updates generate separate, sanitized copies for Buyer and Seller with Pragyam Enterprises acting as the sole intermediary.

---

## 2. System Architecture & Topology

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT TIER                                          |
|                                                                                         |
|   +-----------------------+   +-----------------------+   +-----------------------+     |
|   |   Android & iOS App   |   |   Web Portal (Client) |   | Super Admin Dashboard |     |
|   |  (React Native/Expo)  |   |   Buyer/Seller Modes  |   | (Desktop-First Portal)|     |
|   +-----------+-----------+   +-----------+-----------+   +-----------+-----------+     |
+---------------|---------------------------|---------------------------|-----------------+
                |                           |                           |
                +---------------------------+---------------------------+
                                            |
                                            v (HTTPS / TLS 1.3 / REST)
+-----------------------------------------------------------------------------------------+
|                                APPLICATION BACKEND                                      |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                             NestJS REST API Gateway                             |   |
|   |  - Role-Based Access Control (RBAC Guard)                                       |   |
|   |  - JWT Authentication & Refresh Token Rotation                                  |   |
|   |  - Confidentiality Filter & Role-Specific Serialization                         |   |
|   |  - Rate Limiter & Helmet Security Headers                                       |   |
|   +---------------------------------------------------------------------------------+   |
|                                           |                                             |
|        +----------------------------------+----------------------------------+          |
|        |                                  |                                  |          |
|        v                                  v                                  v          |
|   +--------------------+        +--------------------+        +--------------------+    |
|   |  Inventory & Stock |        | Negotiation & PO   |        |  Matching Engine   |    |
|   |  Anonymous Engine  |        | Workflow Service   |        |  & Scoring Service |    |
|   +--------------------+        +--------------------+        +--------------------+    |
|        |                                  |                                  |          |
|        v                                  v                                  v          |
|   +--------------------+        +--------------------+        +--------------------+    |
|   | Transport & Bilty  |        | Financial, GST &   |        | Audit & Logging    |    |
|   | Tracking Module    |        | Brokerage Engine   |        | Immutable Trail    |    |
|   +--------------------+        +--------------------+        +--------------------+    |
+-------------------------------------------|---------------------------------------------+
                                            |
                                            v (Prisma ORM)
+-----------------------------------------------------------------------------------------+
|                                     DATA TIER                                           |
|                                                                                         |
|   +-----------------------------------+       +-------------------------------------+   |
|   |  PostgreSQL Relational Database   |       |  Redis Cache / Job Queue (BullMQ)   |   |
|   |  - UUID Primary Keys              |       |  - Rate limiting                    |   |
|   |  - Financial Decimals             |       |  - Push notification dispatch       |   |
|   |  - Strict Foreign Key Constraints |       |  - PDF & Report export jobs         |   |
|   +-----------------------------------+       +-------------------------------------+   |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack Specification

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Monorepo** | NPM Workspaces | Unified type safety, shared calculations, clean package boundaries |
| **Backend API** | NestJS / Express / Node.js (TypeScript) | Robust modular architecture, built-in dependency injection, Swagger docs |
| **Database & ORM** | PostgreSQL 16 + Prisma ORM | Relational integrity, decimal precision for currency/MT, type-safe queries |
| **Web & Admin Portal** | Next.js 14 / React 18 / Tailwind CSS | Server-side rendering, fast dynamic routing, desktop-first admin portal |
| **Mobile App** | React Native + Expo (Expo Router) | Cross-platform Android (AAB/APK) and iOS release from a single codebase |
| **Authentication** | JWT (Access + Refresh) + Argon2id | Modern cryptographic security, MFA support for Super Admin |
| **PDF Generation** | PDFKit / PDF Generator | Pixel-perfect branded POs and GST Invoices without third-party dependencies |
| **Excel Export** | SheetJS (xlsx) | High-speed multi-sheet operational reporting for all platform entities |
| **Payment Gateway** | Razorpay / UPI Integration Layer | Secure webhook verification, idempotency, direct payment reconciliation |

---

## 4. Rice Quality Specification Model

Every listing and requirement conforms to standard Indian grain trade quality metrics:

1. **Grain Length (mm)**: Accurate to 2 decimal places (e.g. `8.35 mm` for 1121 Golden Sella).
2. **Whiteness (Kett Scale)**: Typically `38` to `44`.
3. **Moisture (%)**: Max acceptable moisture (typically `11.5%` to `13.0%`).
4. **Broken Grain (%)**: Allowable broken percentage (e.g. `1.0%` for premium sortex).
5. **Foreign Matter (%)**: Decimal precision (`0.05%`).
6. **Damaged / Discolored Grain (%)**: Decimal precision (`0.5%`).
7. **Chalky Grain (%)**: Decimal precision (`1.0%`).
8. **Sortex Cleaned**: Boolean flag indicating optical sorting.
9. **Packaging**: Jute Bag 50kg, PP Bag 50kg, PP Bag 25kg, BOPP Bag, Non-Woven, Loose.
10. **Classification & Category**:
    - Categories: `Steam Rice`, `Sella Rice`, `Golden Sella Rice`, `Lemon Sella Rice`, `Raw Rice`, `Brown Rice`.
    - Classifications: `Basmati`, `Non-Basmati`.

---

## 5. Security & Confidentiality Architecture

### Data Transfer Separation
- **`AnonymousInventoryListingDTO`**: Distributed to Buyers. Replaces seller entity ID with random/sequential anonymous identifier `PRG-XXXX`. Replaces exact mill address with district and state (e.g. "Karnal, Haryana").
- **`SellerInventoryListingDTO`**: Returned only to the authenticated mill owner. Displays seller's stock, their offered brokerage, and status.
- **`AdminInventoryListingDTO`**: Accessible exclusively by role `SUPER_ADMIN`. Displays full mill name, owner mobile number, GSTIN, PAN, and full address.

### Role-Based Access Control (RBAC) Matrix

| Resource / Action | Buyer | Seller | Super Admin |
| :--- | :---: | :---: | :---: |
| Browse Rice Stock (Anonymous) | ✅ | ✅ | ✅ |
| View Seller Mill Name & Contact | ❌ | ❌ (Own only) | ✅ |
| Add / Edit Rice Stock | ❌ | ✅ (Own stock) | ✅ (All) |
| Submit Purchase Enquiry | ✅ | ❌ | ✅ |
| Submit Purchase Requirement | ✅ | ❌ | ✅ |
| Access Buyer-Seller Match Engine | ❌ | ❌ | ✅ |
| Negotiate & Finalize Price | ❌ | ❌ | ✅ |
| Create & Issue Purchase Order | ❌ | ❌ | ✅ |
| View Full Business Financials & Brokerage | ❌ | ❌ | ✅ |
| Export Operational Excel Reports | ❌ | ❌ | ✅ |
| Assign Transport & Update LR / Bilty | ❌ | ✅ (Own orders) | ✅ |
