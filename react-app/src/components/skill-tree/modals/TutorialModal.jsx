// ==========================================
// components/skill-tree/modals/TutorialModal.jsx
// MODAL TUTORIEL SKILL TREE
// ==========================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const TutorialModal = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue dans l'Arbre de Competences !",
      content: "Ce systeme RPG vous permet de developper vos competences professionnelles de maniere ludique. Chaque action dans Synergia vous fait progresser !",
      icon: "🌳"
    },
    {
      title: "Les 7 Branches de Competences",
      content: "Votre arbre comporte 7 branches : Relationnel, Technique, Communication, Organisation, Creativite, Pedagogie et Commercial. Chaque branche contient plusieurs skills a developper.",
      icon: "🌿"
    },
    {
      title: "Comment gagner de l'XP ?",
      content: "Accomplissez des quetes, participez aux defis d'equipe, connectez-vous quotidiennement... Chaque action vous rapporte de l'XP dans les competences correspondantes !",
      icon: "✨"
    },
    {
      title: "Les Tiers de Progression",
      content: "Chaque skill a 3 tiers (niveaux). En atteignant un tier, vous debloquez le choix d'un talent qui vous donne des bonus permanents !",
      icon: "📈"
    },
    {
      title: "Choisir vos Talents",
      content: "Quand un skill atteint un nouveau tier, une notification apparait. Cliquez sur le skill pour voir les talents disponibles et choisissez celui qui correspond a votre style !",
      icon: "🏆"
    },
    {
      title: "Les Rangs",
      content: "En accumulant de l'XP, vous montez en niveau et debloquez des rangs (Apprenti → Initie → Aventurier...). Chaque rang donne des bonus d'XP et des avantages exclusifs !",
      icon: "👑"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-purple-900/50 rounded-2xl border border-white/20 p-5 sm:p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{steps[step].icon}</span>
            <span className="text-xs text-gray-400">Etape {step + 1}/{steps.length}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Contenu */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{steps[step].title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">{steps[step].content}</p>

        {/* Indicateurs */}
        <div className="flex justify-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-purple-500 w-6' : 'bg-white/30'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors text-sm"
            >
              Precedent
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-colors text-sm"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-teal-500 transition-colors text-sm"
            >
              C'est compris !
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TutorialModal;
