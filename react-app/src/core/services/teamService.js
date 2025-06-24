// ==========================================
// 📁 react-app/src/core/services/teamService.js
// Service pour gérer les données équipe en temps réel
// ==========================================

import { 
  collection, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase.js';

class TeamService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
  }

  // ✅ Récupérer tous les membres de l'équipe
  async getTeamMembers(limitCount = 20) {
    if (!db) {
      return this.getMockTeamMembers();
    }

    try {
      const q = query(
        collection(db, 'users'),
        orderBy('lastActivity', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const members = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email) {
          members.push({
            id: doc.id,
            name: userData.displayName || userData.email.split('@')[0],
            email: userData.email,
            role: userData.role || 'Membre',
            department: userData.department || 'Non spécifié',
            photoURL: userData.photoURL,
            level: userData.gamification?.level || 1,
            xp: userData.gamification?.totalXp || 0,
            tasksCompleted: userData.gamification?.tasksCompleted || 0,
            badges: userData.gamification?.badges || [],
            lastActivity: userData.lastActivity,
            status: this.calculateUserStatus(userData.lastActivity),
            joinedAt: userData.createdAt || userData.metadata?.creationTime
          });
        }
      });

      return members;
    } catch (error) {
      console.error('❌ Erreur récupération équipe:', error);
      return this.getMockTeamMembers();
    }
  }

  // ✅ Récupérer les statistiques équipe
  async getTeamStats() {
    if (!db) {
      return this.getMockTeamStats();
    }

    try {
      const [members, tasks, projects] = await Promise.all([
        this.getTeamMembers(),
        this.getTeamTasks(),
        this.getTeamProjects()
      ]);

      const stats = {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'online').length,
        totalXP: members.reduce((sum, member) => sum + member.xp, 0),
        averageLevel: members.length > 0 ? 
          members.reduce((sum, member) => sum + member.level, 0) / members.length : 0,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        completionRate: tasks.length > 0 ? 
          Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Erreur calcul stats équipe:', error);
      return this.getMockTeamStats();
    }
  }

  // ✅ Récupérer les tâches de l'équipe
  async getTeamTasks(limitCount = 50) {
    if (!db) {
      return [];
    }

    try {
      const q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];

      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      return tasks;
    } catch (error) {
      console.error('❌ Erreur récupération tâches équipe:', error);
      return [];
    }
  }

  // ✅ Récupérer les projets de l'équipe
  async getTeamProjects(limitCount = 20) {
    if (!db) {
      return [];
    }

    try {
      const q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const projects = [];

      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });

      return projects;
    } catch (error) {
      console.error('❌ Erreur récupération projets équipe:', error);
      return [];
    }
  }

  // ✅ Écouter les changements équipe en temps réel
  subscribeToTeamUpdates(callback) {
    if (!db) {
      callback(this.getMockTeamData());
      return () => {};
    }

    try {
      // Écouter les utilisateurs
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('lastActivity', 'desc'),
        limit(20)
      );

      const unsubscribeUsers = onSnapshot(usersQuery, async (snapshot) => {
        try {
          const members = [];
          snapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.email) {
              members.push({
                id: doc.id,
                name: userData.displayName || userData.email.split('@')[0],
                email: userData.email,
                role: userData.role || 'Membre',
                level: userData.gamification?.level || 1,
                xp: userData.gamification?.totalXp || 0,
                tasksCompleted: userData.gamification?.tasksCompleted || 0,
                status: this.calculateUserStatus(userData.lastActivity),
                lastActivity: userData.lastActivity
              });
            }
          });

          // Récupérer aussi les stats complètes
          const stats = await this.getTeamStats();
          
          callback({
            members,
            stats,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('❌ Erreur traitement changements équipe:', error);
        }
      });

      this.listeners.set('team-updates', unsubscribeUsers);
      return unsubscribeUsers;

    } catch (error) {
      console.error('❌ Erreur abonnement équipe:', error);
      callback(this.getMockTeamData());
      return () => {};
    }
  }

  // ✅ Mettre à jour le statut d'un utilisateur
  async updateUserStatus(userId, status, activity = null) {
    if (!db) return;

    try {
      const userRef = doc(db, 'users', userId);
      const updateData = {
        status,
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (activity) {
        updateData.lastActivityType = activity;
      }

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
    }
  }

  // ✅ Calculer le statut utilisateur selon activité
  calculateUserStatus(lastActivity) {
    if (!lastActivity) return 'offline';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActivity.seconds ? lastActivity.seconds * 1000 : lastActivity);
    const diffMinutes = (now - lastActiveDate) / (1000 * 60);
    
    if (diffMinutes < 5) return 'online';
    if (diffMinutes < 30) return 'away';
    return 'offline';
  }

  // ✅ Nettoyer les listeners
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }

  // ✅ Données mock pour le fallback
  getMockTeamMembers() {
    return [
      {
        id: 'mock-1',
        name: 'Vous',
        email: 'utilisateur@synergia.com',
        role: 'Utilisateur connecté',
        level: 1,
        xp: 0,
        tasksCompleted: 0,
        status: 'online',
        lastActivity: new Date().toISOString()
      }
    ];
  }

  getMockTeamStats() {
    return {
      totalMembers: 1,
      activeMembers: 1,
      totalXP: 0,
      averageLevel: 1,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      completionRate: 0
    };
  }

  getMockTeamData() {
    return {
      members: this.getMockTeamMembers(),
      stats: this.getMockTeamStats(),
      lastUpdated: new Date().toISOString()
    };
  }
}

// ✅ Instance singleton
const teamService = new TeamService();
export default teamService;
