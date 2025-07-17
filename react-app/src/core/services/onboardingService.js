// ==========================================
// 📁 react-app/src/core/services/onboardingService.js
// SERVICE ONBOARDING CORRIGÉ AVEC DEBUG
// ==========================================

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';

import { db } from '../firebase.js';

// 🎯 PHASES D'INTÉGRATION BRAIN ESCAPE & QUIZ GAME
export const ONBOARDING_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '💡 Découverte de Brain & de l\'équipe',
    description: 'Première immersion dans l\'univers Brain',
    duration: 2, // en jours
    color: 'from-purple-500 to-pink-500',
    icon: '💡',
    order: 1,
    xpTotal: 50,
    badge: 'Bienvenue chez Brain !'
  },
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours client·e & expérience joueur·euse',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-blue-500 to-cyan-500',
    icon: '👥',
    order: 2,
    xpTotal: 80,
    badge: 'Ambassadeur·rice Brain'
  },
  SECURITE_PROCEDURES: {
    id: 'securite_procedures',
    name: '🔐 Sécurité, matériel & procédures',
    description: 'Sécurité et gestion du matériel',
    duration: 3,
    color: 'from-orange-500 to-red-500',
    icon: '🔐',
    order: 3,
    xpTotal: 100,
    badge: 'Gardien·ne du Temple'
  },
  FORMATION_EXPERIENCE: {
    id: 'formation_experience',
    name: '🔎 Formation par expérience',
    description: 'Maîtrise des Escape Games et Quiz Games',
    duration: 12,
    color: 'from-green-500 to-emerald-500',
    icon: '🔎',
    order: 4,
    xpTotal: 120,
    badge: 'Expert·e [Salle/Jeu]'
  },
  TACHES_QUOTIDIEN: {
    id: 'taches_quotidien',
    name: '🛠️ Tâches du quotidien & gestion',
    description: 'Autonomie dans les tâches quotidiennes',
    duration: 5,
    color: 'from-cyan-500 to-blue-500',
    icon: '🛠️',
    order: 5,
    xpTotal: 90,
    badge: 'Pilier du Quotidien'
  },
  SOFT_SKILLS: {
    id: 'soft_skills',
    name: '🌱 Soft Skills & communication',
    description: 'Développement des compétences humaines',
    duration: 7,
    color: 'from-pink-500 to-rose-500',
    icon: '🌱',
    order: 6,
    xpTotal: 70,
    badge: 'Esprit Brain'
  },
  VALIDATION_FINALE: {
    id: 'validation_finale',
    name: '🚩 Validation finale & intégration',
    description: 'Certification Game Master Brain',
    duration: 2,
    color: 'from-violet-500 to-purple-500',
    icon: '🚩',
    order: 7,
    xpTotal: 200,
    badge: 'Game Master certifié·e Brain'
  }
};

class OnboardingService {
  constructor() {
    this.FORMATION_COLLECTION = 'onboardingFormation';
    this.INTERVIEWS_COLLECTION = 'onboardingInterviews';
    console.log('🎯 OnboardingService initialisé');
  }

  /**
   * 🚀 Créer un profil de formation vide - VERSION CORRIGÉE
   */
  async createFormationProfile(userId) {
    try {
      console.log('🚀 [DEBUG] Début création profil formation pour userId:', userId);
      
      if (!userId) {
        console.error('❌ [DEBUG] userId manquant');
        return { success: false, error: 'ID utilisateur manquant' };
      }

      if (!db) {
        console.error('❌ [DEBUG] Firebase db non initialisé');
        return { success: false, error: 'Base de données non disponible' };
      }

      console.log('✅ [DEBUG] Firebase db disponible');
      console.log('✅ [DEBUG] ONBOARDING_PHASES disponibles:', Object.keys(ONBOARDING_PHASES).length);

      // Ne pas supprimer l'ancien profil, créer directement
      const formationProfile = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        startDate: new Date().toISOString(),
        completionDate: null,
        currentPhase: 'decouverte_brain',
        phases: {},
        interviews: [],
        earnedBadges: [],
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          totalXP: 0,
          earnedXP: 0,
          completionRate: 0,
          averageTaskTime: 0
        }
      };

