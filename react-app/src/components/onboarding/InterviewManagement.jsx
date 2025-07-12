// ==========================================
// 📁 react-app/src/components/onboarding/InterviewManagement.jsx
// COMPOSANT DE GESTION DES ENTRETIENS POUR LES RÉFÉRENTS
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Edit, 
  MessageSquare,
  FileText,
  AlertCircle,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Users,
  TrendingUp
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';
import InterviewService, { INTERVIEW_TYPES, INTERVIEW_TEMPLATES } from '../../core/services/interviewService.js';

const InterviewManagement = () => {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [employees, setEmployees] = useState([]);
  
  // Formulaire de programmation
  const [scheduleForm, setScheduleForm] = useState({
    employeeId: '',
    type: 'initial',
    scheduledDate: '',
    duration: 30,
    location: 'Bureau référent',
    objectives: [],
    notes: ''
  });

  // Formulaire de finalisation
  const [completeForm, setCompleteForm] = useState({
    responses: {},
    evaluations: {},
    globalAssessment: '',
    referentNotes: '',
    nextSteps: [],
    actionPlan: [],
    validated: false,
    validationComments: ''
  });

  // 📊 Charger les données
  useEffect(() => {
    loadInterviews();
    loadEmployees();
    loadStats();
  }, [user?.uid]);

  const loadInterviews = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await InterviewService.getReferentInterviews(user.uid);
      
      if (result.success) {
        setInterviews(result.interviews);
      }
    } catch (error) {
      console.error('Erreur chargement entretiens:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    // TODO: Charger la liste des employés en onboarding
    // Pour l'instant, utiliser des données fictives
    setEmployees([
      { id: 'emp1', name: 'Puck Time', email: 'puck@brain.fr', startDate: '2025-07-01' },
      { id: 'emp2', name: 'Alex Martin', email: 'alex@brain.fr', startDate: '2025-07-15' }
    ]);
  };

  const loadStats = async () => {
    if (!user?.uid) return;
    
    try {
      const result = await InterviewService.getReferentInterviewStats(user.uid);
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  // 📅 Programmer un entretien
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    
    try {
      const result = await InterviewService.scheduleInterview({
        ...scheduleForm,
        referentId: user.uid,
        scheduledDate: new Date(scheduleForm.scheduledDate)
      });
      
      if (result.success) {
        console.log('✅ Entretien programmé avec succès');
        setShowScheduleForm(false);
        setScheduleForm({
          employeeId: '',
          type: 'initial',
          scheduledDate: '',
          duration: 30,
          location: 'Bureau référent',
          objectives: [],
          notes: ''
        });
        await loadInterviews();
        await loadStats();
      }
    } catch (error) {
      console.error('Erreur programmation entretien:', error);
    }
  };

  // ✅ Finaliser un entretien
  const handleCompleteInterview = async (e) => {
    e.preventDefault();
    
    try {
      const result = await InterviewService.completeInterview(
        selectedInterview.id, 
        completeForm
      );
      
      if (result.success) {
        console.log('✅ Entretien finalisé avec succès');
        setShowCompleteForm(false);
        setSelectedInterview(null);
        setCompleteForm({
          responses: {},
          evaluations: {},
          globalAssessment: '',
          referentNotes: '',
          nextSteps: [],
          actionPlan: [],
          validated: false,
          validationComments: ''
        });
        await loadInterviews();
        await loadStats();
      }
    } catch (error) {
      console.error('Erreur finalisation entretien:', error);
    }
  };

  // 🔄 Reprogrammer un entretien
  const handleReschedule = async (interviewId, newDate, reason) => {
    try {
      const result = await InterviewService.rescheduleInterview(interviewId, newDate, reason);
      
      if (result.success) {
        console.log('✅ Entretien reprogrammé');
        await loadInterviews();
      }
    } catch (error) {
      console.error('Erreur reprogrammation:', error);
    }
  };

  // 📊 Filtrer les entretiens par statut
  const filteredInterviews = interviews.filter(interview => {
    if (activeTab === 'all') return true;
    return interview.status === activeTab;
  });

  // 🎨 Obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-600 border-blue-200',
      completed: 'bg-green-100 text-green-600 border-green-200',
      cancelled: 'bg-red-100 text-red-600 border-red-200',
      rescheduled: 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // 🎨 Obtenir l'icône du type d'entretien
  const getTypeIcon = (type) => {
    const icons = {
      initial: <User className="w-5 h-5" />,
      weekly: <Clock className="w-5 h-5" />,
      milestone: <CheckCircle className="w-5 h-5" />,
      final: <FileText className="w-5 h-5" />,
      support: <MessageSquare className="w-5 h-5" />
    };
    return icons[type] || <Calendar className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Chargement des entretiens...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header avec statistiques */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MessageSquare className="w-8 h-8 mr-3 text-purple-600" />
            Gestion des Entretiens Référent
          </h2>
          
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Programmer Entretien</span>
          </button>
        </div>
        
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
              <div className="text-sm text-gray-600">Programmés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Terminés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{Math.round(stats.validationRate)}%</div>
              <div className="text-sm text-gray-600">Taux Validation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">{stats.byType.initial}</div>
              <div className="text-sm text-gray-600">Initiaux</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'scheduled', label: 'Programmés', count: stats?.scheduled || 0 },
              { id: 'completed', label: 'Terminés', count: stats?.completed || 0 },
              { id: 'cancelled', label: 'Annulés', count: stats?.cancelled || 0 },
              { id: 'all', label: 'Tous', count: stats?.total || 0 }
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
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Liste des entretiens */}
        <div className="p-6">
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun entretien dans cette catégorie</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => {
                const employee = employees.find(emp => emp.id === interview.employeeId);
                const interviewType = INTERVIEW_TYPES[interview.type.toUpperCase()];
                
                return (
                  <div key={interview.id} className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(interview.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {interviewType?.name || interview.type}
                          </h4>
                          <p className="text-sm text-gray-600">
                            avec {employee?.name || 'Employé inconnu'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(interview.status)}`}>
                          {interview.status}
                        </span>
                        
                        {interview.status === 'scheduled' && (
                          <button
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowCompleteForm(true);
                              // Pré-remplir le formulaire avec le template
                              const template = INTERVIEW_TEMPLATES[interview.type];
                              if (template) {
                                setCompleteForm(prev => ({
                                  ...prev,
                                  responses: template.questions.reduce((acc, q, i) => {
                                    acc[`question_${i}`] = '';
                                    return acc;
                                  }, {}),
                                  evaluations: template.evaluationCriteria.reduce((acc, c, i) => {
                                    acc[`criteria_${i}`] = 3; // Note sur 5
                                    return acc;
                                  }, {})
                                }));
                              }
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            Finaliser
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date :</span>
                        <p className="text-gray-600">
                          {interview.scheduledDate?.toDate?.()?.toLocaleDateString('fr-FR') || 'Date inconnue'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Durée :</span>
                        <p className="text-gray-600">{interview.duration} min</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Lieu :</span>
                        <p className="text-gray-600">{interview.location}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type :</span>
                        <p className="text-gray-600">{interviewType?.name}</p>
                      </div>
                    </div>
                    
                    {interview.objectives && interview.objectives.length > 0 && (
                      <div className="mt-4">
                        <span className="font-medium text-gray-700">Objectifs :</span>
                        <ul className="text-sm text-gray-600 mt-1">
                          {interview.objectives.map((obj, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span>•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {interview.status === 'completed' && interview.validated && (
                      <div className="mt-4 bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Entretien validé</span>
                        </div>
                        {interview.globalAssessment && (
                          <p className="text-sm text-green-600 mt-1">{interview.globalAssessment}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de programmation d'entretien */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Programmer un Entretien</h3>
            
            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employé
                  </label>
                  <select
                    value={scheduleForm.employeeId}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner un employé</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'entretien
                  </label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm(prev => ({ 
                      ...prev, 
                      type: e.target.value,
                      duration: INTERVIEW_TYPES[e.target.value.toUpperCase()]?.duration || 30
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
                      <option key={key} value={key.toLowerCase()}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (minutes)
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="15"
                    max="120"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu
                </label>
                <input
                  type="text"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Bureau référent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notes ou instructions spéciales..."
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Programmer l'Entretien
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de finalisation d'entretien */}
      {showCompleteForm && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 my-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Finaliser l'Entretien - {INTERVIEW_TYPES[selectedInterview.type.toUpperCase()]?.name}
            </h3>
            
            <form onSubmit={handleCompleteInterview} className="space-y-6">
              
              {/* Questions du template */}
              {INTERVIEW_TEMPLATES[selectedInterview.type]?.questions && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Questions d'Entretien</h4>
                  <div className="space-y-4">
                    {INTERVIEW_TEMPLATES[selectedInterview.type].questions.map((question, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {question}
                        </label>
                        <textarea
                          value={completeForm.responses[`question_${index}`] || ''}
                          onChange={(e) => setCompleteForm(prev => ({
                            ...prev,
                            responses: {
                              ...prev.responses,
                              [`question_${index}`]: e.target.value
                            }
                          }))}
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Réponse de l'employé..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Évaluations */}
              {INTERVIEW_TEMPLATES[selectedInterview.type]?.evaluationCriteria && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Évaluation (sur 5)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INTERVIEW_TEMPLATES[selectedInterview.type].evaluationCriteria.map((criteria, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {criteria}
                        </label>
                        <select
                          value={completeForm.evaluations[`criteria_${index}`] || 3}
                          onChange={(e) => setCompleteForm(prev => ({
                            ...prev,
                            evaluations: {
                              ...prev.evaluations,
                              [`criteria_${index}`]: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value={1}>1 - Très insuffisant</option>
                          <option value={2}>2 - Insuffisant</option>
                          <option value={3}>3 - Correct</option>
                          <option value={4}>4 - Bien</option>
                          <option value={5}>5 - Excellent</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Bilan global */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bilan Global
                </label>
                <textarea
                  value={completeForm.globalAssessment}
                  onChange={(e) => setCompleteForm(prev => ({ ...prev, globalAssessment: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Bilan général de l'entretien..."
                />
              </div>
              
              {/* Notes référent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes Référent
                </label>
                <textarea
                  value={completeForm.referentNotes}
                  onChange={(e) => setCompleteForm(prev => ({ ...prev, referentNotes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notes personnelles du référent..."
                />
              </div>
              
              {/* Validation */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="validated"
                    checked={completeForm.validated}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, validated: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="validated" className="font-medium text-gray-700">
                    Valider cet entretien
                  </label>
                </div>
                
                {completeForm.validated && (
                  <textarea
                    value={completeForm.validationComments}
                    onChange={(e) => setCompleteForm(prev => ({ ...prev, validationComments: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Commentaires de validation..."
                  />
                )}
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Finaliser l'Entretien
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteForm(false);
                    setSelectedInterview(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewManagement;
