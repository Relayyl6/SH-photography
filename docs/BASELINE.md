# SH Photography — Baseline Audit (Visual Contract & Content Inventory)

> **Document Purpose**: This document establishes the strict, non-negotiable **visual contract and content baseline** for SH Photography prior to Firebase integration, admin dashboard development, and customer portal implementation. As stated in the Project Specification (Section 1 & Section 2):
> *"The public front end is finished and must not change in appearance... Treat the front end as a fixed visual contract. Only the content source changes. Any pixel difference after migration is a bug."*

---

## 1. Executive Summary & Audit Scope

This audit catalogs every content item, layout pattern, interactive behavior, responsive breakpoint, typography definition, and color token in the SH Photography codebase.

### Core Stack & Architecture
- **Framework**: Next.js 14.2.35 (App Router), React 18.3.1, TypeScript 5.5.3 (Strict Mode)
- **Styling**: Tailwind CSS 3.4.4 with custom design tokens (`paper`, `ink`, `accent`, `sand`, `line`)
- **Animation**: Framer Motion 14.1.0 with GPU-accelerated micro-interactions & StaggerReveal
- **Validation**: Zod 3.23.8 + React Hook Form 7.89.0
- **Icons**: Lucide React 1.55.0

---

## 2. Site-Wide Content & Settings

### 2.1 Identity & Global Constants (`lib/site-config.ts` & `lib/settings.ts`)
| Content Key | Current Value in Code | Source File | Category | Destination |
| :--- | :--- | :--- | :--- | :--- |
| `businessName` | `"SH Photography"` | `lib/site-config.ts` | Content | `settings/site.businessName` |
| `owner` | `"Benedict Henry"` | `lib/site-config.ts` | Content | `settings/site.ownerName` |
| `founded` | `"2020, Benin City, Nigeria"` | `lib/site-config.ts` | Content | `settings/site.founded` |
| `location` | `"Manchester, United Kingdom"` | `lib/site-config.ts` | Content | `settings/contact.address` |
| `travelNote` | `"Available to travel"` | `lib/site-config.ts` | Content | `settings/contact.travelNote` |
| `locationLine` | `"Manchester, United Kingdom. Available to travel."` | `lib/site-config.ts` | Content | `settings/contact.locationLine` |
| `phoneDisplay` | `"+44 7350 156054"` | `lib/site-config.ts` | Content | `settings/contact.phone` |
| `phoneE164` | `"+447350156054"` | `lib/site-config.ts` | Content | `settings/contact.phoneE164` |
| `whatsappE164` | `"447350156054"` | `lib/site-config.ts` | Content | `settings/contact.whatsapp` |
| `email` | `"shfotography1@gmail.com"` | `lib/site-config.ts` | Content | `settings/contact.email` |
| `positioningLine` | `"Based in Manchester, United Kingdom. Photographing people, brands and products since 2020."` | `lib/site-config.ts` | Content | `settings/site.seo.description` |
| `heroSubline` | `"Natural, vibrant storytelling for people, brands and products."` | `lib/site-config.ts` | Content | `pages/home.subtitle` |
| `siteUrl` | `"https://sh-photography.vercel.app"` | `lib/site-config.ts` | Structural/Config | Env / Config |
| `featuredVideoId` | `"vE8pQC6XHoU"` (active on home) / `"38xsz4Qoez4"` | `lib/site-config.ts` | Content | `pages/home.youtube.videoId` |
| `footerCredit` | `"Made By Yemuel - 09064982841"` | `components/Footer.tsx` | Content | `settings/site.footerText` |
| `footerTagline` | `"❤️ Made with love in Manchester"` | `components/Footer.tsx` | Content | `settings/site.footerTagline` |

### 2.2 Social Links (`lib/site-config.ts`, `lib/settings.ts`, `components/SocialLinks.tsx`)
| Platform | Label | URL | Order | Status | Destination |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Instagram | `"Instagram"` | `https://www.instagram.com/_sh_fotography?rpxt=bTZyN2h4M3pubXVh` | 1 | Visible | `settings/social[0]` |
| YouTube | `"YouTube"` | `https://youtube.com/@shfotography?si=_beJ7rTNqElsJhEs` | 2 | Visible | `settings/social[1]` |
| WhatsApp | `"WhatsApp"` | `https://wa.me/447350156054` | 3 | Visible | `settings/social[2]` |

