// ==========================================
// 📁 react-app/src/core/services/onboardingSavePatch.js
// PATCH SAUVEGARDE ONBOARDING - AJOUTER À LA PAGE EXISTANTE
// ==========================================

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔧 SERVICE DE SAUVEGARDE ONBOARDING
 * Ajoute la sauvegarde Firebase à la page existante sans rien casser
 */
class OnboardingSavePatch {
  constructor() {
    this.COLLECTION = 'onboardingProgress';
    this.saveTimeout = null;
  }

  /**
   * 💾 SAUVEGARDER LA PROGRESSION
   */
  async saveProgress(userId, formationData) {
    if (!userId || !formationData) {
      console.warn('⚠️ [ONBOARDING-SAVE] Données manquantes pour sauvegarde');
      return { success: false, error: 'Données manquantes' };
    }

    try {
      console.log('💾 [ONBOARDING-SAVE] Sauvegarde progression pour:', userId);
      
      const docRef = doc(db, this.COLLECTION, userId);
      
      const dataToSave = {
        userId,
        formationData,
        lastUpdated: new Date().toISOString(),
        savedAt: serverTimestamp(),
        version: '3.5'
      };

      await setDoc(docRef, dataToSave, { merge: true });
      
      console.log('✅ [ONBOARDING-SAVE] Progression sauvegardée avec succès');
      return { success: true };
      
    } catch (error) {
      console.error('❌ [ONBOARDING-SAVE] Erreur sauvegarde:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 CHARGER LA PROGRESSION
   */
  async loadProgress(userId) {
    if (!userId) {
      console.warn('⚠️ [ONBOARDING-SAVE] UserId manquant pour chargement');
      return { success: false, error: 'UserId manquant' };
    }

    try {
      console.log('📊 [ONBOARDING-SAVE] Chargement progression pour:', userId);
      
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ [ONBOARDING-SAVE] Progression chargée depuis Firebase');
        return { 
          success: true, 
          data: data.formationData,
          lastUpdated: data.lastUpdated 
        };
      } else {
        console.log('📝 [ONBOARDING-SAVE] Aucune progression sauvegardée trouvée');
        return { success: false, error: 'Aucune sauvegarde trouvée' };
      }
      
    } catch (error) {
      console.error('❌ [ONBOARDING-SAVE] Erreur chargement:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ⚡ SAUVEGARDE AVEC DEBOUNCE
   * Évite de sauvegarder à chaque clic, attend 2 secondes après le dernier changement
   */
  saveWithDebounce(userId, formationData) {
    // Annuler la sauvegarde précédente si elle existe
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Programmer une nouvelle sauvegarde dans 2 secondes
    this.saveTimeout = setTimeout(async () => {
      await this.saveProgress(userId, formationData);
    }, 2000);

    console.log('⏱️ [ONBOARDING-SAVE] Sauvegarde programmée dans 2 secondes...');
  }

  /**
   * 🔄 SYNCHRONISER LES XP VERS LE PROFIL UTILISATEUR
   */
  async syncXpToUserProfile(userId, earnedXp, completedTasks) {
    if (!userId || earnedXp === undefined) return;

    try {
      console.log(`🔄 [ONBOARDING-SAVE] Sync XP vers profil: +${earnedXp} XP, ${completedTasks} tâches`);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentXp = userData.gamification?.totalXp || 0;
        const currentTasks = userData.gamification?.tasksCompleted || 0;
        const currentLevel = userData.gamification?.level || 1;
        
        // Calculer nouveau niveau
        const newTotalXp = currentXp + earnedXp;
        const newLevel = Math.floor(newTotalXp / 100) + 1;
        
        const updates = {
          'gamification.totalXp': newTotalXp,
          'gamification.weeklyXp': (userData.gamification?.weeklyXp || 0) + earnedXp,
          'gamification.monthlyXp': (userData.gamification?.monthlyXp || 0) + earnedXp,
          'gamification.level': newLevel,
          'gamification.tasksCompleted': currentTasks + completedTasks,
          'gamification.lastActivityAt': new Date().toISOString(),
          'syncMetadata.lastOnboardingSync': serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userRef, updates, { merge: true });
        
        console.log('✅ [ONBOARDING-SAVE] XP synchronisés vers profil utilisateur');
        return { success: true, newLevel: newLevel > currentLevel };
      }
      
    } catch (error) {
      console.error('❌ [ONBOARDING-SAVE] Erreur sync XP:', error);
    }
  }
}

// Export singleton
export const onboardingSavePatch = new OnboardingSavePatch();

// ==========================================
// 🔧 PATCH POUR LA PAGE ONBOARDING EXISTANTE
// COPIER-COLLER CETTE FONCTION DANS VOTRE ONBOARDINGPAGE.JSX
// ==========================================

/**
 * 🔧 FONCTION À AJOUTER DANS OnboardingPage.jsx
 * Remplace la fonction toggleTaskCompletion existante
 */
export const enhancedToggleTaskCompletion = (phaseId, taskId, experienceId = null) => {
  // ✅ GARDER LE CODE EXISTANT INTACT
  setFormationData(prev => {
    const newData = { ...prev };
    
    if (experienceId) {
      // Tâche dans une expérience
      const task = newData[phaseId].experiences[experienceId].tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
      }
    } else {
      // Tâche normale
      const task = newData[phaseId].tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
      }
    }
    
    // 🆕 AJOUTER LA SAUVEGARDE FIREBASE
    if (user?.uid) {
      // Calculer les XP gagnés pour cette action
      let taskXp = 0;
      let taskCompletedCount = 0;
      
      if (experienceId) {
        const task = newData[phaseId].experiences[experienceId].tasks.find(t => t.id === taskId);
        if (task?.completed) {
          taskXp = task.xp || 10;
          taskCompletedCount = 1;
        }
      } else {
        const task = newData[phaseId].tasks.find(t => t.id === taskId);
        if (task?.completed) {
          taskXp = task.xp || 10;
          taskCompletedCount = 1;
        }
      }
      
      // Sauvegarder avec debounce (attend 2 secondes après le dernier changement)
      onboardingSavePatch.saveWithDebounce(user.uid, newData);
      
      // Si tâche complétée, synchroniser les XP
      if (taskXp > 0) {
        onboardingSavePatch.syncXpToUserProfile(user.uid, taskXp, taskCompletedCount);
      }
    }
    
    return newData;
  });
};

/**
 * 🔧 HOOK À AJOUTER DANS OnboardingPage.jsx
 * Pour charger la progression au montage du composant
 */
export const useOnboardingProgressLoader = (user, setFormationData, setLoading) => {
  useEffect(() => {
    const loadSavedProgress = async () => {
      if (!user?.uid) return;
      
      console.log('📊 [ONBOARDING] Chargement progression sauvegardée...');
      
      const result = await onboardingSavePatch.loadProgress(user.uid);
      
      if (result.success && result.data) {
        console.log('✅ [ONBOARDING] Progression chargée depuis Firebase');
        setFormationData(result.data);
        
        // Afficher notification de chargement
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 10000;
          font-weight: 500;
        `;
        notification.textContent = `Progression chargée (${result.lastUpdated ? new Date(result.lastUpdated).toLocaleString() : 'récente'})`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        console.log('📝 [ONBOARDING] Aucune progression sauvegardée, démarrage nouveau');
      }
      
      setLoading(false);
    };
    
    loadSavedProgress();
  }, [user?.uid]);
};

// ==========================================
// 📋 INSTRUCTIONS D'INTÉGRATION
// ==========================================

console.log(`
🔧 INSTRUCTIONS POUR CORRIGER LA SAUVEGARDE ONBOARDING :

1. COPIER ce fichier dans : react-app/src/core/services/onboardingSavePatch.js

2. DANS OnboardingPage.jsx, AJOUTER en haut :
   import { onboardingSavePatch, enhancedToggleTaskCompletion, useOnboardingProgressLoader } from '../core/services/onboardingSavePatch.js';

3. REMPLACER la fonction toggleTaskCompletion par :
   const toggleTaskCompletion = enhancedToggleTaskCompletion;

4. AJOUTER dans le composant OnboardingPage (après les useState) :
   useOnboardingProgressLoader(user, setFormationData, setLoading);

5. AJOUTER un indicateur de sauvegarde (optionnel) :
   
   const [saveStatus, setSaveStatus] = useState('idle');
   
   // Puis afficher quelque part dans l'interface :
   {saveStatus === 'saving' && (
     <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
       💾 Sauvegarde...
     </div>
   )}

✅ RÉSULTAT : 
- Les tâches cochées seront sauvegardées automatiquement
- La progression sera rechargée au rafraîchissement
- Les XP seront synchronisés vers le profil utilisateur
- Le dashboard affichera les bonnes données
`);

export default onboardingSavePatch;
