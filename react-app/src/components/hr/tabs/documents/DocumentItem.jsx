import React from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Trash2, CheckCircle, AlertTriangle, File } from 'lucide-react';
import { DOCUMENT_TYPES } from '../../../../core/services/hrDocumentService.js';

const DocumentItem = ({
  doc,
  isAdmin,
  onDownload,
  onView,
  onDelete,
  formatDate,
  hasEmployeeViewed,
  getViewInfo
}) => {
  const viewed = hasEmployeeViewed(doc);
  const viewInfo = getViewInfo(doc);

  return (
    <motion.div
      key={doc.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${DOCUMENT_TYPES[doc.type]?.color}20` }}>
          <File className="w-4 h-4" style={{ color: DOCUMENT_TYPES[doc.type]?.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{doc.title}</p>
          <p className="text-gray-500 text-xs">
            {doc.period && <span className="mr-2">{doc.period}</span>}
            <span>{formatDate(doc.createdAt)}</span>
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex items-center mr-3">
          {viewed ? (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full cursor-help"
              title={`Vu le ${viewInfo?.lastViewedAt ? new Date(viewInfo.lastViewedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}`}
            >
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Vu</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full"
              title="L'employé n'a pas encore consulté ce document"
            >
              <AlertTriangle className="w-3 h-3 text-orange-400" />
              <span className="text-orange-400 text-xs">Non vu</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDownload(doc)}
          className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors"
          title="Télécharger"
        >
          <Download className="w-4 h-4 text-blue-400" />
        </button>
        <button
          onClick={() => onView(doc)}
          className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors"
          title="Voir"
        >
          <Eye className="w-4 h-4 text-green-400" />
        </button>
        {isAdmin && (
          <button
            onClick={() => onDelete(doc.id)}
            className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentItem;
