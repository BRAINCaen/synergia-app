// ==========================================
// 📁 react-app/src/core/services/teamService.js
// SERVICE ÉQUIPE FIREBASE PUR - SANS MOCK
// ==========================================

import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🏢 SERVICE ÉQUIPE FIREBASE PUR
 * Gestion des équipes sans aucune donnée mock
 */
class TeamService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    console.log('🏢 TeamService Firebase pur initialisé');
  }

  /**
   * 👥 RÉCUPÉRER TOUS LES MEMBRES D'ÉQUIPE
   * Données réelles depuis Firebase uniquement
   */
  async getAllTeamMembers() {
    try {
      console.log('👥 Récupération membres équipe depuis Firebase...');
      
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('gamification.totalXp', 'desc'),
        limit(50) // Limiter pour les performances
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      const members = usersSnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          name: userData.profile?.displayName || userData.displayName || 'Utilisateur',
          email: userData.email,
          role: userData.profile?.role || 'member',
          level: userData.gamification?.level || 1,
          totalXp: userData.gamification?.totalXp || 0,
          tasksCompleted: userData.gamification?.tasksCompleted || 0,
          avatar: userData.photoURL || this.generateAvatar(userData.profile?.displayName || userData.email),
          status: this.calculateUserStatus(userData),
          lastActivity: userData.gamification?.lastActivityDate,
          department: userData.profile?.department || 'general',
          joinedAt: userData.createdAt?.toDate?.() || new Date(userData.createdAt) || new Date(),
          source: 'firebase'
        };
      });
      
      console.log(`✅ ${members.length} membres équipe récupérés depuis Firebase`);
      
      // Mettre en cache
      this.cache.set('allMembers', members);
      
      return members;
      
    } catch (error) {
      console.error('❌ Erreur récupération membres équipe:', error);
      return [];
    }
  }

  /**
   * 📊 STATISTIQUES D'ÉQUIPE RÉELLES
   */
  async getTeamStats() {
    try {
      console.log('📊 Calcul statistiques équipe...');
      
      const members = await this.getAllTeamMembers();
      
      if (members.length === 0) {
        return this.getEmptyStats();
      }
      
      const stats = {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'online' || m.status === 'active').length,
        totalXP: members.reduce((sum, m) => sum + m.totalXp, 0),
        averageLevel: Math.round(members.reduce((sum, m) => sum + m.level, 0) / members.length),
        totalTasks: members.reduce((sum, m) => sum + m.tasksCompleted, 0),
        completedTasks: members.reduce((sum, m) => sum + m.tasksCompleted, 0),
        completionRate: 100, // Tâches complétées = 100% par définition
        
        // Répartition par département
        departmentDistribution: this.calculateDepartmentDistribution(members),
        
        // Répartition par niveau
        levelDistribution: this.calculateLevelDistribution(members),
        
        // Top performers
        topPerformers: members
          .sort((a, b) => b.totalXp - a.totalXp)
          .slice(0, 5),
          
        // Membres récents
        recentMembers: members
          .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
          .slice(0, 3),
          
        // Moyennes
        averageXpPerMember: Math.round(members.reduce((sum, m) => sum + m.totalXp, 0) / members.length),
        averageTasksPerMember: Math.round(members.reduce((sum, m) => sum + m.tasksCompleted, 0) / members.length)
      };
      
      console.log('✅ Statistiques équipe calculées:', stats);
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur calcul statistiques équipe:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * 🔍 RECHERCHER MEMBRES D'ÉQUIPE
   */
  async searchTeamMembers(searchTerm, filters = {}) {
    try {
      let members = await this.getAllTeamMembers();
      
      // Filtrer par terme de recherche
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        members = members.filter(member => 
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          member.department.toLowerCase().includes(term) ||
          member.role.toLowerCase().includes(term)
        );
      }
      
      // Appliquer les filtres
      if (filters.department && filters.department !== 'all') {
        members = members.filter(m => m.department === filters.department);
      }
      
      if (filters.role && filters.role !== 'all') {
        members = members.filter(m => m.role === filters.role);
      }
      
      if (filters.status && filters.status !== 'all') {
        members = members.filter(m => m.status === filters.status);
      }
      
      if (filters.minLevel) {
        members = members.filter(m => m.level >= filters.minLevel);
      }
      
      console.log(`🔍 Recherche '${searchTerm}': ${members.length} résultats`);
      
      return members;
      
    } catch (error) {
      console.error('❌ Erreur recherche membres:', error);
      return [];
    }
  }

  /**
   * 📡 S'ABONNER AUX CHANGEMENTS D'ÉQUIPE
   */
  subscribeToTeamUpdates(callback) {
    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('gamification.totalXp', 'desc')),
      (snapshot) => {
        const members = snapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            name: userData.profile?.displayName || userData.displayName || 'Utilisateur',
            email: userData.email,
            level: userData.gamification?.level || 1,
            totalXp: userData.gamification?.totalXp || 0,
            tasksCompleted: userData.gamification?.tasksCompleted || 0,
            status: this.calculateUserStatus(userData),
            source: 'firebase'
          };
        });
        
        console.log('📡 Mise à jour équipe temps réel:', members.length);
        callback(members);
      },
      (error) => {
        console.error('❌ Erreur écoute équipe:', error);
      }
    );
    
    this.listeners.set('teamUpdates', unsubscribe);
    return unsubscribe;
  }

  /**
   * 🏃 ACTIVITÉS D'ÉQUIPE RÉCENTES
   */
  async getTeamActivities(limit = 20) {
    try {
      console.log('🏃 Récupération activités équipe...');
      
      // Récupérer les tâches récemment complétées
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc'),
        limit(limit)
      );
      
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const activities = await Promise.all(
        tasksSnapshot.docs.map(async (taskDoc) => {
          const taskData = taskDoc.data();
          
          // Récupérer les infos utilisateur
          let userName = 'Utilisateur';
          if (taskData.userId) {
            try {
              const userDoc = await getDoc(doc(db, 'users', taskData.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                userName = userData.profile?.displayName || userData.displayName || 'Utilisateur';
              }
            } catch (error) {
              console.warn('⚠️ Impossible de récupérer utilisateur:', taskData.userId);
            }
          }
          
          return {
            id: taskDoc.id,
            type: 'task_completed',
            title: `${userName} a terminé "${taskData.title}"`,
            description: taskData.description || '',
            user: userName,
            userId: taskData.userId,
            time: taskData.updatedAt?.toDate?.() || new Date(taskData.updatedAt) || new Date(),
            xpGained: taskData.xpReward || 0,
            icon: '✅',
            source: 'firebase'
          };
        })
      );
      
      // Trier par date
      activities.sort((a, b) => b.time - a.time);
      
      console.log(`✅ ${activities.length} activités équipe récupérées`);
      
      return activities;
      
    } catch (error) {
      console.error('❌ Erreur récupération activités équipe:', error);
      return [];
    }
  }

  /**
   * 🎯 CALCULER LE STATUT UTILISATEUR
   */
  calculateUserStatus(userData) {
    const lastActivity = userData.gamification?.lastActivityDate;
    
    if (!lastActivity) return 'offline';
    
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const hoursSinceActivity = (now - lastActivityDate) / (1000 * 60 * 60);
    
    if (hoursSinceActivity <= 1) return 'online';
    if (hoursSinceActivity <= 24) return 'active';
    if (hoursSinceActivity <= 168) return 'away'; // 7 jours
    return 'offline';
  }

  /**
   * 🎨 GÉNÉRER UN AVATAR BASÉ SUR LE NOM
   */
  generateAvatar(name) {
    if (!name) return '👤';
    
    const firstLetter = name.charAt(0).toUpperCase();
    const avatars = {
      A: '👩‍💼', B: '👨‍💻', C: '👩‍🎨', D: '👨‍🔬', E: '👩‍🏫',
      F: '👨‍🍳', G: '👩‍⚕️', H: '👨‍✈️', I: '👩‍🌾', J: '👨‍🎭',
      K: '👩‍🎤', L: '👨‍🎨', M: '👩‍💻', N: '👨‍🏫', O: '👩‍🔬',
      P: '👨‍⚕️', Q: '👩‍✈️', R: '👨‍🌾', S: '👩‍🍳', T: '👨‍💼',
      U: '👩‍🎭', V: '👨‍🎤', W: '👩‍🏭', X: '👨‍🎯', Y: '👩‍🚀', Z: '👨‍🚀'
    };
    
    return avatars[firstLetter] || '👤';
  }

  /**
   * 📊 CALCULER LA RÉPARTITION PAR DÉPARTEMENT
   */
  calculateDepartmentDistribution(members) {
    const distribution = {};
    
    members.forEach(member => {
      const dept = member.department || 'general';
      distribution[dept] = (distribution[dept] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * 📊 CALCULER LA RÉPARTITION PAR NIVEAU
   */
  calculateLevelDistribution(members) {
    const distribution = {};
    
    members.forEach(member => {
      const level = member.level;
      const range = `${Math.floor((level - 1) / 5) * 5 + 1}-${Math.floor((level - 1) / 5) * 5 + 5}`;
      distribution[range] = (distribution[range] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * 📊 STATISTIQUES VIDES PAR DÉFAUT
   */
  getEmptyStats() {
    return {
      totalMembers: 0,
      activeMembers: 0,
      totalXP: 0,
      averageLevel: 1,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      departmentDistribution: {},
      levelDistribution: {},
      topPerformers: [],
      recentMembers: [],
      averageXpPerMember: 0,
      averageTasksPerMember: 0
    };
  }

  /**
   * 🧹 NETTOYER LES LISTENERS
   */
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    this.listeners.clear();
    this.cache.clear();
    
    console.log('🧹 TeamService nettoyé');
  }
}

// Instance singleton
const teamService = new TeamService();

export default teamService;
export { TeamService, teamService };
