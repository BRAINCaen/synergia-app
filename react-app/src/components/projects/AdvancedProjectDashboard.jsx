// ==========================================
// 📁 react-app/src/components/projects/AdvancedProjectDashboard.jsx
// DASHBOARD AVANCÉ AVEC SYNCHRONISATION TÂCHES CORRIGÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  Users, 
  Target, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  Settings,
  Eye,
  Edit,
  UserPlus,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  Flag,
  Zap,
  X
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectService } from '../../core/services/projectService.js';
import { taskService } from '../../core/services/taskService.js';

/**
 * 🚀 DASHBOARD AVANCÉ DE GESTION DE PROJETS - VERSION SYNCHRONISÉE
 * Interface complète avec vraies données de tâches
 */
const AdvancedProjectDashboard = ({ projectId, onClose }) => {
  const { user } = useAuthStore();
  
  // États principaux
  const [projectData, setProjectData] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États UI
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  // Charger toutes les données
  useEffect(() => {
    if (projectId && user?.uid) {
      loadDashboardData();
    }
  }, [projectId, user?.uid]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [DASHBOARD] Chargement dashboard projet:', projectId);
      
      // 1. Charger le projet
      const project = await projectService.getProject(projectId);
      if (!project) {
        throw new Error('Projet introuvable');
      }
      
      console.log('✅ [DASHBOARD] Projet chargé:', project.title);
      setProjectData(project);
      
      // 2. Charger TOUTES les tâches du projet avec debug
      console.log('🔍 [DASHBOARD] Recherche tâches pour projectId:', projectId);
      const tasks = await taskService.getTasksByProject(projectId);
      
      console.log('🔍 [DASHBOARD] Tâches trouvées:', {
        nombre: tasks.length,
        tâches: tasks.map(t => ({ id: t.id, title: t.title, projectId: t.projectId }))
      });
      
      setProjectTasks(tasks);
      
      // 3. Calculer les analytics
      const calculatedAnalytics = calculateProjectAnalytics(project, tasks);
      setAnalytics(calculatedAnalytics);
      
      console.log('✅ [DASHBOARD] Dashboard chargé:', {
        projet: project.title,
        tâches: tasks.length,
        progression: calculatedAnalytics.taskMetrics.completion
      });
      
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur chargement dashboard:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les analytics du projet avec debug
  const calculateProjectAnalytics = (project, tasks) => {
    console.log('📊 [ANALYTICS] Calcul analytics:', {
      projet: project.title,
      tâches: tasks.length,
      tâchesAvecStatus: tasks.map(t => ({ id: t.id, title: t.title, status: t.status }))
    });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    // Métriques de base
    const completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Distribution par priorité
    const priorityDistribution = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };
    
    // Distribution par statut
    const statusDistribution = {
      completed: completedTasks,
      in_progress: inProgressTasks,
      pending: pendingTasks,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };
    
    // XP et gamification
    const totalXp = tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0);
    const earnedXp = tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.xpReward || 0), 0);
    
    // Équipe basique
    const team = project.team || [];
    const teamSize = team.length;
    
    // Délais
    const now = new Date();
    const dueDate = project.dueDate?.toDate ? project.dueDate.toDate() : null;
    const isOverdue = dueDate && now > dueDate && completion < 100;
    
    const analytics = {
      taskMetrics: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        completion
      },
      priorityDistribution,
      statusDistribution,
      xpMetrics: {
        total: totalXp,
        earned: earnedXp,
        remaining: totalXp - earnedXp,
        percentage: totalXp > 0 ? Math.round((earnedXp / totalXp) * 100) : 0
      },
      teamMetrics: {
        size: teamSize,
        activeMembers: team.filter(m => m.isActive !== false).length
      },
      timeline: {
        isOverdue,
        dueDate,
        daysRemaining: dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null
      }
    };
    
    console.log('📊 [ANALYTICS] Analytics calculés:', analytics);
    return analytics;
  };

  // Recharger les données
  const refreshData = async () => {
    console.log('🔄 [DASHBOARD] Rafraîchissement des données...');
    await loadDashboardData();
  };

  // Exporter les données
  const exportReport = () => {
    try {
      const reportData = {
        projet: projectData.title,
        projectId: projectId,
        progression: analytics.taskMetrics.completion + '%',
        tâches: analytics.taskMetrics,
        équipe: analytics.teamMetrics,
        xp: analytics.xpMetrics,
        exportéLe: new Date().toLocaleString('fr-FR'),
        détailTâches: projectTasks.map(task => ({
          id: task.id,
          titre: task.title,
          description: task.description,
          statut: task.status,
          priorité: task.priority,
          xp: task.xpReward || 0,
          crééLe: task.createdAt?.toDate ? task.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A'
        }))
      };
      
      const csvContent = [
        'Rapport de Projet Avancé - ' + projectData.title,
        'ID Projet: ' + projectId,
        '',
        'Métriques Générales',
        'Progression,' + analytics.taskMetrics.completion + '%',
        'Tâches Totales,' + analytics.taskMetrics.total,
        'Tâches Complétées,' + analytics.taskMetrics.completed,
        'Tâches En Cours,' + analytics.taskMetrics.inProgress,
        '',
        'XP et Gamification',
        'XP Total,' + analytics.xpMetrics.total,
        'XP Gagné,' + analytics.xpMetrics.earned,
        'XP Restant,' + analytics.xpMetrics.remaining,
        '',
        'Équipe',
        'Taille Équipe,' + analytics.teamMetrics.size,
        'Membres Actifs,' + analytics.teamMetrics.activeMembers,
        '',
        'Détail des Tâches',
        'ID,Titre,Statut,Priorité,XP',
        ...projectTasks.map(task => 
          `${task.id},${task.title},${task.status},${task.priority},${task.xpReward || 0}`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard-${projectData.title}-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ [DASHBOARD] Rapport exporté avec succès');
    } catch (error) {
      console.error('❌ [DASHBOARD] Erreur export rapport:', error);
      alert('Erreur lors de l\'export du rapport');
    }
  };

  // Couleurs pour les graphiques
  const COLORS = {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6'
  };

  const chartColors = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
          <p className="text-sm text-gray-500">Synchronisation des tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="space-x-4">
          <button
            onClick={loadDashboardData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!projectData || !analytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-gray-600">Impossible de charger les données du projet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-7xl mx-auto">
      {/* En-tête avec debug info */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Dashboard Avancé
          </h2>
          <p className="text-gray-600 mt-1">{projectData.title}</p>
          <p className="text-sm text-gray-500">
            ID: {projectId} • {analytics.taskMetrics.total} tâche(s) trouvée(s)
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
          
          <button
            onClick={exportReport}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Debug Panel (à retirer en production) */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-700 font-medium">
            🔍 Debug Info (cliquer pour voir les détails de synchronisation)
          </summary>
          <div className="mt-2 space-y-2 text-xs text-gray-600">
            <div><strong>Projet ID:</strong> {projectId}</div>
            <div><strong>Titre projet:</strong> {projectData.title}</div>
            <div><strong>Nombre de tâches récupérées:</strong> {projectTasks.length}</div>
            <div><strong>Tâches avec projectId correspondant:</strong> {projectTasks.filter(t => t.projectId === projectId).length}</div>
            {projectTasks.length > 0 && (
              <div>
                <strong>Détail des tâches:</strong>
                <ul className="ml-4 list-disc">
                  {projectTasks.map(task => (
                    <li key={task.id}>
                      {task.title} (ID: {task.id}, projectId: {task.projectId}, status: {task.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Onglets de navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
          { id: 'tasks', label: 'Tâches (' + analytics.taskMetrics.total + ')', icon: Target },
          { id: 'team', label: 'Équipe', icon: Users },
          { id: 'timeline', label: 'Timeline', icon: Calendar }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Progression</p>
                    <p className="text-3xl font-bold">{analytics.taskMetrics.completion}%</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Tâches</p>
                    <p className="text-3xl font-bold">{analytics.taskMetrics.total}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">XP Gagné</p>
                    <p className="text-3xl font-bold">{analytics.xpMetrics.earned}</p>
                  </div>
                  <Award className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Équipe</p>
                    <p className="text-3xl font-bold">{analytics.teamMetrics.size}</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution des statuts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des Tâches</h3>
                {analytics.taskMetrics.total > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Complétées', value: analytics.statusDistribution.completed, color: COLORS.success },
                          { name: 'En cours', value: analytics.statusDistribution.in_progress, color: COLORS.warning },
                          { name: 'En attente', value: analytics.statusDistribution.pending, color: COLORS.info },
                          { name: 'Bloquées', value: analytics.statusDistribution.blocked, color: COLORS.danger }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {[
                          { name: 'Complétées', value: analytics.statusDistribution.completed, color: COLORS.success },
                          { name: 'En cours', value: analytics.statusDistribution.in_progress, color: COLORS.warning },
                          { name: 'En attente', value: analytics.statusDistribution.pending, color: COLORS.info },
                          { name: 'Bloquées', value: analytics.statusDistribution.blocked, color: COLORS.danger }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune tâche dans ce projet</p>
                    <p className="text-sm">Assignez des tâches depuis la page Tâches</p>
                  </div>
                )}
              </div>

              {/* Distribution des priorités */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priorités des Tâches</h3>
                {analytics.taskMetrics.total > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Haute', value: analytics.priorityDistribution.high, color: COLORS.danger },
                      { name: 'Moyenne', value: analytics.priorityDistribution.medium, color: COLORS.warning },
                      { name: 'Basse', value: analytics.priorityDistribution.low, color: COLORS.success }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune donnée de priorité</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Tâches du Projet ({analytics.taskMetrics.total})
              </h3>
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Actualiser les tâches
              </button>
            </div>
            
            {/* Liste des tâches */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h4 className="text-lg font-medium text-gray-900">Détail des Tâches</h4>
              </div>
              
              <div className="divide-y divide-gray-200">
                {projectTasks.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Target className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche assignée</h3>
                    <p className="mb-4">
                      Ce projet n'a pas encore de tâches assignées.
                    </p>
                    <p className="text-sm">
                      Allez sur la page <strong>Tâches</strong> pour assigner des tâches à ce projet.
                    </p>
                  </div>
                ) : (
                  projectTasks.map((task) => (
                    <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{task.title}</h5>
                          <p className="text-sm text-gray-500 mt-1">{task.description || 'Aucune description'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span>ID: {task.id}</span>
                            <span>ProjectID: {task.projectId}</span>
                            {task.createdAt && (
                              <span>Créée: {task.createdAt.toDate ? task.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A'}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                          </span>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? 'Terminée' : 
                             task.status === 'in_progress' ? 'En cours' :
                             task.status === 'blocked' ? 'Bloquée' : 'En attente'}
                          </span>
                          
                          {task.xpReward && (
                            <span className="text-sm text-purple-600 font-medium">
                              +{task.xpReward} XP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Équipe du Projet</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(projectData.team || []).map((member, index) => (
                <div key={member.userId || index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium">
                        {(member.displayName || member.email || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {member.displayName || member.email || 'Membre'}
                      </h4>
                      <p className="text-sm text-gray-500">{member.role || 'contributor'}</p>
                    </div>
                  </div>
                  
                  {member.email && (
                    <p className="text-xs text-gray-400 mt-2">{member.email}</p>
                  )}
                </div>
              ))}
              
              {(!projectData.team || projectData.team.length === 0) && (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Aucun membre d'équipe assigné</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Timeline du Projet</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Date de début</span>
                  <span className="text-sm text-gray-600">
                    {projectData.startDate ? 
                      new Date(projectData.startDate.toDate ? projectData.startDate.toDate() : projectData.startDate).toLocaleDateString('fr-FR') :
                      'Non définie'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Date de fin prévue</span>
                  <span className="text-sm text-gray-600">
                    {projectData.dueDate ? 
                      new Date(projectData.dueDate.toDate ? projectData.dueDate.toDate() : projectData.dueDate).toLocaleDateString('fr-FR') :
                      'Non définie'
                    }
                  </span>
                </div>
                
                {analytics.timeline.daysRemaining !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Jours restants</span>
                    <span className={`text-sm font-medium ${
                      analytics.timeline.isOverdue ? 'text-red-600' :
                      analytics.timeline.daysRemaining < 7 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {analytics.timeline.isOverdue ? 
                        `En retard de ${Math.abs(analytics.timeline.daysRemaining)} jour(s)` :
                        `${analytics.timeline.daysRemaining} jour(s)`
                      }
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Statut général</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    analytics.timeline.isOverdue ? 'bg-red-100 text-red-800' :
                    analytics.taskMetrics.completion === 100 ? 'bg-green-100 text-green-800' :
                    analytics.taskMetrics.completion > 75 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analytics.timeline.isOverdue ? 'En retard' :
                     analytics.taskMetrics.completion === 100 ? 'Terminé' :
                     analytics.taskMetrics.completion > 75 ? 'En bonne voie' :
                     'En cours'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedProjectDashboard;
