export type ServiceMediaItem = {
  hero: { src: string; alt: string; caption: string };
  gallery: { src: string; alt: string; title: string; subtitle: string }[];
  styleQuote: string;
};

export const serviceMedia: Record<string, ServiceMediaItem> = {
  weddings: {
    hero: {
      src: "/photos/weddings/weddings_01.jpg",
      alt: "Wedding couple photography by SH Photography",
      caption: "Documentary Wedding Storytelling · Manchester & UK Wide",
    },
    gallery: [
      {
        src: "/photos/weddings/weddings_02.jpg",
        alt: "Bride and groom portrait",
        title: "Golden Hour Romance",
        subtitle: "Raw emotion and cinematic intimacy",
      },
      {
        src: "/photos/weddings/weddings_03.jpg",
        alt: "Scenic couple embrace",
        title: "Enduring Connection",
        subtitle: "Breathtaking landscape & editorial framing",
      },
      {
        src: "/photos/weddings/weddings_04.jpg",
        alt: "Fine art bridal portrait",
        title: "Quiet Elegance",
        subtitle: "Sculptural lighting and timeless grace",
      },
    ],
    styleQuote:
      "Documentary wedding photography for couples who want to truly feel their day, not pose through it.",
  },
  portraits: {
    hero: {
      src: "/photos/portraits/portraits_02.jpg",
      alt: "Beauty and individual portrait photography by SH Photography",
      caption: "High-End Beauty & Individual Portraiture · Manchester Studio",
    },
    gallery: [
      {
        src: "/photos/portraits/portraits_01.jpg",
        alt: "Studio lighting beauty portrait",
        title: "Natural Elegance",
        subtitle: "Refined studio lighting & authentic skin tones",
      },
      {
        src: "/photos/portraits/portraits_03.jpg",
        alt: "Editorial character portrait",
        title: "Character & Depth",
        subtitle: "Creative shadows and confident expression",
      },
      {
        src: "/photos/portraits/portraits_04.jpg",
        alt: "Editorial beauty close-up",
        title: "Flawless Detail",
        subtitle: "Non-destructive high-end skin retouching",
      },
    ],
    styleQuote:
      "Sculpting character, poise, and natural confidence through intimate lighting and unhurried direction.",
  },
  family: {
    hero: {
      src: "/photos/family/family_01.jpg",
      alt: "Family portrait session by SH Photography",
      caption: "Warmth & Genuine Milestones · On Location & Studio",
    },
    gallery: [
      {
        src: "/photos/family/family_02.jpg",
        alt: "Candid laughter between family members",
        title: "Honest Connection",
        subtitle: "Unscripted warmth and spontaneous joy",
      },
      {
        src: "/photos/family/family_03.jpg",
        alt: "Tender parent and child milestone portrait",
        title: "Tender Milestones",
        subtitle: "Cherished moments framed to last generations",
      },
      {
        src: "/photos/family/family_04.jpg",
        alt: "Full family heirloom portrait grouping",
        title: "Heirloom Memories",
        subtitle: "Relaxed prompts capturing natural family dynamic",
      },
    ],
    styleQuote:
      "Capturing the honest warmth, joyful chaos, and heartfelt connections that make your family story unforgettable.",
  },
  events: {
    hero: {
      src: "/photos/events/events_01.jpg",
      alt: "Dynamic gala and event photography by SH Photography",
      caption: "Celebratory Occasions & Gatherings · Manchester & UK Wide",
    },
    gallery: [
      {
        src: "/photos/events/events_02.jpg",
        alt: "Event guest interaction and atmosphere",
        title: "Atmosphere & Energy",
        subtitle: "Documenting room energy and spontaneous toasts",
      },
      {
        src: "/photos/events/events_03.jpg",
        alt: "VIP keynote and speaker coverage",
        title: "Key Moments",
        subtitle: "Decisive coverage of announcements and honours",
      },
      {
        src: "/photos/events/events_04.jpg",
        alt: "Candid crowd and celebratory joy",
        title: "Spontaneous Celebrations",
        subtitle: "Fast 48-hour delivery for social and PR press",
      },
    ],
    styleQuote:
      "Editorial event coverage preserving the electric atmosphere, pivotal speeches, and unposed joy of the room.",
  },
  birthdays: {
    hero: {
      src: "/photos/birthday/birthday_01.jpg",
      alt: "Birthday celebration event photography by SH Photography",
      caption: "Evening Celebration & Candlelight · Manchester Venue",
    },
    gallery: [
      {
        src: "/photos/birthday/birthday_02.jpg",
        alt: "Cake cutting and candlelight moments",
        title: "The Celebration",
        subtitle: "Candlelight, champagne & joyous energy",
      },
      {
        src: "/photos/birthday/birthday_03.jpg",
        alt: "Celebration portraiture",
        title: "Guest Connections",
        subtitle: "Candid laughter and spontaneous moments",
      },
      {
        src: "/photos/birthday/birthday_04.jpg",
        alt: "Milestone celebration portrait",
        title: "Cherished Milestones",
        subtitle: "Timeless portraiture to remember forever",
      },
    ],
    styleQuote:
      "Unobtrusive documentary coverage capturing every burst of laughter, heartfelt toast, and spontaneous interaction.",
  },
  "behind-the-scenes": {
    hero: {
      src: "/photos/behind-the-scenes/behind-the-scenes_01.jpg",
      alt: "Behind the scenes on set photography by SH Photography",
      caption: "Film Set, Studio & Stage Production Stills · Manchester",
    },
    gallery: [
      {
        src: "/photos/behind-the-scenes/behind-the-scenes_02.jpg",
        alt: "Crew camera operation and director direction",
        title: "The Craft in Action",
        subtitle: "Documenting production mechanics and focus",
      },
      {
        src: "/photos/behind-the-scenes/behind-the-scenes_03.jpg",
        alt: "Lighting modifier and camera setup on set",
        title: "On-Set Lighting",
        subtitle: "Atmospheric framing without interrupting takes",
      },
      {
        src: "/photos/behind-the-scenes/behind-the-scenes_04.jpg",
        alt: "Crew collaboration during live shoot",
        title: "Creative Camaraderie",
        subtitle: "High-impact stills ready for marketing and EPKs",
      },
    ],
    styleQuote:
      "Discreet fly-on-the-wall photojournalism capturing the intense focus, equipment craft, and raw energy behind the lens.",
  },
  personal: {
    hero: {
      src: "/photos/personal/personal_01.jpg",
      alt: "Personal branding creative portrait by SH Photography",
      caption: "Creative Personal Branding & Identity · Manchester",
    },
    gallery: [
      {
        src: "/photos/personal/personal_02.jpg",
        alt: "Executive creative portrait on location",
        title: "Distinctive Presence",
        subtitle: "Visual identity tailored for leaders and creators",
      },
      {
        src: "/photos/personal/personal_03.jpg",
        alt: "Dynamic lifestyle working portrait",
        title: "Storytelling Lifestyle",
        subtitle: "Capturing your working aesthetic and personality",
      },
      {
        src: "/photos/personal/personal_04.jpg",
        alt: "Editorial portrait with artistic lighting",
        title: "Editorial Edge",
        subtitle: "Commercial licensing for web, press, and author covers",
      },
    ],
    styleQuote:
      "Elevating founders, artists, and creators with imagery that communicates authority, authenticity, and refined style.",
  },
  sports: {
    hero: {
      src: "/photos/sports/sports_01.jpg",
      alt: "Sports and athletic photography in action by SH Photography",
      caption: "High-Octane Athletics & Sports Photography · Manchester & UK",
    },
    gallery: [
      {
        src: "/photos/sports/sports_02.jpg",
        alt: "High-speed athlete motion capture",
        title: "Explosive Motion",
        subtitle: "Split-second timing freezing peak performance",
      },
      {
        src: "/photos/sports/sports_03.jpg",
        alt: "Athlete portrait with dramatic lighting",
        title: "Athletic Grit",
        subtitle: "Sculpted directional light accentuating power",
      },
      {
        src: "/photos/sports/sports_04.jpg",
        alt: "Team intensity and training session",
        title: "Competitive Intensity",
        subtitle: "Editorial contrast for sponsorship and club campaigns",
      },
    ],
    styleQuote:
      "Capturing the decisive split-seconds of triumph, grit, and athletic precision with dynamic framing and high-speed clarity.",
  },
  "general-photography-classes": {
    hero: {
      src: "/photos/behind-the-scenes/behind-the-scenes_01.jpg",
      alt: "Photography class in action with Benedict Henry",
      caption: "Practical Camera Mastery & Shooting Guidance · Manchester",
    },
    gallery: [
      {
        src: "/photos/behind-the-scenes/behind-the-scenes_02.jpg",
        alt: "Instructor demonstrating camera controls",
        title: "Hands-on Mastery",
        subtitle: "ISO, shutter speed, aperture & light",
      },
      {
        src: "/photos/behind-the-scenes/behind-the-scenes_03.jpg",
        alt: "Studio lighting setup demonstration",
        title: "Studio & Natural Light",
        subtitle: "Learning composition and exposure control",
      },
      {
        src: "/photos/behind-the-scenes/behind-the-scenes_04.jpg",
        alt: "Manchester photo walk location",
        title: "Field Practice",
        subtitle: "Real-world shooting and composition critique",
      },
    ],
    styleQuote:
      "Practical, hands-on masterclasses designed to take you from automatic mode to full creative command behind the lens.",
  },
  "retouching-classes": {
    hero: {
      src: "/photos/behind-the-scenes/behind-the-scenes_05.jpg",
      alt: "Retouching masterclass with Photoshop editing suite by SH Photography",
      caption: "High-End Skin Retouching & Color Grading Suite · Manchester",
    },
    gallery: [
      {
        src: "/photos/portraits/portraits_04.jpg",
        alt: "Retoucher working with tablet on high-end beauty portrait",
        title: "Digital Craftsmanship",
        subtitle: "Frequency separation & micro dodge & burn",
      },
      {
        src: "/photos/behind-the-scenes/behind-the-scenes_06.jpg",
        alt: "Retouched beauty portrait result",
        title: "Skin Texture Preservation",
        subtitle: "Flawless yet completely natural finish",
      },
      {
        src: "/photos/portraits/portraits_05.jpg",
        alt: "Editorial master portrait",
        title: "Tonal Harmony",
        subtitle: "Color grading and mood calibration",
      },
    ],
    styleQuote:
      "Master the non-destructive frequency separation and color grading workflows used in high-fashion editorial magazines.",
  },
};

export const defaultMedia: ServiceMediaItem = {
  hero: {
    src: "/photos/portraits/portraits_01.jpg",
    alt: "Professional photography in studio by SH Photography",
    caption: "Studio Photography & Portraiture · Manchester Studio",
  },
  gallery: [
    {
      src: "/photos/portraits/portraits_02.jpg",
      alt: "Editorial portrait by SH Photography",
      title: "Natural Elegance",
      subtitle: "Refined studio lighting and styling",
    },
    {
      src: "/photos/events/events_01.jpg",
      alt: "Celebratory atmosphere by SH Photography",
      title: "Key Moments",
      subtitle: "Authentic atmosphere for clients and events",
    },
    {
      src: "/photos/weddings/weddings_01.jpg",
      alt: "Cinematic portraiture by SH Photography",
      title: "Timeless Emotion",
      subtitle: "Quiet intimacy and documentary style",
    },
  ],
  styleQuote:
    "Elevating every session with bespoke lighting, refined editorial storytelling, and authentic emotion.",
};
