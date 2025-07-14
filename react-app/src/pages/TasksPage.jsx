// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS ORIGINALES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  Tag,
  Flag,
  Bell,
  MessageSquare
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { gamificationService } from '../core/services/gamificationService.js';

// 🔧 STORE TEMPORAIRE SANS PERSIST (pour éviter l'erreur)
const useTemporaryTaskStore = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Charger les tâches utilisateur
  const loadUserTasks = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulation avec données réalistes
      const mockTasks = [
        {
          id: '1',
          title: 'Configurer Firebase',
          description: 'Mettre en place la base de données et l\'authentification',
          status: 'completed',
          priority: 'high',
          difficulty: 'expert',
          xpReward: 100,
          estimatedTime: 240,
          tags: ['firebase', 'backend'],
          assignedTo: [userId],
          createdBy: userId,
          createdAt: new Date('2024-01-15').toISOString(),
          completedAt: new Date('2024-01-16').toISOString(),
          dueDate: new Date('2024-01-20').toISOString(),
          projectId: 'proj-1'
        },
        {
          id: '2',
          title: 'Créer composants UI',
          description: 'Développer les composants de base pour l\'interface utilisateur',
          status: 'in_progress',
          priority: 'medium',
          difficulty: 'intermediate',
          xpReward: 75,
          estimatedTime: 180,
          actualTime: 90,
          tags: ['ui', 'react', 'components'],
          assignedTo: [userId],
          createdBy: userId,
          createdAt: new Date('2024-01-17').toISOString(),
          dueDate: new Date('2024-01-25').toISOString(),
          projectId: 'proj-1'
        },
        {
          id: '3',
          title: 'Tests unitaires',
          description: 'Écrire les tests pour valider les fonctionnalités critiques',
          status: 'pending',
          priority: 'medium',
          difficulty: 'intermediate',
          xpReward: 60,
          estimatedTime: 120,
          tags: ['tests', 'jest', 'quality'],
          assignedTo: [userId],
          createdBy: userId,
          createdAt: new Date('2024-01-18').toISOString(),
          dueDate: new Date('2024-01-30').toISOString(),
          projectId: 'proj-1'
        },
        {
          id: '4',
          title: 'Documentation API',
          description: 'Documenter toutes les endpoints de l\'API',
          status: 'pending',
          priority: 'low',
          difficulty: 'beginner',
          xpReward: 30,
          estimatedTime: 60,
          tags: ['documentation', 'api'],
          assignedTo: [userId],
          createdBy: userId,
          createdAt: new Date('2024-01-19').toISOString(),
          dueDate: new Date('2024-02-05').toISOString(),
          projectId: 'proj-2'
        }
      ];
      
      setTimeout(() => {
        setTasks(mockTasks);
        setLoading(false);
        console.log('✅ Tâches chargées:', mockTasks.length);
      }, 1000);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('❌ Erreur chargement tâches:', err);
    }
  }, []);
  
  // Créer une nouvelle tâche
  const createTask = useCallback(async (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedTo: [taskData.userId],
      tags: taskData.tags || [],
      xpReward: calculateXpReward(taskData.difficulty, taskData.priority),
      estimatedTime: taskData.estimatedTime || 60
    };
    
    setTasks(prev => [newTask, ...prev]);
    console.log('✅ Tâche créée:', newTask.title);
    
    // Notification gamification
    try {
      await gamificationService.awardXP(taskData.userId, 5, 'Création de tâche');
    } catch (error) {
      console.log('ℹ️ Gamification non disponible');
    }
    
    return newTask;
  }, []);
  
  // Mettre à jour une tâche
  const updateTask = useCallback(async (taskId, updates) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
        
        // Si la tâche est complétée, ajouter XP
        if (updates.status === 'completed' && task.status !== 'completed') {
          updatedTask.completedAt = new Date().toISOString();
          
          // Récompense XP
          try {
            gamificationService.awardXP(task.assignedTo[0], task.xpReward, `Tâche complétée: ${task.title}`);
          } catch (error) {
            console.log('ℹ️ Gamification non disponible');
          }
        }
        
        return updatedTask;
      }
      return task;
    }));
    
    console.log('✅ Tâche mise à jour:', taskId);
  }, []);
  
  // Supprimer une tâche
  const deleteTask = useCallback(async (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    console.log('✅ Tâche supprimée:', taskId);
  }, []);
  
  // Calculer XP en fonction de la difficulté et priorité
  const calculateXpReward = (difficulty, priority) => {
    const difficultyMultiplier = {
      'beginner': 1,
      'intermediate': 1.5,
      'advanced': 2,
      'expert': 3
    };
    
    const priorityMultiplier = {
      'low': 1,
      'medium': 1.2,
      'high': 1.5
    };
    
    const baseXP = 30;
    return Math.round(baseXP * (difficultyMultiplier[difficulty] || 1) * (priorityMultiplier[priority] || 1));
  };
  
  return {
    tasks,
    loading,
    error,
    loadUserTasks,
    createTask,
    updateTask,
    deleteTask
  };
};

