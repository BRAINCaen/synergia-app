// ==========================================
// 📁 react-app/src/core/services/userResolverService.js
// CORRECTION - EXPORT MANQUANT
// ==========================================

import { db } from '../firebase.js';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

/**
 * Service de résolution des noms d'utilisateurs
 */
class UserResolverService {
  constructor() {
    this.userCache = new Map();
  }

  /**
   * Résoudre un userId en nom d'affichage  
   */
  async resolveUser(userId) {
    return this.resolveUserName(userId);
  }

  /**
   * Résoudre plusieurs userIds
   */
  async resolveUsers(userIds) {
    return this.resolveMultipleUsers(userIds);
  }

  /**
   * Résoudre un userId en nom d'affichage
   */
  async resolveUserName(userId) {
    if (!userId) return 'Utilisateur inconnu';
    
    // Vérifier le cache
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId);
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const displayName = userData.displayName || userData.email || 'Utilisateur';
        this.userCache.set(userId, displayName);
        return displayName;
      }
    } catch (error) {
      console.error('Erreur résolution utilisateur:', error);
    }

    return 'Utilisateur inconnu';
  }

  /**
   * Résoudre plusieurs userIds en une fois
   */
  async resolveMultipleUsers(userIds) {
    const results = {};
    
    for (const userId of userIds) {
      results[userId] = await this.resolveUserName(userId);
    }
    
    return results;
  }

  /**
   * Vider le cache
   */
  clearCache() {
    this.userCache.clear();
  }
}

// ✅ EXPORT CORRECT - C'ÉTAIT ÇA LE PROBLÈME !
export const userResolverService = new UserResolverService();
export default userResolverService;
