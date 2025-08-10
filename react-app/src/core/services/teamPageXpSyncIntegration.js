// ==========================================
// 📁 react-app/src/core/services/teamPageXpSyncIntegration.js
// INTÉGRATION SYNCHRONISATION XP DANS LA PAGE ÉQUIPE
// ==========================================

import { useEffect, useState, useCallback } from 'react';
import { useTeamXpSync } from '../../shared/hooks/useTeamXpSync.js';
import { useTeamStore } from '../../shared/stores/teamStore.js';

/**
 * 🔄 COMPOSANT WRAPPER POUR INTÉGRER LA SYNCHRONISATION XP
 * À ajouter dans la page TeamPage.jsx existante
 */
export const TeamPageXpSyncWrapper = ({ children }) => {
  const [syncStats, setSyncStats] = useState({
    totalSynced: 0,
    lastSyncTime: null,
    activeSyncs: 0
  });

  // Hook de synchronisation XP équipe
  const { 
    initialized, 
    forceSync, 
    getDiagnostic 
  } = useTeamXpSync({
    autoStart: true,
    enableDiagnostic: true,
    onMemberXpUpdate: (userId, gamificationData) => {
      // Compter les synchronisations
      setSyncStats(prev => ({
        ...prev,
        totalSynced: prev.totalSynced + 1,
        lastSyncTime: new Date(),
        activeSyncs: prev.activeSyncs + 1
      }));

      // Log pour debug
      console.log(`🔄 [TEAM-PAGE] XP synchronisé pour ${userId}:`, {
        totalXp: gamificationData.totalXp,
        level: gamificationData.level
      });

      // Réduire le compteur actif après un délai
      setTimeout(() => {
        setSyncStats(prev => ({
          ...prev,
          activeSyncs: Math.max(0, prev.activeSyncs - 1)
        }));
      }, 2000);
    }
  });

  return (
    <>
      {children}
      
      {/* Indicateur de synchronisation (optionnel) */}
      {syncStats.activeSyncs > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm">
              Synchronisation XP... ({syncStats.activeSyncs})
            </span>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * 🎯 HOOK POUR BOUTON DE SYNCHRONISATION MANUELLE
 * À intégrer dans les boutons existants de la page équipe
 */
export const useTeamXpSyncButton = () => {
  const { forceSync } = useTeamXpSync();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleForceSync = useCallback(async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      console.log('🔄 [TEAM-PAGE] Synchronisation manuelle...');
      await forceSync();
      setLastSync(new Date());
      console.log('✅ [TEAM-PAGE] Synchronisation manuelle terminée');
    } catch (error) {
      console.error('❌ [TEAM-PAGE] Erreur synchronisation manuelle:', error);
    } finally {
      setSyncing(false);
    }
  }, [forceSync, syncing]);

  return {
    syncXp: handleForceSync,
    syncing,
    lastSync
  };
};

/**
 * 📊 COMPOSANT D'AFFICHAGE XP AVEC SYNCHRONISATION TEMPS RÉEL
 * Pour remplacer l'affichage XP statique dans les cartes membres
 */
export const MemberXpDisplay = ({ member, showLevel = true, showXp = true }) => {
  const [memberData, setMemberData] = useState(member);

  // Mettre à jour les données membre quand le store change
  const members = useTeamStore(state => state.members);
  
  useEffect(() => {
    const updatedMember = members.find(m => m.id === member.id);
    if (updatedMember) {
      setMemberData(updatedMember);
    }
  }, [members, member.id]);

  // Extraction sécurisée des données XP
  const getXpData = () => {
    const gamification = memberData.gamification || {};
    const teamStats = memberData.teamStats || {};
    
    return {
      totalXp: gamification.totalXp || teamStats.totalXp || 0,
      level: gamification.level || teamStats.level || 1,
      weeklyXp: gamification.weeklyXp || 0,
      tasksCompleted: gamification.tasksCompleted || teamStats.tasksCompleted || 0
    };
  };

  const xpData = getXpData();

  return (
    <div className="grid grid-cols-3 gap-3">
      {showLevel && (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{xpData.level}</div>
          <div className="text-xs text-gray-500">Niveau</div>
        </div>
      )}
      
      {showXp && (
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{xpData.totalXp}</div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
      )}
      
      <div className="text-center">
        <div className="text-lg font-bold text-green-400">{xpData.tasksCompleted}</div>
        <div className="text-xs text-gray-500">Tâches</div>
      </div>
    </div>
  );
};

/**
 * 📈 COMPOSANT STATISTIQUES ÉQUIPE AVEC XP SYNCHRONISÉS
 * Pour remplacer les stats statiques dans l'en-tête
 */
export const TeamStatsWithSync = () => {
  const stats = useTeamStore(state => state.stats);
  const members = useTeamStore(state => state.members);

  // Calculer les stats en temps réel depuis les membres
  const calculateRealTimeStats = () => {
    if (members.length === 0) return stats;

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

    return {
      ...stats,
      totalXP,
      totalTasks,
      averageLevel: Math.round(averageLevel * 10) / 10
    };
  };

  const realTimeStats = calculateRealTimeStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Membres actifs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{members.length}</h3>
            <p className="text-gray-400 text-sm">Membres actifs</p>
          </div>
        </div>
      </div>

      {/* XP Total équipe (temps réel) */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {realTimeStats.totalXP.toLocaleString()}
            </h3>
            <p className="text-gray-400 text-sm">XP Total</p>
          </div>
        </div>
      </div>

      {/* Niveau moyen (temps réel) */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{realTimeStats.averageLevel}</h3>
            <p className="text-gray-400 text-sm">Niveau moyen</p>
          </div>
        </div>
      </div>

      {/* Tâches total (temps réel) */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{realTimeStats.totalTasks}</h3>
            <p className="text-gray-400 text-sm">Tâches terminées</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 🔄 HOOK POUR STATUS DE SYNCHRONISATION
 * Affiche l'état de la synchronisation dans l'interface
 */
export const useTeamSyncStatus = () => {
  const { initialized, getDiagnostic } = useTeamXpSync({
    enableDiagnostic: true
  });

  const [syncStatus, setSyncStatus] = useState({
    active: false,
    memberCount: 0,
    lastUpdate: null
  });

  useEffect(() => {
    if (initialized) {
      const diagnostic = getDiagnostic();
      setSyncStatus({
        active: diagnostic?.initialized || false,
        memberCount: diagnostic?.activeListeners || 0,
        lastUpdate: new Date()
      });
    }
  }, [initialized, getDiagnostic]);

  return syncStatus;
};

// Imports nécessaires pour les icônes (à ajouter en haut du fichier)
import { Users, Zap, Award, CheckSquare } from 'lucide-react';

export default TeamPageXpSyncWrapper;
