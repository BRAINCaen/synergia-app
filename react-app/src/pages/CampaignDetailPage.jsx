// ==========================================
// 📁 react-app/src/pages/CampaignDetailPage.jsx
// PAGE DÉTAILS CAMPAGNE - DESIGN SYNERGIA + TERMINOLOGIE GAMING
// ==========================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Target,
  Calendar,
  Clock,
  Settings,
  Edit,
  Trash2,
  Plus,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Heart,
  Star,
  MessageSquare,
  FileText,
  BarChart3,
  Link as LinkIcon,
  Unlink,
  Search,
  Sword,
  Trophy,
  Flag,
  Shield,
  Zap
} from 'lucide-react';

// 🎯 COMPOSANTS DÉFIS
import { ChallengeCard, ChallengeModal } from '../components/challenges';
import { challengeService } from '../core/services/challengeService.js';

// 🎯 IMPORT DU LAYOUT SYNERGIA
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES
const CAMPAIGN_STATUS = {
  planning: { 
    label: 'Planification', 
    color: 'yellow', 
    icon: '📋', 
    bgColor: 'bg-yellow-900/20', 
    textColor: 'text-yellow-400', 
    borderColor: 'border-yellow-500/30'
  },
  active: { 
    label: 'En cours', 
    color: 'blue', 
    icon: '⚔️', 
    bgColor: 'bg-blue-900/20', 
    textColor: 'text-blue-400', 
    borderColor: 'border-blue-500/30'
  },
  completed: { 
    label: 'Terminée', 
    color: 'green', 
    icon: '🏆', 
    bgColor: 'bg-green-900/20', 
    textColor: 'text-green-400', 
    borderColor: 'border-green-500/30'
  },
  on_hold: { 
    label: 'En pause', 
    color: 'orange', 
    icon: '⏸️', 
    bgColor: 'bg-orange-900/20', 
    textColor: 'text-orange-400', 
    borderColor: 'border-orange-500/30'
  },
  cancelled: { 
    label: 'Annulée', 
    color: 'red', 
    icon: '❌', 
    bgColor: 'bg-red-900/20', 
    textColor: 'text-red-400', 
    borderColor: 'border-red-500/30'
  }
};

/**
 * 📁 PAGE DÉTAILS CAMPAGNE
 */
