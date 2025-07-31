// ==========================================
// 📁 react-app/src/core/services/objectiveClaimService.js
// SERVICE DE RÉCLAMATION D'OBJECTIFS AVEC VALIDATION ADMIN
// ==========================================

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment 
} from 'firebase/firestore';

import { db } from '../../../firebase.config.js';
import { COLLECTIONS } from '../constants.js';
import { gamificationService } from './gamificationService.js';

/**
 * 🎯 SERVICE DE RÉCLAMATION D'OBJECTIFS AVEC VALIDATION ADMIN
 * 
 * Workflow:
 * 1. Utilisateur demande la réclamation d'un objectif
 * 2. Demande créée avec statut "pending"
 * 3. Admin valide ou rejette la demande
 * 4. Si validée → XP attribués automatiquement
 */
class ObjectiveClaimService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 📝 CRÉER UNE DEMANDE DE RÉCLAMATION D'OBJECTIF
   */
  async createObjectiveClaim(userId, objective, evidence = '') {
    try {
      console.log('📝 Création demande réclamation objectif:', objective.id);

      // Vérifier que l'objectif est complété
      if (objective.status !== 'completed' || !objective.canClaim) {
        throw new Error('Objectif non éligible à la réclamation');
      }

      // Créer l'ID unique de réclamation
      const today = new Date().toISOString().split('T')[0];
      const claimId = this.generateClaimId(objective.id, objective.type, today);

      // Vérifier si une demande n'est pas déjà en cours
      const existingClaim = await this.getExistingClaim(userId, claimId);
      if (existingClaim) {
        throw new Error('Une demande pour cet objectif est déjà en cours');
      }

      // Récupérer les infos utilisateur pour la demande
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Créer la demande de réclamation
      const claimRequest = {
        // IDs et références
        userId: userId,
        objectiveId: objective.id,
        claimId: claimId,
        
        // Informations utilisateur
        userName: userData?.profile?.name || userData?.displayName || 'Utilisateur',
        userEmail: userData?.email || '',
        
        // Détails de l'objectif
        objectiveTitle: objective.title,
        objectiveDescription: objective.description,
        objectiveType: objective.type,
        objectiveCategory: objective.category,
        
        // Récompenses
        xpAmount: objective.xpReward,
        badgeReward: objective.badgeReward || null,
        
        // Preuves et justifications
        evidence: evidence,
        userComment: '',
        
        // Statut et dates
        status: 'pending',
        createdAt: serverTimestamp(),
        requestedAt: new Date(),
        
        // Validation admin (à remplir lors de la validation)
        approvedBy: null,
        approvedAt: null,
        adminNotes: '',
        processedAt: null,
        
        // Métadonnées
        priority: this.calculatePriority(objective),
        resetDate: objective.type === 'daily' || objective.type === 'weekly' 
          ? this.getResetDate(objective.type) 
          : null
      };

      // Sauvegarder dans Firestore
      const docRef = await addDoc(collection(db, COLLECTIONS.OBJECTIVE_CLAIMS), claimRequest);
      
      console.log(`✅ Demande de réclamation créée: ${docRef.id}`);
      
      return {
        success: true,
        claimRequestId: docRef.id,
        message: `Demande de réclamation envoyée pour "${objective.title}"`,
        expectedXP: objective.xpReward,
        estimatedProcessingTime: '24-48h'
      };

    } catch (error) {
      console.error('❌ Erreur création demande réclamation:', error);
      throw error;
    }
  }

  /**
   * 🔍 VÉRIFIER SI UNE DEMANDE EXISTE DÉJÀ
   */
  async getExistingClaim(userId, claimId) {
    try {
      const q = query(
        collection(db, COLLECTIONS.OBJECTIVE_CLAIMS),
        where('userId', '==', userId),
        where('claimId', '==', claimId),
        where('status', 'in', ['pending', 'approved'])
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty ? snapshot.docs[0].data() : null;
      
    } catch (error) {
      console.error('❌ Erreur vérification demande existante:', error);
      return null;
    }
  }

  /**
   * 📊 OBTENIR TOUTES LES DEMANDES D'UN UTILISATEUR
   */
  async getUserClaims(userId, status = null) {
    try {
      let q = query(
        collection(db, COLLECTIONS.OBJECTIVE_CLAIMS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (status) {
        q = query(
          collection(db, COLLECTIONS.OBJECTIVE_CLAIMS),
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const claims = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
        processedAt: doc.data().processedAt?.toDate()
      }));

      console.log(`📊 ${claims.length} demandes récupérées pour utilisateur ${userId}`);
      return claims;

    } catch (error) {
      console.error('❌ Erreur récupération demandes utilisateur:', error);
      return [];
    }
  }

  /**
   * 🛡️ OBTENIR TOUTES LES DEMANDES (Admin seulement)
   */
  async getAllClaims(filters = {}) {
    try {
      let q = query(
        collection(db, COLLECTIONS.OBJECTIVE_CLAIMS),
        orderBy('createdAt', 'desc')
      );

      // Filtres optionnels
      if (filters.status) {
        q = query(
          collection(db, COLLECTIONS.OBJECTIVE_CLAIMS),
          where('status', '==', filters.status),
          orderBy('createdAt', 'desc')
        );
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const claims = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
        processedAt: doc.data().processedAt?.toDate()
      }));

      console.log(`🛡️ ${claims.length} demandes récupérées (admin)`);
      return claims;

    } catch (error) {
      console.error('❌ Erreur récupération toutes demandes:', error);
      return [];
    }
  }

  /**
   * ✅ VALIDER UNE DEMANDE DE RÉCLAMATION (Admin seulement)
   */
  async approveClaim(claimId, adminId, adminNotes = '') {
    try {
      console.log('✅ Validation demande réclamation:', claimId);

      // Vérifier permissions admin
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes pour valider les réclamations');
      }

      // Récupérer la demande
      const claimRef = doc(db, COLLECTIONS.OBJECTIVE_CLAIMS, claimId);
      const claimSnap = await getDoc(claimRef);
      
      if (!claimSnap.exists()) {
        throw new Error('Demande de réclamation introuvable');
      }

      const claimData = claimSnap.data();
      
      if (claimData.status !== 'pending') {
        throw new Error('Cette demande a déjà été traitée');
      }

      // Mettre à jour la demande
      await updateDoc(claimRef, {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
        adminNotes: adminNotes || 'Demande approuvée'
      });

      // Attribuer les XP automatiquement
      await gamificationService.addExperience(
        claimData.userId,
        claimData.xpAmount,
        `Objectif validé: ${claimData.objectiveTitle}`,
        {
          source: 'objective_claim',
          objectiveId: claimData.objectiveId,
          claimId: claimData.claimId,
          validatedBy: adminId
        }
      );

      // Marquer l'objectif comme réclamé dans le profil utilisateur
      await this.markObjectiveAsClaimed(claimData.userId, claimData.claimId);

      // Notifier l'utilisateur
      await this.notifyUser(claimData.userId, 'objective_approved', {
        objectiveTitle: claimData.objectiveTitle,
        xpAmount: claimData.xpAmount,
        adminNotes: adminNotes
      });

      console.log(`✅ Réclamation validée: +${claimData.xpAmount} XP attribués à ${claimData.userId}`);
      
      return {
        success: true,
        message: `Réclamation validée: +${claimData.xpAmount} XP attribués`,
        xpAwarded: claimData.xpAmount,
        userId: claimData.userId
      };

    } catch (error) {
      console.error('❌ Erreur validation réclamation:', error);
      throw error;
    }
  }

  /**
   * ❌ REJETER UNE DEMANDE DE RÉCLAMATION (Admin seulement)
   */
  async rejectClaim(claimId, adminId, adminNotes = '') {
    try {
      console.log('❌ Rejet demande réclamation:', claimId);

      // Vérifier permissions admin
      const isAdmin = await this.checkAdminPermissions(adminId);
      if (!isAdmin) {
        throw new Error('Permissions insuffisantes');
      }

      const claimRef = doc(db, COLLECTIONS.OBJECTIVE_CLAIMS, claimId);
      const claimSnap = await getDoc(claimRef);
      
      if (!claimSnap.exists()) {
        throw new Error('Demande introuvable');
      }

      const claimData = claimSnap.data();
      
      if (claimData.status !== 'pending') {
        throw new Error('Cette demande a déjà été traitée');
      }

      // Mettre à jour la demande
      await updateDoc(claimRef, {
        status: 'rejected',
        rejectedBy: adminId,
        rejectedAt: serverTimestamp(),
        processedAt: serverTimestamp(),
        adminNotes: adminNotes || 'Demande rejetée'
      });

      // Notifier l'utilisateur
      await this.notifyUser(claimData.userId, 'objective_rejected', {
        objectiveTitle: claimData.objectiveTitle,
        reason: adminNotes,
        canResubmit: this.canResubmit(claimData.objectiveType)
      });

      console.log(`❌ Réclamation rejetée pour ${claimData.userId}`);
      
      return {
        success: true,
        message: 'Réclamation rejetée',
        userId: claimData.userId
      };

    } catch (error) {
      console.error('❌ Erreur rejet réclamation:', error);
      throw error;
    }
  }

  /**
   * 🏷️ MARQUER UN OBJECTIF COMME RÉCLAMÉ
   */
  async markObjectiveAsClaimed(userId, claimId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const claimedObjectives = userData.objectives?.claimed || [];
        
        if (!claimedObjectives.includes(claimId)) {
          await updateDoc(userRef, {
            'objectives.claimed': [...claimedObjectives, claimId],
            'objectives.lastClaimDate': serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur marquage objectif réclamé:', error);
    }
  }

  /**
   * 🔔 NOTIFIER L'UTILISATEUR DU RÉSULTAT
   */
  async notifyUser(userId, type, data) {
    try {
      const notificationData = {
        userId,
        type,
        title: type === 'objective_approved' 
          ? '🎉 Objectif Validé !' 
          : '❌ Réclamation Rejetée',
        message: type === 'objective_approved'
          ? `+${data.xpAmount} XP attribués pour: ${data.objectiveTitle}`
          : `Réclamation rejetée: ${data.objectiveTitle}. ${data.adminNotes}`,
        data,
        read: false,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notificationData);
      console.log(`🔔 Utilisateur ${userId} notifié: ${type}`);

    } catch (error) {
      console.error('❌ Erreur notification utilisateur:', error);
    }
  }

  /**
   * 📈 OBTENIR LES STATISTIQUES DE RÉCLAMATION
   */
  async getClaimStats() {
    try {
      const [pendingClaims, approvedClaims, rejectedClaims] = await Promise.all([
        this.getAllClaims({ status: 'pending' }),
        this.getAllClaims({ status: 'approved' }),
        this.getAllClaims({ status: 'rejected' })
      ]);

      const totalClaims = pendingClaims.length + approvedClaims.length + rejectedClaims.length;
      
      return {
        pending: pendingClaims.length,
        approved: approvedClaims.length,
        rejected: rejectedClaims.length,
        total: totalClaims,
        approvalRate: totalClaims > 0 ? Math.round((approvedClaims.length / totalClaims) * 100) : 0,
        averageProcessingHours: this.calculateAverageProcessingTime([...approvedClaims, ...rejectedClaims])
      };
      
    } catch (error) {
      console.error('❌ Erreur statistiques réclamations:', error);
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
        approvalRate: 0,
        averageProcessingHours: 0
      };
    }
  }

  /**
   * 📊 CALCULER LE TEMPS DE TRAITEMENT MOYEN
   */
  calculateAverageProcessingTime(processedClaims) {
    if (processedClaims.length === 0) return 0;
    
    const totalTime = processedClaims.reduce((sum, claim) => {
      const createdAt = claim.createdAt || claim.requestedAt;
      const processedAt = claim.processedAt || claim.approvedAt || claim.rejectedAt;
      
      if (createdAt && processedAt) {
        return sum + (processedAt.getTime() - createdAt.getTime());
      }
      return sum;
    }, 0);
    
    const averageMs = totalTime / processedClaims.length;
    return Math.round(averageMs / (1000 * 60 * 60)); // Convertir en heures
  }

  /**
   * 🎯 CALCULER LA PRIORITÉ D'UNE DEMANDE
   */
  calculatePriority(objective) {
    let priority = 'normal';
    
    // Priorité haute pour objectifs de leadership
    if (objective.category === 'leadership' || objective.xpReward >= 100) {
      priority = 'high';
    }
    
    // Priorité faible pour objectifs quotidiens simples
    if (objective.type === 'daily' && objective.xpReward <= 25) {
      priority = 'low';
    }
    
    return priority;
  }

  /**
   * 🔄 GÉNÉRER ID DE RÉCLAMATION UNIQUE
   */
  generateClaimId(objectiveId, type, date) {
    switch (type) {
      case 'daily':
        return `${objectiveId}_${date}`;
      case 'weekly':
        const weekNumber = this.getWeekNumber(new Date(date));
        return `${objectiveId}_week_${weekNumber}`;
      default:
        return `${objectiveId}_${Date.now()}`;
    }
  }

  /**
   * 📅 OBTENIR LA DATE DE RESET
   */
  getResetDate(type) {
    const now = new Date();
    
    switch (type) {
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toISOString();
        
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
        nextWeek.setHours(0, 0, 0, 0);
        return nextWeek.toISOString();
        
      default:
        return null;
    }
  }

  /**
   * 📊 OBTENIR LE NUMÉRO DE SEMAINE
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * 🔄 VÉRIFIER SI ON PEUT RESOUMETTRE
   */
  canResubmit(objectiveType) {
    // Les objectifs quotidiens et hebdomadaires peuvent être resoumis
    return ['daily', 'weekly'].includes(objectiveType);
  }

  /**
   * 🔍 VÉRIFIER LES PERMISSIONS ADMIN
   */
  async checkAdminPermissions(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data();
      
      // Vérifications multiples pour admin
      const isRoleAdmin = userData.profile?.role === 'admin';
      const isProfileRoleAdmin = userData.role === 'admin';
      const hasAdminFlag = userData.isAdmin === true;
      const hasValidatePermission = userData.permissions?.includes('validate_objectives');
      
      return isRoleAdmin || isProfileRoleAdmin || hasAdminFlag || hasValidatePermission;
      
    } catch (error) {
      console.error('❌ Erreur vérification permissions admin:', error);
      return false;
    }
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
  }
}

// Export singleton
export const objectiveClaimService = new ObjectiveClaimService();
export default objectiveClaimService;
