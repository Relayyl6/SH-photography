export interface SiteSettingsDoc {
  businessName: string;
  tagline: string;
  logo: string;
  favicon: string;
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  footerText: string;
  currency: string;
  timezone: string;
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface ContactSettingsDoc {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  mapLink: string;
  hours: string;
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface SocialLinkItem {
  platform: string;
  url: string;
  label: string;
  order: number;
  visible: boolean;
}

export interface SocialSettingsDoc {
  links: SocialLinkItem[];
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface BookingSettingsDoc {
  leadTimeHours: number;
  maxAdvanceDays: number;
  bufferMinutes: number;
  autoConfirm: boolean;
  cancellationPolicyText: string;
  termsText: string;
  ownerNotifyEmails: string[];
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface HomePageDoc {
  headline: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  heroText: string[];
  youtube: {
    videoId: string;
    title: string;
    autoplay: boolean;
    muted: boolean;
  };
  sectionTexts: Record<string, string>;
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface AboutPageDoc {
  heading: string;
  body: string;
  coverImage: {
    url: string;
    path: string;
    alt: string;
  };
  stats: Array<{
    label: string;
    value: string;
    order: number;
  }>;
  signature: string;
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface SiteTextDoc {
  items: Record<string, string>;
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface BentoSlot {
  slotId: string; // "1" to "9"
  portfolioImageId: string;
  label?: string;
  rotation?: {
    enabled: boolean;
    pool: string[];
    intervalMode: 'daily' | 'hourly' | 'refresh';
  };
}

export interface BentoHomeDoc {
  slots: BentoSlot[];
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface PortfolioImageDoc {
  id: string;
  url: string;
  path: string;
  thumbUrl: string;
  alt: string;
  caption?: string;
  category: string[];
  order: number;
  published: boolean;
  width: number;
  height: number;
  featured: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface SessionDoc {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number | string;
  showPrice: boolean;
  priceLabel?: string;
  currency: string;
  depositAmount: number;
  durationMinutes: number;
  bufferMinutes: number;
  included: string[];
  notIncluded: string[];
  coverImage: string;
  gallery: string[];
  location: string;
  maxPeople: number;
  addOns: Array<{ name: string; price: number }>;
  bookingFieldIds: string[];
  published: boolean;
  order: number;
  minNoticeHours: number;
  active: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface PackageDoc {
  id: string;
  name: string;
  category: string;
  sessionSlug: string;
  description: string;
  features: string[];
  deliverables: string[];
  turnaround: string;
  show_price: boolean;
  price_label?: string;
  order: number;
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface BookingFieldDoc {
  id: string;
  label: string;
  key: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'email' | 'phone' | 'file';
  options?: Array<{ label: string; value: string; order: number; priceDelta?: number }>;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: { min?: number; max?: number; pattern?: string };
  appliesTo: 'all' | string[];
  order: number;
  published: boolean;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface AvailabilitySlot {
  id: string;
  start: string;
  end: string;
  sessionIds: string[] | 'all';
  status: 'open' | 'held' | 'booked' | 'blocked';
  bookingId?: string;
}

export interface AvailabilityDoc {
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  windows: Array<{ start: string; end: string }>;
  slots: AvailabilitySlot[];
  blockedReason?: string;
  updatedAt: string | number;
  updatedBy?: string;
}

export interface BookingDoc {
  id: string;
  sessionId: string;
  sessionSnapshot: {
    name: string;
    price: number | string;
    durationMinutes: number;
  };
  slot: {
    date: string;
    start: string;
    end: string;
  };
  answers: Record<string, unknown>;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  ownerNotes: Array<{ text: string; by: string; at: string | number }>;
  customerUid: string | null;
  claimTokenHash?: string;
  createdAt: string | number;
  updatedAt: string | number;
  source: 'web' | 'manual' | 'guest';
  emailStatus: {
    owner: 'pending' | 'sent' | 'failed';
    customer: 'pending' | 'sent' | 'failed';
  };
  statusHistory: Array<{
    status: string;
    by: string;
    at: string | number;
  }>;
}

export interface CustomerDoc {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  createdAt: string | number;
  savedPreferences?: Record<string, unknown>;
}

export interface AdminDoc {
  uid: string;
  role: 'owner';
  email: string;
  addedAt: string | number;
}
