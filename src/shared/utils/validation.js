import { ERROR_MESSAGES } from '../../core/constants'

// Validation d'email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validation de mot de passe
export const isValidPassword = (password) => {
  // Au moins 6 caractères
  return password && password.length >= 6
}

// Validation de mot de passe fort
export const isStrongPassword = (password) => {
  // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return strongRegex.test(password)
}

// Validation de nom/prénom
export const isValidName = (name) => {
  // Au moins 2 caractères, lettres et espaces uniquement
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,}$/
  return nameRegex.test(name?.trim() || '')
}

// Validation de numéro de téléphone français
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return phoneRegex.test(phone?.replace(/\s/g, '') || '')
}

// Validation d'URL
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Validation de code postal français
export const isValidPostalCode = (code) => {
  const postalRegex = /^[0-9]{5}$/
  return postalRegex.test(code)
}

// Validation d'un formulaire de connexion
export const validateLoginForm = (data) => {
  const errors = {}
  
  // Email
  if (!data.email?.trim()) {
    errors.email = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidEmail(data.email)) {
    errors.email = ERROR_MESSAGES.VALIDATION.INVALID_EMAIL
  }
  
  // Mot de passe
  if (!data.password) {
    errors.password = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidPassword(data.password)) {
    errors.password = ERROR_MESSAGES.AUTH.WEAK_PASSWORD
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validation d'un formulaire d'inscription
export const validateSignupForm = (data) => {
  const errors = {}
  
  // Prénom
  if (!data.firstName?.trim()) {
    errors.firstName = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidName(data.firstName)) {
    errors.firstName = 'Prénom invalide (lettres uniquement, min. 2 caractères)'
  }
  
  // Nom
  if (!data.lastName?.trim()) {
    errors.lastName = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidName(data.lastName)) {
    errors.lastName = 'Nom invalide (lettres uniquement, min. 2 caractères)'
  }
  
  // Email
  if (!data.email?.trim()) {
    errors.email = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidEmail(data.email)) {
    errors.email = ERROR_MESSAGES.VALIDATION.INVALID_EMAIL
  }
  
  // Mot de passe
  if (!data.password) {
    errors.password = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidPassword(data.password)) {
    errors.password = ERROR_MESSAGES.AUTH.WEAK_PASSWORD
  }
  
  // Confirmation mot de passe
  if (!data.confirmPassword) {
    errors.confirmPassword = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = ERROR_MESSAGES.VALIDATION.PASSWORDS_DONT_MATCH
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validation d'un formulaire de profil
export const validateProfileForm = (data) => {
  const errors = {}
  
  if (!data.firstName?.trim()) {
    errors.firstName = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidName(data.firstName)) {
    errors.firstName = 'Prénom invalide'
  }
  
  if (!data.lastName?.trim()) {
    errors.lastName = ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
  } else if (!isValidName(data.lastName)) {
    errors.lastName = 'Nom invalide'
  }
  
  if (data.phone && !isValidPhoneNumber(data.phone)) {
    errors.phone = 'Numéro de téléphone invalide'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validation générique d'un champ requis
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} est requis`
  }
  return null
}

// Validation de longueur minimale
export const validateMinLength = (value, minLength, fieldName) => {
  if (value && value.length < minLength) {
    return `${fieldName} doit contenir au moins ${minLength} caractères`
  }
  return null
}

// Validation de longueur maximale
export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return `${fieldName} ne peut pas dépasser ${maxLength} caractères`
  }
  return null
}
