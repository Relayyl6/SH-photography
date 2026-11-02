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
} from '@/types/firebase';
import { siteConfig, socialLinks } from '@/lib/site-config';
import { sessions as baselineSessions } from '@/lib/sessions';
import { packages as baselinePackages } from '@/lib/packages';
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
    videoId: 'dQw4w9WgXcQ',
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
  body: `I am a freelance photographer with passion for all types of photography: fashion, corporate events, family shoots, weddings, behind the scenes, and birthdays. Photography is my passion, which has been in me right from when I was a child. Seeing pictures, looking at people's expressions, and freezing time has always fascinated me.

What sets my work apart is the personal connection I create with every subject. I don't just take pictures; I tell your story. Whether it's an intimate wedding in Cheshire, a high-energy brand launch in Manchester city centre, or a quiet studio portrait, my focus is always on genuine, unforced emotion and refined editorial style.

Beyond commercial assignments, I also conduct one-on-one mentorship classes in general photography and advanced Photoshop / Lightroom retouching—available both online and in-person here in Manchester.`,
  coverImage: {
    url: '/photos/portraits/portraits_01.jpg',
    path: '/photos/portraits/portraits_01.jpg',
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
    if (snap.exists()) return snap.data() as HomePageDoc;
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
