// ==========================================
// 📁 react-app/src/pages/TeamPage.jsx
// VERSION SÉCURISÉE POUR BUILD NETLIFY
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  Users, 
  Award, 
  Target, 
  Search,
  Crown,
  Star,
  BarChart3,
  Plus
} from 'lucide-react';

// 🎭 RÔLES SYNERGIA DÉFINIS LOCALEMENT (sans import externe)
const SYNERGIA_ROLES = {
  maintenance: {
    id: 'maintenance',
    name: 'Entretien, Réparations & Maintenance',
    icon: '🔧',
    color: 'bg-orange-500',
    description: 'Responsable de la maintenance et des réparations'
  },
  reputation: {
    id: 'reputation',
    name: 'Gestion des Avis & de la Réputation',
    icon: '⭐',
    color: 'bg-yellow-500',
    description: 'Gestion de l\'image et des retours clients'
  },
  stock: {
    id: 'stock',
    name: 'Gestion des Stocks & Matériel',
    icon: '📦',
    color: 'bg-blue-500',
    description: 'Gestion des inventaires et approvisionnements'
  },
  organization: {
    id: 'organization',
    name: 'Organisation Interne du Travail',
    icon: '📋',
    color: 'bg-purple-500',
    description: 'Coordination et organisation des équipes'
  },
  content: {
    id: 'content',
    name: 'Création de Contenu & Affichages',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'Création de contenu visuel et communication'
  },
  mentoring: {
    id: 'mentoring',
    name: 'Mentorat & Formation Interne',
    icon: '🎓',
    color: 'bg-green-500',
    description: 'Formation et accompagnement des équipes'
  },
  partnerships: {
    id: 'partnerships',
    name: 'Partenariats & Référencement',
    icon: '🤝',
    color: 'bg-indigo-500',
    description: 'Développement de partenariats stratégiques'
  },
  communication: {
    id: 'communication',
    name: 'Communication & Réseaux Sociaux',
    icon: '📢',
    color: 'bg-cyan-500',
    description: 'Gestion de la communication digitale'
  },
  b2b: {
    id: 'b2b',
    name: 'Relations B2B & Devis',
    icon: '💼',
    color: 'bg-slate-500',
    description: 'Gestion des relations entreprises et devis'
  },
  gamification: {
    id: 'gamification',
    name: 'Gamification & Système XP',
    icon: '🎮',
    color: 'bg-red-500',
    description: 'Gestion du système de gamification'
  }
};

const TeamPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [activeTab, setActiveTab] = useState('members');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les données de l'équipe
  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Données simulées de l'équipe avec les nouveaux rôles Synergia
      const mockTeamMembers = [
        {
          id: '1',
          name: 'Alice Martin',
          email: 'alice.martin@synergia.com',
          level: 8,
          totalXp: 2850,
          tasksCompleted: 45,
          badges: ['🎯', '🏆', '⭐'],
          status: 'online',
          synergiaRoles: [
            { roleId: 'organization', xpInRole: 1500, level: 'competent', tasksCompleted: 25 },
            { roleId: 'mentoring', xpInRole: 800, level: 'apprenti', tasksCompleted: 12 }
          ]
        },
        {
          id: '2',
          name: 'Bob Durant',
          email: 'bob.durant@synergia.com',
          level: 6,
          totalXp: 1920,
          tasksCompleted: 38,
          badges: ['💻', '🔧', '🎯'],
          status: 'online',
          synergiaRoles: [
            { roleId: 'maintenance', xpInRole: 1200, level: 'apprenti', tasksCompleted: 20 }
          ]
        },
        {
          id: '3',
          name: 'Claire Dubois',
          email: 'claire.dubois@synergia.com',
          level: 5,
          totalXp: 1450,
          tasksCompleted: 32,
          badges: ['🎨', '✨', '👥'],
          status: 'away',
          synergiaRoles: [
            { roleId: 'content', xpInRole: 900, level: 'apprenti', tasksCompleted: 18 }
          ]
        },
        {
          id: user?.uid || '4',
          name: user?.displayName || 'Vous',
          email: user?.email || 'vous@synergia.com',
          level: 1,
          totalXp: 200,
          tasksCompleted: 3,
          badges: ['🚀'],
          status: 'online',
          synergiaRoles: [
            { roleId: 'gamification', xpInRole: 200, level: 'novice', tasksCompleted: 3 }
          ]
        }
      ];
      
      setTeamMembers(mockTeamMembers);
      
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const getStatusColor = (status) => {
    const colorMap = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const statusMap = {
      online: 'En ligne',
      away: 'Absent',
      offline: 'Hors ligne'
    };
    return statusMap[status] || 'Inconnu';
  };

  // Filtrage des membres
  const filteredMembers = teamMembers.filter(member =>
    (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Interface des onglets
  const tabs = [
    { id: 'members', label: 'Membres', icon: Users, count: teamMembers.length },
    { id: 'roles', label: 'Rôles Synergia', icon: Award, count: Object.keys(SYNERGIA_ROLES).length },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement de l'équipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gestion d'Équipe
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Gérez votre équipe, assignez des rôles et collaborez efficacement
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            
            {/* Barre de recherche */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Liste des membres */}
            <div className="grid gap-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    
                    {/* Infos du membre */}
                    <div className="flex items-center gap-4">
                      
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                          {member.name?.charAt(0) || '?'}
                        </div>
                        
                        {/* Indicateur de statut */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${getStatusColor(member.status)}`}>
                        </div>
                      </div>

                      {/* Détails */}
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {member.name}
                          {member.id === user?.uid && (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          )}
                        </h3>
                        <p className="text-gray-400">{member.email}</p>
                        <p className="text-sm text-gray-500">{getStatusText(member.status)}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="flex items-center gap-6 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">Niveau {member.level}</p>
                          <p className="text-sm text-gray-400">{member.totalXp} XP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{member.tasksCompleted}</p>
                          <p className="text-sm text-gray-400">Tâches</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-white">{member.synergiaRoles?.length || 0}</p>
                          <p className="text-sm text-gray-400">Rôles</p>
                        </div>
                      </div>
                      
                      {/* Badges */}
                      <div className="flex gap-2 justify-end mb-3">
                        {member.badges?.map((badge, index) => (
                          <span key={index} className="text-2xl" title={`Badge ${badge}`}>
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rôles actuels */}
                  {member.synergiaRoles && member.synergiaRoles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <h4 className="text-white font-medium mb-2">Rôles Synergia :</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.synergiaRoles.map((userRole) => {
                          const roleInfo = SYNERGIA_ROLES[userRole.roleId];
                          if (!roleInfo) return null;
                          
                          return (
                            <div
                              key={userRole.roleId}
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white ${roleInfo.color}`}
                            >
                              <span>{roleInfo.icon}</span>
                              <span>{roleInfo.name}</span>
                              <span className="text-xs">({userRole.level})</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message si aucun membre trouvé */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Aucun membre trouvé</h3>
                <p className="text-gray-400">Essayez de modifier votre recherche</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            
            {/* Grille des rôles Synergia */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(SYNERGIA_ROLES).map((role) => (
                <div
                  key={role.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center text-2xl`}>
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{role.name}</h3>
                      <p className="text-sm text-gray-400">100 tâches disponibles</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{role.description}</p>
                  
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            
            {/* Stats globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
                <p className="text-gray-400">Membres</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {teamMembers.reduce((sum, member) => sum + (member.synergiaRoles?.length || 0), 0)}
                </p>
                <p className="text-gray-400">Rôles assignés</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0)}
                </p>
                <p className="text-gray-400">Tâches complétées</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {Math.round(teamMembers.reduce((sum, member) => sum + member.totalXp, 0) / teamMembers.length)}
                </p>
                <p className="text-gray-400">XP moyen</p>
              </div>
            </div>

            {/* Message temporaire */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Statistiques détaillées</h3>
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p>Dashboard analytics avancé bientôt disponible</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
