// ==========================================
// 📁 components/hr/SignatureCanvas.jsx
// COMPOSANT CANVAS DE SIGNATURE ÉLECTRONIQUE
// ==========================================

import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle } from 'lucide-react';

const SignatureCanvas = ({ onSave, onCancel, employeeName }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Style du canvas
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    if (!hasSignature) {
      alert('Veuillez signer avant de valider');
      return;
    }
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-gray-300 mb-2">
          Je soussigné(e) <span className="font-bold text-white">{employeeName}</span>, certifie l'exactitude des informations de pointage ci-dessus.
        </p>
        <p className="text-gray-400 text-sm">Dessinez votre signature ci-dessous</p>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="border-2 border-dashed border-gray-600 rounded-xl cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Effacer
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
        <button
          onClick={saveSignature}
          disabled={!hasSignature}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Valider ma signature
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        En signant, vous confirmez avoir vérifié vos pointages pour la période sélectionnée.
        <br />Signature électronique horodatée - {new Date().toLocaleString('fr-FR')}
      </p>
    </div>
  );
};

export default SignatureCanvas;
