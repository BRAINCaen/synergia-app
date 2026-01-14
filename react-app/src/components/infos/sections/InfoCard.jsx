// ==========================================
// components/infos/sections/InfoCard.jsx
// COMPOSANT CARTE D'INFORMATION
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit, Trash2, Check, Users, ChevronDown, ChevronUp,
  Loader, Eye, CheckCircle
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../core/firebase.js';

const InfoCard = ({ info, user, isAdmin, onEdit, onDelete, onValidate }) => {
  const isAuthor = info.authorId === user.uid;
  const isValidated = info.validatedBy?.[user.uid];
  const canEdit = isAdmin || isAuthor;
  const canDelete = isAdmin || isAuthor;

  const [showValidators, setShowValidators] = useState(false);
  const [validatorsWithNames, setValidatorsWithNames] = useState([]);
  const [loadingValidators, setLoadingValidators] = useState(false);

  useEffect(() => {
    const fetchValidatorNames = async () => {
      if (!info.validatedBy || Object.keys(info.validatedBy).length === 0) {
        setValidatorsWithNames([]);
        return;
      }

      setLoadingValidators(true);

      const validators = [];

      for (const [odot, data] of Object.entries(info.validatedBy)) {
        try {
          const userRef = doc(db, 'users', odot);
          const userSnap = await getDoc(userRef);

          let userName = 'Utilisateur';
          let userAvatar = null;
          let validatedAt = null;

          if (userSnap.exists()) {
            const userData = userSnap.data();
            userName = userData.profile?.displayName ||
                       userData.displayName ||
                       userData.email?.split('@')[0] ||
                       'Utilisateur';
            userAvatar = userData.profile?.photoURL || userData.photoURL || null;
          }

          if (typeof data === 'string') {
            validatedAt = data;
          } else if (data && typeof data === 'object') {
            validatedAt = data.validatedAt;
            if (userName === 'Utilisateur' && data.userName) {
              userName = data.userName;
            }
            if (!userAvatar && data.userAvatar) {
              userAvatar = data.userAvatar;
            }
          }

          validators.push({
            odot: odot,
            userName,
            userAvatar,
            validatedAt
          });

        } catch (error) {
          console.warn('Erreur recuperation valideur:', odot, error);
          validators.push({
            odot: odot,
            userName: typeof data === 'object' ? data.userName || 'Utilisateur' : 'Utilisateur',
            userAvatar: typeof data === 'object' ? data.userAvatar : null,
            validatedAt: typeof data === 'string' ? data : data?.validatedAt
          });
        }
      }

      validators.sort((a, b) => {
        const dateA = a.validatedAt ? new Date(a.validatedAt) : new Date(0);
        const dateB = b.validatedAt ? new Date(b.validatedAt) : new Date(0);
        return dateB - dateA;
      });

      setValidatorsWithNames(validators);
      setLoadingValidators(false);
    };

    fetchValidatorNames();
  }, [info.validatedBy]);

  const validatorCount = Object.keys(info.validatedBy || {}).length;

  const formatValidationDate = (dateStr) => {
    if (!dateStr) return 'Date inconnue';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'A l\'instant';
      if (minutes < 60) return `Il y a ${minutes} min`;
      if (hours < 24) return `Il y a ${hours}h`;
      if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;

      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white/5 backdrop-blur-xl border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
        isValidated ? 'border-white/10' : 'border-purple-400/50 shadow-lg shadow-purple-500/20'
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {info.authorAvatar ? (
            <img
              src={info.authorAvatar}
              alt={info.authorName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-purple-500/50 flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-purple-500/50 text-sm sm:text-base flex-shrink-0">
              {info.authorName?.charAt(0) || '?'}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base truncate">{info.authorName}</p>
            <p className="text-gray-500 text-xs sm:text-sm">
              {info.createdAt?.toDate?.()?.toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {canEdit && (
            <motion.button
              onClick={() => onEdit(info)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            </motion.button>
          )}
          {canDelete && (
            <motion.button
              onClick={() => onDelete(info.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            </motion.button>
          )}
        </div>
      </div>

      {info.text && <p className="text-white text-sm sm:text-base mb-3 sm:mb-4 whitespace-pre-wrap">{info.text}</p>}

      {info.media && (
        <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden">
          {info.media.type === 'image' ? (
            <img src={info.media.url} alt="Image" className="w-full max-h-64 sm:max-h-96 object-contain bg-black/20" />
          ) : (
            <video src={info.media.url} controls className="w-full max-h-64 sm:max-h-96 bg-black/20" />
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10">
        <button
          onClick={() => setShowValidators(!showValidators)}
          className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm hover:text-gray-300 transition-colors"
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{validatorCount} vue{validatorCount > 1 ? 's' : ''}</span>
          {validatorCount > 0 && (
            showValidators ? (
              <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )
          )}
        </button>

        {!isValidated ? (
          <motion.button
            onClick={() => onValidate(info.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm"
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Marquer comme vu</span>
            <span className="sm:hidden">Vu</span>
          </motion.button>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2 text-green-400">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-xs sm:text-sm">Valide</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showValidators && validatorCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10"
          >
            <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 font-semibold flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Vu par {validatorCount} personne{validatorCount > 1 ? 's' : ''}
            </p>

            {loadingValidators ? (
              <div className="flex items-center justify-center py-3 sm:py-4">
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 animate-spin" />
                <span className="text-gray-500 ml-2 text-xs sm:text-sm">Chargement...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-36 sm:max-h-48 overflow-y-auto">
                {validatorsWithNames.map((validator, index) => (
                  <div
                    key={validator.odot || index}
                    className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2"
                  >
                    {validator.userAvatar ? (
                      <img
                        src={validator.userAvatar}
                        alt={validator.userName}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-green-500/50"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                        {validator.userName?.charAt(0) || '?'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs sm:text-sm font-medium truncate">
                        {validator.userName}
                      </p>
                      <p className="text-gray-500 text-[10px] sm:text-xs">
                        {formatValidationDate(validator.validatedAt)}
                      </p>
                    </div>

                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InfoCard;
