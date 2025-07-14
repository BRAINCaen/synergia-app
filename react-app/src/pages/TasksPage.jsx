// ==========================================
// 📁 react-app/src/pages/TasksPage.jsx
// TASKS PAGE COMPLÈTE AVEC TOUTES LES FONCTIONNALITÉS AVANCÉES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Clock,
  Star,
  Play,
  CheckCircle,
  Edit,
  Trash2,
  Camera,
  UserPlus,
  Trophy,
  AlertCircle,
  MoreVertical
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Store et Firebase
import { useAuthStore } from '../shared/stores/authStore.js';
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

// ✅ IMPORTS DES COMPOSANTS AVANCÉS RESTAURÉS
import TaskSubmissionModal from '../components/tasks/TaskSubmissionModal.jsx';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal.jsx';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { taskAssignmentService } from '../core/services/taskAssignmentService.js';

/**
 * ✅ TASKS PAGE AVEC TOUTES LES FONCTIONNALITÉS AVANCÉES RESTAURÉES
 */
const TasksPage = () => {
  const { user } = useAuthStore();
  
  // États Firebase
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États de filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // États des modals avancées
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  
  // Modal de création simple
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // ✅ CHARGEMENT FIREBASE DIRECT
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 Chargement tâches Firebase pour:', user.uid);
    setLoading(true);

    // Query multiple pour toutes les tâches utilisateur
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

    // Écoute principale
    const unsubscribeUserTasks = onSnapshot(userTasksQuery, (snapshot) => {
      const userTasks = [];
      snapshot.forEach((doc) => {
        userTasks.push({ id: doc.id, ...doc.data() });
      });

      // Écoute des tâches créées
      const unsubscribeCreatedTasks = onSnapshot(createdTasksQuery, (createdSnapshot) => {
        const createdTasks = [];
        createdSnapshot.forEach((doc) => {
          const taskData = { id: doc.id, ...doc.data() };
          if (!userTasks.find(t => t.id === taskData.id)) {
            createdTasks.push(taskData);
          }
        });

        const allTasks = [...userTasks, ...createdTasks];
        console.log('✅ Tâches Firebase chargées:', allTasks.length);
        setTasks(allTasks);
        setLoading(false);
      });

      return () => unsubscribeCreatedTasks();
    }, (error) => {
      console.error('❌ Erreur Firebase:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribeUserTasks();
  }, [user?.uid]);

  // ✅ CRÉATION TÂCHE SIMPLE
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        description: newTaskDescription,
        userId: user.uid,
        createdBy: user.uid,
        status: 'todo',
        priority: 'medium',
        complexity: 'medium',
        xpReward: 25,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowCreateModal(false);
      console.log('✅ Tâche créée');
    } catch (error) {
      console.error('❌ Erreur création:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // ✅ CHANGEMENT STATUT
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Statut mis à jour');
    } catch (error) {
      console.error('❌ Erreur statut:', error);
    }
  };

  // ✅ SUPPRESSION
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
        console.log('✅ Tâche supprimée');
      } catch (error) {
        console.error('❌ Erreur suppression:', error);
      }
    }
  };

  // 📸 FONCTIONNALITÉ AVANCÉE : SOUMISSION AVEC MÉDIAS
  const handleSubmitForValidation = (task) => {
    console.log('📸 Ouverture modal soumission pour:', task.title);
    setSelectedTask(task);
    setShowSubmissionModal(true);
  };

  const handleTaskSubmission = async (submissionData) => {
    try {
      console.log('📝 Soumission avec médias:', submissionData);
      
      // ✅ SERVICE AVANCÉ DE VALIDATION AVEC UPLOAD
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
        // Mise à jour Firebase
        const taskRef = doc(db, 'tasks', selectedTask.id);
        await updateDoc(taskRef, {
          status: 'validation_pending',
          submittedAt: serverTimestamp(),
          validationRequestId: result.validationId,
          hasSubmittedMedia: !!(submissionData.photoFile || submissionData.videoFile)
        });
        
        alert('✅ Tâche soumise avec médias !');
        
        if (result.corsWarning) {
          alert('⚠️ Upload partiel - Validation soumise');
        }
      }
      
      setShowSubmissionModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('❌ Erreur soumission:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  // 👥 FONCTIONNALITÉ AVANCÉE : ASSIGNATION D'ÉQUIPE
  const handleAssignTask = (task) => {
    console.log('👥 Ouverture modal assignation pour:', task.title);
    setSelectedTask(task);
    setShowAssignmentModal(true);
  };

  const handleTaskAssignment = async (assignmentData) => {
    try {
      console.log('👥 Assignation équipe avec répartition XP:', assignmentData);
      
      // ✅ SERVICE AVANCÉ D'ASSIGNATION MULTIPLE
      const result = await taskAssignmentService.assignTaskToMembers(
        selectedTask.id,
        assignmentData.assignedUserIds || [],
        user.uid
      );
      
      if (result.success) {
        // Mise à jour Firebase avec données complètes
        const taskRef = doc(db, 'tasks', selectedTask.id);
        await updateDoc(taskRef, {
          assignedTo: assignmentData.assignedUserIds || [],
          isMultipleAssignment: (assignmentData.assignedUserIds || []).length > 1,
          assignmentCount: (assignmentData.assignedUserIds || []).length,
          assignments: result.assignments,
          status: 'assigned',
          assignedAt: serverTimestamp(),
          assignedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        
        // Répartition XP si multiple
        if (assignmentData.contributionPercentages && assignmentData.assignedUserIds?.length > 1) {
          await taskAssignmentService.updateContributionPercentages(
            selectedTask.id, 
            assignmentData.contributionPercentages
          );
        }
        
        alert(`✅ Tâche assignée à ${result.assignedCount || 1} personne(s) !`);
        setShowAssignmentModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('❌ Erreur assignation:', error);
      alert('❌ Erreur: ' + error.message);
    }
  };

  // Statistiques calculées
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress' || t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'todo').length,
    validationPending: tasks.filter(t => t.status === 'validation_pending').length
  };

  // Filtrage
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Badge de statut
  const getStatusBadge = (status) => {
    const configs = {
      'todo': { color: 'bg-gray-500/20 text-gray-300', label: 'À faire' },
      'in_progress': { color: 'bg-yellow-500/20 text-yellow-300', label: 'En cours' },
      'in-progress': { color: 'bg-yellow-500/20 text-yellow-300', label: 'En cours' },
      'completed': { color: 'bg-green-500/20 text-green-300', label: 'Terminée' },
      'validation_pending': { color: 'bg-blue-500/20 text-blue-300', label: 'En validation' },
      'assigned': { color: 'bg-purple-500/20 text-purple-300', label: 'Assignée' }
    };
    const config = configs[status] || configs['todo'];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (error) {
    return (
      <PremiumLayout>
        <div className="flex items-center justify-center min-h-96">
          <PremiumCard className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Erreur de chargement</h3>
            <p className="text-gray-400 mb-4">Impossible de charger les tâches : {error}</p>
            <PremiumButton onClick={() => window.location.reload()}>
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
        {/* Header avec indicateur Firebase */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Gestion des Tâches 🔥
            </h1>
            <p className="text-gray-400 mt-2">
              Fonctionnalités avancées : Upload médias, Assignation équipe, Validation admin
            </p>
            {tasks.length > 0 && (
              <p className="text-blue-400 text-sm mt-1">
                ✅ {tasks.length} tâche(s) Firebase • {stats.validationPending} en validation
              </p>
            )}
          </div>
        </div>

        {/* Statistiques complètes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            label="Total" 
            value={stats.total} 
            icon={CheckSquare} 
            iconColor="text-blue-400" 
          />
          <StatCard 
            label="Complétées" 
            value={stats.completed} 
            icon={CheckCircle} 
            iconColor="text-green-400" 
          />
          <StatCard 
            label="En cours" 
            value={stats.inProgress} 
            icon={Clock} 
            iconColor="text-yellow-400" 
          />
          <StatCard 
            label="À faire" 
            value={stats.pending} 
            icon={Star} 
            iconColor="text-purple-400" 
          />
          <StatCard 
            label="En validation" 
            value={stats.validationPending} 
            icon={Camera} 
            iconColor="text-pink-400" 
          />
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
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
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
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle tâche
          </PremiumButton>
        </div>

        {/* Liste des tâches avec fonctionnalités avancées */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PremiumCard key={i} className="animate-pulse">
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
                      {task.description && (
                        <p className="text-gray-400 text-sm">
                          {task.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <MoreVertical className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                    </div>
                  </div>

                  {/* Statut et métadonnées */}
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(task.status)}
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">+{task.xpReward || 25} XP</span>
                    </div>
                  </div>

                  {/* Informations d'assignation */}
                  {task.isMultipleAssignment && task.assignedTo && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300">
                          {task.assignedTo.length} membres assignés
                        </span>
                      </div>
                      {task.assignments && (
                        <div className="bg-purple-500/10 rounded-lg p-2">
                          <div className="flex justify-between text-xs text-purple-300 mb-1">
                            <span>Progression équipe</span>
                            <span>{task.assignments.filter(a => a.hasSubmitted).length}/{task.assignments.length}</span>
                          </div>
                          <div className="w-full bg-purple-800/30 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(task.assignments.filter(a => a.hasSubmitted).length / task.assignments.length) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Indicateur de médias soumis */}
                  {task.hasSubmittedMedia && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm bg-blue-500/10 rounded-lg p-2">
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-300">Médias soumis pour validation</span>
                      </div>
                    </div>
                  )}

                  {/* Actions AVANCÉES COMPLÈTES */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
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
                ? 'Aucune tâche ne correspond à vos critères.'
                : 'Commencez par créer votre première tâche avec fonctionnalités avancées.'}
            </p>
            <PremiumButton
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer ma première tâche
            </PremiumButton>
          </PremiumCard>
        )}
      </div>

      {/* Modal de création simple */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Nouvelle tâche</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Créer vidéo de validation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Prendre une vidéo pour prouver la réalisation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODALS AVANCÉES FONCTIONNELLES */}
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
