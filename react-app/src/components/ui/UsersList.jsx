// ==========================================
// 📁 react-app/src/components/ui/UsersList.jsx
// COMPOSANT LISTE UTILISATEURS AVEC RÉSOLUTION DES NOMS
// ==========================================

import React, { useState, useEffect } from 'react';
import { User, Users, Mail, UserX } from 'lucide-react';
import { getDoc, doc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../core/firebase.js';

/**
 * 👤 COMPOSANT AVATAR UTILISATEUR
 */
const UserAvatar = ({ user, size = 'md', showName = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-500';
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-yellow-500',
      'bg-teal-500', 'bg-cyan-500'
    ];
    
    const index = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-300 rounded-full flex items-center justify-center`}>
        <UserX className="w-4 h-4 text-gray-600" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Avatar */}
      <div className={`${sizeClasses[size]} ${getAvatarColor(user.displayName)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName}
            className={`${sizeClasses[size]} rounded-full object-cover`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          getInitials(user.displayName)
        )}
      </div>

      {/* Nom et email si demandés */}
      {showName && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">
            {user.displayName || 'Utilisateur'}
          </p>
          {user.email && (
            <p className="text-xs text-gray-400 truncate">
              {user.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 📋 COMPOSANT PRINCIPAL - LISTE UTILISATEURS
 */
const UsersList = ({ userIds = [], layout = 'vertical', showEmails = true, className = '' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Charger les données utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      if (!userIds || userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('👥 Chargement utilisateurs pour IDs:', userIds);

        const resolvedUsers = [];

        // Résoudre chaque utilisateur
        for (const userId of userIds) {
          if (!userId || typeof userId !== 'string') {
            console.warn('⚠️ ID utilisateur invalide:', userId);
            continue;
          }

          try {
            // Essayer de récupérer depuis Firebase
            const userDoc = await getDoc(doc(db, 'users', userId));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Nettoyer le nom d'affichage
              let cleanDisplayName = userData.displayName || userData.email?.split('@')[0] || 'Utilisateur';
              
              // Nettoyer les noms inappropriés
              if (cleanDisplayName === 'Allan le BOSS') {
                cleanDisplayName = userData.email?.split('@')[0] || 'Utilisateur';
              }
              
              // Nettoyer les URLs Google si présentes
              if (cleanDisplayName.includes('googleusercontent.com')) {
                cleanDisplayName = userData.email?.split('@')[0] || 'Utilisateur';
              }

              const user = {
                uid: userId,
                displayName: cleanDisplayName,
                email: userData.email || 'Email non défini',
                photoURL: userData.photoURL || null,
                role: userData.role || userData.profile?.role || 'Membre',
                isActive: userData.isActive !== false
              };

              resolvedUsers.push(user);
              console.log('✅ Utilisateur résolu:', user.displayName, '(', user.email, ')');
              
            } else {
              // Utilisateur non trouvé - créer un fallback
              console.warn('⚠️ Utilisateur non trouvé:', userId);
              
              resolvedUsers.push({
                uid: userId,
                displayName: `Utilisateur ${userId.substring(0, 8)}`,
                email: 'Utilisateur supprimé',
                photoURL: null,
                role: 'Inconnu',
                isActive: false,
                isDeleted: true
              });
            }
            
          } catch (userError) {
            console.error('❌ Erreur récupération utilisateur:', userId, userError);
            
            // Fallback d'erreur
            resolvedUsers.push({
              uid: userId,
              displayName: `Erreur ${userId.substring(0, 6)}`,
              email: 'Erreur de chargement',
              photoURL: null,
              role: 'Erreur',
              isActive: false,
              hasError: true
            });
          }
        }

        setUsers(resolvedUsers);
        console.log('🎉 Tous les utilisateurs résolus:', resolvedUsers.length);

      } catch (error) {
        console.error('❌ Erreur chargement liste utilisateurs:', error);
        setError(error.message);
        
        // Fallback avec les IDs
        const fallbackUsers = userIds.map(id => ({
          uid: id,
          displayName: `User ${id.substring(0, 8)}`,
          email: 'Erreur générale',
          photoURL: null,
          role: 'Erreur',
          isActive: false,
          hasError: true
        }));
        
        setUsers(fallbackUsers);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [userIds]);

  // 🔄 Affichage loading
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="text-gray-400 text-sm">Chargement utilisateurs...</span>
      </div>
    );
  }

  // ❌ Affichage erreur
  if (error && users.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-red-400 ${className}`}>
        <UserX className="w-5 h-5" />
        <span className="text-sm">Erreur: {error}</span>
      </div>
    );
  }

  // 📭 Aucun utilisateur
  if (users.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <User className="w-5 h-5" />
        <span className="text-sm">Aucun utilisateur assigné</span>
      </div>
    );
  }

  // 📋 Affichage vertical (par défaut)
  if (layout === 'vertical') {
    return (
      <div className={`space-y-3 ${className}`}>
        {users.map((user) => (
          <div 
            key={user.uid}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              user.isDeleted ? 'bg-red-500/10 border border-red-500/20' :
              user.hasError ? 'bg-yellow-500/10 border border-yellow-500/20' :
              'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/50'
            }`}
          >
            <UserAvatar 
              user={user} 
              size="md" 
              showName={false}
            />
            
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm truncate ${
                user.isDeleted ? 'text-red-300' :
                user.hasError ? 'text-yellow-300' :
                'text-gray-200'
              }`}>
                {user.displayName}
              </p>
              
              {showEmails && (
                <p className={`text-xs truncate ${
                  user.isDeleted ? 'text-red-400' :
                  user.hasError ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {user.email}
                </p>
              )}
              
              {user.role && user.role !== 'Membre' && (
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                  user.isDeleted ? 'bg-red-500/20 text-red-300' :
                  user.hasError ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {user.role}
                </span>
              )}
            </div>

            {/* Indicateurs de statut */}
            {user.isDeleted && (
              <UserX className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            {user.hasError && (
              <span className="text-yellow-400 text-xs flex-shrink-0">⚠️</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // 📐 Affichage horizontal
  if (layout === 'horizontal') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {users.map((user) => (
          <div 
            key={user.uid}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              user.isDeleted ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
              user.hasError ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' :
              'bg-gray-700/50 text-gray-200 border border-gray-600/50'
            }`}
          >
            <UserAvatar 
              user={user} 
              size="sm" 
              showName={false}
            />
            
            <span className="font-medium truncate max-w-24">
              {user.displayName}
            </span>

            {user.isDeleted && <UserX className="w-3 h-3" />}
            {user.hasError && <span className="text-xs">⚠️</span>}
          </div>
        ))}
      </div>
    );
  }

  // 🎯 Affichage avatars seulement
  if (layout === 'avatars') {
    return (
      <div className={`flex -space-x-2 ${className}`}>
        {users.slice(0, 5).map((user, index) => (
          <div 
            key={user.uid}
            className="relative"
            style={{ zIndex: users.length - index }}
            title={`${user.displayName} (${user.email})`}
          >
            <UserAvatar 
              user={user} 
              size="md" 
              showName={false}
              className={`border-2 ${
                user.isDeleted ? 'border-red-500' :
                user.hasError ? 'border-yellow-500' :
                'border-gray-600'
              }`}
            />
            
            {user.isDeleted && (
              <UserX className="absolute -top-1 -right-1 w-3 h-3 text-red-400 bg-gray-800 rounded-full" />
            )}
          </div>
        ))}
        
        {users.length > 5 && (
          <div className="w-8 h-8 bg-gray-600 border-2 border-gray-600 rounded-full flex items-center justify-center text-xs font-semibold text-white">
            +{users.length - 5}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default UsersList;
