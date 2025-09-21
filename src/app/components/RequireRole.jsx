import React from 'react';
import { Navigate } from 'react-router-dom';

function parseToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload; // { sub, email, role }
  } catch (err) {
    return null; 
  }
}

export default function RequireRole({ children, allowedRoles = [] }) {
  const payload = parseToken();
  if (!payload) {
    return <Navigate to="/signin" replace />;
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
    // redirect to default page for role or unauthorized
    return <Navigate to="/signin" replace />;
  }
  return children;
}