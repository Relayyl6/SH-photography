import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
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
} from '../lib/content/index';

// Parse arguments
const isDryRun = process.argv.includes('--dry-run');
const isEmulator = process.argv.includes('--emulator');

if (isEmulator) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || 'localhost:9199';
  console.log('⚡ Running in Firebase Emulator mode');
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0]!;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return initializeApp({
        credential: cert(sa),
        projectId: sa.project_id || 'sh-photography-demo',
      });
    } catch {
      return initializeApp({
        credential: applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sh-photography-demo',
      });
    }
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sh-photography-demo',
  });
}

const app: App = getAdminApp();
const db: Firestore = getFirestore(app);

async function seed() {
  console.log(`\n🌱 Starting Firestore seeding${isDryRun ? ' (DRY RUN)' : ''}...`);

  // 1. Settings
  console.log('  → Seeding settings/site...');
  if (!isDryRun) await db.doc('settings/site').set(DEFAULT_SITE_SETTINGS, { merge: true });

  console.log('  → Seeding settings/contact...');
  if (!isDryRun) await db.doc('settings/contact').set(DEFAULT_CONTACT_SETTINGS, { merge: true });

  console.log('  → Seeding settings/social...');
  if (!isDryRun) await db.doc('settings/social').set(DEFAULT_SOCIAL_SETTINGS, { merge: true });

  console.log('  → Seeding settings/booking...');
  if (!isDryRun) await db.doc('settings/booking').set(DEFAULT_BOOKING_SETTINGS, { merge: true });

  // 2. Pages
  console.log('  → Seeding pages/home...');
  if (!isDryRun) await db.doc('pages/home').set(DEFAULT_HOME_PAGE, { merge: true });

  console.log('  → Seeding pages/about...');
  if (!isDryRun) await db.doc('pages/about').set(DEFAULT_ABOUT_PAGE, { merge: true });

  // 3. Bento Home
  console.log('  → Seeding bento/home...');
  if (!isDryRun) await db.doc('bento/home').set(DEFAULT_BENTO_HOME, { merge: true });

  // 4. Portfolio images
  console.log(`  → Seeding ${DEFAULT_PORTFOLIO_IMAGES.length} portfolio images...`);
  if (!isDryRun) {
    const batchSize = 400;
    for (let i = 0; i < DEFAULT_PORTFOLIO_IMAGES.length; i += batchSize) {
      const batch = db.batch();
      const chunk = DEFAULT_PORTFOLIO_IMAGES.slice(i, i + batchSize);
      for (const img of chunk) {
        batch.set(db.collection('portfolio').doc(img.id), img, { merge: true });
      }
      await batch.commit();
    }
  }

  // 5. Sessions
  console.log(`  → Seeding ${DEFAULT_SESSIONS.length} sessions...`);
  if (!isDryRun) {
    const batch = db.batch();
    for (const session of DEFAULT_SESSIONS) {
      batch.set(db.collection('sessions').doc(session.id), session, { merge: true });
    }
    await batch.commit();
  }

  // 6. Packages
  console.log(`  → Seeding ${DEFAULT_PACKAGES.length} packages...`);
  if (!isDryRun) {
    const batch = db.batch();
    for (const pkg of DEFAULT_PACKAGES) {
      batch.set(db.collection('packages').doc(pkg.id), pkg, { merge: true });
    }
    await batch.commit();
  }

  // 7. Booking Fields
  console.log('  → Seeding default booking fields...');
  const defaultFields = [
    {
      id: 'full_name',
      label: 'Full Name',
      key: 'name',
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
      id: 'session_date',
      label: 'Preferred Date',
      key: 'date',
      type: 'date',
      required: true,
      appliesTo: 'all',
      order: 4,
      published: true,
      updatedAt: Date.now(),
    },
    {
      id: 'session_notes',
      label: 'Notes & Vision',
      key: 'notes',
      type: 'textarea',
      required: false,
      placeholder: 'Describe your vision, locations, or special requests...',
      appliesTo: 'all',
      order: 5,
      published: true,
      updatedAt: Date.now(),
    },
  ];

  if (!isDryRun) {
    const batch = db.batch();
    for (const field of defaultFields) {
      batch.set(db.collection('bookingFields').doc(field.id), field, { merge: true });
    }
    await batch.commit();
  }

  console.log('\n✅ Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
