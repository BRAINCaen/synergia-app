// ==========================================
// 📁 react-app/src/pages/AdminRewardsPage.jsx
// PAGE ADMIN RÉCOMPENSES SIMPLE ET FONCTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Crown, 
  CheckCircle, 
  X, 
  Eye, 
  User, 
  Calendar, 
  AlertCircle, 
  BarChart3, 
  RefreshCw, 
  Gift, 
  Coins,
  Clock4,
  MessageSquare
} from 'lucide-react';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 👑 PAGE ADMIN RÉCOMPENSES SIMPLE
 */
const AdminRewardsPage = () => {
  const { user } = useAuthStore();
  
  // États locaux
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [rejectionReason, setRejectionReason] = useState('');

  // Statistiques simulées
  const [stats] = useState({
    totalRequests: 24,
    pendingRequests: 3,
    approvedToday: 8,
    totalXpDistributed: 12450
  });

  // Charger les demandes simulées
  useEffect(() => {
    const mockRequests = [
      {
        id: '1',
        userId: 'user1',
        rewardId: 'pizza_lunch',
        rewardName: 'Pizza du midi',
        rewardCost: 380,
        userName: 'Alice Martin',
        userEmail: 'alice@synergia.com',
        userXP: 450,
        status: 'pending',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
        type: 'individual'
      },
      {
        id: '2',
        userId: 'user2',
        rewardId: 'cinema_tickets',
        rewardName: '2 places de cinéma',
        rewardCost: 1100,
        userName: 'Bob Dupont',
        userEmail: 'bob@synergia.com',
        userXP: 1200,
        status: 'pending',
        requestedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // Il y a 5h
        type: 'individual'
      },
      {
        id: '3',
        userId: 'user3',
        rewardId: 'snack_personal',
        rewardName: 'Goûter personnalisé',
        rewardCost: 50,
        userName: 'Claire Moreau',
        userEmail: 'claire@synergia.com',
        userXP: 75,
        status: 'pending',
        requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
        type: 'individual'
      }
    ];

    setRequests(mockRequests);
    setLoading(false);
  }, []);

  /**
   * ✅ APPROUVER UNE DEMANDE
   */
  const handleApprove = (request) => {
    console.log('✅ Approbation de la demande:', request.id);
    
    // Retirer de la liste
    setRequests(prev => prev.filter(r => r.id !== request.id));
    setShowModal(false);
    setSelectedRequest(null);
    
    alert(`✅ Demande approuvée !\n\n"${request.rewardName}" pour ${request.userName}\n${request.rewardCost} XP déduits.`);
  };

  /**
   * ❌ REJETER UNE DEMANDE
   */
  const handleReject = (request) => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Veuillez indiquer une raison pour le rejet');
      return;
    }

    console.log('❌ Rejet de la demande:', request.id, 'Raison:', rejectionReason);
    
    // Retirer de la liste
    setRequests(prev => prev.filter(r => r.id !== request.id));
    setShowModal(false);
    setSelectedRequest(null);
    setRejectionReason('');
    
    alert(`❌ Demande rejetée.\n\nRaison: ${rejectionReason}`);
  };

  /**
   * 👁️ OUVRIR LE MODAL
   */
  const openModal = (request, type = 'view') => {
    setSelectedRequest(request);
    setModalType(type);
    setShowModal(true);
  };

  /**
   * 📊 FORMATER UNE DATE
   */
  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * ⏰ TEMPS RELATIF
   */
  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Il y a moins d\'1h';
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)} jour(s)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Chargement administration...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête admin */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent flex items-center">
                <Shield className="w-10 h-10 mr-4 text-red-400" />
                Administration des Récompenses
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Gérer les demandes et validations
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <a
                href="/rewards"
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span>Page utilisateur</span>
              </a>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">En attente</p>
                  <p className="text-2xl font-bold text-yellow-300">{requests.length}</p>
                </div>
                <Clock4 className="w-6 h-6 text-yellow-400" />
              </div>
            </div>

            <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total demandes</p>
                  <p className="text-2xl font-bold text-blue-300">{stats.totalRequests}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Approuvées aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-300">{stats.approvedToday}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>

            <div className="bg-purple-600/20 border border-purple-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">XP distribués</p>
                  <p className="text-2xl font-bold text-purple-300">{stats.totalXpDistributed.toLocaleString()}</p>
                </div>
                <Coins className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des demandes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {requests.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Aucune demande en attente</h3>
              <p className="text-gray-400">Toutes les demandes ont été traitées ! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Demandes en attente ({requests.length})
              </h2>
              
              {requests.map((request) => {
                const canAfford = request.userXP >= request.rewardCost;

                return (
                  <motion.div
                    key={request.id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-white text-lg">{request.rewardName}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              canAfford ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {request.rewardCost} XP
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{request.userName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{getRelativeTime(request.requestedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4" />
                              <span>{request.userXP} XP disponibles</span>
                            </div>
                          </div>

                          {!canAfford && (
                            <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>⚠️ Utilisateur n'a pas assez d'XP ({request.userXP}/{request.rewardCost})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openModal(request, 'view')}
                          className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => openModal(request, 'approve')}
                          disabled={!canAfford}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approuver"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => openModal(request, 'reject')}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          title="Rejeter"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Modal d'action */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {modalType === 'view' && 'Détails de la demande'}
                  {modalType === 'approve' && 'Approuver la demande'}
                  {modalType === 'reject' && 'Rejeter la demande'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Détails de la demande */}
              <div className="space-y-6">
                {/* Informations utilisateur */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Informations utilisateur</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Nom:</span>
                      <span className="text-white ml-2">{selectedRequest.userName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white ml-2">{selectedRequest.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">XP actuels:</span>
                      <span className="text-blue-400 ml-2 font-bold">{selectedRequest.userXP} XP</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Demandée le:</span>
                      <span className="text-white ml-2">{formatDate(selectedRequest.requestedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Détails de la récompense */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Récompense demandée</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Nom:</span>
                      <span className="text-white ml-2">{selectedRequest.rewardName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Coût:</span>
                      <span className="text-yellow-400 ml-2 font-bold">{selectedRequest.rewardCost} XP</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white ml-2">{selectedRequest.type === 'individual' ? 'Individuelle' : 'Équipe'}</span>
                    </div>
                  </div>
                </div>

                {/* Vérifications */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Vérifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {selectedRequest.userXP >= selectedRequest.rewardCost ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-sm text-gray-300">XP suffisants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Utilisateur actif</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Demande valide</span>
                    </div>
                  </div>
                </div>

                {/* Zone de rejet */}
                {modalType === 'reject' && (
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-3">Raison du rejet</h4>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez pourquoi cette demande est rejetée..."
                      className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  
                  {modalType === 'approve' && (
                    <button
                      onClick={() => handleApprove(selectedRequest)}
                      disabled={selectedRequest.userXP < selectedRequest.rewardCost}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approuver</span>
                    </button>
                  )}
                  
                  {modalType === 'reject' && (
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Rejeter</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRewardsPage;
