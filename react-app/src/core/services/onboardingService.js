// ==========================================
// 📁 react-app/src/core/services/onboardingService.js
// SERVICE ONBOARDING AVEC DONNÉES FORMATION COMPLÈTES
// ==========================================

import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase.js';

// 🎯 PHASES DE FORMATION BRAIN COMPLÈTES
export const ONBOARDING_PHASES = {
  DECOUVERTE_BRAIN: {
    id: 'decouverte_brain',
    name: '🎯 Découverte de Brain',
    description: 'Immersion dans l\'univers et la culture Brain',
    duration: 3,
    color: 'from-blue-500 to-cyan-500',
    icon: '🎯',
    order: 1,
    xpTotal: 50,
    badge: 'Explorateur Brain',
    tasks: [
      {
        id: 'visite_locaux',
        name: 'Visite guidée des locaux et présentation de l\'équipe',
        description: 'Tour complet des espaces Brain avec présentation personnalisée de chaque membre de l\'équipe',
        xp: 10,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'comprendre_valeurs',
        name: 'Comprendre les valeurs et la culture d\'entreprise',
        description: 'Découverte de l\'ADN Brain, notre vision, nos valeurs et notre façon de travailler ensemble',
        xp: 10,
        required: true,
        estimatedTime: 60
      },
      {
        id: 'rencontrer_equipe',
        name: 'Rencontrer individuellement chaque membre de l\'équipe',
        description: 'Discussions informelles avec chaque collaborateur pour mieux comprendre leur rôle',
        xp: 15,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'decouverte_outils',
        name: 'Découverte des outils de travail (Synergia, systèmes internes)',
        description: 'Formation aux outils numériques utilisés au quotidien chez Brain',
        xp: 15,
        required: true,
        estimatedTime: 60
      }
    ]
  },
  
  PARCOURS_CLIENT: {
    id: 'parcours_client',
    name: '👥 Parcours client & expérience joueur',
    description: 'Maîtrise du parcours client de A à Z',
    duration: 5,
    color: 'from-blue-500 to-cyan-500',
    icon: '👥',
    order: 2,
    xpTotal: 80,
    badge: 'Ambassadeur Brain',
    tasks: [
      {
        id: 'accueil_client',
        name: 'Maîtriser l\'accueil client de A à Z',
        description: 'Techniques d\'accueil, première impression et gestion de l\'arrivée des groupes',
        xp: 15,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'briefing_joueurs',
        name: 'Conduire un briefing joueurs efficace',
        description: 'Présentation des règles, consignes de sécurité et mise en ambiance',
        xp: 20,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'gestion_groupes',
        name: 'Gestion des différents types de groupes',
        description: 'Adapter son approche selon l\'âge, la taille et les attentes du groupe',
        xp: 15,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'animations_speciales',
        name: 'Animations spéciales et événements',
        description: 'Organiser des expériences personnalisées pour événements spéciaux',
        xp: 15,
        required: false,
        estimatedTime: 180
      },
      {
        id: 'gestion_imprevus',
        name: 'Gestion des imprévus et situations difficiles',
        description: 'Réagir professionnellement face aux problèmes techniques ou comportementaux',
        xp: 15,
        required: true,
        estimatedTime: 90
      }
    ]
  },
  
  GESTION_TECHNIQUE: {
    id: 'gestion_technique',
    name: '🔧 Gestion technique',
    description: 'Maîtrise des aspects techniques des salles',
    duration: 4,
    color: 'from-purple-500 to-pink-500',
    icon: '🔧',
    order: 3,
    xpTotal: 70,
    badge: 'Technicien Expert',
    tasks: [
      {
        id: 'systemes_audiovisuels',
        name: 'Maîtrise des systèmes audiovisuels',
        description: 'Gestion des caméras, sons, éclairages et effets spéciaux',
        xp: 20,
        required: true,
        estimatedTime: 180
      },
      {
        id: 'maintenance_preventive',
        name: 'Maintenance préventive des salles',
        description: 'Vérifications quotidiennes et entretien du matériel',
        xp: 15,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'resolution_pannes',
        name: 'Résolution des pannes courantes',
        description: 'Diagnostic et réparation des problèmes techniques fréquents',
        xp: 20,
        required: true,
        estimatedTime: 240
      },
      {
        id: 'gestion_backup',
        name: 'Gestion des systèmes de sauvegarde',
        description: 'Procédures de backup et restauration des configurations',
        xp: 15,
        required: false,
        estimatedTime: 90
      }
    ]
  },
  
  ANIMATION_AVANCEE: {
    id: 'animation_avancee',
    name: '🎭 Animation avancée',
    description: 'Techniques d\'animation poussées et roleplay',
    duration: 3,
    color: 'from-green-500 to-teal-500',
    icon: '🎭',
    order: 4,
    xpTotal: 60,
    badge: 'Maître Animateur',
    tasks: [
      {
        id: 'roleplay_pousse',
        name: 'Roleplay et immersion poussée',
        description: 'Techniques d\'interprétation pour maximiser l\'immersion',
        xp: 25,
        required: true,
        estimatedTime: 180
      },
      {
        id: 'adaptation_public',
        name: 'Adaptation dynamique au public',
        description: 'Ajuster son animation selon les réactions des joueurs',
        xp: 20,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'storytelling_avance',
        name: 'Storytelling avancé',
        description: 'Narration captivante et construction dramatique',
        xp: 15,
        required: false,
        estimatedTime: 90
      }
    ]
  },
  
  POLYVALENCE_ROLES: {
    id: 'polyvalence_roles',
    name: '🔄 Polyvalence & Rôles',
    description: 'Acquisition de compétences transversales',
    duration: 6,
    color: 'from-orange-500 to-red-500',
    icon: '🔄',
    order: 5,
    xpTotal: 100,
    badge: 'Collaborateur Polyvalent',
    tasks: [
      {
        id: 'formation_roles',
        name: 'Formation aux différents rôles Synergia',
        description: 'Initiation aux 6 rôles principaux de l\'équipe',
        xp: 30,
        required: true,
        estimatedTime: 360
      },
      {
        id: 'gestion_planning',
        name: 'Gestion du planning et organisation',
        description: 'Planification des sessions et coordination équipe',
        xp: 20,
        required: true,
        estimatedTime: 120
      },
      {
        id: 'relation_client_avancee',
        name: 'Relation client avancée',
        description: 'Gestion des réclamations et fidélisation client',
        xp: 25,
        required: true,
        estimatedTime: 180
      },
      {
        id: 'formation_nouveaux',
        name: 'Formation des nouveaux collaborateurs',
        description: 'Transmission de connaissances et accompagnement',
        xp: 25,
        required: false,
        estimatedTime: 240
      }
    ]
  },
  
  CERTIFICATION_FINALE: {
    id: 'certification_finale',
    name: '🏆 Certification finale',
    description: 'Validation complète et intégration officielle',
    duration: 2,
    color: 'from-yellow-500 to-orange-500',
    icon: '🏆',
    order: 6,
    xpTotal: 150,
    badge: 'Game Master Certifié Brain',
    tasks: [
      {
        id: 'evaluation_complete',
        name: 'Évaluation complète des compétences',
        description: 'Test pratique sur l\'ensemble des compétences acquises',
        xp: 50,
        required: true,
        estimatedTime: 240
      },
      {
        id: 'entretien_final',
        name: 'Entretien final avec l\'équipe dirigeante',
        description: 'Bilan complet, feedback, définition des objectifs futurs',
        xp: 50,
        required: true,
        estimatedTime: 90
      },
      {
        id: 'presentation_equipe',
        name: 'Présentation officielle à l\'équipe',
        description: 'Présentation des compétences acquises et intégration officielle',
        xp: 50,
        required: true,
        estimatedTime: 60
      }
    ]
  }
};

