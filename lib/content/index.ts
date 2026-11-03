// Seeded Baseline Data & Types for Content Migration
import {
  SiteSettingsDoc,
  ContactSettingsDoc,
  SocialSettingsDoc,
  BookingSettingsDoc,
  HomePageDoc,
  AboutPageDoc,
  BentoHomeDoc,
  PortfolioImageDoc,
  SessionDoc,
  PackageDoc,
  BookingDoc,
} from '@/types/firebase';
import { siteConfig, socialLinks } from '@/lib/site-config';
import { sessions as baselineSessions } from '@/lib/sessions';
import { packages as baselinePackages } from '@/lib/packages';
import { aboutParagraphs } from '@/lib/about-copy';
import galleryData from '@/lib/gallery-data.json';

// Baseline fallback records (used strictly if DB is initializing or unreachable)
export const DEFAULT_SITE_SETTINGS: SiteSettingsDoc = {
  businessName: siteConfig.businessName,
  tagline: 'Authentic Photography in Manchester & Worldwide',
  logo: '/logo.svg',
  favicon: '/favicon.ico',
  seo: {
    title: 'SH Photography — Benedict Henry',
    description: 'Bespoke editorial, portrait, wedding, and event photography based in Manchester, United Kingdom.',
    ogImage: '/og-image.jpg',
  },
  footerText: `© ${new Date().getFullYear()} ${siteConfig.businessName}. All rights reserved.`,
  currency: 'GBP',
  timezone: 'Europe/London',
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_CONTACT_SETTINGS: ContactSettingsDoc = {
  email: siteConfig.email,
  phone: siteConfig.phoneDisplay,
  whatsapp: siteConfig.whatsappE164,
  address: siteConfig.location,
  mapLink: 'https://maps.google.com/?q=Manchester,+United+Kingdom',
  hours: 'Mon - Sun: 9:00 AM – 7:00 PM',
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_SOCIAL_SETTINGS: SocialSettingsDoc = {
  links: socialLinks.map((s, idx) => ({
    platform: s.label,
    url: s.url,
    label: s.label,
    order: idx + 1,
    visible: true,
  })),
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_BOOKING_SETTINGS: BookingSettingsDoc = {
  leadTimeHours: 48,
  maxAdvanceDays: 180,
  bufferMinutes: 30,
  autoConfirm: false,
  cancellationPolicyText:
    'Free cancellation up to 48 hours before the scheduled shoot time. Rescheduling is available with no penalty subject to studio availability.',
  termsText:
    'All bookings require mutual confirmation of schedule and creative requirements. High-resolution galleries are delivered within standard turnaround times.',
  ownerNotifyEmails: [siteConfig.email, 'oseghaleleonard39@gmail.com'],
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_HOME_PAGE: HomePageDoc = {
  headline: 'Authentic moments, timelessly captured.',
  subtitle:
    'Benedict Henry documents unscripted emotion, quiet intimacy, and celebratory energy with cinematic color grading and editorial nuance.',
  ctaLabel: 'Book a Session',
  ctaLink: '/book',
  heroText: [
    'Editorial Portraiture',
    'Documentary Weddings',
    'Family & Milestones',
    'Creative Behind the Scenes',
  ],
  youtube: {
    videoId: 'vE8pQC6XHoU',
    title: 'Behind the Scenes & Photography Techniques with Benedict',
    autoplay: false,
    muted: true,
  },
  sectionTexts: {
    portfolioHeadline: 'Curated Stories',
    portfolioSubtitle: 'Explore selected archives across five distinct photographic sessions.',
    servicesHeadline: 'Packages & Inclusions',
    servicesSubtitle: 'Transparent inclusions crafted to match your exact milestone or commercial vision.',
    contactHeadline: 'Let’s Create Together',
    contactSubtitle: 'Available across Greater Manchester, nationwide across the UK, and for destination travel.',
  },
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_ABOUT_PAGE: AboutPageDoc = {
  heading: 'Get to Know Me',
  body: aboutParagraphs.join('\n\n'),
  coverImage: {
    url: '/photos/personal/personal_01.jpg',
    path: '/photos/personal/personal_01.jpg',
    alt: 'Benedict Henry, founder and lead photographer at SH Photography',
  },
  stats: [
    { label: 'Years Behind the Lens', value: '8+', order: 1 },
    { label: 'Weddings & Celebrations', value: '150+', order: 2 },
    { label: 'Editorial & Brand Shoots', value: '300+', order: 3 },
    { label: 'Client Satisfaction', value: '100%', order: 4 },
  ],
  signature: 'Benedict Henry',
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_BENTO_HOME: BentoHomeDoc = {
  slots: [
    { slotId: '1', portfolioImageId: 'weddings_01', label: 'Weddings' },
    { slotId: '2', portfolioImageId: 'portraits_01', label: 'Portraits' },
    { slotId: '3', portfolioImageId: 'family_01', label: 'Family' },
    { slotId: '4', portfolioImageId: 'events_01', label: 'Events' },
    { slotId: '5', portfolioImageId: 'birthday_01', label: 'Birthdays' },
    { slotId: '6', portfolioImageId: 'behind-the-scenes_01', label: 'Behind the Scenes' },
    { slotId: '7', portfolioImageId: 'personal_01', label: 'Personal Branding' },
    { slotId: '8', portfolioImageId: 'sports_01', label: 'Sports & Athletics' },
    { slotId: '9', portfolioImageId: 'weddings_02', label: 'Editorial Stories' },
  ],
  published: true,
  updatedAt: Date.now(),
};

const flattenedImages: PortfolioImageDoc[] = [];
let globalImgIndex = 1;

for (const [sessionSlug, photos] of Object.entries(galleryData)) {
  for (let i = 0; i < (photos as any[]).length; i++) {
    const p = (photos as any[])[i];
    const imageId = `${sessionSlug}_${String(i + 1).padStart(2, '0')}`;
    flattenedImages.push({
      id: imageId,
      url: p.src,
      path: p.src,
      thumbUrl: p.src,
      alt: p.alt || `${sessionSlug} photograph ${i + 1} by SH Photography`,
      caption: p.title || `${sessionSlug} #${i + 1}`,
      category: [sessionSlug],
      order: globalImgIndex,
      published: true,
      width: p.width || 1200,
      height: p.height || 1500,
      featured: i < 3,
      updatedAt: Date.now(),
    });
    globalImgIndex++;
  }
}

export const DEFAULT_PORTFOLIO_IMAGES: PortfolioImageDoc[] = flattenedImages;

export const ALL_BOOKING_FIELD_IDS = [
  'full_name',
  'email_address',
  'phone_number',
  'preferred_contact',
  'company_name',
  'instagram_handle',
  'service_category',
  'session_sub_type',
  'num_subjects',
  'estimated_duration',
  'session_date',
  'preferred_start_time',
  'alternate_date',
  'is_double_date',
  'secondary_date',
  'multi_day_count',
  'additional_dates',
  'date_flexible',
  'location_type',
  'address',
  'city_postcode',
  'indoors_outdoors',
  'travel_required',
  'travel_details',
  'parking_notes',
  'vision',
  'style_preferences',
  'color_preference',
  'inspiration_links',
  'must_have_shots',
  'special_requests',
  'extra_info',
  'deliverables',
  'edited_images_expected',
  'turnaround_time',
  'second_shooter',
  'budget_range',
  'how_soon',
];

export const DEFAULT_SESSIONS: SessionDoc[] = baselineSessions.map((s, idx) => {
  const photos = (galleryData as Record<string, Array<{ src: string }>>)[s.slug] || [];
  const galleryUrls = photos.length > 0
    ? photos.map((p) => p.src)
    : [`/photos/${s.slug}/${s.slug}_01.jpg`];

  return {
    id: s.slug,
    name: s.title,
    slug: s.slug,
    shortDescription: s.intro,
    description: s.intro,
    price: 0,
    showPrice: false,
    priceLabel: 'Quote on request',
    currency: 'GBP',
    depositAmount: 50,
    durationMinutes: 90,
    bufferMinutes: 30,
    included: [
      'Pre-shoot creative consultation',
      'High-resolution edited digital gallery',
      'Personal print and digital usage rights',
    ],
    notIncluded: ['Studio rental fees (if required)', 'Travel outside Greater Manchester'],
    coverImage: s.featuredImage || galleryUrls[0] || `/photos/${s.slug}/${s.slug}_01.jpg`,
    gallery: galleryUrls,
    location: siteConfig.location,
    maxPeople: 6,
    addOns: [
      { name: 'Extra 30 Minutes', price: 50 },
      { name: 'Rush Delivery (48h)', price: 75 },
    ],
    bookingFieldIds: ALL_BOOKING_FIELD_IDS,
    published: true,
    order: idx + 1,
    minNoticeHours: 48,
    active: true,
    updatedAt: Date.now(),
  };
});

export const DEFAULT_PACKAGES: PackageDoc[] = baselinePackages.map((p, idx) => {
  const pkg: PackageDoc = {
    id: p.slug,
    name: p.name,
    category: p.category,
    sessionSlug: p.slug,
    description: p.summary,
    features: p.includes,
    deliverables: ['Online private gallery', 'Full resolution downloads'],
    turnaround: '2-3 weeks',
    show_price: p.showPrice,
    order: idx + 1,
    published: true,
    updatedAt: Date.now(),
  };
  if (p.priceLabel) {
    pkg.price_label = p.priceLabel;
  }
  return pkg;
});

// Typed Data Layer Getters (Universal Server/Client, reading directly from Firestore DB)
export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'settings', 'site'));
    if (snap.exists()) return snap.data() as SiteSettingsDoc;
  } catch {}
  return DEFAULT_SITE_SETTINGS;
}

export async function getContactSettings(): Promise<ContactSettingsDoc> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'settings', 'contact'));
    if (snap.exists()) return snap.data() as ContactSettingsDoc;
  } catch {}
  return DEFAULT_CONTACT_SETTINGS;
}

