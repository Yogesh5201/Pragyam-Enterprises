# PRAGYAM ENTERPRISES
## Complete Production-Ready Rice Brokerage & Trading Management Platform

[![Confidentiality Tests](https://img.shields.io/badge/Security%20%26%20Confidentiality%20Tests-100%25%20Passing-brightgreen)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](#)
[![Expo / React Native](https://img.shields.io/badge/Expo%20%2F%20React%20Native-Android%20%26%20iOS-4630EB)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20Prisma-336791)](#)

---

## 1. Executive Summary & Core Principle

**PRAGYAM ENTERPRISES** is a dedicated, admin-controlled, confidential rice brokerage and trading management platform.

### The Absolute Intermediary Principle
- **No Direct Buyer-Seller Interaction**: Buyers and sellers must NEVER be able to identify, contact, negotiate with, or transact directly with each other through the platform.
- **Enforcement Levels**:
  - **Database Level**: Decoupled relational schemas and anonymized codes (`PRG-1025`).
  - **API Level**: Role-based Data Transfer Objects (DTOs) with backend sanitization interceptors.
  - **Document Level**: Clean, branded purchase order PDFs with sanitized intermediary representation.
  - **Operational Level**: Central Super Admin controls all negotiations, deal locking, PO issuance, and dispatch tracking.

---

## 2. Monorepo Structure

```
Pragyam/
├── apps/
│   ├── api/                 # NestJS / Express / TypeScript REST API (Port 4000)
│   │   ├── prisma/          # PostgreSQL schema & Prisma ORM definitions
│   │   ├── src/             # Modular controllers, services, middleware, ACID store
│   │   └── test/            # Mandatory Confidentiality & Security automated tests
│   ├── web/                 # Next.js 14 App Router Web & Admin Portal (Port 3000)
│   │   ├── src/app/         # Public Catalog, Buyer Desk, Seller Desk, Admin Hub
│   │   └── src/components/  # Anonymous RiceCard, EnquiryModal, RequirementModal, AddStock
│   └── mobile/              # React Native / Expo cross-platform mobile app (Android & iOS)
│       ├── src/screens/     # Welcome, BuyerCatalog, Requirements, Stock, Orders, Dispatch, Profile
│       ├── scripts/         # Android Keystore generator & release build scripts
│       ├── app.json         # Google Play (com.pragyam.enterprises) & iOS store metadata
│       └── eas.json         # EAS production AAB and preview APK build profiles
├── packages/
│   ├── types/               # Shared TypeScript models, enums, DTOs, and interfaces
│   └── shared/              # Shared calculations (brokerage, matching engine, unit conversions)
├── infrastructure/
│   ├── docker/              # Production multi-stage Dockerfiles for API and Web
│   └── docker-compose.yml   # Orchestrates PostgreSQL 16, Redis, API, and Web
├── documentation/
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── CONFIDENTIALITY_SECURITY_AUDIT.md
│   ├── PLAY_STORE_APP_STORE_GUIDE.md
│   └── USER_AND_ADMIN_MANUAL.md
├── package.json             # Root NPM workspaces configuration
└── README.md
```

---

## 3. Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install --install-links
```

### 2. Run Mandatory Confidentiality Test Suite
```bash
npm test --workspace=@pragyam/api
```
*All 12 automated test suites verify that buyer/seller private identities never leak.*

### 3. Start Backend API (Port 4000)
```bash
npm run dev:api
```
Health Check: `http://localhost:4000/api/health`

### 4. Start Next.js Web & Admin Portal (Port 3000)
```bash
npm run dev:web
```
Access points:
- Public Catalog & Landing: `http://localhost:3000`
- Super Admin Command Center: `http://localhost:3000/admin/login`
- Buyer Procurement Portal: `http://localhost:3000/buyer/dashboard`
- Seller Mill Portal: `http://localhost:3000/seller/dashboard`

### 5. Launch Expo Mobile Application
```bash
npm run dev:mobile
```

---

## 4. Default Demo Accounts

| Role | Email | Password | MFA Code | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@pragyam.com` | `Pragyam@Admin2026!` | `123456` | Full unredacted broker desk |
| **Buyer (Exporter)** | `exports@royalfeast.com` | `Pragyam@2026` | N/A | Anonymous stock browsing & enquiries |
| **Seller (Miller)** | `taraori@mills.com` | `Pragyam@2026` | N/A | Mill inventory & supply orders |

---

## 5. Docker Deployment

Deploy the entire production stack (PostgreSQL 16, Redis, API, and Web) with one command:
```bash
docker compose up --build -d
```
