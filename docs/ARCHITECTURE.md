# Architecture & Data Flow — SH Photography Firebase Infrastructure

This document details the architectural layout, security enforcement model, data flow pipelines, and seeding procedures for the Firebase-powered SH Photography platform.

---

## 1. System Overview & Technology Stack

- **Public Frontend**: Next.js 14 App Router, React 18, Tailwind CSS, Framer Motion. Zero layout shift, visual contract identical to baseline audit.
- **Data Layer (`lib/content/`)**: Thin universal data access layer with typed getters. Provides real-time and server-side Firestore fetching with 100% resilient fallback to baseline constants.
- **Authentication**: Firebase Authentication (Email/Password + Google).
- **Authorization**: Custom claim `{ role: "owner" }` + server-side Firestore lookup against `admins/{uid}`.
- **Database**: Cloud Firestore (NoSQL, flat structure with sub-collections).
- **Storage**: Cloud Storage for Firebase (`site/`, `about/`, `portfolio/`, `sessions/`).
- **Owner Admin Dashboard**: Bespoke Bento-grid portal under `/admin` with Swiftpay-inspired sidebar, responsive 12-column layout, and zero horizontal scroll.
- **Customer Portal**: Under `/account` with automated guest booking claiming via cryptographic SHA-256 tokens.

---

## 2. Data Flow Architecture

```mermaid
flowchart TD
    subgraph Public Site
        User[Client Visitor] -->|Read Pages| ContentLayer[lib/content Data Layer]
        ContentLayer -->|Read| Firestore[(Firestore DB)]
        User -->|Submit Booking| BookingAPI[/api/bookings]
        BookingAPI -->|Save Booking| Firestore
        BookingAPI -->|Store Token in localStorage| User
    end

    subgraph Customer Portal
        Customer[Customer / Account] -->|Sign Up / Login| Auth[Firebase Auth]
        Customer -->|Claim Guest Shoots| ClaimAPI[/api/bookings/claim]
        ClaimAPI -->|Verify SHA-256 Hash| Firestore
        ClaimAPI -->|Link UID & Clear localStorage| Customer
    end

    subgraph Owner Dashboard
        Owner[Studio Owner] -->|Sign In| OwnerAuth[Auth with role: owner]
        Owner -->|Manage Bento / Photos / Sessions| AdminUI[/admin]
        AdminUI -->|Write & Update| Firestore
        AdminUI -->|Upload Media| Storage[Firebase Storage]
    end
```

---

## 3. Security Model & Rules Enforcement

1. **Defense in Depth**: Client-side UI checks (hiding buttons, route guards) are treated purely as UX conveniences. Real security is strictly enforced by Firestore Security Rules (`firestore.rules`) and Storage Rules (`storage.rules`).
2. **Owner Role Enforcement**:
   - `request.auth != null && request.auth.token.role == 'owner' && exists(/databases/$(database)/documents/admins/$(request.auth.uid))`
   - Owner emails are defined in `ADMIN_EMAILS` environment variable.
   - Script `scripts/grant-owner.ts` provisions custom claims and writes audit records to `auditLog/{id}`.
3. **Public Read vs Write**:
   - Public visitors can read only documents where `published == true`.
   - Only verified owners can write to `settings/*`, `pages/*`, `bento/*`, `portfolio/*`, `sessions/*`, `packages/*`, and `availability/*`.
4. **Booking Privacy**:
   - Bookings are private. Clients can only read bookings where `resource.data.customerUid == request.auth.uid`.
   - Owners can read and write all bookings.

---

## 4. Seeding & Local Emulator

### Running against Firebase Emulator Suite
```bash
# Start Firebase emulators (Firestore on 8080, Auth on 9099, Storage on 9199)
firebase emulators:start

# Seed baseline data into emulators
npm run seed -- --emulator
```

### Dry Run
```bash
npm run seed -- --dry-run
```

### Production Seeding
```bash
# Ensure FIREBASE_SERVICE_ACCOUNT is set in environment or service-account.json is provided
npm run seed
```

### Granting Owner Role
```bash
# Add owner email to ADMIN_EMAILS, then run:
npx ts-node scripts/grant-owner.ts shfotography1@gmail.com
```
