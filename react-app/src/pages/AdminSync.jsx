// ==========================================
// 📁 react-app/src/pages/AdminSync.jsx
// PAGE D'ADMINISTRATION - SYNCHRONISATION DES DONNÉES
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
  Zap
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore';
import dataSyncService from '../core/services/dataSyncService';
import Toast from '../shared/components/Toast';

const AdminSync = () => {
  const { user } = useAuthStore();
  const [analysis, setAnalysis] = useState(null);
  const [syncResults, setSyncResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Analyser les données au chargement
  useEffect(() => {
    if (user) {
      performAnalysis();
    }
  }, [user]);

  /**
   * 🔍 ANALYSER LES DONNÉES
   */
  const performAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      console.log('🔍 Début analyse des données...');
      
      const result = await dataSyncService.analyzeAllData();
      
      if (result) {
        setAnalysis(result);
        console.log('✅ Analyse terminée:', result);
        Toast.show('Analyse terminée avec succès', 'success');
      } else {
        throw new Error('Impossible d\'analyser les données');
      }
      
    } catch (error) {
      console.error('❌ Erreur analyse:', error);
      Toast.show('Erreur lors de l\'analyse', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 🔧 SYNCHRONISER LES DONNÉES
   */
  const performSync = async () => {
    try {
      setIsSyncing(true);
      console.log('🔧 Début synchronisation...');
      
      const result = await dataSyncService.synchronizeAllData();
      
      if (result.success) {
        setSyncResults(result.results);
        console.log('✅ Synchronisation terminée:', result.results);
        Toast.show('Synchronisation terminée avec succès', 'success');
        
        // Relancer l'analyse après synchronisation
        await performAnalysis();
      } else {
        throw new Error(result.error || 'Erreur synchronisation');
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
      Toast.show('Erreur lors de la synchronisation', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * 📊 CALCULER LE SCORE DE SANTÉ
   */
  const calculateHealthScore = () => {
    if (!analysis) return 0;
    
    const totalItems = analysis.users.total + analysis.projects.total + analysis.tasks.total;
    const totalIssues = analysis.users.withIssues + analysis.projects.withIssues + analysis.tasks.withIssues;
    
    if (totalItems === 0) return 100;
    
    return Math.round(((totalItems - totalIssues) / totalItems) * 100);
  };

  const healthScore = calculateHealthScore();

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'projects', label: 'Projets', icon: Database },
    { id: 'tasks', label: 'Tâches', icon: Activity },
    { id: 'teams', label: 'Équipes', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-blue-600" />
                Administration - Synchronisation des données
              </h1>
              <p className="text-gray-600 mt-2">
                Analysez et synchronisez les données de l'application
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={performAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyse...' : 'Analyser'}
              </button>
              
              <button
                onClick={performSync}
                disabled={isSyncing || !analysis}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
              </button>
            </div>
          </div>
        </div>

        {/* Score de santé */}
        {analysis && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Score de santé des données</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  healthScore >= 90 ? 'bg-green-100 text-green-800' :
                  healthScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {healthScore}%
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    healthScore >= 90 ? 'bg-green-500' :
                    healthScore >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Utilisateurs: {analysis.users.total - analysis.users.withIssues}/{analysis.users.total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">
                    Projets: {analysis.projects.total - analysis.projects.withIssues}/{analysis.projects.total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">
                    Tâches: {analysis.tasks.total - analysis.tasks.withIssues}/{analysis.tasks.total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-600">
                    Équipes: {analysis.teams.usersInTeams} utilisateurs
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des tabs */}
        <div className="bg-white rounded-xl shadow-lg">
          
          {/* Vue d'ensemble */}
          {selectedTab === 'overview' && analysis && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vue d'ensemble</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-900">{analysis.users.total}</span>
                  </div>
                  <p className="text-sm text-blue-700">Utilisateurs totaux</p>
                  {analysis.users.withIssues > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {analysis.users.withIssues} avec problèmes
                    </p>
                  )}
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Database className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-900">{analysis.projects.total}</span>
                  </div>
                  <p className="text-sm text-green-700">Projets totaux</p>
                  {analysis.projects.withIssues > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {analysis.projects.withIssues} avec problèmes
                    </p>
                  )}
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-900">{analysis.tasks.total}</span>
                  </div>
                  <p className="text-sm text-purple-700">Tâches totales</p>
                  {analysis.tasks.withIssues > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {analysis.tasks.withIssues} avec problèmes
                    </p>
                  )}
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-900">{analysis.teams.orphanedUsers}</span>
                  </div>
                  <p className="text-sm text-orange-700">Utilisateurs orphelins</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {analysis.teams.usersInTeams} dans des équipes
                  </p>
                </div>
              </div>
              
              {/* Résultats de synchronisation */}
              {syncResults && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-900 mb-2">Dernière synchronisation</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>Utilisateurs réparés: <span className="font-bold">{syncResults.usersFixed}</span></div>
                    <div>Projets réparés: <span className="font-bold">{syncResults.projectsFixed}</span></div>
                    <div>Tâches réparées: <span className="font-bold">{syncResults.tasksFixed}</span></div>
                    <div>Équipes réparées: <span className="font-bold">{syncResults.teamsFixed}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Utilisateurs */}
          {selectedTab === 'users' && analysis && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analyse des utilisateurs</h3>
              
              <div className="space-y-4">
                {analysis.users.users.map((user) => (
                  <div key={user.id} className={`p-4 rounded-lg border ${
                    user.issues.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{user.displayName || user.email}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Niveau {user.level} - {user.xp} XP
                        </span>
                        <span className="text-sm text-gray-600">
                          {user.tasksCompleted} tâches
                        </span>
                        {user.issues.length === 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    {user.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-700 mb-1">Problèmes détectés:</p>
                        <ul className="text-sm text-red-600 list-disc list-inside">
                          {user.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projets */}
          {selectedTab === 'projects' && analysis && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analyse des projets</h3>
              
              <div className="space-y-4">
                {analysis.projects.projects.map((project) => (
                  <div key={project.id} className={`p-4 rounded-lg border ${
                    project.issues.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-600">
                          {project.teamSize} membre(s) - Propriétaire: {project.ownerId}
                        </p>
                      </div>
                      {project.issues.length === 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    
                    {project.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-700 mb-1">Problèmes détectés:</p>
                        <ul className="text-sm text-red-600 list-disc list-inside">
                          {project.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tâches */}
          {selectedTab === 'tasks' && analysis && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analyse des tâches</h3>
              
              <div className="space-y-4">
                {analysis.tasks.tasks.slice(0, 20).map((task) => (
                  <div key={task.id} className={`p-4 rounded-lg border ${
                    task.issues.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">
                          {task.status} - {task.difficulty} - Utilisateur: {task.userId}
                        </p>
                      </div>
                      {task.issues.length === 0 ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    
                    {task.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-700 mb-1">Problèmes détectés:</p>
                        <ul className="text-sm text-red-600 list-disc list-inside">
                          {task.issues.map((issue, index) => (
                            <li key={index}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Équipes */}
          {selectedTab === 'teams' && analysis && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analyse des équipes</h3>
              
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Statistiques d'équipe</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>Total utilisateurs: <span className="font-bold">{analysis.teams.totalUsers}</span></div>
                    <div>Dans des équipes: <span className="font-bold">{analysis.teams.usersInTeams}</span></div>
                    <div>Utilisateurs orphelins: <span className="font-bold">{analysis.teams.orphanedUsers}</span></div>
                  </div>
                </div>
              </div>
              
              {analysis.teams.orphanedUsers > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-red-700 mb-2">Utilisateurs orphelins</h4>
                  <div className="space-y-2">
                    {analysis.teams.orphanedUsersList.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{user.displayName || user.email}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Membres d'équipe</h4>
                <div className="space-y-2">
                  {analysis.teams.teamMemberships.map((membership) => (
                    <div key={membership.userId} className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium">Utilisateur: {membership.userId}</p>
                      <p className="text-sm text-gray-600">
                        {membership.projectCount} projet(s): {membership.projects.map(p => p.projectName).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSync;
