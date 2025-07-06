// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN POUR VALIDER LES VRAIES TÂCHES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Camera,
  Trophy,
  User,
  Calendar,
  AlertTriangle,
  FileImage,
  Send,
  X,
  Search,
  Filter,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Zap,
  Target,
  Users
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { taskService } from '../core/services/taskService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ PAGE ADMIN VALIDATION DES VRAIES TÂCHES FIREBASE
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [pendingTasks, setPendingTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [selectedTask, setSelectedTask] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [validating, setValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('validation_pending');

  // Charger les données au montage
  useEffect(() => {
    loadRealValidationData();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadRealValidationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRealValidationData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement des vraies tâches Firebase...');
      
      // Récupérer toutes les tâches
      const tasksRef = collection(db, 'tasks');
      const tasksSnapshot = await getDocs(query(tasksRef, orderBy('createdAt', 'desc')));
      
      const allTasksData = [];
      tasksSnapshot.forEach(doc => {
        const data = doc.data();
        allTasksData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          submittedAt: data.submittedAt?.toDate() || null,
          completedAt: data.completedAt?.toDate() || null,
          validatedAt: data.validatedAt?.toDate() || null
        });
      });

      // Filtrer les tâches en attente de validation
      const pending = allTasksData.filter(task => task.status === 'validation_pending');
      
      // Calculer les statistiques
      const taskStats = {
        pending: allTasksData.filter(t => t.status === 'validation_pending').length,
        approved: allTasksData.filter(t => t.status === 'completed').length,
        rejected: allTasksData.filter(t => t.status === 'rejected').length,
        total: allTasksData.length
      };

      setAllTasks(allTasksData);
      setPendingTasks(pending);
      setStats(taskStats);
      
      console.log('✅ Vraies données chargées:', {
        totalTasks: allTasksData.length,
        pendingValidation: pending.length,
        stats: taskStats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement vraies données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal de validation
  const openValidationModal = (task) => {
    setSelectedTask(task);
    setAdminComment('');
    setShowValidationModal(true);
  };

  // Valider une tâche VRAIE
  const handleValidation = async (approved) => {
    if (!selectedTask) return;
    
    setValidating(true);
    try {
      console.log(`🔍 ${approved ? 'Validation' : 'Rejet'} de la tâche:`, selectedTask.title);
      
      // Utiliser le vrai service de validation
      await taskService.validateTask(
        selectedTask.id,
        user.uid,
        approved,
        adminComment || (approved ? 'Tâche approuvée par admin' : 'Tâche rejetée par admin')
      );
      
      // Recharger les données
      await loadRealValidationData();
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedTask(null);
      setAdminComment('');
      
      // Notification de succès
      alert(`✅ Tâche ${approved ? 'validée' : 'rejetée'} avec succès !${approved ? ' L\'utilisateur recevra ses XP.' : ''}`);
      
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      alert('❌ Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  // Obtenir les détails utilisateur
  const getUserDisplayName = (task) => {
    if (task.userDisplayName) return task.userDisplayName;
    if (task.assignedTo && task.assignedTo !== task.userId) return task.assignedTo;
    return task.userId || 'Utilisateur inconnu';
  };

  const formatDate = (date) => {
    if (!date) return 'Non défini';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      hard: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      validation_pending: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Date inconnue';
    const now = new Date();
    const diff = now - (date instanceof Date ? date : new Date(date));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours}h`;
    return 'À l\'instant';
  };

  // Filtrer les tâches selon le statut sélectionné
  const getFilteredTasks = () => {
    let tasksToFilter = allTasks;
    
    // Filtrer par statut
    if (filterStatus !== 'all') {
      tasksToFilter = tasksToFilter.filter(task => task.status === filterStatus);
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      tasksToFilter = tasksToFilter.filter(task =>
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUserDisplayName(task).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return tasksToFilter;
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Chargement des vraies données Firebase...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Validation des Tâches</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">🛡️ Validation des Tâches</h1>
                <p className="text-gray-600">Examinez et validez les vraies soumissions Firebase</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadRealValidationData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistiques VRAIES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En attente de validation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                <p className="text-xs text-gray-500">Tâches soumises</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Validées</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-gray-500">XP attribués</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejetées</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-gray-500">À retravailler</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total tâches</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-xs text-gray-500">Dans le système</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher une tâche ou un utilisateur..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="validation_pending">En attente de validation</option>
                  <option value="completed">Validées</option>
                  <option value="rejected">Rejetées</option>
                  <option value="all">Toutes les tâches</option>
                </select>
              </div>
              
              <span className="text-sm text-gray-600">
                {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} trouvée{filteredTasks.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Liste des VRAIES tâches */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              📋 Tâches Firebase ({filteredTasks.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title || 'Tâche sans titre'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status === 'validation_pending' ? 'En validation' : 
                           task.status === 'completed' ? 'Validée' :
                           task.status === 'rejected' ? 'Rejetée' : task.status}
                        </span>
                        {task.difficulty && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description || 'Pas de description'}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{getUserDisplayName(task)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{task.submittedAt ? getTimeAgo(task.submittedAt) : getTimeAgo(task.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>{task.projectId || 'Pas de projet'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium text-orange-600">+{task.xpReward || 50} XP</span>
                        </div>
                      </div>
                      
                      {task.submissionComment && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-blue-800">Commentaire utilisateur : </span>
                              <span className="text-blue-700">{task.submissionComment}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {task.adminComment && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-800">Commentaire admin : </span>
                              <span className="text-gray-700">{task.adminComment}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 ml-6">
                      {task.hasPhoto && (
                        <div className="p-2 bg-blue-100 rounded-lg" title="Photo fournie">
                          <Camera className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      
                      {task.status === 'validation_pending' && (
                        <button
                          onClick={() => openValidationModal(task)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Examiner
                        </button>
                      )}

                      {(task.status === 'completed' || task.status === 'rejected') && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                          {task.status === 'completed' ? '✅ Validée' : '❌ Rejetée'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">
                  {filterStatus === 'validation_pending' ? 
                    'Aucune tâche en attente de validation' :
                    'Aucune tâche trouvée'
                  }
                </p>
                <p className="text-sm mt-1">
                  {searchTerm ? 
                    'Essayez de modifier votre recherche' :
                    filterStatus === 'validation_pending' ?
                    'Les utilisateurs peuvent soumettre leurs tâches terminées pour validation' :
                    'Utilisez les filtres pour voir d\'autres tâches'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal de validation détaillée */}
      <AnimatePresence>
        {showValidationModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowValidationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">✅ Validation de tâche</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.title}</p>
                </div>
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-6">
                {/* Informations de la tâche */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">📋 Détails de la tâche Firebase</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID Tâche :</span>
                      <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">{selectedTask.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Utilisateur :</span>
                      <span className="ml-2 font-medium">{getUserDisplayName(selectedTask)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulté :</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedTask.difficulty)}`}>
                        {selectedTask.difficulty || 'normal'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Récompense XP :</span>
                      <span className="ml-2 font-medium text-orange-600">+{selectedTask.xpReward || 50} XP</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Soumise le :</span>
                      <span className="ml-2 font-medium">{formatDate(selectedTask.submittedAt || selectedTask.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📝 Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedTask.description || 'Aucune description fournie'}
                  </p>
                </div>

                {/* Commentaire de soumission */}
                {selectedTask.submissionComment && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">💬 Commentaire de l'utilisateur</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{selectedTask.submissionComment}</p>
                    </div>
                  </div>
                )}

                {/* Commentaire admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🛡️ Votre commentaire administrateur (optionnel)
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Ajoutez un commentaire pour l'utilisateur..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowValidationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  onClick={() => handleValidation(false)}
                  disabled={validating}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{validating ? 'Rejet...' : 'Rejeter'}</span>
                </button>
                
                <button
                  onClick={() => handleValidation(true)}
                  disabled={validating}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{validating ? 'Validation...' : 'Valider & Attribuer XP'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTaskValidationPage;
