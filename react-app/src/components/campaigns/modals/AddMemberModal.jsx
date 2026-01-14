// ==========================================
// 📁 components/campaigns/modals/AddMemberModal.jsx
// MODAL AJOUT MEMBRE À CAMPAGNE
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, XCircle, Search, Users, Plus } from 'lucide-react';
import UserAvatar from '../../common/UserAvatar.jsx';

const AddMemberModal = ({
  show,
  onClose,
  searchTerm,
  onSearchChange,
  availableUsers,
  onAddMember
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-purple-400" />
              Ajouter un membre à l'équipe
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Recherche */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {availableUsers.length} utilisateur(s) disponible(s)
            </p>
          </div>

          {/* Liste des utilisateurs disponibles */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchTerm
                    ? 'Aucun utilisateur trouvé'
                    : "Tous les utilisateurs sont déjà membres de l'équipe"
                  }
                </p>
              </div>
            ) : (
              availableUsers.map((userItem) => (
                <div
                  key={userItem.id}
                  className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                  onClick={() => onAddMember(userItem.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <UserAvatar
                      user={userItem}
                      size="lg"
                      showBorder={true}
                      className="flex-shrink-0"
                    />

                    {/* Info utilisateur */}
                    <div className="flex-1">
                      <h4 className="font-bold text-white">
                        {userItem.displayName || 'Utilisateur'}
                      </h4>
                      <p className="text-sm text-gray-400">{userItem.email}</p>
                      {userItem.synergia_role && (
                        <span className="text-xs text-purple-400">
                          {userItem.synergia_role}
                        </span>
                      )}
                    </div>

                    {/* Bouton ajouter */}
                    <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddMemberModal;
