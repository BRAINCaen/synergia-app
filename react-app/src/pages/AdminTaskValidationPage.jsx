// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION DES TÂCHES AVEC VIEWER MÉDIAS AUTHENTIFIÉ
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
  Users,
  ExternalLink,
  Video,
  Upload,
  Play
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import TaskService from '../core/services/taskService.js';
import { useAuthStore } from '../shared/stores/authStore.js';
import { TaskMediaViewer } from '../components/media/AuthenticatedMediaViewer.jsx';

// ✅ Instance du service de tâches
const taskService = new TaskService();

/**
 * 🛡️ PAGE ADMIN VALIDATION DES TÂCHES AVEC AFFICHAGE MÉDIAS AUTHENTIFIÉS
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
      console.log('🔄 Chargement des tâches Firebase pour validation...');
      
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
      const statsData = {
        pending: allTasksData.filter(t => t.status === 'validation_pending').length,
        approved: allTasksData.filter(t => t.status === 'completed').length,
        rejected: allTasksData.filter(t => t.status === 'rejected').length,
        total: allTasksData.length
      };

      setPendingTasks(pending);
      setAllTasks(allTasksData);
      setStats(statsData);
      
      console.log('✅ Données chargées:', {
        pending: pending.length,
        total: allTasksData.length,
        stats: statsData
      });

    } catch (error) {
      console.error('❌ Erreur chargement des données Firebase pour validation:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ VALIDER OU REJETER UNE TÂCHE
  const handleValidation = async (approved) => {
    if (!selectedTask) return;

    setValidating(true);
    try {
      console.log(`${approved ? '✅' : '❌'} ${approved ? 'Validation' : 'Rejet'} tâche:`, selectedTask.title);
      
      const result = await taskService.validateTask(
        selectedTask.id, 
        user.uid, 
        approved, 
        adminComment
      );

      if (result.success) {
        // Mettre à jour les listes locales
        setPendingTasks(prev => prev.filter(t => t.id !== selectedTask.id));
        setAllTasks(prev => prev.map(t => 
          t.id === selectedTask.id 
            ? { ...t, status: result.status, validatedBy: user.uid, validatedAt: new Date(), adminComment }
            : t
        ));

        // Mettre à jour les stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          [approved ? 'approved' : 'rejected']: prev[approved ? 'approved' : 'rejected'] + 1
        }));

        // Fermer le modal
        setShowValidationModal(false);
        setSelectedTask(null);
        setAdminComment('');

        console.log(`✅ Tâche ${approved ? 'validée' : 'rejetée'} avec succès`);
      }

    } catch (error) {
      console.error(`❌ Erreur ${approved ? 'validation' : 'rejet'}:`, error);
      alert(`Erreur lors du ${approved ? 'validation' : 'rejet'} de la tâche`);
    } finally {
      setValidating(false);
    }
  };

  // Filtrage des tâches
  const filteredTasks = (filterStatus === 'validation_pending' ? pendingTasks : allTasks)
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

  // Fonction utilitaire pour formater les dates
  const formatDate = (date) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      'validation_pending': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'todo': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status) => {
    const labels = {
      'validation_pending': 'En validation',
      'completed': 'Validée',
      'rejected': 'Rejetée',
      'todo': 'À faire',
      'in_progress': 'En cours'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des tâches à valider...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Validation des Tâches
            </h1>
            <p className="text-gray-600 mt-1">
              Valider ou rejeter les tâches soumises par les utilisateurs
            </p>
          </div>
        </div>

        <button
          onClick={loadRealValidationData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Validées</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="validation_pending">En attente de validation</option>
              <option value="completed">Validées</option>
              <option value="rejected">Rejetées</option>
              <option value="all">Toutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                
                {/* Informations de la tâche */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          ID: {task.userId?.substring(0, 8)}...
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(task.submittedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4" />
                          {task.difficulty === 'hard' ? '50' : 
                           task.difficulty === 'easy' ? '10' : '25'} XP
                        </span>
                      </div>

                      {/* Commentaire utilisateur */}
                      {task.submissionComment && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-blue-800 text-sm">
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            {task.submissionComment}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ✅ PRÉVISUALISATION MÉDIA AVEC NOUVEAU COMPOSANT */}
                    {((task.hasMedia && task.mediaUrl) || (task.hasPhoto && task.photoUrl)) && (
                      <div className="flex-shrink-0">
                        {task.mediaType === 'video' || (task.mediaUrl && task.mediaUrl.includes('.mp4')) ? (
                          // Prévisualisation vidéo
                          <div className="relative">
                            <video
                              src={task.mediaUrl || task.photoUrl}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition-colors"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowValidationModal(true);
                              }}
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                              <Play className="w-4 h-4 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                              🎥
                            </div>
                          </div>
                        ) : (
                          // Prévisualisation image
                          <div className="relative group">
                            <img
                              src={task.mediaUrl || task.photoUrl}
                              alt="Preuve de tâche"
                              className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-colors"
                              onClick={() => {
                                setSelectedTask(task);
                                setShowValidationModal(true);
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                              <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                              📸
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Indicateur média manquant */}
                    {task.hasMedia && !task.mediaUrl && (
                      <div className="p-2 bg-yellow-100 rounded-lg" title="Média en cours de traitement">
                        <Upload className="w-4 h-4 text-yellow-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions et statut */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  
                  {task.status === 'validation_pending' && (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowValidationModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Examiner
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-600">
              {filterStatus === 'validation_pending' ? 
                'Aucune tâche en attente de validation' : 
                'Modifiez vos filtres pour voir plus de tâches'}
            </p>
          </div>
        )}
      </div>

      {/* ✅ MODAL DE VALIDATION AVEC VIEWER MÉDIAS AUTHENTIFIÉ */}
      <AnimatePresence>
        {showValidationModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowValidationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* En-tête du modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Validation de Tâche
                      </h2>
                      <p className="text-sm text-gray-600">
                        Examinez et validez cette tâche
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowValidationModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenu du modal */}
              <div className="p-6 space-y-6">
                
                {/* Informations de la tâche */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Utilisateur:</span>
                      <p className="text-gray-600">{selectedTask.userId?.substring(0, 12)}...</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Difficulté:</span>
                      <p className="text-gray-600 capitalize">{selectedTask.difficulty}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Récompense:</span>
                      <p className="text-gray-600">{
                        selectedTask.difficulty === 'hard' ? '50' : 
                        selectedTask.difficulty === 'easy' ? '10' : '25'
                      } XP</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Soumise le:</span>
                      <p className="text-gray-600">{formatDate(selectedTask.submittedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📝 Description</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Commentaire utilisateur */}
                {selectedTask.submissionComment && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">💬 Commentaire de l'utilisateur</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{selectedTask.submissionComment}</p>
                    </div>
                  </div>
                )}

                {/* ✅ AFFICHAGE MÉDIA AVEC NOUVEAU COMPOSANT AUTHENTIFIÉ */}
                <TaskMediaViewer 
                  task={selectedTask} 
                  className="mb-4"
                />

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
