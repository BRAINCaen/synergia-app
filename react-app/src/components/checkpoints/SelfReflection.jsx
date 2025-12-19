// ==========================================
// react-app/src/components/checkpoints/SelfReflection.jsx
// Formulaire d'auto-réflexion pour le checkpoint
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Save,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Heart,
  Mountain,
  Rocket,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { REFLECTION_QUESTIONS } from '../../core/services/checkpointService';

const QUESTION_ICONS = {
  proudest_moments: { icon: Sparkles, color: 'text-yellow-400', bg: 'from-yellow-500 to-orange-500' },
  learnings: { icon: Lightbulb, color: 'text-blue-400', bg: 'from-blue-500 to-cyan-500' },
  challenges: { icon: Mountain, color: 'text-red-400', bg: 'from-red-500 to-orange-500' },
  improvements: { icon: Rocket, color: 'text-purple-400', bg: 'from-purple-500 to-pink-500' },
  support_needed: { icon: HelpCircle, color: 'text-green-400', bg: 'from-green-500 to-emerald-500' }
};

const SelfReflection = ({
  initialAnswers = {},
  isCompleted = false,
  onSave,
  onComplete,
  isLoading = false
}) => {
  const [answers, setAnswers] = useState(initialAnswers);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Effacer l'erreur si l'utilisateur commence à taper
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateAnswers = () => {
    const newErrors = {};
    REFLECTION_QUESTIONS.forEach(q => {
      if (q.required && (!answers[q.id] || answers[q.id].trim().length < 10)) {
        newErrors[q.id] = 'Cette réponse est requise (minimum 10 caractères)';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (onSave) {
      await onSave(answers, false);
    }
  };

  const handleComplete = async () => {
    if (!validateAnswers()) {
      // Aller à la première question avec erreur
      const firstErrorIndex = REFLECTION_QUESTIONS.findIndex(q => errors[q.id]);
      if (firstErrorIndex >= 0) {
        setCurrentStep(firstErrorIndex);
      }
      return;
    }

    if (onComplete) {
      await onComplete(answers);
      setShowSuccess(true);
    }
  };

  const currentQuestion = REFLECTION_QUESTIONS[currentStep];
  const questionConfig = QUESTION_ICONS[currentQuestion?.id] || {
    icon: Brain,
    color: 'text-gray-400',
    bg: 'from-gray-500 to-gray-600'
  };
  const IconComponent = questionConfig.icon;

  const progress = ((currentStep + 1) / REFLECTION_QUESTIONS.length) * 100;

  // Mode affichage si déjà complété
  if (isCompleted && !showSuccess) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3 p-4 bg-green-500/20 rounded-xl border border-green-500/30">
          <CheckCircle size={24} className="text-green-400" />
          <div>
            <div className="font-medium text-green-300">Auto-réflexion complétée</div>
            <div className="text-sm text-green-400/80">+30 XP gagnés</div>
          </div>
        </div>

        {/* Afficher les réponses en lecture seule */}
        <div className="space-y-4">
          {REFLECTION_QUESTIONS.map((question) => {
            const config = QUESTION_ICONS[question.id] || { icon: Brain, color: 'text-gray-400' };
            const Icon = config.icon;

            return (
              <div key={question.id} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} className={config.color} />
                  <h4 className="font-medium text-white">{question.question}</h4>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {answers[question.id] || <span className="text-gray-500 italic">Non renseigné</span>}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Vue de succès après complétion
  if (showSuccess) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle size={40} className="text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Bravo !</h3>
        <p className="text-gray-400 mb-4">
          Ton auto-réflexion est terminée
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400">
          <Sparkles size={18} />
          <span className="font-medium">+30 XP</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header avec progression */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${questionConfig.bg} rounded-xl flex items-center justify-center`}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Auto-réflexion</h3>
            <p className="text-sm text-gray-400">
              Question {currentStep + 1} sur {REFLECTION_QUESTIONS.length}
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveDraft}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 text-sm transition-colors"
        >
          <Save size={16} />
          Sauvegarder
        </button>
      </div>

      {/* Barre de progression */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${questionConfig.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question actuelle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"
        >
          {/* Question */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-r ${questionConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <IconComponent size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-white mb-1">
                {currentQuestion.question}
                {currentQuestion.required && <span className="text-red-400 ml-1">*</span>}
              </h4>
              {!currentQuestion.required && (
                <span className="text-xs text-gray-500">Optionnel</span>
              )}
            </div>
          </div>

          {/* Zone de texte */}
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.placeholder}
            className={`w-full h-40 px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-none ${
              errors[currentQuestion.id]
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-gray-700 focus:ring-indigo-500/50 focus:border-indigo-500/50'
            }`}
          />

          {/* Erreur */}
          {errors[currentQuestion.id] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-2 text-red-400 text-sm"
            >
              <AlertCircle size={16} />
              {errors[currentQuestion.id]}
            </motion.div>
          )}

          {/* Compteur de caractères */}
          <div className="text-right mt-2 text-sm text-gray-500">
            {(answers[currentQuestion.id] || '').length} caractères
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentStep === 0
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
          <ChevronLeft size={18} />
          Précédent
        </button>

        {currentStep < REFLECTION_QUESTIONS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-lg text-white font-medium transition-all"
          >
            Suivant
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Envoi...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Terminer (+30 XP)
              </>
            )}
          </button>
        )}
      </div>

      {/* Points de navigation rapide */}
      <div className="flex items-center justify-center gap-2 pt-4">
        {REFLECTION_QUESTIONS.map((_, index) => {
          const questionId = REFLECTION_QUESTIONS[index].id;
          const hasAnswer = answers[questionId] && answers[questionId].trim().length > 0;
          const hasError = errors[questionId];

          return (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-indigo-500 w-6'
                  : hasError
                  ? 'bg-red-500'
                  : hasAnswer
                  ? 'bg-green-500'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default SelfReflection;
