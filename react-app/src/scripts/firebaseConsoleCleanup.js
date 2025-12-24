/**
 * 🧹 SCRIPT FIREBASE CONSOLE - NETTOYAGE UTILISATEURS
 *
 * COMMENT UTILISER:
 * 1. Ouvrir Synergia dans le navigateur (connecté en admin)
 * 2. Ouvrir les DevTools (F12)
 * 3. Aller dans l'onglet Console
 * 4. Copier-coller le script ci-dessous
 * 5. Appuyer sur Entrée
 *
 * ⚠️ IMPORTANT: Tester d'abord en DRY RUN (dryRun = true)
 */

// ==========================================
// 📋 SCRIPT À COPIER-COLLER DANS LA CONSOLE
// ==========================================

const CLEANUP_SCRIPT = `
// 🧹 NETTOYAGE DES PROFILS UTILISATEURS SYNERGIA
// ⚠️ Changer dryRun à false pour appliquer réellement

(async function() {
  const dryRun = true; // ⬅️ METTRE À false POUR APPLIQUER

  console.log('%c🧹 NETTOYAGE PROFILS SYNERGIA', 'font-size: 20px; font-weight: bold;');
  console.log(dryRun ? '🔍 MODE: DRY RUN (simulation)' : '⚠️ MODE: RÉEL - MODIFICATIONS ACTIVES');
  console.log('');

  // Champs obsolètes à supprimer de la racine
  const FIELDS_TO_DELETE = [
    'level',
    'xp',
    'totalXp',
    'totalXP',
    'tasksCompleted',
    'loginStreak',
    'projectsCompleted',
    'streak',
    'badges',      // Ancien tableau (remplacé par gamification.badges)
    'lastXpGain',  // Dupliqué dans gamification
  ];

  try {
    // Import Firebase depuis le contexte Synergia
    const firestore = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { collection, getDocs, doc, updateDoc, deleteField, getFirestore } = firestore;

    // Récupérer l'instance Firestore de Synergia
    const db = window.db || getFirestore();

    if (!db) {
      console.error('❌ Firebase non trouvé. Êtes-vous connecté à Synergia ?');
      return;
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);

    console.log('📊 ' + snapshot.size + ' utilisateurs trouvés');
    console.log('');

    let stats = { cleaned: 0, skipped: 0, errors: 0 };
    let details = [];

    for (const userDoc of snapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const displayName = userData.displayName || userData.email || userId;

      try {
        const updates = {};
        const fieldsRemoved = [];

        // 1. Supprimer les champs obsolètes à la racine
        FIELDS_TO_DELETE.forEach(field => {
          if (userData.hasOwnProperty(field)) {
            updates[field] = deleteField();
            fieldsRemoved.push(field);
          }
        });

        // 2. Corriger badgesUnlocked si incohérent
        const actualBadges = userData.gamification?.badges?.length || 0;
        const reportedBadges = userData.gamification?.badgesUnlocked || 0;
        if (actualBadges !== reportedBadges) {
          updates['gamification.badgesUnlocked'] = actualBadges;
          fieldsRemoved.push('badgesUnlocked (corrigé: ' + reportedBadges + ' → ' + actualBadges + ')');
        }

        // 3. Nettoyer rewards dupliqués
        if (userData.rewards && Array.isArray(userData.rewards)) {
          const seen = new Set();
          const uniqueRewards = userData.rewards.filter(r => {
            const key = r.id + '_' + (r.redeemedAt?.seconds || r.redeemedAt || '');
            if (seen.has(key) || r.id === 'test') return false;
            seen.add(key);
            return true;
          });

          if (uniqueRewards.length < userData.rewards.length) {
            updates.rewards = uniqueRewards;
            fieldsRemoved.push('rewards dupliqués (' + (userData.rewards.length - uniqueRewards.length) + ' supprimés)');
          }
        }

        // 4. Ajouter métadonnées de migration
        if (Object.keys(updates).length > 0) {
          updates.cleanupMigration = {
            migratedAt: new Date().toISOString(),
            version: '1.0',
            fieldsRemoved: fieldsRemoved
          };

          if (!dryRun) {
            await updateDoc(doc(db, 'users', userId), updates);
          }

          stats.cleaned++;
          details.push({ displayName, fieldsRemoved });
          console.log('✅ ' + displayName + ': ' + fieldsRemoved.join(', '));
        } else {
          stats.skipped++;
        }

      } catch (err) {
        stats.errors++;
        console.error('❌ ' + displayName + ': ' + err.message);
      }
    }

    // Résumé final
    console.log('');
    console.log('%c📊 RÉSUMÉ', 'font-size: 16px; font-weight: bold;');
    console.log('═══════════════════════════════════');
    console.log('✅ Nettoyés: ' + stats.cleaned);
    console.log('⏭️ Ignorés (propres): ' + stats.skipped);
    console.log('❌ Erreurs: ' + stats.errors);
    console.log('');

    if (dryRun) {
      console.log('%c🔍 DRY RUN - Aucune modification effectuée', 'color: orange; font-weight: bold;');
      console.log('Pour appliquer, changer dryRun = false et relancer');
    } else {
      console.log('%c✅ Nettoyage terminé !', 'color: green; font-weight: bold;');
    }

    return { stats, details };

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
})();
`;

// Afficher le script
console.log('📋 Script à copier-coller dans la console du navigateur:');
console.log('=========================================================\n');
console.log(CLEANUP_SCRIPT);

export default CLEANUP_SCRIPT;
