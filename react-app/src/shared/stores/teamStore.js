import { create } from 'zustand';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, deleteDoc, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  XP_REQUESTS: 'xpRequests',
  NOTIFICATIONS: 'notifications'
};

export const useTeamStore = create((set, get) => ({
  // État
  teamMembers: [],
  xpRequests: [],
  activeProjects: [],
  teamMetrics: {},
  loading: false,
  error: null,

  // Listeners pour mises à jour temps réel
  unsubscribers: [],

  /**
   * 👥 CHARGER TOUTES LES DONNÉES DE L'ÉQUIPE
   */
  loadTeamData: async () => {
    set({ loading: true, error: null });
    
    try {
      const { loadTeamMembers, loadActiveProjects, calculateTeamMetrics } = get();
      
      // Charger toutes les données en parallèle
      await Promise.all([
        loadTeamMembers(),
        loadActiveProjects()
      ]);
      
      // Calculer les métriques après chargement
      await calculateTeamMetrics();
      
      set({ loading: false });
      
    } catch (error) {
      console.error('❌ Erreur chargement données équipe:', error);
      set({ error: error.message, loading: false });
    }
  },

  /**
   * 👥 CHARGER LES MEMBRES DE L'ÉQUIPE
   */
  loadTeamMembers: async () => {
    try {
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        orderBy('lastActive', 'desc')
      );
      
      // Écoute temps réel des membres
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const members = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isOnline: doc.data().lastActive && 
                   (Date.now() - doc.data().lastActive.toMillis()) < 300000 // 5 minutes
        }));
        
        set({ teamMembers: members });
        console.log(`👥 ${members.length} membres d'équipe chargés`);
      });

      // Ajouter l'unsubscriber à la liste
      set(state => ({
        unsubscribers: [...state.unsubscribers, unsubscribe]
      }));

    } catch (error) {
      console.error('❌ Erreur chargement membres:', error);
      throw error;
    }
  },

  /**
   * 📋 CHARGER LES PROJETS ACTIFS
   */
  loadActiveProjects: async () => {
    try {
      const projectsQuery = query(
        collection(db, COLLECTIONS.PROJECTS),
        where('status', 'in', ['active', 'in_progress', 'at_risk']),
        orderBy('createdAt', 'desc')
      );
      
      // Écoute temps réel des projets
      const unsubscribe = onSnapshot(projectsQuery, async (snapshot) => {
        const projects = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const projectData = { id: doc.id, ...doc.data() };
            
            // Enrichir avec infos assigné
            if (projectData.assignedTo) {
              const assignedUser = get().teamMembers.find(m => m.id === projectData.assignedTo);
              projectData.assignedToName = assignedUser?.displayName || assignedUser?.email || 'Inconnu';
              projectData.assignedToAvatar = assignedUser?.avatar || null;
            }
            
            return projectData;
          })
        );
        
        set({ activeProjects: projects });
        console.log(`📋 ${projects.length} projets actifs chargés`);
      });

      set(state => ({
        unsubscribers: [...state.unsubscribers, unsubscribe]
      }));

    } catch (error) {
      console.error('❌ Erreur chargement projets:', error);
      throw error;
    }
  },

  /**
   * 🏆 CHARGER LES DEMANDES XP
   */
  loadXPRequests: async () => {
    try {
      const xpQuery = query(
        collection(db, COLLECTIONS.XP_REQUESTS),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const unsubscribe = onSnapshot(xpQuery, async (snapshot) => {
        const requests = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const requestData = { id: doc.id, ...doc.data() };
            
            // Enrichir avec infos utilisateur
            const user = get().teamMembers.find(m => m.id === requestData.userId);
            requestData.userName = user?.displayName || user?.email || 'Utilisateur inconnu';
            requestData.userAvatar = user?.avatar || null;
            
            return requestData;
          })
        );
        
        set({ xpRequests: requests });
        console.log(`🏆 ${requests.length} demandes XP chargées`);
      });

      set(state => ({
        unsubscribers: [...state.unsubscribers, unsubscribe]
      }));

    } catch (error) {
      console.error('❌ Erreur chargement demandes XP:', error);
      throw error;
    }
  },

  /**
   * 📊 CALCULER LES MÉTRIQUES DE L'ÉQUIPE
   */
  calculateTeamMetrics: async () => {
    try {
      const { teamMembers, activeProjects } = get();
      
      // Récupérer toutes les tâches
      const tasksSnapshot = await getDocs(collection(db, COLLECTIONS.TASKS));
      const allTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculer métriques
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length;
      const overdueTasks = allTasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = t.dueDate.toDate ? t.dueDate.toDate() : new Date(t.dueDate);
        return dueDate < new Date() && t.status !== 'completed';
      }).length;
      
      // Activité récente (simulation - dans une vraie app, cela viendrait d'une collection d'activités)
      const recentActivity = [
        {
          description: "Tâche 'Développer API' terminée",
          user: "Alice Martin",
          timestamp: "Il y a 2h",
          type: "task_completed"
        },
        {
          description: "Nouveau projet 'Refonte UI' créé",
          user: "Bob Dupont",
          timestamp: "Il y a 4h",
          type: "project_created"
        },
        {
          description: "15 XP validés pour 'Correction bugs'",
          user: "Charlie Rose",
          timestamp: "Il y a 6h",
          type: "xp_approved"
        }
      ];
      
      const metrics = {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        activeMembers: teamMembers.filter(m => m.isOnline).length,
        totalMembers: teamMembers.length,
        activeProjectsCount: activeProjects.length,
        recentActivity
      };
      
      set({ teamMetrics: metrics });
      console.log('📊 Métriques équipe calculées:', metrics);
      
    } catch (error) {
      console.error('❌ Erreur calcul métriques:', error);
    }
  },

  /**
   * ✅ VALIDER UNE DEMANDE XP
   */
  validateXPRequest: async (requestId, adminId, adminNotes = '') => {
    try {
      const requestRef = doc(db, COLLECTIONS.XP_REQUESTS, requestId);
      
      await updateDoc(requestRef, {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(),
        adminNotes: adminNotes
      });
      
      // Ici on ajouterait la logique pour attribuer les XP à l'utilisateur
      // dans le gamificationService
      
      console.log(`✅ Demande XP ${requestId} validée par ${adminId}`);
      
    } catch (error) {
      console.error('❌ Erreur validation XP:', error);
      throw error;
    }
  },

  /**
   * ❌ REJETER UNE DEMANDE XP
   */
  rejectXPRequest: async (requestId, adminId, adminNotes = '') => {
    try {
      const requestRef = doc(db, COLLECTIONS.XP_REQUESTS, requestId);
      
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedBy: adminId,
        rejectedAt: new Date(),
        adminNotes: adminNotes
      });
      
      console.log(`❌ Demande XP ${requestId} rejetée par ${adminId}`);
      
    } catch (error) {
      console.error('❌ Erreur rejet XP:', error);
      throw error;
    }
  },

  /**
   * 📝 CRÉER UNE DEMANDE XP
   */
  createXPRequest: async (userId, taskId, description, xpAmount, evidenceUrl = null) => {
    try {
      const requestData = {
        userId,
        taskId,
        description,
        xpAmount,
        evidenceUrl,
        status: 'pending',
        createdAt: new Date(),
        type: 'task_completion'
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.XP_REQUESTS), requestData);
      
      console.log(`📝 Demande XP créée: ${docRef.id}`);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Erreur création demande XP:', error);
      throw error;
    }
  },

  /**
   * 🔄 CHANGER LE STATUT D'UN MEMBRE
   */
  updateMemberStatus: async (memberId, status) => {
    try {
      const memberRef = doc(db, COLLECTIONS.USERS, memberId);
      
      await updateDoc(memberRef, {
        status: status,
        lastActive: new Date()
      });
      
      console.log(`🔄 Statut membre ${memberId} mis à jour: ${status}`);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      throw error;
    }
  },

  /**
   * 👥 ASSIGNER UN MEMBRE À UN PROJET
   */
  assignMemberToProject: async (projectId, memberId) => {
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      
      await updateDoc(projectRef, {
        assignedTo: memberId,
        updatedAt: new Date()
      });
      
      console.log(`👥 Membre ${memberId} assigné au projet ${projectId}`);
      
    } catch (error) {
      console.error('❌ Erreur assignation membre:', error);
      throw error;
    }
  },

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup: () => {
    const { unsubscribers } = get();
    unsubscribers.forEach(unsubscribe => unsubscribe());
    set({ unsubscribers: [] });
    console.log('🧹 Listeners équipe nettoyés');
  },

  /**
   * 🔄 RAFRAÎCHIR TOUTES LES DONNÉES
   */
  refreshData: async () => {
    const { loadTeamData } = get();
    await loadTeamData();
  }
}));
