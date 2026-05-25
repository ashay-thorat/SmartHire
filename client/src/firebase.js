import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // Add other optional fields if needed
};

// Initialise Firebase app using compat API
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

// Helper functions used by AuthContext
export const firebaseLogin = (email, password) =>
  firebase.auth().signInWithEmailAndPassword(email, password);

export const firebaseRegister = (email, password) =>
  firebase.auth().createUserWithEmailAndPassword(email, password);

export const firebaseLogout = () => firebase.auth().signOut();

export const firebaseResetPassword = (email) =>
  firebase.auth().sendPasswordResetEmail(email);

export const firebaseGoogleLogin = () =>
  firebase.auth().signInWithPopup(googleProvider);
