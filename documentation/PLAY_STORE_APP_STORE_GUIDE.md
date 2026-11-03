# PRAGYAM ENTERPRISES
## Google Play Store & Apple App Store Submission Guide
### Complete Production Release & Store Listing Kit

---

## 1. Application Store Identity & Metadata

| Field | Production Value |
| :--- | :--- |
| **App Name** | Pragyam Enterprises |
| **Category** | Business / Productivity (Agriculture & B2B Trading) |
| **Android Package Name** | `com.pragyam.enterprises` |
| **iOS Bundle Identifier** | `com.pragyam.enterprises` |
| **Target Android API Level** | Target API Level 34 / 35 (Android 14/15 compliance) |
| **Minimum Android API** | API Level 26 (Android 8.0 Oreo) |
| **Minimum iOS Version** | iOS 15.0+ |
| **Default Currency** | INR (₹) |
| **Supported Languages** | English (en-IN, en-US), Hindi (hi-IN) |

---

## 2. Store Listing Copywriting

### Short Description (Google Play - 80 chars max)
> Confidential rice brokerage and agricultural trade management platform.

### Full Description (Google Play & Apple App Store)
```
PRAGYAM ENTERPRISES — India's Premier Confidential Rice Brokerage & Agricultural Trading Management Platform.

Pragyam Enterprises is an institutional commodity trading platform connecting verified rice millers with domestic wholesalers, institutional buyers, and exporters through a secure, confidential intermediary broker.

CORE FEATURES:

🌾 ANONYMOUS RICE CATALOG:
Explore verified rice stock across Basmati and Non-Basmati varieties (1121 Golden Sella, 1509 Steam, 1401, 1718, Sugandha, Sharbati, Sona Masoori, and IR64) without exposing supplier contact details.

⚖️ PRECISE QUALITY METRICS:
Filter lots by laboratory-verified grain length (mm), moisture percentage, whiteness (Kett scale), broken grain percentage, and 100% optical Sortex cleaning.

📋 PROCUREMENT REQUIREMENTS:
Buyers can post procurement requirements and volume specifications. Our central brokerage desk matches requirements with available stocks.

📄 OFFICIAL DIGITAL PURCHASE ORDERS:
Receive computer-generated, legally-binding Purchase Orders with AGMARK quality compliance, terms, and digital tracking.

🚚 REAL-TIME TRANSPORT & BILTY TRACKING:
Track dispatches from mill loading docks to destination yards with verified vehicle numbers, driver details, and Bilty (LR) generation.

🔒 ABSOLUTE CONFIDENTIALITY:
Enforced trade intermediary model. Direct buyer-seller interactions are prohibited to preserve business relationships and broker integrity.

Headquartered in Karnal, Haryana — The Basmati Rice Trading Hub of India.
Support: desk@pragyam.com | +91 98120 00000
```

---

## 3. Reviewer Demo Credentials

Provide the following reviewer credentials in the Google Play Console / App Store Connect Review Notes:

| Role | Email | Password | 2FA / MFA Code | Note |
| :--- | :--- | :--- | :--- | :--- |
| **Buyer Demo** | `exports@royalfeast.com` | `Pragyam@2026` | N/A | Exporter purchasing view |
| **Seller Mill Demo** | `taraori@mills.com` | `Pragyam@2026` | N/A | Rice miller stock management |
| **Admin Demo** | `admin@pragyam.com` | `Pragyam@Admin2026!` | `123456` | Central Brokerage Desk |

---

## 4. Google Play Data Safety & iOS Privacy Declarations

### Data Collected:
1. **Name & Contact Details (Phone, Email)**: For user authentication and account management. Not shared with third parties.
2. **Photos & Documents**: Collected only when user takes pictures of rice grain samples or uploads dispatch bilty documents.
3. **Financial Data (UTR / Transaction IDs)**: For offline payment verification and GST tax invoices.

### Disclosures:
- No data is sold to third parties.
- All data is encrypted in transit using TLS 1.3.
- Users can request account and data deletion through the profile screen or by emailing `privacy@pragyam.com`.

---

## 5. Build & Release Instructions

### Generating Android Release Keystore:
```powershell
cd apps/mobile/scripts
./generate-keystore.bat
```

### Building Signed Production Android App Bundle (.aab):
```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
```

### Building Direct Test APK (.apk):
```bash
cd apps/mobile
npx eas-cli build --platform android --profile preview
```

### iOS TestFlight & App Store Build:
```bash
cd apps/mobile
npx eas-cli build --platform ios --profile production
```
*(Requires active Apple Developer Program membership and distribution certificate).*
