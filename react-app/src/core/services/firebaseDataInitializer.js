// ==========================================
// 📁 react-app/src/core/services/firebaseDataInitializer.js
// SERVICE D'INITIALISATION DES DONNÉES FIREBASE
// ==========================================

import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🚀 SERVICE D'INITIALISATION DES DONNÉES FIREBASE
 * Créé automatiquement les données de base pour une nouvelle installation
 */
class FirebaseDataInitializer {
  constructor() {
    this.initialized = false;
  }

  /**
   * 🎯 INITIALISATION COMPLÈTE DE FIREBASE
   */
  async initializeFirebaseData() {
    try {
      console.log('🚀 [INIT] Début initialisation données Firebase...');
      
      // Vérifier si l'initialisation a déjà été faite
      const initDoc = await this.checkInitialization();
      if (initDoc.exists()) {
        console.log('✅ [INIT] Données déjà initialisées');
        return { success: true, message: 'Données déjà initialisées' };
      }

      // Initialiser toutes les collections
      await this.initializeBadges();
      await this.initializeProjectTemplates();
      await this.initializeTaskCategories();
      await this.initializeAppSettings();

      // Marquer l'initialisation comme terminée
      await this.markInitializationComplete();

      console.log('✅ [INIT] Initialisation Firebase terminée avec succès');
      this.initialized = true;
      
      return { success: true, message: 'Initialisation réussie' };

    } catch (error) {
      console.error('❌ [INIT] Erreur initialisation Firebase:', error);
      throw error;
    }
  }

