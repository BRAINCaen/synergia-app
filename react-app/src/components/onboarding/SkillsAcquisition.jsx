// ==========================================
// 📁 react-app/src/components/onboarding/SkillsAcquisition.jsx
// COMPOSANT ACQUISITION DE COMPÉTENCES - CORRIGÉ
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  Clock, 
  Star, 
  Award,
  Users,
  Calendar,
  MessageSquare,
  AlertCircle,
  Zap,
  Trophy,
  Plus,
  RefreshCw
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import SkillsAcquisitionService, { 
  BRAIN_EXPERIENCES, 
  EXPERIENCE_SKILLS,
  WEEKLY_FOLLOW_UP_TEMPLATE 
} from '../../core/services/skillsAcquisitionService.js';

const SkillsAcquisition = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [skillsProfile, setSkillsProfile] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [stats, setStats] = useState(null);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [weeklyFollowUp, setWeeklyFollowUp] = useState(WEEKLY_FOLLOW_UP_TEMPLATE);
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // 🔄 Toggle une compétence
  const toggleSkill = useCallback(async (experienceId, skillId) => {
    if (!user?.uid) return;
    
    try {
      const result = await SkillsAcquisitionService.toggleSkill(
        user.uid, 
        experienceId, 
        skillId
      );
      
      if (result.success) {
        // Recharger seulement les données modifiées
        await loadSkillsData();
      }
    } catch (error) {
      console.error('❌ Erreur toggle skill:', error);
    }
  }, [user?.uid, loadSkillsData]); // 🔧 CORRECTION: Ajouter loadSkillsData aux dépendances

  // 📊 Charger les données de compétences
  const loadSkillsData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await SkillsAcquisitionService.getSkillsProfile(user.uid);
      
      if (result.success) {
        setSkillsProfile(result.data);
        // 🔧 CORRECTION: Utiliser le bon nom de méthode
        setStats(SkillsAcquisitionService.calculateProfileStats(result.data));
        
        // 🔧 CORRECTION: Définir l'expérience sélectionnée seulement si nécessaire
        if (!selectedExperience && result.data.experiences) {
          const firstExp = Object.keys(result.data.experiences)[0];
          if (firstExp) {
            setSelectedExperience(firstExp);
          }
        }
      } else {
        // 🔧 CORRECTION: Gérer le cas où le profil n'existe pas
        console.log('📝 Profil de compétences non trouvé');
        setSkillsProfile(null);
        setStats(null);
      }
    } catch (error) {
      console.error('❌ Erreur chargement compétences:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]); // 🔧 CORRECTION: Enlever selectedExperience des dépendances

  // 🚀 Initialiser le profil de compétences
  const initializeSkillsProfile = async (experienceIds) => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      // 🔧 CORRECTION: Utiliser le bon nom de méthode
      const result = await SkillsAcquisitionService.createSkillsProfile(user.uid, experienceIds);
      
      if (result.success) {
        await loadSkillsData();
      }
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Soumettre le suivi hebdomadaire
  const submitWeeklyFollowUp = async () => {
    if (!user?.uid || !selectedExperience) return;
    
    try {
      setSubmittingFollowUp(true);
      
      const result = await SkillsAcquisitionService.addWeeklyFollowUp(
        user.uid,
        selectedExperience,
        weeklyFollowUp
      );
      
      if (result.success) {
        setShowWeeklyModal(false);
        setWeeklyFollowUp(WEEKLY_FOLLOW_UP_TEMPLATE);
        await loadSkillsData();
      }
    } catch (error) {
      console.error('❌ Erreur soumission suivi:', error);
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  // 🔄 Charger les données au montage
  useEffect(() => {
    loadSkillsData();
  }, [loadSkillsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des compétences...</p>
        </div>
      </div>
    );
  }

  // Si aucun profil de compétences n'existe
  if (!skillsProfile) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-white mb-4">
          Acquisition de Compétences
        </h3>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Commencez votre parcours d'acquisition de compétences en sélectionnant les expériences 
          qui vous intéressent. Chaque expérience vous permettra de développer des compétences 
          spécifiques validées par votre équipe.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Object.entries(BRAIN_EXPERIENCES).map(([expId, experience]) => (
            <div 
              key={expId}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors"
            >
              <div className="text-3xl mb-4">{experience.icon}</div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {experience.name}
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                {experience.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{experience.duration}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  experience.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                  experience.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {experience.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => initializeSkillsProfile(['gamemaster', 'maintenance', 'reputation'])}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
        >
          <Plus className="h-5 w-5 mr-2" />
          Commencer l'acquisition de compétences
        </button>
      </div>
    );
  }

  const currentExperience = skillsProfile.experiences[selectedExperience];
  const currentSkills = selectedExperience ? EXPERIENCE_SKILLS[selectedExperience] : null;

  return (
    <div className="space-y-6">
      {/* 📊 Statistiques globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Expériences</p>
                <p className="text-2xl font-bold text-white">
                  {stats.completedExperiences}/{stats.totalExperiences}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Compétences</p>
                <p className="text-2xl font-bold text-white">
                  {stats.validatedSkills}/{stats.totalSkills}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Progression</p>
                <p className="text-2xl font-bold text-white">
                  {stats.averageCompletionRate}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Badges</p>
                <p className="text-2xl font-bold text-white">
                  {stats.badgesEarned}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Sélecteur d'expérience */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Mes Expériences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(skillsProfile.experiences).map(([expId, experience]) => {
            const expData = BRAIN_EXPERIENCES[expId.toUpperCase()];
            const isSelected = selectedExperience === expId;
            
            return (
              <button
                key={expId}
                onClick={() => setSelectedExperience(expId)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  isSelected 
                    ? 'bg-blue-900 border-blue-500 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{expData?.icon}</span>
                  {experience.completed && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <h4 className="font-semibold">{expData?.name}</h4>
                <p className="text-sm text-gray-400 mt-1">
                  {experience.completed ? 'Terminée' : 'En cours'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📋 Détail de l'expérience sélectionnée */}
      {selectedExperience && currentExperience && currentSkills && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              {BRAIN_EXPERIENCES[selectedExperience.toUpperCase()]?.name}
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowWeeklyModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Suivi hebdomadaire
              </button>
            </div>
          </div>

          {/* 🏆 Compétences par catégorie */}
          <div className="space-y-6">
            {Object.entries(currentSkills).map(([category, skills]) => (
              <div key={category} className="border border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-4 capitalize">
                  {category.replace('_', ' ')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.map((skill) => {
                    const skillStatus = currentExperience.skills[skill.id];
                    const isCompleted = skillStatus?.completed;
                    const isValidated = skillStatus?.validatedBy;
                    
                    return (
                      <div
                        key={skill.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isCompleted 
                            ? 'bg-green-900 border-green-500' 
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => toggleSkill(selectedExperience, skill.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                            ) : (
                              <div className="h-5 w-5 border-2 border-gray-400 rounded-full mr-3" />
                            )}
                            <div>
                              <p className="font-medium text-white text-sm">
                                {skill.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {skill.description}
                              </p>
                            </div>
                          </div>
                          {isValidated && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📝 Modal suivi hebdomadaire */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Suivi Hebdomadaire - {BRAIN_EXPERIENCES[selectedExperience?.toUpperCase()]?.name}
              </h3>
              <button
                onClick={() => setShowWeeklyModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Compétences techniques développées
                </label>
                <textarea
                  value={weeklyFollowUp.competences_techniques}
                  onChange={(e) => setWeeklyFollowUp({
                    ...weeklyFollowUp,
                    competences_techniques: e.target.value
                  })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Décrivez les compétences que vous avez développées cette semaine..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficultés rencontrées
                </label>
                <textarea
                  value={weeklyFollowUp.difficultes_rencontrees}
                  onChange={(e) => setWeeklyFollowUp({
                    ...weeklyFollowUp,
                    difficultes_rencontrees: e.target.value
                  })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Quelles difficultés avez-vous rencontrées ?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Situations marquantes
                </label>
                <textarea
                  value={weeklyFollowUp.situations_marquantes}
                  onChange={(e) => setWeeklyFollowUp({
                    ...weeklyFollowUp,
                    situations_marquantes: e.target.value
                  })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={3}
                  placeholder="Décrivez les situations les plus marquantes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Compétences à approfondir
                </label>
                <textarea
                  value={weeklyFollowUp.competences_approfondir}
                  onChange={(e) => setWeeklyFollowUp({
                    ...weeklyFollowUp,
                    competences_approfondir: e.target.value
                  })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={2}
                  placeholder="Sur quoi souhaitez-vous vous concentrer ?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Besoin d'aide
                </label>
                <textarea
                  value={weeklyFollowUp.besoin_aide}
                  onChange={(e) => setWeeklyFollowUp({
                    ...weeklyFollowUp,
                    besoin_aide: e.target.value
                  })}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  rows={2}
                  placeholder="Avez-vous besoin d'aide sur quelque chose ?"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWeeklyModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitWeeklyFollowUp}
                disabled={submittingFollowUp}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
              >
                {submittingFollowUp ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Soumettre
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsAcquisition;
