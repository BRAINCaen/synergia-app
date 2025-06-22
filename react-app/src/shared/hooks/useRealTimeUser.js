import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';

export const useRealTimeUser = () => {
  const { user: authUser } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser?.uid) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userRef = doc(db, 'users', authUser.uid);
    
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('❌ Erreur écoute données utilisateur:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authUser?.uid]);

  return { userData, loading, error };
};
