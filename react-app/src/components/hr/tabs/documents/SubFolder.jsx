import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { DOCUMENT_TYPES } from '../../../../core/services/hrDocumentService.js';
import DocumentItem from './DocumentItem.jsx';

const SubFolder = ({
  employeeId,
  type,
  docs,
  expandedSubFolders,
  toggleSubFolder,
  isAdmin,
  onDownload,
  onView,
  onDelete,
  formatDate,
  hasEmployeeViewed,
  getViewInfo
}) => {
  const key = `${employeeId}-${type}`;
  const isExpanded = expandedSubFolders[key];
  const typeInfo = DOCUMENT_TYPES[type] || DOCUMENT_TYPES.other;

  return (
    <div key={type} className="ml-4">
      <button
        onClick={() => toggleSubFolder(employeeId, type)}
        className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        {isExpanded ? (
          <FolderOpen className="w-4 h-4" style={{ color: typeInfo.color }} />
        ) : (
          <Folder className="w-4 h-4" style={{ color: typeInfo.color }} />
        )}
        <span className="text-gray-300 text-sm flex-1 text-left">
          {typeInfo.emoji} {typeInfo.folder}
        </span>
        <span className="text-gray-500 text-xs bg-white/10 px-2 py-0.5 rounded-full">
          {docs.length}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-4 space-y-1 overflow-hidden"
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
};

export default SubFolder;
