// ==========================================
// 📄 react-app/src/core/services/payslipReaderService.js
// SERVICE DE LECTURE AUTOMATIQUE DES BULLETINS DE PAIE
// Extraction OCR des congés payés et mise à jour des compteurs
// ==========================================

import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// Configurer le worker PDF.js
// Utiliser plusieurs CDN avec fallback
const PDF_WORKER_URLS = [
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
];

let workerInitialized = false;
let workerInitPromise = null;

// Tester et utiliser le premier CDN disponible
async function initPDFWorker() {
  // Ne pas réinitialiser si déjà fait
  if (workerInitialized) return;

  // Si l'init est en cours, attendre
  if (workerInitPromise) return workerInitPromise;

  workerInitPromise = (async () => {
    for (const url of PDF_WORKER_URLS) {
      try {
        const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
        if (response.ok) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = url;
          console.log('✅ PDF.js worker configuré:', url);
          workerInitialized = true;
          return;
        }
      } catch (e) {
        console.warn(`⚠️ CDN non disponible: ${url}`);
      }
    }
    // Fallback: désactiver le worker (fonctionne mais plus lent)
    console.warn('⚠️ Aucun CDN disponible, mode sans worker (main thread)');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    workerInitialized = true;
  })();

  return workerInitPromise;
}

// Pré-initialiser au chargement du module
initPDFWorker();

/**
 * 📊 PATTERNS DE RECHERCHE POUR BULLETINS DE PAIE FRANÇAIS
 * Les bulletins de paie français ont des formats variés mais suivent des conventions
 */