// Composants modals avancés
const TaskSubmissionModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [proofType, setProofType] = useState('description');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    onSubmit({
      taskId: task.id,
      comment,
      files: selectedFiles,
      proofType,
      submittedAt: new Date().toISOString()
    });
    setComment('');
    setSelectedFiles([]);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">Soumettre la tâche</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-white">{task?.title}</h4>
            <p className="text-gray-400">{task?.description}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type de preuve
            </label>
            <select
              value={proofType}
              onChange={(e) => setProofType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="description">Description détaillée</option>
              <option value="screenshot">Capture d'écran</option>
              <option value="video">Vidéo démonstration</option>
              <option value="file">Fichier de livrable</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commentaire de validation
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Décrivez ce que vous avez accompli..."
              required
            />
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-400">
              Récompense: {task?.xpReward} XP
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!comment.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg"
              >
                Soumettre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskForm = ({ isOpen, onClose, task, onSave }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    difficulty: task?.difficulty || 'intermediate',
    estimatedTime: task?.estimatedTime || 60,
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    tags: task?.tags?.join(', ') || '',
    projectId: task?.projectId || ''
  });
  
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        estimatedTime: parseInt(formData.estimatedTime),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      });
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre de la tâche *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Ex: Implémenter l'authentification..."
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Décrivez la tâche en détail..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulté
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="beginner">Débutant (30 XP)</option>
                <option value="intermediate">Intermédiaire (45 XP)</option>
                <option value="advanced">Avancé (60 XP)</option>
                <option value="expert">Expert (90 XP)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Temps estimé (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                min="15"
                step="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (séparés par des virgules)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Ex: react, firebase, ui..."
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {task ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 📋 TASKS PAGE COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  const { tasks, loading, createTask, updateTask, deleteTask, loadUserTasks } = useTemporaryTaskStore();
  
  // États UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  
  // États des modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // États pour les statistiques
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0,
    totalXP: 0,
    avgTime: 0
  });

  // Charger les tâches
  useEffect(() => {
    if (user?.uid) {
      loadUserTasks(user.uid);
    }
  }, [user?.uid, loadUserTasks]);

  // Calcul des statistiques avancées
  useEffect(() => {
    if (tasks?.length) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const totalXP = tasks.reduce((sum, task) => sum + (task.xpReward || 0), 0);
      const avgTime = tasks.filter(t => t.estimatedTime).reduce((sum, task) => sum + task.estimatedTime, 0) / tasks.filter(t => t.estimatedTime).length || 0;
      
      setTaskStats({
        total,
        completed,
        inProgress,
        pending,
        completionRate,
        totalXP,
        avgTime: Math.round(avgTime)
      });
    }
  }, [tasks]);

  // Filtrage et tri avancés
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesDifficulty = filterDifficulty === 'all' || task.difficulty === filterDifficulty;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'xp':
          return (b.xpReward || 0) - (a.xpReward || 0);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  // Handlers pour les actions
  const handleCreateTask = async (taskData) => {
    try {
      await createTask({
        ...taskData,
        userId: user.uid,
        createdBy: user.uid
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('❌ Erreur suppression tâche:', error);
      }
    }
  };

  const handleTaskSubmission = async (submissionData) => {
    try {
      await taskValidationService.submitTaskForValidation(submissionData);
      await updateTask(submissionData.taskId, { 
        status: 'submitted',
        submittedAt: submissionData.submittedAt,
        submissionComment: submissionData.comment
      });
      
      setShowSubmissionModal(false);
      setSelectedTask(null);
      console.log('✅ Tâche soumise pour validation');
    } catch (error) {
      console.error('❌ Erreur soumission tâche:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'submitted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Statistiques pour le header
  const headerStats = [
    { label: "Total", value: taskStats.total, icon: CheckSquare, color: "text-blue-400" },
    { label: "Terminées", value: taskStats.completed, icon: CheckCircle, color: "text-green-400" },
    { label: "En cours", value: taskStats.inProgress, icon: Clock, color: "text-yellow-400" },
    { label: "XP Total", value: taskStats.totalXP, icon: Star, color: "text-purple-400" }
  ];

  // Actions du header
  const headerActions = (
    <>
      <PremiumButton variant="secondary" icon={Filter}>
        Vue {filteredAndSortedTasks.length}/{tasks.length}
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        icon={Plus}
        onClick={() => setShowTaskForm(true)}
      >
        Nouvelle tâche
      </PremiumButton>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Chargement des tâches...</h2>
          <p className="text-gray-400">Récupération de vos données</p>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout
      title="Gestion des Tâches"
      subtitle={`${tasks.length} tâches • ${taskStats.completionRate}% complétées • ${taskStats.totalXP} XP total`}
      icon={CheckSquare}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🔍 FILTRES ET RECHERCHE AVANCÉS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        <div className="lg:col-span-2">
          <PremiumSearchBar
            placeholder="Rechercher par titre, description ou tag..."
            value={searchTerm}
            onChange={setSearchTerm}
            icon={Search}
          />
        </div>
        
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="submitted">Soumises</option>
            <option value="completed">Terminées</option>
          </select>
        </div>
        
        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
        
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created">Plus récentes</option>
            <option value="priority">Par priorité</option>
            <option value="dueDate">Par échéance</option>
            <option value="xp">Par XP</option>
          </select>
        </div>
      </div>

      {/* 📋 LISTE DES TÂCHES AVANCÉE */}
      {filteredAndSortedTasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PremiumCard className="hover:shadow-xl group">
                {/* Header de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </h3>
                      <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    )}
                    
                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(task.status)}`}>
                      {task.status === 'completed' ? 'Terminée' :
                       task.status === 'in_progress' ? 'En cours' :
                       task.status === 'submitted' ? 'Soumise' : 'En attente'}
                    </span>
                    
                    <button className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-700/30 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-purple-400">
                      <Star className="w-4 h-4" />
                      <span className="font-semibold">{task.xpReward}</span>
                    </div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-blue-400">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{task.estimatedTime}m</span>
                    </div>
                    <div className="text-xs text-gray-400">Estimé</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-yellow-400">
                      <Target className="w-4 h-4" />
                      <span className="font-semibold text-xs">{task.difficulty}</span>
                    </div>
                    <div className="text-xs text-gray-400">Niveau</div>
                  </div>
                </div>

                {/* Date d'échéance */}
                {task.dueDate && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">
                        Échéance: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => updateTask(task.id, { status: 'in_progress' })}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10"
                        title="Commencer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    {(task.status === 'in_progress' || task.status === 'pending') && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowSubmissionModal(true);
                        }}
                        className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-500/10"
                        title="Soumettre"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowTaskForm(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-500/10"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <PremiumCard className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'Aucune tâche trouvée' : 'Commencez votre productivité !'}
          </h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Modifiez vos filtres pour voir plus de tâches'
              : 'Créez votre première tâche et commencez à gagner de l\'XP !'}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || filterStatus !== 'all') && (
              <PremiumButton 
                variant="secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterPriority('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
            <PremiumButton 
              variant="primary" 
              icon={Plus}
              onClick={() => setShowTaskForm(true)}
            >
              Créer ma première tâche
            </PremiumButton>
          </div>
        </PremiumCard>
      )}

      {/* 📝 MODALS AVANCÉES */}
      
      {/* Modal de création/édition */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={editingTask ? 
          (data) => handleUpdateTask(editingTask.id, data) : 
          handleCreateTask
        }
      />

      {/* Modal de soumission */}
      <TaskSubmissionModal
        isOpen={showSubmissionModal}
        task={selectedTask}
        onClose={() => {
          setShowSubmissionModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleTaskSubmission}
      />
    </PremiumLayout>
  );
};

export default TasksPage;
