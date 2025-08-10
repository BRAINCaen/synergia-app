// ==========================================
// 📁 react-app/src/core/services/teamXpSyncService.js
// SERVICE DE SYNCHRONISATION XP POUR ÉQUIPE EN TEMPS RÉEL
// ==========================================

import { 
  collection, 
  query, 
  onSnapshot,
  doc,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useTeamStore } from '../../shared/stores/teamStore.js';

/**
 * 🔄 SERVICE DE SYNCHRONISATION XP TEMPS RÉEL POUR ÉQUIPE
 * Écoute les changements XP de tous les membres et met à jour le store
 */
class TeamXpSyncService {
  constructor() {
    this.listeners = new Map();
    this.memberXpCache = new Map();
    this.initialized = false;
  }

  /**
   * 🚀 INITIALISER LA SYNCHRONISATION XP ÉQUIPE
   */
  async initializeTeamXpSync() {
    try {
      if (this.initialized) {
        console.log('⚠️ [TEAM-XP] Déjà initialisé');
        return;
      }

      console.log('🚀 [TEAM-XP] Initialisation synchronisation équipe...');
      
      // Récupérer tous les membres de l'équipe
      const teamMembers = await this.getTeamMemberIds();
      
      if (teamMembers.length === 0) {
        console.log('⚠️ [TEAM-XP] Aucun membre trouvé');
        return;
      }

      // Écouter les changements XP pour chaque membre
      teamMembers.forEach(memberId => {
        this.subscribeToMemberXp(memberId);
      });

      this.initialized = true;
      console.log(`✅ [TEAM-XP] Synchronisation initialisée pour ${teamMembers.length} membres`);
      
    } catch (error) {
      console.error('❌ [TEAM-XP] Erreur initialisation:', error);
    }
  }

  /**
   * 👥 RÉCUPÉRER LES IDS DES MEMBRES DE L'ÉQUIPE
   */
  async getTeamMemberIds() {
    try {
      // Récupérer depuis le store d'abord
      const storeMembers = useTeamStore.getState().members;
      if (storeMembers.length > 0) {
        return storeMembers.map(member => member.id).filter(Boolean);
      }

      // Sinon récupérer depuis Firebase
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      return usersSnapshot.docs.map(doc => doc.id);
      
    } catch (error) {
      console.error('❌ [TEAM-XP] Erreur récupération membres:', error);
      return [];
    }
  }

