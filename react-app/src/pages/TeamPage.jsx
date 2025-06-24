// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// Page équipe avec affichage des membres depuis Firebase
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';
import Navigation from '../shared/components/Navigation.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { Users, Trophy, Target, Calendar, Star, Activity, UserPlus } from 'lucide-react';

const TeamPage = () => {
  const { user } = useAuthStore();
  const [teamData, setTeamData] = useState({
    members: [],
    stats: {},
    projects: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Charger les données de l'équipe depuis Firebase
  useEffect(() => {
    const loadTeamData = async () => {
      if (!user || !db) {
        console.log('🔧 Mode déconnecté - Affichage utilisateur connecté uniquement');
        setTeamData(getDefaultTeamData());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ 1. Récupérer tous les utilisateurs connectés
        console.log('📥 Récupération des membres depuis Firebase...');
        
        // Essai 1: Collection 'users'
        let membersData = [];
        try {
          const usersQuery = query(
            collection(db, 'users'),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
          const usersSnapshot = await getDocs(usersQuery);
          
          usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            console.log('👤 Utilisateur trouvé:', userData);
            
            if (userData.email) {
              membersData.push({
                id: doc.id,
                name: userData.displayName || userData.email.split('@')[0],
                email: userData.email,
                role: userData.role || 'Membre',
                level: userData.level || 1,
                xp: userData.totalXp || 0,
                tasksCompleted: userData.tasksCompleted || 0,
                projectsCreated: userData.projectsCreated || 0,
                avatar: getAvatarFromEmail(userData.email),
                status: getStatusFromActivity(userData.lastActivity || userData.createdAt),
                lastActivity: userData.lastActivity || userData.createdAt,
                joinedAt: userData.createdAt
              });
            }
          });
        } catch (err) {
          console.log('⚠️ Collection users vide ou introuvable, tentative userStats...');
        }

        // Essai 2: Collection 'userStats' si 'users' est vide
        if (membersData.length === 0) {
          try {
            const userStatsQuery = query(
              collection(db, 'userStats'),
              orderBy('createdAt', 'desc'),
              limit(20)
            );
            const userStatsSnapshot = await getDocs(userStatsQuery);
            
            userStatsSnapshot.forEach((doc) => {
              const userData = doc.data();
              console.log('📊 UserStats trouvé:', userData);
              
              if (userData.email) {
                membersData.push({
                  id: doc.id,
                  name: userData.displayName || userData.email.split('@')[0],
                  email: userData.email,
                  role: userData.role || 'Membre',
                  level: userData.level || 1,
                  xp: userData.totalXp || 0,
                  tasksCompleted: userData.tasksCompleted || 0,
                  projectsCreated: userData.projectsCreated || 0,
                  avatar: getAvatarFromEmail(userData.email),
                  status: getStatusFromActivity(userData.lastLoginDate || userData.createdAt),
                  lastActivity: userData.lastLoginDate || userData.createdAt,
                  joinedAt: userData.createdAt
                });
              }
            });
          } catch (err) {
            console.log('⚠️ Collection userStats également vide');
          }
        }

        // Essai 3: Collection 'leaderboard' si les autres sont vides
        if (membersData.length === 0) {
          try {
            const leaderboardQuery = query(
              collection(db, 'leaderboard'),
              orderBy('totalXp', 'desc'),
              limit(20)
            );
            const leaderboardSnapshot = await getDocs(leaderboardQuery);
            
            leaderboardSnapshot.forEach((doc) => {
              const userData = doc.data();
              console.log('🏆 Leaderboard trouvé:', userData);
              
              if (userData.email) {
                membersData.push({
                  id: doc.id,
                  name: userData.displayName || userData.email.split('@')[0],
                  email: userData.email,
                  role: userData.role || 'Membre',
                  level: userData.level || 1,
                  xp: userData.totalXp || 0,
                  tasksCompleted: 0,
                  projectsCreated: 0,
                  avatar: getAvatarFromEmail(userData.email),
                  status: 'online',
                  lastActivity: userData.updatedAt,
                  joinedAt: userData.updatedAt
                });
              }
            });
          } catch (err) {
            console.log('⚠️ Collection leaderboard également vide');
          }
        }

        // ✅ 2. Récupérer les projets actifs
        let projectsData = [];
        try {
          const projectsQuery = query(
            collection(db, 'projects'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const projectsSnapshot = await getDocs(projectsQuery);
          
          projectsSnapshot.forEach((doc) => {
            const projectData = doc.data();
            projectsData.push({
              id: doc.id,
              ...projectData
            });
          });
        } catch (err) {
          console.log('⚠️ Erreur récupération projets:', err);
        }

        // ✅ 3. Récupérer les tâches récentes
        let tasksData = [];
        try {
          const tasksQuery = query(
            collection(db, 'tasks'),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
          const tasksSnapshot = await getDocs(tasksQuery);
          
          tasksSnapshot.forEach((doc) => {
            const taskData = doc.data();
            tasksData.push({
              id: doc.id,
              ...taskData
            });
          });
        } catch (err) {
          console.log('⚠️ Erreur récupération tâches:', err);
        }

        // ✅ 4. Si aucune donnée, ajouter l'utilisateur connecté
        if (membersData.length === 0) {
          console.log('📝 Aucun membre trouvé, ajout utilisateur connecté...');
          membersData = [{
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
            joinedAt: new Date()
          }];
        }

        // ✅ 5. Calculer les statistiques
        const stats = calculateTeamStats(membersData, tasksData, projectsData);

        // ✅ 6. Mettre à jour l'état
        setTeamData({
          members: membersData,
          stats,
          projects: projectsData,
          recentActivities: generateRecentActivities(membersData, tasksData, projectsData)
        });

        console.log('✅ Données équipe chargées:', {
          membres: membersData.length,
          projets: projectsData.length,
          tâches: tasksData.length
        });

      } catch (err) {
        console.error('❌ Erreur chargement équipe:', err);
        setError(err.message);
        // Fallback vers données par défaut
        setTeamData(getDefaultTeamData());
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [user]);

  // ✅ Fonctions utilitaires
  const getAvatarFromEmail = (email) => {
    const avatars = ['👤', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍📊', '👩‍📊', '🧑‍🔬', '👩‍🔬'];
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
      completionRate,
      activeProjects,
      totalProjects: projects.length
    };
  };

  const generateRecentActivities = (members, tasks, projects) => {
    const activities = [];
    
    // Activités des tâches récentes
    tasks.slice(0, 5).forEach(task => {
      const member = members.find(m => m.id === task.userId) || members[0];
      activities.push({
        id: `task-${task.id}`,
        type: task.status === 'completed' ? 'task_completed' : 'task_created',
        user: member.name,
        action: task.status === 'completed' ? 'a terminé la tâche' : 'a créé la tâche',
        target: task.title,
        time: task.createdAt || new Date(),
        icon: task.status === 'completed' ? '✅' : '📝'
      });
    });

    // Activités des projets récents
    projects.slice(0, 3).forEach(project => {
      const member = members.find(m => m.id === project.userId) || members[0];
      activities.push({
        id: `project-${project.id}`,
        type: 'project_created',
        user: member.name,
        action: 'a créé le projet',
        target: project.title,
        time: project.createdAt || new Date(),
        icon: '🚀'
      });
    });

    // Trier par date (plus récent en premier)
    return activities.sort((a, b) => {
      const timeA = a.time.toDate ? a.time.toDate() : new Date(a.time);
      const timeB = b.time.toDate ? b.time.toDate() : new Date(b.time);
      return timeB - timeA;
    }).slice(0, 8);
  };

  const getDefaultTeamData = () => ({
    members: [{
      id: user?.uid || 'current-user',
      name: user?.displayName || user?.email?.split('@')[0] || 'Utilisateur',
      email: user?.email || 'user@example.com',
      role: 'Utilisateur connecté',
      level: 1,
      xp: 0,
      tasksCompleted: 0,
      projectsCreated: 0,
      avatar: user?.photoURL || '👤',
      status: 'online',
      lastActivity: new Date(),
      joinedAt: new Date()
    }],
    stats: {
      totalMembers: 1,
      activeMembers: 1,
      totalXP: 0,
      averageLevel: 1,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      activeProjects: 0,
      totalProjects: 0
    },
    projects: [],
    recentActivities: []
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
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Jamais';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const { members, stats, projects, recentActivities } = teamData;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="text-blue-500" />
                Mon Équipe
              </h1>
              <p className="text-gray-400 mt-2">
                Gérez et collaborez avec votre équipe
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <UserPlus size={20} />
              Inviter un membre
            </button>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">
              ⚠️ Erreur de chargement: {error}
            </p>
          </div>
        )}

        {/* Statistiques équipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Membres Total</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              {stats.activeMembers} en ligne
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">XP Total</p>
                <p className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
              </div>
              <Star className="text-yellow-500" size={24} />
            </div>
            <p className="text-blue-400 text-sm mt-2">
              Niveau moyen: {stats.averageLevel}
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tâches</p>
                <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              </div>
              <Target className="text-green-500" size={24} />
            </div>
            <p className="text-green-400 text-sm mt-2">
              {stats.completionRate}% terminées
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Projets</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
              <Trophy className="text-purple-500" size={24} />
            </div>
            <p className="text-purple-400 text-sm mt-2">
              {stats.activeProjects} actifs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des membres */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Users size={24} />
                Membres de l'équipe ({members.length})
              </h2>
              
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-700 ${getStatusColor(member.status)}`}></div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-white">{member.name}</h3>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                        <p className="text-blue-400 text-sm">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div>
                          <span className="text-yellow-400">Niveau {member.level}</span>
                          <br />
                          <span>{member.xp.toLocaleString()} XP</span>
                        </div>
                        <div>
                          <span className="text-green-400">{member.tasksCompleted} tâches</span>
                          <br />
                          <span>{formatDate(member.lastActivity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bouton voir plus */}
              {members.length > 5 && (
                <div className="mt-6 text-center">
                  <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    Voir tous les membres ({members.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activités récentes */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity size={24} />
                Activités récentes
              </h2>
              
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                      <span className="text-lg">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="text-blue-400">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </div>

            {/* Projets actifs */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy size={24} />
                Projets actifs
              </h2>
              
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <h3 className="font-medium text-white">{project.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {project.description?.substring(0, 60)}...
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                        {project.status || 'Actif'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
                
                {projects.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    Aucun projet actif
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
