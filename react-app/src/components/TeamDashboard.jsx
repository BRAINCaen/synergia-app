// ==========================================
// 📁 react-app/src/components/TeamDashboard.jsx
// Dashboard équipe avec récupération robuste Firebase
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../core/firebase.js';
import LoadingSpinner from './ui/LoadingSpinner.jsx';
import { Users, Trophy, Target, TrendingUp, UserPlus, Activity, Star } from 'lucide-react';

const TeamDashboard = () => {
  const { user } = useAuthStore();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Charger les données équipe depuis Firebase avec fallbacks
  useEffect(() => {
    const loadTeamData = async () => {
      if (!user || !db) {
        console.log('🔧 Mode déconnecté - Données par défaut');
        setTeamData(getDefaultTeamData());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ 1. Récupération robuste des membres avec multiples sources
        let membersData = [];
        
        // Essai collection 'users'
        try {
          const usersQuery = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const usersSnapshot = await getDocs(usersQuery);
          
          usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.email) {
              membersData.push(formatMemberData(doc.id, userData, 'users'));
            }
          });
        } catch (err) {
          console.log('⚠️ Collection users inaccessible');
        }

        // Essai collection 'userStats' si users vide
        if (membersData.length === 0) {
          try {
            const userStatsQuery = query(
              collection(db, 'userStats'),
              orderBy('createdAt', 'desc'),
              limit(10)
            );
            const userStatsSnapshot = await getDocs(userStatsQuery);
            
            userStatsSnapshot.forEach((doc) => {
              const userData = doc.data();
              if (userData.email) {
                membersData.push(formatMemberData(doc.id, userData, 'userStats'));
              }
            });
          } catch (err) {
            console.log('⚠️ Collection userStats inaccessible');
          }
        }

        // Essai collection 'leaderboard' si autres vides
        if (membersData.length === 0) {
          try {
            const leaderboardQuery = query(
              collection(db, 'leaderboard'),
              orderBy('totalXp', 'desc'),
              limit(10)
            );
            const leaderboardSnapshot = await getDocs(leaderboardQuery);
            
            leaderboardSnapshot.forEach((doc) => {
              const userData = doc.data();
              if (userData.email) {
                membersData.push(formatMemberData(doc.id, userData, 'leaderboard'));
              }
            });
          } catch (err) {
            console.log('⚠️ Collection leaderboard inaccessible');
          }
        }

        // Si aucune donnée, utiliser l'utilisateur connecté
        if (membersData.length === 0) {
          membersData = [getCurrentUserData()];
        }

        // ✅ 2. Récupération des tâches
        let tasksData = [];
        try {
          const tasksQuery = query(
            collection(db, 'tasks'),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
          const tasksSnapshot = await getDocs(tasksQuery);
          
          tasksSnapshot.forEach((doc) => {
            tasksData.push({
              id: doc.id,
              ...doc.data()
            });
          });
        } catch (err) {
          console.log('⚠️ Erreur récupération tâches:', err);
        }

        // ✅ 3. Récupération des projets
        let projectsData = [];
        try {
          const projectsQuery = query(
            collection(db, 'projects'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const projectsSnapshot = await getDocs(projectsQuery);
          
          projectsSnapshot.forEach((doc) => {
            projectsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
        } catch (err) {
          console.log('⚠️ Erreur récupération projets:', err);
        }

        // ✅ 4. Calcul des statistiques
        const stats = calculateTeamStats(membersData, tasksData, projectsData);

        // ✅ 5. Mise à jour de l'état
        setTeamData({
          members: membersData,
          tasks: tasksData,
          projects: projectsData,
          stats,
          lastUpdated: new Date().toISOString()
        });

        console.log('✅ Données équipe chargées:', {
          membres: membersData.length,
          tâches: tasksData.length,
          projets: projectsData.length
        });

      } catch (err) {
        console.error('❌ Erreur chargement équipe:', err);
        setError(err.message);
        setTeamData(getDefaultTeamData());
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [user]);

  // ✅ Fonctions utilitaires
  const formatMemberData = (id, userData, source) => {
    return {
      id,
      name: userData.displayName || userData.email?.split('@')[0] || 'Utilisateur',
      email: userData.email,
      role: userData.role || 'Membre',
      level: userData.level || 1,
      xp: userData.totalXp || 0,
      tasksCompleted: userData.tasksCompleted || 0,
      projectsCreated: userData.projectsCreated || 0,
      avatar: getAvatarFromEmail(userData.email),
      status: getStatusFromActivity(userData.lastActivity || userData.lastLoginDate || userData.createdAt),
      lastActivity: userData.lastActivity || userData.lastLoginDate || userData.createdAt,
      joinedAt: userData.createdAt,
      source // Pour debug
    };
  };

  const getCurrentUserData = () => ({
    id: user.uid,
    name: user.displayName || user.email.split('@')[0],
    email: user.email,
    role: 'Utilisateur connecté',
    level: 1,
    xp: 0,
    tasksCompleted: 0,
    projectsCreated: 0,
    avatar: user.photoURL || getAvatarFromEmail(user.email),
    status: 'online',
    lastActivity: new Date(),
    joinedAt: new Date(),
    source: 'current'
  });

  const getAvatarFromEmail = (email) => {
    if (!email) return '👤';
    const avatars = ['👤', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍📊', '👩‍📊'];
    const index = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatars[index % avatars.length];
  };

  const getStatusFromActivity = (lastActivity) => {
    if (!lastActivity) return 'offline';
    
    try {
      const now = new Date();
      const lastActiveDate = lastActivity.toDate ? lastActivity.toDate() : new Date(lastActivity);
      const diffMinutes = (now - lastActiveDate) / (1000 * 60);
      
      if (diffMinutes < 15) return 'online';
      if (diffMinutes < 60) return 'away';
      return 'offline';
    } catch {
      return 'offline';
    }
  };

  const calculateTeamStats = (members, tasks, projects) => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'online').length;
    const totalXP = members.reduce((sum, member) => sum + (member.xp || 0), 0);
    const averageLevel = totalMembers > 0 ? 
      Math.round(members.reduce((sum, member) => sum + (member.level || 1), 0) / totalMembers) : 1;
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const activeProjects = projects.filter(p => p.status === 'active' || !p.status).length;

    return {
      totalMembers,
      activeMembers,
      totalXP,
      averageLevel,
      totalTasks,
      completedTasks,
      inProgressTasks,
      completionRate,
      activeProjects,
      totalProjects: projects.length,
      topPerformer: members.reduce((top, member) => 
        (member.xp > (top?.xp || 0)) ? member : top, null)
    };
  };

  const getDefaultTeamData = () => ({
    members: [getCurrentUserData()],
    tasks: [],
    projects: [],
    stats: {
      totalMembers: 1,
      activeMembers: 1,
      totalXP: 0,
      averageLevel: 1,
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      completionRate: 0,
      activeProjects: 0,
      totalProjects: 0,
      topPerformer: null
    },
    lastUpdated: new Date().toISOString()
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Jamais';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return 'Récent';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center">
          Impossible de charger les données de l'équipe
        </p>
      </div>
    );
  }

  const { members, stats } = teamData;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="text-blue-500" />
          Équipe ({stats.totalMembers})
        </h2>
        <Link
          to="/team"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{stats.activeMembers}</p>
          <p className="text-gray-400 text-sm">En ligne</p>
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.totalXP}</p>
          <p className="text-gray-400 text-sm">XP Total</p>
          <Star className="w-4 h-4 text-yellow-400 mx-auto mt-1" />
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{stats.completionRate}%</p>
          <p className="text-gray-400 text-sm">Tâches</p>
          <Target className="w-4 h-4 text-green-400 mx-auto mt-1" />
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{stats.activeProjects}</p>
          <p className="text-gray-400 text-sm">Projets</p>
          <Trophy className="w-4 h-4 text-purple-400 mx-auto mt-1" />
        </div>
      </div>

      {/* Top performer */}
      {stats.topPerformer && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg">
              {stats.topPerformer.avatar}
            </div>
            <div className="flex-1">
              <p className="text-yellow-400 font-medium">🏆 Top Performer</p>
              <p className="text-white font-semibold">{stats.topPerformer.name}</p>
              <p className="text-gray-400 text-sm">{stats.topPerformer.xp} XP • Niveau {stats.topPerformer.level}</p>
            </div>
            <TrendingUp className="text-yellow-400" size={20} />
          </div>
        </div>
      )}

      {/* Liste des membres */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">Membres actifs</h3>
        
        {members.slice(0, 5).map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg">
                  {member.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${getStatusColor(member.status)}`}></div>
              </div>
              
              <div>
                <h4 className="font-medium text-white">{member.name}</h4>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-yellow-400 text-sm font-medium">Niv. {member.level}</p>
              <p className="text-gray-400 text-xs">{member.xp} XP</p>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun membre trouvé</p>
            <p className="text-gray-500 text-sm mt-1">
              Invitez des collègues à rejoindre votre équipe
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex gap-3">
          <Link
            to="/team"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Voir l'équipe
          </Link>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <UserPlus size={16} />
            Inviter
          </button>
        </div>
      </div>

      {/* Debug info (dev uniquement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-900 rounded text-xs text-gray-500">
          Sources: {members.map(m => m.source).join(', ')} | 
          Dernière MAJ: {formatDate(teamData.lastUpdated)}
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