export async function getSocialSettings(): Promise<SocialSettingsDoc> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'settings', 'social'));
    if (snap.exists()) return snap.data() as SocialSettingsDoc;
  } catch {}
  return DEFAULT_SOCIAL_SETTINGS;
}

export async function getBookingSettings(): Promise<BookingSettingsDoc> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'settings', 'booking'));
    if (snap.exists()) return snap.data() as BookingSettingsDoc;
  } catch {}
  return DEFAULT_BOOKING_SETTINGS;
}

export async function getHomePageContent(): Promise<HomePageDoc> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'pages', 'home'));
    if (snap.exists()) {
      const data = snap.data() as HomePageDoc;
      if (data?.youtube?.videoId === 'dQw4w9WgXcQ' || !data?.youtube?.videoId) {
        data.youtube = {
          ...data.youtube,
          videoId: 'vE8pQC6XHoU',
          title: data?.youtube?.title || DEFAULT_HOME_PAGE.youtube.title,
        };
      }
      return data;
    }
  } catch {}
  return DEFAULT_HOME_PAGE;
}

export async function getAboutPageContent(): Promise<AboutPageDoc> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'pages', 'about'));
    if (snap.exists()) return snap.data() as AboutPageDoc;
  } catch {}
  return DEFAULT_ABOUT_PAGE;
}

