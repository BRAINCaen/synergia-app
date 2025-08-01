// react-app/src/components/onboarding/OnboardingProgressTimeline.jsx

import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Star, 
  Calendar,
  Trophy,
  MapPin,
  Zap
} from 'lucide-react';
import { ONBOARDING_PHASES, ONBOARDING_BADGES } from '../../core/services/onboardingService';

const OnboardingProgressTimeline = ({ 
  onboardingData, 
  quests = [], 
  currentDay = 1,
  showDetails = true 
}) => {
  
  const getPhaseProgress = (phaseId) => {
    const phaseQuests = quests.filter(q => q.phase === phaseId);
    const completedQuests = phaseQuests.filter(q => q.status === 'completed');
    return {
      total: phaseQuests.length,
      completed: completedQuests.length,
      percentage: phaseQuests.length > 0 ? (completedQuests.length / phaseQuests.length) * 100 : 0
    };
  };

  const getPhaseStatus = (phaseId) => {
    if (!onboardingData) return 'locked';
    
    const phaseOrder = ['accueil', 'quiz_formation', 'escape_formation', 'autonomie'];
    const currentPhaseIndex = phaseOrder.indexOf(onboardingData.currentPhase);
    const thisPhaseIndex = phaseOrder.indexOf(phaseId);
    
    if (thisPhaseIndex < currentPhaseIndex) return 'completed';
    if (thisPhaseIndex === currentPhaseIndex) return 'current';
    return 'locked';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getEstimatedDate = (startDate, dayOffset) => {
    if (!startDate) return '';
    const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
    const estimated = new Date(start);
    estimated.setDate(estimated.getDate() + dayOffset);
    return estimated.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const PhaseCard = ({ phaseId, index }) => {
    const phase = ONBOARDING_PHASES[phaseId];
    const progress = getPhaseProgress(phaseId);
    const status = getPhaseStatus(phaseId);
    
    const getStatusColors = () => {
      switch (status) {
        case 'completed':
          return {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: 'text-green-600',
            progress: 'bg-green-500'
          };
        case 'current':
          return {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: 'text-blue-600',
            progress: 'bg-blue-500'
          };
        default:
          return {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            text: 'text-gray-600',
            icon: 'text-gray-400',
            progress: 'bg-gray-300'
          };
      }
    };

    const colors = getStatusColors();
    const phaseQuests = quests.filter(q => q.phase === phaseId);
    
    // Calculer les dates estimées
    let startDay, endDay;
    switch (phaseId) {
      case 'accueil':
        startDay = 1;
        endDay = 1;
        break;
      case 'quiz_formation':
        startDay = 2;
        endDay = 4;
        break;
      case 'escape_formation':
        startDay = 3;
        endDay = 15;
        break;
      case 'autonomie':
        startDay = 16;
        endDay = 45;
        break;
      default:
        startDay = 1;
        endDay = 1;
    }

    return (
      <div className="relative">
        {/* Ligne de connexion */}
        {index < Object.keys(ONBOARDING_PHASES).length - 1 && (
          <div 
            className={`absolute left-6 top-16 w-0.5 h-24 ${
              status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
            }`} 
          />
        )}
        
        <div className={`relative bg-white rounded-xl border-2 p-6 transition-all duration-300 ${colors.border} ${colors.bg}`}>
          {/* Status Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div 
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                status === 'completed' ? 'bg-green-100' : 
                status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              {status === 'completed' ? (
                <CheckCircle className={`w-6 h-6 ${colors.icon}`} />
              ) : status === 'current' ? (
                <Clock className={`w-6 h-6 ${colors.icon}`} />
              ) : phase.icon}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${colors.text}`}>
                {phase.name}
              </h3>
              <p className="text-sm text-gray-600">
                {phase.description}
              </p>
            </div>
          </div>

          {/* Progression */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression
              </span>
              <span className="text-sm text-gray-600">
                {progress.completed}/{progress.total} quêtes
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${colors.progress}`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            
            <div className="text-right mt-1">
              <span className={`text-sm font-semibold ${colors.text}`}>
                {Math.round(progress.percentage)}%
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>J{startDay}{endDay !== startDay ? `-J${endDay}` : ''}</span>
            </div>
            
            {onboardingData?.startDate && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {getEstimatedDate(onboardingData.startDate, startDay - 1)}
                  {endDay !== startDay && ` - ${getEstimatedDate(onboardingData.startDate, endDay - 1)}`}
                </span>
              </div>
            )}
          </div>

          {/* Badges à débloquer */}
          {showDetails && phaseQuests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Récompenses à débloquer :
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                {phaseQuests
                  .filter(q => q.badge && ONBOARDING_BADGES[q.badge])
                  .slice(0, 4) // Limiter à 4 badges par phase
                  .map(quest => {
                    const badge = ONBOARDING_BADGES[quest.badge];
                    const isEarned = quest.status === 'completed';
                    
                    return (
                      <div 
                        key={quest.id}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                          isEarned 
                            ? 'bg-yellow-50 border border-yellow-200' 
                            : 'bg-gray-50 border border-gray-200 opacity-60'
                        }`}
                      >
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                            isEarned ? '' : 'grayscale'
                          }`}
                          style={{ 
                            backgroundColor: isEarned ? `${badge.color}20` : '#f3f4f6'
                          }}
                        >
                          {badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium truncate ${
                            isEarned ? 'text-gray-800' : 'text-gray-500'
                          }`}>
                            {badge.name}
                          </div>
                        </div>
                        {isEarned && (
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* XP Total de la phase */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">
                  XP de la phase
                </span>
              </div>
              
              <div className="text-sm">
                <span className="font-bold text-yellow-600">
                  {phaseQuests
                    .filter(q => q.status === 'completed')
                    .reduce((total, q) => total + (q.xpReward || 0), 0)}
                </span>
                <span className="text-gray-500">
                  /{phaseQuests.reduce((total, q) => total + (q.xpReward || 0), 0)} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec progression globale */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Parcours d'Intégration Game Master
          </h2>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {onboardingData?.progressPercentage || 0}%
            </div>
            <div className="text-sm opacity-80">
              Progression globale
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Jour {currentDay}</span>
          </div>
          
          {onboardingData?.startDate && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Début : {formatDate(onboardingData.startDate)}</span>
            </div>
          )}
          
          {onboardingData?.estimatedCompletionDate && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Fin estimée : {formatDate(onboardingData.estimatedCompletionDate)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${onboardingData?.progressPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline des phases */}
      <div className="space-y-6">
        {Object.keys(ONBOARDING_PHASES).map((phaseId, index) => (
          <PhaseCard 
            key={phaseId} 
            phaseId={phaseId} 
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgressTimeline;
