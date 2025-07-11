// ==========================================
// 📁 react-app/src/core/services/escapeGameRolesService.js
// SERVICE DE GESTION DES RÔLES ESCAPE GAME - BASÉ SUR LE PDF
// ==========================================

import { db } from '../firebase.js';
import { doc, updateDoc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';

/**
 * 🎭 RÔLES ESCAPE GAME - Basés sur le "Livret des Rôles & Quêtes de l'Équipe"
 */
export const ESCAPE_GAME_ROLES = {
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Garantir le bon état, la sécurité et la qualité d\'expérience des joueurs en assurant l\'entretien du local et la maintenance de tous les éléments de jeu.',
    permissions: ['maintenance_access', 'repair_management', 'equipment_control', 'safety_checks'],
    difficulty: 'Facile',
    taskCount: 85,
    xpMultiplier: 1.2,
    specializations: ['Bricolage', 'Électricité', 'Mécanique', 'Sécurité'],
    responsibilities: [
      'Surveiller et entretenir l\'état général des espaces',
      'Réaliser des réparations techniques sur le bâtiment',
      'Vérifier et maintenir les énigmes et mécanismes',
      'Remplacer les éléments abîmés ou défectueux',
      'Réaliser des aménagements pour optimiser les espaces'
    ]
  },
  
  REPUTATION: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Assurer une veille active sur les avis des joueurs, répondre aux commentaires, valoriser les retours positifs et proposer des actions pour renforcer l\'expérience globale.',
    permissions: ['reputation_management', 'review_access', 'customer_feedback', 'social_monitoring'],
    difficulty: 'Moyen',
    taskCount: 92,
    xpMultiplier: 1.5,
    specializations: ['Communication', 'Relation Client', 'Diplomatie', 'Analyse'],
    responsibilities: [
      'Surveiller et analyser les avis sur toutes les plateformes',
      'Répondre aux avis de manière personnalisée',
      'Inciter les joueurs à laisser des avis',
      'Identifier les tendances dans les retours',
      'Proposer des actions correctrices'
    ]
  },
  
  STOCK: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Assurer le suivi et la gestion optimale de tous les consommables, matériels et équipements nécessaires au bon fonctionnement des activités.',
    permissions: ['inventory_management', 'stock_access', 'supplier_relations', 'purchasing'],
    difficulty: 'Facile',
    taskCount: 78,
    xpMultiplier: 1.1,
    specializations: ['Logistique', 'Organisation', 'Achats', 'Inventaire'],
    responsibilities: [
      'Réaliser le suivi régulier des consommables et matériel',
      'Commander et anticiper les besoins en fournitures',
      'Élaborer et optimiser les espaces de stockage',
      'Maintenir les espaces propres et fonctionnels',
      'Organiser la gestion des déchets et le tri sélectif'
    ]
  },
  
  ORGANIZATION: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordonner, fluidifier et optimiser l\'organisation du travail au sein de l\'équipe, en assurant le suivi des plannings et le bon fonctionnement des rôles.',
    permissions: ['organization_access', 'workflow_management', 'team_coordination', 'schedule_management'],
    difficulty: 'Avancé',
    taskCount: 110,
    xpMultiplier: 1.8,
    specializations: ['Planning', 'RH', 'Coordination', 'Workflow'],
    responsibilities: [
      'Coordonner la répartition des sessions',
      'Organiser et suivre les demandes de congés',
      'Garantir la conformité du temps déclaré',
      'Préparer la validation des bulletins',
      'Suivre l\'exercice des rôles complémentaires'
    ]
  },
  
  CONTENT: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Imaginer, concevoir et mettre en place des supports visuels et contenus attractifs pour améliorer la communication interne et l\'expérience de jeu.',
    permissions: ['content_creation', 'design_access', 'visual_management', 'communication_tools'],
    difficulty: 'Moyen',
    taskCount: 95,
    xpMultiplier: 1.4,
    specializations: ['Design', 'Communication', 'Créativité', 'Digital'],
    responsibilities: [
      'Créer des supports de communication (affiches, visuels)',
      'Concevoir des contenus utiles pour l\'équipe',
      'Mettre en forme les documents des autres rôles',
      'Assurer la cohérence graphique des affichages',
      'Actualiser régulièrement les affichages'
    ]
  },
  
  MENTORING: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Accompagner les nouvelles recrues et favoriser la montée en compétence de chaque membre de l\'équipe, en organisant des temps de formation et de suivi.',
    permissions: ['training_access', 'mentoring_rights', 'onboarding_management', 'skill_development'],
    difficulty: 'Avancé',
    taskCount: 88,
    xpMultiplier: 1.7,
    specializations: ['Pédagogie', 'Formation', 'Accompagnement', 'Développement'],
    responsibilities: [
      'Accueillir et accompagner les nouveaux arrivants',
      'Organiser et animer des formations internes',
      'Être référent pour les questions de procédure',
      'Créer des supports pédagogiques',
      'Mettre en place un suivi régulier des membres'
    ]
  },
  
  PARTNERSHIPS: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développer, entretenir et faire vivre les relations avec les partenaires extérieurs tout en veillant à la visibilité en ligne de la structure.',
    permissions: ['partnership_management', 'networking_access', 'seo_management', 'external_relations'],
    difficulty: 'Expert',
    taskCount: 105,
    xpMultiplier: 2.0,
    specializations: ['Business Development', 'SEO', 'Networking', 'Partenariats'],
    responsibilities: [
      'Identifier et entretenir des relations avec les partenaires locaux',
      'Gérer les demandes de partenariats',
      'Représenter l\'entreprise lors d\'événements externes',
      'Suivre et améliorer le référencement naturel (SEO)',
      'Optimiser la vitrine numérique de premier contact'
    ]
  },
  
  COMMUNICATION: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📱',
    color: 'bg-cyan-500',
    description: 'Assurer la présence dynamique et engageante de la structure sur les réseaux sociaux, en imaginant et publiant des contenus attractifs.',
    permissions: ['social_media_access', 'communication_rights', 'content_publishing', 'community_management'],
    difficulty: 'Moyen',
    taskCount: 120,
    xpMultiplier: 1.6,
    specializations: ['Social Media', 'Community Management', 'Création Contenu', 'Communication'],
    responsibilities: [
      'Gérer les comptes sur les différents réseaux sociaux',
      'Créer et publier des contenus variés (photos, vidéos)',
      'Trouver des idées originales adaptées à l\'univers',
      'Valoriser les rôles internes et sessions',
      'Planifier les publications et maintenir une régularité'
    ]
  },
  
  B2B: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gérer et développer les relations avec les entreprises partenaires, en assurant le traitement des devis et la coordination des événements professionnels.',
    permissions: ['b2b_access', 'quote_management', 'corporate_events', 'business_development'],
    difficulty: 'Expert',
    taskCount: 115,
    xpMultiplier: 2.2,
    specializations: ['Business Development', 'Négociation', 'Événementiel', 'Commercial'],
    responsibilities: [
      'Réception et traitement des demandes de devis',
      'Élaboration de propositions commerciales adaptées',
      'Organisation des événements B2B (team building)',
      'Gestion de la logistique des prestations traiteur',
      'Entretenir un contact régulier et professionnel'
    ]
  }
};

