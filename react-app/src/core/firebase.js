// ==========================================
// 📁 react-app/src/core/firebase.js
// CONFIGURATION FIREBASE COMPLÈTE AVEC GOOGLEPROVIDER
// ==========================================

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 🔑 GOOGLE AUTH PROVIDER CENTRALISÉ
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configuration de la persistance
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('❌ [FIREBASE] Erreur persistance auth:', error);
});

console.log('✅ [FIREBASE] Firebase initialisé avec Storage et GoogleProvider');

// 🔧 EXPOSITION GLOBALE POUR DEBUG/ADMIN (console)
if (typeof window !== 'undefined') {
  window.synergia = window.synergia || {};
  window.synergia.db = db;
  window.synergia.auth = auth;

  // 🧹 Fonction de nettoyage des profils
  window.synergia.cleanupUsers = async (dryRun = true) => {
    const { collection, getDocs, doc, updateDoc, deleteField } = await import('firebase/firestore');

    console.log('🧹 NETTOYAGE PROFILS SYNERGIA');
    console.log(dryRun ? '🔍 MODE: DRY RUN' : '⚠️ MODE: RÉEL');

    const FIELDS_TO_DELETE = [
      'level', 'xp', 'totalXp', 'totalXP', 'tasksCompleted',
      'loginStreak', 'projectsCompleted', 'streak', 'badges', 'lastXpGain'
    ];

    const snapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 ${snapshot.size} utilisateurs`);

    let cleaned = 0, skipped = 0;

    for (const userDoc of snapshot.docs) {
      const data = userDoc.data();
      const updates = {};
      const removed = [];

      FIELDS_TO_DELETE.forEach(f => {
        if (data.hasOwnProperty(f)) {
          updates[f] = deleteField();
          removed.push(f);
        }
      });

      // Fix badgesUnlocked
      const actual = data.gamification?.badges?.length || 0;
      if (actual !== (data.gamification?.badgesUnlocked || 0)) {
        updates['gamification.badgesUnlocked'] = actual;
        removed.push('badgesUnlocked');
      }

      if (Object.keys(updates).length > 0) {
        updates.cleanupMigration = { migratedAt: new Date().toISOString(), version: '1.0' };
        if (!dryRun) await updateDoc(doc(db, 'users', userDoc.id), updates);
        console.log(`✅ ${data.displayName || data.email}: ${removed.join(', ')}`);
        cleaned++;
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 Terminé: ${cleaned} nettoyés, ${skipped} ignorés`);
    if (dryRun) console.log('🔍 DRY RUN - Pour appliquer: synergia.cleanupUsers(false)');
    return { cleaned, skipped };
  };

  console.log('🔧 [ADMIN] synergia.cleanupUsers(dryRun) disponible');
}

export default app;
