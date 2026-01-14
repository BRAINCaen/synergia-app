// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// PAGE ÉQUIPE AVEC ONGLET ADMIN POUR PILOTAGE COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Trophy, Zap, Search, Award, Target, TrendingUp, Eye, UserPlus,
  RefreshCw, Shield, Edit, Trash2, Ban, UserCheck, Lock
} from 'lucide-react';

// IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// IMPORT DU COMPOSANT AVATAR UNIVERSEL
import UserAvatar from '../components/common/UserAvatar.jsx';
import DetailedPixelAvatar from '../components/customization/DetailedPixelAvatar.jsx';

// Extracted modal components
import { MemberProfileModal, MemberEditModal, MemberDeleteModal } from '../components/team/modals';


// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import { useTeamGamificationSync } from '../shared/hooks/useTeamGamificationSync.js';
import { calculateLevel, getXPProgress } from '../core/services/levelService.js';

/**
 * 🏢 PAGE ÉQUIPE AVEC PILOTAGE ADMIN
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎮 SYNCHRONISATION XP TEMPS RÉEL POUR TOUTE L'ÉQUIPE
  const { getUserXp, usersGamification } = useTeamGamificationSync(
    teamMembers.map(m => m.id)
  );
  
  // États onglets
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'admin' | 'quests_in_progress' | 'quests_completed'
  const [forceAdminMode, setForceAdminMode] = useState(false); // Pour test
  
  // États filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // États interface
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Vérifier si l'utilisateur est admin
  const isAdmin = forceAdminMode || user?.role === 'admin' || user?.email?.includes('@admin') || user?.isAdmin === true;
  
  // Debug pour vérifier le rôle
  useEffect(() => {
    if (user) {
      console.log('👤 User role:', user.role);
      console.log('🔐 Is Admin:', isAdmin);
      console.log('📧 User email:', user.email);
    }
  }, [user, isAdmin]);

// 🔄 METTRE À JOUR LES XP QUAND LE STORE CHANGE
useEffect(() => {
  if (usersGamification.size === 0) return;

  console.log('🔄 [TEAM] Mise à jour XP depuis la synchronisation temps réel...');

  setTeamMembers(prev =>
    prev.map(member => {
      const gamifData = getUserXp(member.id);
      if (!gamifData) return member;

      console.log(`✅ [TEAM] MAJ ${member.name}: ${gamifData.totalXp} XP`);

      // Utiliser le nouveau système de niveaux calibré
      const progress = getXPProgress(gamifData.totalXp);

      return {
        ...member,
        totalXp: gamifData.totalXp,
        level: calculateLevel(gamifData.totalXp),
        weeklyXp: gamifData.weeklyXp,
        monthlyXp: gamifData.monthlyXp,
        badges: gamifData.badges,
        badgesCount: gamifData.badgeCount,
        currentLevelXp: progress.progressXP,
        nextLevelXpRequired: progress.xpToNextLevel,
        xpProgress: progress.progressPercent
      };
    }).sort((a, b) => b.totalXp - a.totalXp)
  );
}, [usersGamification, getUserXp]);
  
  /**
   * 🚀 CHARGEMENT ET SYNCHRONISATION AUTOMATIQUE
   */
  useEffect(() => {
    let unsubscribeTeam = null;

    const initializeData = async () => {
      // Charger les membres avec synchronisation temps réel
      unsubscribeTeam = await loadAllTeamMembers();
    };

    if (user?.uid) {
      initializeData();
    }

    // Nettoyage lors du démontage
    return () => {
      if (unsubscribeTeam && typeof unsubscribeTeam === 'function') {
        console.log('🧹 Nettoyage listener équipe');
        unsubscribeTeam();
      }
    };
}, [user]);  // ✅ PAS [user?.uid]

  // 🔄 SYNCHRONISATION TEMPS RÉEL DES QUÊTES DANS LE MODAL - CORRIGÉ
  useEffect(() => {
    if (!showMemberModal || !selectedMember) return;

    console.log('🔄 [MODAL] Synchronisation quêtes pour:', selectedMember.name);

    // ✅ Sauvegarder l'ID pour éviter la dépendance sur l'objet complet
    const memberId = selectedMember.id;
    const memberName = selectedMember.name;

    const questsQuery = query(collection(db, 'tasks'));
    
    const unsubscribe = onSnapshot(questsQuery, (snapshot) => {
      const userQuests = [];
      let questsInProgress = 0;
      let questsCompleted = 0;

      snapshot.forEach((doc) => {
        const questData = doc.data();
        const assigned = questData.assignedTo || [];
        
        if (Array.isArray(assigned) && assigned.includes(memberId)) {
          userQuests.push({
            id: doc.id,
            ...questData
          });
          
          if (questData.status === 'in_progress' || questData.status === 'assigned' || questData.status === 'pending') {
            questsInProgress++;
          } else if (questData.status === 'completed' || questData.status === 'validated') {
            questsCompleted++;
          }
        }
      });

      console.log(`✅ [MODAL] ${userQuests.length} quêtes synchronisées pour ${memberName}`);

      // ✅ CORRECTION : Ne met à jour QUE si nécessaire
      setSelectedMember(prev => {
        if (!prev || prev.id !== memberId) return prev;
        
        return {
          ...prev,
          quests: userQuests,
          questsTotal: userQuests.length,
          questsInProgress: questsInProgress,
          questsCompleted: questsCompleted
        };
      });
    });

    return () => {
      console.log('🧹 [MODAL] Nettoyage listener quêtes');
      unsubscribe();
    };
  }, [showMemberModal, selectedMember?.id]); // ✅ SEULEMENT l'ID, pas l'objet complet !

  // Remplace UNIQUEMENT la fonction loadAllTeamMembers dans TeamPage.jsx

