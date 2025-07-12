// ==========================================
// 📁 react-app/src/components/onboarding/SkillsAcquisition.jsx
// COMPOSANT ACQUISITION DE COMPÉTENCES PAR EXPÉRIENCE
// ==========================================

import React, { useState, useEffect } from 'react';
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

  // 📊 Charger les données de compétences
  const loadSkillsData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await SkillsAcquisitionService.getSkillsProfile(user.uid);
      
      if (result.success) {
        setSkillsProfile(result.profile);
        setStats(SkillsAcquisitionService.calculateProfileStats(result.profile));
        
        // Sélectionner la première expérience par défaut
        const firstExp = Object.keys(result.profile.experiences)[0];
        if (firstExp) setSelectedExperience(firstExp);
      }
    } catch (error) {
      console.error('Erreur chargement compétences:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Initialiser le profil de compétences
  const initializeSkillsProfile = async (experiences) => {
    if (!user?.uid) return;
    
    try {
      const result = await SkillsAcquisitionService.createSkillsProfile(user.uid, experiences);
      if (result.success) {
        await loadSkillsData();
      }
    } catch (error) {
      console.error('Erreur initialisation compétences:', error);
    }
  };

  // ✅ Auto-évaluation d'une compétence
  const handleSelfAssess = async (skillId, assessed) => {
    if (!selectedExperience) return;
    
    try {
      await SkillsAcquisitionService.selfAssessSkill(user.uid, selectedExperience, skillId, assessed);
      await loadSkillsData();
    } catch (error) {
      console.error('Erreur auto-évaluation:', error);
    }
  };

  // 📝 Soumettre suivi hebdomadaire
  const submitWeeklyFollowUp = async () => {
    if (!selectedExperience) return;
    
    try {
      await SkillsAcquisitionService.addWeeklyFollowUp(user.uid, selectedExperience, weeklyFormData);
      setShowWeeklyForm(false);
      setWeeklyFormData(WEEKLY_FOLLOW_UP_TEMPLATE);
      await loadSkillsData();
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
  }, [user?.uid]);

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
                  <div
                    key={expId}
                    onClick={() => setSelectedExperience(expId)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-xl">{exp.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 text-sm">{exp.name}</div>
                        <div className="text-xs text-gray-600">{exp.difficulty}</div>
                      </div>
                      {expData.completed && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.round((Object.values(expData.skills).filter(s => s.completed).length / Object.values(expData.skills).length) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'skills', label: 'Compétences', icon: <Target className="w-4 h-4" /> },
                  { id: 'weekly', label: 'Suivi Hebdo', icon: <Calendar className="w-4 h-4" /> },
                  { id: 'interviews', label: 'Entretiens', icon: <MessageSquare className="w-4 h-4" /> }
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
          </div>

          {/* Contenu des tabs */}
          {activeTab === 'skills' && experience && (
            <div className="space-y-6">
              
              {/* Header expérience */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl">{experienceData?.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{experienceData?.name}</h3>
                    <p className="text-gray-600">{experienceData?.description}</p>
                  </div>
                  {experience.completed && (
                    <div className="ml-auto">
                      <div className="flex items-center space-x-2 bg-green-100 text-green-600 px-4 py-2 rounded-lg">
                        <Award className="w-5 h-5" />
                        <span className="font-medium">Expert certifié</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Compétences par catégorie */}
              {Object.entries(EXPERIENCE_SKILLS[selectedExperience] || {}).map(([categoryName, skills]) => {
                const progress = getCategoryProgress(selectedExperience, categoryName);
                
                return (
                  <div key={categoryName} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(skills[0]?.category)}`}>
                          {getCategoryIcon(skills[0]?.category)}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 capitalize">
                            {categoryName.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {progress.completed}/{progress.total} compétences validées
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{progress.percentage}%</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {skills.map((skill) => {
                        const skillData = experience.skills[skill.id];
                        const isCompleted = skillData?.completed;
                        const isSelfAssessed = skillData?.selfAssessment;
                        
                        return (
                          <div key={skill.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                            <button
                              onClick={() => handleSelfAssess(skill.id, !isSelfAssessed)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelfAssessed 
                                  ? 'bg-blue-500 border-blue-500 text-white' 
                                  : 'border-gray-300 hover:border-blue-400'
                              }`}
                            >
                              {isSelfAssessed && <Circle className="w-3 h-3" />}
                            </button>
                            
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium">{skill.title}</p>
                              {skillData?.adminComments && (
                                <p className="text-sm text-blue-600 mt-1">
                                  💬 {skillData.adminComments}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isSelfAssessed && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                  Auto-évaluée
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                  ✅ Validée
                                </span>
                              )}
                              {!isCompleted && skillData?.validatedBy && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                  En attente
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab Suivi Hebdomadaire */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              
              {/* Bouton Nouveau suivi */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Suivi Hebdomadaire</h3>
                    <p className="text-gray-600">Partagez votre progression et vos difficultés</p>
                  </div>
                  <button
                    onClick={() => setShowWeeklyForm(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    + Nouveau suivi
                  </button>
                </div>
              </div>

              {/* Formulaire suivi hebdomadaire */}
              {showWeeklyForm && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-6">
                    Suivi Hebdomadaire - {experienceData?.name}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compétences techniques acquises cette semaine
                      </label>
                      <textarea
                        value={weeklyFormData.competences_techniques}
                        onChange={(e) => setWeeklyFormData({...weeklyFormData, competences_techniques: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="3"
                        placeholder="Décrivez les nouvelles compétences acquises..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficultés rencontrées
                      </label>
                      <textarea
                        value={weeklyFormData.difficultes_rencontrees}
                        onChange={(e) => setWeeklyFormData({...weeklyFormData, difficultes_rencontrees: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="3"
                        placeholder="Technique, animation, relationnel..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Situations marquantes
                      </label>
                      <textarea
                        value={weeklyFormData.situations_marquantes}
                        onChange={(e) => setWeeklyFormData({...weeklyFormData, situations_marquantes: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="3"
                        placeholder="Incident, stress, réussite, retour client..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compétences à approfondir la semaine prochaine
                      </label>
                      <textarea
                        value={weeklyFormData.competences_approfondir}
                        onChange={(e) => setWeeklyFormData({...weeklyFormData, competences_approfondir: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="2"
                        placeholder="Objectifs pour la semaine suivante..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Besoin d'aide ou de formation complémentaire ?
                      </label>
                      <textarea
                        value={weeklyFormData.besoin_aide}
                        onChange={(e) => setWeeklyFormData({...weeklyFormData, besoin_aide: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows="2"
                        placeholder="Besoins spécifiques..."
                      />
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={submitWeeklyFollowUp}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        📝 Envoyer le suivi
                      </button>
                      <button
                        onClick={() => setShowWeeklyForm(false)}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Historique des suivis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Historique des suivis</h4>
                
                {skillsProfile.weeklyFollowUps.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun suivi hebdomadaire encore</p>
                ) : (
                  <div className="space-y-4">
                    {skillsProfile.weeklyFollowUps
                      .filter(followUp => followUp.experienceId === selectedExperience)
                      .map((followUp, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-medium text-gray-800">
                            Semaine {followUp.week}
                          </div>
                          <div className="text-sm text-gray-500">
                            {followUp.date?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          {followUp.competences_techniques && (
                            <div>
                              <span className="font-medium text-gray-700">Compétences acquises :</span>
                              <p className="text-gray-600">{followUp.competences_techniques}</p>
                            </div>
                          )}
                          {followUp.difficultes_rencontrees && (
                            <div>
                              <span className="font-medium text-gray-700">Difficultés :</span>
                              <p className="text-gray-600">{followUp.difficultes_rencontrees}</p>
                            </div>
                          )}
                          {followUp.feedback_referent && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <span className="font-medium text-blue-700">Feedback référent :</span>
                              <p className="text-blue-600">{followUp.feedback_referent}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Entretiens */}
          {activeTab === 'interviews' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Entretiens avec Référent</h4>
              
              {skillsProfile.adminInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun entretien programmé</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Les entretiens seront ajoutés par votre référent
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skillsProfile.adminInterviews
                    .filter(interview => interview.experienceId === selectedExperience)
                    .map((interview, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-medium text-gray-800">
                          Entretien #{index + 1}
                        </div>
                        <div className="text-sm text-gray-500">
                          {interview.date?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                        </div>
                      </div>
                      
                      <div className="space-y-4 text-sm">
                        {interview.globalAssessment && (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <span className="font-medium text-purple-700">Évaluation globale :</span>
                            <p className="text-purple-600 mt-1">{interview.globalAssessment}</p>
                          </div>
                        )}
                        
                        {interview.competencesTechniques && (
                          <div>
                            <span className="font-medium text-gray-700">Compétences techniques :</span>
                            <p className="text-gray-600 mt-1">{interview.competencesTechniques}</p>
                          </div>
                        )}
                        
                        {interview.nextSteps && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <span className="font-medium text-green-700">Prochaines étapes :</span>
                            <p className="text-green-600 mt-1">{interview.nextSteps}</p>
                          </div>
                        )}
                        
                        {interview.rating && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Note :</span>
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < interview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-600">({interview.rating}/5)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsAcquisition;
