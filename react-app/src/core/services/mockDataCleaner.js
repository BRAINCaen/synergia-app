// ==========================================
// 📁 react-app/src/core/services/mockDataCleaner.js
// SERVICE DE NETTOYAGE DES DONNÉES MOCK
// ==========================================

import { collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * 🧹 SERVICE DE NETTOYAGE DES DONNÉES MOCK
 * Identifie et supprime toutes les données de démonstration
 */
class MockDataCleaner {
  constructor() {
    this.mockPatterns = [
      // Utilisateurs mock
      'Allan le BOSS',
      'test@example.com',
      'demo@synergia.com',
      'alice@example.com',
      'bob@example.com',
      'claire@example.com',
      
      // Titres mock
      'Tâche d\'exemple',
      'Projet de démonstration',
      'Test project',
      'Example task',
      'Mock data',
      
      // Descriptions mock
      'Ceci est une tâche d\'exemple',
      'Description de démonstration',
      'This is a demo',
      'Lorem ipsum',
      
      // Autres patterns
      'MOCK_',
      'DEMO_',
      'TEST_',
      'EXAMPLE_'
    ];
    
    console.log('🧹 MockDataCleaner initialisé');
  }

  /**
   * 🔍 SCANNER TOUTES LES COLLECTIONS POUR DONNÉES MOCK
   */
  async scanForMockData(userId) {
    if (!userId) {
      console.warn('❌ UserId requis pour scanner les données mock');
      return { found: [], total: 0 };
    }

    try {
      console.log('🔍 Scan données mock pour utilisateur:', userId);
      
      const mockDataFound = [];
      
      // Scanner les collections principales
      const collections = ['tasks', 'projects', 'users', 'userStats', 'leaderboard'];
      
      for (const collectionName of collections) {
        console.log(`🔍 Scan collection: ${collectionName}`);
        
        try {
          let queryRef;
          
          // Adapter la requête selon la collection
          if (collectionName === 'users') {
            // Pour users, pas de filtre userId
            queryRef = collection(db, collectionName);
          } else if (collectionName === 'userStats' || collectionName === 'leaderboard') {
            // Pour ces collections, l'userId est l'ID du document
            queryRef = collection(db, collectionName);
          } else {
            // Pour tasks et projects
            queryRef = query(
              collection(db, collectionName),
              where('userId', '==', userId)
            );
          }
          
          const snapshot = await getDocs(queryRef);
          
          snapshot.forEach(doc => {
            const data = doc.data();
            const docId = doc.id;
            
            // Vérifier si c'est des données mock
            const isMock = this.isMockData(data, docId);
            
            if (isMock) {
              mockDataFound.push({
                collection: collectionName,
                id: docId,
                data: data,
                reason: isMock.reason
              });
            }
          });
          
        } catch (error) {
          console.warn(`⚠️ Erreur scan ${collectionName}:`, error.message);
        }
      }
      
      console.log(`✅ Scan terminé - ${mockDataFound.length} éléments mock trouvés`);
      
      return {
        found: mockDataFound,
        total: mockDataFound.length
      };
      
    } catch (error) {
      console.error('❌ Erreur scan données mock:', error);
      return { found: [], total: 0 };
    }
  }

  /**
   * 🔍 VÉRIFIER SI UNE DONNÉE EST MOCK
   */
  isMockData(data, docId) {
    // Vérifier l'ID du document
    for (const pattern of this.mockPatterns) {
      if (docId.toLowerCase().includes(pattern.toLowerCase())) {
        return { isMock: true, reason: `ID contient "${pattern}"` };
      }
    }
    
    // Vérifier les champs de données
    const fieldsToCheck = [
      'title', 'name', 'displayName', 'email', 
      'description', 'content', 'bio'
    ];
    
    for (const field of fieldsToCheck) {
      if (data[field]) {
        const value = data[field].toString().toLowerCase();
        
        for (const pattern of this.mockPatterns) {
          if (value.includes(pattern.toLowerCase())) {
            return { 
              isMock: true, 
              reason: `Champ "${field}" contient "${pattern}"` 
            };
          }
        }
      }
    }
    
    // Vérifier patterns spécifiques
    if (data.email && (
      data.email.includes('example.com') ||
      data.email.includes('demo.com') ||
      data.email.includes('test.com')
    )) {
      return { isMock: true, reason: 'Email de test détecté' };
    }
    
    // Vérifier données hardcodées suspectes
    if (data.totalXp === 1250 || data.level === 5) {
      return { isMock: true, reason: 'Valeurs hardcodées suspectes' };
    }
    
    if (data.badges && Array.isArray(data.badges) && data.badges.length > 10) {
      return { isMock: true, reason: 'Trop de badges (probablement mock)' };
    }
    
    return false;
  }

  /**
   * 🗑️ SUPPRIMER LES DONNÉES MOCK IDENTIFIÉES
   */
  async cleanMockData(userId, mockDataFound) {
    if (!mockDataFound || mockDataFound.length === 0) {
      console.log('✅ Aucune donnée mock à nettoyer');
      return { cleaned: 0, errors: [] };
    }

    console.log(`🧹 Nettoyage de ${mockDataFound.length} éléments mock...`);
    
    let cleaned = 0;
    const errors = [];
    
    for (const mockItem of mockDataFound) {
      try {
        await deleteDoc(doc(db, mockItem.collection, mockItem.id));
        cleaned++;
        console.log(`✅ Supprimé: ${mockItem.collection}/${mockItem.id}`);
      } catch (error) {
        errors.push({
          item: mockItem,
          error: error.message
        });
        console.error(`❌ Erreur suppression ${mockItem.collection}/${mockItem.id}:`, error);
      }
    }
    
    console.log(`✅ Nettoyage terminé: ${cleaned} éléments supprimés, ${errors.length} erreurs`);
    
    return { cleaned, errors };
  }

  /**
   * 🔄 NETTOYAGE COMPLET AUTOMATIQUE
   */
  async performFullCleanup(userId) {
    if (!userId) {
      throw new Error('UserId requis pour le nettoyage');
    }

    try {
      console.log('🚀 Début nettoyage complet des données mock pour:', userId);
      
      // 1. Scanner les données mock
      const scanResult = await this.scanForMockData(userId);
      
      if (scanResult.total === 0) {
        console.log('✅ Aucune donnée mock trouvée - Application déjà propre !');
        return {
          success: true,
          scanned: 0,
          found: 0,
          cleaned: 0,
          errors: []
        };
      }
      
      console.log(`🔍 ${scanResult.total} éléments mock trouvés`);
      
      // 2. Supprimer les données mock
      const cleanResult = await this.cleanMockData(userId, scanResult.found);
      
      // 3. Log du nettoyage
      await this.logCleanupAction(userId, scanResult.total, cleanResult.cleaned);
      
      const result = {
        success: true,
        scanned: scanResult.total,
        found: scanResult.total,
        cleaned: cleanResult.cleaned,
        errors: cleanResult.errors,
        details: scanResult.found.map(item => ({
          collection: item.collection,
          id: item.id,
          reason: item.reason
        }))
      };
      
      console.log('✅ Nettoyage complet terminé:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur nettoyage complet:', error);
      throw error;
    }
  }

  /**
   * 📝 LOGGER L'ACTION DE NETTOYAGE
   */
  async logCleanupAction(userId, found, cleaned) {
    try {
      await addDoc(collection(db, 'userActivity'), {
        userId,
        type: 'mock_data_cleanup',
        description: `Nettoyage automatique: ${cleaned}/${found} éléments mock supprimés`,
        metadata: {
          found,
          cleaned,
          timestamp: new Date()
        },
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.warn('⚠️ Impossible de logger le nettoyage:', error);
    }
  }

  /**
   * 📊 RAPPORT DE SANITÉ DES DONNÉES
   */
  async generateDataHealthReport(userId) {
    try {
      console.log('📊 Génération rapport sanité données pour:', userId);
      
      const report = {
        timestamp: new Date(),
        userId,
        collections: {},
        totalDocuments: 0,
        mockDocuments: 0,
        healthScore: 0,
        recommendations: []
      };
      
      // Analyser chaque collection
      const collections = ['tasks', 'projects', 'userStats', 'leaderboard'];
      
      for (const collectionName of collections) {
        try {
          let queryRef;
          
          if (collectionName === 'userStats' || collectionName === 'leaderboard') {
            queryRef = collection(db, collectionName);
          } else {
            queryRef = query(
              collection(db, collectionName),
              where('userId', '==', userId)
            );
          }
          
          const snapshot = await getDocs(queryRef);
          let mockCount = 0;
          
          snapshot.forEach(doc => {
            const isMock = this.isMockData(doc.data(), doc.id);
            if (isMock) mockCount++;
          });
          
          report.collections[collectionName] = {
            total: snapshot.size,
            mock: mockCount,
            clean: snapshot.size - mockCount,
            healthScore: snapshot.size > 0 ? Math.round(((snapshot.size - mockCount) / snapshot.size) * 100) : 100
          };
          
          report.totalDocuments += snapshot.size;
          report.mockDocuments += mockCount;
          
        } catch (error) {
          console.warn(`⚠️ Erreur analyse ${collectionName}:`, error.message);
          report.collections[collectionName] = {
            total: 0,
            mock: 0,
            clean: 0,
            healthScore: 100,
            error: error.message
          };
        }
      }
      
      // Calculer score global
      report.healthScore = report.totalDocuments > 0 ? 
        Math.round(((report.totalDocuments - report.mockDocuments) / report.totalDocuments) * 100) : 100;
      
      // Générer recommandations
      if (report.mockDocuments > 0) {
        report.recommendations.push(`🧹 ${report.mockDocuments} éléments mock détectés - Nettoyage recommandé`);
      }
      
      if (report.healthScore === 100) {
        report.recommendations.push('✅ Données 100% propres - Excellente sanité !');
      }
      
      console.log('📊 Rapport généré:', report);
      
      return report;
      
    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      throw error;
    }
  }
}

// Instance singleton
export const mockDataCleaner = new MockDataCleaner();

// Export des méthodes principales
export const {
  scanForMockData,
  cleanMockData,
  performFullCleanup,
  generateDataHealthReport
} = mockDataCleaner;
