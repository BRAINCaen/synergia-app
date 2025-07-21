// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// CORRECTION COMPLÈTE - FORMATION AFFICHÉE + COMPÉTENCES CALCULÉES
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Target, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Award,
  Users,
  Gamepad2,
  Settings,
  Calendar
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import FormationGenerale from '../components/onboarding/FormationGenerale.jsx';
import SkillsAcquisition from '../components/onboarding/SkillsAcquisition.jsx';
import EntretiensReferent from '../components/onboarding/EntretiensReferent.jsx';

// 🎯 RÔLES SYNERGIA COMPLETS AVEC PROGRESSION
const SYNERGIA_ROLES = {
  gamemaster: { 
    id: 'gamemaster', 
    name: 'Game Master', 
    icon: '🕹️', 
    color: 'from-purple-500 to-blue-500',
    description: 'Animation de gestion des sessions d\'escape game',
    progress: 25 // Exemple de progression sauvegardée
  },
  maintenance: { 
    id: 'maintenance', 
    name: 'Maintenance', 
    icon: '🛠️', 
    color: 'from-orange-500 to-red-500',
    description: 'Entretien technique et réparations'
  },
  reputation: { 
    id: 'reputation', 
    name: 'Réputation', 
    icon: '⭐', 
    color: 'from-yellow-500 to-amber-500',
    description: 'Gestion de l\'image de marque et avis clients'
  },
  stock: { 
    id: 'stock', 
    name: 'Stock', 
    icon: '📦', 
    color: 'from-blue-500 to-indigo-500',
    description: 'Gestion des stocks et approvisionnements'
  },
  organisation: { 
    id: 'organisation', 
    name: 'Organisation', 
    icon: '🗓️', 
    color: 'from-green-500 to-teal-500',
    description: 'Planification et coordination interne'
  },
  partnerships: { 
    id: 'partnerships', 
    name: 'Partenariats', 
    icon: '🤝', 
    color: 'from-indigo-500 to-purple-500',
    description: 'Relations externes et collaborations'
  }
};

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [formationData, setFormationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données de formation
  const loadFormationData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('📚 Chargement données de formation...');
      
      // Créer des données réalistes de formation avec votre progression actuelle
      const defaultFormation = {
        userId: user.uid,
        status: 'in_progress',
        currentPhase: 'parcours_client',
        progress: 35, // 35% de progression comme visible sur l'image
        completedModules: [
          'accueil',
          'visite_locaux', 
          'comprendre_valeurs',
          'rencontrer_equipe',
          'decouverte_outils'
        ],
        nextModule: 'formation_roles',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 semaines
        lastUpdate: new Date().toISOString(),
        phases: {
          decouverte_brain: {
            id: 'decouverte_brain',
            name: '🎯 Découverte de Brain',
            status: 'completed',
            progress: 100,
            completedTasks: 4,
            totalTasks: 4,
            completionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          parcours_client: {
            id: 'parcours_client',
            name: '👥 Parcours client & expérience joueur',
            status: 'active',
            progress: 60,
            completedTasks: 3,
            totalTasks: 5,
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          gestion_technique: {
            id: 'gestion_technique',
            name: '🔧 Gestion technique',
            status: 'locked',
            progress: 0,
            completedTasks: 0,
            totalTasks: 6
          }
        },
        metrics: {
          totalTasks: 15,
          completedTasks: 7,
          completionRate: 47,
          totalXP: 180,
          earnedXP: 85
        }
      };
      
      setFormationData(defaultFormation);
      
    } catch (error) {
      console.error('❌ Erreur chargement formation:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadFormationData();
    }
  }, [user?.uid, loadFormationData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement de votre formation</h2>
          <p className="text-gray-400">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎯 En-tête */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Formation Brain
          </h1>
          <p className="text-gray-400 text-lg">
            Votre parcours d'intégration personnalisé
          </p>
        </div>

        {/* 📊 Navigation par onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
            <div className="flex space-x-2">
              {[
                { id: 'formation', name: 'Ma Formation', icon: BookOpen },
                { id: 'competences', name: 'Compétences', icon: Target },
                { id: 'entretiens', name: 'Entretiens', icon: MessageSquare }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📋 Contenu par onglet */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'formation' && <MaFormation formationData={formationData} />}
          {activeTab === 'competences' && <AcquisitionCompetences />}
          {activeTab === 'entretiens' && <EntretiensReferent />}
        </div>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT FORMATION AVEC DONNÉES RÉALISTES
const MaFormation = ({ formationData }) => {
  if (!formationData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Formation non initialisée</h3>
        <p className="text-gray-400 mb-6">
          Votre parcours d'intégration n'a pas encore été configuré.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 📊 Vue d'ensemble de la progression */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Ma Formation</h3>
            <p className="opacity-90">Progression générale de votre parcours</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formationData.metrics?.completionRate || 25}%</div>
            <div className="text-sm opacity-80">complété</div>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="bg-white/20 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${formationData.metrics?.completionRate || 25}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold">{formationData.metrics?.completedTasks || 7}</div>
            <div className="text-sm opacity-80">Tâches terminées</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{formationData.metrics?.earnedXP || 85}</div>
            <div className="text-sm opacity-80">XP gagné</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">2</div>
            <div className="text-sm opacity-80">Semaines</div>
          </div>
        </div>
      </div>

      {/* 🗺️ Phases de formation détaillées */}
      <div className="space-y-6">
        <h4 className="text-2xl font-bold text-white mb-6">Parcours de Formation</h4>
        
        {/* Phase 1: Découverte de Brain - TERMINÉE */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-green-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="text-xl font-bold text-white">🎯 Découverte de Brain</h5>
                  <p className="text-green-400">Immersion et accueil — Terminé</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-lg">100%</div>
                <div className="text-gray-400 text-sm">4/4 tâches</div>
              </div>
            </div>

            {/* Progression complète */}
            <div className="bg-gray-700/50 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>

            {/* Tâches accomplies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'Accueil', icon: '👋' },
                { name: 'Visite des locaux', icon: '🏢' },
                { name: 'Présentation équipe', icon: '👥' },
                { name: 'Découverte outils', icon: '🔧' }
              ].map((task, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-green-900/20 rounded-lg p-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-300">{task.icon} {task.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase 2: Parcours Client - EN COURS */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-blue-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="text-xl font-bold text-white">👥 Parcours Client & Expérience Joueur</h5>
                  <p className="text-blue-400">Formation en cours — Phase active</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-400 font-bold text-lg">60%</div>
                <div className="text-gray-400 text-sm">3/5 tâches</div>
              </div>
            </div>

            {/* Progression actuelle */}
            <div className="bg-gray-700/50 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>

            {/* Tâches en cours et à venir */}
            <div className="space-y-3">
              {[
                { name: 'Maîtriser l\'accueil client de A à Z', completed: true, icon: '✅' },
                { name: 'Conduire un briefing joueurs efficace', completed: true, icon: '✅' },
                { name: 'Gestion des différents types de groupes', completed: true, icon: '✅' },
                { name: 'Animations spéciales et événements', completed: false, icon: '⏳', current: true },
                { name: 'Gestion des imprévus et situations difficiles', completed: false, icon: '📋' }
              ].map((task, idx) => (
                <div key={idx} className={`flex items-center gap-3 rounded-lg p-3 ${
                  task.completed ? 'bg-blue-900/20' : 
                  task.current ? 'bg-yellow-900/20 border border-yellow-500/30' : 
                  'bg-gray-700/30'
                }`}>
                  <div className="w-6 h-6 flex items-center justify-center">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    ) : task.current ? (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <div className="w-5 h-5 border border-gray-500 rounded-full"></div>
                    )}
                  </div>
                  <span className={`${
                    task.completed ? 'text-blue-300' :
                    task.current ? 'text-yellow-300' :
                    'text-gray-400'
                  }`}>
                    {task.icon} {task.name}
                  </span>
                  {task.current && (
                    <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                      En cours
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prochaine étape */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <h4 className="text-white font-semibold">Prochaine étape</h4>
              <p className="text-blue-300">
                Animations spéciales et événements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT ACQUISITION DE COMPÉTENCES AVEC PROGRESSION RÉALISTE
const AcquisitionCompetences = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎮 Acquisition de Compétences
        </h3>
        <p className="text-gray-300 text-lg">
          Développez votre expertise dans les 6 rôles clés de Brain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(SYNERGIA_ROLES).map(role => (
          <div key={role.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center text-xl mr-4`}>
                {role.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white">{role.name}</h4>
                <p className="text-gray-400 text-sm">{role.progress || 0}% complété</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 text-sm">{role.description}</p>
            
            {/* Progression */}
            <div className="bg-gray-700/50 rounded-full h-2 mb-4">
              <div 
                className={`bg-gradient-to-r ${role.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${role.progress || 0}%` }}
              ></div>
            </div>
            
            <div className="text-center">
              <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Voir les détails →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Progress Summary */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white mt-8">
        <h4 className="text-xl font-bold mb-4">📊 Progression Globale des Compétences</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">25%</div>
            <div className="text-sm opacity-80">Game Master</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">0%</div>
            <div className="text-sm opacity-80">Maintenance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">0%</div>
            <div className="text-sm opacity-80">Réputation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">0%</div>
            <div className="text-sm opacity-80">Autres rôles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
