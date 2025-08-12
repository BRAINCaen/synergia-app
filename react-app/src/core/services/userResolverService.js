// ==========================================
// 📁 react-app/src/core/services/userResolverService.js
// SERVICE DE RÉSOLUTION D'UTILISATEURS ULTRA-SÉCURISÉ
// ==========================================

import { db } from '../firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * 🛡️ SERVICE DE RÉSOLUTION D'UTILISATEURS ULTRA-SÉCURISÉ
 * Corrige définitivement l'erreur "TypeError: s.indexOf is not a function"
 */
class UserResolverService {
  constructor() {
    this.userCache = new Map();
    this.isInitialized = false;
    console.log('👤 UserResolverService initialisé - Version sécurisée');
  }

  /**
   * 🔍 VALIDATION ULTRA-SÉCURISÉE DES PARAMÈTRES
   */
  validateUserId(userId) {
    // Vérification exhaustive du type et de la validité
    if (!userId) {
      console.warn('⚠️ UserId null/undefined');
      return { isValid: false, cleanId: null, error: 'UserId manquant' };
    }

    // Convertir en string si ce n'est pas déjà le cas
    let cleanId;
    try {
      cleanId = String(userId).trim();
    } catch (error) {
      console.warn('⚠️ Impossible de convertir userId en string:', userId, error);
      return { isValid: false, cleanId: null, error: 'UserId non convertible' };
    }

    // Vérifier que ce n'est pas une string vide
    if (cleanId === '' || cleanId === 'undefined' || cleanId === 'null') {
      console.warn('⚠️ UserId invalide:', cleanId);
      return { isValid: false, cleanId: null, error: 'UserId vide ou invalide' };
    }

    // Vérifier que ça ressemble à un ID Firebase (alphanumérique + quelques caractères spéciaux)
    const firebaseIdPattern = /^[a-zA-Z0-9_-]+$/;
    if (!firebaseIdPattern.test(cleanId)) {
      console.warn('⚠️ Format userId invalide:', cleanId);
      return { isValid: false, cleanId: null, error: 'Format userId invalide' };
    }

    // Vérifier la longueur (les IDs Firebase font généralement entre 10 et 50 caractères)
    if (cleanId.length < 5 || cleanId.length > 100) {
      console.warn('⚠️ Longueur userId suspecte:', cleanId.length);
      return { isValid: false, cleanId: null, error: 'Longueur userId invalide' };
    }

    return { isValid: true, cleanId, error: null };
  }

  /**
   * 🛡️ RÉSOUDRE UN USERID EN NOM D'AFFICHAGE - VERSION ULTRA-SÉCURISÉE
   */
  async resolveUserName(userId) {
    try {
      // 1. VALIDATION ULTRA-SÉCURISÉE
      const validation = this.validateUserId(userId);
      if (!validation.isValid) {
        console.warn(`⚠️ Validation échouée: ${validation.error}`);
        return 'Utilisateur inconnu';
      }

      const cleanUserId = validation.cleanId;
      console.log(`🔍 Résolution utilisateur sécurisée: ${cleanUserId}`);

      // 2. VÉRIFIER LE CACHE AVEC VALIDATION
      if (this.userCache.has(cleanUserId)) {
        const cachedResult = this.userCache.get(cleanUserId);
        console.log(`📄 Cache hit pour: ${cleanUserId} → ${cachedResult}`);
        return cachedResult || 'Utilisateur inconnu';
      }

      // 3. RÉCUPÉRATION FIREBASE ULTRA-SÉCURISÉE
      let userData = null;
      try {
        console.log(`🔍 Requête Firebase pour: ${cleanUserId}`);
        const userRef = doc(db, 'users', cleanUserId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          userData = userSnap.data();
          console.log(`✅ Données utilisateur récupérées:`, userData);
        } else {
          console.warn(`⚠️ Utilisateur non trouvé dans Firestore: ${cleanUserId}`);
        }
      } catch (firebaseError) {
        console.error(`❌ Erreur Firebase pour ${cleanUserId}:`, firebaseError);
        // Continuer avec userData = null
      }

      // 4. EXTRACTION SÉCURISÉE DU NOM D'AFFICHAGE
      let displayName = 'Utilisateur inconnu';
      
      if (userData) {
        try {
          // Priorité 1: displayName
          if (userData.displayName && typeof userData.displayName === 'string') {
            displayName = userData.displayName.trim();
          }
          // Priorité 2: email (partie avant @)
          else if (userData.email && typeof userData.email === 'string') {
            const emailPart = userData.email.split('@')[0];
            if (emailPart && emailPart.trim()) {
              displayName = emailPart.trim();
            }
          }
          // Priorité 3: name (champ alternatif)
          else if (userData.name && typeof userData.name === 'string') {
            displayName = userData.name.trim();
          }
          // Priorité 4: firstName + lastName
          else if (userData.firstName || userData.lastName) {
            const firstName = (userData.firstName || '').trim();
            const lastName = (userData.lastName || '').trim();
            displayName = `${firstName} ${lastName}`.trim() || displayName;
          }

          // Nettoyage final
          if (displayName === '' || displayName === 'null' || displayName === 'undefined') {
            displayName = `User_${cleanUserId.substring(0, 8)}`;
          }

          console.log(`✅ Nom d'affichage extrait: ${displayName}`);
        } catch (extractionError) {
          console.error(`❌ Erreur extraction nom pour ${cleanUserId}:`, extractionError);
          displayName = `User_${cleanUserId.substring(0, 8)}`;
        }
      } else {
        // Pas de données utilisateur - créer un nom de fallback
        displayName = `User_${cleanUserId.substring(0, 8)}`;
        console.log(`🔧 Fallback name créé: ${displayName}`);
      }

      // 5. MISE EN CACHE SÉCURISÉE
      try {
        this.userCache.set(cleanUserId, displayName);
        console.log(`📄 Mis en cache: ${cleanUserId} → ${displayName}`);
      } catch (cacheError) {
        console.error(`❌ Erreur mise en cache:`, cacheError);
        // Continuer sans cache
      }

      return displayName;

    } catch (globalError) {
      console.error(`❌ Erreur globale résolution ${userId}:`, globalError);
      
      // Fallback ultime basé sur l'ID original
      const fallbackValidation = this.validateUserId(userId);
      if (fallbackValidation.isValid) {
        return `User_${fallbackValidation.cleanId.substring(0, 8)}`;
      } else {
        return 'Utilisateur inconnu';
      }
    }
  }

