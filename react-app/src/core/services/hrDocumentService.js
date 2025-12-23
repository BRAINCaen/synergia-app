// ==========================================
// 📁 react-app/src/core/services/hrDocumentService.js
// SERVICE DE GESTION DES DOCUMENTS RH
// Bulletins de paie, contrats, etc. avec accès sécurisé
// ==========================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 📂 TYPES DE DOCUMENTS
 */
export const DOCUMENT_TYPES = {
  payslip: {
    id: 'payslip',
    label: 'Bulletin de paie',
    emoji: '💰',
    color: '#10B981',
    folder: 'Bulletins de paie'
  },
  contract: {
    id: 'contract',
    label: 'Contrat de travail',
    emoji: '📝',
    color: '#3B82F6',
    folder: 'Contrats'
  },
  amendment: {
    id: 'amendment',
    label: 'Avenant',
    emoji: '📄',
    color: '#8B5CF6',
    folder: 'Avenants'
  },
  certificate: {
    id: 'certificate',
    label: 'Attestation',
    emoji: '🏆',
    color: '#F59E0B',
    folder: 'Attestations'
  },
  medical: {
    id: 'medical',
    label: 'Document médical',
    emoji: '🏥',
    color: '#EF4444',
    folder: 'Documents médicaux'
  },
  other: {
    id: 'other',
    label: 'Autre document',
    emoji: '📎',
    color: '#6B7280',
    folder: 'Autres'
  }
};

/**
 * 📁 SERVICE DE DOCUMENTS RH
 */
class HRDocumentService {
  constructor() {
    this.COLLECTION_NAME = 'hr_documents';
    console.log('📁 HRDocumentService initialisé');
  }

  // ==========================================
  // 📝 CRÉATION DE DOCUMENTS
  // ==========================================

  /**
   * Créer un nouveau document RH
   * @param {Object} documentData - Données du document
   * @param {string} documentData.employeeId - ID de l'employé propriétaire
   * @param {string} documentData.employeeName - Nom de l'employé
   * @param {string} documentData.type - Type de document (payslip, contract, etc.)
   * @param {string} documentData.title - Titre du document
   * @param {string} documentData.description - Description optionnelle
   * @param {string} documentData.fileUrl - URL du fichier (stocké ailleurs)
   * @param {string} documentData.fileName - Nom du fichier
   * @param {number} documentData.fileSize - Taille du fichier en bytes
   * @param {string} documentData.period - Période concernée (ex: "Janvier 2025")
   * @param {string} documentData.uploadedBy - ID de l'utilisateur qui upload
   * @param {string} documentData.uploadedByName - Nom de l'utilisateur qui upload
   */
  async createDocument(documentData) {
    try {
      const {
        employeeId,
        employeeName,
        type,
        title,
        description = '',
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        period = '',
        uploadedBy,
        uploadedByName
      } = documentData;

      // Vérifier les champs obligatoires
      if (!employeeId || !type || !title || !fileName) {
        return { success: false, error: 'Champs obligatoires manquants' };
      }

      const documentRecord = {
        employeeId,
        employeeName: employeeName || 'Inconnu',
        type,
        typeLabel: DOCUMENT_TYPES[type]?.label || 'Document',
        typeEmoji: DOCUMENT_TYPES[type]?.emoji || '📄',
        title,
        description,
        fileUrl: fileUrl || null,
        fileName,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream',
        period,
        uploadedBy,
        uploadedByName,
        // Métadonnées de sécurité
        accessibleBy: [employeeId], // Seul l'employé peut voir par défaut
        isConfidential: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), documentRecord);
      console.log('✅ Document RH créé:', docRef.id);

      return { success: true, documentId: docRef.id };
    } catch (error) {
      console.error('❌ Erreur création document:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 📖 LECTURE DES DOCUMENTS
  // ==========================================

  /**
   * Récupérer les documents d'un employé (pour l'employé lui-même)
   */
  async getEmployeeDocuments(employeeId) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      return documents;
    } catch (error) {
      console.error('❌ Erreur récupération documents employé:', error);
      return [];
    }
  }

