// Fixed client facts, defined once (AGENTS.md §4). Every value below is taken
// from CONTENT.md / client_spec.md A1.

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
  email: "shfotography1@gmail.com",
  positioningLine:
    "Based in Manchester, United Kingdom. Photographing people, brands and products since 2020.",
  heroSubline: "Natural, vibrant storytelling for people, brands and products.",
  siteUrl: "https://sh-photography.vercel.app",
  siteUrlPlaceholder: "https://sh-photography.vercel.app",
} as const;

export const socialLinks: { platform: string; label: string; url: string }[] = [
  { platform: "instagram", label: "Instagram", url: "https://instagram.com/shfotography1" },
  { platform: "youtube", label: "YouTube", url: "https://youtube.com/@shphotography" },
  { platform: "whatsapp", label: "WhatsApp", url: "https://wa.me/447350156054" },
];

// Featured photography photoshoot behind-the-scenes
export const featuredVideoId = "vE8pQC6XHoU";