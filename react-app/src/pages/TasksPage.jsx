// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE COMPLÈTE AVEC ENHANCED ASSIGNMENT MODAL
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Target,
  Clock,
  Star,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Upload,
  Camera,
  Video,
  UserPlus,
  Share,
  Trophy,
  Zap,
  Flag,
  Repeat,
  Save,
  X,
  Send,
  ChevronDown
} from 'lucide-react';

// Imports Firebase directs
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Layout et stores
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

// ✅ IMPORT DU MODAL D'ASSIGNATION AVANCÉ
import EnhancedTaskAssignmentModal from '../components/tasks/EnhancedTaskAssignmentModal.jsx';

/**
 * 🔧 COMPOSANTS INTERNES SÉCURISÉS
 */

// ✅ Composant TaskCard avec actions d'assignation
const TaskCard = ({ task, onEdit, onDelete, onAssign, onSubmit, onView }) => {
  const [showActions, setShowActions] = useState(false);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'assigned': return 'text-purple-600 bg-purple-100';
      case 'validation_pending': return 'text-orange-600 bg-orange-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'assigned': return 'Assigné';
      case 'validation_pending': return 'En validation';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const isAssigned = task.assignedTo && task.assignedTo.length > 0;
  const isMultiple = task.assignedTo && task.assignedTo.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Header avec titre et actions */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Menu actions */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onView?.(task);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </button>
                  
                  <button
                    onClick={() => {
                      onEdit?.(task);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  
                  {/* Action d'assignation avancée */}
                  <button
                    onClick={() => {
                      onAssign?.(task);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isAssigned ? 'Modifier assignation' : 'Assigner membres'}
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                  <button
                    onClick={() => {
                      onDelete?.(task);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corps avec métadonnées */}
      <div className="p-4 space-y-3">
        
        {/* Badges status et priorité */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          {task.difficulty && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {task.difficulty}
            </span>
          )}
        </div>

        {/* Informations d'assignation */}
        {isAssigned && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {isMultiple ? `${task.assignedTo.length} membres assignés` : '1 membre assigné'}
              </span>
            </div>
            
            {/* XP total si disponible */}
            {task.totalExpectedXP && (
              <div className="flex items-center gap-1 text-xs text-blue-700">
                <Trophy className="w-3 h-3" />
                <span>{task.totalExpectedXP} XP total</span>
              </div>
            )}
            
            {/* Progression si assignation multiple */}
            {isMultiple && task.assignments && (
              <div className="mt-2 text-xs text-blue-600">
                {task.assignments.filter(a => a.hasSubmitted).length} / {task.assignments.length} soumissions
              </div>
            )}
          </div>
        )}

        {/* Métriques */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {task.xpReward && (
              <div className="flex items-center gap-1 text-green-600">
                <Zap className="w-4 h-4" />
                <span>{task.xpReward} XP</span>
              </div>
            )}
          </div>
          
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer avec actions rapides */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isAssigned && (
              <button
                onClick={() => onAssign?.(task)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Assigner
              </button>
            )}
          </div>
          
          {task.status !== 'completed' && task.status !== 'validation_pending' && (
            <button
              onClick={() => onSubmit?.(task)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Soumettre
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ✅ Composant TaskForm avec récurrence et assignation basique
const TaskFormModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    difficulty: 'normal',
    dueDate: '',
    estimatedHours: 1,
    xpReward: 25,
    isRecurring: false,
    recurrenceType: 'weekly',
    tags: []
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialiser le formulaire
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'medium',
          difficulty: task.difficulty || 'normal',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          estimatedHours: task.estimatedHours || 1,
          xpReward: task.xpReward || 25,
          isRecurring: task.isRecurring || false,
          recurrenceType: task.recurrenceType || 'weekly',
          tags: task.tags || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          difficulty: 'normal',
          dueDate: '',
          estimatedHours: 1,
          xpReward: 25,
          isRecurring: false,
          recurrenceType: 'weekly',
          tags: []
        });
      }
      setError(null);
    }
  }, [isOpen, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erreur soumission formulaire:', error);
      setError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {task ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom de la tâche"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Description de la tâche"
                />
              </div>

              {/* Grille de paramètres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Priorité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                {/* Difficulté */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Facile</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difficile</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Date d'échéance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Heures estimées */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heures estimées
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* XP Reward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Récompense XP
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.xpReward}
                  onChange={(e) => setFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Récurrence */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    Tâche récurrente
                  </label>
                  <Repeat className="w-4 h-4 text-gray-500" />
                </div>

                {formData.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fréquence
                    </label>
                    <select
                      value={formData.recurrenceType}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuelle</option>
                      <option value="yearly">Annuelle</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.title.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Sauvegarde...' : (task ? 'Modifier' : 'Créer la tâche')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Modal simple
const SimpleModal = ({ isOpen, onClose, title, children, onConfirm, confirmText = "Confirmer" }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 🎯 COMPOSANT PRINCIPAL TASKS PAGE
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // États de filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // États des modals
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ✅ ÉTATS POUR LE MODAL D'ASSIGNATION AVANCÉ
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);

  // États des actions rapides
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Charger les tâches depuis Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const loadTasks = () => {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = [];
        snapshot.forEach((doc) => {
          tasksData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setTasks(tasksData);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = loadTasks();
    return () => unsubscribe();
  }, [user?.uid]);

  // Filtrer et trier les tâches
  useEffect(() => {
    let filtered = [...tasks];

    // Filtrage par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
      );
    }

    // Filtrage par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filtrage par priorité
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority, sortBy]);

  // Créer une nouvelle tâche
  const handleCreateTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId: user.uid,
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur création tâche:', error);
      throw error;
    }
  };

  // Mettre à jour une tâche
  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error);
      throw error;
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (task) => {
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
    } catch (error) {
      console.error('Erreur suppression tâche:', error);
      throw error;
    }
  };

  // ✅ GESTIONNAIRE D'ASSIGNATION AVANCÉE
  const handleAssignTask = (task) => {
    console.log('🎯 Ouverture modal assignation pour:', task.title);
    setTaskToAssign(task);
    setShowAssignmentModal(true);
  };

  // ✅ GESTIONNAIRE DE SUCCÈS D'ASSIGNATION
  const handleAssignmentSuccess = (result) => {
    console.log('✅ Assignation réussie:', result);
    
    // Afficher un message de succès
    const successMessage = `Tâche assignée à ${result.assignedMembers.length} membre(s) avec succès!`;
    
    // Vous pouvez ajouter ici une notification toast
    // toast.success(successMessage);
    
    // Fermer le modal
    setShowAssignmentModal(false);
    setTaskToAssign(null);
    
    // Les tâches seront automatiquement mises à jour via onSnapshot
  };

  // Créer tâche rapide
  const handleQuickCreate = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      await handleCreateTask({
        title: newTaskTitle,
        priority: 'medium',
        difficulty: 'normal',
        xpReward: 25
      });
      setNewTaskTitle('');
      setShowQuickCreate(false);
    } catch (error) {
      console.error('Erreur création rapide:', error);
    }
  };

  if (loading) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="space-y-6">
        
        {/* Header avec titre et actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-8 h-8 text-blue-600" />
              Mes Tâches
            </h1>
            <p className="text-gray-600 mt-1">
              {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} • {filteredTasks.length} affichée{filteredTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Création rapide */}
            {showQuickCreate ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Titre de la tâche..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickCreate();
                    if (e.key === 'Escape') setShowQuickCreate(false);
                  }}
                  autoFocus
                />
                <button
                  onClick={handleQuickCreate}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowQuickCreate(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowQuickCreate(true)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Rapide
                </button>
                
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle Tâche
                </button>
              </>
            )}
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher des tâches..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Filtres */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Filtre statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="assigned">Assigné</option>
              <option value="in_progress">En cours</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Terminé</option>
            </select>
            
            {/* Filtre priorité */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgente</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            
            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dueDate">Par échéance</option>
              <option value="priority">Par priorité</option>
              <option value="title">Par nom</option>
              <option value="createdAt">Par date de création</option>
            </select>
          </div>
        </div>

        {/* Métriques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total</span>
              <CheckSquare className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">En cours</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {tasks.filter(t => t.status === 'in_progress' || t.status === 'assigned').length}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Terminées</span>
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {tasks.filter(t => t.status === 'completed').length}
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Assignées</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {tasks.filter(t => t.assignedTo && t.assignedTo.length > 0).length}
            </p>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Créez votre première tâche pour commencer'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setShowTaskForm(true);
                  }}
                  onDelete={(task) => {
                    setSelectedTask(task);
                    setShowSubmissionModal(true);
                  }}
                  onAssign={handleAssignTask} // ✅ Connecter l'action d'assignation
                  onSubmit={(task) => {
                    handleUpdateTask(task.id, { 
                      status: 'validation_pending',
                      submittedAt: serverTimestamp()
                    });
                  }}
                  onView={(task) => {
                    // Optionnel: modal de détails
                    console.log('Voir détails:', task);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal TaskForm avec système de récurrence */}
      <TaskFormModal
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? 
          (data) => handleUpdateTask(editingTask.id, data) : 
          handleCreateTask
        }
        task={editingTask}
      />

      {/* ✅ MODAL D'ASSIGNATION AVANCÉ */}
      <EnhancedTaskAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setTaskToAssign(null);
        }}
        task={taskToAssign}
        onAssignmentSuccess={handleAssignmentSuccess}
      />

      {/* Modal de suppression */}
      <SimpleModal
        isOpen={showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setSelectedTask(null);
        }}
        title="Supprimer la tâche"
        onConfirm={() => {
          if (selectedTask) {
            handleDeleteTask(selectedTask);
          }
          setShowSubmissionModal(false);
          setSelectedTask(null);
        }}
        confirmText="Supprimer"
      >
        <p className="text-gray-600">
          Êtes-vous sûr de vouloir supprimer la tâche "{selectedTask?.title}" ? Cette action est irréversible.
        </p>
      </SimpleModal>
    </PremiumLayout>
  );
};

export default TasksPage;
