// ==========================================
// 📁 react-app/src/components/gamification/RealLeaderboard.jsx
// Classement Firebase temps réel - CONFLIT VARIABLE CORRIGÉ
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

  // Charger le leaderboard depuis Firebase
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!db) {
        console.log('🔧 Mode déconnecté');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Construire la requête selon la catégorie
        let orderField = 'gamification.totalXp';
        if (categoryFilter === 'weeklyXp') orderField = 'gamification.weeklyXp';
        if (categoryFilter === 'monthlyXp') orderField = 'gamification.monthlyXp';
        if (categoryFilter === 'badges') orderField = 'gamification.badges';
        if (categoryFilter === 'tasksCompleted') orderField = 'gamification.tasksCompleted';
        if (categoryFilter === 'loginStreak') orderField = 'gamification.loginStreak';

        let leaderboardQuery = query(
          collection(db, 'users'),
          orderBy(orderField, 'desc'),
          limit(maxResults)
        );

        // Filtrer par département si nécessaire
        if (departmentFilter !== 'all') {
          leaderboardQuery = query(
            collection(db, 'users'),
            where('profile.department', '==', departmentFilter),
            orderBy(orderField, 'desc'),
            limit(maxResults)
          );
        }

        const snapshot = await getDocs(leaderboardQuery);
        const leaderboardData = [];

        snapshot.forEach((doc, index) => {
          const docData = doc.data(); // 🔧 CORRECTION: Renommé userData en docData
          if (docData.email && docData.gamification) {
            leaderboardData.push({
              uid: doc.id,
              rank: index + 1,
              displayName: docData.displayName || docData.email.split('@')[0],
              email: docData.email,
              photoURL: docData.photoURL,
              department: docData.profile?.department || 'Non défini',
              level: docData.gamification.level || 1,
              totalXp: docData.gamification.totalXp || 0,
              weeklyXp: docData.gamification.weeklyXp || 0,
              monthlyXp: docData.gamification.monthlyXp || 0,
              tasksCompleted: docData.gamification.tasksCompleted || 0,
              badges: (docData.gamification.badges || []).length,
              loginStreak: docData.gamification.loginStreak || 0
            });
          }
        });

        setLeaderboard(leaderboardData);
        console.log(`✅ Classement chargé: ${leaderboardData.length} utilisateurs`);

      } catch (error) {
        console.error('❌ Erreur chargement leaderboard:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [categoryFilter, departmentFilter, maxResults]);

  // Obtenir la valeur d'affichage selon la catégorie
  const getDisplayValue = (userInfo) => { // 🔧 CORRECTION: Renommé userData en userInfo
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
          {leaderboard.slice(0, 3).map((userInfo, index) => ( // 🔧 CORRECTION: Renommé userData en userInfo
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
                {userInfo.displayName}
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
        {leaderboard.map((userInfo) => ( // 🔧 CORRECTION: Renommé userData en userInfo
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
                    {userInfo.displayName}
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
