import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue) => {
  // Récupérer la valeur depuis localStorage ou utiliser la valeur initiale
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erreur lors de la lecture de localStorage pour la clé "${key}":`, error)
      return initialValue
    }
  })

  // Fonction pour sauvegarder une nouvelle valeur
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Erreur lors de l'écriture dans localStorage pour la clé "${key}":`, error)
    }
  }

  // Fonction pour supprimer la valeur
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de localStorage pour la clé "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
