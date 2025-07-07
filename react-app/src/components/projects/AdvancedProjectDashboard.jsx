// ==========================================
// 📁 react-app/src/components/projects/AdvancedProjectDashboard.jsx
// DASHBOARD AVANCÉ GESTION PROJETS - Interface Admin Complète
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
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../shared/stores/authStore.js';
import { projectAnalyticsService } from '../../core/services/projectAnalyticsService.js';
import { teamManagementService } from '../../core/services/teamManagementService.js';
import { milestoneService } from '../../core/services/milestoneService.js';

/**
 * 🚀 DASHBOARD AVANCÉ DE GESTION DE PROJETS
 * Interface admin complète avec analytics, gestion d'équipe, jalons et rapports
 */
const AdvancedProjectDashboard = ({ projectId }) => {
  const { user } = useAuthStore();
  
  // États principaux
  const [projectReport, setProjectReport] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Charger toutes les données
  useEffect(() => {
    if (projectId && user?.uid) {
      loadDashboardData();
    }
  }, [projectId, user?.uid]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement dashboard projet:', projectId);
      
      const [report, team, milestonesData] = await Promise.all([
        projectAnalyticsService.generateProjectReport(projectId),
        teamManagementService.getProjectTeam(projectId),
        milestoneService.getProjectTimeline(projectId)
      ]);
      
      setProjectReport(report);
      setTeamData(team);
      setMilestones(milestonesData);
      
      console.log('✅ Dashboard chargé:', {
        tâches: report.taskMetrics.total,
        équipe: team.length,
        jalons: milestonesData.length
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const exportData = await projectAnalyticsService.exportProjectDataToCSV(projectId);
      
      // Créer et télécharger le fichier
      const blob = new Blob([exportData.data], { type: exportData.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Rapport exporté:', exportData.filename);
    } catch (error) {
      console.error('❌ Erreur export rapport:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!projectReport) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-gray-400">Impossible de charger les données du projet</p>
      </div>
    );
  }

  const { project, taskMetrics, teamMetrics, milestoneMetrics, timeline, performance, predictions } = projectReport;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      
      {/* En-tête du dashboard */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📊 {project.title}
            </h1>
            <p className="text-gray-400">
              Dashboard de gestion et analytics avancés
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Download size={16} className="mr-2" />
              Exporter
            </button>
            
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <UserPlus size={16} className="mr-2" />
              Gérer équipe
            </button>
          </div>
        </div>
        
        {/* Statut et métriques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Progression</p>
                <p className="text-2xl font-bold text-green-400">{taskMetrics.completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Équipe</p>
                <p className="text-2xl font-bold text-blue-400">{teamMetrics.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Jalons</p>
                <p className="text-2xl font-bold text-purple-400">{milestoneMetrics.completed}/{milestoneMetrics.total}</p>
              </div>
              <Flag className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">XP Gagné</p>
                <p className="text-2xl font-bold text-yellow-400">{taskMetrics.earnedXp}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'team', label: 'Équipe', icon: Users },
              { id: 'milestones', label: 'Jalons', icon: Flag },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'predictions', label: 'Prédictions', icon: Zap }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            
            {/* Graphiques de progression */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Répartition des tâches */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChartIcon size={20} className="mr-2 text-purple-400" />
                  Répartition des tâches
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Terminées', value: taskMetrics.completed, fill: '#10B981' },
                        { name: 'En cours', value: taskMetrics.inProgress, fill: '#F59E0B' },
                        { name: 'En attente', value: taskMetrics.pending, fill: '#6B7280' },
                        { name: 'Validation', value: taskMetrics.validationPending, fill: '#8B5CF6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Progression dans le temps */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp size={20} className="mr-2 text-green-400" />
                  Progression vs Planning
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performance.burndownData?.planned?.map((planned, index) => ({
                    jour: index + 1,
                    planifié: planned,
                    réel: performance.burndownData.actual[index]
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="jour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Area type="monotone" dataKey="planifié" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="réel" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Timeline et statut */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar size={20} className="mr-2 text-blue-400" />
                Timeline du projet
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Date de début</p>
                  <p className="text-white font-semibold">
                    {timeline.startDate ? new Date(timeline.startDate).toLocaleDateString('fr-FR') : 'Non définie'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Échéance</p>
                  <p className="text-white font-semibold">
                    {timeline.dueDate ? new Date(timeline.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Statut planning</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    timeline.scheduleStatus === 'ahead_of_schedule' ? 'bg-green-100 text-green-800' :
                    timeline.scheduleStatus === 'on_track' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {timeline.scheduleStatus === 'ahead_of_schedule' ? 'En avance' :
                     timeline.scheduleStatus === 'on_track' ? 'Dans les temps' : 'En retard'}
                  </span>
                </div>
              </div>
              
              {/* Barre de progression temporelle */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Progression temporelle: {timeline.timeProgress}%</span>
                  <span>Progression des tâches: {timeline.taskProgress}%</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${timeline.timeProgress}%` }}
                    ></div>
                  </div>
                  <div className="absolute top-0 w-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full opacity-70" 
                      style={{ width: `${timeline.taskProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
          </motion.div>
        )}

        {activeTab === 'team' && (
          <motion.div
            key="team"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            
            {/* Statistiques d'équipe */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Membres actifs</p>
                <p className="text-2xl font-bold text-green-400">{teamMetrics.activeMembers}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Taux de completion moyen</p>
                <p className="text-2xl font-bold text-blue-400">{teamMetrics.averageCompletionRate}%</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Tâches par membre</p>
                <p className="text-2xl font-bold text-purple-400">{teamMetrics.averageTasksPerMember}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Top performer</p>
                <p className="text-lg font-bold text-yellow-400">
                  {teamMetrics.topPerformers?.[0]?.displayName || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Liste des membres avec performances */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Performance de l'équipe</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Membre</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-400">Rôle</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-400">Tâches</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-400">Terminées</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-400">Taux</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-400">XP</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMetrics.memberProductivity?.map((member, index) => (
                      <tr key={member.userId} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {member.displayName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{member.displayName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            member.role === 'owner' ? 'bg-red-100 text-red-800' :
                            member.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                            member.role === 'lead' ? 'bg-blue-100 text-blue-800' :
                            member.role === 'contributor' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{member.tasksAssigned}</td>
                        <td className="py-3 px-4 text-center">{member.tasksCompleted}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-semibold ${
                            member.completionRate >= 80 ? 'text-green-400' :
                            member.completionRate >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {member.completionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-yellow-400 font-semibold">
                          {member.xpEarned}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </motion.div>
        )}

        {activeTab === 'milestones' && (
          <motion.div
            key="milestones"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            
            {/* Vue timeline des jalons */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Timeline des jalons</h3>
                <button
                  onClick={() => setShowMilestoneModal(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm"
                >
                  <Flag size={16} className="mr-2" />
                  Nouveau jalon
                </button>
              </div>
              
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start">
                    
                    {/* Ligne temporelle */}
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-4 h-4 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'active' ? 'bg-blue-500' :
                        milestone.status === 'delayed' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-600 mt-2"></div>
                      )}
                    </div>
                    
                    {/* Contenu du jalon */}
                    <div className="flex-1 bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{milestone.title}</h4>
                          <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                              milestone.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              milestone.status === 'delayed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {milestone.status}
                            </span>
                            
                            {milestone.dueDate && (
                              <span className="text-gray-400">
                                <Clock size={14} className="inline mr-1" />
                                {new Date(milestone.dueDate).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                            
                            {milestone.xpReward && (
                              <span className="text-yellow-400">
                                <Award size={14} className="inline mr-1" />
                                {milestone.xpReward} XP
                              </span>
                            )}
                          </div>
                          
                          {/* Barre de progression */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progression</span>
                              <span>{milestone.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${milestone.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <button className="text-gray-400 hover:text-white transition-colors ml-4">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {milestones.length === 0 && (
                <div className="text-center py-8">
                  <Flag className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                  <p className="text-gray-400">Aucun jalon défini pour ce projet</p>
                  <button
                    onClick={() => setShowMilestoneModal(true)}
                    className="mt-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Créer le premier jalon
                  </button>
                </div>
              )}
            </div>
            
          </motion.div>
        )}

        {activeTab === 'predictions' && (
          <motion.div
            key="predictions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            
            {/* Prédictions et recommandations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Prédictions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap size={20} className="mr-2 text-yellow-400" />
                  Prédictions IA
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Date de fin estimée</span>
                      <span className="text-green-400 font-semibold">
                        {predictions.estimatedCompletionDate ? 
                          new Date(predictions.estimatedCompletionDate).toLocaleDateString('fr-FR') : 
                          'Calcul en cours...'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Confiance: {predictions.confidenceLevel}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Probabilité de succès</span>
                      <span className={`font-semibold ${
                        predictions.successProbability >= 80 ? 'text-green-400' :
                        predictions.successProbability >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {predictions.successProbability}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          predictions.successProbability >= 80 ? 'bg-green-500' :
                          predictions.successProbability >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${predictions.successProbability}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">XP total estimé</span>
                      <span className="text-yellow-400 font-semibold">
                        {predictions.estimatedTotalXp} XP
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Basé sur {taskMetrics.total} tâches
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Risques et recommandations */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle size={20} className="mr-2 text-red-400" />
                  Risques & Recommandations
                </h3>
                
                <div className="space-y-4">
                  {predictions.risks?.length > 0 ? (
                    predictions.risks.map((risk, index) => (
                      <div key={index} className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-red-400 font-medium text-sm">{risk.description}</p>
                            <p className="text-gray-400 text-xs mt-1">{risk.impact}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            risk.severity === 'high' ? 'bg-red-600 text-white' :
                            risk.severity === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {risk.severity}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                      <p className="text-green-400 text-sm">
                        <CheckCircle size={16} className="inline mr-2" />
                        Aucun risque majeur détecté
                      </p>
                    </div>
                  )}
                  
                  {predictions.recommendations?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Recommandations</h4>
                      {predictions.recommendations.map((rec, index) => (
                        <div key={index} className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-2">
                          <p className="text-blue-400 font-medium text-sm">{rec.title}</p>
                          <p className="text-gray-400 text-xs mt-1">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modals (placeholders pour gestion équipe et jalons) */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Gestion de l'équipe</h3>
            {/* TODO: Implémenter le composant de gestion d'équipe */}
            <p className="text-gray-400 mb-4">Interface de gestion d'équipe à implémenter</p>
            <button
              onClick={() => setShowTeamModal(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdvancedProjectDashboard;
