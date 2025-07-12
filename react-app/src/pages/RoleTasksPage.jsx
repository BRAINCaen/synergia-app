// ==========================================
// 📁 react-app/src/pages/RoleTasksPage.jsx
// PAGE TÂCHES DE RÔLE AVEC LES VRAIS RÔLES SYNERGIA
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Clock, 
  Star, 
  Lock, 
  CheckCircle, 
  Plus,
  Trophy,
  Zap,
  Users,
  Award,
  Play,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { ESCAPE_GAME_ROLES } from '../core/services/escapeGameRolesService.js';
import { SYNERGIA_ROLES } from '../core/services/synergiaRolesService.js';

const RoleTasksPage = () => {
  const { user } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState('gamemaster');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 🎯 COMBINER LES RÔLES ESCAPE GAME ET SYNERGIA
  const allRoles = {
    // Rôles Escape Game (priorité)
    ...ESCAPE_GAME_ROLES,
    // Rôles Synergia (en complément)
    ...Object.fromEntries(
      Object.entries(SYNERGIA_ROLES).map(([key, role]) => [
        key.toLowerCase(),
        {
          ...role,
          icon: role.icon === '🔧' ? '🛠️' : 
                role.icon === '⭐' ? '🌟' : 
                role.icon === '📦' ? '📦' : 
                role.icon === '📋' ? '🗓️' : 
                role.icon === '🎨' ? '🎨' : 
                role.icon === '🎓' ? '🎓' : 
                role.icon === '🤝' ? '🤝' : 
                role.icon === '📢' ? '📢' : 
                role.icon === '💼' ? '💼' : 
                role.icon === '🎮' ? '🎮' : role.icon,
          color: role.color?.replace('bg-', 'from-') + ' to-blue-600',
          description: role.description
        }
      ])
    )
  };

  // 🚀 TÂCHES SPÉCIALISÉES PAR RÔLE SYNERGIA
  const roleSpecificTasks = {
    gamemaster: [
      {
        id: 'gm_accueil_equipe',
        title: 'Accueillir une équipe de 6 personnes',
        description: 'Réaliser l\'accueil complet d\'une équipe : présentation, brief des règles et mise en ambiance',
        category: 'Accueil',
        difficulty: 'Facile',
        xpReward: 25,
        timeEstimate: '15 minutes',
        requiredLevel: 1,
        skills: ['Communication', 'Présentation', 'Gestion du stress'],
        status: 'available'
      },
      {
        id: 'gm_mastering_live',
        title: 'Mastering en live d\'une salle complexe',
        description: 'Gérer en temps réel une session avec indices, effets sonores et gestion des caméras',
        category: 'Mastering',
        difficulty: 'Avancé',
        xpReward: 50,
        timeEstimate: '60 minutes',
        requiredLevel: 2,
        skills: ['Multitâche', 'Réactivité', 'Créativité'],
        status: 'available'
      },
      {
        id: 'gm_situation_urgence',
        title: 'Gérer une situation d\'urgence client',
        description: 'Résoudre un conflit client ou gérer une situation de panique en salle',
        category: 'Gestion de crise',
        difficulty: 'Expert',
        xpReward: 75,
        timeEstimate: 'Variable',
        requiredLevel: 3,
        skills: ['Diplomatie', 'Calme', 'Résolution de problèmes'],
        status: 'locked'
      }
    ],
    
    maintenance: [
      {
        id: 'maint_verification_quotidienne',
        title: 'Vérification quotidienne d\'une salle',
        description: 'Contrôler l\'état des mécanismes, serrures, éclairage et décoration d\'une salle',
        category: 'Contrôle',
        difficulty: 'Facile',
        xpReward: 20,
        timeEstimate: '30 minutes',
        requiredLevel: 1,
        skills: ['Observation', 'Méthode', 'Rigueur'],
        status: 'available'
      },
      {
        id: 'maint_reparation_mecanisme',
        title: 'Réparer un mécanisme défaillant',
        description: 'Diagnostiquer et réparer un mécanisme d\'énigme qui ne fonctionne plus',
        category: 'Réparation',
        difficulty: 'Intermédiaire',
        xpReward: 40,
        timeEstimate: '45 minutes',
        requiredLevel: 2,
        skills: ['Bricolage', 'Diagnostic', 'Persévérance'],
        status: 'available'
      },
      {
        id: 'maint_amelioration_salle',
        title: 'Proposer des améliorations pour une salle',
        description: 'Analyser une salle et proposer des améliorations techniques ou esthétiques',
        category: 'Innovation',
        difficulty: 'Avancé',
        xpReward: 60,
        timeEstimate: '2 heures',
        requiredLevel: 2,
        skills: ['Créativité', 'Vision technique', 'Proposition'],
        status: 'available'
      }
    ],
    
    reputation: [
      {
        id: 'rep_repondre_avis_google',
        title: 'Répondre à 5 avis Google',
        description: 'Rédiger des réponses personnalisées et professionnelles aux avis clients',
        category: 'Avis en ligne',
        difficulty: 'Facile',
        xpReward: 30,
        timeEstimate: '30 minutes',
        requiredLevel: 1,
        skills: ['Rédaction', 'Diplomatie', 'Service client'],
        status: 'available'
      },
      {
        id: 'rep_gestion_avis_negatif',
        title: 'Gérer un avis négatif complexe',
        description: 'Traiter un avis négatif avec une stratégie de réponse et de résolution',
        category: 'Gestion de crise',
        difficulty: 'Intermédiaire',
        xpReward: 45,
        timeEstimate: '45 minutes',
        requiredLevel: 2,
        skills: ['Gestion de conflit', 'Empathie', 'Résolution'],
        status: 'available'
      },
      {
        id: 'rep_campagne_valorisation',
        title: 'Lancer une campagne de valorisation des avis',
        description: 'Créer et mettre en place une stratégie pour encourager les avis positifs',
        category: 'Marketing',
        difficulty: 'Avancé',
        xpReward: 70,
        timeEstimate: '3 heures',
        requiredLevel: 3,
        skills: ['Marketing', 'Stratégie', 'Communication'],
        status: 'locked'
      }
    ],
    
    stock: [
      {
        id: 'stock_inventaire_hebdo',
        title: 'Inventaire hebdomadaire complet',
        description: 'Effectuer l\'inventaire complet des consommables et matériel',
        category: 'Inventaire',
        difficulty: 'Facile',
        xpReward: 25,
        timeEstimate: '1 heure',
        requiredLevel: 1,
        skills: ['Organisation', 'Précision', 'Méthode'],
        status: 'available'
      },
      {
        id: 'stock_commande_anticipee',
        title: 'Planifier les commandes du mois',
        description: 'Analyser les besoins et planifier les commandes pour éviter les ruptures',
        category: 'Approvisionnement',
        difficulty: 'Intermédiaire',
        xpReward: 35,
        timeEstimate: '1h30',
        requiredLevel: 2,
        skills: ['Anticipation', 'Analyse', 'Négociation'],
        status: 'available'
      }
    ],
    
    organization: [
      {
        id: 'org_planning_semaine',
        title: 'Optimiser le planning de la semaine',
        description: 'Organiser et optimiser les plannings en tenant compte des contraintes',
        category: 'Planning',
        difficulty: 'Intermédiaire',
        xpReward: 40,
        timeEstimate: '1 heure',
        requiredLevel: 2,
        skills: ['Organisation', 'Logistique', 'Coordination'],
        status: 'available'
      },
      {
        id: 'org_suivi_conges',
        title: 'Gérer les demandes de congés du mois',
        description: 'Traiter et organiser les demandes de congés en optimisant la couverture',
        category: 'RH',
        difficulty: 'Avancé',
        xpReward: 50,
        timeEstimate: '2 heures',
        requiredLevel: 2,
        skills: ['RH', 'Négociation', 'Équité'],
        status: 'available'
      }
    ],
    
    content: [
      {
        id: 'content_affiche_promo',
        title: 'Créer une affiche promotionnelle',
        description: 'Concevoir et réaliser une affiche pour une promotion ou un événement',
        category: 'Design',
        difficulty: 'Intermédiaire',
        xpReward: 35,
        timeEstimate: '2 heures',
        requiredLevel: 1,
        skills: ['Design', 'Créativité', 'Communication visuelle'],
        status: 'available'
      },
      {
        id: 'content_video_promo',
        title: 'Produire une vidéo de promotion',
        description: 'Créer une courte vidéo de promotion pour les réseaux sociaux',
        category: 'Vidéo',
        difficulty: 'Avancé',
        xpReward: 60,
        timeEstimate: '4 heures',
        requiredLevel: 2,
        skills: ['Montage vidéo', 'Storytelling', 'Marketing'],
        status: 'available'
      }
    ],
    
    communication: [
      {
        id: 'comm_post_instagram',
        title: 'Créer 5 posts Instagram de qualité',
        description: 'Concevoir et publier 5 posts engageants avec photos et textes accrocheurs',
        category: 'Réseaux sociaux',
        difficulty: 'Facile',
        xpReward: 30,
        timeEstimate: '1h30',
        requiredLevel: 1,
        skills: ['Créativité', 'Rédaction', 'Photo'],
        status: 'available'
      },
      {
        id: 'comm_campagne_facebook',
        title: 'Lancer une campagne Facebook',
        description: 'Créer et lancer une campagne publicitaire ciblée sur Facebook',
        category: 'Publicité',
        difficulty: 'Avancé',
        xpReward: 65,
        timeEstimate: '3 heures',
        requiredLevel: 3,
        skills: ['Marketing digital', 'Ciblage', 'Analyse'],
        status: 'locked'
      }
    ]
  };

  // Simuler les données utilisateur
  const getUserRoleData = (roleId) => {
    const mockData = {
      gamemaster: { level: 2, tasksCompleted: 15, xp: 850 },
      maintenance: { level: 2, tasksCompleted: 22, xp: 1200 },
      reputation: { level: 2, tasksCompleted: 12, xp: 650 },
      stock: { level: 1, tasksCompleted: 8, xp: 300 },
      organization: { level: 3, tasksCompleted: 35, xp: 2100 },
      content: { level: 2, tasksCompleted: 18, xp: 950 },
      communication: { level: 2, tasksCompleted: 25, xp: 1350 }
    };
    
    return mockData[roleId] || { level: 1, tasksCompleted: 0, xp: 0 };
  };

  // Obtenir les tâches filtrées
  const getFilteredTasks = () => {
    const tasks = roleSpecificTasks[selectedRole] || [];
    const userLevel = getUserRoleData(selectedRole).level;
    
    return tasks
      .filter(task => {
        // Filtre par statut
        if (activeFilter === 'available') return task.status === 'available';
        if (activeFilter === 'locked') return task.status === 'locked';
        if (activeFilter === 'completed') return task.status === 'completed';
        
        return true;
      })
      .filter(task => {
        // Filtre par recherche
        if (!searchTerm) return true;
        return task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               task.description.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map(task => ({
        ...task,
        canAccess: task.requiredLevel <= userLevel,
        isLocked: task.status === 'locked' || task.requiredLevel > userLevel
      }));
  };

  // Couleurs par difficulté
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'text-green-600 bg-green-100';
      case 'Intermédiaire': return 'text-orange-600 bg-orange-100';
      case 'Avancé': return 'text-red-600 bg-red-100';
      case 'Expert': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentRole = allRoles[selectedRole];
  const userRoleData = getUserRoleData(selectedRole);
  const filteredTasks = getFilteredTasks();

  useEffect(() => {
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 opacity-20">
          <Target className="w-full h-full" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4 flex items-center">
            <Target className="w-10 h-10 mr-3" />
            Tâches par Rôle Synergia
          </h1>
          <p className="text-xl text-white/90">
            Progressez dans votre spécialisation avec des missions ciblées
          </p>
        </div>
      </div>

      {/* Sélection du rôle et filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mes tâches spécialisées</h2>
          
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sélection du rôle */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {Object.entries(allRoles).map(([key, role]) => {
            const isSelected = selectedRole === key;
            const userData = getUserRoleData(key);
            const availableTasks = (roleSpecificTasks[key] || []).length;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{role.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-600">Niveau {userData.level}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{availableTasks} tâches</p>
              </button>
            );
          })}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Toutes', icon: Target },
            { id: 'available', label: 'Disponibles', icon: Play },
            { id: 'locked', label: 'Verrouillées', icon: Lock },
            { id: 'completed', label: 'Terminées', icon: CheckCircle }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <filter.icon className="w-4 h-4 mr-2" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Informations du rôle sélectionné */}
      {currentRole && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{currentRole.icon}</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{currentRole.name}</h3>
              <p className="text-gray-600">{currentRole.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userRoleData.level}</div>
              <div className="text-blue-600 text-sm">Niveau actuel</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userRoleData.xp}</div>
              <div className="text-green-600 text-sm">XP total</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{userRoleData.tasksCompleted}</div>
              <div className="text-purple-600 text-sm">Tâches réalisées</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{filteredTasks.filter(t => t.canAccess).length}</div>
              <div className="text-orange-600 text-sm">Tâches disponibles</div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des tâches */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                task.isLocked 
                  ? 'border-gray-300 opacity-60' 
                  : task.status === 'completed'
                  ? 'border-green-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-bold ${
                      task.isLocked ? 'text-gray-500' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                    
                    {task.isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                    {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  
                  <p className={`mb-4 ${
                    task.isLocked ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {task.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {task.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.timeEstimate}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {task.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="ml-6 text-right">
                  <div className="flex items-center text-orange-600 mb-2">
                    <Trophy className="w-5 h-5 mr-1" />
                    <span className="font-bold">{task.xpReward} XP</span>
                  </div>
                  
                  <button
                    disabled={task.isLocked}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      task.isLocked
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : task.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {task.isLocked ? 'Verrouillée' : 
                     task.status === 'completed' ? 'Terminée' : 'Commencer'}
                  </button>
                  
                  {task.requiredLevel > getUserRoleData(selectedRole).level && (
                    <p className="text-xs text-gray-500 mt-1">
                      Niveau {task.requiredLevel} requis
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune tâche trouvée</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Aucune tâche ne correspond à votre recherche'
                : 'Aucune tâche disponible pour ce filtre'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleTasksPage;
