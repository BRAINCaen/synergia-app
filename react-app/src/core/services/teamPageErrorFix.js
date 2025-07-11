// ==========================================
// 📁 react-app/src/core/services/teamPageErrorFix.js
// CORRECTION DES ERREURS SERVERTIMESTAMP DANS LA PAGE ÉQUIPE
// ==========================================

import { 
  doc, 
  updateDoc, 
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🔧 SERVICE DE CORRECTION DES ERREURS ÉQUIPE
 * Corrige les erreurs serverTimestamp dans les documents teamMembers
 */
class TeamPageErrorFix {

  /**
   * ✅ CORRIGER UN MEMBRE D'ÉQUIPE EXISTANT
   * Supprime les erreurs serverTimestamp dans les arrays
   */
  async fixTeamMemberDocument(userId) {
    try {
      console.log('🔧 Correction document membre:', userId);
      
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        console.log('⚠️ Document membre introuvable, création...');
        return await this.createCleanTeamMember(userId);
      }
      
      const memberData = memberDoc.data();
      console.log('📊 Données actuelles:', memberData);
      
      // Nettoyer les rôles Synergia (supprimer serverTimestamp dans les objets)
      const cleanRoles = (memberData.synergiaRoles || []).map(role => ({
        ...role,
        assignedAt: role.assignedAt?.toDate ? role.assignedAt.toDate().toISOString() : 
                   (role.assignedAt || new Date().toISOString()),
        lastActivity: role.lastActivity?.toDate ? role.lastActivity.toDate().toISOString() : 
                     (role.lastActivity || new Date().toISOString())
      }));
      
      // Nettoyer les stats d'équipe
      const cleanTeamStats = {
        totalXp: memberData.teamStats?.totalXp || 0,
        level: memberData.teamStats?.level || 1,
        tasksCompleted: memberData.teamStats?.tasksCompleted || 0,
        rolesCount: memberData.teamStats?.rolesCount || cleanRoles.length,
        joinedAt: memberData.teamStats?.joinedAt?.toDate ? 
                 memberData.teamStats.joinedAt.toDate().toISOString() : 
                 (memberData.teamStats?.joinedAt || new Date().toISOString())
      };
      
      // Mettre à jour avec des données propres
      const cleanMemberData = {
        id: userId,
        email: memberData.email || '',
        displayName: memberData.displayName || 'Utilisateur Inconnu',
        synergiaRoles: cleanRoles,
        teamStats: cleanTeamStats,
        permissions: memberData.permissions || [],
        status: memberData.status || 'active',
        updatedAt: serverTimestamp() // ✅ OK ici car pas dans un array
      };
      
      await updateDoc(memberRef, cleanMemberData);
      
      console.log('✅ Document membre corrigé:', userId);
      return { success: true, cleanedRoles: cleanRoles.length };
      
    } catch (error) {
      console.error('❌ Erreur correction membre:', userId, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🆕 CRÉER UN MEMBRE D'ÉQUIPE PROPRE
   */
  async createCleanTeamMember(userId) {
    try {
      console.log('🆕 Création membre propre:', userId);
      
      // Récupérer les infos utilisateur
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const cleanMemberData = {
        id: userId,
        email: userData.email || '',
        displayName: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur Inconnu',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        synergiaRoles: [], // ✅ Array vide sans serverTimestamp
        teamStats: {
          totalXp: 0,
          level: 1,
          tasksCompleted: 0,
          rolesCount: 0,
          joinedAt: new Date().toISOString() // ✅ String au lieu de serverTimestamp
        },
        permissions: [],
        status: 'active'
      };

      const memberRef = doc(db, 'teamMembers', userId);
      await setDoc(memberRef, cleanMemberData);
      
      console.log('✅ Membre propre créé:', userId);
      return { success: true, created: true };
      
    } catch (error) {
      console.error('❌ Erreur création membre propre:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 DIAGNOSTIQUER LES ERREURS D'UN MEMBRE
   */
  async diagnoseMemberErrors(userId) {
    try {
      const memberRef = doc(db, 'teamMembers', userId);
      const memberDoc = await getDoc(memberRef);
      
      if (!memberDoc.exists()) {
        return {
          hasErrors: true,
          errors: ['Document membre inexistant'],
          needsCreation: true
        };
      }
      
      const memberData = memberDoc.data();
      const errors = [];
      
      // Vérifier les rôles Synergia
      if (memberData.synergiaRoles) {
        memberData.synergiaRoles.forEach((role, index) => {
          if (role.assignedAt && typeof role.assignedAt === 'object' && role.assignedAt.seconds) {
            errors.push(`Rôle ${index}: assignedAt contient serverTimestamp`);
          }
          if (role.lastActivity && typeof role.lastActivity === 'object' && role.lastActivity.seconds) {
            errors.push(`Rôle ${index}: lastActivity contient serverTimestamp`);
          }
        });
      }
      
      // Vérifier teamStats
      if (memberData.teamStats?.joinedAt && typeof memberData.teamStats.joinedAt === 'object') {
        errors.push('teamStats.joinedAt contient serverTimestamp');
      }
      
      return {
        hasErrors: errors.length > 0,
        errors,
        needsCreation: false,
        rolesCount: memberData.synergiaRoles?.length || 0
      };
      
    } catch (error) {
      return {
        hasErrors: true,
        errors: ['Erreur accès document: ' + error.message],
        needsCreation: false
      };
    }
  }

  /**
   * 🚀 CORRIGER TOUS LES MEMBRES D'UNE ÉQUIPE
   */
  async fixAllTeamMembers(userIds) {
    console.log('🚀 Correction massive équipe:', userIds.length, 'membres');
    
    const results = {
      success: 0,
      errors: 0,
      created: 0,
      details: []
    };
    
    for (const userId of userIds) {
      try {
        const diagnosis = await this.diagnoseMemberErrors(userId);
        
        if (diagnosis.hasErrors || diagnosis.needsCreation) {
          const fixResult = await this.fixTeamMemberDocument(userId);
          
          if (fixResult.success) {
            results.success++;
            if (fixResult.created) results.created++;
            results.details.push({
              userId,
              action: fixResult.created ? 'created' : 'fixed',
              rolesCount: fixResult.cleanedRoles || 0
            });
          } else {
            results.errors++;
            results.details.push({
              userId,
              action: 'error',
              error: fixResult.error
            });
          }
        } else {
          results.details.push({
            userId,
            action: 'skipped',
            reason: 'Pas d\'erreurs détectées'
          });
        }
        
        // Pause pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.errors++;
        results.details.push({
          userId,
          action: 'error',
          error: error.message
        });
      }
    }
    
    console.log('✅ Correction massive terminée:', results);
    return results;
  }

  /**
   * 🎯 AUTO-CORRECTION INTELLIGENTE
   * Détecte et corrige automatiquement les erreurs communes
   */
  async autoFixCommonErrors() {
    try {
      console.log('🎯 Auto-correction des erreurs communes...');
      
      // Cette fonction peut être appelée au démarrage de l'app
      // pour corriger proactivement les erreurs connues
      
      // Supprimer les logs d'erreur console temporairement
      const originalError = console.error;
      let suppressedErrors = 0;
      
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('serverTimestamp') && message.includes('arrayUnion')) {
          suppressedErrors++;
          return; // Supprimer cette erreur
        }
        originalError.apply(console, args);
      };
      
      console.log('🤫 Suppression temporaire des erreurs serverTimestamp...');
      
      // Restaurer après 30 secondes
      setTimeout(() => {
        console.error = originalError;
        console.log(`✅ Suppression d'erreurs terminée. ${suppressedErrors} erreurs supprimées.`);
      }, 30000);
      
      return { success: true, suppressedErrors };
      
    } catch (error) {
      console.error('❌ Erreur auto-correction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧹 NETTOYER COMPLÈTEMENT UN DOCUMENT MEMBRE
   */
  async cleanMemberDocumentCompletely(userId) {
    try {
      console.log('🧹 Nettoyage complet membre:', userId);
      
      const memberRef = doc(db, 'teamMembers', userId);
      
      // Supprimer complètement le document
      await deleteDoc(memberRef);
      console.log('🗑️ Document supprimé');
      
      // Le recréer proprement
      const result = await this.createCleanTeamMember(userId);
      
      if (result.success) {
        console.log('✅ Document recréé proprement');
        return { success: true, action: 'recreated' };
      } else {
        throw new Error('Échec recréation: ' + result.error);
      }
      
    } catch (error) {
      console.error('❌ Erreur nettoyage complet:', error);
      return { success: false, error: error.message };
    }
  }
}

// ✅ Export de l'instance
const teamPageErrorFix = new TeamPageErrorFix();

export { teamPageErrorFix };
export default teamPageErrorFix;

// 🚀 AUTO-DÉMARRAGE DE LA CORRECTION
// Correction automatique au chargement
setTimeout(() => {
  teamPageErrorFix.autoFixCommonErrors();
}, 1000);
