# PRAGYAM ENTERPRISES
## REST API & OpenAPI Specifications
### Complete Developer & Integration Documentation

---

## 1. Overview & Authentication Flow

Pragyam Enterprises exposes a RESTful API powered by JSON over HTTPS.
- Base URL: `http://localhost:4000/api` (or `/api` via Next.js proxy)
- Bearer Token Authentication: Requests must include `Authorization: Bearer <JWT_ACCESS_TOKEN>`

### Role Separation & Endpoint Permissions
There are 3 roles:
- `SUPER_ADMIN`: Central broker with full unredacted access.
- `BUYER`: Purchaser / exporter. Access to anonymous inventory, purchase requirements, enquiries, and sanitized POs.
- `SELLER`: Rice miller / supplier. Access to own listings, confirmed orders, and dispatch updates.

---

## 2. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register/buyer`
Register a purchaser account.
- **Request Body**:
  ```json
  {
    "fullName": "Sunil Mehra",
    "companyName": "Royal Feast Global Exporters",
    "phone": "+91 98110 33445",
    "email": "exports@royalfeast.com",
    "password": "Password123!",
    "city": "New Delhi",
    "state": "Delhi",
    "pinCode": "110001",
    "gstin": "07AABCR9911K1ZX",
    "businessType": "EXPORTER"
  }
  ```
- **Response**: `201 Created` with JWT token and profile.

### `POST /api/auth/register/seller`
Register a rice miller / supplier account.
- **Request Body**:
  ```json
  {
    "fullName": "Rameshwar Singhal",
    "companyName": "Taraori Golden Rice Mills Ltd",
    "phone": "+91 98960 11223",
    "email": "taraori@mills.com",
    "password": "Password123!",
    "city": "Taraori",
    "district": "Karnal",
    "state": "Haryana",
    "pinCode": "132116",
    "gstin": "06AAACT4455R1Z2",
    "millName": "Taraori Golden Rice Mills Facility",
    "millCapacityMTPerDay": 200,
    "dispatchLocations": ["Karnal Dispatch Depot"]
  }
  ```
- **Response**: `201 Created` with JWT token and profile.

### `POST /api/auth/login`
Unified login for Buyers and Sellers.
- Note: Super Admin accounts are rejected here and directed to `/api/auth/admin/login`.

### `POST /api/auth/admin/login`
Super Administrator dedicated login route with Multi-Factor Authentication (MFA).
- **Request Body (Step 1)**:
  ```json
  { "email": "admin@pragyam.com", "password": "Pragyam@Admin2026!" }
  ```
  Returns `{ "success": false, "requiresMfa": true }`.
- **Request Body (Step 2 - MFA)**:
  ```json
  { "email": "admin@pragyam.com", "password": "Pragyam@Admin2026!", "mfaCode": "123456" }
  ```
  Returns `200 OK` with administrator JWT.

---

## 3. Inventory & Anonymous Catalog (`/api/inventory`)

### `GET /api/inventory`
Anonymous catalog visible to buyers and the public.
- **Confidentiality Rule**: The response strictly sanitizes all identifying seller data. Replaces exact mill identity with an anonymous code (e.g. `PRG-1025`) and generalized district/state.
- **Query Filters**: `category`, `variety`, `maxPrice`, `minGrainLength`, `maxMoisture`, `maxBroken`, `state`.
- **Response**:
  ```json
  {
    "success": true,
    "count": 4,
    "listings": [
      {
        "id": "lst-1025",
        "anonymousCode": "PRG-1025",
        "category": "GOLDEN_SELLA_RICE",
        "variety": "1121 Golden Sella Basmati",
        "classification": "BASMATI",
        "availableQuantityMT": 500,
        "availableQuantityQuintals": 5000,
        "askingPricePerQuintal": 8200,
        "askingPricePerMT": 82000,
        "qualitySpecs": {
          "grainLengthMm": 8.35,
          "whiteness": 40.0,
          "moisturePercent": 12.0,
          "brokenPercent": 1.0,
          "sortex": true,
          "cropYear": "2025-2026"
        },
        "packaging": "PP_BAG_50KG",
        "generalizedLocation": { "district": "Karnal", "state": "Haryana" }
      }
    ]
  }
  ```

### `POST /api/inventory` (Seller only)
Adds a new rice listing. Validates fields and auto-publishes to the anonymous directory.

### `GET /api/inventory/admin/all` (Super Admin only)
Unredacted inventory view displaying seller names, phone numbers, mill addresses, and brokerage offered.

---

## 4. Purchase Requirements (`/api/requirements`)

### `POST /api/requirements` (Buyer only)
Buyer submits procurement requirements (variety, category, quantity in MT, target price, quality specs).

### `GET /api/requirements/admin/all` (Super Admin only)
Super Admin views all buyer requirements along with buyer identities to feed into the Matching Engine.

---

## 5. Purchase Enquiries & Negotiations (`/api/enquiries` & `/api/negotiations`)

### `POST /api/enquiries` (Buyer only)
Buyer clicks "Submit Purchase Enquiry" on anonymous stock card. Dispatched directly to Pragyam Enterprises Brokerage desk.

### `GET /api/matching/admin/recommendations` (Super Admin only)
Runs the multi-criteria matching algorithm comparing active purchase requirements with available stock. Returns match score 0-100% and quality differences.

### `POST /api/negotiations/admin/:id/confirm-deal` (Super Admin only)
Locks agreed price, agreed volume, and brokerage arrangement.

---

## 6. Official Purchase Orders (`/api/purchase-orders`)

### `POST /api/purchase-orders/admin/create` (Super Admin only)
Issues legally-binding purchase order with unique sequential ID `PE-PO-YYYY-XXX`.

### `GET /api/purchase-orders/:id/pdf`
Generates branded PDF purchase order. Returns sanitized role-specific copy:
- Buyer receives copy with supplier represented as "Pragyam Enterprises Intermediary Verified Supply".
- Seller receives copy with buyer represented as "Pragyam Enterprises Verified Buyer".
- Super Admin receives complete unredacted contract.

---

## 7. Transport & Dispatch Tracking (`/api/transport`)

### `POST /api/transport/admin/assign`
Assigns logistics transporter, vehicle number, driver contact, Bilty (LR) number, and E-Way bill.

### `PUT /api/transport/admin/:id/status`
Updates status: `TRANSPORT_ASSIGNED` ➔ `VEHICLE_LOADING` ➔ `DISPATCHED` ➔ `IN_TRANSIT` ➔ `DELIVERED`.

---

## 8. Payments & GST Invoices (`/api/payments` & `/api/invoices`)

### `POST /api/payments/record-offline`
Records RTGS/NEFT/UPI UTR numbers for goods or brokerage settlements.

### `POST /api/invoices/admin/generate`
Generates GST Brokerage Tax Invoice under SAC Code 998319 with automated CGST/SGST/IGST calculation.
