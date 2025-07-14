// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE FINALE - CORRECTION COMPLÈTE DES IMPORTS
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
  Zap
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';

// ✅ FIREBASE DIRECT - PLUS DE USETASKSTORE DEMO !
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// ✅ IMPORTS DIRECTS DES SERVICES (plus de try/catch qui échoue)
import { taskValidationService } from '../core/services/taskValidationService.js';
import { taskAssignmentService } from '../core/services/taskAssignmentService.js';

// ✅ IMPORTS DIRECTS DES COMPOSANTS (sans fallback qui masque les erreurs)
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal.jsx';

// Import conditionnel UNIQUEMENT pour TaskForm (qui pourrait ne pas exister)
let TaskForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Formulaire de tâche</h2>
        <p className="text-gray-600 mb-4">
          Le composant TaskForm n'est pas disponible. Vous pouvez créer des tâches via l'interface Firebase Console.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              // Créer une tâche basique
              const basicTask = {
                title: 'Nouvelle tâche',
                description: 'Description de la tâche',
                priority: 'medium',
                complexity: 'medium',
                xpReward: 25,
                tags: ['manuel']
              };
              onSubmit(basicTask);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Créer tâche basique
          </button>
        </div>
      </div>
    </div>
  );
};

// Essayer de charger le vrai TaskForm
try {
  const TaskFormModule = require('../components/forms/TaskForm.jsx');
  TaskForm = TaskFormModule.default || TaskFormModule.TaskForm || TaskForm;
} catch (error) {
  console.warn('TaskForm non disponible, utilisation du fallback:', error.message);
}