### 2.3 Brand Assets (`/public`)
| Asset Path | Usage | Dimensions / Format | Category |
| :--- | :--- | :--- | :--- |
| `/logo.png` | Dark logo on paper navbar & footer | 140x100 / PNG | Storage: `site/logo.png` |
| `/logo-light.png` | Light alternative logo | 324 KB / PNG | Storage: `site/logo-light.png` |
| `/favicon.ico` | Browser tab icon | 4.8 KB / ICO | Storage: `site/favicon.ico` |
| `/icon.png` | Web app icon | 512x512 / PNG | Storage: `site/icon.png` |
| `/apple-icon.png` | Apple touch icon | 180x180 / PNG | Storage: `site/apple-icon.png` |
| `/photographer-bg.mp4` | Hero background video loop | 7.3 MB / MP4 | Storage / CDN |
| `/hero-bg.jpg` | Hero background poster fallback | 650 KB / JPG | Storage: `site/hero-bg.jpg` |
| `/hero-camera-top.png` | Floating top camera asset | 633 KB / PNG | Structural Asset |
| `/floating-camera.png` | Floating retro camera asset | 851 KB / PNG | Structural Asset |
| `/floating-lens.png` | Floating camera lens asset | 790 KB / PNG | Structural Asset |
| `/frame-circle.jpg` | Style poster central image | 373 KB / JPG | Storage: `pages/style/frame-circle.jpg` |
| `/footer-landscape.jpg` | Footer landscape bottom panorama | 362 KB / JPG | Storage: `site/footer-landscape.jpg` |

---

## 3. Page-by-Page Content & Structural Inventory

### 3.1 Home Page (`app/page.tsx`)
The home page features 6 primary sections:
1. **Hero Header**:
   - Location chip: `Manchester, United Kingdom · Est. 2020` with pulsing red dot (`bg-accent animate-pulse`).
   - Main typography: Three-tier staggered display:
     - Tier 1: `"Photographing"` (`font-medium`)
     - Tier 2: `"<span class='italic font-normal text-accent'>People,</span> brands"`
     - Tier 3: `"& products"` (`font-medium`)
   - Subline: `"Natural, vibrant storytelling for people, brands and products."`
   - Actions:
     - Primary Button: `"View my work"` -> `/portfolio`
     - Secondary Button: `"Book a shoot"` -> `/book`
   - Hero Showcase (4 Staggered Archive Cards):
     - Slot 1: Weddings (`/photos/weddings/weddings_01.jpg`), Badge: `SH Archive`, Chip: `Weddings`, Label: `Authentic Love`
     - Slot 2: Portraits (`/photos/portraits/portraits_01.jpg`, `mt-12` staggered), Badge: `SH Archive`, Chip: `Portraits`, Label: `Warm Elegance`
     - Slot 3: Events (`/photos/events/events_01.jpg`), Badge: `SH Archive`, Chip: `Events`, Label: `Live Atmosphere`
     - Slot 4: Sports (`/photos/sports/sports_01.jpg`, `mt-12` staggered), Badge: `SH Archive`, Chip: `Sports`, Label: `Decisive Action`
2. **Giant Watermark Crosswalk**:
   - Text: `"SH PHOTOGRAPHY"` in `text-[11.5vw] text-ink/[0.04]` leading-none tracking-tighter.
3. **Sessions Showcase Section**:
   - Kicker: `"Sessions"`, Heading: `"How I tell your story"`, Link: `"See the full portfolio →"` -> `/portfolio`
   - First 3 sessions: Weddings, Portraits, Family with `SessionPreviewCarousel` (auto-advancing every 3.5s).
   - Bottom CTA: `"Explore all 8 sessions in full portfolio →"`
4. **About Teaser Section**:
   - Image: `/photos/personal/personal_06.jpg` with corner crop marks and badges `SH Archive`, `MCR · UK`, `Founder & Principal`, `Benedict Henry`, `Manchester, United Kingdom`.
   - Content: Kicker `"Get to know me"`, Title `"Benedict Henry"`, Bio snippet: `"My photography style is all about natural storytelling. I strive to capture moments that feel authentic and timeless, aiming for perfection even before post-production."`
   - Link: `"Read my full story →"` -> `/about`
