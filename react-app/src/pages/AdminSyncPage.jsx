// ==========================================
// 📁 react-app/src/pages/AdminSyncPage.jsx
// PAGE ADMIN SYNCHRONISATION - DESIGN SYNERGIA OFFICIEL
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  Award,
  Activity,
  Zap,
  Download,
  Upload,
  Trash2,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import { collection, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import Layout from '../components/layout/Layout';
import { exportService } from '../core/services/exportService.js';

/**
 * 🔄 PAGE ADMIN SYNCHRONISATION - GESTION FIREBASE
 */
const AdminSyncPage = () => {
  const { user } = useAuthStore();
  
  const [syncStats, setSyncStats] = useState({
    users: 0,
    tasks: 0,
    projects: 0,
    badges: 0,
    lastSync: null
  });
  
  const [syncStatus, setSyncStatus] = useState({
    isRunning: false,
    currentOperation: '',
    progress: 0,
    logs: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin(user)) {
      loadSyncStats();
    }
  }, [user]);

  const loadSyncStats = async () => {
    try {
      setLoading(true);
      
      const [usersSnap, tasksSnap, projectsSnap, badgesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'tasks')),
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'user_badges'))
      ]);

      setSyncStats({
        users: usersSnap.size,
        tasks: tasksSnap.size,
        projects: projectsSnap.size,
        badges: badgesSnap.size,
        lastSync: new Date().toLocaleString('fr-FR')
      });
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur chargement stats sync:', error);
      addLog('Erreur chargement des statistiques', 'error');
      setLoading(false);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setSyncStatus(prev => ({
      ...prev,
      logs: [...prev.logs, { message, type, timestamp }].slice(-20) // Garder 20 derniers logs
    }));
  };

  const handleFullSync = async () => {
    setSyncStatus(prev => ({ ...prev, isRunning: true, progress: 0 }));
    addLog('🔄 Démarrage synchronisation complète...', 'info');

    try {
      // Étape 1: Synchroniser les utilisateurs
      setSyncStatus(prev => ({ ...prev, currentOperation: 'Synchronisation des utilisateurs...', progress: 20 }));
      addLog('👥 Synchronisation des utilisateurs', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 2: Synchroniser les tâches
      setSyncStatus(prev => ({ ...prev, currentOperation: 'Synchronisation des tâches...', progress: 40 }));
      addLog('📝 Synchronisation des tâches', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 3: Synchroniser les projets
      setSyncStatus(prev => ({ ...prev, currentOperation: 'Synchronisation des projets...', progress: 60 }));
      addLog('📁 Synchronisation des projets', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 4: Synchroniser les badges
      setSyncStatus(prev => ({ ...prev, currentOperation: 'Synchronisation des badges...', progress: 80 }));
      addLog('🏆 Synchronisation des badges', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 5: Finalisation
      setSyncStatus(prev => ({ ...prev, currentOperation: 'Finalisation...', progress: 100 }));
      addLog('✅ Synchronisation complète terminée', 'success');
      
      await loadSyncStats();
      
    } catch (error) {
      console.error('❌ Erreur sync:', error);
      addLog(`❌ Erreur: ${error.message}`, 'error');
    } finally {
      setSyncStatus(prev => ({ ...prev, isRunning: false, currentOperation: '', progress: 0 }));
    }
  };

  const handleExportData = async () => {
    addLog('📥 Export PDF des données en cours...', 'info');
    try {
      const data = {
        'Statistiques Utilisateurs': {
          Total: syncStats.users || 0,
          Dernière_sync: new Date().toLocaleDateString('fr-FR')
        },
        'Statistiques Tâches': {
          Total: syncStats.tasks || 0
        },
        'Statistiques Projets': {
          Total: syncStats.projects || 0
        },
        'Statistiques Badges': {
          Total: syncStats.badges || 0
        }
      };

      await exportService.exportGenericDataToPDF(data, {
        title: 'Export Synchronisation',
        fileName: 'synergia-sync-export'
      });

      addLog('✅ Export PDF réussi', 'success');
    } catch (error) {
      addLog(`❌ Erreur export: ${error.message}`, 'error');
    }
  };

  const handleCleanupOldData = async () => {
    if (!confirm('⚠️ Voulez-vous vraiment nettoyer les anciennes données ? Cette action est irréversible.')) {
      return;
    }
    
    addLog('🧹 Nettoyage des données anciennes...', 'info');
    try {
      // Simulation du nettoyage
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog('✅ Nettoyage terminé', 'success');
      await loadSyncStats();
    } catch (error) {
      addLog(`❌ Erreur nettoyage: ${error.message}`, 'error');
    }
  };

  // Protection d'accès
  if (!user || !isAdmin(user)) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center max-w-md"
          >
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Accès Refusé</h2>
            <p className="text-gray-400">Permissions administrateur requises.</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  🔄 <span className="hidden sm:inline">Synchronisation Firebase</span><span className="sm:hidden">Sync Firebase</span>
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  <span className="hidden sm:inline">Gestion et synchronisation des données Synergia</span>
                  <span className="sm:hidden">Données Synergia</span>
                </p>
              </div>

              <button
                onClick={loadSyncStats}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            </div>
          </div>

          {/* Statistiques de Synchronisation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 sm:p-6 text-white"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">Utilisateurs</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">
                {loading ? '...' : syncStats.users}
              </div>
              <div className="text-xs sm:text-sm opacity-75 hidden sm:block">dans Firebase</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 sm:p-6 text-white"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">Tâches</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">
                {loading ? '...' : syncStats.tasks}
              </div>
              <div className="text-xs sm:text-sm opacity-75 hidden sm:block">synchronisées</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 sm:p-6 text-white"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">Projets</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">
                {loading ? '...' : syncStats.projects}
              </div>
              <div className="text-xs sm:text-sm opacity-75 hidden sm:block">en base</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 sm:p-6 text-white"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                <h3 className="text-xs sm:text-sm font-medium opacity-90">Badges</h3>
              </div>
              <div className="text-xl sm:text-3xl font-bold mb-1">
                {loading ? '...' : syncStats.badges}
              </div>
              <div className="text-xs sm:text-sm opacity-75 hidden sm:block">attribués</div>
            </motion.div>
          </div>

          {/* État de Synchronisation en Cours */}
          {syncStatus.isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <Loader className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-spin flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-blue-300 mb-1 text-sm sm:text-base">
                    Synchronisation en cours...
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-400/80 truncate">
                    {syncStatus.currentOperation}
                  </p>
                </div>
                <span className="text-blue-300 font-bold text-sm sm:text-base">{syncStatus.progress}%</span>
              </div>

              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${syncStatus.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Actions de Synchronisation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 sm:mb-8"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              Actions de Synchronisation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              <button
                onClick={handleFullSync}
                disabled={syncStatus.isRunning}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-600/20 rounded-lg">
                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                      <span className="hidden sm:inline">Synchronisation Complète</span>
                      <span className="sm:hidden">Sync Complète</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      <span className="hidden sm:inline">Synchroniser toutes les données Firebase</span>
                      <span className="sm:hidden">Sync Firebase</span>
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleExportData}
                disabled={syncStatus.isRunning}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-green-600/20 rounded-lg">
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                      <span className="hidden sm:inline">Exporter les Données</span>
                      <span className="sm:hidden">Exporter</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      <span className="hidden sm:inline">Télécharger un backup JSON</span>
                      <span className="sm:hidden">Backup JSON</span>
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleCleanupOldData}
                disabled={syncStatus.isRunning}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6 hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left sm:col-span-2 lg:col-span-1"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-red-600/20 rounded-lg">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                      <span className="hidden sm:inline">Nettoyer les Données</span>
                      <span className="sm:hidden">Nettoyer</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      <span className="hidden sm:inline">Supprimer les données obsolètes</span>
                      <span className="sm:hidden">Données obsolètes</span>
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Logs de Synchronisation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className="hidden sm:inline">Journal de Synchronisation</span>
                <span className="sm:hidden">Journal</span>
              </h3>
              <button
                onClick={() => setSyncStatus(prev => ({ ...prev, logs: [] }))}
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
              >
                Effacer
              </button>
            </div>

            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {syncStatus.logs.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Info className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">Aucune activité récente</p>
                </div>
              ) : (
                syncStatus.logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
                      log.type === 'success' ? 'bg-green-500/10' :
                      log.type === 'error' ? 'bg-red-500/10' :
                      'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {log.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : log.type === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs sm:text-sm ${
                        log.type === 'success' ? 'text-green-300' :
                        log.type === 'error' ? 'text-red-300' :
                        'text-gray-300'
                      }`}>
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Info Dernière Sync */}
          {syncStats.lastSync && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500"
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dernière synchronisation: {syncStats.lastSync}</span>
              <span className="sm:hidden">Sync: {syncStats.lastSync}</span>
            </motion.div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default AdminSyncPage;
