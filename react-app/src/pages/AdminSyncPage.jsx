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

// Layout
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../components/layout/PremiumLayout.jsx';

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
import { db } from '../firebase.config.js';

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
      
      // Analyser la base de données
      const stats = await analyzeDatabaseStats();
      setDbStats(stats);
      
      // Détecter les problèmes
      const detectedIssues = await detectDataIssues();
      setIssues(detectedIssues);
      
      // Récupérer la dernière synchronisation
      const lastSync = await getLastSyncInfo();
      setLastSyncTime(lastSync);
      
      console.log('✅ Données de synchronisation chargées');
      
    } catch (error) {
      console.error('❌ Erreur chargement données sync:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 ANALYSER LES STATISTIQUES DE LA BASE DE DONNÉES
  const analyzeDatabaseStats = async () => {
    try {
      const stats = {
        users: { total: 0, active: 0, inactive: 0 },
        tasks: { total: 0, completed: 0, pending: 0 },
        projects: { total: 0, active: 0, archived: 0 },
        rewards: { total: 0, claimed: 0, pending: 0 },
        interviews: { total: 0, completed: 0, scheduled: 0 },
        badges: { total: 0, earned: 0 },
        notifications: { total: 0, read: 0, unread: 0 }
      };

      // Analyser les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      stats.users.total = usersSnapshot.size;
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (userData.isActive !== false) {
          stats.users.active++;
        } else {
          stats.users.inactive++;
        }
      });

      // Analyser les tâches
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      stats.tasks.total = tasksSnapshot.size;
      tasksSnapshot.docs.forEach(doc => {
        const taskData = doc.data();
        if (taskData.status === 'completed') {
          stats.tasks.completed++;
        } else {
          stats.tasks.pending++;
        }
      });

      // Analyser les projets
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      stats.projects.total = projectsSnapshot.size;
      projectsSnapshot.docs.forEach(doc => {
        const projectData = doc.data();
        if (projectData.status === 'archived') {
          stats.projects.archived++;
        } else {
          stats.projects.active++;
        }
      });

      // Analyser les récompenses
      const rewardsSnapshot = await getDocs(collection(db, 'rewardRequests'));
      stats.rewards.total = rewardsSnapshot.size;
      rewardsSnapshot.docs.forEach(doc => {
        const rewardData = doc.data();
        if (rewardData.status === 'approved') {
          stats.rewards.claimed++;
        } else {
          stats.rewards.pending++;
        }
      });

      // Analyser les entretiens
      const interviewsSnapshot = await getDocs(collection(db, 'interviews'));
      stats.interviews.total = interviewsSnapshot.size;
      interviewsSnapshot.docs.forEach(doc => {
        const interviewData = doc.data();
        if (interviewData.status === 'completed') {
          stats.interviews.completed++;
        } else {
          stats.interviews.scheduled++;
        }
      });

      console.log('📊 Statistiques DB analysées:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Erreur analyse DB:', error);
      return null;
    }
  };

  // 🔍 DÉTECTER LES PROBLÈMES DE DONNÉES
  const detectDataIssues = async () => {
    const detectedIssues = [];
    
    try {
      // Vérifier les utilisateurs orphelins
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let orphanUsers = 0;
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        if (!userData.email || !userData.createdAt) {
          orphanUsers++;
        }
      });
      
      if (orphanUsers > 0) {
        detectedIssues.push({
          type: 'warning',
          category: 'Users',
          title: 'Utilisateurs avec données incomplètes',
          description: `${orphanUsers} utilisateur(s) sans email ou date de création`,
          count: orphanUsers,
          action: 'fix_users'
        });
      }

      // Vérifier les tâches orphelines
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      let orphanTasks = 0;
      
      tasksSnapshot.docs.forEach(doc => {
        const taskData = doc.data();
        if (!taskData.assignedTo || !taskData.projectId) {
          orphanTasks++;
        }
      });
      
      if (orphanTasks > 0) {
        detectedIssues.push({
          type: 'error',
          category: 'Tasks',
          title: 'Tâches orphelines',
          description: `${orphanTasks} tâche(s) sans assignation ou projet`,
          count: orphanTasks,
          action: 'fix_tasks'
        });
      }

      // Vérifier les récompenses en attente anciennes
      const rewardsSnapshot = await getDocs(collection(db, 'rewardRequests'));
      let oldPendingRewards = 0;
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      rewardsSnapshot.docs.forEach(doc => {
        const rewardData = doc.data();
        const requestDate = rewardData.requestedAt?.toDate?.() || new Date(rewardData.requestedAt);
        
        if (rewardData.status === 'pending' && requestDate < oneWeekAgo) {
          oldPendingRewards++;
        }
      });
      
      if (oldPendingRewards > 0) {
        detectedIssues.push({
          type: 'warning',
          category: 'Rewards',
          title: 'Récompenses en attente anciennes',
          description: `${oldPendingRewards} demande(s) de récompenses en attente depuis plus d'une semaine`,
          count: oldPendingRewards,
          action: 'review_rewards'
        });
      }

      // Vérifier les notifications non lues anciennes
      const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
      let oldUnreadNotifications = 0;
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      notificationsSnapshot.docs.forEach(doc => {
        const notificationData = doc.data();
        const createDate = notificationData.createdAt?.toDate?.() || new Date(notificationData.createdAt);
        
        if (!notificationData.read && createDate < oneMonthAgo) {
          oldUnreadNotifications++;
        }
      });
      
      if (oldUnreadNotifications > 0) {
        detectedIssues.push({
          type: 'info',
          category: 'Notifications',
          title: 'Notifications anciennes non lues',
          description: `${oldUnreadNotifications} notification(s) non lues de plus d'un mois`,
          count: oldUnreadNotifications,
          action: 'cleanup_notifications'
        });
      }

      console.log('🔍 Problèmes détectés:', detectedIssues);
      return detectedIssues;
      
    } catch (error) {
      console.error('❌ Erreur détection problèmes:', error);
      return [];
    }
  };

  // ℹ️ RÉCUPÉRER INFO DERNIÈRE SYNCHRONISATION
  const getLastSyncInfo = async () => {
    try {
      const syncDoc = await getDoc(doc(db, 'system', 'lastSync'));
      if (syncDoc.exists()) {
        const data = syncDoc.data();
        return {
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
          type: data.type || 'manual',
          results: data.results || {},
          admin: data.admin || 'Inconnu'
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération dernière sync:', error);
      return null;
    }
  };

  // 🔧 EXÉCUTER LA SYNCHRONISATION
  const performSync = async (syncType = 'full') => {
    try {
      setIsSyncing(true);
      console.log(`🔧 Début synchronisation ${syncType}...`);
      
      const results = {
        usersFixed: 0,
        tasksFixed: 0,
        rewardsProcessed: 0,
        notificationsCleaned: 0,
        errors: []
      };

      // Réparer les utilisateurs avec données incomplètes
      if (syncType === 'full' || syncType === 'users') {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const batch = writeBatch(db);
        
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          const updates = {};
          
          if (!userData.createdAt) {
            updates.createdAt = serverTimestamp();
            results.usersFixed++;
          }
          
          if (!userData.gamification) {
            updates.gamification = {
              totalXp: 0,
              level: 1,
              badges: [],
              tasksCompleted: 0
            };
            results.usersFixed++;
          }
          
          if (Object.keys(updates).length > 0) {
            batch.update(doc.ref, updates);
          }
        });
        
        await batch.commit();
      }

      // Nettoyer les notifications anciennes
      if (syncType === 'full' || syncType === 'cleanup') {
        const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
        const batch = writeBatch(db);
        const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        
        notificationsSnapshot.docs.forEach(doc => {
          const notificationData = doc.data();
          const createDate = notificationData.createdAt?.toDate?.() || new Date(notificationData.createdAt);
          
          if (createDate < threeMonthsAgo) {
            batch.delete(doc.ref);
            results.notificationsCleaned++;
          }
        });
        
        await batch.commit();
      }

      // Sauvegarder les résultats de synchronisation
      await updateDoc(doc(db, 'system', 'lastSync'), {
        timestamp: serverTimestamp(),
        type: syncType,
        results,
        admin: user.displayName || user.email
      });

      setSyncResults(results);
      setLastSyncTime({
        timestamp: new Date(),
        type: syncType,
        results,
        admin: user.displayName || user.email
      });

      // Recharger les données
      await loadSyncData();
      
      console.log('✅ Synchronisation terminée:', results);
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      setSyncResults({ error: error.message });
    } finally {
      setIsSyncing(false);
    }
  };

  // 🎨 OBTENIR LA COULEUR SELON LE TYPE D'ISSUE
  const getIssueColor = (type) => {
    const colors = {
      error: 'text-red-600 bg-red-100 border-red-200',
      warning: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      info: 'text-blue-600 bg-blue-100 border-blue-200'
    };
    return colors[type] || colors.info;
  };

  // 🎨 OBTENIR L'ICÔNE SELON LE TYPE D'ISSUE
  const getIssueIcon = (type) => {
    const icons = {
      error: AlertTriangle,
      warning: AlertCircle,
      info: Info
    };
    return icons[type] || Info;
  };

  // 📊 CALCULER LE SCORE DE SANTÉ
  const getHealthScore = () => {
    if (!dbStats) return 0;
    
    const totalElements = Object.values(dbStats).reduce((sum, category) => sum + category.total, 0);
    const issueCount = issues.length;
    
    if (totalElements === 0) return 100;
    
    const healthScore = Math.max(0, 100 - (issueCount / totalElements * 100));
    return Math.round(healthScore);
  };

  const healthScore = getHealthScore();

  // 📊 STATISTIQUES POUR L'EN-TÊTE
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
            {tab.id === 'issues' && issues.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {issues.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Score de santé */}
          <PremiumCard>
            <div className="text-center py-8">
              <div className={`text-6xl font-bold mb-4 ${
                healthScore > 80 ? 'text-green-400' : 
                healthScore > 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {healthScore}%
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Score de Santé de la Base</h3>
              <p className="text-gray-400">
                {healthScore > 90 ? 'Excellent état' :
                 healthScore > 70 ? 'Bon état avec quelques améliorations possibles' :
                 healthScore > 50 ? 'État moyen, maintenance recommandée' :
                 'État critique, intervention requise'}
              </p>
              
              {lastSyncTime && (
                <div className="mt-4 text-sm text-gray-500">
                  Dernière synchronisation: {lastSyncTime.timestamp.toLocaleString()} 
                  par {lastSyncTime.admin}
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Statistiques détaillées */}
          {dbStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(dbStats).map(([category, stats]) => (
                <PremiumCard key={category}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {stats.total}
                    </div>
                    <h4 className="text-white font-medium capitalize mb-3">{category}</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(stats).filter(([key]) => key !== 'total').map(([key, value]) => (
                        <div key={key} className="flex justify-between text-gray-400">
                          <span className="capitalize">{key}:</span>
                          <span className="text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PremiumCard>
              ))}
            </div>
          )}

          {/* Résultats de synchronisation */}
          {syncResults && (
            <PremiumCard>
              <h3 className="text-white font-semibold mb-4">
                {syncResults.error ? '❌ Erreur de Synchronisation' : '✅ Dernière Synchronisation'}
              </h3>
              
              {syncResults.error ? (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400">{syncResults.error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{syncResults.usersFixed}</div>
                    <div className="text-sm text-gray-400">Utilisateurs réparés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{syncResults.tasksFixed}</div>
                    <div className="text-sm text-gray-400">Tâches réparées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">{syncResults.rewardsProcessed}</div>
                    <div className="text-sm text-gray-400">Récompenses traitées</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{syncResults.notificationsCleaned}</div>
                    <div className="text-sm text-gray-400">Notifications nettoyées</div>
                  </div>
                </div>
              )}
            </PremiumCard>
          )}
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">🔍 Problèmes Détectés</h3>
            
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-400 font-medium">Aucun problème détecté !</p>
                <p className="text-gray-400 text-sm mt-2">Votre base de données est en excellent état</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, index) => {
                  const IconComponent = getIssueIcon(issue.type);
                  
                  return (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getIssueColor(issue.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="w-5 h-5 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{issue.title}</h4>
                            <span className="text-sm font-medium">{issue.count}</span>
                          </div>
                          <p className="text-sm mb-3">{issue.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded">
                              {issue.category}
                            </span>
                            <button
                              onClick={() => performSync(issue.action)}
                              disabled={isSyncing}
                              className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
                            >
                              Corriger
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PremiumCard>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">🔧 Actions de Maintenance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => performSync('users')}
                disabled={isSyncing}
                className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-all text-left"
              >
                <Users className="w-6 h-6 text-blue-400" />
                <div>
                  <h4 className="text-white font-medium">Réparer Utilisateurs</h4>
                  <p className="text-gray-400 text-sm">Corriger les données utilisateurs incomplètes</p>
                </div>
              </button>
              
              <button
                onClick={() => performSync('cleanup')}
                disabled={isSyncing}
                className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-all text-left"
              >
                <Trash2 className="w-6 h-6 text-red-400" />
                <div>
                  <h4 className="text-white font-medium">Nettoyer Base</h4>
                  <p className="text-gray-400 text-sm">Supprimer les données anciennes et inutiles</p>
                </div>
              </button>
              
              <button
                onClick={() => performSync('full')}
                disabled={isSyncing}
                className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-all text-left"
              >
                <RefreshCw className="w-6 h-6 text-green-400" />
                <div>
                  <h4 className="text-white font-medium">Synchronisation Complète</h4>
                  <p className="text-gray-400 text-sm">Réparer tous les problèmes détectés</p>
                </div>
              </button>
              
              <button
                onClick={loadSyncData}
                disabled={isLoading}
                className="flex items-center gap-3 p-4 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-all text-left"
              >
                <Activity className="w-6 h-6 text-yellow-400" />
                <div>
                  <h4 className="text-white font-medium">Réanalyser</h4>
                  <p className="text-gray-400 text-sm">Relancer l'analyse de la base de données</p>
                </div>
              </button>
            </div>
          </PremiumCard>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <PremiumCard>
            <h3 className="text-white font-semibold mb-4">📋 Historique des Synchronisations</h3>
            
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
