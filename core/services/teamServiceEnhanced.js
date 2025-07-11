// ==========================================
// 📁 react-app/src/core/services/teamServiceEnhanced.js
// SERVICE ÉQUIPE AMÉLIORÉ - RÉCUPÉRATION COMPLÈTE DES MEMBRES
// ==========================================

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🚀 SERVICE ÉQUIPE AMÉLIORÉ
 * Récupération exhaustive de tous les membres depuis toutes les sources
 */
class TeamServiceEnhanced {

  /**
   * 👥 RÉCUPÉRER TOUS LES MEMBRES DE TOUTES LES SOURCES
   * Cette méthode fusionne les données de toutes les collections Firebase
   */
  async getAllTeamMembers() {
    try {
      console.log('🔍 Récupération exhaustive des membres...');
      
      // Dictionnaire pour éviter les doublons
      const membersMap = new Map();
      
      // 1️⃣ RÉCUPÉRER DE LA COLLECTION USERS (source principale)
      await this.loadFromUsers(membersMap);
      
      // 2️⃣ RÉCUPÉRER DE LA COLLECTION USERSTATS 
      await this.loadFromUserStats(membersMap);
      
      // 3️⃣ RÉCUPÉRER DE LA COLLECTION TEAMMEMBERS
      await this.loadFromTeamMembers(membersMap);
      
      // 4️⃣ RÉCUPÉRER DES PROJETS (membres assignés)
      await this.loadFromProjects(membersMap);
      
      // 5️⃣ CONVERTIR EN TABLEAU ET TRIER
      const allMembers = Array.from(membersMap.values())
        .sort((a, b) => {
          // Prioriser les membres actifs
          if (a.isActive !== b.isActive) {
            return b.isActive ? 1 : -1;
          }
          // Puis par niveau/XP
          return (b.level || 0) - (a.level || 0);
        });
      
      console.log(`✅ ${allMembers.length} membres uniques récupérés`);
      console.log('📊 Sources:', this.getSourcesStats(allMembers));
      
      return allMembers;
      
    } catch (error) {
      console.error('❌ Erreur récupération complète équipe:', error);
      return [];
    }
  }

