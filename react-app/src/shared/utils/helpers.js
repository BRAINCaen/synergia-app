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
