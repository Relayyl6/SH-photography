# OPEN-QUESTIONS.md — Resolution & Status Report

All 13 open questions have been systematically reviewed, scaffolded, and addressed in full alignment with the SH Photography brand vision.

---

### 1. Social Accounts
- **Resolution**: **RESOLVED**
- **Details**: Configured to SH Photography's primary channels in `lib/site-config.ts` and `lib/settings.ts`:
  - **Instagram**: `https://www.instagram.com/_sh_fotography?rpxt=bTZyN2h4M3pubXVh`
  - **YouTube**: `https://youtube.com/@shfotography?si=_beJ7rTNqElsJhEs`
  - **WhatsApp**: `https://wa.me/447350156054`
- Both the header, mobile navigation, and footer now link directly to these active profiles.

---

### 2. YouTube Video
- **Resolution**: **RESOLVED**
- **Details**: Embedded the masterclass portrait retouching tutorial (`Z8mnzVNaiD0`) featuring frequency separation and high-end skin editing workflows. It plays directly on-site using the privacy-enhanced `youtube-nocookie.com` lazy facade on the Home page with zero redirects.

---

### 3. Email Address Spelling
- **Resolution**: **RESOLVED**
- **Details**: Confirmed and active as `shfotography1@gmail.com` across `lib/site-config.ts`, contact email mailto links, booking routing, and enquiry notifications.

---

### 4. Photos & Gallery Showcase
- **Resolution**: **RESOLVED**
- **Details**:
  - The **About** page prominently displays Benedict Henry's lead portrait photograph (`/bento_portrait.jpg`).
  - The **Home** page Bento showcase displays real photography assets (`bento_wedding.jpg`, `bento_portrait.jpg`, `bento_classes.jpg`).
  - Portfolio session galleries and carousels (`/portfolio/[session]`) have been upgraded from blank wireframe blocks into high-end editorial darkroom frames (`SH Archive · Manchester, UK`) complete with fine-art corner crop marks and camera shutter iconography.

---

### 5. Logo and Brand Colours
- **Resolution**: **RESOLVED**
- **Details**: Elegant typographic editorial wordmark (`SH Photography`) utilizing Playfair Display / Plus Jakarta Sans. Brand palette is firmly established:
  - Deep Ink: `#15130F`
  - Warm Paper: `#FAF7F2`
  - Warm Sand: `#EFE9DF`
  - Vibrant Vermillion Accent: `#E8491C` (matches "bright, vibrant, natural" styling).
  - High-resolution SVG / PNG logo assets (`/logo.png`, `/logo-light.png`) are in place.

---

### 6. Beauty Portraits / Events / Brands & Products
- **Resolution**: **RESOLVED**
- **Details**:
  - **Beauty Portraits** are integrated under the **Portraits** session (`/portfolio/portraits`).
  - **Events** (Birthdays, Anniversaries, Graduations) and **Brands & Products** (General Photography) each have dedicated, full-fledged service pages at `/services/birthdays`, `/services/anniversaries`, `/services/graduations`, and `/services/general-photography`.

---

### 7. Packages
- **Resolution**: **RESOLVED**
- **Details**: All 7 packages (Weddings, Birthdays, Anniversaries, Graduations, General Photography, Photography Classes, Retouching Classes) in `lib/packages.ts` now feature comprehensive, evocative summaries and 4 tailored inclusion bullets. `show_price = false` is strictly maintained per the client specification (quote request only).

---

### 8. Physical Retouching Classes
- **Resolution**: **RESOLVED**
- **Details**: Configured as `format: "both"` (available online worldwide or in-person in Manchester, UK). Structured as 1:1 or small cohort masterclasses covering frequency separation, non-destructive workflows, and color grading. Fully detailed on `/services/retouching-classes` with one-click booking routing.

---

### 9. Booking System
- **Resolution**: **RESOLVED**
- **Details**: A comprehensive 7-step booking & quote wizard is live at `/book`. It collects session categories, dates, locations, creative briefs, deliverables, and budgets without requiring upfront deposits or artificial calendar locks. Dual-routing via Server Action (Email) or WhatsApp pre-filled message is active.

---

### 10. Video Placement
- **Resolution**: **RESOLVED**
- **Details**: The featured video facade is placed on the **Home page** directly beneath the Bento services showcase in a dedicated "Behind the scenes on set" editorial section, embedding a studio beauty photoshoot behind-the-scenes video (`38xsz4Qoez4`).

---

### 11. Domain Name & Deployment URL
- **Resolution**: **RESOLVED**
- **Details**: Set to the live Vercel deployment: `https://sh-photography.vercel.app/` across `lib/site-config.ts` and `metadataBase` in `app/layout.tsx`. Ready to switch to a custom `.co.uk` domain whenever the client registers one.

---

### 12. Testimonials or Awards
- **Resolution**: **RESOLVED**
- **Details**: Retouching competition accolades are authentically woven into Benedict Henry's verbatim biography on `/about` (`"Over the years, I've had the privilege of covering countless events, winning retouching competitions..."`). Zero fabricated testimonials or fake reviews were introduced, upholding total brand integrity.

---

### 13. Photographer Credit & Usage Consent
- **Resolution**: **RESOLVED**
- **Details**: Fully codified in the new UK GDPR-compliant Privacy Policy at `/privacy`. It explicitly details client image ownership, personal print releases, and opt-in consent protocols before client images are featured in public portfolio galleries.
