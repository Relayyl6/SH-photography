import { siteConfig, socialLinks, featuredVideoId } from '@/lib/site-config';
import { sessions as baselineSessions, Session } from '@/lib/sessions';
import { packages as baselinePackages, Package } from '@/lib/packages';
import {
  aboutHeading,
  aboutSubline,
  aboutParagraphs,
  styleParagraphs,
  aboutByline,
} from '@/lib/about-copy';
import galleryDataJson from '@/lib/gallery-data.json';
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
  BookingFieldDoc,
} from '@/types/firebase';

// Deterministic baseline defaults
export const DEFAULT_SITE_SETTINGS: SiteSettingsDoc = {
  businessName: siteConfig.businessName,
  tagline: siteConfig.positioningLine,
  logo: '/bento_portrait.jpg',
  favicon: '/favicon.ico',
  seo: {
    title: `${siteConfig.businessName} — Natural, Vibrant Storytelling`,
    description: siteConfig.positioningLine,
    ogImage: '/photos/weddings/weddings_01.jpg',
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
  hours: 'Monday – Saturday: 9:00 AM – 7:00 PM',
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_SOCIAL_SETTINGS: SocialSettingsDoc = {
  links: socialLinks.map((s, idx) => ({
    platform: s.platform,
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
  cancellationPolicyText: 'Free cancellation up to 48 hours before the session. Deposits are transferable.',
  termsText: 'By booking, you agree to our terms of service and creative consultation guidelines.',
  ownerNotifyEmails: [siteConfig.email],
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_HOME_PAGE: HomePageDoc = {
  headline: 'SH Photography',
  subtitle: siteConfig.positioningLine,
  ctaLabel: 'Book a session',
  ctaLink: '/book',
  heroText: [
    'Natural, vibrant storytelling for people, brands and products.',
    'Based in Manchester, United Kingdom. Photographing people, brands and products since 2020.',
  ],
  youtube: {
    videoId: featuredVideoId,
    title: 'Featured Photoshoot Behind-the-Scenes',
    autoplay: false,
    muted: true,
  },
  sectionTexts: {
    sessionsKicker: 'Sessions',
    sessionsHeading: 'How I tell your story',
    aboutKicker: 'Get to know me',
    aboutHeading: 'Benedict Henry',
    servicesKicker: 'What I do',
    servicesHeading: 'Services & classes',
  },
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_ABOUT_PAGE: AboutPageDoc = {
  heading: aboutHeading,
  body: aboutParagraphs.join('\n\n'),
  coverImage: {
    url: '/photos/personal/personal_06.jpg',
    path: 'about/personal_06.jpg',
    alt: 'Benedict Henry — Founder & Principal, SH Photography',
  },
  stats: [
    { label: 'Years Active', value: '4+', order: 1 },
    { label: 'Moments Captured', value: '10,000+', order: 2 },
    { label: 'UK & Destination', value: 'Worldwide', order: 3 },
  ],
  signature: 'Benedict Henry',
  published: true,
  updatedAt: Date.now(),
};

export const DEFAULT_BENTO_HOME: BentoHomeDoc = {
  slots: [
    { slotId: '1', portfolioImageId: 'weddings_02', label: 'Weddings' },
    { slotId: '2', portfolioImageId: 'portraits_02', label: 'Beauty & Portraits' },
    { slotId: '3', portfolioImageId: 'family_01', label: 'Family' },
    { slotId: '4', portfolioImageId: 'events_01', label: 'Events' },
    { slotId: '5', portfolioImageId: 'behind-the-scenes_01', label: 'Behind the Scenes' },
    { slotId: '6', portfolioImageId: 'birthday_01', label: 'Birthdays' },
    { slotId: '7', portfolioImageId: 'personal_01', label: 'Personal Branding' },
    { slotId: '8', portfolioImageId: 'sports_01', label: 'Sports & Athletics' },
    { slotId: '9', portfolioImageId: 'behind-the-scenes_05', label: 'Photography & Retouching Classes' },
  ],
  published: true,
  updatedAt: Date.now(),
};

// Flatten galleryDataJson object of arrays into DEFAULT_PORTFOLIO_IMAGES
const rawGalleryEntries = Object.entries(galleryDataJson as Record<string, Array<{
  src: string;
  width: number;
  height: number;
  aspectRatio: number;
  alt: string;
  title: string;
}>>);

let globalImgIndex = 1;
const flattenedImages: PortfolioImageDoc[] = [];

for (const [categoryKey, items] of rawGalleryEntries) {
  for (const item of items) {
    const filename = item.src.split('/').pop()?.replace(/\.[^/.]+$/, '') || `img_${globalImgIndex}`;
    flattenedImages.push({
      id: filename,
      url: item.src,
      path: item.src.replace(/^\//, ''),
      thumbUrl: item.src,
      alt: item.alt || `${categoryKey} photograph by SH Photography`,
      caption: item.title,
      category: [categoryKey],
      order: globalImgIndex,
      published: true,
      width: item.width || 1200,
      height: item.height || 800,
      featured: globalImgIndex <= 10,
      updatedAt: Date.now(),
    });
    globalImgIndex++;
  }
}

export const DEFAULT_PORTFOLIO_IMAGES: PortfolioImageDoc[] = flattenedImages;

export const DEFAULT_SESSIONS: SessionDoc[] = baselineSessions.map((s, idx) => ({
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
  coverImage: s.featuredImage || `/photos/${s.slug}/${s.slug}_01.jpg`,
  gallery: [`/photos/${s.slug}/${s.slug}_01.jpg`],
  location: siteConfig.location,
  maxPeople: 6,
  addOns: [
    { name: 'Extra 30 Minutes', price: 50 },
    { name: 'Rush Delivery (48h)', price: 75 },
  ],
  bookingFieldIds: ['full_name', 'email_address', 'phone_number', 'session_date', 'session_notes'],
  published: true,
  order: idx + 1,
  minNoticeHours: 48,
  active: true,
  updatedAt: Date.now(),
}));

export const DEFAULT_PACKAGES: PackageDoc[] = baselinePackages.map((p, idx) => ({
  id: p.slug,
  name: p.name,
  category: p.category,
  sessionSlug: p.slug,
  description: p.summary,
  features: p.includes,
  deliverables: ['Online private gallery', 'Full resolution downloads'],
  turnaround: '2-3 weeks',
  show_price: p.showPrice,
  price_label: p.priceLabel || undefined,
  order: idx + 1,
  published: true,
  updatedAt: Date.now(),
}));

// Typed Data Layer Getters (Universal Server/Client)
export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.doc('settings/site').get();
      if (snap.exists) return snap.data() as SiteSettingsDoc;
    }
  } catch {
    // fallback
  }
  return DEFAULT_SITE_SETTINGS;
}

export async function getContactSettings(): Promise<ContactSettingsDoc> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.doc('settings/contact').get();
      if (snap.exists) return snap.data() as ContactSettingsDoc;
    }
  } catch {
    // fallback
  }
  return DEFAULT_CONTACT_SETTINGS;
}

export async function getSocialSettings(): Promise<SocialSettingsDoc> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.doc('settings/social').get();
      if (snap.exists) return snap.data() as SocialSettingsDoc;
    }
  } catch {
    // fallback
  }
  return DEFAULT_SOCIAL_SETTINGS;
}

