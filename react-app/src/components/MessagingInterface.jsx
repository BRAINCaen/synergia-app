// 📬 INTERFACE DE CONSULTATION DES MESSAGES - AVEC NOMS UTILISATEURS
// react-app/src/components/MessagingInterface.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MailOpen,
  Star,
  Archive,
  Trash2,
  Search,
  Send,
  Reply,
  Forward,
  MoreVertical,
  ArrowLeft,
  Filter,
  MessageCircle,
  Clock,
  User,
  X,
  CheckCircle
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../core/firebase';
import { messagingService } from '../core/services/messagingService';
import { useAuthStore } from '../shared/stores/authStore';

// ==========================================
// 👤 HOOK POUR RÉSOUDRE LES NOMS UTILISATEURS
// ==========================================

const useUserResolver = () => {
  const [usersCache, setUsersCache] = useState(new Map());
  
  const resolveUser = async (userId) => {
    if (!userId) {
      return {
        uid: 'unknown',
        displayName: 'Utilisateur inconnu',
        email: 'Non défini',
        initials: '??'
      };
    }
    
    // Vérifier le cache d'abord
    if (usersCache.has(userId)) {
      return usersCache.get(userId);
    }
    
    try {
      console.log('🔍 Résolution utilisateur:', userId);
      
      // Récupérer depuis Firebase
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = {
          uid: userId,
          displayName: userData.displayName || userData.email?.split('@')[0] || `User_${userId.substring(0, 6)}`,
          email: userData.email || 'Non défini',
          photoURL: userData.photoURL || null,
          initials: (userData.displayName || userData.email?.split('@')[0] || 'U')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
        };
        
        console.log('✅ Utilisateur résolu:', user);
        
        // Mettre en cache
        setUsersCache(prev => new Map(prev).set(userId, user));
        return user;
      } else {
        console.warn('⚠️ Utilisateur non trouvé dans Firestore:', userId);
        
        // Utilisateur non trouvé - créer un fallback
        const fallbackUser = {
          uid: userId,
          displayName: `User_${userId.substring(0, 8)}`,
          email: 'Utilisateur supprimé',
          photoURL: null,
          initials: userId.substring(0, 2).toUpperCase()
        };
        
        setUsersCache(prev => new Map(prev).set(userId, fallbackUser));
        return fallbackUser;
      }
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', userId, error);
      
      // Fallback d'erreur
      const errorUser = {
        uid: userId,
        displayName: `Utilisateur ${userId.substring(0, 6)}`,
        email: 'Erreur chargement',
        photoURL: null,
        initials: 'ER'
      };
      
      setUsersCache(prev => new Map(prev).set(userId, errorUser));
      return errorUser;
    }
  };
  
  const resolveMultipleUsers = async (userIds) => {
    if (!userIds || userIds.length === 0) return [];
    
    const promises = userIds.map(id => resolveUser(id));
    return await Promise.all(promises);
  };
  
  return { resolveUser, resolveMultipleUsers, usersCache };
};

// ==========================================
// 🎨 COMPOSANT AVATAR UTILISATEUR
// ==========================================

