
import React from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  // Public routes don't require any authentication checks
  return <>{children}</>;
};

export default PublicRoute;
