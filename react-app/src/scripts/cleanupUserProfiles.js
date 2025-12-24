/**
 * 🧹 SCRIPT DE NETTOYAGE DES PROFILS UTILISATEURS
 *
 * Ce script nettoie les données obsolètes et dupliquées dans les profils Firebase.
 * À exécuter une seule fois pour migrer les anciens profils.
 *
 * Usage:
 * 1. Dans la console du navigateur (connecté en admin sur Synergia)
 * 2. Ou via Node.js avec les credentials Firebase
 */

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteField,
  writeBatch
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ==========================================
// 🔧 CONFIGURATION DU NETTOYAGE
// ==========================================

const CLEANUP_CONFIG = {
  // Champs à supprimer à la racine (dupliqués dans gamification)
  rootFieldsToRemove: [
    'level',
    'xp',
    'totalXp',
    'totalXP',  // Doublon avec casse différente
    'tasksCompleted',
    'loginStreak',
    'projectsCompleted',
    'streak',
    'badges',  // Ancien tableau de badges (remplacé par gamification.badges)
  ],

  // Champs à supprimer si dupliqués
  duplicateFieldsToCheck: [
    { root: 'lastXpGain', nested: 'gamification.lastXpGain' },
    { root: 'bio', nested: 'preferences.profile.bio' },
    { root: 'department', nested: 'preferences.profile.department' },
  ],

  // Champs stats obsolètes
  statsFieldsToRemove: [
    'stats.tasksCompleted',  // Dupliqué dans gamification
    'stats.projectsCreated', // Dupliqué dans gamification
  ],
};

// ==========================================
// 🧹 FONCTION PRINCIPALE DE NETTOYAGE
// ==========================================

/**
 * Nettoie un profil utilisateur unique
 */
