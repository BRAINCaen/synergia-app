import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import ProgressChart from '../components/ProgressChart';

const Analytics = () => {
  const { tasks, projects, fetchTasks, fetchProjects } = useTaskStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          await Promise.all([
            fetchTasks(),
            fetchProjects()
          ]);
        } catch (error) {
          console.error('Erreur chargement analytics:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user, fetchTasks, fetchProjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📊 Analytics Synergia
              </h1>
              <p className="text-gray-400">
                Analysez vos performances et suivez vos progrès
              </p>
            </div>
            
            {/* Sélecteur de période */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Période :</span>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="quarter">3 derniers mois</option>
                <option value="year">Année en cours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="space-y-6">
          {/* Graphiques principaux */}
          <ProgressChart 
            projects={projects} 
            tasks={tasks}
            period={selectedPeriod}
          />

          {/* Insights supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Projet le plus actif */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                🏆 Projet le Plus Actif
              </h3>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects
                    .map(project => ({
                      ...project,
                      taskCount: tasks.filter(t => t.projectId === project.id).length
                    }))
                    .sort((a, b) => b.taskCount - a.taskCount)
                    .slice(0, 3)
                    .map((project, index) => (
                      <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {project.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {project.taskCount} tâche{project.taskCount > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">
                            {Math.round((tasks.filter(t => t.projectId === project.id && t.status === 'completed').length / project.taskCount) * 100) || 0}%
                          </p>
                          <p className="text-xs text-gray-500">Terminé</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucun projet créé
                </p>
              )}
            </div>

            {/* Productivité récente */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                ⚡ Productivité Récente
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Aujourd'hui</span>
                  <span className="font-bold text-green-600">
                    {tasks.filter(t => {
                      const today = new Date().toDateString();
                      const taskDate = new Date(t.completedAt?.toDate?.() || t.completedAt);
                      return taskDate.toDateString() === today && t.status === 'completed';
                    }).length} tâches
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cette semaine</span>
                  <span className="font-bold text-blue-600">
                    {tasks.filter(t => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      const taskDate = new Date(t.completedAt?.toDate?.() || t.completedAt);
                      return taskDate >= weekAgo && t.status === 'completed';
                    }).length} tâches
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Moyenne journalière</span>
                  <span className="font-bold text-purple-600">
                    {Math.round(tasks.filter(t => t.status === 'completed').length / 7) || 0} tâches
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommandations automatiques */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-lg font-semibold mb-4">
              💡 Recommandations Intelligentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🎯 Focus Recommandé</h4>
                <p className="text-sm opacity-90">
                  {projects.length > 0 ? 
                    `Concentrez-vous sur "${projects[0]?.title}" qui a le plus de tâches en attente.` :
                    'Créez votre premier projet pour commencer à organiser votre travail.'
                  }
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📈 Optimisation</h4>
                <p className="text-sm opacity-90">
                  {tasks.filter(t => t.status === 'completed').length > 5 ?
                    'Excellent ! Maintenez ce rythme pour atteindre vos objectifs.' :
                    'Fixez-vous un objectif de 3-5 tâches par jour pour améliorer votre productivité.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
