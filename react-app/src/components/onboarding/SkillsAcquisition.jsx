// ==========================================
// 📁 react-app/src/components/onboarding/SkillsAcquisition.jsx
// COMPOSANT ACQUISITION DE COMPÉTENCES - NAVIGATION STABILISÉE
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  Calendar, 
  MessageSquare, 
  Award, 
  BookOpen,
  Target,
  Clock,
  FileText,
  Star,
  TrendingUp,
  Users,
  Shield,
  Eye,
  Settings,
  Heart,
  Zap
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { 
  SkillsAcquisitionService, 
  BRAIN_EXPERIENCES, 
  EXPERIENCE_SKILLS, 
  EXPERIENCE_BADGES,
  WEEKLY_FOLLOW_UP_TEMPLATE 
} from '../../core/services/skillsAcquisitionService.js';

const SkillsAcquisition = () => {
  const { user } = useAuthStore();
  const [skillsProfile, setSkillsProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');
  const [stats, setStats] = useState(null);
  const [showWeeklyForm, setShowWeeklyForm] = useState(false);
  const [weeklyFormData, setWeeklyFormData] = useState(WEEKLY_FOLLOW_UP_TEMPLATE);

  // 🔧 CORRECTION: Fonction stable pour changer d'expérience
  const handleExperienceChange = useCallback((experienceId) => {
    console.log('🎯 Changement d\'expérience vers:', experienceId);
    setSelectedExperience(experienceId);
    setActiveTab('skills'); // Reset de l'onglet actif
  }, []);

  // 🔧 CORRECTION: Empêcher les changements d'état pendant les renders
  const handleSkillToggle = useCallback(async (experienceId, skillId) => {
    if (!user?.uid) return;
    
    try {
      console.log('🔄 Toggle skill:', skillId, 'pour expérience:', experienceId);
      
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
  }, [user?.uid]);

  // 📊 Charger les données de compétences
  const loadSkillsData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await SkillsAcquisitionService.getSkillsProfile(user.uid);
      
      if (result.success) {
        setSkillsProfile(result.data);
        setStats(SkillsAcquisitionService.calculateStats(result.data));
        
        // 🔧 CORRECTION: Définir l'expérience sélectionnée seulement si nécessaire
        if (!selectedExperience && result.data.experiences) {
          const firstExp = Object.keys(result.data.experiences)[0];
          if (firstExp) {
            setSelectedExperience(firstExp);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement compétences:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, selectedExperience]);

  // 🚀 Initialiser le profil de compétences
  const initializeSkillsProfile = async (experienceIds) => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await SkillsAcquisitionService.initializeProfile(user.uid, experienceIds);
      
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
      const result = await SkillsAcquisitionService.submitWeeklyFollowUp(
        user.uid,
        selectedExperience,
        weeklyFormData
      );
      
      if (result.success) {
        setShowWeeklyForm(false);
        setWeeklyFormData(WEEKLY_FOLLOW_UP_TEMPLATE);
        await loadSkillsData();
      }
    } catch (error) {
      console.error('Erreur soumission suivi:', error);
    }
  };

  // 🎨 Obtenir l'icône pour chaque catégorie
  const getCategoryIcon = (category) => {
    const icons = {
      knowledge: <BookOpen className="w-5 h-5" />,
      technical: <Settings className="w-5 h-5" />,
      safety: <Shield className="w-5 h-5" />,
      soft_skills: <Heart className="w-5 h-5" />,
      practice: <Target className="w-5 h-5" />,
      validation: <Award className="w-5 h-5" />
    };
    return icons[category] || <Circle className="w-5 h-5" />;
  };

  // 🎨 Obtenir la couleur pour chaque catégorie
  const getCategoryColor = (category) => {
    const colors = {
      knowledge: 'bg-blue-100 text-blue-600 border-blue-200',
      technical: 'bg-gray-100 text-gray-600 border-gray-200',
      safety: 'bg-red-100 text-red-600 border-red-200',
      soft_skills: 'bg-pink-100 text-pink-600 border-pink-200',
      practice: 'bg-green-100 text-green-600 border-green-200',
      validation: 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // 📊 Calculer le taux de completion par catégorie
  const getCategoryProgress = (experienceId, categoryName) => {
    if (!skillsProfile?.experiences[experienceId]) return { completed: 0, total: 0, percentage: 0 };
    
    const experience = skillsProfile.experiences[experienceId];
    const categorySkills = EXPERIENCE_SKILLS[experienceId]?.[categoryName] || [];
    
    const completed = categorySkills.filter(skill => 
      experience.skills[skill.id]?.completed
    ).length;
    
    const total = categorySkills.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  useEffect(() => {
    loadSkillsData();
  }, [loadSkillsData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Chargement des compétences...</span>
      </div>
    );
  }

  if (!skillsProfile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-purple-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Acquisition de Compétences par Expérience
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Choisissez les expériences Brain que vous souhaitez maîtriser pour commencer votre parcours d'acquisition de compétences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Object.values(BRAIN_EXPERIENCES).map((exp) => (
            <div key={exp.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-2xl">{exp.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-800">{exp.name}</h4>
                  <p className="text-sm text-gray-600">{exp.difficulty}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{exp.description}</p>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => initializeSkillsProfile(['psychiatric', 'prison', 'back_to_80s', 'quiz_game'])}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          🚀 Commencer l'Acquisition de Compétences
        </button>
      </div>
    );
  }

  const experience = skillsProfile.experiences[selectedExperience];
  const experienceData = BRAIN_EXPERIENCES[selectedExperience?.toUpperCase()];

  return (
    <div className="space-y-6">
      
      {/* Header avec statistiques */}
      {stats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Award className="w-8 h-8 mr-3 text-purple-600" />
            Acquisition de Compétences Brain
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.completedExperiences}/{stats.totalExperiences}</div>
              <div className="text-sm text-gray-600">Expériences</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.validatedSkills}/{stats.totalSkills}</div>
              <div className="text-sm text-gray-600">Compétences</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.averageCompletionRate}%</div>
              <div className="text-sm text-gray-600">Progression</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.badgesEarned}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar - Sélection d'expérience */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Expériences Brain</h3>
            
            <div className="space-y-3">
              {Object.keys(skillsProfile.experiences).map((expId) => {
                const exp = BRAIN_EXPERIENCES[expId.toUpperCase()];
                const expData = skillsProfile.experiences[expId];
                const isSelected = selectedExperience === expId;
                
                if (!exp) return null;
                
                return (
                  <button
                    key={expId}
                    onClick={() => handleExperienceChange(expId)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{exp.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{exp.name}</h4>
                        <p className="text-xs text-gray-600">{exp.difficulty}</p>
                        
                        {/* Barre de progression */}
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ 
                                width: `${((expData.completedSkills || 0) / (expData.totalSkills || 1)) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {expData.completedSkills || 0}/{expData.totalSkills || 0} compétences
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {selectedExperience && experienceData && (
            <div className="bg-white rounded-xl shadow-lg">
              
              {/* Header de l'expérience */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{experienceData.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{experienceData.name}</h2>
                    <p className="text-gray-600">{experienceData.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor('knowledge')}`}>
                        {experienceData.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        Sessions minimum: {experienceData.minSessions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation des onglets */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-6 px-6">
                  {[
                    { id: 'skills', label: 'Compétences', icon: <Target className="w-4 h-4" /> },
                    { id: 'progress', label: 'Progression', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'badges', label: 'Badges', icon: <Award className="w-4 h-4" /> },
                    { id: 'follow-up', label: 'Suivi', icon: <Calendar className="w-4 h-4" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Contenu des onglets */}
              <div className="p-6">
                
                {/* Onglet Compétences */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    {Object.entries(EXPERIENCE_SKILLS[selectedExperience] || {}).map(([categoryName, skills]) => {
                      const progress = getCategoryProgress(selectedExperience, categoryName);
                      
                      return (
                        <div key={categoryName} className="border border-gray-200 rounded-lg p-4">
                          
                          {/* Header de catégorie */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {getCategoryIcon(skills[0]?.category)}
                              <h3 className="text-lg font-semibold text-gray-800 capitalize">
                                {categoryName.replace('_', ' ')}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(skills[0]?.category)}`}>
                                {progress.completed}/{progress.total}
                              </span>
                            </div>
                            
                            {/* Barre de progression de catégorie */}
                            <div className="flex items-center space-x-2">
                              <div className="bg-gray-200 rounded-full h-2 w-24">
                                <div 
                                  className="bg-purple-500 h-2 rounded-full transition-all"
                                  style={{ width: `${progress.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{progress.percentage}%</span>
                            </div>
                          </div>
                          
                          {/* Liste des compétences */}
                          <div className="space-y-2">
                            {skills.map((skill) => {
                              const isCompleted = experience?.skills[skill.id]?.completed || false;
                              
                              return (
                                <div
                                  key={skill.id}
                                  onClick={() => handleSkillToggle(selectedExperience, skill.id)}
                                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  )}
                                  
                                  <div className="flex-1">
                                    <h4 className={`font-medium ${isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                                      {skill.title}
                                    </h4>
                                  </div>
                                  
                                  {isCompleted && (
                                    <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                      Validé
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Onglet Progression */}
                {activeTab === 'progress' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {experience?.completedSkills || 0}/{experience?.totalSkills || 0}
                        </div>
                        <div className="text-sm text-gray-600">Compétences acquises</div>
                      </div>
                      
                      <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(((experience?.completedSkills || 0) / (experience?.totalSkills || 1)) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Progression globale</div>
                      </div>
                      
                      <div className="text-center p-4 border border-gray-200 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {experience?.sessionsCompleted || 0}/{experienceData.minSessions}
                        </div>
                        <div className="text-sm text-gray-600">Sessions réalisées</div>
                      </div>
                    </div>

                    {/* Timeline de progression */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des validations</h3>
                      
                      {experience?.progressHistory?.length > 0 ? (
                        <div className="space-y-3">
                          {experience.progressHistory.map((entry, index) => (
                            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-800">{entry.skill}</span>
                              <span className="text-xs text-gray-500 ml-auto">
                                {new Date(entry.date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Aucune validation enregistrée pour cette expérience
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Onglet Badges */}
                {activeTab === 'badges' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Badge Expert {experienceData.name}
                      </h3>
                      
                      {experience?.badgeEarned ? (
                        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-6">
                          <div className="text-4xl">{experienceData.icon}</div>
                          <div>
                            <h4 className="text-lg font-bold text-yellow-800">Badge Obtenu !</h4>
                            <p className="text-yellow-700">Expert {experienceData.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-3 bg-gray-100 border-2 border-gray-300 rounded-xl p-6">
                          <div className="text-4xl opacity-50">{experienceData.icon}</div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-600">Badge à débloquer</h4>
                            <p className="text-gray-500">Complétez toutes les compétences</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Critères pour obtenir le badge */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Critères de validation :</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {(experience?.completedSkills || 0) === (experience?.totalSkills || 0) ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm">Toutes les compétences validées</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {(experience?.sessionsCompleted || 0) >= experienceData.minSessions ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm">
                            Minimum {experienceData.minSessions} sessions réalisées
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {experience?.mentorValidation ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm">Validation du référent/mentor</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Onglet Suivi */}
                {activeTab === 'follow-up' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Suivi Hebdomadaire</h3>
                      <button
                        onClick={() => setShowWeeklyForm(true)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Nouveau suivi
                      </button>
                    </div>

                    {/* Historique des suivis */}
                    {experience?.weeklyFollowUps?.length > 0 ? (
                      <div className="space-y-4">
                        {experience.weeklyFollowUps.map((followUp, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">
                                Semaine du {new Date(followUp.date).toLocaleDateString('fr-FR')}
                              </h4>
                              <span className="text-sm text-gray-500">
                                Par {followUp.mentorName || 'Mentor'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Difficultés:</span>
                                <p className="text-gray-600">{followUp.difficulties || 'Aucune'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Réussites:</span>
                                <p className="text-gray-600">{followUp.successes || 'Aucune'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Objectifs:</span>
                                <p className="text-gray-600">{followUp.nextWeekGoals || 'Aucun'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Note:</span>
                                <p className="text-gray-600">{followUp.globalRating}/5</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucun suivi enregistré pour cette expérience</p>
                        <p className="text-sm">Cliquez sur "Nouveau suivi" pour commencer</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de suivi hebdomadaire */}
      {showWeeklyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Suivi Hebdomadaire - {experienceData?.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficultés rencontrées cette semaine
                </label>
                <textarea
                  value={weeklyFormData.difficulties}
                  onChange={(e) => setWeeklyFormData({...weeklyFormData, difficulties: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Décrivez les principales difficultés..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réussites et points positifs
                </label>
                <textarea
                  value={weeklyFormData.successes}
                  onChange={(e) => setWeeklyFormData({...weeklyFormData, successes: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Décrivez vos réussites..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectifs pour la semaine prochaine
                </label>
                <textarea
                  value={weeklyFormData.nextWeekGoals}
                  onChange={(e) => setWeeklyFormData({...weeklyFormData, nextWeekGoals: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Définissez vos objectifs..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note globale (1-5)
                </label>
                <select
                  value={weeklyFormData.globalRating}
                  onChange={(e) => setWeeklyFormData({...weeklyFormData, globalRating: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value={1}>1 - Très difficile</option>
                  <option value={2}>2 - Difficile</option>
                  <option value={3}>3 - Moyen</option>
                  <option value={4}>4 - Bien</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowWeeklyForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={submitWeeklyFollowUp}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsAcquisition;
