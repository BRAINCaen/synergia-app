// ==========================================
// 📁 components/campaigns/modals/LinkQuestModal.jsx
// MODAL LIAISON QUÊTE À CAMPAGNE
// ==========================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, XCircle, Search, Sword, Plus } from 'lucide-react';

const LinkQuestModal = ({
  show,
  onClose,
  searchTerm,
  onSearchChange,
  availableQuests,
  onLinkQuest
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
              <LinkIcon className="h-6 w-6 text-blue-400" />
              Lier une quête existante
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
                placeholder="Rechercher une quête..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {availableQuests.length} quête(s) disponible(s)
            </p>
          </div>

          {/* Liste des quêtes disponibles */}
          <div className="space-y-3">
            {availableQuests.length === 0 ? (
              <div className="text-center py-12">
                <Sword className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {searchTerm
                    ? 'Aucune quête trouvée'
                    : 'Aucune quête disponible (toutes sont déjà liées à des campagnes)'
                  }
                </p>
              </div>
            ) : (
              availableQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                  onClick={() => onLinkQuest(quest.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{quest.title}</h4>
                      {quest.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{quest.description}</p>
                      )}
                    </div>
                    <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
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

export default LinkQuestModal;
