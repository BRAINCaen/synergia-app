// ==========================================
// 📁 react-app/src/core/services/projectService.js
// SERVICE DES PROJETS - MIS À JOUR AVEC VALIDATION OBLIGATOIRE
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Constantes pour les statuts des projets
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  VALIDATION_PENDING: 'validation_pending', // ✅ NOUVEAU STATUT
  COMPLETED: 'completed',
  REJECTED: 'rejected', // ✅ NOUVEAU STATUT
  CANCELLED: 'cancelled'
};

export const PROJECT_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * 📂 SERVICE DES PROJETS AVEC VALIDATION OBLIGATOIRE
 */
class ProjectService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * ✅ CRÉER UN NOUVEAU PROJET
   */
  async createProject(projectData, userId) {
    try {
      const project = {
        title: projectData.title || '',
        description: projectData.description || '',
        status: PROJECT_STATUS.ACTIVE,
        priority: projectData.priority || PROJECT_PRIORITIES.NORMAL,
        ownerId: userId,
        members: [userId], // Le créateur est automatiquement membre
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0,
        tags: projectData.tags || [],
        startDate: projectData.startDate || null,
        endDate: projectData.endDate || null,
        budget: projectData.budget || null,
        
        // 🆕 NOUVEAUX CHAMPS POUR LA VALIDATION
        requiresValidation: true, // Toujours true maintenant
        xpReward: this.calculateProjectXPReward(projectData.estimatedDuration),
        estimatedDuration: projectData.estimatedDuration || null,
        
        // Métadonnées
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        
        // Paramètres
        settings: {
          isPublic: projectData.settings?.isPublic || false,
          allowJoin: projectData.settings?.allowJoin || false,
          autoTaskValidation: false, // ✅ Validation manuelle obligatoire
          ...projectData.settings
        }
      };

      const docRef = await addDoc(collection(db, 'projects'), project);
      
      console.log('✅ Projet créé:', docRef.id, '- XP en attente de validation:', project.xpReward);
      
      return { 
        id: docRef.id, 
        ...project,
        success: true 
      };
      
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      throw error;
    }
  }

  /**
   * 📝 METTRE À JOUR UN PROJET
   */
  async updateProject(projectId, updates, userId) {
    try {
      // Vérifier les permissions
      const projectSnap = await getDoc(doc(db, 'projects', projectId));
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      if (projectData.ownerId !== userId && !projectData.members.includes(userId)) {
        throw new Error('Permissions insuffisantes');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // 🚨 NOUVELLE LOGIQUE: Pas d'XP automatique pour completion
      if (updates.status === PROJECT_STATUS.COMPLETED) {
        // ✅ Nouveau comportement: Marquer comme en validation
        updateData.status = PROJECT_STATUS.VALIDATION_PENDING;
        updateData.submittedForValidationAt = serverTimestamp();
        
        console.log('📋 Projet soumis pour validation au lieu d\'être auto-complété');
      }

      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, updateData);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      throw error;
    }
  }

  /**
   * 🎯 SOUMETTRE UN PROJET POUR VALIDATION
   */
  async submitProjectForValidation(projectId, submissionData) {
    try {
      const { 
        completionComment, 
        deliverables, 
        photoFiles,
        finalReport 
      } = submissionData;
      
      // Mettre à jour le statut du projet
      await this.updateProject(projectId, {
        status: PROJECT_STATUS.VALIDATION_PENDING,
        completionComment: completionComment,
        deliverables: deliverables || [],
        hasPhotos: !!(photoFiles && photoFiles.length > 0),
        finalReport: finalReport,
        submittedAt: serverTimestamp()
      });
      
      console.log('📝 Projet soumis pour validation:', projectId);
      
      return {
        success: true,
        message: 'Projet soumis pour validation admin',
        status: PROJECT_STATUS.VALIDATION_PENDING
      };
      
    } catch (error) {
      console.error('❌ Erreur soumission validation projet:', error);
      throw error;
    }
  }

  /**
   * ✅ VALIDER UN PROJET (Admin seulement)
   */
  async validateProject(projectId, adminId, approved, adminComment = '') {
    try {
      const updateData = {
        status: approved ? PROJECT_STATUS.COMPLETED : PROJECT_STATUS.REJECTED,
        validatedBy: adminId,
        validatedAt: serverTimestamp(),
        adminComment: adminComment,
        updatedAt: serverTimestamp()
      };
      
      if (approved) {
        updateData.completedAt = serverTimestamp();
        updateData.progress = 100; // Marquer comme 100% complété
      }
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, updateData);
      
      console.log(`✅ Projet ${approved ? 'validé' : 'rejeté'}:`, projectId);
      
      return { 
        success: true, 
        approved,
        message: `Projet ${approved ? 'validé' : 'rejeté'} avec succès`
      };
      
    } catch (error) {
      console.error('❌ Erreur validation projet:', error);
      throw error;
    }
  }

  /**
   * 🎯 CALCULER L'XP SELON LA DURÉE ESTIMÉE
   */
  calculateProjectXPReward(estimatedDuration) {
    // XP basé sur la durée en jours
    if (!estimatedDuration) return 100; // Projet standard
    
    if (estimatedDuration <= 7) return 100;      // 1 semaine
    if (estimatedDuration <= 30) return 200;     // 1 mois
    if (estimatedDuration <= 90) return 500;     // 3 mois
    if (estimatedDuration <= 180) return 1000;   // 6 mois
    return 1500; // Projets longs (6+ mois)
  }

  /**
   * 📊 OBTENIR LES PROJETS D'UN UTILISATEUR
   */
  async getUserProjects(userId) {
    try {
      const q = query(
        collection(db, 'projects'),
        where('members', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const projects = [];
      
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      
      return projects;
      
    } catch (error) {
      console.error('❌ Erreur récupération projets:', error);
      return [];
    }
  }

  /**
   * 📋 OBTENIR LES PROJETS EN ATTENTE DE VALIDATION
   */
  async getProjectsPendingValidation() {
    try {
      const q = query(
        collection(db, 'projects'),
        where('status', '==', PROJECT_STATUS.VALIDATION_PENDING),
        orderBy('submittedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const projects = [];
      
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📋 Projets en validation:', projects.length);
      return projects;
      
    } catch (error) {
      console.error('❌ Erreur récupération projets validation:', error);
      return [];
    }
  }

  /**
   * 🗑️ SUPPRIMER UN PROJET
   */
  async deleteProject(projectId, userId) {
    try {
      // Vérifier les permissions
      const projectSnap = await getDoc(doc(db, 'projects', projectId));
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      if (projectData.ownerId !== userId) {
        throw new Error('Seul le propriétaire peut supprimer ce projet');
      }
      
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      throw error;
    }
  }

  /**
   * 👥 AJOUTER UN MEMBRE AU PROJET
   */
  async addMember(projectId, userId, newMemberId) {
    try {
      // Vérifier les permissions
      const projectSnap = await getDoc(doc(db, 'projects', projectId));
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      if (projectData.ownerId !== userId) {
        throw new Error('Seul le propriétaire peut ajouter des membres');
      }
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        members: arrayUnion(newMemberId),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      throw error;
    }
  }

  /**
   * 👥 RETIRER UN MEMBRE DU PROJET
   */
  async removeMember(projectId, userId, memberToRemove) {
    try {
      // Vérifier les permissions
      const projectSnap = await getDoc(doc(db, 'projects', projectId));
      if (!projectSnap.exists()) {
        throw new Error('Projet non trouvé');
      }

      const projectData = projectSnap.data();
      if (projectData.ownerId !== userId) {
        throw new Error('Seul le propriétaire peut retirer des membres');
      }

      // Empêcher de retirer le propriétaire
      if (memberToRemove === projectData.ownerId) {
        throw new Error('Impossible de retirer le propriétaire du projet');
      }
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        members: arrayRemove(memberToRemove),
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Erreur suppression membre:', error);
      throw error;
    }
  }

  /**
   * 📊 METTRE À JOUR LA PROGRESSION AUTOMATIQUEMENT
   */
  async updateProjectProgress(projectId) {
    try {
      // Récupérer les tâches du projet
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      let totalTasks = 0;
      let completedTasks = 0;
      
      tasksSnapshot.forEach((doc) => {
        const task = doc.data();
        totalTasks++;
        if (task.status === 'completed') {
          completedTasks++;
        }
      });
      
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Mettre à jour le projet
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        progress: progress,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        updatedAt: serverTimestamp()
      });
      
      console.log(`📊 Progression projet ${projectId}: ${progress}%`);
      
      return { success: true, progress };
      
    } catch (error) {
      console.error('❌ Erreur mise à jour progression:', error);
      throw error;
    }
  }

  /**
   * 🎧 ÉCOUTER LES PROJETS EN TEMPS RÉEL
   */
  subscribeToUserProjects(userId, callback) {
    try {
      const q = query(
        collection(db, 'projects'),
        where('members', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        callback(projects);
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur écoute projets:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 🎧 ÉCOUTER LES VALIDATIONS DE PROJETS (Admin)
   */
  subscribeToValidationProjects(callback) {
    try {
      const q = query(
        collection(db, 'projects'),
        where('status', '==', PROJECT_STATUS.VALIDATION_PENDING),
        orderBy('submittedAt', 'desc')
      );

      return onSnapshot(q, (querySnapshot) => {
        const projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        callback(projects);
      });
      
    } catch (error) {
      console.error('❌ Erreur écoute validations projets:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 📊 STATISTIQUES DES PROJETS
   */
  async getProjectStats(userId) {
    try {
      const projects = await this.getUserProjects(userId);
      
      const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === PROJECT_STATUS.ACTIVE).length,
        validationPending: projects.filter(p => p.status === PROJECT_STATUS.VALIDATION_PENDING).length,
        completed: projects.filter(p => p.status === PROJECT_STATUS.COMPLETED).length,
        rejected: projects.filter(p => p.status === PROJECT_STATUS.REJECTED).length,
        
        // XP stats
        totalPotentialXP: projects.reduce((sum, project) => sum + (project.xpReward || 0), 0),
        pendingXP: projects
          .filter(p => p.status === PROJECT_STATUS.VALIDATION_PENDING)
          .reduce((sum, project) => sum + (project.xpReward || 0), 0),
        earnedXP: projects
          .filter(p => p.status === PROJECT_STATUS.COMPLETED)
          .reduce((sum, project) => sum + (project.xpReward || 0), 0)
      };
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur stats projets:', error);
      return {
        total: 0, active: 0, validationPending: 0, completed: 0, rejected: 0,
        totalPotentialXP: 0, pendingXP: 0, earnedXP: 0
      };
    }
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

// ✅ Instance singleton
const projectService = new ProjectService();

// ✅ Export multiple pour compatibilité
export { projectService };
export default projectService;
