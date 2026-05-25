import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, accessToken } = useAuthStore();

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own dashboard if role is incorrect
    return user.role === 'recruiter' 
      ? <Navigate to="/recruiter/dashboard" replace /> 
      : <Navigate to="/dashboard" replace />;
  }

  return children;
}
