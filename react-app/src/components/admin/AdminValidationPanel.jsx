// ==========================================
// 📁 react-app/src/components/admin/AdminValidationPanel.jsx
// PANEL ADMIN - AVEC ATTRIBUTION XP AUTOMATIQUE CORRIGÉE ⚡
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
  Zap
} from 'lucide-react';

// ✅ IMPORT DU SERVICE ENHANCED QUI ATTRIBUE LES XP
import { taskValidationService } from '../../core/services/taskValidationServiceEnhanced.js';
import { useAuthStore } from '../../shared/stores/authStore.js';

/**
 * 🛡️ PANEL ADMIN POUR VALIDATION DES TÂCHES - AVEC XP AUTO
 */
const AdminValidationPanel = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, today: 0 });
  
  // États UI
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [validating, setValidating] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadValidationData();
    
    // Recharger toutes les 10 secondes pour temps réel
    const interval = setInterval(loadValidationData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadValidationData = async () => {
    try {
      console.log('📊 [ADMIN] Chargement données validation...');
      
      const [requests, statistics] = await Promise.all([
        taskValidationService.getPendingValidations(),
        taskValidationService.getValidationStats()
      ]);
      
      setPendingRequests(requests);
      setStats(statistics);
      
      console.log('✅ [ADMIN] Données chargées:', {
        pending: requests.length,
        stats: statistics
      });
      
    } catch (error) {
      console.error('❌ [ADMIN] Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal de validation
  const openValidationModal = (request) => {
    console.log('🔍 [ADMIN] Ouverture modal pour:', request.taskTitle);
    setSelectedRequest(request);
    setAdminComment('');
    setShowValidationModal(true);
  };

  // ⚡ VALIDER UNE DEMANDE - CORRECTION PRINCIPALE
  const handleValidation = async (approved) => {
    if (!selectedRequest) return;
    
    setValidating(true);
    
    try {
      console.log(`${approved ? '✅' : '❌'} [ADMIN] Validation ${approved ? 'APPROBATION' : 'REJET'}:`, {
        validationId: selectedRequest.id,
        taskId: selectedRequest.taskId,
        userId: selectedRequest.userId,
        xpAmount: selectedRequest.xpAmount,
        adminId: user.uid
      });

      if (approved) {
        // ✅ APPROUVER AVEC ATTRIBUTION XP AUTOMATIQUE
        const result = await taskValidationService.approveValidation(
          selectedRequest.id,
          user.uid,
          adminComment || 'Quête validée'
        );
        
        console.log('✅ [ADMIN] Résultat approbation:', result);
        
        // Message de succès avec XP
        alert(`✅ Quête validée avec succès !\n🏆 ${selectedRequest.xpAmount} XP attribués à l'utilisateur`);
        
      } else {
        // ❌ REJETER
        if (!adminComment.trim()) {
          alert('⚠️ Un commentaire est requis pour rejeter une validation');
          return;
        }
        
        const result = await taskValidationService.rejectValidation(
          selectedRequest.id,
          user.uid,
          adminComment
        );
        
        console.log('❌ [ADMIN] Validation rejetée:', result);
        alert(`❌ Quête rejetée. L'utilisateur peut la resoumettre.`);
      }
      
      // Recharger les données
      await loadValidationData();
      
      // Fermer le modal
      setShowValidationModal(false);
      setSelectedRequest(null);
      setAdminComment('');
      
    } catch (error) {
      console.error('❌ [ADMIN] Erreur validation:', error);
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setValidating(false);
    }
  };

  // Formater les dates
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rendu d'une carte de demande
  const RequestCard = ({ request }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{request.taskTitle}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{request.userName || 'Utilisateur'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4" />
          <span className="font-medium">{request.xpAmount} XP</span>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(request.submittedAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertTriangle className="w-4 h-4" />
          <span>{request.difficulty || 'normal'}</span>
        </div>
      </div>

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
              setAdminComment('Quête validée rapidement');
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
          onClick={() => !validating && setShowValidationModal(false)}
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
                <h2 className="text-xl font-bold text-gray-900">Validation de quête</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.taskTitle}</p>
              </div>
              <button
                onClick={() => !validating && setShowValidationModal(false)}
                disabled={validating}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Détails de la soumission */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Détails de la soumission</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Utilisateur :</span>
                    <span className="ml-2 font-medium">{selectedRequest.userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Soumis le :</span>
                    <span className="ml-2 font-medium">{formatDate(selectedRequest.submittedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Difficulté :</span>
                    <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      {selectedRequest.difficulty || 'normal'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">XP à attribuer :</span>
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      <Zap className="w-3 h-3" />
                      <span className="font-bold">{selectedRequest.xpAmount} XP</span>
                    </div>
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
                  Commentaire administrateur {!adminComment.trim() && selectedRequest && '(optionnel pour approbation, requis pour rejet)'}
                </label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Ajoutez un commentaire pour l'utilisateur..."
                  rows={3}
                  disabled={validating}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />
              </div>

              {/* Info XP */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
                <Zap className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Attribution automatique des XP</p>
                  <p className="text-sm text-yellow-700">
                    En approuvant, <strong>{selectedRequest.xpAmount} XP</strong> seront automatiquement attribués à l'utilisateur
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => !validating && setShowValidationModal(false)}
                disabled={validating}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                <span>{validating ? 'Validation...' : 'Approuver et attribuer XP'}</span>
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
              <h1 className="text-2xl font-bold">Validation des Quêtes</h1>
              <p className="opacity-90">Examinez et validez les soumissions d'équipe avec attribution XP automatique</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approuvées</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aujourd'hui</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Demandes en attente</h2>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Aucune demande en attente
            </h3>
            <p className="text-gray-500">
              Toutes les quêtes soumises ont été traitées !
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {pendingRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <ValidationModal />
    </div>
  );
};

export default AdminValidationPanel;
