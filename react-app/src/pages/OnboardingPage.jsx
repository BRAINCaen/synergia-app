// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// OnboardingPage CORRIGÉ - Import Firebase réparé
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
  UserCheck
} from 'lucide-react';

// ✅ CORRECTION : Import depuis le bon chemin
import { useAuthStore } from '../shared/stores/authStore';
import { OnboardingService, ONBOARDING_PHASES, ONBOARDING_QUESTS } from '../core/services/onboardingService';

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [onboardingData, setOnboardingData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mon-parcours');
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (user) {
      loadOnboardingData();
    }
  }, [user]);

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };

  const initializeOnboarding = async () => {
    try {
      setIsInitializing(true);
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
    } finally {
      setIsInitializing(false);
    }
  };

  const completeQuest = async (questId) => {
    try {
      const result = await OnboardingService.completeQuest(user.uid, questId, user.uid, '');
      
      if (result.success) {
        // Afficher notification de succès
        console.log(`Quête complétée! +${result.xpAwarded} XP`);
        await loadOnboardingData();
      }
    } catch (error) {
      console.error('Erreur validation quête:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">Chargement de votre parcours d'intégration...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎯 Parcours d'Intégration Synergia
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bienvenue ! Commencez votre aventure d'intégration avec notre système de quêtes gamifié.
            </p>
          </div>

          {/* Initialisation */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Créer votre profil d'intégration
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Initialisez votre parcours personnalisé d'intégration avec des quêtes, badges et récompenses.
            </p>
            
            <button
              onClick={initializeOnboarding}
              disabled={isInitializing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              {isInitializing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Initialisation...
                </div>
              ) : (
                '🚀 Commencer l\'aventure'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPhase = ONBOARDING_PHASES[onboardingData.phases.current.toUpperCase()];
  const availableQuests = Object.values(ONBOARDING_QUESTS).filter(quest => 
    onboardingData.quests.unlocked.includes(quest.id) && 
    !onboardingData.quests.completed.includes(quest.id)
  );
  const completedQuests = Object.values(ONBOARDING_QUESTS).filter(quest => 
    onboardingData.quests.completed.includes(quest.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header avec progression */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎯 Mon Parcours d'Intégration
          </h1>
          
          {stats && (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.progressPercent}%</div>
                  <div className="text-sm text-gray-600">Progression</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalXP}</div>
                  <div className="text-sm text-gray-600">XP Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.questsCompleted}</div>
                  <div className="text-sm text-gray-600">Quêtes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stats.badgesCount}</div>
                  <div className="text-sm text-gray-600">Badges</div>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phase actuelle */}
        {currentPhase && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4"
                style={{ backgroundColor: currentPhase.color + '20', color: currentPhase.color }}
              >
                {currentPhase.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Phase Actuelle : {currentPhase.name}
                </h2>
                <p className="text-gray-600">{currentPhase.description}</p>
              </div>
            </div>
            
            {currentPhase.duration && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  📅 Durée estimée : {currentPhase.duration} jour(s)
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Quêtes disponibles */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-600" />
              Quêtes Disponibles ({availableQuests.length})
            </h3>
            
            <div className="space-y-4">
              {availableQuests.map((quest) => (
                <div key={quest.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{quest.title}</h4>
                    <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <Star className="w-4 h-4 mr-1" />
                      {quest.xpReward} XP
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{quest.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {quest.duration} min
                    </div>
                    
                    <button
                      onClick={() => completeQuest(quest.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-1 inline" />
                      Valider
                    </button>
                  </div>
                </div>
              ))}
              
              {availableQuests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune quête disponible pour le moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Quêtes complétées */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-green-600" />
              Quêtes Complétées ({completedQuests.length})
            </h3>
            
            <div className="space-y-3">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{quest.title}</h4>
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Terminée
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{quest.description}</p>
                  
                  <div className="flex items-center text-sm text-green-600">
                    <Star className="w-4 h-4 mr-1" />
                    +{quest.xpReward} XP earned
                    {quest.badge && (
                      <>
                        <Award className="w-4 h-4 ml-4 mr-1" />
                        Badge: {quest.badge}
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {completedQuests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucune quête complétée</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges obtenus */}
        {onboardingData.gamification.badgesEarned.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-600" />
              Badges Obtenus ({onboardingData.gamification.badgesEarned.length})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {onboardingData.gamification.badgesEarned.map((badge, index) => (
                <div key={index} className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="font-medium text-gray-800 capitalize">{badge.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informations personnelles */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <User className="w-6 h-6 mr-2 text-purple-600" />
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

      </div>
    </div>
  );
};

export default OnboardingPage;

// 🚀 Log de chargement
console.log('✅ OnboardingPage chargée - Import Firebase corrigé');
