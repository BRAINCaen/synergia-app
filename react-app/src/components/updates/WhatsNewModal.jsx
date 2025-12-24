// ==========================================
// 📁 react-app/src/components/updates/WhatsNewModal.jsx
// MODAL "QUOI DE NEUF" - Annonces des mises à jour
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, ChevronRight, ChevronLeft, Rocket, Star,
  Gift, Zap, Bug, Wrench, Plus, ArrowRight, CheckCircle2,
  Bell, Calendar, PartyPopper
} from 'lucide-react';

// ==========================================
// DONNÉES DES MISES À JOUR (CHANGELOG)
// ==========================================

export const CHANGELOG = [
  {
    version: '4.1.0',
    date: '24 Décembre 2024',
    title: 'Module Alternance & Objectifs Personnalisables',
    isNew: true,
    highlights: [
      {
        icon: '🎓',
        title: 'Module Alternance amélioré',
        description: 'Gestion complète des parcours d\'alternants avec sélection multi-alternants pour les tuteurs.',
        type: 'feature'
      },
      {
        icon: '🎯',
        title: 'Objectifs personnalisables',
        description: 'Les tuteurs peuvent créer, modifier et supprimer des objectifs scolaires. Fonctionne aussi sur les objectifs par défaut !',
        type: 'feature'
      },
      {
        icon: '✅',
        title: 'Validation XP corrigée',
        description: 'L\'XP est maintenant correctement attribué à l\'alternant sélectionné, pas au tuteur.',
        type: 'fix'
      },
      {
        icon: '🔧',
        title: 'Corrections techniques',
        description: 'Fix des permissions (tableau vs objet), import Firebase manquant, chargement des alternants.',
        type: 'fix'
      },
      {
        icon: '🍺',
        title: 'La Taverne',
        description: 'Espace social combinant messagerie et boosts pour échanger avec vos collègues.',
        type: 'feature'
      }
    ]
  },
  {
    version: '4.0.0',
    date: '20 Décembre 2024',
    title: 'Permissions & Formations',
    isNew: false,
    highlights: [
      {
        icon: '🔐',
        title: 'Système de permissions granulaire',
        description: 'Nouveau système de permissions par module avec 4 niveaux d\'accès : Dieu, Admin, Éditeur, Lecture.',
        type: 'feature'
      },
      {
        icon: '🎓',
        title: 'Module Formations fonctionnel',
        description: 'Créez et gérez des formations, filtrez par type, visualisez le plan annuel avec calendrier.',
        type: 'feature'
      },
      {
        icon: '🎨',
        title: 'Nouveau design des modales',
        description: 'Thème glassmorphism sombre pour toutes les modales de l\'application.',
        type: 'improvement'
      },
      {
        icon: '🐛',
        title: 'Corrections diverses',
        description: 'Corrections des boutons de parrainage, affichage des noms dans les dropdowns.',
        type: 'fix'
      }
    ]
  },
  {
    version: '3.9.0',
    date: '15 Décembre 2024',
    title: 'Optimisations & Mobile',
    isNew: false,
    highlights: [
      {
        icon: '📱',
        title: 'Optimisation mobile',
        description: 'Meilleure expérience sur les appareils mobiles avec un design responsive amélioré.',
        type: 'improvement'
      },
      {
        icon: '📄',
        title: 'Export PDF',
        description: 'Exportez vos statistiques et rapports au format PDF.',
        type: 'feature'
      },
      {
        icon: '⏱️',
        title: 'Historique temps de travail',
        description: 'Consultez votre historique de pointage directement depuis la page RH.',
        type: 'feature'
      }
    ]
  }
];

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================

const WhatsNewModal = ({ isOpen, onClose, showOnlyLatest = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedVersions, setViewedVersions] = useState([]);

  // Charger les versions vues depuis localStorage
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('synergia_viewed_updates') || '[]');
    setViewedVersions(viewed);
  }, []);

  // Marquer comme vu à la fermeture
  const handleClose = () => {
    const currentVersion = CHANGELOG[currentIndex]?.version;
    if (currentVersion && !viewedVersions.includes(currentVersion)) {
      const newViewed = [...viewedVersions, currentVersion];
      setViewedVersions(newViewed);
      localStorage.setItem('synergia_viewed_updates', JSON.stringify(newViewed));
    }
    onClose();
  };

  // Navigation
  const goNext = () => {
    if (currentIndex < CHANGELOG.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentUpdate = CHANGELOG[currentIndex];

  // Couleurs par type
  const getTypeStyle = (type) => {
    switch (type) {
      case 'feature':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Plus, label: 'Nouveau' };
      case 'improvement':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Zap, label: 'Amélioration' };
      case 'fix':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: Bug, label: 'Correction' };
      default:
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: Star, label: 'Mise à jour' };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100000] p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
            {/* Particules décoratives */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-4 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <div className="absolute top-8 right-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse delay-100" />
              <div className="absolute bottom-4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200" />
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">Quoi de neuf ?</h2>
                    {currentUpdate?.isNew && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Découvrez les dernières nouveautés de Synergia
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Version info */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-purple-500/20 rounded-lg">
                  <span className="text-purple-400 font-mono font-bold">v{currentUpdate?.version}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{currentUpdate?.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">{currentIndex + 1} / {CHANGELOG.length}</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mt-3">{currentUpdate?.title}</h3>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[45vh]">
            <div className="space-y-4">
              {currentUpdate?.highlights.map((item, idx) => {
                const typeStyle = getTypeStyle(item.type);
                const TypeIcon = typeStyle.icon;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeStyle.bg} ${typeStyle.text} flex items-center gap-1`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeStyle.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer navigation */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Précédent</span>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {CHANGELOG.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-6 bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {currentIndex < CHANGELOG.length - 1 ? (
                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-all"
                >
                  <span className="text-sm">Suivant</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <span className="text-sm">C'est parti !</span>
                  <Rocket className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==========================================
// BOUTON D'OUVERTURE POUR LE DASHBOARD
// ==========================================

export const WhatsNewButton = ({ onClick }) => {
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('synergia_viewed_updates') || '[]');
    const latestVersion = CHANGELOG[0]?.version;
    setHasNew(latestVersion && !viewed.includes(latestVersion));
  }, []);

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all w-full"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="text-left flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Quoi de neuf ?</span>
          {hasNew && (
            <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded animate-pulse">
              NEW
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">v{CHANGELOG[0]?.version} - {CHANGELOG[0]?.date}</span>
      </div>
      <ArrowRight className="w-5 h-5 text-purple-400" />

      {/* Badge notification */}
      {hasNew && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
      )}
    </motion.button>
  );
};

// ==========================================
// WIDGET COMPACT POUR SIDEBAR
// ==========================================

export const WhatsNewWidget = ({ onClick }) => {
  const latestUpdate = CHANGELOG[0];
  const [viewed, setViewed] = useState(true);

  useEffect(() => {
    const viewedVersions = JSON.parse(localStorage.getItem('synergia_viewed_updates') || '[]');
    setViewed(viewedVersions.includes(latestUpdate?.version));
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-white text-sm">Nouveautés</span>
        </div>
        {!viewed && (
          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
            NOUVEAU
          </span>
        )}
      </div>
      <p className="text-gray-400 text-xs mb-2">{latestUpdate?.title}</p>
      <div className="flex items-center justify-between">
        <span className="text-purple-400 text-xs font-mono">v{latestUpdate?.version}</span>
        <span className="text-gray-500 text-xs">{latestUpdate?.date}</span>
      </div>
    </motion.div>
  );
};

export default WhatsNewModal;