5. **Services & Classes Bento Grid (`bento/home`)**:
   - Kicker: `"What I do"`, Heading: `"Services & classes"`, Link: `"View packages & pricing"` -> `/services`
   - **Fixed 9 Bento Layout Slots**:
     - **Slot 1 (`weddings`)**: `col-span-2 md:col-span-2 md:row-span-2`, Image: `/photos/weddings/weddings_02.jpg`, Badge: `Photography`, Title: `Weddings`, Desc: `Cinematic, documentary wedding storytelling capturing raw emotion and quiet romance.`
     - **Slot 2 (`portraits`)**: `col-span-1 row-span-2 md:col-span-1 md:row-span-2`, Image: `/photos/portraits/portraits_02.jpg`, Badge: `Portraits`, Title: `Beauty &\nPortraits`
     - **Slot 3 (`family`)**: `col-span-1 row-span-1 md:col-span-1 md:row-span-1`, Image: `/photos/family/family_01.jpg`, Badge: `Warmth`, Title: `Family`
     - **Slot 4 (`events`)**: `col-span-1 row-span-1 md:col-span-1 md:row-span-1`, Image: `/photos/events/events_01.jpg`, Badge: `Atmosphere`, Title: `Events`
     - **Slot 5 (`behind-the-scenes`)**: `col-span-2 md:col-span-2 md:row-span-1`, Image: `/photos/behind-the-scenes/behind-the-scenes_01.jpg`, Badge: `On Set`, Title: `Behind the Scenes`
     - **Slot 6 (`birthdays`)**: `col-span-1 md:col-span-1 md:row-span-1`, Image: `/photos/birthday/birthday_01.jpg`, Badge: `Celebration`, Title: `Birthdays`
     - **Slot 7 (`personal`)**: `col-span-1 md:col-span-1 md:row-span-1`, Image: `/photos/personal/personal_01.jpg`, Badge: `Identity`, Title: `Personal Branding`
     - **Slot 8 (`sports`)**: `col-span-2 md:col-span-2 md:row-span-1`, Image: `/photos/sports/sports_01.jpg`, Badge: `Action`, Title: `Sports & Athletics`
     - **Slot 9 (`general-photography-classes`)**: `col-span-2 md:col-span-2 md:row-span-1`, Image: `/photos/behind-the-scenes/behind-the-scenes_05.jpg`, Badge: `Education · Online & In-Person`, Title: `Photography & Retouching Classes`
6. **YouTube Video Feature (`VideoFacade`)**:
   - Kicker: `"Behind the Lens"`, Heading: `"How the MAGIC happens, a walkthrough of my work"`
   - YouTube Embed: `vE8pQC6XHoU`, Lazy facade with high-res thumbnail and privacy-enhanced `youtube-nocookie.com`.

---

### 3.2 About Page (`app/about/page.tsx`)
- Mobile Header: Giant SVG `"MY"` and `"STORY"` stacked.
- Desktop Layout: Two-column split with sticky left portrait (40% width) and right scrollable prose (60% width).
- Portrait: `/photos/personal/personal_01.jpg` with archive corner marks and tags.
- Verbatim Copy (from `lib/about-copy.ts`):
  1. `"Founded in 2020 in Benin City, Nigeria, SH Photography was born from a passion for preserving life's most beautiful moments. Today, based in Manchester, United Kingdom, I specialize in weddings, beauty portraits, events, retouching, and general photography services, helping clients relive their memories through striking, natural imagery."`
  2. `"My photography style is all about natural storytelling. I strive to capture moments that feel authentic and timeless, aiming for perfection even before post-production. Every shoot is an opportunity to tell a story from the smiles and laughter of a wedding day to the elegance of a beauty portrait."`
  3. `"Photography started as a passion: I wanted to help people preserve memories, capture happiness, and create images that could last a lifetime. I approach every job with dedication, giving my very best to ensure client satisfaction is at the heart of everything I do. For me, it's never just about delivering a product it's about making the experience enjoyable, meaningful, and memorable for everyone involved."`
  4. `"Every shoot with SH Photography is lively and engaging. I communicate openly with clients to understand their vision, ensuring they are comfortable and confident in front of the camera. Over the years, I've had the privilege of covering countless events, winning retouching competitions, and developing a collection of professional gear to bring each project to life."`
  5. `"Above all, SH Photography is about relationships building trust with clients before, during, and after every shoot, and delivering images that capture the joy, beauty, and story of each unique moment"`

