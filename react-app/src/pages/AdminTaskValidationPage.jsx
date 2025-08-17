import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Clock, Search, Filter, Eye, AlertTriangle } from 'lucide-react';
import PremiumLayout, { PremiumCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';
import { useAuthStore } from '../shared/stores/authStore.js';

const AdminTaskValidationPage = () => {
  const { user } = useAuthStore();
  const [pendingTasks, setPendingTasks] = useState([]);

  const mockTasks = [
    {
      id: 1,
      title: 'Développer nouvelle feature',
      user: 'Thomas Dubois',
      xpClaimed: 50,
      status: 'pending',
      description: 'Implémentation du système de badges',
      completedAt: new Date('2024-08-16'),
      evidence: 'Code committé sur GitHub'
    },
    {
      id: 2,
      title: 'Design interface utilisateur',
      user: 'Sophie Laurent',
      xpClaimed: 35,
      status: 'pending',
      description: 'Mockups pour la page analytics',
      completedAt: new Date('2024-08-15'),
      evidence: 'Fichiers Figma partagés'
    }
  ];

  useEffect(() => {
    setPendingTasks(mockTasks);
  }, []);

  const headerStats = [
    { label: "En attente", value: pendingTasks.length.toString(), icon: Clock, color: "text-yellow-400" },
    { label: "Validées", value: "15", icon: CheckCircle, color: "text-green-400" },
    { label: "Rejetées", value: "2", icon: XCircle, color: "text-red-400" }
  ];

  const validateTask = (taskId, approved) => {
    setPendingTasks(prev => prev.filter(task => task.id !== taskId));
    // Logic pour validation
  };

  return (
    <PremiumLayout
      title="Validation des Tâches"
      subtitle="Administration et validation des tâches complétées"
      icon={Shield}
      showStats={true}
      stats={headerStats}
    >
      <div className="space-y-6">
        {pendingTasks.map((task) => (
          <PremiumCard key={task.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{task.title}</h3>
                <p className="text-gray-400 mb-2">Par {task.user}</p>
                <p className="text-gray-300 mb-4">{task.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>XP réclamés: {task.xpClaimed}</span>
                  <span>Complété le: {task.completedAt.toLocaleDateString('fr-FR')}</span>
                </div>
                
                <div className="mt-3 p-3 bg-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm"><strong>Preuve:</strong> {task.evidence}</p>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-6">
                <PremiumButton
                  variant="secondary"
                  icon={Eye}
                >
                  Détails
                </PremiumButton>
                <PremiumButton
                  variant="primary"
                  icon={CheckCircle}
                  onClick={() => validateTask(task.id, true)}
                >
                  Valider
                </PremiumButton>
                <PremiumButton
                  variant="danger"
                  icon={XCircle}
                  onClick={() => validateTask(task.id, false)}
                >
                  Rejeter
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        ))}
      </div>
    </PremiumLayout>
  );
};

export default AdminTaskValidationPage;
