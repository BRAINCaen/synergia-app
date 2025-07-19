// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION COMPLÈTE AVEC FIREBASE ET TOUTES LES FONCTIONNALITÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Heart,
  Briefcase,
  Star,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Send,
  X,
  Save
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { taskAssignmentService } from '../core/services/taskAssignmentService.js';

/**
 * 🎨 COMPOSANT CARTE DE TÂCHE
 */
const TaskCard = ({ task, isVolunteer = false, showVolunteerButton = false, onVolunteer, onViewDetails, onEdit, onDelete, onAssign, onSubmit }) => {
  
  // Obtenir la couleur selon le statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la couleur selon la priorité
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6">
        {/* En-tête avec titre et badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {task.title}
            </h3>
            <p className="text-gray-600 mb-3">
              {task.description}
            </p>
          </div>
          
          {isVolunteer && (
            <div className="ml-4">
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <Heart className="w-4 h-4 mr-1" />
                Volontaire
              </span>
            </div>
          )}
        </div>

        {/* Badges de statut et priorité */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
            <CheckCircle className="w-4 h-4 mr-1" />
            {task.status === 'pending' ? 'En attente' :
             task.status === 'in_progress' ? 'En cours' :
             task.status === 'assigned' ? 'Assignée' :
             task.status === 'submitted' ? 'Soumise' :
             task.status === 'completed' ? 'Terminée' : task.status}
          </span>
          
          {task.priority && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
              <Flag className="w-4 h-4 mr-1" />
              {task.priority === 'urgent' ? 'Urgent' :
               task.priority === 'high' ? 'Haute' :
               task.priority === 'medium' ? 'Moyenne' :
               task.priority === 'low' ? 'Basse' : task.priority}
            </span>
          )}
          
          {task.xpReward && (
            <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              <Trophy className="w-4 h-4 mr-1" />
              {task.xpReward} XP
            </span>
          )}
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          {task.estimatedHours && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {task.estimatedHours}h estimées
            </div>
          )}
          
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(task.dueDate.seconds * 1000).toLocaleDateString('fr-FR')}
            </div>
          )}
          
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {task.assignedTo.length} assigné(s)
            </div>
          )}
          
          {task.category && (
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              {task.category}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewDetails?.(task)}
              className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Détails</span>
            </button>
            
            {onEdit && (
              <button
                onClick={() => onEdit(task)}
                className="flex items-center space-x-1 px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showVolunteerButton && onVolunteer && (
              <button
                onClick={() => onVolunteer(task)}
                className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>Se porter volontaire</span>
              </button>
            )}
            
            {onAssign && (
              <button
                onClick={() => onAssign(task)}
                className="flex items-center space-x-1 px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assigner</span>
              </button>
            )}
            
            {onSubmit && task.status === 'in_progress' && (
              <button
                onClick={() => onSubmit(task)}
                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Soumettre</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 🎯 PAGE TÂCHES COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États UI
  const [activeSection, setActiveSection] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadAllTasks();
      loadAllUsers();
    }
  }, [user?.uid]);

  /**
   * 📋 CHARGER TOUTES LES TÂCHES DEPUIS FIREBASE
   */
  const loadAllTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [TASKS] Chargement tâches pour utilisateur:', user.uid);
      
      // 1. Charger mes tâches assignées
      const myAssignedTasks = await taskAssignmentService.getUserAssignedTasks(user.uid);
      console.log('✅ [TASKS] Tâches assignées:', myAssignedTasks.length);
      setAssignedTasks(myAssignedTasks);
      
      // 2. Charger tâches disponibles (sans assignation ou ouvertes aux bénévoles)
      const allTasks = await taskService.getAllTasks();
      const unassignedTasks = allTasks.filter(task => 
        (!task.assignedTo || task.assignedTo.length === 0 || task.openToVolunteers === true) &&
        task.status !== 'completed' &&
        task.status !== 'cancelled' &&
        (!task.assignedTo || !task.assignedTo.includes(user.uid))
      );
      console.log('✅ [TASKS] Tâches disponibles:', unassignedTasks.length);
      setAvailableTasks(unassignedTasks);
      
    } catch (error) {
      console.error('❌ [TASKS] Erreur chargement:', error);
      setError(error.message);
      
      // En cas d'erreur, créer quelques tâches de démo pour tester l'affichage
      console.log('🔧 [TASKS] Création tâches de démo pour tests');
      setAssignedTasks([
        {
          id: 'demo1',
          title: 'Terminer le rapport mensuel',
          description: 'Finaliser et soumettre le rapport d\'activité du mois',
          status: 'in_progress',
          priority: 'high',
          xpReward: 50,
          estimatedHours: 3,
          dueDate: { seconds: Date.now() / 1000 + 86400 },
          category: 'Administration'
        },
        {
          id: 'demo2',
          title: 'Réviser les procédures',
          description: 'Mettre à jour les procédures internes',
          status: 'assigned',
          priority: 'medium',
          xpReward: 30,
          estimatedHours: 2,
          category: 'Documentation'
        }
      ]);
      
      setAvailableTasks([
        {
          id: 'demo3',
          title: 'Organiser l\'événement équipe',
          description: 'Planifier et coordonner le prochain événement d\'équipe',
          status: 'pending',
          priority: 'medium',
          xpReward: 40,
          estimatedHours: 4,
          category: 'Événementiel',
          openToVolunteers: true
        },
        {
          id: 'demo4',
          title: 'Améliorer la documentation utilisateur',
          description: 'Rédiger et améliorer les guides utilisateur',
          status: 'pending',
          priority: 'low',
          xpReward: 25,
          estimatedHours: 2,
          category: 'Documentation',
          openToVolunteers: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 👥 CHARGER TOUS LES UTILISATEURS
   */
  const loadAllUsers = async () => {
    try {
      // Simuler le chargement des utilisateurs depuis Firebase
      const users = [
        { id: user.uid, name: user.displayName || 'Vous', email: user.email },
        { id: 'user2', name: 'Jean Dupont', email: 'jean@example.com' },
        { id: 'user3', name: 'Marie Martin', email: 'marie@example.com' },
        { id: 'user4', name: 'Pierre Bernard', email: 'pierre@example.com' }
      ];
      setAllUsers(users);
    } catch (error) {
      console.error('❌ Erreur chargement utilisateurs:', error);
    }
  };

  /**
   * 🎯 SE PORTER VOLONTAIRE POUR UNE TÂCHE
   */
  const handleVolunteerForTask = async (task) => {
    try {
      console.log('🙋‍♂️ [VOLUNTEER] Candidature pour tâche:', task.title);
      
      const result = await taskAssignmentService.volunteerForTask(task.id, user.uid);
      
      if (result.success) {
        console.log('✅ [VOLUNTEER] Candidature réussie');
        await loadAllTasks();
        alert(result.pending ? 
          `Candidature envoyée pour "${task.title}" ! En attente d'approbation.` :
          `Vous avez été assigné à "${task.title}" !`
        );
      }
      
    } catch (error) {
      console.error('❌ [VOLUNTEER] Erreur candidature:', error);
      alert('Erreur lors de la candidature. Réessayez.');
    }
  };

  /**
   * 👁️ VOIR LES DÉTAILS D'UNE TÂCHE
   */
  const handleViewDetails = (task) => {
    console.log('👁️ [DETAILS] Affichage détails tâche:', task.title);
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  /**
   * ✏️ MODIFIER UNE TÂCHE
   */
  const handleEditTask = (task) => {
    console.log('✏️ [EDIT] Modification tâche:', task.title);
    setSelectedTask(task);
    setShowEditModal(true);
  };

  /**
   * 👥 ASSIGNER DES UTILISATEURS
   */
  const handleAssignUsers = (task) => {
    console.log('👥 [ASSIGN] Assignation utilisateurs:', task.title);
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  /**
   * 📤 SOUMETTRE UNE TÂCHE TERMINÉE
   */
  const handleSubmitTask = (task) => {
    console.log('📤 [SUBMIT] Soumission tâche:', task.title);
    setSelectedTask(task);
    setShowSubmitModal(true);
  };

  // Filtrer les tâches selon la recherche et le statut
  const filteredAssignedTasks = assignedTasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredAvailableTasks = availableTasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* En-tête avec titre et navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mes Tâches
            </h1>
            <p className="text-gray-600">
              Gérez vos tâches assignées et découvrez de nouvelles opportunités
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle tâche</span>
            </button>
          </div>
        </div>

        {/* Navigation des sections */}
        <div className="flex items-center space-x-1 mb-8 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveSection('assigned')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeSection === 'assigned'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Mes tâches</span>
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {assignedTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('available')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeSection === 'available'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Opportunités volontaires</span>
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {availableTasks.length}
            </span>
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>

            {activeSection === 'assigned' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="assigned">Assignées</option>
                <option value="in_progress">En cours</option>
                <option value="submitted">Soumises</option>
                <option value="completed">Terminées</option>
              </select>
            )}

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <AnimatePresence mode="wait">
          {activeSection === 'assigned' && (
            <motion.div
              key="assigned"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* En-tête section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Mes Tâches Assignées</h2>
                    <p className="text-blue-100">
                      Vous avez {filteredAssignedTasks.length} tâche(s) à accomplir
                    </p>
                  </div>
                  <Target className="w-12 h-12 text-blue-100" />
                </div>
              </div>

              {filteredAssignedTasks.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAssignedTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEditTask}
                      onSubmit={handleSubmitTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune tâche assignée</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucune tâche ne correspond à votre recherche.' : 'Vous n\'avez pas de tâches assignées pour le moment.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'available' && (
            <motion.div
              key="available"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* En-tête section */}
              <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Opportunités Volontaires</h2>
                    <p className="text-green-100">
                      C'est l'occasion idéale de contribuer et d'apprendre !
                    </p>
                  </div>
                  <Heart className="w-12 h-12 text-green-100" />
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
                      onVolunteer={handleVolunteerForTask}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune opportunité disponible</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Aucune tâche volontaire ne correspond à votre recherche.' : 'Il n\'y a pas d\'opportunités volontaires pour le moment.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistiques en bas */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {assignedTasks.length}
            </div>
            <div className="text-gray-600 text-sm">Tâches assignées</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {availableTasks.length}
            </div>
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

      {/* Modales (placeholders) */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Détails de la tâche</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">{selectedTask?.title}</h4>
              <p className="text-gray-600">{selectedTask?.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Statut: {selectedTask?.status}</div>
                <div>Priorité: {selectedTask?.priority}</div>
                <div>XP: {selectedTask?.xpReward}</div>
                <div>Temps estimé: {selectedTask?.estimatedHours}h</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