---

### 3.3 Style Page (`app/style/page.tsx`)
- Visual Poster Container: `#33110b` background with inner `#f6f4f0` card.
- Floating Frames Animation (`components/FloatingFrames.tsx`).
- Giant Typographic Composition: `"NATURAL"`, `"VIBRANT &"`, `"AUTHENTIC"`.
- Center Image: `/frame-circle.jpg` with `mix-blend-multiply`.
- Style Philosophy Copy (from `lib/about-copy.ts`):
  1. `"My photography style is natural, vibrant and authentic. I love bright colours and capturing moments as they truly happen, without excessive editing. I focus on real emotions, genuine connections and storytelling, whether it's a love story, a wedding, an event or simply a meaningful moment."`
  2. `"For me, photography goes beyond the pictures. It's about connecting with my clients and creating an excellent experience from the first interaction, throughout the shoot and even after delivery. I want every client to feel comfortable, valued and confident that their memories are being preserved beautifully and authentically."`

---

### 3.4 Portfolio Pages (`app/portfolio/page.tsx` & `app/portfolio/[session]/page.tsx`)
- Header: Kicker `"Portfolio"`, Title `"The work, by session"`, Subtitle `"Authentic storytelling across live sessions and editorial events. Each preview keeps moving on its own — open one for the fuller gallery."`
- **8 Core Sessions (`lib/sessions.ts`)**:
  1. **Weddings** (`weddings`): 24 images, preview 6
  2. **Portraits** (`portraits`): 24 images, preview 6
  3. **Family** (`family`): 24 images, preview 6
  4. **Events** (`events`): 24 images, preview 6
  5. **Birthdays** (`birthday`): 24 images, preview 6
  6. **Behind the Scenes** (`behind-the-scenes`): 24 images, preview 6
  7. **Personal Branding** (`personal`): 9 images, preview 6
  8. **Sports & Athletics** (`sports`): 24 images, preview 6
- **Gallery Grid & Lightbox (`components/GalleryGrid.tsx` & `components/Lightbox.tsx`)**:
  - Masonry grid layout with lazy loading.
  - Interactive Lightbox with keyboard navigation (Esc, ArrowLeft, ArrowRight), image counter, full-screen toggle, zoom, and captions.

---

### 3.5 Services & Pricing (`app/services/page.tsx` & `app/services/[slug]/page.tsx`)
- Header: Kicker `"Services & Pricing"`, Title `"What each package gives you"`
- Quote Copy: `"Every shoot is tailored. Final pricing depends on your location, studio choice and requirements. Get in touch for a personalised quote."`
- How it works 4-step sequence: `01 Enquire`, `02 Consult`, `03 Shoot`, `04 Delivery`
- **10 Core Packages (`lib/packages.ts`)**:
  - 8 Photography Packages: Weddings, Portraits, Family, Events, Birthdays, Behind the Scenes, Personal Branding, Sports & Athletics.
  - 2 Masterclass Packages: Photography Classes, Retouching Classes.
  - Rule: `showPrice: false` by default, `priceLabel: null`, `ctaLabel: "Request a quote"` (or `"Book this class"`).
- **Service Detail Pages (`app/services/[slug]/page.tsx`)**:
  - Breadcrumb: `"← Back to all services & classes"`
  - Format badges: `"Masterclass"` / `"Photography Service"`, `"Online / In Person"`
  - Comprehensive Inclusions list
  - Additional Notes / Location advice
  - 3-column curated photo gallery with title and subtitle (`lib/service-media.ts`)
  - Direct booking & inquiry CTA buttons (WhatsApp pre-filled & Contact Form)

---