/**
 * 🏷️ NIVEAUX DE MAÎTRISE DES RÔLES
 */
export const ROLE_MASTERY_LEVELS = {
  DEBUTANT: {
    id: 'debutant',
    name: 'Débutant',
    icon: '🌱',
    minXp: 0,
    maxXp: 249,
    color: 'text-green-500',
    description: 'Découverte du rôle'
  },
  NOVICE: {
    id: 'novice',
    name: 'Novice',
    icon: '📚',
    minXp: 250,
    maxXp: 749,
    color: 'text-blue-500',
    description: 'Apprentissage actif'
  },
  INTERMEDIAIRE: {
    id: 'intermediaire',
    name: 'Intermédiaire',
    icon: '⚡',
    minXp: 750,
    maxXp: 1499,
    color: 'text-purple-500',
    description: 'Maîtrise en développement'
  },
  AVANCE: {
    id: 'avance',
    name: 'Avancé',
    icon: '🏆',
    minXp: 1500,
    maxXp: 2999,
    color: 'text-orange-500',
    description: 'Expertise confirmée'
  },
  EXPERT: {
    id: 'expert',
    name: 'Expert',
    icon: '👑',
    minXp: 3000,
    maxXp: Infinity,
    color: 'text-yellow-500',
    description: 'Maîtrise totale'
  }
};

