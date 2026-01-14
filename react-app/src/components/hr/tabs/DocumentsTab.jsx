// ==========================================
// 📁 components/hr/tabs/DocumentsTab.jsx
// ONGLET DOCUMENTS RH
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Upload, Eye, Trash2, CheckCircle, AlertTriangle, RefreshCw,
  X, ChevronRight, ChevronDown, Folder, FolderOpen, File, FilePlus,
  FileText, Lock
} from 'lucide-react';
import hrDocumentService, { DOCUMENT_TYPES } from '../../../core/services/hrDocumentService.js';
import GlassCard from '../GlassCard.jsx';

const DocumentsTab = ({ documents, employees, onRefresh, currentUser, isAdmin }) => {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [expandedSubFolders, setExpandedSubFolders] = useState({});
  const [documentsByEmployee, setDocumentsByEmployee] = useState([]);
  const [myDocuments, setMyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    type: 'payslip',
    title: '',
    description: '',
    period: '',
    fileName: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  // Charger les documents
  useEffect(() => {
    if (!currentUser?.uid) return;

    setLoading(true);

    if (isAdmin) {
      const unsubscribe = hrDocumentService.subscribeToAllDocuments((docs) => {
        setDocumentsByEmployee(docs);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const unsubscribe = hrDocumentService.subscribeToEmployeeDocuments(currentUser.uid, (docs) => {
        setMyDocuments(docs);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentUser?.uid, isAdmin]);

  // Toggle dossier employé
  const toggleFolder = (employeeId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  // Toggle sous-dossier (type de document)
  const toggleSubFolder = (employeeId, type) => {
    const key = `${employeeId}-${type}`;
    setExpandedSubFolders(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Ouvrir modal upload
  const openUploadModal = (employee) => {
    setSelectedEmployee(employee);
    setUploadForm({
      type: 'payslip',
      title: '',
      description: '',
      period: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      fileName: ''
    });
    setUploadFile(null);
    setShowUploadModal(true);
  };

  // Handler pour la sélection de fichier
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ Le fichier est trop volumineux (max 5 Mo)');
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Type de fichier non autorisé. Utilisez PDF, DOC, DOCX, PNG ou JPG.');
        return;
      }
      setUploadFile(file);
      if (!uploadForm.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setUploadForm(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  // Convertir un fichier en base64 Data URL
  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Upload du document
  const handleUpload = async () => {
    if (!selectedEmployee || !uploadForm.title || !uploadFile) {
      alert('❌ Veuillez remplir tous les champs obligatoires et sélectionner un fichier');
      return;
    }

    if (uploadFile.size > 5 * 1024 * 1024) {
      alert('❌ Le fichier est trop volumineux pour le stockage (max 5 Mo).');
      return;
    }

    setUploading(true);
    try {
      const fileDataUrl = await fileToDataURL(uploadFile);

      const result = await hrDocumentService.createDocument({
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        type: uploadForm.type,
        title: uploadForm.title,
        description: uploadForm.description,
        period: uploadForm.period,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        mimeType: uploadFile.type,
        fileUrl: fileDataUrl,
        uploadedBy: currentUser.uid,
        uploadedByName: currentUser.displayName || currentUser.email
      });

      if (result.success) {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadForm({ type: 'payslip', title: '', description: '', period: '' });
        alert('✅ Document ajouté avec succès !');
      } else {
        alert('❌ Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('❌ Erreur lors de l\'upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Supprimer un document
  const handleDeleteDocument = async (docId) => {
    if (!confirm('Supprimer ce document ?')) return;
    await hrDocumentService.deleteDocument(docId, isAdmin);
  };

  // Convertir une Data URL en Blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Télécharger un document
  const handleDownloadDocument = async (doc) => {
    await hrDocumentService.markAsViewed(
      doc.id,
      currentUser.uid,
      currentUser.displayName || currentUser.email
    );

    if (doc.fileUrl) {
      try {
        if (doc.fileUrl.startsWith('data:')) {
          const blob = dataURLtoBlob(doc.fileUrl);
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = doc.fileName || 'document';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        } else {
          const link = document.createElement('a');
          link.href = doc.fileUrl;
          link.download = doc.fileName || 'document';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('Erreur téléchargement:', error);
        alert('❌ Erreur lors du téléchargement du fichier');
      }
    } else {
      alert('❌ Le fichier n\'est pas disponible.');
    }
  };

  // Visualiser un document
  const handleViewDocument = async (doc) => {
    await hrDocumentService.markAsViewed(
      doc.id,
      currentUser.uid,
      currentUser.displayName || currentUser.email
    );

    if (doc.fileUrl) {
      try {
        if (doc.fileUrl.startsWith('data:')) {
          const blob = dataURLtoBlob(doc.fileUrl);
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, '_blank');
        } else {
          window.open(doc.fileUrl, '_blank');
        }
      } catch (error) {
        console.error('Erreur visualisation:', error);
        alert('❌ Erreur lors de l\'ouverture du fichier');
      }
    } else {
      alert('❌ Le fichier n\'est pas disponible.');
    }
  };

  // Vérifier si l'employé a vu le document
  const hasEmployeeViewed = (doc) => {
    if (!doc.viewedBy || !Array.isArray(doc.viewedBy)) return false;
    return doc.viewedBy.some(v => v.userId === doc.employeeId);
  };

  // Obtenir les infos de consultation
  const getViewInfo = (doc) => {
    if (!doc.viewedBy || !Array.isArray(doc.viewedBy)) return null;
    const employeeView = doc.viewedBy.find(v => v.userId === doc.employeeId);
    if (!employeeView) return null;
    return employeeView;
  };

  // Grouper les documents par type
  const groupDocumentsByType = (docs) => {
    const grouped = {};
    docs.forEach(doc => {
      if (!grouped[doc.type]) {
        grouped[doc.type] = [];
      }
      grouped[doc.type].push(doc);
    });
    return grouped;
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Rendu d'un document
  const renderDocument = (doc) => {
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
            onClick={() => handleDownloadDocument(doc)}
            className="p-1.5 hover:bg-blue-500/20 rounded-lg transition-colors"
            title="Télécharger"
          >
            <Download className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={() => handleViewDocument(doc)}
            className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors"
            title="Voir"
          >
            <Eye className="w-4 h-4 text-green-400" />
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDeleteDocument(doc.id)}
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

  // Rendu d'un sous-dossier (type de document)
  const renderSubFolder = (employeeId, type, docs) => {
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
              {docs.map(doc => renderDocument(doc))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Vue ADMIN : tous les employés avec leurs dossiers
  const renderAdminView = () => (
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
                        Object.entries(groupedDocs).map(([type, docs]) =>
                          renderSubFolder(employee.id, type, docs)
                        )
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

  // Vue EMPLOYÉ : ses propres documents uniquement
  const renderEmployeeView = () => {
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
                        {docs.map(doc => renderDocument(doc))}
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

  if (loading) {
    return (
      <motion.div
        key="documents"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="documents"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Documents RH</h2>
            <p className="text-gray-400">
              {isAdmin ? 'Bulletins de paie, contrats et documents par salarié' : 'Mes documents personnels'}
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={onRefresh}
                className="bg-gray-700/50 hover:bg-gray-600/50 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          )}
        </div>

        {isAdmin ? renderAdminView() : renderEmployeeView()}
      </GlassCard>

      {/* Modal Upload Document */}
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
    </motion.div>
  );
};

export default DocumentsTab;
