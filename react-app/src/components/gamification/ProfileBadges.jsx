// ==========================================
// 📁 react-app/src/components/gamification/ProfileBadges.jsx
// COMPOSANT BADGES SUR PROFIL UTILISATEUR
// Affiche les derniers badges et le showcase
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Crown, ChevronRight, Sparkles, Award, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../core/firebase.js';
import { RARITY_CONFIG } from '../../core/services/badgeDefinitions.js';

/**
 * 🏆 PROFILE BADGES - Affichage des badges sur le profil
 */
const ProfileBadges = ({
  userId,
  badges = [],
  showcaseBadges = [],
  isOwnProfile = false,
  maxRecentBadges = 5,
  onShowcaseChange = null
}) => {
  const navigate = useNavigate();
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [selectedShowcase, setSelectedShowcase] = useState(showcaseBadges || []);
  const [saving, setSaving] = useState(false);

  // Initialiser le showcase sélectionné
  useEffect(() => {
    setSelectedShowcase(showcaseBadges || []);
  }, [showcaseBadges]);

  // 🎨 Style de rareté
  const getRarityStyle = (rarity) => {
    const config = RARITY_CONFIG[rarity?.toLowerCase()] || RARITY_CONFIG.common;
    return {
      borderColor: config.borderColor,
      glow: config.glow,
      bgColor: config.bgColor
    };
  };

  // 💾 Sauvegarder le showcase
  const handleSaveShowcase = async () => {
    if (!userId || !isOwnProfile) return;

    try {
      setSaving(true);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'gamification.showcaseBadges': selectedShowcase
      });

      console.log('✅ Showcase sauvegardé:', selectedShowcase.length, 'badges');

      setShowShowcaseModal(false);

      if (onShowcaseChange) {
        onShowcaseChange(selectedShowcase);
      }

    } catch (error) {
      console.error('❌ Erreur sauvegarde showcase:', error);
    } finally {
      setSaving(false);
    }
  };

  // 🎯 Toggle badge dans showcase
  const toggleShowcaseBadge = (badge) => {
    setSelectedShowcase(prev => {
      const isSelected = prev.some(b => b.id === badge.id);

      if (isSelected) {
        return prev.filter(b => b.id !== badge.id);
      } else {
        if (prev.length >= 3) {
          // Max 3 badges, remplacer le plus ancien
          return [...prev.slice(1), badge];
        }
        return [...prev, badge];
      }
    });
  };

  // Derniers badges (hors showcase)
  const recentBadges = badges
    .filter(b => !showcaseBadges.some(s => s.id === b.id))
    .slice(-maxRecentBadges)
    .reverse();

  return (
    <div className="space-y-6">
      {/* 🌟 SHOWCASE - Badges mis en avant */}
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Badges en Vitrine
          </h3>
          {isOwnProfile && (
            <button
              onClick={() => setShowShowcaseModal(true)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Modifier
            </button>
          )}
        </div>

        {showcaseBadges.length > 0 ? (
          <div className="flex items-center justify-center gap-6">
            {showcaseBadges.map((badge, index) => {
              const style = getRarityStyle(badge.rarity);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className="relative group"
                >
                  <div
                    className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center text-4xl
                      bg-gray-800/50 border-2 transition-all duration-300
                      ${style.glow ? 'shadow-lg shadow-purple-500/30' : ''}
                      group-hover:scale-110
                    `}
                    style={{ borderColor: style.borderColor }}
                  >
                    {badge.icon || '🏆'}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded">
                      {badge.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Emplacements vides */}
            {[...Array(3 - showcaseBadges.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center"
              >
                {isOwnProfile ? (
                  <button
                    onClick={() => setShowShowcaseModal(true)}
                    className="text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    <Lock className="h-6 w-6" />
                  </button>
                ) : (
                  <Lock className="h-6 w-6 text-gray-700" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            {isOwnProfile ? (
              <>
                <p className="text-gray-400 mb-3">Aucun badge en vitrine</p>
                <button
                  onClick={() => setShowShowcaseModal(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm underline"
                >
                  Choisir vos badges préférés
                </button>
              </>
            ) : (
              <p className="text-gray-500">Aucun badge mis en avant</p>
            )}
          </div>
        )}
      </div>

      {/* 🏆 DERNIERS BADGES */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Derniers Badges
            <span className="text-sm font-normal text-gray-400">
              ({badges.length} total)
            </span>
          </h3>
          <button
            onClick={() => navigate('/badges')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            Voir tous
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recentBadges.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {recentBadges.map((badge, index) => {
              const style = getRarityStyle(badge.rarity);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <div
                    className={`
                      w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                      bg-gray-800/50 border transition-all duration-200
                      group-hover:scale-110 cursor-pointer
                    `}
                    style={{ borderColor: style.borderColor }}
                    title={`${badge.name} - ${badge.description}`}
                  >
                    {badge.icon || '🏆'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            {badges.length === 0 ? 'Aucun badge débloqué' : 'Tous les badges sont en vitrine !'}
          </p>
        )}
      </div>

      {/* 🎯 MODAL SÉLECTION SHOWCASE */}
      <AnimatePresence>
        {showShowcaseModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShowcaseModal(false)}
          >
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                Choisir vos badges en vitrine
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Sélectionnez jusqu'à 3 badges à mettre en avant sur votre profil
              </p>

              {/* Badges sélectionnés */}
              <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-purple-300 mb-3">
                  Vitrine actuelle ({selectedShowcase.length}/3) :
                </p>
                <div className="flex gap-4 justify-center">
                  {[...Array(3)].map((_, i) => {
                    const badge = selectedShowcase[i];
                    return (
                      <div
                        key={i}
                        className={`
                          w-16 h-16 rounded-xl flex items-center justify-center text-3xl
                          ${badge
                            ? 'bg-gray-800 border-2 border-purple-500 cursor-pointer hover:border-red-500'
                            : 'border-2 border-dashed border-gray-600'
                          }
                        `}
                        onClick={() => badge && toggleShowcaseBadge(badge)}
                      >
                        {badge ? badge.icon || '🏆' : <Lock className="h-5 w-5 text-gray-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Liste de tous les badges */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-6">
                {badges.map((badge) => {
                  const isSelected = selectedShowcase.some(b => b.id === badge.id);
                  const style = getRarityStyle(badge.rarity);

                  return (
                    <motion.button
                      key={badge.id}
                      onClick={() => toggleShowcaseBadge(badge)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                        transition-all duration-200
                        ${isSelected
                          ? 'bg-purple-600 border-2 border-purple-400 ring-2 ring-purple-400/50'
                          : 'bg-gray-700/50 border border-gray-600 hover:border-gray-500'
                        }
                      `}
                      title={badge.name}
                    >
                      {badge.icon || '🏆'}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {badges.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Vous n'avez pas encore de badges</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShowcaseModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveShowcase}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileBadges;
