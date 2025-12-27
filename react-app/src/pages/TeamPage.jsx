// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// PAGE ÉQUIPE AVEC ONGLET ADMIN POUR PILOTAGE COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Crown, Trophy, Star, Zap, Filter, Search,
  Phone, MapPin, Calendar, Award, Target, TrendingUp, Eye, UserPlus,
  X, RefreshCw, Settings, MoreVertical, Heart, Shield, Flame,
  Clock, CheckCircle, AlertCircle, Plus, Edit,
  Trash2, Ban, UserX, UserCheck, Lock, Unlock, AlertTriangle
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// 🖼️ IMPORT DU COMPOSANT AVATAR UNIVERSEL
import UserAvatar from '../components/common/UserAvatar.jsx';
import DetailedPixelAvatar, { DEFAULT_DETAILED_CONFIG } from '../components/customization/DetailedPixelAvatar.jsx';

// 🚀 IMPORT DU SYSTÈME BOOST
import { BoostButton } from '../components/boost';

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

                        {/* 🚀 BOUTON BOOST - Ne s'affiche pas pour soi-même */}
                        {!isCurrentUser && (
                          <div className="mb-2">
                            <BoostButton
                              targetUser={{
                                uid: member.id,
                                displayName: member.name,
                                email: member.email,
                                photoURL: member.photoURL
                              }}
                              currentUser={{
                                uid: user?.uid,
                                displayName: user?.displayName || user?.email,
                                email: user?.email,
                                photoURL: user?.photoURL
                              }}
                              variant="small"
                              className="w-full justify-center"
                              onBoostSent={(result) => {
                                showNotification(result.message, 'success');
                              }}
                            />
                          </div>
                        )}

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

    {/* MODAL PROFIL MEMBRE AVEC QUÊTES DÉTAILLÉES */}
        <AnimatePresence>
          {showMemberModal && selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
              onClick={() => setShowMemberModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-auto"
              >
{/* HEADER DU MODAL */}
<div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
  <div className="flex items-center gap-3 sm:gap-4">
    <UserAvatar
      user={selectedMember}
      size="xl"
      showBorder={true}
      className="shrink-0"
    />
    <div className="min-w-0">
      <h3 className="text-lg sm:text-2xl font-bold text-white truncate">{selectedMember.name}</h3>
      <p className="text-gray-400 text-sm sm:text-base">{selectedMember.role}</p>
      <p className="text-gray-500 text-xs sm:text-sm truncate">{selectedMember.email}</p>
    </div>
  </div>
  <button
    onClick={() => setShowMemberModal(false)}
    className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
  >
    <X className="w-5 h-5 text-gray-400" />
  </button>
</div>

{/* STATISTIQUES RAPIDES */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
  <div className="bg-yellow-500/10 rounded-xl p-3 sm:p-4 border border-yellow-500/20">
    <div className="flex items-center gap-2 mb-2">
      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
      <span className="text-yellow-400 text-xs sm:text-sm">XP Total</span>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-white">{selectedMember.totalXp?.toLocaleString() || 0}</div>
    <div className="text-xs text-gray-400 mt-1">Niveau {selectedMember.level || 1}</div>
  </div>

  <div className="bg-blue-500/10 rounded-xl p-3 sm:p-4 border border-blue-500/20">
    <div className="flex items-center gap-2 mb-2">
      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
      <span className="text-blue-400 text-xs sm:text-sm">En cours</span>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-white">{selectedMember.questsInProgress || 0}</div>
    <div className="text-xs text-gray-400 mt-1">quêtes actives</div>
  </div>

  <div className="bg-green-500/10 rounded-xl p-3 sm:p-4 border border-green-500/20">
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
      <span className="text-green-400 text-xs sm:text-sm">Accomplies</span>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-white">{selectedMember.questsCompleted || 0}</div>
    <div className="text-xs text-gray-400 mt-1">quêtes validées</div>
  </div>

  <div className="bg-purple-500/10 rounded-xl p-3 sm:p-4 border border-purple-500/20">
    <div className="flex items-center gap-2 mb-2">
      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
      <span className="text-purple-400 text-xs sm:text-sm">Badges</span>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-white">{selectedMember.badgesCount || 0}</div>
    <div className="text-xs text-gray-400 mt-1">débloqués</div>
  </div>
</div>

{/* PROGRESSION NIVEAU */}
<div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
  <div className="flex items-center justify-between mb-2">
    <span className="text-gray-300 font-medium text-sm sm:text-base">Niveau {selectedMember.level || 1}</span>
    <span className="text-gray-400 text-xs sm:text-sm">
      {selectedMember.currentLevelXp || 0} / {selectedMember.nextLevelXpRequired || 100} XP
    </span>
  </div>
  <div className="w-full bg-white/10 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
      style={{ width: `${selectedMember.xpProgress || 0}%` }}
    />
  </div>
  <div className="text-xs text-gray-400 mt-1 text-right">
    {Math.round(selectedMember.xpProgress || 0)}% jusqu'au niveau suivant
  </div>
</div>

{/* LISTE DES QUÊTES */}
<div className="bg-white/5 rounded-xl p-4 border border-white/10">
  <div className="flex items-center gap-3 mb-4">
    <Target className="w-5 h-5 text-purple-400" />
    <h4 className="text-base sm:text-lg font-bold text-white">
      Quêtes assignées ({selectedMember.questsTotal || 0})
    </h4>
  </div>

  {(!selectedMember.quests || selectedMember.quests.length === 0) ? (
    <div className="text-center py-8">
      <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
      <p className="text-gray-400">Aucune quête assignée pour le moment</p>
    </div>
  ) : (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {selectedMember.quests.map((quest) => {
        const statusConfig = {
          'todo': { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Clock, label: 'À faire' },
          'in_progress': { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Zap, label: 'En cours' },
          'pending': { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: AlertCircle, label: 'En attente' },
          'completed': { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle, label: 'Accomplie' },
          'validated': { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Trophy, label: 'Validée' }
        };

        const config = statusConfig[quest.status] || statusConfig['todo'];
        const StatusIcon = config.icon;

        return (
          <div
            key={quest.id}
            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h5 className="text-white font-medium mb-1">{quest.title}</h5>
                {quest.description && (
                  <p className="text-gray-400 text-sm line-clamp-2">{quest.description}</p>
                )}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bg} ${config.color} text-xs font-medium ml-2`}>
                <StatusIcon className="w-3 h-3" />
                {config.label}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
              {quest.priority && (
                <span className={`flex items-center gap-1 ${
                  quest.priority === 'urgent' ? 'text-red-400' :
                  quest.priority === 'high' ? 'text-orange-400' :
                  quest.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  <AlertCircle className="w-3 h-3" />
                  {quest.priority}
                </span>
              )}
              {quest.difficulty && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {quest.difficulty}
                </span>
              )}
              {quest.xpReward && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Zap className="w-3 h-3" />
                  +{quest.xpReward} XP
                </span>
              )}
              {quest.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(quest.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

{/* INFORMATIONS SUPPLÉMENTAIRES */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6">
  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    <h5 className="text-white font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
      <MapPin className="w-4 h-4 text-gray-400" />
      Informations
    </h5>
    <div className="space-y-2 text-xs sm:text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Département:</span>
        <span className="text-white">{selectedMember.department || 'Non spécifié'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Statut:</span>
        <span className={`font-medium ${
          selectedMember.status === 'actif' ? 'text-green-400' :
          selectedMember.status === 'suspendu' ? 'text-orange-400' :
          selectedMember.status === 'bloqué' ? 'text-red-400' : 'text-gray-400'
        }`}>
          {selectedMember.status || 'actif'}
        </span>
      </div>
      {selectedMember.phone && (
        <div className="flex justify-between">
          <span className="text-gray-400">Téléphone:</span>
          <span className="text-white">{selectedMember.phone}</span>
        </div>
      )}
      {selectedMember.location && (
        <div className="flex justify-between">
          <span className="text-gray-400">Localisation:</span>
          <span className="text-white">{selectedMember.location}</span>
        </div>
      )}
    </div>
  </div>

  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    <h5 className="text-white font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
      <TrendingUp className="w-4 h-4 text-gray-400" />
      Performance
    </h5>
    <div className="space-y-2 text-xs sm:text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Taux de complétion:</span>
        <span className="text-white font-medium">{selectedMember.completionRate || 0}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">XP cette semaine:</span>
        <span className="text-yellow-400 font-medium">+{selectedMember.weeklyXp || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">XP ce mois:</span>
        <span className="text-yellow-400 font-medium">+{selectedMember.monthlyXp || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Dernière activité:</span>
        <span className="text-white">
          {selectedMember.lastActivity
            ? new Date(selectedMember.lastActivity).toLocaleDateString()
            : 'Inconnue'}
        </span>
      </div>
    </div>
  </div>
</div>

{/* BADGES */}
{selectedMember.badges && selectedMember.badges.length > 0 && (
  <div className="bg-white/5 rounded-xl p-4 mt-4 border border-white/10">
    <h5 className="text-white font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
      <Award className="w-4 h-4 text-gray-400" />
      Badges débloqués ({selectedMember.badges.length})
    </h5>
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {selectedMember.badges.slice(0, 12).map((badge, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-2 sm:p-3 flex items-center gap-2"
          title={badge.name || badge}
        >
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <span className="text-white text-xs sm:text-sm font-medium">
            {typeof badge === 'string' ? badge : badge.name || 'Badge'}
          </span>
        </div>
      ))}
      {selectedMember.badges.length > 12 && (
        <div className="bg-white/5 rounded-xl p-2 sm:p-3 flex items-center justify-center text-gray-400 text-xs sm:text-sm border border-white/10">
          +{selectedMember.badges.length - 12} autres
        </div>
      )}
    </div>
  </div>
)}

{/* ACTIONS */}
{isAdmin && (
  <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
    <button
      onClick={() => {
        setShowMemberModal(false);
        handleEditMember(selectedMember);
      }}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors text-sm sm:text-base"
    >
      <Edit className="w-5 h-5" />
      Modifier le profil
    </button>
  </div>
)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL ÉDITION */}
        <AnimatePresence>
          {showEditModal && selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Modifier le membre</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nom</label>
                    <input
                      type="text"
                      value={selectedMember.name}
                      onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Rôle</label>
                    <input
                      type="text"
                      value={selectedMember.role}
                      onChange={(e) => setSelectedMember({...selectedMember, role: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Département</label>
                    <input
                      type="text"
                      value={selectedMember.department}
                      onChange={(e) => setSelectedMember({...selectedMember, department: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Statut</label>
                    <select
                      value={selectedMember.status}
                      onChange={(e) => setSelectedMember({...selectedMember, status: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
                    >
                      <option value="actif" className="bg-slate-900">Actif</option>
                      <option value="inactif" className="bg-slate-900">Inactif</option>
                      <option value="suspendu" className="bg-slate-900">Suspendu</option>
                      <option value="bloqué" className="bg-slate-900">Bloqué</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL SUPPRESSION */}
        <AnimatePresence>
          {showDeleteModal && selectedMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-6 text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Suppression définitive</h3>
                </div>

                <p className="text-gray-300 mb-6">
                  Êtes-vous absolument certain de vouloir supprimer <strong>{selectedMember.name}</strong> ?
                  Cette action est irréversible et toutes les données seront perdues.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteMember}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                  >
                    Supprimer
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

export default TeamPage;
