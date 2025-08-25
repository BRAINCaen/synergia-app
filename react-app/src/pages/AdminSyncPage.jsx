// ==========================================
// 📁 react-app/src/pages/AdminSyncPage.jsx
// PAGE ADMIN - SYNCHRONISATION DES DONNÉES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Database,
  Settings,
  Activity,
  TrendingUp,
  Eye,
  Zap,
  FileText,
  BarChart3,
  Shield,
  Clock,
  Download,
  Upload,
  Trash2,
  ArrowRight,
  Info,
  AlertCircle,
  Server,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';

// Layout - IMPORT CORRIGÉ
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Firebase
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

const AdminSyncPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [activeTab, setActiveTab] = useState('overview');
  const [syncData, setSyncData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // États des analyses
  const [dbStats, setDbStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [syncResults, setSyncResults] = useState(null);

  // ✅ CHARGEMENT DES DONNÉES AU MONTAGE
  useEffect(() => {
    loadSyncData();
  }, []);

  // 📊 CHARGER LES DONNÉES DE SYNCHRONISATION
  const loadSyncData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 [ADMIN-SYNC] Analyse de la base de données...');

      // Analyser les collections principales
      const collections = [
        'users',
        'tasks', 
        'projects',
        'userGamification',
        'taskSubmissions',
        'rewardRequests'
      ];

      const stats = {};
      const detectedIssues = [];

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          stats[collectionName] = {
            total: snapshot.size,
            docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          };

          // Détecter des problèmes potentiels
          snapshot.docs.forEach(docSnapshot => {
            const data = docSnapshot.data();
            
            // Données manquantes ou corrompues
            if (collectionName === 'users' && (!data.email || !data.createdAt)) {
              detectedIssues.push({
                type: 'data_corruption',
                collection: collectionName,
                docId: docSnapshot.id,
                issue: 'Données utilisateur incomplètes',
                severity: 'medium'
              });
            }

            if (collectionName === 'userGamification' && (typeof data.totalXP !== 'number' || data.totalXP < 0)) {
              detectedIssues.push({
                type: 'data_invalid',
                collection: collectionName,
                docId: docSnapshot.id,
                issue: 'XP invalide ou négatif',
                severity: 'high'
              });
            }
          });

        } catch (error) {
          console.error(`❌ Erreur analyse ${collectionName}:`, error);
          detectedIssues.push({
            type: 'access_error',
            collection: collectionName,
            issue: `Impossible d'accéder à la collection: ${error.message}`,
            severity: 'high'
          });
        }
      }

      setDbStats(stats);
      setIssues(detectedIssues);

      // Charger l'historique des synchronisations
      try {
        const syncHistoryDoc = await getDoc(doc(db, 'adminLogs', 'syncHistory'));
        if (syncHistoryDoc.exists()) {
          const syncHistory = syncHistoryDoc.data();
          if (syncHistory.lastSync) {
            setLastSyncTime({
              timestamp: syncHistory.lastSync.toDate(),
              type: syncHistory.syncType || 'unknown',
              admin: syncHistory.adminId || 'Unknown',
              results: syncHistory.results || {}
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ Impossible de charger l\'historique sync:', error);
      }

      console.log('✅ [ADMIN-SYNC] Analyse terminée');

    } catch (error) {
      console.error('❌ [ADMIN-SYNC] Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 EFFECTUER UNE SYNCHRONISATION
  const performSync = async (syncType = 'full') => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      console.log('🔄 [ADMIN-SYNC] Début synchronisation:', syncType);

      const startTime = Date.now();
      const syncResult = {
        usersUpdated: 0,
        gamificationFixed: 0,
        orphanedDeleted: 0,
        duplicatesRemoved: 0
      };

      // 1. Synchroniser les données de gamification
      if (syncType === 'full' || syncType === 'gamification') {
        console.log('🎮 Synchronisation gamification...');
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const batch = writeBatch(db);

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          
          // Vérifier si le profil de gamification existe
          const gamificationRef = doc(db, 'userGamification', userId);
          const gamificationDoc = await getDoc(gamificationRef);

          if (!gamificationDoc.exists()) {
            // Créer un profil de gamification par défaut
            batch.set(gamificationRef, {
              userId,
              totalXP: 0,
              level: 1,
              badges: [],
              achievements: [],
              createdAt: serverTimestamp(),
              lastUpdated: serverTimestamp()
            });
            syncResult.usersUpdated++;
          } else {
            // Vérifier et corriger les données
            const gamificationData = gamificationDoc.data();
            const updates = {};

            if (typeof gamificationData.totalXP !== 'number' || gamificationData.totalXP < 0) {
              updates.totalXP = 0;
            }
            if (!gamificationData.level || gamificationData.level < 1) {
              updates.level = 1;
            }
            if (!Array.isArray(gamificationData.badges)) {
              updates.badges = [];
            }

            if (Object.keys(updates).length > 0) {
              updates.lastUpdated = serverTimestamp();
              batch.update(gamificationRef, updates);
              syncResult.gamificationFixed++;
            }
          }
        }

        await batch.commit();
      }

      // 2. Nettoyer les données orphelines
      if (syncType === 'full' || syncType === 'cleanup') {
        console.log('🧹 Nettoyage données orphelines...');
        
        // Trouver et supprimer les profils de gamification sans utilisateur
        const gamificationSnapshot = await getDocs(collection(db, 'userGamification'));
        const userIds = new Set();
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.forEach(doc => userIds.add(doc.id));

        const orphanedBatch = writeBatch(db);
        
        for (const gamDoc of gamificationSnapshot.docs) {
          if (!userIds.has(gamDoc.id)) {
            orphanedBatch.delete(gamDoc.ref);
            syncResult.orphanedDeleted++;
          }
        }

        if (syncResult.orphanedDeleted > 0) {
          await orphanedBatch.commit();
        }
      }

      // 3. Sauvegarder les résultats de la synchronisation
      const syncLogRef = doc(db, 'adminLogs', 'syncHistory');
      await updateDoc(syncLogRef, {
        lastSync: serverTimestamp(),
        syncType,
        adminId: user.email,
        results: syncResult,
        duration: Date.now() - startTime
      });

      setSyncResults(syncResult);
      setLastSyncTime({
        timestamp: new Date(),
        type: syncType,
        admin: user.email,
        results: syncResult
      });

      console.log('✅ [ADMIN-SYNC] Synchronisation terminée:', syncResult);
      
      // Recharger les données après sync
      setTimeout(() => loadSyncData(), 1000);

    } catch (error) {
      console.error('❌ [ADMIN-SYNC] Erreur synchronisation:', error);
      alert('Erreur lors de la synchronisation: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // 📊 Calculer le score de santé de la DB
  const calculateHealthScore = () => {
    if (!dbStats || !issues) return 0;
    
    const totalDocs = Object.values(dbStats).reduce((sum, collection) => sum + collection.total, 0);
    const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
    const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium').length;

    if (totalDocs === 0) return 0;
    
    const issueImpact = (highSeverityIssues * 10 + mediumSeverityIssues * 5);
    const healthScore = Math.max(0, 100 - (issueImpact / totalDocs) * 100);
    
    return Math.round(healthScore);
  };

  const healthScore = calculateHealthScore();

  // Statistiques pour le header
  const headerStats = [
    { 
      label: "Santé DB", 
      value: `${healthScore}%`, 
      icon: Database, 
      color: healthScore > 80 ? "text-green-400" : healthScore > 60 ? "text-yellow-400" : "text-red-400" 
    },
    { 
      label: "Problèmes", 
      value: issues.length.toString(), 
      icon: AlertTriangle, 
      color: issues.length === 0 ? "text-green-400" : "text-red-400" 
    },
    { 
      label: "Utilisateurs", 
      value: dbStats?.users?.total?.toString() || "0", 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Dernière Sync", 
      value: lastSyncTime ? "Récente" : "Jamais", 
      icon: Clock, 
      color: lastSyncTime ? "text-green-400" : "text-gray-400" 
    }
  ];

  const headerActions = (
    <div className="flex gap-2">
      <PremiumButton 
        variant="secondary" 
        icon={RefreshCw}
        onClick={loadSyncData}
        disabled={isLoading}
      >
        Actualiser
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={isSyncing ? RefreshCw : Zap}
        onClick={() => performSync('full')}
        disabled={isSyncing}
        className={isSyncing ? "animate-pulse" : ""}
      >
        {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
      </PremiumButton>
    </div>
  );

  // ✅ INTERFACE DE CHARGEMENT
  if (isLoading) {
    return (
      <PremiumLayout
        title="Synchronisation Admin"
        subtitle="Chargement..."
        icon={Database}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-white">Analyse de la base de données...</p>
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Synchronisation Admin"
      subtitle="Gestion et maintenance de la base de données"
      icon={Database}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      {/* Onglets de navigation */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1 mb-8">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
          { id: 'issues', label: 'Problèmes', icon: AlertTriangle },
          { id: 'maintenance', label: 'Maintenance', icon: Settings },
          { id: 'logs', label: 'Historique', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Vue d'ensemble de la base de données */}
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Database className="w-5 h-5" />
              État de la Base de Données
            </h3>

            {dbStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(dbStats).map(([collectionName, data]) => (
                  <div key={collectionName} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium capitalize">{collectionName}</h4>
                      <span className="text-2xl font-bold text-purple-400">{data.total}</span>
                    </div>
                    <p className="text-gray-400 text-sm">Documents totaux</p>
                    
                    {/* Barre de progression visuelle */}
                    <div className="mt-3 bg-gray-700/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (data.total / 50) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Aucune donnée disponible</p>
              </div>
            )}
          </PremiumCard>

          {/* Score de santé global */}
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Score de Santé Global
            </h3>

            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${
                healthScore > 80 ? 'text-green-400' : 
                healthScore > 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {healthScore}%
              </div>
              
              <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ${
                    healthScore > 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    healthScore > 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              
              <p className={`text-lg font-medium ${
                healthScore > 80 ? 'text-green-300' : 
                healthScore > 60 ? 'text-yellow-300' : 'text-red-300'
              }`}>
                {healthScore > 80 ? 'Excellente santé' :
                 healthScore > 60 ? 'Santé acceptable' : 'Attention requise'}
              </p>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Onglet Problèmes */}
      {activeTab === 'issues' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Problèmes Détectés ({issues.length})
            </h3>

            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-300 font-medium">Aucun problème détecté</p>
                <p className="text-gray-400 text-sm">Votre base de données est en bon état</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      issue.severity === 'high' ? 'bg-red-900/20 border-red-500' :
                      issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                      'bg-blue-900/20 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">{issue.issue}</h4>
                        <p className="text-gray-400 text-sm">
                          Collection: {issue.collection} {issue.docId && `• Document: ${issue.docId}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                        issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {/* Onglet Maintenance */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Actions de Maintenance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Synchronisation Gamification */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-white font-medium">Sync Gamification</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Synchronise les données de gamification de tous les utilisateurs
                </p>
                <PremiumButton
                  variant="secondary"
                  onClick={() => performSync('gamification')}
                  disabled={isSyncing}
                  className="w-full"
                >
                  Synchroniser
                </PremiumButton>
              </div>

              {/* Nettoyage des données */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <h4 className="text-white font-medium">Nettoyage</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Supprime les données orphelines et corrompues
                </p>
                <PremiumButton
                  variant="secondary"
                  onClick={() => performSync('cleanup')}
                  disabled={isSyncing}
                  className="w-full"
                >
                  Nettoyer
                </PremiumButton>
              </div>

              {/* Sauvegarde */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="w-6 h-6 text-blue-400" />
                  <h4 className="text-white font-medium">Export/Sauvegarde</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Exporte les données importantes (fonctionnalité à venir)
                </p>
                <PremiumButton
                  variant="secondary"
                  disabled={true}
                  className="w-full opacity-50"
                >
                  Bientôt disponible
                </PremiumButton>
              </div>

              {/* Réindexation */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-6 h-6 text-green-400" />
                  <h4 className="text-white font-medium">Réindexation</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Recrée les index et optimise les performances
                </p>
                <PremiumButton
                  variant="secondary"
                  onClick={() => performSync('full')}
                  disabled={isSyncing}
                  className="w-full"
                >
                  Réindexer
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>

          {/* Résultats de la dernière synchronisation */}
          {syncResults && (
            <PremiumCard>
              <h3 className="text-xl font-semibold text-white mb-6">
                Résultats de la Dernière Synchronisation
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(syncResults).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400 mb-1">{value}</div>
                    <div className="text-xs text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCard>
          )}
        </div>
      )}

      {/* Onglet Historique */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Historique des Synchronisations
            </h3>

            {lastSyncTime ? (
              <div className="space-y-4">
                <div className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">Dernière synchronisation</h4>
                    <span className="text-sm text-gray-400">
                      {lastSyncTime.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>Type: {lastSyncTime.type}</span>
                    <span>Admin: {lastSyncTime.admin}</span>
                  </div>
                  
                  {lastSyncTime.results && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {Object.entries(lastSyncTime.results).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-lg font-bold text-purple-400">{value}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Aucune synchronisation enregistrée</p>
              </div>
            )}
          </PremiumCard>
        </div>
      )}
    </PremiumLayout>
  );
};

export default AdminSyncPage;
