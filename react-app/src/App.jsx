import React from 'react'
import Button from './shared/components/ui/Button'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">
          Synergia 2.0
        </h1>
        <p className="text-gray-600 mb-8">
          Architecture modulaire en construction...
        </p>
        
        <div className="bg-white p-8 rounded-lg shadow space-y-4">
          <p className="text-green-600 font-medium mb-4">
            ✅ Composant Button ajouté !
          </p>
          
          <div className="flex space-x-3 justify-center">
            <Button>Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button size="lg">Grand</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
