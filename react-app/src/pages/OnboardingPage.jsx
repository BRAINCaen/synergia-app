// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// PAGE D'ONBOARDING CORRIGÉE ET FONCTIONNELLE
// ==========================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../shared/stores/authStore.js';
import { 
  BookOpen, 
  Target, 
  Users, 
  Calendar,
  CheckCircle,
  Play,
  ArrowRight,
  Trophy,
  Star,
  Clock,
  MapPin,
  Gift,
  Zap
} from 'lucide-react';

/**
 * 🎯 ÉTAPES D'ONBOARDING
 */
const ONBOARDING_STEPS = [
  {
    id: 'bienvenue',
    number: 1,
    title: 'Bienvenue chez Synergia !',
    description: 'Découvrez votre nouvelle plateforme collaborative',
    icon: Gift,
    color: 'from-blue-500 to-purple-600',
    completed: true
  },
  {
    id: 'profil',
    number: 2,
    title: 'Complétez votre profil',
    description: 'Ajoutez vos informations personnelles et professionnelles',
    icon: Users,
    color: 'from-green-500 to-blue-500',
    completed: false
  },
  {
    id: 'equipe',
    number: 3,
    title: 'Découvrez votre équipe',
    description: 'Rencontrez vos collègues et collaborateurs',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    completed: false
  },
  {
    id: 'projets',
    number: 4,
    title: 'Explorez vos projets',
    description: 'Consultez vos missions et objectifs',
    icon: Target,
    color: 'from-orange-500 to-red-500',
    completed: false
  },
  {
    id: 'taches',
    number: 5,
    title: 'Gérez vos tâches',
    description: 'Organisez votre travail au quotidien',
    icon: CheckCircle,
    color: 'from-teal-500 to-green-500',
    completed: false
  },
  {
    id: 'gamification',
    number: 6,
    title: 'Système de points',
    description: 'Gagnez des points et débloquez des badges',
    icon: Trophy,
    color: 'from-yellow-500 to-orange-500',
    completed: false
  },
  {
    id: 'termine',
    number: 7,
    title: 'C\'est parti !',
    description: 'Vous êtes prêt à utiliser Synergia',
    icon: Star,
    color: 'from-pink-500 to-purple-500',
    completed: false
  }
];

/**
 * 🎯 COMPOSANT ÉTAPE INDIVIDUELLE
 */