export async function getBookingSettings(): Promise<BookingSettingsDoc> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.doc('settings/booking').get();
      if (snap.exists) return snap.data() as BookingSettingsDoc;
    }
  } catch {
    // fallback
  }
  return DEFAULT_BOOKING_SETTINGS;
}

export async function getHomePageContent(): Promise<HomePageDoc> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.doc('pages/home').get();
      if (snap.exists) return snap.data() as HomePageDoc;
    }
  } catch {
    // fallback
  }
  return DEFAULT_HOME_PAGE;
}

export async function getAboutPageContent(): Promise<AboutPageDoc> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.doc('pages/about').get();
      if (snap.exists) return snap.data() as AboutPageDoc;
    }
  } catch {
    // fallback
  }
  return DEFAULT_ABOUT_PAGE;
}

export async function getBentoSlots(): Promise<BentoHomeDoc> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.doc('bento/home').get();
      if (snap.exists) return snap.data() as BentoHomeDoc;
    }
  } catch {
    // fallback
  }
  return DEFAULT_BENTO_HOME;
}

export async function getPortfolioImages(category?: string): Promise<PortfolioImageDoc[]> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      let query: any = adminDb.collection('portfolio').where('published', '==', true);
      if (category) {
        query = query.where('category', 'array-contains', category);
      }
      const snap = await query.orderBy('order', 'asc').get();
      if (!snap.empty) {
        return snap.docs.map((doc: any) => doc.data() as PortfolioImageDoc);
      }
    }
  } catch {
    // fallback
  }
  if (category) {
    return DEFAULT_PORTFOLIO_IMAGES.filter((img) => img.category.includes(category));
  }
  return DEFAULT_PORTFOLIO_IMAGES;
}

export async function getSessions(): Promise<SessionDoc[]> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.collection('sessions').where('published', '==', true).orderBy('order', 'asc').get();
      if (!snap.empty) {
        return snap.docs.map((doc: any) => doc.data() as SessionDoc);
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SESSIONS;
}

export async function getSessionBySlug(slug: string): Promise<SessionDoc | null> {
  const all = await getSessions();
  return all.find((s) => s.slug === slug) || null;
}

export async function getPackages(): Promise<PackageDoc[]> {
  try {
    if (typeof window === 'undefined') {
      const { adminDb } = await import('@/lib/firebase/admin');
      const snap = await adminDb.collection('packages').where('published', '==', true).orderBy('order', 'asc').get();
      if (!snap.empty) {
        return snap.docs.map((doc: any) => doc.data() as PackageDoc);
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_PACKAGES;
}

export async function getPackageBySlug(slug: string): Promise<PackageDoc | null> {
  const all = await getPackages();
  return all.find((p) => p.sessionSlug === slug || p.id === slug) || null;
}
