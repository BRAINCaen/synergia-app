// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE AVEC BOUTONS COMMENCER FONCTIONNELS
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

/**
 * 🔧 COMPOSANTS INTERNES SÉCURISÉS
 */

// ✅ Composant TaskCard avec BOUTON COMMENCER FONCTIONNEL
const TaskCard = ({ task, onEdit, onDelete, onAssign, onSubmit, onView, onStart }) => {
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

  // ✅ FONCTION POUR OBTENIR LE BOUTON ACTION CORRECT
  const getActionButton = () => {
    const status = task.status || 'todo';
    
    if (status === 'todo' || status === 'draft' || !status) {
      return (
        <button
          onClick={() => {
            console.log('🎯 Démarrage tâche:', task.title);
            onStart?.(task);
          }}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Play className="w-3 h-3" />
          Commencer
        </button>
      );
    }

    if (status === 'in_progress') {
      return (
        <button
          onClick={() => {
            console.log('🎯 Soumission tâche:', task.title);
            onSubmit?.(task);
          }}
          className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          Soumettre
        </button>
      );
    }

    if (status === 'validation_pending') {
      return (
        <button
          disabled
          className="text-sm bg-orange-500 text-white px-3 py-1 rounded opacity-75 cursor-not-allowed flex items-center gap-1"
        >
          <Clock className="w-3 h-3" />
          En validation
        </button>
      );
    }

    if (status === 'completed') {
      return (
        <button
          disabled
          className="text-sm bg-green-600 text-white px-3 py-1 rounded opacity-75 cursor-not-allowed flex items-center gap-1"
        >
          <CheckCircle className="w-3 h-3" />
          Terminée
        </button>
      );
    }

    return (
      <button
        onClick={() => onStart?.(task)}
        className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1"
      >
        <Eye className="w-3 h-3" />
        Action
      </button>
    );
  };

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

      {/* Contenu de la carte */}
      <div className="p-4">
        {/* Métadonnées */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            <Flag className="w-3 h-3 mr-1" />
            {task.priority || 'Normal'}
          </span>
          
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusText(task.status)}
          </span>

          {task.xpReward && (
            <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              <Trophy className="w-3 h-3 mr-1" />
              {task.xpReward} XP
            </span>
          )}
        </div>

        {/* Dates et estimations */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {task.dueDate.toDate ? 
                  task.dueDate.toDate().toLocaleDateString('fr-FR') : 
                  new Date(task.dueDate).toLocaleDateString('fr-FR')
                }
              </span>
            </div>
          )}
          
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h estimées</span>
            </div>
          )}
        </div>

        {/* Actions du bas */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {isAssigned && (
              <button
                onClick={() => onAssign?.(task)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <UserPlus className="w-4 h-4" />
                Assigner
              </button>
            )}
          </div>
          
          {/* ✅ BOUTON D'ACTION FONCTIONNEL */}
          {getActionButton()}
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
          dueDate: task.dueDate ? 
            (task.dueDate.toDate ? task.dueDate.toDate().toISOString().split('T')[0] : task.dueDate) : '',
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
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        estimatedHours: Number(formData.estimatedHours),
        xpReward: Number(formData.xpReward),
        status: task ? task.status : 'todo',
        createdAt: task ? task.createdAt : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde tâche:', error);
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
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre de la tâche"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Description détaillée de la tâche"
                />
              </div>

              {/* Priorité et Difficulté */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulté
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Facile</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Difficile</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Date et temps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temps estimé (heures)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* XP Reward */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Récompense XP
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Récurrence */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  Tâche récurrente
                </label>
                
                {formData.isRecurring && (
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // ✅ CHARGEMENT DES TÂCHES DEPUIS FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Tâches chargées:', tasksData.length);
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Erreur chargement tâches:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ✅ GESTIONNAIRES D'ACTIONS DES TÂCHES
  
  // Démarrer une tâche
  const handleStartTask = async (task) => {
    try {
      console.log('🎯 Démarrage tâche:', task.title);
      
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'in_progress',
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      alert(`✅ Tâche "${task.title}" démarrée !`);
      
    } catch (error) {
      console.error('❌ Erreur démarrage tâche:', error);
      alert('❌ Erreur lors du démarrage de la tâche');
    }
  };

  // Soumettre une tâche
  const handleSubmitTask = async (task) => {
    try {
      console.log('🎯 Soumission tâche:', task.title);
      
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        status: 'validation_pending',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      alert(`✅ Tâche "${task.title}" soumise pour validation !`);
      
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      alert('❌ Erreur lors de la soumission');
    }
  };

  // Créer/modifier une tâche
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const taskRef = doc(db, 'tasks', editingTask.id);
        await updateDoc(taskRef, taskData);
        console.log('✅ Tâche modifiée');
      } else {
        const tasksRef = collection(db, 'tasks');
        await addDoc(tasksRef, {
          ...taskData,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
        console.log('✅ Tâche créée');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      throw error;
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'tasks', taskToDelete.id));
      console.log('✅ Tâche supprimée');
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  // ✅ FILTRAGE ET TRI
  useEffect(() => {
    let filtered = [...tasks];

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          const dateA = a.dueDate ? (a.dueDate.toDate ? a.dueDate.toDate() : new Date(a.dueDate)) : new Date(0);
          const dateB = b.dueDate ? (b.dueDate.toDate ? b.dueDate.toDate() : new Date(b.dueDate)) : new Date(0);
          return dateB - dateA;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'createdAt':
        default:
          const createdA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
          const createdB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
          return createdB - createdA;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority, sortBy]);

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-7 h-7 text-blue-600" />
              Gestion des Tâches
            </h1>
            <p className="text-gray-600 mt-1">
              Organisez et suivez vos tâches - {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvelle tâche
          </button>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtre statut */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="validation_pending">En validation</option>
              <option value="completed">Terminé</option>
            </select>

            {/* Filtre priorité */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les priorités</option>
              <option value="urgent">Urgente</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Date de création</option>
              <option value="dueDate">Date d'échéance</option>
              <option value="priority">Priorité</option>
            </select>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tasks.length === 0 ? 'Aucune tâche créée' : 'Aucune tâche trouvée'}
              </h3>
              <p className="text-gray-600 mb-4">
                {tasks.length === 0 
                  ? 'Commencez par créer votre première tâche'
                  : 'Ajustez vos filtres pour voir plus de résultats'
                }
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Créer ma première tâche
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(task) => {
                  setEditingTask(task);
                  setShowTaskForm(true);
                }}
                onDelete={(task) => {
                  setTaskToDelete(task);
                  setShowDeleteModal(true);
                }}
                onStart={handleStartTask}
                onSubmit={handleSubmitTask}
                onView={(task) => console.log('Voir tâche:', task)}
                onAssign={(task) => console.log('Assigner tâche:', task)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        task={editingTask}
      />

      <SimpleModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteTask}
        title="Supprimer la tâche"
        confirmText="Supprimer"
      >
        <p className="text-gray-600">
          Êtes-vous sûr de vouloir supprimer la tâche "{taskToDelete?.title}" ?
          Cette action est irréversible.
        </p>
      </SimpleModal>
    </PremiumLayout>
  );
};

export default TasksPage;