export async function getBentoSlots(): Promise<BentoHomeDoc> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'bento', 'home'));
    if (snap.exists()) return snap.data() as BentoHomeDoc;
  } catch {}
  return DEFAULT_BENTO_HOME;
}

export async function getPortfolioImages(category?: string): Promise<PortfolioImageDoc[]> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    let q = query(collection(db, 'portfolio'), where('published', '==', true), orderBy('order', 'asc'));
    if (category) {
      q = query(collection(db, 'portfolio'), where('published', '==', true), where('category', 'array-contains', category), orderBy('order', 'asc'));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as PortfolioImageDoc);
    }
  } catch {}

  if (category) {
    return DEFAULT_PORTFOLIO_IMAGES.filter((img) => img.category.includes(category));
  }
  return DEFAULT_PORTFOLIO_IMAGES;
}

export async function getSessions(): Promise<SessionDoc[]> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    const snap = await getDocs(query(collection(db, 'sessions'), where('published', '==', true), orderBy('order', 'asc')));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as SessionDoc);
    }
  } catch {}

  return DEFAULT_SESSIONS;
}

export async function getSessionBySlug(slug: string): Promise<SessionDoc | null> {
  const all = await getSessions();
  return all.find((s) => s.slug === slug) || null;
}

export async function getPackages(): Promise<PackageDoc[]> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    const snap = await getDocs(query(collection(db, 'packages'), where('published', '==', true), orderBy('order', 'asc')));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as PackageDoc);
    }
  } catch {}

  return DEFAULT_PACKAGES;
}

