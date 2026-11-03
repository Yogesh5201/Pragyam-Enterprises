# PRAGYAM ENTERPRISES
## User & Super Admin Operations Manual
### Complete Real-World Rice Brokerage Trading Guide

---

## 1. Introduction

**Pragyam Enterprises** is a commercial rice brokerage and trading management system engineered for high-volume agricultural trade. All transactions remain under the strict control of the broker (Pragyam Enterprises). Direct buyer-seller interactions are technically and procedurally blocked.

---

## 2. Super Admin Guide (The Business Owner)

### A. Accessing the Admin Command Center
1. Navigate to `/admin/login` (or click "Admin" on the top right).
2. Enter the administrator credentials:
   - Email: `admin@pragyam.com`
   - Password: `Pragyam@Admin2026!`
3. When prompted for Multi-Factor Authentication, enter the 6-digit authenticator code (Default demo: `123456`).
4. You are admitted to the **Super Administrator Command Center** (`/admin`).

### B. Daily Operational Workflow
1. **Review New Inquiries**: Check the **Negotiation Desk** tab for buyer inquiries arriving from the stock catalog.
2. **Run the Matching Engine**:
   - Navigate to **Matching Engine**.
   - The engine automatically cross-references Buyer Requirements with Available Stock and scores them from 0% to 100%.
   - Inspect quality variances (grain length difference in mm, moisture %, whiteness, price delta).
3. **Conducting Private Negotiations**:
   - Contact the rice mill privately or update negotiation counter-prices.
   - Record the buyer's target price and seller's counter-price.
   - Adjust the agreed rate and click **Lock & Finalize Deal Price**.
4. **Issuing Official Purchase Orders (POs)**:
   - Click **Generate Official Purchase Order** on an agreed deal.
   - Enter dispatch depot, delivery location, and payment terms.
   - Click **Confirm & Issue PO**.
   - Download the official PDF with Pragyam Enterprises branding.
5. **Assigning Logistics & Bilty (LR)**:
   - In **Transport & Bilty**, assign the assigned carrier, vehicle number (e.g. `HR-05-AU-9821`), driver name, and driver phone.
   - As the truck moves, advance the status: `Vehicle Loading` ➔ `Dispatched` ➔ `In Transit` ➔ `Delivered`.
6. **Payments & GST Invoicing**:
   - In **Payments**, review buyer advance and balance payments, verify UTR reference numbers, and mark verified.
   - In **GST Tax Invoices**, generate brokerage tax invoices under SAC 998319 with automated CGST/SGST/IGST breakdown.
7. **Excel Export Reports**:
   - In **Excel Exports**, download single-click `.xlsx` files for accounting, tax filing, and client directories.

---

## 3. Buyer / Purchaser Guide

### A. Browsing Anonymous Inventory
1. Visit the home page or open the Pragyam mobile app.
2. Filter lots by variety (e.g. `1121 Golden Sella`, `1509 Steam`), category, maximum price per quintal, grain length, and moisture.
3. Every card displays an anonymous code (`PRG-1025`) and generalized region (`Karnal, Haryana Hub`). Mill names and supplier identities are kept confidential.
4. Click **Submit Purchase Enquiry** to propose your required volume in MT and target price. The enquiry goes directly to Pragyam Enterprises.

### B. Posting Purchase Requirements
1. Click **Post Purchase Requirement**.
2. Specify rice variety, required quantity in MT, target price per quintal, and quality limits (grain length, moisture, broken %).
3. Pragyam Enterprises brokers will search inventory and present negotiated offers.

### C. Order Tracking & Documents
1. Navigate to **My Orders** in the Buyer Dashboard.
2. Download your signed official PO copy.
3. Check the **Logistics Tracking** tab to view your assigned truck number and bilty progress.

---

## 4. Seller / Rice Miller Guide

### A. Publishing Rice Stock
1. Log in to the **Seller Dashboard**.
2. Click **Add New Stock Listing**.
3. Enter Rice Variety, Category, Available Quantity in MT, Asking Price per Quintal, Brokerage Offered (₹/MT), and Quality Specs (Length mm, Moisture %, Broken %, Sortex).
4. Stock is auto-validated and published anonymously to buyers.

### B. Managing Supply Contracts & Dispatches
1. View confirmed deals under **Confirmed Supply Contracts**.
2. Download the Supplier PO copy.
3. Enter the dispatch details (truck number, driver name, bilty LR number).
4. Review brokerage commission settlements under **Brokerage Settlements**.
