// ==========================================
// 📁 react-app/src/pages/AdminTaskValidationPage.jsx
// VERSION CORRIGÉE AVEC CHARGEMENT DES VALIDATIONS
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

  // Traiter une validation (approuver/rejeter)
  const handleValidation = async (approve) => {
    if (!selectedRequest) return;
    
    try {
      setValidating(true);
      console.log(`${approve ? '✅' : '❌'} Traitement validation:`, selectedRequest.id);
      
      if (approve) {
        await taskValidationService.approveValidation(
          selectedRequest.id, 
          user.uid, 
          adminComment
        );
      } else {
        await taskValidationService.rejectValidation(
          selectedRequest.id, 
          user.uid, 
          adminComment || 'Validation rejetée'
        );
      }
      
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
      request.comment?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDifficulty = filterDifficulty === 'all' || 
      request.difficulty === filterDifficulty;
      
    return matchesTab && matchesSearch && matchesDifficulty;
  });

  const pendingCount = validationRequests.filter(r => r.status === 'pending').length;
  const processedCount = validationRequests.filter(r => r.status !== 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Validation des Tâches</h1>
                <p className="text-sm text-gray-600">Examinez et validez les soumissions d'équipe</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-3 py-1 rounded-full">
                <span className="text-blue-700 font-medium">{pendingCount}</span>
                <span className="text-blue-600 text-sm ml-1">En attente</span>
              </div>
              <div className="bg-green-50 px-3 py-1 rounded-full">
                <span className="text-green-700 font-medium">{processedCount}</span>
                <span className="text-green-600 text-sm ml-1">Traitées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Onglets et filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Onglets */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'pending' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                En attente ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('processed')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'processed' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Traitées ({processedCount})
              </button>
            </div>

            {/* Recherche et filtres */}
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">Toutes difficultés</option>
                <option value="easy">Facile</option>
                <option value="normal">Normal</option>
                <option value="hard">Difficile</option>
                <option value="expert">Expert</option>
              </select>
              
              <button
                onClick={loadValidationRequests}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des validations...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune validation {activeTab === 'pending' ? 'en attente' : 'traitée'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'Toutes les tâches ont été traitées !' 
                : 'Aucune validation traitée pour le moment.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border hover:shadow-lg transition-shadow"
              >
                
                {/* Header de la carte */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {request.taskTitle || 'Tâche sans titre'}
                    </h3>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' 
                        ? 'bg-orange-100 text-orange-800' 
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'pending' ? 'En attente' : 
                       request.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {request.userName || 'Utilisateur'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      +{request.xpAmount || 25} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {request.difficulty || 'Normal'}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  
                  {/* Commentaire */}
                  {request.comment && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Commentaire :</span>
                      </div>
                      <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
                        {request.comment}
                      </p>
                    </div>
                  )}

                  {/* Média de preuve */}
                  {request.photoUrl && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Preuve :</span>
                      </div>
                      <div className="relative">
                        <img
                          src={request.photoUrl}
                          alt="Preuve de tâche"
                          className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(request.photoUrl, '_blank')}
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Cliquer</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.videoUrl && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Vidéo :</span>
                      </div>
                      <div className="relative">
                        <video
                          src={request.videoUrl}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          controls
                        />
                      </div>
                    </div>
                  )}

                  {/* Date de soumission */}
                  <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Soumis le {request.submittedAt?.toDate().toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-200">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openValidationModal(request)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Examiner
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
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
                      {request.reviewedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                          le {request.reviewedAt.toDate().toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  )}
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
                  <h3 className="font-medium text-gray-900 mb-2">Commentaire utilisateur</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedRequest.comment}
                  </p>
                </div>
              )}

              {/* Preuve photo */}
              {selectedRequest.photoUrl && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Preuve photo</h3>
                  <img
                    src={selectedRequest.photoUrl}
                    alt="Preuve"
                    className="w-full h-64 object-cover rounded-lg border border-gray-300 cursor-pointer"
                    onClick={() => window.open(selectedRequest.photoUrl, '_blank')}
                  />
                  <p className="text-xs text-gray-500 mt-2">Cliquez pour voir en taille réelle</p>
                </div>
              )}

              {/* Preuve vidéo */}
              {selectedRequest.videoUrl && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Preuve vidéo</h3>
                  <video
                    src={selectedRequest.videoUrl}
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    controls
                  />
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
            <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowValidationModal(false)}
                disabled={validating}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