const CampaignDetailPage = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // États
  const [campaign, setCampaign] = useState(null);
  const [campaignQuests, setCampaignQuests] = useState([]);
  const [allQuests, setAllQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkQuestModal, setShowLinkQuestModal] = useState(false);
  const [searchQuestTerm, setSearchQuestTerm] = useState('');

  // États Défis
  const [campaignChallenges, setCampaignChallenges] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // 🔥 CHARGEMENT DES DONNÉES
  useEffect(() => {
    if (!campaignId || !user?.uid) return;

    console.log('🔄 [CAMPAIGN-DETAIL] Chargement campagne:', campaignId);

    let unsubCampaign;
    let unsubQuests;

    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Écouter la campagne
        const campaignRef = doc(db, 'projects', campaignId);
        unsubCampaign = onSnapshot(campaignRef, (snapshot) => {
          if (snapshot.exists()) {
            const campaignData = {
              id: snapshot.id,
              ...snapshot.data(),
              createdAt: snapshot.data().createdAt?.toDate(),
              updatedAt: snapshot.data().updatedAt?.toDate()
            };
            console.log('✅ [CAMPAIGN-DETAIL] Campagne chargée:', campaignData.title);
            setCampaign(campaignData);
          } else {
            console.error('❌ [CAMPAIGN-DETAIL] Campagne non trouvée');
            setError('Campagne introuvable');
          }
          setLoading(false);
        });

        // 2. Écouter les quêtes de la campagne
        const questsQuery = query(
          collection(db, 'tasks'),
          where('projectId', '==', campaignId),
          orderBy('createdAt', 'desc')
        );

        unsubQuests = onSnapshot(questsQuery, (snapshot) => {
          const questsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));
          console.log('✅ [CAMPAIGN-DETAIL] Quêtes chargées:', questsData.length);
          setCampaignQuests(questsData);
        });

        // 3. Charger toutes les quêtes pour la liaison
        const allQuestsQuery = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc')
        );

        const allQuestsSnapshot = await getDocs(allQuestsQuery);
        const allQuestsData = allQuestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllQuests(allQuestsData);

        // 4. Charger les défis de la campagne
        const challenges = await challengeService.getCampaignChallenges(campaignId);
        console.log('🎯 [CAMPAIGN-DETAIL] Defis charges:', challenges.length);
        setCampaignChallenges(challenges);

      } catch (error) {
        console.error('❌ [CAMPAIGN-DETAIL] Erreur chargement:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubCampaign) unsubCampaign();
      if (unsubQuests) unsubQuests();
    };
  }, [campaignId, user?.uid]);

  // 📊 CALCUL DES STATISTIQUES
  const stats = {
    totalQuests: campaignQuests.length,
    completedQuests: campaignQuests.filter(q => q.status === 'completed').length,
    inProgressQuests: campaignQuests.filter(q => q.status === 'in_progress').length,
    todoQuests: campaignQuests.filter(q => q.status === 'todo').length,
    progress: campaignQuests.length > 0 
      ? Math.round((campaignQuests.filter(q => q.status === 'completed').length / campaignQuests.length) * 100) 
      : 0
  };

  // 🔗 LIER UNE QUÊTE À LA CAMPAGNE
  const handleLinkQuest = async (questId) => {
    try {
      console.log('🔗 [LINK] Liaison quête à la campagne:', questId, '→', campaignId);
      
      const questRef = doc(db, 'tasks', questId);
      await updateDoc(questRef, {
        projectId: campaignId,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [LINK] Quête liée avec succès');
      setShowLinkQuestModal(false);
      setSearchQuestTerm('');
      
    } catch (error) {
      console.error('❌ [LINK] Erreur liaison quête:', error);
      alert('Erreur lors de la liaison de la quête');
    }
  };

  // 🔓 DÉLIER UNE QUÊTE DE LA CAMPAGNE
  const handleUnlinkQuest = async (questId) => {
    if (!confirm('Êtes-vous sûr de vouloir délier cette quête de la campagne ?')) return;

    try {
      console.log('🔓 [UNLINK] Déliaison quête de la campagne:', questId);
      
      const questRef = doc(db, 'tasks', questId);
      await updateDoc(questRef, {
        projectId: null,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [UNLINK] Quête déliée avec succès');
      
    } catch (error) {
      console.error('❌ [UNLINK] Erreur déliaison quête:', error);
      alert('Erreur lors de la déliaison de la quête');
    }
  };

  // 🗑️ SUPPRIMER LA CAMPAGNE
  const handleDeleteCampaign = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ? Les quêtes liées seront déliées mais pas supprimées.')) return;

    try {
      console.log('🗑️ [DELETE] Suppression campagne:', campaignId);
      
      // Délier toutes les quêtes
      const batch = [];
      for (const quest of campaignQuests) {
        const questRef = doc(db, 'tasks', quest.id);
        batch.push(updateDoc(questRef, { projectId: null }));
      }
      await Promise.all(batch);

      // Supprimer la campagne
      await deleteDoc(doc(db, 'projects', campaignId));
      
      console.log('✅ [DELETE] Campagne supprimée avec succès');
      navigate('/campaigns');
      
    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression campagne:', error);
      alert('Erreur lors de la suppression de la campagne');
    }
  };

  // 🎯 CRÉER UN NOUVEAU DÉFI
  const handleCreateChallenge = async (challengeData) => {
    try {
      console.log('🎯 [CHALLENGE] Creation defi:', challengeData);

      const newChallenge = await challengeService.createChallenge({
        ...challengeData,
        userId: user.uid,
        userName: user.displayName || user.email,
        campaignId: campaignId
      });

      console.log('✅ [CHALLENGE] Defi cree:', newChallenge.id);

      // Recharger les défis
      const updatedChallenges = await challengeService.getCampaignChallenges(campaignId);
      setCampaignChallenges(updatedChallenges);

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur creation:', error);
      throw error;
    }
  };

  // 📤 SOUMETTRE ACCOMPLISSEMENT D'UN DÉFI
  const handleSubmitChallengeCompletion = async (challengeId, proof) => {
    try {
      console.log('📤 [CHALLENGE] Soumission accomplissement:', challengeId);

      await challengeService.submitChallengeCompletion(challengeId, proof);

      console.log('✅ [CHALLENGE] Accomplissement soumis');

      // Recharger les défis
      const updatedChallenges = await challengeService.getCampaignChallenges(campaignId);
      setCampaignChallenges(updatedChallenges);

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur soumission:', error);
      alert('Erreur lors de la soumission');
    }
  };

  // ✅ APPROUVER UN DÉFI (Admin)
  const handleApproveChallenge = async (challengeId) => {
    try {
      console.log('✅ [CHALLENGE] Approbation defi:', challengeId);

      await challengeService.approveChallenge(challengeId);

      console.log('✅ [CHALLENGE] Defi approuve');

      // Recharger les défis
      const updatedChallenges = await challengeService.getCampaignChallenges(campaignId);
      setCampaignChallenges(updatedChallenges);

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  // ❌ REJETER UN DÉFI (Admin)
  const handleRejectChallenge = async (challengeId, reason) => {
    try {
      console.log('❌ [CHALLENGE] Rejet defi:', challengeId);

      await challengeService.rejectChallenge(challengeId, reason);

      console.log('✅ [CHALLENGE] Defi rejete');

      // Recharger les défis
      const updatedChallenges = await challengeService.getCampaignChallenges(campaignId);
      setCampaignChallenges(updatedChallenges);

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur rejet:', error);
      alert('Erreur lors du rejet');
    }
  };

  // 🏆 VALIDER ACCOMPLISSEMENT D'UN DÉFI (Admin)
  const handleValidateChallenge = async (challengeId) => {
    try {
      console.log('🏆 [CHALLENGE] Validation defi:', challengeId);

      await challengeService.validateChallengeCompletion(challengeId, user.uid);

      console.log('✅ [CHALLENGE] Defi valide - XP attribue');

      // Recharger les défis
      const updatedChallenges = await challengeService.getCampaignChallenges(campaignId);
      setCampaignChallenges(updatedChallenges);

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  // 🗑️ SUPPRIMER UN DÉFI
  const handleDeleteChallenge = async (challengeId) => {
    if (!confirm('Supprimer ce defi ?')) return;

    try {
      console.log('🗑️ [CHALLENGE] Suppression defi:', challengeId);

      await challengeService.deleteChallenge(challengeId);

      console.log('✅ [CHALLENGE] Defi supprime');

      // Recharger les défis
      const updatedChallenges = await challengeService.getCampaignChallenges(campaignId);
      setCampaignChallenges(updatedChallenges);

    } catch (error) {
      console.error('❌ [CHALLENGE] Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // 🔍 FILTRER LES QUÊTES DISPONIBLES
  const availableQuests = allQuests.filter(quest => 
    !quest.projectId && 
    (quest.title?.toLowerCase().includes(searchQuestTerm.toLowerCase()) ||
     quest.description?.toLowerCase().includes(searchQuestTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Chargement de la campagne...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !campaign) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">
              {error || 'Campagne introuvable'}
            </h2>
            <button
              onClick={() => navigate('/campaigns')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux campagnes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const statusConfig = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.active;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* 📊 HEADER DE LA CAMPAGNE */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <button 
                onClick={() => navigate('/campaigns')}
                className="hover:text-white transition-colors flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                Campagnes
              </button>
              <span>/</span>
              <span className="text-white">{campaign.title}</span>
            </div>

            {/* Titre et actions */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${statusConfig.bgColor}`}>
                  {campaign.icon || '⚔️'}
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {campaign.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                    {campaign.priority && (
                      <span className="text-sm text-gray-400">
                        Priorité: {campaign.priority}
                      </span>
                    )}
                  </div>
                  {campaign.description && (
                    <p className="text-gray-400 mt-3 max-w-2xl">
                      {campaign.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/campaigns')}
                  className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
                <button
                  onClick={() => {/* TODO: Édition */}}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={handleDeleteCampaign}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-white mb-1">{stats.totalQuests}</div>
                <div className="text-gray-400 text-sm">Quêtes totales</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.completedQuests}</div>
                <div className="text-gray-400 text-sm">Accomplies</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: `${(stats.completedQuests / stats.totalQuests) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-blue-400 mb-1">{stats.inProgressQuests}</div>
                <div className="text-gray-400 text-sm">En cours</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${(stats.inProgressQuests / stats.totalQuests) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.todoQuests}</div>
                <div className="text-gray-400 text-sm">À faire</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${(stats.todoQuests / stats.totalQuests) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-3xl font-bold text-purple-400 mb-1">{stats.progress}%</div>
                <div className="text-gray-400 text-sm">Progression</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${stats.progress}%` }}></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* 📑 ONGLETS */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 border-b border-gray-700/50 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'quests'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Sword className="h-4 w-4 inline mr-2" />
              Quêtes ({stats.totalQuests})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Équipe
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'challenges'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              Défis ({campaignChallenges.length})
            </button>
          </div>

          {/* 📊 CONTENU DES ONGLETS */}
          <div className="pb-12">
            {/* Onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    Progression de la campagne
                  </h3>
                  
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-400">Progression globale</span>
                      <span className="text-2xl font-bold text-white">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="text-sm text-gray-400 mb-2">Quêtes accomplies</div>
                      <div className="text-3xl font-bold text-green-400">{stats.completedQuests}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="text-sm text-gray-400 mb-2">Quêtes en cours</div>
                      <div className="text-3xl font-bold text-blue-400">{stats.inProgressQuests}</div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <div className="text-sm text-gray-400 mb-2">Quêtes à faire</div>
                      <div className="text-3xl font-bold text-yellow-400">{stats.todoQuests}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Métadonnées */}
                <motion.div 
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-xl font-bold text-white mb-6">📋 Informations de la campagne</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Date de création</div>
                      <div className="text-white">
                        {campaign.createdAt 
                          ? campaign.createdAt.toLocaleDateString('fr-FR', { dateStyle: 'long' })
                          : 'Non définie'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Dernière mise à jour</div>
                      <div className="text-white">
                        {campaign.updatedAt 
                          ? campaign.updatedAt.toLocaleDateString('fr-FR', { dateStyle: 'long' })
                          : 'Non définie'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Créée par</div>
                      <div className="text-white font-mono text-sm">{campaign.createdBy}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Membres de l'équipe</div>
                      <div className="text-white">{campaign.members?.length || 0} membre(s)</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Onglet Quêtes */}
            {activeTab === 'quests' && (
              <div className="space-y-6">
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Sword className="h-6 w-6 text-blue-400" />
                    Quêtes de la campagne
                  </h3>
                  <button
                    onClick={() => setShowLinkQuestModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Lier une quête existante
                  </button>
                </div>

                {/* Liste des quêtes */}
                {campaignQuests.length === 0 ? (
                  <motion.div 
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Sword className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Aucune quête liée</h4>
                    <p className="text-gray-400 mb-6">
                      Liez des quêtes existantes à cette campagne pour organiser vos batailles
                    </p>
                    <button
                      onClick={() => setShowLinkQuestModal(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Lier une quête
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {campaignQuests.map((quest, index) => (
                      <motion.div
                        key={quest.id}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-white">{quest.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                quest.status === 'completed' ? 'bg-green-900/20 text-green-400 border border-green-500/30' :
                                quest.status === 'in_progress' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30' :
                                'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {quest.status === 'completed' ? '🏆 Accomplie' :
                                 quest.status === 'in_progress' ? '⚔️ En cours' :
                                 '📋 À faire'}
                              </span>
                            </div>
                            {quest.description && (
                              <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {quest.createdAt?.toLocaleDateString('fr-FR')}
                              </span>
                              {quest.xpReward && (
                                <span className="flex items-center gap-1 text-yellow-400">
                                  <Star className="h-3 w-3" />
                                  {quest.xpReward} XP
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnlinkQuest(quest.id)}
                            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Délier de la campagne"
                          >
                            <Unlink className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Onglet Équipe */}
            {activeTab === 'team' && (
              <motion.div
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="h-6 w-6 text-purple-400" />
                  Équipe de la campagne
                </h3>
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Fonctionnalité de gestion d'équipe à venir</p>
                </div>
              </motion.div>
            )}

            {/* 🎯 Onglet Défis */}
            {activeTab === 'challenges' && (
              <div className="space-y-6">
                {/* Header avec action */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Zap className="h-6 w-6 text-purple-400" />
                    Défis personnels
                  </h3>
                  <button
                    onClick={() => setShowChallengeModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Proposer un défi
                  </button>
                </div>

                {/* Info box */}
                <motion.div
                  className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-start gap-3">
                    <Zap className="text-purple-400 flex-shrink-0 mt-0.5" size={18} />
                    <div className="text-sm">
                      <p className="text-purple-300 font-medium">Comment fonctionnent les Défis ?</p>
                      <p className="text-purple-200/80 mt-1">
                        Proposez un défi personnel, attendez l'approbation du Maître de Guilde,
                        accomplissez-le, puis soumettez votre preuve pour gagner des XP !
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Liste des défis */}
                {campaignChallenges.length === 0 ? (
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Aucun défi pour cette campagne</h4>
                    <p className="text-gray-400 mb-6">
                      Soyez le premier à proposer un défi personnel !
                    </p>
                    <button
                      onClick={() => setShowChallengeModal(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Proposer un défi
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {campaignChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ChallengeCard
                          challenge={challenge}
                          onSubmitCompletion={challenge.userId === user?.uid ? handleSubmitChallengeCompletion : null}
                          onDelete={challenge.userId === user?.uid ? handleDeleteChallenge : null}
                          isAdmin={campaign?.createdBy === user?.uid}
                          onApprove={handleApproveChallenge}
                          onReject={handleRejectChallenge}
                          onValidate={handleValidateChallenge}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 🔗 MODAL LIAISON QUÊTE */}
        <AnimatePresence>
          {showLinkQuestModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkQuestModal(false)}
            >
              <motion.div
                className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <LinkIcon className="h-6 w-6 text-blue-400" />
                    Lier une quête existante
                  </h2>
                  <button
                    onClick={() => setShowLinkQuestModal(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Recherche */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Rechercher une quête..."
                      value={searchQuestTerm}
                      onChange={(e) => setSearchQuestTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                    />
                  </div>
                  {/* Compteur de quêtes disponibles */}
                  <p className="text-sm text-gray-400 mt-2">
                    {availableQuests.length} quête(s) disponible(s)
                  </p>
                </div>

                {/* Liste de TOUTES les quêtes disponibles */}
                <div className="space-y-3">
                  {availableQuests.length === 0 ? (
                    <div className="text-center py-12">
                      <Sword className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">
                        {searchQuestTerm 
                          ? 'Aucune quête trouvée'
                          : 'Aucune quête disponible (toutes sont déjà liées à des campagnes)'
                        }
                      </p>
                    </div>
                  ) : (
                    availableQuests.map((quest) => (
                      <div
                        key={quest.id}
                        className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                        onClick={() => handleLinkQuest(quest.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">{quest.title}</h4>
                            {quest.description && (
                              <p className="text-sm text-gray-400 line-clamp-2">{quest.description}</p>
                            )}
                          </div>
                          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎯 MODAL CRÉATION DÉFI */}
        <ChallengeModal
          isOpen={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          onSubmit={handleCreateChallenge}
          campaignId={campaignId}
          campaignTitle={campaign?.title}
        />
      </div>
    </Layout>
  );
};

export default CampaignDetailPage;
