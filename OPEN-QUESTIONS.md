# OPEN-QUESTIONS.md

Tracked per `AGENTS.md` §1 and `CONTENT.md` §10. Every placeholder in the
live build must be listed here, visually marked in code with
`[PLACEHOLDER: ...]`, and never shown to a visitor as final copy.

1. **Social accounts** — which platforms, and exact URLs/handles? Only
   YouTube is confirmed to exist. `social_links` seed is empty; header/footer
   hide the row gracefully until links are supplied. — *Blocks: Phase 1*
2. **YouTube video** — URL/ID of the one tutorial video to embed.
   `featured_video_id` seeded empty; video section hides itself until set.
   — *Blocks: Phase 5*
3. **Email address spelling** — confirm `shfotography1@gmail.com`
   ("fotography") is correct. Used as-is, flagged here per the spec.
   — *Blocks: Phase 0, Phase 4 (Resend `ENQUIRY_TO_EMAIL`)*
4. **Photos** — no real session photos supplied yet. All gallery and preview
   images on this build are clearly-labelled **placeholder stock imagery**,
   not the client's work. Replace before launch. — *Blocks: Phase 2*
5. **Logo and brand colours** — none supplied. Site currently uses a
   typographic wordmark ("SH Photography") and an agent-chosen accent colour
   consistent with the client's "bright, vibrant, natural" style statement.
   Swap on confirmation. — *Blocks: Phase 1*
6. **Beauty portraits / events / brands & products** — mentioned in the bio
   and positioning line but not in the 5-session list. Currently folded:
   beauty portraits → Portraits session; events/birthdays/anniversaries/
   graduations → Services (not a session). No new session added.
   — *Confirm with client*
7. **Packages** — no real package names/inclusions supplied. Seeded with
   placeholder summaries and bullet lists per service/class, `show_price =
   false` throughout. — *Blocks: Phase 3, Phase 6*
8. **Physical retouching classes** — location, group vs 1:1, duration unknown.
9. **Booking** — confirmed as enquiry/request only (no deposits/calendar) per
   spec A8.4.
10. **Video placement** — spec allows Home and/or Services. This build places
    it on Home beneath the session section. Confirm before launch.
11. **Domain name** / notification email — not supplied; `.env.example` left
    blank.
12. **Testimonials or awards** — none supplied. None shown; the bio's mention
    of retouching-competition wins is not expanded into a testimonial block.
13. **Photographer credit / usage consent** — not yet confirmed for publicly
    showing client (wedding/family) photos.
