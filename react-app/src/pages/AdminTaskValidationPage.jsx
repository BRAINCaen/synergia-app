// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN VALIDATION DES TÂCHES AVEC PHOTOS
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
import taskService from '../core/services/taskService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ PAGE ADMIN VALIDATION DES TÂCHES AVEC AFFICHAGE PHOTOS
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
      const taskStats = {
        pending: allTasksData.filter(t => t.status === 'validation_pending').length,
        approved: allTasksData.filter(t => t.status === 'completed').length,
        rejected: allTasksData.filter(t => t.status === 'rejected').length,
        total: allTasksData.length
      };

      setAllTasks(allTasksData);
      setPendingTasks(pending);
      setStats(taskStats);
      
      console.log('✅ Données chargées:', {
        totalTasks: allTasksData.length,
        pendingValidation: pending.length,
        stats: taskStats
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
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
      console.log(`🔍 ${approved ? 'Validation' : 'Rejet'} de la tâche:`, selectedTask.title);
      
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les tâches selon la recherche et le filtre
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={16} />
            Retour au Dashboard
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Validation des Tâches
          </h1>
          <p className="text-gray-600 mt-1">
            Examinez et validez les soumissions d'équipe
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadRealValidationData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          
          <Link
            to="/admin/complete-test"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Tests Admin
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          <p className="text-sm text-orange-600">En attente</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-green-600">Validées</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-red-600">Rejetées</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-sm text-blue-600">Total</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
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
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="validation_pending">En validation</option>
            <option value="completed">Validées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          📋 Tâches Firebase ({filteredTasks.length})
        </h2>

        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'validation_pending' ? 'bg-orange-100 text-orange-700' :
                        task.status === 'completed' ? 'bg-green-100 text-green-700' :
                        task.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'validation_pending' ? 'En validation' :
                         task.status === 'completed' ? 'Validée' :
                         task.status === 'rejected' ? 'Rejetée' :
                         task.status}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {task.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{getUserDisplayName(task)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(task.submittedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>+{task.difficulty === 'expert' ? '100' : 
                                task.difficulty === 'hard' ? '50' : 
                                task.difficulty === 'easy' ? '10' : '25'} XP</span>
                      </div>
                    </div>

                    {/* Commentaire utilisateur */}
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

                    {/* Commentaire admin pour les tâches rejetées */}
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
                    {/* ✅ AFFICHAGE MÉDIA CORRIGÉ (Photo ou Vidéo) */}
                    {task.hasMedia && task.mediaUrl && (
                      <div className="relative group">
                        {task.mediaType === 'video' ? (
                          // Prévisualisation vidéo
                          <div className="relative">
                            <video
                              src={task.mediaUrl}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition-colors"
                              onClick={() => window.open(task.mediaUrl, '_blank')}
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
                          <div className="relative">
                            <img
                              src={task.mediaUrl}
                              alt="Preuve de tâche"
                              className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-colors"
                              onClick={() => window.open(task.mediaUrl, '_blank')}
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
                    
                    {/* Indicateur legacy pour hasPhoto */}
                    {task.hasPhoto && task.photoUrl && !task.hasMedia && (
                      <div className="relative group">
                        <img
                          src={task.photoUrl}
                          alt="Preuve de tâche"
                          className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => window.open(task.photoUrl, '_blank')}
                        />
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          📸
                        </div>
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
            ))}
          </div>
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

      {/* ✅ MODAL DE VALIDATION AVEC PHOTO */}
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
                  <h3 className="font-semibold text-gray-900 mb-3">📋 Détails de la tâche</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">ID Tâche:</span>
                      <p className="text-gray-600">{selectedTask.id.substring(0, 8)}...</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Utilisateur:</span>
                      <p className="text-gray-600">{getUserDisplayName(selectedTask)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Difficulté:</span>
                      <p className="text-gray-600">{selectedTask.difficulty}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Récompense XP:</span>
                      <p className="text-orange-600 font-bold">+{
                        selectedTask.difficulty === 'expert' ? '100' : 
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

                {/* ✅ AFFICHAGE MÉDIA DANS LE MODAL (Photo ou Vidéo) */}
                {((selectedTask.hasMedia && selectedTask.mediaUrl) || (selectedTask.hasPhoto && selectedTask.photoUrl)) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {selectedTask.mediaType === 'video' ? '🎥 Vidéo de preuve' : '📸 Photo de preuve'}
                    </h4>
                    <div className="relative">
                      {selectedTask.mediaType === 'video' || (selectedTask.mediaUrl && selectedTask.mediaUrl.includes('.mp4')) ? (
                        // Affichage vidéo
                        <video
                          src={selectedTask.mediaUrl || selectedTask.photoUrl}
                          className="w-full max-h-64 rounded-lg border border-gray-300"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        // Affichage image
                        <img
                          src={selectedTask.mediaUrl || selectedTask.photoUrl}
                          alt="Preuve de tâche"
                          className="w-full max-h-64 object-contain rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(selectedTask.mediaUrl || selectedTask.photoUrl, '_blank')}
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                        {selectedTask.mediaType === 'video' ? (
                          <>
                            <Video className="w-3 h-3" />
                            <span>Vidéo • Contrôles disponibles</span>
                          </>
                        ) : (
                          <>
                            <FileImage className="w-3 h-3" />
                            <span>Cliquer pour agrandir</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pas de média */}
                {(!selectedTask.hasMedia && !selectedTask.hasPhoto) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📸 Média de preuve</h4>
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Camera className="w-6 h-6 text-gray-400" />
                        <Video className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Aucun média fourni</p>
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
