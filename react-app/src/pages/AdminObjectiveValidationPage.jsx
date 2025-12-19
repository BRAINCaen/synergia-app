// ==========================================
// 📁 react-app/src/pages/AdminObjectiveValidationPage.jsx
// PAGE ADMIN DE GESTION DES CAMPAGNES
// ✅ DESIGN SYNERGIA PREMIUM + FIREBASE SYNC
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Flag,
  Award,
  Search,
  RefreshCw,
  AlertCircle,
  Calendar,
  Eye,
  ArrowLeft,
  Play,
  Pause,
  Trophy,
  Users,
  Sword,
  BarChart3,
  Edit,
  Trash2,
  Crown,
  Star,
  TrendingUp
} from 'lucide-react';

// ✅ IMPORTS SYNERGIA
import Layout from '../components/layout/Layout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminService.js';

// ✅ FIREBASE IMPORTS
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES DE STATUT
const CAMPAIGN_STATUS = {
  planning: {
    label: 'Planification',
    icon: '📋',
    color: 'yellow',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30'
  },
  active: {
    label: 'En cours',
    icon: '⚔️',
    color: 'blue',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30'
  },
  completed: {
    label: 'Terminée',
    icon: '🏆',
    color: 'green',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30'
  },
  on_hold: {
    label: 'En pause',
    icon: '⏸️',
    color: 'orange',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30'
  },
  cancelled: {
    label: 'Annulée',
    icon: '❌',
    color: 'red',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30'
  }
};

/**
 * 🛡️ PAGE ADMIN DE GESTION DES CAMPAGNES
 * Avec synchronisation Firebase temps réel
 */
const AdminObjectiveValidationPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignQuests, setCampaignQuests] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(null);

  // Protection d'accès admin
  if (!user || !isAdmin(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ==========================================
  // 🔥 SYNCHRONISATION FIREBASE TEMPS RÉEL
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [ADMIN-CAMPAIGNS] Initialisation synchronisation Firebase...');
    setLoading(true);

    // Query pour les campagnes (collection projects)
    const campaignsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );

    // Listener temps réel pour les campagnes
    const unsubscribeCampaigns = onSnapshot(
      campaignsQuery,
      async (snapshot) => {
        console.log('✅ [ADMIN-CAMPAIGNS] Campagnes chargées:', snapshot.size);

        const campaignsData = [];

        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();

          try {
            // Récupérer infos du créateur
            let creatorData = {};
            if (data.createdBy) {
              const creatorDoc = await getDoc(doc(db, 'users', data.createdBy));
              creatorData = creatorDoc.exists() ? creatorDoc.data() : {};
            }

            campaignsData.push({
              id: docSnapshot.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              creatorName: creatorData.displayName || creatorData.email || 'Inconnu',
              creatorEmail: creatorData.email || '',
              creatorPhoto: creatorData.photoURL || null,
              membersCount: (data.members?.length || 0) + 1 // +1 pour le créateur
            });
          } catch (error) {
            console.warn('⚠️ Erreur enrichissement campagne:', error);
            campaignsData.push({
              id: docSnapshot.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              creatorName: 'Inconnu',
              membersCount: (data.members?.length || 0) + 1
            });
          }
        }

        setCampaigns(campaignsData);

        // Charger les quêtes pour chaque campagne
        const questsMap = {};
        for (const campaign of campaignsData) {
          const questsQuery = query(
            collection(db, 'tasks'),
            where('projectId', '==', campaign.id)
          );
          const questsSnapshot = await getDocs(questsQuery);
          questsMap[campaign.id] = {
            total: questsSnapshot.size,
            completed: questsSnapshot.docs.filter(d => d.data().status === 'completed' || d.data().status === 'validated').length,
            inProgress: questsSnapshot.docs.filter(d => d.data().status === 'in_progress').length,
            todo: questsSnapshot.docs.filter(d => d.data().status === 'todo').length
          };
        }
        setCampaignQuests(questsMap);

        setLoading(false);
      },
      (error) => {
        console.error('❌ [ADMIN-CAMPAIGNS] Erreur synchronisation:', error);
        setLoading(false);
      }
    );

    // Charger tous les utilisateurs
    const loadUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllUsers(usersData);
      } catch (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
      }
    };
    loadUsers();

    return () => {
      console.log('🔌 [ADMIN-CAMPAIGNS] Désinscription listener');
      unsubscribeCampaigns();
    };
  }, [user?.uid]);

  // ==========================================
  // 🎯 ACTIONS DE GESTION
  // ==========================================

  const handleChangeStatus = async (campaignId, newStatus) => {
    try {
      setProcessingAction(true);
      console.log('📝 [STATUS] Changement statut campagne:', campaignId, '->', newStatus);

      const campaignRef = doc(db, 'projects', campaignId);
      await updateDoc(campaignRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [STATUS] Statut mis à jour');
      setShowStatusModal(null);

    } catch (error) {
      console.error('❌ Erreur changement statut:', error);
      alert('❌ Erreur lors du changement de statut');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteCampaign = async (campaignId, campaignTitle) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la campagne "${campaignTitle}" ?\n\nLes quêtes liées seront déliées mais pas supprimées.`)) {
      return;
    }

    try {
      setProcessingAction(true);
      console.log('🗑️ [DELETE] Suppression campagne:', campaignId);

      // Délier les quêtes
      const questsQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', campaignId)
      );
      const questsSnapshot = await getDocs(questsQuery);

      for (const questDoc of questsSnapshot.docs) {
        await updateDoc(doc(db, 'tasks', questDoc.id), {
          projectId: null,
          updatedAt: serverTimestamp()
        });
      }

      // Supprimer la campagne
      await deleteDoc(doc(db, 'projects', campaignId));

      console.log('✅ [DELETE] Campagne supprimée');
      alert('✅ Campagne supprimée avec succès');

    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    } finally {
      setProcessingAction(false);
    }
  };

  // ==========================================
  // 🔍 FILTRAGE DES CAMPAGNES
  // ==========================================

  const filteredCampaigns = campaigns.filter(campaign => {
    // Filtre par onglet actif
    if (activeTab !== 'all' && campaign.status !== activeTab) {
      return false;
    }

    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        campaign.title?.toLowerCase().includes(search) ||
        campaign.description?.toLowerCase().includes(search) ||
        campaign.creatorName?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // ==========================================
  // 📊 STATISTIQUES
  // ==========================================

  const stats = {
    total: campaigns.length,
    planning: campaigns.filter(c => c.status === 'planning').length,
    active: campaigns.filter(c => c.status === 'active').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    onHold: campaigns.filter(c => c.status === 'on_hold').length,
    cancelled: campaigns.filter(c => c.status === 'cancelled').length,
    totalQuests: Object.values(campaignQuests).reduce((sum, q) => sum + q.total, 0),
    completedQuests: Object.values(campaignQuests).reduce((sum, q) => sum + q.completed, 0)
  };

  // ==========================================
  // 🎨 RENDU DE L'INTERFACE
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-lg">Chargement des campagnes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Administration
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                <Flag className="w-10 h-10 text-purple-400" />
                Gestion des Campagnes
              </h1>
            </div>

            <p className="text-gray-400 text-lg">
              Gérez toutes les campagnes de votre équipe
            </p>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{stats.planning}</div>
              <div className="text-sm text-gray-400">📋 Planification</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.active}</div>
              <div className="text-sm text-gray-400">⚔️ En cours</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm text-gray-400">🏆 Terminées</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">{stats.onHold}</div>
              <div className="text-sm text-gray-400">⏸️ En pause</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-400">{stats.totalQuests}</div>
              <div className="text-sm text-gray-400">Quêtes liées</div>
            </div>
          </motion.div>

          {/* Barre de recherche et filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par titre, description, créateur..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <Link
                to="/campaigns"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-lg"
              >
                <Eye className="w-5 h-5" />
                Voir les campagnes
              </Link>
            </div>

            {/* Onglets de filtrage */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('planning')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === 'planning'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                📋 Planification ({stats.planning})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === 'active'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                ⚔️ En cours ({stats.active})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                🏆 Terminées ({stats.completed})
              </button>
              <button
                onClick={() => setActiveTab('on_hold')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === 'on_hold'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                ⏸️ En pause ({stats.onHold})
              </button>
            </div>
          </motion.div>

          {/* Liste des campagnes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {filteredCampaigns.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center">
                <Flag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Aucune campagne trouvée
                </h3>
                <p className="text-gray-400">
                  {searchTerm
                    ? 'Aucune campagne ne correspond à votre recherche'
                    : activeTab === 'all'
                      ? 'Il n\'y a aucune campagne pour le moment'
                      : `Il n'y a aucune campagne avec le statut "${CAMPAIGN_STATUS[activeTab]?.label || activeTab}"`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign, index) => {
                  const statusConfig = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.active;
                  const quests = campaignQuests[campaign.id] || { total: 0, completed: 0, inProgress: 0, todo: 0 };
                  const progress = quests.total > 0 ? Math.round((quests.completed / quests.total) * 100) : 0;

                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start gap-6">
                        {/* Icône campagne */}
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${statusConfig.bgColor} ${statusConfig.borderColor} border flex-shrink-0`}>
                          {campaign.icon || '⚔️'}
                        </div>

                        {/* Infos campagne */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-white truncate">
                              {campaign.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                              {statusConfig.icon} {statusConfig.label}
                            </span>
                          </div>

                          {campaign.description && (
                            <p className="text-gray-400 mb-3 line-clamp-2">
                              {campaign.description}
                            </p>
                          )}

                          {/* Stats de la campagne */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Sword className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-300">
                                <strong className="text-white">{quests.total}</strong> quêtes
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-gray-300">
                                <strong className="text-white">{quests.completed}</strong> terminées
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-gray-300">
                                <strong className="text-white">{campaign.membersCount}</strong> membre{campaign.membersCount > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-yellow-400" />
                              <span className="text-gray-300">
                                <strong className="text-white">{progress}%</strong> progression
                              </span>
                            </div>
                          </div>

                          {/* Barre de progression */}
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                progress === 100 ? 'bg-green-500' :
                                progress >= 50 ? 'bg-blue-500' :
                                'bg-purple-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>

                          {/* Infos créateur et dates */}
                          <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
                            <span className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-yellow-400" />
                              {campaign.creatorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Créée le {campaign.createdAt?.toLocaleDateString('fr-FR') || 'N/A'}
                            </span>
                            {campaign.updatedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Mise à jour le {campaign.updatedAt?.toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => navigate(`/campaigns/${campaign.id}`)}
                            className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>
                          <button
                            onClick={() => setShowStatusModal(campaign)}
                            disabled={processingAction}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                          >
                            <Edit className="w-4 h-4" />
                            Statut
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign.id, campaign.title)}
                            disabled={processingAction}
                            className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Actions de navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex gap-4 justify-center flex-wrap"
          >
            <Link
              to="/admin"
              className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-xl hover:bg-gray-700 hover:border-gray-500 transition-all duration-200 font-medium"
            >
              Retour Administration
            </Link>

            <Link
              to="/admin/task-validation"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg"
            >
              Validation Quêtes
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Modal changement de statut */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStatusModal(null)}
          >
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Changer le statut
              </h2>
              <p className="text-gray-400 mb-6">
                Campagne: <strong className="text-white">{showStatusModal.title}</strong>
              </p>

              <div className="space-y-3">
                {Object.entries(CAMPAIGN_STATUS).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => handleChangeStatus(showStatusModal.id, status)}
                    disabled={processingAction || showStatusModal.status === status}
                    className={`w-full px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                      showStatusModal.status === status
                        ? `${config.bgColor} ${config.borderColor} ${config.textColor} cursor-default`
                        : 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500'
                    } disabled:opacity-50`}
                  >
                    <span className="text-xl">{config.icon}</span>
                    <span className="font-medium">{config.label}</span>
                    {showStatusModal.status === status && (
                      <span className="ml-auto text-xs">(actuel)</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowStatusModal(null)}
                className="w-full mt-6 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminObjectiveValidationPage;