  /**
   * Récupérer TOUS les documents (pour admin uniquement)
   * Groupés par employé
   */
  async getAllDocumentsGroupedByEmployee() {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const documentsByEmployee = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const employeeId = data.employeeId;

        if (!documentsByEmployee[employeeId]) {
          documentsByEmployee[employeeId] = {
            employeeId,
            employeeName: data.employeeName,
            documents: []
          };
        }

        documentsByEmployee[employeeId].documents.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });

      return Object.values(documentsByEmployee);
    } catch (error) {
      console.error('❌ Erreur récupération tous documents:', error);
      return [];
    }
  }

  /**
   * Récupérer les documents d'un type spécifique pour un employé
   */
  async getEmployeeDocumentsByType(employeeId, type) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        });
      });

      return documents;
    } catch (error) {
      console.error('❌ Erreur récupération documents par type:', error);
      return [];
    }
  }

  /**
   * Vérifier si un utilisateur a accès à un document
   */
  async canAccessDocument(documentId, userId, isAdmin = false) {
    try {
      // Les admins ont toujours accès
      if (isAdmin) return true;

      const docRef = doc(db, this.COLLECTION_NAME, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return false;

      const data = docSnap.data();

      // L'employé propriétaire a accès
      if (data.employeeId === userId) return true;

      // Vérifier la liste d'accès explicite
      if (data.accessibleBy?.includes(userId)) return true;

      return false;
    } catch (error) {
      console.error('❌ Erreur vérification accès:', error);
      return false;
    }
  }

  // ==========================================
  // 🔄 MISE À JOUR
  // ==========================================

  /**
   * Mettre à jour un document
   */
  async updateDocument(documentId, updates, userId, isAdmin = false) {
    try {
      // Vérifier l'accès (seul l'admin peut modifier)
      if (!isAdmin) {
        return { success: false, error: 'Accès non autorisé' };
      }

      const docRef = doc(db, this.COLLECTION_NAME, documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Document mis à jour:', documentId);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour document:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 🗑️ SUPPRESSION
  // ==========================================

  /**
   * Supprimer un document (admin uniquement)
   */
  async deleteDocument(documentId, isAdmin = false) {
    try {
      if (!isAdmin) {
        return { success: false, error: 'Accès non autorisé' };
      }

      await deleteDoc(doc(db, this.COLLECTION_NAME, documentId));
      console.log('🗑️ Document supprimé:', documentId);

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression document:', error);
      return { success: false, error: error.message };
    }
  }

  // ==========================================
  // 🔔 LISTENERS TEMPS RÉEL
  // ==========================================

  /**
   * Écouter les documents d'un employé en temps réel
   */
  subscribeToEmployeeDocuments(employeeId, callback) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('employeeId', '==', employeeId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const documents = [];
        snapshot.forEach(doc => {
          documents.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          });
        });
        callback(documents);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur subscription documents:', error);
      return () => {};
    }
  }

  /**
   * Écouter TOUS les documents (admin)
   */
  subscribeToAllDocuments(callback) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const documentsByEmployee = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          const employeeId = data.employeeId;

          if (!documentsByEmployee[employeeId]) {
            documentsByEmployee[employeeId] = {
              employeeId,
              employeeName: data.employeeName,
              documents: []
            };
          }

          documentsByEmployee[employeeId].documents.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date()
          });
        });

        callback(Object.values(documentsByEmployee));
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur subscription tous documents:', error);
      return () => {};
    }
  }

  // ==========================================
  // 👁️ ACCUSÉ DE RÉCEPTION / CONSULTATION
  // ==========================================

  /**
   * Marquer un document comme vu par l'utilisateur
   * @param {string} documentId - ID du document
   * @param {string} userId - ID de l'utilisateur qui voit le document
   * @param {string} userName - Nom de l'utilisateur
   */
  async markAsViewed(documentId, userId, userName) {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'Document non trouvé' };
      }

      const data = docSnap.data();
      const viewedBy = data.viewedBy || [];

      // Vérifier si l'utilisateur a déjà vu ce document
      const existingView = viewedBy.find(v => v.userId === userId);

      if (existingView) {
        // Mettre à jour la dernière consultation
        const updatedViewedBy = viewedBy.map(v =>
          v.userId === userId
            ? { ...v, lastViewedAt: new Date().toISOString(), viewCount: (v.viewCount || 1) + 1 }
            : v
        );
        await updateDoc(docRef, { viewedBy: updatedViewedBy });
      } else {
        // Ajouter la première consultation
        viewedBy.push({
          userId,
          userName,
          firstViewedAt: new Date().toISOString(),
          lastViewedAt: new Date().toISOString(),
          viewCount: 1
        });
        await updateDoc(docRef, { viewedBy });
      }

      console.log('👁️ Document marqué comme vu:', documentId, 'par', userName);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur marquage document vu:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Vérifier si un document a été vu par son propriétaire
   * @param {string} documentId - ID du document
   */
  async hasOwnerViewed(documentId) {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return false;

      const data = docSnap.data();
      const viewedBy = data.viewedBy || [];

      // Vérifier si le propriétaire (employeeId) a vu le document
      return viewedBy.some(v => v.userId === data.employeeId);
    } catch (error) {
      console.error('❌ Erreur vérification consultation:', error);
      return false;
    }
  }

  /**
   * Obtenir les détails de consultation d'un document
   * @param {string} documentId - ID du document
   */
  async getViewDetails(documentId) {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return {
        viewedBy: data.viewedBy || [],
        ownerViewed: (data.viewedBy || []).some(v => v.userId === data.employeeId)
      };
    } catch (error) {
      console.error('❌ Erreur récupération détails consultation:', error);
      return null;
    }
  }

  // ==========================================
  // 📊 STATISTIQUES
  // ==========================================

  /**
   * Obtenir les statistiques de documents pour un employé
   */
  async getEmployeeDocumentStats(employeeId) {
    try {
      const documents = await this.getEmployeeDocuments(employeeId);

      const stats = {
        total: documents.length,
        byType: {}
      };

      documents.forEach(doc => {
        if (!stats.byType[doc.type]) {
          stats.byType[doc.type] = 0;
        }
        stats.byType[doc.type]++;
      });

      return stats;
    } catch (error) {
      console.error('❌ Erreur stats documents:', error);
      return { total: 0, byType: {} };
    }
  }

  /**
   * Compter le nombre total de documents
   */
  async getTotalDocumentCount() {
    try {
      const snapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur comptage documents:', error);
      return 0;
    }
  }
}

// Créer et exporter l'instance du service
const hrDocumentService = new HRDocumentService();
export default hrDocumentService;
