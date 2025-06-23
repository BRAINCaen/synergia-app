// ==========================================
// 📁 react-app/src/shared/services/projectService.js
// Service Firebase pour la gestion des projets
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
import { db } from '../../core/firebase.js';

export class ProjectService {
  
  // ==========================================
  // 📋 CRUD OPÉRATIONS
  // ==========================================

  /**
   * Créer un nouveau projet
   */
  static async createProject(projectData, userId) {
    try {
      console.log('📝 Création nouveau projet:', projectData.name);

      const newProject = {
        ...projectData,
        createdBy: userId,
        members: [userId], // Le créateur est automatiquement membre
        progress: {
          completed: 0,
          total: 0,
          percentage: 0
        },
        stats: {
          tasksCompleted: 0,
          totalTasks: 0,
          xpEarned: 0,
          activeDays: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      
      console.log('✅ Projet créé avec ID:', docRef.id);
      
      // Retourner le projet avec son ID
      return {
        id: docRef.id,
        ...newProject,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur création projet:', error);
      throw new Error(`Erreur lors de la création du projet: ${error.message}`);
    }
  }

  /**
   * Mettre à jour un projet
   */
  static async updateProject(projectId, updateData, userId) {
    try {
      console.log('🔄 Mise à jour projet:', projectId);

      const projectRef = doc(db, 'projects', projectId);
      
      // Vérifier que l'utilisateur a le droit de modifier
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();
      if (projectData.createdBy !== userId && !projectData.members?.includes(userId)) {
        throw new Error('Vous n\'avez pas les droits pour modifier ce projet');
      }

      const updates = {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastModifiedBy: userId
      };

      await updateDoc(projectRef, updates);
      
      console.log('✅ Projet mis à jour:', projectId);
      
      return {
        id: projectId,
        ...projectData,
        ...updates,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur mise à jour projet:', error);
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  /**
   * Supprimer un projet
   */
  static async deleteProject(projectId, userId) {
    try {
      console.log('🗑️ Suppression projet:', projectId);

      const projectRef = doc(db, 'projects', projectId);
      
      // Vérifier les droits
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();
      if (projectData.createdBy !== userId) {
        throw new Error('Seul le créateur peut supprimer ce projet');
      }

      await deleteDoc(projectRef);
      
      console.log('✅ Projet supprimé:', projectId);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression projet:', error);
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Récupérer un projet par ID
   */
  static async getProject(projectId) {
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      return {
        id: projectDoc.id,
        ...projectDoc.data()
      };
    } catch (error) {
      console.error('❌ Erreur récupération projet:', error);
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  // ==========================================
  // 📊 RÉCUPÉRATION DE DONNÉES
  // ==========================================

  /**
   * Récupérer tous les projets d'un utilisateur
   */
  static async getUserProjects(userId) {
    try {
      console.log('📊 Récupération projets utilisateur:', userId);

      // Query pour les projets où l'utilisateur est membre ou créateur
      const projectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(projectsQuery);
      const projects = [];

      querySnapshot.forEach((doc) => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${projects.length} projets récupérés`);
      return projects;
    } catch (error) {
      console.error('❌ Erreur récupération projets:', error);
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  /**
   * Récupérer les projets par statut
   */
  static async getProjectsByStatus(userId, status) {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', userId),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(projectsQuery);
      const projects = [];

      querySnapshot.forEach((doc) => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return projects;
    } catch (error) {
      console.error('❌ Erreur récupération projets par statut:', error);
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  // ==========================================
  // 👥 GESTION DES MEMBRES
  // ==========================================

  /**
   * Ajouter un membre au projet
   */
  static async addMember(projectId, userId, memberEmail, currentUserId) {
    try {
      console.log('👥 Ajout membre au projet:', projectId);

      const projectRef = doc(db, 'projects', projectId);
      
      // Vérifier les droits
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();
      if (projectData.createdBy !== currentUserId && !projectData.members?.includes(currentUserId)) {
        throw new Error('Vous n\'avez pas les droits pour ajouter des membres');
      }

      // TODO: Résoudre l'email vers un userId (nécessite une collection users)
      // Pour l'instant, on assume que memberEmail est en fait un userId
      const memberUserId = memberEmail; // Placeholder

      await updateDoc(projectRef, {
        members: arrayUnion(memberUserId),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Membre ajouté au projet');
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout membre:', error);
      throw new Error(`Erreur lors de l'ajout du membre: ${error.message}`);
    }
  }

  /**
   * Retirer un membre du projet
   */
  static async removeMember(projectId, memberUserId, currentUserId) {
    try {
      console.log('👥 Retrait membre du projet:', projectId);

      const projectRef = doc(db, 'projects', projectId);
      
      // Vérifier les droits
      const projectDoc = await getDoc(projectRef);
      if (!projectDoc.exists()) {
        throw new Error('Projet introuvable');
      }

      const projectData = projectDoc.data();
      if (projectData.createdBy !== currentUserId) {
        throw new Error('Seul le créateur peut retirer des membres');
      }

      // Ne pas permettre de retirer le créateur
      if (memberUserId === projectData.createdBy) {
        throw new Error('Le créateur ne peut pas être retiré du projet');
      }

      await updateDoc(projectRef, {
        members: arrayRemove(memberUserId),
        updatedAt: serverTimestamp()
      });

      console.log('✅ Membre retiré du projet');
      return true;
    } catch (error) {
      console.error('❌ Erreur retrait membre:', error);
      throw new Error(`Erreur lors du retrait du membre: ${error.message}`);
    }
  }

  // ==========================================
  // 📊 STATISTIQUES ET PROGRESSION
  // ==========================================

  /**
   * Mettre à jour la progression du projet
   */
  static async updateProjectProgress(projectId, completed, total) {
    try {
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        'progress.completed': completed,
        'progress.total': total,
        'progress.percentage': percentage,
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Progression mise à jour: ${completed}/${total} (${percentage}%)`);
      return { completed, total, percentage };
    } catch (error) {
      console.error('❌ Erreur mise à jour progression:', error);
      throw new Error(`Erreur mise à jour progression: ${error.message}`);
    }
  }

  /**
   * Calculer les statistiques d'un projet
   */
  static async calculateProjectStats(projectId) {
    try {
      // TODO: Implémenter le calcul des stats basé sur les tâches liées
      // Pour l'instant, retourner des stats par défaut
      return {
        tasksCompleted: 0,
        totalTasks: 0,
        xpEarned: 0,
        activeDays: 0,
        avgCompletionTime: 0
      };
    } catch (error) {
      console.error('❌ Erreur calcul stats projet:', error);
      return null;
    }
  }

  // ==========================================
  // 🔄 TEMPS RÉEL
  // ==========================================

  /**
   * S'abonner aux changements des projets d'un utilisateur
   */
  static subscribeToUserProjects(userId, callback) {
    try {
      console.log('🔄 Abonnement temps réel projets:', userId);

      const projectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
        const projects = [];
        
        snapshot.forEach((doc) => {
          projects.push({
            id: doc.id,
            ...doc.data()
          });
        });

        console.log(`📡 Projets temps réel: ${projects.length} projets`);
        callback(projects);
      }, (error) => {
        console.error('❌ Erreur écoute temps réel projets:', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur abonnement projets:', error);
      return () => {}; // Fonction vide pour éviter les erreurs
    }
  }

  /**
   * S'abonner aux changements d'un projet spécifique
   */
  static subscribeToProject(projectId, callback) {
    try {
      console.log('🔄 Abonnement temps réel projet:', projectId);

      const projectRef = doc(db, 'projects', projectId);

      const unsubscribe = onSnapshot(projectRef, (doc) => {
        if (doc.exists()) {
          const projectData = {
            id: doc.id,
            ...doc.data()
          };
          console.log('📡 Projet temps réel mis à jour:', projectId);
          callback(projectData);
        } else {
          console.log('📡 Projet supprimé:', projectId);
          callback(null);
        }
      }, (error) => {
        console.error('❌ Erreur écoute projet:', error);
        callback(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur abonnement projet:', error);
      return () => {};
    }
  }
}

export default ProjectService;
