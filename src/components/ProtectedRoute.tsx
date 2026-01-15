import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