const loadAllTeamMembers = async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('👥 Chargement COMPLET avec synchronisation QUÊTES ET XP TEMPS RÉEL...');
    
    // 1️⃣ CHARGER LA LISTE DES UTILISATEURS UNE FOIS
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('gamification.totalXp', 'desc')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.warn('⚠️ Aucun utilisateur trouvé !');
      setTeamMembers([]);
      setLoading(false);
      return;
    }

    const userIds = usersSnapshot.docs.map(doc => doc.id);
    console.log(`📋 ${userIds.length} utilisateurs trouvés`);

    // 2️⃣ CRÉER UN LISTENER TEMPS RÉEL POUR CHAQUE UTILISATEUR
    const unsubscribeFunctions = [];
    const membersMap = new Map();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const initialData = userDoc.data();

      // 🔥 LISTENER TEMPS RÉEL sur ce document utilisateur
      const unsubscribeUser = onSnapshot(
        doc(db, 'users', userId),
        async (userSnapshot) => {
          if (!userSnapshot.exists()) return;

          const userData = userSnapshot.data();
          const userName = userData.displayName || userData.name || 'Inconnu';
          const userEmail = userData.email || '';

          console.log(`🔄 [XP-SYNC] Mise à jour pour ${userName}: ${userData.gamification?.totalXp || 0} XP`);

          // RÉCUPÉRER LES QUÊTES
          const allQuestsQuery = query(collection(db, 'tasks'));
          const allQuestsSnap = await getDocs(allQuestsQuery);

          const userQuests = [];
          let questsInProgress = 0;
          let questsCompleted = 0;

          allQuestsSnap.forEach(doc => {
            const questData = doc.data();
            const assignedTo = questData.assignedTo;

            let isAssigned = false;

            if (Array.isArray(assignedTo)) {
              isAssigned = assignedTo.some(item => {
                if (!item) return false;
                const itemStr = String(item).toLowerCase();
                return itemStr === userId.toLowerCase() || 
                       itemStr === userEmail.toLowerCase() || 
                       itemStr === userName.toLowerCase();
              });
            } else if (assignedTo) {
              const assignedStr = String(assignedTo).toLowerCase();
              isAssigned = assignedStr === userId.toLowerCase() || 
                          assignedStr === userEmail.toLowerCase() || 
                          assignedStr === userName.toLowerCase();
            }

            if (isAssigned) {
              userQuests.push({ id: doc.id, ...questData });

              if (questData.status === 'in_progress' || questData.status === 'todo') {
                questsInProgress++;
              } else if (questData.status === 'completed' || questData.status === 'validated') {
                questsCompleted++;
              }
            }
          });

          // DONNÉES GAMIFICATION - Utilise le nouveau système de niveaux calibré
          const gamification = userData.gamification || {};
          const totalXp = gamification.totalXp || 0;
          const level = calculateLevel(totalXp);
          const badges = gamification.badges || [];

          // CRÉER/METTRE À JOUR LE MEMBRE
          const member = {
            id: userId,
            uid: userId,
            name: userName,
            email: userEmail,
            role: userData.role || 'Membre',
            department: userData.department || 'Non spécifié',
            photoURL: userData.photoURL || null,
            // Données avatar personnalisé
            avatarType: userData.avatarType || null,
            detailedAvatar: userData.detailedAvatar || null,
            pixelArtAvatar: userData.pixelArtAvatar || null,
            diceBearAvatar: userData.diceBearAvatar || null,
            customization: userData.customization || null,
            status: userData.status || 'actif',
            isOnline: userData.isOnline || false,
            joinedAt: userData.createdAt?.toDate?.() || new Date(),
            lastActivity: userData.lastActivity?.toDate?.() || new Date(),

            // DONNÉES GAMIFICATION
            totalXp: totalXp,
            level: level,
            weeklyXp: gamification.weeklyXp || 0,
            monthlyXp: gamification.monthlyXp || 0,
            badgesCount: badges.length,
            badges: badges,

            // DONNÉES QUÊTES
            questsInProgress: questsInProgress,
            questsCompleted: questsCompleted,
            questsTotal: userQuests.length,
            quests: userQuests,

            // DONNÉES CALCULÉES - Utilise le nouveau système de niveaux
            completionRate: userQuests.length > 0 ? Math.round((questsCompleted / userQuests.length) * 100) : 0,
            ...(() => {
              const progress = getXPProgress(totalXp);
              return {
                currentLevelXp: progress.progressXP,
                nextLevelXpRequired: progress.xpToNextLevel,
                xpProgress: progress.progressPercent
              };
            })(),

            // DONNÉES PROFIL
            phone: userData.phone || null,
            location: userData.location || null,
            bio: userData.bio || null,
            skills: userData.skills || [],
            synergiaRoles: userData.synergiaRoles || [],

            // MÉTADONNÉES
            lastSync: new Date(),
            syncSource: 'firebase_realtime_individual_listeners'
          };

          // METTRE À JOUR DANS LA MAP
          membersMap.set(userId, member);

          // METTRE À JOUR LE STATE
          const updatedMembers = Array.from(membersMap.values())
            .sort((a, b) => b.totalXp - a.totalXp);

          setTeamMembers(updatedMembers);

          console.log(`✅ [XP-SYNC] ${userName}: ${totalXp} XP, ${userQuests.length} quêtes`);
        },
        (error) => {
          console.error(`❌ Erreur listener ${userId}:`, error);
        }
      );

      unsubscribeFunctions.push(unsubscribeUser);

      // Initialiser la map avec les données initiales
      const initialMember = {
        id: userId,
        name: initialData.displayName || initialData.name || 'Inconnu',
        totalXp: initialData.gamification?.totalXp || 0
      };
      membersMap.set(userId, initialMember);
    }

    // Charger les données initiales immédiatement
    setLoading(false);

    console.log(`✅ ${unsubscribeFunctions.length} listeners XP temps réel activés`);

    // Fonction de nettoyage qui unsub tous les listeners
    return () => {
      console.log('🧹 Nettoyage de tous les listeners XP...');
      unsubscribeFunctions.forEach(unsub => unsub());
    };

  } catch (error) {
    console.error('❌ Erreur chargement équipe:', error);
    setError(error.message);
    setLoading(false);
  }
};


  /**
   * 🔍 FILTRER LES MEMBRES
   */
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    const matchesRole = roleFilter === 'all' || member.role.toLowerCase().includes(roleFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  /**
   * 📊 STATISTIQUES D'ÉQUIPE
   */
  const teamStats = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter(m => m.status === 'actif').length,
    totalXP: teamMembers.reduce((sum, m) => sum + (m.totalXp || 0), 0),
    averageLevel: teamMembers.length > 0 
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.level || 0), 0) / teamMembers.length)
      : 0,
    onlineMembers: teamMembers.filter(m => m.isOnline).length,
    completionRate: teamMembers.length > 0
      ? Math.round(teamMembers.reduce((sum, m) => sum + (m.completionRate || 0), 0) / teamMembers.length)
      : 0
  };

  const departments = ['all', ...new Set(teamMembers.map(m => m.department).filter(Boolean))];
  const roles = ['all', ...new Set(teamMembers.map(m => m.role).filter(Boolean))];

  const headerStats = [
    { 
      label: "Membres Total", 
      value: teamStats.totalMembers, 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Membres Actifs", 
      value: teamStats.activeMembers, 
      icon: TrendingUp, 
      color: "text-green-400" 
    },
    {
      label: "XP Total",
      value: teamStats.totalXP.toLocaleString(),
      icon: Zap,
      color: "text-yellow-400"
    },
    {
      label: "Niveau Moyen",
      value: teamStats.averageLevel,
      icon: TrendingUp,
      color: "text-purple-400"
    }
  ];

  /**
   * 🔧 ACTIONS ADMIN - MODIFIER UN MEMBRE
   */
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;

    try {
      const memberRef = doc(db, 'users', selectedMember.id);
      await updateDoc(memberRef, {
        displayName: selectedMember.name,
        role: selectedMember.role,
        department: selectedMember.department,
        status: selectedMember.status,
        updatedAt: serverTimestamp()
      });

      showNotification('Membre modifié avec succès', 'success');
      setShowEditModal(false);
      await loadAllTeamMembers();
    } catch (error) {
      console.error('❌ Erreur modification membre:', error);
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  /**
   * ⛔ ACTIONS ADMIN - SUSPENDRE UN MEMBRE
   */
  const handleSuspendMember = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir suspendre ce membre ?')) return;

    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        status: 'suspendu',
        suspendedAt: serverTimestamp(),
        suspendedBy: user.uid
      });

      showNotification('Membre suspendu', 'success');
      await loadAllTeamMembers();
    } catch (error) {
      console.error('❌ Erreur suspension:', error);
      showNotification('Erreur lors de la suspension', 'error');
    }
  };

  /**
   * 🔓 ACTIONS ADMIN - RÉACTIVER UN MEMBRE
   */
  const handleActivateMember = async (memberId) => {
    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        status: 'actif',
        suspendedAt: null,
        suspendedBy: null,
        reactivatedAt: serverTimestamp(),
        reactivatedBy: user.uid
      });

      showNotification('Membre réactivé', 'success');
      await loadAllTeamMembers();
    } catch (error) {
      console.error('❌ Erreur réactivation:', error);
      showNotification('Erreur lors de la réactivation', 'error');
    }
  };

  /**
   * 🚫 ACTIONS ADMIN - BLOQUER UN MEMBRE
   */
  const handleBlockMember = async (memberId) => {
    if (!window.confirm('⚠️ ATTENTION: Le blocage est une action sérieuse. Confirmer ?')) return;

    try {
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        status: 'bloqué',
        blockedAt: serverTimestamp(),
        blockedBy: user.uid
      });

      showNotification('Membre bloqué', 'success');
      await loadAllTeamMembers();
    } catch (error) {
      console.error('❌ Erreur blocage:', error);
      showNotification('Erreur lors du blocage', 'error');
    }
  };

  /**
   * 🗑️ ACTIONS ADMIN - SUPPRIMER UN MEMBRE
   */
  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    if (!window.confirm('⚠️ SUPPRESSION DÉFINITIVE: Cette action est irréversible. Confirmer ?')) return;

    try {
      await deleteDoc(doc(db, 'users', selectedMember.id));

      showNotification('Membre supprimé définitivement', 'success');
      setShowDeleteModal(false);
      await loadAllTeamMembers();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  /**
   * 📢 NOTIFICATIONS
   */
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white shadow-lg transition-opacity duration-300 z-50 ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 relative overflow-hidden">
          {/* Animated background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement de l'équipe...</p>
            </div>
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
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
          <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-3 sm:p-6 max-w-7xl mx-auto">
          
          {/* 🎯 HEADER */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text mb-2">
                  Gestion Équipe
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  Collaborez et suivez les performances ({teamStats.totalMembers} membres)
                </p>
              </div>

              {/* Boutons actions rapides */}
              <div className="flex flex-wrap gap-2 sm:gap-3">

                {/* BOUTON TEST ADMIN - À RETIRER EN PRODUCTION */}
                <button
                  onClick={() => {
                    setForceAdminMode(!forceAdminMode);
                    console.log('🔧 Mode Admin forcé:', !forceAdminMode);
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    forceAdminMode
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                  }`}
                  title="Activer/désactiver le mode admin (TEST)"
                >
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{forceAdminMode ? 'Admin ON' : 'Test Admin'}</span>
                </button>

                <button
                  onClick={() => loadAllTeamMembers()}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Actualiser</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-colors text-sm sm:text-base"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Inviter</span>
                  </button>
                )}
              </div>
            </div>

            {/* STATISTIQUES HEADER */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
              {headerStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xl sm:text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm mt-1">
                        {stat.label}
                      </div>
                    </div>
                    <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ONGLETS */}
            <div className="flex gap-2 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
              <button
                onClick={() => {
                  console.log('🖱️ Clic sur onglet Membres');
                  setActiveTab('members');
                }}
                className={`flex-1 px-3 sm:px-4 py-3 rounded-xl transition-all ${
                  activeTab === 'members'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-sm sm:text-base">Membres</span>
                </div>
              </button>

              {isAdmin ? (
                <button
                  onClick={() => {
                    console.log('🖱️ Clic sur onglet Admin');
                    setActiveTab('admin');
                  }}
                  className={`flex-1 px-3 sm:px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-pink-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Administration</span>
                  </div>
                </button>
              ) : (
                <div className="flex-1 px-3 sm:px-4 py-3 rounded-xl bg-white/5 text-gray-500 cursor-not-allowed border border-white/5">
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm">Admin requis</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Debug info - À RETIRER EN PRODUCTION */}
            <div className="mt-4 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-blue-300 text-xs sm:text-sm">
                    <strong>DEBUG:</strong> Tab: <span className="font-mono">{activeTab}</span> |
                    Admin: <span className="font-mono">{isAdmin ? 'OUI' : 'NON'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Sync temps réel</span>
                </div>
              </div>
              <div className="mt-2 text-blue-200 text-xs">
                MAJ: {new Date().toLocaleTimeString()} |
                {teamMembers.length} membres |
                {teamMembers.reduce((sum, m) => sum + (m.totalXp || 0), 0).toLocaleString()} XP
              </div>
            </div>
          </div>

          {/* ONGLET MEMBRES */}
          {activeTab === 'members' && (
            <>
              {/* FILTRES ET RECHERCHE */}
              <div className="mb-6 sm:mb-8">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10">

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Équipe</h3>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">

                    <div className="relative col-span-2 lg:col-span-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm sm:text-base"
                      />
                    </div>

                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 text-sm sm:text-base"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept} className="bg-slate-900">
                          {dept === 'all' ? 'Départements' : dept}
                        </option>
                      ))}
                    </select>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 text-sm sm:text-base"
                    >
                      {roles.slice(0, 6).map(role => (
                        <option key={role} value={role} className="bg-slate-900">
                          {role === 'all' ? 'Rôles' : role}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 text-sm sm:text-base"
                    >
                      <option value="all" className="bg-slate-900">Statuts</option>
                      <option value="actif" className="bg-slate-900">Actifs</option>
                      <option value="récent" className="bg-slate-900">Récents</option>
                      <option value="inactif" className="bg-slate-900">Inactifs</option>
                      <option value="suspendu" className="bg-slate-900">Suspendus</option>
                      <option value="bloqué" className="bg-slate-900">Bloqués</option>
                    </select>

                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDepartmentFilter('all');
                        setRoleFilter('all');
                        setStatusFilter('all');
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors text-sm sm:text-base"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="mt-4 text-xs sm:text-sm text-gray-400">
                    {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} trouvé{filteredMembers.length !== 1 ? 's' : ''}
                    {filteredMembers.length !== teamMembers.length && (
                      <span> sur {teamMembers.length}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* GRILLE DES MEMBRES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-24 sm:pb-8">
                {filteredMembers.map((member, index) => {
                  const isCurrentUser = member.id === user?.uid;

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        relative bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50
                        ${isCurrentUser ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10'}
                      `}
                    >
                      {isCurrentUser && (
                        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Vous
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${
                          member.isOnline ? 'bg-green-500' : 
                          member.status === 'actif' ? 'bg-yellow-500' : 
                          member.status === 'suspendu' ? 'bg-orange-500' :
                          member.status === 'bloqué' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span className="text-xs text-gray-400 capitalize">{member.status}</span>
                      </div>

                      {/* 🎴 CARTE AVATAR RPG */}
                      <div className="mt-6">
                        {/* Zone avatar en format carte */}
                        <div className="relative mx-auto mb-4 w-full max-w-[180px]">
                          {/* Cadre de la carte RPG */}
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-purple-500/50 bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-lg shadow-purple-500/20">
                            {/* Background effet magique */}
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-blue-900/30" />

                            {/* Avatar complet */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              {member.avatarType === 'detailed' && member.detailedAvatar ? (
                                <DetailedPixelAvatar
                                  config={member.detailedAvatar}
                                  size="100%"
                                  showBackground={false}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <UserAvatar
                                  user={member}
                                  size="3xl"
                                  showBorder={false}
                                />
                              )}
                            </div>

                            {/* Badge niveau en haut à gauche */}
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              Nv.{member.level}
                            </div>

                            {/* Effet brillant sur le cadre */}
                            <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
                          </div>

                          {/* Plaque du nom style RPG */}
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-[90%]">
                            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-yellow-500/50 rounded-lg px-3 py-1.5 text-center shadow-lg">
                              <h3 className="text-sm font-bold text-yellow-400 truncate">{member.name}</h3>
                            </div>
                          </div>
                        </div>

                        {/* Info sous la carte */}
                        <div className="text-center mt-6">
                          <p className="text-purple-400 text-sm font-medium mb-1">{member.role}</p>
                          <p className="text-gray-500 text-xs">{member.department}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center mt-4">
                          <div>
                            <div className="text-lg font-bold text-yellow-400" title={`XP Total: ${member.totalXp}`}>
                              {member.totalXp.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">XP</div>
                            {member.weeklyXp > 0 && (
                              <div className="text-xs text-green-400">+{member.weeklyXp} cette semaine</div>
                            )}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-blue-400">{member.level}</div>
                            <div className="text-xs text-gray-400">Niveau</div>
                            <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                              <div 
                                className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                                style={{ width: `${member.xpProgress}%` }}
                                title={`${member.currentLevelXp}/${member.nextLevelXpRequired} XP`}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-400">{member.questsCompleted || 0}</div>
                            <div className="text-xs text-gray-400">Accomplies</div>
                            <div className="text-xs text-orange-400">{member.questsInProgress || 0} en cours</div>
                          </div>
                        </div>
                        
                        {/* Bouton détails quêtes */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(member);
                            setShowMemberModal(true);
                          }}
                          className="w-full px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mb-2"
                        >
                          <Eye className="w-4 h-4" />
                          Voir toutes les quêtes ({member.questsTotal || 0})
                        </button>

                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowMemberModal(true);
                          }}
                          className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Voir le profil
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* ONGLET ADMINISTRATION */}
          {activeTab === 'admin' && isAdmin && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 pb-24 sm:pb-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-red-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Panneau d'Administration</h2>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Membre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden sm:table-cell">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase hidden md:table-cell">Département</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">XP</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-white font-bold">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-white font-medium truncate">{member.name}</div>
                              <div className="text-gray-400 text-sm truncate">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-300 hidden sm:table-cell">{member.role}</td>
                        <td className="px-4 py-4 text-gray-300 hidden md:table-cell">{member.department}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            member.status === 'actif' ? 'bg-green-500/20 text-green-400' :
                            member.status === 'suspendu' ? 'bg-orange-500/20 text-orange-400' :
                            member.status === 'bloqué' ? 'bg-red-500/20 text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-yellow-400 font-bold">{member.totalXp.toLocaleString()}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {member.status === 'actif' ? (
                              <button
                                onClick={() => handleSuspendMember(member.id)}
                                className="p-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-colors"
                                title="Suspendre"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : member.status === 'suspendu' ? (
                              <button
                                onClick={() => handleActivateMember(member.id)}
                                className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                title="Réactiver"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleBlockMember(member.id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                              title="Bloquer"
                            >
                              <Lock className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-500 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODALS */}
        <AnimatePresence>
          {showMemberModal && selectedMember && (
            <MemberProfileModal
              member={selectedMember}
              isAdmin={isAdmin}
              onClose={() => setShowMemberModal(false)}
              onEdit={() => {
                setShowMemberModal(false);
                handleEditMember(selectedMember);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEditModal && selectedMember && (
            <MemberEditModal
              member={selectedMember}
              onMemberChange={setSelectedMember}
              onClose={() => setShowEditModal(false)}
              onSave={handleSaveEdit}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && selectedMember && (
            <MemberDeleteModal
              member={selectedMember}
              onClose={() => setShowDeleteModal(false)}
              onDelete={handleDeleteMember}
            />
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default TeamPage;
