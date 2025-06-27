// ==========================================
// 📁 react-app/src/pages/Dashboard.jsx
// DASHBOARD PRINCIPAL AVEC SECTION ADMIN INTÉGRÉE
// ==========================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Folder, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Users,
  Trophy,
  Target,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

// ✅ NOUVEAUX IMPORTS pour le système de validation
import { useAuthStore } from '../shared/stores/authStore.js';
import { isAdmin } from '../core/services/adminBadgeService.js';
import AdminDashboardSection from '../components/admin/AdminDashboardSection.jsx';

// Hooks existants
import { useTaskStore } from '../shared/stores/taskStore.js';
import { useProjectStore } from '../shared/stores/projectStore.js';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks, loadUserTasks } = useTaskStore();
  const { projects, loadUserProjects } = useProjectStore();
  
  // États
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        // Charger les tâches et projets
        await Promise.all([
          loadUserTasks(user.uid),
          loadUserProjects(user.uid)
        ]);
        
        // Vérifier les permissions admin
        setIsUserAdmin(isAdmin(user));
        
        console.log('✅ Dashboard chargé - Admin:', isAdmin(user));
        
      } catch (error) {
        console.error('❌ Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.uid, loadUserTasks, loadUserProjects]);

  // Calculer les statistiques
  const getStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const validationPendingTasks = tasks.filter(t => t.status === 'validation_pending').length;
    const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;
    
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    return {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        validationPending: validationPendingTasks,
        rejected: rejectedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      projects: {
        active: activeProjects,
        completed: completedProjects
      }
    };
  };

  const stats = getStats();

  // Rendu conditionnel du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Chargement du Dashboard</h2>
          <p className="text-gray-500 mt-2">Synchronisation des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* EN-TÊTE DASHBOARD */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {user?.displayName || 'Utilisateur'} !
              </h1>
              <p className="text-gray-600 mt-1">
                Voici un aperçu de votre activité sur Synergia
              </p>
            </div>
            
            {/* Badge admin si applicable */}
            {isUserAdmin && (
              <div className="bg-gradient-to-r from-red-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                <span>🛡️</span>
                <span>Administrateur</span>
              </div>
            )}
          </div>
        </div>

        {/* ✅ SECTION ADMIN (SI PERMISSIONS) */}
        {isUserAdmin && (
          <AdminDashboardSection />
        )}

        {/* STATISTIQUES RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Tâches totales */}
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tâches totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasks.total}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Taux de réussite */}
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Taux de réussite</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasks.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* ✅ NOUVEAU: Validations en attente */}
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En validation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.tasks.validationPending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          {/* Projets actifs */}
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Projets actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.projects.active}</p>
              </div>
              <Folder className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* ✅ ALERTE SI TÂCHES REJETÉES */}
        {stats.tasks.rejected > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">
                  {stats.tasks.rejected} tâche(s) rejetée(s)
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  Certaines de vos soumissions ont été rejetées. Consultez vos tâches pour voir les commentaires admin.
                </p>
                <Link
                  to="/tasks"
                  className="mt-2 inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Voir mes tâches →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Créer une tâche */}
          <Link 
            to="/tasks"
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:from-green-600 hover:to-green-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Nouvelle Tâche</h3>
                <p className="text-green-100 text-sm mt-1">
                  Créer et organiser vos tâches
                </p>
                {/* ✅ NOUVEAU: Mention validation */}
                <p className="text-green-200 text-xs mt-2">
                  💡 XP attribués après validation admin
                </p>
              </div>
              <CheckSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
          </Link>

          {/* Voir les projets */}
          <Link 
            to="/projects"
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Mes Projets</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Gérer vos projets en cours
                </p>
                <p className="text-blue-200 text-xs mt-2">
                  📊 {stats.projects.active} projet(s) actif(s)
                </p>
              </div>
              <Folder className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
          </Link>

          {/* Analytics */}
          <Link 
            to="/analytics"
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Analytics</h3>
                <p className="text-purple-100 text-sm mt-1">
                  Analyser votre performance
                </p>
                <p className="text-purple-200 text-xs mt-2">
                  📈 Tableaux de bord détaillés
                </p>
              </div>
              <BarChart3 className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </div>
          </Link>
        </div>

        {/* APERÇU DES TÂCHES RÉCENTES */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Tâches récentes</h2>
              <Link 
                to="/tasks" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Voir toutes →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
                <p className="text-gray-500 mb-4">Commencez par créer votre première tâche</p>
                <Link
                  to="/tasks"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Créer une tâche
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'validation_pending' ? 'bg-orange-100 text-orange-800' :
                          task.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'completed' ? 'Validée' :
                           task.status === 'validation_pending' ? 'En validation' :
                           task.status === 'rejected' ? 'Rejetée' :
                           task.status === 'in_progress' ? 'En cours' : 'À faire'}
                        </span>
                        
                        {/* ✅ NOUVEAU: Affichage XP */}
                        {task.xpReward && (
                          <span className="text-purple-600 text-xs font-medium">
                            +{task.xpReward} XP
                          </span>
                        )}
                        
                        <span className="text-gray-500 text-xs">
                          {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to="/tasks"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Voir →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* APERÇU GAMIFICATION */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Progression Gamification</h2>
              <p className="text-purple-100 mt-1">Votre évolution dans Synergia</p>
            </div>
            <Trophy className="w-8 h-8" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">Niveau 4</p>
              <p className="text-purple-200 text-sm">Votre niveau actuel</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">175 XP</p>
              <p className="text-purple-200 text-sm">Expérience totale</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.tasks.validationPending}</p>
              <p className="text-purple-200 text-sm">XP en attente</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">2</p>
              <p className="text-purple-200 text-sm">Badges débloqués</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              to="/gamification"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-medium transition-colors"
            >
              Voir ma progression →
            </Link>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Dernière synchronisation : {new Date().toLocaleTimeString()} •
            Synergia v3.5 - Système de validation intégré
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