/**
 * 🎯 TÂCHES TYPES PAR RÔLE (basées sur le PDF)
 */
export const ROLE_TASKS = {
  maintenance: [
    { id: 'repair_mechanism', name: 'Réparer un mécanisme', xp: 15, category: 'Réparation' },
    { id: 'change_bulb', name: 'Changer une ampoule', xp: 5, category: 'Entretien' },
    { id: 'fix_lock', name: 'Réparer une serrure', xp: 10, category: 'Réparation' },
    { id: 'replace_props', name: 'Remplacer des accessoires', xp: 8, category: 'Entretien' },
    { id: 'safety_check', name: 'Vérification sécurité', xp: 12, category: 'Sécurité' }
  ],
  reputation: [
    { id: 'respond_review', name: 'Répondre à un avis', xp: 10, category: 'Communication' },
    { id: 'handle_negative', name: 'Gérer un avis négatif', xp: 20, category: 'Résolution' },
    { id: 'encourage_reviews', name: 'Inciter aux avis', xp: 8, category: 'Promotion' },
    { id: 'analyze_feedback', name: 'Analyser les retours', xp: 15, category: 'Analyse' },
    { id: 'improve_experience', name: 'Proposer une amélioration', xp: 25, category: 'Innovation' }
  ],
  stock: [
    { id: 'inventory_check', name: 'Contrôle inventaire', xp: 10, category: 'Gestion' },
    { id: 'order_supplies', name: 'Commander fournitures', xp: 12, category: 'Achats' },
    { id: 'organize_storage', name: 'Organiser stockage', xp: 15, category: 'Organisation' },
    { id: 'waste_management', name: 'Gestion déchets', xp: 8, category: 'Entretien' },
    { id: 'stock_alert', name: 'Alerte rupture stock', xp: 5, category: 'Veille' }
  ],
  organization: [
    { id: 'create_schedule', name: 'Créer planning', xp: 20, category: 'Planning' },
    { id: 'manage_leaves', name: 'Gérer congés', xp: 15, category: 'RH' },
    { id: 'validate_hours', name: 'Valider pointages', xp: 10, category: 'Suivi' },
    { id: 'organize_replacement', name: 'Organiser remplacement', xp: 18, category: 'Coordination' },
    { id: 'optimize_workflow', name: 'Optimiser workflow', xp: 25, category: 'Amélioration' }
  ],
  content: [
    { id: 'create_poster', name: 'Créer une affiche', xp: 15, category: 'Design' },
    { id: 'update_display', name: 'Mettre à jour affichage', xp: 8, category: 'Maintenance' },
    { id: 'design_signage', name: 'Créer signalétique', xp: 12, category: 'Design' },
    { id: 'qr_code', name: 'Générer QR code', xp: 5, category: 'Digital' },
    { id: 'visual_identity', name: 'Cohérence visuelle', xp: 20, category: 'Branding' }
  ],
  mentoring: [
    { id: 'welcome_new', name: 'Accueillir nouveau membre', xp: 25, category: 'Intégration' },
    { id: 'conduct_training', name: 'Organiser formation', xp: 30, category: 'Formation' },
    { id: 'create_guide', name: 'Créer guide pratique', xp: 20, category: 'Documentation' },
    { id: 'follow_progress', name: 'Suivre progression', xp: 15, category: 'Accompagnement' },
    { id: 'team_meeting', name: 'Animer réunion équipe', xp: 18, category: 'Animation' }
  ],
  partnerships: [
    { id: 'contact_partner', name: 'Contacter partenaire', xp: 15, category: 'Prospection' },
    { id: 'negotiate_deal', name: 'Négocier accord', xp: 25, category: 'Négociation' },
    { id: 'event_representation', name: 'Représenter événement', xp: 20, category: 'Représentation' },
    { id: 'seo_optimization', name: 'Optimisation SEO', xp: 18, category: 'Digital' },
    { id: 'update_listings', name: 'Mettre à jour fiches', xp: 10, category: 'Référencement' }
  ],
  communication: [
    { id: 'social_post', name: 'Publier contenu social', xp: 10, category: 'Publication' },
    { id: 'create_video', name: 'Créer vidéo', xp: 20, category: 'Création' },
    { id: 'community_engage', name: 'Animer communauté', xp: 15, category: 'Engagement' },
    { id: 'plan_content', name: 'Planifier contenu', xp: 12, category: 'Stratégie' },
    { id: 'analyze_metrics', name: 'Analyser métriques', xp: 18, category: 'Analytics' }
  ],
  b2b: [
    { id: 'create_quote', name: 'Créer devis', xp: 20, category: 'Commercial' },
    { id: 'organize_event', name: 'Organiser événement B2B', xp: 35, category: 'Événementiel' },
    { id: 'client_follow_up', name: 'Suivi client', xp: 15, category: 'Relation Client' },
    { id: 'proposal_presentation', name: 'Présenter proposition', xp: 25, category: 'Présentation' },
    { id: 'contract_negotiation', name: 'Négocier contrat', xp: 30, category: 'Négociation' }
  ]
};