const UserAvatar = ({ userId, user, size = 'md', showName = false, showEmail = false }) => {
  const [resolvedUser, setResolvedUser] = useState(user);
  const [loading, setLoading] = useState(!user && !!userId);
  const { resolveUser } = useUserResolver();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  // Résoudre l'utilisateur si pas fourni
  useEffect(() => {
    if (!user && userId) {
      setLoading(true);
      resolveUser(userId).then(resolved => {
        setResolvedUser(resolved);
        setLoading(false);
      });
    }
  }, [userId, user, resolveUser]);

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} bg-gray-600 rounded-full animate-pulse`} />
        {showName && <div className="h-4 bg-gray-600 rounded w-20 animate-pulse"></div>}
      </div>
    );
  }

  if (!resolvedUser) {
    return (
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} bg-gray-600 rounded-full flex items-center justify-center`}>
          <span className="text-gray-400">?</span>
        </div>
        {showName && <span className="text-gray-400">Utilisateur inconnu</span>}
      </div>
    );
  }

  const displayName = resolvedUser.displayName || 'Utilisateur';
  const initials = resolvedUser.initials || displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-medium shadow-sm`}
        title={`${displayName}${resolvedUser.email && resolvedUser.email !== 'Non défini' ? ` (${resolvedUser.email})` : ''}`}
      >
        {initials}
      </div>
      
      {showName && (
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">{displayName}</div>
          {showEmail && resolvedUser.email && resolvedUser.email !== 'Non défini' && (
            <div className="text-xs text-gray-400 truncate">{resolvedUser.email}</div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 📧 COMPOSANT PRINCIPAL MESSAGERIE
// ==========================================

export const MessagingInterface = ({ isOpen, onClose, initialTab = 'received' }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [messagingStats, setMessagingStats] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Hook pour résoudre les utilisateurs
  const { resolveUser, resolveMultipleUsers } = useUserResolver();

  // ==========================================
  // 📨 CHARGEMENT DES MESSAGES
  // ==========================================

  useEffect(() => {
    if (isOpen && user?.uid) {
      loadMessages();
      loadStats();
    }
  }, [isOpen, activeTab, user?.uid]);

  const loadMessages = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📬 Chargement des messages pour onglet:', activeTab);
      
      let loadedMessages = [];
      
      switch (activeTab) {
        case 'received':
          loadedMessages = await messagingService.getReceivedMessages(user.uid, {
            unreadOnly: filterUnread
          });
          break;
        case 'sent':
          loadedMessages = await messagingService.getSentMessages(user.uid);
          break;
        case 'starred':
          const allReceived = await messagingService.getReceivedMessages(user.uid);
          loadedMessages = allReceived.filter(msg => msg.starred);
          break;
        case 'archived':
          loadedMessages = await messagingService.getReceivedMessages(user.uid, {
            includeArchived: true
          });
          loadedMessages = loadedMessages.filter(msg => msg.archived);
          break;
        default:
          loadedMessages = await messagingService.getReceivedMessages(user.uid);
      }
      
      console.log('📬 Messages chargés:', loadedMessages.length);
      
      // Résoudre les noms des expéditeurs/destinataires
      const messagesWithUsers = await Promise.all(
        loadedMessages.map(async (message) => {
          try {
            // Résoudre l'expéditeur et le destinataire
            const [fromUser, toUser] = await Promise.all([
              resolveUser(message.fromUserId),
              resolveUser(message.toUserId)
            ]);
            
            return {
              ...message,
              fromUser,
              toUser,
              // Déterminer qui afficher selon l'onglet
              displayUser: activeTab === 'sent' ? toUser : fromUser,
              displayUserLabel: activeTab === 'sent' ? 'À :' : 'De :'
            };
          } catch (error) {
            console.error('❌ Erreur résolution utilisateurs pour message:', message.id, error);
            return {
              ...message,
              fromUser: { displayName: 'Erreur', initials: 'ER' },
              toUser: { displayName: 'Erreur', initials: 'ER' },
              displayUser: { displayName: 'Erreur', initials: 'ER' },
              displayUserLabel: 'Erreur :'
            };
          }
        })
      );
      
      setMessages(messagesWithUsers);
      console.log('✅ Messages avec utilisateurs résolus:', messagesWithUsers.length);
      
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.uid) return;
    
    try {
      const stats = await messagingService.getMessagingStats(user.uid);
      setMessagingStats(stats);
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
  };

  // ==========================================
  // 🔍 RECHERCHE ET FILTRAGE
  // ==========================================

  const filteredMessages = messages.filter(message => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      message.subject?.toLowerCase().includes(searchLower) ||
      message.content?.toLowerCase().includes(searchLower) ||
      message.displayUser?.displayName?.toLowerCase().includes(searchLower)
    );
  });

  // ==========================================
  // 📧 ACTIONS SUR LES MESSAGES
  // ==========================================

  const handleMarkAsRead = async (messageId) => {
    setActionLoading(true);
    try {
      await messagingService.markAsRead(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      setSuccessMessage('Message marqué comme lu');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erreur marquage lu:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStarred = async (messageId, starred) => {
    setActionLoading(true);
    try {
      await messagingService.toggleStarred(messageId, starred);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, starred } : msg
      ));
      setSuccessMessage(starred ? 'Message ajouté aux favoris' : 'Message retiré des favoris');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erreur toggle favoris:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleArchived = async (messageId, archived) => {
    setActionLoading(true);
    try {
      await messagingService.toggleArchived(messageId, archived);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, archived } : msg
      ));
      setSuccessMessage(archived ? 'Message archivé' : 'Message désarchivé');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Recharger si on est dans l'onglet archived
      if (activeTab === 'archived') {
        loadMessages();
      }
    } catch (error) {
      console.error('❌ Erreur toggle archivage:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    
    setActionLoading(true);
    try {
      await messagingService.deleteMessages([messageId]);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessage(null);
      setSuccessMessage('Message supprimé');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erreur suppression message:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // 🎨 COMPOSANTS D'AFFICHAGE
  // ==========================================

  const MessageListItem = ({ message }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => {
        setSelectedMessage(message);
        if (!message.read && activeTab === 'received') {
          handleMarkAsRead(message.id);
        }
      }}
      className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors ${
        !message.read ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar utilisateur */}
        <UserAvatar 
          user={message.displayUser}
          size="md"
          showName={false}
        />
        
        <div className="flex-1 min-w-0">
          {/* En-tête avec nom et statut */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{message.displayUserLabel}</span>
            <h3 className={`font-medium truncate ${
              !message.read ? 'text-white' : 'text-gray-300'
            }`}>
              {message.displayUser?.displayName || 'Utilisateur inconnu'}
            </h3>
            {message.starred && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
            {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </div>
          
          {/* Sujet */}
          <h4 className={`font-medium truncate mb-1 ${
            !message.read ? 'text-white' : 'text-gray-300'
          }`}>
            {message.subject || 'Sans sujet'}
          </h4>
          
          {/* Contenu aperçu */}
          <p className="text-sm text-gray-400 truncate mb-2">
            {message.content}
          </p>
          
          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {message.timestamp?.toDate?.()?.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) || 'Date inconnue'}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {message.archived && <Archive className="w-4 h-4 text-gray-500" />}
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    </motion.div>
  );

  const MessageDetail = ({ message }) => (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setSelectedMessage(null)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-xl font-semibold text-white flex-1">
            {message.subject || 'Sans sujet'}
          </h2>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleStarred(message.id, !message.starred)}
              className={`p-2 rounded-lg transition-colors ${
                message.starred 
                  ? 'text-yellow-400 bg-yellow-400/10' 
                  : 'text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Star className={`w-5 h-5 ${message.starred ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={() => handleToggleArchived(message.id, !message.archived)}
              className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Archive className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleDeleteMessage(message.id)}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Informations expéditeur/destinataire */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-12">De :</span>
            <UserAvatar 
              user={message.fromUser}
              size="sm"
              showName={true}
              showEmail={true}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-12">À :</span>
            <UserAvatar 
              user={message.toUser}
              size="sm"
              showName={true}
              showEmail={true}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 w-12">Date :</span>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{message.timestamp?.toDate?.()?.toLocaleString('fr-FR') || 'Date inconnue'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu */}
      <div className="flex-1 p-6">
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
      
      {/* Actions bas */}
      <div className="p-6 border-t border-gray-700">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Reply className="w-4 h-4" />
            Répondre
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            <Forward className="w-4 h-4" />
            Transférer
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              {messagingStats.unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {messagingStats.unreadCount}
                </span>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Onglets */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'received', label: 'Reçus', count: messagingStats.totalReceived },
              { id: 'sent', label: 'Envoyés', count: messagingStats.totalSent },
              { id: 'starred', label: 'Favoris', count: messagingStats.starredCount },
              { id: 'archived', label: 'Archivés', count: messagingStats.archivedCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedMessage(null);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-gray-600 text-xs rounded">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Message de succès */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-6 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">{successMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenu principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Liste des messages */}
          <div className="w-1/3 border-r border-gray-700 flex flex-col">
            {/* Barre de recherche */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              {activeTab === 'received' && (
                <div className="mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={filterUnread}
                      onChange={(e) => setFilterUnread(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700"
                    />
                    Non lus uniquement
                  </label>
                </div>
              )}
            </div>
            
            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  Chargement des messages...
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun message trouvé</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredMessages.map((message) => (
                    <MessageListItem key={message.id} message={message} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
          
          {/* Détail du message */}
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <MessageDetail message={selectedMessage} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un message pour l'afficher</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MessagingInterface;