  /**
   * 🏆 CRÉER LES BADGES DE BASE
   */
  async initializeBadges() {
    console.log('🏆 [BADGES] Création badges de base...');
    
    const badges = [
      {
        id: 'first_task',
        name: 'Première Mission',
        description: 'Complétez votre première tâche',
        icon: '🎯',
        rarity: 'common',
        xpRequired: 0,
        category: 'progression',
        conditions: { tasksCompleted: 1 },
        reward: { xp: 10, title: 'Débutant' }
      },
      {
        id: 'task_master',
        name: 'Maître des Tâches',
        description: 'Complétez 10 tâches',
        icon: '🏆',
        rarity: 'rare',
        xpRequired: 0,
        category: 'progression',
        conditions: { tasksCompleted: 10 },
        reward: { xp: 50, title: 'Expert' }
      },
      {
        id: 'team_player',
        name: 'Esprit d\'Équipe',
        description: 'Participez à 5 projets collaboratifs',
        icon: '🤝',
        rarity: 'rare',
        xpRequired: 0,
        category: 'collaboration',
        conditions: { projectsJoined: 5 },
        reward: { xp: 75, title: 'Collaborateur' }
      },
      {
        id: 'mentor',
        name: 'Mentor',
        description: 'Aidez 3 nouveaux membres',
        icon: '🎓',
        rarity: 'epic',
        xpRequired: 0,
        category: 'leadership',
        conditions: { membersHelped: 3 },
        reward: { xp: 100, title: 'Mentor' }
      },
      {
        id: 'innovator',
        name: 'Innovateur',
        description: 'Proposez 5 améliorations acceptées',
        icon: '💡',
        rarity: 'epic',
        xpRequired: 0,
        category: 'innovation',
        conditions: { improvementsAccepted: 5 },
        reward: { xp: 150, title: 'Innovateur' }
      },
      {
        id: 'legend',
        name: 'Légende Synergia',
        description: 'Atteignez le niveau 20',
        icon: '⭐',
        rarity: 'legendary',
        xpRequired: 0,
        category: 'prestige',
        conditions: { level: 20 },
        reward: { xp: 500, title: 'Légende' }
      }
    ];

    const batch = writeBatch(db);
    
    for (const badge of badges) {
      const badgeRef = doc(db, 'badges', badge.id);
      batch.set(badgeRef, {
        ...badge,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
    }

    await batch.commit();
    console.log('✅ [BADGES] Badges créés:', badges.length);
  }

  /**
   * 📂 CRÉER LES MODÈLES DE PROJETS
   */
  async initializeProjectTemplates() {
    console.log('📂 [TEMPLATES] Création modèles de projets...');
    
    const templates = [
      {
        id: 'welcome_project',
        title: 'Projet d\'Accueil Équipe',
        description: 'Intégration des nouveaux membres dans l\'équipe',
        category: 'onboarding',
        estimatedDuration: '2 weeks',
        difficulty: 'easy',
        xpReward: 100,
        tasks: [
          {
            title: 'Présentation personnelle',
            description: 'Se présenter à l\'équipe',
            xpReward: 20,
            priority: 'medium'
          },
          {
            title: 'Formation outils internes',
            description: 'Apprendre à utiliser les outils de l\'équipe',
            xpReward: 30,
            priority: 'high'
          },
          {
            title: 'Première mission guidée',
            description: 'Réaliser sa première tâche avec accompagnement',
            xpReward: 50,
            priority: 'high'
          }
        ],
        tags: ['accueil', 'formation', 'intégration']
      },
      {
        id: 'improvement_project',
        title: 'Amélioration Continue',
        description: 'Identifier et implémenter des améliorations',
        category: 'improvement',
        estimatedDuration: '1 month',
        difficulty: 'medium',
        xpReward: 200,
        tasks: [
          {
            title: 'Audit des processus actuels',
            description: 'Analyser les processus existants',
            xpReward: 40,
            priority: 'high'
          },
          {
            title: 'Propositions d\'amélioration',
            description: 'Formuler des recommandations',
            xpReward: 60,
            priority: 'high'
          },
          {
            title: 'Implémentation pilote',
            description: 'Tester les améliorations sur un périmètre restreint',
            xpReward: 100,
            priority: 'medium'
          }
        ],
        tags: ['amélioration', 'processus', 'innovation']
      }
    ];

    for (const template of templates) {
      const templateRef = doc(db, 'project_templates', template.id);
      await setDoc(templateRef, {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
    }

    console.log('✅ [TEMPLATES] Modèles créés:', templates.length);
  }

  /**
   * 🏷️ CRÉER LES CATÉGORIES DE TÂCHES
   */
  async initializeTaskCategories() {
    console.log('🏷️ [CATEGORIES] Création catégories de tâches...');
    
    const categories = [
      {
        id: 'development',
        name: 'Développement',
        description: 'Tâches de développement et technique',
        icon: '💻',
        color: '#3B82F6',
        defaultXP: 50
      },
      {
        id: 'design',
        name: 'Design',
        description: 'Création graphique et UX/UI',
        icon: '🎨',
        color: '#EC4899',
        defaultXP: 40
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Rédaction et communication',
        icon: '📝',
        color: '#10B981',
        defaultXP: 30
      },
      {
        id: 'management',
        name: 'Gestion',
        description: 'Organisation et management',
        icon: '📊',
        color: '#F59E0B',
        defaultXP: 35
      },
      {
        id: 'research',
        name: 'Recherche',
        description: 'Veille et recherche d\'information',
        icon: '🔍',
        color: '#8B5CF6',
        defaultXP: 25
      },
      {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Maintenance et support technique',
        icon: '🔧',
        color: '#6B7280',
        defaultXP: 30
      }
    ];

    for (const category of categories) {
      const categoryRef = doc(db, 'task_categories', category.id);
      await setDoc(categoryRef, {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
    }

    console.log('✅ [CATEGORIES] Catégories créées:', categories.length);
  }

  /**
   * ⚙️ CRÉER LA CONFIGURATION DE L'APPLICATION
   */
  async initializeAppSettings() {
    console.log('⚙️ [SETTINGS] Création configuration app...');
    
    const settings = {
      app: {
        name: 'Synergia',
        version: '3.5.0',
        environment: 'production',
        maintenance: false
      },
      gamification: {
        xpPerLevel: 100,
        levelMultiplier: 1.2,
        maxLevel: 50,
        bonusTypes: {
          streak: { multiplier: 1.1, description: 'Bonus séries' },
          quality: { multiplier: 1.3, description: 'Bonus qualité' },
          speed: { multiplier: 1.15, description: 'Bonus rapidité' }
        }
      },
      tasks: {
        maxAssignedPerUser: 10,
        autoAssignmentEnabled: true,
        validationRequired: true,
        defaultPriority: 'medium',
        priorities: [
          { value: 'low', label: 'Basse', color: '#10B981' },
          { value: 'medium', label: 'Moyenne', color: '#F59E0B' },
          { value: 'high', label: 'Haute', color: '#EF4444' },
          { value: 'urgent', label: 'Urgente', color: '#DC2626' }
        ]
      },
      projects: {
        maxMembersPerProject: 20,
        defaultVisibility: 'team',
        statusTypes: [
          { value: 'planning', label: 'Planification', color: '#6B7280' },
          { value: 'active', label: 'Actif', color: '#3B82F6' },
          { value: 'on_hold', label: 'En pause', color: '#F59E0B' },
          { value: 'completed', label: 'Terminé', color: '#10B981' },
          { value: 'archived', label: 'Archivé', color: '#6B7280' }
        ]
      },
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
        digestFrequency: 'daily',
        types: {
          task_assigned: { enabled: true, email: true },
          task_completed: { enabled: true, email: false },
          badge_earned: { enabled: true, email: true },
          project_update: { enabled: true, email: false }
        }
      }
    };

    const settingsRef = doc(db, 'app_settings', 'global');
    await setDoc(settingsRef, {
      ...settings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ [SETTINGS] Configuration créée');
  }

  /**
   * 👤 CRÉER UN UTILISATEUR ADMINISTRATEUR
   */
  async createAdminUser(userData) {
    console.log('👤 [ADMIN] Création utilisateur administrateur...');
    
    const adminData = {
      ...userData,
      role: 'admin',
      profile: {
        ...userData.profile,
        role: 'admin',
        department: 'Administration'
      },
      isAdmin: true,
      permissions: [
        'admin_access',
        'manage_users',
        'manage_badges',
        'validate_tasks',
        'validate_xp',
        'view_analytics',
        'manage_projects',
        'system_config',
        'manage_roles',
        'export_data'
      ],
      gamification: {
        xp: 1000,
        totalXp: 1000,
        level: 10,
        badges: ['admin_badge'],
        tasksCompleted: 0,
        loginStreak: 1
      },
      adminSince: serverTimestamp(),
      lastLogin: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, adminData);

    console.log('✅ [ADMIN] Administrateur créé:', userData.email);
    return adminData;
  }

  /**
   * 📋 CRÉER DES TÂCHES D'EXEMPLE
   */
  async createSampleTasks(creatorId) {
    console.log('📋 [SAMPLES] Création tâches d\'exemple...');
    
    const sampleTasks = [
      {
        title: 'Configurer son profil utilisateur',
        description: 'Remplir les informations de profil et ajouter une photo',
        category: 'onboarding',
        priority: 'high',
        xpReward: 25,
        estimatedHours: 0.5,
        tags: ['profil', 'configuration'],
        openToVolunteers: false,
        status: 'pending'
      },
      {
        title: 'Découvrir les fonctionnalités de Synergia',
        description: 'Explorer les différentes sections de l\'application',
        category: 'onboarding',
        priority: 'medium',
        xpReward: 30,
        estimatedHours: 1,
        tags: ['découverte', 'formation'],
        openToVolunteers: true,
        status: 'pending'
      },
      {
        title: 'Première contribution à un projet',
        description: 'Rejoindre un projet existant et apporter sa première contribution',
        category: 'collaboration',
        priority: 'medium',
        xpReward: 50,
        estimatedHours: 2,
        tags: ['projet', 'collaboration'],
        openToVolunteers: true,
        status: 'pending'
      }
    ];

    for (const taskData of sampleTasks) {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdBy: creatorId,
        assignedTo: [],
        volunteers: [],
        volunteerApplications: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('✅ [SAMPLES] Tâches d\'exemple créées:', sampleTasks.length);
  }

  /**
   * ✅ VÉRIFIER SI L'INITIALISATION A DÉJÀ ÉTÉ FAITE
   */
  async checkInitialization() {
    const initRef = doc(db, 'app_settings', 'initialization');
    return await getDoc(initRef);
  }

  /**
   * ✅ MARQUER L'INITIALISATION COMME TERMINÉE
   */
  async markInitializationComplete() {
    const initRef = doc(db, 'app_settings', 'initialization');
    await setDoc(initRef, {
      completed: true,
      completedAt: serverTimestamp(),
      version: '3.5.0',
      dataStructureVersion: '1.0'
    });
  }

  /**
   * 🔄 VÉRIFIER LA SANTÉ DE LA BASE DE DONNÉES
   */
  async checkDatabaseHealth() {
    try {
      console.log('🔄 [HEALTH] Vérification santé base de données...');
      
      const health = {
        users: 0,
        tasks: 0,
        projects: 0,
        badges: 0,
        initialized: false
      };

      // Compter les documents dans chaque collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      health.users = usersSnapshot.size;

      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      health.tasks = tasksSnapshot.size;

      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      health.projects = projectsSnapshot.size;

      const badgesSnapshot = await getDocs(collection(db, 'badges'));
      health.badges = badgesSnapshot.size;

      // Vérifier l'initialisation
      const initDoc = await this.checkInitialization();
      health.initialized = initDoc.exists();

      console.log('✅ [HEALTH] État de la base:', health);
      return health;

    } catch (error) {
      console.error('❌ [HEALTH] Erreur vérification santé:', error);
      throw error;
    }
  }

  /**
   * 🚀 INITIALISATION RAPIDE POUR DÉMONSTRATION
   */
  async quickDemo(adminUserData) {
    try {
      console.log('🚀 [DEMO] Initialisation rapide pour démonstration...');
      
      // Initialiser les données de base
      await this.initializeFirebaseData();
      
      // Créer l'utilisateur admin
      await this.createAdminUser(adminUserData);
      
      // Créer des tâches d'exemple
      await this.createSampleTasks(adminUserData.uid);
      
      console.log('✅ [DEMO] Démonstration prête!');
      return { success: true, message: 'Démonstration initialisée' };

    } catch (error) {
      console.error('❌ [DEMO] Erreur initialisation démonstration:', error);
      throw error;
    }
  }
}

// ✅ INSTANCE UNIQUE
const firebaseDataInitializer = new FirebaseDataInitializer();

// ✅ EXPORTS
export default FirebaseDataInitializer;
export { firebaseDataInitializer };
