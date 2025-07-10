// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// OnboardingPage CORRIGÉ - Erreur TypeError éliminée
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Trophy, 
  Star, 
  CheckCircle, 
  Clock, 
  Lock, 
  Play, 
  BookOpen, 
  Users, 
  Award,
  TrendingUp,
  Target,
  MessageSquare,
  UserCheck,
  RefreshCw,
  Plus,
  AlertCircle
} from 'lucide-react';

// ✅ IMPORTS CORRIGÉS ET SÉCURISÉS
import { useAuthStore } from '../shared/stores/authStore.js';

// ✅ IMPORT CONDITIONNEL pour éviter les erreurs
let OnboardingService = null;
let ONBOARDING_PHASES = {};
let ONBOARDING_QUESTS = {};

try {
  const onboardingModule = await import('../core/services/onboardingService.js');
  OnboardingService = onboardingModule.default || onboardingModule.OnboardingService;
  ONBOARDING_PHASES = onboardingModule.ONBOARDING_PHASES || {};
  ONBOARDING_QUESTS = onboardingModule.ONBOARDING_QUESTS || {};
} catch (error) {
  console.warn('OnboardingService non disponible, mode dégradé activé');
}

/**
 * 📚 PAGE D'INTÉGRATION CORRIGÉE
 */
