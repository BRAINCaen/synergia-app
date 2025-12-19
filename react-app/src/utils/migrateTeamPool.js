// ==========================================
// 📁 react-app/src/utils/migrateTeamPool.js
// SCRIPT MIGRATION - INITIALISATION POOL ÉQUIPE
// ==========================================

import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🔄 MIGRATION : INITIALISER LE POOL ÉQUIPE
 *
 * Ce script calcule 20% de tous les XP existants de tous les utilisateurs
 * et initialise le pool équipe avec cette valeur.
 *
 * À EXÉCUTER UNE SEULE FOIS lors de la mise en place du système.
 */
export const migrateTeamPool = async () => {
  try {
    console.log('🔄 [MIGRATION] Début de la migration du pool équipe...');
    
    // 1. Récupérer tous les utilisateurs
    console.log('📊 [MIGRATION] Récupération de tous les utilisateurs...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    let totalUserXP = 0;
    let userCount = 0;
    
    // 2. Calculer le total des XP de tous les utilisateurs
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userXP = userData.gamification?.totalXp || 0;
      totalUserXP += userXP;
      userCount++;
      
      console.log(`👤 [MIGRATION] ${userData.email || doc.id}: ${userXP} XP`);
    });
    
    console.log(`📊 [MIGRATION] Total XP utilisateurs: ${totalUserXP} XP (${userCount} utilisateurs)`);
    
    // 3. Calculer 20% pour le pool équipe
    const teamPoolXP = Math.floor(totalUserXP * 0.2);

    console.log(`💎 [MIGRATION] Pool équipe à initialiser: ${teamPoolXP} XP (20% de ${totalUserXP})`);
    
    // 4. Créer/Initialiser le pool équipe
    const poolRef = doc(db, 'teamPool', 'main');
    
    await setDoc(poolRef, {
      totalXP: teamPoolXP,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      description: 'Pool collectif d\'XP pour récompenses d\'équipe - 20% des XP gagnés',
      migration: {
        migratedAt: serverTimestamp(),
        migratedFrom: {
          totalUserXP,
          userCount,
          calculatedPoolXP: teamPoolXP
        },
        note: 'Pool initialisé avec 20% des XP existants de tous les utilisateurs'
      }
    });
    
    console.log(`✅ [MIGRATION] Pool équipe créé avec succès !`);
    console.log(`💰 [MIGRATION] ${teamPoolXP} XP disponibles pour l'équipe`);
    
    return {
      success: true,
      totalUserXP,
      teamPoolXP,
      userCount,
      message: `Migration réussie ! Pool équipe initialisé avec ${teamPoolXP} XP (20% de ${totalUserXP} XP au total)`
    };
    
  } catch (error) {
    console.error('❌ [MIGRATION] Erreur lors de la migration:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 🧪 FONCTION DE TEST (SANS ÉCRITURE)
 * Calcule ce que serait le pool équipe sans l'initialiser
 */
export const previewTeamPoolMigration = async () => {
  try {
    console.log('👁️ [PREVIEW] Aperçu de la migration...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    let totalUserXP = 0;
    const userDetails = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userXP = userData.gamification?.totalXp || 0;
      totalUserXP += userXP;
      
      userDetails.push({
        id: doc.id,
        email: userData.email || 'N/A',
        xp: userXP
      });
    });
    
    const teamPoolXP = Math.floor(totalUserXP * 0.2);

    console.log('📊 [PREVIEW] Résumé:');
    console.log(`   Total utilisateurs: ${userDetails.length}`);
    console.log(`   Total XP utilisateurs: ${totalUserXP}`);
    console.log(`   Pool équipe (20%): ${teamPoolXP}`);
    
    return {
      totalUserXP,
      teamPoolXP,
      userCount: userDetails.length,
      userDetails
    };
    
  } catch (error) {
    console.error('❌ [PREVIEW] Erreur:', error);
    return null;
  }
};

/**
 * 📝 UTILISATION
 * 
 * 1. APERÇU (sans modification) :
 * 
 *    import { previewTeamPoolMigration } from './utils/migrateTeamPool.js';
 *    const preview = await previewTeamPoolMigration();
 *    console.log(preview);
 * 
 * 2. MIGRATION (avec création du pool) :
 * 
 *    import { migrateTeamPool } from './utils/migrateTeamPool.js';
 *    const result = await migrateTeamPool();
 *    if (result.success) {
 *      alert(result.message);
 *    }
 * 
 * 3. Depuis la console navigateur :
 * 
 *    // Ouvrir la console sur n'importe quelle page de Synergia
 *    // Puis exécuter :
 *    
 *    import('./utils/migrateTeamPool.js').then(module => {
 *      module.migrateTeamPool().then(result => console.log(result));
 *    });
 */

export default {
  migrateTeamPool,
  previewTeamPoolMigration
};
