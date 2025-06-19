// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './core/firebase.js';
import useAuthStore from './shared/stores/authStore.js';
import AppRoutes from './routes/index.js';
import './index.css';

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-900">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;
