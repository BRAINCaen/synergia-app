// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN POUR VALIDER LES TÂCHES EN ATTENTE - VERSION COMPLÈTE
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
import { taskService } from '../core/services/taskService.js';
import { taskValidationService } from '../core/services/taskValidationService.js';
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 🛡️ PAGE ADMIN VALIDATION DES TÂCHES COMPLÈTE
 */
const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [pendingTasks, setPendingTasks] = useState([]);
  const [validationRequests, setValidationRequests] = useState([]);
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
  const [filterStatus, setFilterStatus] = useState('pending');

  // Charger les données au montage
  useEffect(() => {
    loadValidationData();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadValidationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    try {
      // Simuler des tâches en attente pour démonstration
      const mockTasks = [
        {
          id: 'task_1',
          title: 'Créer maquette page d\'accueil',
          description: 'Concevoir la maquette wireframe de la nouvelle page d\'accueil',
          userId: 'alan.boehme61@gmail.com',
          userDisplayName: 'Alan Boehme',
          difficulty: 'hard',
          xpReward: 75,
          status: 'validation_pending',
          submittedAt: new Date(),
          submissionComment: 'Maquette terminée avec 3 variantes de design. J\'ai utilisé Figma pour créer les prototypes interactifs.',
          hasPhoto: true,
          photoUrl: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Maquette+Design',
          projectId: 'project_1',
          projectTitle: 'Refonte Site Web'
        },
        {
          id: 'task_2', 
          title: 'Rédiger documentation API',
          description: 'Documenter les endpoints de l\'API REST',
          userId: 'user2@example.com',
          userDisplayName: 'Sophie Martin',
          difficulty: 'normal',
          xpReward: 50,
          status: 'validation_pending',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
          submissionComment: 'Documentation complète avec exemples de requêtes et réponses pour tous les endpoints.',
          hasPhoto: false,
          projectId: 'project_2',
          projectTitle: 'Développement App Mobile'
        },
        {
          id: 'task_3',
          title: 'Tests unitaires module auth',
          description: 'Écrire les tests pour le module d\'authentification',
          userId: 'dev@example.com',
          userDisplayName: 'Marc Dubois',
          difficulty: 'expert',
          xpReward: 100,
          status: 'validation_pending',
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
          submissionComment: 'Coverage à 95% avec tests d\'intégration inclus.',
          hasPhoto: true,
          photoUrl: 'https://via.placeholder.com/400x200/10b981/ffffff?text=Test+Coverage+95%25',
          projectId: 'project_1',
          projectTitle: 'Refonte Site Web'
        }
      ];

      const mockStats = {
        pending: mockTasks.length,
        approved: 12,
        rejected: 2,
        total: mockTasks.length + 12 + 2
      };
      
      setPendingTasks(mockTasks);
      setStats(mockStats);
      
      console.log('✅ Données validation chargées:', {
        pendingTasks: mockTasks.length,
        stats: mockStats
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
      console.log(`🔍 ${approved ? 'Validation' : 'Rejet'} de la tâche:`, selectedTask.title);
      
      // Simuler la validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mettre à jour localement
      setPendingTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        [approved ? 'approved' : 'rejected']: prev[approved ? 'approved' : 'rejected'] + 1
      }));
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedTask(null);
      setAdminComment('');
      
      // Notification de succès
      alert(`✅ Tâche ${approved ? 'validée' : 'rejetée'} avec succès !`);
      
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

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours}h`;
    return 'À l\'instant';
  };

  // Filtrer les tâches
  const filteredTasks = pendingTasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.userDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Chargement des validations...</span>
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
                <h1 className="text-2xl font-bold text-gray-900">Validation des Tâches</h1>
                <p className="text-gray-600">Examinez et validez les soumissions d'équipe</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadValidationData}
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approuvées</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
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
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total traité</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
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
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} trouvée{filteredTasks.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Tâches en attente de validation ({filteredTasks.length})
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
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          En validation
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{task.userDisplayName || task.userId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{getTimeAgo(task.submittedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>{task.projectTitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          <span className="font-medium text-orange-600">+{task.xpReward} XP</span>
                        </div>
                      </div>
                      
                      {task.submissionComment && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-blue-800">Commentaire : </span>
                              <span className="text-blue-700">{task.submissionComment}</span>
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
                      
                      <button
                        onClick={() => openValidationModal(task)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Examiner
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Aucune tâche à valider</p>
                <p className="text-sm mt-1">
                  {searchTerm 
                    ? 'Aucun résultat pour cette recherche'
                    : 'Toutes les tâches ont été traitées !'
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
                  <h2 className="text-xl font-bold text-gray-900">Validation de tâche</h2>
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
                  <h3 className="font-semibold text-gray-900 mb-3">Détails de la tâche</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Utilisateur :</span>
                      <span className="ml-2 font-medium">{selectedTask.userDisplayName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulté :</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedTask.difficulty)}`}>
                        {selectedTask.difficulty}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Projet :</span>
                      <span className="ml-2 font-medium">{selectedTask.projectTitle}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Récompense :</span>
                      <span className="ml-2 font-medium text-orange-600">+{selectedTask.xpReward} XP</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Soumis :</span>
                      <span className="ml-2 font-medium">{formatDate(selectedTask.submittedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Commentaire de soumission */}
                {selectedTask.submissionComment && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Commentaire de l'utilisateur</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800">{selectedTask.submissionComment}</p>
                    </div>
                  </div>
                )}

                {/* Photo si disponible */}
                {selectedTask.hasPhoto && selectedTask.photoUrl && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Photo jointe</h4>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <img 
                        src={selectedTask.photoUrl} 
                        alt="Preuve de tâche" 
                        className="w-full max-w-md mx-auto rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => window.open(selectedTask.photoUrl, '_blank')}
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">Cliquez pour voir en taille réelle</p>
                    </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTaskValidationPage;
