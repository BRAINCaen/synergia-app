// ==========================================
// 📁 react-app/src/components/TeamDashboard.jsx
// Dashboard équipe avec VRAIES données Firebase (plus de mock !)
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../core/firebase';
import LoadingSpinner from './ui/LoadingSpinner';

const TeamDashboard = () => {
  const { user } = useAuthStore();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ VRAIES DONNÉES : Charger depuis Firebase
  useEffect(() => {
    const loadRealTeamData = async () => {
      if (!user || !db) {
        console.log('🔧 Mode déconnecté - Données par défaut');
        setTeamData(getDefaultTeamData());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // ✅ Récupérer les vrais utilisateurs connectés
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('lastActivity', 'desc'),
          limit(10)
        );
        const usersSnapshot = await getDocs(usersQuery);
        
        // ✅ Récupérer les vraies tâches de l'équipe  
        const tasksQuery = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        // ✅ Récupérer les vrais projets
        const projectsQuery = query(
          collection(db, 'projects'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const projectsSnapshot = await getDocs(projectsQuery);

        // ✅ Traitement des vraies données utilisateurs
        const realMembers = [];
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.email && userData.displayName) {
            realMembers.push({
              id: doc.id,
              name: userData.displayName || userData.email.split('@')[0],
              email: userData.email,
              role: userData.role || 'Membre',
              level: userData.gamification?.level || 1,
              xp: userData.gamification?.totalXp || 0,
              tasksCompleted: userData.gamification?.tasksCompleted || 0,
              avatar: userData.photoURL || getAvatarFromEmail(userData.email),
              status: getStatusFromActivity(userData.lastActivity),
              lastActivity: userData.lastActivity
            });
          }
        });

        // ✅ Traitement des vraies tâches
        const realTasks = [];
        tasksSnapshot.forEach((doc) => {
          const taskData = doc.data();
          realTasks.push({
            id: doc.id,
            ...taskData
          });
        });

        // ✅ Traitement des vrais projets
        const realProjects = [];
        projectsSnapshot.forEach((doc) => {
          const projectData = doc.data();
          realProjects.push({
            id: doc.id,
            ...projectData
          });
        });

        // ✅ Calcul des vraies statistiques
        const teamStats = {
          totalMembers: realMembers.length,
          totalXP: realMembers.reduce((sum, member) => sum + member.xp, 0),
          totalTasks: realTasks.length,
          completedTasks: realTasks.filter(t => t.status === 'completed').length,
          activeProjects: realProjects.filter(p => p.status === 'active').length,
          avgLevel: realMembers.length > 0 ? 
            Math.round(realMembers.reduce((sum, member) => sum + member.level, 0) / realMembers.length) : 0
        };

        setTeamData({
          members: realMembers,
          tasks: realTasks,
          projects: realProjects,
          stats: teamStats,
          lastUpdated: new Date().toISOString()
        });

        console.log('✅ Données équipe réelles chargées:', {
          membres: realMembers.length,
          tâches: realTasks.length,
          projets: realProjects.length
        });

      } catch (err) {
        console.error('❌ Erreur chargement données équipe:', err);
        setError(err.message);
        // Fallback vers données par défaut
        setTeamData(getDefaultTeamData());
      } finally {
        setLoading(false);
      }
    };

    loadRealTeamData();
  }, [user]);

  // ✅ Fonctions utilitaires pour les vraies données
  const getAvatarFromEmail = (email) => {
    const avatars = ['👤', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍📊', '👩‍📊'];
    const index = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatars[index % avatars.length];
  };

  const getStatusFromActivity = (lastActivity) => {
    if (!lastActivity) return 'offline';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActivity);
    const diffMinutes = (now - lastActiveDate) / (1000 * 60);
    
    if (diffMinutes < 15) return 'online';
    if (diffMinutes < 60) return 'away';
    return 'offline';
  };

  // ✅ Données par défaut si pas de Firebase
  const getDefaultTeamData = () => ({
    members: [
      {
        id: 'current-user',
        name: user?.displayName || user?.email?.split('@')[0] || 'Utilisateur',
        email: user?.email || 'user@example.com',
        role: 'Utilisateur connecté',
        level: 1,
        xp: 0,
        tasksCompleted: 0,
        avatar: user?.photoURL || '👤',
        status: 'online',
        lastActivity: new Date().toISOString()
      }
    ],
    tasks: [],
    projects: [],
    stats: {
      totalMembers: 1,
      totalXP: 0,
      totalTasks: 0,
      completedTasks: 0,
      activeProjects: 0,
      avgLevel: 1
    },
    lastUpdated: new Date().toISOString()
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner />
        <div className="ml-4 text-white">Chargement des données équipe...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
            <h2 className="text-red-400 text-xl font-semibold mb-2">❌ Erreur de chargement</h2>
            <p className="text-red-300">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Recharger
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { members, stats } = teamData;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête avec vraies données */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                👥 Dashboard Équipe
              </h1>
              <p className="text-gray-400">
                Collaboration et performance collective - Données temps réel
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Dernière mise à jour: {new Date(teamData.lastUpdated).toLocaleString('fr-FR')}
              </p>
            </div>
            
            {/* Badge statut équipe */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-1">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{members.filter(m => m.status === 'online').length}</div>
                  <div className="text-xs text-gray-400">membres actifs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques équipe RÉELLES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{stats.totalMembers}</div>
            <div className="text-xs text-gray-400">Membres Équipe</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.totalXP.toLocaleString()}</div>
            <div className="text-xs text-gray-400">XP Total Équipe</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">{stats.totalTasks}</div>
            <div className="text-xs text-gray-400">Tâches Totales</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.avgLevel.toFixed(1)}</div>
            <div className="text-xs text-gray-400">Niveau Moyen</div>
          </div>
        </div>

        {/* Liste des membres RÉELS */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">👥 Membres de l'Équipe</h2>
            <p className="text-gray-400 text-sm">
              {members.length} membre{members.length > 1 ? 's' : ''} • 
              {members.filter(m => m.status === 'online').length} en ligne
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                      {member.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                      member.status === 'online' ? 'bg-green-500' :
                      member.status === 'away' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                  </div>
                  
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                    <p className="text-gray-500 text-xs">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-white font-medium">Niveau {member.level}</p>
                    <p className="text-gray-400 text-sm">{member.xp.toLocaleString()} XP</p>
                  </div>
                  
                  <div>
                    <p className="text-white font-medium">{member.tasksCompleted}</p>
                    <p className="text-gray-400 text-sm">tâches</p>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'online' ? 'bg-green-900/30 text-green-400' :
                    member.status === 'away' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-gray-900/30 text-gray-400'
                  }`}>
                    {member.status === 'online' ? 'En ligne' :
                     member.status === 'away' ? 'Absent' : 'Hors ligne'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions et navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">🎯 Actions Collaboratives</h3>
            <div className="space-y-3">
              <Link 
                to="/projects"
                className="block bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>📋 Projets ({stats.activeProjects} actifs)</span>
                  <span>→</span>
                </div>
              </Link>
              
              <Link 
                to="/tasks"
                className="block bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>✅ Tâches ({stats.completedTasks}/{stats.totalTasks})</span>
                  <span>→</span>
                </div>
              </Link>
              
              <Link 
                to="/leaderboard"
                className="block bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>🏆 Classement Équipe</span>
                  <span>→</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">📊 Activité Récente</h3>
            <div className="space-y-3">
              {members.filter(m => m.status === 'online').length > 0 && (
                <div className="bg-green-900/20 border border-green-600/30 p-3 rounded-lg">
                  <p className="text-green-400 text-sm">
                    🟢 {members.filter(m => m.status === 'online').length} membre{members.filter(m => m.status === 'online').length > 1 ? 's' : ''} actif{members.filter(m => m.status === 'online').length > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {stats.completedTasks > 0 && (
                <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded-lg">
                  <p className="text-blue-400 text-sm">
                    ✅ {stats.completedTasks} tâche{stats.completedTasks > 1 ? 's' : ''} terminée{stats.completedTasks > 1 ? 's' : ''}
                  </p>
                </div>
              )}
              
              {stats.totalXP > 0 && (
                <div className="bg-purple-900/20 border border-purple-600/30 p-3 rounded-lg">
                  <p className="text-purple-400 text-sm">
                    ⭐ {stats.totalXP.toLocaleString()} XP cumulés par l'équipe
                  </p>
                </div>
              )}
              
              {members.length === 1 && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    👤 Invitez des collègues pour collaborer !
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
