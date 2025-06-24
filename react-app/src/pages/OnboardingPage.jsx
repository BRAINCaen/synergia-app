// react-app/src/pages/OnboardingPage.jsx

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
import { useAuthStore } from '../core/stores/authStore';
import { onboardingService, ONBOARDING_PHASES, ONBOARDING_BADGES } from '../core/services/onboardingService';

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [onboardingData, setOnboardingData] = useState(null);
  const [allJourneys, setAllJourneys] = useState([]);
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
      
      // Charger le parcours de l'utilisateur actuel
      const journey = await onboardingService.getOnboardingJourney(user.uid);
      setOnboardingData(journey);
      
      // Si l'utilisateur est admin/mentor, charger tous les parcours
      if (user.role === 'admin' || user.role === 'mentor') {
        const allJourneysData = await onboardingService.getAllOnboardingJourneys();
        setAllJourneys(allJourneysData);
        
        const statsData = await onboardingService.getOnboardingStats();
        setStats(statsData);
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
      await onboardingService.createOnboardingJourney(user.uid, user.email);
      await loadOnboardingData();
    } catch (error) {
      console.error('Erreur initialisation intégration:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const startQuest = async (questId) => {
    try {
      await onboardingService.startQuest(user.uid, questId);
      await loadOnboardingData();
    } catch (error) {
      console.error('Erreur démarrage quête:', error);
    }
  };

  const completeQuest = async (questId, notes = '') => {
    try {
      const result = await onboardingService.completeQuest(user.uid, questId, user.uid, notes);
      
      if (result.success) {
        // Afficher notification de succès
        console.log('Quête complétée!', result);
      }
      
      await loadOnboardingData();
    } catch (error) {
      console.error('Erreur completion quête:', error);
    }
  };

  const getPhaseColor = (phaseId) => {
    return ONBOARDING_PHASES[phaseId]?.color || '#6B7280';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'available':
        return <Target className="w-5 h-5 text-yellow-500" />;
      default:
        return <Lock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`;
  };

  const QuestCard = ({ quest, onStart, onComplete }) => {
    const isLocked = quest.isLocked || quest.status === 'locked';
    const canStart = quest.status === 'available' && !isLocked;
    const canComplete = quest.status === 'in_progress';
    const isCompleted = quest.status === 'completed';

    return (
      <div className={`bg-white rounded-lg border-2 p-6 transition-all duration-200 ${
        isCompleted ? 'border-green-200 bg-green-50' :
        canStart ? 'border-blue-200 hover:border-blue-300' :
        canComplete ? 'border-yellow-200 bg-yellow-50' :
        'border-gray-200 opacity-60'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(quest.status)}
            <div>
              <h3 className={`font-semibold ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                {quest.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {quest.description}
              </p>
            </div>
          </div>
          
          {quest.badge && ONBOARDING_BADGES[quest.badge] && (
            <div className="text-2xl" title={ONBOARDING_BADGES[quest.badge].name}>
              {ONBOARDING_BADGES[quest.badge].icon}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{quest.xpReward} XP</span>
          </div>
          
          {quest.duration > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(quest.duration)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>J+{quest.dayTarget}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {canStart && (
            <button
              onClick={() => onStart(quest.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Commencer
            </button>
          )}
          
          {canComplete && (
            <button
              onClick={() => onComplete(quest.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Terminer
            </button>
          )}
          
          {isCompleted && (
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              ✓ Complétée
            </div>
          )}
          
          {isLocked && (
            <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
              🔒 Verrouillée
            </div>
          )}
        </div>
      </div>
    );
  };

  const PhaseProgress = ({ phase, quests }) => {
    const phaseData = ONBOARDING_PHASES[phase];
    const phaseQuests = quests.filter(q => q.phase === phase);
    const completedQuests = phaseQuests.filter(q => q.status === 'completed');
    const progress = phaseQuests.length > 0 ? (completedQuests.length / phaseQuests.length) * 100 : 0;

    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${phaseData.color}20` }}
          >
            {phaseData.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: phaseData.color }}>
              {phaseData.name}
            </h3>
            <p className="text-gray-600 text-sm">{phaseData.description}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: phaseData.color 
              }}
            />
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {completedQuests.length}/{phaseQuests.length} quêtes complétées
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du parcours d'intégration...</p>
        </div>
      </div>
    );
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Bienvenue dans l'équipe ! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Commençons votre parcours d'intégration en tant que Game Master
          </p>
          <button
            onClick={initializeOnboarding}
            disabled={isInitializing}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {isInitializing ? 'Initialisation...' : 'Commencer mon parcours'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Parcours d'Intégration Game Master
          </h1>
          <p className="text-gray-600">
            Votre voyage pour devenir un Game Master expert
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('mon-parcours')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'mon-parcours'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Mon Parcours
          </button>
          
          {(user?.role === 'admin' || user?.role === 'mentor') && (
            <>
              <button
                onClick={() => setActiveTab('tous-parcours')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'tous-parcours'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tous les Parcours
              </button>
              
              <button
                onClick={() => setActiveTab('statistiques')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'statistiques'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                Statistiques
              </button>
            </>
          )}
        </div>

        {/* Mon Parcours */}
        {activeTab === 'mon-parcours' && (
          <div className="space-y-6">
            {/* Vue d'ensemble */}
            <div className="bg-white rounded-lg border p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {onboardingData.progressPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Progression</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {onboardingData.totalXpEarned}
                  </div>
                  <div className="text-sm text-gray-600">XP Gagnés</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {onboardingData.totalBadgesEarned}
                  </div>
                  <div className="text-sm text-gray-600">Badges</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {onboardingData.completedQuests.length}
                  </div>
                  <div className="text-sm text-gray-600">Quêtes</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression globale</span>
                  <span>{onboardingData.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${onboardingData.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Progression par phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.keys(ONBOARDING_PHASES).map(phaseId => (
                <PhaseProgress 
                  key={phaseId} 
                  phase={phaseId} 
                  quests={onboardingData.quests || []} 
                />
              ))}
            </div>

            {/* Quêtes par phase */}
            {Object.keys(ONBOARDING_PHASES).map(phaseId => {
              const phaseQuests = (onboardingData.quests || []).filter(q => q.phase === phaseId);
              if (phaseQuests.length === 0) return null;

              const phaseData = ONBOARDING_PHASES[phaseId];
              
              return (
                <div key={phaseId} className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${phaseData.color}20` }}
                    >
                      {phaseData.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: phaseData.color }}>
                        {phaseData.name}
                      </h2>
                      <p className="text-gray-600 text-sm">{phaseData.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {phaseQuests.map(quest => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onStart={startQuest}
                        onComplete={completeQuest}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tous les Parcours (Admin/Mentor) */}
        {activeTab === 'tous-parcours' && (user?.role === 'admin' || user?.role === 'mentor') && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Tous les Parcours d'Intégration</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phase Actuelle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progression
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        XP Gagnés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Badges
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Début
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allJourneys.map(journey => (
                      <tr key={journey.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {journey.userEmail.split('@')[0]}
                              </div>
                              <div className="text-sm text-gray-500">
                                {journey.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            style={{ 
                              backgroundColor: `${getPhaseColor(journey.currentPhase)}20`,
                              color: getPhaseColor(journey.currentPhase)
                            }}
                          >
                            {ONBOARDING_PHASES[journey.currentPhase]?.name || journey.currentPhase}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${journey.progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900">
                              {journey.progressPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {journey.totalXpEarned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {journey.totalBadgesEarned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {journey.startDate?.toDate?.()?.toLocaleDateString('fr-FR') || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques (Admin/Mentor) */}
        {activeTab === 'statistiques' && stats && (user?.role === 'admin' || user?.role === 'mentor') && (
          <div className="space-y-6">
            {/* Vue d'ensemble */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalJourneys}
                </div>
                <div className="text-sm text-gray-600">Total Parcours</div>
              </div>
              
              <div className="bg-white rounded-lg border p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.activeJourneys}
                </div>
                <div className="text-sm text-gray-600">Parcours Actifs</div>
              </div>
              
              <div className="bg-white rounded-lg border p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.completedJourneys}
                </div>
                <div className="text-sm text-gray-600">Parcours Terminés</div>
              </div>
              
              <div className="bg-white rounded-lg border p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.round(stats.averageProgress)}%
                </div>
                <div className="text-sm text-gray-600">Progression Moyenne</div>
              </div>
            </div>

            {/* Distribution par phase */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Distribution par Phase
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(stats.phaseDistribution).map(([phase, count]) => {
                  const phaseData = ONBOARDING_PHASES[phase];
                  return (
                    <div key={phase} className="text-center p-4 rounded-lg border">
                      <div 
                        className="text-2xl mb-2"
                        style={{ color: phaseData?.color || '#6B7280' }}
                      >
                        {phaseData?.icon || '📊'}
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600">
                        {phaseData?.name || phase}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
