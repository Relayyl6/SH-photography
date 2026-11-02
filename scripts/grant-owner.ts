import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth, UserRecord } from 'firebase-admin/auth';

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
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

async function grantOwner(targetEmailInput?: string) {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || 'shfotography1@gmail.com,oseghaleleonard39@gmail.com';
  const allowedEmails = adminEmailsEnv
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const emailToGrant = (targetEmailInput || process.argv[2] || '').trim().toLowerCase();

  if (!emailToGrant) {
    console.error('Usage: ts-node scripts/grant-owner.ts <email>');
    console.error(`Allowed in ADMIN_EMAILS: ${allowedEmails.join(', ')}`);
    process.exit(1);
  }

  if (!allowedEmails.includes(emailToGrant)) {
    console.error(`❌ Error: Email "${emailToGrant}" is not listed in ADMIN_EMAILS (${allowedEmails.join(', ')})`);
    process.exit(1);
  }

  console.log(`\n🔍 Looking up user with email: ${emailToGrant}...`);
  let user: UserRecord;
  try {
    user = await auth.getUserByEmail(emailToGrant);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      console.log(`User does not exist yet. Creating user account for ${emailToGrant}...`);
      user = await auth.createUser({
        email: emailToGrant,
        emailVerified: true,
      });
    } else {
      throw err;
    }
  }

  console.log(`Found UID: ${user.uid}. Setting custom claim { role: "owner" }...`);
  await auth.setCustomUserClaims(user.uid, {
    ...(user.customClaims || {}),
    role: 'owner',
  });

  console.log(`Updating admins/${user.uid} document in Firestore...`);
  await db.doc(`admins/${user.uid}`).set(
    {
      uid: user.uid,
      role: 'owner',
      email: emailToGrant,
      addedAt: Date.now(),
    },
    { merge: true }
  );

  console.log(`Recording audit log...`);
  await db.collection('auditLog').add({
    actor: 'system/grant-owner-script',
    action: 'GRANT_OWNER_ROLE',
    targetUid: user.uid,
    targetEmail: emailToGrant,
    at: Date.now(),
  });

  console.log(`\n✅ Successfully granted owner role to ${emailToGrant} (UID: ${user.uid})!`);
}

grantOwner().catch((err) => {
  console.error('❌ Error granting owner role:', err);
  process.exit(1);
});
