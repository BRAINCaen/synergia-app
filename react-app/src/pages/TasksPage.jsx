// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE VERSION SÉCURISÉE - SANS IMPORTS PROBLÉMATIQUES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  X
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

// Layout et stores uniquement
import PremiumLayout from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🔧 COMPOSANTS INTERNES SÉCURISÉS
 * Pour éviter les imports circulaires et les erreurs de build
 */

// ✅ Composant TaskForm intégré AVEC SYSTÈME DE RÉCURRENCE
const TaskFormModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    complexity: 'medium',
    dueDate: '',
    xpReward: 50,
    // 🔄 RÉCURRENCE
    isRecurring: false,
    recurrenceType: 'daily',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    maxOccurrences: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Configuration récurrence avec XP adaptatif
  const recurrenceConfig = {
    daily: { label: 'Quotidienne', icon: '📅', multiplier: 0.5 },
    weekly: { label: 'Hebdomadaire', icon: '📆', multiplier: 1.2 },
    monthly: { label: 'Mensuelle', icon: '🗓️', multiplier: 2.5 },
    yearly: { label: 'Annuelle', icon: '📊', multiplier: 5.0 }
  };

  // Calcul XP adaptatif
  const calculateXP = () => {
    const baseXP = { easy: 15, medium: 25, hard: 40, expert: 60 }[formData.complexity] || 25;
    const priorityMultiplier = { low: 1, medium: 1.2, high: 1.5, urgent: 2 }[formData.priority] || 1.2;
    const recurrenceMultiplier = formData.isRecurring ? 
      recurrenceConfig[formData.recurrenceType]?.multiplier || 1 : 1;
    const intervalMultiplier = formData.recurrenceInterval > 1 ? 
      1 + (formData.recurrenceInterval - 1) * 0.2 : 1;

    return Math.round(baseXP * priorityMultiplier * recurrenceMultiplier * intervalMultiplier);
  };

  const calculatedXP = calculateXP();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        complexity: task.complexity || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate.toDate?.() || task.dueDate).toISOString().split('T')[0] : '',
        xpReward: task.xpReward || 50,
        isRecurring: task.isRecurring || false,
        recurrenceType: task.recurrenceType || 'daily',
        recurrenceInterval: task.recurrenceInterval || 1,
        recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate.toDate?.() || task.recurrenceEndDate).toISOString().split('T')[0] : '',
        maxOccurrences: task.maxOccurrences || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        complexity: 'medium',
        dueDate: '',
        xpReward: 50,
        isRecurring: false,
        recurrenceType: 'daily',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        maxOccurrences: ''
      });
    }
    setError(null);
  }, [task, isOpen]);

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
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        xpReward: calculatedXP,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null,
        maxOccurrences: formData.maxOccurrences ? parseInt(formData.maxOccurrences) : null,
        // Métadonnées
        isRecurring: formData.isRecurring,
        recurrenceType: formData.isRecurring ? formData.recurrenceType : null,
        recurrenceInterval: formData.isRecurring ? formData.recurrenceInterval : null
      };
      
      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
      setError(error.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
                </h2>
                <p className="text-sm text-gray-500">
                  {formData.isRecurring ? 'Tâche récurrente avec XP adaptatif' : 'Tâche unique'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la tâche *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Rapport hebdomadaire de performance"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
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
              placeholder="Décrivez les détails de la tâche..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
              disabled={submitting}
            />
          </div>

          {/* Priorité et Complexité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag className="inline w-4 h-4 mr-1" />
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="low">🟢 Basse (×1.0)</option>
                <option value="medium">🟡 Moyenne (×1.2)</option>
                <option value="high">🟠 Haute (×1.5)</option>
                <option value="urgent">🔴 Urgente (×2.0)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Complexité
              </label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={submitting}
              >
                <option value="easy">😊 Facile (15 XP base)</option>
                <option value="medium">🤔 Moyenne (25 XP base)</option>
                <option value="hard">😰 Difficile (40 XP base)</option>
                <option value="expert">🤯 Expert (60 XP base)</option>
              </select>
            </div>
          </div>

          {/* Date d'échéance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date d'échéance {formData.isRecurring && '(première occurrence)'}
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            />
          </div>

          {/* 🔄 SECTION RÉCURRENCE AVANCÉE */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Repeat className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Récurrence et XP Adaptatif</h3>
                <p className="text-sm text-gray-600">Configurez la répétition automatique et les récompenses</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isRecurring: e.target.checked,
                    recurrenceType: e.target.checked ? 'daily' : 'daily'
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={submitting}
                />
                <span className="text-sm font-medium text-gray-700">Activer</span>
              </label>
            </div>

            {/* Types de récurrence */}
            {formData.isRecurring && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(recurrenceConfig).map(([key, config]) => (
                    <label
                      key={key}
                      className={`relative flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.recurrenceType === key
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="recurrenceType"
                        value={key}
                        checked={formData.recurrenceType === key}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          recurrenceType: e.target.value,
                          recurrenceInterval: 1
                        }))}
                        className="sr-only"
                        disabled={submitting}
                      />
                      <div className="text-center">
                        <div className="text-lg mb-1">{config.icon}</div>
                        <div className="text-xs font-medium text-gray-900">{config.label}</div>
                        <div className="text-xs text-blue-600 font-semibold">×{config.multiplier}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Configuration intervalle */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intervalle
                    </label>
                    <select
                      value={formData.recurrenceInterval}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map(interval => (
                        <option key={interval} value={interval}>
                          Tous les {interval} {
                            formData.recurrenceType === 'daily' ? 'jour(s)' : 
                            formData.recurrenceType === 'weekly' ? 'semaine(s)' :
                            formData.recurrenceType === 'monthly' ? 'mois' : 'an(s)'
                          }
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin (optionnel)
                    </label>
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nb max d'occurrences
                    </label>
                    <input
                      type="number"
                      value={formData.maxOccurrences}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxOccurrences: e.target.value }))}
                      placeholder="Illimité"
                      min="1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 🎯 PREVIEW XP ADAPTATIF */}
          <div className="border border-yellow-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Récompense XP Calculée</h3>
                <p className="text-sm text-gray-600">Basée sur la complexité, priorité et récurrence</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">{calculatedXP}</div>
                <div className="text-xs text-gray-500">XP par occurrence</div>
              </div>
            </div>

            {formData.isRecurring && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700">
                  <strong>Stratégie :</strong> {
                    formData.recurrenceType === 'daily' && 'Parfait pour les habitudes quotidiennes'
                  }
                  {formData.recurrenceType === 'weekly' && 'Idéal pour les tâches récurrentes importantes'}
                  {formData.recurrenceType === 'monthly' && 'Excellent pour les projets de moyenne envergure'}
                  {formData.recurrenceType === 'yearly' && 'Parfait pour les bilans et projets annuels majeurs'}
                </div>
              </div>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={submitting || !formData.title.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {submitting ? 'Création...' : (task ? 'Modifier' : 'Créer la tâche')}
              {formData.isRecurring && <Repeat className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ✅ Composants modaux simplifiés
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
        
        console.log('✅ Tâches chargées depuis Firebase:', tasksData.length);
        setTasks(tasksData);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = loadTasks();
    return () => unsubscribe();
  }, [user?.uid]);

  // Filtrage et tri
  useEffect(() => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'created':
          return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
        case 'xp':
          return (b.xpReward || 0) - (a.xpReward || 0);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterPriority, sortBy]);

  // Actions sur les tâches
  const handleCreateTask = async (taskData) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        userId: user.uid,
        createdBy: user.uid,
        assignedTo: user.uid,
        status: 'todo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
    }
  };

  const handleQuickCreate = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        description: '',
        priority: 'medium',
        complexity: 'medium',
        xpReward: 25,
        userId: user.uid,
        createdBy: user.uid,
        assignedTo: user.uid,
        status: 'todo',
        isRecurring: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNewTaskTitle('');
      setShowQuickCreate(false);
    } catch (error) {
      console.error('❌ Erreur création rapide:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('❌ Erreur suppression tâche:', error);
    }
  };

  // Statistiques
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    totalXp: tasks.reduce((sum, t) => sum + (t.xpReward || 0), 0)
  };

  // Composant TaskCard
  const TaskCard = ({ task }) => {
    const priorityColors = {
      low: 'border-green-500 text-green-400',
      medium: 'border-yellow-500 text-yellow-400',
      high: 'border-orange-500 text-orange-400',
      urgent: 'border-red-500 text-red-400'
    };

    const statusColors = {
      todo: 'bg-gray-600',
      in_progress: 'bg-blue-600',
      completed: 'bg-green-600',
      blocked: 'bg-red-600'
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-gray-400 text-sm line-clamp-2">{task.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]} text-white`}>
              {task.status === 'todo' ? 'À faire' : 
               task.status === 'in_progress' ? 'En cours' :
               task.status === 'completed' ? 'Terminée' : 'Bloquée'}
            </span>
            
            <div className="relative group">
              <button className="p-1 hover:bg-gray-700 rounded">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => {
                    setEditingTask(task);
                    setShowTaskForm(true);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowSubmissionModal(true);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Soumettre
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Supprimer cette tâche ?')) {
                      handleDeleteTask(task.id);
                    }
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 ${priorityColors[task.priority]}`}>
              <Flag className="w-3 h-3" />
              <span className="capitalize">{task.priority}</span>
            </div>
            
            {task.dueDate && (
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate.toDate?.() || task.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {task.isRecurring && (
              <div className="flex items-center gap-1 text-blue-400">
                <Repeat className="w-3 h-3" />
                <span>Récurrente</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-yellow-400">
            <Trophy className="w-3 h-3" />
            <span>{task.xpReward || 50} XP</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Composant StatCard
  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`text-${color}-400`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <PremiumLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-blue-400" />
              Gestion des Tâches
              <Zap className="w-6 h-6 text-yellow-400" />
            </h1>
            <p className="text-gray-400 mt-1">
              Système de récurrence avec XP adaptatif intégré
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQuickCreate(!showQuickCreate)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Création rapide
            </button>

            <button
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total des tâches"
            value={stats.total}
            icon={<CheckSquare className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="En cours"
            value={stats.inProgress}
            icon={<Play className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Terminées"
            value={stats.completed}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="XP disponible"
            value={stats.totalXp}
            icon={<Trophy className="w-6 h-6" />}
            color="yellow"
          />
        </div>

        {/* Création rapide */}
        {showQuickCreate && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickCreate()}
                placeholder="Titre de la nouvelle tâche..."
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleQuickCreate}
                disabled={!newTaskTitle.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher des tâches..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="blocked">Bloquées</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les priorités</option>
                <option value="urgent">Urgente</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Basse</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created">Par création</option>
                <option value="dueDate">Par échéance</option>
                <option value="priority">Par priorité</option>
                <option value="xp">Par XP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
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

      {/* Modal de soumission */}
      <SimpleModal
        isOpen={showSubmissionModal}
        onClose={() => {
          setShowSubmissionModal(false);
          setSelectedTask(null);
        }}
        title="Soumettre la tâche"
        onConfirm={() => {
          if (selectedTask) {
            handleUpdateTask(selectedTask.id, { 
              status: 'completed', 
              completedAt: serverTimestamp() 
            });
          }
          setShowSubmissionModal(false);
          setSelectedTask(null);
        }}
        confirmText="Soumettre"
      >
        <p className="text-gray-600">
          Êtes-vous sûr de vouloir soumettre la tâche "{selectedTask?.title}" comme terminée ?
        </p>
      </SimpleModal>
    </PremiumLayout>
  );
};

export default TasksPage;