/**
 * 🎮 SERVICE DE GESTION DES RÔLES ESCAPE GAME
 */
class EscapeGameRolesService {
  
  /**
   * 📋 Obtenir tous les rôles disponibles
   */
  getAllRoles() {
    return Object.values(ESCAPE_GAME_ROLES);
  }

  /**
   * 🎯 Obtenir un rôle spécifique
   */
  getRole(roleId) {
    return ESCAPE_GAME_ROLES[roleId.toUpperCase()] || null;
  }

  /**
   * 🏷️ Calculer le niveau de maîtrise d'un rôle
   */
  calculateRoleMastery(roleXp) {
    for (const level of Object.values(ROLE_MASTERY_LEVELS)) {
      if (roleXp >= level.minXp && roleXp <= level.maxXp) {
        return level;
      }
    }
    return ROLE_MASTERY_LEVELS.EXPERT; // Par défaut si XP très élevée
  }

  /**
   * 👤 Assigner un rôle à un utilisateur
   */
  async assignRole(userId, roleId, assignedBy = 'system') {
    try {
      console.log('🎭 Assignation rôle escape game:', { userId, roleId, assignedBy });
      
      if (!userId || !roleId) {
        throw new Error('userId et roleId sont requis');
      }

      const role = this.getRole(roleId);
      if (!role) {
        throw new Error(`Rôle ${roleId} introuvable. Rôles disponibles: ${Object.keys(ESCAPE_GAME_ROLES).join(', ')}`);
      }

      // Référence utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      // Récupérer ou initialiser les données
      const existingData = userDoc.exists() ? userDoc.data() : {};
      const currentRoles = existingData.roles || {};

      // Vérifier si le rôle est déjà assigné
      if (currentRoles[roleId]) {
        console.log('⚠️ Rôle déjà assigné à cet utilisateur');
        return { success: true, message: 'Rôle déjà assigné' };
      }

      // Préparer les nouvelles données de rôle
      const newRoleData = {
        id: role.id,
        name: role.name,
        assignedAt: new Date(),
        assignedBy: assignedBy,
        xp: 0,
        level: 'debutant',
        tasksCompleted: 0,
        badges: [],
        permissions: role.permissions
      };

      // Mettre à jour le document utilisateur
      await updateDoc(userRef, {
        [`roles.${roleId}`]: newRoleData,
        'profile.lastRoleUpdate': new Date()
      });

      // Déclencher l'événement d'assignation de rôle
      this.triggerRoleAssignmentEvent(userId, roleId, role);

      console.log('✅ Rôle assigné avec succès');
      
      return {
        success: true,
        roleData: newRoleData,
        message: `Rôle ${role.name} assigné avec succès`
      };

    } catch (error) {
      console.error('❌ Erreur assignation rôle:', error);
      throw error;
    }
  }

  /**
   * 🔧 Mettre à jour les XP d'un rôle
   */
  async updateRoleXP(userId, roleId, xpGained, activity = {}) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data();
      const currentRoles = userData.roles || {};
      
      if (!currentRoles[roleId]) {
        throw new Error(`Rôle ${roleId} non assigné à cet utilisateur`);
      }

      const currentRoleData = currentRoles[roleId];
      const newXP = (currentRoleData.xp || 0) + xpGained;
      const newLevel = this.calculateRoleMastery(newXP);

      // Mettre à jour les données du rôle
      await updateDoc(userRef, {
        [`roles.${roleId}.xp`]: newXP,
        [`roles.${roleId}.level`]: newLevel.id,
        [`roles.${roleId}.lastActivity`]: new Date(),
        [`roles.${roleId}.tasksCompleted`]: (currentRoleData.tasksCompleted || 0) + 1
      });

