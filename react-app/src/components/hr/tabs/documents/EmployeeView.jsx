import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Lock, FileText } from 'lucide-react';
import { DOCUMENT_TYPES } from '../../../../core/services/hrDocumentService.js';
import DocumentItem from './DocumentItem.jsx';

const EmployeeView = ({
  myDocuments,
  expandedSubFolders,
  setExpandedSubFolders,
  groupDocumentsByType,
  isAdmin,
  onDownload,
  onView,
  onDelete,
  formatDate,
  hasEmployeeViewed,
  getViewInfo
}) => {
  const groupedDocs = groupDocumentsByType(myDocuments);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-white font-medium">Mes documents personnels</p>
            <p className="text-gray-400 text-sm">Ces documents sont confidentiels et accessibles uniquement par vous et les administrateurs RH.</p>
          </div>
        </div>
      </div>

      {Object.keys(groupedDocs).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(groupedDocs).map(([type, docs]) => {
            const typeInfo = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.other;
            const isExpanded = expandedSubFolders[type];

            return (
              <div key={type} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                <button
                  onClick={() => setExpandedSubFolders(prev => ({ ...prev, [type]: !prev[type] }))}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                >
                  {isExpanded ? (
                    <FolderOpen className="w-5 h-5" style={{ color: typeInfo.color }} />
                  ) : (
                    <Folder className="w-5 h-5" style={{ color: typeInfo.color }} />
                  )}
                  <span className="text-2xl">{typeInfo.emoji}</span>
                  <span className="text-white font-medium flex-1 text-left">{typeInfo.folder}</span>
                  <span className="text-gray-400 text-sm bg-white/10 px-3 py-1 rounded-full">
                    {docs.length}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 p-4 space-y-2 overflow-hidden"
                    >
                      {docs.map(doc => (
                        <DocumentItem
                          key={doc.id}
                          doc={doc}
                          isAdmin={isAdmin}
                          onDownload={onDownload}
                          onView={onView}
                          onDelete={onDelete}
                          formatDate={formatDate}
                          hasEmployeeViewed={hasEmployeeViewed}
                          getViewInfo={getViewInfo}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">Aucun document</p>
          <p className="text-gray-500 text-sm">
            Vos bulletins de paie et autres documents apparaîtront ici.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeView;
