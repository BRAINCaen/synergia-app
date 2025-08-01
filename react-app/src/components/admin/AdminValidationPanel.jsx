// ==========================================
// 📁 react-app/src/components/admin/AdminValidationPanel.jsx
// PANEL ADMIN POUR VALIDER LES SOUMISSIONS DE TÂCHES
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
  X
} from 'lucide-react';
import { taskValidationService } from '../../core/services/taskValidationService.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🛡️ PANEL ADMIN POUR VALIDATION DES TÂCHES
 */
const AdminValidationPanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  
  // États UI
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [validating, setValidating] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadValidationData();
    
    // Écouter les mises à jour en temps réel
    const unsubscribe = taskValidationService.subscribeToValidationRequests((requests) => {
      setPendingRequests(requests);
      console.log('🔄 Demandes mises à jour:', requests.length);
    });

    return () => unsubscribe();
  }, []);

  const loadValidationData = async () => {
    setLoading(true);
    try {
      const [requests, statistics] = await Promise.all([
        taskValidationService.getPendingValidations(),
        taskValidationService.getValidationStats()
      ]);
      
      setPendingRequests(requests);
      setStats(statistics);
      
      console.log('✅ Données validation chargées:', {
        pending: requests.length,
        stats: statistics
      });
      
    } catch (error) {
      console.error('❌ Erreur chargement validation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal de validation
  const openValidationModal = (request) => {
    setSelectedRequest(request);
    setAdminComment('');
    setShowValidationModal(true);
  };

  // Valider une demande
  const handleValidation = async (approved) => {
    if (!selectedRequest) return;
    
    setValidating(true);
    try {
      await taskValidationService.validateTaskRequest(
        selectedRequest.id,
        user.uid,
        adminComment,
        approved
      );
      
      // Recharger les données
      await loadValidationData();
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedRequest(null);
      setAdminComment('');
      
      console.log(`✅ Validation ${approved ? 'approuvée' : 'rejetée'}`);
      
    } catch (error) {
      console.error('❌ Erreur validation:', error);
    } finally {
      setValidating(false);
    }
  };

  // Formater la date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur de la difficulté
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'easy': 'bg-green-100 text-green-800',
      'normal': 'bg-blue-100 text-blue-800',
      'hard': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.normal;
  };

  // Composant carte de demande
  const RequestCard = ({ request }) => (
    <motion.div
      layout
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">{request.taskTitle}</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Utilisateur: {request.userId}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(request.submittedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(request.difficulty)}`}>
              {request.difficulty}
            </span>
            <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
              <Trophy className="w-3 h-3" />
              <span>{request.xpAmount} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Commentaire */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Commentaire utilisateur :</span>
          </div>
          <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
            {request.comment || 'Aucun commentaire fourni'}
          </p>
        </div>

        {/* Photo de preuve */}
        {request.photoUrl && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Preuve photo :</span>
            </div>
            <div className="relative">
              <img
                src={request.photoUrl}
                alt="Preuve de tâche"
                className="w-full h-48 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(request.photoUrl, '_blank')}
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <FileImage className="w-3 h-3" />
                <span>Cliquer pour agrandir</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <button
            onClick={() => openValidationModal(request)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            <span>Examiner et valider</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedRequest(request);
                setAdminComment('Tâche validée rapidement');
                handleValidation(true);
              }}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approuver</span>
            </button>
            
            <button
              onClick={() => openValidationModal(request)}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <XCircle className="w-4 h-4" />
              <span>Rejeter</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Modal de validation détaillée
  const ValidationModal = () => (
    <AnimatePresence>
      {showValidationModal && selectedRequest && (
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
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Validation de tâche</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.taskTitle}</p>
              </div>
              <button
                onClick={() => setShowValidationModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Détails de la tâche */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Détails de la soumission</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Utilisateur :</span>
                    <span className="ml-2 font-medium">{selectedRequest.userId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Soumis le :</span>
                    <span className="ml-2 font-medium">{formatDate(selectedRequest.submittedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Difficulté :</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getDifficultyColor(selectedRequest.difficulty)}`}>
                      {selectedRequest.difficulty}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">XP à attribuer :</span>
                    <span className="ml-2 font-medium text-blue-600">{selectedRequest.xpAmount} XP</span>
                  </div>
                </div>
              </div>

              {/* Commentaire utilisateur */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Commentaire utilisateur</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedRequest.comment || 'Aucun commentaire'}</p>
                </div>
              </div>

              {/* Photo de preuve */}
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
                <span>{validating ? 'Validation...' : 'Approuver'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-500">Chargement des validations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Validation des Tâches</h1>
              <p className="opacity-90">Examinez et validez les soumissions d'équipe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approuvées</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">XP attribués</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalXpAwarded || 0}</p>
            </div>
            <Trophy className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Demandes en attente ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tout est à jour !</h3>
            <p className="text-gray-500">Aucune demande de validation en attente.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>

      {/* Modal de validation */}
      <ValidationModal />
    </div>
  );
};

export default AdminValidationPanel;