      // Si changement de niveau, déclencher un événement
      if (newLevel.id !== currentRoleData.level) {
        this.triggerLevelUpEvent(userId, roleId, newLevel);
      }

      console.log(`✅ XP rôle mis à jour: +${xpGained} XP pour ${roleId}`);
      
      return {
        success: true,
        newXP,
        newLevel,
        xpGained
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour XP rôle:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtenir les statistiques d'un utilisateur pour un rôle
   */
  async getUserRoleStats(userId, roleId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const roleData = userData.roles?.[roleId];
      
      if (!roleData) {
        return null;
      }

      const role = this.getRole(roleId);
      const masteryLevel = this.calculateRoleMastery(roleData.xp || 0);
      const availableTasks = ROLE_TASKS[roleId] || [];
      
      return {
        role,
        roleData,
        masteryLevel,
        availableTasks,
        completionRate: Math.round((roleData.tasksCompleted || 0) / availableTasks.length * 100),
        daysActive: this.calculateDaysActive(roleData.assignedAt),
        badgeCount: (roleData.badges || []).length
      };

    } catch (error) {
      console.error('❌ Erreur récupération stats rôle:', error);
      return null;
    }
  }

  /**
   * 🔔 Déclencher un événement d'assignation de rôle
   */
  triggerRoleAssignmentEvent(userId, roleId, role) {
    const event = new CustomEvent('roleAssigned', {
      detail: {
        userId,
        roleId,
        role,
        timestamp: new Date()
      }
    });
    window.dispatchEvent(event);
    console.log('🔔 Événement assignation rôle déclenché:', role.name);
  }

  /**
   * 🆙 Déclencher un événement de montée de niveau
   */
  triggerLevelUpEvent(userId, roleId, newLevel) {
    const event = new CustomEvent('roleLevelUp', {
      detail: {
        userId,
        roleId,
        newLevel,
        timestamp: new Date()
      }
    });
    window.dispatchEvent(event);
    console.log('🆙 Événement montée de niveau déclenché:', newLevel.name);
  }

