import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { Clock, Users, Target, Award, CheckCircle, AlertTriangle, Calendar, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import XPRequestCard from './XPRequestCard';
import TeamMemberCard from './TeamMemberCard';
import ProjectAssignmentOverview from './ProjectAssignmentOverview';

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
                <div className="text-2xl font-bold text-yellow-400">
                  {xpRequests.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-400">XP En Attente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 Vue d\'ensemble', icon: Target },
              { id: 'members', label: '👥 Membres', icon: Users },
              { id: 'assignments', label: '📋 Assignations', icon: Calendar },
              { id: 'xp-validation', label: '🏆 Validation XP', icon: Award, adminOnly: true }
            ].map(tab => {
              // Masquer l'onglet si réservé admin et user pas admin
              if (tab.adminOnly && !isAdmin) return null;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="space-y-8">
          
          {/* ONGLET VUE D'ENSEMBLE */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Métriques globales équipe */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{teamMetrics.totalTasks || 0}</div>
                      <div className="text-blue-100">Tâches Totales</div>
                    </div>
                    <Target className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{teamMetrics.completedTasks || 0}</div>
                      <div className="text-green-100">Tâches Terminées</div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{teamMetrics.inProgressTasks || 0}</div>
                      <div className="text-yellow-100">En Cours</div>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{teamMetrics.overdueTasks || 0}</div>
                      <div className="text-red-100">En Retard</div>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-200" />
                  </div>
                </div>
              </div>

              {/* Activité récente équipe */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  🔥 Activité Récente de l'Équipe
                </h3>
                <div className="space-y-3">
                  {teamMetrics.recentActivity?.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-white text-sm">{activity.description}</div>
                        <div className="text-gray-400 text-xs">{activity.timestamp}</div>
                      </div>
                      <div className="text-xs text-gray-400">{activity.user}</div>
                    </div>
                  )) || (
                    <div className="text-gray-400 text-center py-8">
                      Aucune activité récente à afficher
                    </div>
                  )}
                </div>
              </div>

              {/* Projets nécessitant attention */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">
                  ⚠️ Projets Nécessitant une Attention
                </h3>
                <div className="space-y-3">
                  {activeProjects
                    .filter(project => project.status === 'at_risk' || project.progress < 30)
                    .slice(0, 3)
                    .map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{project.title}</h4>
                        <div className="text-yellow-400 text-sm">
                          Progression: {project.progress}% • Assigné à: {project.assignedToName}
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors">
                        Aider
                      </button>
                    </div>
                  )) || (
                    <div className="text-gray-400 text-center py-4">
                      🎉 Tous les projets sont sur la bonne voie !
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ONGLET MEMBRES */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white">👥 Membres de l'Équipe</h3>
                <div className="text-sm text-gray-400">
                  {teamMembers.length} membre(s) actif(s)
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                  <TeamMemberCard 
                    key={member.id} 
                    member={member}
                    currentUser={user}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ONGLET ASSIGNATIONS */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <ProjectAssignmentOverview 
                projects={activeProjects}
                members={teamMembers}
                currentUser={user}
              />
            </div>
          )}

          {/* ONGLET VALIDATION XP (Admin seulement) */}
          {activeTab === 'xp-validation' && isAdmin && (
            <div className="space-y-6">
              
              {/* Filtres demandes XP */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white">🏆 Validation des Demandes XP</h3>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'Toutes', count: xpRequests.length },
                    { value: 'pending', label: 'En attente', count: xpRequests.filter(r => r.status === 'pending').length },
                    { value: 'approved', label: 'Approuvées', count: xpRequests.filter(r => r.status === 'approved').length },
                    { value: 'rejected', label: 'Rejetées', count: xpRequests.filter(r => r.status === 'rejected').length }
                  ].map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterStatus(filter.value)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        filterStatus === filter.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Liste des demandes XP */}
              <div className="space-y-4">
                {filteredXPRequests.length > 0 ? (
                  filteredXPRequests.map(request => (
                    <XPRequestCard
                      key={request.id}
                      request={request}
                      onValidate={handleValidateXP}
                      isAdmin={isAdmin}
                    />
                  ))
                ) : (
                  <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400">
                      {filterStatus === 'pending' 
                        ? 'Aucune demande XP en attente' 
                        : `Aucune demande XP ${filterStatus === 'all' ? '' : filterStatus}`
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