  /**
   * 📡 S'ABONNER AUX CHANGEMENTS XP D'UN MEMBRE
   */
  subscribeToMemberXp(memberId) {
    try {
      if (this.listeners.has(memberId)) {
        console.log(`⚠️ [TEAM-XP] Déjà abonné à ${memberId}`);
        return;
      }

      console.log(`📡 [TEAM-XP] Abonnement XP pour ${memberId}...`);
      
      const userRef = doc(db, 'users', memberId);
      
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const gamification = userData.gamification || {};
          
          // Vérifier si les XP ont changé
          const currentXp = gamification.totalXp || 0;
          const cachedXp = this.memberXpCache.get(memberId) || 0;
          
          if (currentXp !== cachedXp) {
            console.log(`🔄 [TEAM-XP] XP changé pour ${memberId}: ${cachedXp} → ${currentXp}`);
            
            // Mettre à jour le cache
            this.memberXpCache.set(memberId, currentXp);
            
            // Mettre à jour le store équipe
            this.updateMemberInStore(memberId, gamification);
          }
        }
      }, (error) => {
        console.error(`❌ [TEAM-XP] Erreur écoute ${memberId}:`, error);
      });
      
      this.listeners.set(memberId, unsubscribe);
      
    } catch (error) {
      console.error(`❌ [TEAM-XP] Erreur abonnement ${memberId}:`, error);
    }
  }

  /**
   * 🔄 METTRE À JOUR UN MEMBRE DANS LE STORE
   */
  updateMemberInStore(memberId, gamificationData) {
    try {
      const { members, updateMemberStats } = useTeamStore.getState();
      
      // Chercher le membre dans le store
      const memberIndex = members.findIndex(member => member.id === memberId);
      
      if (memberIndex === -1) {
        console.log(`⚠️ [TEAM-XP] Membre ${memberId} non trouvé dans store`);
        return;
      }

      const currentMember = members[memberIndex];
      
      // Créer les nouvelles données XP
      const updatedXpData = {
        totalXp: gamificationData.totalXp || 0,
        level: gamificationData.level || 1,
        weeklyXp: gamificationData.weeklyXp || 0,
        monthlyXp: gamificationData.monthlyXp || 0,
        tasksCompleted: gamificationData.tasksCompleted || 0,
        lastActivity: gamificationData.lastActivityAt || null
      };

      // Mettre à jour le membre dans le store
      useTeamStore.setState((state) => ({
        members: state.members.map((member, index) => 
          index === memberIndex 
            ? {
                ...member,
                gamification: {
                  ...member.gamification,
                  ...updatedXpData
                },
                // Aussi mettre à jour teamStats si présent
                teamStats: {
                  ...member.teamStats,
                  totalXp: updatedXpData.totalXp,
                  level: updatedXpData.level,
                  tasksCompleted: updatedXpData.tasksCompleted
                }
              }
            : member
        )
      }));

      console.log(`✅ [TEAM-XP] Membre ${memberId} mis à jour dans store:`, updatedXpData);
      
      // Recalculer les stats équipe
      this.updateTeamStats();
      
    } catch (error) {
      console.error(`❌ [TEAM-XP] Erreur mise à jour store ${memberId}:`, error);
    }
  }

  /**
   * 📊 METTRE À JOUR LES STATISTIQUES ÉQUIPE
   */
  updateTeamStats() {
    try {
      const { members } = useTeamStore.getState();
      
      const totalXP = members.reduce((sum, member) => {
        const memberXp = member.gamification?.totalXp || member.teamStats?.totalXp || 0;
        return sum + memberXp;
      }, 0);
      
      const totalTasks = members.reduce((sum, member) => {
        const memberTasks = member.gamification?.tasksCompleted || member.teamStats?.tasksCompleted || 0;
        return sum + memberTasks;
      }, 0);
      
      const averageLevel = members.length > 0 
        ? members.reduce((sum, member) => {
            const memberLevel = member.gamification?.level || member.teamStats?.level || 1;
            return sum + memberLevel;
          }, 0) / members.length
        : 1;

      // Trouver le top performer
      const topPerformer = members.reduce((top, member) => {
        const memberXp = member.gamification?.totalXp || member.teamStats?.totalXp || 0;
        const topXp = top?.gamification?.totalXp || top?.teamStats?.totalXp || 0;
        return memberXp > topXp ? member : top;
      }, null);

      // Mettre à jour les stats dans le store
      useTeamStore.setState((state) => ({
        stats: {
          ...state.stats,
          totalXP: totalXP,
          averageLevel: Math.round(averageLevel * 10) / 10,
          totalTasks: totalTasks,
          topPerformer: topPerformer
        }
      }));

      console.log('📊 [TEAM-XP] Stats équipe mises à jour:', {
        totalXP,
        averageLevel: Math.round(averageLevel * 10) / 10,
        totalTasks,
        topPerformer: topPerformer?.profile?.displayName || 'Aucun'
      });
      
    } catch (error) {
      console.error('❌ [TEAM-XP] Erreur mise à jour stats:', error);
    }
  }

  /**
   * 👤 AJOUTER UN NOUVEAU MEMBRE AU SUIVI
   */
  addMemberToSync(memberId) {
    if (!this.listeners.has(memberId)) {
      this.subscribeToMemberXp(memberId);
      console.log(`➕ [TEAM-XP] Nouveau membre ajouté au suivi: ${memberId}`);
    }
  }

  /**
   * 🗑️ SUPPRIMER UN MEMBRE DU SUIVI
   */
  removeMemberFromSync(memberId) {
    const unsubscribe = this.listeners.get(memberId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(memberId);
      this.memberXpCache.delete(memberId);
      console.log(`➖ [TEAM-XP] Membre retiré du suivi: ${memberId}`);
    }
  }

  /**
   * 🔄 FORCER LA SYNCHRONISATION DE TOUS LES MEMBRES
   */
  async forceSyncAllMembers() {
    try {
      console.log('🔄 [TEAM-XP] Synchronisation forcée de tous les membres...');
      
      const teamMembers = await this.getTeamMemberIds();
      
      for (const memberId of teamMembers) {
        // Récupérer les données actuelles
        const userRef = doc(db, 'users', memberId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const gamification = userData.gamification || {};
          
          // Forcer la mise à jour du cache et du store
          this.memberXpCache.set(memberId, gamification.totalXp || 0);
          this.updateMemberInStore(memberId, gamification);
        }
      }
      
      console.log('✅ [TEAM-XP] Synchronisation forcée terminée');
      
    } catch (error) {
      console.error('❌ [TEAM-XP] Erreur synchronisation forcée:', error);
    }
  }

  /**
   * 🧹 NETTOYER TOUTES LES RESSOURCES
   */
  cleanup() {
    console.log('🧹 [TEAM-XP] Nettoyage du service...');
    
    // Désabonner tous les listeners
    this.listeners.forEach((unsubscribe, memberId) => {
      try {
        unsubscribe();
        console.log(`🗑️ [TEAM-XP] Listener ${memberId} nettoyé`);
      } catch (error) {
        console.error(`❌ [TEAM-XP] Erreur nettoyage ${memberId}:`, error);
      }
    });
    
    // Vider les caches
    this.listeners.clear();
    this.memberXpCache.clear();
    this.initialized = false;
    
    console.log('✅ [TEAM-XP] Service nettoyé');
  }

  /**
   * 🔍 DIAGNOSTIC DU SERVICE
   */
  getDiagnostic() {
    return {
      initialized: this.initialized,
      activeListeners: this.listeners.size,
      cachedMembers: this.memberXpCache.size,
      membersInCache: Array.from(this.memberXpCache.keys()),
      cacheData: Object.fromEntries(this.memberXpCache)
    };
  }
}

// Export de l'instance singleton
export const teamXpSyncService = new TeamXpSyncService();

// Export par défaut
export default teamXpSyncService;

console.log('✅ [TEAM-XP] Service de synchronisation XP équipe chargé');
