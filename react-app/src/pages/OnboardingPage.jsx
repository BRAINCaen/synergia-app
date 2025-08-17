import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowRight, Play } from 'lucide-react';
import PremiumLayout, { PremiumCard, StatCard, PremiumButton } from '../shared/layouts/PremiumLayout.jsx';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const headerStats = [
    { label: "Étapes", value: "5", icon: BookOpen, color: "text-blue-400" },
    { label: "Progression", value: `${(currentStep / 5) * 100}%`, icon: CheckCircle, color: "text-green-400" }
  ];

  const headerActions = (
    <PremiumButton variant="primary" icon={Play}>
      Commencer
    </PremiumButton>
  );

  return (
    <PremiumLayout
      title="Intégration"
      subtitle="Découvrez Synergia étape par étape"
      icon={BookOpen}
      headerActions={headerActions}
      showStats={true}
      stats={headerStats}
    >
      <PremiumCard>
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Processus d'intégration</h3>
          <p className="text-gray-400">Guide d'intégration interactif bientôt disponible !</p>
        </div>
      </PremiumCard>
    </PremiumLayout>
  );
};

export default OnboardingPage;
