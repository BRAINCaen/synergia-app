// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION SIMPLIFIÉE ET OPTIMISÉE POUR NETLIFY
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Target, 
  Users, 
  Trophy,
  Flag,
  CheckCircle,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Heart,
  Star,
  Briefcase,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🎯 PAGE TÂCHES SIMPLIFIÉE POUR ASSIGNATIONS ET VOLONTARIAT
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [activeSection, setActiveSection] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadMockTasks();
    }
  }, [user?.uid]);

  /**
   * 📋 CHARGER LES TÂCHES MOCKÉES (TEMPORAIRE)
   */
  const loadMockTasks = () => {
    setLoading(true);
    
    // Simulation d'un délai de chargement
    setTimeout(() => {
      // Tâches assignées mockées
      const mockAssigned = [
        {
          id: 'assigned1',
          title: 'Mettre à jour la documentation',
          description: 'Réviser et mettre à jour la documentation technique.',
          status: 'in_progress',
          priority: 'medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          estimatedHours: 3,
          xpReward: 50,
          isVolunteer: false,
          createdAt: new Date()
        },
        {
          id: 'assigned2',
          title: 'Révision du code',
          description: 'Examiner et optimiser le code des composants.',
          status: 'assigned',
          priority: 'high',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          estimatedHours: 5,
          xpReward: 75,
          isVolunteer: true,
          createdAt: new Date()
        }
      ];

      // Tâches disponibles mockées
      const mockAvailable = [
        {
          id: 'available1',
          title: 'Registre du personnel',
          description: 'Mettre à jour le registre avec les nouvelles informations.',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          estimatedHours: 2,
          xpReward: 25,
          openToVolunteers: true,
          createdAt: new Date()
        },
        {
          id: 'available2',
          title: 'Vidéo TikTok',
          description: 'Création d\'une vidéo promotionnelle.',
          status: 'pending',
          priority: 'low',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          estimatedHours: 4,
          xpReward: 60,
          openToVolunteers: true,
          createdAt: new Date()
        },
        {
          id: 'available3',
          title: 'Analyse des données',
          description: 'Analyser les données de performance du trimestre.',
          status: 'pending',
          priority: 'high',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          estimatedHours: 6,
          xpReward: 100,
          openToVolunteers: true,
          createdAt: new Date()
        }
      ];

      setAssignedTasks(mockAssigned);
      setAvailableTasks(mockAvailable);
      setLoading(false);
    }, 1000);
  };

  /**
   * 🎯 SE PORTER VOLONTAIRE
   */
  const handleVolunteerForTask = (task) => {
    const newTask = {
      ...task,
      id: 'new_' + task.id,
      status: 'assigned',
      isVolunteer: true
    };
    
    setAssignedTasks(prev => [...prev, newTask]);
    setAvailableTasks(prev => prev.filter(t => t.id !== task.id));
    
    alert(`Vous êtes maintenant assigné à "${task.title}" !`);
  };

  /**
   * 👁️ VOIR DÉTAILS
   */
  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  /**
   * ➕ CRÉER TÂCHE
   */
  const handleCreateTask = (taskData) => {
    const newTask = {
      id: 'new_' + Date.now(),
      ...taskData,
      status: 'assigned',
      createdAt: new Date(),
      isVolunteer: false
    };
    
    setAssignedTasks(prev => [...prev, newTask]);
    setShowCreateModal(false);
    alert(`Tâche "${taskData.title}" créée !`);
  };

  /**
   * 🎨 COULEURS
   */
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'assigned': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  /**
   * 🔍 FILTRAGE
   */
  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredAssignedTasks = filterTasks(assignedTasks);
  const filteredAvailableTasks = filterTasks(availableTasks);

  /**
   * 🎨 CARTE DE TÂCHE
   */
  const TaskCard = ({ task, isVolunteer = false, showVolunteerButton = false }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-gray-600 mb-3">{task.description}</p>
        </div>
        
        {isVolunteer && (
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium ml-4">
            <Heart className="w-4 h-4 mr-1" />
            Volontaire
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
          <CheckCircle className="w-4 h-4 mr-1" />
          {task.status === 'pending' ? 'En attente' :
           task.status === 'in_progress' ? 'En cours' :
           task.status === 'assigned' ? 'Assignée' : 'Terminée'}
        </span>
        
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
          <Flag className="w-4 h-4 mr-1" />
          {task.priority === 'low' ? 'Basse' :
           task.priority === 'medium' ? 'Moyenne' :
           task.priority === 'high' ? 'Haute' : 'Urgente'}
        </span>

        {task.xpReward && (
          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Trophy className="w-4 h-4 mr-1" />
            {task.xpReward} XP
          </span>
        )}
      </div>

      {/* Infos temporelles */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Échéance: {task.dueDate.toLocaleDateString('fr-FR')}</span>
          </div>
        )}
        
        {task.estimatedHours && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{task.estimatedHours}h estimées</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => handleViewDetails(task)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            Voir détails
          </button>
          
          {!isVolunteer && (
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          )}
        </div>
        
        {showVolunteerButton && (
          <button
            onClick={() => handleVolunteerForTask(task)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Heart className="w-4 h-4" />
            Se porter volontaire
          </button>
        )}
      </div>
    </div>
  );

  /**
   * 🎨 MODALE DÉTAILS
   */
  const TaskDetailsModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTask.title}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Échéance</h4>
                  <p className="text-gray-600">
                    {selectedTask.dueDate?.toLocaleDateString('fr-FR') || 'Non définie'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Temps estimé</h4>
                  <p className="text-gray-600">{selectedTask.estimatedHours || 0}h</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Récompense</h4>
                  <p className="text-gray-600">{selectedTask.xpReward || 0} XP</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Type</h4>
                  <p className="text-gray-600">
                    {selectedTask.isVolunteer ? 'Volontaire' : 'Assignée'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 🎨 MODALE CRÉATION
   */
  const CreateTaskModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      estimatedHours: '',
      xpReward: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.title.trim()) return;
      
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : 0,
        xpReward: formData.xpReward ? parseInt(formData.xpReward) : 0
      };

      handleCreateTask(taskData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Créer une nouvelle tâche</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre de la tâche"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description de la tâche"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures estimées
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Récompense XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xpReward}
                    onChange={(e) => setFormData(prev => ({ ...prev, xpReward: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation onglets */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveSection('assigned')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'assigned'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Mes assignations ({filteredAssignedTasks.length})
            </button>
            
            <button
              onClick={() => setActiveSection('available')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'available'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              Opportunités volontaires ({filteredAvailableTasks.length})
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Panneau filtres */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="assigned">Assignées</option>
                  <option value="completed">Terminées</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        {activeSection === 'assigned' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Mes tâches assignées</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {filteredAssignedTasks.length}
              </span>
            </div>

            {filteredAssignedTasks.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignedTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune tâche assignée</h3>
                <p className="text-gray-600 mb-6">Vous n'avez pas encore de tâches assignées.</p>
                <button
                  onClick={() => setActiveSection('available')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Heart className="w-4 h-4" />
                  Voir les opportunités volontaires
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === 'available' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Opportunités volontaires</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {filteredAvailableTasks.length}
              </span>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Contribuez à l'équipe !</h3>
                  <p className="text-green-700 text-sm">
                    Ces tâches sont ouvertes aux volontaires. C'est l'occasion idéale de contribuer !
                  </p>
                </div>
              </div>
            </div>

            {filteredAvailableTasks.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAvailableTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isVolunteer={true}
                    showVolunteerButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune opportunité disponible</h3>
                <p className="text-gray-600">Il n'y a pas d'opportunités volontaires pour le moment.</p>
              </div>
            )}
          </div>
        )}

        {/* Statistiques */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{assignedTasks.length}</div>
            <div className="text-gray-600 text-sm">Tâches assignées</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{availableTasks.length}</div>
            <div className="text-gray-600 text-sm">Opportunités volontaires</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {assignedTasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-gray-600 text-sm">Tâches terminées</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {assignedTasks.reduce((total, task) => total + (task.xpReward || 0), 0)}
            </div>
            <div className="text-gray-600 text-sm">XP total gagné</div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateModal && <CreateTaskModal />}
      {showDetailsModal && <TaskDetailsModal />}
    </div>
  );
};

export default TasksPage;
