// ==========================================
// 📁 react-app/src/core/services/teamService.js
// Service centralisé pour la gestion des équipes
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
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase.js';

class TeamService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
  }

  // ✅ Rechercher des membres par nom/email
  async searchMembers(searchTerm, limit = 10) {
    if (!db || !searchTerm) return [];

    try {
      const searchLower = searchTerm.toLowerCase();
      const allMembers = await this.getTeamMembers(50);
      
      return allMembers.filter(member => 
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower)
      ).slice(0, limit);

    } catch (error) {
      console.error('❌ Erreur recherche membres:', error);
      return [];
    }
  }

  // ✅ Obtenir les activités récentes de l'équipe
  async getRecentActivities(limit = 20) {
    if (!db) return [];

    try {
      const [tasks, projects, members] = await Promise.all([
        this.getTeamTasks(30),
        this.getTeamProjects(15),
        this.getTeamMembers(20)
      ]);

      const activities = [];

      // Activités des tâches
      tasks.forEach(task => {
        const member = members.find(m => m.id === task.userId) || members[0];
        if (member) {
          activities.push({
            id: `task-${task.id}`,
            type: task.status === 'completed' ? 'task_completed' : 'task_created',
            user: member.name,
            userAvatar: member.avatar,
            action: task.status === 'completed' ? 'a terminé la tâche' : 'a créé la tâche',
            target: task.title,
            targetId: task.id,
            time: task.updatedAt || task.createdAt,
            icon: task.status === 'completed' ? '✅' : '📝',
            color: task.status === 'completed' ? 'green' : 'blue'
          });
        }
      });

      // Activités des projets
      projects.forEach(project => {
        const member = members.find(m => m.id === project.userId) || members[0];
        if (member) {
          activities.push({
            id: `project-${project.id}`,
            type: 'project_created',
            user: member.name,
            userAvatar: member.avatar,
            action: 'a créé le projet',
            target: project.title,
            targetId: project.id,
            time: project.createdAt,
            icon: '🚀',
            color: 'purple'
          });
        }
      });

      // Trier par date (plus récent en premier)
      return activities
        .sort((a, b) => {
          const timeA = a.time?.toDate ? a.time.toDate() : new Date(a.time);
          const timeB = b.time?.toDate ? b.time.toDate() : new Date(b.time);
          return timeB - timeA;
        })
        .slice(0, limit);

    } catch (error) {
      console.error('❌ Erreur récupération activités:', error);
      return [];
    }
  }

  // ✅ Obtenir les métriques de performance équipe
  async getTeamPerformanceMetrics(days = 30) {
    if (!db) return this.getMockPerformanceMetrics();

    try {
      const [members, tasks, projects] = await Promise.all([
        this.getTeamMembers(),
        this.getTeamTasks(100),
        this.getTeamProjects(50)
      ]);

      const now = new Date();
      const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

      // Filtrer les données récentes
      const recentTasks = tasks.filter(task => {
        const taskDate = task.createdAt?.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
        return taskDate >= startDate;
      });

      const recentProjects = projects.filter(project => {
        const projectDate = project.createdAt?.toDate ? project.createdAt.toDate() : new Date(project.createdAt);
        return projectDate >= startDate;
      });

      return {
        period: `${days} derniers jours`,
        tasksCreated: recentTasks.length,
        tasksCompleted: recentTasks.filter(t => t.status === 'completed').length,
        projectsCreated: recentProjects.length,
        projectsCompleted: recentProjects.filter(p => p.status === 'completed').length,
        averageTaskCompletionTime: this.calculateAverageCompletionTime(recentTasks),
        teamVelocity: this.calculateTeamVelocity(recentTasks, days),
        mostActiveMembers: this.getMostActiveMembers(members, recentTasks),
        departmentStats: this.getDepartmentStats(members, recentTasks)
      };

    } catch (error) {
      console.error('❌ Erreur métriques performance:', error);
      return this.getMockPerformanceMetrics();
    }
  }

  // ✅ Calculer temps moyen de completion
  calculateAverageCompletionTime(tasks) {
    const completedTasks = tasks.filter(t => 
      t.status === 'completed' && t.createdAt && t.updatedAt
    );

    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
      const completed = task.updatedAt.toDate ? task.updatedAt.toDate() : new Date(task.updatedAt);
      return sum + (completed - created);
    }, 0);

    const avgTimeMs = totalTime / completedTasks.length;
    return Math.round(avgTimeMs / (1000 * 60 * 60 * 24)); // Retour en jours
  }

  // ✅ Calculer vélocité équipe
  calculateTeamVelocity(tasks, days) {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const totalXP = completedTasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);
    
    return {
      tasksPerDay: Math.round((completedTasks.length / days) * 10) / 10,
      xpPerDay: Math.round((totalXP / days) * 10) / 10,
      totalXP
    };
  }

  // ✅ Obtenir les membres les plus actifs
  getMostActiveMembers(members, recentTasks) {
    const memberActivity = {};

    // Compter les activités par membre
    recentTasks.forEach(task => {
      if (task.userId) {
        if (!memberActivity[task.userId]) {
          memberActivity[task.userId] = {
            tasksCreated: 0,
            tasksCompleted: 0,
            totalXP: 0
          };
        }
        
        memberActivity[task.userId].tasksCreated++;
        if (task.status === 'completed') {
          memberActivity[task.userId].tasksCompleted++;
          memberActivity[task.userId].totalXP += task.xpReward || 0;
        }
      }
    });

    // Enrichir avec les infos membres et trier
    return Object.entries(memberActivity)
      .map(([userId, activity]) => {
        const member = members.find(m => m.id === userId);
        return member ? {
          ...member,
          ...activity,
          activityScore: activity.tasksCompleted * 2 + activity.tasksCreated
        } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.activityScore - a.activityScore)
      .slice(0, 5);
  }

  // ✅ Statistiques par département
  getDepartmentStats(members, recentTasks) {
    const deptStats = {};

    members.forEach(member => {
      const dept = member.department || 'Non spécifié';
      if (!deptStats[dept]) {
        deptStats[dept] = {
          name: dept,
          memberCount: 0,
          totalXP: 0,
          tasksCompleted: 0
        };
      }
      
      deptStats[dept].memberCount++;
      deptStats[dept].totalXP += member.xp || 0;
      
      // Compter les tâches récentes du membre
      const memberTasks = recentTasks.filter(t => t.userId === member.id && t.status === 'completed');
      deptStats[dept].tasksCompleted += memberTasks.length;
    });

    return Object.values(deptStats)
      .sort((a, b) => b.totalXP - a.totalXP);
  }

  // ✅ Données mock pour métriques performance
  getMockPerformanceMetrics() {
    return {
      period: '30 derniers jours',
      tasksCreated: 45,
      tasksCompleted: 38,
      projectsCreated: 8,
      projectsCompleted: 5,
      averageTaskCompletionTime: 3,
      teamVelocity: {
        tasksPerDay: 1.3,
        xpPerDay: 45.2,
        totalXP: 1356
      },
      mostActiveMembers: this.getMockTeamMembers().slice(0, 3),
      departmentStats: [
        { name: 'Développement', memberCount: 4, totalXP: 2100, tasksCompleted: 28 },
        { name: 'Design', memberCount: 2, totalXP: 1200, tasksCompleted: 15 },
        { name: 'Marketing', memberCount: 3, totalXP: 950, tasksCompleted: 12 }
      ]
    };
  }

  // ✅ Nettoyer les listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    this.cache.clear();
  }
}

