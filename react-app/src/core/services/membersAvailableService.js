// ==========================================
// 📁 react-app/src/core/services/membersAvailableService.js
// CORRECTION BUG CHARGEMENT MEMBRES - SANS RÉFÉRENCE USER UNDEFINED
// ==========================================

import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 👥 SERVICE SPÉCIALISÉ POUR RÉCUPÉRER LES MEMBRES DISPONIBLES
 * Corrige le bug "user is not defined" dans le chargement des membres
 */
class MembersAvailableService {
  
  constructor() {
    this.cache = new Map();
    this.lastFetch = null;
    console.log('👥 MembersAvailableService initialisé');
  }

  /**
   * 📋 RÉCUPÉRER TOUS LES MEMBRES DISPONIBLES POUR ASSIGNATION
   * Version corrigée sans référence à "user" undefined
   */
  async getAllAvailableMembers() {
    try {
      console.log('👥 Chargement membres disponibles - Version corrigée...');
      
      // Cache de 5 minutes pour éviter les requêtes répétées
      if (this.lastFetch && (Date.now() - this.lastFetch) < 300000) {
        console.log('📄 Utilisation du cache membres');
        return this.cache.get('availableMembers') || [];
      }
      
      const members = [];
      
      // 1️⃣ RÉCUPÉRER DEPUIS LA COLLECTION USERS
      await this.loadFromUsersCollection(members);
      
      // 2️⃣ RÉCUPÉRER DEPUIS LA COLLECTION TEAMMEMBERS SI ELLE EXISTE
      await this.loadFromTeamMembersCollection(members);
      
      // 3️⃣ DÉDUPLICATION ET TRI
      const uniqueMembers = this.deduplicateMembers(members);
      const sortedMembers = this.sortMembers(uniqueMembers);
      
      // Mise en cache
      this.cache.set('availableMembers', sortedMembers);
      this.lastFetch = Date.now();
      
      console.log(`✅ ${sortedMembers.length} membres disponibles chargés`);
      
      return sortedMembers;
      
    } catch (error) {
      console.error('❌ Erreur chargement membres disponibles:', error);
      // Retourner le cache en cas d'erreur
      return this.cache.get('availableMembers') || [];
    }
  }

  /**
   * 📂 CHARGER DEPUIS LA COLLECTION USERS
   */
  async loadFromUsersCollection(members) {
    try {
      console.log('📂 Chargement depuis collection users...');
      
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let count = 0;
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        
        // Vérifier que l'utilisateur a un email (critère minimum)
        if (userData.email) {
          const member = this.createMemberFromUserData(doc.id, userData);
          members.push(member);
          count++;
        }
      });
      
