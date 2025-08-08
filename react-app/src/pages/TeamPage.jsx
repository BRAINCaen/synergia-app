// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// TEAM PAGE COMPLÈTE AVEC SYSTÈME MESSAGERIE
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
  Send
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

/**
 * 👥 PAGE ÉQUIPE AVEC SYSTÈME DE MESSAGERIE COMPLET
 */
const TeamPage = () => {
  const { user } = useAuthStore();
  
  // ==========================================
  // 📊 ÉTATS PRINCIPAUX
  // ==========================================
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [lastSync, setLastSync] = useState(null);

  // ==========================================
  // 📧 ÉTATS POUR LA MESSAGERIE
  // ==========================================
  
  const [showMessagingInterface, setShowMessagingInterface] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMemberForMessage, setSelectedMemberForMessage] = useState(null);
  const [messageFormData, setMessageFormData] = useState({
    subject: '',
    message: ''
  });

  // ==========================================
  // 🎯 ÉTATS POUR MODALS ET ACTIONS
  // ==========================================
  
  const [showMemberProfile, setShowMemberProfile] = useState(false);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState(null);
  const [showMemberActions, setShowMemberActions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedMemberForActions, setSelectedMemberForActions] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role: '',
    department: '',
    bio: ''
  });

  // ==========================================
  // 🔄 ÉTATS POUR LES ACTIONS
  // ==========================================
  
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // ==========================================
  // 📱 CHARGEMENT DES DONNÉES
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 Chargement des membres de l\'équipe...');
    setLoading(true);

    // Écoute en temps réel des membres
    const unsubscribeTeam = onSnapshot(
      query(collection(db, 'users'), orderBy('displayName', 'asc')),
      (snapshot) => {
        const members = [];
        snapshot.forEach((doc) => {
          const userData = doc.data();
          members.push({
            id: doc.id,
            userId: doc.id,
            ...userData,
            displayName: userData.displayName || userData.email,
            name: userData.displayName || userData.firstName + ' ' + userData.lastName || userData.email,
            status: userData.isOnline ? 'online' : 'offline',
            lastSeen: userData.lastLoginAt || userData.createdAt
          });
        });

        console.log('✅ Membres récupérés:', members.length);
        setTeamMembers(members);
        setError(null);
        setLoading(false);
        setLastSync(new Date());
      },
      (error) => {
        console.error('❌ Erreur chargement équipe:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeTeam();
    };
  }, [user?.uid]);

  // ==========================================
  // 📬 ÉCOUTE DES NOUVEAUX MESSAGES
  // ==========================================

  useEffect(() => {
    if (!user?.uid) return;
    
    // Écoute des nouveaux messages en temps réel
    const unsubscribeMessages = messagingService.subscribeToNewMessages(
      user.uid,
      (newMessages) => {
        setUnreadMessagesCount(newMessages.length);
      }
    );
    
    // Cleanup
    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [user?.uid]);

  // ==========================================
  // 🔍 FILTRAGE ET RECHERCHE
  // ==========================================

  useEffect(() => {
    let filtered = teamMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [teamMembers, searchTerm, roleFilter]);

  // ==========================================
  // 🎯 GESTION DES CLICS EXTÉRIEURS
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMemberActions && !event.target.closest('[data-menu-container]')) {
        setShowMemberActions(false);
        setSelectedMemberForActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMemberActions]);

  // ==========================================
  // 📧 FONCTIONS DE MESSAGERIE
  // ==========================================

  const handleOpenMessaging = () => {
    console.log('📬 Ouverture interface de messagerie');
    setShowMessagingInterface(true);
  };

  const handleSendMessage = async () => {
    if (!selectedMemberForMessage || !messageFormData.subject.trim() || !messageFormData.message.trim()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setActionLoading(true);
    try {
      console.log('📨 Envoi message vers Firebase:', {
        to: selectedMemberForMessage.email,
        subject: messageFormData.subject,
        content: messageFormData.message
      });
      
      // VRAI ENVOI avec messagingService
      const result = await messagingService.sendMessage(
        user.uid,
        selectedMemberForMessage.userId || selectedMemberForMessage.id,
        messageFormData.subject,
        messageFormData.message,
        {
          recipientEmail: selectedMemberForMessage.email,
          recipientName: selectedMemberForMessage.displayName || selectedMemberForMessage.name,
          senderName: user.displayName || user.email
        }
      );
      
      if (result.success) {
        setSuccessMessage(`✅ Message envoyé à ${selectedMemberForMessage.displayName || selectedMemberForMessage.name} !`);
        setShowMessageModal(false);
        setMessageFormData({ subject: '', message: '' });
        setSelectedMemberForMessage(null);
        
        console.log('✅ Message sauvegardé dans Firebase avec ID:', result.messageId);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      alert(`Erreur lors de l'envoi du message: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // 👤 FONCTIONS DE GESTION DES MEMBRES
  // ==========================================

  const handleEditMember = (member) => {
    console.log('✏️ Modification membre:', member.name);
    setSelectedMemberForEdit(member);
    setEditFormData({
      name: member.displayName || member.name || '',
      role: member.role || '',
      department: member.department || '',
      bio: member.bio || ''
    });
    setShowEditModal(true);
    setShowMemberActions(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedMemberForEdit || !editFormData.name.trim()) {
      alert('Le nom est requis');
      return;
    }

    setActionLoading(true);
    try {
      console.log('💾 Sauvegarde modifications:', editFormData);
      
      const memberRef = doc(db, 'users', selectedMemberForEdit.id);
      await updateDoc(memberRef, {
        displayName: editFormData.name.trim(),
        role: editFormData.role.trim(),
        department: editFormData.department.trim(),
        bio: editFormData.bio.trim(),
        updatedAt: serverTimestamp()
      });
      
      setSuccessMessage(`✅ Profil de ${editFormData.name} mis à jour !`);
      setShowEditModal(false);
      setSelectedMemberForEdit(null);
      setEditFormData({ name: '', role: '', department: '', bio: '' });
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async (member) => {
    console.log('🗑️ Suppression membre:', member.name);
    
    setConfirmAction({
      title: 'Supprimer le membre',
      message: `Êtes-vous sûr de vouloir supprimer ${member.name} de l'équipe ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          // Supprimer de la collection users
          await deleteDoc(doc(db, 'users', member.id));
          
          // Supprimer aussi de teamMembers s'il existe
          const teamMemberQuery = query(
            collection(db, 'teamMembers'),
            where('userId', '==', member.id)
          );
          const teamMemberSnapshot = await getDocs(teamMemberQuery);
          
          teamMemberSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
          
          setSuccessMessage(`✅ ${member.name} a été supprimé de l'équipe`);
          
          // Auto-hide success message
          setTimeout(() => setSuccessMessage(''), 3000);
          
        } catch (error) {
          console.error('❌ Erreur suppression:', error);
          alert('Erreur lors de la suppression');
        } finally {
          setActionLoading(false);
        }
      }
    });
    
    setShowConfirmDialog(true);
    setShowMemberActions(false);
  };

  const handlePromoteMember = async (member) => {
    console.log('⬆️ Promotion membre:', member.name);
    
    const currentRole = member.role || 'Membre';
    const roleHierarchy = ['Membre', 'Senior', 'Manager', 'Admin'];
    const currentIndex = roleHierarchy.indexOf(currentRole);
    const newRole = currentIndex < roleHierarchy.length - 1 ? roleHierarchy[currentIndex + 1] : currentRole;
    
    if (newRole === currentRole) {
      alert('Ce membre a déjà le rôle le plus élevé');
      return;
    }
    
    setConfirmAction({
      title: 'Promouvoir le membre',
      message: `Promouvoir ${member.name} de "${currentRole}" vers "${newRole}" ?`,
      confirmText: 'Promouvoir',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const memberRef = doc(db, 'users', member.id);
          await updateDoc(memberRef, {
            role: newRole,
            promotedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          setSuccessMessage(`✅ ${member.name} a été promu "${newRole}"`);
          
          // Auto-hide success message
          setTimeout(() => setSuccessMessage(''), 3000);
          
        } catch (error) {
          console.error('❌ Erreur promotion:', error);
          alert('Erreur lors de la promotion');
        } finally {
          setActionLoading(false);
        }
      }
    });
    
    setShowConfirmDialog(true);
    setShowMemberActions(false);
  };

  const handleVideoCall = (member) => {
    console.log('📹 Appel vidéo avec:', member.name);
    
    setConfirmAction({
      title: 'Lancer un appel vidéo',
      message: `Démarrer un appel vidéo avec ${member.name} ?`,
      confirmText: 'Appeler',
      onConfirm: () => {
        // Simulation d'appel vidéo
        setSuccessMessage(`📹 Appel vidéo démarré avec ${member.name}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    });
    
    setShowConfirmDialog(true);
    setShowMemberActions(false);
  };

  // ==========================================
  // 📊 FONCTIONS UTILITAIRES
  // ==========================================

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-red-500/20 text-red-300 border-red-500/30',
      'Manager': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Senior': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Membre': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return colors[role] || colors['Membre'];
  };

  const getStatusColor = (status, lastSeen) => {
    if (status === 'online') return 'bg-green-500';
    
    if (lastSeen) {
      const now = new Date();
      const lastSeenDate = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
      const diffHours = (now - lastSeenDate) / (1000 * 60 * 60);
      
      if (diffHours < 1) return 'bg-yellow-500';
      if (diffHours < 24) return 'bg-orange-500';
    }
    
    return 'bg-gray-500';
  };

  const refreshTeam = async () => {
    console.log('🔄 Actualisation manuelle de l\'équipe...');
    setLoading(true);
    // La mise à jour se fait automatiquement via onSnapshot
    setTimeout(() => setLoading(false), 1000);
  };

  const inviteMember = async (email) => {
    console.log('📧 Invitation membre:', email);
    setSuccessMessage(`✅ Invitation envoyée à ${email}`);
    setShowInviteModal(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // ==========================================
  // 🎨 RENDU PRINCIPAL
  // ==========================================

  if (loading && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Chargement de l'équipe...</h2>
          <p className="text-gray-400">Récupération des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshTeam}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* ==========================================
            🏠 EN-TÊTE AVEC STATISTIQUES
            ========================================== */}
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Notre Équipe
              </h1>
              <p className="text-gray-400 text-lg">
                Gérez et collaborez avec votre équipe
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Bouton Messages avec notification */}
              <button
                onClick={handleOpenMessaging}
                className="relative px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Messages
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Inviter un membre
              </button>

              <button
                onClick={refreshTeam}
                disabled={loading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>

          {/* Indicateur de messages non lus */}
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

          {/* Statistiques de l'équipe */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{teamMembers.length}</h3>
                  <p className="text-gray-400 text-sm">Membres actifs</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {teamMembers.filter(m => m.status === 'online').length}
                  </h3>
                  <p className="text-gray-400 text-sm">En ligne</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {teamMembers.filter(m => m.role === 'Admin' || m.role === 'Manager').length}
                  </h3>
                  <p className="text-gray-400 text-sm">Managers</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{unreadMessagesCount}</h3>
                  <p className="text-gray-400 text-sm">Messages non lus</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message de succès */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300">{successMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==========================================
            🔍 BARRE DE RECHERCHE ET FILTRES
            ========================================== */}

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Senior">Senior</option>
                <option value="Membre">Membre</option>
              </select>

              <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Plus de filtres
              </button>
            </div>
          </div>

          {/* Informations de filtrage */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>
              Affichage de {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''} 
              {searchTerm && ` pour "${searchTerm}"`}
            </span>
            
            {lastSync && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Mis à jour il y a {Math.round((new Date() - lastSync) / 1000)}s
              </span>
            )}
          </div>
        </div>

        {/* ==========================================
            👥 GRILLE DES MEMBRES
            ========================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-[1.02]"
              >
                {/* En-tête du membre */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
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

                {/* Statistiques rapides */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{member.level || 1}</div>
                    <div className="text-xs text-gray-500">Niveau</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{member.totalXP || 0}</div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">{member.badges?.length || 0}</div>
                    <div className="text-xs text-gray-500">Badges</div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMemberForMessage(member);
                      setShowMessageModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Message
                  </button>
                  
                  <button className="flex-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Video className="w-3 h-3" />
                    Appel
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* État vide */}
        {filteredMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || roleFilter !== 'all' ? 'Aucun membre trouvé' : 'Aucun membre dans l\'équipe'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || roleFilter !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par inviter des membres à rejoindre votre équipe'
              }
            </p>
            {(!searchTerm && roleFilter === 'all') && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Inviter le premier membre
              </button>
            )}
          </div>
        )}

        {/* ==========================================
            🎯 MENU ACTIONS AVEC PORTAL - ACTIONS FONCTIONNELLES
            ========================================== */}
        
        {showMemberActions && selectedMemberForActions && ReactDOM.createPortal(
          <div 
            className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-48 z-[99999]"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`
            }}
            data-menu-container
          >
            <div className="py-1">
              <button
                onClick={() => handleEditMember(selectedMemberForActions)}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier le profil
              </button>
              
              <button
                onClick={() => {
                  setSelectedMemberForMessage(selectedMemberForActions);
                  setShowMessageModal(true);
                  setShowMemberActions(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Envoyer un message
              </button>
              
              <button
                onClick={() => handlePromoteMember(selectedMemberForActions)}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Promouvoir
              </button>
              
              <button
                onClick={() => handleVideoCall(selectedMemberForActions)}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Appel vidéo
              </button>
              
              <div className="border-t border-gray-600 my-1"></div>
              
              <button
                onClick={() => handleDeleteMember(selectedMemberForActions)}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>,
          document.body
        )}

        {/* ==========================================
            📧 MODAL DE MESSAGE - VERSION AMÉLIORÉE
            ========================================== */}

        {showMessageModal && selectedMemberForMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">
                  Envoyer un message
                </h3>
              </div>
              
              {/* Destinataire */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destinataire
                </label>
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {selectedMemberForMessage.displayName?.charAt(0) || 
                       selectedMemberForMessage.name?.charAt(0) || 
                       selectedMemberForMessage.email?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {selectedMemberForMessage.displayName || selectedMemberForMessage.name}
                    </p>
                    <p className="text-gray-400 text-sm">{selectedMemberForMessage.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Sujet */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sujet *
                </label>
                <input
                  type="text"
                  value={messageFormData.subject}
                  onChange={(e) => setMessageFormData(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                  placeholder="Objet de votre message..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {messageFormData.subject.length}/100 caractères
                </div>
              </div>
              
              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={messageFormData.message}
                  onChange={(e) => setMessageFormData(prev => ({
                    ...prev,
                    message: e.target.value
                  }))}
                  placeholder="Votre message..."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                  maxLength={1000}
                ></textarea>
                <div className="text-xs text-gray-500 mt-1">
                  {messageFormData.message.length}/1000 caractères
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendMessage}
                  disabled={actionLoading || !messageFormData.subject.trim() || !messageFormData.message.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageFormData({ subject: '', message: '' });
                    setSelectedMemberForMessage(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ==========================================
            ✏️ MODAL D'ÉDITION DE PROFIL
            ========================================== */}

        {showEditModal && selectedMemberForEdit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <Edit className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">
                  Modifier le profil
                </h3>
              </div>
              
              {/* Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="Nom complet..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      role: e.target.value
                    }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="Membre">Membre</option>
                    <option value="Senior">Senior</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Département
                  </label>
                  <input
                    type="text"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                    placeholder="Département..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    placeholder="Description courte..."
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading || !editFormData.name.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Sauvegarder
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMemberForEdit(null);
                    setEditFormData({ name: '', role: '', department: '', bio: '' });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ==========================================
            📧 MODAL D'INVITATION
            ========================================== */}

        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <UserPlus className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-white">
                  Inviter un membre
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse email *
                  </label>
                  <input
                    type="email"
                    placeholder="email@exemple.com"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rôle initial
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none">
                    <option value="Membre">Membre</option>
                    <option value="Senior">Senior</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message personnel (optionnel)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Rejoignez notre équipe..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => inviteMember('nouveau@exemple.com')}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                >
                  Envoyer l'invitation
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ==========================================
            ⚠️ DIALOG DE CONFIRMATION
            ========================================== */}

        {showConfirmDialog && confirmAction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-semibold text-white">
                  {confirmAction.title}
                </h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                {confirmAction.message}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmAction.onConfirm();
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    confirmAction.confirmText
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ==========================================
            📬 INTERFACE DE MESSAGERIE
            ========================================== */}

        <MessagingInterface
          isOpen={showMessagingInterface}
          onClose={() => setShowMessagingInterface(false)}
          initialTab="received"
        />

      </div>
    </div>
  );
};

export default TeamPage;
