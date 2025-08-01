// ==========================================
// 📁 react-app/src/pages/MigrationAdminPanel.jsx
// PANEL D'ADMINISTRATION - MIGRATION FIREBASE COMPLÈTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Download,
  Settings,
  Users,
  FileText,
  Activity,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  runCompleteMigration, 
  analyzeCurrentState, 
  migrateSpecificPage 
} from '../utils/pageMigrationScript.js';

/**
 * 🔧 PANEL D'ADMINISTRATION MIGRATION FIREBASE
 * Interface complète pour gérer la migration des données mock vers Firebase
 */
const MigrationAdminPanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, analyzing, migrating, completed, error
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationLogs, setMigrationLogs] = useState([]);
  const [migrationResult, setMigrationResult] = useState(null);
  
  // États UI
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPages, setSelectedPages] = useState([]);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
  
  // États de contrôle
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Charger l'analyse initiale
  useEffect(() => {
    if (user?.uid) {
      performInitialAnalysis();
    }
  }, [user?.uid]);

  /**
   * 🔍 ANALYSE INITIALE DE L'ÉTAT
   */
  const performInitialAnalysis = async () => {
    setIsAnalyzing(true);
    addLog('🔍 Début analyse de l\'état actuel...', 'info');
    
    try {
      const analysis = await analyzeCurrentState();
      setCurrentAnalysis(analysis);
      
      addLog(`📊 Analyse terminée: ${analysis.analysis.mockDataFound} problèmes détectés`, 
             analysis.analysis.mockDataFound > 0 ? 'warning' : 'success');
      
    } catch (error) {
      console.error('❌ Erreur analyse:', error);
      addLog(`❌ Erreur analyse: ${error.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 🚀 LANCER LA MIGRATION COMPLÈTE
   */
  const runFullMigration = async () => {
    if (!user?.uid) {
      addLog('❌ Utilisateur non connecté', 'error');
      return;
    }
    
    setIsMigrating(true);
    setMigrationStatus('migrating');
    setMigrationProgress(0);
    addLog('🚀 Début migration complète vers Firebase...', 'info');
    
    try {
      // Simuler la progression
      const progressSteps = [
        { progress: 10, message: '🔍 Détection des données mock...' },
        { progress: 25, message: '📋 Génération du plan de migration...' },
        { progress: 40, message: '🚀 Application migration automatique...' },
        { progress: 60, message: '📄 Migration des pages...' },
        { progress: 80, message: '✅ Validation des données...' },
        { progress: 95, message: '📊 Génération du rapport...' }
      ];
      
      for (const step of progressSteps) {
        setMigrationProgress(step.progress);
        addLog(step.message, 'info');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
      }
      
      // Lancer la vraie migration
      const result = await runCompleteMigration(user.uid);
      
      setMigrationProgress(100);
      setMigrationResult(result);
      setMigrationStatus(result.success ? 'completed' : 'error');
      
      if (result.success) {
        addLog('🎉 Migration complète réussie !', 'success');
        addLog(`📊 ${result.pagesMigration.migratedPages.length} pages migrées`, 'success');
      } else {
        addLog(`❌ Migration échouée: ${result.error || 'Erreur inconnue'}`, 'error');
      }
      
      // Refaire l'analyse après migration
      await performInitialAnalysis();
      
    } catch (error) {
      console.error('❌ Erreur migration:', error);
      addLog(`❌ Erreur migration: ${error.message}`, 'error');
      setMigrationStatus('error');
    } finally {
      setIsMigrating(false);
    }
  };

  /**
   * 🎯 MIGRATION SÉLECTIVE
   */
  const runSelectiveMigration = async () => {
    if (selectedPages.length === 0) {
      addLog('⚠️ Aucune page sélectionnée', 'warning');
      return;
    }
    
    setIsMigrating(true);
    setMigrationStatus('migrating');
    addLog(`🎯 Migration sélective: ${selectedPages.length} pages`, 'info');
    
    try {
      const results = [];
      
      for (let i = 0; i < selectedPages.length; i++) {
        const pageName = selectedPages[i];
        setMigrationProgress(((i + 1) / selectedPages.length) * 100);
        
        addLog(`📄 Migration ${pageName}...`, 'info');
        
        const result = await migrateSpecificPage(pageName, user.uid);
        results.push(result);
        
        if (result.success) {
          addLog(`✅ ${pageName} migrée avec succès`, 'success');
        } else {
          addLog(`❌ Erreur ${pageName}: ${result.error}`, 'error');
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;
      
      setMigrationStatus(errorCount === 0 ? 'completed' : 'error');
      addLog(`📊 Migration sélective terminée: ${successCount} succès, ${errorCount} erreurs`, 
             errorCount === 0 ? 'success' : 'warning');
      
      // Refaire l'analyse
      await performInitialAnalysis();
      
    } catch (error) {
      console.error('❌ Erreur migration sélective:', error);
      addLog(`❌ Erreur migration sélective: ${error.message}`, 'error');
      setMigrationStatus('error');
    } finally {
      setIsMigrating(false);
    }
  };

  /**
   * 📝 AJOUTER UN LOG
   */
  const addLog = (message, type = 'info') => {
    const log = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    
    setMigrationLogs(prev => [...prev, log]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  /**
   * 🧹 NETTOYER LES LOGS
   */
  const clearLogs = () => {
    setMigrationLogs([]);
    addLog('🧹 Logs nettoyés', 'info');
  };

  /**
   * 📊 OBTENIR LES STATISTIQUES
   */
  const getStats = () => {
    if (!currentAnalysis) return null;
    
    return {
      mockDataFound: currentAnalysis.analysis.mockDataFound,
      suspiciousFiles: currentAnalysis.analysis.suspiciousFiles,
      migrationNeeded: currentAnalysis.analysis.migrationNeeded,
      recommendation: currentAnalysis.recommendation
    };
  };

  /**
   * 🎨 OBTENIR LA COULEUR DU STATUT
   */
  const getStatusColor = (status) => {
    const colors = {
      idle: 'gray',
      analyzing: 'blue',
      migrating: 'yellow',
      completed: 'green',
      error: 'red'
    };
    return colors[status] || 'gray';
  };

  /**
   * 📋 PAGES DISPONIBLES POUR MIGRATION
   */
  const availablePages = [
    'Dashboard', 'TasksPage', 'ProjectsPage', 'ProfilePage', 
    'RewardsPage', 'BadgesPage', 'LeaderboardPage', 'TeamPage', 
    'AnalyticsPage', 'Sidebar', 'UserStats', 'GameStats'
  ];

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Migration Firebase Admin
              </h1>
              <p className="text-gray-400">
                Conversion des données mock vers Firebase authentique
              </p>
            </div>
            
            {/* Statut global */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${getStatusColor(migrationStatus)}-500 animate-pulse`}></div>
                <div>
                  <div className="text-white font-medium capitalize">{migrationStatus}</div>
                  <div className="text-sm text-gray-400">
                    {migrationStatus === 'migrating' && `${migrationProgress.toFixed(0)}%`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-6 h-6 ${stats.mockDataFound > 0 ? 'text-red-400' : 'text-green-400'}`} />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.mockDataFound}</div>
                  <div className="text-sm text-gray-400">Données Mock</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{stats.suspiciousFiles}</div>
                  <div className="text-sm text-gray-400">Fichiers Suspects</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">Firebase</div>
                  <div className="text-sm text-gray-400">Source Unique</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                {stats.migrationNeeded ? (
                  <XCircle className="w-6 h-6 text-red-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
                <div>
                  <div className="text-lg font-bold text-white">
                    {stats.migrationNeeded ? 'Requis' : 'Complet'}
                  </div>
                  <div className="text-sm text-gray-400">État Migration</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
            { id: 'migration', label: 'Migration', icon: RefreshCw },
            { id: 'logs', label: 'Logs', icon: FileText },
            { id: 'analysis', label: 'Analyse', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-6">
          
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Vue d'ensemble
              </h2>
              
              {stats && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">État Actuel</h3>
                  <div className="text-gray-300">
                    <p><strong>Données Mock détectées:</strong> {stats.mockDataFound}</p>
                    <p><strong>Fichiers concernés:</strong> {stats.suspiciousFiles}</p>
                    <p><strong>Migration nécessaire:</strong> {stats.migrationNeeded ? 'Oui' : 'Non'}</p>
                    <p className="mt-2"><strong>Recommandation:</strong></p>
                    <p className="text-sm bg-blue-900/30 p-3 rounded mt-1">{stats.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={performInitialAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white p-4 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  {isAnalyzing ? 'Analyse en cours...' : 'Rafraîchir Analyse'}
                </button>
                
                <button
                  onClick={runFullMigration}
                  disabled={isMigrating || !stats?.migrationNeeded}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white p-4 rounded-lg font-medium transition-colors"
                >
                  <Play className="w-5 h-5" />
                  {isMigrating ? 'Migration en cours...' : 'Lancer Migration Complète'}
                </button>
              </div>
            </div>
          )}

          {/* Migration */}
          {activeTab === 'migration' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-6 h-6" />
                Migration
              </h2>

              {/* Barre de progression */}
              {migrationStatus === 'migrating' && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Progression</span>
                    <span className="text-blue-400">{migrationProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${migrationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Migration sélective */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Migration Sélective</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                  {availablePages.map(page => (
                    <label key={page} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPages(prev => [...prev, page]);
                          } else {
                            setSelectedPages(prev => prev.filter(p => p !== page));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-300">{page}</span>
                    </label>
                  ))}
                </div>
                
                <button
                  onClick={runSelectiveMigration}
                  disabled={isMigrating || selectedPages.length === 0}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Migrer Sélection ({selectedPages.length})
                </button>
              </div>

              {/* Résultat de migration */}
              {migrationResult && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {migrationResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    Résultat Migration
                  </h3>
                  
                  <div className="text-gray-300 space-y-2">
                    <p><strong>Statut:</strong> {migrationResult.success ? 'Succès' : 'Échec'}</p>
                    {migrationResult.pagesMigration && (
                      <>
                        <p><strong>Pages migrées:</strong> {migrationResult.pagesMigration.migratedPages?.length || 0}</p>
                        <p><strong>Erreurs:</strong> {migrationResult.pagesMigration.errors?.length || 0}</p>
                      </>
                    )}
                    <p className="text-sm bg-gray-800/50 p-3 rounded mt-2">{migrationResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Logs de Migration
                </h2>
                
                <button
                  onClick={clearLogs}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Nettoyer
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                {migrationLogs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    Aucun log disponible
                  </div>
                ) : (
                  migrationLogs.map(log => (
                    <div 
                      key={log.id} 
                      className={`
                        flex items-start gap-2 mb-1 p-1 rounded
                        ${log.type === 'error' ? 'text-red-400 bg-red-900/20' : ''}
                        ${log.type === 'warning' ? 'text-yellow-400 bg-yellow-900/20' : ''}
                        ${log.type === 'success' ? 'text-green-400 bg-green-900/20' : ''}
                        ${log.type === 'info' ? 'text-gray-300' : ''}
                      `}
                    >
                      <span className="text-gray-500 text-xs w-16 flex-shrink-0">
                        {log.timestamp}
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Analyse détaillée */}
          {activeTab === 'analysis' && currentAnalysis && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Analyse Détaillée
              </h2>

              {/* Fichiers suspects */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Fichiers Suspects</h3>
                
                {currentAnalysis.mockDetection.suspiciousFiles.map((file, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-800/50 rounded">
                    <div className="text-yellow-400 font-medium mb-2">{file.file}</div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {file.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Plan de migration */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Plan de Migration</h3>
                
                {Object.entries(currentAnalysis.migrationPlan).map(([phaseKey, phase]) => (
                  <div key={phaseKey} className="mb-4">
                    <h4 className="text-blue-400 font-medium mb-2">{phase.title}</h4>
                    <div className="space-y-2">
                      {phase.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="text-sm bg-gray-800/50 p-2 rounded">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${task.priority === 'CRITIQUE' ? 'bg-red-900 text-red-200' : ''}
                              ${task.priority === 'HAUTE' ? 'bg-orange-900 text-orange-200' : ''}
                              ${task.priority === 'MOYENNE' ? 'bg-yellow-900 text-yellow-200' : ''}
                              ${task.priority === 'BASSE' ? 'bg-green-900 text-green-200' : ''}
                            `}>
                              {task.priority}
                            </span>
                            <span className="text-white">{task.task}</span>
                          </div>
                          <div className="text-gray-400 text-xs">📁 {task.file}</div>
                          <div className="text-gray-300 text-xs mt-1">{task.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationAdminPanel;
