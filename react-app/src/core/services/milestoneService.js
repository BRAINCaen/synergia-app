// ==========================================
// 📁 react-app/src/core/services/milestoneService.js
// SERVICE GESTION JALONS ET TIMELINE - NOUVEAU
// ==========================================

import { 
  doc, 
  getDoc,
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Constantes pour les jalons
export const MILESTONE_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled'
};

export const MILESTONE_TYPES = {
  DEADLINE: 'deadline',
  DELIVERABLE: 'deliverable',
  REVIEW: 'review',
  LAUNCH: 'launch',
  CHECKPOINT: 'checkpoint'
};

/**
 * 🎯 SERVICE DE GESTION DES JALONS ET TIMELINE
 */
class MilestoneService {
  constructor() {
    this.listeners = new Map();
    console.log('🎯 MilestoneService initialisé');
  }

  /**
   * ✅ CRÉER UN JALON
   */
  async createMilestone(projectId, milestoneData, createdBy) {
    try {
      console.log('✅ Création jalon pour projet:', projectId);
      
      const milestone = {
        id: `milestone_${Date.now()}`,
        title: milestoneData.title,
        description: milestoneData.description || '',
        type: milestoneData.type || MILESTONE_TYPES.CHECKPOINT,
        status: MILESTONE_STATUS.UPCOMING,
        
        // Dates importantes
        dueDate: milestoneData.dueDate,
        startDate: milestoneData.startDate || null,
        completedDate: null,
        
        // Critères et objectifs
        criteria: milestoneData.criteria || [],
        objectives: milestoneData.objectives || [],
        deliverables: milestoneData.deliverables || [],
        
        // Progression et métriques
        progress: 0,
        tasksLinked: [],
        completedTasks: 0,
        totalTasks: 0,
        
        // XP et récompenses
        xpReward: milestoneData.xpReward || this.calculateMilestoneXP(milestoneData),
        bonusXp: milestoneData.bonusXp || 0,
        
        // Assignation
        assignedTo: milestoneData.assignedTo || [],
        responsibleUserId: milestoneData.responsibleUserId || createdBy,
        
        // Priorité et importance
        priority: milestoneData.priority || 'normal',
        isCritical: milestoneData.isCritical || false,
        
        // Métadonnées
        createdAt: serverTimestamp(),
        createdBy: createdBy,
        updatedAt: serverTimestamp(),
        
        // Commentaires et activités
        comments: [],
        activities: []
      };
      
      // Ajouter le jalon au projet
      await updateDoc(doc(db, 'projects', projectId), {
        milestones: arrayUnion(milestone),
        updatedAt: serverTimestamp()
      });
      
      // Ajouter une activité au projet
      await this.addMilestoneActivity(projectId, milestone.id, {
        type: 'milestone_created',
        userId: createdBy,
        description: `Jalon "${milestone.title}" créé`
      });
      
      console.log('✅ Jalon créé avec succès:', milestone.id);
      return milestone;
      
    } catch (error) {
      console.error('❌ Erreur création jalon:', error);
      throw error;
    }
  }

