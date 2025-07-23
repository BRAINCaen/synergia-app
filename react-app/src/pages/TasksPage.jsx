// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// PAGE TÂCHES COMPLÈTE - TOUTES FONCTIONNALITÉS FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Star, 
  Users, 
  Calendar,
  Tag,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Trash2,
  UserPlus,
  Send,
  Eye,
  Target,
  Zap,
  Trophy,
  Flame,
  Award,
  TrendingUp,
  BarChart3,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Flag,
  MessageSquare,
  Paperclip,
  Share2,
  Download,
  Upload
} from 'lucide-react';

// Services et stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { taskInitializationService } from '../core/services/taskInitializationService.js';
import { useUnifiedFirebaseData } from '../shared/hooks/useUnifiedFirebaseData.js';

const TasksPage = () => {
  const { user } = useAuthStore();
  const { userStats, loading: statsLoading } = useUnifiedFirebaseData(user?.uid);

  // ==========================================
  // 🎯 ÉTATS DE LA PAGE
  // ==========================================
  
  // Données des tâches
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({});
  const [projects, setProjects] = useState([]);
  
  // Interface utilisateur
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned'); // assigned, available, created
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modals et formulaires
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Formulaire de création/édition
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    projectId: '',
    assignedTo: [],
    tags: [],
    estimatedHours: 0,
    xpReward: 0,
    dueDate: '',
    attachments: []
  });
  
  // Notifications
  const [notification, setNotification] = useState(null);
  
  // ==========================================
  // 🚀 CHARGEMENT INITIAL DES DONNÉES
  // ==========================================
  
  useEffect(() => {
    if (user?.uid) {
      loadAllTaskData();
    }
  }, [user?.uid]);

  const loadAllTaskData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [TASKS] Chargement complet des données...');

      // 🚀 AUTO-INITIALISATION pour les nouveaux utilisateurs
      try {
        const initResult = await taskInitializationService.initializeForNewUser(user.uid);
        if (initResult.initialized) {
          console.log('🎉 Tâches d\'exemple créées pour nouvel utilisateur');
          showNotification('Bienvenue ! Des tâches d\'exemple ont été créées pour vous.', 'success');
        }
      } catch (initError) {
        console.warn('⚠️ Erreur initialisation (non bloquante):', initError);
      }

      // Charger en parallèle pour optimiser les performances
      const [
        userAssignedTasks,
        allAvailableTasks,
        userCreatedTasks,
        stats
      ] = await Promise.all([
        taskService.getUserTasks(user.uid),
        taskService.getAvailableTasks(),
        taskService.getTasksByCreator(user.uid),
        taskService.getTaskStats(user.uid)
      ]);

      setAssignedTasks(userAssignedTasks || []);
      setAvailableTasks(allAvailableTasks || []);
      setMyTasks(userCreatedTasks || []);
      setTaskStats(stats || {});

      console.log('✅ [TASKS] Données chargées:', {
        assigned: userAssignedTasks?.length || 0,
        available: allAvailableTasks?.length || 0,
        created: userCreatedTasks?.length || 0
      });

    } catch (error) {
      console.error('❌ [TASKS] Erreur chargement données:', error);
      showNotification('Erreur lors du chargement des tâches', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 📝 GESTION DES TÂCHES (CRUD)
  // ==========================================

  /**
   * ➕ CRÉER UNE NOUVELLE TÂCHE
   */
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    try {
      console.log('➕ [CREATE] Création nouvelle tâche:', taskForm.title);
      
      // Validation
      if (!taskForm.title.trim()) {
        showNotification('Le titre est obligatoire', 'error');
        return;
      }

      const newTask = await taskService.createTask(taskForm, user.uid);
      
      // Mettre à jour la liste locale
      setMyTasks(prev => [newTask, ...prev]);
      
      // Reset formulaire
      setTaskForm({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        projectId: '',
        assignedTo: [],
        tags: [],
        estimatedHours: 0,
        xpReward: 0,
        dueDate: '',
        attachments: []
      });
      
      setShowCreateModal(false);
      showNotification(`Tâche "${newTask.title}" créée avec succès !`, 'success');
      
      // Recharger les stats
      await updateTaskStats();

    } catch (error) {
      console.error('❌ [CREATE] Erreur création tâche:', error);
      showNotification('Erreur lors de la création de la tâche', 'error');
    }
  };

  /**
   * ✏️ MODIFIER UNE TÂCHE
   */
  const handleEditTask = async (e) => {
    e.preventDefault();
    
    try {
      console.log('✏️ [EDIT] Modification tâche:', selectedTask.id);
      
      const updatedTask = await taskService.updateTask(selectedTask.id, taskForm);
      
      // Mettre à jour les listes locales
      const updateList = (list) => 
        list.map(task => task.id === selectedTask.id ? updatedTask : task);
      
      setAssignedTasks(updateList);
      setAvailableTasks(updateList);
      setMyTasks(updateList);
      
      setShowEditModal(false);
      setSelectedTask(null);
      showNotification(`Tâche "${updatedTask.title}" mise à jour !`, 'success');

    } catch (error) {
      console.error('❌ [EDIT] Erreur modification tâche:', error);
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  /**
   * 🗑️ SUPPRIMER UNE TÂCHE
   */
  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${taskTitle}" ?`)) {
      return;
    }
    
    try {
      console.log('🗑️ [DELETE] Suppression tâche:', taskId);
      
      await taskService.deleteTask(taskId);
      
      // Retirer de toutes les listes
      const removeFromList = (list) => list.filter(task => task.id !== taskId);
      
      setAssignedTasks(removeFromList);
      setAvailableTasks(removeFromList);
      setMyTasks(removeFromList);
      
      showNotification(`Tâche "${taskTitle}" supprimée`, 'success');
      await updateTaskStats();

    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * ⚡ CHANGER LE STATUT D'UNE TÂCHE
   */
  const handleStatusChange = async (taskId, newStatus, taskTitle) => {
    try {
      console.log('⚡ [STATUS] Changement statut:', taskId, newStatus);
      
      const updatedTask = await taskService.updateTask(taskId, { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Mettre à jour les listes
      const updateList = (list) => 
        list.map(task => task.id === taskId ? updatedTask : task);
      
      setAssignedTasks(updateList);
      setMyTasks(updateList);
      
      // Message selon le statut
      const statusMessages = {
        'in_progress': 'Tâche démarrée',
        'completed': 'Tâche terminée ! 🎉',
        'cancelled': 'Tâche annulée',
        'pending': 'Tâche remise en attente'
      };
      
      showNotification(
        `${statusMessages[newStatus] || 'Statut mis à jour'} : "${taskTitle}"`, 
        newStatus === 'completed' ? 'success' : 'info'
      );
      
      await updateTaskStats();

    } catch (error) {
      console.error('❌ [STATUS] Erreur changement statut:', error);
      showNotification('Erreur lors du changement de statut', 'error');
    }
  };

  /**
   * 🙋 SE PORTER VOLONTAIRE POUR UNE TÂCHE
   */
  const handleVolunteerForTask = async (taskId, taskTitle) => {
    try {
      console.log('🙋 [VOLUNTEER] Candidature volontaire:', taskId);
      
      const updatedTask = await taskService.assignUserToTask(taskId, user.uid);
      
      // Déplacer de disponible vers assigné
      setAvailableTasks(prev => prev.filter(task => task.id !== taskId));
      setAssignedTasks(prev => [updatedTask, ...prev]);
      
      showNotification(`Vous êtes maintenant assigné à "${taskTitle}" !`, 'success');

    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature:', error);
      
      let errorMessage = 'Erreur lors de la candidature';
      if (error.message.includes('déjà assigné')) {
        errorMessage = 'Vous êtes déjà assigné à cette tâche';
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  /**
   * 📤 SOUMETTRE UNE TÂCHE TERMINÉE
   */
  const handleSubmitTask = async (taskId, submission) => {
    try {
      console.log('📤 [SUBMIT] Soumission tâche:', taskId);
      
      const updatedTask = await taskService.submitTask(taskId, {
        submissionText: submission.text,
        attachments: submission.attachments,
        submittedAt: new Date(),
        submittedBy: user.uid
      });
      
      setAssignedTasks(prev => 
        prev.map(task => task.id === taskId ? updatedTask : task)
      );
      
      setShowSubmitModal(false);
      setSelectedTask(null);
      showNotification('Tâche soumise pour validation !', 'success');

    } catch (error) {
      console.error('❌ [SUBMIT] Erreur soumission:', error);
      showNotification('Erreur lors de la soumission', 'error');
    }
  };

  // ==========================================
  // 🔧 FONCTIONS UTILITAIRES
  // ==========================================

  const updateTaskStats = async () => {
    try {
      const stats = await taskService.getTaskStats(user.uid);
      setTaskStats(stats);
    } catch (error) {
      console.error('❌ Erreur mise à jour stats:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const getTasksByTab = () => {
    switch (activeTab) {
      case 'assigned':
        return assignedTasks;
      case 'available':
        return availableTasks;
      case 'created':
        return myTasks;
      default:
        return [];
    }
  };

  const getFilteredTasks = () => {
    let tasks = getTasksByTab();
    
    // Filtre de recherche
    if (searchTerm) {
      tasks = tasks.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtre de statut
    if (filterStatus !== 'all') {
      tasks = tasks.filter(task => task.status === filterStatus);
    }
    
    // Filtre de priorité
    if (filterPriority !== 'all') {
      tasks = tasks.filter(task => task.priority === filterPriority);
    }
    
    // Filtre de projet
    if (filterProject !== 'all') {
      tasks = tasks.filter(task => task.projectId === filterProject);
    }
    
    // Tri
    tasks.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return tasks;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // ==========================================
  // 🎨 RENDU DE L'INTERFACE
  // ==========================================

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de vos tâches...</p>
          <p className="text-gray-400 text-sm mt-2">Synchronisation avec Firebase</p>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
                notification.type === 'success' 
                  ? 'bg-green-100 border border-green-200 text-green-800' 
                  : notification.type === 'error'
                  ? 'bg-red-100 border border-red-200 text-red-800'
                  : 'bg-blue-100 border border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : notification.type === 'error' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header avec statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Mes Tâches
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Gérez vos tâches et découvrez de nouvelles opportunités
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Nouvelle tâche
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{taskStats.total || 0}</div>
              <div className="text-blue-300 text-sm">Total</div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{taskStats.inProgress || 0}</div>
              <div className="text-yellow-300 text-sm">En cours</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{taskStats.completed || 0}</div>
              <div className="text-green-300 text-sm">Terminées</div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {userStats?.gamification?.xp || 0}
              </div>
              <div className="text-purple-300 text-sm">XP Total</div>
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes priorités</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date de création</option>
                <option value="updatedAt">Dernière mise à jour</option>
                <option value="priority">Priorité</option>
                <option value="dueDate">Date d'échéance</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-2"
        >
          {[
            { id: 'assigned', label: 'Assignées', count: assignedTasks.length },
            { id: 'available', label: 'Disponibles', count: availableTasks.length },
            { id: 'created', label: 'Créées', count: myTasks.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-center py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </motion.div>

        {/* Liste des tâches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredTasks.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center">
              <CheckSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune tâche trouvée
              </h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'assigned' && 'Vous n\'avez aucune tâche assignée pour le moment.'}
                {activeTab === 'available' && 'Aucune tâche disponible ne correspond à vos critères.'}
                {activeTab === 'created' && 'Vous n\'avez créé aucune tâche.'}
              </p>
              {activeTab === 'created' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Créer votre première tâche
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </h3>
                        
                        {/* Badges de statut et priorité */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status === 'in_progress' ? 'En cours' :
                           task.status === 'completed' ? 'Terminée' :
                           task.status === 'pending' ? 'En attente' : 
                           task.status}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' ? 'Haute' :
                           task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 mb-4">{task.description}</p>
                      
                      {/* Méta-informations */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {task.xpReward > 0 && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            {task.xpReward} XP
                          </span>
                        )}
                        
                        {task.estimatedHours > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {task.estimatedHours}h estimées
                          </span>
                        )}
                        
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {task.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Actions selon l'onglet */}
                      {activeTab === 'assigned' && (
                        <>
                          {task.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(task.id, 'in_progress', task.title)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Démarrer"
                            >
                              <PlayCircle className="w-5 h-5" />
                            </button>
                          )}
                          
                          {task.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(task.id, 'completed', task.title)}
                                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Terminer"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowSubmitModal(true);
                                }}
                                className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                                title="Soumettre"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                      
                      {activeTab === 'available' && (
                        <button
                          onClick={() => handleVolunteerForTask(task.id, task.title)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Se porter volontaire"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>
                      )}
                      
                      {activeTab === 'created' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setTaskForm(task);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Voir les détails (disponible pour tous) */}
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-gray-400 hover:bg-gray-500/20 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* TODO: Ajouter les modals pour création, édition, soumission, etc. */}
        {/* Ces modals seront ajoutés dans la suite du développement */}
        
      </div>
    </div>
  );
};

export default TasksPage;