// ✅ Instance singleton
const teamService = new TeamService();

export default teamService;

// ✅ Exports nommés pour flexibilité
export {
  TeamService,
  teamService
};✅ Récupérer les membres de l'équipe avec sources multiples
  async getTeamMembers(limitCount = 20) {
    if (!db) {
      console.log('🔧 Firebase non disponible - Données mock');
      return this.getMockTeamMembers();
    }

    try {
      let members = [];
      
      // Essai 1: Collection 'users'
      members = await this.getMembersFromCollection('users', limitCount);
      
      // Essai 2: Collection 'userStats' si users vide
      if (members.length === 0) {
        members = await this.getMembersFromCollection('userStats', limitCount);
      }
      
      // Essai 3: Collection 'leaderboard' si autres vides
      if (members.length === 0) {
        members = await this.getMembersFromCollection('leaderboard', limitCount);
      }

      console.log(`✅ ${members.length} membres récupérés depuis Firebase`);
      return members;

    } catch (error) {
      console.error('❌ Erreur récupération équipe:', error);
      return this.getMockTeamMembers();
    }
  }

  // ✅ Récupérer les membres depuis une collection spécifique
  async getMembersFromCollection(collectionName, limitCount) {
    try {
      let q;
      
      if (collectionName === 'leaderboard') {
        q = query(
          collection(db, collectionName),
          orderBy('totalXp', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, collectionName),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const members = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email) {
          members.push(this.formatMemberData(doc.id, userData, collectionName));
        }
      });

      return members;
    } catch (error) {
      console.log(`⚠️ Erreur collection ${collectionName}:`, error);
      return [];
    }
  }

  // ✅ Formater les données membre selon la source
  formatMemberData(id, userData, source) {
    const baseData = {
      id,
      name: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
      email: userData.email,
      role: userData.role || 'Membre',
      department: userData.department || 'Non spécifié',
      photoURL: userData.photoURL,
      avatar: this.getAvatarFromEmail(userData.email),
      source
    };

    // Adaptation selon la source
    switch (source) {
      case 'userStats':
        return {
          ...baseData,
          level: userData.level || 1,
          xp: userData.totalXp || 0,
          tasksCompleted: userData.tasksCompleted || 0,
          tasksCreated: userData.tasksCreated || 0,
          projectsCreated: userData.projectsCreated || 0,
          badges: userData.badges || [],
          lastActivity: userData.lastLoginDate || userData.updatedAt,
          status: this.calculateUserStatus(userData.lastLoginDate),
          joinedAt: userData.createdAt
        };

      case 'leaderboard':
        return {
          ...baseData,
          level: userData.level || 1,
          xp: userData.totalXp || 0,
          tasksCompleted: 0,
          tasksCreated: 0,
          projectsCreated: 0,
          badges: [],
          lastActivity: userData.updatedAt,
          status: 'offline',
          joinedAt: userData.updatedAt
        };

      case 'users':
      default:
        return {
          ...baseData,
          level: userData.gamification?.level || userData.level || 1,
          xp: userData.gamification?.totalXp || userData.totalXp || 0,
          tasksCompleted: userData.gamification?.tasksCompleted || userData.tasksCompleted || 0,
          tasksCreated: userData.gamification?.tasksCreated || userData.tasksCreated || 0,
          projectsCreated: userData.gamification?.projectsCreated || userData.projectsCreated || 0,
          badges: userData.gamification?.badges || userData.badges || [],
          lastActivity: userData.lastActivity || userData.updatedAt,
          status: this.calculateUserStatus(userData.lastActivity),
          joinedAt: userData.createdAt || userData.metadata?.creationTime
        };
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

      return this.calculateTeamStats(members, tasks, projects);
    } catch (error) {
      console.error('❌ Erreur calcul stats équipe:', error);
      return this.getMockTeamStats();
    }
  }

  // ✅ Calculer les statistiques équipe
  calculateTeamStats(members, tasks, projects) {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'online').length;
    const totalXP = members.reduce((sum, member) => sum + (member.xp || 0), 0);
    const averageLevel = totalMembers > 0 ? 
      Math.round(members.reduce((sum, member) => sum + (member.level || 1), 0) / totalMembers) : 1;
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? 
      Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const activeProjects = projects.filter(p => p.status === 'active' || !p.status).length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    const topPerformer = members.length > 0 ? 
      members.reduce((top, member) => (member.xp > (top?.xp || 0)) ? member : top, null) : null;

    return {
      totalMembers,
      activeMembers,
      offlineMembers: totalMembers - activeMembers,
      totalXP,
      averageLevel,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
      activeProjects,
      completedProjects,
      totalProjects: projects.length,
      topPerformer,
      averageTasksPerMember: totalMembers > 0 ? Math.round(totalTasks / totalMembers) : 0,
      teamProductivity: this.calculateProductivityScore(members, tasks, projects)
    };
  }

  // ✅ Récupérer les tâches de l'équipe
  async getTeamTasks(limitCount = 50) {
    if (!db) return [];

    try {
      const q = query(
        collection(db, 'tasks'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];

      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return tasks;
    } catch (error) {
      console.error('❌ Erreur récupération tâches équipe:', error);
      return [];
    }
  }

  // ✅ Récupérer les projets de l'équipe
  async getTeamProjects(limitCount = 20) {
    if (!db) return [];

    try {
      const q = query(
        collection(db, 'projects'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const projects = [];

      querySnapshot.forEach((doc) => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
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
      console.log('🔧 Firebase non disponible - Pas d\'écoute temps réel');
      return () => {};
    }

    try {
      const unsubscribers = [];

      // Écoute des utilisateurs
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('lastActivity', 'desc'),
        limit(20)
      );
      
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const members = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.email) {
            members.push(this.formatMemberData(doc.id, userData, 'users'));
          }
        });
        
        callback({ type: 'members', data: members });
      });

      unsubscribers.push(unsubscribeUsers);
      
      // Retourner fonction de nettoyage
      return () => {
        unsubscribers.forEach(unsub => unsub());
      };

    } catch (error) {
      console.error('❌ Erreur écoute temps réel:', error);
      return () => {};
    }
  }

  // ✅ Mettre à jour le statut d'un membre
  async updateMemberStatus(memberId, status) {
    if (!db) return false;

    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        status,
        lastActivity: serverTimestamp()
      });
      
      console.log(`✅ Statut membre ${memberId} mis à jour: ${status}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour statut:', error);
      return false;
    }
  }

  // ✅ Calculer le statut utilisateur selon activité
  calculateUserStatus(lastActivity) {
    if (!lastActivity) return 'offline';
    
    try {
      const now = new Date();
      const lastActiveDate = lastActivity.toDate ? lastActivity.toDate() : new Date(lastActivity);
      const diffMinutes = (now - lastActiveDate) / (1000 * 60);
      
      if (diffMinutes < 15) return 'online';
      if (diffMinutes < 60) return 'away';
      return 'offline';
    } catch {
      return 'offline';
    }
  }

  // ✅ Générer avatar depuis email
  getAvatarFromEmail(email) {
    if (!email) return '👤';
    
    const avatars = [
      '👤', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', 
      '👨‍🎨', '👩‍🎨', '👨‍📊', '👩‍📊', '🧑‍🔬', 
      '👩‍🔬', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️'
    ];
    
    const index = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatars[index % avatars.length];
  }

  // ✅ Calculer score productivité équipe
  calculateProductivityScore(members, tasks, projects) {
    if (members.length === 0) return 0;

    const avgTasksPerMember = tasks.length / members.length;
    const completionRate = tasks.length > 0 ? 
      (tasks.filter(t => t.status === 'completed').length / tasks.length) : 0;
    const avgXpPerMember = members.reduce((sum, m) => sum + (m.xp || 0), 0) / members.length;
    
    // Score basé sur plusieurs critères (0-100)
    const taskScore = Math.min(avgTasksPerMember * 10, 40); // Max 40 points
    const completionScore = completionRate * 30; // Max 30 points
    const xpScore = Math.min(avgXpPerMember / 10, 30); // Max 30 points
    
    return Math.round(taskScore + completionScore + xpScore);
  }

  // ✅ Données mock pour fallback
  getMockTeamMembers() {
    return [
      {
        id: 'mock-1',
        name: 'Alice Dubois',
        email: 'alice@exemple.com',
        role: 'Chef de projet',
        level: 5,
        xp: 1250,
        tasksCompleted: 45,
        avatar: '👩‍💼',
        status: 'online',
        source: 'mock'
      },
      {
        id: 'mock-2',
        name: 'Bob Martin',
        email: 'bob@exemple.com',
        role: 'Développeur',
        level: 4,
        xp: 980,
        tasksCompleted: 32,
        avatar: '👨‍💻',
        status: 'away',
        source: 'mock'
      },
      {
        id: 'mock-3',
        name: 'Claire Dupont',
        email: 'claire@exemple.com',
        role: 'Designer',
        level: 3,
        xp: 720,
        tasksCompleted: 28,
        avatar: '👩‍🎨',
        status: 'offline',
        source: 'mock'
      }
    ];
  }

  getMockTeamStats() {
    return {
      totalMembers: 3,
      activeMembers: 1,
      totalXP: 2950,
      averageLevel: 4,
      totalTasks: 105,
      completedTasks: 88,
      completionRate: 84,
      activeProjects: 3,
      totalProjects: 5
    };
  }

  //
