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
  UserPlus,
  UserMinus,
  Crown,
  Award,
  // 📦 MODULE 10: RETROSPECTIVES
  RefreshCw,
  Target,
  Lightbulb,
  ListTodo,
  Timer,
  PenLine,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Send
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT SYNERGIA
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES
import { useAuthStore } from '../shared/stores/authStore.js';

// 📦 MODULE 10: SERVICE RETROSPECTIVES
import {
  retrospectiveService,
  RETRO_XP,
  RETRO_ROLES,
  RETRO_SECTIONS,
  RETRO_STATUS
} from '../core/services/retrospectiveService.js';

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

  // 👥 États Équipe
  const [teamMembers, setTeamMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchMemberTerm, setSearchMemberTerm] = useState('');
  const [memberContributions, setMemberContributions] = useState({});

  // 📦 MODULE 10: États Rétrospective
  const [retrospective, setRetrospective] = useState(null);
  const [retroLoading, setRetroLoading] = useState(false);
  const [newRetroItem, setNewRetroItem] = useState({ section: '', content: '' });
  const [newAction, setNewAction] = useState({ content: '', assignedTo: '', deadline: '' });

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

        // 4. Charger tous les utilisateurs pour l'équipe
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('👥 [CAMPAIGN-DETAIL] Utilisateurs chargés:', usersData.length);
        setAllUsers(usersData);

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

  // 📦 MODULE 10: CHARGEMENT RÉTROSPECTIVE
  useEffect(() => {
    if (!campaignId || !campaign) return;

    const loadRetrospective = async () => {
      try {
        setRetroLoading(true);
        const retro = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
        setRetrospective(retro);
        console.log('📦 [RETRO] Rétrospective chargée:', retro ? 'Oui' : 'Non');
      } catch (error) {
        console.error('❌ [RETRO] Erreur chargement:', error);
      } finally {
        setRetroLoading(false);
      }
    };

    loadRetrospective();
  }, [campaignId, campaign]);

  // 👥 CONSTRUCTION DE L'ÉQUIPE ET CONTRIBUTIONS
  useEffect(() => {
    if (!campaign || !allUsers.length) return;

    // Récupérer les IDs des membres de la campagne
    const memberIds = campaign.members || [];

    // Ajouter le créateur s'il n'est pas déjà dans la liste
    if (campaign.createdBy && !memberIds.includes(campaign.createdBy)) {
      memberIds.unshift(campaign.createdBy);
    }

    // Construire la liste des membres avec leurs infos
    const members = memberIds.map(memberId => {
      const userInfo = allUsers.find(u => u.id === memberId);
      return {
        id: memberId,
        displayName: userInfo?.displayName || userInfo?.email || 'Utilisateur',
        email: userInfo?.email,
        photoURL: userInfo?.photoURL,
        synergia_role: userInfo?.synergia_role,
        isCreator: memberId === campaign.createdBy
      };
    });

    setTeamMembers(members);

    // Calculer les contributions de chaque membre
    const contributions = {};
    memberIds.forEach(memberId => {
      const memberQuests = campaignQuests.filter(quest => {
        const assignedTo = Array.isArray(quest.assignedTo)
          ? quest.assignedTo
          : (quest.assignedTo ? [quest.assignedTo] : []);
        return assignedTo.includes(memberId);
      });

      const completedQuests = memberQuests.filter(q =>
        ['completed', 'validated'].includes(q.status)
      );

      const xpEarned = completedQuests.reduce((sum, q) => sum + (q.xpReward || 0), 0);

      contributions[memberId] = {
        totalQuests: memberQuests.length,
        completedQuests: completedQuests.length,
        inProgressQuests: memberQuests.filter(q => q.status === 'in_progress').length,
        xpEarned
      };
    });

    setMemberContributions(contributions);
    console.log('👥 [CAMPAIGN-DETAIL] Équipe constituée:', members.length, 'membres');
  }, [campaign, allUsers, campaignQuests]);

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

  // 🔍 FILTRER LES QUÊTES DISPONIBLES
  const availableQuests = allQuests.filter(quest =>
    !quest.projectId &&
    (quest.title?.toLowerCase().includes(searchQuestTerm.toLowerCase()) ||
     quest.description?.toLowerCase().includes(searchQuestTerm.toLowerCase()))
  );

  // 👥 AJOUTER UN MEMBRE À L'ÉQUIPE
  const handleAddMember = async (userId) => {
    try {
      console.log('👥 [ADD-MEMBER] Ajout membre:', userId, 'à la campagne:', campaignId);

      const currentMembers = campaign.members || [];
      if (currentMembers.includes(userId)) {
        alert('Ce membre fait déjà partie de l\'équipe');
        return;
      }

      const campaignRef = doc(db, 'projects', campaignId);
      await updateDoc(campaignRef, {
        members: [...currentMembers, userId],
        updatedAt: serverTimestamp()
      });

      console.log('✅ [ADD-MEMBER] Membre ajouté avec succès');
      setShowAddMemberModal(false);
      setSearchMemberTerm('');

    } catch (error) {
      console.error('❌ [ADD-MEMBER] Erreur ajout membre:', error);
      alert('Erreur lors de l\'ajout du membre');
    }
  };

  // 👥 RETIRER UN MEMBRE DE L'ÉQUIPE
  const handleRemoveMember = async (userId) => {
    if (userId === campaign.createdBy) {
      alert('Impossible de retirer le créateur de la campagne');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?')) return;

    try {
      console.log('👥 [REMOVE-MEMBER] Retrait membre:', userId);

      const currentMembers = campaign.members || [];
      const newMembers = currentMembers.filter(id => id !== userId);

      const campaignRef = doc(db, 'projects', campaignId);
      await updateDoc(campaignRef, {
        members: newMembers,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [REMOVE-MEMBER] Membre retiré avec succès');

    } catch (error) {
      console.error('❌ [REMOVE-MEMBER] Erreur retrait membre:', error);
      alert('Erreur lors du retrait du membre');
    }
  };

  // 🔍 FILTRER LES UTILISATEURS DISPONIBLES (pas encore dans l'équipe)
  const availableUsers = allUsers.filter(u => {
    const currentMembers = campaign?.members || [];
    const isAlreadyMember = currentMembers.includes(u.id) || u.id === campaign?.createdBy;
    const matchesSearch = u.displayName?.toLowerCase().includes(searchMemberTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchMemberTerm.toLowerCase());
    return !isAlreadyMember && matchesSearch;
  });

  // 📦 MODULE 10: FONCTIONS RÉTROSPECTIVE

  // Créer une nouvelle rétrospective
  const handleCreateRetrospective = async () => {
    try {
      setRetroLoading(true);
      const newRetro = await retrospectiveService.createRetrospective(
        campaignId,
        campaign.title,
        user.uid,
        user.displayName || user.email
      );
      setRetrospective(newRetro);
      console.log('✅ [RETRO] Rétrospective créée');
    } catch (error) {
      console.error('❌ [RETRO] Erreur création:', error);
      alert('Erreur lors de la création de la rétrospective');
    } finally {
      setRetroLoading(false);
    }
  };

  // Ajouter un item à une section
  const handleAddRetroItem = async (sectionId) => {
    if (!newRetroItem.content.trim()) return;

    try {
      await retrospectiveService.addSectionItem(
        retrospective.id,
        sectionId,
        { content: newRetroItem.content },
        user.uid,
        user.displayName || user.email
      );

      // Recharger la rétrospective
      const updated = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
      setRetrospective(updated);
      setNewRetroItem({ section: '', content: '' });
    } catch (error) {
      console.error('❌ [RETRO] Erreur ajout item:', error);
    }
  };

  // Ajouter une action
  const handleAddAction = async () => {
    if (!newAction.content.trim()) return;

    try {
      const assignedUser = teamMembers.find(m => m.id === newAction.assignedTo);
      await retrospectiveService.addSectionItem(
        retrospective.id,
        'actions',
        {
          content: newAction.content,
          assignedTo: newAction.assignedTo || null,
          assignedToName: assignedUser?.displayName || null,
          deadline: newAction.deadline || null
        },
        user.uid,
        user.displayName || user.email
      );

      const updated = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
      setRetrospective(updated);
      setNewAction({ content: '', assignedTo: '', deadline: '' });
    } catch (error) {
      console.error('❌ [RETRO] Erreur ajout action:', error);
    }
  };

  // Supprimer un item
  const handleRemoveRetroItem = async (sectionId, itemId) => {
    try {
      await retrospectiveService.removeSectionItem(retrospective.id, sectionId, itemId);
      const updated = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
      setRetrospective(updated);
    } catch (error) {
      console.error('❌ [RETRO] Erreur suppression item:', error);
    }
  };

  // Toggle action complétée
  const handleToggleAction = async (actionId, completed) => {
    try {
      await retrospectiveService.toggleActionComplete(retrospective.id, actionId, completed);
      const updated = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
      setRetrospective(updated);
    } catch (error) {
      console.error('❌ [RETRO] Erreur toggle action:', error);
    }
  };

  // Assigner un rôle
  const handleAssignRole = async (roleId, userId) => {
    try {
      const selectedUser = teamMembers.find(m => m.id === userId);
      const updatedRoles = {
        ...retrospective.roles,
        [roleId]: userId ? {
          id: userId,
          name: selectedUser?.displayName || 'Utilisateur'
        } : null
      };
      await retrospectiveService.updateRoles(retrospective.id, updatedRoles);
      const updated = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
      setRetrospective(updated);
    } catch (error) {
      console.error('❌ [RETRO] Erreur assignation rôle:', error);
    }
  };

  // Démarrer la rétrospective
  const handleStartRetro = async () => {
    try {
      await retrospectiveService.startRetrospective(retrospective.id);
      // Ajouter l'utilisateur actuel comme participant
      await retrospectiveService.addParticipant(retrospective.id, user.uid, user.displayName || user.email);
      const updated = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
      setRetrospective(updated);
    } catch (error) {
      console.error('❌ [RETRO] Erreur démarrage:', error);
    }
  };

  // Terminer la rétrospective
  const handleCompleteRetro = async () => {
    if (!confirm('Terminer la rétrospective ? Les XP seront attribués aux participants.')) return;

    try {
      await retrospectiveService.completeRetrospective(retrospective.id, 30);
      const updated = await retrospectiveService.getRetrospectiveByCampaign(campaignId);
      setRetrospective(updated);
      alert(`Rétrospective terminée ! ${RETRO_XP.PARTICIPATE} XP attribués aux participants.`);
    } catch (error) {
      console.error('❌ [RETRO] Erreur fin:', error);
    }
  };

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
            {/* 📦 MODULE 10: Onglet Rétrospective - visible uniquement si campagne terminée ou en cours */}
            <button
              onClick={() => setActiveTab('retrospective')}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'retrospective'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Rétrospective
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
                  </div>
                </motion.div>

                {/* 👑 Chef de campagne */}
                <motion.div
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Chef de campagne
                  </h3>
                  {(() => {
                    const creator = teamMembers.find(m => m.isCreator);
                    const creatorContrib = creator ? memberContributions[creator.id] : null;

                    if (!creator) {
                      return (
                        <div className="text-gray-400">Chargement...</div>
                      );
                    }

                    return (
                      <div className="flex items-center gap-6">
                        {/* Avatar du créateur */}
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden ring-4 ring-yellow-500/30">
                            {creator.photoURL ? (
                              <img src={creator.photoURL} alt={creator.displayName} className="w-full h-full object-cover" />
                            ) : (
                              creator.displayName?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        {/* Infos du créateur */}
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-1">{creator.displayName || 'Utilisateur'}</h4>
                          <p className="text-gray-400 text-sm mb-3">{creator.email}</p>
                          {creator.synergia_role && (
                            <span className="px-3 py-1 bg-purple-900/30 text-purple-400 text-xs rounded-full border border-purple-500/30">
                              {creator.synergia_role}
                            </span>
                          )}
                        </div>

                        {/* Stats du créateur */}
                        {creatorContrib && (
                          <div className="flex gap-4">
                            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-400">{creatorContrib.totalQuests}</div>
                              <div className="text-xs text-gray-500">Quêtes</div>
                            </div>
                            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-400">{creatorContrib.completedQuests}</div>
                              <div className="text-xs text-gray-500">Terminées</div>
                            </div>
                            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-yellow-400">{creatorContrib.xpEarned}</div>
                              <div className="text-xs text-gray-500">XP</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>

                {/* 👥 Participants */}
                <motion.div
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-400" />
                      Participants
                      <span className="text-sm font-normal text-gray-400">
                        ({teamMembers.length} membre{teamMembers.length > 1 ? 's' : ''})
                      </span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('team')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Voir tout →
                    </button>
                  </div>

                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">Aucun participant pour le moment</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamMembers.map((member, index) => {
                        const contrib = memberContributions[member.id] || { completedQuests: 0, xpEarned: 0 };

                        return (
                          <motion.div
                            key={member.id}
                            className="bg-gray-700/30 rounded-lg p-4 flex items-center gap-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + index * 0.05 }}
                          >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${
                                member.isCreator
                                  ? 'bg-gradient-to-br from-yellow-500 to-orange-600 ring-2 ring-yellow-500/50'
                                  : 'bg-gradient-to-br from-purple-600 to-blue-600'
                              }`}>
                                {member.photoURL ? (
                                  <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  member.displayName?.charAt(0).toUpperCase() || '?'
                                )}
                              </div>
                              {member.isCreator && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Crown className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-white truncate">{member.displayName || 'Utilisateur'}</h4>
                                {member.isCreator && (
                                  <span className="px-1.5 py-0.5 bg-yellow-900/30 text-yellow-400 text-[10px] rounded-full border border-yellow-500/30 flex-shrink-0">
                                    Chef
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-400" />
                                  {contrib.completedQuests} quêtes
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  {contrib.xpEarned} XP
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
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

            {/* 👥 Onglet Équipe */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Header avec action */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Shield className="h-6 w-6 text-purple-400" />
                    Équipe de la campagne
                    <span className="text-sm font-normal text-gray-400">
                      ({teamMembers.length} membre{teamMembers.length > 1 ? 's' : ''})
                    </span>
                  </h3>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Ajouter un membre
                  </button>
                </div>

                {/* Stats de l'équipe */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{teamMembers.length}</div>
                    <div className="text-sm text-gray-400">Membres</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {Object.values(memberContributions).reduce((sum, c) => sum + c.totalQuests, 0)}
                    </div>
                    <div className="text-sm text-gray-400">Quêtes assignées</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {Object.values(memberContributions).reduce((sum, c) => sum + c.completedQuests, 0)}
                    </div>
                    <div className="text-sm text-gray-400">Quêtes terminées</div>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {Object.values(memberContributions).reduce((sum, c) => sum + c.xpEarned, 0)} XP
                    </div>
                    <div className="text-sm text-gray-400">XP total gagné</div>
                  </div>
                </motion.div>

                {/* Liste des membres */}
                {teamMembers.length === 0 ? (
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Aucun membre dans l'équipe</h4>
                    <p className="text-gray-400 mb-6">
                      Ajoutez des membres pour constituer votre équipe de campagne
                    </p>
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Ajouter un membre
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map((member, index) => {
                      const contribution = memberContributions[member.id] || {
                        totalQuests: 0,
                        completedQuests: 0,
                        inProgressQuests: 0,
                        xpEarned: 0
                      };

                      return (
                        <motion.div
                          key={member.id}
                          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                                {member.photoURL ? (
                                  <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  member.displayName?.charAt(0).toUpperCase()
                                )}
                              </div>
                              {member.isCreator && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Crown className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Infos membre */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-lg font-bold text-white">{member.displayName}</h4>
                                {member.isCreator && (
                                  <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                                    Chef de campagne
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mb-3">{member.email}</p>

                              {/* Stats du membre */}
                              <div className="grid grid-cols-4 gap-2">
                                <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-blue-400">{contribution.totalQuests}</div>
                                  <div className="text-xs text-gray-500">Quêtes</div>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-green-400">{contribution.completedQuests}</div>
                                  <div className="text-xs text-gray-500">Terminées</div>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-orange-400">{contribution.inProgressQuests}</div>
                                  <div className="text-xs text-gray-500">En cours</div>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                                  <div className="text-lg font-bold text-yellow-400">{contribution.xpEarned}</div>
                                  <div className="text-xs text-gray-500">XP</div>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            {!member.isCreator && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                title="Retirer de l'équipe"
                              >
                                <UserMinus className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 📦 MODULE 10: Onglet Rétrospective */}
            {activeTab === 'retrospective' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <RefreshCw className="h-6 w-6 text-purple-400" />
                    Rétrospective de campagne
                  </h3>
                  {retrospective?.status === RETRO_STATUS.COMPLETED && (
                    <span className="px-4 py-2 bg-green-900/30 text-green-400 rounded-lg border border-green-500/30 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Terminée
                    </span>
                  )}
                </div>

                {/* Si pas de rétrospective, proposer d'en créer une */}
                {!retrospective && !retroLoading && (
                  <motion.div
                    className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3">Bilan de campagne</h4>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Organisez une rétrospective express de 15-30 minutes pour capitaliser sur l'expérience de votre équipe.
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-6 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        +{RETRO_XP.PARTICIPATE} XP / participant
                      </span>
                      <span className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        +{RETRO_XP.ANIMATE} XP animateur
                      </span>
                    </div>
                    <button
                      onClick={handleCreateRetrospective}
                      disabled={retroLoading}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-3 mx-auto"
                    >
                      <Sparkles className="h-5 w-5" />
                      Créer la rétrospective
                    </button>
                  </motion.div>
                )}

                {/* Chargement */}
                {retroLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Contenu de la rétrospective */}
                {retrospective && !retroLoading && (
                  <div className="space-y-6">
                    {/* Rôles */}
                    <motion.div
                      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-400" />
                        Rôles de la session
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(RETRO_ROLES).map(([key, role]) => (
                          <div key={key} className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{role.icon}</span>
                              <span className="font-medium text-white">{role.label}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{role.description}</p>
                            <select
                              value={retrospective.roles?.[role.id]?.id || ''}
                              onChange={(e) => handleAssignRole(role.id, e.target.value)}
                              disabled={retrospective.status === RETRO_STATUS.COMPLETED}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            >
                              <option value="">Non assigné</option>
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>
                                  {member.displayName}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Actions de session */}
                    {retrospective.status !== RETRO_STATUS.COMPLETED && (
                      <motion.div
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {retrospective.status === RETRO_STATUS.DRAFT && (
                          <button
                            onClick={handleStartRetro}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
                          >
                            <PlayCircle className="h-5 w-5" />
                            Démarrer la session
                          </button>
                        )}
                        {retrospective.status === RETRO_STATUS.IN_PROGRESS && (
                          <button
                            onClick={handleCompleteRetro}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
                          >
                            <CheckCircle className="h-5 w-5" />
                            Terminer et attribuer XP
                          </button>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Timer className="h-4 w-4" />
                          Durée recommandée: 15-30 min
                        </div>
                      </motion.div>
                    )}

                    {/* Sections de la rétrospective */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Ce qui a bien marché */}
                      <motion.div
                        className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-green-400" />
                          Ce qui a bien marché
                        </h4>
                        <div className="space-y-2 mb-4">
                          {(retrospective.sections?.went_well || []).map(item => (
                            <div key={item.id} className="flex items-start gap-2 p-3 bg-green-900/20 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-white text-sm">{item.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.createdByName}</p>
                              </div>
                              {retrospective.status !== RETRO_STATUS.COMPLETED && (
                                <button
                                  onClick={() => handleRemoveRetroItem('went_well', item.id)}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {retrospective.status !== RETRO_STATUS.COMPLETED && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newRetroItem.section === 'went_well' ? newRetroItem.content : ''}
                              onChange={(e) => setNewRetroItem({ section: 'went_well', content: e.target.value })}
                              placeholder="Ajouter un point positif..."
                              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddRetroItem('went_well')}
                            />
                            <button
                              onClick={() => handleAddRetroItem('went_well')}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </motion.div>

                      {/* Ce qu'on peut améliorer */}
                      <motion.div
                        className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <ThumbsDown className="h-5 w-5 text-red-400" />
                          Ce qu'on peut améliorer
                        </h4>
                        <div className="space-y-2 mb-4">
                          {(retrospective.sections?.to_improve || []).map(item => (
                            <div key={item.id} className="flex items-start gap-2 p-3 bg-red-900/20 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-white text-sm">{item.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.createdByName}</p>
                              </div>
                              {retrospective.status !== RETRO_STATUS.COMPLETED && (
                                <button
                                  onClick={() => handleRemoveRetroItem('to_improve', item.id)}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {retrospective.status !== RETRO_STATUS.COMPLETED && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newRetroItem.section === 'to_improve' ? newRetroItem.content : ''}
                              onChange={(e) => setNewRetroItem({ section: 'to_improve', content: e.target.value })}
                              placeholder="Ajouter un point à améliorer..."
                              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddRetroItem('to_improve')}
                            />
                            <button
                              onClick={() => handleAddRetroItem('to_improve')}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </motion.div>

                      {/* Idées pour la prochaine fois */}
                      <motion.div
                        className="bg-gray-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-400" />
                          Idées pour la prochaine fois
                        </h4>
                        <div className="space-y-2 mb-4">
                          {(retrospective.sections?.ideas || []).map(item => (
                            <div key={item.id} className="flex items-start gap-2 p-3 bg-yellow-900/20 rounded-lg">
                              <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-white text-sm">{item.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{item.createdByName}</p>
                              </div>
                              {retrospective.status !== RETRO_STATUS.COMPLETED && (
                                <button
                                  onClick={() => handleRemoveRetroItem('ideas', item.id)}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {retrospective.status !== RETRO_STATUS.COMPLETED && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newRetroItem.section === 'ideas' ? newRetroItem.content : ''}
                              onChange={(e) => setNewRetroItem({ section: 'ideas', content: e.target.value })}
                              placeholder="Ajouter une idée..."
                              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddRetroItem('ideas')}
                            />
                            <button
                              onClick={() => handleAddRetroItem('ideas')}
                              className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </motion.div>

                      {/* Actions définies */}
                      <motion.div
                        className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <ListTodo className="h-5 w-5 text-blue-400" />
                          Actions définies
                        </h4>
                        <div className="space-y-2 mb-4">
                          {(retrospective.sections?.actions || []).map(item => (
                            <div key={item.id} className={`flex items-start gap-2 p-3 rounded-lg ${item.completed ? 'bg-green-900/20' : 'bg-blue-900/20'}`}>
                              <button
                                onClick={() => handleToggleAction(item.id, !item.completed)}
                                disabled={retrospective.status === RETRO_STATUS.COMPLETED}
                                className={`mt-0.5 flex-shrink-0 ${item.completed ? 'text-green-400' : 'text-blue-400'}`}
                              >
                                {item.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <Target className="h-4 w-4" />
                                )}
                              </button>
                              <div className="flex-1">
                                <p className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                                  {item.content}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  {item.assignedToName && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {item.assignedToName}
                                    </span>
                                  )}
                                  {item.deadline && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(item.deadline).toLocaleDateString('fr-FR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {retrospective.status !== RETRO_STATUS.COMPLETED && (
                                <button
                                  onClick={() => handleRemoveRetroItem('actions', item.id)}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {retrospective.status !== RETRO_STATUS.COMPLETED && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={newAction.content}
                              onChange={(e) => setNewAction({ ...newAction, content: e.target.value })}
                              placeholder="Définir une action..."
                              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                            <div className="flex gap-2">
                              <select
                                value={newAction.assignedTo}
                                onChange={(e) => setNewAction({ ...newAction, assignedTo: e.target.value })}
                                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              >
                                <option value="">Assigné à...</option>
                                {teamMembers.map(member => (
                                  <option key={member.id} value={member.id}>
                                    {member.displayName}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="date"
                                value={newAction.deadline}
                                onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                                className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                              />
                              <button
                                onClick={handleAddAction}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Gamification info */}
                    <motion.div
                      className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        Récompenses
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-yellow-400">+{RETRO_XP.PARTICIPATE} XP</div>
                          <div className="text-sm text-gray-400">Par participant</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-purple-400">+{RETRO_XP.ANIMATE} XP</div>
                          <div className="text-sm text-gray-400">Animateur</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="text-2xl mb-1">🎯</div>
                          <div className="text-sm text-gray-400">Badge "Facilitateur" après 5 rétros animées</div>
                        </div>
                      </div>
                      {retrospective.participants?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <div className="text-sm text-gray-400 mb-2">Participants ({retrospective.participants.length})</div>
                          <div className="flex flex-wrap gap-2">
                            {retrospective.participants.map(p => (
                              <span key={p.id} className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm">
                                {p.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
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

        {/* 👥 MODAL AJOUT MEMBRE */}
        <AnimatePresence>
          {showAddMemberModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMemberModal(false)}
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
                    <UserPlus className="h-6 w-6 text-purple-400" />
                    Ajouter un membre à l'équipe
                  </h2>
                  <button
                    onClick={() => setShowAddMemberModal(false)}
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
                      placeholder="Rechercher un utilisateur..."
                      value={searchMemberTerm}
                      onChange={(e) => setSearchMemberTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {availableUsers.length} utilisateur(s) disponible(s)
                  </p>
                </div>

                {/* Liste des utilisateurs disponibles */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">
                        {searchMemberTerm
                          ? 'Aucun utilisateur trouvé'
                          : 'Tous les utilisateurs sont déjà membres de l\'équipe'
                        }
                      </p>
                    </div>
                  ) : (
                    availableUsers.map((userItem) => (
                      <div
                        key={userItem.id}
                        className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                        onClick={() => handleAddMember(userItem.id)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                            {userItem.photoURL ? (
                              <img src={userItem.photoURL} alt={userItem.displayName} className="w-full h-full object-cover" />
                            ) : (
                              (userItem.displayName || userItem.email)?.charAt(0).toUpperCase()
                            )}
                          </div>

                          {/* Info utilisateur */}
                          <div className="flex-1">
                            <h4 className="font-bold text-white">
                              {userItem.displayName || 'Utilisateur'}
                            </h4>
                            <p className="text-sm text-gray-400">{userItem.email}</p>
                            {userItem.synergia_role && (
                              <span className="text-xs text-purple-400">
                                {userItem.synergia_role}
                              </span>
                            )}
                          </div>

                          {/* Bouton ajouter */}
                          <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0">
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
      </div>
    </Layout>
  );
};

export default CampaignDetailPage;
