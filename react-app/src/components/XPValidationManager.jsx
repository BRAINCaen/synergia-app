// components/XPValidationManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  EyeIcon,
  UserCircleIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import teamService from '../core/services/teamService';
import { useAuthStore } from '../core/stores/authStore';
import toast from 'react-hot-toast';

const XPValidationManager = ({ teamId }) => {
  const { user } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teamId) return;

    // Charger les demandes en attente
    loadPendingRequests();

    // S'abonner aux changements en temps réel
    const unsubscribe = teamService.subscribeToPendingXPRequests(teamId, (requests) => {
      setPendingRequests(requests);
    });

    return () => unsubscribe();
  }, [teamId]);

  const loadPendingRequests = async () => {
    try {
      const requests = await teamService.getPendingXPRequests(teamId);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Erreur chargement demandes XP:', error);
      toast.error('Erreur lors du chargement des demandes');
    }
  };

  const handleValidation = async (requestId, decision) => {
    setLoading(true);
    try {
      await teamService.validateXPRequest(requestId, user.uid, decision, feedback);
      
      toast.success(
        decision === 'approved' 
          ? '✅ XP validés et attribués!' 
          : '❌ Demande refusée'
      );
      
      setShowModal(false);
      setSelectedRequest(null);
      setFeedback('');
    } catch (error) {
      console.error('Erreur validation XP:', error);
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const openValidationModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    setFeedback('');
  };

  const getRequestPriorityColor = (xpAmount) => {
    if (xpAmount >= 50) return 'text-red-500';
    if (xpAmount >= 25) return 'text-orange-500';
    return 'text-green-500';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const requestTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMinutes = Math.floor((now - requestTime) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}j`;
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
        <div className="text-center py-8">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Toutes les demandes traitées!
          </h3>
          <p className="text-gray-400">
            Aucune demande de validation XP en attente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Validation XP
            </h2>
            <p className="text-purple-100">
              {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente
            </p>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <ClockIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {pendingRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                {/* Informations utilisateur */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {request.user?.photoURL ? (
                      <img
                        src={request.user.photoURL}
                        alt={request.user.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-white">
                        {request.user?.displayName || request.user?.email || 'Utilisateur inconnu'}
                      </h3>
                      <span className="text-sm text-gray-400">
                        • {getTimeAgo(request.requestedAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-3">
                      {request.description || 'Aucune description fournie'}
                    </p>
                    
                    {request.evidence && (
                      <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-300">
                          <strong>Preuves:</strong> {request.evidence}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <StarIcon className={`w-4 h-4 ${getRequestPriorityColor(request.xpAmount)}`} />
                        <span className={`font-semibold ${getRequestPriorityColor(request.xpAmount)}`}>
                          +{request.xpAmount} XP
                        </span>
                      </div>
                      
                      {request.taskId && (
                        <span className="text-gray-400">
                          Tâche #{request.taskId.slice(-6)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openValidationModal(request)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Examiner</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de validation */}
      <AnimatePresence>
        {showModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* En-tête modal */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Validation de demande XP
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Détails de la demande */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    {selectedRequest.user?.photoURL ? (
                      <img
                        src={selectedRequest.user.photoURL}
                        alt={selectedRequest.user.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {selectedRequest.user?.displayName || selectedRequest.user?.email}
                      </p>
                      <p className="text-sm text-gray-400">
                        Demandé {getTimeAgo(selectedRequest.requestedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300">XP demandés:</span>
                      <span className={`font-bold text-lg ${getRequestPriorityColor(selectedRequest.xpAmount)}`}>
                        +{selectedRequest.xpAmount} XP
                      </span>
                    </div>
                    
                    {selectedRequest.description && (
                      <div className="mb-3">
                        <span className="text-gray-300 block mb-1">Description:</span>
                        <p className="text-white">{selectedRequest.description}</p>
                      </div>
                    )}
                    
                    {selectedRequest.evidence && (
                      <div>
                        <span className="text-gray-300 block mb-1">Preuves:</span>
                        <p className="text-white">{selectedRequest.evidence}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback admin */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ajouter un commentaire sur cette validation..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleValidation(selectedRequest.id, 'approved')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{loading ? 'Validation...' : 'Approuver'}</span>
                  </button>
                  
                  <button
                    onClick={() => handleValidation(selectedRequest.id, 'rejected')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    <span>{loading ? 'Rejet...' : 'Rejeter'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default XPValidationManager;
