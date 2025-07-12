// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE ONBOARDING ACTUALISÉE - FORMATION BRAIN + ACQUISITION COMPÉTENCES
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Trophy, 
  Star, 
  Award, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  BookOpen,
  Target,
  Users,
  Shield,
  Search,
  Settings,
  Heart,
  Flag,
  Calendar,
  Progress,
  Zap
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  OnboardingService, 
  ONBOARDING_PHASES, 
  ONBOARDING_QUESTS, 
  ONBOARDING_BADGES 
} from '../core/services/onboardingService.js';

// Import du nouveau composant d'acquisition de compétences
import SkillsAcquisition from '../components/onboarding/SkillsAcquisition.jsx';

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [stats, setStats] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeSection, setActiveSection] = useState('formation'); // 'formation' ou 'competences'

  // 📊 Charger les données d'onboarding
  const loadOnboardingData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const profile = await OnboardingService.getOnboardingProfile(user.uid);
      
      if (profile) {
        setOnboardingData(profile);
        setStats(OnboardingService.calculateStats(profile));
        setSelectedPhase(profile.phases.current);
      }
    } catch (error) {
      console.error('Erreur chargement onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Initialiser l'onboarding
  const initializeOnboarding = async () => {
    if (!user?.uid) return;
    
    try {
      setIsInitializing(true);
      await OnboardingService.createOnboardingProfile(user.uid, {
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        email: user.email || '',
        startDate: new Date().toISOString().split('T')[0],
        position: 'Game Master',
        department: 'Brain Escape & Quiz Game'
      });
      
      await loadOnboardingData();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (error) {
      console.error('Erreur initialisation onboarding:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  // ✅ Valider une quête
  const completeQuest = async (questId) => {
    if (!user?.uid) return;
    
    try {
      const result = await OnboardingService.completeQuest(user.uid, questId);
      
      if (result.success) {
        console.log(`✅ Quête ${questId} complétée! +${result.xpAwarded} XP`);
        await loadOnboardingData();
        
        // Animation de célébration
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    } catch (error) {
      console.error('Erreur validation quête:', error);
    }
  };

  // 🎨 Obtenir l'icône pour chaque phase
  const getPhaseIcon = (phaseId) => {
    const icons = {
      decouverte_brain: <Users className="w-8 h-8" />,
      parcours_client: <Target className="w-8 h-8" />,
      securite_procedures: <Shield className="w-8 h-8" />,
      formation_experience: <Search className="w-8 h-8" />,
      taches_quotidien: <Settings className="w-8 h-8" />,
      soft_skills: <Heart className="w-8 h-8" />,
      validation_finale: <Flag className="w-8 h-8" />
    };
    return icons[phaseId] || <BookOpen className="w-8 h-8" />;
  };

  // 🏆 Obtenir la couleur de rareté des badges
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-600 border-gray-200',
      uncommon: 'bg-green-100 text-green-600 border-green-200',
      rare: 'bg-blue-100 text-blue-600 border-blue-200',
      epic: 'bg-purple-100 text-purple-600 border-purple-200',
      legendary: 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[rarity] || colors.common;
  };

  useEffect(() => {
    loadOnboardingData();
  }, [user?.uid]);

  // 🎉 Animation de célébration
  const CelebrationOverlay = () => showCelebration && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-8 text-center animate-bounce">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 Félicitations !</h3>
        <p className="text-gray-600">Étape complétée avec succès !</p>
      </div>
    </div>
  );

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
              🧠 Parcours d'Intégration Brain Escape & Quiz Game
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bienvenue dans votre aventure d'intégration chez Brain ! 
              Un parcours gamifié de 1 mois pour devenir Game Master expert.
            </p>
          </div>

          {/* Initialisation */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🚀 Commencer votre formation Game Master
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Initialisez votre parcours personnalisé avec 7 phases de formation, 
              des quêtes motivantes et des badges de réussite !
            </p>
            
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Ce que vous allez apprendre :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-700">Découverte de Brain & équipe</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Parcours client expert</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Sécurité & procédures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-700">Maîtrise Escape & Quiz</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm text-gray-700">Tâches quotidiennes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-gray-700">Soft skills & communication</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={initializeOnboarding}
              disabled={isInitializing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 text-lg"
            >
              {isInitializing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Initialisation...
                </div>
              ) : (
                '🎮 Commencer l\'aventure Brain !'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPhase = ONBOARDING_PHASES[selectedPhase?.toUpperCase()];
  const availableQuests = Object.values(ONBOARDING_QUESTS).filter(quest => 
    onboardingData.quests.unlocked.includes(quest.id) && 
    !onboardingData.quests.completed.includes(quest.id)
  );
  const completedQuests = Object.values(ONBOARDING_QUESTS).filter(quest => 
    onboardingData.quests.completed.includes(quest.id)
  );

  return (
    <>
      <CelebrationOverlay />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header avec progression globale */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🧠 Mon Parcours Game Master Brain
            </h1>
            
            {stats && (
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-6">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{stats.progressPercent}%</div>
                    <div className="text-sm text-gray-600">Progression</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalXP}</div>
                    <div className="text-sm text-gray-600">XP Total</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{stats.questsCompleted}/{stats.totalQuests}</div>
                    <div className="text-sm text-gray-600">Quêtes</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600">{stats.badgesCount}</div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pink-600">{stats.daysActive}</div>
                    <div className="text-sm text-gray-600">Jours</div>
                  </div>
                </div>
                
                {/* Barre de progression globale */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stats.progressPercent}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Niveau {stats.currentLevel} • Prochaine étape: {currentPhase?.name}
                </div>
              </div>
            )}
          </div>

          {/* Navigation entre Formation et Acquisition de Compétences */}
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { 
                    id: 'formation', 
                    label: 'Formation Générale', 
                    icon: <BookOpen className="w-5 h-5" />,
                    description: 'Parcours d\'intégration par phases'
                  },
                  { 
                    id: 'competences', 
                    label: 'Acquisition de Compétences', 
                    icon: <Target className="w-5 h-5" />,
                    description: 'Maîtrise par expérience (Psychiatric, Prison, etc.)'
                  }
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`py-6 px-4 border-b-2 font-medium text-sm flex flex-col items-center space-y-2 min-w-[200px] ${
                      activeSection === section.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {section.icon}
                      <span className="font-semibold">{section.label}</span>
                    </div>
                    <span className="text-xs text-center opacity-75">{section.description}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu selon la section active */}
          {activeSection === 'formation' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sidebar - Phases de formation */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-purple-600" />
                    Phases de Formation
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.values(ONBOARDING_PHASES).sort((a, b) => a.order - b.order).map((phase) => {
                      const isCompleted = onboardingData.phases.completed.includes(phase.id);
                      const isCurrent = onboardingData.phases.current === phase.id;
                      const phaseQuests = Object.values(ONBOARDING_QUESTS).filter(q => q.phase === phase.id);
                      const completedPhaseQuests = phaseQuests.filter(q => onboardingData.quests.completed.includes(q.id));
                      const progress = phaseQuests.length > 0 ? (completedPhaseQuests.length / phaseQuests.length) * 100 : 0;
                      
                      return (
                        <div
                          key={phase.id}
                          onClick={() => setSelectedPhase(phase.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            isCurrent 
                              ? 'border-purple-500 bg-purple-50' 
                              : isCompleted 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCurrent 
                                  ? 'bg-purple-100 text-purple-600'
                                  : isCompleted 
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {isCompleted ? <CheckCircle className="w-5 h-5" /> : getPhaseIcon(phase.id)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 text-sm">{phase.name}</div>
                              <div className="text-xs text-gray-600">{phase.duration ? `${phase.duration} jours` : 'Illimité'}</div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">{phase.description}</div>
                          
                          {/* Barre de progression de la phase */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-green-500' : isCurrent ? 'bg-purple-500' : 'bg-gray-300'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {completedPhaseQuests.length}/{phaseQuests.length} quêtes
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Contenu principal - Quêtes */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Quêtes disponibles */}
                {availableQuests.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <PlayCircle className="w-6 h-6 mr-2 text-green-600" />
                      Quêtes Disponibles ({availableQuests.length})
                    </h3>
                    
                    <div className="grid gap-4">
                      {availableQuests
                        .sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0))
                        .map((quest) => (
                        <div key={quest.id} className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-800">{quest.title}</h4>
                                {quest.priority === 'high' && (
                                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                    Prioritaire
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{quest.description}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span>+{quest.xpReward} XP</span>
                                </div>
                                {quest.duration && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{quest.duration} min</span>
                                  </div>
                                )}
                                {quest.dayTarget && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Jour {quest.dayTarget}</span>
                                  </div>
                                )}
                                {quest.badge && (
                                  <div className="flex items-center space-x-1">
                                    <Award className="w-4 h-4 text-purple-500" />
                                    <span>Badge: {ONBOARDING_BADGES[quest.badge]?.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => completeQuest(quest.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium ml-4"
                            >
                              ✅ Valider
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quêtes complétées */}
                {completedQuests.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                      Quêtes Complétées ({completedQuests.length})
                    </h3>
                    
                    <div className="grid gap-3">
                      {completedQuests
                        .sort((a, b) => b.xpReward - a.xpReward)
                        .map((quest) => (
                        <div key={quest.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h4 className="font-medium text-gray-800">{quest.title}</h4>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">{quest.description}</p>
                              
                              <div className="flex items-center text-sm text-green-600">
                                <Star className="w-4 h-4 mr-1" />
                                +{quest.xpReward} XP gagné
                                {quest.badge && (
                                  <>
                                    <Award className="w-4 h-4 ml-4 mr-1" />
                                    Badge: {ONBOARDING_BADGES[quest.badge]?.name}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Badges obtenus */}
                {onboardingData.gamification.badgesEarned.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-yellow-600" />
                      Badges Obtenus ({onboardingData.gamification.badgesEarned.length})
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {onboardingData.gamification.badgesEarned.map((badgeId) => {
                        const badge = ONBOARDING_BADGES[badgeId];
                        if (!badge) return null;
                        
                        return (
                          <div 
                            key={badgeId} 
                            className={`text-center p-4 rounded-lg border-2 ${getRarityColor(badge.rarity)}`}
                          >
                            <div className="text-3xl mb-2">{badge.icon}</div>
                            <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                            <p className="text-xs opacity-75">{badge.description}</p>
                            <div className="mt-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium capitalize">
                                {badge.rarity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Aucune quête disponible */}
                {availableQuests.length === 0 && completedQuests.length === 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Aucune quête disponible
                    </h3>
                    <p className="text-gray-600">
                      Vos prochaines quêtes se déverrouilleront automatiquement selon votre progression.
                    </p>
                  </div>
                )}
              </div>
            </div>

          ) : (
            /* Section Acquisition de Compétences */
            <SkillsAcquisition />
          )}

          {/* Informations personnelles */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              Informations de Formation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="text-gray-900">{onboardingData.personalInfo.firstName} {onboardingData.personalInfo.lastName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                <div className="text-gray-900">{onboardingData.personalInfo.position}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <div className="text-gray-900">{new Date(onboardingData.personalInfo.startDate).toLocaleDateString('fr-FR')}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                <div className="text-gray-900">{onboardingData.personalInfo.department}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phase actuelle</label>
                <div className="text-gray-900">{currentPhase?.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progression globale</label>
                <div className="text-gray-900">{stats?.progressPercent}% complété</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingPage;
