// ==========================================
// 📁 react-app/src/components/TeamDashboard.jsx
// CORRECTION : Imports vers shared/components/team/
// ==========================================

import React, { useState, useEffect } from 'react';
import { Clock, Users, Target, Award, CheckCircle, AlertTriangle, Calendar, MessageSquare } from 'lucide-react';

// 🔧 CORRECTION : Imports avec chemins corrects vers shared/
import { useAuthStore } from '../shared/stores/authStore';
import { useTeamStore } from '../shared/stores/teamStore';

// 🔧 CORRECTION : Components depuis shared/components/
import LoadingSpinner from '../shared/components/ui/LoadingSpinner';
import XPRequestCard from '../shared/components/team/XPRequestCard';
import TeamMemberCard from '../shared/components/team/TeamMemberCard';
import ProjectAssignmentOverview from '../shared/components/team/ProjectAssignmentOverview';

const TeamDashboard = () => {
  const { user } = useAuthStore();
  const { 
    teamMembers, 
    xpRequests, 
    activeProjects, 
    teamMetrics,
    loadTeamData,
    loadXPRequests,
    validateXPRequest,
    rejectXPRequest,
    loading 
  } = useTeamStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');

  // Charger les données de l'équipe au montage
  useEffect(() => {
    if (user) {
      loadTeamData();
      loadXPRequests();
    }
  }, [user]);

  // Fonction pour valider une demande XP
  const handleValidateXP = async (requestId, approved, adminNotes = '') => {
    try {
      if (approved) {
        await validateXPRequest(requestId, user.uid, adminNotes);
      } else {
        await rejectXPRequest(requestId, user.uid, adminNotes);
      }
    } catch (error) {
      console.error('Erreur validation XP:', error);
    }
  };

  // Filtrer les demandes XP selon le statut
  const filteredXPRequests = xpRequests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin' || user?.permissions?.includes('validate_xp');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête Dashboard Équipe */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                👥 Dashboard Équipe
              </h1>
              <p className="text-gray-400">
                Vue d'ensemble collaborative - Qui fait quoi, qui gère quoi
              </p>
            </div>
            
            {/* Métriques rapides équipe */}
            <div className="flex gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-blue-400">{teamMembers.length}</div>
                <div className="text-xs text-gray-400">Membres</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-green-400">{activeProjects.length}</div>
                <div className="text-xs text-gray-400">Projets Actifs</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center border border-gray-700">
                <div className="text-2xl font-bold text-yellow-400">{xpRequests.filter(r => r.status === 'pending').length}</div>
                <div className="text-xs text-gray-400">XP en attente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Onglets */}
        <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'overview', label: '📊 Vue Générale', icon: Target },
            { id: 'members', label: '👥 Membres', icon: Users },
            { id: 'projects', label: '📋 Projets', icon: Calendar },
            { id: 'xp-requests', label: '🏆 Demandes XP', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenu des Onglets */}
        <div className="space-y-6">
          
          {/* Onglet Vue Générale */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Activité Récente */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="mr-2" size={20} />
                  Activité Récente
                </h3>
                <div className="space-y-3">
                  {teamMembers.slice(0, 5).map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {member.displayName?.charAt(0) || member.email?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white text-sm">{member.displayName || member.email}</div>
                          <div className="text-gray-400 text-xs">
                            {member.isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 text-sm font-semibold">{member.totalXP || 0} XP</div>
                        <div className="text-gray-400 text-xs">Niveau {member.level || 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projets en cours */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Target className="mr-2" size={20} />
                  Projets Actifs
                </h3>
                <div className="space-y-3">
                  {activeProjects.slice(0, 5).map(project => (
                    <div key={project.id} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{project.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-900 text-green-300' :
                          project.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                          project.status === 'at_risk' ? 'bg-red-900 text-red-300' :
                          'bg-gray-600 text-gray-300'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Assigné à: {project.assignedToName || 'Non assigné'}</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Membres */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}

          {/* Onglet Projets */}
          {activeTab === 'projects' && (
            <div>
              <ProjectAssignmentOverview projects={activeProjects} members={teamMembers} />
            </div>
          )}

          {/* Onglet Demandes XP */}
          {activeTab === 'xp-requests' && isAdmin && (
            <div>
              {/* Filtres */}
              <div className="mb-6 flex space-x-4">
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status === 'all' ? 'Toutes' :
                     status === 'pending' ? 'En attente' :
                     status === 'approved' ? 'Approuvées' :
                     'Rejetées'}
                  </button>
                ))}
              </div>

              {/* Liste des demandes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredXPRequests.map(request => (
                  <XPRequestCard 
                    key={request.id} 
                    request={request} 
                    onValidate={handleValidateXP}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>

              {filteredXPRequests.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">Aucune demande XP</div>
                  <div className="text-gray-500 text-sm">
                    {filterStatus === 'all' ? 'Il n\'y a aucune demande XP pour le moment.' :
                     `Aucune demande XP ${filterStatus === 'pending' ? 'en attente' : filterStatus === 'approved' ? 'approuvée' : 'rejetée'}.`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message si pas admin pour XP */}
          {activeTab === 'xp-requests' && !isAdmin && (
            <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
              <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
              <h3 className="text-lg font-semibold text-white mb-2">Accès Restreint</h3>
              <p className="text-gray-400">
                Vous devez être administrateur pour voir et gérer les demandes XP.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
