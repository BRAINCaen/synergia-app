// ==========================================
// 📁 components/hr/tabs/DocumentsTab.jsx
// ONGLET DOCUMENTS RH
// ==========================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import hrDocumentService from '../../../core/services/hrDocumentService.js';
import GlassCard from '../GlassCard.jsx';

// Sous-composants
import { AdminView, EmployeeView, UploadModal } from './documents';

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

        {isAdmin ? (
          <AdminView
            employees={employees}
            documentsByEmployee={documentsByEmployee}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            expandedSubFolders={expandedSubFolders}
            toggleSubFolder={toggleSubFolder}
            groupDocumentsByType={groupDocumentsByType}
            openUploadModal={openUploadModal}
            isAdmin={isAdmin}
            onDownload={handleDownloadDocument}
            onView={handleViewDocument}
            onDelete={handleDeleteDocument}
            formatDate={formatDate}
            hasEmployeeViewed={hasEmployeeViewed}
            getViewInfo={getViewInfo}
          />
        ) : (
          <EmployeeView
            myDocuments={myDocuments}
            expandedSubFolders={expandedSubFolders}
            setExpandedSubFolders={setExpandedSubFolders}
            groupDocumentsByType={groupDocumentsByType}
            isAdmin={isAdmin}
            onDownload={handleDownloadDocument}
            onView={handleViewDocument}
            onDelete={handleDeleteDocument}
            formatDate={formatDate}
            hasEmployeeViewed={hasEmployeeViewed}
            getViewInfo={getViewInfo}
          />
        )}
      </GlassCard>

      <UploadModal
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        selectedEmployee={selectedEmployee}
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        uploadFile={uploadFile}
        handleFileSelect={handleFileSelect}
        handleUpload={handleUpload}
        uploading={uploading}
      />
    </motion.div>
  );
};

export default DocumentsTab;
