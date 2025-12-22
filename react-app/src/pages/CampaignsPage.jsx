// ==========================================
// 📁 react-app/src/pages/CampaignsPage.jsx
// PAGE CONQUÊTES SYNERGIA - CAMPAGNES + DÉFIS ÉQUIPE
// ==========================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flag,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  Users,
  Target,
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  Star,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowRight,
  MoreVertical,
  FolderOpen,
  FileText,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Sword,
  Trophy,
  Shield,
  Zap,
  Award,
  Coins
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT SYNERGIA AUTHENTIQUE
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { useTeamChallenges } from '../shared/hooks/useTeamChallenges.js';
import { useTeamPool } from '../shared/hooks/useTeamPool.js';
import { isAdmin } from '../core/services/adminService.js';

// 🎯 COMPOSANTS DÉFIS ÉQUIPE
import TeamChallengeCard from '../components/challenges/TeamChallengeCard.jsx';
import TeamChallengeModal from '../components/challenges/TeamChallengeModal.jsx';

// 📊 FIREBASE IMPORTS
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 📊 CONSTANTES SYNERGIA CAMPAGNES
const CAMPAIGN_STATUS = {
  planning: { 
    label: 'Planification', 
    color: 'yellow', 
    icon: '📋', 
    bgColor: 'bg-yellow-900/20', 
    textColor: 'text-yellow-400', 
    borderColor: 'border-yellow-500/30',
    hoverColor: 'hover:bg-yellow-900/30'
  },
  active: { 
    label: 'En cours', 
    color: 'blue', 
    icon: '⚔️', 
    bgColor: 'bg-blue-900/20', 
    textColor: 'text-blue-400', 
    borderColor: 'border-blue-500/30',
    hoverColor: 'hover:bg-blue-900/30'
  },
  completed: { 
    label: 'Terminée', 
    color: 'green', 
    icon: '🏆', 
    bgColor: 'bg-green-900/20', 
    textColor: 'text-green-400', 
    borderColor: 'border-green-500/30',
    hoverColor: 'hover:bg-green-900/30'
  },
  on_hold: { 
    label: 'En pause', 
    color: 'orange', 
    icon: '⏸️', 
    bgColor: 'bg-orange-900/20', 
    textColor: 'text-orange-400', 
    borderColor: 'border-orange-500/30',
    hoverColor: 'hover:bg-orange-900/30'
  },
  cancelled: { 
    label: 'Annulée', 
    color: 'red', 
    icon: '❌', 
    bgColor: 'bg-red-900/20', 
    textColor: 'text-red-400', 
    borderColor: 'border-red-500/30',
    hoverColor: 'hover:bg-red-900/30'
  }
};

const CAMPAIGN_PRIORITY = {
  low: { label: 'Faible', color: 'green', icon: '🟢', textColor: 'text-green-400' },
  medium: { label: 'Moyenne', color: 'yellow', icon: '🟡', textColor: 'text-yellow-400' },
  high: { label: 'Haute', color: 'orange', icon: '🟠', textColor: 'text-orange-400' },
  urgent: { label: 'Urgent', color: 'red', icon: '🔴', textColor: 'text-red-400' }
};

// 🔧 FONCTION UTILITAIRE: Conversion SÉCURISÉE des dates Firebase
const safeToDate = (value) => {
  if (!value) return null;
  
  try {
    // Déjà une Date JavaScript
    if (value instanceof Date) {
      return value;
    }
    
    // Firebase Timestamp avec méthode toDate()
    if (typeof value?.toDate === 'function') {
      return value.toDate();
    }
    
    // Firebase Timestamp avec seconds/nanoseconds
    if (value?.seconds !== undefined) {
      return new Date(value.seconds * 1000);
    }
    
    // String ISO ou timestamp number
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ [DATE] Erreur conversion date:', value, error);
    return null;
  }
};

