import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountJson) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) {
    console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
    process.exit(1);
  }
} else if (projectId) {
  admin.initializeApp({ projectId });
} else {
  console.warn('Neither FIREBASE_PROJECT_ID nor FIREBASE_SERVICE_ACCOUNT set');
}

export default admin;
