// ==========================================
// 📁 react-app/src/pages/AdminRewardsPage.jsx
// PAGE D'ADMINISTRATION DES RÉCOMPENSES
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Crown, 
  Star, 
  Users, 
  Clock, 
  Sparkles,
  CheckCircle,
  X,
  Eye,
  User,
  Calendar,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Award,
  Gift,
  Target,
  Coins,
  Activity
} from 'lucide-react';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';
import { useRewardsStore } from '../shared/stores/rewardsStore.js';

/**
 * 👑 PAGE D'ADMINISTRATION DES RÉCOMPENSES
 */
const AdminRewardsPage = () => {
  const { user } = useAuthStore();
  const {
    pendingRequests,
    loading,
    error,
    loadPendingRequests,
    approveRequest,
    rejectRequest,
    startListeningToPendingRequests,
    stopListeningToPendingRequests,
    clearError
  } = useRewardsStore();

  // États locaux
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'approve', 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Statistiques simulées pour la démo
  const [adminStats, setAdminStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedToday: 0,
    totalXpDistributed: 0,
    mostRequestedReward: 'Pizza du midi',
    activeUsers: 45
  });

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      loadPendingRequests();
      startListeningToPendingRequests();
      
      // Simuler des statistiques
      setAdminStats({
        totalRequests: 156,
        pendingRequests: pendingRequests.length,
        approvedToday: 8,
        totalXpDistributed: 12450,
        mostRequestedReward: 'Pizza du midi',
        activeUsers: 45
      });
    }

    return () => {
      stopListeningToPendingRequests();
    };
  }, [user, loadPendingRequests, startListeningToPendingRequests, stopListeningToPendingRequests]);

  // Mettre à jour les stats quand les demandes changent
  useEffect(() => {
    setAdminStats(prev => ({
      ...prev,
      pendingRequests: pendingRequests.length
    }));
  }, [pendingRequests]);

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadPendingRequests();
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * ✅ APPROUVER UNE DEMANDE
   */
  const handleApprove = async (request) => {
    try {
      const userCurrentXP = request.userData?.gamification?.totalXp || 0;
      await approveRequest(request.id, user.uid, userCurrentXP);
      setShowModal(false);
      setSelectedRequest(null);
      alert('✅ Demande approuvée avec succès !');
    } catch (error) {
      console.error('❌ Erreur approbation:', error);
      alert('❌ Erreur lors de l\'approbation : ' + error.message);
    }
  };

  /**
   * ❌ REJETER UNE DEMANDE
   */
  const handleReject = async (request) => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Veuillez indiquer une raison pour le rejet');
      return;
    }

    try {
      await rejectRequest(request.id, user.uid, rejectionReason);
      setShowModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      alert('❌ Demande rejetée avec succès');
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      alert('❌ Erreur lors du rejet : ' + error.message);
    }
  };

  /**
   * 👁️ OUVRIR LE MODAL DE DÉTAIL
   */
  const openModal = (request, type = 'view') => {
    setSelectedRequest(request);
    setModalType(type);
    setShowModal(true);
  };

  /**
   * 🎁 OBTENIR LES DÉTAILS D'UNE RÉCOMPENSE
   */
  const getRewardDetails = (rewardId) => {
    // Simuler la récupération des détails de récompense
    const rewardMap = {
      'snack_personal': { name: 'Goûter personnalisé', xpCost: 50, category: 'Mini-plaisirs' },
      'pizza_lunch': { name: 'Pizza du midi', xpCost: 380, category: 'Plaisirs utiles' },
      'cinema_tickets': { name: '2 places de cinéma', xpCost: 1100, category: 'Loisirs & sorties' },
      'streaming_subscription': { name: 'Abonnement streaming', xpCost: 1600, category: 'Lifestyle & bonus' }
    };
    
    return rewardMap[rewardId] || { name: rewardId, xpCost: '???', category: 'Inconnue' };
  };

  /**
   * 📊 FORMATER UNE DATE
   */
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
      return 'Date invalide';
    }
  };

  // Filtrer les demandes
  const filteredRequests = pendingRequests.filter(request => {
    const matchSearch = !searchTerm || 
      request.userData?.profile?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.rewardId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && pendingRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Chargement de l'administration...</h2>
          <p className="text-gray-400 mt-2">Synchronisation avec Firebase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête administrateur */}
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
                Gérer les demandes de récompenses et les validations
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Statistiques administrateur */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Demandes en attente */}
            <motion.div 
              className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">En attente</p>
                  <p className="text-2xl font-bold text-yellow-300">{adminStats.pendingRequests}</p>
                </div>
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </motion.div>

            {/* Total demandes */}
            <motion.div 
              className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total demandes</p>
                  <p className="text-2xl font-bold text-blue-300">{adminStats.totalRequests}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </motion.div>

            {/* Approuvées aujourd'hui */}
            <motion.div 
              className="bg-green-600/20 border border-green-500/50 rounded-xl p-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Approuvées aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-300">{adminStats.approvedToday}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </motion.div>

            {/* XP distribués */}
            <motion.div 
              className="bg-purple-600/20 border border-purple-500/50 rounded-xl p-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">XP distribués</p>
                  <p className="text-2xl font-bold text-purple-300">{adminStats.totalXpDistributed.toLocaleString()}</p>
                </div>
                <Coins className="w-6 h-6 text-purple-400" />
              </div>
            </motion.div>

            {/* Utilisateurs actifs */}
            <motion.div 
              className="bg-orange-600/20 border border-orange-500/50 rounded-xl p-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-400 text-sm font-medium">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-orange-300">{adminStats.activeUsers}</p>
                </div>
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </motion.div>

            {/* Plus demandée */}
            <motion.div 
              className="bg-pink-600/20 border border-pink-500/50 rounded-xl p-4"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-400 text-sm font-medium">Plus demandée</p>
                  <p className="text-sm font-bold text-pink-300">{adminStats.mostRequestedReward}</p>
                </div>
                <Trophy className="w-6 h-6 text-pink-400" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              {/* Barre de recherche */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par utilisateur ou récompense..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvées</option>
                  <option value="rejected">Rejetées</option>
                </select>
              </div>

              {/* Actions rapides */}
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Paramètres</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des demandes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredRequests.length === 0 ? (
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 text-center"
              variants={itemVariants}
            >
              <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {pendingRequests.length === 0 ? 'Aucune demande en attente' : 'Aucun résultat trouvé'}
              </h3>
              <p className="text-gray-400">
                {pendingRequests.length === 0 
                  ? 'Toutes les demandes ont été traitées ! 🎉' 
                  : 'Essayez de modifier vos critères de recherche.'
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => {
                const rewardDetails = getRewardDetails(request.rewardId);
                const userName = request.userData?.profile?.displayName || 
                                request.userData?.email?.split('@')[0] || 
                                'Utilisateur inconnu';
                const userXP = request.userData?.gamification?.totalXp || 0;
                const canAfford = userXP >= rewardDetails.xpCost;

                return (
                  <motion.div
                    key={request.id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
                    variants={itemVariants}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-white text-lg">{rewardDetails.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              canAfford ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                              {rewardDetails.xpCost} XP
                            </span>
                            <span className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-xs">
                              {rewardDetails.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{userName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(request.requestedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4" />
                              <span>{userXP} XP disponibles</span>
                            </div>
                          </div>

                          {!canAfford && (
                            <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>⚠️ Utilisateur n'a pas assez d'XP ({userXP}/{rewardDetails.xpCost})</span>
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

        {/* Modal de détail/action */}
        {showModal && selectedRequest && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
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
                      <span className="text-white ml-2">
                        {selectedRequest.userData?.profile?.displayName || 'Non renseigné'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white ml-2">
                        {selectedRequest.userData?.email || 'Non renseigné'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">XP actuels:</span>
                      <span className="text-blue-400 ml-2 font-bold">
                        {selectedRequest.userData?.gamification?.totalXp || 0} XP
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Niveau:</span>
                      <span className="text-purple-400 ml-2 font-bold">
                        {selectedRequest.userData?.gamification?.level || 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Détails de la récompense */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Récompense demandée</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Nom:</span>
                      <span className="text-white ml-2">{getRewardDetails(selectedRequest.rewardId).name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Coût:</span>
                      <span className="text-yellow-400 ml-2 font-bold">
                        {getRewardDetails(selectedRequest.rewardId).xpCost} XP
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Catégorie:</span>
                      <span className="text-white ml-2">{getRewardDetails(selectedRequest.rewardId).category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Demandée le:</span>
                      <span className="text-white ml-2">{formatDate(selectedRequest.requestedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Vérifications */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Vérifications</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {(selectedRequest.userData?.gamification?.totalXp || 0) >= getRewardDetails(selectedRequest.rewardId).xpCost ? (
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

                {/* Actions selon le type de modal */}
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
                      disabled={(selectedRequest.userData?.gamification?.totalXp || 0) < getRewardDetails(selectedRequest.rewardId).xpCost}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
          </motion.div>
        )}

        {/* Message d'erreur */}
        {error && (
          <motion.div
            className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-2 text-red-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminRewardsPage;