export async function cleanupUserProfile(userId, dryRun = true) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDocs(userRef);

    if (!userSnap.exists()) {
      console.log(`⚠️ Utilisateur ${userId} non trouvé`);
      return { success: false, error: 'User not found' };
    }

    const userData = userSnap.data();
    const updates = {};
    const fieldsToDelete = [];

    // 1. Supprimer les champs racine obsolètes
    CLEANUP_CONFIG.rootFieldsToRemove.forEach(field => {
      if (userData.hasOwnProperty(field)) {
        fieldsToDelete.push(field);
        updates[field] = deleteField();
      }
    });

    // 2. Nettoyer lastXpGain dupliqué à la racine
    if (userData.lastXpGain && userData.gamification?.lastXpGain) {
      fieldsToDelete.push('lastXpGain (racine)');
      updates.lastXpGain = deleteField();
    }

    // 3. Corriger badgesUnlocked si incohérent
    const actualBadgeCount = userData.gamification?.badges?.length || 0;
    const reportedBadgeCount = userData.gamification?.badgesUnlocked || 0;
    if (actualBadgeCount !== reportedBadgeCount) {
      updates['gamification.badgesUnlocked'] = actualBadgeCount;
    }

    // 4. Supprimer les doublons role
    // (on garde un seul 'role' à la racine)

    // 5. Nettoyer rewards dupliqués
    if (userData.rewards && Array.isArray(userData.rewards)) {
      const uniqueRewards = [];
      const seenIds = new Set();

      userData.rewards.forEach(reward => {
        const key = `${reward.id}_${reward.redeemedAt}`;
        if (!seenIds.has(key)) {
          seenIds.add(key);
          // Exclure les rewards de test
          if (reward.id !== 'test') {
            uniqueRewards.push(reward);
          }
        }
      });

      if (uniqueRewards.length !== userData.rewards.length) {
        updates.rewards = uniqueRewards;
      }
    }

    // 6. Ajouter timestamp de migration
    updates.cleanupMigration = {
      migratedAt: new Date().toISOString(),
      version: '1.0',
      fieldsRemoved: fieldsToDelete
    };

    // Résumé
    const summary = {
      userId,
      fieldsToDelete,
      updates: Object.keys(updates).filter(k => k !== 'cleanupMigration'),
      badgeCountFixed: actualBadgeCount !== reportedBadgeCount,
    };

    console.log(`\n📋 Utilisateur: ${userData.displayName || userId}`);
    console.log(`   Champs à supprimer: ${fieldsToDelete.length}`);
    console.log(`   Corrections: ${summary.updates.length}`);

    if (dryRun) {
      console.log('   🔍 [DRY RUN] Aucune modification effectuée');
      return { success: true, dryRun: true, summary };
    }

    // Appliquer les modifications
    await updateDoc(userRef, updates);
    console.log('   ✅ Profil nettoyé !');

    return { success: true, summary };

  } catch (error) {
    console.error(`❌ Erreur nettoyage ${userId}:`, error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 🚀 NETTOYAGE DE TOUS LES UTILISATEURS
// ==========================================

/**
 * Nettoie tous les profils utilisateurs
 * @param {boolean} dryRun - Si true, affiche les changements sans les appliquer
 */
export async function cleanupAllUsers(dryRun = true) {
  console.log('🧹 ========================================');
  console.log('   NETTOYAGE DES PROFILS UTILISATEURS');
  console.log('   ' + (dryRun ? '🔍 MODE: DRY RUN (simulation)' : '⚠️ MODE: RÉEL'));
  console.log('========================================\n');

  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);

    const results = {
      total: usersSnap.size,
      cleaned: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    console.log(`📊 ${results.total} utilisateurs trouvés\n`);

    // Utiliser un batch pour les performances
    const BATCH_SIZE = 500;
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      try {
        const updates = {};
        const fieldsToDelete = [];

        // 1. Supprimer les champs racine obsolètes
        CLEANUP_CONFIG.rootFieldsToRemove.forEach(field => {
          if (userData.hasOwnProperty(field)) {
            fieldsToDelete.push(field);
            updates[field] = deleteField();
          }
        });

        // 2. Nettoyer lastXpGain dupliqué
        if (userData.lastXpGain && userData.gamification?.lastXpGain) {
          fieldsToDelete.push('lastXpGain');
          updates.lastXpGain = deleteField();
        }

        // 3. Corriger badgesUnlocked
        const actualBadgeCount = userData.gamification?.badges?.length || 0;
        const reportedBadgeCount = userData.gamification?.badgesUnlocked || 0;
        if (actualBadgeCount !== reportedBadgeCount) {
          updates['gamification.badgesUnlocked'] = actualBadgeCount;
        }

        // 4. Nettoyer rewards dupliqués
        if (userData.rewards && Array.isArray(userData.rewards)) {
          const uniqueRewards = [];
          const seenIds = new Set();

          userData.rewards.forEach(reward => {
            const key = `${reward.id}_${reward.redeemedAt?.seconds || reward.redeemedAt}`;
            if (!seenIds.has(key) && reward.id !== 'test') {
              seenIds.add(key);
              uniqueRewards.push(reward);
            }
          });

          if (uniqueRewards.length !== userData.rewards.length) {
            updates.rewards = uniqueRewards;
          }
        }

        // 5. Ajouter metadata de migration
        if (Object.keys(updates).length > 0) {
          updates['cleanupMigration'] = {
            migratedAt: new Date().toISOString(),
            version: '1.0',
            fieldsRemoved: fieldsToDelete
          };

          if (!dryRun) {
            batch.update(doc(db, 'users', userId), updates);
            batchCount++;

            // Commit le batch tous les 500 documents
            if (batchCount >= BATCH_SIZE) {
              await batch.commit();
              batch = writeBatch(db);
              batchCount = 0;
              console.log(`   💾 Batch sauvegardé (${results.cleaned + batchCount} utilisateurs)`);
            }
          }

          results.cleaned++;
          results.details.push({
            userId,
            displayName: userData.displayName || 'N/A',
            fieldsRemoved: fieldsToDelete.length,
            corrections: Object.keys(updates).length - 1
          });

          console.log(`✅ ${userData.displayName || userId}: ${fieldsToDelete.length} champs supprimés`);
        } else {
          results.skipped++;
        }

      } catch (error) {
        results.errors++;
        console.error(`❌ Erreur pour ${userId}:`, error.message);
      }
    }

    // Commit le dernier batch
    if (!dryRun && batchCount > 0) {
      await batch.commit();
      console.log(`   💾 Dernier batch sauvegardé`);
    }

    // Résumé final
    console.log('\n========================================');
    console.log('📊 RÉSUMÉ DU NETTOYAGE');
    console.log('========================================');
    console.log(`   Total utilisateurs: ${results.total}`);
    console.log(`   ✅ Nettoyés: ${results.cleaned}`);
    console.log(`   ⏭️ Ignorés (déjà propres): ${results.skipped}`);
    console.log(`   ❌ Erreurs: ${results.errors}`);
    console.log(`   Mode: ${dryRun ? 'DRY RUN (aucune modification)' : 'RÉEL'}`);
    console.log('========================================\n');

    return results;

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 🎯 FONCTION POUR LA CONSOLE FIREBASE
// ==========================================

/**
 * Version pour exécution dans la console du navigateur
 * Copier-coller ce code dans la console quand connecté à Synergia
 */
export const browserCleanupScript = `
// 🧹 SCRIPT DE NETTOYAGE - À coller dans la console navigateur

(async function cleanupAllUsers() {
  const dryRun = true; // ⚠️ Mettre à false pour appliquer réellement

  console.log('🧹 Démarrage du nettoyage...');
  console.log(dryRun ? '🔍 MODE: DRY RUN' : '⚠️ MODE: RÉEL');

  // Accéder à Firebase depuis le contexte Synergia
  const { collection, getDocs, doc, updateDoc, deleteField, writeBatch } = await import('firebase/firestore');
  const { db } = await import('./core/firebase.js');

  const fieldsToRemove = [
    'level', 'xp', 'totalXp', 'totalXP',
    'tasksCompleted', 'loginStreak', 'projectsCompleted',
    'streak', 'badges', 'lastXpGain'
  ];

  const usersSnap = await getDocs(collection(db, 'users'));
  let cleaned = 0, skipped = 0;

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    const updates = {};

    fieldsToRemove.forEach(field => {
      if (data.hasOwnProperty(field)) {
        updates[field] = deleteField();
      }
    });

    if (Object.keys(updates).length > 0) {
      if (!dryRun) {
        await updateDoc(doc(db, 'users', userDoc.id), updates);
      }
      console.log(\`✅ \${data.displayName}: \${Object.keys(updates).length} champs\`);
      cleaned++;
    } else {
      skipped++;
    }
  }

  console.log(\`\\n📊 Terminé: \${cleaned} nettoyés, \${skipped} ignorés\`);
})();
`;

// ==========================================
// 🔧 UTILITAIRES
// ==========================================

/**
 * Affiche un rapport détaillé d'un utilisateur
 */
export async function analyzeUserProfile(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDocs(userRef);

  if (!userSnap.exists()) {
    console.log('Utilisateur non trouvé');
    return;
  }

  const data = userSnap.data();

  console.log('\n📋 ANALYSE DU PROFIL');
  console.log('====================');
  console.log(`Utilisateur: ${data.displayName || userId}`);
  console.log(`Email: ${data.email}`);

  console.log('\n🔍 Champs obsolètes à la racine:');
  CLEANUP_CONFIG.rootFieldsToRemove.forEach(field => {
    if (data.hasOwnProperty(field)) {
      const value = data[field];
      const gamificationValue = data.gamification?.[field];
      console.log(`  ❌ ${field}: ${JSON.stringify(value)} (gamification: ${JSON.stringify(gamificationValue)})`);
    }
  });

  console.log('\n📊 Badges:');
  console.log(`  Racine (obsolète): ${data.badges?.length || 0}`);
  console.log(`  Gamification (actuel): ${data.gamification?.badges?.length || 0}`);

  console.log('\n💰 XP:');
  console.log(`  Racine: ${data.xp || 0} / ${data.totalXp || 0}`);
  console.log(`  Gamification: ${data.gamification?.xp || 0} / ${data.gamification?.totalXp || 0}`);

  return data;
}

// Export par défaut
export default {
  cleanupUserProfile,
  cleanupAllUsers,
  analyzeUserProfile,
  browserCleanupScript
};
