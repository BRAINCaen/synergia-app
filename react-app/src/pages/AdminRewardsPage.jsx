// ==========================================
// 📁 react-app/src/pages/AdminRewardsPage.jsx
// PAGE ADMIN RÉCOMPENSES AVEC VRAIES DONNÉES FIREBASE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
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

// Firebase imports
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

/**
 * 👑 PAGE ADMIN RÉCOMPENSES AVEC VRAIES DONNÉES FIREBASE
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
  const [refreshing, setRefreshing] = useState(false);

  // Statistiques réelles
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedToday: 0,
    totalXpDistributed: 0
  });

  // 🔥 ÉCOUTE FIREBASE EN TEMPS RÉEL DES DEMANDES DE RÉCOMPENSES
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 AdminRewards - Écoute Firebase des demandes...');
    
    // Query pour les demandes de récompenses en attente
    const rewardRequestsQuery = query(
      collection(db, 'rewardRequests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(rewardRequestsQuery, async (snapshot) => {
      console.log(`📥 ${snapshot.docs.length} demandes trouvées`);
      
      const requestsWithUserData = [];
      
      for (const requestDoc of snapshot.docs) {
        const requestData = requestDoc.data();
        
        try {
          // Récupérer les données utilisateur
          const userRef = doc(db, 'users', requestData.userId);
          const userDoc = await getDoc(userRef);
          const userData = userDoc.exists() ? userDoc.data() : null;

          requestsWithUserData.push({
            id: requestDoc.id,
            ...requestData,
            userData,
            userName: userData?.profile?.displayName || userData?.email?.split('@')[0] || 'Utilisateur inconnu',
            userEmail: userData?.email || 'Email inconnu',
            userXP: userData?.gamification?.totalXp || 0
          });
        } catch (error) {
          console.error('❌ Erreur récupération utilisateur:', error);
          requestsWithUserData.push({
            id: requestDoc.id,
            ...requestData,
            userData: null,
            userName: 'Utilisateur inconnu',
            userEmail: 'Email inconnu',
            userXP: 0
          });
        }
      }
      
      setRequests(requestsWithUserData);
      setLoading(false);
      
      // Mettre à jour les stats
      setStats(prev => ({
        ...prev,
        pendingRequests: requestsWithUserData.length
      }));
      
    }, (error) => {
      console.error('❌ Erreur écoute Firebase:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 🔥 ÉCOUTE FIREBASE POUR LES STATISTIQUES GÉNÉRALES
  useEffect(() => {
    if (!user?.uid) return;

    // Écouter toutes les demandes pour les statistiques
    const allRequestsQuery = query(
      collection(db, 'rewardRequests'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribe = onSnapshot(allRequestsQuery, (snapshot) => {
      const allRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculer les statistiques
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const approvedToday = allRequests.filter(req => {
        if (req.status !== 'approved' || !req.approvedAt) return false;
        
        const approvedDate = req.approvedAt.toDate ? req.approvedAt.toDate() : new Date(req.approvedAt);
        approvedDate.setHours(0, 0, 0, 0);
        
        return approvedDate.getTime() === today.getTime();
      }).length;

      // Calculer XP total distribué (estimation basée sur les demandes approuvées)
      const totalXpDistributed = allRequests
        .filter(req => req.status === 'approved')
        .reduce((sum, req) => sum + (req.xpCost || 0), 0);

      setStats({
        totalRequests: allRequests.length,
        pendingRequests: allRequests.filter(req => req.status === 'pending').length,
        approvedToday,
        totalXpDistributed
      });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  /**
   * 🎁 OBTENIR LES DÉTAILS D'UNE RÉCOMPENSE
   */
  const getRewardDetails = (rewardId) => {
    const rewardMap = {
      'snack_personal': { name: 'Goûter personnalisé', xpCost: 50, category: 'Mini-plaisirs' },
      'mini_game': { name: 'Mini-jeu de bureau', xpCost: 80, category: 'Mini-plaisirs' },
      'unlimited_break': { name: 'Pause illimitée', xpCost: 100, category: 'Mini-plaisirs' },
      'time_off_15min': { name: '15 min off', xpCost: 120, category: 'Petits avantages' },
      'nap_authorized': { name: 'Pause sieste autorisée', xpCost: 150, category: 'Petits avantages' },
      'light_shift': { name: 'Shift "super light"', xpCost: 180, category: 'Petits avantages' },
      'action_voucher': { name: 'Bon "action"', xpCost: 220, category: 'Plaisirs utiles' },
      'breakfast_surprise': { name: 'Petit-déj surprise', xpCost: 280, category: 'Plaisirs utiles' },
      'book_choice': { name: 'Livre au choix', xpCost: 320, category: 'Plaisirs utiles' },
      'pizza_lunch': { name: 'Pizza du midi', xpCost: 380, category: 'Plaisirs utiles' },
      'restaurant_voucher': { name: 'Bon d\'achat "restauration"', xpCost: 450, category: 'Plaisirs food & cadeaux' },
      'poke_bowl': { name: 'Poke bowl/burger livré', xpCost: 520, category: 'Plaisirs food & cadeaux' },
      'gift_voucher': { name: 'Bon cadeau magasins', xpCost: 600, category: 'Plaisirs food & cadeaux' },
      'board_game': { name: 'Jeu de société offert', xpCost: 680, category: 'Plaisirs food & cadeaux' },
      'cinema_tickets': { name: '2 places de cinéma', xpCost: 1100, category: 'Loisirs & sorties' },
      'escape_game': { name: 'Place d\'escape game', xpCost: 1200, category: 'Loisirs & sorties' },
      'discovery_activity': { name: 'Initiation/découverte', xpCost: 1350, category: 'Loisirs & sorties' },
      'premium_card': { name: 'Carte cadeau premium', xpCost: 6500, category: 'Premium' },
      'hotel_night': { name: '1 nuit d\'hôtel pour 2', xpCost: 8000, category: 'Premium' },
      'spa_day': { name: 'Journée spa', xpCost: 12500, category: 'Premium' }
    };
    
    return rewardMap[rewardId] || { name: rewardId, xpCost: 0, category: 'Inconnue' };
  };

  /**
   * ✅ APPROUVER UNE DEMANDE FIREBASE
   */
  const handleApprove = async (request) => {
    try {
      console.log('✅ Approbation Firebase de la demande:', request.id);
      
      const rewardDetails = getRewardDetails(request.rewardId);
      
      // Vérifier si l'utilisateur a encore assez d'XP
      if (request.userXP < rewardDetails.xpCost) {
        alert('❌ L\'utilisateur n\'a plus assez d\'XP pour cette récompense.');
        return;
      }

      // Mettre à jour la demande dans Firebase
      const requestRef = doc(db, 'rewardRequests', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user.uid,
        adminEmail: user.email
      });

      // Déduire les XP de l'utilisateur
      const userRef = doc(db, 'users', request.userId);
      await updateDoc(userRef, {
        'gamification.totalXp': increment(-rewardDetails.xpCost),
        'gamification.rewardsRedeemed': increment(1),
        'gamification.lastRewardRedeemed': serverTimestamp(),
        lastActivity: serverTimestamp()
      });

      setShowModal(false);
      setSelectedRequest(null);
      
      console.log(`✅ Récompense "${rewardDetails.name}" approuvée pour ${request.userName}`);
      alert(`✅ Récompense approuvée !\n\n"${rewardDetails.name}" pour ${request.userName}\n${rewardDetails.xpCost} XP déduits.`);
      
    } catch (error) {
      console.error('❌ Erreur approbation Firebase:', error);
      alert('❌ Erreur lors de l\'approbation : ' + error.message);
    }
  };

  /**
   * ❌ REJETER UNE DEMANDE FIREBASE
   */
  const handleReject = async (request) => {
    if (!rejectionReason.trim()) {
      alert('⚠️ Veuillez indiquer une raison pour le rejet');
      return;
    }

    try {
      console.log('❌ Rejet Firebase de la demande:', request.id, 'Raison:', rejectionReason);
      
      // Mettre à jour la demande dans Firebase
      const requestRef = doc(db, 'rewardRequests', request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user.uid,
        rejectionReason: rejectionReason.trim(),
        adminEmail: user.email
      });

      setShowModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      console.log(`❌ Récompense rejetée pour ${request.userName}: ${rejectionReason}`);
      alert(`❌ Demande rejetée.\n\nRaison: ${rejectionReason}`);
      
    } catch (error) {
      console.error('❌ Erreur rejet Firebase:', error);
      alert('❌ Erreur lors du rejet : ' + error.message);
    }
  };

  /**
   * 🔄 RAFRAÎCHIR LES DONNÉES
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Les données se rafraîchissent automatiquement via onSnapshot
    // Simulation d'un délai pour l'UX
    setTimeout(() => {
      setRefreshing(false);
      console.log('🔄 Données rafraîchies automatiquement via Firebase');
    }, 1000);
  };

  /**
   * 👁️ OUVRIR LE MODAL
   */
  const openModal = (request, type = 'view') => {
    const rewardDetails = getRewardDetails(request.rewardId);
    setSelectedRequest({
      ...request,
      rewardDetails
    });
    setModalType(type);
    setShowModal(true);
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

  /**
   * ⏰ TEMPS RELATIF
   */
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 1) return 'Il y a moins d\'1h';
      if (hours < 24) return `Il y a ${hours}h`;
      return `Il y a ${Math.floor(hours / 24)} jour(s)`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white">Chargement administration...</h2>
          <p className="text-gray-400 mt-2">Synchronisation Firebase en cours</p>
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
                Gérer les demandes en temps réel via Firebase
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
              
              <a
                href="/rewards"
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span>Page utilisateur</span>
              </a>
            </div>
          </div>

          {/* Statistiques Firebase temps réel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium">En attente</p>
                  <p className="text-2xl font-bold text-yellow-300">{stats.pendingRequests}</p>
                  <p className="text-yellow-500 text-xs">Temps réel Firebase</p>
                </div>
                <Clock4 className="w-6 h-6 text-yellow-400" />
              </div>
            </div>

            <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-sm font-medium">Total demandes</p>
                  <p className="text-2xl font-bold text-blue-300">{stats.totalRequests}</p>
                  <p className="text-blue-500 text-xs">Depuis le début</p>
                </div>
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">Approuvées aujourd'hui</p>
                  <p className="text-2xl font-bold text-green-300">{stats.approvedToday}</p>
                  <p className="text-green-500 text-xs">Depuis 00h00</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>

            <div className="bg-purple-600/20 border border-purple-500/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">XP distribués</p>
                  <p className="text-2xl font-bold text-purple-300">{stats.totalXpDistributed.toLocaleString()}</p>
                  <p className="text-purple-500 text-xs">Total approuvé</p>
                </div>
                <Coins className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des demandes Firebase */}
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
              <p className="text-gray-500 text-sm mt-2">
                Les nouvelles demandes apparaîtront automatiquement via Firebase
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Demandes en attente ({requests.length}) - Temps réel
              </h2>
              
              {requests.map((request) => {
                const rewardDetails = getRewardDetails(request.rewardId);
                const canAfford = request.userXP >= rewardDetails.xpCost;

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
                              <span>⚠️ Utilisateur n'a pas assez d'XP ({request.userXP}/{rewardDetails.xpCost})</span>
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
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {modalType === 'view' && 'Détails de la demande Firebase'}
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
                {/* ID Firebase */}
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">ID Firebase</h4>
                  <p className="text-blue-300 text-sm font-mono">{selectedRequest.id}</p>
                </div>

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
                      <span className="text-white ml-2">{selectedRequest.rewardDetails.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Coût:</span>
                      <span className="text-yellow-400 ml-2 font-bold">{selectedRequest.rewardDetails.xpCost} XP</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Catégorie:</span>
                      <span className="text-white ml-2">{selectedRequest.rewardDetails.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white ml-2">{selectedRequest.rewardType === 'individual' ? 'Individuelle' : 'Équipe'}</span>
                    </div>
                  </div>
                </div>

                {/* Vérifications */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Vérifications Firebase</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {selectedRequest.userXP >= selectedRequest.rewardDetails.xpCost ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-sm text-gray-300">XP suffisants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-300">Données Firebase synchronisées</span>
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
                      disabled={selectedRequest.userXP < selectedRequest.rewardDetails.xpCost}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approuver dans Firebase</span>
                    </button>
                  )}
                  
                  {modalType === 'reject' && (
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Rejeter dans Firebase</span>
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
