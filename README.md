# SH Photography — Phase 0–2 scaffold

Next.js 14 (App Router) + TypeScript (strict) + Tailwind, built against
`AGENTS.md` / `CONTENT.md` / `client_spec.md` / `DATA-MODEL.md`.

## What's here

- **Pages:** Home, Portfolio (+ 5 session detail pages), About, Services &
  Pricing (`/pricing` redirects to `/services#packages`), Contact, Privacy.
- **Components:** Header (dropdown + mobile menu), Footer, SocialLinks,
  SessionPreviewCarousel (autoplay, pause control, `prefers-reduced-motion`,
  pause on hover/focus), GalleryGrid + Lightbox (focus-trapped, keyboard +
  swipe-safe), PackageCard (price hidden unless `showPrice`), VideoFacade
  (lazy `youtube-nocookie.com`, hides itself with no video ID), ContactForm
  (Zod-validated, honeypot, two submit paths).
- **`lib/`:** `site-config.ts` (verbatim client facts), `sessions.ts`,
  `packages.ts` (seeded, all placeholder copy), `whatsapp.ts` (unit-testable
  URL builder), `validators.ts` (shared Zod schema).

## What's stubbed, on purpose

This delivers the UI/front-end layer only — not the full Phase 0–8 build in
`client_spec.md`. Specifically **not** wired up yet:

- **Database / Supabase or Neon + Drizzle** — `sessions`, `photos`,
  `packages`, `social_links`, `site_settings`, `enquiries` all currently live
  as static data in `lib/`, matching `DATA-MODEL.md`'s shape so swapping in
  real queries later is a data-layer change, not a redesign.
- **`app/api/enquiries/route.ts`** validates and returns `{ ok: true }` but
  does not yet insert into Postgres or call Resend — see the TODO in that
  file. Insert-before-send (AGENTS.md §5 rule 5) is already the documented
  contract.
- **Clerk + `/admin`** — no admin dashboard yet (Phase 6).
- **Real photos** — every image is a labelled placeholder block
  (`components/PlaceholderImage.tsx`), never passed off as real work. Swap
  for `next/image` with required `alt`/`width`/`height` the moment photos
  arrive (A13 #4).
- **Fonts** — this build environment can't reach `fonts.googleapis.com`, so
  `app/layout.tsx` currently uses system font stacks. The Fraunces/Inter
  `next/font/google` code is left commented in that file — uncomment it once
  you're building somewhere with normal internet access (e.g. Vercel).
- **Social links / featured video ID** — both empty by design (A13 #1, #2);
  UI degrades gracefully either way.

## Open questions carried over from the spec (A13)

Still unanswered by the client: social handles, the tutorial video URL,
email spelling, real photos, logo/brand colours, whether beauty
portraits/events get folded into Portraits, real package contents, physical
retouching-class logistics, domain name. Don't resolve these by guessing —
flag them back to the client.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (verified passing)
npm run typecheck
```
