import fs from 'fs';
import path from 'path';

// 1. Manually populate process.env from .env.local if not already set
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  // ignore
}

import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_CONTACT_SETTINGS,
  DEFAULT_SOCIAL_SETTINGS,
  DEFAULT_BOOKING_SETTINGS,
  DEFAULT_HOME_PAGE,
  DEFAULT_ABOUT_PAGE,
  DEFAULT_BENTO_HOME,
  DEFAULT_PORTFOLIO_IMAGES,
  DEFAULT_SESSIONS,
  DEFAULT_PACKAGES,
  DEFAULT_BOOKINGS,
} from '../lib/content/index';

import { db, auth } from '../lib/firebase/config';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const isDryRun = process.argv.includes('--dry-run');

async function seed() {
  console.log(`\n🌱 Starting Firestore seeding to ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sh-photography-8a473'}${isDryRun ? ' (DRY RUN)' : ''}...`);

  // Attempt signing in as admin if credentials are provided in env
  if (!isDryRun) {
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'shfotography1@gmail.com';
    const adminPass = process.env.ADMIN_SEED_PASSWORD || 'SHPhotography2026!';
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      console.log(`  🔒 Authenticated as admin: ${adminEmail}`);
    } catch (authErr: any) {
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
        console.log(`  🔒 Registered and authenticated as admin: ${adminEmail}`);
      } catch (createErr) {
        console.log('  ℹ️ Proceeding with default credentials / rules...', authErr?.message || authErr);
      }
    }
  }

  // 1. Settings
  console.log('  → Seeding settings/site...');
  if (!isDryRun) await setDoc(doc(db, 'settings', 'site'), DEFAULT_SITE_SETTINGS, { merge: true });

  console.log('  → Seeding settings/contact...');
  if (!isDryRun) await setDoc(doc(db, 'settings', 'contact'), DEFAULT_CONTACT_SETTINGS, { merge: true });

  console.log('  → Seeding settings/social...');
  if (!isDryRun) await setDoc(doc(db, 'settings', 'social'), DEFAULT_SOCIAL_SETTINGS, { merge: true });

  console.log('  → Seeding settings/booking...');
  if (!isDryRun) await setDoc(doc(db, 'settings', 'booking'), DEFAULT_BOOKING_SETTINGS, { merge: true });

  // 2. Pages
  console.log('  → Seeding pages/home...');
  if (!isDryRun) await setDoc(doc(db, 'pages', 'home'), DEFAULT_HOME_PAGE, { merge: false });

  console.log('  → Seeding pages/about...');
  if (!isDryRun) await setDoc(doc(db, 'pages', 'about'), DEFAULT_ABOUT_PAGE, { merge: true });

  // 3. Bento Home
  console.log('  → Seeding bento/home...');
  if (!isDryRun) await setDoc(doc(db, 'bento', 'home'), DEFAULT_BENTO_HOME, { merge: false });

  // 4. Portfolio images
  console.log(`  → Seeding ${DEFAULT_PORTFOLIO_IMAGES.length} portfolio images...`);
  if (!isDryRun) {
    const batchSize = 400;
    for (let i = 0; i < DEFAULT_PORTFOLIO_IMAGES.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = DEFAULT_PORTFOLIO_IMAGES.slice(i, i + batchSize);
      for (const img of chunk) {
        batch.set(doc(db, 'portfolio', img.id), img, { merge: true });
      }
      await batch.commit();
    }
  }

  // 5. Sessions
  console.log(`  → Seeding ${DEFAULT_SESSIONS.length} sessions...`);
  if (!isDryRun) {
    const batch = writeBatch(db);
    for (const session of DEFAULT_SESSIONS) {
      batch.set(doc(db, 'sessions', session.id), session, { merge: true });
    }
    await batch.commit();
  }

  // 6. Packages
  console.log(`  → Seeding ${DEFAULT_PACKAGES.length} packages...`);
  if (!isDryRun) {
    const batch = writeBatch(db);
    for (const pkg of DEFAULT_PACKAGES) {
      batch.set(doc(db, 'packages', pkg.id), pkg, { merge: true });
    }
    await batch.commit();
  }

  // 7. Booking Fields (Complete 30+ questionnaire fields matching booking schema)
  console.log('  → Seeding full booking questionnaire fields schema...');
  const defaultFields = [
    // Contact & Identity
    {
      id: 'full_name',
      label: 'Full Name',
      key: 'fullName',
      type: 'text',
      required: true,
      placeholder: 'Your full name',
      appliesTo: 'all',
      order: 1,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'email_address',
      label: 'Email Address',
      key: 'email',
      type: 'email',
      required: true,
      placeholder: 'you@example.com',
      appliesTo: 'all',
      order: 2,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'phone_number',
      label: 'Phone Number',
      key: 'phone',
      type: 'phone',
      required: true,
      placeholder: '+44 7123 456789',
      appliesTo: 'all',
      order: 3,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'preferred_contact',
      label: 'Preferred Contact Method',
      key: 'preferredContact',
      type: 'select',
      options: ['Email', 'Phone', 'WhatsApp'],
      required: true,
      appliesTo: 'all',
      order: 4,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'company_name',
      label: 'Company / Brand Name',
      key: 'companyName',
      type: 'text',
      required: false,
      placeholder: 'Optional company name',
      appliesTo: 'all',
      order: 5,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'instagram_handle',
      label: 'Instagram / Social Handle',
      key: 'instagramHandle',
      type: 'text',
      required: false,
      placeholder: '@yourhandle',
      appliesTo: 'all',
      order: 6,
      published: true,
      updatedAt: Date.now(),
    },

    // Session Type & Subjects
    {
      id: 'service_category',
      label: 'Service Category',
      key: 'serviceCategory',
      type: 'select',
      options: ['Wedding', 'Portrait', 'Event', 'Retouching', 'Other'],
      required: true,
      appliesTo: 'all',
      order: 7,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'session_sub_type',
      label: 'Specific Session Sub-Type',
      key: 'sessionSubType',
      type: 'text',
      required: false,
      placeholder: 'e.g. Bridal portrait, Birthday party, Editorial',
      appliesTo: 'all',
      order: 8,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'num_subjects',
      label: 'Number of Subjects',
      key: 'numSubjects',
      type: 'text',
      required: false,
      placeholder: 'e.g. 1 person, Couple, Family of 5',
      appliesTo: 'all',
      order: 9,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'estimated_duration',
      label: 'Estimated Duration',
      key: 'estimatedDuration',
      type: 'text',
      required: false,
      placeholder: 'e.g. 1 hour, Half day, Full day',
      appliesTo: 'all',
      order: 10,
      published: true,
      updatedAt: Date.now(),
    },

    // Date & Time Scheduling
    {
      id: 'session_date',
      label: 'Preferred Date',
      key: 'preferredDate',
      type: 'date',
      required: true,
      appliesTo: 'all',
      order: 11,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'preferred_start_time',
      label: 'Preferred Start Time / Slot',
      key: 'preferredStartTime',
      type: 'select',
      required: true,
      appliesTo: 'all',
      order: 12,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'alternate_date',
      label: 'Alternate / Backup Date',
      key: 'alternateDate',
      type: 'date',
      required: false,
      appliesTo: 'all',
      order: 13,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'is_double_date',
      label: 'Double Date / Multi-day Shoot',
      key: 'isDoubleDate',
      type: 'boolean',
      required: false,
      appliesTo: 'all',
      order: 14,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'secondary_date',
      label: 'Secondary Date',
      key: 'secondaryDate',
      type: 'date',
      required: false,
      appliesTo: 'all',
      order: 15,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'multi_day_count',
      label: 'Multi-Day Duration',
      key: 'multiDayCount',
      type: 'select',
      options: ['Single Day', '2 Days', '3 Days', '4 Days', '5+ Days'],
      required: false,
      appliesTo: 'all',
      order: 16,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'additional_dates',
      label: 'Additional Multi-Day Dates',
      key: 'additionalDates',
      type: 'text',
      required: false,
      placeholder: 'List of additional dates',
      appliesTo: 'all',
      order: 17,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'date_flexible',
      label: 'Date Flexibility',
      key: 'dateFlexible',
      type: 'select',
      options: ['Yes', 'No'],
      required: true,
      appliesTo: 'all',
      order: 18,
      published: true,
      updatedAt: Date.now(),
    },

    // Location & Travel
    {
      id: 'location_type',
      label: 'Location Type',
      key: 'locationType',
      type: 'select',
      options: ['Studio', "Client's Location", 'Outdoor', 'Venue', 'Multiple Locations', 'Other'],
      required: true,
      appliesTo: 'all',
      order: 19,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'address',
      label: 'Shoot Venue / Address',
      key: 'address',
      type: 'text',
      required: false,
      placeholder: 'Street address or venue name',
      appliesTo: 'all',
      order: 20,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'city_postcode',
      label: 'City & Postcode',
      key: 'cityPostcode',
      type: 'text',
      required: false,
      placeholder: 'Manchester, M1 1AA',
      appliesTo: 'all',
      order: 21,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'indoors_outdoors',
      label: 'Setting',
      key: 'indoorsOutdoors',
      type: 'select',
      options: ['Indoors', 'Outdoors', 'Both', 'Not Sure'],
      required: false,
      appliesTo: 'all',
      order: 22,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'travel_required',
      label: 'Travel Required Beyond Manchester',
      key: 'travelRequired',
      type: 'select',
      options: ['Yes', 'No'],
      required: true,
      appliesTo: 'all',
      order: 23,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'travel_details',
      label: 'Travel Details',
      key: 'travelDetails',
      type: 'text',
      required: false,
      placeholder: 'Location or flight/train destination notes',
      appliesTo: 'all',
      order: 24,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'parking_notes',
      label: 'Parking & Access Notes',
      key: 'parkingNotes',
      type: 'text',
      required: false,
      placeholder: 'Available parking, loading bay, stairs/lift access',
      appliesTo: 'all',
      order: 25,
      published: true,
      updatedAt: Date.now(),
    },

    // Creative Vision & Style
    {
      id: 'vision',
      label: 'Creative Vision & Concept',
      key: 'vision',
      type: 'textarea',
      required: true,
      placeholder: 'Describe your vision, aesthetic goals, mood, or storyline...',
      appliesTo: 'all',
      order: 26,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'style_preferences',
      label: 'Style Preferences',
      key: 'stylePreferences',
      type: 'multiselect',
      required: true,
      appliesTo: 'all',
      order: 27,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'color_preference',
      label: 'Color Palette Preference',
      key: 'colorPreference',
      type: 'select',
      options: ['Color', 'Black & White', 'Mix', "Benedict's choice"],
      required: true,
      appliesTo: 'all',
      order: 28,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'inspiration_links',
      label: 'Pinterest / Moodboard Links',
      key: 'inspirationLinks',
      type: 'url',
      required: false,
      placeholder: 'https://pinterest.com/your-board or Instagram link',
      appliesTo: 'all',
      order: 29,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'must_have_shots',
      label: 'Must-Have Shots',
      key: 'mustHaveShots',
      type: 'textarea',
      required: false,
      placeholder: 'Key portraits, candid moments, detail shots, product angles',
      appliesTo: 'all',
      order: 30,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'special_requests',
      label: 'Special Requests / Props',
      key: 'specialRequests',
      type: 'textarea',
      required: false,
      placeholder: 'Smoke machines, special backdrops, lighting style, animals',
      appliesTo: 'all',
      order: 31,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'extra_info',
      label: 'Extra Information & Unaccounted Details',
      key: 'extraInfo',
      type: 'textarea',
      required: false,
      placeholder: 'Any other detail or special requirement we did not account for...',
      appliesTo: 'all',
      order: 32,
      published: true,
      updatedAt: Date.now(),
    },

    // Deliverables & Timeline
    {
      id: 'deliverables',
      label: 'Desired Deliverables',
      key: 'deliverables',
      type: 'multiselect',
      required: true,
      appliesTo: 'all',
      order: 33,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'edited_images_expected',
      label: 'Number of Edited Images Expected',
      key: 'editedImagesExpected',
      type: 'text',
      required: false,
      placeholder: 'e.g. 15 photos, 50 photos, entire gallery',
      appliesTo: 'all',
      order: 34,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'turnaround_time',
      label: 'Turnaround Time Needed',
      key: 'turnaroundTime',
      type: 'select',
      options: ['Standard (2–3 weeks)', 'Rush (under 1 week)', 'Flexible'],
      required: true,
      appliesTo: 'all',
      order: 35,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'second_shooter',
      label: 'Second Shooter Required',
      key: 'secondShooter',
      type: 'select',
      options: ['Yes', 'No', 'Recommend for me'],
      required: true,
      appliesTo: 'all',
      order: 36,
      published: true,
      updatedAt: Date.now(),
    },

    // Budget & Terms
    {
      id: 'budget_range',
      label: 'Target Budget Range',
      key: 'budgetRange',
      type: 'select',
      options: ['Under £500', '£500–£1,000', '£1,000–£2,500', '£2,500–£5,000', '£5,000+', 'Prefer to discuss'],
      required: true,
      appliesTo: 'all',
      order: 37,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'how_soon',
      label: 'Timeline Urgency',
      key: 'howSoon',
      type: 'select',
      options: ['ASAP', 'Within 2 weeks', 'Within a month', '1–3 months', 'Just planning ahead'],
      required: true,
      appliesTo: 'all',
      order: 38,
      published: true,
      updatedAt: Date.now(),
    },
  ];

  if (!isDryRun) {
    const batch = writeBatch(db);
    for (const field of defaultFields) {
      const fieldPayload: any = { ...field };
      if (Array.isArray(field.options)) {
        fieldPayload.options = field.options.map((opt: any, idx: number) => {
          if (typeof opt === "string") return { label: opt, value: opt, order: idx + 1 };
          return opt;
        });
      }
      batch.set(doc(db, 'bookingFields', field.id), fieldPayload, { merge: true });
    }
    await batch.commit();
  }

  // 8. Availability & Studio Calendar Blocks
  console.log('  → Seeding default availability and studio calendar...');
  const defaultAvailability = [
    {
      date: '2026-11-25',
      isOpen: false,
      blockedReason: 'Private Studio Maintenance & Sensor Calibration',
      windows: [],
      slots: [],
      updatedAt: Date.now(),
    },
    {
      date: '2026-11-26',
      isOpen: false,
      blockedReason: 'Destination Editorial Shoot',
      windows: [],
      slots: [],
      updatedAt: Date.now(),
    },
  ];

  if (!isDryRun) {
    const batch = writeBatch(db);
    for (const item of defaultAvailability) {
      batch.set(doc(db, 'availability', item.date), item, { merge: true });
    }
    await batch.commit();
  }

  // 9. Register Admin records in Firestore admins collection
  if (!isDryRun) {
    console.log('  → Registering admins in admins collection...');
    const adminEmails = (process.env.ADMIN_EMAILS || 'shfotography1@gmail.com,oseghaleleonard39@gmail.com')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    try {
      for (const email of adminEmails) {
        const adminDocId = email.replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(
          doc(db, 'admins', adminDocId),
          {
            email,
            role: 'owner',
            addedAt: Date.now(),
          },
          { merge: true }
        );
      }
    } catch (adminErr: any) {
      console.log('  ℹ️ Admins collection note (owner access already granted by email rules):', adminErr.message || adminErr);
    }
  }

  // 10. Bookings (real booking records in Firestore)
  if (!isDryRun) {
    console.log(`  → Seeding ${DEFAULT_BOOKINGS.length} initial bookings...`);
    const batch = writeBatch(db);
    for (const b of DEFAULT_BOOKINGS) {
      batch.set(doc(db, 'bookings', b.id), b, { merge: true });
    }
    await batch.commit();

    // 11. Customers (directory records in Firestore)
    console.log(`  → Seeding customer accounts into customers collection...`);
    const custBatch = writeBatch(db);
    for (const b of DEFAULT_BOOKINGS) {
      const email = (b.customer?.email || '').toLowerCase().trim();
      if (!email) continue;
      const custId = `cust_${email.replace(/[^a-z0-9]/gi, '_')}`;
      custBatch.set(
        doc(db, 'customers', custId),
        {
          id: custId,
          displayName: b.customer.name,
          name: b.customer.name,
          email,
          phone: b.customer.phone || '',
          shootsCount: 1,
          lastShootDate: b.slot?.date || '2026-11-14',
          source: 'Guest Booking',
          isRegisteredUser: false,
          notes: `Booking for ${b.sessionSnapshot?.name || 'Photography Session'}`,
          createdAt: Date.now() - 86400000 * 7,
          updatedAt: Date.now(),
          deleted: false,
        },
        { merge: true }
      );
    }
    await custBatch.commit();
  }

  console.log('\n✅ Firestore seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
