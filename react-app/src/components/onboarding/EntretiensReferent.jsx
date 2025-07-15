// ==========================================
// 📁 react-app/src/components/onboarding/EntretiensReferent.jsx
// COMPOSANT ENTRETIENS RÉFÉRENT - SYSTÈME COMPLET DE SUIVI
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
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
  CalendarDays,
  Users,
  TrendingUp,
  Target,
  Star,
  Award,
  Phone,
  Video,
  MapPin,
  Send,
  Save,
  RotateCcw,
  Eye,
  Activity,
  BarChart3,
  Zap,
  Heart,
  Lightbulb
} from 'lucide-react';

import { useAuthStore } from '../../shared/stores/authStore.js';

// 🎯 TYPES D'ENTRETIENS
const INTERVIEW_TYPES = {
  initial: {
    id: 'initial',
    name: 'Entretien Initial',
    description: 'Premier contact et définition des objectifs',
    icon: User,
    color: 'from-blue-500 to-cyan-500',
    duration: 30,
    mandatory: true
  },
  weekly: {
    id: 'weekly',
    name: 'Suivi Hebdomadaire',
    description: 'Point régulier sur les progrès',
    icon: CalendarDays,
    color: 'from-green-500 to-emerald-500',
    duration: 20,
    recurring: true
  },
  milestone: {
    id: 'milestone',
    name: 'Entretien d\'Étape',
    description: 'Validation de fin de phase',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    duration: 45,
    mandatory: true
  },
  final: {
    id: 'final',
    name: 'Entretien Final',
    description: 'Validation complète de l\'intégration',
    icon: Award,
    color: 'from-orange-500 to-red-500',
    duration: 60,
    mandatory: true
  },
  support: {
    id: 'support',
    name: 'Soutien Personnalisé',
    description: 'Accompagnement en cas de difficultés',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    duration: 30,
    onDemand: true
  }
};

// 📋 MODÈLES DE QUESTIONS PAR TYPE
const INTERVIEW_QUESTIONS = {
  initial: [
    'Comment vous sentez-vous pour ce premier jour ?',
    'Avez-vous des questions sur l\'organisation ?',
    'Quels sont vos objectifs pour cette formation ?',
    'Y a-t-il des points spécifiques que vous aimeriez approfondir ?'
  ],
  weekly: [
    'Quelles compétences avez-vous développées cette semaine ?',
    'Quelles difficultés avez-vous rencontrées ?',
    'Comment vous sentez-vous dans l\'équipe ?',
    'Avez-vous besoin d\'aide sur des points spécifiques ?'
  ],
  milestone: [
    'Comment évaluez-vous votre progression sur cette phase ?',
    'Quelles sont vos réussites principales ?',
    'Sur quels points devez-vous encore progresser ?',
    'Vous sentez-vous prêt(e) pour la phase suivante ?'
  ],
  final: [
    'Comment jugez-vous votre intégration globale ?',
    'Quelles compétences vous semblent les plus développées ?',
    'Quels aspects aimeriez-vous encore améliorer ?',
    'Avez-vous des suggestions pour améliorer le parcours ?'
  ],
  support: [
    'Quelles sont les principales difficultés rencontrées ?',
    'Quel type d\'accompagnement vous aiderait le plus ?',
    'Comment pourrait-on adapter votre parcours ?',
    'Vous sentez-vous soutenu(e) par l\'équipe ?'
  ]
};

