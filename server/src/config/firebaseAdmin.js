import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;

if (!projectId) {
  console.warn('FIREBASE_PROJECT_ID not set — Google auth endpoint will return errors');
}

admin.initializeApp({ projectId });

export default admin;
