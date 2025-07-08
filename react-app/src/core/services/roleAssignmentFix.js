// ==========================================
// 📁 react-app/src/core/services/roleAssignmentFix.js
// PATCH SPÉCIFIQUE pour l'erreur d'assignation de rôle
// ==========================================

import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🎭 FONCTION CORRIGÉE D'ASSIGNATION DE RÔLE
 */
export const assignRoleFixed = async (projectId, userId, newRole, permissions = []) => {
  try {
    console.log('🎭 [FIX] Assignation rôle corrigée:', { projectId, userId, newRole });
    
    if (!projectId || !userId || !newRole) {
      throw new Error('Paramètres manquants pour l\'assignation de rôle');
    }

    // 1. Récupérer le projet
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error('Projet introuvable');
    }
    
    const projectData = projectDoc.data();
    const team = projectData.team || [];
    
    // 2. Trouver le membre dans l'équipe
    const memberIndex = team.findIndex(m => m.userId === userId);
    if (memberIndex === -1) {
      throw new Error('Membre non trouvé dans l\'équipe');
    }
    
    // 3. ✅ CORRECTION: Créer la nouvelle équipe SANS serverTimestamp dans l'objet
    const updatedTeam = [...team];
    const currentMember = updatedTeam[memberIndex];
    
    updatedTeam[memberIndex] = {
      ...currentMember,
      role: newRole,
      permissions: permissions,
      roleUpdatedAt: new Date().toISOString(), // ✅ String au lieu de serverTimestamp()
      roleUpdatedBy: userId
    };
    
    // 4. ✅ CORRECTION: Mettre à jour le document avec la nouvelle équipe
    await updateDoc(projectRef, {
      team: updatedTeam, // Remplacer tout le tableau
      updatedAt: serverTimestamp(), // ✅ OK ici car pas dans un objet arrayUnion
      lastTeamModification: new Date().toISOString()
    });
    
    console.log('✅ [FIX] Rôle assigné avec succès');
    return { 
      success: true, 
      member: updatedTeam[memberIndex],
      message: `Rôle "${newRole}" assigné avec succès`
    };
    
  } catch (error) {
    console.error('❌ [FIX] Erreur assignation rôle:', error);
    return { 
      success: false, 
      error: error.message,
      details: error
    };
  }
};

/**
 * 🔧 PATCHER LE SERVICE EXISTANT
 */
export const patchTeamRoleAssignment = () => {
  try {
    // Chercher les services qui pourraient contenir updateMemberRole
    const servicesToPatch = [
      'teamManagementService',
      'teamService', 
      'collaborationService'
    ];
    
    servicesToPatch.forEach(serviceName => {
      // Vérifier dans window
      if (window[serviceName] && typeof window[serviceName].updateMemberRole === 'function') {
        console.log(`🔧 [PATCH] Remplacement de ${serviceName}.updateMemberRole`);
        
        window[serviceName].updateMemberRole = assignRoleFixed;
        window[serviceName].assignRole = assignRoleFixed; // Alias
        
        console.log(`✅ [PATCH] ${serviceName} corrigé`);
      }
      
      // Vérifier dans les modules importés
      if (window.__SYNERGIA_SERVICES__ && window.__SYNERGIA_SERVICES__[serviceName]) {
        const service = window.__SYNERGIA_SERVICES__[serviceName];
        if (typeof service.updateMemberRole === 'function') {
          console.log(`🔧 [PATCH] Remplacement de module ${serviceName}.updateMemberRole`);
          
          service.updateMemberRole = assignRoleFixed;
          service.assignRole = assignRoleFixed;
          
          console.log(`✅ [PATCH] Module ${serviceName} corrigé`);
        }
      }
    });
    
  } catch (error) {
    console.log('ℹ️ [PATCH] Aucun service à patcher trouvé');
  }
};

/**
 * 🚀 FONCTION D'INITIALISATION
 */
export const initRoleAssignmentFix = () => {
  console.log('🎭 Initialisation du correctif d\'assignation de rôle...');
  
  // Appliquer le patch
  patchTeamRoleAssignment();
  
  // Réessayer après un délai pour les services chargés plus tard
  setTimeout(patchTeamRoleAssignment, 2000);
  setTimeout(patchTeamRoleAssignment, 5000);
  
  // Exposer la fonction corrigée globalement
  if (typeof window !== 'undefined') {
    window.assignRoleFixed = assignRoleFixed;
    window.patchTeamRoleAssignment = patchTeamRoleAssignment;
    
    // Ajouter aux outils de debug
    if (!window.debugTools) window.debugTools = {};
    window.debugTools.assignRole = assignRoleFixed;
    window.debugTools.patchRoles = patchTeamRoleAssignment;
  }
  
  console.log('✅ Correctif d\'assignation de rôle activé');
};

// Auto-initialisation
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRoleAssignmentFix);
  } else {
    initRoleAssignmentFix();
  }
}

export default {
  assignRoleFixed,
  patchTeamRoleAssignment,
  initRoleAssignmentFix
};
