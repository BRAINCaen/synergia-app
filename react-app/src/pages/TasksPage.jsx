// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES AVEC IMPORT TASKFORM CORRIGÉ
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  Target,
  Trophy,
  Star,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  Play,
  Circle,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';

// Layouts et composants UI
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

// Services et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { projectService } from '../core/services/projectService.js';

// ✅ CORRECTION: Import default au lieu d'import nommé
import TaskForm from '../modules/tasks/TaskForm.jsx';
import TaskCard from '../modules/tasks/TaskCard.jsx';

/**
 * 📋 PAGE DES TÂCHES AVEC BOUTONS FONCTIONNELS
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États des données
  const [realTasks, setRealTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États de l'interface
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // États des modales
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskActions, setShowTaskActions] = useState(null);

  // ✅ CHARGEMENT DES DONNÉES FIREBASE
  useEffect(() => {
    if (user?.uid) {
      loadTasksData();
    }
  }, [user?.uid]);

  const loadTasksData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [TASKS-PAGE] Chargement données utilisateur:', user.uid);
      
      // Charger les tâches utilisateur
      const userTasks = await taskService.getUserTasks(user.uid);
      console.log('✅ [TASKS-PAGE] Tâches chargées:', userTasks.length);
      setRealTasks(userTasks || []);
      
      // Charger les projets utilisateur
      const userProjects = await projectService.getUserProjects(user.uid);
      console.log('✅ [TASKS-PAGE] Projets chargés:', userProjects.length);
      setProjects(userProjects || []);
      
    } catch (err) {
      console.error('❌ [TASKS-PAGE] Erreur chargement:', err);
      setError(err.message);
      setRealTasks([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ BOUTON NOUVELLE TÂCHE - FONCTIONNEL
  const handleNewTask = () => {
    console.log('🔄 [TASKS-PAGE] Ouverture formulaire nouvelle tâche');
    setEditingTask(null);
    setShowTaskForm(true);
  };

  // ✅ BOUTON FILTRES - FONCTIONNEL
  const handleToggleFilters = () => {
    console.log('🔄 [TASKS-PAGE] Toggle filtres:', !showFilters);
    setShowFilters(!showFilters);
  };

  // ✅ GESTIONNAIRE SAUVEGARDE TÂCHE
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        // Modification
        console.log('🔄 [TASKS-PAGE] Modification tâche:', editingTask.id);
        await taskService.updateTask(editingTask.id, taskData);
      } else {
        // Création
        console.log('🔄 [TASKS-PAGE] Création nouvelle tâche');
        await taskService.createTask(taskData, user.uid);
      }
      
      console.log('✅ [TASKS-PAGE] Tâche sauvegardée');
      await handleCloseTaskForm();
      
    } catch (error) {
      console.error('❌ [TASKS-PAGE] Erreur sauvegarde:', error);
      throw error;
    }
  };

  // ✅ GESTIONNAIRE FERMETURE FORMULAIRE
  const handleCloseTaskForm = async () => {
    console.log('🔄 [TASKS-PAGE] Fermeture formulaire et rechargement');
    setShowTaskForm(false);
    setEditingTask(null);
    // Recharger les tâches après création/modification
    await loadTasksData();
  };

  // ✅ GESTIONNAIRE ÉDITION TÂCHE
  const handleEditTask = (task) => {
    console.log('🔄 [TASKS-PAGE] Édition tâche:', task.title);
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // ✅ GESTIONNAIRE ACTIONS TÂCHE (trois petits points)
  const handleTaskActions = (taskId) => {
    console.log('🔄 [TASKS-PAGE] Toggle actions tâche:', taskId);
    setShowTaskActions(showTaskActions === taskId ? null : taskId);
  };

  // ✅ GESTIONNAIRE CHANGEMENT STATUT
  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      console.log('🔄 [TASKS-PAGE] Changement statut:', taskId, '→', newStatus);
      
      await taskService.updateTask(taskId, { status: newStatus });
      
      // Mettre à jour l'état local
      setRealTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      console.log('✅ [TASKS-PAGE] Statut mis à jour');
      setShowTaskActions(null);
      
    } catch (error) {
      console.error('❌ [TASKS-PAGE] Erreur changement statut:', error);
    }
  };

  // ✅ GESTIONNAIRE SUPPRESSION TÂCHE
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }
    
    try {
      console.log('🔄 [TASKS-PAGE] Suppression tâche:', taskId);
      
      await taskService.deleteTask(taskId);
      
      // Retirer de l'état local
      setRealTasks(prev => prev.filter(task => task.id !== taskId));
      
      console.log('✅ [TASKS-PAGE] Tâche supprimée');
      setShowTaskActions(null);
      
    } catch (error) {
      console.error('❌ [TASKS-PAGE] Erreur suppression:', error);
    }
  };

  // Filtrage des tâches
  const filteredTasks = realTasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.projectId === filterProject;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Calcul des statistiques
  const calculateStats = () => {
    const total = realTasks.length;
    const completed = realTasks.filter(t => t.status === 'completed').length;
    const inProgress = realTasks.filter(t => t.status === 'in_progress').length;
    const pending = realTasks.filter(t => t.status === 'todo' || t.status === 'pending').length;
    
    return [
      {
        title: 'Total',
        value: total,
        icon: CheckSquare,
        color: 'from-blue-500 to-blue-600',
        change: null
      },
      {
        title: 'Terminées', 
        value: completed,
        icon: CheckCircle,
        color: 'from-green-500 to-green-600',
        change: total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%'
      },
      {
        title: 'En cours',
        value: inProgress, 
        icon: Play,
        color: 'from-orange-500 to-orange-600',
        change: null
      },
      {
        title: 'En attente',
        value: pending,
        icon: Circle,
        color: 'from-purple-500 to-purple-600', 
        change: null
      }
    ];
  };

  // Actions d'en-tête avec boutons fonctionnels
  const headerActions = (
    <>
      <button
        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
      >
        {viewMode === 'grid' ? '📋 Liste' : '⊞ Grille'}
      </button>
      
      <PremiumButton 
        variant="secondary" 
        size="md"
        icon={Filter}
        onClick={handleToggleFilters}
      >
        Filtres
      </PremiumButton>
      
      <PremiumButton 
        variant="primary" 
        size="md"
        icon={Plus}
        onClick={handleNewTask}
      >
        Nouvelle tâche
      </PremiumButton>
    </>
  );

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'pending': return <Circle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <PremiumLayout
        title="Tâches"
        subtitle="Chargement de vos tâches..."
        icon={CheckSquare}
        showStats={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </PremiumLayout>
    );
  }

  if (error) {
    return (
      <PremiumLayout
        title="Tâches"
        subtitle="Erreur de chargement"
        icon={CheckSquare}
        showStats={false}
      >
        <PremiumCard className="text-center py-12">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <PremiumButton onClick={loadTasksData} variant="primary">
            Réessayer
          </PremiumButton>
        </PremiumCard>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout
      title="Mes Tâches"
      subtitle="Gérez efficacement vos tâches et projets"
      icon={CheckSquare}
      headerActions={headerActions}
      showStats={true}
      stats={calculateStats()}
    >
      {/* ✅ PANEL FILTRES FONCTIONNEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <PremiumCard>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recherche */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filtre statut */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Statut</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="completed">Terminé</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>

                {/* Filtre priorité */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Priorité</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Toutes les priorités</option>
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>

                {/* Filtre projet */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Projet</label>
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Tous les projets</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bouton de réinitialisation des filtres */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterPriority('all');
                    setFilterProject('all');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ LISTE DES TÂCHES AVEC BOUTONS FONCTIONNELS */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {viewMode === 'grid' ? (
              /* Vue grille avec boutons fonctionnels */
              <PremiumCard className="h-full">
                <div className="flex flex-col h-full">
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {task.title}
                      </h3>
                      
                      {/* Badges statut et priorité */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(task.status)}`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            {task.status === 'completed' ? 'Terminée' :
                             task.status === 'in_progress' ? 'En cours' :
                             task.status === 'pending' ? 'En attente' : 'À faire'}
                          </span>
                        </span>
                        
                        {task.priority && task.priority !== 'medium' && (
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? '🔥 Haute' : '🟢 Basse'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ✅ MENU ACTIONS FONCTIONNEL (trois petits points) */}
                    <div className="relative">
                      <button
                        onClick={() => handleTaskActions(task.id)}
                        className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-700 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Menu déroulant des actions */}
                      {showTaskActions === task.id && (
                        <div className="absolute right-0 top-10 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                          <div className="py-1">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Modifier
                            </button>
                            
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => handleTaskStatusChange(task.id, 'completed')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Marquer comme terminée
                              </button>
                            )}
                            
                            {task.status === 'completed' && (
                              <button
                                onClick={() => handleTaskStatusChange(task.id, 'todo')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                              >
                                <Circle className="w-4 h-4" />
                                Marquer comme à faire
                              </button>
                            )}
                            
                            <div className="border-t border-gray-700 my-1"></div>
                            
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                      {task.description}
                    </p>
                  )}

                  {/* Métadonnées */}
                  <div className="mt-auto space-y-2">
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Échéance : {(() => {
                          const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
                          return dueDate.toLocaleDateString('fr-FR');
                        })()}</span>
                      </div>
                    )}
                    
                    {task.projectId && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Target className="w-4 h-4" />
                        <span>
                          {projects.find(p => p.id === task.projectId)?.title || 'Projet inconnu'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </PremiumCard>
            ) : (
              /* Vue liste compacte avec boutons fonctionnels */
              <PremiumCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className={`text-sm ${
                        task.status === 'completed' ? 'text-green-400' :
                        task.status === 'in_progress' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {task.status === 'completed' ? 'Terminée' :
                         task.status === 'in_progress' ? 'En cours' : 'À faire'}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{task.title}</h3>
                      {task.dueDate && (
                        <p className="text-sm text-gray-400">
                          Échéance : {(() => {
                            const dueDate = task.dueDate.toDate ? task.dueDate.toDate() : new Date(task.dueDate);
                            return dueDate.toLocaleDateString('fr-FR');
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ BOUTONS D'ACTIONS LISTE FONCTIONNELS */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditTask(task)}
                      className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {task.status !== 'completed' ? (
                      <button 
                        onClick={() => handleTaskStatusChange(task.id, 'completed')}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors hover:bg-green-500/10 rounded-lg"
                        title="Marquer comme terminée"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleTaskStatusChange(task.id, 'todo')}
                        className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg"
                        title="Marquer comme à faire"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleTaskActions(task.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg"
                      title="Plus d'actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </PremiumCard>
            )}
          </motion.div>
        ))}

        {/* ✅ CARTE NOUVELLE TÂCHE FONCTIONNELLE */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: filteredTasks.length * 0.1 }}
          >
            <PremiumCard className="h-full border-dashed border-gray-600 hover:border-blue-500 transition-colors cursor-pointer">
              <div 
                className="flex flex-col items-center justify-center h-full min-h-[300px] text-center"
                onClick={handleNewTask}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Nouvelle tâche</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Créez une nouvelle tâche pour votre équipe
                </p>
                <PremiumButton 
                  variant="primary" 
                  size="sm"
                  onClick={handleNewTask}
                >
                  Créer
                </PremiumButton>
              </div>
            </PremiumCard>
          </motion.div>
        )}
      </div>

      {/* État vide avec bouton fonctionnel */}
      {filteredTasks.length === 0 && (
        <PremiumCard className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucune tâche trouvée</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Aucune tâche ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première tâche.'}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
              <PremiumButton 
                variant="secondary" 
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterProject('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
            <PremiumButton 
              variant="primary" 
              size="md"
              icon={Plus}
              onClick={handleNewTask}
            >
              Créer une tâche
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* ✅ MODAL FORMULAIRE TÂCHE FONCTIONNEL */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <TaskForm
              task={editingTask}
              onSubmit={handleSaveTask}
              onCancel={handleCloseTaskForm}
            />
          </div>
        </div>
      )}

      {/* Fermer le menu d'actions si on clique ailleurs */}
      {showTaskActions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowTaskActions(null)}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