### 3.6 Contact Page (`app/contact/page.tsx` & `components/ContactForm.tsx`)
- Header: `"Let's talk"`, Title `"Send a message or request a booking"`, Subline `"I'll get back to you as soon as I can."`
- Direct contact links: WhatsApp (`https://wa.me/447350156054`), Email (`mailto:shfotography1@gmail.com`), Phone (`tel:+447350156054`), Location line.
- Dual-action Contact Form:
  - Fields: Full Name, Email, Phone, Enquiry Type (`General Message` | `Booking Request`), Service / Package dropdown, Preferred Date, Location, Message.
  - Button 1: `"Send via Email"` -> Generates Gmail web composer URL (`https://mail.google.com/mail/?view=cm&fs=1&to=shfotography1@gmail.com&su=...&body=...`) without triggering OS app prompts.
  - Button 2: `"Send via WhatsApp"` -> Generates formatted `wa.me` message link.
  - Post-submission screen: Quick web routing buttons for Gmail Web, Outlook Web, and WhatsApp.

---

### 3.7 Booking Page (`app/book/page.tsx` & `components/book/*`)
- **Interactive 7-Step Booking Wizard**:
  - Step 1: Service Category & Session Sub-Type
  - Step 2: Date & Time Selection (interactive calendar with 60-min slot intervals)
  - Step 3: Location & Logistics (Studio, Client's Location, Outdoor, Venue, etc.)
  - Step 4: Creative Vision & Styling (Color vs B&W, style tags, inspiration links)
  - Step 5: Deliverables & Timeline (Turnaround time, usage rights, second shooter)
  - Step 6: Budget & Investment (Budget ranges, deposit acknowledgment)
  - Step 7: Client Information & Legal Agreements (Full name, email, phone, contact preference, terms & privacy checkboxes)
- **AI Smart Auto-Fill Assistant (`components/book/AiAutofillAssistant.tsx`)**:
  - Speech-to-text with real-time interim typing into editable input pane.
  - Multi-tier audio fallback (Web Speech API + MediaRecorder recording).
  - Review & Edit model: user can edit words before triggering AI extraction.
- **Availability Engine (`components/book/availability.ts`)**:
  - Opening Hours: Mon–Fri 09:00–17:00, Sat–Sun 10:00–16:00.
  - Lead time: 2 days (`BOOKING_LEAD_DAYS`).
  - Booking window: 540 days (18 months).
  - Slot duration: 60 minutes.

---

### 3.8 Legal Pages (`app/terms/page.tsx` & `app/privacy/page.tsx`)
- Complete UK GDPR and Data Protection Act 2018 policies.
- Explicit copyright, deposit policies, cancellation terms, and client rights.

---

### 3.9 Navigation & Header (`components/Header.tsx`)
- Floating pill header with glassmorphism backdrop (`bg-paper/75` or `bg-paper/95` on scroll).
- Navigation links:
  - Portfolio dropdown (All sessions + 8 individual session links).
  - About (`/about`)
  - Style (`/style`)
  - Services & Pricing (`/services`)
  - Contact (`/contact`)
  - Book button (`/book`)
  - Get in touch button (`/contact`)
- Mobile Navigation Drawer:
  - Collapsible Portfolio accordion with `ChevronDown` rotation (closed by default to avoid screen clutter).
  - Smooth CSS Grid row transition (`0fr -> 1fr`) with zero layout flicker.

---

### 3.10 Footer (`components/Footer.tsx`)
- Floating retro camera & camera lens animations.
- Typographic CTA: `"Ready to create together?"` / `"Let's make MAGIC."`
- Columns:
  1. Portfolio (All sessions, top 6 sessions)
  2. Services (Packages & Pricing, Photography Classes, Retouching)
  3. Contact (Phone, Email, Book a session)
  4. About us (About SH, Privacy Policy, Terms of Service)
  5. Social Media (Instagram, YouTube, WhatsApp)
- Bottom bar:
  - Copyright line
  - Credit: `"Made By Yemuel - 09064982841"`
  - Note: `"❤️ Made with love in Manchester"`
- Background: Bottom illustration `/footer-landscape.jpg` with `mix-blend-multiply`.

---

## 4. Layout, Responsiveness & Behavioral Rules

### 4.1 Responsive Breakpoints
- `xs`: `390px` (iPhone modern baseline)
- `sm`: `640px` (Small mobile / landscape)
- `md`: `768px` (iPad / Tablet portrait)
- `lg`: `1024px` (Tablet landscape / Laptop)
- `xl`: `1280px` (Desktop)
- `2xl`: `1536px` (Large Desktop)
- Container max-width: `1440px` (`.container-site`)

### 4.2 Color System
| Token | Hex Value | Role |
| :--- | :--- | :--- |
| `paper` | `#faf7f2` | Primary background canvas |
| `ink` | `#15130f` | Primary high-contrast text & dark elements |
| `accent` | `#e8491c` | Brand vibrant orange accent |
| `sand` | `#f0ebe1` | Soft warm secondary background |
| `line` | `rgba(21, 19, 15, 0.12)` | Subtle border divider |

### 4.3 Motion & Accessibility Rules
- Autoplay hero video strictly muted and playsInline with poster fallback.
- `prefers-reduced-motion: reduce` resets all transitions and animations to 0.01ms.
- Visible AA compliant focus rings on interactive elements (`:focus-visible`).
- Accessible skip-to-content link at the top of every page.

---

## 5. Hardcoded vs Content Classification

| Item | Current Location | Classification | Migration Target |
| :--- | :--- | :--- | :--- |
| Business Name, Owner, Founded | `lib/site-config.ts` | **Content** | Firestore: `settings/site` |
| Phone, WhatsApp, Email, Location | `lib/site-config.ts` | **Content** | Firestore: `settings/contact` |
| Social Media Links | `lib/site-config.ts`, `lib/settings.ts` | **Content** | Firestore: `settings/social` |
| Booking Settings (lead time, window, slot length) | `components/book/availability.ts` | **Content** | Firestore: `settings/booking` |
| Home Headline, Subline, CTA labels | `app/page.tsx` | **Content** | Firestore: `pages/home` |
| Hero 4 Archive Cards | `app/page.tsx` | **Content** | Firestore: `pages/home.heroCards` |
| Bento 9 Grid Slots Image Assignment | `app/page.tsx` | **Content** | Firestore: `bento/home` |
| Bento 9 Grid Slots HTML/CSS Grid structure | `app/page.tsx` | **Structural** | Stays in code (Zero visual change) |
| YouTube Video ID & Title | `lib/site-config.ts`, `app/page.tsx` | **Content** | Firestore: `pages/home.youtube` |
| About Body Paragraphs & Subline | `lib/about-copy.ts` | **Content** | Firestore: `pages/about` |
| About Cover Portrait & Badges | `app/about/page.tsx` | **Content** | Firestore: `pages/about.coverImage` |
| Style Page Copy & Central Image | `lib/about-copy.ts`, `app/style/page.tsx` | **Content** | Firestore: `pages/style` |
| Portfolio 8 Sessions metadata | `lib/sessions.ts` | **Content** | Firestore: `sessions/*` |
| Portfolio 177 Gallery Photos & Dimensions | `lib/gallery-data.json` | **Content** | Firestore: `portfolio/*` |
| 10 Packages (Inclusions, Notes, Pricing flag) | `lib/packages.ts` | **Content** | Firestore: `packages/*` or `sessions/*` |
| Service Media Galleries & Quotes | `lib/service-media.ts` | **Content** | Firestore: `sessions/*` |
| Booking Form Schema & Fields | `components/book/schema.ts` | **Content** | Firestore: `bookingFields/*` |
| Footer Credit & Tagline | `components/Footer.tsx` | **Content** | Firestore: `settings/site` |
| Tailwind Theme Tokens & Layout Breakpoints | `tailwind.config.ts`, `app/globals.css` | **Structural** | Stays in code |
| Header Glassmorphism Navigation Structure | `components/Header.tsx` | **Structural** | Stays in code |
| Footer Multi-column Layout & Illustrations | `components/Footer.tsx` | **Structural** | Stays in code |
| Lightbox Component Architecture | `components/Lightbox.tsx` | **Structural** | Stays in code |
| Carousel & Motion Reveal Primitives | `components/SessionPreviewCarousel.tsx` | **Structural** | Stays in code |

---

## 6. Baseline Screenshot Verification Gates

Per Section 2, Step 3 of the Project Specification, baseline screenshots must be captured across all core routes at 3 exact viewport widths:
1. **Mobile**: `390px` width
2. **Tablet**: `820px` width
3. **Desktop**: `1440px` width

Screenshots are saved to `docs/baseline/` and serve as the automated visual regression benchmark for every subsequent phase.