const StepCard = ({ step, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        isActive
          ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-105 border-transparent`
          : step.completed
          ? 'bg-green-500/20 border-green-400/50 text-green-300 hover:bg-green-500/30'
          : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50'
      }`}
    >
      {/* Badge numéro */}
      <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        step.completed
          ? 'bg-green-500 text-white'
          : isActive
          ? 'bg-white text-gray-900'
          : 'bg-gray-600 text-gray-300'
      }`}>
        {step.completed ? '✓' : step.number}
      </div>

      {/* Icône */}
      <div className="flex items-center mb-4">
        <div className={`p-3 rounded-lg ${
          isActive 
            ? 'bg-white/20' 
            : step.completed 
            ? 'bg-green-500/30' 
            : 'bg-gray-700'
        }`}>
          <step.icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <h3 className="font-bold text-lg">{step.title}</h3>
          {step.completed && (
            <div className="flex items-center text-sm text-green-400">
              <CheckCircle className="h-4 w-4 mr-1" />
              Terminé
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className={`text-sm ${
        isActive ? 'text-white/90' : step.completed ? 'text-green-300' : 'text-gray-400'
      }`}>
        {step.description}
      </p>

      {/* Indicateur progression */}
      {isActive && (
        <div className="mt-4 flex items-center text-sm font-medium">
          <Play className="h-4 w-4 mr-2" />
          Étape en cours
        </div>
      )}
    </div>
  );
};

/**
 * 🎯 CONTENU DES ÉTAPES
 */
const StepContent = ({ activeStep }) => {
  const renderStepContent = () => {
    switch (activeStep.id) {
      case 'bienvenue':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Bienvenue dans Synergia v3.5 !
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Nous sommes ravis de vous accueillir dans votre nouvelle plateforme collaborative. 
              Ce guide va vous accompagner pour découvrir toutes les fonctionnalités et devenir 
              rapidement autonome.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-6">
                <Zap className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Productivité</h4>
                <p className="text-blue-300 text-sm">
                  Optimisez votre organisation avec nos outils avancés
                </p>
              </div>
              
              <div className="bg-purple-500/20 border border-purple-400/50 rounded-lg p-6">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Collaboration</h4>
                <p className="text-purple-300 text-sm">
                  Travaillez en équipe de manière fluide et efficace
                </p>
              </div>
              
              <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-6">
                <Trophy className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Gamification</h4>
                <p className="text-green-300 text-sm">
                  Gagnez des points et débloquez des récompenses
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/30">
              <p className="text-blue-300 font-medium">
                💡 Astuce : Prenez votre temps pour explorer chaque section. 
                Vous pourrez revenir à ce guide à tout moment !
              </p>
            </div>
          </div>
        );

      case 'profil':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Complétez votre profil
              </h2>
              <p className="text-gray-300 text-lg">
                Ajoutez vos informations pour personnaliser votre expérience
              </p>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">À compléter :</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                    <span className="text-gray-300">Photo de profil</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Ajouter →
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                    <span className="text-gray-300">Poste et département</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Modifier →
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <span className="text-gray-300">Informations de contact</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">✓ Terminé</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium">
                  Aller au profil
                </button>
              </div>
            </div>
          </div>
        );

      case 'equipe':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Découvrez votre équipe
              </h2>
              <p className="text-gray-300 text-lg">
                Connectez-vous avec vos collègues et collaborateurs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  Mon équipe directe
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      JD
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-medium">John Doe</div>
                      <div className="text-gray-400 text-sm">Chef d'équipe</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      MS
                    </div>
                    <div className="ml-3">
                      <div className="text-white font-medium">Marie Smith</div>
                      <div className="text-gray-400 text-sm">Développeuse</div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Voir toute l'équipe →
                </button>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-400" />
                  Autres départements
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-white font-medium">Marketing</div>
                    <div className="text-gray-400 text-sm">8 personnes</div>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-white font-medium">Ventes</div>
                    <div className="text-gray-400 text-sm">12 personnes</div>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-white font-medium">Support</div>
                    <div className="text-gray-400 text-sm">6 personnes</div>
                  </div>
                </div>
                
                <button className="w-full mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">
                  Explorer l'annuaire →
                </button>
              </div>
            </div>
          </div>
        );

      case 'termine':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Félicitations ! Vous êtes prêt·e !
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Vous avez terminé votre parcours d'onboarding. 
              Vous pouvez maintenant utiliser Synergia en toute autonomie !
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-400" />
                  Ressources utiles
                </h4>
                <ul className="text-left space-y-2 text-blue-300 text-sm">
                  <li>• Guide utilisateur complet</li>
                  <li>• FAQ et questions courantes</li>
                  <li>• Tutoriels vidéo</li>
                  <li>• Support technique</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/50 rounded-lg p-6">
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-400" />
                  Prochaines étapes
                </h4>
                <ul className="text-left space-y-2 text-green-300 text-sm">
                  <li>• Consulter vos premières tâches</li>
                  <li>• Rejoindre vos projets</li>
                  <li>• Configurer vos notifications</li>
                  <li>• Explorer la gamification</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                Commencer à utiliser Synergia →
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-6">{activeStep.icon && <activeStep.icon />}</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {activeStep.title}
            </h2>
            <p className="text-gray-300 text-lg">
              {activeStep.description}
            </p>
            <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700/50 rounded-lg">
              <p className="text-gray-400">
                Contenu de cette étape en cours de développement...
              </p>
              <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium">
                Passer à l'étape suivante →
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
      {renderStepContent()}
    </div>
  );
};

/**
 * 🎯 COMPOSANT PRINCIPAL
 */
const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([0]); // Première étape complétée par défaut

  const activeStep = ONBOARDING_STEPS[activeStepIndex];

  const handleStepClick = (stepIndex) => {
    setActiveStepIndex(stepIndex);
  };

  const handleNextStep = () => {
    if (activeStepIndex < ONBOARDING_STEPS.length - 1) {
      const nextIndex = activeStepIndex + 1;
      setActiveStepIndex(nextIndex);
      if (!completedSteps.includes(nextIndex)) {
        setCompletedSteps([...completedSteps, nextIndex]);
      }
    }
  };

  const handlePreviousStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            🎯 Parcours d'Intégration
          </h1>
          <p className="text-gray-400 text-lg">
            Étape {activeStep.number} sur {ONBOARDING_STEPS.length} : {activeStep.title}
          </p>
          
          {/* Barre de progression */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((activeStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Début</span>
              <span>{Math.round(((activeStepIndex + 1) / ONBOARDING_STEPS.length) * 100)}%</span>
              <span>Terminé</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des étapes (sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Étapes du parcours</h3>
              <div className="space-y-3">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      index === activeStepIndex
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50'
                        : completedSteps.includes(index)
                        ? 'bg-green-500/20 border border-green-400/30 hover:bg-green-500/30'
                        : 'bg-gray-700/30 hover:bg-gray-600/40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                      completedSteps.includes(index)
                        ? 'bg-green-500 text-white'
                        : index === activeStepIndex
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {completedSteps.includes(index) ? '✓' : step.number}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        index === activeStepIndex
                          ? 'text-white'
                          : completedSteps.includes(index)
                          ? 'text-green-300'
                          : 'text-gray-300'
                      }`}>
                        {step.title}
                      </div>
                      {index === activeStepIndex && (
                        <div className="text-xs text-blue-300 mt-1">En cours...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu de l'étape active */}
          <div className="lg:col-span-2">
            <StepContent activeStep={activeStep} />
            
            {/* Boutons de navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePreviousStep}
                disabled={activeStepIndex === 0}
                className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeStepIndex === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                ← Étape précédente
              </button>

              <div className="text-gray-400 text-sm">
                Étape {activeStep.number} / {ONBOARDING_STEPS.length}
              </div>

              <button
                onClick={handleNextStep}
                disabled={activeStepIndex === ONBOARDING_STEPS.length - 1}
                className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeStepIndex === ONBOARDING_STEPS.length - 1
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                }`}
              >
                {activeStepIndex === ONBOARDING_STEPS.length - 1 
                  ? 'Commencer →' 
                  : 'Étape suivante →'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <p className="text-gray-400 text-sm">
            💡 <strong>Astuce :</strong> Vous pouvez revenir à ce guide d'intégration à tout moment 
            depuis le menu principal. N'hésitez pas à prendre votre temps !
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