export async function getPackageBySlug(slug: string): Promise<PackageDoc | null> {
  const all = await getPackages();
  return all.find((p) => p.sessionSlug === slug || p.id === slug) || null;
}

export const DEFAULT_BOOKINGS: BookingDoc[] = [
  {
    id: "bk_101",
    sessionId: "weddings",
    sessionSnapshot: {
      name: "Weddings (Full Day)",
      price: 850,
      durationMinutes: 480,
    },
    slot: {
      date: "2026-11-14",
      start: "10:00",
      end: "18:00",
    },
    customer: {
      name: "Eleanor Vance",
      email: "eleanor.vance@example.co.uk",
      phone: "+44 7700 900123",
    },
    status: "confirmed",
    source: "web",
    answers: {
      location: "Victoria Baths, Manchester",
      ceremonyType: "Full Day Documentary",
    },
    ownerNotes: [
      { text: "Ceremony at Victoria Baths. High priority documentary coverage.", by: "Benedict Henry", at: Date.now() - 86400000 * 2 }
    ],
    customerUid: null,
    emailStatus: { owner: "sent", customer: "sent" },
    statusHistory: [
      { status: "confirmed", by: "Benedict Henry", at: Date.now() - 86400000 * 2 }
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "bk_102",
    sessionId: "portraits",
    sessionSnapshot: {
      name: "Portraits & Beauty",
      price: 350,
      durationMinutes: 120,
    },
    slot: {
      date: "2026-11-18",
      start: "14:00",
      end: "16:00",
    },
    customer: {
      name: "Marcus Sterling",
      email: "marcus.s@example.com",
      phone: "+44 7700 900456",
    },
    status: "pending",
    source: "web",
    answers: {
      location: "Studio Manchester",
      lookCount: "3 wardrobe changes",
    },
    ownerNotes: [
      { text: "Studio editorial portrait session in Manchester.", by: "Benedict Henry", at: Date.now() - 86400000 }
    ],
    customerUid: null,
    emailStatus: { owner: "sent", customer: "sent" },
    statusHistory: [
      { status: "pending", by: "system", at: Date.now() - 86400000 }
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "bk_103",
    sessionId: "family",
    sessionSnapshot: {
      name: "Family Milestones",
      price: 275,
      durationMinutes: 90,
    },
    slot: {
      date: "2026-11-22",
      start: "11:00",
      end: "12:30",
    },
    customer: {
      name: "Sophia Chen",
      email: "sophia.chen@example.com",
      phone: "+44 7700 900789",
    },
    status: "pending",
    source: "web",
    answers: {
      location: "Heaton Park, Manchester",
      familyMembers: "2 adults, 1 toddler",
    },
    ownerNotes: [
      { text: "Outdoor golden hour milestone session with parents and toddler.", by: "Benedict Henry", at: Date.now() - 3600000 * 5 }
    ],
    customerUid: null,
    emailStatus: { owner: "sent", customer: "sent" },
    statusHistory: [
      { status: "pending", by: "system", at: Date.now() - 3600000 * 5 }
    ],
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
];

export async function getBookings(): Promise<BookingDoc[]> {
  try {
    const { db } = await import('@/lib/firebase/config');
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
    const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
    if (!snap.empty) {
      const fromDb = snap.docs.map((d) => d.data() as BookingDoc);
      // Ensure mock bookings are also present if not duplicated
      const existingIds = new Set(fromDb.map((b) => b.id));
      const merged = [...fromDb];
      for (const mb of DEFAULT_BOOKINGS) {
        if (!existingIds.has(mb.id)) merged.push(mb);
      }
      return merged;
    }
  } catch {}
  return DEFAULT_BOOKINGS;
}