// 🔧 FONCTION UTILITAIRE: Extraire l'ID d'un projectId (string ou DocumentReference)
const extractProjectId = (projectId) => {
  if (!projectId) return null;
  
  try {
    // Si c'est déjà une chaîne
    if (typeof projectId === 'string') {
      return projectId.trim();
    }
    
    // Si c'est un objet DocumentReference Firebase
    if (typeof projectId === 'object') {
      // DocumentReference a une propriété 'id'
      if (projectId.id) {
        return String(projectId.id).trim();
      }
      // Ou une propriété 'path' qui contient 'projects/ID'
      if (projectId.path) {
        const parts = projectId.path.split('/');
        return parts[parts.length - 1].trim();
      }
      // Fallback: essayer de convertir en string
      return String(projectId).trim();
    }
    
    return String(projectId).trim();
  } catch (error) {
    console.warn('⚠️ [PROJECT_ID] Erreur extraction:', projectId, error);
    return null;
  }
};

const CampaignsPage = () => {
  // 🧭 NAVIGATION
  const navigate = useNavigate();

  // 👤 AUTHENTIFICATION
  const { user } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  // 🎯 ONGLET ACTIF (campagnes ou défis)
  const [activeTab, setActiveTab] = useState('campagnes');

  // 📊 ÉTATS CAMPAGNES
  const [campaigns, setCampaigns] = useState([]);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  // 🎯 HOOK DÉFIS D'ÉQUIPE
  const {
    challenges,
    activeChallenges,
    pendingChallenges,
    stats: challengeStats,
    loading: challengesLoading,
    creating: challengeCreating,
    contributing: challengeContributing,
    createChallenge,
    contributeToChallenge,
    updateValue: updateChallengeValue,
    approveChallenge,
    rejectChallenge,
    deleteChallenge,
    refresh: refreshChallenges,
    TEAM_CHALLENGE_TYPES
  } = useTeamChallenges({
    autoInit: true,
    realTimeUpdates: true,
    isAdmin: userIsAdmin
  });

  // 🎯 HOOK CAGNOTTE ÉQUIPE
  const { stats: poolStats } = useTeamPool({
    autoInit: true,
    realTimeUpdates: true
  });

  // 🎯 ÉTATS DÉFIS
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeFilter, setChallengeFilter] = useState('all');
  const [challengeSearchTerm, setChallengeSearchTerm] = useState('');

  // 📊 CHARGEMENT DES CAMPAGNES DEPUIS FIREBASE
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 [CAMPAIGNS] Chargement des campagnes depuis Firebase...');
    setLoading(true);

    // Query pour les campagnes (collection "projects" dans Firebase)
    const campaignsQuery = query(
      collection(db, 'projects'),
      orderBy(sortBy, sortOrder)
    );

    const unsubscribeCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
      try {
        const campaignsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: safeToDate(data.createdAt),
            updatedAt: safeToDate(data.updatedAt),
            dueDate: safeToDate(data.dueDate)
          };
        });

        console.log('⚔️ [CAMPAIGNS] Campagnes chargées depuis Firebase:', campaignsData.length);
        console.log('⚔️ [CAMPAIGNS] IDs des campagnes:', campaignsData.map(c => c.id));
        setCampaigns(campaignsData);
        setLoading(false);
      } catch (err) {
        console.error('❌ [CAMPAIGNS] Erreur parsing campagnes:', err);
        setError('Erreur de parsing des campagnes');
        setLoading(false);
      }
    }, (error) => {
      console.error('❌ [CAMPAIGNS] Erreur chargement campagnes:', error);
      setError('Erreur de chargement des campagnes');
      setLoading(false);
    });

    // 🔥 CHARGEMENT DES QUÊTES AVEC GESTION D'ERREUR ROBUSTE
    const questsQuery = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeQuests = onSnapshot(questsQuery, (snapshot) => {
      try {
        console.log('🔄 [QUESTS] Réception snapshot quêtes, docs:', snapshot.docs.length);
        
        const questsData = [];
        
        // Parcourir chaque document avec try-catch individuel
        snapshot.docs.forEach(doc => {
          try {
            const data = doc.data();
            
            // Extraction robuste du projectId
            const extractedProjectId = extractProjectId(data.projectId);
            
            questsData.push({
              id: doc.id,
              ...data,
              // Remplacer projectId par la version extraite (string)
              projectId: extractedProjectId,
              // Conversion sécurisée des dates
              createdAt: safeToDate(data.createdAt),
              updatedAt: safeToDate(data.updatedAt),
              dueDate: safeToDate(data.dueDate)
            });
          } catch (docError) {
            console.warn('⚠️ [QUESTS] Erreur parsing quête:', doc.id, docError);
            // Continuer avec les autres quêtes
          }
        });

        console.log('✅ [QUESTS] Quêtes parsées avec succès:', questsData.length);
        
        // 🔍 DEBUG DÉTAILLÉ
        const questsWithProject = questsData.filter(q => q.projectId);
        console.log('⚔️ [QUESTS] Quêtes avec projectId:', questsWithProject.length);
        
        if (questsWithProject.length > 0) {
          console.log('⚔️ [QUESTS] === DEBUG PROJECT IDS ===');
          questsWithProject.slice(0, 5).forEach(q => {
            console.log(`  - Quête "${q.title}": projectId="${q.projectId}"`);
          });
          if (questsWithProject.length > 5) {
            console.log(`  ... et ${questsWithProject.length - 5} autres`);
          }
        }
        
        // 🚀 MISE À JOUR DE L'ÉTAT
        setQuests(questsData);
        console.log('✅ [QUESTS] État mis à jour avec', questsData.length, 'quêtes');
        
      } catch (err) {
        console.error('❌ [QUESTS] Erreur globale parsing quêtes:', err);
        // Mettre quand même un tableau vide pour éviter les erreurs
        setQuests([]);
      }
    }, (error) => {
      console.error('❌ [QUESTS] Erreur listener quêtes:', error);
      setQuests([]);
    });

    return () => {
      unsubscribeCampaigns();
      unsubscribeQuests();
    };
  }, [user?.uid, sortBy, sortOrder]);

  // 📊 MAPPING DES QUÊTES PAR CAMPAGNE
  const questsByCampaign = useMemo(() => {
    const mapping = {};
    
    console.log('🔄 [MAPPING] === Création du mapping quêtes par campagne ===');
    console.log('🔄 [MAPPING] Campagnes:', campaigns.length);
    console.log('🔄 [MAPPING] Quêtes:', quests.length);
    
    // Initialiser le mapping pour toutes les campagnes
    campaigns.forEach(campaign => {
      mapping[campaign.id] = [];
    });
    
    // Liste des IDs de campagnes pour comparaison
    const campaignIds = campaigns.map(c => c.id);
    console.log('🔄 [MAPPING] IDs campagnes:', campaignIds);
    
    // Assigner les quêtes aux campagnes
    quests.forEach(quest => {
      if (quest.projectId) {
        const projectIdStr = String(quest.projectId).trim();
        
        // Chercher la campagne correspondante
        const matchingCampaignId = campaignIds.find(campId => {
          const campIdStr = String(campId).trim();
          return campIdStr === projectIdStr;
        });
        
        if (matchingCampaignId) {
          mapping[matchingCampaignId].push(quest);
        }
      }
    });
    
    // Résumé du mapping
    console.log('🔄 [MAPPING] === RÉSUMÉ ===');
    Object.entries(mapping).forEach(([campId, campQuests]) => {
      const campaign = campaigns.find(c => c.id === campId);
      console.log(`  - "${campaign?.title || campId}": ${campQuests.length} quêtes`);
    });
    
    return mapping;
  }, [campaigns, quests]);

  // 📊 CALCUL DES STATISTIQUES GLOBALES
  const stats = useMemo(() => {
    if (!campaigns.length) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0,
        planning: 0
      };
    }

    return {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      onHold: campaigns.filter(c => c.status === 'on_hold').length,
      planning: campaigns.filter(c => c.status === 'planning').length
    };
  }, [campaigns]);

  // 🔍 FILTRAGE ET TRI DES CAMPAGNES
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.priority === priorityFilter);
    }

    return filtered;
  }, [campaigns, searchTerm, statusFilter, priorityFilter]);

  // ➕ CRÉER NOUVELLE CAMPAGNE
  const handleCreateCampaign = async (campaignData) => {
    try {
      console.log('➕ [CREATE] Création nouvelle campagne:', campaignData.title);

      const newCampaign = {
        title: campaignData.title,
        description: campaignData.description || '',
        status: campaignData.status || 'planning',
        priority: campaignData.priority || 'medium',
        tags: campaignData.tags || [],
        color: campaignData.color || 'blue',
        icon: campaignData.icon || '⚔️',
        createdBy: user.uid,
        members: [user.uid],
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
        dueDate: campaignData.dueDate || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects'), newCampaign);
      
      console.log('✅ [CREATE] Campagne créée avec succès');
      setShowCampaignForm(false);
      setEditingCampaign(null);
      
    } catch (error) {
      console.error('❌ [CREATE] Erreur création campagne:', error);
      alert('Erreur lors de la création de la campagne');
    }
  };

  // ✏️ MODIFIER CAMPAGNE
  const handleEditCampaign = async (campaignData) => {
    try {
      console.log('✏️ [EDIT] Modification campagne:', editingCampaign.id);

      await updateDoc(doc(db, 'projects', editingCampaign.id), {
        ...campaignData,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [EDIT] Campagne modifiée avec succès');
      setShowCampaignForm(false);
      setEditingCampaign(null);
      
    } catch (error) {
      console.error('❌ [EDIT] Erreur modification campagne:', error);
      alert('Erreur lors de la modification de la campagne');
    }
  };

  // 🗑️ SUPPRIMER CAMPAGNE
  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      console.log('🗑️ [DELETE] Suppression campagne:', campaignId);
      
      await deleteDoc(doc(db, 'projects', campaignId));
      
      console.log('✅ [DELETE] Campagne supprimée avec succès');
      
    } catch (error) {
      console.error('❌ [DELETE] Erreur suppression campagne:', error);
      alert('Erreur lors de la suppression de la campagne');
    }
  };

  // 🔄 CHANGER STATUT CAMPAGNE
  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      console.log('🔄 [STATUS] Changement statut campagne:', campaignId, '→', newStatus);

      await updateDoc(doc(db, 'projects', campaignId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [STATUS] Statut mis à jour avec succès');

    } catch (error) {
      console.error('❌ [STATUS] Erreur changement statut:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  // 🎯 FILTRAGE DES DÉFIS
  const filteredChallenges = useMemo(() => {
    let result = challenges;

    if (challengeFilter !== 'all') {
      result = result.filter(c => c.status === challengeFilter);
    }

    if (challengeSearchTerm) {
      result = result.filter(c =>
        c.title?.toLowerCase().includes(challengeSearchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(challengeSearchTerm.toLowerCase())
      );
    }

    return result;
  }, [challenges, challengeFilter, challengeSearchTerm]);

  // 🎯 HANDLERS DÉFIS
  const handleCreateChallenge = async (data) => {
    const result = await createChallenge(data);
    if (result.success) {
      setShowChallengeModal(false);
    }
    return result;
  };

  const handleContribute = async (challengeId, amount, description) => {
    const result = await contributeToChallenge(challengeId, amount, description);
    if (result.success) {
      if (result.completed) {
        alert(`Félicitations ! Le défi est accompli ! Les XP ont été versés dans la cagnotte d'équipe.`);
      }
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleUpdateChallengeValue = async (challengeId, newValue) => {
    const result = await updateChallengeValue(challengeId, newValue);
    if (!result.success) {
      alert(`Erreur: ${result.error}`);
    } else if (result.completed) {
      alert(`Défi accompli ! XP versés dans la cagnotte.`);
    }
  };

  const handleApproveChallenge = async (challengeId) => {
    const result = await approveChallenge(challengeId);
    if (!result.success) {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleRejectChallenge = async (challengeId, reason) => {
    const result = await rejectChallenge(challengeId, reason);
    if (!result.success) {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (confirm('Supprimer ce défi ?')) {
      const result = await deleteChallenge(challengeId);
      if (!result.success) {
        alert(`Erreur: ${result.error}`);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center">
            <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400 text-sm sm:text-lg">Chargement des campagnes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center relative overflow-hidden">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 text-center px-4">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-sm sm:text-lg mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/5 backdrop-blur-xl text-white rounded-xl border border-white/10 hover:bg-white/10 transition-all"
            >
              Réessayer
            </motion.button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 pb-24 sm:pb-8">
          {/* 📊 HEADER AVEC STATISTIQUES */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">

              {/* Titre principal */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl sm:text-2xl">👑</span>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      Conquêtes
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-lg mt-0.5 sm:mt-1">
                      Campagnes et défis d'équipe
                    </p>
                  </div>
                </div>

                {/* Actions du header */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {activeTab === 'campagnes' && (
                    <>
                      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            viewMode === 'grid'
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <Grid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            viewMode === 'list'
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCampaignForm(true)}
                        className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Nouvelle Campagne</span>
                        <span className="sm:hidden">Nouveau</span>
                      </motion.button>
                    </>
                  )}

                  {activeTab === 'defis' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowChallengeModal(true)}
                      className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Nouveau Défi</span>
                      <span className="sm:hidden">Nouveau</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Onglets Campagnes / Défis */}
              <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                <motion.button
                  onClick={() => setActiveTab('campagnes')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base flex items-center gap-2 ${
                    activeTab === 'campagnes'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  <span>Campagnes</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{stats.total}</span>
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('defis')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base flex items-center gap-2 ${
                    activeTab === 'defis'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/20'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Défis Équipe</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{challenges?.length || 0}</span>
                </motion.button>
              </div>

              {/* Statistiques rapides - CAMPAGNES */}
              {activeTab === 'campagnes' && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">{stats.total}</div>
                <div className="text-gray-400 text-[10px] sm:text-sm font-medium">Total</div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-xl sm:text-3xl font-bold text-blue-400 mb-0.5 sm:mb-1">{stats.active}</div>
                <div className="text-gray-400 text-[10px] sm:text-sm font-medium">Actives</div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${(stats.active / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-xl sm:text-3xl font-bold text-green-400 mb-0.5 sm:mb-1">{stats.completed}</div>
                <div className="text-gray-400 text-[10px] sm:text-sm font-medium">Terminées</div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.02 }}
                className="hidden sm:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-xl sm:text-3xl font-bold text-yellow-400 mb-0.5 sm:mb-1">{stats.planning}</div>
                <div className="text-gray-400 text-[10px] sm:text-sm font-medium">Planning</div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${(stats.planning / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="hidden sm:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-xl sm:text-3xl font-bold text-orange-400 mb-0.5 sm:mb-1">{stats.onHold}</div>
                <div className="text-gray-400 text-[10px] sm:text-sm font-medium">En pause</div>
                <div className="w-full bg-white/10 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${(stats.onHold / stats.total) * 100 || 0}%` }}></div>
                </div>
              </motion.div>
            </div>
              )}

              {/* Statistiques rapides - DÉFIS */}
              {activeTab === 'defis' && (
                <div className="bg-gradient-to-r from-purple-600/80 via-blue-600/80 to-cyan-500/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 relative overflow-hidden border border-white/20">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300 rounded-full blur-3xl" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                          <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                          Cagnotte d'Équipe
                        </h2>
                        <p className="text-white/70 text-xs sm:text-sm mt-1">XP collectifs à débloquer</p>
                      </div>
                      <div className="text-2xl sm:text-4xl font-bold text-white">
                        {poolStats?.currentXP?.toLocaleString() || 0} XP
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-white">{challengeStats?.active || 0}</div>
                        <div className="text-white/70 text-xs sm:text-sm">En cours</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-green-300">{challengeStats?.completed || 0}</div>
                        <div className="text-white/70 text-xs sm:text-sm">Accomplis</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-300">{challengeStats?.pending || 0}</div>
                        <div className="text-white/70 text-xs sm:text-sm">En attente</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* 🔍 FILTRES ET RECHERCHE - CAMPAGNES */}
        {activeTab === 'campagnes' && (
        <>
        {/* 🔍 FILTRES ET RECHERCHE */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-6 mb-6 sm:mb-8"
          >
            <div className="flex flex-col gap-3 sm:gap-4">

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                />
              </div>

              {/* Filtres */}
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 min-w-[100px] px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="all">Tous statuts</option>
                  <option value="planning">Planning</option>
                  <option value="active">Actives</option>
                  <option value="completed">Terminées</option>
                  <option value="on_hold">Pause</option>
                  <option value="cancelled">Annulées</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="flex-1 min-w-[100px] px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="all">Priorités</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="flex-1 min-w-[100px] px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="updatedAt-desc">Récentes</option>
                  <option value="updatedAt-asc">Anciennes</option>
                  <option value="title-asc">Nom A-Z</option>
                  <option value="title-desc">Nom Z-A</option>
                </select>
              </div>
            </div>

            {/* Résultats de recherche */}
            {searchTerm && (
              <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
                {filteredCampaigns.length} campagne(s) pour "{searchTerm}"
              </div>
            )}
          </motion.div>

          {/* 📁 GRILLE DES CAMPAGNES */}
          {filteredCampaigns.length === 0 ? (
            <motion.div
              className="text-center py-12 sm:py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">⚔️</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                {searchTerm ? 'Aucune campagne trouvée' : 'Aucune campagne créée'}
              </h3>
              <p className="text-gray-400 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto px-4">
                {searchTerm
                  ? 'Essayez d\'autres mots-clés.'
                  : 'Créez votre première campagne pour organiser vos quêtes !'
                }
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCampaignForm(true)}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 sm:gap-3 mx-auto text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  Créer ma première campagne
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                : "space-y-3 sm:space-y-4"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredCampaigns.map((campaign, index) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  viewMode={viewMode}
                  navigate={navigate}
                  onEdit={(camp) => {
                    setEditingCampaign(camp);
                    setShowCampaignForm(true);
                  }}
                  onDelete={handleDeleteCampaign}
                  onStatusChange={handleStatusChange}
                  quests={questsByCampaign[campaign.id] || []}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </div>
        </div>
        </>
        )}

        {/* 🎯 CONTENU DÉFIS D'ÉQUIPE */}
        {activeTab === 'defis' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Filtres défis */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un défi..."
                  value={challengeSearchTerm}
                  onChange={(e) => setChallengeSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'Tous', color: 'gray' },
                  { id: 'active', label: 'En cours', color: 'blue' },
                  { id: 'pending_approval', label: 'En attente', color: 'yellow' },
                  { id: 'completed', label: 'Accomplis', color: 'green' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setChallengeFilter(filter.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      challengeFilter === filter.id
                        ? `bg-${filter.color}-500/20 text-${filter.color}-400 border border-${filter.color}-500/30`
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des défis */}
            {challengesLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aucun défi trouvé</p>
                <p className="text-gray-500 text-sm">
                  {challenges.length === 0
                    ? "Créez votre premier défi d'équipe !"
                    : "Essayez un autre filtre"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChallenges.map((challenge) => (
                  <TeamChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onContribute={handleContribute}
                    onUpdateValue={handleUpdateChallengeValue}
                    onApprove={handleApproveChallenge}
                    onReject={handleRejectChallenge}
                    onDelete={handleDeleteChallenge}
                    isAdmin={userIsAdmin}
                    contributing={challengeContributing}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 📝 MODAL FORMULAIRE CAMPAGNE */}
        <AnimatePresence>
          {showCampaignForm && (
            <CampaignFormModal
              campaign={editingCampaign}
              onClose={() => {
                setShowCampaignForm(false);
                setEditingCampaign(null);
              }}
              onSubmit={editingCampaign ? handleEditCampaign : handleCreateCampaign}
            />
          )}
        </AnimatePresence>

        {/* 📝 MODAL CRÉATION DÉFI */}
        <AnimatePresence>
          {showChallengeModal && (
            <TeamChallengeModal
              onClose={() => setShowChallengeModal(false)}
              onSubmit={handleCreateChallenge}
              types={TEAM_CHALLENGE_TYPES}
              creating={challengeCreating}
            />
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

// 📄 COMPOSANT CARTE CAMPAGNE
const CampaignCard = ({ campaign, viewMode, navigate, onEdit, onDelete, onStatusChange, quests, index }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const statusConfig = CAMPAIGN_STATUS[campaign.status] || CAMPAIGN_STATUS.active;
  const priorityConfig = CAMPAIGN_PRIORITY[campaign.priority] || CAMPAIGN_PRIORITY.medium;
  
  // Calcul des statistiques de la campagne
  const campaignStats = useMemo(() => {
    const total = quests.length;
    const completed = quests.filter(q => 
      q.status === 'completed' || q.status === 'done' || q.status === 'validated'
    ).length;
    const inProgress = quests.filter(q => 
      q.status === 'in_progress' || q.status === 'active' || q.status === 'in-progress'
    ).length;
    const todo = total - completed - inProgress;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      totalQuests: total,
      completedQuests: completed,
      inProgressQuests: inProgress,
      todoQuests: Math.max(0, todo),
      progress: progress
    };
  }, [quests]);

  const cardContent = (
    <>
      {/* Header de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${statusConfig.bgColor}`}>
            {campaign.icon || '⚔️'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white line-clamp-1">
              {campaign.title || 'Campagne sans nom'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
              <span className={`text-xs ${priorityConfig.textColor}`}>
                {priorityConfig.icon} {priorityConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showDropdown && (
            <motion.div
              className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(campaign);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              
              {campaign.status !== 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(campaign.id, 'active');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-green-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Activer
                </button>
              )}
              
              {campaign.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(campaign.id, 'on_hold');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-yellow-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <PauseCircle className="h-4 w-4" />
                  Mettre en pause
                </button>
              )}
              
              {campaign.status !== 'completed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(campaign.id, 'completed');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left text-blue-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" />
                  Marquer terminée
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(campaign.id);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Description */}
      {campaign.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>
      )}

      {/* Statistiques de la campagne */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Progression</span>
          <span className="text-white font-medium">{campaignStats.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${campaignStats.progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{campaignStats.totalQuests}</div>
            <div className="text-xs text-gray-400">Quêtes</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">{campaignStats.completedQuests}</div>
            <div className="text-xs text-gray-400">Accomplies</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-400">{campaignStats.inProgressQuests}</div>
            <div className="text-xs text-gray-400">En cours</div>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>
            {campaign.createdAt 
              ? `Créée le ${campaign.createdAt.toLocaleDateString('fr-FR')}`
              : 'Date inconnue'
            }
          </span>
        </div>
        {campaign.members && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{campaign.members.length} membre(s)</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {campaign.tags && campaign.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {campaign.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {campaign.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
              +{campaign.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action button - NAVIGATION */}
      <button 
        onClick={() => navigate(`/campaigns/${campaign.id}`)}
        className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Voir les détails
      </button>
    </>
  );

  return (
    <motion.div
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6
        hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300
        hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer
        ${viewMode === 'list' ? 'flex items-center gap-4 sm:gap-6' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: viewMode === 'grid' ? 1.02 : 1.005 }}
      onClick={() => setShowDropdown(false)}
    >
      {cardContent}
    </motion.div>
  );
};

// 📝 COMPOSANT MODAL FORMULAIRE
const CampaignFormModal = ({ campaign, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    description: campaign?.description || '',
    status: campaign?.status || 'planning',
    priority: campaign?.priority || 'medium',
    tags: campaign?.tags ? campaign.tags.join(', ') : '',
    color: campaign?.color || 'blue',
    icon: campaign?.icon || '⚔️',
    dueDate: campaign?.dueDate ? campaign.dueDate.toISOString().split('T')[0] : ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const campaignData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };
      
      await onSubmit(campaignData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            {campaign ? 'Modifier' : 'Nouvelle campagne'}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Titre de la campagne *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 text-sm sm:text-base ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-white/10 focus:ring-purple-500/50'
              }`}
              placeholder="Ex: Conquête du marché B2B"
            />
            {errors.title && (
              <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="Décrivez les objectifs..."
              rows="3"
            />
          </div>

          {/* Statut et Priorité */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              >
                <option value="planning">📋 Planification</option>
                <option value="active">⚔️ En cours</option>
                <option value="on_hold">⏸️ En pause</option>
                <option value="completed">🏆 Terminée</option>
                <option value="cancelled">❌ Annulée</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Priorité
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              >
                <option value="low">🟢 Faible</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🟠 Haute</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          {/* Icône et Date d'échéance */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Icône
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="⚔️"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Échéance
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
              Tags <span className="text-gray-500">(séparés par virgules)</span>
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder="B2B, conquête, stratégique"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium border border-white/10 text-sm sm:text-base"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              {campaign ? 'Modifier' : 'Créer'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CampaignsPage;