const EntretiensReferent = () => {
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, schedule, history, stats
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  
  // 📊 Données d'exemple (en attendant l'intégration Firebase)
  const mockInterviews = [
    {
      id: 'int1',
      employeeName: 'Puck Time',
      employeeEmail: 'puck@brain.fr',
      type: 'initial',
      scheduledDate: '2025-07-20T10:00:00Z',
      status: 'scheduled',
      duration: 30,
      location: 'Bureau référent',
      notes: 'Premier entretien d\'intégration'
    },
    {
      id: 'int2',
      employeeName: 'Alex Martin',
      employeeEmail: 'alex@brain.fr',
      type: 'weekly',
      scheduledDate: '2025-07-18T14:00:00Z',
      status: 'completed',
      duration: 20,
      location: 'Visioconférence',
      completed: true,
      rating: 4,
      notes: 'Bonne progression, autonomie croissante'
    },
    {
      id: 'int3',
      employeeName: 'Sarah Chen',
      employeeEmail: 'sarah@brain.fr',
      type: 'milestone',
      scheduledDate: '2025-07-22T16:00:00Z',
      status: 'scheduled',
      duration: 45,
      location: 'Salle de réunion A',
      notes: 'Validation phase sécurité et procédures'
    }
  ];

  const mockStats = {
    total: 15,
    thisWeek: 3,
    completed: 12,
    pending: 3,
    avgRating: 4.2,
    completionRate: 80
  };

  // Formulaire de programmation
  const [scheduleForm, setScheduleForm] = useState({
    employeeName: '',
    employeeEmail: '',
    type: 'initial',
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    location: 'Bureau référent',
    objectives: '',
    notes: ''
  });

  // 🎨 Vue Dashboard
  const DashboardView = () => (
    <div className="space-y-6">
      
      {/* 📊 Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{mockStats.total}</div>
              <div className="text-sm opacity-80">Total entretiens</div>
            </div>
            <CalendarDays className="h-8 w-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{mockStats.thisWeek}</div>
              <div className="text-sm opacity-80">Cette semaine</div>
            </div>
            <TrendingUp className="h-8 w-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{mockStats.avgRating}/5</div>
              <div className="text-sm opacity-80">Note moyenne</div>
            </div>
            <Star className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* 📅 Prochains entretiens */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Prochains Entretiens</h3>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Programmer
          </button>
        </div>
        
        <div className="space-y-3">
          {mockInterviews
            .filter(interview => interview.status === 'scheduled')
            .map(interview => {
              const interviewType = INTERVIEW_TYPES[interview.type];
              const IconComponent = interviewType.icon;
              const scheduledDate = new Date(interview.scheduledDate);
              
              return (
                <div key={interview.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${interviewType.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      
                      <div>
                        <div className="text-white font-medium">
                          {interview.employeeName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {interviewType.name} • {interview.duration} min
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {interview.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {scheduledDate.toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-400">
                        {scheduledDate.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <button className="text-blue-400 hover:text-blue-300 p-1">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowCompleteForm(true);
                          }}
                          className="text-green-400 hover:text-green-300 p-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {interview.notes && (
                    <div className="mt-3 text-sm text-gray-400 bg-gray-800 rounded p-2">
                      {interview.notes}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* 📈 Entretiens récents */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Entretiens Récents</h3>
        
        <div className="space-y-3">
          {mockInterviews
            .filter(interview => interview.status === 'completed')
            .map(interview => {
              const interviewType = INTERVIEW_TYPES[interview.type];
              const IconComponent = interviewType.icon;
              const completedDate = new Date(interview.scheduledDate);
              
              return (
                <div key={interview.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${interviewType.color}`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      
                      <div>
                        <div className="text-white font-medium">
                          {interview.employeeName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {interviewType.name} • {completedDate.toLocaleDateString('fr-FR')}
                        </div>
                        {interview.rating && (
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < interview.rating ? 'text-yellow-400' : 'text-gray-600'
                                }`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <button className="text-blue-400 hover:text-blue-300 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {interview.notes && (
                    <div className="mt-3 text-sm text-gray-400 bg-gray-800 rounded p-2">
                      {interview.notes}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  // 📅 Formulaire de programmation
  const ScheduleForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Programmer un Entretien</h3>
          <button
            onClick={() => setShowScheduleForm(false)}
            className="text-gray-400 hover:text-white"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Employé */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Employé·e
            </label>
            <input
              type="text"
              value={scheduleForm.employeeName}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeName: e.target.value }))}
              placeholder="Nom de l'employé·e"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={scheduleForm.employeeEmail}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeEmail: e.target.value }))}
              placeholder="email@brain.fr"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Type d'entretien */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type d'entretien
            </label>
            <select
              value={scheduleForm.type}
              onChange={(e) => {
                const type = e.target.value;
                setScheduleForm(prev => ({ 
                  ...prev, 
                  type,
                  duration: INTERVIEW_TYPES[type]?.duration || 30
                }));
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {Object.values(INTERVIEW_TYPES).map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={scheduleForm.scheduledDate}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heure
              </label>
              <input
                type="time"
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Durée (minutes)
            </label>
            <input
              type="number"
              value={scheduleForm.duration}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              min="15"
              max="120"
              step="15"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lieu
            </label>
            <select
              value={scheduleForm.location}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Bureau référent">Bureau référent</option>
              <option value="Salle de réunion A">Salle de réunion A</option>
              <option value="Salle de réunion B">Salle de réunion B</option>
              <option value="Visioconférence">Visioconférence</option>
              <option value="Espace détente">Espace détente</option>
            </select>
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Objectifs
            </label>
            <textarea
              value={scheduleForm.objectives}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, objectives: e.target.value }))}
              placeholder="Objectifs et points à aborder..."
              rows="3"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes additionnelles..."
              rows="2"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowScheduleForm(false)}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                // TODO: Intégrer avec le service
                console.log('Programmation entretien:', scheduleForm);
                setShowScheduleForm(false);
                setScheduleForm({
                  employeeName: '',
                  employeeEmail: '',
                  type: 'initial',
                  scheduledDate: '',
                  scheduledTime: '',
                  duration: 30,
                  location: 'Bureau référent',
                  objectives: '',
                  notes: ''
                });
              }}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Programmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 💬 Formulaire de finalisation
  const CompleteForm = () => {
    const [completeData, setCompleteData] = useState({
      rating: 0,
      summary: '',
      strengths: '',
      improvements: '',
      nextSteps: '',
      validated: false
    });

    if (!selectedInterview) return null;

    const interviewType = INTERVIEW_TYPES[selectedInterview.type];
    const questions = INTERVIEW_QUESTIONS[selectedInterview.type] || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Finaliser l'Entretien - {selectedInterview.employeeName}
            </h3>
            <button
              onClick={() => {
                setShowCompleteForm(false);
                setSelectedInterview(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Type d'entretien */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${interviewType.color}`}>
                  <interviewType.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{interviewType.name}</div>
                  <div className="text-sm text-gray-400">{interviewType.description}</div>
                </div>
              </div>
            </div>

            {/* Questions types */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Questions Types</h4>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="text-sm text-gray-300">
                      {index + 1}. {question}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Évaluation globale */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Évaluation globale
              </label>
              <div className="flex items-center space-x-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCompleteData(prev => ({ ...prev, rating: star }))}
                    className={`${
                      star <= completeData.rating ? 'text-yellow-400' : 'text-gray-600'
                    } hover:text-yellow-300 transition-colors`}
                  >
                    <Star className="h-6 w-6" fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            {/* Résumé */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Résumé de l'entretien
              </label>
              <textarea
                value={completeData.summary}
                onChange={(e) => setCompleteData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Résumé des points abordés..."
                rows="3"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Points forts */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Points forts observés
              </label>
              <textarea
                value={completeData.strengths}
                onChange={(e) => setCompleteData(prev => ({ ...prev, strengths: e.target.value }))}
                placeholder="Forces et réussites..."
                rows="2"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Points d'amélioration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Axes d'amélioration
              </label>
              <textarea
                value={completeData.improvements}
                onChange={(e) => setCompleteData(prev => ({ ...prev, improvements: e.target.value }))}
                placeholder="Points à travailler..."
                rows="2"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Prochaines étapes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prochaines étapes
              </label>
              <textarea
                value={completeData.nextSteps}
                onChange={(e) => setCompleteData(prev => ({ ...prev, nextSteps: e.target.value }))}
                placeholder="Actions à mettre en place..."
                rows="2"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Validation */}
            <div className="flex items-center space-x-3 bg-gray-700 rounded-lg p-4">
              <input
                type="checkbox"
                id="validated"
                checked={completeData.validated}
                onChange={(e) => setCompleteData(prev => ({ ...prev, validated: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
              <label htmlFor="validated" className="text-white font-medium">
                Valider cette étape du parcours
              </label>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowCompleteForm(false);
                  setSelectedInterview(null);
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // TODO: Intégrer avec le service
                  console.log('Finalisation entretien:', {
                    interviewId: selectedInterview.id,
                    ...completeData
                  });
                  setShowCompleteForm(false);
                  setSelectedInterview(null);
                }}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finaliser
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 🎯 Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎤 Entretiens Référent
        </h2>
        <p className="text-gray-400">
          Système de suivi et d'accompagnement personnalisé
        </p>
      </div>

      {/* 📊 Vue principale */}
      <DashboardView />

      {/* 🎨 Types d'entretiens */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Types d'Entretiens</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(INTERVIEW_TYPES).map(type => {
            const IconComponent = type.icon;
            
            return (
              <div key={type.id} className={`bg-gradient-to-r ${type.color} rounded-lg p-4 text-white`}>
                <div className="flex items-center mb-3">
                  <IconComponent className="h-6 w-6 mr-3" />
                  <div className="font-semibold">{type.name}</div>
                </div>
                
                <div className="text-sm opacity-90 mb-3">
                  {type.description}
                </div>
                
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span>{type.duration} min</span>
                  {type.mandatory && <span>Obligatoire</span>}
                  {type.recurring && <span>Récurrent</span>}
                  {type.onDemand && <span>À la demande</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📝 Guide d'utilisation */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-6 w-6 text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Guide d'Utilisation</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-blue-300">
              <CalendarDays className="h-4 w-4 mr-2" />
              <strong>Planification</strong>
            </div>
            <ul className="text-gray-400 space-y-1 ml-6">
              <li>• Programmer les entretiens à l'avance</li>
              <li>• Définir objectifs et lieu</li>
              <li>• Adapter la durée selon le type</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-green-300">
              <Target className="h-4 w-4 mr-2" />
              <strong>Suivi</strong>
            </div>
            <ul className="text-gray-400 space-y-1 ml-6">
              <li>• Utiliser les questions types</li>
              <li>• Évaluer et noter les progrès</li>
              <li>• Définir les prochaines étapes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 🚀 Prochaines fonctionnalités */}
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Zap className="h-6 w-6 text-purple-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Prochainement</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-purple-400 font-medium mb-2">📊 Analytics</div>
            <div className="text-gray-400">Statistiques détaillées et rapports</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-purple-400 font-medium mb-2">🔔 Notifications</div>
            <div className="text-gray-400">Rappels automatiques et alertes</div>
          </div>
          
          <div className="bg-black/20 rounded-lg p-3">
            <div className="text-purple-400 font-medium mb-2">📝 Templates</div>
            <div className="text-gray-400">Modèles personnalisables</div>
          </div>
        </div>
      </div>

      {/* 🎨 Modals */}
      {showScheduleForm && <ScheduleForm />}
      {showCompleteForm && <CompleteForm />}
    </div>
  );
};

export default EntretiensReferent;
