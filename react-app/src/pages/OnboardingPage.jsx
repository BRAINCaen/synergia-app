// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// OnboardingPage CORRIGÉ - Import authStore fix
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
// 🚀 CORRECTION: Import depuis shared/stores au lieu de core/stores
import { useAuthStore } from '../shared/stores/authStore';
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
        await loadOnboardingData();
      }
    } catch (error) {
      console.error('Erreur complétion quête:', error);
    }
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      'accueil': '🎯',
      'quiz_formation': '❓',
      'escape_formation': '🔓',
      'autonomie': '⭐',
      'completed': '🏆'
    };
    return icons[phase] || '📚';
  };

  const getPhaseColor = (phase) => {
    const colors = {
      'accueil': '#3B82F6',
      'quiz_formation': '#8B5CF6',
      'escape_formation': '#F59E0B',
      'autonomie': '#10B981',
      'completed': '#EF4444'
    };
    return colors[phase] || '#6B7280';
  };

  const getQuestStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'in_progress': return <Clock className="text-blue-500" size={20} />;
      case 'locked': return <Lock className="text-gray-400" size={20} />;
      default: return <Play className="text-gray-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-lg text-gray-600">Chargement du parcours d'intégration...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si aucun parcours d'intégration n'existe
  if (!onboardingData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <span className="text-6xl block mb-4">🚀</span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue dans votre parcours d'intégration !
              </h1>
              <p className="text-gray-600 text-lg">
                Commencez votre aventure avec nous et découvrez tout ce que nous avons à offrir.
              </p>
            </div>
            
            <button
              onClick={initializeOnboarding}
              disabled={isInitializing}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isInitializing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Initialisation...
                </span>
              ) : (
                'Commencer mon parcours'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parcours d'Intégration
          </h1>
          <p className="text-gray-600">
            Suivez votre progression et débloquez de nouvelles compétences
          </p>
        </div>

        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'mon-parcours', label: 'Mon Parcours', icon: User },
                { key: 'equipe', label: 'Équipe', icon: Users, adminOnly: true },
                { key: 'statistiques', label: 'Statistiques', icon: TrendingUp, adminOnly: true }
              ].map((tab) => {
                // Masquer les onglets admin si l'utilisateur n'est pas admin/mentor
                if (tab.adminOnly && user?.role !== 'admin' && user?.role !== 'mentor') {
                  return null;
                }

                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'mon-parcours' && (
          <div className="space-y-6">
            {/* Progression générale */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Votre Progression
                </h2>
                <span className="text-2xl">
                  {getPhaseIcon(onboardingData.currentPhase)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {onboardingData.progressPercentage}%
                  </div>
                  <div className="text-sm text-gray-600">Progression globale</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {onboardingData.totalXpEarned || 0}
                  </div>
                  <div className="text-sm text-gray-600">XP gagnés</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {onboardingData.totalBadgesEarned || 0}
                  </div>
                  <div className="text-sm text-gray-600">Badges obtenus</div>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${onboardingData.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quêtes du jour */}
            {onboardingData.currentQuests && onboardingData.currentQuests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quêtes Disponibles
                </h2>
                
                <div className="space-y-4">
                  {onboardingData.currentQuests.map((quest) => (
                    <div 
                      key={quest.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getQuestStatusIcon(quest.status)}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {quest.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {quest.description}
                            </p>
                            {quest.xpReward && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                                +{quest.xpReward} XP
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {quest.status === 'available' && (
                            <button
                              onClick={() => startQuest(quest.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Commencer
                            </button>
                          )}
                          
                          {quest.status === 'in_progress' && (
                            <button
                              onClick={() => completeQuest(quest.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Terminer
                            </button>
                          )}
                          
                          {quest.status === 'completed' && (
                            <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                              Terminé
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Équipe (Admin/Mentor uniquement) */}
        {activeTab === 'equipe' && (user?.role === 'admin' || user?.role === 'mentor') && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Parcours de l'Équipe
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phase Actuelle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progression
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        XP Total
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
                    {allJourneys.map((journey) => (
                      <tr key={journey.userId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="text-gray-500" size={20} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {journey.memberName || journey.userId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {journey.memberEmail}
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

        {/* Onglet Statistiques (Admin/Mentor uniquement) */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