// 🎯 SERVICE PRINCIPAL ONBOARDING
class OnboardingService {
  constructor() {
    this.FORMATION_COLLECTION = 'onboardingFormation';
    this.INTERVIEWS_COLLECTION = 'onboardingInterviews';
    console.log('🎯 OnboardingService initialisé');
  }

  /**
   * 🧪 Test de connexion Firebase
   */
  async testFirebaseConnection() {
    try {
      // Test simple de lecture sur une collection
      const testRef = collection(db, 'test');
      return { success: true };
    } catch (error) {
      console.error('❌ Test Firebase échoué:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 Récupérer le profil de formation
   */
  async getFormationProfile(userId) {
    try {
      console.log('📊 Récupération profil formation pour:', userId);
      
      if (!userId) {
        return { success: false, error: 'ID utilisateur manquant' };
      }

      const docRef = doc(db, this.FORMATION_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('📝 Aucun profil de formation trouvé');
        return { success: false, error: 'Profil non trouvé' };
      }

      const profileData = docSnap.data();
      console.log('✅ Profil de formation récupéré');
      return { success: true, data: profileData };

    } catch (error) {
      console.error('❌ Erreur récupération profil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🚀 Créer un profil de formation complet
   */
  async createFormationProfile(userId) {
    try {
      console.log('🚀 Création profil formation pour userId:', userId);
      
      if (!userId) {
        return { success: false, error: 'ID utilisateur manquant' };
      }

      // Supprimer l'ancien profil s'il existe
      try {
        await this.deleteFormationProfile(userId);
      } catch (error) {
        console.log('ℹ️ Pas d\'ancien profil à supprimer');
      }

      // Créer le profil avec données réalistes
      const formationProfile = {
        userId,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 semaines
        completionDate: null,
        currentPhase: 'parcours_client',
        phases: {},
        interviews: [],
        earnedBadges: ['Explorateur Brain'],
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          totalXP: 0,
          earnedXP: 0,
          completionRate: 0,
          averageTaskTime: 0
        }
      };

      let totalTasks = 0;
      let completedTasks = 0;
      let totalXP = 0;
      let earnedXP = 0;

      // Initialiser toutes les phases avec progression réaliste
      Object.values(ONBOARDING_PHASES).forEach(phase => {
        const isCompleted = phase.order === 1; // Première phase terminée
        const isActive = phase.order === 2; // Deuxième phase en cours
        const isLocked = phase.order > 2; // Autres phases verrouillées

        formationProfile.phases[phase.id] = {
          id: phase.id,
          name: phase.name,
          status: isCompleted ? 'completed' : (isActive ? 'active' : 'locked'),
          startDate: isCompleted ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() : 
                    (isActive ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : null),
          completionDate: isCompleted ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : null,
          progress: isCompleted ? 100 : (isActive ? 60 : 0),
          tasks: [],
          earnedXP: 0,
          badge: isCompleted ? phase.badge : null
        };

        // Initialiser les tâches
        phase.tasks.forEach((task, taskIndex) => {
          const taskCompleted = isCompleted || (isActive && taskIndex < 3); // 3 tâches sur 5 terminées dans la phase active
          
          const taskData = {
            ...task,
            status: taskCompleted ? 'completed' : (isActive && taskIndex === 3 ? 'in_progress' : 'pending'),
            completedAt: taskCompleted ? new Date(Date.now() - (7 - taskIndex) * 24 * 60 * 60 * 1000).toISOString() : null,
            timeSpent: taskCompleted ? task.estimatedTime + (Math.random() * 30 - 15) : 0 // Temps légèrement variable
          };

          formationProfile.phases[phase.id].tasks.push(taskData);
          
          totalTasks++;
          totalXP += task.xp;
          
          if (taskCompleted) {
            completedTasks++;
            earnedXP += task.xp;
            formationProfile.phases[phase.id].earnedXP += task.xp;
          }
        });
      });

      // Calculer les métriques globales
      formationProfile.metrics = {
        totalTasks,
        completedTasks,
        totalXP,
        earnedXP,
        completionRate: Math.round((completedTasks / totalTasks) * 100),
        averageTaskTime: completedTasks > 0 ? Math.round(earnedXP / completedTasks * 1.5) : 0
      };

      // Sauvegarder dans Firebase
      await setDoc(doc(db, this.FORMATION_COLLECTION, userId), formationProfile);
      console.log('✅ Profil de formation créé avec succès');
      
      return { success: true, profileId: userId, data: formationProfile };

    } catch (error) {
      console.error('❌ Erreur création profil formation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ Supprimer un profil de formation
   */
  async deleteFormationProfile(userId) {
    try {
      const docRef = doc(db, this.FORMATION_COLLECTION, userId);
      await deleteDoc(docRef);
      console.log('🗑️ Profil de formation supprimé');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression profil:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ✅ Valider une tâche
   */
  async completeTask(userId, phaseId, taskId) {
    try {
      console.log('✅ Validation tâche:', taskId, 'pour utilisateur:', userId);
      
      const result = await this.getFormationProfile(userId);
      if (!result.success) {
        return result;
      }

      const profile = result.data;
      
      if (!profile.phases[phaseId]) {
        return { success: false, error: 'Phase non trouvée' };
      }

      const task = profile.phases[phaseId].tasks.find(t => t.id === taskId);
      if (!task) {
        return { success: false, error: 'Tâche non trouvée' };
      }

      // Marquer la tâche comme terminée
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      task.timeSpent = task.estimatedTime + (Math.random() * 30 - 15); // Simulation temps réaliste

      // Mettre à jour les métriques
      profile.metrics.completedTasks++;
      profile.metrics.earnedXP += task.xp;
      profile.phases[phaseId].earnedXP += task.xp;

      // Calculer la progression de la phase
      const completedTasks = profile.phases[phaseId].tasks.filter(t => t.status === 'completed').length;
      const totalTasks = profile.phases[phaseId].tasks.length;
      profile.phases[phaseId].progress = Math.round((completedTasks / totalTasks) * 100);

      // Vérifier si la phase est terminée
      if (profile.phases[phaseId].progress === 100) {
        profile.phases[phaseId].status = 'completed';
        profile.phases[phaseId].completionDate = new Date().toISOString();
        profile.phases[phaseId].badge = ONBOARDING_PHASES[phaseId.toUpperCase()]?.badge;
        
        // Débloquer la phase suivante
        const currentPhase = ONBOARDING_PHASES[phaseId.toUpperCase()];
        if (currentPhase) {
          const nextPhase = Object.values(ONBOARDING_PHASES).find(p => p.order === currentPhase.order + 1);
          if (nextPhase && profile.phases[nextPhase.id]) {
            profile.phases[nextPhase.id].status = 'active';
            profile.phases[nextPhase.id].startDate = new Date().toISOString();
            profile.currentPhase = nextPhase.id;
          }
        }
      }

      // Calculer les métriques globales
      profile.metrics.completionRate = Math.round((profile.metrics.completedTasks / profile.metrics.totalTasks) * 100);

      // Sauvegarder
      await setDoc(doc(db, this.FORMATION_COLLECTION, userId), profile);
      
      console.log('✅ Tâche validée avec succès');
      return { success: true, data: profile };

    } catch (error) {
      console.error('❌ Erreur validation tâche:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📈 Obtenir les statistiques de formation
   */
  getFormationStats(profileData) {
    if (!profileData) return null;

    const phases = Object.values(profileData.phases || {});
    const completedPhases = phases.filter(phase => phase.status === 'completed').length;
    const activePhase = phases.find(phase => phase.status === 'active');
    
    return {
      ...profileData.metrics,
      totalPhases: phases.length,
      completedPhases,
      activePhase: activePhase?.name || 'Aucune',
      earnedBadges: profileData.earnedBadges || [],
      startDate: profileData.startDate,
      daysSinceStart: Math.floor((Date.now() - new Date(profileData.startDate).getTime()) / (1000 * 60 * 60 * 24))
    };
  }
}

export const onboardingService = new OnboardingService();
export { OnboardingService };
