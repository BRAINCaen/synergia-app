// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// PAGE ADMIN COMPLÈTE - VERSION CORRIGÉE ERREURS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Camera,
  Video,
  MessageSquare,
  Trophy,
  User,
  Calendar,
  Tag,
  Gift,
  Settings,
  Award,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskValidationService } from '../core/services/taskValidationService.js';

// Import du service récompenses corrigé (optionnel)
import { rewardsService } from '../core/services/rewardsService.js';

/**
 * 👨‍💼 PAGE ADMIN VALIDATION DES TÂCHES - VERSION STABLE
 */
const AdminTaskValidationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // États validation des tâches
  const [validationRequests, setValidationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  
  // Modal de validation
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  // Statistiques
  const [stats, setStats] = useState({
    pending: 0,
    validated: 0,
    rejected: 0,
    todayValidated: 0
  });

  useEffect(() => {
    loadValidationRequests();
  }, []);

  // Charger les demandes de validation
  const loadValidationRequests = async () => {
    try {
      setLoading(true);
      console.log('📋 Chargement des demandes de validation...');
      
      const requests = await taskValidationService.getPendingValidations();
      console.log('✅ Demandes chargées:', requests.length);
      
      setValidationRequests(requests);
      
      // Calculer les statistiques
      const pending = requests.filter(r => r.status === 'pending').length;
      const validated = requests.filter(r => r.status === 'validated').length;
      const rejected = requests.filter(r => r.status === 'rejected').length;
      
      setStats({
        pending,
        validated,
        rejected,
        todayValidated: requests.filter(r => 
          r.status === 'validated' && 
          r.validatedAt && 
          new Date(r.validatedAt.toDate()).toDateString() === new Date().toDateString()
        ).length
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement validations:', error);
      setValidationRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Traiter une validation
  const handleValidation = async (approve) => {
    if (!selectedRequest) return;
    
    try {
      setValidating(true);
      console.log(`${approve ? '✅' : '❌'} Traitement validation:`, selectedRequest.id);
      
      await taskValidationService.validateTask(selectedRequest.id, {
        userId: user.uid,
        approved: approve,
        comment: adminComment || (approve ? 'Tâche validée' : 'Tâche rejetée'),
        xpAwarded: approve ? selectedRequest.xpValue || 25 : 0
      });
      
      console.log(`${approve ? '✅' : '❌'} Validation terminée`);
      
      // Recharger les données
      await loadValidationRequests();
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedRequest(null);
      setAdminComment('');
      
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      alert('Erreur lors de la validation: ' + error.message);
    } finally {
      setValidating(false);
    }
  };

  // Filtrer les demandes
  const filteredRequests = validationRequests.filter(request => {
    const matchesTab = activeTab === 'all' || request.status === (activeTab === 'pending' ? 'pending' : activeTab);
    const matchesSearch = !searchTerm || 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || request.difficulty === filterDifficulty;
    
    return matchesTab && matchesSearch && matchesDifficulty;
  });

  // Fonction pour obtenir l'icône de difficulté
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'normal': return '🟡';
      case 'hard': return '🟠';
      case 'expert': return '🔴';
      default: return '⚪';
    }
  };

  // Fonction pour obtenir la couleur de difficulté
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'normal': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-orange-600 bg-orange-50';
      case 'expert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Fonction pour formater la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Format de date invalide';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Chargement des validations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour Dashboard</span>
              </button>
              
              <div className="h-6 w-px bg-gray-600"></div>
              
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-red-400" />
                <h1 className="text-xl font-bold text-white">Administration Synergia</h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadValidationRequests}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">En Attente</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Validées</p>
                <p className="text-3xl font-bold text-green-400">{stats.validated}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Rejetées</p>
                <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Aujourd'hui</p>
                <p className="text-3xl font-bold text-blue-400">{stats.todayValidated}</p>
              </div>
              <Award className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            
            {/* Onglets */}
            <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg p-1">
              {[
                { id: 'pending', label: 'En Attente', count: stats.pending },
                { id: 'validated', label: 'Validées', count: stats.validated },
                { id: 'rejected', label: 'Rejetées', count: stats.rejected },
                { id: 'all', label: 'Toutes', count: validationRequests.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-600 text-gray-300 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filtre difficulté */}
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes difficultés</option>
                <option value="easy">🟢 Facile</option>
                <option value="normal">🟡 Normale</option>
                <option value="hard">🟠 Difficile</option>
                <option value="expert">🔴 Expert</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-400">
                {activeTab === 'pending' 
                  ? 'Aucune demande en attente de validation'
                  : `Aucune demande ${activeTab} ne correspond aux critères`
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between">
                  
                  <div className="flex-1">
                    
                    {/* En-tête de la demande */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="text-white font-medium">{request.userName || 'Utilisateur inconnu'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{formatDate(request.createdAt)}</span>
                      </div>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(request.difficulty)}`}>
                        {getDifficultyIcon(request.difficulty)} {request.difficulty || 'normal'}
                      </span>
                    </div>

                    {/* Contenu de la demande */}
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {request.title || 'Titre non spécifié'}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {request.description || 'Aucune description fournie'}
                    </p>

                    {/* Médias attachés */}
                    {(request.mediaUrls && request.mediaUrls.length > 0) && (
                      <div className="flex items-center space-x-4 mb-4">
                        {request.mediaUrls.some(url => url.includes('image')) && (
                          <div className="flex items-center space-x-1 text-sm text-gray-400">
                            <Camera className="w-4 h-4" />
                            <span>Photos attachées</span>
                          </div>
                        )}
                        {request.mediaUrls.some(url => url.includes('video')) && (
                          <div className="flex items-center space-x-1 text-sm text-gray-400">
                            <Video className="w-4 h-4" />
                            <span>Vidéos attachées</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Récompense XP */}
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">
                        +{request.xpValue || 25} XP
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    
                    {request.status === 'pending' && (
                      <>
                        {/* Voir détails */}
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowValidationModal(true);
                          }}
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Examiner</span>
                        </button>
                      </>
                    )}

                    {request.status === 'validated' && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Validée</span>
                      </div>
                    )}

                    {request.status === 'rejected' && (
                      <div className="flex items-center space-x-2 text-red-400">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Rejetée</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal de validation */}
      {showValidationModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Validation de tâche</h2>
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setSelectedRequest(null);
                  setAdminComment('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-6">
              
              {/* Informations utilisateur */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Informations utilisateur</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Nom:</span>
                    <span className="text-white ml-2">{selectedRequest.userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{selectedRequest.userEmail || 'Non disponible'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white ml-2">{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Difficulté:</span>
                    <span className="text-white ml-2">
                      {getDifficultyIcon(selectedRequest.difficulty)} {selectedRequest.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Détails de la tâche */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Détails de la tâche</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Titre:</span>
                    <p className="text-white mt-1">{selectedRequest.title}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Description:</span>
                    <p className="text-white mt-1">{selectedRequest.description}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Récompense:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-medium">+{selectedRequest.xpValue || 25} XP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Médias attachés */}
              {selectedRequest.mediaUrls && selectedRequest.mediaUrls.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Médias attachés</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.mediaUrls.map((url, index) => (
                      <div key={index} className="relative">
                        {url.includes('image') ? (
                          <img
                            src={url}
                            alt={`Preuve ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <video
                            src={url}
                            controls
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commentaire admin */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Commentaire d'administration</h3>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Ajouter un commentaire (optionnel)..."
                  className="w-full h-24 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Actions du modal */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setSelectedRequest(null);
                  setAdminComment('');
                }}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={validating}
              >
                Annuler
              </button>
              
              <button
                onClick={() => handleValidation(false)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                disabled={validating}
              >
                <XCircle className="w-4 h-4" />
                <span>{validating ? 'Rejet...' : 'Rejeter'}</span>
              </button>
              
              <button
                onClick={() => handleValidation(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                disabled={validating}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{validating ? 'Validation...' : 'Valider'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskValidationPage;
