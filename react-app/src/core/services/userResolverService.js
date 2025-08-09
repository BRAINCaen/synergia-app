// ==========================================
// 📁 react-app/src/core/services/userResolverService.js
// SERVICE POUR RÉSOUDRE LES NOMS DES UTILISATEURS
// ==========================================

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 👤 SERVICE DE RÉSOLUTION DES NOMS UTILISATEURS
 */
class UserResolverService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
    console.log('👤 UserResolverService initialisé');
  }

  /**
   * 🔍 RÉSOUDRE UN UTILISATEUR UNIQUE
   */
  async resolveUser(userId) {
    if (!userId || typeof userId !== 'string') {
      return {
        uid: 'unknown',
        displayName: 'Utilisateur inconnu',
        email: 'Non défini',
        initials: '??',
        photoURL: null
      };
    }

    // Vérifier le cache
    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }

    // Éviter les requêtes duplicatas
    if (this.loadingPromises.has(userId)) {
      return this.loadingPromises.get(userId);
    }

    // Créer la promesse de chargement
    const loadingPromise = this._loadUserFromFirebase(userId);
    this.loadingPromises.set(userId, loadingPromise);

    try {
      const user = await loadingPromise;
      this.cache.set(userId, user);
      return user;
    } finally {
      this.loadingPromises.delete(userId);
    }
  }

  /**
   * 🔍 RÉSOUDRE PLUSIEURS UTILISATEURS
   */
  async resolveUsers(userIds) {
    if (!Array.isArray(userIds)) {
      return [];
    }

    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    const promises = uniqueIds.map(userId => this.resolveUser(userId));
    
    return Promise.all(promises);
  }

  /**
   * 📥 CHARGER UN UTILISATEUR DEPUIS FIREBASE
   */
  async _loadUserFromFirebase(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        console.warn(`⚠️ Utilisateur ${userId} non trouvé`);
        return this._createFallbackUser(userId);
      }

      const userData = userDoc.data();
      return this._processUserData(userId, userData);

    } catch (error) {
      console.error(`❌ Erreur chargement utilisateur ${userId}:`, error);
      return this._createFallbackUser(userId);
    }
  }

  /**
   * 🎯 TRAITER LES DONNÉES UTILISATEUR
   */
  _processUserData(userId, userData) {
    let displayName = 'Utilisateur';
    let fullName = 'Utilisateur';

    // Priorité 1: Prénom + Nom du profil
    if (userData.profile?.firstName && userData.profile?.lastName) {
      fullName = `${userData.profile.firstName} ${userData.profile.lastName}`;
      displayName = fullName;
    }
    // Priorité 2: Prénom seul
    else if (userData.profile?.firstName) {
      displayName = userData.profile.firstName;
      fullName = displayName;
    }
    // Priorité 3: displayName (si ce n'est pas un nom bizarre)
    else if (userData.displayName && !this._isBadDisplayName(userData.displayName)) {
      displayName = userData.displayName;
      fullName = displayName;
    }
    // Priorité 4: Email sans domaine
    else if (userData.email) {
      const emailName = userData.email.split('@')[0];
      displayName = this._capitalizeFirstLetter(emailName);
      fullName = displayName;
    }

    // Créer les initiales
    const initials = this._createInitials(fullName);

    return {
      uid: userId,
      displayName,
      fullName,
      email: userData.email || 'Email non défini',
      initials,
      photoURL: userData.photoURL || null,
      role: userData.profile?.role || 'Membre',
      department: userData.profile?.department || null,
      isActive: userData.isActive !== false
    };
  }

  /**
   * 🚫 VÉRIFIER SI LE DISPLAYNAME EST INAPPROPRIÉ
   */
  _isBadDisplayName(displayName) {
    const badNames = [
      'Allan le BOSS',
      'BOSS',
      'googleusercontent.com'
    ];
    
    return badNames.some(badName => 
      displayName.includes(badName) || 
      displayName.toLowerCase().includes(badName.toLowerCase())
    );
  }

  /**
   * 🔤 CRÉER LES INITIALES
   */
  _createInitials(name) {
    if (!name || name === 'Utilisateur') return '??';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
  }

  /**
   * 📝 METTRE EN FORME LA PREMIÈRE LETTRE
   */
  _capitalizeFirstLetter(string) {
    if (!string) return 'Utilisateur';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * 🆘 CRÉER UN UTILISATEUR DE FALLBACK
   */
  _createFallbackUser(userId) {
    return {
      uid: userId,
      displayName: 'Utilisateur introuvable',
      fullName: 'Utilisateur introuvable',
      email: 'Email non défini',
      initials: '??',
      photoURL: null,
      role: 'Membre',
      department: null,
      isActive: false
    };
  }

  /**
   * 🔄 FORCER LE RECHARGEMENT D'UN UTILISATEUR
   */
  async reloadUser(userId) {
    this.cache.delete(userId);
    return this.resolveUser(userId);
  }

  /**
   * 🧹 NETTOYER LE CACHE
   */
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
    console.log('🧹 Cache utilisateurs nettoyé');
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DU CACHE
   */
  getCacheStats() {
    return {
      cachedUsers: this.cache.size,
      loadingPromises: this.loadingPromises.size,
      users: Array.from(this.cache.entries()).map(([id, user]) => ({
        id,
        name: user.displayName
      }))
    };
  }
}

// Instance unique
export const userResolverService = new UserResolverService();

/**
 * 🪝 HOOK REACT POUR RÉSOUDRE LES UTILISATEURS
 */
export const useUserResolver = () => {
  return {
    resolveUser: (userId) => userResolverService.resolveUser(userId),
    resolveUsers: (userIds) => userResolverService.resolveUsers(userIds),
    reloadUser: (userId) => userResolverService.reloadUser(userId),
    clearCache: () => userResolverService.clearCache(),
    getCacheStats: () => userResolverService.getCacheStats()
  };
};

export default userResolverService;