/**
 * ✅ TASKS PAGE 100% FIREBASE AVEC VRAIES FONCTIONNALITÉS
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // ✅ ÉTATS FIREBASE RÉELS (plus de useTaskStore qui utilise des données démo)
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // États pour les statistiques CALCULÉES depuis Firebase
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  });

  // ✅ ÉCOUTE FIREBASE TEMPS RÉEL - VRAIES DONNÉES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 TasksPage - Chargement VRAIES tâches Firebase pour:', user.uid);
    setLoading(true);

    // Query multiple pour capturer TOUTES les tâches de l'utilisateur
    const userTasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const createdTasksQuery = query(
      collection(db, 'tasks'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    // Écoute principale des tâches utilisateur
    const unsubscribeUserTasks = onSnapshot(userTasksQuery, (querySnapshot) => {
      const userTasks = [];
      querySnapshot.forEach((doc) => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });

      console.log('✅ TasksPage - Tâches utilisateur chargées:', userTasks.length);
      
      // Écoute des tâches créées
      const unsubscribeCreatedTasks = onSnapshot(createdTasksQuery, (createdSnapshot) => {
        const createdTasks = [];
        createdSnapshot.forEach((doc) => {
          const taskData = { id: doc.id, ...doc.data() };
          // Éviter les doublons
          if (!userTasks.find(t => t.id === taskData.id)) {
            createdTasks.push(taskData);
          }
        });

        console.log('✅ TasksPage - Tâches créées chargées:', createdTasks.length);
        
        // Combiner toutes les tâches
        const allTasks = [...userTasks, ...createdTasks];
        setTasks(allTasks);
        setLoading(false);
      }, (error) => {
        console.error('❌ Erreur chargement tâches créées:', error);
      });

      return () => unsubscribeCreatedTasks();
    }, (error) => {
      console.error('❌ Erreur chargement tâches utilisateur:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => {
      unsubscribeUserTasks();
    };
  }, [user?.uid]);

  // ✅ CALCUL DES STATISTIQUES DEPUIS VRAIES DONNÉES
  useEffect(() => {
    if (tasks?.length) {
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length;
      const pending = tasks.filter(t => t.status === 'todo' || t.status === 'pending').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setTaskStats({
        total,
        completed,
        inProgress,
        pending,
        completionRate
      });

      console.log('📊 TasksPage - Stats calculées depuis Firebase:', { total, completed, inProgress, pending, completionRate });
    }
  }, [tasks]);

  // ✅ FILTRAGE DES TÂCHES RÉELLES
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // 🎯 HANDLERS FIREBASE POUR LES ACTIONS DE TÂCHES

  const handleCreateTask = async (taskData) => {
    try {
      console.log('➕ Création nouvelle tâche Firebase:', taskData);
      
      const newTask = {
        ...taskData,
        userId: user.uid,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: taskData.status || 'todo'
      };

      await addDoc(collection(db, 'tasks'), newTask);
      console.log('✅ Tâche créée avec succès');
      setShowTaskForm(false);
    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      alert('Erreur lors de la création : ' + error.message);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      console.log('🔄 Mise à jour tâche Firebase:', taskId, updates);
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Tâche mise à jour avec succès');
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('❌ Erreur mise à jour tâche:', error);
      alert('Erreur lors de la mise à jour : ' + error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        console.log('🗑️ Suppression tâche Firebase:', taskId);
        
        const taskRef = doc(db, 'tasks', taskId);
        await deleteDoc(taskRef);
        
        console.log('✅ Tâche supprimée avec succès');
      } catch (error) {
        console.error('❌ Erreur suppression tâche:', error);
        alert('Erreur lors de la suppression : ' + error.message);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      console.log('🔄 Changement statut tâche:', taskId, newStatus);
      
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Statut mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      alert('Erreur lors du changement de statut : ' + error.message);
    }
  };

  // ✅ FONCTIONNALITÉS AVANCÉES AVEC COMPOSANTS RÉELS

  const handleSubmitForValidation = (task) => {
    console.log('📸 Ouverture modal soumission pour:', task.title);
    setSelectedTask(task);
    setShowSubmissionModal(true);
  };

  const handleTaskSubmission = async (submissionData) => {
    try {
      console.log('📝 Soumission tâche pour validation avec médias:', submissionData);
      
      // ✅ UTILISER LE SERVICE AVANCÉ DE VALIDATION
      const result = await taskValidationService.submitTaskForValidation({
        taskId: selectedTask.id,
        userId: user.uid,
        taskTitle: selectedTask.title,
        projectId: selectedTask.projectId,
        difficulty: selectedTask.complexity || 'normal',
        comment: submissionData.comment,
        photoFile: submissionData.photoFile,
        videoFile: submissionData.videoFile,
        xpAmount: selectedTask.xpReward
      });
      
      if (result.success) {
        // Mettre à jour le statut de la tâche
        const taskRef = doc(db, 'tasks', selectedTask.id);
        await updateDoc(taskRef, {
          status: 'validation_pending',
          submittedAt: serverTimestamp(),
          validationRequestId: result.validationId
        });
        
        alert('✅ Tâche soumise pour validation avec succès !');
        
        // Afficher warning si problème CORS
        if (result.corsWarning) {
          alert('⚠️ Les médias n\'ont pas pu être uploadés, mais la validation a été soumise.');
        }
      }
      
      setShowSubmissionModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      alert('❌ Erreur lors de la soumission : ' + error.message);
    }
  };

  const handleAssignTask = (task) => {
    console.log('👥 Ouverture modal assignation pour:', task.title);
    setSelectedTask(task);
    setShowAssignmentModal(true);
  };

  const handleTaskAssignment = async (assignmentData) => {
    try {
      console.log('👥 Assignation tâche avec répartition XP:', assignmentData);
      
      // ✅ UTILISER LE SERVICE AVANCÉ D'ASSIGNATION
      const result = await taskAssignmentService.assignTaskToMembers(
        selectedTask.id,
        assignmentData.assignedUserIds || [],
        user.uid
      );
      
      if (result.success) {
        // Mettre à jour la tâche avec les données d'assignation complètes
        const taskRef = doc(db, 'tasks', selectedTask.id);
        await updateDoc(taskRef, {
          assignedTo: assignmentData.assignedUserIds || [],
          isMultipleAssignment: (assignmentData.assignedUserIds || []).length > 1,
          assignmentCount: (assignmentData.assignedUserIds || []).length,
          assignments: result.assignments, // Données détaillées d'assignation
          status: 'assigned',
          assignedAt: serverTimestamp(),
          assignedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        
        // Gérer la répartition des XP si assignation multiple
        if (assignmentData.contributionPercentages && assignmentData.assignedUserIds?.length > 1) {
          await taskAssignmentService.updateContributionPercentages(
            selectedTask.id, 
            assignmentData.contributionPercentages
          );
        }
        
        alert(`✅ Tâche assignée à ${result.assignedCount || 1} personne(s) avec répartition XP !`);
        setShowAssignmentModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      alert('❌ Erreur lors de l\'assignation : ' + error.message);
    }
  };

  // ✅ STATISTIQUES POUR LE HEADER CALCULÉES DEPUIS FIREBASE
  const headerStats = [
    {
      label: "Total tâches",
      value: taskStats.total,
      icon: CheckSquare,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Complétées",
      value: taskStats.completed,
      icon: CheckCircle,
      color: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      label: "En cours",
      value: taskStats.inProgress,
      icon: Clock,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    },
    {
      label: "Taux de complétion",
      value: `${taskStats.completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    }
  ];

  // Badge de statut avec couleurs
  const getStatusBadge = (status) => {
    const statusConfig = {
      'todo': { color: 'bg-gray-500/20 text-gray-300', label: 'À faire' },
      'pending': { color: 'bg-gray-500/20 text-gray-300', label: 'En attente' },
      'in_progress': { color: 'bg-yellow-500/20 text-yellow-300', label: 'En cours' },
      'in-progress': { color: 'bg-yellow-500/20 text-yellow-300', label: 'En cours' },
      'completed': { color: 'bg-green-500/20 text-green-300', label: 'Terminée' },
      'validation_pending': { color: 'bg-blue-500/20 text-blue-300', label: 'En validation' },
      'assigned': { color: 'bg-purple-500/20 text-purple-300', label: 'Assignée' }
    };

    const config = statusConfig[status] || statusConfig['todo'];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Badge de priorité
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'low': { color: 'bg-green-500/20 text-green-300', label: 'Faible', icon: '🟢' },
      'medium': { color: 'bg-yellow-500/20 text-yellow-300', label: 'Moyenne', icon: '🟡' },
      'high': { color: 'bg-red-500/20 text-red-300', label: 'Haute', icon: '🔴' },
      'urgent': { color: 'bg-red-600/30 text-red-200', label: 'Urgente', icon: '🚨' }
    };

    const config = priorityConfig[priority] || priorityConfig['medium'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // ✅ AFFICHAGE D'ERREUR SI PROBLÈME FIREBASE
  if (error) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center min-h-96">
          <PremiumCard className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
            <p className="text-gray-400 mb-4">
              Impossible de charger les tâches : {error}
            </p>
            <PremiumButton 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              Réessayer
            </PremiumButton>
          </PremiumCard>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="space-y-8">
        {/* Header avec statistiques RÉELLES */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Gestion des Tâches 🔥
            </h1>
            <p className="text-gray-400 mt-2">
              Gérez vos tâches et suivez votre progression avec fonctionnalités avancées
            </p>
            {tasks.length > 0 && (
              <p className="text-blue-400 text-sm mt-1">
                ✅ Données Firebase chargées - {tasks.length} tâche(s) trouvée(s)
              </p>
            )}
          </div>
        </div>

        {/* Statistiques CALCULÉES DEPUIS FIREBASE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {headerStats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50"
              textColor={stat.color}
              iconColor={stat.iconColor}
            />
          ))}
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <PremiumSearchBar
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="validation_pending">En validation</option>
              <option value="assigned">Assignée</option>
            </select>
          </div>
          
          <PremiumButton
            onClick={() => setShowTaskForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle tâche
          </PremiumButton>
        </div>

        {/* Liste des tâches FIREBASE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <PremiumCard key={index} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-3 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </PremiumCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <PremiumCard className="group hover:bg-gray-800/60 transition-all duration-300">
                  {/* En-tête de la tâche */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {task.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getPriorityBadge(task.priority)}
                      
                      <div className="relative">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Statut et métadonnées */}
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(task.status)}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {task.complexity && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          <span>{task.complexity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="space-y-2 mb-4">
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          Échéance: {new Date(task.dueDate.seconds ? 
                            task.dueDate.toDate() : task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {task.assignedTo && task.assignedTo.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {task.isMultipleAssignment ? `${task.assignedTo.length} assignés` : 'Assignée'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">
                        +{task.xpReward || 50} XP
                      </span>
                    </div>
                  </div>

                  {/* Barre de progression pour tâches multiples */}
                  {task.isMultipleAssignment && task.assignments && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progression équipe</span>
                        <span>{task.assignments.filter(a => a.hasSubmitted).length}/{task.assignments.length}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(task.assignments.filter(a => a.hasSubmitted).length / task.assignments.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions avancées pour chaque tâche */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-700">
                    {task.status === 'todo' && (
                      <>
                        <PremiumButton
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Démarrer
                        </PremiumButton>
                        
                        <PremiumButton
                          size="sm"
                          onClick={() => handleAssignTask(task)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Assigner
                        </PremiumButton>
                      </>
                    )}
                    
                    {(task.status === 'in_progress' || task.status === 'in-progress') && (
                      <>
                        <PremiumButton
                          size="sm"
                          onClick={() => handleSubmitForValidation(task)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Camera className="w-4 h-4 mr-1" />
                          Soumettre
                        </PremiumButton>
                        
                        <PremiumButton
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Terminer
                        </PremiumButton>
                      </>
                    )}
                    
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingTask(task);
                        setShowTaskForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </PremiumButton>
                    
                    <PremiumButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 border-red-400 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* État vide */}
        {filteredTasks.length === 0 && !loading && (
          <PremiumCard className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckSquare className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucune tâche ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre première tâche.'}
            </p>
            <PremiumButton
              onClick={() => setShowTaskForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer ma première tâche
            </PremiumButton>
          </PremiumCard>
        )}
      </div>

      {/* ✅ MODALS AVEC COMPOSANTS RÉELS */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask.id, data) : 
            handleCreateTask
          }
          initialData={editingTask}
        />
      )}

      {/* Modal de soumission avec upload photo/vidéo */}
      {showSubmissionModal && selectedTask && (
        <TaskSubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedTask(null);
          }}
          onSubmit={handleTaskSubmission}
          task={selectedTask}
        />
      )}

      {/* Modal d'assignation avec répartition XP */}
      {showAssignmentModal && selectedTask && (
        <TaskAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedTask(null);
          }}
          onAssignmentSuccess={handleTaskAssignment}
          task={selectedTask}
        />
      )}
    </PremiumLayout>
  );
};

export default TasksPage;
