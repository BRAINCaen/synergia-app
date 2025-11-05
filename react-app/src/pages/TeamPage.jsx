// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// PAGE ÉQUIPE AVEC ONGLET ADMIN POUR PILOTAGE COMPLET
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, Trophy, Star, Zap, Filter, Search, Mail, MessageCircle, 
  Phone, MapPin, Calendar, Award, Target, TrendingUp, Eye, UserPlus,
  Send, X, RefreshCw, Settings, MoreVertical, Heart, Shield, Flame,
  Clock, CheckCircle, AlertCircle, MessageSquare, Video, Plus, Edit,
  Trash2, Ban, UserX, UserCheck, Lock, Unlock, AlertTriangle
} from 'lucide-react';

// 🎯 IMPORT DU LAYOUT AVEC MENU HAMBURGER
import Layout from '../components/layout/Layout.jsx';

// 🔥 HOOKS ET SERVICES FIREBASE
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  addDoc,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

/**
 * 🏢 PAGE ÉQUIPE AVEC PILOTAGE ADMIN
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // États messagerie
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageRecipient, setMessageRecipient] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConversations, setShowConversations] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);

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

  /**
   * 🚀 CHARGEMENT ET SYNCHRONISATION AUTOMATIQUE
   */
  useEffect(() => {
    let unsubscribeTeam = null;
    let unsubscribeMessages = null;
    
    const initializeData = async () => {
      // Charger les membres avec synchronisation temps réel
      unsubscribeTeam = await loadAllTeamMembers();
      
      // Charger la messagerie avec synchronisation temps réel
      unsubscribeMessages = await loadMessagingData();
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
      if (unsubscribeMessages && typeof unsubscribeMessages === 'function') {
        console.log('🧹 Nettoyage listener messagerie');
        unsubscribeMessages();
      }
    };
  }, [user?.uid]);

  const loadAllTeamMembers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('👥 Chargement COMPLET avec synchronisation QUÊTES...');
      
      // ÉCOUTE TEMPS RÉEL sur users
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('gamification.totalXp', 'desc')
      );
      
      const unsubscribe = onSnapshot(usersQuery, async (usersSnapshot) => {
        
        if (usersSnapshot.empty) {
          console.warn('⚠️ Aucun utilisateur trouvé !');
          setTeamMembers([]);
          setLoading(false);
          return;
        }

        const membersData = [];
        
        // Pour chaque utilisateur
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const userId = userDoc.id;
          
          const userName = userData.displayName || userData.name || 'Inconnu';
          const userEmail = userData.email || '';
          console.log(`🔍 Recherche quêtes pour: ${userName} (ID: ${userId}, Email: ${userEmail})`);
          
          // RÉCUPÉRER TOUTES LES QUÊTES
          const allQuestsQuery = query(collection(db, 'quests'));
          const allQuestsSnap = await getDocs(allQuestsQuery);
          
          const userQuests = [];
          let questsInProgress = 0;
          let questsCompleted = 0;
          
          // 🔍 DEBUG : Afficher TOUTES les quêtes pour cet utilisateur
          if (userName === 'Laurena Gey' || userEmail.includes('laurena')) {
            console.log('🐛 DEBUG LAURENA - Analyse de TOUTES les quêtes:');
            allQuestsSnap.forEach(doc => {
              const q = doc.data();
              console.log(`   📋 "${q.title}"`);
              console.log(`      assignedTo:`, q.assignedTo);
              console.log(`      type:`, Array.isArray(q.assignedTo) ? 'array' : typeof q.assignedTo);
              console.log(`      status:`, q.status);
            });
          }
          
          allQuestsSnap.forEach(doc => {
            const questData = doc.data();
            const assignedTo = questData.assignedTo;
            
            // VÉRIFICATION MULTIPLE : UID, EMAIL, NOM
            let isAssigned = false;
            
            // 🔍 DEBUG pour Laurena
            const isLaurena = userName === 'Laurena Gey' || userEmail.includes('laurena');
            
            if (Array.isArray(assignedTo)) {
              // Vérifier si array contient UID, email ou nom
              isAssigned = assignedTo.some(item => {
                if (!item) return false;
                const itemStr = String(item).toLowerCase();
                const matchUID = itemStr === userId.toLowerCase();
                const matchEmail = itemStr === userEmail.toLowerCase();
                const matchName = itemStr === userName.toLowerCase();
                
                if (isLaurena && (matchUID || matchEmail || matchName)) {
                  console.log(`      ✅ MATCH trouvé pour "${questData.title}":`, { itemStr, matchUID, matchEmail, matchName });
                }
                
                return matchUID || matchEmail || matchName;
              });
            } else if (assignedTo) {
              // Vérifier si string correspond à UID, email ou nom
              const assignedStr = String(assignedTo).toLowerCase();
              const matchUID = assignedStr === userId.toLowerCase();
              const matchEmail = assignedStr === userEmail.toLowerCase();
              const matchName = assignedStr === userName.toLowerCase();
              
              if (isLaurena) {
                console.log(`   🔍 Comparaison pour "${questData.title}":`, {
                  assignedStr,
                  userId: userId.toLowerCase(),
                  userEmail: userEmail.toLowerCase(),
                  userName: userName.toLowerCase(),
                  matchUID,
                  matchEmail,
                  matchName
                });
              }
              
              isAssigned = matchUID || matchEmail || matchName;
            }
            
            if (isAssigned) {
              const quest = {
                id: doc.id,
                ...questData
              };
              userQuests.push(quest);
              
              console.log(`   ✅ Quête trouvée: "${questData.title}" (${questData.status})`);
              
              // Compter par statut
              if (questData.status === 'in_progress' || questData.status === 'todo') {
                questsInProgress++;
              } else if (questData.status === 'completed' || questData.status === 'validated') {
                questsCompleted++;
              }
            }
          });
          
          console.log(`📊 ${userName}: ${userQuests.length} quêtes trouvées`);
          console.log(`   📍 ${questsInProgress} en cours, ${questsCompleted} accomplies`);
          if (userQuests.length > 0) {
            console.log(`   📋 Liste:`, userQuests.map(q => `"${q.title}" (${q.status})`).join(', '));
          }
          
          // DONNÉES GAMIFICATION
          const gamification = userData.gamification || {};
          const totalXp = gamification.totalXp || 0;
          const level = gamification.level || Math.floor(totalXp / 100) + 1;
          const badges = gamification.badges || [];
          
          // CRÉER L'OBJET MEMBRE COMPLET
          const member = {
            id: userId,
            uid: userId,
            name: userData.displayName || userData.name || 'Utilisateur anonyme',
            email: userData.email || '',
            role: userData.role || 'Membre',
            department: userData.department || 'Non spécifié',
            photoURL: userData.photoURL || null,
            status: userData.status || 'actif',
            isOnline: userData.isOnline || false,
            joinedAt: userData.createdAt?.toDate?.() || new Date(),
            lastActivity: userData.lastActivity?.toDate?.() || new Date(),
            
            // DONNÉES GAMIFICATION SYNCHRONISÉES
            totalXp: totalXp,
            level: level,
            weeklyXp: gamification.weeklyXp || 0,
            monthlyXp: gamification.monthlyXp || 0,
            badgesCount: badges.length,
            badges: badges,
            
            // DONNÉES QUÊTES SYNCHRONISÉES
            questsInProgress: questsInProgress,
            questsCompleted: questsCompleted,
            questsTotal: userQuests.length,
            quests: userQuests, // Toutes les quêtes détaillées
            
            // DONNÉES CALCULÉES
            completionRate: userQuests.length > 0 ? Math.round((questsCompleted / userQuests.length) * 100) : 0,
            currentLevelXp: totalXp % 100,
            nextLevelXpRequired: 100,
            xpProgress: ((totalXp % 100) / 100) * 100,
            
            // DONNÉES PROFIL
            phone: userData.phone || null,
            location: userData.location || null,
            bio: userData.bio || null,
            skills: userData.skills || [],
            synergiaRoles: userData.synergiaRoles || [],
            
            // MÉTADONNÉES
            lastSync: new Date(),
            syncSource: 'firebase_realtime_quests'
          };
          
          membersData.push(member);
        }
        
        const totalQuests = membersData.reduce((sum, m) => sum + m.questsTotal, 0);
        const totalInProgress = membersData.reduce((sum, m) => sum + m.questsInProgress, 0);
        const totalCompleted = membersData.reduce((sum, m) => sum + m.questsCompleted, 0);
        
        console.log(`✅ ${membersData.length} membres chargés`);
        console.log(`📊 Total: ${totalQuests} quêtes (${totalInProgress} en cours, ${totalCompleted} accomplies)`);
        
        setTeamMembers(membersData);
        setLoading(false);
      }, (error) => {
        console.error('❌ Erreur synchronisation:', error);
        setError(error.message);
        setLoading(false);
      });
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const loadMessagingData = async () => {
    try {
      if (!user?.uid) return;

      console.log('💬 Chargement messagerie temps réel...');

      // Écouter les messages en temps réel où l'utilisateur est participant
      const messagesQuery = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = [];
        let unread = 0;
        const conversationsMap = new Map();

        snapshot.forEach((doc) => {
          const messageData = { id: doc.id, ...doc.data() };
          messagesData.push(messageData);
          
          // Compter les non lus
          if (!messageData.read && messageData.recipientId === user.uid) {
            unread++;
          }

          // Construire les conversations
          const otherUserId = messageData.senderId === user.uid 
            ? messageData.recipientId 
            : messageData.senderId;
          
          if (!conversationsMap.has(otherUserId)) {
            conversationsMap.set(otherUserId, {
              userId: otherUserId,
              userName: messageData.senderId === user.uid 
                ? messageData.recipientName 
                : messageData.senderName,
              lastMessage: messageData.content,
              lastMessageDate: messageData.createdAt,
              unreadCount: 0
            });
          }

          if (!messageData.read && messageData.recipientId === user.uid) {
            const conv = conversationsMap.get(otherUserId);
            conv.unreadCount++;
          }
        });

        setMessages(messagesData);
        setUnreadCount(unread);
        setConversations(Array.from(conversationsMap.values()));
        
        console.log(`✅ ${messagesData.length} messages chargés, ${unread} non lus`);
      });

      return unsubscribe;

    } catch (error) {
      console.error('❌ Erreur chargement messagerie:', error);
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
      label: "Messages", 
      value: `${unreadCount}/${messages.length}`, 
      icon: MessageCircle, 
      color: unreadCount > 0 ? "text-red-400" : "text-gray-400"
    }
  ];

  /**
   * ✉️ ENVOYER UN MESSAGE
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !messageRecipient) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        recipientId: messageRecipient.id,
        recipientName: messageRecipient.name,
        content: newMessage,
        participants: [user.uid, messageRecipient.id],
        read: false,
        createdAt: serverTimestamp()
      });

      setNewMessage('');
      showNotification('Message envoyé avec succès !', 'success');
      setShowMessageModal(false);
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      showNotification('Erreur lors de l\'envoi du message', 'error');
    }
  };

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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de l'équipe...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* 🎯 HEADER */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text mb-2">
                  👥 Gestion Équipe
                </h1>
                <p className="text-gray-400">
                  Collaborez et suivez les performances de votre équipe ({teamStats.totalMembers} membres)
                </p>
              </div>

              {/* Boutons actions rapides */}
              <div className="flex gap-3">
                
                {/* BOUTON TEST ADMIN - À RETIRER EN PRODUCTION */}
                <button
                  onClick={() => {
                    setForceAdminMode(!forceAdminMode);
                    console.log('🔧 Mode Admin forcé:', !forceAdminMode);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    forceAdminMode 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-white'
                  }`}
                  title="Activer/désactiver le mode admin (TEST)"
                >
                  <Shield className="w-5 h-5" />
                  {forceAdminMode ? 'Admin ON' : 'Test Admin'}
                </button>
                
                <button
                  onClick={() => loadAllTeamMembers()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Actualiser
                </button>
                
                {isAdmin && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg text-white transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    Inviter
                  </button>
                )}
              </div>
            </div>

            {/* STATISTIQUES HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {headerStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {stat.label}
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ONGLETS */}
            <div className="flex gap-2 bg-gray-800/50 p-2 rounded-lg">
              <button
                onClick={() => {
                  console.log('🖱️ Clic sur onglet Membres');
                  setActiveTab('members');
                }}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'members'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Membres</span>
                </div>
              </button>

              {isAdmin ? (
                <button
                  onClick={() => {
                    console.log('🖱️ Clic sur onglet Admin');
                    setActiveTab('admin');
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'admin'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Administration</span>
                  </div>
                </button>
              ) : (
                <div className="flex-1 px-4 py-3 rounded-lg bg-gray-700/30 text-gray-500 cursor-not-allowed">
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium text-sm">Admin (rôle requis)</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Debug info - À RETIRER EN PRODUCTION */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300">
                    <strong>DEBUG:</strong> Onglet actif: <span className="font-mono">{activeTab}</span> | 
                    Is Admin: <span className="font-mono">{isAdmin ? 'OUI' : 'NON'}</span> | 
                    Role: <span className="font-mono">{user?.role || 'non défini'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">Synchronisation temps réel active</span>
                </div>
              </div>
              <div className="mt-2 text-blue-200 text-xs">
                Dernière MAJ: {new Date().toLocaleTimeString()} | 
                Membres chargés: {teamMembers.length} | 
                XP total équipe: {teamMembers.reduce((sum, m) => sum + (m.totalXp || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* ONGLET MEMBRES */}
          {activeTab === 'members' && (
            <>
              {/* FILTRES ET RECHERCHE */}
              <div className="mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  
                  {/* Bouton conversations */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Équipe</h3>
                    <button
                      onClick={() => setShowConversations(!showConversations)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors relative"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Conversations</span>
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {dept === 'all' ? 'Tous les départements' : dept}
                        </option>
                      ))}
                    </select>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                    >
                      {roles.slice(0, 6).map(role => (
                        <option key={role} value={role}>
                          {role === 'all' ? 'Tous les rôles' : role}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="actif">Actifs</option>
                      <option value="récent">Récents</option>
                      <option value="inactif">Inactifs</option>
                      <option value="suspendu">Suspendus</option>
                      <option value="bloqué">Bloqués</option>
                    </select>

                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDepartmentFilter('all');
                        setRoleFilter('all');
                        setStatusFilter('all');
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Réinitialiser
                    </button>
                  </div>

                  <div className="mt-4 text-sm text-gray-400">
                    {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} trouvé{filteredMembers.length !== 1 ? 's' : ''}
                    {filteredMembers.length !== teamMembers.length && (
                      <span> sur {teamMembers.length} au total</span>
                    )}
                  </div>
                </div>
              </div>

              {/* PANNEAU CONVERSATIONS */}
              <AnimatePresence>
                {showConversations && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-xl font-bold text-white mb-4">Conversations récentes</h3>
                      
                      {conversations.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Aucune conversation pour le moment</p>
                          <p className="text-sm mt-2">Cliquez sur "Message" sur une carte membre pour démarrer</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {conversations.map((conv) => (
                            <div
                              key={conv.userId}
                              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                              onClick={() => {
                                const member = teamMembers.find(m => m.id === conv.userId);
                                if (member) {
                                  setMessageRecipient(member);
                                  setActiveConversation(conv.userId);
                                  setShowMessageModal(true);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold">
                                    {conv.userName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">{conv.userName}</span>
                                    {conv.unreadCount > 0 && (
                                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {conv.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-sm truncate">{conv.lastMessage}</p>
                                </div>
                              </div>
                              <MessageCircle className="w-5 h-5 text-blue-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* GRILLE DES MEMBRES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member, index) => {
                  const isCurrentUser = member.id === user?.uid;
                  
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:border-purple-500/50
                        ${isCurrentUser ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700/50'}
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

                      <div className="mt-6 text-center">
                        <div className="relative inline-block mb-4">
                          {member.photoURL ? (
                            <img 
                              src={member.photoURL} 
                              alt={member.name}
                              className="w-16 h-16 rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                              <span className="text-white font-bold text-xl">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{member.role}</p>
                        <p className="text-gray-500 text-xs mb-3">{member.department}</p>

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
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

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowMemberModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Profil
                          </button>
                          <button
                            onClick={() => {
                              setMessageRecipient(member);
                              setShowMessageModal(true);
                            }}
                            className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                          >
                            <Mail className="w-4 h-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* ONGLET ADMINISTRATION */}
          {activeTab === 'admin' && isAdmin && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-red-400" />
                <h2 className="text-2xl font-bold text-white">Panneau d'Administration</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Membre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rôle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Département</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">XP</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-medium">{member.name}</div>
                              <div className="text-gray-400 text-sm">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-300">{member.role}</td>
                        <td className="px-4 py-4 text-gray-300">{member.department}</td>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowMemberModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Profil de {selectedMember.name}</h3>
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Infos profil */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {selectedMember.photoURL ? (
                      <img 
                        src={selectedMember.photoURL} 
                        alt={selectedMember.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {selectedMember.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white">{selectedMember.name}</h4>
                      <p className="text-gray-400">{selectedMember.email}</p>
                      <p className="text-gray-500 text-sm">{selectedMember.role} • {selectedMember.department}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{selectedMember.totalXp.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">XP Total</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">{selectedMember.level}</div>
                      <div className="text-xs text-gray-400">Niveau</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{selectedMember.questsCompleted || 0}</div>
                      <div className="text-xs text-gray-400">Accomplies</div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-400">{selectedMember.questsInProgress || 0}</div>
                      <div className="text-xs text-gray-400">En cours</div>
                    </div>
                  </div>

                  {/* QUÊTES DÉTAILLÉES */}
                  <div className="mt-6">
                    <h5 className="text-xl font-bold text-white mb-4">🎯 Quêtes détaillées</h5>
                    
                    {/* Onglets Quêtes */}
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setActiveTab('quests_in_progress')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activeTab === 'quests_in_progress'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        En cours ({selectedMember.questsInProgress || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('quests_completed')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          activeTab === 'quests_completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Accomplies ({selectedMember.questsCompleted || 0})
                      </button>
                    </div>

                    {/* Liste des quêtes */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedMember.quests && selectedMember.quests.length > 0 ? (
                        selectedMember.quests
                          .filter(quest => {
                            if (activeTab === 'quests_in_progress') {
                              return quest.status === 'in_progress' || quest.status === 'todo';
                            } else if (activeTab === 'quests_completed') {
                              return quest.status === 'completed' || quest.status === 'validated';
                            }
                            return true;
                          })
                          .map((quest) => (
                            <div
                              key={quest.id}
                              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h6 className="text-white font-medium mb-1">{quest.title}</h6>
                                  <p className="text-gray-400 text-sm line-clamp-2">{quest.description}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      quest.status === 'completed' || quest.status === 'validated'
                                        ? 'bg-green-500/20 text-green-400'
                                        : quest.status === 'in_progress'
                                        ? 'bg-orange-500/20 text-orange-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {quest.status === 'completed' ? 'Complétée' : 
                                       quest.status === 'validated' ? 'Validée' :
                                       quest.status === 'in_progress' ? 'En cours' : 'À faire'}
                                    </span>
                                    <span className="text-yellow-400 text-xs font-medium">
                                      +{quest.xpReward || 0} XP
                                    </span>
                                    {quest.priority && (
                                      <span className={`text-xs ${
                                        quest.priority === 'high' ? 'text-red-400' :
                                        quest.priority === 'medium' ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                        Priorité: {quest.priority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <p>Aucune quête pour le moment</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedMember.bio && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Bio</h5>
                      <p className="text-gray-300">{selectedMember.bio}</p>
                    </div>
                  )}

                  {selectedMember.skills && selectedMember.skills.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Compétences</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Modifier le membre</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Rôle</label>
                    <input
                      type="text"
                      value={selectedMember.role}
                      onChange={(e) => setSelectedMember({...selectedMember, role: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Département</label>
                    <input
                      type="text"
                      value={selectedMember.department}
                      onChange={(e) => setSelectedMember({...selectedMember, department: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Statut</label>
                    <select
                      value={selectedMember.status}
                      onChange={(e) => setSelectedMember({...selectedMember, status: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="actif">Actif</option>
                      <option value="inactif">Inactif</option>
                      <option value="suspendu">Suspendu</option>
                      <option value="bloqué">Bloqué</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
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
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteMember}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL MESSAGE */}
        <AnimatePresence>
          {showMessageModal && messageRecipient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowMessageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">Conversation avec {messageRecipient.name}</h3>
                      <p className="text-gray-400 text-sm">{messageRecipient.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Historique des messages */}
                <div className="mb-6 max-h-96 overflow-y-auto space-y-3">
                  {messages
                    .filter(msg => 
                      (msg.senderId === user.uid && msg.recipientId === messageRecipient.id) ||
                      (msg.senderId === messageRecipient.id && msg.recipientId === user.uid)
                    )
                    .sort((a, b) => {
                      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
                      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
                      return aTime - bTime;
                    })
                    .map((message) => {
                      const isOwn = message.senderId === user.uid;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-700 text-gray-100'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                              {message.createdAt?.toDate?.().toLocaleString() || 'À l\'instant'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  
                  {messages.filter(msg => 
                    (msg.senderId === user.uid && msg.recipientId === messageRecipient.id) ||
                    (msg.senderId === messageRecipient.id && msg.recipientId === user.uid)
                  ).length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun message échangé</p>
                      <p className="text-sm mt-2">Démarrez la conversation ci-dessous</p>
                    </div>
                  )}
                </div>

                {/* Formulaire nouveau message */}
                <div className="space-y-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Votre message..."
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowMessageModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer
                    </button>
                  </div>
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
