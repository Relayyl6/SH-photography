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
} from '../lib/content/index';

import { db, auth } from '../lib/firebase/config';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const isDryRun = process.argv.includes('--dry-run');

async function seed() {
  console.log(`\n🌱 Starting Firestore seeding to ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sh-photography-8a473'}${isDryRun ? ' (DRY RUN)' : ''}...`);

  // Attempt signing in as admin if credentials are provided in env
  if (!isDryRun && process.env.ADMIN_SEED_EMAIL && process.env.ADMIN_SEED_PASSWORD) {
    try {
      await signInWithEmailAndPassword(auth, process.env.ADMIN_SEED_EMAIL, process.env.ADMIN_SEED_PASSWORD);
      console.log(`  🔒 Authenticated as admin: ${process.env.ADMIN_SEED_EMAIL}`);
    } catch (authErr: any) {
      try {
        await createUserWithEmailAndPassword(auth, process.env.ADMIN_SEED_EMAIL, process.env.ADMIN_SEED_PASSWORD);
        console.log(`  🔒 Registered and authenticated as admin: ${process.env.ADMIN_SEED_EMAIL}`);
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
  if (!isDryRun) await setDoc(doc(db, 'pages', 'home'), DEFAULT_HOME_PAGE, { merge: true });

  console.log('  → Seeding pages/about...');
  if (!isDryRun) await setDoc(doc(db, 'pages', 'about'), DEFAULT_ABOUT_PAGE, { merge: true });

  // 3. Bento Home
  console.log('  → Seeding bento/home...');
  if (!isDryRun) await setDoc(doc(db, 'bento', 'home'), DEFAULT_BENTO_HOME, { merge: true });

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
    const batch = writeBatch(db);
    for (const field of defaultFields) {
      batch.set(doc(db, 'bookingFields', field.id), field, { merge: true });
    }
    await batch.commit();
  }

  // 8. Register Admin records in Firestore admins collection
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

  console.log('\n✅ Firestore seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
