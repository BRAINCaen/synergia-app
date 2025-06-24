// react-app/src/components/onboarding/OnboardingQuestCard.jsx

import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Star, 
  Calendar, 
  User, 
  MessageSquare,
  Trophy,
  Target
} from 'lucide-react';
import { ONBOARDING_BADGES } from '../../core/services/onboardingService';

const OnboardingQuestCard = ({ 
  quest, 
  onStart, 
  onComplete, 
  onValidate,
  currentUser,
  canValidate = false 
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLocked = quest.isLocked || quest.status === 'locked';
  const canStart = quest.status === 'available' && !isLocked;
  const canComplete = quest.status === 'in_progress' && quest.autoValidation;
  const needsValidation = quest.status === 'in_progress' && !quest.autoValidation;
  const isCompleted = quest.status === 'completed';

  const getStatusInfo = () => {
    switch (quest.status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: 'Complétée',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'in_progress':
        return {
          icon: <Play className="w-5 h-5 text-blue-500" />,
          text: 'En cours',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'available':
        return {
          icon: <Target className="w-5 h-5 text-yellow-500" />,
          text: 'Disponible',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      default:
        return {
          icon: <Lock className="w-5 h-5 text-gray-400" />,
          text: 'Verrouillée',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-500'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const badge = quest.badge ? ONBOARDING_BADGES[quest.badge] : null;

  const handleComplete = async () => {
    if (quest.autoValidation) {
      setIsSubmitting(true);
      try {
        await onComplete(quest.id, notes);
      } finally {
        setIsSubmitting(false);
        setNotes('');
        setShowNotes(false);
      }
    } else {
      setShowNotes(true);
    }
  };

  const handleValidate = async () => {
    setIsSubmitting(true);
    try {
      await onValidate(quest.userId, quest.id, currentUser.uid, notes);
    } finally {
      setIsSubmitting(false);
      setNotes('');
      setShowNotes(false);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes === 0) return 'Variable';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`;
  };

  const getDayLabel = (dayTarget) => {
    if (dayTarget === 1) return "1er jour";
    return `J+${dayTarget}`;
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-6 transition-all duration-300 hover:shadow-lg ${
      statusInfo.borderColor
    } ${isLocked ? 'opacity-60' : ''}`}>
      
      {/* Header avec statut et badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {statusInfo.icon}
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${statusInfo.textColor}`}>
              {quest.title}
            </h3>
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
              {quest.description}
            </p>
          </div>
        </div>
        
        {badge && (
          <div className="ml-4 flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: `${badge.color}20`, border: `2px solid ${badge.color}40` }}
              title={badge.name}
            >
              {badge.icon}
            </div>
            <span className="text-xs text-gray-500 mt-1 text-center">
              {badge.name}
            </span>
          </div>
        )}
      </div>

      {/* Métadonnées */}
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold text-yellow-600">{quest.xpReward} XP</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(quest.duration)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{getDayLabel(quest.dayTarget)}</span>
        </div>

        {!quest.autoValidation && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Validation requise</span>
          </div>
        )}
      </div>

      {/* Barre de progression si en cours */}
      {quest.status === 'in_progress' && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progression</span>
            <span>{quest.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${quest.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Informations de completion */}
      {isCompleted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>Complétée le {quest.completedAt?.toDate?.()?.toLocaleDateString('fr-FR')}</span>
          </div>
          
          {quest.validatedBy && quest.validatedBy !== 'auto' && (
            <div className="text-sm text-green-600 mt-1">
              Validée par {quest.validatedBy}
            </div>
          )}
          
          {quest.notes && (
            <div className="text-sm text-gray-600 mt-2">
              <strong>Notes :</strong> {quest.notes}
            </div>
          )}
        </div>
      )}

      {/* Zone de notes pour validation */}
      {showNotes && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes et commentaires
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des commentaires sur cette quête..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {canStart && (
          <button
            onClick={() => onStart(quest.id)}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Commencer
          </button>
        )}
        
        {canComplete && (
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'Validation...' : 'Terminer'}
          </button>
        )}
        
        {needsValidation && !canValidate && (
          <div className="flex-1 px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium text-center">
            En attente de validation
          </div>
        )}
        
        {needsValidation && canValidate && (
          <>
            {!showNotes ? (
              <button
                onClick={() => setShowNotes(true)}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Valider
              </button>
            ) : (
              <div className="flex gap-2 flex-1">
                <button
                  onClick={() => setShowNotes(false)}
                  className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValidate}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  {isSubmitting ? 'Validation...' : 'Confirmer'}
                </button>
              </div>
            )}
          </>
        )}
        
        {isCompleted && (
          <div className="flex-1 px-4 py-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Complétée
          </div>
        )}
        
        {isLocked && (
          <div className="flex-1 px-4 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Verrouillée
          </div>
        )}
      </div>

      {/* Notes pour les quêtes non auto-validées */}
      {needsValidation && !showNotes && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          💡 Cette quête nécessite une validation par un mentor ou formateur
        </div>
      )}
    </div>
  );
};

export default OnboardingQuestCard;
