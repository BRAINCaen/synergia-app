// ==========================================
// 📁 react-app/src/components/gamification/RealLeaderboard.jsx
// REMPLACER ENTIÈREMENT LE FICHIER EXISTANT PAR CE CODE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../shared/stores/authStore';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../core/firebase';

const RealLeaderboard = ({ maxResults = 20 }) => {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('totalXp');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Données simulées pour les départements
  const departments = [
    'all',
    'Développement',
    'Marketing', 
    'Commercial',
    'RH',
    'Finance',
    'Direction'
  ];

  const categories = [
    { value: 'totalXp', label: 'XP Total' },
    { value: 'weeklyXp', label: 'XP Semaine' },
    { value: 'monthlyXp', label: 'XP Mois' },
    { value: 'badges', label: 'Badges' },
    { value: 'tasksCompleted', label: 'Tâches' },
    { value: 'loginStreak', label: 'Connexions' }
  ];

  // 🧹 FONCTION DE NETTOYAGE DES NOMS CORROMPUS
  const cleanUserName = (userData) => {
    console.log('🧹 RealLeaderboard - Nettoyage nom pour:', userData.email, 'displayName:', userData.displayName);
    
    // Détecter si displayName est une URL (contient http, https, ou googleusercontent)
    if (userData.displayName && (
      userData.displayName.includes('http') || 
      userData.displayName.includes('www.') ||
      userData.displayName.includes('googleusercontent.com') ||
      userData.displayName.includes('.com/') ||
      userData.displayName.length > 100
    )) {
      console.warn('🚨 RealLeaderboard - Nom corrompu détecté (URL):', userData.displayName.substring(0, 50) + '...');
      // Utiliser l'email comme fallback
      const cleanedName = userData.email?.split('@')[0] || 'Utilisateur';
      console.log('✅ RealLeaderboard - Nom nettoyé:', cleanedName);
      return cleanedName;
    }

    // Si displayName semble normal, l'utiliser
    if (userData.displayName && userData.displayName.length < 100 && !userData.displayName.includes('.')) {
      console.log('✅ RealLeaderboard - Nom valide conservé:', userData.displayName);
      return userData.displayName;
    }

    // Fallback : utiliser l'email
    const fallbackName = userData.email?.split('@')[0] || 'Utilisateur';
    console.log('✅ RealLeaderboard - Fallback utilisé:', fallbackName);
    return fallbackName;
  };

  // Charger le leaderboard depuis Firebase
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!db) {
        console.log('🔧 RealLeaderboard - Mode déconnecté');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔥 RealLeaderboard - Chargement depuis Firebase...');

        // Récupérer tous les utilisateurs sans filtre pour éviter les erreurs
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(100));

        const snapshot = await getDocs(q);
        const leaderboardData = [];

        console.log(`📊 RealLeaderboard - ${snapshot.docs.length} documents trouvés`);

        snapshot.forEach((doc, index) => {
          const docData = doc.data();
          if (docData.email) {
            // 🧹 NETTOYAGE : Nom propre extrait de façon sécurisée
            const cleanName = cleanUserName(docData);
            
            const userEntry = {
              uid: doc.id,
              rank: index + 1,
              displayName: cleanName, // ✅ Nom nettoyé
              email: docData.email,
              photoURL: docData.photoURL,
              department: docData.profile?.department || 'Non défini',
              level: docData.gamification?.level || docData.level || 1,
              totalXp: docData.gamification?.totalXp || docData.totalXp || 0,
              weeklyXp: docData.gamification?.weeklyXp || 0,
              monthlyXp: docData.gamification?.monthlyXp || 0,
              tasksCompleted: docData.gamification?.tasksCompleted || docData.tasksCompleted || 0,
              badges: (docData.gamification?.badges || []).length,
              loginStreak: docData.gamification?.loginStreak || docData.loginStreak || 0
            };
            
            leaderboardData.push(userEntry);
            console.log(`👤 RealLeaderboard - Utilisateur: ${userEntry.displayName} (${userEntry.email}) - ${userEntry.totalXp} XP`);
          }
        });

        // Trier par XP et recalculer les rangs
        leaderboardData.sort((a, b) => b.totalXp - a.totalXp);
        leaderboardData.forEach((user, index) => {
          user.rank = index + 1;
        });

        setLeaderboard(leaderboardData);
        console.log(`✅ RealLeaderboard - Classement chargé: ${leaderboardData.length} utilisateurs`);

        // 🧹 Log des noms nettoyés pour debug
        leaderboardData.slice(0, 5).forEach(user => {
          console.log(`🏆 RealLeaderboard - Classement: #${user.rank} - ${user.displayName} (${user.email}) - ${user.totalXp} XP`);
        });

      } catch (error) {
        console.error('❌ RealLeaderboard - Erreur chargement:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [categoryFilter, departmentFilter, maxResults]);

  // Obtenir la valeur d'affichage selon la catégorie
  const getDisplayValue = (userInfo) => {
    switch (categoryFilter) {
      case 'totalXp':
        return `${userInfo.totalXp.toLocaleString()} XP`;
      case 'weeklyXp':
        return `${userInfo.weeklyXp.toLocaleString()} XP`;
      case 'monthlyXp':
        return `${userInfo.monthlyXp.toLocaleString()} XP`;
      case 'tasksCompleted':
        return `${userInfo.tasksCompleted} tâches`;
      case 'badges':
        return `${userInfo.badges} badges`;
      case 'loginStreak':
        return `${userInfo.loginStreak} jours`;
      default:
        return `${userInfo.totalXp.toLocaleString()} XP`;
    }
  };

  // Obtenir l'icône du rang
  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement du classement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message de debug */}
      <div className="bg-green-800 text-green-200 p-3 rounded-lg text-sm">
        🧹 Noms nettoyés activés - Vérifiez la console pour les logs de nettoyage
      </div>

      {/* Filtres */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Département
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Tous les départements</option>
              {departments.slice(1).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-400">
              <strong>{leaderboard.length}</strong> participants
            </div>
          </div>
        </div>
      </div>

      {/* Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {leaderboard.slice(0, 3).map((userInfo, index) => (
            <div
              key={userInfo.uid}
              className={`
                text-center p-4 rounded-lg border relative
                ${index === 0 ? 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/20 border-yellow-500' :
                  index === 1 ? 'bg-gradient-to-b from-gray-400/20 to-gray-500/20 border-gray-400' :
                  'bg-gradient-to-b from-orange-500/20 to-orange-600/20 border-orange-500'}
              `}
            >
              <div className="text-3xl mb-2">{getRankIcon(userInfo.rank)}</div>
              <div className="w-16 h-16 rounded-full bg-gray-600 mx-auto mb-3 flex items-center justify-center">
                {userInfo.photoURL ? (
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <h3 className="font-semibold text-white text-sm truncate">
                {userInfo.displayName} {/* ✅ Nom nettoyé affiché */}
              </h3>
              <p className="text-xs text-gray-400 mb-2">{userInfo.department}</p>
              <p className="font-bold text-lg text-white">
                {getDisplayValue(userInfo)}
              </p>
              <p className="text-xs text-gray-400">Niveau {userInfo.level}</p>
            </div>
          ))}
        </div>
      )}

      {/* Liste complète */}
      <div className="space-y-2">
        {leaderboard.map((userInfo) => (
          <div
            key={userInfo.uid}
            className={`
              flex items-center p-4 rounded-lg border transition-colors
              ${userInfo.uid === user?.uid 
                ? 'bg-blue-600/20 border-blue-500' 
                : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
              }
            `}
          >
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-8 text-center mr-4">
                <span className="text-lg font-bold text-gray-300">
                  {getRankIcon(userInfo.rank)}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-gray-600 mr-4 flex-shrink-0 flex items-center justify-center">
                {userInfo.photoURL ? (
                  <img
                    src={userInfo.photoURL}
                    alt={userInfo.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>👤</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-white truncate">
                    {userInfo.displayName} {/* ✅ Nom nettoyé affiché */}
                    {userInfo.uid === user?.uid && (
                      <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                        Vous
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-sm text-gray-400">
                  {userInfo.department} • Niveau {userInfo.level}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-white">
                {getDisplayValue(userInfo)}
              </div>
              <div className="text-sm text-gray-400">
                {userInfo.badges} badges
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-white mb-2">
            Aucun participant trouvé
          </h3>
          <p className="text-gray-400">
            Commencez à utiliser l'application pour apparaître dans le classement !
          </p>
        </div>
      )}
    </div>
  );
};

export default RealLeaderboard;
