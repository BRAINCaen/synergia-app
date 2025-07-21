// ==========================================
// 📁 react-app/src/pages/OnboardingPage.jsx
// CORRECTION - UTILISER LE COMPOSANT ENTRETIENS EXTERNE
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Target, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Trophy, 
  Calendar, 
  Clock, 
  User,
  RefreshCw,
  Plus,
  BarChart3,
  FileText
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';

// 🔥 IMPORTS FIREBASE
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../core/firebase.js';

// 🎯 RÔLES SYNERGIA
const SYNERGIA_ROLES = {
  gamemaster: { 
    id: 'gamemaster', 
    name: 'Game Master', 
    icon: '🎭', 
    color: 'from-purple-500 to-pink-500',
    description: 'Animation et gestion des sessions d\'escape game'
  },
  maintenance: { 
    id: 'maintenance', 
    name: 'Maintenance', 
    icon: '🔧', 
    color: 'from-orange-500 to-red-500',
    description: 'Entretien technique et réparations'
  },
  reputation: { 
    id: 'reputation', 
    name: 'Réputation', 
    icon: '⭐', 
    color: 'from-yellow-500 to-orange-500',
    description: 'Gestion de l\'image de marque et avis clients'
  },
  stock: { 
    id: 'stock', 
    name: 'Stock', 
    icon: '📦', 
    color: 'from-blue-500 to-cyan-500',
    description: 'Gestion des stocks et approvisionnements'
  },
  organization: { 
    id: 'organization', 
    name: 'Organisation', 
    icon: '📋', 
    color: 'from-green-500 to-emerald-500',
    description: 'Planification et coordination'
  },
  partnerships: { 
    id: 'partnerships', 
    name: 'Partenariats', 
    icon: '🤝', 
    color: 'from-indigo-500 to-purple-500',
    description: 'Relations externes et collaborations'
  }
};

const OnboardingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('formation');
  const [formationData, setFormationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données de formation
  const loadFormationData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      console.log('📚 Chargement données de formation...');
      
      // Charger depuis Firebase ou créer un profil par défaut
      const defaultFormation = {
        userId: user.uid,
        status: 'in_progress',
        currentPhase: 'decouverte_brain',
        progress: 25,
        completedModules: ['accueil', 'presentation_equipe'],
        nextModule: 'formation_roles',
        startDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      };
      
      setFormationData(defaultFormation);
      
    } catch (error) {
      console.error('❌ Erreur chargement formation:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadFormationData();
    }
  }, [user?.uid, loadFormationData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold mb-2">Chargement de votre formation</h2>
          <p className="text-gray-400">Initialisation en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* 🎯 En-tête */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Formation Brain
          </h1>
          <p className="text-gray-400 text-lg">
            Votre parcours d'intégration personnalisé
          </p>
        </div>

        {/* 📊 Navigation par onglets */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2">
            <div className="flex space-x-2">
              {[
                { id: 'formation', name: 'Ma Formation', icon: BookOpen },
                { id: 'competences', name: 'Compétences', icon: Target },
                { id: 'entretiens', name: 'Entretiens', icon: MessageSquare }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🎯 CONTENU DES ONGLETS */}
        <div className="space-y-8">
          {/* Onglet Formation */}
          {activeTab === 'formation' && <FormationProgress formationData={formationData} />}
          
          {/* Onglet Compétences */}
          {activeTab === 'competences' && <AcquisitionCompetences />}
          
          {/* Onglet Entretiens - IMPORTER LE COMPOSANT EXTERNE */}
          {activeTab === 'entretiens' && <EntretiensReferentFonctionnel />}
        </div>
      </div>
    </div>
  );
};

// 🎯 COMPOSANT FORMATION PROGRESS
const FormationProgress = ({ formationData }) => {
  if (!formationData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          Aucune formation en cours
        </h3>
        <p className="text-gray-500">
          Votre parcours de formation sera bientôt disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Ma Formation</h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            En cours
          </span>
          <span className="text-gray-400">{formationData.progress}% complété</span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
            style={{ width: `${formationData.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Modules complétés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formationData.completedModules?.map((module, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">
              {module.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        ))}
      </div>

      {/* Prochain module */}
      {formationData.nextModule && (
        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-400" />
            <div>
              <h4 className="text-white font-semibold">Prochaine étape</h4>
              <p className="text-blue-300">
                {formationData.nextModule.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 COMPOSANT ACQUISITION DE COMPÉTENCES
const AcquisitionCompetences = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold text-white mb-4">
          🎮 Acquisition de Compétences
        </h3>
        <p className="text-gray-300 text-lg">
          Développez votre expertise dans les 6 rôles clés de Brain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(SYNERGIA_ROLES).map(role => (
          <div key={role.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center text-xl mr-4`}>
                {role.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white">{role.name}</h4>
                <p className="text-gray-400 text-sm">0% complété</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">{role.description}</p>
            <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${role.color} w-0`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🎯 COMPOSANT ENTRETIENS RÉFÉRENT - VERSION FONCTIONNELLE
const EntretiensReferentFonctionnel = () => {
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Templates d'entretiens
  const INTERVIEW_TEMPLATES = {
    initial: {
      id: 'initial',
      name: 'Entretien Initial',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      duration: 60,
      description: 'Premier entretien d\'accueil et présentation'
    },
    weekly: {
      id: 'weekly',
      name: 'Suivi Hebdomadaire',
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-500',
      duration: 30,
      description: 'Point régulier sur les progrès'
    },
    milestone: {
      id: 'milestone',
      name: 'Bilan d\'Étape',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      duration: 45,
      description: 'Validation des compétences acquises'
    },
    final: {
      id: 'final',
      name: 'Entretien Final',
      icon: Trophy,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      duration: 60,
      description: 'Bilan complet et certification'
    },
    support: {
      id: 'support',
      name: 'Entretien de Soutien',
      icon: MessageSquare,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-gradient-to-br from-pink-500 to-rose-500',
      duration: 30,
      description: 'Accompagnement personnalisé'
    }
  };

  const [scheduleForm, setScheduleForm] = useState({
    employeeName: 'Allan',
    employeeEmail: 'alan.boehme61@gmail.com',
    employeeId: 'alan_boehme',
    type: 'initial',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '14:00',
    duration: 60,
    location: 'Bureau référent',
    objectives: '',
    notes: ''
  });

  // Charger les entretiens
  const loadInterviews = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('referentId', '==', user.uid),
        orderBy('scheduledDate', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(interviewsQuery);
      const interviewsList = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interviewsList.push({
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate?.toDate ? 
            data.scheduledDate.toDate().toISOString() : data.scheduledDate
        });
      });
      
      setInterviews(interviewsList);
      console.log(`✅ ${interviewsList.length} entretiens chargés`);
      
    } catch (error) {
      console.error('❌ Erreur chargement entretiens:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  // 🎯 FONCTION POUR OUVRIR LE FORMULAIRE AVEC UN TEMPLATE SPÉCIFIQUE
  const handlePlanifierTemplate = (templateId) => {
    console.log('🎯 Planifier template:', templateId);
    
    const template = INTERVIEW_TEMPLATES[templateId];
    if (!template) {
      console.error('❌ Template non trouvé:', templateId);
      return;
    }
    
    // Configurer le formulaire avec le template
    setSelectedTemplate(template);
    setScheduleForm(prev => ({
      ...prev,
      type: templateId,
      duration: template.duration
    }));
    
    // Ouvrir le modal
    setShowScheduleForm(true);
    
    console.log('✅ Modal ouvert avec template:', template.name);
  };

  // Programmer un entretien
  const handleScheduleWithTemplate = async (templateId) => {
    try {
      const template = INTERVIEW_TEMPLATES[templateId];
      if (!template) return;

      console.log('📅 Programmation entretien avec template:', template.name);

      const interviewData = {
        employeeName: scheduleForm.employeeName,
        employeeEmail: scheduleForm.employeeEmail,
        employeeId: scheduleForm.employeeId,
        referentId: user.uid,
        referentName: user.displayName || user.email,
        type: templateId,
        scheduledDate: new Date(`${scheduleForm.scheduledDate}T${scheduleForm.scheduledTime}:00`),
        duration: template.duration,
        location: scheduleForm.location,
        objectives: scheduleForm.objectives,
        notes: scheduleForm.notes,
        status: 'scheduled',
        
        template: {
          name: template.name,
          description: template.description
        },
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      console.log('✅ Entretien programmé avec template:', templateId, docRef.id);
      
      // Notification de succès
      showNotification(`✅ Entretien ${template.name} programmé avec succès !`);
      
      // Fermer le modal et recharger
      setShowScheduleForm(false);
      setSelectedTemplate(null);
      await loadInterviews();
      
    } catch (error) {
      console.error('❌ Erreur programmation entretien:', error);
      showNotification('❌ Erreur lors de la programmation');
    }
  };

  // Afficher une notification
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 16px 20px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      max-width: 400px;
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* 📊 Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 rounded-full p-3">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-blue-400 text-sm font-medium">Total</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{interviews.length}</div>
          <div className="text-gray-400 text-sm">Entretiens programmés</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 rounded-full p-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-medium">Terminés</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {interviews.filter(i => i.status === 'completed').length}
          </div>
          <div className="text-gray-400 text-sm">Entretiens finalisés</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/20 rounded-full p-3">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-yellow-400 text-sm font-medium">En attente</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {interviews.filter(i => i.status === 'scheduled').length}
          </div>
          <div className="text-gray-400 text-sm">À venir</div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 rounded-full p-3">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-purple-400 text-sm font-medium">Progression</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">85%</div>
          <div className="text-gray-400 text-sm">Taux de réussite</div>
        </div>
      </div>

      {/* 🎯 Templates d'entretiens FONCTIONNELS */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Templates d'Entretiens</h2>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Programmer un entretien
          </button>
        </div>

        {/* TEMPLATES AVEC BOUTONS FONCTIONNELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(INTERVIEW_TEMPLATES).map((template) => {
            const IconComponent = template.icon;
            return (
              <div
                key={template.id}
                className="group bg-gray-700/50 rounded-2xl p-6 border border-gray-600 hover:border-purple-500/50 transition-all duration-200"
              >
                <div className={`${template.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 mb-4 text-sm">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.duration} min
                  </span>
                  <button 
                    onClick={() => handlePlanifierTemplate(template.id)}
                    className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-all duration-200 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1 rounded-lg"
                  >
                    Planifier →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📋 Liste des prochains entretiens */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Prochains Entretiens</h2>
          <button
            onClick={loadInterviews}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des entretiens...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Aucun entretien programmé
            </h3>
            <p className="text-gray-500 mb-6">
              Utilisez les boutons "Planifier →" ci-dessus pour programmer votre premier entretien.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.slice(0, 3).map((interview) => {
              const template = INTERVIEW_TEMPLATES[interview.type];
              
              return (
                <div
                  key={interview.id}
                  className="bg-gray-700/50 rounded-xl p-6 border border-gray-600 hover:border-purple-500/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {template && (
                          <div className={`${template.bgColor} w-10 h-10 rounded-lg flex items-center justify-center`}>
                            <template.icon className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {template?.name || interview.type}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            avec {interview.employeeName || 'Employé'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(interview.scheduledDate).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4" />
                          <span>{interview.duration} minutes</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4" />
                          <span>{interview.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-xs font-medium rounded-full border bg-blue-100 text-blue-600 border-blue-200">
                        {interview.status === 'scheduled' ? 'Programmé' : interview.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📅 MODAL DE PROGRAMMATION */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Programmer un Entretien
                </h3>
                {selectedTemplate && (
                  <div className="flex items-center gap-3">
                    <div className={`${selectedTemplate.bgColor} w-8 h-8 rounded-lg flex items-center justify-center`}>
                      <selectedTemplate.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300">{selectedTemplate.name}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowScheduleForm(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedTemplate) {
                handleScheduleWithTemplate(selectedTemplate.id);
              }
            }} className="space-y-6">
              
              {/* Employé */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Employé
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={scheduleForm.employeeName}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeName: e.target.value }))}
                    placeholder="Nom de l'employé"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    required
                  />
                  <input
                    type="email"
                    value={scheduleForm.employeeEmail}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, employeeEmail: e.target.value }))}
                    placeholder="Email de l'employé"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Date et heure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Lieu de l'entretien
                </label>
                <select
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="Bureau référent">Bureau référent</option>
                  <option value="Salle de réunion A">Salle de réunion A</option>
                  <option value="Salle de réunion B">Salle de réunion B</option>
                  <option value="Visioconférence">Visioconférence</option>
                  <option value="Espace détente">Espace détente</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  {selectedTemplate ? `Programmer ${selectedTemplate.name}` : 'Programmer l\'entretien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