      console.log(`✅ ${count} membres chargés depuis users`);
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement users:', error);
    }
  }

  /**
   * 👥 CHARGER DEPUIS LA COLLECTION TEAMMEMBERS
   */
  async loadFromTeamMembersCollection(members) {
    try {
      console.log('📂 Chargement depuis collection teamMembers...');
      
      const teamSnapshot = await getDocs(collection(db, 'teamMembers'));
      let count = 0;
      
      teamSnapshot.forEach(doc => {
        const teamData = doc.data();
        
        // Vérifier que le membre a des données valides
        if (teamData.email || teamData.displayName) {
          // Vérifier qu'il n'existe pas déjà dans la liste
          const exists = members.find(m => m.id === doc.id);
          
          if (!exists) {
            const member = this.createMemberFromTeamData(doc.id, teamData);
            members.push(member);
            count++;
          } else {
            // Enrichir les données existantes
            this.enrichExistingMember(exists, teamData);
          }
        }
      });
      
      console.log(`✅ ${count} membres supplémentaires chargés depuis teamMembers`);
      
    } catch (error) {
      console.warn('⚠️ Erreur chargement teamMembers:', error);
    }
  }

  /**
   * 👤 CRÉER MEMBRE DEPUIS DONNÉES USER
   */
  createMemberFromUserData(userId, userData) {
    return {
      id: userId,
      uid: userId,
      name: userData.profile?.displayName || 
            userData.displayName || 
            userData.email?.split('@')[0] || 
            'Utilisateur',
      email: userData.email,
      avatar: userData.photoURL || userData.profile?.avatar || null,
      role: userData.profile?.role || userData.role || 'member',
      level: userData.gamification?.level || userData.level || 1,
      totalXp: userData.gamification?.totalXp || userData.totalXp || 0,
      tasksCompleted: userData.gamification?.tasksCompleted || userData.tasksCompleted || 0,
      isActive: userData.isActive !== false, // Par défaut true
      lastActivity: userData.gamification?.lastActivityDate || userData.lastActivity,
      department: userData.profile?.department || userData.department || 'general',
      joinedAt: userData.createdAt || new Date().toISOString(),
      source: 'users'
    };
  }

  /**
   * 👥 CRÉER MEMBRE DEPUIS DONNÉES TEAM
   */
  createMemberFromTeamData(userId, teamData) {
    return {
      id: userId,
      uid: userId,
      name: teamData.displayName || 
            teamData.name || 
            teamData.email?.split('@')[0] || 
            'Utilisateur Équipe',
      email: teamData.email || 'email@inconnu.com',
      avatar: teamData.photoURL || teamData.avatar || null,
      role: teamData.role || 'member',
      level: teamData.teamStats?.level || teamData.level || 1,
      totalXp: teamData.teamStats?.totalXp || teamData.totalXp || 0,
      tasksCompleted: teamData.teamStats?.tasksCompleted || teamData.tasksCompleted || 0,
      isActive: teamData.status !== 'inactive',
      lastActivity: teamData.updatedAt || teamData.lastActivity,
      department: teamData.department || 'general',
      joinedAt: teamData.createdAt || new Date().toISOString(),
      source: 'teamMembers'
    };
  }

  /**
   * 🔄 ENRICHIR MEMBRE EXISTANT
   */
  enrichExistingMember(existingMember, teamData) {
    // Ajouter données d'équipe si elles sont plus complètes
    if (!existingMember.level && teamData.teamStats?.level) {
      existingMember.level = teamData.teamStats.level;
    }
    
    if (!existingMember.totalXp && teamData.teamStats?.totalXp) {
      existingMember.totalXp = teamData.teamStats.totalXp;
    }
    
    if (!existingMember.tasksCompleted && teamData.teamStats?.tasksCompleted) {
      existingMember.tasksCompleted = teamData.teamStats.tasksCompleted;
    }
    
    if (!existingMember.department && teamData.department) {
      existingMember.department = teamData.department;
    }
  }

  /**
   * 🔄 DÉDUPLIQUER LES MEMBRES
   */
  deduplicateMembers(members) {
    const uniqueMap = new Map();
    
    members.forEach(member => {
      const existing = uniqueMap.get(member.id);
      
      if (!existing) {
        uniqueMap.set(member.id, member);
      } else {
        // Garder celui avec le plus de données
        if (this.getMemberCompleteness(member) > this.getMemberCompleteness(existing)) {
          uniqueMap.set(member.id, member);
        }
      }
    });
    
    return Array.from(uniqueMap.values());
  }

  /**
   * 📊 CALCULER LE NIVEAU DE COMPLÉTUDE D'UN MEMBRE
   */
  getMemberCompleteness(member) {
    let score = 0;
    
    if (member.name) score += 1;
    if (member.email) score += 1;
    if (member.avatar) score += 1;
    if (member.level > 1) score += 1;
    if (member.totalXp > 0) score += 1;
    if (member.tasksCompleted > 0) score += 1;
    if (member.department !== 'general') score += 1;
    
    return score;
  }

  /**
   * 📊 TRIER LES MEMBRES
   */
  sortMembers(members) {
    return members.sort((a, b) => {
      // 1. Membres actifs en premier
      if (a.isActive !== b.isActive) {
        return b.isActive ? 1 : -1;
      }
      
      // 2. Par niveau décroissant
      if (a.level !== b.level) {
        return b.level - a.level;
      }
      
      // 3. Par XP décroissant
      if (a.totalXp !== b.totalXp) {
        return b.totalXp - a.totalXp;
      }
      
      // 4. Par nom alphabétique
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * 🔍 RECHERCHER MEMBRES
   */
  searchMembers(searchTerm) {
    const allMembers = this.cache.get('availableMembers') || [];
    
    if (!searchTerm.trim()) {
      return allMembers;
    }
    
    const term = searchTerm.toLowerCase();
    
    return allMembers.filter(member => 
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.department.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term)
    );
  }

  /**
   * 🔄 FORCER LE RECHARGEMENT
   */
  async forceReload() {
    this.cache.clear();
    this.lastFetch = null;
    return await this.getAllAvailableMembers();
  }

  /**
   * 📊 OBTENIR STATISTIQUES DES MEMBRES
   */
  getMembersStats() {
    const members = this.cache.get('availableMembers') || [];
    
    return {
      total: members.length,
      active: members.filter(m => m.isActive).length,
      inactive: members.filter(m => !m.isActive).length,
      totalXp: members.reduce((sum, m) => sum + m.totalXp, 0),
      averageLevel: members.length > 0 ? 
        Math.round(members.reduce((sum, m) => sum + m.level, 0) / members.length) : 0,
      departments: [...new Set(members.map(m => m.department))].length
    };
  }
}

// Export de l'instance singleton
export const membersAvailableService = new MembersAvailableService();
export default MembersAvailableService;
