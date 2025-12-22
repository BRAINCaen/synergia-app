// ==========================================
// 📄 react-app/src/core/services/payslipReaderService.js
// SERVICE DE LECTURE AUTOMATIQUE DES BULLETINS DE PAIE
// Extraction OCR des congés payés et mise à jour des compteurs
// ==========================================

import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// Configurer le worker PDF.js avec unpkg CDN (meilleur CORS)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * 📊 PATTERNS DE RECHERCHE POUR BULLETINS DE PAIE FRANÇAIS
 * Les bulletins de paie français ont des formats variés mais suivent des conventions
 */
const PAYSLIP_PATTERNS = {
  // Congés payés acquis (CP N)
  cpAcquis: [
    /CP\s*(?:N|acquis)\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Cong[eé]s\s*(?:payés\s*)?acquis\s*[:\s]*(\d+[.,]?\d*)/i,
    /Acquis\s*CP\s*[:\s]*(\d+[.,]?\d*)/i,
    /Droits\s*acquis\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /CP\s*ACQUIS\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // Congés payés restants / Solde
  cpSolde: [
    /Solde\s*(?:CP|cong[eé]s)\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /CP\s*(?:restants?|disponibles?)\s*[:\s]*(\d+[.,]?\d*)/i,
    /Reste\s*(?:à\s*prendre\s*)?[:\s]*(\d+[.,]?\d*)\s*j/i,
    /SOLDE\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Disponible\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Total\s*disponible\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // CP N-1 (année précédente)
  cpN1: [
    /CP\s*N-1\s*[:\s]*(\d+[.,]?\d*)/i,
    /Cong[eé]s\s*N-1\s*[:\s]*(\d+[.,]?\d*)/i,
    /Report\s*N-1\s*[:\s]*(\d+[.,]?\d*)/i,
    /Ancien\s*solde\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // CP pris
  cpPris: [
    /CP\s*pris\s*[:\s]*(\d+[.,]?\d*)/i,
    /Cong[eé]s\s*pris\s*[:\s]*(\d+[.,]?\d*)/i,
    /Pris\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Jours\s*pris\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // RTT
  rtt: [
    /RTT\s*(?:acquis|disponibles?|solde)\s*[:\s]*(\d+[.,]?\d*)/i,
    /Solde\s*RTT\s*[:\s]*(\d+[.,]?\d*)/i,
    /RTT\s*[:\s]*(\d+[.,]?\d*)\s*j/i
  ],

  // Période du bulletin
  periode: [
    /P[eé]riode\s*[:\s]*(\w+\s*\d{4})/i,
    /Mois\s*[:\s]*(\w+\s*\d{4})/i,
    /Bulletin\s*(?:du\s*)?(\w+\s*\d{4})/i,
    /(\d{2}\/\d{4})/,
    /(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s*\d{4}/i
  ]
};

/**
 * 📄 SERVICE DE LECTURE DE BULLETINS DE PAIE
 */
class PayslipReaderService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    console.log('📄 PayslipReaderService initialisé');
  }

  // ==========================================
  // 🔧 INITIALISATION OCR
  // ==========================================

  /**
   * Initialiser le worker Tesseract pour l'OCR
   */
  async initializeOCR() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initialisation OCR Tesseract...');

      this.worker = await Tesseract.createWorker('fra', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`📊 OCR: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      this.isInitialized = true;
      console.log('✅ OCR Tesseract initialisé (français)');
    } catch (error) {
      console.error('❌ Erreur initialisation OCR:', error);
      throw error;
    }
  }

  /**
   * Terminer le worker OCR
   */
  async terminateOCR() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('🔚 Worker OCR terminé');
    }
  }

  // ==========================================
  // 📖 EXTRACTION DE TEXTE
  // ==========================================

  /**
   * Extraire le texte d'une image via OCR
   * @param {File|Blob|string} image - Image ou URL
   * @returns {Promise<string>} Texte extrait
   */
  async extractTextFromImage(image) {
    try {
      await this.initializeOCR();

      console.log('📖 Extraction du texte via OCR...');
      const startTime = Date.now();

      const { data: { text } } = await this.worker.recognize(image);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Texte extrait en ${duration}s (${text.length} caractères)`);

      return text;
    } catch (error) {
      console.error('❌ Erreur extraction texte:', error);
      throw error;
    }
  }

  /**
   * Convertir un fichier en data URL pour l'OCR
   */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convertir un fichier en ArrayBuffer
   */
  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // ==========================================
  // 📄 CONVERSION PDF EN IMAGES
  // ==========================================

  /**
   * Vérifier si le fichier est un PDF
   */
  isPDF(file) {
    return file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
  }

  /**
   * Convertir un PDF en images (une par page)
   * @param {File} file - Fichier PDF
   * @param {number} scale - Échelle de rendu (2 = 2x résolution)
   * @returns {Promise<string[]>} Array de data URLs des pages
   */
  async convertPDFToImages(file, scale = 2) {
    try {
      console.log('📄 Conversion PDF en images...');

      // Charger le PDF
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      console.log(`📄 PDF chargé: ${pdf.numPages} page(s)`);

      const images = [];

      // Convertir chaque page en image
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📄 Rendu page ${pageNum}/${pdf.numPages}...`);

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Créer un canvas pour le rendu
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Rendre la page sur le canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        // Convertir le canvas en image data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        images.push(imageDataUrl);

        // Nettoyer
        page.cleanup();
      }

      console.log(`✅ PDF converti: ${images.length} image(s)`);
      return images;

    } catch (error) {
      console.error('❌ Erreur conversion PDF:', error);
      throw new Error(`Impossible de lire le PDF: ${error.message}`);
    }
  }

  /**
   * Extraire le texte d'un PDF (toutes les pages)
   * @param {File} file - Fichier PDF
   * @returns {Promise<string>} Texte extrait de toutes les pages
   */
  async extractTextFromPDF(file) {
    try {
      console.log('📄 Extraction texte du PDF via OCR...');

      // Convertir le PDF en images
      const images = await this.convertPDFToImages(file);

      // Extraire le texte de chaque image
      let fullText = '';
      for (let i = 0; i < images.length; i++) {
        console.log(`📖 OCR page ${i + 1}/${images.length}...`);
        const pageText = await this.extractTextFromImage(images[i]);
        fullText += pageText + '\n\n--- Page suivante ---\n\n';
      }

      return fullText.trim();

    } catch (error) {
      console.error('❌ Erreur extraction texte PDF:', error);
      throw error;
    }
  }

  // ==========================================
  // 🔍 PARSING DES DONNÉES
  // ==========================================

  /**
   * Parser le texte extrait pour trouver les données de congés
   * @param {string} text - Texte extrait du bulletin
   * @returns {Object} Données de congés extraites
   */
  parsePayslipData(text) {
    console.log('🔍 Analyse du bulletin de paie...');

    // Nettoyer le texte
    const cleanText = text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[|]/g, ' ')
      .trim();

    const result = {
      cpAcquis: null,      // Congés acquis (période en cours)
      cpSolde: null,       // Solde total de CP disponibles
      cpN1: null,          // CP de l'année N-1
      cpPris: null,        // CP déjà pris
      rtt: null,           // Solde RTT
      periode: null,       // Période du bulletin
      rawMatches: [],      // Tous les matches trouvés (pour debug)
      confidence: 0        // Score de confiance
    };

    // Rechercher chaque type de donnée
    for (const [key, patterns] of Object.entries(PAYSLIP_PATTERNS)) {
      for (const pattern of patterns) {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
          const value = match[1].replace(',', '.');
          const numValue = parseFloat(value);

          result.rawMatches.push({
            type: key,
            pattern: pattern.toString(),
            match: match[0],
            value: numValue || value
          });

          // Ne garder que la première valeur trouvée pour chaque type
          if (result[key] === null) {
            if (key === 'periode') {
              result[key] = value;
            } else {
              result[key] = numValue;
            }
          }
        }
      }
    }

    // Calculer le score de confiance
    let foundFields = 0;
    if (result.cpSolde !== null) foundFields += 2; // Champ principal
    if (result.cpAcquis !== null) foundFields += 1;
    if (result.cpN1 !== null) foundFields += 1;
    if (result.cpPris !== null) foundFields += 1;
    if (result.rtt !== null) foundFields += 1;
    if (result.periode !== null) foundFields += 1;

    result.confidence = Math.min(100, Math.round((foundFields / 7) * 100));

    // Si on n'a pas de solde mais on a acquis et pris, calculer
    if (result.cpSolde === null && result.cpAcquis !== null) {
      const pris = result.cpPris || 0;
      const n1 = result.cpN1 || 0;
      result.cpSolde = result.cpAcquis + n1 - pris;
      result.calculated = true;
    }

    console.log('📊 Données extraites:', {
      cpSolde: result.cpSolde,
      cpAcquis: result.cpAcquis,
      cpN1: result.cpN1,
      cpPris: result.cpPris,
      rtt: result.rtt,
      periode: result.periode,
      confidence: result.confidence + '%'
    });

    return result;
  }

  /**
   * Recherche avancée avec patterns additionnels
   */
  advancedSearch(text) {
    const results = [];

    // Rechercher tous les nombres suivis de "j" ou "jours"
    const joursPattern = /(\d+[.,]?\d*)\s*(?:j(?:ours?)?|J)/g;
    let match;
    while ((match = joursPattern.exec(text)) !== null) {
      const context = text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 10);
      results.push({
        value: parseFloat(match[1].replace(',', '.')),
        context: context.trim()
      });
    }

    // Rechercher "CP" suivi d'un nombre
    const cpPattern = /CP\s*[:\s]*(\d+[.,]?\d*)/gi;
    while ((match = cpPattern.exec(text)) !== null) {
      const context = text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20);
      results.push({
        type: 'CP',
        value: parseFloat(match[1].replace(',', '.')),
        context: context.trim()
      });
    }

    return results;
  }

  // ==========================================
  // 📤 TRAITEMENT COMPLET D'UN BULLETIN
  // ==========================================

  /**
   * Traiter un bulletin de paie complet
   * @param {File} file - Fichier image du bulletin
   * @param {string} employeeId - ID de l'employé
   * @param {Function} progressCallback - Callback de progression
   * @returns {Promise<Object>} Résultat du traitement
   */
  async processPayslip(file, employeeId, progressCallback = () => {}) {
    try {
      progressCallback({ step: 'init', progress: 0, message: 'Initialisation...' });

      // Vérifier le type de fichier
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
      if (!validTypes.includes(file.type) && !this.isPDF(file)) {
        throw new Error(`Type de fichier non supporté: ${file.type}. Utilisez JPG, PNG ou PDF.`);
      }

      let text = '';

      // Traitement différent selon le type de fichier
      if (this.isPDF(file)) {
        // ==========================================
        // 📄 TRAITEMENT PDF
        // ==========================================
        progressCallback({ step: 'pdf', progress: 10, message: 'Lecture du PDF...' });

        // Convertir le PDF en images
        const images = await this.convertPDFToImages(file, 2.5); // Scale 2.5 pour bonne qualité

        progressCallback({ step: 'ocr', progress: 30, message: `OCR de ${images.length} page(s)...` });

        // Extraire le texte de chaque page
        for (let i = 0; i < images.length; i++) {
          const pageProgress = 30 + (40 * (i + 1) / images.length);
          progressCallback({
            step: 'ocr',
            progress: Math.round(pageProgress),
            message: `OCR page ${i + 1}/${images.length}...`
          });

          const pageText = await this.extractTextFromImage(images[i]);
          text += pageText + '\n\n';
        }

        console.log(`✅ PDF traité: ${images.length} page(s), ${text.length} caractères extraits`);

      } else {
        // ==========================================
        // 🖼️ TRAITEMENT IMAGE
        // ==========================================
        progressCallback({ step: 'ocr', progress: 10, message: 'Préparation OCR...' });

        // Convertir en data URL si nécessaire
        let imageData = file;
        if (file instanceof File) {
          imageData = await this.fileToDataURL(file);
        }

        progressCallback({ step: 'ocr', progress: 20, message: 'Extraction du texte (OCR)...' });

        // Extraire le texte
        text = await this.extractTextFromImage(imageData);
      }

      progressCallback({ step: 'parsing', progress: 70, message: 'Analyse des données...' });

      // Parser les données
      const payslipData = this.parsePayslipData(text);

      // Recherche avancée pour plus de contexte
      const advancedResults = this.advancedSearch(text);

      progressCallback({ step: 'validation', progress: 85, message: 'Validation des données...' });

      // Construire le résultat
      const result = {
        success: true,
        employeeId,
        fileName: file.name,
        fileSize: file.size,
        processedAt: new Date().toISOString(),
        extractedData: payslipData,
        advancedResults,
        rawText: text.substring(0, 500) + '...', // Aperçu du texte
        recommendations: []
      };

      // Ajouter des recommandations basées sur la confiance
      if (payslipData.confidence < 30) {
        result.recommendations.push('⚠️ Faible confiance - Vérifiez manuellement les données');
        result.recommendations.push('💡 Essayez avec une image plus nette ou un scan de meilleure qualité');
      } else if (payslipData.confidence < 60) {
        result.recommendations.push('⚡ Confiance moyenne - Vérification recommandée');
      }

      if (payslipData.cpSolde === null) {
        result.recommendations.push('❌ Solde CP non détecté - Entrez la valeur manuellement');
      }

      progressCallback({ step: 'done', progress: 100, message: 'Terminé !' });

      return result;

    } catch (error) {
      console.error('❌ Erreur traitement bulletin:', error);
      return {
        success: false,
        error: error.message,
        employeeId,
        fileName: file?.name
      };
    }
  }

  // ==========================================
  // 💾 MISE À JOUR DES COMPTEURS
  // ==========================================

  /**
   * Mettre à jour les compteurs de congés d'un employé
   * @param {string} employeeId - ID de l'employé
   * @param {Object} data - Données extraites du bulletin
   * @param {Object} options - Options de mise à jour
   */
  async updateLeaveBalance(employeeId, data, options = {}) {
    try {
      const { cpSolde, cpN1, rtt, periode } = data;
      const { overwrite = false, source = 'payslip_scan' } = options;

      // Récupérer le solde actuel
      const userRef = doc(db, 'users', employeeId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'Employé non trouvé' };
      }

      const currentBalance = userDoc.data().leaveBalance || {};

      // Préparer les mises à jour
      const updates = {
        'leaveBalance.lastUpdated': new Date().toISOString(),
        'leaveBalance.lastScanDate': new Date().toISOString(),
        'leaveBalance.lastScanPeriod': periode || null,
        'leaveBalance.lastScanSource': source
      };

      // Mettre à jour les valeurs si présentes
      if (cpSolde !== null) {
        if (overwrite || !currentBalance.paidLeaveDays) {
          updates['leaveBalance.paidLeaveDays'] = cpSolde;
        } else {
          // Ne mettre à jour que si la valeur scannée est différente
          if (Math.abs(currentBalance.paidLeaveDays - cpSolde) > 0.5) {
            updates['leaveBalance.paidLeaveDays'] = cpSolde;
            updates['leaveBalance.previousPaidLeaveDays'] = currentBalance.paidLeaveDays;
          }
        }
      }

      if (cpN1 !== null) {
        updates['leaveBalance.paidLeaveN1'] = cpN1;
      }

      if (rtt !== null) {
        if (overwrite || !currentBalance.rttDays) {
          updates['leaveBalance.rttDays'] = rtt;
        }
      }

      // Appliquer les mises à jour
      await updateDoc(userRef, updates);

      console.log(`✅ Compteurs mis à jour pour ${employeeId}:`, updates);

      return {
        success: true,
        employeeId,
        updates,
        previousBalance: currentBalance,
        newBalance: {
          paidLeaveDays: updates['leaveBalance.paidLeaveDays'] ?? currentBalance.paidLeaveDays,
          rttDays: updates['leaveBalance.rttDays'] ?? currentBalance.rttDays
        }
      };

    } catch (error) {
      console.error('❌ Erreur mise à jour compteurs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Traiter et mettre à jour automatiquement
   * Combine processPayslip + updateLeaveBalance
   */
  async processAndUpdateBalance(file, employeeId, progressCallback = () => {}) {
    // Traiter le bulletin
    const result = await this.processPayslip(file, employeeId, progressCallback);

    if (!result.success) {
      return result;
    }

    // Si on a des données de CP, proposer la mise à jour
    if (result.extractedData.cpSolde !== null) {
      result.canUpdateBalance = true;
      result.proposedUpdate = {
        paidLeaveDays: result.extractedData.cpSolde,
        rttDays: result.extractedData.rtt,
        periode: result.extractedData.periode
      };
    } else {
      result.canUpdateBalance = false;
    }

    return result;
  }

  // ==========================================
  // 🔧 UTILITAIRES
  // ==========================================

  /**
   * Valider manuellement une extraction
   */
  validateExtraction(extractedData, manualData) {
    const validated = { ...extractedData };

    if (manualData.cpSolde !== undefined) {
      validated.cpSolde = manualData.cpSolde;
      validated.manuallyValidated = true;
    }

    if (manualData.rtt !== undefined) {
      validated.rtt = manualData.rtt;
    }

    validated.validatedAt = new Date().toISOString();
    validated.confidence = 100; // Manuel = 100% confiance

    return validated;
  }

  /**
   * Obtenir un aperçu des capacités OCR
   */
  getCapabilities() {
    return {
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
      supportedLanguages: ['fra'],
      extractableFields: [
        'Congés payés acquis (CP N)',
        'Solde congés payés',
        'CP N-1 (report année précédente)',
        'CP pris',
        'RTT',
        'Période du bulletin'
      ],
      recommendations: [
        'Utilisez des images de haute qualité (300 DPI minimum)',
        'Évitez les photos floues ou avec des reflets',
        'Les scans PDF fonctionnent mieux que les photos',
        'Le format paysage est souvent mieux reconnu'
      ]
    };
  }
}

// Créer et exporter l'instance du service
const payslipReaderService = new PayslipReaderService();
export default payslipReaderService;
