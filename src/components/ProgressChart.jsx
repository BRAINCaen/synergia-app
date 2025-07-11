import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ProgressChart = ({ projects, tasks }) => {
  // Données pour le graphique en barres - progression par projet
  const projectProgress = projects?.map(project => {
    const projectTasks = tasks?.filter(task => task.projectId === project.id) || [];
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    const totalTasks = projectTasks.length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      name: project.title?.substring(0, 15) + (project.title?.length > 15 ? '...' : ''),
      completed: completedTasks,
      total: totalTasks,
      progress: progressPercent
    };
  }) || [];

  // Données pour le graphique circulaire - statut global des tâches
  const taskStatusData = [
    {
      name: 'Terminées',
      value: tasks?.filter(task => task.status === 'completed').length || 0,
      color: '#10B981'
    },
    {
      name: 'En cours',
      value: tasks?.filter(task => task.status === 'in-progress').length || 0,
      color: '#F59E0B'
    },
    {
      name: 'À faire',
      value: tasks?.filter(task => task.status === 'todo').length || 0,
      color: '#6B7280'
    }
  ];

  // Données pour l'évolution temporelle (7 derniers jours)
  const getLastWeekData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayTasks = tasks?.filter(task => {
        const taskDate = new Date(task.completedAt?.toDate?.() || task.completedAt);
        return taskDate.toDateString() === date.toDateString() && task.status === 'completed';
      }).length || 0;
      
      days.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        tasks: dayTasks,
        date: date.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const weeklyData = getLastWeekData();

  return (
    <div className="space-y-6">
      {/* Métriques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <h3 className="text-sm font-medium opacity-90">Total Projets</h3>
          <p className="text-2xl font-bold">{projects?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <h3 className="text-sm font-medium opacity-90">Tâches Terminées</h3>
          <p className="text-2xl font-bold">{tasks?.filter(t => t.status === 'completed').length || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <h3 className="text-sm font-medium opacity-90">En Cours</h3>
          <p className="text-2xl font-bold">{tasks?.filter(t => t.status === 'in-progress').length || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <h3 className="text-sm font-medium opacity-90">Taux Completion</h3>
          <p className="text-2xl font-bold">
            {tasks?.length > 0 ? 
              Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
            }%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique progression par projet */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            📊 Progression par Projet
          </h3>
          {projectProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#F9FAFB', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [
                    name === 'progress' ? `${value}%` : value,
                    name === 'completed' ? 'Terminées' : 
                    name === 'total' ? 'Total' : 'Progression'
                  ]}
                />
                <Bar 
                  dataKey="progress" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  name="progress"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">📈</p>
                <p>Aucun projet à afficher</p>
                <p className="text-sm">Créez votre premier projet pour voir les statistiques</p>
              </div>
            </div>
          )}
        </div>

        {/* Graphique répartition des tâches */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            🎯 Répartition des Tâches
          </h3>
          {taskStatusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ 
                    backgroundColor: '#F9FAFB', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">🎯</p>
                <p>Aucune tâche à afficher</p>
                <p className="text-sm">Créez votre première tâche pour voir les statistiques</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Graphique activité hebdomadaire */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          📅 Activité des 7 derniers jours
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip 
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB',
                borderRadius: '6px'
              }}
              formatter={(value) => [value, 'Tâches terminées']}
            />
            <Bar 
              dataKey="tasks" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
