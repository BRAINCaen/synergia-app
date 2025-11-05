// ==========================================
// 📁 react-app/src/pages/RewardsPage.jsx
// PAGE RÉCOMPENSES UNIFIÉE - HOOK CENTRAL
// ==========================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Search, Gift, Coins, Users, Clock,
  Plus, Trash2, Settings, AlertCircle, Check, X, Shield
} from 'lucide-react';

import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';
import { useGamificationSync } from '../shared/hooks/useGamificationSync.js';
import { addDoc, updateDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../core/firebase.js';

const RewardsPage = () => {
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);
  
  const {
    gamification,
    rewards,
    rewardRequests,
    userRewardHistory,
    stats,
    loading,
    canAffordReward,
    getAffordableRewards,
    refresh
  } = useGamificationSync();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    xpCost: 100,
    icon: '🎁',
    category: 'Mini-plaisirs',
    type: 'individual'
  });

  // 🎁 DEMANDER UNE RÉCOMPENSE
  const handleRequestReward = async () => {
    if (!selectedReward) return;

    try {
      await addDoc(collection(db, 'rewardRequests'), {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        rewardId: selectedReward.id,
        rewardName: selectedReward.name,
        xpCost: selectedReward.xpCost,
        status: 'pending',
        requestedAt: serverTimestamp()
      });

      showNotification('Demande envoyée !', 'success');
      setShowRequestModal(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('❌ Erreur:', error);
      showNotification('Erreur lors de la demande', 'error');
    }
  };

  // 🛡️ CRÉER RÉCOMPENSE (ADMIN)
  const handleCreateReward = async () => {
    if (!rewardForm.name || !rewardForm.xpCost) {
      showNotification('Remplissez tous les champs', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'rewards'), {
        ...rewardForm,
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      showNotification('Récompense créée !', 'success');
      setShowCreateModal(false);
      setRewardForm({ name: '', description: '', xpCost: 100, icon: '🎁', category: 'Mini-plaisirs', type: 'individual' });
    } catch (error) {
      console.error('❌ Erreur:', error);
      showNotification('Erreur création', 'error');
    }
  };

  // 🛡️ SUPPRIMER RÉCOMPENSE (ADMIN)
  const handleDeleteReward = async (rewardId) => {
    if (!window.confirm('Supprimer cette récompense ?')) return;

    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      showNotification('Récompense supprimée', 'success');
    } catch (error) {
      console.error('❌ Erreur:', error);
      showNotification('Erreur suppression', 'error');
    }
  };

  // 🛡️ VALIDER DEMANDE (ADMIN)
  const handleValidateRequest = async (requestId, action) => {
    try {
      await updateDoc(doc(db, 'rewardRequests', requestId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        processedAt: serverTimestamp(),
        processedBy: user.uid
      });

      showNotification(action === 'approve' ? 'Approuvé !' : 'Rejeté', 'success');
    } catch (error) {
      console.error('❌ Erreur:', error);
      showNotification('Erreur validation', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredRewards = rewards.filter(r =>
    !searchTerm || 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !gamification) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        
        {/* NOTIFICATION */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-10 h-10 text-yellow-400" />
                Boutique de Récompenses
              </h1>
              <p className="text-gray-400 mt-2">
                Dépensez vos XP pour obtenir des avantages exclusifs
              </p>
            </div>

            {userIsAdmin && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
              >
                <Settings className="w-5 h-5" />
                {showAdminPanel ? 'Masquer' : 'Admin'}
              </button>
            )}
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Mes XP</p>
                  <p className="text-2xl font-bold text-white">{gamification.totalXp}</p>
                </div>
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Disponibles</p>
                  <p className="text-2xl font-bold text-white">{rewards.length}</p>
                </div>
                <Gift className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Accessibles</p>
                  <p className="text-2xl font-bold text-white">{getAffordableRewards().length}</p>
                </div>
                <Check className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En attente</p>
                  <p className="text-2xl font-bold text-white">
                    {userRewardHistory.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* RECHERCHE */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white"
            />
          </div>
        </div>

        {/* RÉCOMPENSES */}
        {filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucune récompense</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => {
              const affordable = canAffordReward(reward.xpCost);
              
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gray-800/50 border rounded-xl p-6 cursor-pointer hover:scale-105 transition-transform ${
                    affordable ? 'border-green-500/50' : 'border-gray-700/50'
                  }`}
                  onClick={() => {
                    setSelectedReward(reward);
                    setShowRequestModal(true);
                  }}
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{reward.icon}</div>
                    <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 min-h-[60px]">
                    {reward.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className={`font-bold ${affordable ? 'text-green-400' : 'text-red-400'}`}>
                        {reward.xpCost} XP
                      </span>
                    </div>
                    {affordable ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                  </div>

                  <button
                    className={`w-full py-2 rounded-lg font-semibold ${
                      affordable ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-700 text-gray-400'
                    }`}
                    disabled={!affordable}
                  >
                    {affordable ? 'Demander' : 'XP insuffisants'}
                  </button>

                  {userIsAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReward(reward.id);
                      }}
                      className="w-full mt-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PANEL ADMIN */}
        {userIsAdmin && showAdminPanel && (
          <div className="mt-8 bg-gray-800/50 border border-purple-500/50 rounded-xl p-6">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Administration
              </h2>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">
              Demandes ({rewardRequests.length})
            </h3>

            {rewardRequests.length > 0 ? (
              <div className="space-y-3">
                {rewardRequests.map((request) => (
                  <div key={request.id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-white font-semibold">{request.rewardName}</p>
                        <p className="text-gray-400 text-sm">Par: {request.userName}</p>
                        <p className="text-gray-400 text-sm">Coût: {request.xpCost} XP</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleValidateRequest(request.id, 'approve')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleValidateRequest(request.id, 'reject')}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Aucune demande</p>
            )}
          </div>
        )}

        {/* MODALS */}
        <AnimatePresence>
          {showRequestModal && selectedReward && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  {selectedReward.icon} {selectedReward.name}
                </h3>
                <p className="text-gray-300 mb-4">{selectedReward.description}</p>
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Coût:</span>
                    <span className="text-yellow-400 font-bold">{selectedReward.xpCost} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Votre solde:</span>
                    <span className="text-white font-bold">{gamification.totalXp} XP</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedReward(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRequestReward}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    disabled={!canAffordReward(selectedReward.xpCost)}
                  >
                    Confirmer
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Créer une récompense</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={rewardForm.name}
                    onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <textarea
                    placeholder="Description"
                    value={rewardForm.description}
                    onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows="3"
                  />
                  <input
                    type="number"
                    placeholder="Coût XP"
                    value={rewardForm.xpCost}
                    onChange={(e) => setRewardForm({ ...rewardForm, xpCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Icône"
                    value={rewardForm.icon}
                    onChange={(e) => setRewardForm({ ...rewardForm, icon: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateReward}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Créer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default RewardsPage;