  /**
   * 📅 Calculer le nombre de jours d'activité
   */
  calculateDaysActive(assignedAt) {
    if (!assignedAt) return 0;
    const now = new Date();
    const assigned = assignedAt.toDate ? assignedAt.toDate() : new Date(assignedAt);
    const diffTime = Math.abs(now - assigned);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 🎯 Obtenir les tâches disponibles pour un rôle
   */
  getAvailableTasks(roleId) {
    return ROLE_TASKS[roleId] || [];
  }

  /**
   * ✅ Marquer une tâche comme complétée
   */
  async completeTask(userId, roleId, taskId) {
    try {
      const tasks = this.getAvailableTasks(roleId);
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) {
        throw new Error(`Tâche ${taskId} non trouvée pour le rôle ${roleId}`);
      }

      // Mettre à jour les XP du rôle
      await this.updateRoleXP(userId, roleId, task.xp, {
        type: 'task_completed',
        taskId,
        taskName: task.name,
        category: task.category
      });

      // Enregistrer la tâche complétée
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`roles.${roleId}.completedTasks`]: arrayUnion({
          taskId,
          completedAt: new Date(),
          xpGained: task.xp
        })
      });

      console.log(`✅ Tâche complétée: ${task.name} (+${task.xp} XP)`);
      
      return {
        success: true,
        task,
        xpGained: task.xp
      };

    } catch (error) {
      console.error('❌ Erreur completion tâche:', error);
      throw error;
    }
  }

  /**
   * 🧪 Méthodes de test et debug
   */
  testRoleSystem(userId) {
    console.log('🧪 TEST - Système de rôles Escape Game');
    console.log('Rôles disponibles:', Object.keys(ESCAPE_GAME_ROLES));
    
    // Test d'assignation de tous les rôles
    const testRoles = ['maintenance', 'reputation', 'stock'];
    testRoles.forEach(async (roleId) => {
      try {
        const result = await this.assignRole(userId, roleId, 'test');
        console.log(`✅ Test assignation ${roleId}:`, result.success);
      } catch (error) {
        console.log(`❌ Erreur test ${roleId}:`, error.message);
      }
    });
    
    return {
      totalRoles: Object.keys(ESCAPE_GAME_ROLES).length,
      masteryLevels: Object.keys(ROLE_MASTERY_LEVELS).length,
      availableTasks: Object.keys(ROLE_TASKS).reduce((total, roleId) => {
        return total + ROLE_TASKS[roleId].length;
      }, 0)
    };
  }

  /**
   * 📋 Obtenir le tableau récapitulatif des rôles (comme dans le PDF)
   */
  getRolesSummaryTable() {
    return Object.values(ESCAPE_GAME_ROLES).map(role => ({
      id: role.id,
      name: role.name,
      icon: role.icon,
      difficulty: role.difficulty,
      taskCount: role.taskCount,
      xpMultiplier: role.xpMultiplier,
      specializations: role.specializations,
      mainResponsibilities: role.responsibilities.slice(0, 3) // Top 3
    }));
  }

  /**
   * 🎯 Recommander des rôles selon le profil utilisateur
   */
  recommendRoles(userProfile = {}) {
    const { skills = [], interests = [], experience = 'debutant' } = userProfile;
    
    const recommendations = Object.values(ESCAPE_GAME_ROLES).map(role => {
      let score = 0;
      
      // Score basé sur les compétences
      role.specializations.forEach(spec => {
        if (skills.includes(spec.toLowerCase())) {
          score += 3;
        }
      });
      
      // Score basé sur la difficulté vs expérience
      const difficultyMatch = {
        debutant: { 'Facile': 3, 'Moyen': 1, 'Avancé': 0, 'Expert': 0 },
        intermediaire: { 'Facile': 2, 'Moyen': 3, 'Avancé': 2, 'Expert': 0 },
        avance: { 'Facile': 1, 'Moyen': 2, 'Avancé': 3, 'Expert': 2 },
        expert: { 'Facile': 1, 'Moyen': 1, 'Avancé': 2, 'Expert': 3 }
      };
      
      score += difficultyMatch[experience]?.[role.difficulty] || 1;
      
      // Score basé sur les intérêts
      const roleKeywords = [
        ...role.specializations.map(s => s.toLowerCase()),
        role.name.toLowerCase(),
        ...role.responsibilities.join(' ').toLowerCase().split(' ')
      ];
      
      interests.forEach(interest => {
        if (roleKeywords.some(keyword => keyword.includes(interest.toLowerCase()))) {
          score += 2;
        }
      });
      
      return {
        role,
        score,
        matchReasons: this.getMatchReasons(role, userProfile)
      };
    });
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 recommandations
  }

  /**
   * 💡 Obtenir les raisons de correspondance pour une recommandation
   */
  getMatchReasons(role, userProfile) {
    const reasons = [];
    const { skills = [], interests = [], experience = 'debutant' } = userProfile;
    
    // Correspondances de compétences
    role.specializations.forEach(spec => {
      if (skills.includes(spec.toLowerCase())) {
        reasons.push(`Compétence en ${spec}`);
      }
    });
    
    // Correspondance de niveau
    const suitableForLevel = {
      debutant: ['Facile'],
      intermediaire: ['Facile', 'Moyen'],
      avance: ['Moyen', 'Avancé'],
      expert: ['Avancé', 'Expert']
    };
    
    if (suitableForLevel[experience]?.includes(role.difficulty)) {
      reasons.push(`Adapté à votre niveau ${experience}`);
    }
    
    // Correspondances d'intérêts
    interests.forEach(interest => {
      if (role.specializations.some(spec => 
        spec.toLowerCase().includes(interest.toLowerCase())
      )) {
        reasons.push(`Correspond à votre intérêt pour ${interest}`);
      }
    });
    
    return reasons;
  }

  /**
   * 📈 Obtenir les métriques d'équipe pour les rôles
   */
  async getTeamRoleMetrics() {
    // Cette méthode pourrait être étendue pour analyser les données de toute l'équipe
    return {
      totalRoles: Object.keys(ESCAPE_GAME_ROLES).length,
      roleDistribution: {}, // À implémenter avec de vraies données
      averageXpByRole: {}, // À implémenter
      mostActiveRoles: [], // À implémenter
      roleCompletionRates: {} // À implémenter
    };
  }

  /**
   * 🔄 Migrer depuis l'ancien système de rôles
   */
  async migrateFromOldRoleSystem(userId) {
    try {
      console.log('🔄 Migration vers le système de rôles Escape Game...');
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userDoc.data();
      const oldRoles = userData.roles || {};
      
      // Mapping des anciens rôles vers les nouveaux
      const roleMapping = {
        'game_master': 'maintenance', // Game Master -> Maintenance (le plus proche)
        'admin': 'organization', // Admin -> Organisation
        'manager': 'organization', // Manager -> Organisation
        'maintenance': 'maintenance', // Déjà correct
        'reputation': 'reputation', // Déjà correct
        'stock': 'stock', // Déjà correct
        'content': 'content', // Déjà correct
        'mentoring': 'mentoring', // Déjà correct
        'partnerships': 'partnerships', // Déjà correct
        'communication': 'communication', // Déjà correct
        'b2b': 'b2b' // Déjà correct
      };

      const migratedRoles = {};
      
      for (const [oldRoleId, oldRoleData] of Object.entries(oldRoles)) {
        const newRoleId = roleMapping[oldRoleId] || oldRoleId;
        const newRole = this.getRole(newRoleId);
        
        if (newRole) {
          migratedRoles[newRoleId] = {
            id: newRole.id,
            name: newRole.name,
            assignedAt: oldRoleData.assignedAt || new Date(),
            assignedBy: oldRoleData.assignedBy || 'migration',
            xp: oldRoleData.xp || 0,
            level: this.calculateRoleMastery(oldRoleData.xp || 0).id,
            tasksCompleted: oldRoleData.tasksCompleted || 0,
            badges: oldRoleData.badges || [],
            permissions: newRole.permissions,
            migrated: true,
            originalRole: oldRoleId
          };
        }
      }

      // Sauvegarder les rôles migrés
      await updateDoc(userRef, {
        roles: migratedRoles,
        'profile.rolesMigrated': true,
        'profile.migrationDate': new Date()
      });

      console.log('✅ Migration terminée. Rôles migrés:', Object.keys(migratedRoles));
      
      return {
        success: true,
        migratedRoles: Object.keys(migratedRoles),
        migrationCount: Object.keys(migratedRoles).length
      };

    } catch (error) {
      console.error('❌ Erreur migration rôles:', error);
      throw error;
    }
  }
}

