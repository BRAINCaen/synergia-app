// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// VERSION AMÉLIORÉE AVEC ASSIGNATIONS ET BÉNÉVOLAT
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
  UserX
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskService } from '../core/services/taskService.js';
import { taskAssignmentService } from '../core/services/taskAssignmentService.js';

/**
 * 🎯 PAGE TÂCHES AMÉLIORÉE AVEC SECTIONS ASSIGNATIONS ET BÉNÉVOLAT
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États UI
  const [activeSection, setActiveSection] = useState('assigned');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    if (user?.uid) {
      loadAllTasks();
    }
  }, [user?.uid]);

  /**
   * 📋 CHARGER TOUTES LES TÂCHES (ASSIGNÉES + DISPONIBLES)
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
    } finally {
      setLoading(false);
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
        // Recharger les données
        await loadAllTasks();
        
        // Notification succès (tu peux ajouter un toast ici)
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
   * 🎨 COULEURS DE STATUT
   */
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
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
   * 🔍 FILTRER LES TÂCHES
   */
  const filterTasks = (tasks) => {
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredAssignedTasks = filterTasks(assignedTasks);
  const filteredAvailableTasks = filterTasks(availableTasks);

  /**
   * 🎨 RENDU D'UNE CARTE DE TÂCHE
   */
  const TaskCard = ({ task, isVolunteer = false, showVolunteerButton = false }) => (
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
             task.status === 'completed' ? 'Terminée' : 'Annulée'}
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

        {/* Informations temporelles */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                Échéance: {task.dueDate.toDate ? 
                  task.dueDate.toDate().toLocaleDateString('fr-FR') : 
                  new Date(task.dueDate).toLocaleDateString('fr-FR')
                }
              </span>
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
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
    </motion.div>
  );

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
      {/* En-tête de la page */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Nouvelle tâche
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation par onglets */}
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

        {/* Barre de recherche et filtres */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
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

          {/* Panneau de filtres */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminées</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contenu principal */}
        <AnimatePresence mode="wait">
          {activeSection === 'assigned' && (
            <motion.div
              key="assigned"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
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
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'Aucune tâche assignée ne correspond à votre recherche.' : 'Vous n\'avez pas encore de tâches assignées.'}
                  </p>
                  <button
                    onClick={() => setActiveSection('available')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Voir les opportunités volontaires
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'available' && (
            <motion.div
              key="available"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
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
                      Ces tâches sont ouvertes aux volontaires et ne demandent pas de compétences particulières. 
                      C'est l'occasion idéale de contribuer et d'apprendre !
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
    </div>
  );
};

export default TasksPage;
