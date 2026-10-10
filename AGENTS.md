# AGENTS.md — Build Guide for AI Coding Agents

You are the implementing agent for **SH Photography**, a portfolio website for
Benedict Henry (trading as SH Photography). This file is the operating manual.
Read it fully before writing code. If anything here conflicts with
`README.md`, `DESIGN.md` or the customer spec, the customer spec wins, then
this file, then the others.

---

## 1. Source of truth (in strict order)

1. **The client's own words** — transcripts C1, C2, C3 and the supplied
   "Get to Know Me" copy (see `CONTENT.md`, Appendix 1 of the spec).
2. **The derived specification** (`client_spec.md`).
3. **Developer direction** tagged `[DEV]` (Supabase/Neon + Clerk).
4. **Agent suggestions** tagged `[SUGGESTED]`. Never present these as client
   facts.

If you are unsure whether something is a client fact or an invention, **stop
and add it to `OPEN-QUESTIONS.md`**. Do not fabricate:
- prices or amounts
- package contents
- testimonials, awards or competition wins
- social media handles or URLs
- photo captions or alt text that claims real subject matter
- the client's email spelling (currently `shfotography1@gmail.com` — note the
  `fotography`, not `photography`; flagged as an open question)

---

## 2. What "done" means (client's own checklist)

See `ROADMAP.md` → Definition of Done. In short:

- Portfolio showcasing five sessions: Family, Portrait, Weddings,
  Behind the scenes, Corporate.
- Each session shows an **auto-advancing preview slideshow**, and clicking
  opens a **fuller gallery** of that session.
- Pages: Home, About, Pricing, Contact, plus global social links.
- One **YouTube tutorial video playable on-site** (no redirect), using a
  privacy-enhanced `youtube-nocookie.com` embed behind a lazy facade.
- Packages describe **what's included**, with **no prices shown by default**.
- The client can **edit packages himself** via a protected admin dashboard.
- Services: birthdays, weddings, anniversaries, graduations, "all
  photography-related services". Classes: general photography, retouching
  (available **online or physical**).
- About page uses the supplied biography **verbatim**.
- Contact form with **two routing buttons**: "Send via Email" (server action
  → DB + Resend email) and "Send via WhatsApp" (opens `wa.me` link with a
  pre-filled message).
- Location: "Manchester, United Kingdom. Available to travel."
- Admin protected by **Clerk**, backed by **PostgreSQL** (Supabase or Neon).

---

## 3. Tech stack (agreed)

- **Next.js (App Router) + TypeScript**, strict mode.
- **Tailwind CSS** for styling. Optional `shadcn/ui` primitives.
- **Embla Carousel** for the session preview slideshows.
- **yet-another-react-lightbox** for the gallery lightbox.
- **Clerk** for authentication; `/admin` is gated by middleware + server-side
  allowlist check.
- **Supabase PostgreSQL** (preferred) *or* **Neon** + **Drizzle ORM**.
- **Supabase Storage** for images if Supabase; otherwise Cloudinary or
  Vercel Blob. Record the choice in `README.md`.
- **Resend** for transactional email.
- **Zod** for validation (shared client + server schemas).
- **Vercel** for hosting. Preview deploy per PR.
- **Plausible** or **Umami** (cookieless) for optional analytics — never
  Google Analytics without a cookie banner.

Pick **one** database/storage pairing on day 1 and stick to it. Supabase is
the lower-friction choice because DB + storage live under one vendor.

---

## 4. Repo conventions

- **File structure** is in `README.md` → Project Structure. Follow it.
- **Server-side only** for anything touching the DB or secrets. Use server
  actions or route handlers. Never expose keys with `NEXT_PUBLIC_` unless
  truly public (Clerk publishable key, site URL).
- **Typed everything.** No `any`. Prefer `unknown` + Zod parse.
- **No client-side DB access.** Enquiries and packages are read/written
  server-side.
- **Commit per phase** (see `ROADMAP.md`). Keep the app deployable at the end
  of every phase.
- **`lib/site-config.ts`** holds the fixed facts from A1 so they live in one
  place: phone, email, WhatsApp E.164, location line, business name.
- **Placeholders** are always visibly marked: `[PLACEHOLDER: Instagram URL]`.
  Track every one in `OPEN-QUESTIONS.md`.

---

## 5. Agent behaviour rules

1. **Never invent client facts.** If a value is missing, use a marked
   placeholder and add it to `OPEN-QUESTIONS.md`.
2. **Never display a price** unless `packages.show_price = true`. Default is
   `false`. `price_label` is free text and only rendered when the flag is on.
3. **Never add sessions** beyond the five in the spec without client
   confirmation. Beauty portraits go inside *Portraits*; events belong to
   *Services*.
4. **Respect `prefers-reduced-motion`.** Slideshow autoplay must be pausable
   and disabled for users who ask.
5. **Save before you send.** Enquiry records are inserted into `enquiries`
   *before* the Resend call, so a failed email never loses a lead.
6. **Admin auth is enforced server-side**, not just by hiding UI. Every
   server action under `/admin` re-checks the Clerk user against
   `ADMIN_ALLOWLIST`.
7. **No monetary amounts, testimonials, awards, or handles** anywhere in
   seeded data.
8. **Copy is verbatim** where the client supplied it (About page). Don't
   "improve" it.
9. **Images:** every `<Image>` has `alt`, explicit `width`/`height` (or
   `fill` with a sized parent), and `sizes`. No layout shift.
10. **Ask before assuming.** When two spec lines seem to conflict, add an
    entry to `OPEN-QUESTIONS.md` and pick the safer option (usually: hide,
    don't show).

---

## 6. Testing gates

Before marking any phase complete:

- `pnpm lint && pnpm typecheck && pnpm test` must pass.
- Unit tests cover: Zod validators, the WhatsApp URL builder
  (`lib/whatsapp.ts`), and the price-visibility rule.
- Playwright e2e covers: navigation, session preview → gallery, contact form
  email path (mocked Resend), WhatsApp link generation, admin auth gate,
  package edit visible on public page.
- Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices, SEO.
- `axe` reports zero serious violations on Home, Portfolio, Contact, About.

---

## 7. When you're stuck

- Re-read the relevant section of the spec.
- Prefer the option that shows **less** to the public until the client
  confirms (e.g. hide price, hide empty video, hide unfinished session).
- Add the uncertainty to `OPEN-QUESTIONS.md` with a one-line summary and the
  phase it blocks.
- Do not silently ship an assumption.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
