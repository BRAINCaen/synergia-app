// ==========================================
// 📁 react-app/src/core/services/profileService.js
// Service pour la mise à jour du profil utilisateur
// ==========================================

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

class ProfileService {
  
  /**
   * Mettre à jour le profil utilisateur dans Firebase
   */
  async updateUserProfile(userId, updates) {
    try {
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }

      console.log('🔄 Mise à jour profil Firebase pour:', userId);
      console.log('📝 Données à mettre à jour:', updates);

      const userRef = doc(db, 'users', userId);
      
      // Préparer les données avec les bonnes structures
      const updateData = {
        updatedAt: new Date(),
        ...(updates.displayName && { displayName: updates.displayName }),
        ...(updates.bio !== undefined && { 'profile.bio': updates.bio }),
        ...(updates.department !== undefined && { 'profile.department': updates.department })
      };

      await updateDoc(userRef, updateData);
      
      console.log('✅ Profil mis à jour avec succès dans Firebase');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour profil Firebase:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour l'avatar utilisateur
   */
  async updateUserAvatar(userId, photoURL) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        photoURL,
        updatedAt: new Date()
      });
      
      console.log('✅ Avatar utilisateur mis à jour');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour avatar:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les préférences utilisateur
   */
  async updateUserPreferences(userId, preferences) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences': preferences,
        updatedAt: new Date()
      });
      
      console.log('✅ Préférences utilisateur mises à jour');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour préférences:', error);
      throw error;
    }
  }
}

// Export instance singleton
const profileService = new ProfileService();
export default profileService;
