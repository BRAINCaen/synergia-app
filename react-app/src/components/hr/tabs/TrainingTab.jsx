// ==========================================
// 📁 components/hr/tabs/TrainingTab.jsx
// ONGLET FORMATIONS & CERTIFICATIONS
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Calendar, AlertTriangle, Plus, Shield, Target } from 'lucide-react';
import { db } from '../../../core/firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import GlassCard from '../GlassCard.jsx';
import StatCard from '../StatCard.jsx';

const TrainingTab = ({ employees, onRefresh }) => {
  const [trainings, setTrainings] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('trainings'); // trainings, certifications, plan

  // Types de formations
  const trainingTypes = [
    { id: 'internal', label: 'Formation interne', color: 'blue', icon: '🏠' },
    { id: 'external', label: 'Formation externe', color: 'purple', icon: '🏫' },
    { id: 'elearning', label: 'E-learning', color: 'green', icon: '💻' },
    { id: 'certification', label: 'Certification', color: 'orange', icon: '📜' },
    { id: 'safety', label: 'Sécurité', color: 'red', icon: '🦺' }
  ];

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    try {
      setLoading(true);

      // Charger les formations
      const trainingsRef = collection(db, 'hr_trainings');
      const trainingsSnapshot = await getDocs(query(trainingsRef, orderBy('date', 'desc')));
      const trainingsData = trainingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrainings(trainingsData);

      // Charger les certifications
      const certsRef = collection(db, 'hr_certifications');
      const certsSnapshot = await getDocs(certsRef);
      const certsData = certsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCertifications(certsData);

    } catch (error) {
      console.error('Erreur chargement formations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = {
    totalTrainings: trainings.length,
    completedThisYear: trainings.filter(t => {
      const date = t.date?.toDate?.() || new Date(t.date);
      return date.getFullYear() === new Date().getFullYear() && t.status === 'completed';
    }).length,
    upcomingTrainings: trainings.filter(t => {
      const date = t.date?.toDate?.() || new Date(t.date);
      return date > new Date() && t.status === 'scheduled';
    }).length,
    expiringCerts: certifications.filter(c => {
      const expiry = c.expiryDate?.toDate?.() || new Date(c.expiryDate);
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      return expiry <= threeMonths && expiry > new Date();
    }).length
  };

  return (
    <motion.div
      key="training"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard title="Formations" value={stats.totalTrainings} icon={Award} color="blue" />
        <StatCard title="Complétées (année)" value={stats.completedThisYear} icon={CheckCircle} color="green" />
        <StatCard title="À venir" value={stats.upcomingTrainings} icon={Calendar} color="purple" />
        <StatCard title="Certifs expirantes" value={stats.expiringCerts} icon={AlertTriangle} color="orange" />
      </div>

      {/* Alerte certifications */}
      {stats.expiringCerts > 0 && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400">
              {stats.expiringCerts} certification(s) expire(nt) dans les 3 prochains mois
            </span>
          </div>
        </div>
      )}

      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Formations & Certifications</h2>
            <p className="text-gray-400 text-sm">Suivi du plan de formation</p>
          </div>
          <div className="flex gap-2">
            {['trainings', 'certifications', 'plan'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  activeView === view
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {view === 'trainings' ? 'Formations' : view === 'certifications' ? 'Certifications' : 'Plan annuel'}
              </button>
            ))}
          </div>
        </div>

        {/* Types de formations */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {trainingTypes.map((type) => (
            <div
              key={type.id}
              className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/50 text-center"
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-gray-300 text-xs">{type.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : activeView === 'trainings' ? (
          trainings.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Aucune formation enregistrée</p>
              <p className="text-gray-500 text-sm mb-4">Commencez à planifier les formations</p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une formation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {trainings.map((training) => {
                const type = trainingTypes.find(t => t.id === training.type) || trainingTypes[0];
                const date = training.date?.toDate?.() || new Date(training.date);

                return (
                  <motion.div
                    key={training.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                          {type.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white">{training.title}</div>
                          <div className="text-sm text-gray-400">
                            {type.label} • {date.toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        training.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : training.status === 'scheduled'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {training.status === 'completed' ? 'Complétée' : training.status === 'scheduled' ? 'Planifiée' : 'Annulée'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : activeView === 'certifications' ? (
          <div className="space-y-3">
            {certifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucune certification enregistrée</p>
              </div>
            ) : (
              certifications.map((cert) => {
                const employee = employees.find(e => e.id === cert.employeeId);
                const expiry = cert.expiryDate?.toDate?.() || new Date(cert.expiryDate);
                const isExpiring = expiry <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                const isExpired = expiry < new Date();

                return (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-xl border ${
                      isExpired
                        ? 'bg-red-500/10 border-red-500/30'
                        : isExpiring
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-gray-800/40 border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{cert.name}</div>
                        <div className="text-sm text-gray-400">
                          {employee?.firstName} {employee?.lastName} • Expire le {expiry.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      {isExpired ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Expiré</span>
                      ) : isExpiring ? (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">Bientôt</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Valide</span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Plan de formation annuel</p>
            <p className="text-gray-500 text-sm mb-4">Définissez vos objectifs de formation</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer le plan de formation
            </button>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default TrainingTab;
