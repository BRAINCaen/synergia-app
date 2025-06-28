// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN POUR VALIDER LES TÂCHES EN ATTENTE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw
} from 'lucide-react';
import { taskService } from '../core/services/taskService.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ PAGE ADMIN VALIDATION DES TÂCHES
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [pendingTasks, setPendingTasks] = useState([]);
  const [validationRequests, setValidationRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // États UI
  const [selectedTask, setSelectedTask] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [validating, setValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  // Charger les données au montage
  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    try {
      const [tasks, requests, statistics] = await Promise.all([
        taskService.getTasksPendingValidation(),
        taskValidationService.getPendingValidations(),
        taskValidationService.getValidationStats()
      ]);
      
      setPendingTasks(tasks);
      setValidationRequests(requests);
      setStats(statistics);
      
      console.log('✅ Données validation chargées:', {
        pendingTasks: tasks.length,
        validationRequests: requests.length,
        stats: statistics
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement validation:', error);
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

  // Valider une tâche
  const handleValidation = async (approved) => {
    if (!selectedTask) return;
    
    setValidating(true);
    try {
      await taskService.validateTask(
        selectedTask.id,
        user.uid,
        approved,
        adminComment
      );
      
      // Recharger les données
      await loadValidationData();
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedTask(null);
      setAdminComment('');
      
      console.log(`✅ Tâche ${approved ? 'validée' : 'rejetée'}`);
      
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      alert('❌ Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Non défini';
    const d = date.toDate ? date.toDate() : new Date(date);
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
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Filtrer les tâches
  const filteredTasks = pendingTasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des validations...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Validation des Tâches
              </h1>
              <p className="text-gray-600 mt-1">
                Gérer les soumissions de tâches en attente de validation
              </p>
            </div>
            
            <button
              onClick={loadValidationData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved || 0}</p>
                <p className="text-sm text-gray-600">Validées</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</p>
                <p className="text-sm text-gray-600">Rejetées</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">En attente</option>
                <option value="all">Tous les statuts</option>
                <option value="validation_pending">En validation</option>
                <option value="completed">Validées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Tâches à valider ({filteredTasks.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                          {task.status === 'validation_pending' ? 'En validation' : task.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Utilisateur : {task.userId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Soumis : {formatDate(task.submittedAt || task.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>XP : {task.xpReward || 50}</span>
                        </div>
                      </div>
                      
                      {task.submissionComment && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium text-blue-800">Commentaire : </span>
                          <span className="text-blue-700">{task.submissionComment}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {task.hasPhoto && (
                        <div className="p-2 bg-blue-100 rounded-lg" title="Photo fournie">
                          <Camera className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      
                      <button
                        onClick={() => openValidationModal(task)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Examiner
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune tâche à valider pour le moment</p>
                <p className="text-sm mt-1">
                  {searchTerm || filterStatus !== 'pending' 
                    ? 'Essayez de modifier les filtres de recherche'
                    : 'Les nouvelles soumissions apparaîtront ici'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de validation */}
      <AnimatePresence>
        {showValidationModal && selectedTask && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              
              {/* Overlay */}
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowValidationModal(false)}></div>
              </div>

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Validation de Tâche
                    </h3>
                    <button
                      onClick={() => setShowValidationModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-6">
                  {/* Détails de la tâche */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Détails de la soumission</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Titre :</span>
                        <span className="font-medium">{selectedTask.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Utilisateur :</span>
                        <span className="font-medium">{selectedTask.userId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soumis le :</span>
                        <span className="font-medium">{formatDate(selectedTask.submittedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulté :</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(selectedTask.difficulty)}`}>
                          {selectedTask.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">XP à attribuer :</span>
                        <span className="font-medium text-blue-600">{selectedTask.xpReward || 50} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-700 text-sm">{selectedTask.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Commentaire utilisateur */}
                  {selectedTask.submissionComment && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Commentaire utilisateur</h3>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedTask.submissionComment}</p>
                      </div>
                    </div>
                  )}

                  {/* Photo de preuve */}
                  {selectedTask.photoUrl && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Preuve photo</h3>
                      <img
                        src={selectedTask.photoUrl}
                        alt="Preuve"
                        className="w-full h-64 object-cover rounded-lg border border-gray-300 cursor-pointer"
                        onClick={() => window.open(selectedTask.photoUrl, '_blank')}
                      />
                      <p className="text-xs text-gray-500 mt-2">Cliquez pour voir en taille réelle</p>
                    </div>
                  )}

                  {/* Commentaire admin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire administrateur (optionnel)
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
                    <span>{validating ? 'Validation...' : 'Valider'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTaskValidationPage;