  /**
   * 🔍 RÉSOUDRE UN USERID - ALIAS POUR COMPATIBILITÉ
   */
  async resolveUser(userId) {
    return this.resolveUserName(userId);
  }

  /**
   * 🔍 RÉSOUDRE PLUSIEURS USERIDS EN UNE FOIS - VERSION SÉCURISÉE
   */
  async resolveMultipleUsers(userIds) {
    const results = {};
    
    // Validation du paramètre d'entrée
    if (!userIds) {
      console.warn('⚠️ resolveMultipleUsers: userIds est null/undefined');
      return results;
    }

    // Conversion en tableau si nécessaire
    let userIdArray = [];
    try {
      if (Array.isArray(userIds)) {
        userIdArray = userIds;
      } else if (typeof userIds === 'string') {
        userIdArray = [userIds];
      } else {
        console.warn('⚠️ Type userIds non supporté:', typeof userIds);
        return results;
      }
    } catch (conversionError) {
      console.error('❌ Erreur conversion userIds:', conversionError);
      return results;
    }

    console.log(`🔍 Résolution multiple: ${userIdArray.length} utilisateurs`);

    // Résolution sécurisée un par un
    for (const userId of userIdArray) {
      try {
        const resolved = await this.resolveUserName(userId);
        const validation = this.validateUserId(userId);
        const key = validation.isValid ? validation.cleanId : String(userId);
        results[key] = resolved;
      } catch (resolveError) {
        console.error(`❌ Erreur résolution individuelle ${userId}:`, resolveError);
        const validation = this.validateUserId(userId);
        const key = validation.isValid ? validation.cleanId : String(userId);
        results[key] = 'Utilisateur inconnu';
      }
    }

    console.log(`✅ Résolution multiple terminée: ${Object.keys(results).length} résultats`);
    return results;
  }

  /**
   * 🗑️ VIDER LE CACHE
   */
  clearCache() {
    try {
      const cacheSize = this.userCache.size;
      this.userCache.clear();
      console.log(`🗑️ Cache vidé: ${cacheSize} entrées supprimées`);
    } catch (error) {
      console.error('❌ Erreur vidage cache:', error);
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DU CACHE
   */
  getCacheStats() {
    return {
      size: this.userCache.size,
      entries: Array.from(this.userCache.entries()),
      isInitialized: this.isInitialized
    };
  }

  /**
   * 🧪 TESTER LE SERVICE
   */
  async testService() {
    console.log('🧪 Test du UserResolverService...');
    
    const testCases = [
      null,
      undefined,
      '',
      'invalid-id',
      'mWMIEq89ykVCyHctfe7JweOuubz1', // ID valide d'exemple
      '3LlANr1IvlWkwKLL9iJJw36EF3d2'  // Autre ID valide
    ];

    for (const testId of testCases) {
      try {
        console.log(`\n🧪 Test: ${testId}`);
        const result = await this.resolveUserName(testId);
        console.log(`✅ Résultat: ${result}`);
      } catch (error) {
        console.error(`❌ Erreur test ${testId}:`, error);
      }
    }

    console.log('🧪 Test terminé');
  }
}

// ==========================================
// 🚀 CRÉATION ET EXPORT DE L'INSTANCE
// ==========================================

// Créer l'instance unique
const userResolverService = new UserResolverService();

// Export nommé (recommandé)
export { userResolverService };

// Export par défaut pour compatibilité
export default userResolverService;

// Exposer globalement pour debug
if (typeof window !== 'undefined') {
  window.userResolverService = userResolverService;
  console.log('🌐 UserResolverService exposé globalement pour debug');
}
