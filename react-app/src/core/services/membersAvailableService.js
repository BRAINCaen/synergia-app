// ==========================================
// 📁 react-app/src/core/services/membersAvailableService.js
// CORRECTION BUG CHARGEMENT MEMBRES - SANS RÉFÉRENCE USER UNDEFINED
// ==========================================

import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where
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
    this.CACHE_DURATION = 300000; // 5 minutes
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
      if (this.lastFetch && (Date.now() - this.lastFetch) < this.CACHE_DURATION) {
        const cachedMembers = this.cache.get('availableMembers');
        if (cachedMembers && cachedMembers.length > 0) {
          console.log('📄 Utilisation du cache membres:', cachedMembers.length);
          return cachedMembers;
        }
      }
      
      const members = [];
      
      // 1️⃣ RÉCUPÉRER DEPUIS LA COLLECTION USERS
      await this.loadFromUsersCollection(members);
      
      // 2️⃣ RÉCUPÉRER DEPUIS LA COLLECTION TEAMMEMBERS SI ELLE EXISTE
      await this.loadFromTeamMembersCollection(members);
      
      // 3️⃣ SI AUCUN MEMBRE TROUVÉ, CRÉER DES MEMBRES DE DÉMONSTRATION
      if (members.length === 0) {
        console.log('⚠️ Aucun membre trouvé, création de membres de démo...');
        await this.createDemoMembers(members);
      }
      
      // 4️⃣ DÉDUPLICATION ET TRI
      const uniqueMembers = this.deduplicateMembers(members);
      const sortedMembers = this.sortMembers(uniqueMembers);
      
      // Mise en cache
      this.cache.set('availableMembers', sortedMembers);
      this.lastFetch = Date.now();
      
      console.log(`✅ ${sortedMembers.length} membres disponibles chargés`);
      
      return sortedMembers;
      
    } catch (error) {
      console.error('❌ Erreur chargement membres disponibles:', error);
      
      // Fallback : retourner le cache même périmé
      const cachedMembers = this.cache.get('availableMembers');
      if (cachedMembers && cachedMembers.length > 0) {
        console.log('🔄 Utilisation du cache périmé en fallback');
        return cachedMembers;
      }
      
      // Dernier recours : membres statiques
      return this.getStaticMembers();
    }
  }

  /**
   * 👤 CHARGER DEPUIS LA COLLECTION USERS
   */
  async loadFromUsersCollection(members) {
    try {
      console.log('👤 Chargement depuis collection users...');
      
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('displayName', 'asc'),
        limit(50)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        
        // Vérifier que les données sont valides
        if (userData && (userData.displayName || userData.email)) {
          members.push({
            id: doc.id,
            name: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
            email: userData.email || `${doc.id}@example.com`,
            avatar: userData.photoURL || null,
            role: userData.role || 'member',
            isActive: userData.isActive !== false, // true par défaut
            department: userData.department || 'General',
            source: 'users',
            lastSeen: userData.lastLoginAt || userData.createdAt || new Date().toISOString()
          });
        }
      });
      
      console.log(`📊 ${members.length} membres trouvés dans users`);
      
    } catch (error) {
      console.error('❌ Erreur chargement collection users:', error);
      // Continuer sans faire planter
    }
  }

  /**
   * 👥 CHARGER DEPUIS LA COLLECTION TEAMMEMBERS
   */
  async loadFromTeamMembersCollection(members) {
    try {
      console.log('👥 Chargement depuis collection teamMembers...');
      
      const teamQuery = query(
        collection(db, 'teamMembers'),
        orderBy('name', 'asc'),
        limit(50)
      );
      
      const teamSnapshot = await getDocs(teamQuery);
      
      teamSnapshot.forEach((doc) => {
        const teamData = doc.data();
        
        // Vérifier que les données sont valides
        if (teamData && teamData.name) {
          members.push({
            id: doc.id,
            name: teamData.name,
            email: teamData.email || `${teamData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            avatar: teamData.avatar || teamData.photoURL || null,
            role: teamData.role || 'team_member',
            isActive: teamData.isActive !== false,
            department: teamData.department || teamData.team || 'Team',
            source: 'teamMembers',
            skills: teamData.skills || [],
            lastSeen: teamData.lastActive || new Date().toISOString()
          });
        }
      });
      
      console.log(`📊 +${members.filter(m => m.source === 'teamMembers').length} membres trouvés dans teamMembers`);
      
    } catch (error) {
      console.error('❌ Erreur chargement collection teamMembers:', error);
      // Continuer sans faire planter
    }
  }

  /**
   * 🎭 CRÉER DES MEMBRES DE DÉMONSTRATION
   */
  async createDemoMembers(members) {
    const demoMembers = [
      {
        id: 'demo_admin',
        name: 'Administrateur',
        email: 'admin@synergia.local',
        avatar: null,
        role: 'admin',
        isActive: true,
        department: 'Administration',
        source: 'demo',
        lastSeen: new Date().toISOString()
      },
      {
        id: 'demo_manager',
        name: 'Chef de Projet',
        email: 'manager@synergia.local',
        avatar: null,
        role: 'manager',
        isActive: true,
        department: 'Management',
        source: 'demo',
        lastSeen: new Date().toISOString()
      },
      {
        id: 'demo_dev',
        name: 'Développeur',
        email: 'dev@synergia.local',
        avatar: null,
        role: 'developer',
        isActive: true,
        department: 'Technique',
        source: 'demo',
        skills: ['React', 'Firebase', 'JavaScript'],
        lastSeen: new Date().toISOString()
      },
      {
        id: 'demo_designer',
        name: 'Designer',
        email: 'design@synergia.local',
        avatar: null,
        role: 'designer',
        isActive: true,
        department: 'Créatif',
        source: 'demo',
        skills: ['UI/UX', 'Figma', 'Photoshop'],
        lastSeen: new Date().toISOString()
      }
    ];

    members.push(...demoMembers);
    console.log('🎭 Membres de démonstration créés');
  }

  /**
   * 🔄 DÉDUPLICATION DES MEMBRES
   */
  deduplicateMembers(members) {
    const seen = new Set();
    const uniqueMembers = [];
    
    for (const member of members) {
      // Utiliser l'email comme clé de déduplication
      const key = member.email?.toLowerCase();
      
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueMembers.push(member);
      } else if (!key) {
        // Ajouter même sans email si ID unique
        const idKey = `id_${member.id}`;
        if (!seen.has(idKey)) {
          seen.add(idKey);
          uniqueMembers.push(member);
        }
      }
    }
    
    console.log(`🔄 Déduplication: ${members.length} → ${uniqueMembers.length} membres`);
    return uniqueMembers;
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
      
      // 2. Admins et managers en premier
      const roleOrder = { admin: 0, manager: 1, developer: 2, designer: 3 };
      const aOrder = roleOrder[a.role] ?? 9;
      const bOrder = roleOrder[b.role] ?? 9;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // 3. Alphabétique par nom
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * 📋 MEMBRES STATIQUES POUR FALLBACK
   */
  getStaticMembers() {
    return [
      {
        id: 'static_admin',
        name: 'Admin Système',
        email: 'admin@system.local',
        avatar: null,
        role: 'admin',
        isActive: true,
        department: 'Système',
        source: 'static'
      },
      {
        id: 'static_user',
        name: 'Utilisateur Type',
        email: 'user@system.local',
        avatar: null,
        role: 'member',
        isActive: true,
        department: 'Général',
        source: 'static'
      }
    ];
  }

  /**
   * 🔄 FORCER LE RECHARGEMENT
   */
  async forceReload() {
    console.log('🔄 Rechargement forcé des membres...');
    this.cache.clear();
    this.lastFetch = null;
    return await this.getAllAvailableMembers();
  }

  /**
   * 🗑️ VIDER LE CACHE
   */
  clearCache() {
    this.cache.clear();
    this.lastFetch = null;
    console.log('🗑️ Cache membres vidé');
  }

  /**
   * 👤 RÉCUPÉRER UN MEMBRE PAR ID
   */
  async getMemberById(memberId) {
    try {
      const allMembers = await this.getAllAvailableMembers();
      return allMembers.find(member => member.id === memberId) || null;
    } catch (error) {
      console.error('❌ Erreur récupération membre par ID:', error);
      return null;
    }
  }

  /**
   * 🔍 RECHERCHER DES MEMBRES
   */
  async searchMembers(searchTerm, filters = {}) {
    try {
      const allMembers = await this.getAllAvailableMembers();
      
      if (!searchTerm && Object.keys(filters).length === 0) {
        return allMembers;
      }
      
      return allMembers.filter(member => {
        // Filtre par terme de recherche
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesSearch = 
            member.name.toLowerCase().includes(term) ||
            member.email.toLowerCase().includes(term) ||
            (member.department && member.department.toLowerCase().includes(term));
          
          if (!matchesSearch) return false;
        }
        
        // Filtres additionnels
        if (filters.role && member.role !== filters.role) return false;
        if (filters.department && member.department !== filters.department) return false;
        if (filters.isActive !== undefined && member.isActive !== filters.isActive) return false;
        
        return true;
      });
      
    } catch (error) {
      console.error('❌ Erreur recherche membres:', error);
      return [];
    }
  }

  /**
   * 📊 OBTENIR LES STATISTIQUES DES MEMBRES
   */
  async getMembersStats() {
    try {
      const allMembers = await this.getAllAvailableMembers();
      
      const stats = {
        total: allMembers.length,
        active: allMembers.filter(m => m.isActive).length,
        inactive: allMembers.filter(m => !m.isActive).length,
        byRole: {},
        byDepartment: {},
        sources: {}
      };
      
      allMembers.forEach(member => {
        // Par rôle
        stats.byRole[member.role] = (stats.byRole[member.role] || 0) + 1;
        
        // Par département
        stats.byDepartment[member.department] = (stats.byDepartment[member.department] || 0) + 1;
        
        // Par source
        stats.sources[member.source] = (stats.sources[member.source] || 0) + 1;
      });
      
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur statistiques membres:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {},
        byDepartment: {},
        sources: {}
      };
    }
  }
}

// Créer et exporter une instance unique
const membersAvailableService = new MembersAvailableService();
export { membersAvailableService };
