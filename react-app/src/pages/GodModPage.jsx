// ==========================================
// 📁 react-app/src/pages/GodModPage.jsx
// 🛡️ PAGE GODMOD - CONTRÔLE TOTAL SYSTÈME
// Accessible UNIQUEMENT par alan.boehme61@gmail.com
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Shield,
  Zap,
  Users,
  Award,
  Gift,
  Target,
  TrendingUp,
  TrendingDown,
  X,
  Check,
  AlertTriangle,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  Database,
  Activity
} from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🛡️ PAGE GODMOD - CONTRÔLE TOTAL
 */
const GodModPage = () => {
  const { user } = useAuthStore();
  
  // États
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('validations');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Données
  const [allUsers, setAllUsers] = useState([]);
  const [validations, setValidations] = useState([]);
  const [objectiveClaims, setObjectiveClaims] = useState([]);
  const [rewardRequests, setRewardRequests] = useState([]);
  
  // Modals
  const [showXpModal, setShowXpModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [xpAmount, setXpAmount] = useState(0);
  const [xpReason, setXpReason] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalValidations: 0,
    pendingValidations: 0,
    totalXpDistributed: 0,
    totalUsers: 0
  });

  /**
   * 🔒 VÉRIFICATION ADMIN PRINCIPALE
   */
  const isGodMode = user?.email === 'alan.boehme61@gmail.com';

  /**
   * 📊 CHARGEMENT DES DONNÉES
   */
  useEffect(() => {
    if (isGodMode) {
      loadAllData();
    }
  }, [isGodMode]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [GODMOD] Chargement des données...');

      // Charger tous les utilisateurs
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);

      // Charger toutes les validations de quêtes
      const validationsSnapshot = await getDocs(
        query(collection(db, 'task_validations'), orderBy('submittedAt', 'desc'))
      );
      const validationsData = validationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'task'
      }));
      setValidations(validationsData);

      // Charger toutes les réclamations d'objectifs
      const objectivesSnapshot = await getDocs(
        query(collection(db, 'objective_claims'), orderBy('claimedAt', 'desc'))
      );
      const objectivesData = objectivesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'objective'
      }));
      setObjectiveClaims(objectivesData);

      // Charger toutes les demandes de récompenses
      const rewardsSnapshot = await getDocs(
        query(collection(db, 'reward_requests'), orderBy('requestedAt', 'desc'))
      );
      const rewardsData = rewardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'reward'
      }));
      setRewardRequests(rewardsData);

      // Calculer les stats
      calculateStats(validationsData, objectivesData, usersData);

      console.log('✅ [GODMOD] Données chargées:', {
        users: usersData.length,
        validations: validationsData.length,
        objectives: objectivesData.length,
        rewards: rewardsData.length
      });

    } catch (error) {
      console.error('❌ [GODMOD] Erreur chargement:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (validationsData, objectivesData, usersData) => {
    const totalValidations = validationsData.length + objectivesData.length;
    const pendingValidations = validationsData.filter(v => v.status === 'pending').length +
                               objectivesData.filter(o => o.status === 'pending').length;
    
    const totalXpDistributed = validationsData
      .filter(v => v.status === 'approved')
      .reduce((sum, v) => sum + (v.xpAmount || 0), 0) +
      objectivesData
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + (o.xpReward || 0), 0);

    setStats({
      totalValidations,
      pendingValidations,
      totalXpDistributed,
      totalUsers: usersData.length
    });
  };

  /**
   * ❌ ANNULER UNE VALIDATION (RENDRE LES XP)
   */
  const cancelValidation = async (validation) => {
    if (!confirm(`⚠️ CONFIRMER L'ANNULATION ?\n\nCeci va rendre les ${validation.xpAmount || validation.xpReward} XP à l'utilisateur.\n\nÊtes-vous sûr ?`)) {
      return;
    }

    try {
      console.log('❌ [GODMOD] Annulation validation:', validation.id);

      // Récupérer l'utilisateur
      const userRef = doc(db, 'users', validation.userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();
      const xpToReturn = validation.xpAmount || validation.xpReward || 0;

      // Rendre les XP
      await updateDoc(userRef, {
        'gamification.totalXp': (userData.gamification?.totalXp || 0) - xpToReturn,
        'gamification.xp': (userData.gamification?.xp || 0) - xpToReturn,
        'stats.lastXpUpdate': serverTimestamp()
      });

      // Mettre à jour la validation comme annulée
      const validationCollection = validation.type === 'task' ? 'task_validations' : 
                                   validation.type === 'objective' ? 'objective_claims' : 
                                   'reward_requests';
      
      await updateDoc(doc(db, validationCollection, validation.id), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: user.uid,
        cancelReason: 'Annulé par GODMOD'
      });

      alert(`✅ Validation annulée !\n${xpToReturn} XP rendus à l'utilisateur`);
      await loadAllData();

    } catch (error) {
      console.error('❌ [GODMOD] Erreur annulation:', error);
      alert('Erreur: ' + error.message);
    }
  };

  /**
   * ✏️ MODIFIER LES XP D'UN UTILISATEUR
   */
  const modifyUserXp = async () => {
    if (!selectedUser || xpAmount === 0) {
      alert('⚠️ Veuillez sélectionner un utilisateur et entrer un montant XP');
      return;
    }

    if (!xpReason.trim()) {
      alert('⚠️ Veuillez entrer une raison pour cette modification');
      return;
    }

    try {
      console.log('✏️ [GODMOD] Modification XP:', {
        userId: selectedUser.id,
        amount: xpAmount,
        reason: xpReason
      });

      const userRef = doc(db, 'users', selectedUser.id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();
      const currentXp = userData.gamification?.totalXp || 0;
      const currentLevelXp = userData.gamification?.xp || 0;

      // Appliquer la modification
      await updateDoc(userRef, {
        'gamification.totalXp': currentXp + xpAmount,
        'gamification.xp': currentLevelXp + xpAmount,
        'stats.lastXpUpdate': serverTimestamp(),
        'stats.godModAdjustments': increment(1)
      });

      // Enregistrer l'historique de modification
      await updateDoc(userRef, {
        godModHistory: userData.godModHistory ? 
          [...userData.godModHistory, {
            type: 'xp_modification',
            amount: xpAmount,
            reason: xpReason,
            adjustedBy: user.uid,
            adjustedAt: new Date().toISOString(),
            previousXp: currentXp
          }] :
          [{
            type: 'xp_modification',
            amount: xpAmount,
            reason: xpReason,
            adjustedBy: user.uid,
            adjustedAt: new Date().toISOString(),
            previousXp: currentXp
          }]
      });

      alert(`✅ XP modifié avec succès !\n\nUtilisateur: ${selectedUser.displayName}\nModification: ${xpAmount > 0 ? '+' : ''}${xpAmount} XP\nNouveau total: ${currentXp + xpAmount} XP`);
      
      setShowXpModal(false);
      setSelectedUser(null);
      setXpAmount(0);
      setXpReason('');
      await loadAllData();

    } catch (error) {
      console.error('❌ [GODMOD] Erreur modification XP:', error);
      alert('Erreur: ' + error.message);
    }
  };

  /**
   * 🗑️ SUPPRIMER UN BADGE D'UN UTILISATEUR
   */
  const removeBadge = async (userId, badgeId) => {
    if (!confirm('⚠️ SUPPRIMER CE BADGE ?\n\nCette action est irréversible.')) {
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();
      const currentBadges = userData.gamification?.badges || [];
      const badgeToRemove = currentBadges.find(b => b.id === badgeId);

      if (!badgeToRemove) {
        alert('Badge non trouvé');
        return;
      }

      // Retirer le badge et les XP associés
      const updatedBadges = currentBadges.filter(b => b.id !== badgeId);
      const xpToRemove = badgeToRemove.xpReward || 0;

      await updateDoc(userRef, {
        'gamification.badges': updatedBadges,
        'gamification.badgesUnlocked': updatedBadges.length,
        'gamification.totalXp': (userData.gamification?.totalXp || 0) - xpToRemove,
        'gamification.xp': (userData.gamification?.xp || 0) - xpToRemove,
        'gamification.totalBadgeXp': (userData.gamification?.totalBadgeXp || 0) - xpToRemove
      });

      alert(`✅ Badge supprimé !\n${xpToRemove} XP retirés`);
      await loadAllData();

    } catch (error) {
      console.error('❌ [GODMOD] Erreur suppression badge:', error);
      alert('Erreur: ' + error.message);
    }
  };

  /**
   * 🔄 RECALCULER LES STATS D'UN UTILISATEUR
   */
  const recalculateUserStats = async (userId) => {
    if (!confirm('🔄 RECALCULER LES STATISTIQUES ?\n\nCeci va recalculer tous les XP, badges et niveaux.')) {
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const userData = userSnap.data();

      // Recalculer XP des badges
      const badges = userData.gamification?.badges || [];
      const totalBadgeXp = badges.reduce((sum, badge) => sum + (badge.xpReward || 0), 0);

      // Recalculer les validations approuvées
      const userValidations = validations.filter(
        v => v.userId === userId && v.status === 'approved'
      );
      const totalTaskXp = userValidations.reduce((sum, v) => sum + (v.xpAmount || 0), 0);

      // Calculer le total
      const totalXp = totalBadgeXp + totalTaskXp;

      // Calculer le niveau basé sur les XP
      const level = Math.floor(totalXp / 500) + 1;

      // Mettre à jour
      await updateDoc(userRef, {
        'gamification.totalXp': totalXp,
        'gamification.xp': totalXp,
        'gamification.level': level,
        'gamification.badgesUnlocked': badges.length,
        'gamification.totalBadgeXp': totalBadgeXp,
        'stats.lastRecalculation': serverTimestamp(),
        'stats.recalculatedBy': 'GODMOD'
      });

      alert(`✅ Statistiques recalculées !\n\nTotal XP: ${totalXp}\nNiveau: ${level}\nBadges: ${badges.length}`);
      await loadAllData();

    } catch (error) {
      console.error('❌ [GODMOD] Erreur recalcul:', error);
      alert('Erreur: ' + error.message);
    }
  };

  // 🚫 ACCÈS REFUSÉ
  if (!isGodMode) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-gray-900 to-black">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-12 bg-gradient-to-br from-red-900/20 to-gray-900/20 backdrop-blur-xl rounded-3xl border border-red-500/30 shadow-2xl"
          >
            <Shield className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-500 mb-4">
              🚫 ACCÈS REFUSÉ
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Cette zone est réservée à l'administrateur principal du système.
            </p>
            <p className="text-gray-500 text-sm">
              Seul <span className="text-red-400 font-mono">alan.boehme61@gmail.com</span> peut accéder à GODMOD.
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // 🔄 CHARGEMENT
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black">
          <div className="text-center">
            <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
            <p className="text-white text-xl">Chargement GODMOD...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Filtrer les données selon la recherche
  const filteredUsers = allUsers.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredValidations = validations.filter(v => 
    v.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* 👑 HEADER GODMOD */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-red-500/10 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/30 shadow-2xl mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
                    🛡️ GODMOD
                  </h1>
                  <p className="text-gray-300 mt-1">
                    Contrôle Total du Système Synergia
                  </p>
                  <p className="text-yellow-500 text-sm font-mono">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                  <div className="text-gray-400 text-sm">Utilisateurs</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-white">{stats.totalValidations}</div>
                  <div className="text-gray-400 text-sm">Validations</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-yellow-500">{stats.totalXpDistributed.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">XP Total</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 🔍 BARRE DE RECHERCHE */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher utilisateurs, quêtes, badges..."
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <button
                onClick={loadAllData}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
            </div>
          </motion.div>

          {/* 📊 ONGLETS */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-xl mb-6"
          >
            <div className="flex border-b border-gray-700">
              {[
                { id: 'validations', label: 'Validations', icon: Check, count: validations.length },
                { id: 'users', label: 'Utilisateurs', icon: Users, count: allUsers.length },
                { id: 'corrections', label: 'Corrections', icon: Edit, count: 0 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-3 ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white border-b-4 border-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* 📋 ONGLET VALIDATIONS */}
                {activeTab === 'validations' && (
                  <motion.div
                    key="validations"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <Check className="w-6 h-6 text-green-500" />
                      Gestion des Validations
                    </h2>

                    {filteredValidations.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Aucune validation trouvée</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredValidations.map(validation => (
                          <motion.div
                            key={validation.id}
                            layout
                            className="bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:border-purple-500/50 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    validation.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    validation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    validation.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {validation.status === 'approved' ? '✅ Approuvé' :
                                     validation.status === 'pending' ? '⏳ En attente' :
                                     validation.status === 'rejected' ? '❌ Rejeté' :
                                     '🚫 Annulé'}
                                  </span>
                                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                                    {validation.type === 'task' ? '⚔️ Quête' : '🎯 Objectif'}
                                  </span>
                                </div>

                                <h3 className="text-white font-semibold text-lg mb-2">
                                  {validation.taskTitle || validation.objectiveName || 'Sans titre'}
                                </h3>

                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {validation.userName || 'Utilisateur inconnu'}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span className="text-yellow-500 font-semibold">
                                      +{validation.xpAmount || validation.xpReward || 0} XP
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {validation.submittedAt?.toDate?.()?.toLocaleDateString() || 
                                     validation.claimedAt?.toDate?.()?.toLocaleDateString() || 
                                     'Date inconnue'}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              {validation.status === 'approved' && (
                                <button
                                  onClick={() => cancelValidation(validation)}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                                >
                                  <X className="w-4 h-4" />
                                  Annuler
                                </button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 👥 ONGLET UTILISATEURS */}
                {activeTab === 'users' && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-500" />
                      Gestion des Utilisateurs
                    </h2>

                    <div className="space-y-3">
                      {filteredUsers.map(userItem => (
                        <motion.div
                          key={userItem.id}
                          layout
                          className="bg-gray-900/50 rounded-xl p-5 border border-gray-700 hover:border-blue-500/50 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              {/* Avatar */}
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                {userItem.displayName?.charAt(0) || '?'}
                              </div>

                              {/* Info utilisateur */}
                              <div className="flex-1">
                                <h3 className="text-white font-semibold text-lg mb-1">
                                  {userItem.displayName || 'Sans nom'}
                                </h3>
                                <p className="text-gray-400 text-sm mb-2">{userItem.email}</p>

                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span className="text-yellow-500 font-semibold">
                                      {userItem.gamification?.totalXp || 0} XP
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-gray-400">
                                      Niveau {userItem.gamification?.level || 1}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-purple-500" />
                                    <span className="text-gray-400">
                                      {userItem.gamification?.badges?.length || 0} badges
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowXpModal(true);
                                }}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                XP
                              </button>
                              <button
                                onClick={() => recalculateUserStats(userItem.id)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Recalc
                              </button>
                            </div>
                          </div>

                          {/* Badges de l'utilisateur */}
                          {userItem.gamification?.badges?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="w-4 h-4 text-purple-500" />
                                <span className="text-gray-400 text-sm font-semibold">Badges</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {userItem.gamification.badges.map((badge, idx) => (
                                  <div
                                    key={idx}
                                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold flex items-center gap-2"
                                  >
                                    <span>{badge.name}</span>
                                    <button
                                      onClick={() => removeBadge(userItem.id, badge.id)}
                                      className="hover:text-red-400 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ✏️ ONGLET CORRECTIONS */}
                {activeTab === 'corrections' && (
                  <motion.div
                    key="corrections"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Corrections Rapides</h3>
                    <p className="text-gray-400 mb-6">
                      Outils de correction et de maintenance système
                    </p>

                    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <button
                        onClick={() => {
                          if (confirm('Recalculer tous les XP de tous les utilisateurs ?')) {
                            alert('Fonctionnalité en développement');
                          }
                        }}
                        className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex flex-col items-center gap-3"
                      >
                        <RefreshCw className="w-8 h-8" />
                        Recalcul Global XP
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Nettoyer les données corrompues ?')) {
                            alert('Fonctionnalité en développement');
                          }
                        }}
                        className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex flex-col items-center gap-3"
                      >
                        <Trash2 className="w-8 h-8" />
                        Nettoyage Données
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Synchroniser toutes les collections Firebase ?')) {
                            alert('Fonctionnalité en développement');
                          }
                        }}
                        className="p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all flex flex-col items-center gap-3"
                      >
                        <Database className="w-8 h-8" />
                        Sync Firebase
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Vérifier l\'intégrité des données ?')) {
                            alert('Fonctionnalité en développement');
                          }
                        }}
                        className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex flex-col items-center gap-3"
                      >
                        <Activity className="w-8 h-8" />
                        Vérif Intégrité
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 🎯 MODAL MODIFICATION XP */}
        <AnimatePresence>
          {showXpModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowXpModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Edit className="w-6 h-6 text-purple-500" />
                    Modifier XP
                  </h3>
                  <button
                    onClick={() => setShowXpModal(false)}
                    className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Utilisateur
                    </label>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="text-white font-semibold">{selectedUser.displayName}</div>
                      <div className="text-gray-400 text-sm">{selectedUser.email}</div>
                      <div className="text-yellow-500 text-sm mt-2">
                        XP Actuel: {selectedUser.gamification?.totalXp || 0}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Montant XP (+ ou -)
                    </label>
                    <input
                      type="number"
                      value={xpAmount}
                      onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                      placeholder="Ex: +100 ou -50"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                    {xpAmount !== 0 && (
                      <p className={`mt-2 text-sm font-semibold ${xpAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        Nouveau total: {(selectedUser.gamification?.totalXp || 0) + xpAmount} XP
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">
                      Raison *
                    </label>
                    <textarea
                      value={xpReason}
                      onChange={(e) => setXpReason(e.target.value)}
                      placeholder="Expliquez pourquoi vous modifiez les XP..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowXpModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={modifyUserXp}
                    disabled={xpAmount === 0 || !xpReason.trim()}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Valider
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default GodModPage;
