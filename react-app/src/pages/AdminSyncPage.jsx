// ==========================================
// 📁 react-app/src/pages/AdminSyncPage.jsx
// PAGE ADMIN - SYNCHRONISATION DES DONNÉES
// Version Premium avec Menu Hamburger
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  WifiOff,
  XCircle,
  TrendingDown,
  Loader,
  CheckCheck,
  Package,
  FileWarning
} from 'lucide-react';

// Hooks et stores
import { useAuthStore } from '../shared/stores/authStore.js';

// Layout - Menu hamburger inclus
import HamburgerMenu from '../shared/components/HamburgerMenu';

// Firebase
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  getDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
  setDoc
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
  const [realtimeStats, setRealtimeStats] = useState({});
  const [notification, setNotification] = useState(null);

  // ✅ CHARGEMENT DES DONNÉES AU MONTAGE + LISTENERS TEMPS RÉEL
  useEffect(() => {
    loadSyncData();
    setupRealtimeListeners();
  }, []);

  // 🔔 SYSTÈME DE NOTIFICATIONS
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // 📡 CONFIGURATION DES LISTENERS TEMPS RÉEL
  const setupRealtimeListeners = () => {
    console.log('📡 [ADMIN-SYNC] Configuration des listeners temps réel...');

    // Listener sur les utilisateurs
    const usersUnsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setRealtimeStats(prev => ({
          ...prev,
          usersCount: snapshot.size,
          lastUserUpdate: new Date()
        }));
      },
      (error) => console.error('❌ Erreur listener users:', error)
    );

    // Listener sur les tâches
    const tasksUnsubscribe = onSnapshot(
      collection(db, 'tasks'),
      (snapshot) => {
        setRealtimeStats(prev => ({
          ...prev,
          tasksCount: snapshot.size,
          lastTaskUpdate: new Date()
        }));
      },
      (error) => console.error('❌ Erreur listener tasks:', error)
    );

    // Listener sur la gamification
    const gamificationUnsubscribe = onSnapshot(
      collection(db, 'userGamification'),
      (snapshot) => {
        setRealtimeStats(prev => ({
          ...prev,
          gamificationCount: snapshot.size,
          lastGamificationUpdate: new Date()
        }));
      },
      (error) => console.error('❌ Erreur listener gamification:', error)
    );

    // Cleanup des listeners
    return () => {
      usersUnsubscribe();
      tasksUnsubscribe();
      gamificationUnsubscribe();
    };
  };

  // 📊 CHARGER LES DONNÉES DE SYNCHRONISATION (VERSION AVANCÉE)
  const loadSyncData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 [ADMIN-SYNC] Analyse avancée de la base de données...');

      // Analyser les collections principales avec détails
      const collections = [
        'users',
        'tasks', 
        'projects',
        'userGamification',
        'taskSubmissions',
        'rewardRequests',
        'adminLogs',
        'notifications'
      ];

      const stats = {};
      const detectedIssues = [];

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          stats[collectionName] = {
            total: snapshot.size,
            docs: docs,
            healthy: 0,
            warnings: 0,
            errors: 0
          };

          // 🔍 VÉRIFICATIONS AVANCÉES PAR TYPE DE COLLECTION
          snapshot.docs.forEach(docSnapshot => {
            const data = docSnapshot.data();
            let docStatus = 'healthy';
            
            // === USERS ===
            if (collectionName === 'users') {
              if (!data.email || !data.createdAt) {
                detectedIssues.push({
                  type: 'data_corruption',
                  collection: collectionName,
                  docId: docSnapshot.id,
                  issue: 'Données utilisateur incomplètes (email ou createdAt manquant)',
                  severity: 'high',
                  fixable: true
                });
                docStatus = 'error';
              }
              if (!data.displayName) {
                detectedIssues.push({
                  type: 'data_incomplete',
                  collection: collectionName,
                  docId: docSnapshot.id,
                  issue: 'Nom d\'affichage manquant',
                  severity: 'medium',
                  fixable: true
                });
                docStatus = docStatus === 'error' ? 'error' : 'warning';
              }
            }

            // === USER GAMIFICATION ===
            if (collectionName === 'userGamification') {
              if (typeof data.totalXP !== 'number' || data.totalXP < 0) {
                detectedIssues.push({
                  type: 'data_invalid',
                  collection: collectionName,
                  docId: docSnapshot.id,
                  issue: 'XP invalide ou négatif',
                  severity: 'high',
                  fixable: true
                });
                docStatus = 'error';
              }
              if (!data.level || data.level < 1) {
                detectedIssues.push({
                  type: 'data_invalid',
                  collection: collectionName,
                  docId: docSnapshot.id,
                  issue: 'Niveau invalide',
                  severity: 'high',
                  fixable: true
                });
                docStatus = 'error';
              }
              if (!Array.isArray(data.badges)) {
                detectedIssues.push({
                  type: 'data_structure',
                  collection: collectionName,
                  docId: docSnapshot.id,
                  issue: 'Structure de badges invalide',
                  severity: 'medium',
                  fixable: true
                });
                docStatus = docStatus === 'error' ? 'error' : 'warning';
              }
            }

            // === TASKS ===
            if (collectionName === 'tasks') {
              if (!data.title || !data.status) {
                detectedIssues.push({
                  type: 'data_incomplete',
                  collection: collectionName,
                  docId: docSnapshot.id,
                  issue: 'Tâche incomplète (titre ou statut manquant)',
                  severity: 'high',
                  fixable: false
                });
                docStatus = 'error';
              }
              if (!data.assignedTo || data.assignedTo.length === 0) {
                detectedIssues.push({
                  type: 'data_incomplete',
                  collection: collectionName,
                  docId: docSnapshot.id,
                  issue: 'Tâche non assignée',
                  severity: 'low',
                  fixable: false
                });
                docStatus = docStatus === 'error' ? 'error' : 'warning';
              }
            }

            // Compter les statuts
            if (docStatus === 'healthy') stats[collectionName].healthy++;
            else if (docStatus === 'warning') stats[collectionName].warnings++;
            else if (docStatus === 'error') stats[collectionName].errors++;
          });

        } catch (error) {
          console.error(`❌ Erreur analyse ${collectionName}:`, error);
          detectedIssues.push({
            type: 'access_error',
            collection: collectionName,
            issue: `Impossible d'accéder à la collection: ${error.message}`,
            severity: 'critical',
            fixable: false
          });
        }
      }

      // 🔍 VÉRIFIER LES ORPHELINS
      console.log('🔍 Vérification des données orphelines...');
      const userIds = new Set(stats.users?.docs.map(u => u.id) || []);
      
      stats.userGamification?.docs.forEach(gamDoc => {
        if (!userIds.has(gamDoc.id)) {
          detectedIssues.push({
            type: 'orphaned_data',
            collection: 'userGamification',
            docId: gamDoc.id,
            issue: 'Profil de gamification orphelin (utilisateur supprimé)',
            severity: 'medium',
            fixable: true
          });
        }
      });

      setDbStats(stats);
      setIssues(detectedIssues);

      // Charger l'historique des synchronisations
      try {
        const syncHistoryRef = doc(db, 'adminLogs', 'syncHistory');
        const syncHistoryDoc = await getDoc(syncHistoryRef);
        
        if (syncHistoryDoc.exists()) {
          const syncHistory = syncHistoryDoc.data();
          if (syncHistory.lastSync) {
            setLastSyncTime({
              timestamp: syncHistory.lastSync.toDate(),
              type: syncHistory.syncType || 'unknown',
              admin: syncHistory.adminId || 'Unknown',
              results: syncHistory.results || {},
              duration: syncHistory.duration || 0
            });
          }
        } else {
          // Créer le document s'il n'existe pas
          await setDoc(syncHistoryRef, {
            lastSync: null,
            syncType: 'none',
            adminId: 'system',
            results: {},
            duration: 0
          });
        }
      } catch (error) {
        console.warn('⚠️ Impossible de charger l\'historique sync:', error);
      }

      console.log('✅ [ADMIN-SYNC] Analyse terminée');
      console.log(`📊 ${detectedIssues.length} problèmes détectés`);

    } catch (error) {
      console.error('❌ [ADMIN-SYNC] Erreur chargement:', error);
      showNotification('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 EFFECTUER UNE SYNCHRONISATION (VERSION AMÉLIORÉE)
  const performSync = async (syncType = 'full') => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      showNotification(`Synchronisation ${syncType} démarrée...`, 'info');
      console.log('🔄 [ADMIN-SYNC] Début synchronisation:', syncType);

      const startTime = Date.now();
      const syncResult = {
        usersUpdated: 0,
        gamificationFixed: 0,
        gamificationCreated: 0,
        orphanedDeleted: 0,
        duplicatesRemoved: 0,
        errorsFixed: 0
      };

      // 1. Synchroniser les données de gamification
      if (syncType === 'full' || syncType === 'gamification') {
        console.log('🎮 Synchronisation gamification...');
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const batch = writeBatch(db);
        let batchCount = 0;

        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const userData = userDoc.data();
          
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
              completedQuests: [],
              stats: {
                tasksCompleted: 0,
                questsCompleted: 0,
                rewardsEarned: 0
              },
              createdAt: serverTimestamp(),
              lastUpdated: serverTimestamp()
            });
            syncResult.gamificationCreated++;
            batchCount++;
          } else {
            // Vérifier et corriger les données existantes
            const gamificationData = gamificationDoc.data();
            const updates = {};

            if (typeof gamificationData.totalXP !== 'number' || gamificationData.totalXP < 0) {
              updates.totalXP = 0;
              syncResult.errorsFixed++;
            }
            if (!gamificationData.level || gamificationData.level < 1) {
              updates.level = 1;
              syncResult.errorsFixed++;
            }
            if (!Array.isArray(gamificationData.badges)) {
              updates.badges = [];
              syncResult.errorsFixed++;
            }
            if (!Array.isArray(gamificationData.achievements)) {
              updates.achievements = [];
              syncResult.errorsFixed++;
            }
            if (!gamificationData.stats) {
              updates.stats = {
                tasksCompleted: 0,
                questsCompleted: 0,
                rewardsEarned: 0
              };
              syncResult.errorsFixed++;
            }

            if (Object.keys(updates).length > 0) {
              updates.lastUpdated = serverTimestamp();
              batch.update(gamificationRef, updates);
              syncResult.gamificationFixed++;
              batchCount++;
            }
          }

          // Commit tous les 450 documents (limite Firestore: 500)
          if (batchCount >= 450) {
            await batch.commit();
            console.log(`✅ Batch de ${batchCount} opérations validé`);
            batchCount = 0;
          }
        }

        // Commit final
        if (batchCount > 0) {
          await batch.commit();
          console.log(`✅ Batch final de ${batchCount} opérations validé`);
        }

        syncResult.usersUpdated = usersSnapshot.size;
      }

      // 2. Nettoyer les données orphelines
      if (syncType === 'full' || syncType === 'cleanup') {
        console.log('🧹 Nettoyage données orphelines...');
        
        // Récupérer tous les IDs utilisateurs valides
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const validUserIds = new Set();
        usersSnapshot.forEach(doc => validUserIds.add(doc.id));

        // Vérifier userGamification
        const gamificationSnapshot = await getDocs(collection(db, 'userGamification'));
        const orphanedBatch = writeBatch(db);
        let orphanedCount = 0;

        for (const gamDoc of gamificationSnapshot.docs) {
          if (!validUserIds.has(gamDoc.id)) {
            orphanedBatch.delete(gamDoc.ref);
            orphanedCount++;
            syncResult.orphanedDeleted++;
          }
        }

        if (orphanedCount > 0) {
          await orphanedBatch.commit();
          console.log(`✅ ${orphanedCount} documents orphelins supprimés`);
        }

        // Vérifier taskSubmissions orphelines
        const submissionsSnapshot = await getDocs(collection(db, 'taskSubmissions'));
        const submissionsBatch = writeBatch(db);
        let submissionsOrphaned = 0;

        for (const submissionDoc of submissionsSnapshot.docs) {
          const submissionData = submissionDoc.data();
          if (submissionData.userId && !validUserIds.has(submissionData.userId)) {
            submissionsBatch.delete(submissionDoc.ref);
            submissionsOrphaned++;
            syncResult.orphanedDeleted++;
          }
        }

        if (submissionsOrphaned > 0) {
          await submissionsBatch.commit();
          console.log(`✅ ${submissionsOrphaned} soumissions orphelines supprimées`);
        }
      }

      // 3. Sauvegarder les résultats de la synchronisation
      const duration = Date.now() - startTime;
      const syncLogRef = doc(db, 'adminLogs', 'syncHistory');
      
      await setDoc(syncLogRef, {
        lastSync: serverTimestamp(),
        syncType,
        adminId: user.email || user.uid,
        adminName: user.displayName || 'Admin',
        results: syncResult,
        duration,
        timestamp: new Date().toISOString()
      });

      setSyncResults(syncResult);
      setLastSyncTime({
        timestamp: new Date(),
        type: syncType,
        admin: user.email || user.displayName,
        results: syncResult,
        duration
      });

      console.log('✅ [ADMIN-SYNC] Synchronisation terminée:', syncResult);
      showNotification(
        `Synchronisation réussie! ${syncResult.usersUpdated} utilisateurs traités`,
        'success'
      );
      
      // Recharger les données après sync
      setTimeout(() => loadSyncData(), 1000);

    } catch (error) {
      console.error('❌ [ADMIN-SYNC] Erreur synchronisation:', error);
      showNotification(`Erreur: ${error.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 📊 Calculer le score de santé de la DB (VERSION AMÉLIORÉE)
  const calculateHealthScore = () => {
    if (!dbStats || !issues) return 0;
    
    const totalDocs = Object.values(dbStats).reduce((sum, collection) => sum + collection.total, 0);
    if (totalDocs === 0) return 0;

    // Pondération par sévérité
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const highSeverityIssues = issues.filter(issue => issue.severity === 'high').length;
    const mediumSeverityIssues = issues.filter(issue => issue.severity === 'medium').length;
    const lowSeverityIssues = issues.filter(issue => issue.severity === 'low').length;

    // Calcul avec poids différents
    const issueImpact = (
      criticalIssues * 20 +
      highSeverityIssues * 10 + 
      mediumSeverityIssues * 5 +
      lowSeverityIssues * 2
    );
    
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
      color: healthScore > 80 ? "text-green-400" : healthScore > 60 ? "text-yellow-400" : "text-red-400",
      trend: healthScore > 80 ? "up" : "down"
    },
    { 
      label: "Problèmes", 
      value: issues.length.toString(), 
      icon: AlertTriangle, 
      color: issues.length === 0 ? "text-green-400" : issues.length < 5 ? "text-yellow-400" : "text-red-400",
      trend: issues.length === 0 ? "up" : "down"
    },
    { 
      label: "Utilisateurs", 
      value: realtimeStats.usersCount?.toString() || dbStats?.users?.total?.toString() || "0", 
      icon: Users, 
      color: "text-blue-400",
      trend: "stable"
    },
    { 
      label: "Sync", 
      value: lastSyncTime ? "✓ OK" : "Jamais", 
      icon: CheckCircle, 
      color: lastSyncTime ? "text-green-400" : "text-gray-400",
      trend: lastSyncTime ? "up" : "down"
    }
  ];

  // ✅ INTERFACE DE CHARGEMENT
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <HamburgerMenu />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6"
              >
                <Database className="w-16 h-16 text-purple-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Analyse en cours...</h3>
              <p className="text-gray-400">Vérification de la base de données</p>
              
              <div className="mt-6 flex items-center justify-center gap-2">
                <motion.div 
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-pink-500 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* MENU HAMBURGER */}
      <HamburgerMenu />

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-4 left-1/2 z-50 max-w-md"
          >
            <div className={`px-6 py-4 rounded-lg shadow-2xl backdrop-blur-sm border ${
              notification.type === 'success' ? 'bg-green-900/80 border-green-500/50' :
              notification.type === 'error' ? 'bg-red-900/80 border-red-500/50' :
              'bg-blue-900/80 border-blue-500/50'
            }`}>
              <div className="flex items-center gap-3">
                {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                <p className="text-white font-medium">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* HEADER PREMIUM */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Titre principal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Synchronisation Admin</h1>
                <p className="text-gray-400">Gestion et maintenance de la base de données</p>
              </div>
            </div>
            
            {/* Actions rapides */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadSyncData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => performSync('full')}
                disabled={isSyncing}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Synchroniser
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {headerStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gray-800/50 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ONGLETS DE NAVIGATION */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-2 mb-8 border border-gray-700/50"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'issues', label: 'Problèmes', icon: AlertTriangle, badge: issues.length },
              { id: 'maintenance', label: 'Maintenance', icon: Settings },
              { id: 'logs', label: 'Historique', icon: FileText }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* CONTENU DES ONGLETS */}
        <AnimatePresence mode="wait">
          {/* ONGLET OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Score de santé principal */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Score de Santé Global
                </h3>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className={`text-7xl font-bold mb-4 bg-gradient-to-r ${
                      healthScore > 80 ? 'from-green-400 to-green-600' : 
                      healthScore > 60 ? 'from-yellow-400 to-orange-500' : 
                      'from-red-400 to-red-600'
                    } text-transparent bg-clip-text`}
                  >
                    {healthScore}%
                  </motion.div>
                  
                  <div className="w-full bg-gray-700/50 rounded-full h-6 mb-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${healthScore}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-6 rounded-full ${
                        healthScore > 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        healthScore > 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                    />
                  </div>
                  
                  <p className={`text-lg font-medium ${
                    healthScore > 80 ? 'text-green-300' : 
                    healthScore > 60 ? 'text-yellow-300' : 'text-red-300'
                  }`}>
                    {healthScore > 80 ? '✨ Excellente santé - Système optimal' :
                     healthScore > 60 ? '⚠️ Santé acceptable - Améliorations recommandées' : 
                     '🚨 Attention requise - Synchronisation nécessaire'}
                  </p>
                </div>
              </div>

              {/* État des collections */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  État des Collections
                </h3>

                {dbStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(dbStats).map(([collectionName, data], index) => (
                      <motion.div
                        key={collectionName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-medium capitalize">
                            {collectionName.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                          {data.total}
                        </div>
                        
                        {/* Mini stats */}
                        <div className="flex items-center gap-2 text-xs">
                          {data.healthy > 0 && (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              {data.healthy}
                            </span>
                          )}
                          {data.warnings > 0 && (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <AlertTriangle className="w-3 h-3" />
                              {data.warnings}
                            </span>
                          )}
                          {data.errors > 0 && (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="w-3 h-3" />
                              {data.errors}
                            </span>
                          )}
                        </div>
                        
                        {/* Barre de progression */}
                        <div className="mt-4 bg-gray-700/50 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (data.total / 50) * 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Aucune donnée disponible</p>
                  </div>
                )}
              </div>

              {/* Stats temps réel */}
              {realtimeStats && Object.keys(realtimeStats).length > 0 && (
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-green-400" />
                    Statistiques Temps Réel
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {realtimeStats.usersCount !== undefined && (
                      <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                        <Users className="w-8 h-8 text-blue-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Utilisateurs actifs</p>
                          <p className="text-2xl font-bold text-white">{realtimeStats.usersCount}</p>
                        </div>
                      </div>
                    )}
                    {realtimeStats.tasksCount !== undefined && (
                      <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                        <CheckCheck className="w-8 h-8 text-green-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Tâches totales</p>
                          <p className="text-2xl font-bold text-white">{realtimeStats.tasksCount}</p>
                        </div>
                      </div>
                    )}
                    {realtimeStats.gamificationCount !== undefined && (
                      <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                        <Zap className="w-8 h-8 text-yellow-400" />
                        <div>
                          <p className="text-gray-400 text-sm">Profils gamification</p>
                          <p className="text-2xl font-bold text-white">{realtimeStats.gamificationCount}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ONGLET ISSUES */}
          {activeTab === 'issues' && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  Problèmes Détectés ({issues.length})
                </h3>

                {issues.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-green-300 font-medium text-lg">✨ Aucun problème détecté</p>
                    <p className="text-gray-400 text-sm mt-2">Votre base de données est en excellent état</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {issues.map((issue, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-6 rounded-xl border-l-4 ${
                          issue.severity === 'critical' ? 'bg-red-950/30 border-red-500' :
                          issue.severity === 'high' ? 'bg-red-900/20 border-red-400' :
                          issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                          'bg-blue-900/20 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-medium">{issue.issue}</h4>
                              {issue.fixable && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                                  Réparable
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">
                              Collection: <span className="text-purple-400 font-mono">{issue.collection}</span>
                              {issue.docId && (
                                <> • Document: <span className="text-blue-400 font-mono">{issue.docId}</span></>
                              )}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">Type: {issue.type}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                            issue.severity === 'critical' ? 'bg-red-500 text-white' :
                            issue.severity === 'high' ? 'bg-red-500/50 text-red-200' :
                            issue.severity === 'medium' ? 'bg-yellow-500/50 text-yellow-200' :
                            'bg-blue-500/50 text-blue-200'
                          }`}>
                            {issue.severity}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ONGLET MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-400" />
                  Actions de Maintenance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sync Gamification */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-yellow-500/20 rounded-lg">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h4 className="text-white font-medium text-lg">Sync Gamification</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Synchronise et répare les données de gamification (XP, niveaux, badges)
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => performSync('gamification')}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Synchronisation...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Synchroniser
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Nettoyage */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-red-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-500/20 rounded-lg">
                        <Trash2 className="w-6 h-6 text-red-400" />
                      </div>
                      <h4 className="text-white font-medium text-lg">Nettoyage</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Supprime les données orphelines et les documents corrompus
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => performSync('cleanup')}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Nettoyage...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Nettoyer
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Synchronisation complète */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <RefreshCw className="w-6 h-6 text-purple-400" />
                      </div>
                      <h4 className="text-white font-medium text-lg">Sync Complète</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Synchronisation totale : gamification + nettoyage + optimisation
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => performSync('full')}
                      disabled={isSyncing}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          En cours...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Tout synchroniser
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Export/Backup (à venir) */}
                  <motion.div
                    className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 opacity-50"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Download className="w-6 h-6 text-blue-400" />
                      </div>
                      <h4 className="text-white font-medium text-lg">Export/Sauvegarde</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Exporte les données importantes (fonctionnalité à venir)
                    </p>
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Bientôt disponible
                    </button>
                  </motion.div>
                </div>
              </div>

              {/* Résultats de la dernière sync */}
              {syncResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
                >
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Résultats de la Dernière Synchronisation
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(syncResults).map(([key, value], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-center p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="text-3xl font-bold text-purple-400 mb-1">{value}</div>
                        <div className="text-xs text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ONGLET LOGS */}
          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Historique des Synchronisations
                </h3>

                {lastSyncTime ? (
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-700 rounded-xl p-6 bg-gray-800/30"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium text-lg">Dernière synchronisation</h4>
                        <span className="text-sm text-gray-400">
                          {lastSyncTime.timestamp.toLocaleString('fr-FR', {
                            dateStyle: 'full',
                            timeStyle: 'medium'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Type: <span className="text-purple-400">{lastSyncTime.type}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin: <span className="text-blue-400">{lastSyncTime.admin}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Durée: <span className="text-green-400">{lastSyncTime.duration}ms</span>
                        </span>
                      </div>
                      
                      {lastSyncTime.results && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-700">
                          {Object.entries(lastSyncTime.results).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{value}</div>
                              <div className="text-xs text-gray-500 capitalize mt-1">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Aucune synchronisation enregistrée</p>
                    <p className="text-gray-500 text-sm mt-2">Lancez votre première synchronisation pour voir l'historique</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminSyncPage;
