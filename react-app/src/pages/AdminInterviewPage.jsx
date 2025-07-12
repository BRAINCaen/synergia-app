// ==========================================
// 📁 react-app/src/pages/AdminInterviewPage.jsx
// PAGE ADMIN POUR LA GESTION DES ENTRETIENS RÉFÉRENT
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  ChevronDown,
  Download
} from 'lucide-react';

import { useAuthStore } from '../shared/stores/authStore.js';
import InterviewManagement from '../components/onboarding/InterviewManagement.jsx';
import InterviewService from '../core/services/interviewService.js';

const AdminInterviewPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [allInterviews, setAllInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    employee: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [user?.uid]);

  const loadAdminData = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      // Charger tous les entretiens (si admin global)
      const interviewsResult = await InterviewService.searchInterviews({});
      if (interviewsResult.success) {
        setAllInterviews(interviewsResult.interviews);
      }
      
      // Charger la liste des employés en onboarding
      await loadEmployeesList();
      
      // Calculer les statistiques globales
      calculateGlobalStats(interviewsResult.interviews || []);
      
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeesList = async () => {
    // TODO: Récupérer depuis Firebase la liste des employés en onboarding
    // Pour l'instant, données fictives
    setEmployees([
      { 
        id: 'emp1', 
        name: 'Puck Time', 
        email: 'puck@brain.fr', 
        startDate: '2025-07-01',
        referentId: 'ref1',
        referentName: 'Marie Référent',
        phase: 'parcours_client'
      },
      { 
        id: 'emp2', 
        name: 'Alex Martin', 
        email: 'alex@brain.fr', 
        startDate: '2025-07-15',
        referentId: 'ref2',
        referentName: 'Jean Référent',
        phase: 'decouverte_brain'
      }
    ]);
  };

  const calculateGlobalStats = (interviews) => {
    const stats = {
      total: interviews.length,
      scheduled: interviews.filter(i => i.status === 'scheduled').length,
      completed: interviews.filter(i => i.status === 'completed').length,
      cancelled: interviews.filter(i => i.status === 'cancelled').length,
      validated: interviews.filter(i => i.validated).length,
      
      byType: {
        initial: interviews.filter(i => i.type === 'initial').length,
        weekly: interviews.filter(i => i.type === 'weekly').length,
        milestone: interviews.filter(i => i.type === 'milestone').length,
        final: interviews.filter(i => i.type === 'final').length,
        support: interviews.filter(i => i.type === 'support').length
      },
      
      completionRate: interviews.length > 0 ? 
        Math.round((interviews.filter(i => i.status === 'completed').length / interviews.length) * 100) : 0,
      
      validationRate: interviews.filter(i => i.status === 'completed').length > 0 ?
        Math.round((interviews.filter(i => i.validated).length / interviews.filter(i => i.status === 'completed').length) * 100) : 0
    };
    
    setGlobalStats(stats);
  };

  // Programmer automatiquement les entretiens pour un nouvel employé
  const autoScheduleForEmployee = async (employeeId, referentId, startDate) => {
    try {
      const result = await InterviewService.autoScheduleMandatoryInterviews(
        employeeId, 
        referentId, 
        new Date(startDate)
      );
      
      if (result.success) {
        console.log('✅ Entretiens auto-programmés:', result.scheduledInterviews);
        await loadAdminData();
      }
    } catch (error) {
      console.error('Erreur programmation automatique:', error);
    }
  };

  // Filtrer les entretiens
  const filteredInterviews = allInterviews.filter(interview => {
    // Filtre par statut
    if (filters.status !== 'all' && interview.status !== filters.status) return false;
    
    // Filtre par type
    if (filters.type !== 'all' && interview.type !== filters.type) return false;
    
    // Filtre par employé
    if (filters.employee !== 'all' && interview.employeeId !== filters.employee) return false;
    
    // Recherche textuelle
    if (searchTerm) {
      const employee = employees.find(emp => emp.id === interview.employeeId);
      const searchable = `${employee?.name || ''} ${employee?.email || ''} ${interview.type}`.toLowerCase();
      if (!searchable.includes(searchTerm.toLowerCase())) return false;
    }
    
    return true;
  });

  // Export des données
  const exportInterviews = () => {
    const csvData = filteredInterviews.map(interview => {
      const employee = employees.find(emp => emp.id === interview.employeeId);
      return {
        'Employé': employee?.name || 'Inconnu',
        'Email': employee?.email || '',
        'Type': interview.type,
        'Statut': interview.status,
        'Date': interview.scheduledDate?.toDate?.()?.toLocaleDateString('fr-FR') || '',
        'Durée': interview.duration,
        'Validé': interview.validated ? 'Oui' : 'Non',
        'Référent': employee?.referentName || ''
      };
    });
    
    // TODO: Implémenter l'export CSV
    console.log('Export CSV:', csvData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white">Chargement des données d'entretiens...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎯 Administration des Entretiens
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Gestion centralisée des entretiens de suivi pour tous les employés en onboarding
          </p>
        </div>

        {/* Statistiques globales */}
        {globalStats && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-purple-400" />
              Statistiques Globales
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              <div className="bg-purple-600/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">{globalStats.total}</div>
                <div className="text-purple-200 text-sm">Total</div>
              </div>
              <div className="bg-blue-600/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-300">{globalStats.scheduled}</div>
                <div className="text-blue-200 text-sm">Programmés</div>
              </div>
              <div className="bg-green-600/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-300">{globalStats.completed}</div>
                <div className="text-green-200 text-sm">Terminés</div>
              </div>
              <div className="bg-red-600/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-300">{globalStats.cancelled}</div>
                <div className="text-red-200 text-sm">Annulés</div>
              </div>
              <div className="bg-yellow-600/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-300">{globalStats.completionRate}%</div>
                <div className="text-yellow-200 text-sm">Taux Réalisation</div>
              </div>
              <div className="bg-emerald-600/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-emerald-300">{globalStats.validationRate}%</div>
                <div className="text-emerald-200 text-sm">Taux Validation</div>
              </div>
            </div>
          </div>
        )}

        {/* Outils de gestion */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            
            {/* Recherche et filtres */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 bg-white/10 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="scheduled">Programmés</option>
                <option value="completed">Terminés</option>
                <option value="cancelled">Annulés</option>
              </select>
              
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 bg-white/10 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous les types</option>
                <option value="initial">Initial</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="milestone">Étape</option>
                <option value="final">Final</option>
                <option value="support">Soutien</option>
              </select>
            </div>
            
            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={exportInterviews}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Actions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Actions groupées */}
          {showBulkActions && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-purple-500/10">
              <h4 className="font-semibold text-white mb-3">Actions Groupées</h4>
              <div className="flex flex-wrap gap-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Programmer entretiens manquants
                </button>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Rappels automatiques
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Rapport mensuel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gestion des employés */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-purple-400" />
            Employés en Onboarding ({employees.length})
          </h3>
          
          <div className="grid gap-4">
            {employees.map((employee) => {
              const employeeInterviews = allInterviews.filter(i => i.employeeId === employee.id);
              const scheduledCount = employeeInterviews.filter(i => i.status === 'scheduled').length;
              const completedCount = employeeInterviews.filter(i => i.status === 'completed').length;
              
              return (
                <div key={employee.id} className="bg-white/5 rounded-lg p-4 border border-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{employee.name}</h4>
                        <p className="text-purple-200 text-sm">{employee.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="text-white font-medium">{scheduledCount}</div>
                        <div className="text-purple-200">Programmés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{completedCount}</div>
                        <div className="text-purple-200">Terminés</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-medium">{employee.phase}</div>
                        <div className="text-purple-200">Phase</div>
                      </div>
                      
                      <button
                        onClick={() => autoScheduleForEmployee(employee.id, employee.referentId, employee.startDate)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Auto-programmer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des entretiens */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-purple-400" />
            Tous les Entretiens ({filteredInterviews.length})
          </h3>
          
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200">Aucun entretien trouvé avec ces critères</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview) => {
                const employee = employees.find(emp => emp.id === interview.employeeId);
                
                return (
                  <div key={interview.id} className="bg-white/5 rounded-lg p-4 border border-purple-500/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          interview.status === 'completed' ? 'bg-green-600' :
                          interview.status === 'scheduled' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          {interview.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <MessageSquare className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {employee?.name || 'Employé inconnu'} - {interview.type}
                          </h4>
                          <p className="text-purple-200 text-sm">
                            {interview.scheduledDate?.toDate?.()?.toLocaleDateString('fr-FR')} • 
                            {interview.duration} min • {interview.status}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {interview.validated && (
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                            Validé
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs ${
                          interview.status === 'completed' ? 'bg-green-600 text-white' :
                          interview.status === 'scheduled' ? 'bg-blue-600 text-white' :
                          interview.status === 'cancelled' ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Composant de gestion des entretiens pour le référent connecté */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            Mes Entretiens en tant que Référent
          </h3>
          <InterviewManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminInterviewPage;