  /**
   * 🔄 METTRE À JOUR UN JALON
   */
  async updateMilestone(projectId, milestoneId, updates, updatedBy) {
    try {
      console.log('🔄 Mise à jour jalon:', milestoneId);
      
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const updatedMilestones = projectData.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          return {
            ...milestone,
            ...updates,
            updatedAt: serverTimestamp(),
            lastUpdatedBy: updatedBy
          };
        }
        return milestone;
      });
      
      await updateDoc(doc(db, 'projects', projectId), {
        milestones: updatedMilestones,
        updatedAt: serverTimestamp()
      });
      
      // Ajouter une activité
      await this.addMilestoneActivity(projectId, milestoneId, {
        type: 'milestone_updated',
        userId: updatedBy,
        description: `Jalon mis à jour`,
        details: updates
      });
      
      console.log('✅ Jalon mis à jour avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour jalon:', error);
      throw error;
    }
  }

  /**
   * ✅ MARQUER UN JALON COMME TERMINÉ
   */
  async completeMilestone(projectId, milestoneId, completedBy, completionData = {}) {
    try {
      console.log('✅ Finalisation jalon:', milestoneId);
      
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const milestone = projectData.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Jalon non trouvé');
      }
      
      // Calculer l'XP bonus si terminé en avance
      const isEarly = milestone.dueDate && new Date() < new Date(milestone.dueDate);
      const bonusXp = isEarly ? Math.round(milestone.xpReward * 0.2) : 0;
      
      const updates = {
        status: MILESTONE_STATUS.COMPLETED,
        completedDate: serverTimestamp(),
        completedBy: completedBy,
        progress: 100,
        actualDuration: this.calculateDuration(milestone.startDate, new Date()),
        earlyCompletion: isEarly,
        bonusXpEarned: bonusXp,
        completionNotes: completionData.notes || '',
        completionProof: completionData.proof || []
      };
      
      await this.updateMilestone(projectId, milestoneId, updates, completedBy);
      
      // Distribuer l'XP à l'équipe
      await this.distributeMilestoneXP(projectId, milestone, bonusXp);
      
      // Ajouter activité de completion
      await this.addMilestoneActivity(projectId, milestoneId, {
        type: 'milestone_completed',
        userId: completedBy,
        description: `Jalon "${milestone.title}" terminé${isEarly ? ' en avance' : ''}`,
        details: {
          xpEarned: milestone.xpReward + bonusXp,
          bonusXp: bonusXp,
          isEarly: isEarly
        }
      });
      
      console.log('🎉 Jalon terminé avec succès !');
      return { success: true, xpEarned: milestone.xpReward + bonusXp };
      
    } catch (error) {
      console.error('❌ Erreur finalisation jalon:', error);
      throw error;
    }
  }

  /**
   * 🔗 LIER UNE TÂCHE À UN JALON
   */
  async linkTaskToMilestone(projectId, milestoneId, taskId, linkedBy) {
    try {
      console.log('🔗 Liaison tâche au jalon:', { milestoneId, taskId });
      
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const updatedMilestones = projectData.milestones.map(milestone => {
        if (milestone.id === milestoneId) {
          const updatedTasks = [...(milestone.tasksLinked || []), taskId];
          return {
            ...milestone,
            tasksLinked: updatedTasks,
            totalTasks: updatedTasks.length,
            updatedAt: serverTimestamp()
          };
        }
        return milestone;
      });
      
      await updateDoc(doc(db, 'projects', projectId), {
        milestones: updatedMilestones,
        updatedAt: serverTimestamp()
      });
      
      // Recalculer la progression du jalon
      await this.updateMilestoneProgress(projectId, milestoneId);
      
      console.log('✅ Tâche liée au jalon avec succès');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur liaison tâche-jalon:', error);
      throw error;
    }
  }

  /**
   * 📊 METTRE À JOUR LA PROGRESSION D'UN JALON
   */
  async updateMilestoneProgress(projectId, milestoneId) {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const milestone = projectData.milestones.find(m => m.id === milestoneId);
      if (!milestone || !milestone.tasksLinked) return;
      
      // Récupérer le statut des tâches liées
      // Note: Ici on simule, dans un vrai cas il faudrait interroger la collection tasks
      const totalTasks = milestone.tasksLinked.length;
      const completedTasks = milestone.completedTasks || 0; // À calculer depuis les vraies tâches
      
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Déterminer le statut basé sur la progression
      let status = milestone.status;
      if (progress === 100 && status !== MILESTONE_STATUS.COMPLETED) {
        status = MILESTONE_STATUS.COMPLETED;
      } else if (progress > 0 && status === MILESTONE_STATUS.UPCOMING) {
        status = MILESTONE_STATUS.ACTIVE;
      }
      
      // Vérifier si en retard
      const now = new Date();
      const dueDate = milestone.dueDate ? new Date(milestone.dueDate) : null;
      if (dueDate && now > dueDate && status !== MILESTONE_STATUS.COMPLETED) {
        status = MILESTONE_STATUS.DELAYED;
      }
      
      await this.updateMilestone(projectId, milestoneId, {
        progress: progress,
        completedTasks: completedTasks,
        status: status
      }, 'system');
      
      return progress;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour progression jalon:', error);
      return 0;
    }
  }

  /**
   * 📅 OBTENIR LA TIMELINE DU PROJET
   */
  async getProjectTimeline(projectId) {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const milestones = projectData.milestones || [];
      
      // Trier les jalons par date d'échéance
      const sortedMilestones = milestones.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date('2099-12-31');
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date('2099-12-31');
        return dateA - dateB;
      });
      
      // Créer la timeline avec informations enrichies
      const timeline = sortedMilestones.map((milestone, index) => ({
        ...milestone,
        position: index + 1,
        isNext: milestone.status === MILESTONE_STATUS.UPCOMING && index === 0,
        daysUntilDue: milestone.dueDate ? 
          Math.ceil((new Date(milestone.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
        progressPercent: milestone.progress || 0
      }));
      
      return timeline;
      
    } catch (error) {
      console.error('❌ Erreur récupération timeline:', error);
      return [];
    }
  }

  /**
   * 📊 STATISTIQUES DES JALONS
   */
  async getMilestoneStats(projectId) {
    try {
      const timeline = await this.getProjectTimeline(projectId);
      
      const stats = {
        total: timeline.length,
        completed: timeline.filter(m => m.status === MILESTONE_STATUS.COMPLETED).length,
        active: timeline.filter(m => m.status === MILESTONE_STATUS.ACTIVE).length,
        upcoming: timeline.filter(m => m.status === MILESTONE_STATUS.UPCOMING).length,
        delayed: timeline.filter(m => m.status === MILESTONE_STATUS.DELAYED).length,
        
        // Progression globale
        averageProgress: timeline.length > 0 ? 
          Math.round(timeline.reduce((sum, m) => sum + (m.progress || 0), 0) / timeline.length) : 0,
        
        // XP potentiel
        totalXpPotential: timeline.reduce((sum, m) => sum + (m.xpReward || 0), 0),
        earnedXp: timeline
          .filter(m => m.status === MILESTONE_STATUS.COMPLETED)
          .reduce((sum, m) => sum + (m.xpReward || 0) + (m.bonusXpEarned || 0), 0),
        
        // Prochaine échéance
        nextDue: timeline.find(m => m.status !== MILESTONE_STATUS.COMPLETED)?.dueDate || null
      };
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur statistiques jalons:', error);
      return {
        total: 0, completed: 0, active: 0, upcoming: 0, delayed: 0,
        averageProgress: 0, totalXpPotential: 0, earnedXp: 0, nextDue: null
      };
    }
  }

  /**
   * 🎧 ÉCOUTER LES CHANGEMENTS DE JALONS
   */
  subscribeToMilestones(projectId, callback) {
    try {
      const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (doc) => {
        if (doc.exists()) {
          const projectData = doc.data();
          callback(projectData.milestones || []);
        } else {
          callback([]);
        }
      });
      
      this.listeners.set(`milestones-${projectId}`, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur écoute jalons:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * 🎯 CALCULER L'XP D'UN JALON
   */
  calculateMilestoneXP(milestoneData) {
    let baseXp = 100; // XP de base
    
    // Bonus selon le type
    const typeMultipliers = {
      [MILESTONE_TYPES.CHECKPOINT]: 1.0,
      [MILESTONE_TYPES.DELIVERABLE]: 1.2,
      [MILESTONE_TYPES.REVIEW]: 1.1,
      [MILESTONE_TYPES.DEADLINE]: 1.3,
      [MILESTONE_TYPES.LAUNCH]: 1.5
    };
    
    baseXp *= typeMultipliers[milestoneData.type] || 1.0;
    
    // Bonus selon la priorité
    if (milestoneData.priority === 'high') baseXp *= 1.2;
    if (milestoneData.priority === 'urgent') baseXp *= 1.4;
    if (milestoneData.isCritical) baseXp *= 1.3;
    
    return Math.round(baseXp);
  }

  /**
   * 💰 DISTRIBUER L'XP DU JALON À L'ÉQUIPE
   */
  async distributeMilestoneXP(projectId, milestone, bonusXp = 0) {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.data();
      
      const team = projectData.team || [];
      const totalXp = milestone.xpReward + bonusXp;
      
      // L'XP est répartie selon le rôle et la contribution
      for (const member of team) {
        let memberXp = Math.round(totalXp * this.getMemberXpMultiplier(member.role));
        
        // Bonus pour le responsable du jalon
        if (member.userId === milestone.responsibleUserId) {
          memberXp += Math.round(totalXp * 0.1);
        }
        
        // TODO: Ici ajouter l'XP au profil de l'utilisateur via gamificationService
        console.log(`💰 Attribution ${memberXp} XP à ${member.displayName}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur distribution XP jalon:', error);
    }
  }

  /**
   * 📝 AJOUTER UNE ACTIVITÉ AU JALON
   */
  async addMilestoneActivity(projectId, milestoneId, activityData) {
    try {
      const activity = {
        id: Date.now().toString(),
        timestamp: serverTimestamp(),
        milestoneId: milestoneId,
        ...activityData
      };
      
      await updateDoc(doc(db, 'projects', projectId), {
        milestoneActivities: arrayUnion(activity)
      });
      
      return activity;
      
    } catch (error) {
      console.error('❌ Erreur ajout activité jalon:', error);
    }
  }

  /**
   * 🏆 MULTIPLICATEUR XP SELON RÔLE
   */
  getMemberXpMultiplier(role) {
    const multipliers = {
      'owner': 0.15,
      'manager': 0.15,
      'lead': 0.20,
      'contributor': 0.25,
      'observer': 0.05
    };
    
    return multipliers[role] || 0.15;
  }

  /**
   * ⏱️ CALCULER LA DURÉE
   */
  calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return null;
    
    const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Durée en jours
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

// ✅ Export de l'instance singleton
const milestoneService = new MilestoneService();

export { milestoneService };
export default milestoneService;