  /**
   * 👤 CHARGER DEPUIS LA COLLECTION USERS
   */
  async loadFromUsers(membersMap) {
    try {
      console.log('📁 Chargement depuis collection "users"...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let count = 0;
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        
        if (userData.email) {
          const member = this.createMemberFromUser(doc.id, userData);
          membersMap.set(doc.id, member);
          count++;
        }
      });
      
      console.log(`✅ ${count} membres ajoutés depuis "users"`);
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement users:', error);
    }
  }

  /**
   * 📊 CHARGER DEPUIS LA COLLECTION USERSTATS
   */
  async loadFromUserStats(membersMap) {
    try {
      console.log('📁 Chargement depuis collection "userStats"...');
      
      const statsSnapshot = await getDocs(collection(db, 'userStats'));
      let count = 0;
      
      statsSnapshot.forEach((doc) => {
        const statsData = doc.data();
        
        if (statsData.email) {
          const existingMember = membersMap.get(doc.id);
          
          if (existingMember) {
            // Enrichir membre existant
            this.enrichMemberWithStats(existingMember, statsData);
          } else {
            // Créer nouveau membre depuis stats
            const member = this.createMemberFromStats(doc.id, statsData);
            membersMap.set(doc.id, member);
            count++;
          }
        }
      });
      
      console.log(`✅ ${count} membres ajoutés/enrichis depuis "userStats"`);
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement userStats:', error);
    }
  }

  /**
   * 👥 CHARGER DEPUIS LA COLLECTION TEAMMEMBERS
   */
  async loadFromTeamMembers(membersMap) {
    try {
      console.log('📁 Chargement depuis collection "teamMembers"...');
      
      // ENLEVER LE FILTRE STATUS POUR VOIR TOUS LES MEMBRES
      const teamSnapshot = await getDocs(collection(db, 'teamMembers'));
      let count = 0;
      
      teamSnapshot.forEach((doc) => {
        const teamData = doc.data();
        
        const existingMember = membersMap.get(doc.id);
        
        if (existingMember) {
          // Enrichir avec données équipe
          this.enrichMemberWithTeamData(existingMember, teamData);
        } else if (teamData.email || teamData.displayName) {
          // Créer membre depuis données équipe
          const member = this.createMemberFromTeamData(doc.id, teamData);
          membersMap.set(doc.id, member);
          count++;
        }
      });
      
      console.log(`✅ ${count} membres ajoutés/enrichis depuis "teamMembers"`);
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement teamMembers:', error);
    }
  }

  /**
   * 📋 CHARGER DEPUIS LES PROJETS
   */
  async loadFromProjects(membersMap) {
    try {
      console.log('📁 Chargement membres depuis projets...');
      
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      let count = 0;
      
      projectsSnapshot.forEach((doc) => {
        const projectData = doc.data();
        
        if (projectData.team && Array.isArray(projectData.team)) {
          projectData.team.forEach((teamMember) => {
            if (teamMember.userId) {
              const existingMember = membersMap.get(teamMember.userId);
              
              if (existingMember) {
                // Ajouter info projet
                if (!existingMember.projects) existingMember.projects = [];
                existingMember.projects.push({
                  id: doc.id,
                  title: projectData.title,
                  role: teamMember.role
                });
              } else {
                // Créer membre minimal depuis projet
                const member = this.createMemberFromProject(teamMember, doc.id, projectData);
                membersMap.set(teamMember.userId, member);
                count++;
              }
            }
          });
        }
      });
      
      console.log(`✅ ${count} membres ajoutés depuis projets`);
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement projets:', error);
    }
  }

  /**
   * 👤 CRÉER MEMBRE DEPUIS COLLECTION USERS
   */
  createMemberFromUser(id, userData) {
    return {
      id,
      email: userData.email,
      displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
      photoURL: userData.photoURL || null,
      role: userData.role || 'Membre',
      department: userData.department || 'Non spécifié',
      isActive: userData.isActive !== false,
      level: userData.level || 1,
      xp: userData.totalXp || 0,
      tasksCompleted: 0,
      projects: [],
      lastActivity: userData.lastActivity || userData.createdAt,
      joinedAt: userData.createdAt,
      source: 'users',
      avatar: this.generateAvatar(userData.email),
      status: this.calculateStatus(userData.lastActivity)
    };
  }

  /**
   * 📊 CRÉER MEMBRE DEPUIS USERSTATS
   */
  createMemberFromStats(id, statsData) {
    return {
      id,
      email: statsData.email,
      displayName: statsData.displayName || statsData.email?.split('@')[0] || 'Utilisateur',
      photoURL: null,
      role: 'Membre',
      department: 'Non spécifié',
      isActive: true,
      level: statsData.level || 1,
      xp: statsData.totalXp || 0,
      tasksCompleted: statsData.tasksCompleted || 0,
      tasksCreated: statsData.tasksCreated || 0,
      projectsCreated: statsData.projectsCreated || 0,
      badges: statsData.badges || [],
      projects: [],
      lastActivity: statsData.lastLoginDate || statsData.updatedAt,
      joinedAt: statsData.createdAt,
      source: 'userStats',
      avatar: this.generateAvatar(statsData.email),
      status: this.calculateStatus(statsData.lastLoginDate)
    };
  }

  /**
   * 👥 CRÉER MEMBRE DEPUIS TEAMMEMBERS
   */
  createMemberFromTeamData(id, teamData) {
    return {
      id,
      email: teamData.email || 'email@inconnu.com',
      displayName: teamData.displayName || 'Utilisateur',
      photoURL: teamData.photoURL || null,
      role: teamData.role || 'Membre',
      department: teamData.department || 'Non spécifié',
      isActive: teamData.status !== 'inactive',
      level: teamData.teamStats?.level || 1,
      xp: teamData.teamStats?.totalXp || 0,
      tasksCompleted: teamData.teamStats?.tasksCompleted || 0,
      synergiaRoles: teamData.synergiaRoles || [],
      projects: [],
      lastActivity: teamData.updatedAt,
      joinedAt: teamData.createdAt,
      source: 'teamMembers',
      avatar: this.generateAvatar(teamData.email),
      status: teamData.status || 'active'
    };
  }

  /**
   * 📋 CRÉER MEMBRE DEPUIS PROJET
   */
  createMemberFromProject(teamMember, projectId, projectData) {
    return {
      id: teamMember.userId,
      email: teamMember.email || 'email@inconnu.com',
      displayName: teamMember.displayName || 'Membre Projet',
      photoURL: null,
      role: teamMember.role || 'Contributeur',
      department: 'Projet',
      isActive: true,
      level: 1,
      xp: 0,
      tasksCompleted: 0,
      projects: [{
        id: projectId,
        title: projectData.title,
        role: teamMember.role
      }],
      lastActivity: teamMember.joinedAt,
      joinedAt: teamMember.joinedAt,
      source: 'projects',
      avatar: this.generateAvatar(teamMember.email),
      status: 'active'
    };
  }

  /**
   * 🔧 ENRICHIR MEMBRE AVEC STATS
   */
  enrichMemberWithStats(member, statsData) {
    member.level = Math.max(member.level || 1, statsData.level || 1);
    member.xp = Math.max(member.xp || 0, statsData.totalXp || 0);
    member.tasksCompleted = (member.tasksCompleted || 0) + (statsData.tasksCompleted || 0);
    member.tasksCreated = statsData.tasksCreated || 0;
    member.projectsCreated = statsData.projectsCreated || 0;
    member.badges = [...(member.badges || []), ...(statsData.badges || [])];
    
    if (statsData.lastLoginDate) {
      member.lastActivity = statsData.lastLoginDate;
      member.status = this.calculateStatus(statsData.lastLoginDate);
    }
  }

  /**
   * 👥 ENRICHIR MEMBRE AVEC DONNÉES ÉQUIPE
   */
  enrichMemberWithTeamData(member, teamData) {
    if (teamData.synergiaRoles) {
      member.synergiaRoles = teamData.synergiaRoles;
    }
    if (teamData.department) {
      member.department = teamData.department;
    }
    if (teamData.status) {
      member.isActive = teamData.status !== 'inactive';
      member.status = teamData.status;
    }
  }

  /**
   * 🎨 GÉNÉRER AVATAR DEPUIS EMAIL
   */
  generateAvatar(email) {
    if (!email) return '👤';
    
    const avatars = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '🧑‍🎨', '👩‍🎨', '👨‍🔬', '👩‍🔬'];
    const index = email.length % avatars.length;
    return avatars[index];
  }

  /**
   * 📊 CALCULER STATUT UTILISATEUR
   */
  calculateStatus(lastActivity) {
    if (!lastActivity) return 'inactive';
    
    const now = Date.now();
    const lastTime = lastActivity?.toDate ? lastActivity.toDate().getTime() : Date.parse(lastActivity);
    const daysSince = (now - lastTime) / (1000 * 60 * 60 * 24);
    
    if (daysSince <= 1) return 'online';
    if (daysSince <= 7) return 'recent';
    if (daysSince <= 30) return 'away';
    return 'inactive';
  }

  /**
   * 📈 STATISTIQUES DES SOURCES
   */
  getSourcesStats(members) {
    const stats = {
      users: 0,
      userStats: 0,
      teamMembers: 0,
      projects: 0
    };
    
    members.forEach(member => {
      if (member.source && stats.hasOwnProperty(member.source)) {
        stats[member.source]++;
      }
    });
    
    return stats;
  }

  /**
   * 🔍 RECHERCHER MEMBRES AVEC CRITÈRES MULTIPLES
   */
  searchMembers(members, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return members;
    }
    
    const term = searchTerm.toLowerCase();
    
    return members.filter(member => {
      return (
        (member.displayName || '').toLowerCase().includes(term) ||
        (member.email || '').toLowerCase().includes(term) ||
        (member.role || '').toLowerCase().includes(term) ||
        (member.department || '').toLowerCase().includes(term) ||
        (member.synergiaRoles || []).some(role => 
          typeof role === 'string' ? role.toLowerCase().includes(term) : 
          (role.name || '').toLowerCase().includes(term)
        )
      );
    });
  }

  /**
   * 🎯 FILTRER MEMBRES PAR STATUT
   */
  filterByStatus(members, status) {
    if (status === 'all') return members;
    
    return members.filter(member => {
      switch (status) {
        case 'active':
          return member.isActive && member.status !== 'inactive';
        case 'inactive':
          return !member.isActive || member.status === 'inactive';
        case 'online':
          return member.status === 'online';
        case 'recent':
          return member.status === 'recent';
        default:
          return true;
      }
    });
  }
}

// Export de l'instance singleton
export const teamServiceEnhanced = new TeamServiceEnhanced();
