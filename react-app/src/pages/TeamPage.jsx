// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// Page Mon Équipe - Gestion équipe et collaboration
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore, useGameStore } from '../shared/stores';
import { Users, Award, Target, TrendingUp, UserPlus, Settings, Search } from 'lucide-react';

const TeamPage = () => {
  const { user } = useAuthStore();
  const { userStats } = useGameStore();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Données simulées d'équipe
  useEffect(() => {
    const mockTeamMembers = [
      {
        id: '1',
        name: 'Alice Martin',
        email: 'alice.martin@company.com',
        role: 'Chef d\'équipe',
        level: 8,
        xp: 2850,
        tasksCompleted: 45,
        badges: ['🎯', '🏆', '⭐'],
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'online'
      },
      {
        id: '2',
        name: 'Bob Durant',
        email: 'bob.durant@company.com',
        role: 'Développeur Senior',
        level: 6,
        xp: 1920,
        tasksCompleted: 38,
        badges: ['💻', '🔧', '🎯'],
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        status: 'online'
      },
      {
        id: '3',
        name: 'Claire Dubois',
        email: 'claire.dubois@company.com',
        role: 'Designer UX',
        level: 5,
        xp: 1450,
        tasksCompleted: 32,
        badges: ['🎨', '✨', '👥'],
        lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'away'
      },
      {
        id: user?.uid,
        name: user?.displayName || 'Vous',
        email: user?.email,
        role: 'Membre de l\'équipe',
        level: userStats?.level || 1,
        xp: userStats?.totalXp || 0,
        tasksCompleted: userStats?.tasksCompleted || 0,
        badges: ['🚀', '⚡'],
        lastActive: new Date(),
        status: 'online'
      }
    ];

    setTeamMembers(mockTeamMembers);
    setTeamStats({
      totalMembers: 4,
      totalXP: mockTeamMembers.reduce((sum, member) => sum + member.xp, 0),
      totalTasks: mockTeamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0),
      averageLevel: Math.round(mockTeamMembers.reduce((sum, member) => sum + member.level, 0) / mockTeamMembers.length)
    });
    
    setLoading(false);
  }, [user, userStats]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'away': return 'Absent';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Équipe</h1>
          <p className="text-gray-600">
            Collaborez et suivez les performances de votre équipe
          </p>
        </div>

        {/* Statistiques d'équipe */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Membres</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">XP Total</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalXP?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tâches</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Niveau Moyen</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.averageLevel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus size={16} />
            Inviter membre
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Settings size={16} />
            Paramètres équipe
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Liste des membres */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Membres de l'équipe</h3>
          </div>

          <div className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                    </div>

                    {/* Info membre */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {member.name}
                        {member.id === user?.uid && (
                          <span className="ml-2 text-sm text-blue-600 font-medium">(Vous)</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">{getStatusText(member.status)}</p>
                    </div>
                  </div>

                  {/* Stats et badges */}
                  <div className="text-right">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">Niveau {member.level}</p>
                        <p className="text-xs text-gray-500">{member.xp} XP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900">{member.tasksCompleted}</p>
                        <p className="text-xs text-gray-500">Tâches</p>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex gap-1 justify-end">
                      {member.badges.map((badge, index) => (
                        <span key={index} className="text-lg" title={`Badge ${badge}`}>
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projets collaboratifs */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projets Collaboratifs</h3>
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>Aucun projet collaboratif en cours</p>
            <button className="mt-2 text-blue-600 hover:text-blue-700 font-medium">
              Créer un projet d'équipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
