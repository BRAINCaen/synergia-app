import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FilePlus, Upload, File } from 'lucide-react';
import { DOCUMENT_TYPES } from '../../../../core/services/hrDocumentService.js';

const UploadModal = ({
  showUploadModal,
  setShowUploadModal,
  selectedEmployee,
  uploadForm,
  setUploadForm,
  uploadFile,
  handleFileSelect,
  handleUpload,
  uploading
}) => {
  return (
    <AnimatePresence>
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-green-400" />
                Ajouter un document
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {selectedEmployee && (
              <div className="bg-white/5 rounded-lg p-3 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {selectedEmployee.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedEmployee.name}</p>
                  <p className="text-gray-500 text-sm">{selectedEmployee.position || 'Employé'}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Type de document</label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                >
                  {Object.values(DOCUMENT_TYPES).map(type => (
                    <option key={type.id} value={type.id} className="bg-slate-900">
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Titre du document *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Ex: Bulletin de paie Janvier 2025"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Période concernée</label>
                <input
                  type="text"
                  value={uploadForm.period}
                  onChange={(e) => setUploadForm({ ...uploadForm, period: e.target.value })}
                  placeholder="Ex: Janvier 2025"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Description (optionnel)</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Notes ou informations supplémentaires..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Fichier *</label>
                <label className={`block border-2 border-dashed ${uploadFile ? 'border-green-500/50 bg-green-500/10' : 'border-white/20 hover:border-green-500/50'} rounded-xl p-6 text-center transition-colors cursor-pointer`}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploadFile ? (
                    <>
                      <File className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-green-400 font-medium text-sm">{uploadFile.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                      <p className="text-gray-400 text-xs mt-2">Cliquez pour changer de fichier</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Cliquez ou glissez un fichier ici</p>
                      <p className="text-gray-500 text-xs mt-1">PDF, DOC, DOCX, PNG, JPG (max 5 Mo)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadForm.title || !uploadFile || uploading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Ajouter
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
