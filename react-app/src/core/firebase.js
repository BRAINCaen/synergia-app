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

  // 🏆 Fonction de rattrapage des badges (recalcule les stats et vérifie les badges)
  window.synergia.retroactiveBadges = async (dryRun = true) => {
    const { collection, getDocs, doc, updateDoc, query, where, setDoc } = await import('firebase/firestore');

    console.log('%c🏆 RATTRAPAGE BADGES SYNERGIA', 'font-size: 20px; font-weight: bold;');
    console.log(dryRun ? '🔍 MODE: DRY RUN (simulation)' : '⚠️ MODE: RÉEL');
    console.log('');

    const stats = { usersProcessed: 0, badgesAwarded: 0, statsUpdated: 0, errors: 0 };
    const details = [];

    try {
      // 1. Charger tous les utilisateurs
      const usersSnap = await getDocs(collection(db, 'users'));
      console.log(`📊 ${usersSnap.size} utilisateurs trouvés`);

      // 2. Charger toutes les tâches complétées/validées
      const tasksSnap = await getDocs(collection(db, 'tasks'));
      const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const completedTasks = allTasks.filter(t => ['completed', 'validated'].includes(t.status));

      console.log(`📋 ${completedTasks.length} quêtes complétées/validées trouvées`);
      console.log('');

      // 3. Calculer les stats par utilisateur
      const userTaskCounts = {};
      completedTasks.forEach(task => {
        const assignedTo = Array.isArray(task.assignedTo) ? task.assignedTo : [];
        assignedTo.forEach(userId => {
          if (userId?.trim()) {
            userTaskCounts[userId] = (userTaskCounts[userId] || 0) + 1;
          }
        });
      });

      // 4. Charger le service de badges
      const { default: unifiedBadgeService } = await import('./services/unifiedBadgeSystem.js');

      // 5. Traiter chaque utilisateur
      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const displayName = userData.displayName || userData.email || userId;

        try {
          const actualTasksCompleted = userTaskCounts[userId] || 0;
          const currentTasksCompleted = userData.gamification?.tasksCompleted || 0;
          const currentBadges = userData.gamification?.badges || [];

          let needsUpdate = false;
          const changes = [];

          // Vérifier si le compteur de tâches est à jour
          if (actualTasksCompleted !== currentTasksCompleted) {
            needsUpdate = true;
            changes.push(`tasksCompleted: ${currentTasksCompleted} → ${actualTasksCompleted}`);
          }

          // Mettre à jour les stats si nécessaire
          if (needsUpdate && !dryRun) {
            await updateDoc(doc(db, 'users', userId), {
              'gamification.tasksCompleted': actualTasksCompleted,
              'gamification.lastStatsSync': new Date().toISOString()
            });
            stats.statsUpdated++;
          }

          // Vérifier les badges (même en mode dry run pour voir ce qui serait débloqué)
          const userDataWithCorrectStats = {
            ...userData,
            gamification: {
              ...userData.gamification,
              tasksCompleted: actualTasksCompleted
            }
          };

          // Simuler la vérification des badges
          const potentialBadges = [];
          const badgeDefs = unifiedBadgeService.badgeDefinitions || {};

          for (const [badgeId, badgeDef] of Object.entries(badgeDefs)) {
            if (currentBadges.some(b => b.id === badgeId)) continue;

            try {
              if (typeof badgeDef.autoCheck === 'function' && badgeDef.autoCheck(userDataWithCorrectStats)) {
                potentialBadges.push({
                  id: badgeId,
                  name: badgeDef.name,
                  icon: badgeDef.icon,
                  xpReward: badgeDef.xpReward
                });
              }
            } catch (e) { /* ignore */ }
          }

          // Appliquer les badges si mode réel
          if (potentialBadges.length > 0) {
            if (!dryRun) {
              // Forcer la mise à jour des stats avant la vérification
              await updateDoc(doc(db, 'users', userId), {
                'gamification.tasksCompleted': actualTasksCompleted
              });
              // Vérifier et débloquer les badges
              const result = await unifiedBadgeService.checkAndUnlockBadges(userId, 'automatic');
              stats.badgesAwarded += result.newBadges?.length || 0;
            }
            changes.push(`Badges potentiels: ${potentialBadges.map(b => b.icon + ' ' + b.name).join(', ')}`);
          }

          if (changes.length > 0) {
            console.log(`✅ ${displayName}:`);
            changes.forEach(c => console.log(`   → ${c}`));
            details.push({ userId, displayName, changes });
          }

          stats.usersProcessed++;

        } catch (error) {
          stats.errors++;
          console.error(`❌ Erreur pour ${displayName}:`, error.message);
        }
      }

      // Résumé final
      console.log('');
      console.log('%c📊 RÉSUMÉ', 'font-size: 16px; font-weight: bold;');
      console.log('═══════════════════════════════════════');
      console.log(`👥 Utilisateurs traités: ${stats.usersProcessed}`);
      console.log(`📈 Stats mises à jour: ${stats.statsUpdated}`);
      console.log(`🏆 Badges attribués: ${stats.badgesAwarded}`);
      console.log(`❌ Erreurs: ${stats.errors}`);
      console.log('');

      if (dryRun) {
        console.log('%c🔍 DRY RUN - Aucune modification effectuée', 'color: orange; font-weight: bold;');
        console.log('Pour appliquer: synergia.retroactiveBadges(false)');
      } else {
        console.log('%c✅ Rattrapage terminé !', 'color: green; font-weight: bold;');
      }

      return { stats, details };

    } catch (error) {
      console.error('❌ Erreur globale:', error);
      return { success: false, error: error.message };
    }
  };

  console.log('🔧 [ADMIN] synergia.retroactiveBadges(dryRun) disponible');
}

export default app;
