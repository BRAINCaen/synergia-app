// ==========================================
// 📁 react-app/src/pages/ProjectsPage.jsx
// PROJECTS PREMIUM AVEC DESIGN HARMONISÉ TEAM PAGE
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Target,
  Clock,
  Star,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Settings,
  Share2,
  Download,
  Award,
  Zap
} from 'lucide-react';

// Layout et composants premium
import PremiumLayout, { PremiumCard, StatCard, PremiumButton, PremiumSearchBar } from '../shared/layouts/PremiumLayout.jsx';

// Stores et services
import { useAuthStore } from '../shared/stores/authStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';

/**
 * 📁 PROJECTS PREMIUM REDESIGN
 */
const ProjectsPage = () => {
  const { user } = useAuthStore();
  const { projects, loadProjects } = useProjectStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // États pour les statistiques
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    completionRate: 0
  });

  // Calcul des statistiques
  useEffect(() => {
    if (projects?.length) {
      const total = projects.length;
      const active = projects.filter(p => p.status === 'active').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      setProjectStats({ total, active, completed, completionRate });
    }
  }, [projects]);

  // Chargement initial
  useEffect(() => {
    if (loadProjects) {
      loadProjects();
    }
  }, [loadProjects]);

  // Filtrage des projets
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  // Statistiques pour le header
  const headerStats = [
    {
      label: "Projets totaux",
      value: projectStats.total,
      icon: Folder,
      color: "text-blue-400",
      iconColor: "text-blue-400"
    },
    {
      label: "Projets actifs",
      value: projectStats.active,
      icon: Play,
      color: "text-green-400",
      iconColor: "text-green-400"
    },
    {
      label: "Complétés",
      value: projectStats.completed,
      icon: CheckCircle,
      color: "text-purple-400",
      iconColor: "text-purple-400"
    },
    {
      label: "Taux de réussite",
      value: `${projectStats.completionRate}%`,
      icon: Target,
      color: "text-yellow-400",
      iconColor: "text-yellow-400"
    }
  ];

  // Actions du header
  const headerActions = (
    <>
      <PremiumButton 
        variant="secondary" 
        size="md"
        icon={Download}
      >
        Exporter
      </PremiumButton>
      <PremiumButton 
        variant="primary" 
        size="md"
        icon={Plus}
      >
        Nouveau projet
      </PremiumButton>
    </>
  );

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Fonction pour obtenir le label de statut
  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'Actif';
      case 'completed': return 'Terminé';
      case 'paused': return 'En pause';
      case 'cancelled': return 'Annulé';
      default: return 'Brouillon';
    }
  };

  return (
    <PremiumLayout
      title="Projets"
      subtitle="Gérez et suivez vos projets en équipe"
      icon={Folder}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      
      {/* 🎯 Section filtres et recherche */}
      <PremiumCard className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <PremiumSearchBar
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          
          {/* Filtres */}
          <div className="flex items-center space-x-3">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="completed">Terminés</option>
              <option value="paused">En pause</option>
              <option value="cancelled">Annulés</option>
            </select>
            
            <PremiumButton variant="ghost" size="sm" icon={Filter}>
              Filtres
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>

      {/* 📊 Section métriques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Productivité"
          value="Élevée"
          icon={TrendingUp}
          color="purple"
          trend="📈 +12% ce mois"
        />
        <StatCard
          title="Temps moyen"
          value="3.2 mois"
          icon={Clock}
          color="blue"
          trend="⏱️ Par projet"
        />
        <StatCard
          title="Équipe moyenne"
          value="5.8 pers."
          icon={Users}
          color="green"
          trend="👥 Collaboration active"
        />
        <StatCard
          title="Score qualité"
          value="4.6/5"
          icon={Award}
          color="yellow"
          trend="⭐ Excellent"
        />
      </div>

      {/* 📁 Grille des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <PremiumCard className="h-full" hover={true}>
              
              {/* Header du projet */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]">
                      {project.name || 'Projet sans nom'}
                    </h3>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span>{getStatusLabel(project.status)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {project.description || 'Aucune description disponible'}
              </p>

              {/* Métriques du projet */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">{project.tasksCount || 0}</div>
                  <div className="text-xs text-gray-400">Tâches</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-green-400">{project.teamSize || 0}</div>
                  <div className="text-xs text-gray-400">Équipe</div>
                </div>
                <div className="text-center p-2 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">{project.progress || 0}%</div>
                  <div className="text-xs text-gray-400">Avancement</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progression</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress || 0}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  ></motion.div>
                </div>
              </div>

              {/* Équipe et deadline */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{project.teamSize || 0} membres</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{project.deadline ? new Date(project.deadline).toLocaleDateString('fr-FR') : 'Pas de deadline'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-yellow-400">
                  <Star className="w-3 h-3" />
                  <span>{project.rating || '4.5'}</span>
                </div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}

        {/* Carte "Ajouter un projet" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: filteredProjects.length * 0.1 }}
        >
          <PremiumCard className="h-full border-dashed border-gray-600 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nouveau projet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Créez un nouveau projet pour votre équipe
              </p>
              <PremiumButton variant="primary" size="sm">
                Commencer
              </PremiumButton>
            </div>
          </PremiumCard>
        </motion.div>
      </div>

      {/* 📊 Section insights en bas */}
      {filteredProjects.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Projets récents */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-4">Activité récente</h3>
            <div className="space-y-3">
              {[
                { project: "Migration API v2", action: "Tâche terminée", time: "il y a 2h", user: "Marie D." },
                { project: "Refonte UI", action: "Nouveau commentaire", time: "il y a 4h", user: "Alex R." },
                { project: "Dashboard Analytics", action: "Milestone atteint", time: "hier", user: "Tom L." },
                { project: "App Mobile", action: "Bug résolu", time: "il y a 2j", user: "Sophie C." }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-white font-medium text-sm">{activity.project}</div>
                      <div className="text-gray-400 text-xs">{activity.action} par {activity.user}</div>
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs">{activity.time}</div>
                </div>
              ))}
            </div>
          </PremiumCard>

          {/* Top projets */}
          <PremiumCard>
            <h3 className="text-xl font-bold text-white mb-4">Projets les plus performants</h3>
            <div className="space-y-3">
              {[
                { name: "Dashboard Analytics", score: 96, progress: 85, team: 6 },
                { name: "Migration API v2", score: 92, progress: 70, team: 4 },
                { name: "App Mobile", score: 88, progress: 45, team: 8 },
                { name: "Refonte UI", score: 84, progress: 60, team: 5 }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-800' :
                      index === 2 ? 'bg-amber-600 text-amber-100' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{project.name}</div>
                      <div className="text-gray-400 text-xs">
                        {project.progress}% • {project.team} membres
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-sm">{project.score}%</div>
                    <div className="text-gray-500 text-xs">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>
      )}

      {/* État vide */}
      {filteredProjects.length === 0 && !loading && (
        <PremiumCard className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Folder className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Aucun projet ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier projet.'}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || filterStatus !== 'all') && (
              <PremiumButton 
                variant="secondary" 
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                Réinitialiser les filtres
              </PremiumButton>
            )}
            <PremiumButton 
              variant="primary" 
              size="md"
              icon={Plus}
            >
              Créer un projet
            </PremiumButton>
          </div>
        </PremiumCard>
      )}
    </PremiumLayout>
  );
};

export default ProjectsPage;
