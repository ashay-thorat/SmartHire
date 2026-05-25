import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const hasFirebaseConfig =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID;

let auth = null;
let googleProvider = null;

if (hasFirebaseConfig) {
  try {
    firebase.initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    });
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
  } catch (e) {
    console.error('Firebase init failed:', e);
  }
} else {
  console.warn(
    'Firebase not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ' +
    'and VITE_FIREBASE_PROJECT_ID in client/.env'
  );
}

export { auth, googleProvider };

const stub = (name) => () => {
  const msg = 'Firebase is not configured — set VITE_FIREBASE_* env vars';
  console.warn(msg);
  throw new Error(msg);
};

export const firebaseLogin = auth
  ? (email, password) => auth.signInWithEmailAndPassword(email, password)
  : stub('login');

export const firebaseRegister = auth
  ? (email, password) => auth.createUserWithEmailAndPassword(email, password)
  : stub('register');

export const firebaseLogout = auth
  ? () => auth.signOut()
  : stub('logout');

export const firebaseResetPassword = auth
  ? (email) => auth.sendPasswordResetEmail(email)
  : stub('resetPassword');

export const firebaseGoogleLogin = auth
  ? () => auth.signInWithPopup(googleProvider)
  : stub('googleLogin');
