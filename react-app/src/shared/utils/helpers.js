import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fonction utilitaire pour combiner les classes CSS
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Formatage des dates
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

// Capitaliser la première lettre
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Générer un ID unique
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}
// Formatage des dates - VERSION SÉCURISÉE
export const formatDate = (date) => {
  if (!date) return 'Date non définie';
  
  try {
    // Gestion des timestamps Firebase
    if (date && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    // Gestion des objets avec seconds (Firebase Timestamp format)
    if (date && typeof date.seconds === 'number') {
      date = new Date(date.seconds * 1000);
    }
    
    const parsedDate = new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(parsedDate.getTime())) {
      console.warn('Date invalide reçue:', date);
      return 'Date invalide';
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(parsedDate);
  } catch (error) {
    console.warn('Erreur formatage date:', error, 'Date reçue:', date);
    return 'Erreur de date';
  }
}
