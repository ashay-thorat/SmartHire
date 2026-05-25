import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import api from '../utils/api';
import {
  firebaseLogin,
  firebaseRegister,
  firebaseLogout,
  firebaseResetPassword,
  firebaseGoogleLogin,
} from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          localStorage.setItem('token', token);

          // Fetch MongoDB user details
          const res = await api.get('/auth/me');
          const mongoUser = res.data;

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || mongoUser.name,
            photoURL: currentUser.photoURL,
            role: mongoUser.role,
            _id: mongoUser._id,
            mongoUser: mongoUser
          });
        } catch (err) {
          console.error('Error syncing user with database:', err);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: 'user',
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cred = await firebaseLogin(email, password);
    return cred;
  };

  const register = async (email, password, displayName) => {
    const cred = await firebaseRegister(email, password);
    if (cred.user) {
      await cred.user.updateProfile({ displayName });
    }
    return cred;
  };

  const logout = async () => {
    await firebaseLogout();
    setUser(null);
    localStorage.removeItem('token');
  };

  const resetPassword = async (email) => {
    await firebaseResetPassword(email);
  };

  const googleLogin = async () => {
    const cred = await firebaseGoogleLogin();
    return cred;
  };

  const value = { user, loading, login, register, logout, resetPassword, googleLogin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);