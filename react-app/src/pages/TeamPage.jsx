// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// TEAM PAGE COMPLÈTE AVEC SYNCHRONISATION XP - IMPORTS CORRIGÉS
// ==========================================

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Star,
  Crown,
  Shield,
  Zap,
  Target,
  MessageSquare,
  Video,
  MoreHorizontal,
  UserPlus,
  Settings,
  Edit,
  Trash2,
  Eye,
  Heart,
  Coffee,
  Brain,
  Rocket,
  Trophy,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  X,
  MessageCircle,
  Send,
  CheckSquare
} from 'lucide-react';

// Firebase
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  getDoc,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// Stores
import { useAuthStore } from '../shared/stores/authStore.js';

// Services
import { messagingService } from '../core/services/messagingService.js';

// Components
import MessagingInterface from '../components/MessagingInterface.jsx';

// 🔄 SYNCHRONISATION XP - HOOKS UNIQUEMENT (PAS DE JSX)
import { useTeamXpSync } from '../shared/hooks/useTeamXpSync.js';

/**
 * 🔄 HOOK POUR BOUTON DE SYNCHRONISATION MANUELLE
 */
const useTeamXpSyncButton = () => {
  const { forceSync } = useTeamXpSync();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleForceSync = async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      console.log('🔄 [TEAM-PAGE] Synchronisation manuelle...');
      await forceSync();
      setLastSync(new Date());
      console.log('✅ [TEAM-PAGE] Synchronisation manuelle terminée');
    } catch (error) {
      console.error('❌ [TEAM-PAGE] Erreur synchronisation manuelle:', error);
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncXp: handleForceSync,
    syncing,
    lastSync
  };
};

/**
 * 🔄 HOOK POUR STATUS DE SYNCHRONISATION
 */
const useTeamSyncStatus = () => {
  const { initialized, getDiagnostic } = useTeamXpSync({
    enableDiagnostic: true
  });

  const [syncStatus, setSyncStatus] = useState({
    active: false,
    memberCount: 0,
    lastUpdate: null
  });

  useEffect(() => {
    if (initialized) {
      const diagnostic = getDiagnostic();
      setSyncStatus({
        active: diagnostic?.initialized || false,
        memberCount: diagnostic?.activeListeners || 0,
        lastUpdate: new Date()
      });
    }
  }, [initialized, getDiagnostic]);

  return syncStatus;
};

/**
 * 📊 FONCTION UTILITAIRE POUR EXTRAIRE LES DONNÉES XP
 */
const extractMemberXpData = (member) => {
  const gamification = member.gamification || {};
  const teamStats = member.teamStats || {};
  
  return {
    totalXp: gamification.totalXp || teamStats.totalXp || 0,
    level: gamification.level || teamStats.level || 1,
    weeklyXp: gamification.weeklyXp || 0,
    tasksCompleted: gamification.tasksCompleted || teamStats.tasksCompleted || 0
  };
};

/**
 * 🔄 BOUTON DE SYNCHRONISATION XP
 */
const SyncXpButton = () => {
  const { syncXp, syncing, lastSync } = useTeamXpSyncButton();

  return (
    <button
      onClick={syncXp}
      disabled={syncing}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
      title={lastSync ? `Dernière sync: ${lastSync.toLocaleTimeString()}` : 'Synchroniser les XP'}
    >
      <Zap className={`w-4 h-4 ${syncing ? 'animate-pulse' : ''}`} />
      {syncing ? 'Sync...' : 'Sync XP'}
    </button>
  );
};

/**
 * 📊 INDICATEUR DE STATUS DE SYNCHRONISATION
 */
