// ==========================================
// 📁 react-app/src/components/onboarding/InterviewManagement.jsx
// GESTION ENTRETIENS AVEC VRAIE RECHERCHE D'EMPLOYÉS
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

// Firebase
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../core/firebase.js';

import { useAuthStore } from '../../shared/stores/authStore.js';
import { InterviewService, INTERVIEW_TYPES, INTERVIEW_TEMPLATES } from '../../core/services/interviewService.js';

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
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
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
    loadRealEmployees();
    loadStats();
  }, [user?.uid]);

  /**
   * 👥 CHARGER LES VRAIS EMPLOYÉS EN FORMATION DEPUIS FIREBASE
   */
  const loadRealEmployees = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingEmployees(true);
      console.log('👥 Recherche des employés en formation...');
      
      const employeesList = [];
      
      // 1. Chercher dans la collection 'users' tous les utilisateurs
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      console.log(`📊 ${usersSnapshot.size} utilisateurs trouvés`);
      
      // 2. Chercher dans la collection 'skillsAcquisition' (profils onboarding)
      const skillsRef = collection(db, 'skillsAcquisition');
      const skillsSnapshot = await getDocs(skillsRef);
      
      const onboardingUserIds = new Set();
      skillsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Si l'utilisateur a un profil d'acquisition de compétences, il est en formation
        if (data.userId && data.experiences) {
          onboardingUserIds.add(data.userId);
        }
      });
      
      console.log(`📊 ${onboardingUserIds.size} utilisateurs en formation trouvés`);
      
      // 3. Combiner les données utilisateurs avec leur statut de formation
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;
        
        // Inclure l'utilisateur s'il a un profil onboarding OU s'il est récent (moins de 60 jours)
        const isInOnboarding = onboardingUserIds.has(userId);
        const isRecentUser = userData.createdAt && 
          (Date.now() - userData.createdAt.toMillis()) < (60 * 24 * 60 * 60 * 1000); // 60 jours
        
        if (isInOnboarding || isRecentUser) {
          employeesList.push({
            id: userId,
            name: userData.displayName || userData.profile?.firstName + ' ' + userData.profile?.lastName || 'Utilisateur',
            email: userData.email,
            startDate: userData.createdAt ? userData.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            status: isInOnboarding ? 'en_formation' : 'nouveau',
            hasOnboardingProfile: isInOnboarding
          });
        }
      });
      
      // 4. Ajouter l'utilisateur actuel s'il n'est pas déjà dans la liste (pour test)
      if (!employeesList.find(emp => emp.id === user.uid)) {
        employeesList.unshift({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'Moi',
          email: user.email,
          startDate: new Date().toISOString().split('T')[0],
          status: 'test',
          hasOnboardingProfile: false
        });
      }
      
      console.log('✅ Employés en formation trouvés:', employeesList);
      setEmployees(employeesList);
      
    } catch (error) {
      console.error('❌ Erreur chargement employés:', error);
      
      // Fallback: utiliser l'utilisateur actuel
      setEmployees([{
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Utilisateur actuel',
        email: user.email,
        startDate: new Date().toISOString().split('T')[0],
        status: 'fallback',
        hasOnboardingProfile: false
      }]);
    } finally {
      setLoadingEmployees(false);
    }
  };

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
      postponed: 'bg-yellow-100 text-yellow-600 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // 🎨 Obtenir l'icône du type d'entretien
  const getTypeIcon = (type) => {
    const icons = {
      initial: User,
      weekly: Calendar,
      milestone: CheckCircle,
      final: FileText,
      support: MessageSquare
    };
    const Icon = icons[type] || Calendar;
    return <Icon className="w-4 h-4" />;
  };

  if (loading && !employees.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Chargement des entretiens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Gestion des Entretiens Référent
          </h2>
          <p className="text-gray-400">
            Programmez et suivez les entretiens avec vos employés en formation
          </p>
        </div>
        
        <button
          onClick={() => setShowScheduleForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Programmer un Entretien</span>
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-gray-400 text-sm">Programmés</p>
                <p className="text-2xl font-bold text-white">{stats.scheduled || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-gray-400 text-sm">Terminés</p>
                <p className="text-2xl font-bold text-white">{stats.completed || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-gray-400 text-sm">Employés</p>
                <p className="text-2xl font-bold text-white">{employees.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-gray-400 text-sm">Taux réussite</p>
                <p className="text-2xl font-bold text-white">{stats.successRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglets de filtrage */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'all', label: 'Tous', count: interviews.length },
          { key: 'scheduled', label: 'Programmés', count: interviews.filter(i => i.status === 'scheduled').length },
          { key: 'completed', label: 'Terminés', count: interviews.filter(i => i.status === 'completed').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Liste des entretiens */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Entretiens {activeTab === 'all' ? 'récents' : INTERVIEW_TYPES[activeTab]?.name || activeTab}
          </h3>
          
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucun entretien trouvé</p>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="mt-4 text-blue-400 hover:text-blue-300"
              >
                Programmer le premier entretien
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => {
                const employee = employees.find(e => e.id === interview.employeeId);
                
                return (
                  <div
                    key={interview.id}
                    className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getTypeIcon(interview.type)}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-white">
                            {INTERVIEW_TYPES[interview.type]?.name || interview.type}
                          </h4>
                          <p className="text-sm text-gray-400">
                            Avec {employee?.name || 'Employé inconnu'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(interview.scheduledDate?.toDate?.() || interview.scheduledDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(interview.status)}`}>
                          {interview.status}
                        </span>
                        
                        {interview.status === 'scheduled' && (
                          <button
                            onClick={() => {
                              setSelectedInterview(interview);
                              setShowCompleteForm(true);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal de programmation d'entretien */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Programmer un Entretien
              </h3>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Employé *
                </label>
                <select
                  value={scheduleForm.employeeId}
                  onChange={(e) => setScheduleForm({...scheduleForm, employeeId: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {loadingEmployees ? (
                    <option disabled>Chargement des employés...</option>
                  ) : employees.length === 0 ? (
                    <option disabled>Aucun employé en formation trouvé</option>
                  ) : (
                    employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.email})
                        {employee.status && ` - ${employee.status}`}
                      </option>
                    ))
                  )}
                </select>
                {loadingEmployees && (
                  <p className="text-sm text-blue-400 mt-1">
                    Recherche des employés en formation...
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l'employé *
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.employeeId ? employees.find(e => e.id === scheduleForm.employeeId)?.name || '' : ''}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Nom complet"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={scheduleForm.employeeId ? employees.find(e => e.id === scheduleForm.employeeId)?.email || '' : ''}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="email@brain.fr"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type d'entretien *
                </label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  required
                >
                  {Object.entries(INTERVIEW_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure *
                  </label>
                  <input
                    type="time"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Durée (minutes)
                </label>
                <input
                  type="number"
                  value={scheduleForm.duration}
                  onChange={(e) => setScheduleForm({...scheduleForm, duration: parseInt(e.target.value)})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  min="15"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lieu
                </label>
                <select
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Bureau référent">Bureau référent</option>
                  <option value="Salle de réunion">Salle de réunion</option>
                  <option value="Visioconférence">Visioconférence</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Programmer l'Entretien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debug info */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-medium mb-2">🔍 Debug - Employés trouvés:</h4>
        <div className="text-sm text-gray-400">
          <p>Total: {employees.length}</p>
          {employees.slice(0, 3).map(emp => (
            <p key={emp.id}>• {emp.name} ({emp.email}) - {emp.status}</p>
          ))}
          {employees.length > 3 && <p>... et {employees.length - 3} autres</p>}
        </div>
      </div>
    </div>
  );
};

export default InterviewManagement;
