import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FilePlus } from 'lucide-react';
import SubFolder from './SubFolder.jsx';

const AdminView = ({
  employees,
  documentsByEmployee,
  expandedFolders,
  toggleFolder,
  expandedSubFolders,
  toggleSubFolder,
  groupDocumentsByType,
  openUploadModal,
  isAdmin,
  onDownload,
  onView,
  onDelete,
  formatDate,
  hasEmployeeViewed,
  getViewInfo
}) => {
  return (
    <div className="space-y-2">
      {employees.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Aucun employé trouvé
        </div>
      ) : (
        employees.map(employee => {
          const isExpanded = expandedFolders[employee.id];
          const employeeDocs = documentsByEmployee.find(e => e.employeeId === employee.id);
          const docCount = employeeDocs?.documents?.length || 0;
          const groupedDocs = employeeDocs ? groupDocumentsByType(employeeDocs.documents) : {};

          return (
            <div key={employee.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <button
                onClick={() => toggleFolder(employee.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                {isExpanded ? (
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                ) : (
                  <Folder className="w-5 h-5 text-amber-400" />
                )}

                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                  {employee.name?.charAt(0).toUpperCase() || '?'}
                </div>

                <div className="flex-1 text-left">
                  <p className="text-white font-medium">{employee.name}</p>
                  <p className="text-gray-500 text-xs">{employee.position || 'Employé'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm bg-white/10 px-3 py-1 rounded-full">
                    {docCount} doc{docCount > 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openUploadModal(employee)}
                          className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-white/20 hover:border-green-500/50 hover:bg-green-500/10 rounded-lg transition-all text-gray-400 hover:text-green-400"
                        >
                          <FilePlus className="w-4 h-4" />
                          <span className="text-sm">Ajouter un document</span>
                        </button>
                      </div>

                      {Object.keys(groupedDocs).length > 0 ? (
                        Object.entries(groupedDocs).map(([type, docs]) => (
                          <SubFolder
                            key={type}
                            employeeId={employee.id}
                            type={type}
                            docs={docs}
                            expandedSubFolders={expandedSubFolders}
                            toggleSubFolder={toggleSubFolder}
                            isAdmin={isAdmin}
                            onDownload={onDownload}
                            onView={onView}
                            onDelete={onDelete}
                            formatDate={formatDate}
                            hasEmployeeViewed={hasEmployeeViewed}
                            getViewInfo={getViewInfo}
                          />
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">
                          Aucun document
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AdminView;
