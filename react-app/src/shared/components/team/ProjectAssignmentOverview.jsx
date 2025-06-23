import React from 'react';
import { Calendar, User, BarChart3, AlertTriangle } from 'lucide-react';

const ProjectAssignmentOverview = ({ projects, members }) => {
  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-900/20 text-green-400 border-green-500';
      case 'in_progress': return 'bg-blue-900/20 text-blue-400 border-blue-500';
      case 'at_risk': return 'bg-red-900/20 text-red-400 border-red-500';
      case 'completed': return 'bg-gray-900/20 text-gray-400 border-gray-500';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Vue d'ensemble des projets
        </h3>
        <div className="text-sm text-gray-400">
          {projects.length} projet{projects.length !== 1 ? 's' : ''} actif{projects.length !== 1 ? 's' : ''}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-lg mb-2">Aucun projet actif</div>
          <div className="text-gray-500 text-sm">Créez votre premier projet pour commencer.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map(project => (
            <div key={project.id} className={`rounded-lg border p-6 ${getProjectStatusColor(project.status)}`}>
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-white mb-1">{project.title}</h4>
                  {project.description && (
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-3">
                
                {/* Assignation */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm flex items-center">
                    <User size={14} className="mr-1" />
                    Assigné à
                  </span>
                  <span className="text-white text-sm">
                    {project.assignedToName || 'Non assigné'}
                  </span>
                </div>

                {/* Progression */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Progression</span>
                    <span className="text-white text-sm">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dates */}
                {(project.startDate || project.dueDate) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {project.dueDate ? 'Échéance' : 'Début'}
                    </span>
                    <span className="text-gray-300">
                      {project.dueDate 
                        ? new Date(project.dueDate.toDate()).toLocaleDateString('fr-FR')
                        : project.startDate 
                        ? new Date(project.startDate.toDate()).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </span>
                  </div>
                )}

                {/* Alertes si en retard */}
                {project.status === 'at_risk' && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm">
                    <AlertTriangle size={14} />
                    <span>Projet à risque - Attention requise</span>
                  </div>
                )}

                {/* Statistiques tâches */}
                {project.taskStats && (
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-600">
                    <div className="text-center">
                      <div className="text-white font-medium">{project.taskStats.total || 0}</div>
                      <div className="text-gray-400 text-xs">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-medium">{project.taskStats.completed || 0}</div>
                      <div className="text-gray-400 text-xs">Terminées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-medium">{project.taskStats.pending || 0}</div>
                      <div className="text-gray-400 text-xs">En cours</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectAssignmentOverview;
