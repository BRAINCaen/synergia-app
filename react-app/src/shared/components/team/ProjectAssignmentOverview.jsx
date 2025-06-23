import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Crown,
  ArrowRight,
  Filter
} from 'lucide-react';

const ProjectAssignmentOverview = ({ projects, members, currentUser }) => {
  const [filterBy, setFilterBy] = useState('all'); // all, unassigned, at_risk, completed
  const [selectedMember, setSelectedMember] = useState(null);

  // Filtrer les projets selon le filtre sélectionné
  const filteredProjects = projects.filter(project => {
    switch (filterBy) {
      case 'unassigned': return !project.assignedTo;
      case 'at_risk': return project.status === 'at_risk' || project.progress < 30;
      case 'completed': return project.status === 'completed';
      case 'in_progress': return project.status === 'in_progress' || project.status === 'active';
      default: return true;
    }
  });

  // Grouper les projets par assigné
  const projectsByAssignee = filteredProjects.reduce((acc, project) => {
    const assigneeId = project.assignedTo || 'unassigned';
    if (!acc[assigneeId]) {
      acc[assigneeId] = [];
    }
    acc[assigneeId].push(project);
    return acc;
  }, {});

  // Obtenir les informations d'un membre
  const getMemberInfo = (memberId) => {
    if (memberId === 'unassigned') {
      return { displayName: 'Non assigné', avatar: null, role: null };
    }
    return members.find(m => m.id === memberId) || { displayName: 'Utilisateur inconnu', avatar: null };
  };

  // Obtenir la couleur de priorité du projet
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-900/20';
      case 'low': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status, progress) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'at_risk' || progress < 30) return <AlertTriangle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-blue-400" />;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6">
      
      {/* En-tête avec filtres */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Target className="w-6 h-6" />
          📋 Assignations & Répartition des Projets
        </h3>
        
        {/* Filtres */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Tous les projets ({projects.length})</option>
            <option value="unassigned">Non assignés ({projects.filter(p => !p.assignedTo).length})</option>
            <option value="in_progress">En cours ({projects.filter(p => p.status === 'in_progress' || p.status === 'active').length})</option>
            <option value="at_risk">À risque ({projects.filter(p => p.status === 'at_risk' || p.progress < 30).length})</option>
            <option value="completed">Terminés ({projects.filter(p => p.status === 'completed').length})</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{projects.length}</div>
          <div className="text-sm text-gray-400">Total Projets</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">{projects.filter(p => !p.assignedTo).length}</div>
          <div className="text-sm text-gray-400">Non Assignés</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-red-400">{projects.filter(p => p.status === 'at_risk' || p.progress < 30).length}</div>
          <div className="text-sm text-gray-400">À Risque</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)}%</div>
          <div className="text-sm text-gray-400">Progression Moy.</div>
        </div>
      </div>

      {/* Vue par assigné */}
      <div className="space-y-6">
        {Object.entries(projectsByAssignee).map(([assigneeId, assigneeProjects]) => {
          const memberInfo = getMemberInfo(assigneeId);
          
          return (
            <div key={assigneeId} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              
              {/* En-tête assigné */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    {memberInfo.avatar ? (
                      <img 
                        src={memberInfo.avatar} 
                        alt={memberInfo.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : assigneeId === 'unassigned' ? (
                      <AlertTriangle className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Nom et rôle */}
                  <div>
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      {memberInfo.displayName}
                      {memberInfo.role === 'admin' && <Crown className="w-4 h-4 text-yellow-400" />}
                    </h4>
                    <div className="text-sm text-gray-400">
                      {assigneeProjects.length} projet(s) • {memberInfo.role || 'membre'}
                    </div>
                  </div>
                </div>

                {/* Charge de travail */}
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{assigneeProjects.length}</div>
                  <div className="text-xs text-gray-400">
                    {assigneeId === 'unassigned' ? 'À assigner' : 'Projets actifs'}
                  </div>
                </div>
              </div>

              {/* Liste des projets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {assigneeProjects.map(project => (
                  <div key={project.id} className={`p-4 rounded-lg border ${getPriorityColor(project.priority)}`}>
                    
                    {/* En-tête projet */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-white font-medium mb-1">{project.title}</h5>
                        <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                      </div>
                      <div className="ml-2">
                        {getStatusIcon(project.status, project.progress)}
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progression</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            project.progress >= 80 ? 'bg-green-500' :
                            project.progress >= 50 ? 'bg-blue-500' :
                            project.progress >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Infos projet */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        {project.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.dueDate)}
                          </div>
                        )}
                        {project.priority && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.priority === 'high' ? 'bg-red-900/50 text-red-300' :
                            project.priority === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                            'bg-green-900/50 text-green-300'
                          }`}>
                            {project.priority}
                          </span>
                        )}
                      </div>
                      
                      {/* Actions rapides */}
                      <div className="flex gap-1">
                        {assigneeId === 'unassigned' && currentUser?.role === 'admin' && (
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors">
                            Assigner
                          </button>
                        )}
                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors">
                          Voir
                        </button>
                      </div>
                    </div>

                    {/* Alerte si projet à risque */}
                    {(project.status === 'at_risk' || project.progress < 30) && (
                      <div className="mt-2 p-2 bg-red-900/20 border border-red-600/30 rounded text-xs text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        Ce projet nécessite une attention immédiate
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions pour l'assigné */}
              {assigneeId !== 'unassigned' && currentUser?.role === 'admin' && (
                <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Réassigner projets
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors">
                    Contacter membre
                  </button>
                </div>
              )}

              {/* Section pour assigner si non assigné */}
              {assigneeId === 'unassigned' && currentUser?.role === 'admin' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Ces projets nécessitent une assignation</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member.id)}
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {member.avatar ? (
                            <img src={member.avatar} alt="" className="w-4 h-4 rounded-full" />
                          ) : (
                            <User className="w-2 h-2 text-white" />
                          )}
                        </div>
                        {member.displayName || member.email}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Message si aucun projet */}
      {filteredProjects.length === 0 && (
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <div className="text-gray-400">
            {filterBy === 'all' ? 'Aucun projet dans l\'équipe' : `Aucun projet ${filterBy}`}
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-3">📋 Légende</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-gray-300">À risque</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300">Administrateur</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssignmentOverview;
