// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// VERSION CORRIGÉE AVEC MÉTHODES CORRECTES
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
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { taskValidationService } from '../core/services/taskValidationService.js';

/**
 * 👨‍💼 PAGE ADMIN DE VALIDATION DES TÂCHES
 */
const AdminTaskValidationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // États
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
      
    } catch (error) {
      console.error('❌ Erreur chargement validations:', error);
      setValidationRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION: Utiliser la méthode validateTask existante
  const handleValidation = async (approve) => {
    if (!selectedRequest) return;
    
    try {
      setValidating(true);
      console.log(`${approve ? '✅' : '❌'} Traitement validation:`, selectedRequest.id);
      
      // ✅ CORRECTION: Utiliser validateTask au lieu de approveValidation/rejectValidation
      await taskValidationService.validateTask(selectedRequest.id, {
        userId: user.uid,
        approved: approve,
        comment: adminComment || (approve ? 'Tâche validée' : 'Tâche rejetée'),
        xpAwarded: approve ? selectedRequest.xpAmount : 0
      });
      
      // Recharger les données
      await loadValidationRequests();
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedRequest(null);
      setAdminComment('');
      
    } catch (error) {
      console.error('❌ Erreur traitement validation:', error);
      alert('Erreur lors du traitement de la validation');
    } finally {
      setValidating(false);
    }
  };

  // Ouvrir le modal de validation
  const openValidationModal = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setShowValidationModal(true);
  };

  // Filtrer les demandes
  const filteredRequests = validationRequests.filter(request => {
    const matchesTab = activeTab === 'pending' 
      ? request.status === 'pending'
      : request.status !== 'pending';
    
    const matchesSearch = !searchTerm || 
      request.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = filterDifficulty === 'all' || 
      request.difficulty === filterDifficulty;
    
    return matchesTab && matchesSearch && matchesDifficulty;
  });

  // Statistiques
  const stats = {
    pending: validationRequests.filter(r => r.status === 'pending').length,
    approved: validationRequests.filter(r => r.status === 'approved').length,
    rejected: validationRequests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour Admin</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Validation des Tâches</h1>
            <p className="text-gray-600 mt-1">Gérer et valider les soumissions d'équipe</p>
          </div>
          
          <button
            onClick={loadValidationRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 font-medium">En attente</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">Validées</p>
              <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 font-medium">Rejetées</p>
              <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          En attente ({stats.pending})
        </button>
        
        <button
          onClick={() => setActiveTab('processed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'processed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Traitées ({stats.approved + stats.rejected})
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une tâche ou un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Filtre difficulté */}
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Toutes difficultés</option>
          <option value="easy">Facile</option>
          <option value="normal">Normal</option>
          <option value="hard">Difficile</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des demandes...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande</h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'Aucune demande en attente de validation'
                : 'Aucune demande traitée'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  
                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.taskTitle}
                      </h3>
                      
                      {/* Badge difficulté */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        request.difficulty === 'normal' ? 'bg-blue-100 text-blue-700' :
                        request.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {request.difficulty}
                      </span>
                      
                      {/* Badge XP */}
                      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        <Trophy className="w-3 h-3" />
                        +{request.xpAmount || 25}
                      </span>
                    </div>
                    
                    {/* Métadonnées */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{request.userName || 'Utilisateur'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {request.submittedAt?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                        </span>
                      </div>
                      
                      {request.hasMedia && (
                        <div className="flex items-center gap-1">
                          {request.photoUrl && <Camera className="w-4 h-4" />}
                          {request.videoUrl && <Video className="w-4 h-4" />}
                          <span>Médias joints</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Commentaire */}
                    {request.comment && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                          <p className="text-gray-700 text-sm">{request.comment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    
                    {/* Bouton voir détails */}
                    <button
                      onClick={() => openValidationModal(request)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {/* Actions de validation (si en attente) */}
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            handleValidation(false);
                          }}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
                        >
                          Rejeter
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            handleValidation(true);
                          }}
                          className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                        >
                          Valider
                        </button>
                      </>
                    )}
                    
                    {/* Statut si traité */}
                    {request.status !== 'pending' && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'approved' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {request.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>{request.status === 'approved' ? 'Validée' : 'Rejetée'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de validation */}
      {showValidationModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header du modal */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Validation : {selectedRequest.taskTitle}
              </h2>
              <p className="text-gray-600 mt-1">
                Soumis par {selectedRequest.userName} • +{selectedRequest.xpAmount || 25} XP
              </p>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 space-y-4">
              
              {/* Commentaire utilisateur */}
              {selectedRequest.comment && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Commentaire de l'utilisateur</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedRequest.comment}</p>
                  </div>
                </div>
              )}
              
              {/* Médias */}
              {(selectedRequest.photoUrl || selectedRequest.videoUrl) && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Preuves jointes</h3>
                  <div className="space-y-3">
                    
                    {selectedRequest.photoUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Photo :</p>
                        <img 
                          src={selectedRequest.photoUrl} 
                          alt="Preuve photo"
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    {selectedRequest.videoUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Vidéo :</p>
                        <video 
                          src={selectedRequest.videoUrl}
                          controls
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Commentaire admin */}
              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Commentaire administrateur (optionnel)
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Ajouter un commentaire pour l'utilisateur..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions du modal */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={() => handleValidation(false)}
                disabled={validating}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>{validating ? 'Rejet...' : 'Rejeter'}</span>
              </button>
              
              <button
                onClick={() => handleValidation(true)}
                disabled={validating}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{validating ? 'Validation...' : 'Valider'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskValidationPage;
