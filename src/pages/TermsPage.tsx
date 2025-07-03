
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const TermsPage = () => {
  // Redirect to the dynamic page system
  return <Navigate to="/terms" replace />;
};

export default TermsPage;
