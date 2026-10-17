// Seeded packages (CONTENT.md §6, DATA-MODEL.md `packages`).
// Tailored to the SH Photography brand — vibrant, authentic storytelling
// by Benedict Henry in Manchester, UK. show_price is false by default.

export type Package = {
  slug: string;
  name: string;
  category: "photography" | "class";
  image: string;
  summary: string;
  includes: string[];
  notes?: string;
  format?: "online" | "in_person" | "both";
  showPrice: boolean;
  priceLabel: string | null;
  ctaLabel: string;
};

export const packages: Package[] = [
  // 1. Weddings
  {
    slug: "weddings",
    name: "Weddings",
    category: "photography",
    image: "/photos/weddings/weddings_01.jpg",
    summary:
      "Cinematic, documentary wedding storytelling capturing raw emotion, quiet intimacy, and timeless romance.",
    includes: [
      "Creative consultation and bespoke wedding-day timeline coordination",
      "Full-day coverage from morning preparations through evening celebrations",
      "Handcrafted signature color grading and editorial skin retouching on select portraits",
      "Private online client gallery with full-resolution downloads and print licensing",
      "Curated sneak peek highlights delivered within 48 hours",
    ],
    notes: "Available throughout Greater Manchester, nationwide across the UK, and for destination weddings worldwide.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 2. Portraits
  {
    slug: "portraits",
    name: "Portraits",
    category: "photography",
    image: "/photos/portraits/portraits_01.jpg",
    summary:
      "Character-driven beauty and individual portraits sculpted with natural light and refined editorial elegance.",
    includes: [
      "Pre-shoot concept consultation, wardrobe advice, and mood boarding",
      "Studio or outdoor location shoot with professional lighting setup",
      "Relaxed, intuitive posing guidance to bring out your genuine confidence",
      "High-end non-destructive skin retouching with authentic texture preservation",
      "Private interactive proofing gallery with high-resolution digital downloads",
    ],
    notes: "Studio hire options available in Manchester city centre, or on-location across the UK.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 3. Family
  {
    slug: "family",
    name: "Family",
    category: "photography",
    image: "/photos/family/family_01.jpg",
    summary:
      "Honest warmth, spontaneous laughter, and tender milestones that define your family's story — relaxed, unhurried, and authentic.",
    includes: [
      "Location guidance tailored to your family (home, park, or Manchester studio)",
      "Gentle, play-based prompts that keep children engaged and capture true smiles",
      "Full family groupings alongside intimate parent-child and sibling portraits",
      "Signature warm color grading and hand-retouched heirloom digital collection",
      "Full personal printing and sharing rights with high-res digital delivery",
    ],
    notes: "Sessions are relaxed and unhurried to accommodate children's natural rhythms.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 4. Events
  {
    slug: "events",
    name: "Events",
    category: "photography",
    image: "/photos/events/events_01.jpg",
    summary:
      "Dynamic gatherings, social galas, corporate mixers, and celebratory occasions captured with an editorial eye for atmosphere.",
    includes: [
      "Pre-event run-of-sheet review to coordinate key speakers, awards, and schedule",
      "Comprehensive documentary coverage: room details, candid interactions, and VIP moments",
      "Professional ambient and off-camera flash lighting tailored to low-light venues",
      "Expedited 48-hour delivery option for social media announcements and PR releases",
      "High-resolution downloadable gallery with commercial usage licensing options",
    ],
    notes: "Available for private celebrations, corporate galas, charity balls, and public showcases.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 5. Birthdays
  {
    slug: "birthdays",
    name: "Birthdays",
    category: "photography",
    image: "/photos/birthday/birthday_01.jpg",
    summary:
      "Vibrant, candid celebration coverage that captures every genuine laugh, surprise toast, and unforgettable milestone.",
    includes: [
      "Pre-event consultation to map out key moments, family groupings, and schedule",
      "Full documentary coverage of celebrations, guest arrivals, cake cutting, and festivities",
      "High-resolution edited digital gallery delivered in an interactive private portal",
      "Full personal download and printing release with expedited sneak peeks within 48 hours",
    ],
    notes: "Available for private parties, milestone celebrations, and venue events across Manchester and beyond.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 6. Behind the Scenes
  {
    slug: "behind-the-scenes",
    name: "Behind the Scenes",
    category: "photography",
    image: "/photos/behind-the-scenes/behind-the-scenes_01.jpg",
    summary:
      "Documenting the creative energy, intense craft, and genuine camaraderie unfolding behind the camera on set and stage.",
    includes: [
      "Discreet, fly-on-the-wall photojournalistic coverage on active film sets or productions",
      "Key unit stills, creative crew in action, director setups, and equipment details",
      "High-impact editorial contrast and natural light balancing",
      "Full production stills package formatted for electronic press kits (EPK) and promo",
      "Rapid turnaround for social marketing and media release timelines",
    ],
    notes: "Silent shooting modes available to operate seamlessly during live takes and sound recording.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 7. Personal Branding
  {
    slug: "personal",
    name: "Personal Branding",
    category: "photography",
    image: "/photos/personal/personal_01.jpg",
    summary:
      "Bespoke individual portraits and creative personal lifestyle sessions celebrating individual identity and unique character.",
    includes: [
      "Strategic visual branding consultation aligning imagery with your business and ethos",
      "Multiple outfit and styling transitions across studio or curated location environments",
      "Blend of authoritative executive headshots, creative portraits, and dynamic working shots",
      "Magazine-quality editorial retouching and color grading",
      "Commercial usage rights for websites, book covers, speaking profiles, and social media",
    ],
    notes: "Tailored to entrepreneurs, authors, artists, and founders seeking distinctive visual presence.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 8. Sports & Athletics
  {
    slug: "sports",
    name: "Sports & Athletics",
    category: "photography",
    image: "/photos/sports/sports_01.jpg",
    summary:
      "High-octane action, athletic intensity, and decisive moments captured with precision timing and dramatic framing.",
    includes: [
      "High-speed burst coverage capturing decisive split-second athletic action",
      "Dramatic athlete environmental portraits with sculpted directional lighting",
      "Match day, tournament, gym, or training facility on-location coverage",
      "Dynamic contrast grading that accentuates muscle definition and raw intensity",
      "Fast turnaround for editorial publication, team announcements, and sponsor portfolios",
    ],
    notes: "Available for professional athletes, sports teams, fitness brands, and tournament organizers.",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Request a quote",
  },

  // 9. Classes: General Photography
  {
    slug: "general-photography-classes",
    name: "Photography Classes",
    category: "class",
    image: "/photos/behind-the-scenes/behind-the-scenes_02.jpg",
    summary:
      "Hands-on photography masterclasses covering manual camera control, composition, natural lighting, and visual storytelling.",
    includes: [
      "Complete mastery of manual exposure: shutter speed, aperture, ISO, and focal length",
      "Visual composition rules, frame balance, and mastering natural & artificial light",
      "Practical shooting exercises with live feedback and constructive portfolio review",
      "Comprehensive student cheat-sheet and gear recommendation guide for your budget",
    ],
    notes: "Available 1:1 or in small cohorts — join virtually from anywhere in the world or in-person in Manchester.",
    format: "both",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Book this class",
  },

  // 10. Classes: Retouching
  {
    slug: "retouching-classes",
    name: "Retouching Classes",
    category: "class",
    image: "/photos/behind-the-scenes/behind-the-scenes_05.jpg",
    summary:
      "Industry-standard editorial skin retouching masterclasses teaching frequency separation, dodge & burn, and color grading.",
    includes: [
      "Non-destructive workflow architecture in Adobe Photoshop and Lightroom",
      "Advanced skin texture preservation using frequency separation and micro dodge & burn",
      "Professional skin tone harmonization, color grading, and editorial mood creation",
      "Includes high-resolution practice RAW files, custom Photoshop brushes, and session recordings",
    ],
    notes: "Available online via screen-share or in-person in Manchester. Suitable for all skill levels from beginner to advanced.",
    format: "both",
    showPrice: false,
    priceLabel: null,
    ctaLabel: "Book this class",
  },
];

export const packageQuoteCopy =
  "Every shoot is tailored. Final pricing depends on your location, studio choice and requirements. Get in touch for a personalised quote.";
