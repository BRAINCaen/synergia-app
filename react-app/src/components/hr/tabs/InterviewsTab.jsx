// ==========================================
// 📁 components/hr/tabs/InterviewsTab.jsx
// ONGLET GESTION DES ENTRETIENS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, AlertTriangle, Clock, Plus, Eye, UserCheck } from 'lucide-react';
import { db } from '../../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import GlassCard from '../GlassCard.jsx';
import StatCard from '../StatCard.jsx';

const InterviewsTab = ({ employees, onRefresh }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewInterviewModal, setShowNewInterviewModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Types d'entretiens
  const interviewTypes = [
    { id: 'annual', label: 'Entretien annuel', color: 'blue', duration: '1h30' },
    { id: 'professional', label: 'Entretien professionnel', color: 'purple', duration: '1h' },
    { id: 'probation', label: 'Fin de période d\'essai', color: 'orange', duration: '45min' },
    { id: 'followup', label: 'Suivi', color: 'green', duration: '30min' },
    { id: 'return', label: 'Retour absence longue', color: 'yellow', duration: '45min' }
  ];

  useEffect(() => {
    loadInterviews();
  }, [selectedYear]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const interviewsRef = collection(db, 'hr_interviews');
      const snapshot = await getDocs(query(interviewsRef, orderBy('scheduledDate', 'desc')));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInterviews(data);
    } catch (error) {
      console.error('Erreur chargement entretiens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = {
    scheduled: interviews.filter(i => i.status === 'scheduled').length,
    completed: interviews.filter(i => i.status === 'completed').length,
    overdue: interviews.filter(i => {
      const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate);
      return date < new Date() && i.status === 'scheduled';
    }).length,
    thisMonth: interviews.filter(i => {
      const date = i.scheduledDate?.toDate?.() || new Date(i.scheduledDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  // Employés sans entretien annuel cette année
  const employeesWithoutAnnualReview = employees.filter(emp => {
    return !interviews.some(i =>
      i.employeeId === emp.id &&
      i.type === 'annual' &&
      new Date(i.scheduledDate?.toDate?.() || i.scheduledDate).getFullYear() === selectedYear
    );
  });

  return (
    <motion.div
      key="interviews"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard title="Planifiés" value={stats.scheduled} icon={Calendar} color="blue" />
        <StatCard title="Complétés" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard title="En retard" value={stats.overdue} icon={AlertTriangle} color="orange" />
        <StatCard title="Ce mois" value={stats.thisMonth} icon={Clock} color="purple" />
      </div>

      {/* Alerte employés sans entretien */}
      {employeesWithoutAnnualReview.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-400 mb-1">
                {employeesWithoutAnnualReview.length} salarié(s) sans entretien annuel en {selectedYear}
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {employeesWithoutAnnualReview.slice(0, 5).map(emp => (
                  <span key={emp.id} className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300 text-xs">
                    {emp.firstName} {emp.lastName}
                  </span>
                ))}
                {employeesWithoutAnnualReview.length > 5 && (
                  <span className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300 text-xs">
                    +{employeesWithoutAnnualReview.length - 5} autres
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Entretiens</h2>
            <p className="text-gray-400 text-sm">Entretiens annuels et professionnels</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewInterviewModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Planifier
            </button>
          </div>
        </div>

        {/* Types d'entretiens */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {interviewTypes.map((type) => (
            <div
              key={type.id}
              className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50 text-center"
            >
              <div className={`text-${type.color}-400 font-medium text-sm mb-1`}>{type.label}</div>
              <div className="text-gray-500 text-xs">~{type.duration}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <UserCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Aucun entretien planifié</p>
            <p className="text-gray-500 text-sm mb-4">Planifiez vos entretiens annuels et professionnels</p>
            <button
              onClick={() => setShowNewInterviewModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Planifier un entretien
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => {
              const employee = employees.find(e => e.id === interview.employeeId);
              const type = interviewTypes.find(t => t.id === interview.type) || interviewTypes[0];
              const date = interview.scheduledDate?.toDate?.() || new Date(interview.scheduledDate);
              const isOverdue = date < new Date() && interview.status === 'scheduled';

              return (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-xl border ${
                    isOverdue
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-800/40 border-gray-700/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-${type.color}-500/20 rounded-full flex items-center justify-center`}>
                        <UserCheck className={`w-5 h-5 text-${type.color}-400`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {employee?.firstName} {employee?.lastName}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs bg-${type.color}-500/20 text-${type.color}-400`}>
                            {type.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverdue && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                          En retard
                        </span>
                      )}
                      {interview.status === 'completed' && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Complété
                        </span>
                      )}
                      <button className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default InterviewsTab;
