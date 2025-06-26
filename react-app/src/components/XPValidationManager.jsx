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
import { useToast } from '../shared/components/ui/Toast.jsx';

const XPValidationManager = ({ teamId }) => {
  const { user } = useAuthStore();
  const { success, error } = useToast();
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
    } catch (err) {
      console.error('Erreur chargement demandes XP:', err);
      error('Erreur lors du chargement des demandes');
    }
  };

  const handleValidation = async (requestId, decision) => {
    setLoading(true);
    try {
      await teamService.validateXPRequest(requestId, user.uid, decision, feedback);
      
      success(
        decision === 'approved' 
          ? '✅ XP validés et attribués!' 
          : '❌ Demande refusée'
      );
      
      setShowModal(false);
      setSelectedRequest(null);
      setFeedback('');
    } catch (err) {
      console.error('Erreur validation XP:', err);
      error('Erreur lors de la validation');
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
    const requestTime = timestamp?.toDate ? timestamp.toDate() : timestamp;
    const diffMs = now - requestTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}j`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-100';
      case 'approved': return 'text-green-500 bg-green-100';
      case 'rejected': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune demande XP en attente
        </h3>
        <p className="text-gray-600">
          Toutes les demandes d'XP ont été traitées.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-orange-500" />
            Demandes XP en attente ({pendingRequests.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingRequests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {request.memberName || request.memberId}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status === 'pending' ? 'En attente' : request.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <p className={`text-sm font-semibold ${getRequestPriorityColor(request.xpAmount)}`}>
                        +{request.xpAmount} XP
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.taskTitle || request.reason || 'Tâche complétée'}
                      </p>
                      <p className="text-sm text-gray-400">
                        il y a {getTimeAgo(request.createdAt)}
                      </p>
                    </div>
                    
                    {request.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {request.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openValidationModal(request)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    Examiner
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de validation */}
      <AnimatePresence>
        {showModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Valider la demande XP
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Membre:</span>
                      <p className="font-medium">{selectedRequest.memberName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">XP demandés:</span>
                      <p className="font-medium text-blue-600">+{selectedRequest.xpAmount}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Raison:</span>
                      <p className="font-medium">{selectedRequest.taskTitle || selectedRequest.reason}</p>
                    </div>
                    {selectedRequest.description && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Description:</span>
                        <p className="text-sm">{selectedRequest.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Ajoutez un commentaire..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleValidation(selectedRequest.id, 'approved')}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Approuver
                  </button>
                  <button
                    onClick={() => handleValidation(selectedRequest.id, 'rejected')}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Refuser
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
