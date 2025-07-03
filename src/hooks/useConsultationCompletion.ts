
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useConsultationCompletion = () => {
  const { user } = useAuth();
  const [hasCompletedConsultation, setHasCompletedConsultation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkConsultationCompletion();
    }
  }, [user]);

  const checkConsultationCompletion = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Since consultations are removed, always set to false
      setHasCompletedConsultation(false);
    } catch (error) {
      console.error('Error in consultation completion check:', error);
      setHasCompletedConsultation(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasCompletedConsultation,
    loading,
    refetch: checkConsultationCompletion
  };
};
