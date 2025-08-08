// ==========================================
// 📁 react-app/src/core/services/profileService.js
// SERVICE PROFIL - VERSION AMÉLIORÉE POUR SETTINGS
// ==========================================

import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
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
      
      // Vérifier si le document existe
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('📄 Document utilisateur n\'existe pas, création...');
        // Créer le document avec les données de base
        await setDoc(userRef, {
          uid: userId,
          displayName: updates.displayName || 'Utilisateur',
          bio: updates.bio || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: {
            bio: updates.bio || '',
            department: updates.department || ''
          }
        });
      } else {
        // Mettre à jour le document existant
        const updateData = {
          updatedAt: new Date(),
          ...(updates.displayName !== undefined && { displayName: updates.displayName }),
          ...(updates.bio !== undefined && { 'profile.bio': updates.bio }),
          ...(updates.department !== undefined && { 'profile.department': updates.department })
        };

        await updateDoc(userRef, updateData);
      }
      
      console.log('✅ Profil mis à jour avec succès dans Firebase');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour profil Firebase:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les préférences utilisateur
   */
  async updateUserPreferences(userId, preferences) {
    try {
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }

      console.log('🔄 Mise à jour préférences pour:', userId);
      console.log('⚙️ Préférences:', preferences);

      const userRef = doc(db, 'users', userId);
      
      // Vérifier si le document existe
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Créer le document avec les préférences
        await setDoc(userRef, {
          uid: userId,
          preferences: preferences,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Mettre à jour les préférences
        await updateDoc(userRef, {
          preferences: preferences,
          updatedAt: new Date()
        });
      }
      
      console.log('✅ Préférences mises à jour avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour préférences:', error);
      throw error;
    }
  }

  /**
   * Récupérer le profil complet d'un utilisateur
   */
  async getUserProfile(userId) {
    try {
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() };
      } else {
        console.log('📄 Profil utilisateur non trouvé');
        return { success: false, data: null };
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
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
   * Initialiser un profil utilisateur avec des valeurs par défaut
   */
  async initializeUserProfile(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      const defaultProfile = {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
        photoURL: userData.photoURL || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        
        profile: {
          bio: '',
          department: '',
          phone: '',
          location: ''
        },
        
        preferences: {
          notifications: {
            email: true,
            push: true,
            mentions: true,
            taskReminders: true,
            weeklyReport: true
          },
          interface: {
            darkMode: true,
            language: 'fr',
            soundEffects: true,
            animations: true,
            compactMode: false
          },
          gamification: {
            showXP: true,
            showBadges: true,
            publicProfile: true,
            leaderboardVisible: true
          },
          privacy: {
            profileVisibility: 'public',
            activityVisibility: 'friends',
            analyticsSharing: false
          }
        },
        
        gamification: {
          totalXp: 0,
          level: 1,
          badges: [],
          tasksCompleted: 0,
          loginStreak: 1,
          lastLoginDate: new Date().toISOString().split('T')[0]
        }
      };

      await setDoc(userRef, defaultProfile);
      console.log('✅ Profil utilisateur initialisé');
      return { success: true, data: defaultProfile };
      
    } catch (error) {
      console.error('❌ Erreur initialisation profil:', error);
      throw error;
    }
  }
}

// Export instance singleton
const profileService = new ProfileService();
export default profileService;