const PAYSLIP_PATTERNS = {
  // Congés payés acquis (CP N)
  cpAcquis: [
    /CP\s*(?:N|acquis)\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Cong[eé]s\s*(?:pay[eé]s\s*)?acquis\s*[:\s]*(\d+[.,]?\d*)/i,
    /Acquis\s*(?:CP|cong[eé]s)\s*[:\s]*(\d+[.,]?\d*)/i,
    /Droits\s*acquis\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /CP\s*ACQUIS\s*[:\s]*(\d+[.,]?\d*)/i,
    /ACQUIS\s*[:\s]*(\d+[.,]?\d*)/i,
    /Nb\s*jours\s*acquis\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // Congés payés restants / Solde (PRIORITAIRE)
  cpSolde: [
    /Solde\s*(?:CP|cong[eé]s?\s*pay[eé]s?)\s*[:\s]*(\d+[.,]?\d*)/i,
    /CP\s*(?:restants?|disponibles?)\s*[:\s]*(\d+[.,]?\d*)/i,
    /Reste\s*(?:[àa]\s*prendre\s*)?[:\s]*(\d+[.,]?\d*)\s*j/i,
    /SOLDE\s*(?:CP\s*)?[:\s]*(\d+[.,]?\d*)/i,
    /Disponible[s]?\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Total\s*(?:CP\s*)?disponible\s*[:\s]*(\d+[.,]?\d*)/i,
    /Droit\s*CP\s*[:\s]*(\d+[.,]?\d*)/i,
    /CONGES\s*PAYES\s*[:\s]*(\d+[.,]?\d*)/i,
    /C\.?P\.?\s*[:\s]*(\d+[.,]?\d*)\s*(?:j|jour)/i,
    /Cumul\s*CP\s*[:\s]*(\d+[.,]?\d*)/i,
    /(?:Nb|Nombre)\s*(?:de\s*)?jours?\s*(?:CP|cong[eé]s?)\s*[:\s]*(\d+[.,]?\d*)/i,
    /CP\s+(\d+[.,]\d+)\s*j/i,
    /(\d+[.,]\d+)\s*j(?:ours?)?\s*(?:de\s*)?CP/i
  ],

  // CP N-1 (année précédente)
  cpN1: [
    /CP\s*N-1\s*[:\s]*(\d+[.,]?\d*)/i,
    /Cong[eé]s?\s*N-1\s*[:\s]*(\d+[.,]?\d*)/i,
    /Report\s*(?:N-1|ann[eé]e\s*pr[eé]c[eé]dente)\s*[:\s]*(\d+[.,]?\d*)/i,
    /Ancien\s*solde\s*[:\s]*(\d+[.,]?\d*)/i,
    /N-1\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Reliquat\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // CP pris
  cpPris: [
    /CP\s*pris\s*[:\s]*(\d+[.,]?\d*)/i,
    /Cong[eé]s?\s*pris\s*[:\s]*(\d+[.,]?\d*)/i,
    /Pris\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /Jours?\s*pris\s*[:\s]*(\d+[.,]?\d*)/i,
    /Consomm[eé]s?\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // RTT
  rtt: [
    /RTT\s*(?:acquis|disponibles?|solde|restants?)?\s*[:\s]*(\d+[.,]?\d*)/i,
    /Solde\s*RTT\s*[:\s]*(\d+[.,]?\d*)/i,
    /RTT\s*[:\s]*(\d+[.,]?\d*)\s*j/i,
    /R\.?T\.?T\.?\s*[:\s]*(\d+[.,]?\d*)/i,
    /Jours?\s*RTT\s*[:\s]*(\d+[.,]?\d*)/i,
    /Compteur\s*RTT\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // Période du bulletin
  periode: [
    /P[eé]riode\s*[:\s]*(\w+\s*\d{4})/i,
    /Mois\s*[:\s]*(\w+\s*\d{4})/i,
    /Bulletin\s*(?:du\s*|de\s*)?(\w+\s*\d{4})/i,
    /(\d{2}\/\d{4})/,
    /(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre)\s*\d{4}/i,
    /(\d{2})\/(\d{4})/,
    /Paie\s*(?:du\s*)?(\d{2}\/\d{4})/i
  ],

  // ==========================================
  // 📋 DONNÉES RH COMPLÈTES
  // ==========================================

  // Salaire brut mensuel
  salaireBrut: [
    /Salaire\s*(?:de\s*)?base\s*[:\s]*(\d[\d\s]*[.,]?\d*)\s*€?/i,
    /Salaire\s*brut\s*[:\s]*(\d[\d\s]*[.,]?\d*)\s*€?/i,
    /Brut\s*[:\s]*(\d[\d\s]*[.,]?\d*)\s*€?/i,
    /TOTAL\s*BRUT\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i,
    /Montant\s*brut\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i,
    /Base\s*mensuelle?\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i
  ],

  // Salaire net
  salaireNet: [
    /Net\s*[àa]\s*payer\s*[:\s]*(\d[\d\s]*[.,]?\d*)\s*€?/i,
    /NET\s*A\s*PAYER\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i,
    /Salaire\s*net\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i,
    /Net\s*imposable\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i,
    /TOTAL\s*NET\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i
  ],

  // Matricule employé
  matricule: [
    /Matricule\s*[:\s]*([A-Z0-9]+)/i,
    /N[°o]?\s*(?:de\s*)?matricule\s*[:\s]*([A-Z0-9]+)/i,
    /ID\s*(?:employ[eé]|salari[eé])?\s*[:\s]*([A-Z0-9]+)/i,
    /Code\s*employ[eé]\s*[:\s]*([A-Z0-9]+)/i,
    /R[eé]f[eé]rence\s*[:\s]*([A-Z0-9]+)/i
  ],

  // Heures travaillées
  heuresTravaillees: [
    /Heures?\s*travaill[eé]es?\s*[:\s]*(\d+[.,]?\d*)/i,
    /Nb\s*heures?\s*[:\s]*(\d+[.,]?\d*)/i,
    /Volume\s*horaire\s*[:\s]*(\d+[.,]?\d*)/i,
    /(\d+[.,]?\d*)\s*h(?:eures?)?\s*travaill[eé]es?/i,
    /Heures?\s*mensuelles?\s*[:\s]*(\d+[.,]?\d*)/i,
    /151[.,]67|169/
  ],

  // Taux horaire
  tauxHoraire: [
    /Taux\s*horaire\s*[:\s]*(\d+[.,]?\d*)\s*€?/i,
    /Salaire\s*horaire\s*[:\s]*(\d+[.,]?\d*)/i,
    /€\s*\/\s*h\s*[:\s]*(\d+[.,]?\d*)/i,
    /(\d+[.,]\d+)\s*€?\s*\/\s*h/i
  ],

  // Convention collective
  convention: [
    /Convention\s*collective\s*[:\s]*(.+?)(?:\n|$)/i,
    /CCN\s*[:\s]*(.+?)(?:\n|$)/i,
    /IDCC\s*[:\s]*(\d+)/i,
    /Convention\s*[:\s]*(.+?)(?:\n|$)/i
  ],

  // Code PCS (Profession et catégorie socioprofessionnelle)
  codePCS: [
    /Code\s*PCS(?:-ESE)?\s*[:\s]*(\d+[a-z]?)/i,
    /PCS(?:-ESE)?\s*[:\s]*(\d+[a-z]?)/i,
    /Cat[eé]gorie\s*socio\s*[:\s]*(\d+[a-z]?)/i,
    /(\d{2})\s*(?:Employ[eé]s?|Ouvriers?|Cadres?|Techniciens?)/i
  ],

  // Qualification / Emploi
  emploi: [
    /Emploi\s*[:\s]*(.+?)(?:\n|$)/i,
    /Qualification\s*[:\s]*(.+?)(?:\n|$)/i,
    /Fonction\s*[:\s]*(.+?)(?:\n|$)/i,
    /Poste\s*[:\s]*(.+?)(?:\n|$)/i,
    /Intitul[eé]\s*(?:du\s*)?poste\s*[:\s]*(.+?)(?:\n|$)/i
  ],

  // Coefficient / Niveau
  coefficient: [
    /Coefficient\s*[:\s]*(\d+)/i,
    /Coef(?:f)?\.?\s*[:\s]*(\d+)/i,
    /Niveau\s*[:\s]*(\d+)/i,
    /[Éé]chelon\s*[:\s]*(\d+)/i,
    /Indice\s*[:\s]*(\d+)/i
  ],

  // Date d'entrée / Ancienneté
  dateEntree: [
    /Date\s*(?:d[''])?entr[eé]e\s*[:\s]*(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i,
    /Anciennet[eé]\s*depuis\s*(?:le\s*)?(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i,
    /Embauch[eé]\s*(?:le\s*)?(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i,
    /Date\s*(?:d[''])?embauche\s*[:\s]*(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i,
    /Depuis\s*(?:le\s*)?(\d{2}[\/.-]\d{2}[\/.-]\d{4})/i
  ],

  // Type de contrat
  typeContrat: [
    /(?:Type\s*(?:de\s*)?)?Contrat\s*[:\s]*(CDI|CDD|Int[eé]rim|Apprentissage|Stage)/i,
    /Nature\s*(?:du\s*)?contrat\s*[:\s]*(CDI|CDD)/i,
    /(CDI|CDD)\s*(?:temps\s*(?:plein|partiel))?/i
  ],

  // Temps de travail
  tempsTravail: [
    /Temps\s*(?:de\s*)?travail\s*[:\s]*(plein|partiel|\d+%)/i,
    /(\d+)\s*h(?:eures?)?\s*(?:\/|par)\s*semaine/i,
    /Base\s*hebdomadaire\s*[:\s]*(\d+)/i,
    /Horaire\s*hebdomadaire\s*[:\s]*(\d+)/i,
    /(35|39)\s*h/i
  ],

  // Numéro de sécurité sociale
  numeroSS: [
    /N[°o]?\s*(?:de\s*)?S[eé]curit[eé]\s*Sociale\s*[:\s]*([12]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{3}\s*\d{3}\s*\d{2})/i,
    /NIR\s*[:\s]*([12]\d{14})/i,
    /S[eé]cu\s*[:\s]*([12]\s*\d{2}\s*\d{2})/i
  ],

  // Entreprise / Employeur
  employeur: [
    /Employeur\s*[:\s]*(.+?)(?:\n|$)/i,
    /Raison\s*sociale\s*[:\s]*(.+?)(?:\n|$)/i,
    /Soci[eé]t[eé]\s*[:\s]*(.+?)(?:\n|$)/i,
    /Entreprise\s*[:\s]*(.+?)(?:\n|$)/i
  ],

  // SIRET
  siret: [
    /SIRET\s*[:\s]*(\d{14})/i,
    /N[°o]?\s*SIRET\s*[:\s]*(\d{3}\s*\d{3}\s*\d{3}\s*\d{5})/i
  ],

  // Ancienneté en années
  anciennete: [
    /Anciennet[eé]\s*[:\s]*(\d+)\s*(?:ans?|ann[eé]es?)/i,
    /(\d+)\s*(?:ans?|ann[eé]es?)\s*(?:d[''])?anciennet[eé]/i
  ]
};

/**
 * 📊 PATTERNS ADDITIONNELS POUR DONNÉES SPÉCIFIQUES
 */
const EXTENDED_PATTERNS = {
  // Heures supplémentaires
  heuresSup: [
    /Heures?\s*suppl[eé]mentaires?\s*[:\s]*(\d+[.,]?\d*)/i,
    /HS\s*[:\s]*(\d+[.,]?\d*)/i,
    /Majorations?\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // Primes
  primes: [
    /Prime[s]?\s*[:\s]*(\d[\d\s]*[.,]?\d*)\s*€?/i,
    /Bonus\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i,
    /Gratification\s*[:\s]*(\d[\d\s]*[.,]?\d*)/i
  ],

  // Avantages en nature
  avantagesNature: [
    /Avantages?\s*(?:en\s*)?nature\s*[:\s]*(\d+[.,]?\d*)/i,
    /Ticket[s]?\s*restaurant\s*[:\s]*(\d+[.,]?\d*)/i,
    /V[eé]hicule\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // Transport
  transport: [
    /(?:Remboursement\s*)?Transport\s*[:\s]*(\d+[.,]?\d*)\s*€?/i,
    /Navigo\s*[:\s]*(\d+[.,]?\d*)/i,
    /Frais\s*(?:de\s*)?transport\s*[:\s]*(\d+[.,]?\d*)/i,
    /Indemnit[eé]\s*transport\s*[:\s]*(\d+[.,]?\d*)/i
  ],

  // Mutuelle
  mutuelle: [
    /Mutuelle\s*[:\s]*(\d+[.,]?\d*)\s*€?/i,
    /Compl[eé]mentaire\s*sant[eé]\s*[:\s]*(\d+[.,]?\d*)/i,
    /Pr[eé]voyance\s*[:\s]*(\d+[.,]?\d*)/i
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
   * Extraire le texte directement d'un PDF (sans OCR)
   * Beaucoup plus rapide et précis pour les PDF numériques
   * @param {File} file - Fichier PDF
   * @returns {Promise<string>} Texte extrait
   */
  async extractTextDirectlyFromPDF(file) {
    try {
      console.log('📄 Extraction directe du texte PDF...');

      // S'assurer que le worker est configuré
      await initPDFWorker();

      // Charger le PDF
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false
      });
      const pdf = await loadingTask.promise;

      console.log(`📄 PDF chargé: ${pdf.numPages} page(s)`);

      let fullText = '';

      // Extraire le texte de chaque page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Reconstituer le texte avec les positions
        const textItems = textContent.items;
        let lastY = null;
        let pageText = '';

        for (const item of textItems) {
          if (item.str) {
            // Ajouter un saut de ligne si on change de ligne
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += '\n';
            }
            pageText += item.str + ' ';
            lastY = item.transform[5];
          }
        }

        fullText += pageText + '\n\n';
        page.cleanup();
      }

      console.log(`✅ Texte extrait directement: ${fullText.length} caractères`);
      return fullText.trim();

    } catch (error) {
      console.error('❌ Erreur extraction directe PDF:', error);
      throw error;
    }
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

      // S'assurer que le worker est configuré
      await initPDFWorker();

      // Charger le PDF avec options robustes
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      });
      const pdf = await loadingTask.promise;

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
    console.log('📄 Texte brut (800 premiers caractères):', text.substring(0, 800));

    // Nettoyer le texte - version avec espaces
    const cleanText = text
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[|]/g, ' ')
      .trim();

    // Version avec sauts de ligne préservés (pour tableaux)
    const textWithLines = text
      .replace(/[|]/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();

    console.log('📄 Texte nettoyé (500 car.):', cleanText.substring(0, 500));

    const result = {
      // Congés
      cpAcquis: null,      // Congés acquis (période en cours)
      cpSolde: null,       // Solde total de CP disponibles
      cpN1: null,          // CP de l'année N-1
      cpPris: null,        // CP déjà pris
      rtt: null,           // Solde RTT
      periode: null,       // Période du bulletin

      // Données salariales
      salaireBrut: null,   // Salaire brut mensuel
      salaireNet: null,    // Salaire net
      tauxHoraire: null,   // Taux horaire
      heuresTravaillees: null, // Heures travaillées

      // Données contractuelles
      matricule: null,     // Matricule employé
      typeContrat: null,   // CDI, CDD, etc.
      tempsTravail: null,  // Temps plein/partiel, heures/semaine
      dateEntree: null,    // Date d'entrée
      emploi: null,        // Intitulé du poste
      coefficient: null,   // Coefficient/niveau
      codePCS: null,       // Code PCS-ESE
      convention: null,    // Convention collective

      // Données entreprise
      employeur: null,     // Nom de l'entreprise
      siret: null,         // SIRET

      // Données personnelles
      numeroSS: null,      // Numéro de sécurité sociale
      anciennete: null,    // Ancienneté en années

      // Métadonnées
      rawMatches: [],      // Tous les matches trouvés (pour debug)
      confidence: 0        // Score de confiance
    };

    // ==========================================
    // 🔍 DÉTECTION SPÉCIALE : FORMAT TABLEAU CONGES PAYES
    // Format: "CONGES PAYES N-1 N Acquis X Y Pris X Y Solde X Y"
    // ==========================================

    // Chercher d'abord si on a une section "CONGES PAYES" avec tableau N-1/N
    const hasCongesTable = /CONG[EÉ]S\s*PAY[EÉ]S/i.test(cleanText) && /N-1/i.test(cleanText);
    console.log('📊 Section CONGES PAYES avec N-1 détectée:', hasCongesTable);

    // Patterns pour détecter le tableau avec colonnes N-1 et N
    const tablePatterns = [
      // Format: Solde suivi de deux nombres (N-1 et N) - espaces ou tabs
      /Solde\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)/i,
      // Format avec virgule comme séparateur décimal et différents espaces
      /Solde[\s\n]+(\d+[.,]\d+)[\s\n]+(\d+[.,]\d+)/i,
      // Format: deux nombres après "Solde" avec texte entre
      /Solde[^\d]*(\d+[.,]\d+)[^\d]+(\d+[.,]\d+)/i,
    ];

    // Chercher le pattern de tableau dans les deux versions du texte
    const textsToSearch = [cleanText, textWithLines];

    for (const searchText of textsToSearch) {
      if (result.cpSolde !== null) break; // Déjà trouvé

      for (const pattern of tablePatterns) {
        const match = searchText.match(pattern);
        if (match && match[1] && match[2]) {
          const val1 = parseFloat(match[1].replace(',', '.'));
          const val2 = parseFloat(match[2].replace(',', '.'));

          // Si on a trouvé deux valeurs valides
          if (!isNaN(val1) && !isNaN(val2) && val1 >= 0 && val2 >= 0) {
            // Déterminer quel est N-1 et quel est N
            // Dans le format standard, N-1 vient avant N
            const soldeN1 = val1;
            const soldeN = val2;

            result.cpN1 = soldeN1;
            result.cpSolde = soldeN1 + soldeN; // TOTAL = N-1 + N
            result.rawMatches.push({
              type: 'tableau_cp',
              pattern: pattern.toString(),
              match: match[0],
              soldeN1: soldeN1,
              soldeN: soldeN,
              total: result.cpSolde
            });
            console.log(`✅ Tableau CP détecté: N-1=${soldeN1}, N=${soldeN}, Total=${result.cpSolde}`);
            break;
          }
        }
      }
    }

    // Si pas trouvé avec les patterns génériques, chercher spécifiquement
    // Format: extraire tous les nombres après "Solde" dans la section CP
    if (result.cpSolde === null && hasCongesTable) {
      // Chercher la ligne Solde et extraire les deux derniers nombres
      const soldeLineMatch = cleanText.match(/Solde[^A-Za-z]*?([\d.,]+)[^A-Za-z]*([\d.,]+)/i);
      if (soldeLineMatch) {
        const val1 = parseFloat(soldeLineMatch[1].replace(',', '.'));
        const val2 = parseFloat(soldeLineMatch[2].replace(',', '.'));

        if (!isNaN(val1) && !isNaN(val2)) {
          result.cpN1 = val1;
          result.cpSolde = val1 + val2;
          result.rawMatches.push({
            type: 'tableau_cp_fallback',
            match: soldeLineMatch[0],
            soldeN1: val1,
            soldeN: val2,
            total: result.cpSolde
          });
          console.log(`✅ Tableau CP (fallback): N-1=${val1}, N=${val2}, Total=${result.cpSolde}`);
        }
      }
    }

    // Pattern pour Acquis dans tableau
    const acquisTablePatterns = [
      /Acquis\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)/i,
      /Acquis[^\d]*(\d+[.,]\d+)[^\d]+(\d+[.,]\d+)/i
    ];
    for (const pattern of acquisTablePatterns) {
      const acquisMatch = cleanText.match(pattern);
      if (acquisMatch) {
        result.cpAcquis = parseFloat(acquisMatch[2].replace(',', '.')); // Colonne N
        result.rawMatches.push({
          type: 'acquis_tableau',
          n1: parseFloat(acquisMatch[1].replace(',', '.')),
          n: result.cpAcquis
        });
        break;
      }
    }

    // Pattern pour Pris dans tableau
    const prisTablePatterns = [
      /Pris\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)/i,
      /Pris[^\d]*(\d+[.,]\d+)/i
    ];
    for (const pattern of prisTablePatterns) {
      const prisMatch = cleanText.match(pattern);
      if (prisMatch) {
        result.cpPris = parseFloat(prisMatch[1].replace(',', '.'));
        break;
      }
    }

    // ==========================================
    // 🔍 DÉTECTION STANDARD (si pas trouvé dans tableau)
    // ==========================================

    // Rechercher chaque type de donnée avec les patterns standards
    for (const [key, patterns] of Object.entries(PAYSLIP_PATTERNS)) {
      // Ne pas écraser si déjà trouvé via le tableau
      if (result[key] !== null && key !== 'periode') continue;

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
            // Champs textuels (ne pas convertir en nombre)
            const textFields = ['periode', 'emploi', 'convention', 'typeContrat', 'tempsTravail', 'matricule', 'codePCS', 'dateEntree', 'numeroSS', 'employeur', 'siret'];
            if (textFields.includes(key)) {
              result[key] = match[1].trim();
            } else {
              // Champs numériques - nettoyer les espaces avant de parser
              const cleanValue = value.replace(/\s/g, '');
              result[key] = parseFloat(cleanValue) || null;
            }
          }
        }
      }
    }

    // ==========================================
    // 📊 CALCUL DU SCORE DE CONFIANCE
    // ==========================================
    let foundFields = 0;
    let totalWeight = 0;

    // Pondération des champs (plus important = plus de poids)
    const fieldWeights = {
      // Congés (critiques)
      cpSolde: 3,
      cpN1: 2,
      cpAcquis: 1,
      cpPris: 1,
      rtt: 1,
      // Salaire (très importants)
      salaireBrut: 3,
      salaireNet: 2,
      tauxHoraire: 2,
      // Contrat (importants)
      matricule: 2,
      typeContrat: 2,
      dateEntree: 2,
      emploi: 1,
      codePCS: 1,
      // Autres
      heuresTravaillees: 1,
      tempsTravail: 1,
      coefficient: 1,
      convention: 1,
      periode: 1,
      employeur: 1,
      anciennete: 1
    };

    for (const [field, weight] of Object.entries(fieldWeights)) {
      totalWeight += weight;
      if (result[field] !== null) {
        foundFields += weight;
      }
    }

    result.confidence = Math.min(100, Math.round((foundFields / totalWeight) * 100));

    // Si on n'a pas de solde mais on a acquis et pris, calculer
    if (result.cpSolde === null && result.cpAcquis !== null) {
      const pris = result.cpPris || 0;
      const n1 = result.cpN1 || 0;
      result.cpSolde = result.cpAcquis + n1 - pris;
      result.calculated = true;
    }

    // Compter les champs RH trouvés
    const hrFields = ['salaireBrut', 'salaireNet', 'tauxHoraire', 'matricule', 'typeContrat', 'dateEntree', 'emploi', 'codePCS', 'heuresTravaillees', 'tempsTravail', 'coefficient', 'convention'];
    result.hrFieldsFound = hrFields.filter(f => result[f] !== null).length;
    result.hrFieldsTotal = hrFields.length;

    console.log('📊 Données extraites:', {
      // Congés
      cpSolde: result.cpSolde,
      cpN1: result.cpN1,
      rtt: result.rtt,
      // Salaire
      salaireBrut: result.salaireBrut,
      salaireNet: result.salaireNet,
      tauxHoraire: result.tauxHoraire,
      // Contrat
      matricule: result.matricule,
      typeContrat: result.typeContrat,
      emploi: result.emploi,
      dateEntree: result.dateEntree,
      // Stats
      confidence: result.confidence + '%',
      hrFieldsFound: `${result.hrFieldsFound}/${result.hrFieldsTotal}`
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

        // D'ABORD: Essayer l'extraction directe du texte (PDF numérique)
        progressCallback({ step: 'extract', progress: 20, message: 'Extraction du texte...' });

        try {
          text = await this.extractTextDirectlyFromPDF(file);
          console.log(`📄 Texte extrait directement: ${text.length} caractères`);

          // Vérifier si on a assez de texte (sinon c'est probablement un scan)
          if (text.length < 100) {
            console.log('⚠️ Peu de texte trouvé, passage en mode OCR...');
            text = ''; // Reset pour forcer l'OCR
          }
        } catch (extractError) {
          console.warn('⚠️ Extraction directe échouée, passage en mode OCR:', extractError);
          text = '';
        }

        // Si pas assez de texte, utiliser l'OCR (PDF scanné)
        if (text.length < 100) {
          progressCallback({ step: 'ocr', progress: 30, message: 'PDF scanné détecté, OCR en cours...' });

          // Convertir le PDF en images
          const images = await this.convertPDFToImages(file, 2.5);

          progressCallback({ step: 'ocr', progress: 40, message: `OCR de ${images.length} page(s)...` });

          // Extraire le texte de chaque page
          for (let i = 0; i < images.length; i++) {
            const pageProgress = 40 + (30 * (i + 1) / images.length);
            progressCallback({
              step: 'ocr',
              progress: Math.round(pageProgress),
              message: `OCR page ${i + 1}/${images.length}...`
            });

            const pageText = await this.extractTextFromImage(images[i]);
            text += pageText + '\n\n';
          }

          console.log(`✅ PDF traité par OCR: ${images.length} page(s), ${text.length} caractères`);
        } else {
          console.log(`✅ PDF numérique traité: ${text.length} caractères (extraction directe)`);
        }

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
