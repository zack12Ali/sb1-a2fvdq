import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  return {
    showAuthModal,
    setShowAuthModal,
    user,
    loading
  };
}