      console.log('✅ [DEBUG] Profil de base créé');

      // Initialiser toutes les phases
      const phaseKeys = Object.keys(ONBOARDING_PHASES);
      console.log('🔧 [DEBUG] Initialisation de', phaseKeys.length, 'phases');
      
      phaseKeys.forEach(phaseKey => {
        const phase = ONBOARDING_PHASES[phaseKey];
        if (phase && phase.id) {
          formationProfile.phases[phase.id] = {
            started: false,
            completed: false,
            startDate: null,
            completionDate: null,
            tasks: {},
            notes: '',
            referentComments: ''
          };
          console.log('✅ [DEBUG] Phase initialisée:', phase.id);
        }
      });

      console.log('✅ [DEBUG] Toutes les phases initialisées');

      // Sauvegarder dans Firebase
      const docRef = doc(db, this.FORMATION_COLLECTION, userId);
      console.log('🔧 [DEBUG] Tentative de sauvegarde Firebase...');
      
      await setDoc(docRef, formationProfile);
      console.log('✅ [DEBUG] Profil formation sauvegardé avec succès');

      return { 
        success: true, 
        data: formationProfile,
        message: 'Profil de formation créé avec succès'
      };

    } catch (error) {
      console.error('❌ [DEBUG] Erreur création profil formation:', error);
      console.error('❌ [DEBUG] Stack trace:', error.stack);
      console.error('❌ [DEBUG] Message erreur:', error.message);
      
      return { 
        success: false, 
        error: `Erreur création profil: ${error.message}`,
        details: error.stack
      };
    }
  }

  /**
   * 📊 Récupérer le profil de formation - VERSION CORRIGÉE
   */
  async getFormationProfile(userId) {
    try {
      console.log('📊 [DEBUG] Récupération profil formation pour:', userId);
      
      if (!userId) {
        console.error('❌ [DEBUG] userId manquant');
        return { success: false, error: 'ID utilisateur manquant' };
      }

      const docRef = doc(db, this.FORMATION_COLLECTION, userId);
      console.log('🔧 [DEBUG] Référence document créée');
      
      const docSnap = await getDoc(docRef);
      console.log('🔧 [DEBUG] Document récupéré, existe:', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ [DEBUG] Profil formation trouvé, phases:', Object.keys(data.phases || {}).length);
        return { success: true, data };
      } else {
        console.log('❌ [DEBUG] Profil formation non trouvé');
        return { success: false, error: 'Profil formation non trouvé' };
      }

    } catch (error) {
      console.error('❌ [DEBUG] Erreur récupération profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Toggle une tâche de formation - VERSION CORRIGÉE
   */
  async toggleTask(userId, phaseId, taskId) {
    try {
      console.log('🔄 [DEBUG] Toggle tâche:', { userId, phaseId, taskId });
      
      if (!userId || !phaseId || !taskId) {
        console.error('❌ [DEBUG] Paramètres manquants pour toggle task');
        return { success: false, error: 'Paramètres manquants' };
      }

      // Récupérer le profil actuel
      const profileResult = await this.getFormationProfile(userId);
      if (!profileResult.success) {
        console.error('❌ [DEBUG] Profil formation non trouvé pour toggle');
        return { success: false, error: 'Profil formation non trouvé' };
      }

      const profile = profileResult.data;
      const currentTask = profile.phases?.[phaseId]?.tasks?.[taskId];
      const newState = !currentTask?.completed;
      
      console.log('🔧 [DEBUG] État actuel tâche:', currentTask?.completed, '→ Nouvel état:', newState);

      // Construire le chemin de mise à jour
      const taskPath = `phases.${phaseId}.tasks.${taskId}`;
      
      const updates = {
        [`${taskPath}.completed`]: newState,
        [`${taskPath}.completionDate`]: newState ? new Date().toISOString() : null,
        [`${taskPath}.completedBy`]: newState ? userId : null,
        updatedAt: serverTimestamp()
      };

      console.log('🔧 [DEBUG] Mise à jour Firebase...');
      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);
      console.log('✅ [DEBUG] Tâche formation toggleée avec succès');
      
      return { success: true, newState };

    } catch (error) {
      console.error('❌ [DEBUG] Erreur toggle tâche formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Calculer les statistiques de formation
   */
  async calculateFormationStats(userId) {
    try {
      console.log('📊 [DEBUG] Calcul statistiques formation');
      
      const profileResult = await this.getFormationProfile(userId);
      if (!profileResult.success) {
        return { success: false, error: 'Profil formation non trouvé' };
      }

      const profile = profileResult.data;
      let totalTasks = 0;
      let completedTasks = 0;
      let totalXP = 0;
      let earnedXP = 0;
      let completedPhases = 0;

      // Parcourir toutes les phases
      Object.keys(profile.phases || {}).forEach(phaseId => {
        const phase = profile.phases[phaseId];
        const phaseInfo = Object.values(ONBOARDING_PHASES).find(p => p.id === phaseId);
        
        if (phase.completed) {
          completedPhases++;
          if (phaseInfo?.xpTotal) {
            earnedXP += phaseInfo.xpTotal;
          }
        }
        
        // Compter les tâches
        Object.keys(phase.tasks || {}).forEach(taskId => {
          totalTasks++;
          if (phase.tasks[taskId].completed) {
            completedTasks++;
          }
        });
        
        if (phaseInfo?.xpTotal) {
          totalXP += phaseInfo.xpTotal;
        }
      });

      const stats = {
        totalTasks,
        completedTasks,
        totalXP,
        earnedXP,
        completedPhases,
        totalPhases: Object.keys(ONBOARDING_PHASES).length,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      };

      // Mettre à jour les métriques dans le profil
      const updates = {
        'metrics.totalTasks': totalTasks,
        'metrics.completedTasks': completedTasks,
        'metrics.totalXP': totalXP,
        'metrics.earnedXP': earnedXP,
        'metrics.completionRate': stats.completionRate,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, this.FORMATION_COLLECTION, userId), updates);

      console.log('✅ [DEBUG] Statistiques formation calculées');
      return { success: true, stats };

    } catch (error) {
      console.error('❌ [DEBUG] Erreur calcul statistiques formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ Supprimer le profil de formation
   */
  async deleteFormationProfile(userId) {
    try {
      console.log('🗑️ [DEBUG] Suppression profil formation pour:', userId);
      
      await deleteDoc(doc(db, this.FORMATION_COLLECTION, userId));
      console.log('✅ [DEBUG] Profil formation supprimé');
      return { success: true };

    } catch (error) {
      console.error('❌ [DEBUG] Erreur suppression profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧪 Test de connexion Firebase
   */
  async testFirebaseConnection() {
    try {
      console.log('🧪 [DEBUG] Test connexion Firebase...');
      
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { 
        test: true, 
        timestamp: serverTimestamp(),
        userId: 'test'
      });
      
      console.log('✅ [DEBUG] Firebase fonctionne correctement');
      
      // Nettoyer le document de test
      await deleteDoc(testDoc);
      
      return { success: true };
    } catch (error) {
      console.error('❌ [DEBUG] Erreur connexion Firebase:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton
export const onboardingService = new OnboardingService();
export default onboardingService;

// Exposer pour debug dans la console
if (typeof window !== 'undefined') {
  window.onboardingService = onboardingService;
  window.testFirebase = () => onboardingService.testFirebaseConnection();
}

console.log('✅ OnboardingService corrigé chargé avec debug complet');