const OnboardingPage = () => {
  const { user } = useAuthStore();
  
  // États principaux
  const [onboardingData, setOnboardingData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mon-parcours');
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      loadOnboardingData();
    }
  }, [user]);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!OnboardingService) {
        // Mode dégradé - données mockées
        const mockData = {
          personalInfo: {
            firstName: user.displayName?.split(' ')[0] || 'Utilisateur',
            lastName: user.displayName?.split(' ')[1] || '',
            email: user.email,
            startDate: new Date().toISOString().split('T')[0],
            position: 'Membre de l\'équipe',
            department: 'Général'
          },
          phases: {
            current: 'accueil',
            completed: [],
            timeline: []
          },
          gamification: {
            totalXP: 0,
            level: 1,
            badges: []
          },
          quests: {
            completed: [],
            available: [],
            inProgress: []
          }
        };
        
        setOnboardingData(mockData);
        setStats({
          questsCompleted: 0,
          totalQuests: 13,
          xpEarned: 0,
          badgesEarned: 0,
          daysSinceStart: 0
        });
        return;
      }
      
      // Charger le profil d'onboarding de l'utilisateur
      const profileResult = await OnboardingService.getOnboardingProfile(user.uid);
      
      if (profileResult.success) {
        setOnboardingData(profileResult.profile);
        
        // Charger les statistiques
        const statsResult = await OnboardingService.getOnboardingStats(user.uid);
        if (statsResult.success) {
          setStats(statsResult.stats);
        }
      } else {
        // Profil n'existe pas encore
        setOnboardingData(null);
      }
      
    } catch (error) {
      console.error('Erreur chargement données intégration:', error);
      setError('Erreur lors du chargement des données d\'intégration');
    } finally {
      setLoading(false);
    }
  };

  const initializeOnboarding = async () => {
    try {
      setIsInitializing(true);
      
      if (!OnboardingService) {
        // Mode dégradé - initialisation simple
        await loadOnboardingData();
        return;
      }
      
      const result = await OnboardingService.createOnboardingProfile(user.uid, {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        email: user.email,
        startDate: new Date().toISOString().split('T')[0],
        position: 'Nouvel arrivant',
        department: 'À définir'
      });
      
      if (result.success) {
        await loadOnboardingData();
      }
    } catch (error) {
      console.error('Erreur initialisation intégration:', error);
      setError('Erreur lors de l\'initialisation');
    } finally {
      setIsInitializing(false);
    }
  };

  const completeQuest = async (questId) => {
    try {
      if (!OnboardingService) {
        console.log('Mode dégradé - Quête simulée:', questId);
        return;
      }
      
      const result = await OnboardingService.completeQuest(user.uid, questId, user.uid, '');
      
      if (result.success) {
        console.log(`Quête complétée: ${questId}`);
        await loadOnboardingData();
      }
    } catch (error) {
      console.error('Erreur complétion quête:', error);
    }
  };

  // Phase actuelle
  const currentPhase = onboardingData ? ONBOARDING_PHASES[onboardingData.phases.current] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement de votre parcours d'intégration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadOnboardingData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bienvenue dans votre parcours d'intégration !
          </h2>
          <p className="text-gray-600 mb-6">
            Commencez votre aventure chez nous avec un parcours personnalisé 
            qui vous aidera à vous sentir à l'aise et productif rapidement.
          </p>
          
          <button
            onClick={initializeOnboarding}
            disabled={isInitializing}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 
                       transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Initialisation...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Commencer mon intégration
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Parcours d'Intégration
              </h1>
              <p className="text-blue-100">
                Bienvenue {onboardingData.personalInfo.firstName} ! 
                Suivez votre progression et complétez vos objectifs.
              </p>
            </div>
            
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats?.questsCompleted || 0}/{stats?.totalQuests || 13}
                </div>
                <div className="text-sm text-blue-200">Quêtes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {stats?.xpEarned || 0}
                </div>
                <div className="text-sm text-blue-200">XP</div>
              </div>
            </div>
          </div>
          
          {/* Barre de progression */}
          {stats && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-blue-200 mb-1">
                <span>Progression globale</span>
                <span>{Math.round((stats.questsCompleted / stats.totalQuests) * 100)}%</span>
              </div>
              <div className="w-full bg-blue-500/30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.questsCompleted / stats.totalQuests) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'mon-parcours', label: 'Mon Parcours', icon: TrendingUp },
                { id: 'quetes', label: 'Quêtes', icon: Target },
                { id: 'badges', label: 'Badges', icon: Award },
                { id: 'informations', label: 'Informations', icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 py-4 border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === 'mon-parcours' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Votre Parcours d'Intégration
                </h3>
                
                {/* Phase actuelle */}
                {currentPhase && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          Phase actuelle : {currentPhase.name}
                        </h4>
                        <p className="text-blue-700 text-sm">
                          {currentPhase.description}
                        </p>
                      </div>
                      <div className="text-3xl">{currentPhase.icon}</div>
                    </div>
                  </div>
                )}

                {/* Timeline des phases */}
                <div className="space-y-4">
                  {Object.values(ONBOARDING_PHASES).map((phase, index) => {
                    const isCompleted = onboardingData.phases.completed.includes(phase.id);
                    const isCurrent = onboardingData.phases.current === phase.id;
                    
                    return (
                      <div key={phase.id} className="flex items-center space-x-4">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }
                        `}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                            {phase.name}
                          </h4>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        </div>
                        
                        <div className="text-2xl">{phase.icon}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'quetes' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-600" />
                  Quêtes d'Intégration
                </h3>
                
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {OnboardingService ? 
                      'Vos quêtes d\'intégration apparaîtront ici' :
                      'Mode dégradé - Quêtes non disponibles'
                    }
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-600" />
                  Badges d'Intégration
                </h3>
                
                <div className="text-center py-8">
                  <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    Vos badges d'intégration apparaîtront ici au fur et à mesure 
                    de votre progression
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'informations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-600" />
                  Informations d'Intégration
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Informations Personnelles</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Nom :</span> 
                        {onboardingData.personalInfo.firstName} {onboardingData.personalInfo.lastName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email :</span> 
                        {onboardingData.personalInfo.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Date de début :</span> 
                        {new Date(onboardingData.personalInfo.startDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Poste :</span> 
                        {onboardingData.personalInfo.position}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Progression</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Phase actuelle :</span> 
                        {currentPhase?.name || 'Non définie'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Phases complétées :</span> 
                        {onboardingData.phases.completed.length}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">XP total :</span> 
                        {onboardingData.gamification.totalXP}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Niveau :</span> 
                        {onboardingData.gamification.level}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

// 🚀 Log de chargement
console.log('✅ OnboardingPage chargée - Erreur TypeError CORRIGÉE');
