// ==========================================
// components/team/modals/MemberProfileModal.jsx
// MODAL PROFIL MEMBRE AVEC QUETES
// ==========================================

import React from 'react';
import { motion } from 'framer-motion';
import {
  X, Zap, Target, CheckCircle, Trophy, Clock, AlertCircle, Star, Calendar,
  MapPin, TrendingUp, Award, Edit
} from 'lucide-react';
import UserAvatar from '../../common/UserAvatar.jsx';

const MemberProfileModal = ({ member, isAdmin, onClose, onEdit }) => {
  if (!member) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 sm:gap-4">
            <UserAvatar
              user={member}
              size="xl"
              showBorder={true}
              className="shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl font-bold text-white truncate">{member.name}</h3>
              <p className="text-gray-400 text-sm sm:text-base">{member.role}</p>
              <p className="text-gray-500 text-xs sm:text-sm truncate">{member.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-yellow-500/10 rounded-xl p-3 sm:p-4 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-yellow-400 text-xs sm:text-sm">XP Total</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{member.totalXp?.toLocaleString() || 0}</div>
            <div className="text-xs text-gray-400 mt-1">Niveau {member.level || 1}</div>
          </div>

          <div className="bg-blue-500/10 rounded-xl p-3 sm:p-4 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <span className="text-blue-400 text-xs sm:text-sm">En cours</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{member.questsInProgress || 0}</div>
            <div className="text-xs text-gray-400 mt-1">quetes actives</div>
          </div>

          <div className="bg-green-500/10 rounded-xl p-3 sm:p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <span className="text-green-400 text-xs sm:text-sm">Accomplies</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{member.questsCompleted || 0}</div>
            <div className="text-xs text-gray-400 mt-1">quetes validees</div>
          </div>

          <div className="bg-purple-500/10 rounded-xl p-3 sm:p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span className="text-purple-400 text-xs sm:text-sm">Badges</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">{member.badgesCount || 0}</div>
            <div className="text-xs text-gray-400 mt-1">debloques</div>
          </div>
        </div>

        {/* Progression niveau */}
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 font-medium text-sm sm:text-base">Niveau {member.level || 1}</span>
            <span className="text-gray-400 text-xs sm:text-sm">
              {member.currentLevelXp || 0} / {member.nextLevelXpRequired || 100} XP
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${member.xpProgress || 0}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            {Math.round(member.xpProgress || 0)}% jusqu'au niveau suivant
          </div>
        </div>

        {/* Liste des quetes */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h4 className="text-base sm:text-lg font-bold text-white">
              Quetes assignees ({member.questsTotal || 0})
            </h4>
          </div>

          {(!member.quests || member.quests.length === 0) ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Aucune quete assignee pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {member.quests.map((quest) => {
                const statusConfig = {
                  'todo': { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Clock, label: 'A faire' },
                  'in_progress': { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Zap, label: 'En cours' },
                  'pending': { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: AlertCircle, label: 'En attente' },
                  'completed': { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle, label: 'Accomplie' },
                  'validated': { color: 'text-purple-400', bg: 'bg-purple-500/20', icon: Trophy, label: 'Validee' }
                };

                const config = statusConfig[quest.status] || statusConfig['todo'];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={quest.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="text-white font-medium mb-1">{quest.title}</h5>
                        {quest.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">{quest.description}</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${config.bg} ${config.color} text-xs font-medium ml-2`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                      {quest.priority && (
                        <span className={`flex items-center gap-1 ${
                          quest.priority === 'urgent' ? 'text-red-400' :
                          quest.priority === 'high' ? 'text-orange-400' :
                          quest.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          <AlertCircle className="w-3 h-3" />
                          {quest.priority}
                        </span>
                      )}
                      {quest.difficulty && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {quest.difficulty}
                        </span>
                      )}
                      {quest.xpReward && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Zap className="w-3 h-3" />
                          +{quest.xpReward} XP
                        </span>
                      )}
                      {quest.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(quest.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informations supplementaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h5 className="text-white font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="w-4 h-4 text-gray-400" />
              Informations
            </h5>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Departement:</span>
                <span className="text-white">{member.department || 'Non specifie'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Statut:</span>
                <span className={`font-medium ${
                  member.status === 'actif' ? 'text-green-400' :
                  member.status === 'suspendu' ? 'text-orange-400' :
                  member.status === 'bloque' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {member.status || 'actif'}
                </span>
              </div>
              {member.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Telephone:</span>
                  <span className="text-white">{member.phone}</span>
                </div>
              )}
              {member.location && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Localisation:</span>
                  <span className="text-white">{member.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h5 className="text-white font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              Performance
            </h5>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Taux de completion:</span>
                <span className="text-white font-medium">{member.completionRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">XP cette semaine:</span>
                <span className="text-yellow-400 font-medium">+{member.weeklyXp || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">XP ce mois:</span>
                <span className="text-yellow-400 font-medium">+{member.monthlyXp || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Derniere activite:</span>
                <span className="text-white">
                  {member.lastActivity
                    ? new Date(member.lastActivity).toLocaleDateString()
                    : 'Inconnue'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {member.badges && member.badges.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 mt-4 border border-white/10">
            <h5 className="text-white font-medium mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Award className="w-4 h-4 text-gray-400" />
              Badges debloques ({member.badges.length})
            </h5>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {member.badges.slice(0, 12).map((badge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-2 sm:p-3 flex items-center gap-2"
                  title={badge.name || badge}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {typeof badge === 'string' ? badge : badge.name || 'Badge'}
                  </span>
                </div>
              ))}
              {member.badges.length > 12 && (
                <div className="bg-white/5 rounded-xl p-2 sm:p-3 flex items-center justify-center text-gray-400 text-xs sm:text-sm border border-white/10">
                  +{member.badges.length - 12} autres
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions admin */}
        {isAdmin && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors text-sm sm:text-base"
            >
              <Edit className="w-5 h-5" />
              Modifier le profil
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MemberProfileModal;
