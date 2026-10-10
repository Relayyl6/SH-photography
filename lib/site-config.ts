// Fixed client facts, defined once (AGENTS.md §4). Every value below is taken
// verbatim from CONTENT.md / client_spec.md A1. Do not edit without a client
// source — see AGENTS.md §1 and §5 rule 1.

export const siteConfig = {
  businessName: "SH Photography",
  owner: "Benedict Henry",
  founded: "2020, Benin City, Nigeria",
  location: "Manchester, United Kingdom",
  travelNote: "Available to travel",
  locationLine: "Manchester, United Kingdom. Available to travel.",
  phoneDisplay: "+44 7350 156054",
  phoneE164: "+447350156054",
  whatsappE164: "447350156054",
  // Spelling flagged as an open question (OPEN-QUESTIONS.md #3) — used as
  // supplied until the client confirms.
  email: "shfotography1@gmail.com",
  positioningLine:
    "Based in Manchester, United Kingdom. Photographing people, brands and products since 2020.",
  heroSubline: "Natural, vibrant storytelling for people, brands and products.", // [SUGGESTED]
  // [PLACEHOLDER] — no domain has been registered/confirmed yet (A13 #11).
  siteUrlPlaceholder: "https://www.shphotography.example",
} as const;

// [PLACEHOLDER: social links] — A13 #1. None confirmed except that a
// YouTube channel exists. Keep this list empty-safe; the UI must not break
// with zero links (DATA-MODEL.md §3).
export const socialLinks: { platform: string; label: string; url: string }[] = [
  // { platform: "instagram", label: "Instagram", url: "[PLACEHOLDER: Instagram URL]" },
  // { platform: "youtube", label: "YouTube", url: "[PLACEHOLDER: YouTube URL]" },
];

// [PLACEHOLDER: featured_video_id] — A13 #2. Empty until supplied; the
// VideoFacade component hides itself gracefully when this is empty.
export const featuredVideoId = "";