// Instance singleton
const escapeGameRolesService = new EscapeGameRolesService();

// Export des fonctions utilitaires
export const assignEscapeGameRole = async (userId, roleId, assignedBy) => {
  return await escapeGameRolesService.assignRole(userId, roleId, assignedBy);
};

export const updateEscapeGameRoleXP = async (userId, roleId, xpGained, activity) => {
  return await escapeGameRolesService.updateRoleXP(userId, roleId, xpGained, activity);
};

export const completeEscapeGameTask = async (userId, roleId, taskId) => {
  return await escapeGameRolesService.completeTask(userId, roleId, taskId);
};

export const getEscapeGameRoleStats = async (userId, roleId) => {
  return await escapeGameRolesService.getUserRoleStats(userId, roleId);
};

export const recommendEscapeGameRoles = (userProfile) => {
  return escapeGameRolesService.recommendRoles(userProfile);
};

// Exposition globale pour debug
if (typeof window !== 'undefined') {
  window.escapeGameRolesService = escapeGameRolesService;
  window.ESCAPE_GAME_ROLES = ESCAPE_GAME_ROLES;
  window.ROLE_MASTERY_LEVELS = ROLE_MASTERY_LEVELS;
  window.ROLE_TASKS = ROLE_TASKS;
  
  // Fonctions de test rapide
  window.testEscapeGameRoles = (userId) => escapeGameRolesService.testRoleSystem(userId);
  window.assignMaintenanceRole = (userId) => assignEscapeGameRole(userId, 'maintenance', 'direct');
  window.assignReputationRole = (userId) => assignEscapeGameRole(userId, 'reputation', 'direct');
  window.migrateUserRoles = (userId) => escapeGameRolesService.migrateFromOldRoleSystem(userId);
  
  console.log('🎭 Service de rôles Escape Game chargé !');
  console.log('📋 Rôles disponibles:', Object.keys(ESCAPE_GAME_ROLES));
  console.log('🧪 Test rapide: testEscapeGameRoles(userId)');
  console.log('🔄 Migration: migrateUserRoles(userId)');
}

export default escapeGameRolesService;
