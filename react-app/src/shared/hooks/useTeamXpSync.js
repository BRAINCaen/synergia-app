// ==========================================
// 📁 react-app/src/shared/hooks/useTeamXpSync.js
// HOOK POUR SYNCHRONISATION XP TEMPS RÉEL ÉQUIPE
// ==========================================

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useTeamStore } from '../stores/teamStore.js';
import { teamXpSyncService } from '../../core/services/teamXpSyncService.js';

/**
 * 🔄 HOOK POUR SYNCHRONISATION XP TEMPS RÉEL DE L'ÉQUIPE
 * Garantit que tous les XP sont mis à jour en temps réel sur la page équipe
 */
export const useTeamXpSync = (options = {}) => {
  const { 
    autoStart = true,
    enableDiagnostic = false,
    onMemberXpUpdate = null 
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  const { members, loading } = useTeamStore();
  
  const syncInitialized = useRef(false);
  const lastMembersCount = useRef(0);

  /**
   * 🚀 INITIALISER LA SYNCHRONISATION
   */
  const initializeSync = useCallback(async () => {
    if (!isAuthenticated || loading || syncInitialized.current) {
      return;
    }

    try {
      console.log('🚀 [TEAM-XP-HOOK] Initialisation synchronisation...');
      
      await teamXpSyncService.initializeTeamXpSync();
      syncInitialized.current = true;
      
      console.log('✅ [TEAM-XP-HOOK] Synchronisation initialisée');
      
    } catch (error) {
      console.error('❌ [TEAM-XP-HOOK] Erreur initialisation:', error);
    }
  }, [isAuthenticated, loading]);

  /**
   * 🔄 FORCER LA SYNCHRONISATION
   */
  const forceSync = useCallback(async () => {
    try {
      console.log('🔄 [TEAM-XP-HOOK] Synchronisation forcée...');
      await teamXpSyncService.forceSyncAllMembers();
      console.log('✅ [TEAM-XP-HOOK] Synchronisation forcée terminée');
    } catch (error) {
      console.error('❌ [TEAM-XP-HOOK] Erreur sync forcée:', error);
    }
  }, []);

  /**
   * 👥 GÉRER L'AJOUT/SUPPRESSION DE MEMBRES
   */
  const handleMembersChange = useCallback(() => {
    if (!syncInitialized.current || members.length === 0) {
      return;
    }

    const currentCount = members.length;
    const previousCount = lastMembersCount.current;

    if (currentCount !== previousCount) {
      console.log(`👥 [TEAM-XP-HOOK] Changement membres: ${previousCount} → ${currentCount}`);
      
      if (currentCount > previousCount) {
        // Nouveaux membres ajoutés
        const newMembers = members.slice(previousCount);
        newMembers.forEach(member => {
          if (member.id) {
            teamXpSyncService.addMemberToSync(member.id);
          }
        });
      }
      
      lastMembersCount.current = currentCount;
    }
  }, [members]);

  /**
   * 🔍 OBTENIR LE DIAGNOSTIC
   */
  const getDiagnostic = useCallback(() => {
    if (!enableDiagnostic) {
      return null;
    }
    
    return {
      ...teamXpSyncService.getDiagnostic(),
      hookState: {
        syncInitialized: syncInitialized.current,
        membersCount: members.length,
        lastMembersCount: lastMembersCount.current,
        userAuthenticated: isAuthenticated,
        loading
      }
    };
  }, [enableDiagnostic, members.length, isAuthenticated, loading]);

  // ✅ EFFET PRINCIPAL - INITIALISATION AUTO
  useEffect(() => {
    if (autoStart && isAuthenticated && !loading && members.length > 0) {
      initializeSync();
    }
  }, [autoStart, isAuthenticated, loading, members.length, initializeSync]);

  // ✅ EFFET - SURVEILLANCE CHANGEMENTS MEMBRES
  useEffect(() => {
    handleMembersChange();
  }, [members, handleMembersChange]);

  // ✅ EFFET - ÉCOUTER LES MISES À JOUR XP
  useEffect(() => {
    if (!onMemberXpUpdate) {
      return;
    }

    const handleXpUpdate = (event) => {
      const { userId, gamificationData } = event.detail;
      onMemberXpUpdate(userId, gamificationData);
    };

    window.addEventListener('xpUpdated', handleXpUpdate);
    
    return () => {
      window.removeEventListener('xpUpdated', handleXpUpdate);
    };
  }, [onMemberXpUpdate]);

  // ✅ NETTOYAGE AU DÉMONTAGE
  useEffect(() => {
    return () => {
      if (syncInitialized.current) {
        console.log('🧹 [TEAM-XP-HOOK] Nettoyage...');
        teamXpSyncService.cleanup();
        syncInitialized.current = false;
      }
    };
  }, []);

  return {
    // ✅ États
    initialized: syncInitialized.current,
    membersCount: members.length,
    
    // ✅ Actions
    initializeSync,
    forceSync,
    
    // ✅ Utilitaires
    getDiagnostic,
    
    // ✅ Service direct (pour usage avancé)
    service: teamXpSyncService
  };
};

/**
 * 🎯 HOOK SIMPLIFIÉ POUR USAGE BASIQUE
 */
export const useTeamXpSyncSimple = () => {
  const { initialized, forceSync } = useTeamXpSync({
    autoStart: true,
    enableDiagnostic: false
  });

  return {
    synchronized: initialized,
    refresh: forceSync
  };
};

/**
 * 🔍 HOOK AVEC DIAGNOSTIC POUR DEBUG
 */
export const useTeamXpSyncDebug = () => {
  const sync = useTeamXpSync({
    autoStart: true,
    enableDiagnostic: true,
    onMemberXpUpdate: (userId, gamificationData) => {
      console.log(`🔄 [DEBUG] XP mis à jour pour ${userId}:`, gamificationData);
    }
  });

  return {
    ...sync,
    log: () => {
      const diagnostic = sync.getDiagnostic();
      console.table(diagnostic);
      return diagnostic;
    }
  };
};

export default useTeamXpSync;