const SyncStatusIndicator = () => {
  const syncStatus = useTeamSyncStatus();

  if (!syncStatus.active) return null;

  return (
    <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-green-300 text-sm">
          Synchronisation XP active ({syncStatus.memberCount} membres surveillés)
        </span>
        {syncStatus.lastUpdate && (
          <span className="text-green-400 text-xs ml-auto">
            Mis à jour: {syncStatus.lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * 📊 AFFICHAGE XP MEMBRE AVEC DONNÉES TEMPS RÉEL
 */
const MemberXpDisplay = ({ member, showLevel = true, showXp = true }) => {
  const xpData = extractMemberXpData(member);

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {showLevel && (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{xpData.level}</div>
          <div className="text-xs text-gray-500">Niveau</div>
        </div>
      )}
      
      {showXp && (
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">{xpData.totalXp}</div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
      )}
      
      <div className="text-center">
        <div className="text-lg font-bold text-green-400">{xpData.tasksCompleted}</div>
        <div className="text-xs text-gray-500">Tâches</div>
      </div>
    </div>
  );
};

/**
 * 📈 STATISTIQUES ÉQUIPE AVEC XP TEMPS RÉEL
 */
const TeamStatsWithSync = ({ members = [] }) => {
  // Calculer les stats en temps réel
  const totalXP = members.reduce((sum, member) => {
    const memberXp = extractMemberXpData(member).totalXp;
    return sum + memberXp;
  }, 0);

  const totalTasks = members.reduce((sum, member) => {
    const memberTasks = extractMemberXpData(member).tasksCompleted;
    return sum + memberTasks;
  }, 0);

  const averageLevel = members.length > 0 
    ? members.reduce((sum, member) => {
        return sum + extractMemberXpData(member).level;
      }, 0) / members.length
    : 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Membres actifs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{members.length}</h3>
            <p className="text-gray-400 text-sm">Membres actifs</p>
          </div>
        </div>
      </div>

      {/* XP Total équipe */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              {totalXP.toLocaleString()}
            </h3>
            <p className="text-gray-400 text-sm">XP Total</p>
          </div>
        </div>
      </div>

      {/* Niveau moyen */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{Math.round(averageLevel * 10) / 10}</h3>
            <p className="text-gray-400 text-sm">Niveau moyen</p>
          </div>
        </div>
      </div>

      {/* Tâches total */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{totalTasks}</h3>
            <p className="text-gray-400 text-sm">Tâches terminées</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 👥 PAGE ÉQUIPE AVEC SYSTÈME DE MESSAGERIE COMPLET
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // ==========================================
  // 📊 ÉTATS PRINCIPAUX
  // ==========================================
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [showMemberActions, setShowMemberActions] = useState(false);
  const [selectedMemberForActions, setSelectedMemberForActions] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  // États messagerie
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  
  // États statistiques
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    onlineMembers: 0,
    totalXP: 0,
    totalTasks: 0,
    averageLevel: 1
  });

  // Initialiser la synchronisation XP
  const { initialized } = useTeamXpSync({
    autoStart: true,
    enableDiagnostic: false
  });

  // ==========================================
  // 🔧 FONCTIONS UTILITAIRES
  // ==========================================

  /**
   * 🎨 Obtenir la couleur du statut
   */
  const getStatusColor = (status, lastSeen) => {
    const now = new Date();
    const lastSeenDate = lastSeen ? new Date(lastSeen) : null;
    const timeDiff = lastSeenDate ? now - lastSeenDate : Infinity;
    
    if (status === 'online' || timeDiff < 5 * 60 * 1000) { // 5 minutes
      return 'bg-green-400';
    } else if (timeDiff < 60 * 60 * 1000) { // 1 heure
      return 'bg-yellow-400';
    } else if (timeDiff < 24 * 60 * 60 * 1000) { // 24 heures
      return 'bg-orange-400';
    } else {
      return 'bg-red-400';
    }
  };

  /**
   * 🎨 Obtenir la couleur du rôle
   */
  const getRoleColor = (role) => {
    const roleColors = {
      'admin': 'text-red-400 bg-red-500/10 border-red-500/20',
      'manager': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'developer': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'designer': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      'analyst': 'text-green-400 bg-green-500/10 border-green-500/20',
      'member': 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    };
    return roleColors[role] || roleColors['member'];
  };

  /**
   * 🔍 Filtrer les membres
   */
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'online' && member.status === 'online') ||
      (statusFilter === 'away' && member.status === 'away') ||
      (statusFilter === 'offline' && member.status === 'offline');

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // 🔥 CHARGEMENT DES DONNÉES
  // ==========================================

  /**
   * 📥 Charger les membres de l'équipe
   */
  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les utilisateurs
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const members = [];
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const gamification = userData.gamification || {};
        
        members.push({
          id: doc.id,
          displayName: userData.profile?.displayName || userData.displayName || 'Utilisateur',
          email: userData.email || '',
          avatar: userData.profile?.avatar || userData.photoURL || null,
          role: userData.profile?.role || 'member',
          department: userData.profile?.department || 'Non défini',
          status: userData.presence?.status || 'offline',
          lastSeen: userData.presence?.lastSeen || userData.lastActivity || null,
          isActive: userData.isActive !== false,
          
          // Données de gamification
          level: gamification.level || 1,
          totalXP: gamification.totalXp || 0,
          weeklyXp: gamification.weeklyXp || 0,
          tasksCompleted: gamification.tasksCompleted || 0,
          badges: gamification.badges || [],
          
          // Statistiques équipe
          teamStats: {
            totalXp: gamification.totalXp || 0,
            level: gamification.level || 1,
            tasksCompleted: gamification.tasksCompleted || 0
          },
          
          // Données de gamification pour extraction
          gamification: gamification,
          
          // Données de présence
          lastActivity: userData.lastActivity || null,
          joinedAt: userData.createdAt || null
        });
      });

      // Calculer les statistiques
      const stats = {
        totalMembers: members.length,
        onlineMembers: members.filter(m => m.status === 'online').length,
        totalXP: members.reduce((sum, m) => sum + (m.totalXP || 0), 0),
        totalTasks: members.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0),
        averageLevel: members.length > 0 
          ? members.reduce((sum, m) => sum + (m.level || 1), 0) / members.length 
          : 1
      };

      setTeamMembers(members);
      setTeamStats(stats);
      
      console.log('✅ Équipe chargée:', members.length, 'membres');
      
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      setError('Impossible de charger les données de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 💬 Charger les messages non lus
   */
  const loadUnreadMessages = async () => {
    if (!user?.uid) return;

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('recipientId', '==', user.uid),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(messagesQuery);
      setUnreadMessagesCount(snapshot.size);
      
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
    }
  };

  // ==========================================
  // 🎯 GESTIONNAIRES D'ÉVÉNEMENTS
  // ==========================================

  /**
   * 📧 Ouvrir l'interface de messagerie
   */
  const handleOpenMessaging = () => {
    setShowMessaging(true);
  };

  /**
   * 📧 Fermer l'interface de messagerie
   */
  const handleCloseMessaging = () => {
    setShowMessaging(false);
    loadUnreadMessages(); // Recharger pour mettre à jour le compteur
  };

  /**
   * 👤 Ouvrir les détails d'un membre
   */
  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowMemberDetails(true);
  };

  /**
   * 📧 Envoyer un message à un membre
   */
  const handleSendMessage = async (memberId) => {
    if (!user?.uid || !memberId) return;

    try {
      await messagingService.sendMessage(
        user.uid,
        memberId,
        'Salut ! Comment ça va ?',
        'text'
      );
      
      console.log('✅ Message envoyé');
      handleOpenMessaging();
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
    }
  };

  /**
   * 🔄 Actualiser les données
   */
  const handleRefresh = async () => {
    await loadTeamData();
    await loadUnreadMessages();
  };

  // ==========================================
  // 🚀 HOOKS ET EFFETS
  // ==========================================

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      loadTeamData();
      loadUnreadMessages();
    }
  }, [user]);

  // Écouter les clics pour fermer les menus
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMemberActions(false);
    };

    if (showMemberActions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMemberActions]);

  // ==========================================
  // 🎨 RENDU
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de l'équipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erreur</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête avec bouton sync amélioré */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              👥 Notre Équipe
            </h1>
            <p className="text-gray-400">
              Gérez et collaborez avec votre équipe
            </p>
          </div>
          
          {/* Boutons d'action avec sync XP */}
          <div className="flex items-center gap-4">
            <SyncXpButton />
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Status de synchronisation */}
        <SyncStatusIndicator />

        {/* Message de succès */}
        {unreadMessagesCount > 0 && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300">
                Vous avez {unreadMessagesCount} nouveau{unreadMessagesCount > 1 ? 'x' : ''} message{unreadMessagesCount > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleOpenMessaging}
                className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Consulter
              </button>
            </div>
          </div>
        )}

        {/* Statistiques équipe avec synchronisation temps réel */}
        <TeamStatsWithSync members={teamMembers} />

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Liste des membres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
              onClick={() => handleMemberClick(member)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {member.displayName?.charAt(0) || member.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(member.status, member.lastSeen)}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {member.displayName || member.name}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">{member.email}</p>
                  </div>
                </div>
                
                {/* Menu actions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuPosition({
                      x: rect.right - 200,
                      y: rect.bottom + 5
                    });
                    setSelectedMemberForActions(member);
                    setShowMemberActions(true);
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Rôle */}
              {member.role && (
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              )}

              {/* Département */}
              {member.department && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {member.department}
                  </p>
                </div>
              )}

              {/* Statistiques avec synchronisation temps réel */}
              <MemberXpDisplay 
                member={member} 
                showLevel={true} 
                showXp={true} 
              />

              {/* Actions rapides */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendMessage(member.id);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Voir profil de', member.displayName);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 text-sm rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Voir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun membre */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun membre trouvé
            </h3>
            <p className="text-gray-400">
              {searchTerm 
                ? 'Essayez de modifier votre recherche' 
                : 'L\'équipe n\'a pas encore de membres'
              }
            </p>
          </div>
        )}
      </div>

      {/* Menu contextuel des actions */}
      {showMemberActions && selectedMemberForActions && ReactDOM.createPortal(
        <div
          className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-2 min-w-[180px]"
          style={{
            left: menuPosition.x,
            top: menuPosition.y
          }}
        >
          <button
            onClick={() => {
              console.log('Voir profil de', selectedMemberForActions.displayName);
              setShowMemberActions(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Voir le profil
          </button>
          
          <button
            onClick={() => {
              handleSendMessage(selectedMemberForActions.id);
              setShowMemberActions(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Envoyer un message
          </button>
          
          <button
            onClick={() => {
              console.log('Démarrer appel avec', selectedMemberForActions.displayName);
              setShowMemberActions(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Démarrer un appel
          </button>
        </div>,
        document.body
      )}

      {/* Modal détails membre */}
      <AnimatePresence>
        {showMemberDetails && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMemberDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Détails du membre</h3>
                <button
                  onClick={() => setShowMemberDetails(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Contenu des détails */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {selectedMember.displayName?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${getStatusColor(selectedMember.status, selectedMember.lastSeen)}`}></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{selectedMember.displayName}</h4>
                    <p className="text-gray-400">{selectedMember.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Rôle</p>
                    <p className="text-white">{selectedMember.role || 'Non défini'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Département</p>
                    <p className="text-white">{selectedMember.department || 'Non défini'}</p>
                  </div>
                </div>

                <MemberXpDisplay 
                  member={selectedMember} 
                  showLevel={true} 
                  showXp={true} 
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      handleSendMessage(selectedMember.id);
                      setShowMemberDetails(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button
                    onClick={() => {
                      console.log('Démarrer appel avec', selectedMember.displayName);
                      setShowMemberDetails(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Appel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interface de messagerie */}
      <AnimatePresence>
        {showMessaging && (
          <MessagingInterface
            isOpen={showMessaging}
            onClose={handleCloseMessaging}
            currentUserId={user?.uid}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamPage;
